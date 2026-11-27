import { useForm } from '@inertiajs/react';
import { KeyRound, LoaderCircle, UserRoundPlus } from 'lucide-react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function EventCodeJoinForm({ lookupUrl }: { lookupUrl?: string | null }) {
    const form = useForm({ code: '' });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (form.processing) return;
        form.clearErrors();
        const code = form.data.code.trim();
        if (!/^[A-Za-z0-9]{6}$/.test(code)) {
            form.setError('code', 'Wpisz kod składający się z 6 liter lub cyfr.');
            return;
        }
        if (!lookupUrl) return;
        form.transform(() => ({ code }));
        form.post(lookupUrl, { preserveScroll: true });
    }

    return (
        <section aria-labelledby="join-by-code-heading" className="mt-6 rounded-2xl border border-[#5b427a] bg-[#211b32] p-5 sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex min-w-0 items-start gap-3 lg:max-w-sm">
                    <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#322743] text-[#ddc5ff]"><KeyRound size={21} /></span>
                    <div>
                        <h2 id="join-by-code-heading" className="text-lg font-bold">Masz kod zaproszenia?</h2>
                        <p className="mt-2 text-sm leading-relaxed text-[#c6bad9]">Wpisz krótki kod od organizatora. Otworzysz zaproszenie, w którym potwierdzisz dołączenie.</p>
                    </div>
                </div>
                <form onSubmit={submit} aria-busy={form.processing} className="w-full min-w-0 space-y-2 lg:max-w-md">
                    <Label htmlFor="event-short-code">Kod wydarzenia</Label>
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Input id="event-short-code" name="code" value={form.data.code} onChange={(event) => { form.setData('code', event.currentTarget.value); form.clearErrors('code'); }}
                            required minLength={6} maxLength={6} pattern="[A-Za-z0-9]{6}" autoCapitalize="none" autoCorrect="off" autoComplete="off" spellCheck={false}
                            placeholder="Wpisz 6 znaków" disabled={form.processing} aria-invalid={!!form.errors.code} aria-describedby="event-code-help event-code-error"
                            className="min-h-11 min-w-0 flex-1 border-[#4a3c62] bg-[#151225] font-mono text-base tracking-widest dark:bg-[#151225]" />
                        <Button type="submit" disabled={!lookupUrl || form.processing || !form.data.code.trim()} className="h-auto min-h-11 shrink-0 bg-[#ddc5ff] px-4 py-3 font-bold text-[#241738] hover:bg-[#ebdbff]">
                            {form.processing ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <UserRoundPlus aria-hidden="true" />}
                            {form.processing ? 'Sprawdzanie…' : 'Dołącz kodem'}
                        </Button>
                    </div>
                    <p id="event-code-help" className="text-xs leading-relaxed text-[#c6bad9]">Kod ma 6 znaków: litery lub cyfry. Wklej go albo przepisz od organizatora.</p>
                    <InputError id="event-code-error" message={form.errors.code} />
                    <p role="status" className="sr-only">{form.processing ? 'Trwa sprawdzanie kodu zaproszenia.' : ''}</p>
                </form>
            </div>
        </section>
    );
}
