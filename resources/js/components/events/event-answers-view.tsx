import { Link, useForm } from '@inertiajs/react';
import { LoaderCircle, Plus } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import EventActivityForm from '@/components/events/event-activity-form';
import EventScreen from '@/components/events/event-screen';
import { Button } from '@/components/ui/button';
import type { EventDetailsData } from '@/pages/events/show';
import { eventDate, eventPanel, eventPrimary, eventSecondary, eventViewUrl } from '@/lib/event-workspace';
import type { ActivityOption } from '@/lib/event-workspace';
import type { AvailabilityResponse } from '@/components/events/event-term-voting';

const choices = [
    { value: 'available', label: 'Pasuje', selected: 'border-[#30715a] bg-[#164333] text-[#b6f2d6]' },
    { value: 'maybe', label: 'Może pasować', selected: 'border-[#916b30] bg-[#59401e] text-[#ffe0a3]' },
    { value: 'unavailable', label: 'Nie pasuje', selected: 'border-[#8b526a] bg-[#492c3b] text-[#ffd0e1]' },
] as const;

export default function EventAnswersView({ event, availabilityUrl, answersUrl, addActivityUrl, activityOptions }: {
    event: EventDetailsData; availabilityUrl?: string | null; answersUrl?: string | null; addActivityUrl?: string | null; activityOptions?: ActivityOption[];
}) {
    const terms = event.terms ?? [];
    const options = activityOptions;
    const initialResponses = Object.fromEntries(terms.filter((term) => term.my_response).map((term) => [String(term.id), term.my_response])) as Record<string, AvailabilityResponse>;
    const initialActivities = options?.filter((option) => option.my_vote === true).map((option) => option.id) ?? [];
    const form = useForm({ responses: initialResponses, activity_ids: initialActivities });
    const [adding, setAdding] = useState(false);
    const open = event.voting_status === 'open' && (event.role === 'organizer' || event.role === 'member');
    const combinedReady = Boolean(answersUrl && options && options.every((option) => typeof option.my_vote === 'boolean'));
    const canChooseActivities = open && combinedReady;
    const targetUrl = combinedReady ? answersUrl : availabilityUrl;
    const errors = form.errors as Record<string, string | undefined>;
    const answeredTerms = terms.filter((term) => form.data.responses[String(term.id)]);

    function submit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const url = targetUrl;
        if (!open || !url || form.processing || !form.isDirty) return;
        if (!combinedReady && answeredTerms.length === 0) return;
        form.transform(({ responses, activity_ids }) => {
            const availabilities = terms.filter((term) => responses[String(term.id)]).map((term) => ({ term_id: term.id, response: responses[String(term.id)] }));
            return combinedReady ? { availabilities, activity_ids } : { availabilities };
        });
        form.patch(url, { preserveScroll: true, preserveUrl: true, onSuccess: () => form.setDefaults({ responses: { ...form.data.responses }, activity_ids: [...form.data.activity_ids] }) });
    }

    return (
        <EventScreen event={event} active="answers" eyebrow="Twoje odpowiedzi" description="Określ swoją dostępność i wybierz akceptowane aktywności.">
            <form onSubmit={submit} aria-busy={form.processing}>
                <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                    <section aria-labelledby="answers-availability" className={eventPanel}>
                        <h2 id="answers-availability" className="mb-4 text-lg font-bold">Twoja dostępność</h2>
                        {terms.length ? <div className="divide-y divide-[#322b48]">{terms.map((term) => {
                            const selected = form.data.responses[String(term.id)];
                            const index = answeredTerms.findIndex((item) => item.id === term.id);
                            return <fieldset key={term.id} disabled={!open || form.processing} className="min-w-0 py-4 first:pt-0 last:pb-0">
                                <legend className="sr-only">Dostępność: {eventDate(term.date)}, {term.starts_at}–{term.ends_at}</legend>
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div><p className="text-sm font-semibold">{eventDate(term.date)}</p><p className="mt-1 text-xs text-[#c6bad9]">{term.starts_at.slice(0, 5)}–{term.ends_at.slice(0, 5)}</p></div>
                                    <div className="flex flex-wrap gap-1.5">{choices.map((choice) => <label key={choice.value} className="relative cursor-pointer">
                                        <input type="radio" name={`answer-term-${term.id}`} value={choice.value} checked={selected === choice.value} className="peer sr-only" onChange={() => { form.clearErrors(); form.setData((current) => ({ ...current, responses: { ...current.responses, [String(term.id)]: choice.value } })); }} />
                                        <span className={`flex min-h-9 items-center rounded-full border px-3 py-1.5 text-xs font-semibold peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#ddc5ff] peer-disabled:cursor-default ${selected === choice.value ? choice.selected : 'border-[#4a3c62] bg-[#251e39] text-[#d1c4e3]'}`}>{choice.label}</span>
                                    </label>)}</div>
                                </div>
                                {!selected && <p className="mt-2 text-right text-xs text-[#9f91b6]">Brak odpowiedzi</p>}
                                <InputError message={errors[`availabilities.${index}.response`] ?? errors[`availabilities.${index}.term_id`]} />
                            </fieldset>;
                        })}</div> : <p className="text-sm text-[#c6bad9]">Nie dodano jeszcze terminów.</p>}
                    </section>
                    <section aria-labelledby="answers-activities" className={eventPanel}>
                        <h2 id="answers-activities" className="mb-4 text-lg font-bold">Akceptowane aktywności</h2>
                        <p className="mb-3 text-xs text-[#c6bad9]">Możesz zaakceptować więcej niż jedną aktywność.</p>
                        {options ? <div className="divide-y divide-[#322b48]">{options.map((option) => <label key={option.id} className="flex min-h-12 items-center gap-3 py-3 text-sm">
                            <input type="checkbox" value={option.id} checked={form.data.activity_ids.includes(option.id)} disabled={!canChooseActivities || form.processing} className="size-4 shrink-0 accent-[#ddc5ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ddc5ff]" onChange={(e) => { const checked = e.currentTarget.checked; form.setData((current) => ({ ...current, activity_ids: checked ? [...current.activity_ids, option.id] : current.activity_ids.filter((id) => id !== option.id) })); }} />
                            <span className="min-w-0 break-words">{option.name}</span>
                        </label>)}{options.length === 0 && <p className="text-sm text-[#c6bad9]">Brak propozycji aktywności.</p>}</div>
                            : <ul className="divide-y divide-[#322b48]">{(event.activities ?? []).map((name, index) => <li key={`${index}-${name}`} className="py-3 text-sm break-words">{name}</li>)}{!event.activities?.length && <li className="text-sm text-[#c6bad9]">Brak propozycji aktywności.</li>}</ul>}
                        {!canChooseActivities && open && <p className="mt-3 text-xs leading-relaxed text-[#c6bad9]">Akceptowanie aktywności nie jest jeszcze dostępne. Możesz zapisać swoją dostępność dla terminów.</p>}
                        <InputError message={errors.activity_ids} />
                        {Object.entries(errors).filter(([name]) => name.startsWith('activity_ids.')).map(([name, message]) => <InputError key={name} message={message} />)}
                        {open && <div className="mt-4 flex justify-end"><Button type="button" variant="outline" className={eventSecondary} aria-expanded={adding} aria-controls="activity-proposal-form" onClick={() => setAdding(!adding)}><Plus size={15} aria-hidden="true" />{adding ? 'Ukryj formularz' : 'Dodaj propozycję'}</Button></div>}
                    </section>
                </div>
                <InputError message={errors.availabilities} className="mt-3" />
                {!open && <p className="mt-4 text-sm text-[#c6bad9]">Odpowiedzi można zmieniać podczas otwartego głosowania.</p>}
                {open && !targetUrl && <p className="mt-4 text-sm text-[#c6bad9]">Zapis odpowiedzi nie jest jeszcze dostępny.</p>}
                <div role="status" className="mt-3 text-sm text-[#c6bad9]">{form.isDirty ? 'Masz niezapisane zmiany.' : form.recentlySuccessful ? 'Odpowiedzi zostały zapisane.' : ''}</div>
                <div className="mt-5 flex flex-wrap justify-end gap-2">
                    <Link href={eventViewUrl(event.id, 'results')} className={`rounded-md border px-4 py-2 text-sm font-semibold ${eventSecondary}`}>Zobacz wyniki</Link>
                    <Button type="submit" disabled={!open || !targetUrl || !form.isDirty || form.processing} className={eventPrimary}>{form.processing && <LoaderCircle className="animate-spin" aria-hidden="true" />}{form.processing ? 'Zapisywanie…' : 'Zapisz odpowiedzi'}</Button>
                </div>
            </form>
            {adding && open && <section id="activity-proposal-form" aria-label="Dodaj propozycję aktywności" className={`${eventPanel} mt-4`}><EventActivityForm existingActivities={event.activities ?? []} storeUrl={addActivityUrl} isOpen={open} /></section>}
        </EventScreen>
    );
}
