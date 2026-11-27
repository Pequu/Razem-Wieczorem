import { useForm } from '@inertiajs/react';
import { LoaderCircle, Pencil, Save } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import EventScreen from '@/components/events/event-screen';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { EventDetailsData } from '@/pages/events/show';
import { eventDate, eventPanel, eventPrimary, eventSecondary } from '@/lib/event-workspace';
import type { ActivityOption, EventNotice } from '@/lib/event-workspace';

const selectClass = 'w-full rounded-lg border border-[#4a3c62] bg-[#151225] px-3 py-2 text-sm text-[#e8d8ff] focus-visible:outline-2 focus-visible:outline-[#ddc5ff]';

function noticeDate(value: string) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(date);
}

export default function EventPlanView({ event, notifications, activityOptions, placeOptions, confirmUrl, selectedTermId, startEditing }: {
    event: EventDetailsData; notifications?: EventNotice[]; activityOptions?: ActivityOption[]; placeOptions?: { id: number; name: string }[];
    confirmUrl?: string | null; selectedTermId?: number; startEditing: boolean;
}) {
    const organizer = event.role === 'organizer';
    const plan = event.plan;
    const terms = event.terms ?? [];
    const [editing, setEditing] = useState(organizer && startEditing);
    const form = useForm({
        term_id: String(terms.find((term) => term.id === selectedTermId)?.id ?? plan?.term_id ?? terms[0]?.id ?? ''),
        activity_proposal_id: String(plan?.activity_proposal_id ?? ''),
        place_proposal_id: String(plan?.place_proposal_id ?? ''),
    });
    const hasSelectedTerm = terms.some((term) => String(term.id) === form.data.term_id);
    const missingCurrentChoices = Boolean(plan && (
        (!plan.term_id || !terms.some((term) => term.id === plan.term_id)) ||
        (plan.activity && (!plan.activity_proposal_id || !activityOptions?.some((item) => item.id === plan.activity_proposal_id))) ||
        (plan.place && (!plan.place_proposal_id || !placeOptions?.some((item) => item.id === plan.place_proposal_id)))
    ));

    function submit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!organizer || !confirmUrl || !hasSelectedTerm || missingCurrentChoices || form.processing) return;
        form.transform((data) => ({ term_id: Number(data.term_id), activity_proposal_id: data.activity_proposal_id ? Number(data.activity_proposal_id) : null, place_proposal_id: data.place_proposal_id ? Number(data.place_proposal_id) : null }));
        form.post(confirmUrl, { preserveScroll: true, preserveUrl: true, onSuccess: () => setEditing(false) });
    }

    return (
        <EventScreen event={event} active="plan" eyebrow="Plan" description="W tym miejscu wszyscy uczestnicy widzą aktualne ustalenia.">
            <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
                <section aria-labelledby="current-event-plan" className={`${eventPanel} bg-[radial-gradient(ellipse_at_top_right,#382951,transparent_85%)]`}>
                    <h2 id="current-event-plan" className="mb-4 text-lg font-bold">Aktualny plan</h2>
                    {plan ? <dl className="divide-y divide-[#3b3152] text-sm">
                        <div className="flex flex-wrap justify-between gap-3 py-3"><dt className="font-semibold">Termin</dt><dd className="text-[#d1c4e3]">{eventDate(plan.date)}{plan.starts_at && ` · ${plan.starts_at.slice(0, 5)}`}{plan.ends_at && `–${plan.ends_at.slice(0, 5)}`}</dd></div>
                        <div className="flex flex-wrap justify-between gap-3 py-3"><dt className="font-semibold">Aktywność</dt><dd className="min-w-0 break-words text-[#d1c4e3]">{plan.activity || 'Jeszcze nieustalona'}</dd></div>
                        <div className="flex flex-wrap justify-between gap-3 py-3"><dt className="font-semibold">Miejsce</dt><dd className="min-w-0 break-words text-[#d1c4e3]">{plan.place || 'Jeszcze nieustalone'}</dd></div>
                    </dl> : <p className="rounded-xl border border-dashed border-[#4a3c62] p-4 text-sm leading-relaxed text-[#c6bad9]">Plan nie został jeszcze zapisany. Po ustaleniu spotkania pojawią się tutaj termin, aktywność i miejsce.</p>}
                    {organizer && <div className="mt-4 flex justify-end"><Button type="button" variant="outline" className={eventSecondary} aria-expanded={editing} aria-controls="confirm-event-plan" onClick={() => setEditing(!editing)}><Pencil size={15} aria-hidden="true" />{editing ? 'Zamknij edycję' : plan ? 'Zmień plan' : 'Ustal plan'}</Button></div>}
                </section>
                <section aria-labelledby="event-notices" className={eventPanel}>
                    <h2 id="event-notices" className="mb-4 text-lg font-bold">Powiadomienia</h2>
                    {notifications?.length ? <ul className="divide-y divide-[#322b48]">{notifications.map((notice) => <li key={notice.id} className="flex items-start justify-between gap-3 py-4 first:pt-0 last:pb-0">
                        <div className="min-w-0"><h3 className="text-sm font-semibold break-words">{notice.title}</h3>{notice.description && <p className="mt-1 text-xs leading-relaxed break-words text-[#c6bad9]">{notice.description}</p>}<p className="mt-2 text-xs text-[#9f91b6]">{noticeDate(notice.created_at)}</p></div>
                        {!notice.is_read && <span className="shrink-0 rounded-full border border-[#285a4b] bg-[#163c33] px-2 py-1 text-xs text-[#a6e6cd]">Nowe</span>}
                    </li>)}</ul> : <p className="text-sm text-[#c6bad9]">{notifications === undefined ? 'Powiadomienia nie są jeszcze dostępne.' : 'Nie masz jeszcze powiadomień dotyczących tego wydarzenia.'}</p>}
                </section>
            </div>
            {organizer && editing && <section id="confirm-event-plan" aria-labelledby="confirm-plan-heading" className={`${eventPanel} mt-4`}>
                <h2 id="confirm-plan-heading" className="text-lg font-bold">{plan ? 'Zmień ustalenia' : 'Zatwierdź plan wieczoru'}</h2>
                <p className="mt-2 text-sm text-[#c6bad9]">Wybierz ustalenia, które zobaczą wszyscy uczestnicy wydarzenia.</p>
                <form onSubmit={submit} aria-busy={form.processing} className="mt-5 space-y-4">
                    <fieldset disabled={form.processing} className="grid min-w-0 gap-4 md:grid-cols-3">
                        <div className="min-w-0 space-y-2"><Label htmlFor="plan-term">Termin</Label><select id="plan-term" required className={selectClass} value={form.data.term_id} onChange={(e) => form.setData('term_id', e.currentTarget.value)}><option value="">Wybierz termin</option>{terms.map((term) => <option key={term.id} value={term.id}>{eventDate(term.date)} · {term.starts_at.slice(0, 5)}–{term.ends_at.slice(0, 5)}</option>)}</select><InputError message={form.errors.term_id} /></div>
                        <div className="min-w-0 space-y-2"><Label htmlFor="plan-activity">Aktywność</Label><select id="plan-activity" className={selectClass} value={form.data.activity_proposal_id} disabled={!activityOptions} onChange={(e) => form.setData('activity_proposal_id', e.currentTarget.value)}><option value="">{activityOptions ? 'Jeszcze nieustalona' : 'Lista aktywności niedostępna'}</option>{activityOptions?.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}</select><InputError message={form.errors.activity_proposal_id} /></div>
                        <div className="min-w-0 space-y-2"><Label htmlFor="plan-place">Miejsce</Label><select id="plan-place" className={selectClass} value={form.data.place_proposal_id} disabled={!placeOptions} onChange={(e) => form.setData('place_proposal_id', e.currentTarget.value)}><option value="">{placeOptions ? 'Jeszcze nieustalone' : 'Lista miejsc niedostępna'}</option>{placeOptions?.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}</select><InputError message={form.errors.place_proposal_id} /></div>
                    </fieldset>
                    {!confirmUrl && <p className="text-sm text-[#c6bad9]">Zapisywanie i zatwierdzanie planu nie jest jeszcze dostępne.</p>}
                    {missingCurrentChoices && <p className="text-sm text-[#c6bad9]">Edycja planu wymaga pełnej listy aktualnych ustaleń. Zapis jest chwilowo niedostępny.</p>}
                    <div className="flex flex-wrap justify-end gap-2"><Button type="button" variant="outline" className={eventSecondary} disabled={form.processing} onClick={() => { form.reset(); form.clearErrors(); setEditing(false); }}>Anuluj</Button><Button type="submit" className={eventPrimary} disabled={!confirmUrl || !hasSelectedTerm || missingCurrentChoices || form.processing}>{form.processing ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <Save aria-hidden="true" />}{form.processing ? 'Zapisywanie…' : 'Zatwierdź plan'}</Button></div>
                </form>
            </section>}
        </EventScreen>
    );
}
