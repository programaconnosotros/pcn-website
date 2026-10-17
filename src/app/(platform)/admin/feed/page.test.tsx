import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { showFeedItem } from '@/actions/feed/hidden-feed-items';
import { requireAdminPage } from '@/lib/admin';
import { mockRouter } from '@/test/dom';
import { renderInPlatform } from '@/test/platform';
import { listHiddenFeedItems } from '@/lib/feed';
import HiddenFeedItemsPage, { metadata } from './page';

jest.mock('sonner', () => require('@/test/platform').mockSonner());
jest.mock('@/lib/admin', () => ({ requireAdminPage: jest.fn() }));
jest.mock('@/lib/feed', () => ({ listHiddenFeedItems: jest.fn() }));
jest.mock('@/actions/feed/hidden-feed-items', () => ({ showFeedItem: jest.fn() }));

describe('/admin/feed', () => {
  it('is an admin page out of search results', () => {
    expect(metadata.title).toBe('sudo ls ~/admin/feed');
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });

  it('lists what was hidden and puts an item back in the feed', async () => {
    jest.mocked(listHiddenFeedItems).mockResolvedValue([
      {
        itemId: 'evento-e1',
        title: 'Meetup de prueba',
        href: '/eventos/e1',
        createdAt: new Date('2026-10-10T15:00:00Z'),
        hiddenBy: { name: 'grace hopper' },
      },
    ] as never);
    renderInPlatform(await HiddenFeedItemsPage());

    expect(requireAdminPage).toHaveBeenCalled();
    expect(screen.getByText('1 item oculto')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Meetup de prueba' })).toHaveAttribute(
      'href',
      '/eventos/e1',
    );
    expect(screen.getByText(/oculto el 10 de oct de 2026 por Grace Hopper/)).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: 'Mostrar en el feed: Meetup de prueba' }),
    );
    expect(showFeedItem).toHaveBeenCalledWith('evento-e1');
    expect(toast.success).toHaveBeenCalledWith('Volvió al feed');
    expect(mockRouter.refresh).toHaveBeenCalled();
  });

  it('says when nothing is hidden', async () => {
    jest.mocked(listHiddenFeedItems).mockResolvedValue([]);
    renderInPlatform(await HiddenFeedItemsPage());
    expect(screen.getByText('No hay nada oculto')).toBeInTheDocument();
  });

  it('sends everyone else away before reading anything', async () => {
    jest.mocked(requireAdminPage).mockRejectedValueOnce(new Error('NEXT_REDIRECT:/'));
    await expect(HiddenFeedItemsPage()).rejects.toThrow('NEXT_REDIRECT:/');
    expect(listHiddenFeedItems).not.toHaveBeenCalled();
  });
});
