import { Head, Link, useForm } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
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

export default function CreateEvent() {
    const nextTermId = useRef(1);
    const form = useForm({ name: '', description: '', activities: '', terms: [emptyTerm(0)] });
    const [saved, setSaved] = useState(false);
    const errors = form.errors as Record<string, string | undefined>;

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSaved(false);
        form.clearErrors();

        if (!form.data.name.trim()) {
            form.setError('name', 'Wpisz nazwę wydarzenia.');
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
                setSaved(true);
            },
        });
    }

    return (
        <div className="min-h-screen bg-[#121121] text-[#f6f1ff] [color-scheme:dark]">
            <header className="border-b border-[#29243d] bg-[#171526]">
                <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-2 px-6 py-4">
                    <Link href="/" className="flex items-center gap-2 font-bold">
                        <span aria-hidden="true" className="grid size-8 place-items-center rounded-xl bg-[#ddc5ff] text-[#201632]">✦</span>
                        Razem Wieczorem
                    </Link>
                    <Link href="/dashboard" className="text-sm font-semibold text-[#ddc5ff]">Moje wydarzenia</Link>
                    <span className="ml-auto text-sm text-[#c6bad9]">Organizator</span>
                </div>
            </header>
            <main className="mx-auto w-full max-w-6xl px-6 py-8 sm:py-10">
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
                            aria-invalid={!!errors.activities}
                            aria-describedby={errors.activities ? 'event-activities-help event-activities-error' : 'event-activities-help'}
                        />
                        <p id="event-activities-help" className="text-xs text-[#c6bad9]">
                            Oddziel aktywności przecinkami.
                        </p>
                        <InputError id="event-activities-error" message={errors.activities} />
                    </div>

                <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                    <Link href="/dashboard" className="rounded-md border border-[#4a3c62] px-3 py-2 text-sm font-semibold text-[#e8d8ff] hover:bg-[#302643]">Anuluj</Link>
                    <Button type="submit" disabled={form.processing} className="bg-[#ddc5ff] font-bold text-[#241738] hover:bg-[#ebdbff]">
                        {form.processing ? 'Zapisywanie…' : 'Utwórz wydarzenie'}
                    </Button>
                    <span role="status" className="basis-full text-right text-sm">{saved && 'Wydarzenie zostało utworzone.'}</span>
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
                                                    required
                                                    aria-invalid={!!error}
                                                    aria-describedby={error ? `${id}-error` : undefined}
                                                    onChange={(event) => {
                                                        const value = event.target.value;
                                                        form.setData('terms', form.data.terms.map((item) =>
                                                            item.id === term.id ? { ...item, [name]: value } : item,
                                                        ));
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
                                            form.setData('terms', form.data.terms.filter((item) => item.id !== term.id));
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
                                form.setData('terms', [...form.data.terms, emptyTerm(nextTermId.current++)]);
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

