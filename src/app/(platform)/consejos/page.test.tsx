import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { mockCookies } from '@/test/cookies';
import { buildConsejo, buildSession, renderInPlatform } from '@/test/platform';
import { findSession } from '@/lib/session';
import { getConsejoDetail, listAdvice } from '@/lib/consejos-server';
import { getIdentityMap } from '@/lib/identity-links';
import { renderTerminalCard } from '@/lib/og/terminal-card';
import { ConsejosClient } from './consejos-client';
import { ConsejoModal } from '@/components/advice/consejo-modal';
import { ConsejoPanel } from '@/components/advice/consejo-panel';
import AdvicePage, { metadata } from './page';
import ConsejosLayout from './layout';
import Loading from './loading';
import ConsejoModalDefault from './@modal/default';
import ConsejoModalIdle from './@modal/page';
import ConsejoModalPage from './@modal/(.)[id]/page';
import AdviceDetailPage, { generateMetadata } from './[id]/page';
import DetailLoading from './[id]/loading';
import ConsejoImage from './[id]/opengraph-image';
import { useConsejoTopics } from '@/components/advice/topic-picker';

const TopicsProbe = () => <p data-testid="topics">{useConsejoTopics().join(',')}</p>;

jest.mock('next/headers', () => ({ cookies: jest.fn(), headers: jest.fn() }));
jest.mock('@/lib/session', () => ({ findSession: jest.fn() }));
jest.mock('@/lib/consejos-server', () => ({
  listAdvice: jest.fn(),
  getConsejoDetail: jest.fn(),
}));
jest.mock('@/lib/identity-links', () => ({ getIdentityMap: jest.fn() }));
jest.mock('@/data/consejos-extraidos', () => ({
  extractedConsejos: [
    {
      id: 'auto-abc-Diego',
      member: 'Diego',
      tags: ['carrera'],
      content: 'Pedí feedback seguido',
      conversation: { date: '2025-02-01', title: 'Charla', hash: 'abc', href: '/c#abc' },
    },
  ],
}));
jest.mock('@/lib/og/terminal-card', () => ({
  OG_SIZE: { width: 1200, height: 630 },
  OG_CONTENT_TYPE: 'image/png',
  renderTerminalCard: jest.fn(() => 'terminal-card'),
}));
jest.mock('./consejos-client', () => ({
  ConsejosClient: jest.fn(({ addButton }: { addButton: ReactNode }) => (
    <div data-testid="consejos-client">{addButton}</div>
  )),
}));
jest.mock('@/components/advice/add-advice', () => ({
  AddAdvice: () => <button type="button">nuevo consejo</button>,
}));
jest.mock('@/components/advice/consejo-modal', () => ({
  ConsejoModal: jest.fn(() => <div data-testid="consejo-modal" />),
}));
jest.mock('@/components/advice/consejo-panel', () => ({
  ConsejoPanel: jest.fn(() => <div data-testid="consejo-panel" />),
}));
jest.mock('@/components/advice/consejos-nav', () => ({
  ConsejosNavProvider: ({ children }: { children: ReactNode }) => (
    <div data-testid="nav">{children}</div>
  ),
}));

const session = buildSession();
const advice = {
  id: 'a1',
  content: 'Escribí tests',
  createdAt: new Date('2025-03-10T00:00:00Z'),
  author: { id: 'u1', name: 'Bruno', image: null },
  likes: [],
  _count: { comments: 2 },
};

const clientProps = () => jest.mocked(ConsejosClient).mock.calls.at(-1)![0];

beforeEach(() => {
  jest.mocked(listAdvice).mockResolvedValue([advice] as never);
  jest.mocked(getIdentityMap).mockResolvedValue({});
  jest.mocked(findSession).mockResolvedValue(session as never);
});

describe('/consejos', () => {
  it('describes the page for search and social cards', () => {
    expect(metadata.title).toBe('ls ~/consejos');
    expect(metadata.openGraph).toMatchObject({ url: expect.stringMatching(/\/consejos$/) });
  });

  it('merges published and extracted consejos newest first, for an anonymous visitor', async () => {
    mockCookies();
    render(await AdvicePage());

    const props = clientProps();
    expect(props.consejos.map(({ id }) => id)).toEqual(['a1', 'auto-abc-Diego']);
    expect(props.session).toBeNull();
    expect(['a1', 'auto-abc-Diego']).toContain(props.fortuneId);
    expect(findSession).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'nuevo consejo' })).not.toBeInTheDocument();
  });

  it('gives members the button to add a consejo', async () => {
    mockCookies({ sessionId: 'token' });
    render(await AdvicePage());

    expect(findSession).toHaveBeenCalledWith('token');
    expect(clientProps().session).toBe(session);
    expect(screen.getByRole('button', { name: 'nuevo consejo' })).toBeInTheDocument();
  });

  it('picks the consejo of the day from the list', async () => {
    mockCookies();
    jest.spyOn(Date, 'now').mockReturnValue(86_400_000 * 3);
    render(await AdvicePage());
    // Day 3 over two consejos → the second one.
    expect(clientProps().fortuneId).toBe('auto-abc-Diego');
    jest.mocked(Date.now).mockRestore();
  });

  it('wraps the list and the modal slot in the consejos navigation', async () => {
    jest.mocked(listAdvice).mockResolvedValue([{ tags: ['rust', 'carrera'] }] as never);
    render(
      await ConsejosLayout({
        modal: <p>modal</p>,
        children: (
          <>
            <p>lista</p>
            <TopicsProbe />
          </>
        ),
      }),
    );
    expect(screen.getByTestId('nav')).toHaveTextContent(/^lista.*modal$/);
    // Built-in topics first, then the ones members created
    expect(screen.getByTestId('topics').textContent).toMatch(/^carrera,.*,seguridad,rust$/);
  });

  it('renders a skeleton while loading', () => {
    const { container } = renderInPlatform(<Loading />);
    expect(container.firstChild).not.toBeNull();
    const detail = renderInPlatform(<DetailLoading />);
    expect(detail.container.firstChild).not.toBeNull();
  });
});

