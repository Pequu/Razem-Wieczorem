import { Head, Link } from '@inertiajs/react';
import { ArrowRight, CalendarDays, Clock3, Users } from 'lucide-react';

const steps = [
    {
        icon: CalendarDays,
        title: 'Zaproponuj terminy',
        description: 'Nadaj spotkaniu nazwę i dodaj daty, które chcesz zaproponować znajomym.',
    },
    {
        icon: Users,
        title: 'Dodaj pomysły',
        description: 'Kręgle, kino czy kolacja? Wpisz początkowe aktywności, które Was interesują.',
    },
];

export default function Welcome() {
    return (
        <main className="min-w-0 bg-[#121121] text-[#f6f1ff]">
            <Head title="Razem Wieczorem" />
            <div className="mx-auto w-full max-w-6xl px-6 py-12 sm:py-20">
                <section aria-labelledby="welcome-title" className="grid items-center gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
                    <div>
                        <h1 id="welcome-title" className="max-w-xl text-4xl leading-tight font-bold tracking-tight sm:text-5xl lg:text-6xl">
                            Dobry wieczór zaczyna się <span className="text-[#ddc5ff]">od wspólnego planu.</span>
                        </h1>
                        <p className="mt-6 max-w-lg text-base leading-relaxed text-[#c6bad9] sm:text-lg">
                            Zbierz pomysły na spotkanie i zaproponuj terminy.
                            Zaplanuj kolejny wieczór ze znajomymi w jednym miejscu.
                        </p>
                        <div className="mt-8 flex flex-wrap items-center gap-4">
                            <Link href="/events/create" className="inline-flex items-center gap-2 rounded-lg bg-[#ddc5ff] px-5 py-3 text-sm font-bold text-[#241738] transition-colors hover:bg-[#ebdbff] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ddc5ff]">
                                Utwórz wydarzenie <ArrowRight className="size-4" aria-hidden="true" />
                            </Link>
                            <Link href="/events" className="rounded-lg px-2 py-3 text-sm font-semibold text-[#ddc5ff] hover:text-[#f6f1ff] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ddc5ff]">
                                Moje wydarzenia
                            </Link>
                        </div>
                    </div>

                    <aside aria-label="Przykład zaplanowanego spotkania" className="min-w-0 rounded-2xl border border-[#433354] bg-[#1c192e] p-6 shadow-xl shadow-black/15 sm:p-8">
                        <p className="text-xs font-semibold tracking-widest text-[#b9a8ce] uppercase">Przykładowe spotkanie</p>
                        <h2 className="mt-4 text-2xl font-bold">Wieczór ze znajomymi</h2>
                        <p className="mt-2 text-sm text-[#c6bad9]">Znajdźmy chwilę, żeby pobyć razem.</p>
                        <div className="mt-6 flex items-center gap-4 rounded-xl border border-[#3b3152] bg-[#151225] p-4">
                            <CalendarDays className="size-6 shrink-0 text-[#ddc5ff]" aria-hidden="true" />
                            <div>
                                <p className="font-semibold">Sobotni wieczór</p>
                                <p className="mt-1 flex items-center gap-1.5 text-sm text-[#c6bad9]">
                                    <Clock3 className="size-3.5" aria-hidden="true" /> 18:00–21:00
                                </p>
                            </div>
                        </div>
                        <h3 className="mt-6 text-sm font-semibold text-[#c6bad9]">Pomysły na spotkanie</h3>
                        <ul className="mt-3 flex flex-wrap gap-2">
                            {['Kręgle', 'Kino', 'Wspólna kolacja'].map((activity) => (
                                <li key={activity} className="rounded-full border border-[#4a3c62] bg-[#302643] px-3 py-1.5 text-sm text-[#eadbff]">{activity}</li>
                            ))}
                        </ul>
                    </aside>
                </section>

                <section aria-labelledby="steps-title" className="mt-14 border-t border-[#322b48] pt-8 sm:mt-20">
                    <h2 id="steps-title" className="text-xl font-bold">Od pomysłu do spotkania</h2>
                    <div className="mt-6 grid gap-6 sm:grid-cols-2">
                        {steps.map(({ icon: Icon, title, description }) => (
                            <div key={title} className="flex items-start gap-4">
                                <div className="rounded-xl bg-[#302643] p-3 text-[#ddc5ff]"><Icon className="size-5" aria-hidden="true" /></div>
                                <div>
                                    <h3 className="font-semibold">{title}</h3>
                                    <p className="mt-2 max-w-md text-sm leading-relaxed text-[#c6bad9]">{description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}

Welcome.layout = [];
