import { createInertiaApp, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { login, logout } from '@/routes';

type SessionProps = { auth?: { user?: { name: string } | null } };

function AccountActions({ initialUser }: { initialUser: SessionProps['auth'] }) {
    const [user, setUser] = useState(initialUser?.user ?? null);

    useEffect(() => router.on('navigate', ({ detail }) => {
        const props = detail.page.props as SessionProps;
        setUser(props.auth?.user ?? null);
    }), []);

    const buttonClass = 'rounded-md bg-[#ddc5ff] px-4 py-2 text-sm font-bold text-[#241738] hover:bg-[#ebdbff]';

    return (
        <div className="ml-auto flex flex-wrap items-center gap-3">
            {user ? (
                <>
                    <span className="break-words text-sm text-[#e8d8ff]">{user.name}</span>
                    <Link href={logout()} as="button" className={buttonClass} onClick={() => router.flushAll()}>
                        Wyloguj się
                    </Link>
                </>
            ) : (
                <Link href={login()} className={buttonClass}>Zaloguj się</Link>
            )}
        </div>
    );
}

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

void createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name === 'welcome':
                return null;
            case name.startsWith('auth/'):
                return AuthLayout;
            case name.startsWith('settings/'):
                return [AppLayout, SettingsLayout];
            default:
                return AppLayout;
        }
    },
    strictMode: true,
    withApp(app, { page }) {
        return (
            <TooltipProvider delayDuration={0}>
                <div className="grid min-h-dvh min-w-0 grid-rows-[auto_1fr_auto]">
                    <header className="border-b border-[#29243d] bg-[#171526] text-[#f6f1ff]">
                        <nav aria-label="Nawigacja główna" className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-3 px-6 py-4">
                            <Link href="/" className="flex items-center gap-2 font-bold">
                                <span aria-hidden="true" className="grid size-8 place-items-center rounded-xl bg-[#ddc5ff] text-[#201632]">✦</span>
                                Razem Wieczorem
                            </Link>
                            <Link href="/events" className="text-sm font-semibold text-[#ddc5ff] hover:text-[#f6f1ff]">Moje wydarzenia</Link>
                            <Link href="/events/create" className="text-sm font-semibold text-[#ddc5ff] hover:text-[#f6f1ff]">
                                Utwórz nowe
                            </Link>
                            <AccountActions initialUser={(page.props as SessionProps).auth} />
                        </nav>
                    </header>
                    {app}
                    <footer className="border-t-2 border-[#5b427a] bg-[#211b32] text-sm text-[#d1c4e3]">
                        <div className="mx-auto grid w-full max-w-6xl gap-5 px-6 py-6 sm:grid-cols-2 sm:gap-8">
                            <div className="flex items-start gap-3">
                                <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-xl bg-[#ddc5ff] text-[#201632]">✦</span>
                                <div className="space-y-1">
                                    <p className="font-bold text-[#f6f1ff]">Razem Wieczorem</p>
                                    <p>Strona projektowa na przedmiot „Projekt Systemu Aplikacji Multimedialnej”</p>
                                </div>
                            </div>
                            <div className="space-y-1 sm:text-right">
                                <p className="font-semibold text-[#eadbff]">Autorzy</p>
                                <p>Mateusz Rzymowski, Bartłomiej Świder, Krzysztof Machulec, Kacper Ćwiek</p>
                            </div>
                        </div>
                    </footer>
                </div>
                <Toaster />
            </TooltipProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();

