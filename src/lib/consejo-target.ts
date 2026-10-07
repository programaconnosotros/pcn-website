import { findExtractedConsejo, EXTRACTED_ID_PREFIX } from '@/data/consejos-extraidos';

/**
 * Where a like or comment on consejo `id` points: the Advice row of a published consejo, or the
 * `auto-` id of one extracted from the conversations. Throws for an extracted id that doesn't
 * exist, so nobody can pile likes on made-up ids.
 */
export const consejoTarget = (id: string): { adviceId: string } | { extractedId: string } => {
  if (!id.startsWith(EXTRACTED_ID_PREFIX)) return { adviceId: id };
  if (!findExtractedConsejo(id)) throw new Error('Consejo no encontrado');
  return { extractedId: id };
};
