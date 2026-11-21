import { useForm } from '@inertiajs/react';
import { LoaderCircle, Plus, Save, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Term = { date: string; starts_at: string; ends_at: string };
const emptyTerm = (id: number) => ({ id, date: '', starts_at: '', ends_at: '' });
const fields = [{ name: 'date', label: 'Data', type: 'date' }, { name: 'starts_at', label: 'Od', type: 'time' }, { name: 'ends_at', label: 'Do', type: 'time' }] as const;
const secondary = 'border-[#4a3c62] bg-[#251e39] text-[#e8d8ff] hover:bg-[#302643]';
function today() {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
const signature = (term: Term) => `${term.date}|${term.starts_at.slice(0, 5)}|${term.ends_at.slice(0, 5)}`;

export default function EventTermsEditor({ existingTerms, storeUrl }: { existingTerms: Term[]; storeUrl?: string | null }) {
    const [editing, setEditing] = useState(false);
    const nextId = useRef(1);
    const form = useForm({ terms: [emptyTerm(0)] });
    const errors = form.errors as Record<string, string | undefined>;

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!storeUrl || form.processing) return;
        form.clearErrors();
        const seen = new Set(existingTerms.map(signature));
        for (const [index, term] of form.data.terms.entries()) {
            if (!term.date || term.date < today()) {
                form.setError(`terms.${index}.date`, 'Wybierz dzisiejszą lub przyszłą datę.'); return;
            }
            if (!term.starts_at || !term.ends_at || term.ends_at <= term.starts_at) {
                form.setError(`terms.${index}.ends_at`, 'Podaj godziny. Zakończenie musi być późniejsze niż rozpoczęcie.'); return;
            }
            if (seen.has(signature(term))) {
                form.setError(`terms.${index}.date`, 'Taki termin jest już dodany.'); return;
            }
            seen.add(signature(term));
        }
        // Append new proposals only; do not replace existing terms.
        form.transform(({ terms }) => ({ terms: terms.map(({ date, starts_at, ends_at }) => ({ date, starts_at, ends_at })) }));
        form.post(storeUrl, { preserveScroll: true, onSuccess: () => { form.reset(); setEditing(false); } });
    }

    return (
        <div className="mt-5 border-t border-[#322b48] pt-5">
            {editing ? (
                <form onSubmit={submit} aria-busy={form.processing} className="space-y-4">
                    <h3 className="font-semibold">Nowe propozycje terminów</h3>
                    <p className="text-sm text-[#c6bad9]">Dodaj kolejne możliwości spotkania. Dotychczasowe terminy pozostają na liście.</p>
                    <InputError message={errors.terms} />
                    <fieldset disabled={form.processing} className="min-w-0 space-y-4">
                        {form.data.terms.map((term, index) => (
                            <fieldset key={term.id} className="min-w-0 rounded-xl border border-[#3b3152] bg-[#151225] p-4">
                                <legend className="px-2 text-xs font-semibold text-[#ddc5ff]">Nowy termin {index + 1}</legend>
                                <div className="grid min-w-0 grid-cols-2 gap-3">
                                    {fields.map(({ name, label, type }) => {
                                        const id = `new-term-${term.id}-${name}`;
                                        const error = errors[`terms.${index}.${name}`];
                                        return <div key={name} className={type === 'date' ? 'col-span-2 space-y-2' : 'min-w-0 space-y-2'}>
                                            <Label htmlFor={id}>{label}</Label>
                                            <Input id={id} type={type} value={term[name]} required min={type === 'date' ? today() : undefined} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined}
                                                className="min-w-0 border-[#4a3c62] bg-[#1c192e] dark:bg-[#1c192e]"
                                                onInput={(e) => { const value = e.currentTarget.value; form.setData((current) => ({ terms: current.terms.map((item) => item.id === term.id ? { ...item, [name]: value } : item) })); }} />
                                            <InputError id={`${id}-error`} message={error} />
                                        </div>;
                                    })}
                                </div>
                                {form.data.terms.length > 1 && <Button type="button" variant="ghost" className="mt-3 text-[#e8d8ff] hover:bg-[#302643]" aria-label={`Usuń nowy termin ${index + 1}`} onClick={() => { form.clearErrors(); form.setData((current) => ({ terms: current.terms.filter((item) => item.id !== term.id) })); }}><Trash2 aria-hidden="true" />Usuń propozycję</Button>}
                            </fieldset>
                        ))}
                        <Button type="button" variant="outline" className={secondary} onClick={() => { const term = emptyTerm(nextId.current++); form.setData((current) => ({ terms: [...current.terms, term] })); }}><Plus aria-hidden="true" />Kolejny termin</Button>
                    </fieldset>
                    {!storeUrl && <p className="text-sm text-[#c6bad9]">Zapisywanie nowych terminów nie jest jeszcze dostępne.</p>}
                    <div className="flex flex-wrap justify-end gap-2">
                        <Button type="button" variant="outline" disabled={form.processing} className={secondary} onClick={() => { form.reset(); form.clearErrors(); setEditing(false); }}>Anuluj</Button>
                        <Button type="submit" disabled={!storeUrl || form.processing} className="bg-[#ddc5ff] font-bold text-[#241738] hover:bg-[#ebdbff]">{form.processing ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <Save aria-hidden="true" />}{form.processing ? 'Zapisywanie…' : 'Zapisz nowe terminy'}</Button>
                    </div>
                </form>
            ) : <Button type="button" variant="outline" className={secondary} onClick={() => setEditing(true)}><Plus aria-hidden="true" />Dodaj terminy</Button>}
            {form.recentlySuccessful && <p role="status" className="mt-3 text-sm text-[#a6e6cd]">Nowe terminy zostały zapisane.</p>}
        </div>
    );
}
