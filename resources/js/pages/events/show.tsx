import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CalendarDays, Check, Copy, Link2, MapPin, Sparkles, Users } from 'lucide-react';
import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import EventInvite from './invite';
import EventDescriptionEditor from '@/components/events/event-description-editor';
import EventTermsEditor from '@/components/events/event-terms-editor';
import EventTermVoting from '@/components/events/event-term-voting';
import type { VotingTerm } from '@/components/events/event-term-voting';
import EventActivityForm from '@/components/events/event-activity-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Frontend contract; the backend will supply event when rendering events/show.
export type EventDetailsData = {
    id: number;
    name: string;
    description?: string | null;
    role?: 'organizer' | 'member' | null;
    voting_status?: string;
    members_count?: number;
    terms?: VotingTerm[];
    activities?: string[];
    members?: { id: number; name: string; role: 'organizer' | 'member' }[];
    invitation_url?: string | null;
    plan?: {
        date: string | null;
        starts_at: string | null;
        place: string | null;
        activity: string | null;
    } | null;
};

function formatDate(value?: string | null) {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'Termin nieustalony';
    const date = new Date(`${value}T12:00:00`);
    if (Number.isNaN(date.getTime())) return 'Termin nieustalony';
    return new Intl.DateTimeFormat('pl-PL', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    }).format(date);
}

function Section({ id, title, icon, children }: {
    id: string; title: string; icon: ReactNode; children: ReactNode;
}) {
    return (
        <section aria-labelledby={id} className="min-w-0 rounded-2xl border border-[#322b48] bg-[#1c192e] p-5 sm:p-6">
            <h2 id={id} className="mb-5 flex items-center gap-3 text-lg font-bold">
                <span className="text-[#ddc5ff]">{icon}</span>{title}
            </h2>
            {children}
        </section>
    );
}

function EmptyState({ children }: { children: ReactNode }) {
    return <p className="rounded-xl border border-dashed border-[#4a3c62] p-4 text-sm leading-relaxed text-[#c6bad9]">{children}</p>;
}

