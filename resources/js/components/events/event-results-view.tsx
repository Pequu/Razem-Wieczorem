import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import EventScreen from '@/components/events/event-screen';
import type { EventDetailsData } from '@/pages/events/show';
import { eventDate, eventPanel, eventPrimary, eventViewUrl } from '@/lib/event-workspace';
import type { TermResult } from '@/lib/event-workspace';

export default function EventResultsView({ event, results, selectedTermId }: {
    event: EventDetailsData; results?: TermResult[]; selectedTermId?: number;
}) {
    const terms = event.terms ?? [];
    const [selection, setSelection] = useState(selectedTermId ?? terms[0]?.id);
    const selected = terms.find((term) => term.id === selection) ?? terms[0];
    const result = results?.find((item) => item.term_id === selected?.id);
    const counters = [
        { label: 'Pasuje', value: result?.available, color: 'border-[#285a4b] bg-[#163c33] text-[#a6e6cd]' },
        { label: 'Może pasować', value: result?.maybe, color: 'border-[#916b30] bg-[#59401e] text-[#ffe0a3]' },
        { label: 'Nie pasuje', value: result?.unavailable, color: 'border-[#8b526a] bg-[#492c3b] text-[#ffd0e1]' },
        { label: 'Brak odpowiedzi', value: result?.unanswered, color: 'border-[#4a3c62] bg-[#29203c] text-[#ddc5ff]' },
    ];

    return (
        <EventScreen event={event} active="results" eyebrow="Wyniki" description="Sprawdź, ile osób może przyjść i co wybierają osoby dostępne.">
            <section aria-labelledby="results-term-heading" className={`${eventPanel} flex flex-wrap items-center justify-between gap-4`}>
                <h2 id="results-term-heading" className="text-sm font-bold">Wyniki dla wybranego terminu</h2>
                <label className="min-w-0 max-w-full"><span className="sr-only">Wybierz termin</span>
                    <select value={selected?.id ?? ''} onChange={(e) => setSelection(Number(e.currentTarget.value))} disabled={!terms.length} className="max-w-full rounded-lg border border-[#4a3c62] bg-[#251e39] px-3 py-2 text-sm text-[#e8d8ff] focus-visible:outline-2 focus-visible:outline-[#ddc5ff]">
                        {!terms.length && <option value="">Brak terminów</option>}
                        {terms.map((term) => <option key={term.id} value={term.id}>{eventDate(term.date)} · {term.starts_at.slice(0, 5)}–{term.ends_at.slice(0, 5)}</option>)}
                    </select>
                </label>
            </section>
            <div aria-live="polite" className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">{counters.map((counter) => <div key={counter.label} className={eventPanel}>
                <h3 className="text-xs"><span className={`inline-block rounded-full border px-2 py-1 font-semibold ${counter.color}`}>{counter.label}</span></h3>
                <p className="mt-3 text-3xl font-bold">{counter.value ?? '—'}</p>
            </div>)}</div>
            <section aria-labelledby="results-activity-heading" className={`${eventPanel} mt-4`}>
                <h2 id="results-activity-heading" className="text-lg font-bold">Głosy osób, którym pasuje ten termin</h2>
                <p className="mt-2 text-xs leading-relaxed text-[#c6bad9]">Wyniki aktywności obejmują wyłącznie osoby z odpowiedzią „Pasuje”. Odpowiedzi „Może pasować” są liczone osobno.</p>
                {result ? (
                    <div className="mt-5 space-y-4">
                        {result.activities.map((activity) => {
                            const percent = result.available > 0 ? Math.min(100, Math.max(0, activity.votes / result.available * 100)) : 0;
                            return <div key={activity.proposal_id}>
                                <div className="mb-2 flex items-start justify-between gap-3 text-sm"><h3 className="min-w-0 font-semibold break-words">{activity.name}</h3><p className="shrink-0 text-xs text-[#c6bad9]">{activity.votes} / {result.available} osób</p></div>
                                <div role="img" aria-label={`${activity.name}: ${activity.votes} głosów spośród ${result.available} dostępnych osób`} className="h-2 overflow-hidden rounded-full bg-[#352847]"><div className="h-full rounded-full bg-[#cba4ff] transition-[width]" style={{ width: `${percent}%` }} /></div>
                            </div>;
                        })}
                        {!result.activities.length && <p className="text-sm text-[#c6bad9]">Brak wyników aktywności dla tego terminu.</p>}
                        {result.available === 0 && <p className="text-sm text-[#c6bad9]">Nikt jeszcze nie wskazał, że ten termin mu pasuje.</p>}
                    </div>
                ) : <p role="status" className="mt-5 rounded-xl border border-dashed border-[#4a3c62] p-4 text-sm text-[#c6bad9]">{terms.length ? 'Zbiorcze wyniki dla tego terminu nie są jeszcze dostępne.' : 'Dodaj termin, aby można było zbierać odpowiedzi.'}</p>}
                {event.role === 'organizer' && <div className="mt-6 flex justify-end"><Link href={eventViewUrl(event.id, 'plan', selected?.id, true)} className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm ${eventPrimary}`}>Przejdź do zatwierdzenia<ArrowRight size={16} aria-hidden="true" /></Link></div>}
            </section>
        </EventScreen>
    );
}
