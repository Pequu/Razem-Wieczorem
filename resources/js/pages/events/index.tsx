import { Head, Link } from '@inertiajs/react';
import { CalendarDays, ChevronDown, Plus, Users } from 'lucide-react';
import { useState } from 'react';

type EventItem = {
    id: number;
    name: string;
    description: string | null;
    role: 'organizer' | 'member';
    voting_status: string;
    members_count: number;
    terms: { id: number; date: string; starts_at: string; ends_at: string }[];
    activities: string[];
    plan: { date: string | null; starts_at: string | null; place: string | null; activity: string | null } | null;
};

function formatDate(date: string) {
    return new Intl.DateTimeFormat('pl-PL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
        .format(new Date(`${date}T12:00:00`));
}

function countLabel(count: number, one: string, few: string, many: string) {
    const label = count === 1 ? one : count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 12 || count % 100 > 14) ? few : many;
    return `${count} ${label}`;
}

export default function EventsIndex({ events: suppliedEvents }: { events?: EventItem[] }) {
    const events = suppliedEvents ?? [];
    const [tab, setTab] = useState<'organizer' | 'member'>('organizer');
    const visibleEvents = events.filter((event) => event.role === tab);

    return (
        <main className="min-w-0 bg-[#121121] text-[#f6f1ff]">
            <Head title="Moje wydarzenia" />
            <div className="mx-auto w-full max-w-6xl px-6 py-8 sm:py-10">
                <p className="mb-2 text-xs font-bold tracking-[0.18em] text-[#d8b9ff] uppercase">Pulpit</p>
                <div className="flex flex-wrap items-center justify-between gap-5">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Moje wydarzenia</h1>
                        <p className="mt-2 text-sm text-[#c6bad9]">Zobacz, które spotkania są jeszcze w ustalaniu, a które mają już plan.</p>
                    </div>
                    <Link href="/events/create" className="inline-flex items-center gap-2 rounded-md bg-[#ddc5ff] px-4 py-2 text-sm font-bold text-[#241738] hover:bg-[#ebdbff]">
                        <Plus size={16} aria-hidden="true" /> Nowe wydarzenie
                    </Link>
                </div>

                <div className="mt-6 flex flex-wrap gap-2" aria-label="Rodzaj wydarzeń">
                    {(['organizer', 'member'] as const).map((role) => (
                        <button key={role} type="button" aria-pressed={tab === role} onClick={() => setTab(role)} className={`rounded-md border px-4 py-2 text-sm font-semibold transition-colors ${tab === role ? 'border-[#ddc5ff] bg-[#ddc5ff] text-[#241738]' : 'border-[#4a3c62] bg-[#251e39] text-[#e8d8ff] hover:bg-[#302643]'}`}>
                            {role === 'organizer' ? 'Organizuję' : 'Uczestniczę'} · {events.filter((event) => event.role === role).length}
                        </button>
                    ))}
                </div>

                {visibleEvents.length === 0 ? (
                    <div role="status" className="mt-4 rounded-2xl border border-dashed border-[#4a3c62] bg-[#1c192e] px-6 py-12 text-center">
                        <CalendarDays className="mx-auto mb-4 text-[#ddc5ff]" size={32} aria-hidden="true" />
                        <h2 className="text-lg font-semibold">{tab === 'organizer' ? 'Zaplanuj swój pierwszy wieczór' : 'Nie uczestniczysz jeszcze w żadnym wydarzeniu'}</h2>
                        <p className="mt-2 text-sm text-[#c6bad9]">{tab === 'organizer' ? 'Utwórz wydarzenie i dodaj propozycje terminów.' : 'Wydarzenia pojawią się tutaj po dołączeniu do nich.'}</p>
                        {tab === 'organizer' && <Link href="/events/create" className="mt-5 inline-block rounded-md bg-[#ddc5ff] px-4 py-2 text-sm font-bold text-[#241738] hover:bg-[#ebdbff]">Utwórz wydarzenie</Link>}
                    </div>
                ) : (
                    <ul className="mt-4 grid items-start gap-4 md:grid-cols-2">
                        {visibleEvents.map((event) => (
                            <li key={event.id} className="min-w-0 rounded-2xl border border-[#322b48] bg-[#1c192e] p-5 first:bg-[radial-gradient(ellipse_at_top_right,#382951,transparent_75%)] sm:p-6">
                                <span className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold ${event.plan ? 'border-[#285a4b] bg-[#163c33] text-[#a6e6cd]' : 'border-[#4a3c62] bg-[#29203c] text-[#ddc5ff]'}`}>
                                    {event.plan ? 'Plan zapisany' : event.voting_status === 'open' ? 'Głosowanie otwarte' : event.voting_status === 'closed' ? 'Głosowanie zamknięte' : 'W ustalaniu'}
                                </span>
                                <h2 className="mt-4 break-words text-xl font-semibold sm:text-2xl">{event.name}</h2>
                                {event.plan ? (
                                    <div className="mt-3 space-y-1 text-sm text-[#c6bad9]">
                                        <p>{event.plan.date ? formatDate(event.plan.date) : 'Termin jeszcze nieustalony'}{event.plan.starts_at && ` · ${event.plan.starts_at}`}</p>
                                        {event.plan.place && <p className="break-words">{event.plan.place}</p>}
                                        {event.plan.activity && <p className="break-words">{event.plan.activity}</p>}
                                    </div>
                                ) : (
                                    <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#c6bad9]">
                                        <span>{countLabel(event.terms.length, 'termin do wyboru', 'terminy do wyboru', 'terminów do wyboru')}</span>
                                        <span className="inline-flex items-center gap-1"><Users size={14} aria-hidden="true" />{countLabel(event.members_count, 'uczestnik', 'uczestników', 'uczestników')}</span>
                                    </p>
                                )}
                                <details className="group mt-5">
                                    <summary className="ml-auto flex w-fit cursor-pointer list-none items-center gap-2 rounded-md border border-[#4a3c62] px-4 py-2 text-sm font-semibold text-[#e8d8ff] hover:bg-[#302643] focus-visible:outline-2 focus-visible:outline-[#ddc5ff] [&::-webkit-details-marker]:hidden">
                                        {event.plan ? 'Zobacz plan i szczegóły' : 'Zobacz szczegóły'} <ChevronDown size={16} aria-hidden="true" className="transition-transform group-open:rotate-180" />
                                    </summary>
                                    <div className="mt-5 space-y-4 border-t border-[#322b48] pt-4 text-sm">
                                        {event.description && <p className="break-words whitespace-pre-wrap text-[#c6bad9]">{event.description}</p>}
                                        <div>
                                            <h3 className="font-semibold">Proponowane terminy</h3>
                                            {event.terms.length ? <ul className="mt-2 space-y-2 text-[#c6bad9]">{event.terms.map((term) => <li key={term.id}>{formatDate(term.date)} · {term.starts_at}–{term.ends_at}</li>)}</ul> : <p className="mt-2 text-[#c6bad9]">Brak propozycji terminów.</p>}
                                        </div>
                                        {event.activities.length > 0 && <div><h3 className="font-semibold">Proponowane aktywności</h3><ul className="mt-2 flex flex-wrap gap-2">{event.activities.map((activity, index) => <li key={`${index}-${activity}`} className="max-w-full rounded-lg bg-[#302643] px-3 py-1 break-words text-[#e8d8ff]">{activity}</li>)}</ul></div>}
                                        <p className="text-[#c6bad9]">Uczestnicy (wraz z organizatorem): {event.members_count}</p>
                                    </div>
                                </details>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </main>
    );
}

EventsIndex.layout = [];
