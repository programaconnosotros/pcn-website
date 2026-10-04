import { act, fireEvent, render, screen } from '@testing-library/react';
import { OsPhotos } from './os-photos';

const photos = [
  { id: 'p1', thumbUrl: 'https://cdn.test/p1.webp' },
  { id: 'p2', thumbUrl: 'https://cdn.test/p2.webp' },
  { id: 'p3', thumbUrl: 'https://cdn.test/p3.webp' },
];

const respond = (body: unknown, ok = true) =>
  Promise.resolve({ ok, json: () => Promise.resolve(body) } as Response);

const fetchMock = jest.fn();

beforeEach(() => {
  jest.useFakeTimers();
  global.fetch = fetchMock;
});
afterEach(() => {
  jest.useRealTimers();
});

const renderPhotos = async (covered = false) => {
  const onOpen = jest.fn();
  const utils = render(<OsPhotos covered={covered} onOpen={onOpen} />);
  // Let the fetch promise chain settle.
  await act(async () => {});
  return { ...utils, onOpen };
};

describe('OsPhotos', () => {
  it('shows a disabled placeholder while loading', () => {
    fetchMock.mockReturnValue(new Promise(() => {}));
    render(<OsPhotos covered={false} onOpen={jest.fn()} />);
    const button = screen.getByRole('button', { name: 'Fotos de la comunidad' });
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('--/--');
    expect(fetchMock).toHaveBeenCalledWith('/api/galeria/aleatorias');
  });

  it('flips through the photos and opens the current one in the gallery', async () => {
    fetchMock.mockReturnValue(respond({ photos }));
    const { onOpen } = await renderPhotos();
    const button = screen.getByRole('button', { name: 'Ver foto en la galería' });
    expect(button).toHaveTextContent('01/03');

    act(() => jest.advanceTimersByTime(2000));
    expect(button).toHaveTextContent('02/03');
    act(() => jest.advanceTimersByTime(2000));
    expect(button).toHaveTextContent('03/03');
    // Wraps around to the first one.
    act(() => jest.advanceTimersByTime(2000));
    expect(button).toHaveTextContent('01/03');

    fireEvent.click(button);
    expect(onOpen).toHaveBeenCalledWith('/galeria/p1');
  });

  it('stays on the same photo while covered by a maximized window', async () => {
    fetchMock.mockReturnValue(respond({ photos }));
    await renderPhotos(true);
    act(() => jest.advanceTimersByTime(6000));
    expect(screen.getByRole('button')).toHaveTextContent('01/03');
  });

  it('renders nothing when the gallery is empty', async () => {
    fetchMock.mockReturnValue(respond({ photos: [] }));
    const { container } = await renderPhotos();
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when the request fails, and keeps photos it already had', async () => {
    fetchMock.mockReturnValueOnce(respond({}, false));
    const { container, unmount } = await renderPhotos();
    expect(container).toBeEmptyDOMElement();
    unmount();

    fetchMock.mockReturnValueOnce(respond({ photos })).mockReturnValueOnce(respond({}, false));
    await renderPhotos();
    await act(async () => {
      jest.advanceTimersByTime(30 * 60 * 1000);
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(screen.getByRole('button', { name: 'Ver foto en la galería' })).toBeInTheDocument();
  });

  it('ignores a response that arrives after unmounting', async () => {
    let resolve: (_value: Response) => void = () => {};
    fetchMock.mockReturnValue(new Promise<Response>((r) => (resolve = r)));
    const { unmount } = render(<OsPhotos covered={false} onOpen={jest.fn()} />);
    unmount();
    await act(async () => resolve(await respond({ photos })));
    await act(async () => {});
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
