import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CalendarDays, MailOpen, Sparkles } from 'lucide-react';
import EventJoinCard from '@/components/events/event-join-card';
import type { EventDetailsData } from './show';

export default function EventInvite({ event = null, join_url = null }: {
    event?: EventDetailsData | null;
    join_url?: string | null;
}) {
    const canJoin = Boolean(event && join_url && !event.role);
    const organizer = event?.members?.find((member) => member.role === 'organizer');

    return (
        <main className="min-w-0 bg-[#121121] text-[#f6f1ff] [color-scheme:dark]">
            <Head title="Zaproszenie do wydarzenia" />
            <div className="mx-auto w-full max-w-4xl px-6 py-8 sm:py-12">
                <Link href="/events" className="inline-flex items-center gap-2 rounded-sm text-sm font-semibold text-[#ddc5ff] hover:text-[#f6f1ff] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ddc5ff]">
                    <ArrowLeft size={16} aria-hidden="true" /> Moje wydarzenia
                </Link>

                <header className="mt-8 text-center sm:mt-10">
                    <span aria-hidden="true" className="mx-auto mb-5 grid size-16 place-items-center rounded-2xl border border-[#5b427a] bg-[#302643] text-[#ddc5ff]">
                        <MailOpen size={30} />
                    </span>
                    <p className="text-xs font-bold tracking-[0.18em] text-[#d8b9ff] uppercase">Razem Wieczorem · Zaproszenie</p>
                    <h1 className="mt-3 text-3xl font-bold tracking-tight break-words sm:text-4xl">{event?.name || 'Zaproszenie do wydarzenia'}</h1>
                    <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#c6bad9]">Dobry wieczór zaczyna się od dobrego towarzystwa. Dołącz i zaplanujcie go razem.</p>
                </header>

                {event && (
                    <section aria-labelledby="invite-summary" className="mt-8 rounded-2xl border border-[#322b48] bg-[#1c192e] p-5 sm:p-6">
                        <h2 id="invite-summary" className="text-lg font-bold">O spotkaniu</h2>
                        <p className="mt-3 text-sm leading-relaxed break-words whitespace-pre-wrap text-[#d1c4e3]">{event.description?.trim() || 'Organizator nie dodał jeszcze opisu spotkania.'}</p>
                        <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-4 border-t border-[#322b48] pt-4 text-sm">
                            {organizer && <div className="min-w-0"><dt className="text-xs text-[#c6bad9]">Organizator</dt><dd className="mt-1 font-semibold break-words">{organizer.name}</dd></div>}
                            {event.terms && <div><dt className="flex items-center gap-1.5 text-xs text-[#c6bad9]"><CalendarDays size={14} aria-hidden="true" />Propozycje terminów</dt><dd className="mt-1 font-semibold">{event.terms.length}</dd></div>}
                            {event.activities && <div><dt className="flex items-center gap-1.5 text-xs text-[#c6bad9]"><Sparkles size={14} aria-hidden="true" />Pomysły na wieczór</dt><dd className="mt-1 font-semibold">{event.activities.length}</dd></div>}
                        </dl>
                    </section>
                )}

                {canJoin && event && join_url ? (
                    <EventJoinCard key={`${event.id}:${join_url}`} eventName={event.name} joinUrl={join_url} organizerName={organizer?.name} membersCount={event.members_count ?? event.members?.length} />
                ) : (
                    <section aria-labelledby="invitation-state" className="mt-7 rounded-2xl border border-[#4a3c62] bg-[#1c192e] p-6 text-center">
                        <h2 id="invitation-state" className="text-lg font-bold">{event?.role ? 'Jesteś już częścią tego wydarzenia' : 'Zaproszenie jest niedostępne'}</h2>
                        <p className="mt-2 text-sm text-[#c6bad9]">{event?.role ? 'Otwórz szczegóły i sprawdź plan spotkania.' : 'Poproś organizatora o aktualny link zaproszeniowy.'}</p>
                        <Link href={event?.role ? `/events/${event.id}` : '/events'} className="mt-5 inline-block rounded-md bg-[#ddc5ff] px-4 py-2 text-sm font-bold text-[#241738] hover:bg-[#ebdbff]">
                            {event?.role ? 'Otwórz wydarzenie' : 'Moje wydarzenia'}
                        </Link>
                    </section>
                )}
            </div>
        </main>
    );
}

EventInvite.layout = [] as [];
