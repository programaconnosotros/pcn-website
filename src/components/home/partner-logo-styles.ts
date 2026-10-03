/**
 * Shared look for partner logos (home marquee and /partners): a bright monochrome mark with a
 * faint green neon halo that switches to the logo's original colors, with a stronger glow, on
 * hover. Two variants because the hover target differs: the logo link itself in the marquee, the
 * whole partner cell (a `group`) on /partners.
 */
const PARTNER_LOGO_BASE =
  'transition-all duration-300 opacity-95 brightness-[1.6] contrast-125 drop-shadow-[0_0_6px_rgba(4,244,190,0.45)] grayscale';

export const partnerLogoHoverClassName = `${PARTNER_LOGO_BASE} hover:scale-105 hover:opacity-100 hover:brightness-110 hover:drop-shadow-[0_0_12px_rgba(4,244,190,0.85)] hover:grayscale-0`;

export const partnerLogoGroupHoverClassName = `${PARTNER_LOGO_BASE} group-hover:scale-105 group-hover:opacity-100 group-hover:brightness-110 group-hover:drop-shadow-[0_0_12px_rgba(4,244,190,0.85)] group-hover:grayscale-0 group-focus-visible:opacity-100 group-focus-visible:brightness-110 group-focus-visible:grayscale-0`;
