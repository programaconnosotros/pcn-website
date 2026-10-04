import { render, screen } from '@testing-library/react';
import { conversations } from '@/data/whatsapp-conversations';
import { getAdminUser } from '@/lib/admin';
import { getEventNames } from '@/lib/event-index';
import { getIdentityMap } from '@/lib/identity-links';
import { ConversationsClient } from './conversations-client';
import ConversacionesLayout, { metadata } from './layout';
import ConversationsPage from './page';

jest.mock('@/lib/admin', () => ({ getAdminUser: jest.fn() }));
jest.mock('@/lib/identity-links', () => ({ getIdentityMap: jest.fn() }));
jest.mock('@/lib/event-index', () => ({ getEventNames: jest.fn() }));
jest.mock('./conversations-client', () => ({ ConversationsClient: jest.fn(() => null) }));

const profiles = { Ana: { id: 'u1', name: 'Ana', image: null } };
const events = { e1: 'Meetup' };
const clientProps = () => jest.mocked(ConversationsClient).mock.calls[0][0];

describe('ConversationsPage', () => {
  beforeEach(() => {
    jest.mocked(getIdentityMap).mockResolvedValue(profiles);
    jest.mocked(getEventNames).mockResolvedValue(events as never);
  });

  it('resolves WhatsApp names to profiles and each linked event once', async () => {
    jest.mocked(getAdminUser).mockResolvedValue(null);
    render(await ConversationsPage());

    expect(getIdentityMap).toHaveBeenCalledWith('whatsapp');
    const ids = jest.mocked(getEventNames).mock.calls[0][0];
    const linked = new Set(conversations.flatMap((c) => (c.eventId ? [c.eventId] : [])));
    expect(new Set(ids)).toEqual(linked);
    expect(ids).toHaveLength(linked.size);
    expect(clientProps()).toEqual({ profiles, events, isAdmin: false });
  });

  it('tells the client when the viewer is an admin', async () => {
    jest.mocked(getAdminUser).mockResolvedValue({ id: 'admin' } as never);
    render(await ConversationsPage());

    expect(clientProps()).toMatchObject({ isAdmin: true });
  });
});

describe('conversaciones layout', () => {
  it('has a terminal tab title and a readable share card', () => {
    expect(metadata.title).toBe('ls ~/conversaciones');
    expect(metadata.openGraph).toMatchObject({
      title: 'Conversaciones de la comunidad | programaConNosotros',
      url: expect.stringMatching(/\/conversaciones$/),
    });
  });

  it('renders its page untouched', () => {
    render(
      <ConversacionesLayout>
        <p>charlas del grupo</p>
      </ConversacionesLayout>,
    );
    expect(screen.getByText('charlas del grupo')).toBeInTheDocument();
  });
});