function EventDetails({event, updateDescriptionUrl, addTermsUrl, availabilityUrl, addActivityUrl}: {
    event: EventDetailsData | null;
    updateDescriptionUrl?: string | null;
    addTermsUrl?: string | null;
    availabilityUrl?: string | null;
    addActivityUrl?: string | null;
}) {
    const [copyStatus, setCopyStatus] = useState<'idle' | 'copying' | 'copied' | 'error'>('idle');
    const invitationInput = useRef<HTMLInputElement>(null);
    const terms = event?.terms ?? [];
    const activities = event?.activities ?? [];
    const members = event?.members;
    const plan = event?.plan;
    const isOrganizer = event?.role === 'organizer';
    const canParticipate = isOrganizer || event?.role === 'member';
    const votingOpen = event?.voting_status === 'open';
    const invitationUrl = isOrganizer ? event?.invitation_url?.trim() : undefined;
    const memberCount = event?.members_count ?? members?.length;
    const status = event
        ? plan ? 'Plan zapisany'
            : event.voting_status === 'open' ? 'Głosowanie otwarte'
                : event.voting_status === 'closed' ? 'Głosowanie zamknięte' : 'Status nieustalony'
        : null;

    async function copyInvitation() {
        if (!invitationUrl) return;
        setCopyStatus('copying');
        try {
            await navigator.clipboard.writeText(invitationUrl);
            setCopyStatus('copied');
        } catch {
            setCopyStatus('error');
            invitationInput.current?.focus();
            invitationInput.current?.select();
        }
    }

    return (
        <main className="min-w-0 bg-[#121121] text-[#f6f1ff] [color-scheme:dark]">
            <Head title={event?.name || 'Szczegóły wydarzenia'} />
            <div className="mx-auto w-full max-w-6xl px-6 py-8 sm:py-10">
                <Link href="/events" className="mb-7 inline-flex items-center gap-2 rounded-sm text-sm font-semibold text-[#ddc5ff] hover:text-[#f6f1ff] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ddc5ff]">
                    <ArrowLeft size={16} aria-hidden="true" /> Moje wydarzenia
                </Link>
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1 basis-64">
                        <p className="mb-2 text-xs font-bold tracking-[0.18em] text-[#d8b9ff] uppercase">Wspólny wieczór</p>
                        <h1 className="break-words text-3xl font-bold tracking-tight sm:text-4xl">{event?.name || 'Szczegóły wydarzenia'}</h1>
                        <p className="mt-3 text-sm leading-relaxed text-[#c6bad9]">Wszystko, czego potrzebujecie, żeby ustalić wspólny plan.</p>
                    </div>
                    {status && <span className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${plan ? 'border-[#285a4b] bg-[#163c33] text-[#a6e6cd]' : 'border-[#4a3c62] bg-[#29203c] text-[#ddc5ff]'}`}>{status}</span>}
                </div>

                <div className="mt-7 grid items-start gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
                    <div className="min-w-0 space-y-4">
                        <Section id="event-description" title="O wydarzeniu" icon={<Sparkles size={20} aria-hidden="true" />}>
                            {isOrganizer ? (
                                <EventDescriptionEditor description={event?.description} updateUrl={updateDescriptionUrl} />
                            ) : event?.description?.trim()
                                ? <p className="text-sm leading-relaxed break-words whitespace-pre-wrap text-[#d1c4e3]">{event.description}</p>
                                : <EmptyState>{event ? 'Organizator nie dodał jeszcze opisu wydarzenia.' : 'Informacje o wydarzeniu nie są jeszcze dostępne.'}</EmptyState>}
                        </Section>

                        <Section id="event-terms" title="Proponowane terminy" icon={<CalendarDays size={20} aria-hidden="true" />}>
                            <EventTermVoting terms={terms} canParticipate={canParticipate} isOpen={votingOpen} saveUrl={availabilityUrl} />
                            {isOrganizer && <EventTermsEditor existingTerms={terms} storeUrl={addTermsUrl} />}
                        </Section>

                        <Section id="event-activities" title="Pomysły na wieczór" icon={<Sparkles size={20} aria-hidden="true" />}>
                            {activities.length ? (
                                <ul className="flex flex-wrap gap-2">{activities.map((activity, index) => <li key={`${index}-${activity}`} className="max-w-full rounded-lg border border-[#4a3c62] bg-[#302643] px-3 py-2 text-sm break-words text-[#e8d8ff]">{activity}</li>)}</ul>
                            ) : <EmptyState>Nie ma jeszcze propozycji aktywności.</EmptyState>}
                            {canParticipate && <EventActivityForm existingActivities={activities} storeUrl={addActivityUrl} isOpen={votingOpen} />}
                        </Section>
                    </div>

                    <div className="min-w-0 space-y-4">
                        <Section id="event-plan" title="Plan wieczoru" icon={<Check size={20} aria-hidden="true" />}>
                            {plan ? (
                                <div className="space-y-4 rounded-xl border border-[#4a3c62] bg-[radial-gradient(ellipse_at_top_right,#382951,#151225_90%)] p-4">
                                    <p className="text-sm font-semibold">{formatDate(plan.date)}{plan.starts_at && ` · ${plan.starts_at.slice(0, 5)}`}</p>
                                    <p className="flex items-start gap-2 text-sm text-[#d1c4e3]"><MapPin size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-[#ddc5ff]" /><span className="min-w-0 break-words">{plan.place || 'Miejsce jeszcze nieustalone'}</span></p>
                                    <p className="text-sm break-words text-[#d1c4e3]">{plan.activity || 'Aktywność jeszcze nieustalona'}</p>
                                </div>
                            ) : <EmptyState>Plan nie został jeszcze ustalony. Tutaj pojawią się wybrany termin, miejsce i aktywność.</EmptyState>}
                        </Section>

                        <Section id="event-members" title={memberCount === undefined ? 'Uczestnicy' : `Uczestnicy · ${memberCount}`} icon={<Users size={20} aria-hidden="true" />}>
                            {members?.length ? (
                                <ul className="divide-y divide-[#322b48]">
                                    {members.map((member) => (
                                        <li key={member.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                                            <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-[#322743] text-sm font-bold text-[#ddc5ff]">{Array.from(member.name.trim())[0]?.toLocaleUpperCase('pl-PL') || '?'}</span>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold break-words">{member.name}</p>
                                                <p className="mt-0.5 text-xs text-[#c6bad9]">{member.role === 'organizer' ? 'Organizator' : 'Uczestnik'}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : <EmptyState>{members === undefined ? 'Lista uczestników nie jest jeszcze dostępna.' : 'Nie ma jeszcze uczestników.'}</EmptyState>}
                        </Section>

                        <Section id="event-invitation" title="Zaproś znajomych" icon={<Link2 size={20} aria-hidden="true" />}>
                            {isOrganizer ? (
                                <div className="space-y-3">
                                    <p className="text-sm leading-relaxed text-[#c6bad9]">Wyślij znajomym link zaproszenia do tego wydarzenia.</p>
                                    {invitationUrl ? (
                                        <>
                                            <Label htmlFor="event-invitation-url">Link zaproszeniowy</Label>
                                            <Input ref={invitationInput} id="event-invitation-url" readOnly value={invitationUrl} onFocus={(e) => e.currentTarget.select()} aria-describedby="event-copy-status" className="min-w-0 border-[#3b3152] bg-[#151225] dark:bg-[#151225]" />
                                            <Button type="button" disabled={copyStatus === 'copying'} onClick={() => void copyInvitation()} className="w-full bg-[#ddc5ff] font-bold text-[#241738] hover:bg-[#ebdbff]">
                                                {copyStatus === 'copied' ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
                                                {copyStatus === 'copied' ? 'Skopiowano' : copyStatus === 'copying' ? 'Kopiowanie…' : 'Kopiuj link'}
                                            </Button>
                                            <p id="event-copy-status" role="status" className="text-xs leading-relaxed text-[#c6bad9]">
                                                {copyStatus === 'copied' && 'Link został skopiowany. Możesz wysłać go znajomym.'}
                                                {copyStatus === 'error' && 'Nie udało się skopiować linku automatycznie. Zaznacz go i skopiuj ręcznie.'}
                                            </p>
                                        </>
                                    ) : <EmptyState>Link zaproszeniowy nie jest jeszcze dostępny.</EmptyState>}
                                </div>
                            ) : <EmptyState>Link zaproszeniowy udostępnia organizator wydarzenia.</EmptyState>}
                        </Section>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default function EventShow({event = null, join_url = null, update_description_url = null, add_terms_url = null, availability_url = null, add_activity_url = null}: {
    event?: EventDetailsData | null;
    join_url?: string | null;
    update_description_url?: string | null;
    add_terms_url?: string | null;
    availability_url?: string | null;
    add_activity_url?: string | null;
}) {
    if (join_url && event && !event.role) {
        return <EventInvite event={event} join_url={join_url} />;
    }

    return (
        <EventDetails
            key={`${event?.id ?? 'empty'}:${event?.role ?? ''}`}
            event={event}
            updateDescriptionUrl={update_description_url}
            addTermsUrl={add_terms_url}
            availabilityUrl={availability_url}
            addActivityUrl={add_activity_url}
        />
    );
}

EventShow.layout = [] as [];
