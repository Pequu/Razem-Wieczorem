import { Link, useForm } from '@inertiajs/react';
import { ArrowRight, LoaderCircle, UserRoundPlus, Users } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';

type EventJoinCardProps = {
    eventName: string;
    joinUrl: string;
    organizerName?: string;
    membersCount?: number;
};

export default function EventJoinCard({ eventName, joinUrl, organizerName, membersCount }: EventJoinCardProps) {
    const form = useForm({});
    const [error, setError] = useState<string | null>(null);

    function join(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (form.processing) return;
        setError(null);
        form.post(joinUrl, {
            preserveScroll: true,
            onError: (errors) => {
                const message = Object.values(errors).find((value) => typeof value === 'string');
                setError(message || 'Nie udało się dołączyć do wydarzenia. Spróbuj ponownie.');
            },
        });
    }

    return (
        <section aria-labelledby="join-event-heading" className="relative mt-7 overflow-hidden rounded-2xl border border-[#78589e] bg-[#251e39] bg-[radial-gradient(ellipse_at_top_right,#483161,transparent_75%)] p-5 sm:p-7">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                    <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#ddc5ff] text-[#241738]">
                        <UserRoundPlus size={24} />
                    </span>
                    <div className="min-w-0">
                        <p className="mb-2 text-xs font-bold tracking-[0.16em] text-[#ddc5ff] uppercase">Zaproszenie na wspólny wieczór</p>
                        <h2 id="join-event-heading" className="text-xl font-bold sm:text-2xl">Dołącz do znajomych</h2>
                        <p className="mt-3 text-sm leading-relaxed break-words text-[#e8d8ff]">
                            {organizerName ? <><span className="font-semibold">{organizerName}</span> zaprasza Cię na </> : 'Otrzymujesz zaproszenie na '}
                            wydarzenie <span className="font-semibold text-[#f6f1ff]">„{eventName}”</span>.
                        </p>
                        <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#c6bad9]">Po dołączeniu znajdziesz je w zakładce „Uczestniczę” na stronie „Moje wydarzenia”.</p>
                        {membersCount !== undefined && <p className="mt-4 inline-flex items-center gap-2 text-sm text-[#ddc5ff]"><Users size={16} aria-hidden="true" />Liczba uczestników: {membersCount}</p>}
                    </div>
                </div>
                <form onSubmit={join} aria-busy={form.processing} className="w-full shrink-0 space-y-3 md:w-64">
                    <Button type="submit" disabled={form.processing} aria-describedby={error ? 'join-event-error' : undefined} className="h-auto min-h-11 w-full bg-[#ddc5ff] px-4 py-3 font-bold whitespace-normal text-[#241738] hover:bg-[#ebdbff] focus-visible:ring-[#ddc5ff]">
                        {form.processing ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <UserRoundPlus aria-hidden="true" />}
                        {form.processing ? 'Dołączanie…' : 'Dołącz do wydarzenia'}
                        {!form.processing && <ArrowRight aria-hidden="true" />}
                    </Button>
                    <p role="status" className="sr-only">{form.processing ? 'Trwa dołączanie do wydarzenia.' : ''}</p>
                    {error && <p id="join-event-error" role="alert" className="rounded-lg border border-[#925a78] bg-[#3a2235] px-3 py-2 text-sm leading-relaxed text-[#ffcee0]">{error}</p>}
                    <Link href="/events" className="block rounded-md px-3 py-2 text-center text-sm font-semibold text-[#d1c4e3] hover:bg-[#302643] hover:text-[#f6f1ff] focus-visible:outline-2 focus-visible:outline-[#ddc5ff]">Wróć do moich wydarzeń</Link>
                </form>
            </div>
        </section>
    );
}
