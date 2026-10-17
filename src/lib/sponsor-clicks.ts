// Dónde puede estar el logo de un sponsor cuando alguien lo clickea.
export const SPONSOR_CLICK_SOURCES = ['inicio', 'partners', 'feed', 'evento'] as const;

export type SponsorClickSource = (typeof SPONSOR_CLICK_SOURCES)[number];

/** A site partner (no event) or one of an event's sponsors, by name. */
export type SponsorRef = { name: string; eventId?: string | null };
