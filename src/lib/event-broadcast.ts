/** Who a mail to an event's people goes to. */
export const BROADCAST_AUDIENCES = ['confirmados', 'lista-de-espera', 'todos'] as const;
export type BroadcastAudience = (typeof BROADCAST_AUDIENCES)[number];
