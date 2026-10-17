import type { Columns } from '@/lib/full-rows';

// Column counts of the profile's preview grids, matching their `grid-cols-*` classes, so the
// previews can hide what would leave a row half empty (FullRowsCell) and know when they did.
// A plain module: both the server page and the client grids read it.

/** `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` */
export const TALK_COLUMNS: Columns = { sm: 2, lg: 3 };
/** `grid-cols-1 2xl:grid-cols-2` */
export const ARTICLE_COLUMNS: Columns = { '2xl': 2 };
/** `grid-cols-1 sm:grid-cols-2 xl:grid-cols-3` */
export const SETUP_COLUMNS: Columns = { sm: 2, xl: 3 };
/** Upcoming events: `grid-cols-1 sm:grid-cols-2 xl:grid-cols-3` */
export const UPCOMING_EVENT_COLUMNS: Columns = { sm: 2, xl: 3 };
/** Past events: `grid-cols-2 md:grid-cols-3` */
export const PAST_EVENT_COLUMNS: Columns = { base: 2, md: 3 };
