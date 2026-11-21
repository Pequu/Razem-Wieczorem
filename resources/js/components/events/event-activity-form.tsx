import { useForm } from '@inertiajs/react';
import { Lightbulb, LoaderCircle, Plus } from 'lucide-react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const normalize = (name: string) => name.trim().replace(/\s+/g, ' ').toLocaleLowerCase('pl-PL');

export default function EventActivityForm({ existingActivities, storeUrl, isOpen }: {
    existingActivities: string[]; storeUrl?: string | null; isOpen: boolean;
}) {
    const form = useForm({ name: '' });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (form.processing || !isOpen) return;
        form.clearErrors();
        if (!form.data.name.trim()) { form.setError('name', 'Wpisz swój pomysł na aktywność.'); return; }
        if (existingActivities.some((name) => normalize(name) === normalize(form.data.name))) {
            form.setError('name', 'Ten pomysł jest już na liście.'); return;
        }
        if (!storeUrl) return;
        form.transform(({ name }) => ({ name: name.trim().replace(/\s+/g, ' ') }));
        form.post(storeUrl, { preserveScroll: true, onSuccess: () => form.reset() });
    }

    return (
        <div className="mt-5 border-t border-[#322b48] pt-5">
            {isOpen ? (
                <form onSubmit={submit} aria-busy={form.processing} className="space-y-3">
                    <h3 className="flex items-center gap-2 font-semibold"><Lightbulb size={17} aria-hidden="true" className="text-[#ddc5ff]" />Masz inny pomysł?</h3>
                    <Label htmlFor="new-activity">Twoja propozycja aktywności</Label>
                    <Input id="new-activity" value={form.data.name} disabled={form.processing} onChange={(e) => form.setData('name', e.currentTarget.value)} placeholder="Np. wspólne gotowanie" required maxLength={255} aria-invalid={!!form.errors.name} aria-describedby="new-activity-help new-activity-error" className="border-[#4a3c62] bg-[#151225] dark:bg-[#151225]" />
                    <p id="new-activity-help" className="text-xs text-[#c6bad9]">Dodaj jeden pomysł — zobaczą go pozostali uczestnicy wydarzenia.</p>
                    <InputError id="new-activity-error" message={form.errors.name} />
                    {!storeUrl && <p className="text-sm text-[#c6bad9]">Dodawanie pomysłów nie jest jeszcze dostępne.</p>}
                    <div className="flex justify-end"><Button type="submit" disabled={!storeUrl || form.processing || !form.data.name.trim()} className="bg-[#ddc5ff] font-bold text-[#241738] hover:bg-[#ebdbff]">{form.processing ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <Plus aria-hidden="true" />}{form.processing ? 'Dodawanie…' : 'Dodaj pomysł'}</Button></div>
                    {form.recentlySuccessful && <p role="status" className="text-sm text-[#a6e6cd]">Twój pomysł został dodany.</p>}
                </form>
            ) : <p className="text-sm text-[#c6bad9]">Dodawanie nowych pomysłów będzie dostępne po otwarciu głosowania.</p>}
        </div>
    );
}
