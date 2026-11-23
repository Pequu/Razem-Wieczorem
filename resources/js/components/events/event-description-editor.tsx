import { useForm } from '@inertiajs/react';
import { LoaderCircle, Pencil, Save } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const secondary = 'border-[#4a3c62] bg-[#251e39] text-[#e8d8ff] hover:bg-[#302643]';

export default function EventDescriptionEditor({ description, updateUrl }: { description?: string | null; updateUrl?: string | null }) {
    const [editing, setEditing] = useState(false);
    const form = useForm({ description: description ?? '' });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!updateUrl || form.processing) return;
        form.transform((data) => ({ description: data.description.trim() || null }));
        form.patch(updateUrl, { preserveScroll: true, onSuccess: () => setEditing(false) });
    }

    function cancel() {
        form.clearErrors();
        form.setData('description', description ?? '');
        setEditing(false);
    }

    return (
        <div className="space-y-4">
            {editing ? (
                <form onSubmit={submit} aria-busy={form.processing} className="space-y-3">
                    <Label htmlFor="edit-event-description">Opis wydarzenia</Label>
                    <textarea id="edit-event-description" autoFocus rows={5} maxLength={2000} value={form.data.description} disabled={form.processing}
                        onChange={(event) => form.setData('description', event.currentTarget.value)}
                        aria-invalid={!!form.errors.description} aria-describedby="description-edit-help description-edit-error"
                        className="w-full rounded-xl border border-[#4a3c62] bg-[#151225] px-3 py-3 text-sm leading-relaxed text-[#f6f1ff] focus-visible:ring-2 focus-visible:ring-[#ddc5ff] focus-visible:outline-none disabled:opacity-60" />
                    <div id="description-edit-help" className="flex flex-wrap justify-between gap-2 text-xs text-[#c6bad9]"><p>Opis jest opcjonalny. Możesz również go usunąć.</p><span>{form.data.description.length}/2000</span></div>
                    <InputError id="description-edit-error" message={form.errors.description} />
                    {!updateUrl && <p className="text-sm text-[#c6bad9]">Zapisywanie zmian nie jest jeszcze dostępne.</p>}
                    <div className="flex flex-wrap justify-end gap-2">
                        <Button type="button" variant="outline" disabled={form.processing} className={secondary} onClick={cancel}>Anuluj</Button>
                        <Button type="submit" disabled={!updateUrl || form.processing} className="bg-[#ddc5ff] font-bold text-[#241738] hover:bg-[#ebdbff]">{form.processing ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <Save aria-hidden="true" />}{form.processing ? 'Zapisywanie…' : 'Zapisz opis'}</Button>
                    </div>
                </form>
            ) : (
                <>
                    <p className="text-sm leading-relaxed break-words whitespace-pre-wrap text-[#d1c4e3]">{description?.trim() || 'Nie dodano jeszcze opisu wydarzenia.'}</p>
                    <Button type="button" variant="outline" className={secondary} onClick={() => { form.clearErrors(); form.setData('description', description ?? ''); setEditing(true); }}><Pencil aria-hidden="true" />Edytuj opis</Button>
                </>
            )}
            {form.recentlySuccessful && <p role="status" className="text-sm text-[#a6e6cd]">Opis został zapisany.</p>}
        </div>
    );
}
