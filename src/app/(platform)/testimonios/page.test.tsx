import { screen } from '@testing-library/react';
import { fetchTestimonials } from '@/actions/testimonials/fetch-testimonials';
import { findSession } from '@/lib/session';
import { mockCookies } from '@/test/cookies';
import { adminRow, expectOnlyPlaceholders, renderPage, sessionRow } from '@/test/pages-m-z';
import { buildTestimonial } from '@/test/platform';
import Loading from './loading';
import Image, { alt } from './opengraph-image';
import TestimoniosPage, { metadata } from './page';
import { TestimonialsClientWrapper } from './testimonials-client-wrapper';

jest.mock('@/lib/extracted-testimonials', () => ({
  listExtractedTestimonials: jest.fn(async () => []),
}));
jest.mock('next/headers', () => ({ cookies: jest.fn(), headers: jest.fn() }));
jest.mock('@/lib/session', () => ({ findSession: jest.fn() }));
jest.mock('@/actions/testimonials/fetch-testimonials', () => ({ fetchTestimonials: jest.fn() }));
jest.mock('./testimonials-client-wrapper', () => ({
  TestimonialsClientWrapper: jest.fn(() => <p>testimonios</p>),
}));
jest.mock('@/lib/og/section-cards', () => require('@/test/pages-m-z').mockSectionCards());
jest.mock('@/lib/og/terminal-card', () => require('@/test/pages-m-z').mockTerminalCard());

const testimonials = [
  buildTestimonial({ id: 't1', userId: 'author-1' }),
  buildTestimonial({ id: 't2', userId: 'author-2' }),
];
const wrapperProps = () => jest.mocked(TestimonialsClientWrapper).mock.calls[0][0];

describe('/testimonios', () => {
  beforeEach(() => {
    jest.mocked(fetchTestimonials).mockResolvedValue(testimonials as never);
  });

  it('has its title and share cards', () => {
    expect(metadata.title).toBe('ls ~/testimonios');
    expect(metadata.openGraph).toMatchObject({ title: 'Testimonios | programaConNosotros' });
  });

  it('shows the testimonials to anonymous visitors, who cannot write one', async () => {
    mockCookies();
    await renderPage(TestimoniosPage());

    expect(screen.getByText('testimonios')).toBeInTheDocument();
    expect(findSession).not.toHaveBeenCalled();
    expect(wrapperProps()).toEqual({
      testimonials,
      currentUserId: undefined,
      isAdmin: false,
      hasUserTestimonial: false,
    });
  });

  it('knows when the member already wrote a testimonial', async () => {
    mockCookies({ sessionId: 'token' });
    jest.mocked(findSession).mockResolvedValue(sessionRow({ id: 'author-2' }));
    await renderPage(TestimoniosPage());

    expect(wrapperProps()).toMatchObject({
      currentUserId: 'author-2',
      isAdmin: false,
      hasUserTestimonial: true,
    });
  });

  it('lets a member without a testimonial write one, and flags admins', async () => {
    mockCookies({ sessionId: 'token' });
    jest.mocked(findSession).mockResolvedValue(adminRow({ id: 'admin-9' }));
    await renderPage(TestimoniosPage());

    expect(wrapperProps()).toMatchObject({
      currentUserId: 'admin-9',
      isAdmin: true,
      hasUserTestimonial: false,
    });
  });

  it('treats an expired session as anonymous', async () => {
    mockCookies({ sessionId: 'token' });
    jest.mocked(findSession).mockResolvedValue(null);
    await renderPage(TestimoniosPage());

    expect(wrapperProps()).toMatchObject({ currentUserId: undefined, isAdmin: false });
  });

  it('uses the testimonials section card for link previews', async () => {
    expect(alt).toBe('testimonios · programaConNosotros');
    await expect(Image()).resolves.toEqual({ section: 'testimonios' });
  });

  it('shows only placeholders while loading', () => {
    expectOnlyPlaceholders(<Loading />);
  });
});
