import { screen } from '@testing-library/react';
import { fetchEvent } from '@/actions/events/fetch-event';
import { fetchTalks } from '@/actions/talks/fetch-talks';
import { TalksList } from '@/components/talks/talks-list';
import { getEventManager } from '@/lib/event-access';
import { buildEvent } from '@/test/events';
import { buildSession, renderInPlatform } from '@/test/platform';
import TalksPage, { generateMetadata } from './page';

jest.mock('@/lib/event-access', () => ({ getEventManager: jest.fn() }));
jest.mock('@/actions/events/fetch-event', () => ({ fetchEvent: jest.fn() }));
jest.mock('@/actions/talks/fetch-talks', () => ({ fetchTalks: jest.fn() }));
jest.mock('@/components/talks/talks-list', () => ({
  TalksList: jest.fn(() => <div data-testid="talks" />),
}));

const params = { params: Promise.resolve({ id: 'e1' }) };

describe('event TalksPage', () => {
  it('sends people who do not manage the event back to it', async () => {
    jest.mocked(getEventManager).mockResolvedValue(null as never);
    await expect(TalksPage(params)).rejects.toThrow('NEXT_REDIRECT:/eventos/e1');
    expect(fetchEvent).not.toHaveBeenCalled();
  });

  it('sends managers to the events list when the event is gone', async () => {
    jest.mocked(getEventManager).mockResolvedValue(buildSession().user as never);
    jest.mocked(fetchEvent).mockResolvedValue(null);
    await expect(TalksPage(params)).rejects.toThrow('NEXT_REDIRECT:/eventos');
  });

  it("lists the event's talks for its managers", async () => {
    const talks = [{ id: 't1' }];
    jest.mocked(getEventManager).mockResolvedValue(buildSession().user as never);
    jest.mocked(fetchEvent).mockResolvedValue(buildEvent() as never);
    jest.mocked(fetchTalks).mockResolvedValue(talks as never);
    renderInPlatform(await TalksPage(params));

    expect(fetchTalks).toHaveBeenCalledWith('e1');
    expect(jest.mocked(TalksList).mock.calls[0][0]).toEqual({ talks, eventId: 'e1' });
    expect(screen.getByRole('link', { name: 'Meetup PCN' })).toHaveAttribute('href', '/eventos/e1');
  });

  it('has a tab title', async () => {
    expect((await generateMetadata()).title).toMatch(/charlas/);
  });
});
