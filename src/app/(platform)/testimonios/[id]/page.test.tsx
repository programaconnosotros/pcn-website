import { screen } from '@testing-library/react';
import { fetchTestimonial } from '@/actions/testimonials/fetch-testimonial';
import { renderTerminalCard } from '@/lib/og/terminal-card';
import { findSession } from '@/lib/session';
import { mockCookies } from '@/test/cookies';
import {
  adminRow,
  expectOnlyPlaceholders,
  renderPage,
  sessionRow,
  thrownBy,
} from '@/test/pages-m-z';
import { buildTestimonial } from '@/test/platform';
import Loading from './loading';
import Image, { alt } from './opengraph-image';
import TestimonialDetailPage, { generateMetadata } from './page';
import { TestimonialDetailActions } from './testimonial-detail-actions';

jest.mock('next/headers', () => ({ cookies: jest.fn(), headers: jest.fn() }));
jest.mock('@/lib/session', () => ({ findSession: jest.fn() }));
jest.mock('@/actions/testimonials/fetch-testimonial', () => ({ fetchTestimonial: jest.fn() }));
jest.mock('./testimonial-detail-actions', () => ({
  TestimonialDetailActions: jest.fn(() => <p>acciones</p>),
}));
jest.mock('@/lib/og/terminal-card', () => require('@/test/pages-m-z').mockTerminalCard());

const params = (id = 't1') => ({ params: Promise.resolve({ id }) });
const testimonial = (overrides: Parameters<typeof buildTestimonial>[0] = {}) =>
  buildTestimonial({
    id: 't1',
    user: { id: 'author-1', name: 'Ana María López', image: null },
    ...overrides,
  });
const actionsProps = () => jest.mocked(TestimonialDetailActions).mock.calls[0][0];

describe('/testimonios/[id] metadata', () => {
  it('names the author and uses the testimonial as description', async () => {
    jest.mocked(fetchTestimonial).mockResolvedValue(testimonial() as never);

    const metadata = await generateMetadata(params());

    expect(fetchTestimonial).toHaveBeenCalledWith('t1');
    expect(metadata).toMatchObject({
      title: 'cat ~/testimonios/ana-maria-lopez',
      description: 'La comunidad me ayudó muchísimo',
      openGraph: {
        title: 'Testimonio de Ana María López',
        type: 'article',
        url: expect.stringMatching(/\/testimonios\/t1$/),
      },
      twitter: { title: 'Testimonio de Ana María López' },
    });
  });

  it('cuts long testimonials to 160 characters', async () => {
    jest
      .mocked(fetchTestimonial)
      .mockResolvedValue(testimonial({ body: 'a'.repeat(200) }) as never);

    const { description } = await generateMetadata(params());

    expect(description).toBe(`${'a'.repeat(157)}...`);
  });

  it('says when the testimonial does not exist', async () => {
    jest.mocked(fetchTestimonial).mockResolvedValue(null);

    expect(await generateMetadata(params('nope'))).toEqual({
      title: { absolute: '404: no such file or directory' },
      description: 'El testimonio que buscas no existe.',
    });
  });
});

describe('/testimonios/[id]', () => {
  it('goes back to the list when the testimonial does not exist', async () => {
    jest.mocked(fetchTestimonial).mockResolvedValue(null);
    expect(await thrownBy(() => TestimonialDetailPage(params('nope')))).toBe(
      'NEXT_REDIRECT:/testimonios',
    );
  });

  it('shows the testimonial, its author and date to anonymous visitors, read-only', async () => {
    mockCookies();
    jest.mocked(fetchTestimonial).mockResolvedValue(testimonial() as never);

    await renderPage(TestimonialDetailPage(params()));

    expect(screen.getByText('La comunidad me ayudó muchísimo')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ana María López' })).toHaveAttribute(
      'href',
      '/perfil/author-1',
    );
    expect(screen.getByRole('link', { name: /volver/ })).toHaveAttribute('href', '/testimonios');
    expect(screen.getByText('AML')).toBeInTheDocument();
    expect(screen.getByText(/publicado/)).not.toHaveTextContent('actualizado');
    // The breadcrumb ends in the author's first name.
    expect(screen.getByRole('navigation', { name: 'breadcrumb' })).toHaveTextContent(
      /testimonios.*\/.*ana$/,
    );
    expect(findSession).not.toHaveBeenCalled();
    expect(actionsProps()).toMatchObject({ canEdit: false, isAdmin: false });
  });

  it('lets the author edit it and says when it was updated', async () => {
    mockCookies({ sessionId: 'token' });
    jest.mocked(findSession).mockResolvedValue(sessionRow({ id: 'author-1' }));
    jest
      .mocked(fetchTestimonial)
      .mockResolvedValue(
        testimonial({ updatedAt: new Date('2025-02-01T00:00:00Z') } as never) as never,
      );

    await renderPage(TestimonialDetailPage(params()));

    expect(screen.getByText(/publicado/)).toHaveTextContent('actualizado');
    expect(actionsProps()).toMatchObject({ canEdit: true, isAdmin: false });
  });

  it('does not let other members edit it', async () => {
    mockCookies({ sessionId: 'token' });
    jest.mocked(findSession).mockResolvedValue(sessionRow({ id: 'someone-else' }));
    jest.mocked(fetchTestimonial).mockResolvedValue(testimonial() as never);

    await renderPage(TestimonialDetailPage(params()));

    expect(actionsProps()).toMatchObject({ canEdit: false, isAdmin: false });
  });

  it('treats an expired session as anonymous', async () => {
    mockCookies({ sessionId: 'token' });
    jest.mocked(findSession).mockResolvedValue(null);
    jest.mocked(fetchTestimonial).mockResolvedValue(testimonial() as never);

    await renderPage(TestimonialDetailPage(params()));

    expect(actionsProps()).toMatchObject({ canEdit: false, isAdmin: false });
  });

  it('lets admins manage it and shows them a featured mark', async () => {
    mockCookies({ sessionId: 'token' });
    jest.mocked(findSession).mockResolvedValue(adminRow());
    jest.mocked(fetchTestimonial).mockResolvedValue(testimonial({ featured: true }) as never);

    const { container } = await renderPage(TestimonialDetailPage(params()));

    expect(screen.getByText('destacado')).toBeInTheDocument();
    expect(container.querySelector('.lucide-star')).toBeInTheDocument();
    expect(actionsProps()).toMatchObject({ canEdit: true, isAdmin: true });
  });

  it('shows only placeholders while loading', () => {
    expectOnlyPlaceholders(<Loading />);
  });
});

describe('/testimonios/[id] link preview', () => {
  it('quotes the testimonial and its author', async () => {
    jest.mocked(fetchTestimonial).mockResolvedValue(testimonial() as never);

    await Image(params());

    expect(alt).toMatch(/Testimonio/);
    expect(renderTerminalCard).toHaveBeenCalledWith({
      path: 'testimonios',
      command: 'cat testimonio --autor "Ana María López"',
      title: '“La comunidad me ayudó muchísimo”',
      meta: ['@Ana María López'],
    });
  });

  it('falls back to a generic card when the testimonial was deleted', async () => {
    jest.mocked(fetchTestimonial).mockResolvedValue(null);

    await Image(params('gone'));

    expect(renderTerminalCard).toHaveBeenCalledWith({
      path: 'testimonios',
      command: 'cat testimonios',
      title: 'Testimonios de la comunidad',
      meta: [],
    });
  });
});
