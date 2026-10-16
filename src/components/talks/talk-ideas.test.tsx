import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { talkIdeas } from '@/data/talk-ideas';
import { SITE_ROUTES } from '@/lib/site-routes';
import { TalkIdeas } from './talk-ideas';

describe('TalkIdeas', () => {
  it('lists every idea, with the website as the example when it uses the technology', () => {
    render(<TalkIdeas />);

    expect(screen.getAllByRole('article')).toHaveLength(talkIdeas.length);
    const owasp = screen.getByText('OWASP Top 10 en una app real').closest('article')!;
    expect(within(owasp).getByText('seguridad')).toBeInTheDocument();
    expect(within(owasp).getByRole('link', { name: /cómo la web cubre el OWASP/ })).toHaveAttribute(
      'href',
      'https://github.com/programaconnosotros/pcn-website/blob/main/docs/seguridad-owasp.md',
    );
    // Pages of the site open in place
    const design = screen.getByText(/Diseño de sistemas visuales/).closest('article')!;
    expect(within(design).getByRole('link')).not.toHaveAttribute('target');
  });

  it('filters the ideas by area', async () => {
    render(<TalkIdeas />);

    await userEvent.click(screen.getByRole('button', { name: 'ia' }));

    const ia = talkIdeas.filter((idea) => idea.area === 'ia');
    expect(screen.getAllByRole('article')).toHaveLength(ia.length);
    expect(screen.getByRole('button', { name: 'ia' })).toHaveAttribute('aria-pressed', 'true');

    await userEvent.click(screen.getByRole('button', { name: 'todas' }));
    expect(screen.getAllByRole('article')).toHaveLength(talkIdeas.length);
  });

  it('links internal examples to pages that exist and the rest to the repo', () => {
    for (const { example } of talkIdeas) {
      if (!example) continue;
      if (example.href.startsWith('/')) {
        expect(SITE_ROUTES).toContain(example.href);
      } else {
        expect(example.href).toMatch(/^https:\/\/github\.com\/programaconnosotros\/pcn-website/);
      }
    }
  });
});
