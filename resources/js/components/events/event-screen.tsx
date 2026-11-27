import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import type { EventDetailsData } from '@/pages/events/show';
import { eventViewUrl } from '@/lib/event-workspace';
import type { EventView } from '@/lib/event-workspace';

export function EventViewNavigation({ eventId, active }: { eventId: number; active: EventView }) {
    const links = [{ view: 'details', label: 'Szczegóły' }, { view: 'answers', label: 'Twoje odpowiedzi' }, { view: 'results', label: 'Wyniki' }, { view: 'plan', label: 'Plan i powiadomienia' }] as const;
    return <nav aria-label="Widoki wydarzenia" className="mt-6 flex flex-wrap gap-2">{links.map(({ view, label }) => <Link key={view} href={eventViewUrl(eventId, view)} aria-current={active === view ? 'page' : undefined} className={`rounded-md border px-3 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ddc5ff] ${active === view ? 'border-[#ddc5ff] bg-[#ddc5ff] text-[#241738]' : 'border-[#4a3c62] bg-[#251e39] text-[#e8d8ff] hover:bg-[#302643]'}`}>{label}</Link>)}</nav>;
}

export default function EventScreen({ event, active, eyebrow, description, children }: {
    event: EventDetailsData; active: EventView; eyebrow: string; description: string; children: ReactNode;
}) {
    const confirmed = event.plan?.confirmed === true;
    const status = confirmed ? 'Zatwierdzone' : event.voting_status === 'open' ? 'Głosowanie otwarte' : event.voting_status === 'closed' ? 'Głosowanie zamknięte' : 'W ustalaniu';
    return (
        <main className="min-w-0 bg-[#121121] text-[#f6f1ff] [color-scheme:dark]">
            <Head title={`${event.name} — ${eyebrow}`} />
            <div className="mx-auto w-full max-w-6xl px-6 py-8 sm:py-10">
                <Link href="/events" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#ddc5ff] hover:text-[#f6f1ff]"><ArrowLeft size={16} aria-hidden="true" />Moje wydarzenia</Link>
                <p className="mb-2 text-xs font-bold tracking-[0.18em] text-[#d8b9ff] uppercase">Wydarzenie / {eyebrow}</p>
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div className="min-w-0 flex-1 basis-64"><h1 className="text-3xl font-bold tracking-tight break-words sm:text-4xl">{event.name}</h1><p className="mt-2 text-sm leading-relaxed text-[#c6bad9]">{description}</p></div>
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${confirmed ? 'border-[#285a4b] bg-[#163c33] text-[#a6e6cd]' : 'border-[#4a3c62] bg-[#29203c] text-[#ddc5ff]'}`}>{status}</span>
                </div>
                <EventViewNavigation eventId={event.id} active={active} />
                <div className="mt-6">{children}</div>
            </div>
        </main>
    );
}
