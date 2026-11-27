import { Head, Link, useForm } from '@inertiajs/react';
import { Check, Copy, Plus, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const termFields = [
    { name: 'date', label: 'Data', type: 'date' },
    { name: 'starts_at', label: 'Od', type: 'time' },
    { name: 'ends_at', label: 'Do', type: 'time' },
] as const;

function emptyTerm(id: number) {
    return { id, date: '', starts_at: '', ends_at: '' };
}

function localToday() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${now.getFullYear()}-${month}-${day}`;
}

type CreatedEvent = {
    name: string;
    invitation_url: string;
    short_invitation?: string | null;
};

function ShortInvitationCode({ code }: { code?: string | null }) {
    const [status, setStatus] = useState<'idle' | 'copying' | 'copied' | 'error'>('idle');
    const input = useRef<HTMLInputElement>(null);

    async function copyCode() {
        if (!code || status === 'copying') return;
        setStatus('copying');
        try {
            await navigator.clipboard.writeText(code);
            setStatus('copied');
        } catch {
            setStatus('error');
            input.current?.focus();
            input.current?.select();
        }
    }

    return (
        <div className="space-y-3 rounded-xl border border-[#5b427a] bg-[#251e39] p-4 sm:p-5">
            <Label htmlFor="created-invitation-code">Krótki kod zaproszenia</Label>
            {code ? (
                <>
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Input ref={input} id="created-invitation-code" readOnly value={code} onFocus={(event) => event.currentTarget.select()} aria-describedby="created-code-help created-code-status" className="h-12 min-w-0 flex-1 border-[#5b427a] bg-[#151225] font-mono text-xl tracking-[0.25em] text-[#f6f1ff] dark:bg-[#151225]" />
                        <Button type="button" disabled={status === 'copying'} onClick={() => void copyCode()} className="h-12 shrink-0 bg-[#ddc5ff] font-bold text-[#241738] hover:bg-[#ebdbff]">
                            {status === 'copied' ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
                            {status === 'copied' ? 'Skopiowano kod' : status === 'copying' ? 'Kopiowanie…' : 'Kopiuj kod'}
                        </Button>
                    </div>
                    <p id="created-code-help" className="text-sm leading-relaxed text-[#c6bad9]">Przekaż znajomym ten kod. Mogą wpisać go w sekcji „Dołącz kodem” na stronie „Moje wydarzenia”.</p>
                    <p id="created-code-status" role="status" className="text-sm text-[#e8d8ff]">
                        {status === 'copied' && 'Kod skopiowany do schowka.'}
                        {status === 'error' && 'Nie udało się skopiować automatycznie. Zaznacz kod i skopiuj go ręcznie.'}
                    </p>
                </>
            ) : <p className="text-sm leading-relaxed text-[#c6bad9]">Krótki kod nie jest jeszcze dostępny. Możesz udostępnić link zaproszeniowy poniżej.</p>}
        </div>
    );
}

export default function CreateEvent({
    createdEvent = null,
}: {
    createdEvent?: CreatedEvent | null;
}) {
    const nextTermId = useRef(1);
    const form = useForm({ name: '', description: '', activities: '', terms: [emptyTerm(0)] });
    const saved = createdEvent
        ? {
            name: createdEvent.name,
            invitationUrl: createdEvent.invitation_url,
            shortInvitation: createdEvent.short_invitation,
        }
        : null;
    const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');
    const errors = form.errors as Record<string, string | undefined>;
    const activityError = errors.activities ?? Object.entries(errors)
        .find(([key]) => key.startsWith('activities.'))?.[1];

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setCopyStatus('idle');
        form.clearErrors();

        if (!form.data.name.trim()) {
            form.setError('name', 'Wpisz nazwę wydarzenia.');
            return;
        }

        const today = localToday();
        const pastTermIndex = form.data.terms.findIndex(({ date }) => date < today);
        if (pastTermIndex !== -1) {
            form.setError(`terms.${pastTermIndex}.date`, 'Wybierz dzisiejszą lub przyszłą datę.');
            return;
        }

        const invalidIndex = form.data.terms.findIndex(
            ({ starts_at, ends_at }) => starts_at >= ends_at,
        );
        if (invalidIndex !== -1) {
            form.setError(
                `terms.${invalidIndex}.ends_at`,
                'Godzina zakończenia musi być późniejsza niż godzina rozpoczęcia.',
            );
            return;
        }

        form.transform(({ name, description, activities, terms }) => ({
            name: name.trim(),
            description: description.trim(),
            activities: activities.split(',').map((activity) => activity.trim()).filter(Boolean),
            terms: terms.map(({ date, starts_at, ends_at }) => ({
                date,
                starts_at,
                ends_at,
            })),
        }));
        form.post('/events', {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
            },
        });
    }

    async function copyInvitation() {
        if (!saved?.invitationUrl) return;
        try {
            await navigator.clipboard.writeText(saved.invitationUrl);
            setCopyStatus('copied');
        } catch {
            setCopyStatus('error');
        }
    }

    if (saved) {
        return (
            <div className="flex min-w-0 flex-col bg-[#121121] text-[#f6f1ff] [color-scheme:dark]">
                <Head title="Wydarzenie utworzone" />
                <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8 sm:py-10">
                    <p className="mb-2 text-xs font-bold tracking-[0.18em] text-[#d8b9ff] uppercase">Gotowe!</p>
                    <h1 tabIndex={-1} ref={(element) => element?.focus()} className="text-3xl font-bold tracking-tight outline-none sm:text-4xl">Wydarzenie zostało utworzone</h1>
                    <p className="mt-2 break-words text-[#c6bad9]">{saved.name}</p>

                    <section aria-labelledby="invitation-heading" className="mt-6 max-w-2xl space-y-5 rounded-2xl border border-[#5b427a] bg-[#1c192e] p-5 sm:p-6">
                        <div>
                            <h2 id="invitation-heading" className="text-lg font-bold">Zaproś znajomych</h2>
                            <p className="mt-2 text-sm text-[#c6bad9]">Udostępnij link osobom, z którymi chcesz zaplanować wspólny wieczór.</p>
                        </div>
                        <ShortInvitationCode key={saved.shortInvitation ?? 'unavailable'} code={saved.shortInvitation} />
                        {saved.invitationUrl ? (
                            <div className="space-y-2">
                                <Label htmlFor="invitation-url">Link zaproszeniowy</Label>
                                <div className="flex flex-col gap-2 sm:flex-row">
                                    <Input id="invitation-url" readOnly value={saved.invitationUrl} onFocus={(event) => event.currentTarget.select()} className="min-w-0 border-[#3b3152] bg-[#151225] dark:bg-[#151225]" />
                                    <Button type="button" onClick={() => void copyInvitation()} className="shrink-0 bg-[#ddc5ff] font-bold text-[#241738] hover:bg-[#ebdbff]">
                                        {copyStatus === 'copied' ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
                                        {copyStatus === 'copied' ? 'Skopiowano' : 'Kopiuj link'}
                                    </Button>
                                </div>
                                <p role="status" className="text-sm text-[#c6bad9]">
                                    {copyStatus === 'copied' && 'Link skopiowany. Możesz wysłać go znajomym.'}
                                    {copyStatus === 'error' && 'Nie udało się skopiować automatycznie. Zaznacz link i skopiuj go ręcznie.'}
                                </p>
                            </div>
                        ) : (
                            <p role="status" className="rounded-xl border border-[#3b3152] bg-[#151225] p-4 text-sm text-[#c6bad9]">Wydarzenie zapisane. Link zaproszeniowy nie jest jeszcze dostępny.</p>
                        )}
                        <div className="flex flex-wrap gap-3 border-t border-[#322b48] pt-5">
                            <Link href="/events" className="rounded-md border border-[#4a3c62] px-4 py-2 text-sm font-semibold text-[#e8d8ff] hover:bg-[#302643]">Moje wydarzenia</Link>
                            <Link href="/events/create" className="rounded-md bg-[#ddc5ff] px-4 py-2 text-sm font-bold text-[#241738] hover:bg-[#ebdbff]">Utwórz kolejne</Link>
                        </div>
                    </section>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-w-0 flex-col bg-[#121121] text-[#f6f1ff] [color-scheme:dark]">
            <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8 sm:py-10">
            <Head title="Utwórz wydarzenie" />
            <p className="mb-2 text-xs font-bold tracking-[0.18em] text-[#d8b9ff] uppercase">Tworzenie wydarzenia</p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Zaplanuj wspólny wieczór</h1>
            <p className="mt-2 text-sm text-[#c6bad9]">Podaj nazwę i dodaj przynajmniej jeden termin.</p>

            <form className="mt-6" onSubmit={submit}>
                <fieldset disabled={form.processing} className="grid min-w-0 gap-4 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
                    <section aria-labelledby="event-details" className="min-w-0 space-y-4 rounded-2xl border border-[#322b48] bg-[#1c192e] p-5"><h2 id="event-details" className="text-lg font-bold">Szczegóły wydarzenia</h2>
                    <div className="space-y-2">
                        <Label htmlFor="event-name">Nazwa wydarzenia</Label>
                        <Input
                            id="event-name" placeholder="Wyjście ze znajomymi" className="border-[#3b3152] bg-[#151225] dark:bg-[#151225]"
                            value={form.data.name}
                            onChange={(event) => form.setData('name', event.target.value)}
                            required
                            maxLength={255}
                            aria-invalid={!!errors.name}
                            aria-describedby={errors.name ? 'event-name-error' : undefined}
                        />
                        <InputError id="event-name-error" message={errors.name} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="event-description">Opis (opcjonalnie)</Label>
                        <textarea
                            id="event-description"
                            value={form.data.description}
                            onChange={(event) => form.setData('description', event.target.value)}
                            rows={2} placeholder="Wybierzmy wspólnie termin i pomysł na wieczór."
                            maxLength={2000}
                            className="border-[#3b3152] focus-visible:ring-[#ddc5ff] w-full rounded-md border bg-[#151225] px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
                            aria-invalid={!!errors.description}
                            aria-describedby={errors.description ? 'event-description-error' : undefined}
                        />
                        <InputError id="event-description-error" message={errors.description} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="event-activities">Początkowe aktywności (opcjonalnie)</Label>
                        <Input
                            id="event-activities"
                            placeholder="Kręgle, kino, restauracja"
                            className="border-[#3b3152] bg-[#151225] dark:bg-[#151225]"
                            value={form.data.activities}
                            onChange={(event) => form.setData('activities', event.target.value)}
                            aria-invalid={!!activityError}
                            aria-describedby={activityError ? 'event-activities-help event-activities-error' : 'event-activities-help'}
                        />
                        <p id="event-activities-help" className="text-xs text-[#c6bad9]">
                            Oddziel aktywności przecinkami.
                        </p>
                        <InputError id="event-activities-error" message={activityError} />
                    </div>

                <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                    <Link href="/events" className="rounded-md border border-[#4a3c62] px-3 py-2 text-sm font-semibold text-[#e8d8ff] hover:bg-[#302643]">Anuluj</Link>
                    <Button type="submit" disabled={form.processing} className="bg-[#ddc5ff] font-bold text-[#241738] hover:bg-[#ebdbff]">
                        {form.processing ? 'Zapisywanie…' : 'Utwórz wydarzenie'}
                    </Button>
                </div>
                    </section>
                    <section aria-labelledby="event-terms" className="min-w-0 space-y-3 rounded-2xl border border-[#322b48] bg-[#1c192e] p-5">
                        <h2 id="event-terms" className="text-lg font-bold">Proponowane terminy</h2>
                        <InputError message={errors.terms} />
                        {form.data.terms.map((term, index) => (
                            <fieldset key={term.id} className="min-w-0 border-b border-[#322b48] pb-3">
                                <legend className="mb-1 rounded-full bg-[#322743] px-2 py-1 text-xs font-semibold text-[#ddc5ff]">
                                    Termin {index + 1}
                                </legend>
                                <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-start gap-2">
                                    {termFields.map(({ name, label, type }) => {
                                        const id = `term-${term.id}-${name}`;
                                        const error = errors[`terms.${index}.${name}`];
                                        return (
                                            <div key={name} className={type === "date" ? "col-span-full space-y-1" : "min-w-0 space-y-1"}>
                                                <Label htmlFor={id}>{label}</Label>
                                                <Input
                                                    id={id}
                                                    type={type} className="border-[#3b3152] bg-[#151225] dark:bg-[#151225]"
                                                    value={term[name]}
                                                    min={type === 'date' ? localToday() : undefined}
                                                    required
                                                    aria-invalid={!!error}
                                                    aria-describedby={error ? `${id}-error` : undefined}
                                                    onInput={(event) => {
                                                        const value = event.currentTarget.value;
                                                        form.setData((current) => ({
                                                            ...current,
                                                            terms: current.terms.map((item) =>
                                                                item.id === term.id ? { ...item, [name]: value } : item,
                                                            ),
                                                        }));
                                                    }}
                                                />
                                                <InputError id={`${id}-error`} message={error} />
                                            </div>
                                        );
                                    })}
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="mt-5 text-[#ddc5ff] hover:bg-[#302643]"
                                        disabled={form.data.terms.length === 1}
                                        aria-label={`Usuń termin ${index + 1}`}
                                        onClick={() => {
                                            form.clearErrors();
                                            form.setData((current) => ({
                                                ...current,
                                                terms: current.terms.filter((item) => item.id !== term.id),
                                            }));
                                        }}
                                    >
                                        <Trash2 aria-hidden="true" />
                                    </Button>
                                </div>
                            </fieldset>
                        ))}

                        <Button
                            type="button"
                            variant="outline" className="ml-auto flex border-[#4a3c62] bg-[#251e39] text-[#e8d8ff] hover:bg-[#302643] dark:border-[#4a3c62] dark:bg-[#251e39]"
                            onClick={() => {
                                const term = emptyTerm(nextTermId.current++);
                                form.setData((current) => ({
                                    ...current,
                                    terms: [...current.terms, term],
                                }));
                            }}
                        >
                            <Plus aria-hidden="true" />
                            Dodaj termin
                        </Button>
                    </section>
                </fieldset>


            </form>
            </main>
        </div>
    );
}

CreateEvent.layout = [] as [];



