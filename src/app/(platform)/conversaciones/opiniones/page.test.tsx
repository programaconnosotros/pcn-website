import { screen, within } from '@testing-library/react';
import { technologyTimelines } from '@/data/opiniones-tecnologia';
import { renderInPlatform } from '@/test/platform';
import OpinionsPage, { metadata } from './page';

describe('/conversaciones/opiniones', () => {
  it('draws one timeline per technology with its stances and conversation links', () => {
    renderInPlatform(<OpinionsPage />);
    expect(metadata.description).toMatch(/el grupo/);

    const [first] = technologyTimelines;
    const nav = screen.getByRole('navigation', { name: 'Tecnologías' });
    expect(within(nav).getByRole('link', { name: first.name })).toHaveAttribute(
      'href',
      `#${first.slug}`,
    );
    const section = screen.getByRole('region', { name: first.name });
    expect(within(section).getAllByRole('listitem')).toHaveLength(first.opinions.length);
    expect(
      within(section).getAllByRole('link', { name: `#${first.opinions[0].conversation.hash}` })[0],
    ).toHaveAttribute('href', first.opinions[0].conversation.href);
    expect(screen.getAllByRole('region')).toHaveLength(technologyTimelines.length);
  });

  it('has its own share preview, not the conversations one', () => {
    expect(metadata.openGraph).toMatchObject({
      title: 'Qué opina la comunidad de cada tecnología | programaConNosotros',
      url: expect.stringMatching(/\/conversaciones\/opiniones$/),
    });
    expect(metadata.openGraph?.title).not.toMatch(/Conversaciones/);
    expect(metadata.twitter).toMatchObject({ card: 'summary_large_image' });
    expect(metadata.twitter?.description).toBe(metadata.openGraph?.description);
  });
});