describe('/consejos modal slot', () => {
  it('shows nothing on the list itself or by default', () => {
    expect(ConsejoModalDefault()).toBeNull();
    expect(ConsejoModalIdle()).toBeNull();
  });

  it('shows the consejo with its comments and the session', async () => {
    mockCookies({ sessionId: 'token' });
    const consejo = buildConsejo();
    jest.mocked(getConsejoDetail).mockResolvedValue({ consejo, comments: [] });

    render((await ConsejoModalPage({ params: Promise.resolve({ id: 'c1' }) }))!);

    expect(getConsejoDetail).toHaveBeenCalledWith('c1');
    expect(jest.mocked(ConsejoModal).mock.calls[0][0]).toMatchObject({
      consejo,
      comments: [],
      session,
    });
  });

  it('renders nothing for a consejo that does not exist', async () => {
    mockCookies();
    jest.mocked(getConsejoDetail).mockResolvedValue(null);
    expect(await ConsejoModalPage({ params: Promise.resolve({ id: 'x' }) })).toBeNull();
  });
});

describe('/consejos/[id]', () => {
  const params = (id = 'c1') => ({ params: Promise.resolve({ id }) });

  it('titles a missing consejo as not found', async () => {
    jest.mocked(getConsejoDetail).mockResolvedValue(null);
    expect(await generateMetadata(params('x'))).toEqual({
      title: { absolute: '404: no such file or directory' },
      description: 'El consejo que buscas no existe.',
    });
  });

  it('uses the author and the content in the metadata', async () => {
    jest.mocked(getConsejoDetail).mockResolvedValue({
      consejo: buildConsejo({ content: 'Corto' }),
      comments: [],
    });
    const meta = await generateMetadata(params());
    expect(meta.title).toBe('cat ~/consejos/bruno');
    expect(meta.description).toBe('Corto');
    expect(meta.openGraph).toMatchObject({
      title: 'Consejo de Bruno',
      type: 'article',
      url: expect.stringMatching(/\/consejos\/c1$/),
    });
  });

  it('truncates long content to 160 characters', async () => {
    jest.mocked(getConsejoDetail).mockResolvedValue({
      consejo: buildConsejo({ content: 'x'.repeat(200) }),
      comments: [],
    });
    const { description } = await generateMetadata(params());
    expect(description).toHaveLength(160);
    expect(description).toMatch(/\.\.\.$/);
  });

  it('says the consejo does not exist', async () => {
    mockCookies();
    jest.mocked(getConsejoDetail).mockResolvedValue(null);
    renderInPlatform(await AdviceDetailPage(params('x')));
    expect(screen.getByText(/no existe ese consejo/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /cd ~\/consejos/ })).toHaveAttribute(
      'href',
      '/consejos',
    );
    expect(ConsejoPanel).not.toHaveBeenCalled();
  });

  it('shows a published consejo with its comment count', async () => {
    mockCookies({ sessionId: 'token' });
    const consejo = buildConsejo();
    const comments = [{ id: 'k1' }] as never;
    jest.mocked(getConsejoDetail).mockResolvedValue({ consejo, comments });

    renderInPlatform(await AdviceDetailPage(params()));

    expect(screen.getByText('1 comentario')).toBeInTheDocument();
    expect(jest.mocked(ConsejoPanel).mock.calls[0][0]).toMatchObject({
      consejo,
      comments,
      session,
      variant: 'page',
    });
  });

  it('pluralizes comments and marks extracted consejos', async () => {
    mockCookies();
    jest.mocked(getConsejoDetail).mockResolvedValueOnce({
      consejo: buildConsejo(),
      comments: [],
    });
    const { unmount } = renderInPlatform(await AdviceDetailPage(params()));
    expect(screen.getByText('0 comentarios')).toBeInTheDocument();
    unmount();

    jest.mocked(getConsejoDetail).mockResolvedValueOnce({
      consejo: buildConsejo({
        source: { title: 't', date: '2025-01-01', hash: 'h', href: '/c' },
      }),
      comments: [],
    });
    renderInPlatform(await AdviceDetailPage(params()));
    expect(screen.getByText('auto-extraído de una conversación')).toBeInTheDocument();
  });

  describe('social card', () => {
    const card = () => jest.mocked(renderTerminalCard).mock.calls.at(-1)![0];

    it('quotes the consejo and its author', async () => {
      jest.mocked(getConsejoDetail).mockResolvedValue({
        consejo: buildConsejo({ content: 'Leé código' }),
        comments: [],
      });
      expect(await ConsejoImage(params())).toBe('terminal-card');
      expect(card()).toEqual({
        path: 'consejos',
        command: 'fortune --from "Bruno"',
        title: '“Leé código”',
        meta: ['@Bruno'],
      });
    });

    it('marks extracted consejos', async () => {
      jest.mocked(getConsejoDetail).mockResolvedValue({
        consejo: buildConsejo({ source: { title: 't', date: 'd', hash: 'h', href: '/' } }),
        comments: [],
      });
      await ConsejoImage(params());
      expect(card().meta).toEqual(['@Bruno', 'auto-extraído']);
    });

    it('falls back to the section card for a missing consejo', async () => {
      jest.mocked(getConsejoDetail).mockResolvedValue(null);
      await ConsejoImage(params('x'));
      expect(card()).toEqual({
        path: 'consejos',
        command: 'fortune',
        title: 'Consejos de la comunidad',
        meta: [],
      });
    });
  });
});
