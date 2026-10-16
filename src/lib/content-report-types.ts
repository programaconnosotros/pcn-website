// What can be reported and why, safe to import from client components (the report dialog).

export const REPORT_REASONS = {
  spam: 'Spam o publicidad',
  ofensivo: 'Ofensivo o inapropiado',
  acoso: 'Acoso o ataque a una persona',
  falso: 'Información falsa o engañosa',
  otro: 'Otro motivo',
} as const;

export type ReportReason = keyof typeof REPORT_REASONS;

export const REPORTABLE_LABELS = {
  forum_post: 'tema del foro',
  forum_comment: 'respuesta del foro',
  advice: 'consejo',
  advice_comment: 'comentario de un consejo',
  setup: 'setup',
  gallery_item: 'foto o video',
  project: 'proyecto',
  user: 'perfil',
} as const;

export type ReportableType = keyof typeof REPORTABLE_LABELS;

export const isReportableType = (value: string): value is ReportableType =>
  Object.hasOwn(REPORTABLE_LABELS, value);
