import { useForm } from '@inertiajs/react';
import { Check, Clock3, HelpCircle, LoaderCircle, Save, X } from 'lucide-react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';

export type AvailabilityResponse = 'available' | 'unavailable' | 'maybe';
export type VotingTerm = {
    id: number; date: string; starts_at: string; ends_at: string;
    my_response?: AvailabilityResponse | null;
};
const choices = [
    { value: 'available', label: 'Pasuje mi', icon: Check },
    { value: 'unavailable', label: 'Nie pasuje', icon: X },
    { value: 'maybe', label: 'Może', icon: HelpCircle },
] as const;

function dateLabel(value: string) {
    const date = new Date(`${value}T12:00:00`);
    return Number.isNaN(date.getTime()) ? 'Data nieustalona' : new Intl.DateTimeFormat('pl-PL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}

export default function EventTermVoting({ terms, canParticipate, isOpen, saveUrl }: {
    terms: VotingTerm[]; canParticipate: boolean; isOpen: boolean; saveUrl?: string | null;
}) {
    const savedResponses = () => Object.fromEntries(terms.filter((term) => term.my_response).map((term) => [String(term.id), term.my_response])) as Record<string, AvailabilityResponse>;
    const form = useForm({ responses: savedResponses() });
    const errors = form.errors as Record<string, string | undefined>;
    const submittedTerms = terms.filter((term) => form.data.responses[String(term.id)]);
    const canVote = canParticipate && isOpen;

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!canVote || !saveUrl || form.processing || !form.isDirty) return;
        form.transform(({ responses }) => ({
            availabilities: terms.filter((term) => responses[String(term.id)]).map((term) => ({ term_id: term.id, response: responses[String(term.id)] })),
        }));
        form.patch(saveUrl, { preserveScroll: true, onSuccess: () => { form.setDefaults({ responses: { ...form.data.responses } }); } });
    }

    if (!terms.length) return <p className="rounded-xl border border-dashed border-[#4a3c62] p-4 text-sm text-[#c6bad9]">Nie ma jeszcze propozycji terminów.</p>;

    return (
        <form onSubmit={submit} aria-busy={form.processing} className="space-y-4">
            {canVote && <p className="text-sm leading-relaxed text-[#c6bad9]">Zaznacz, które terminy Ci odpowiadają. Możesz wybrać kilka pasujących terminów i później zmienić swoje odpowiedzi.</p>}
            <div className="space-y-3">
                {terms.map((term) => {
                    const id = String(term.id), response = form.data.responses[id];
                    const submittedIndex = submittedTerms.findIndex((item) => item.id === term.id);
                    const error = errors[`availabilities.${submittedIndex}.response`] ?? errors[`availabilities.${submittedIndex}.term_id`];
                    return (
                        <fieldset key={term.id} disabled={!canVote || form.processing} aria-describedby={error ? `term-vote-${id}-error` : undefined} className="min-w-0 rounded-xl border border-[#3b3152] bg-[#151225] p-4">
                            <legend className="max-w-full px-2 text-sm font-semibold">{dateLabel(term.date)}</legend>
                            <p className="mb-4 flex items-center gap-2 text-sm text-[#c6bad9]"><Clock3 size={14} aria-hidden="true" />{term.starts_at.slice(0, 5)}–{term.ends_at.slice(0, 5)}</p>
                            {canParticipate ? (
                                <div className="grid gap-2 sm:grid-cols-3">
                                    {choices.map(({ value, label, icon: Icon }) => (
                                        <label key={value} className={`relative flex min-h-11 items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${response === value ? 'border-[#b58bdc] bg-[#352748] text-[#f0e3ff]' : 'border-[#3b3152] text-[#c6bad9]'} ${canVote && !form.processing ? 'cursor-pointer hover:bg-[#302643]' : 'cursor-default'}`}>
                                            <input type="radio" name={`availability-${term.id}`} value={value} checked={response === value} className="size-4 shrink-0 accent-[#ddc5ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ddc5ff]" onChange={() => { form.clearErrors(); form.setData((current) => ({ responses: { ...current.responses, [id]: value } })); }} />
                                            <Icon size={14} aria-hidden="true" className="shrink-0" />{label}
                                        </label>
                                    ))}
                                </div>
                            ) : <p className="text-xs text-[#c6bad9]">Dołącz do wydarzenia, aby wskazać swoją dostępność.</p>}
                            {canParticipate && !response && <p className="mt-3 text-xs text-[#c6bad9]">Nie zaznaczono odpowiedzi.</p>}
                            <InputError id={`term-vote-${id}-error`} message={error} />
                        </fieldset>
                    );
                })}
            </div>
            <InputError message={errors.availabilities ?? errors.responses} />
            {canParticipate && !isOpen && <p className="text-sm text-[#c6bad9]">Głosowanie nie jest otwarte. Odpowiedzi można zmieniać po jego otwarciu.</p>}
            {canVote && (
                <div className="space-y-3 border-t border-[#322b48] pt-4">
                    {!saveUrl && <p className="text-sm text-[#c6bad9]">Zapis odpowiedzi nie jest jeszcze dostępny. Zaznaczenia nie zostaną zachowane po opuszczeniu strony.</p>}
                    <div role="status" className="text-sm text-[#c6bad9]">{form.isDirty ? 'Masz niezapisane zmiany.' : form.recentlySuccessful ? 'Twoje odpowiedzi zostały zapisane.' : ''}</div>
                    <div className="flex flex-wrap justify-end gap-2">
                        <Button type="button" variant="outline" disabled={form.processing || !form.isDirty} className="border-[#4a3c62] bg-[#251e39] text-[#e8d8ff] hover:bg-[#302643]" onClick={() => { const responses = savedResponses(); form.setData({ responses }); form.setDefaults({ responses }); form.clearErrors(); }}>Anuluj zmiany</Button>
                        <Button type="submit" disabled={!saveUrl || form.processing || !form.isDirty} className="bg-[#ddc5ff] font-bold text-[#241738] hover:bg-[#ebdbff]">{form.processing ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : <Save aria-hidden="true" />}{form.processing ? 'Zapisywanie…' : 'Zapisz odpowiedzi'}</Button>
                    </div>
                </div>
            )}
        </form>
    );
}
