import prisma from '@/lib/prisma';
import {
  createWorkPlace,
  deleteWorkPlace,
  updateWorkPlace,
} from '@/actions/work-places/work-places';
import { listWorkPlaces } from '@/lib/work-places';
import { actAs } from '@/test/db/fixtures';
import { createUser, uniqueId } from '@/test/db/content-fixtures';

// Lugares para laburar contra Postgres real: alta, edición, baja y el listado de /lugares.

describe('work places', () => {
  it('adds, lists, edits and deletes a place', async () => {
    const user = await createUser();
    await actAs(user.id);
    const name = `Café ${uniqueId()}`;

    const { id } = await createWorkPlace({
      name,
      city: 'Salta',
      wifi: 3,
      plugs: 2,
      calls: 4,
      foodQuality: null,
      foodVariety: null,
    });

    const listed = (await listWorkPlaces()).find((place) => place.id === id);
    expect(listed).toMatchObject({ name, city: 'Salta', author: { id: user.id } });

    await updateWorkPlace(id, {
      name,
      city: 'Salta',
      wifi: 5,
      plugs: 2,
      calls: 4,
      foodQuality: 4,
      foodVariety: 3,
    });
    expect(await prisma.workPlace.findUnique({ where: { id } })).toMatchObject({
      wifi: 5,
      foodQuality: 4,
    });

    await deleteWorkPlace(id);
    expect(await prisma.workPlace.findUnique({ where: { id } })).toBeNull();
  });
});
