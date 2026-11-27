export type ActivityOption = { id: number; name: string; my_vote?: boolean | null };
export type TermResult = {
    term_id: number;
    available: number;
    maybe: number;
    unavailable: number;
    unanswered: number;
    activities: { proposal_id: number; name: string; votes: number }[];
};
export type EventNotice = { id: number; title: string; description?: string | null; created_at: string; is_read: boolean };
export type EventView = 'details' | 'answers' | 'results' | 'plan';

export function eventViewUrl(id: number, view: EventView, termId?: number, edit = false) {
    const query = new URLSearchParams({ view });
    if (termId !== undefined) query.set('term', String(termId));
    if (edit) query.set('edit', '1');
    return `/events/${id}?${query}`;
}

export function eventDate(value?: string | null) {
    if (!value) return 'Termin nieustalony';
    const date = new Date(`${value}T12:00:00`);
    return Number.isNaN(date.getTime()) ? 'Termin nieustalony' : new Intl.DateTimeFormat('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' }).format(date);
}

export const eventPanel = 'min-w-0 rounded-2xl border border-[#322b48] bg-[#1c192e] p-5 sm:p-6';
export const eventPrimary = 'bg-[#ddc5ff] font-bold text-[#241738] hover:bg-[#ebdbff]';
export const eventSecondary = 'border-[#4a3c62] bg-[#251e39] text-[#e8d8ff] hover:bg-[#302643]';
