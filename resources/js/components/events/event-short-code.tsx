import { Check, Copy } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function EventShortCode({ code, id }: { code?: string | null; id: string }) {
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
        <div className="space-y-3 rounded-xl border border-[#5b427a] bg-[#251e39] p-4">
            <Label htmlFor={code ? id : undefined}>Krótki kod zaproszenia</Label>
            {code ? (
                <>
                    <Input ref={input} id={id} readOnly value={code} onFocus={(event) => event.currentTarget.select()} aria-describedby={`${id}-help ${id}-status`} className="h-12 min-w-0 border-[#5b427a] bg-[#151225] font-mono text-xl tracking-[0.25em] text-[#f6f1ff] dark:bg-[#151225]" />
                    <Button type="button" disabled={status === 'copying'} onClick={() => void copyCode()} className="w-full bg-[#ddc5ff] font-bold text-[#241738] hover:bg-[#ebdbff]">
                        {status === 'copied' ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
                        {status === 'copied' ? 'Skopiowano kod' : status === 'copying' ? 'Kopiowanie…' : 'Kopiuj kod'}
                    </Button>
                    <p id={`${id}-help`} className="text-xs leading-relaxed text-[#c6bad9]">Znajomi mogą wpisać kod na stronie „Moje wydarzenia” w sekcji „Dołącz kodem”.</p>
                    <p id={`${id}-status`} role="status" className="text-xs leading-relaxed text-[#e8d8ff]">
                        {status === 'copied' && 'Kod skopiowany do schowka.'}
                        {status === 'error' && 'Nie udało się skopiować automatycznie. Zaznacz kod i skopiuj ręcznie.'}
                    </p>
                </>
            ) : <p className="text-sm text-[#c6bad9]">Krótki kod nie jest dostępny dla tego wydarzenia. Użyj linku zaproszeniowego.</p>}
        </div>
    );
}
