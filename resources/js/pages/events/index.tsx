import { Head, Link } from '@inertiajs/react';

const examples = [
    { name: 'Wyjście ze znajomymi', description: 'Kręgle, kino albo wspólna kolacja.', status: 'Głosowanie trwa', terms: '3 proponowane terminy' },
    { name: 'Wieczór planszówek', description: 'Spotkanie przy ulubionych grach.', status: 'Plan ustalony', terms: 'Sobota, 19:00' },
];

export default function EventsIndex() {
    return (
        <main className="min-w-0 bg-[#121121] text-[#f6f1ff]">
            <Head title="Moje wydarzenia" />
            <div className="mx-auto w-full max-w-6xl px-6 py-8 sm:py-10">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Moje wydarzenia</h1>
                        <p className="mt-2 text-sm text-[#c6bad9]">Przykładowe wydarzenia</p>
                    </div>
                    <Link href="/events/create" className="rounded-md bg-[#ddc5ff] px-4 py-2 text-sm font-bold text-[#241738] hover:bg-[#ebdbff]">
                        Utwórz nowe
                    </Link>
                </div>

                <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                    {examples.map((event) => (
                        <li key={event.name} className="min-w-0 rounded-2xl border border-[#322b48] bg-[#1c192e] p-5">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <h2 className="text-lg font-bold">{event.name}</h2>
                                <span className="rounded-full bg-[#322743] px-3 py-1 text-xs font-semibold text-[#ddc5ff]">{event.status}</span>
                            </div>
                            <p className="mt-2 text-sm text-[#c6bad9]">{event.description}</p>
                            <p className="mt-4 text-sm font-medium text-[#ddc5ff]">{event.terms}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </main>
    );
}

EventsIndex.layout = [];
