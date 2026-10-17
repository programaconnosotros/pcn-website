import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { jsonResponse, renderWithQuery } from '@/test/platform';
import { WebReaderDialog, type WebReaderPage } from './web-reader-dialog';

const page: WebReaderPage = {
  url: 'https://blog.example.com/post',
  title: 'Un gran post',
  subtitle: 'Ana',
  icon: <span>icono</span>,
  embedCheckUrl: '/api/embed?url=x',
};

// Interaction tests run slowly when the whole suite shares a busy machine
jest.setTimeout(20_000);

describe('WebReaderDialog', () => {
  const fetchMock = jest.fn();
  beforeEach(() => {
    global.fetch = fetchMock;
  });

  it('renders nothing without a page', () => {
    renderWithQuery(<WebReaderDialog page={null} open onOpenChange={jest.fn()} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('frames embeddable pages and hides the loader once loaded', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ embeddable: true }));
    renderWithQuery(<WebReaderDialog page={page} open onOpenChange={jest.fn()} />);

    expect(screen.getByRole('heading', { name: 'Un gran post' })).toBeInTheDocument();
    expect(screen.getByText('Ana · blog.example.com')).toBeInTheDocument();
    expect(screen.getByText('$ curl blog.example.com')).toBeInTheDocument();

    const frame = await screen.findByTitle('Un gran post');
    expect(frame).toHaveAttribute('src', page.url);
    expect(fetchMock).toHaveBeenCalledWith('/api/embed?url=x');

    fireEvent.load(frame);
    expect(screen.queryByText('$ curl blog.example.com')).not.toBeInTheDocument();
  });

  it('offers a link when the site refuses to be embedded', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ embeddable: false }));
    renderWithQuery(
      <WebReaderDialog page={{ ...page, subtitle: undefined }} open onOpenChange={jest.fn()} />,
    );

    expect(
      await screen.findByText('blog.example.com no permite mostrarse embebido'),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /abrir\('blog.example.com'\)/ })).toHaveAttribute(
      'href',
      page.url,
    );
    expect(screen.queryByTitle('Un gran post')).not.toBeInTheDocument();
  });

  it('treats a failed check as not embeddable', async () => {
    fetchMock.mockResolvedValue(jsonResponse({}, { ok: false, status: 500 }));
    renderWithQuery(<WebReaderDialog page={page} open onOpenChange={jest.fn()} />);

    expect(await screen.findByText(/no permite mostrarse embebido/)).toBeInTheDocument();
  });

  it('closes through onOpenChange', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ embeddable: false }));
    const onOpenChange = jest.fn();
    renderWithQuery(<WebReaderDialog page={page} open onOpenChange={onOpenChange} />);
    await screen.findByText(/no permite mostrarse embebido/);

    await userEvent.keyboard('{Escape}');

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
