import prisma from '@/lib/prisma';
import { isEmbeddable } from '@/lib/embeddable';
import { GET } from '@/app/api/proyectos/embed/route';

// Si el sitio de un proyecto se puede mostrar en un iframe: la URL sale de la base, nunca del
// request. La consulta al sitio externo se reemplaza.

jest.mock('@/lib/embeddable', () => ({
  EMBED_CACHE_HEADERS: { 'Cache-Control': 'public, max-age=3600' },
  isEmbeddable: jest.fn().mockResolvedValue(true),
}));

const check = (query: string) => GET(new Request(`https://pcn.test/api/proyectos/embed${query}`));

it("checks the project's own URL from the database", async () => {
  const project = await prisma.project.create({
    data: {
      title: 'Proyecto',
      description: 'Un proyecto',
      url: 'https://proyecto-embebible.test',
      logoUrl: '/logo.png',
      techStack: [],
    },
  });

  const response = await check(`?id=${project.id}&url=http://169.254.169.254/`);

  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ embeddable: true });
  expect(isEmbeddable).toHaveBeenCalledWith('https://proyecto-embebible.test');
});

it('answers 400 without id and 404 for unknown projects', async () => {
  expect((await check('')).status).toBe(400);
  expect((await check('?id=no-existe')).status).toBe(404);
  expect(isEmbeddable).not.toHaveBeenCalled();
});
