import { screen, waitFor, within } from '@testing-library/react';
import { renderInPlatform as render } from '@/test/platform';
import userEvent from '@testing-library/user-event';
import {
  createJobOffer,
  deleteJobOffer,
  setJobOfferAvailable,
} from '@/actions/job-offers/job-offers';
import type { JobOfferWithAuthor } from '@/lib/job-offers';
import { applyHref } from '@/schemas/job-offer-schema';
import { JobOffersClient } from './job-offers-client';

jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock('@/actions/job-offers/job-offers', () => ({
  createJobOffer: jest.fn(async () => ({ id: 'new' })),
  updateJobOffer: jest.fn(),
  setJobOfferAvailable: jest.fn(),
  deleteJobOffer: jest.fn(),
}));

const offer = (overrides: Partial<JobOfferWithAuthor> = {}): JobOfferWithAuthor =>
  ({
    id: 'j1',
    title: 'Frontend developer',
    company: 'Acme',
    location: 'Córdoba',
    type: 'full-time',
    modality: 'hibrido',
    seniority: 'senior',
    description: 'Construir producto con React.',
    tags: ['React'],
    applyUrl: 'rrhh@acme.dev',
    available: true,
    authorId: 'u1',
    author: { id: 'u1', name: 'Ana', image: null },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }) as JobOfferWithAuthor;

const offers = [
  offer(),
  offer({
    id: 'j2',
    title: 'Data engineer',
    company: 'Datos SA',
    modality: 'remoto',
    tags: ['Python'],
    authorId: 'u2',
    author: { id: 'u2', name: 'Bruno', image: null },
  }),
];

describe('applyHref', () => {
  it('links straight to a URL and mails an address', () => {
    expect(applyHref('https://acme.dev/jobs')).toBe('https://acme.dev/jobs');
    expect(applyHref('rrhh@acme.dev')).toBe('mailto:rrhh@acme.dev');
  });
});

describe('JobOffersClient', () => {
  it('lists the offers with how to apply, and filters by text and modality', async () => {
    const user = userEvent.setup();
    render(<JobOffersClient offers={offers} viewer={null} />);

    expect(screen.getByText('2 ofertas abiertas')).toBeInTheDocument();
    const first = screen.getByRole('heading', { name: 'Frontend developer' }).closest('article')!;
    expect(within(first).getByText('híbrido')).toBeInTheDocument();
    expect(within(first).getByRole('link', { name: /postularme/ })).toHaveAttribute(
      'href',
      'mailto:rrhh@acme.dev',
    );
    expect(screen.getByRole('link', { name: /iniciá sesión para publicar/ })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '--remoto' }));
    expect(screen.queryByRole('heading', { name: 'Frontend developer' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Data engineer' })).toBeInTheDocument();

    await user.type(screen.getByRole('textbox', { name: 'Buscar ofertas' }), 'kotlin');
    expect(screen.getByText('Ninguna oferta coincide')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /limpiarFiltros/ }));
    expect(screen.getAllByRole('article')).toHaveLength(2);
  });

  it('lets the author close or delete only their own offer', async () => {
    const user = userEvent.setup();
    render(<JobOffersClient offers={offers} viewer={{ id: 'u1', isAdmin: false }} />);

    expect(screen.getAllByRole('button', { name: /Eliminar/ })).toHaveLength(1);
    await user.click(
      screen.getByRole('button', { name: 'Marcar Frontend developer como cubierta' }),
    );
    await waitFor(() => expect(setJobOfferAvailable).toHaveBeenCalledWith('j1', false));
    await user.click(screen.getByRole('button', { name: 'Eliminar Frontend developer' }));
    await waitFor(() => expect(deleteJobOffer).toHaveBeenCalledWith('j1'));
  });

  it('posts a new offer from the dialog', async () => {
    const user = userEvent.setup();
    render(<JobOffersClient offers={[]} viewer={{ id: 'u1', isAdmin: false }} />);
    expect(screen.getByText('Todavía no hay ofertas abiertas')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /publicarOferta/ }));
    await user.type(screen.getByLabelText('puesto'), 'QA automation');
    await user.type(screen.getByLabelText('empresa'), 'Testers');
    await user.type(screen.getByLabelText('dónde'), 'Remoto LATAM');
    await user.type(screen.getByLabelText('cómo postularse'), 'https://testers.dev/qa');
    await user.click(screen.getByRole('radio', { name: 'freelance' }));
    await user.type(screen.getByLabelText('tecnologías'), 'Playwright, Cypress');
    await user.type(
      screen.getByLabelText('descripción'),
      'Armar la suite de tests end to end del producto.',
    );
    await user.click(screen.getByRole('button', { name: 'publicarOferta();' }));

    await waitFor(() =>
      expect(createJobOffer).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'QA automation',
          type: 'freelance',
          modality: 'remoto',
          seniority: null,
          tags: ['Playwright', 'Cypress'],
          applyUrl: 'https://testers.dev/qa',
        }),
      ),
    );
  });
});
