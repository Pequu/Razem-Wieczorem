import { createInertiaApp } from '@inertiajs/react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';

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
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                <div className="grid min-h-dvh min-w-0 grid-rows-[1fr_auto]">
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

