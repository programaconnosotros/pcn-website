import { extractedConsejos } from '@/data/consejos-extraidos';
import { cached } from '@/lib/cache';
import prisma from '@/lib/prisma';

/** Ids of the extracted consejos their member (or an admin) took off the site. Cached. */
export const listHiddenConsejoIds = cached(
  'hidden-consejos',
  async () =>
    (await prisma.hiddenConsejo.findMany({ select: { extractedId: true } })).map(
      ({ extractedId }) => extractedId,
    ),
  { models: ['HiddenConsejo'] },
);

/** The extracted consejos still on the site. */
export const visibleExtractedConsejos = async () => {
  const hidden = new Set(await listHiddenConsejoIds());
  return extractedConsejos.filter(({ id }) => !hidden.has(id));
};
