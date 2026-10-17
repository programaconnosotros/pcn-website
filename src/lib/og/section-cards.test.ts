import { changelog } from '@/data/changelog';
import { conversations } from '@/data/whatsapp-conversations';
import { renderTerminalCard } from './terminal-card';
import { renderSectionCard, sectionCardAlt } from './section-cards';

jest.mock('./terminal-card', () => ({ renderTerminalCard: jest.fn(async () => 'card') }));

const rendered = async (key: Parameters<typeof renderSectionCard>[0]) => {
  await renderSectionCard(key);
  return jest.mocked(renderTerminalCard).mock.calls.at(-1)![0];
};

describe('sectionCardAlt', () => {
  it('names the section and the community', () => {
    expect(sectionCardAlt('eventos')).toBe('Eventos · programaConNosotros');
    expect(sectionCardAlt('inicio')).toBe('programaConNosotros · programaConNosotros');
  });
});

describe('renderSectionCard', () => {
  it('renders the home card at the root path', async () => {
    const card = await rendered('inicio');
    expect(card).toMatchObject({ path: '', command: 'whoami', title: 'programaConNosotros' });
    expect(card.meta).toEqual(['500+ miembros', '50+ charlas', '20+ eventos']);
  });

  it('uses the section key as the path', async () => {
    expect(await renderSectionCard('galeria')).toBe('card');
    expect(renderTerminalCard).toHaveBeenCalledWith(
      expect.objectContaining({ path: 'galeria', title: 'Galería' }),
    );
  });

  it('counts only changelog entries for everyone', async () => {
    const publicEntries = changelog.filter((entry) => entry.audience !== 'admins').length;
    expect((await rendered('changelog')).meta).toEqual([`${publicEntries} cambios`]);
  });

  it('counts the conversations', async () => {
    expect((await rendered('conversaciones')).meta).toEqual([
      `${conversations.length} conversaciones`,
    ]);
  });

  it('shows the total of interview questions', async () => {
    const [questions] = (await rendered('entrevistas')).meta!;
    expect(questions).toMatch(/^\d+ preguntas$/);
    expect(Number.parseInt(questions)).toBeGreaterThan(0);
  });

  it.each(['especialidades', 'music'] as const)('shows a count for %s', async (key) => {
    expect((await rendered(key)).meta![0]).toMatch(/^\d+ /);
  });

  it('takes the meta of the sections counted in the database from their route', async () => {
    expect((await rendered('videos')).meta).toEqual(['recomendados por la comunidad']);
    await renderSectionCard('cursos', ['13 cursos', 'gratis']);
    expect(jest.mocked(renderTerminalCard).mock.calls.at(-1)![0]).toMatchObject({
      path: 'cursos',
      title: 'Cursos',
      meta: ['13 cursos', 'gratis'],
    });
  });
});
