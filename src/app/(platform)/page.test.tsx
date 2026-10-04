import type { ReactElement, ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { fetchFeaturedTestimonials } from '@/actions/testimonials/fetch-featured-testimonials';
import { StoryCards } from '@/components/home/story-cards';
import { TestimonialsSection } from '@/components/home/testimonials-section';
import { WHATSAPP_GROUP_URL } from '@/data/whatsapp-group';
import { listStoryCardPhotos } from '@/lib/gallery';
import { findSession } from '@/lib/session';
import { HOME_TAB_TITLE } from '@/lib/tab-title';
import { mockCookies } from '@/test/cookies';
import HomeSections from './home-sections';
import Home, { metadata } from './page';

jest.mock('next/headers', () => ({ cookies: jest.fn() }));
jest.mock('@/lib/session', () => ({ findSession: jest.fn() }));
jest.mock('@/lib/gallery', () => ({ listStoryCardPhotos: jest.fn() }));
jest.mock('@/actions/testimonials/fetch-featured-testimonials', () => ({
  fetchFeaturedTestimonials: jest.fn(),
}));
jest.mock('./home-sections', () => ({
  __esModule: true,
  default: jest.fn(({ title, userName }: { title: ReactNode; userName: string | null }) => (
    <main>
      {title}
      <p>usuario: {userName ?? 'anónimo'}</p>
    </main>
  )),
}));
jest.mock('@/components/ui/page-title', () => ({
  PageTitle: ({ action }: { action: ReactNode }) => <div>{action}</div>,
}));
jest.mock('@/components/home/story-cards', () => ({ StoryCards: jest.fn(() => null) }));
jest.mock('@/components/home/testimonials-section', () => ({
  TestimonialsSection: jest.fn(() => null),
}));
function mockStub() {
  return () => null;
}
jest.mock('@/components/home/recently-added-events-section', () => ({
  RecentlyAddedEventsSection: mockStub(),
}));
jest.mock('@/components/home/latest-conversations-section', () => ({
  LatestConversationsSection: mockStub(),
}));
jest.mock('@/components/home/latest-talks-section', () => ({ LatestTalksSection: mockStub() }));
jest.mock('@/components/home/latest-photos-section', () => ({ LatestPhotosSection: mockStub() }));
jest.mock('@/components/home/ambassadors-section', () => ({ AmbassadorsSection: mockStub() }));
jest.mock('@/components/home/latest-changes-section', () => ({ LatestChangesSection: mockStub() }));
jest.mock('@/components/home/latest-articles', () => ({ LatestArticlesSection: mockStub() }));
jest.mock('@/components/home/interviews-section', () => ({ InterviewsSection: mockStub() }));

type SectionProps = Record<
  string,
  ReactElement<{ children: ReactElement; fallback: ReactElement }>
>;
const sectionProps = () => jest.mocked(HomeSections).mock.calls[0][0] as unknown as SectionProps;

/** Runs the async server component a Suspense boundary wraps. */
const resolveStreamed = async (boundary: ReactElement<{ children: ReactElement }>) => {
  const child = boundary.props.children as ReactElement<object>;
  return (child.type as (_props: object) => Promise<ReactElement>)(child.props);
};

describe('Home page', () => {
  it('uses the bare prompt as the tab title and a readable OpenGraph title', () => {
    expect(metadata.title).toEqual({ absolute: HOME_TAB_TITLE });
    expect(metadata.openGraph).toMatchObject({
      title: expect.stringContaining('programaConNosotros'),
      type: 'website',
    });
    expect(metadata.description).toEqual(expect.stringContaining('comunidad'));
  });

  it('greets nobody when there is no session cookie and skips the session lookup', async () => {
    mockCookies();
    render(await Home());

    expect(screen.getByText('usuario: anónimo')).toBeInTheDocument();
    expect(findSession).not.toHaveBeenCalled();
    expect(screen.getByRole('link', { name: /whatsapp/ })).toHaveAttribute(
      'href',
      WHATSAPP_GROUP_URL,
    );
  });

  it('passes the signed-in member name to the sections', async () => {
    mockCookies({ sessionId: 's1' });
    jest.mocked(findSession).mockResolvedValue({ user: { name: 'Ana' } } as never);
    render(await Home());

    expect(findSession).toHaveBeenCalledWith('s1');
    expect(screen.getByText('usuario: Ana')).toBeInTheDocument();
  });

  it('treats an expired session as anonymous', async () => {
    mockCookies({ sessionId: 'gone' });
    jest.mocked(findSession).mockResolvedValue(null);
    render(await Home());

    expect(screen.getByText('usuario: anónimo')).toBeInTheDocument();
  });

  it('streams the featured testimonials and story-card photos from their loaders', async () => {
    mockCookies();
    const testimonials = [{ id: 't1' }];
    const photos = { historia: ['/a.jpg'], galeria: ['/b.jpg'] };
    jest.mocked(fetchFeaturedTestimonials).mockResolvedValue(testimonials as never);
    jest.mocked(listStoryCardPhotos).mockResolvedValue(photos);
    render(await Home());
    const props = sectionProps();

    render(await resolveStreamed(props.testimonialsSection));
    expect(jest.mocked(TestimonialsSection).mock.calls[0][0]).toEqual({ testimonials });

    render(await resolveStreamed(props.storyCardsSection));
    expect(jest.mocked(StoryCards).mock.calls.at(-1)![0]).toEqual({ photos });
  });

  it('shows the static story cards without photos while they load', async () => {
    mockCookies();
    render(await Home());
    render(sectionProps().storyCardsSection.props.fallback);

    expect(jest.mocked(StoryCards).mock.calls[0][0]).toEqual({
      photos: { historia: [], galeria: [] },
    });
  });

  it('gives every database-backed section a skeleton fallback', async () => {
    mockCookies();
    render(await Home());
    const props = sectionProps();

    for (const key of [
      'recentlyAddedEventsSection',
      'latestTalksSection',
      'latestPhotosSection',
      'latestArticlesSection',
      'ambassadorsSection',
      'testimonialsSection',
    ]) {
      expect(props[key].props.fallback).toBeTruthy();
    }
  });
});
