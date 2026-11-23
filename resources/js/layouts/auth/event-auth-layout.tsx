import type { AuthLayoutProps } from '@/types';

export default function EventAuthLayout({ children, title, description }: AuthLayoutProps) {
    return (
        <main
            className="flex min-w-0 items-center justify-center bg-[#121121] px-5 py-10 text-[#f6f1ff] sm:py-14 [color-scheme:dark]"
            style={{
                '--muted-foreground': '#c6bad9',
                '--foreground': '#f6f1ff',
                '--ring': '#ddc5ff',
                '--input': '#443654',
            } as React.CSSProperties}
        >
            <section
                aria-labelledby="auth-title"
                className="w-full max-w-md rounded-2xl border border-[#3a2e50] bg-[#1c192e] p-6 shadow-xl shadow-black/15 sm:p-8 [&_input:not([type=checkbox])]:h-11 [&_input:not([type=checkbox])]:border-[#443654] [&_input:not([type=checkbox])]:bg-[#151225] [&_input]:text-[#f6f1ff] [&_input]:placeholder:text-[#a99bbb] [&_a]:text-[#ddc5ff] [&_a:hover]:text-[#f6f1ff]"
            >
                <div className="mb-7">
                    <h1 id="auth-title" className="text-3xl font-bold tracking-tight">{title}</h1>
                    <p className="mt-2 text-sm leading-relaxed text-[#c6bad9]">{description}</p>
                </div>
                {children}
            </section>
        </main>
    );
}
