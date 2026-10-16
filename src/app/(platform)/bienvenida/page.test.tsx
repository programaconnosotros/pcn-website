import { screen, within } from '@testing-library/react';
import { getCurrentSession } from '@/actions/auth/get-current-session';
import { getOnboardingSteps, onboardingSteps } from '@/lib/onboarding';
import { expectOnlyPlaceholders, renderPage, sessionRow, thrownBy } from '@/test/pages-m-z';
import Loading from './loading';
import WelcomePage, { metadata } from './page';

jest.mock('@/actions/auth/get-current-session', () => ({ getCurrentSession: jest.fn() }));
jest.mock('@/lib/prisma', () => ({ __esModule: true, default: {} }));
jest.mock('@/lib/onboarding', () => ({
  ...jest.requireActual('@/lib/onboarding'),
  getOnboardingSteps: jest.fn(),
}));

const facts = {
  hasPhoto: true,
  hasIntro: false,
  hasStack: false,
  events: 2,
  forumPosts: 0,
  advice: 0,
};

describe('/bienvenida', () => {
  it('stays out of search engines', () => {
    expect(metadata).toMatchObject({ title: 'bienvenida', robots: { index: false } });
  });

  it('sends visitors without a session to sign in first', async () => {
    jest.mocked(getCurrentSession).mockResolvedValue(null);
    expect(await thrownBy(() => WelcomePage())).toMatch(/NEXT_REDIRECT/);
  });

  it('greets by first name and checks off what the member already did', async () => {
    jest.mocked(getCurrentSession).mockResolvedValue(sessionRow({ name: 'Ana López' }));
    jest.mocked(getOnboardingSteps).mockResolvedValue(onboardingSteps(facts));

    await renderPage(WelcomePage());

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('¡Hola, Ana!');
    expect(screen.getByText('2/6 pasos')).toBeInTheDocument();
    const photo = screen.getByRole('heading', { name: 'Poné una foto' }).closest('article')!;
    expect(within(photo).getByText('(hecho)')).toBeInTheDocument();
    expect(within(photo).queryByRole('link')).not.toBeInTheDocument();
    const forum = screen
      .getByRole('heading', { name: 'Presentate en el foro' })
      .closest('article')!;
    expect(within(forum).getByRole('link', { name: 'abrirTema();' })).toHaveAttribute(
      'href',
      '/foro/nuevo',
    );
  });

  it('shows only placeholders while loading', () => {
    expectOnlyPlaceholders(<Loading />);
  });
});

describe('onboardingSteps', () => {
  it('marks each step from what the member did', () => {
    const done = onboardingSteps({
      hasPhoto: true,
      hasIntro: true,
      hasStack: true,
      events: 1,
      forumPosts: 1,
      advice: 1,
    });
    expect(done.every((step) => step.done)).toBe(true);
    expect(onboardingSteps({ ...facts, events: 0, hasPhoto: false }).some((s) => s.done)).toBe(
      false,
    );
  });
});
