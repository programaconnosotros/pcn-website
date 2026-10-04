import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { isEmbedded, postToOsHost } from '@/components/os/os-env';
import { MusicGrid } from './music-grid';
import { BackgroundMusicPlayer } from './music-player-dialog';
import { externalPlaylists, radios, type MusicSet } from './music-sets';
import { useMusicPlayer } from './use-music-player';

jest.mock('@/components/os/os-env', () => ({
  ...jest.requireActual('@/components/os/os-env'),
  isEmbedded: jest.fn(() => false),
  postToOsHost: jest.fn(),
}));

const [chill, dark] = radios;
const ORIGIN = 'https://www.youtube-nocookie.com';

// Interaction tests run slowly when the whole suite shares a busy machine
jest.setTimeout(20_000);

describe('MusicGrid', () => {
  it('lists the sets and plays one in a dialog', async () => {
    const user = userEvent.setup();
    render(<MusicGrid sets={[...radios, ...externalPlaylists]} />);

    expect(screen.getAllByRole('button')).toHaveLength(radios.length + externalPlaylists.length);
    await user.click(screen.getByRole('button', { name: chill.title }));

    const dialog = screen.getByRole('dialog', { name: chill.title });
    expect(screen.getByTitle(chill.title)).toHaveAttribute(
      'src',
      `${ORIGIN}/embed/${chill.id}?autoplay=1&rel=0&enablejsapi=1`,
    );
    expect(screen.getByTitle('Ver en YouTube')).toHaveAttribute(
      'href',
      `https://www.youtube.com/watch?v=${chill.id}`,
    );
    expect(dialog).toHaveTextContent('programaConNosotros');

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('hands the set to the desktop inside PCN OS', async () => {
    (isEmbedded as jest.Mock).mockReturnValueOnce(true);
    render(<MusicGrid sets={radios} />);

    await userEvent.click(screen.getByRole('button', { name: dark.title }));

    expect(postToOsHost).toHaveBeenCalledWith({ type: 'playMusic', id: dark.id });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

const Player = () => {
  const player = useMusicPlayer();
  return (
    <>
      <output aria-label="estado">
        {JSON.stringify({
          current: player.current?.id ?? null,
          playing: player.playing,
          open: player.open,
        })}
      </output>
      <button type="button" onClick={() => player.play(chill)}>
        play chill
      </button>
      <button type="button" onClick={() => player.play(dark)}>
        play dark
      </button>
      <button type="button" onClick={() => player.play()}>
        resume
      </button>
      <button type="button" onClick={player.pause}>
        pause
      </button>
      <button type="button" onClick={player.show}>
        show
      </button>
      <button type="button" onClick={player.stop}>
        stop
      </button>
      {player.current && (
        <BackgroundMusicPlayer
          set={player.current as MusicSet}
          open={player.open}
          onClose={player.hide}
          iframeRef={player.iframeRef}
          onIframeLoad={player.onIframeLoad}
        />
      )}
    </>
  );
};

const state = () => JSON.parse(screen.getByLabelText('estado').textContent!);

describe('background music player', () => {
  const sendFromPlayer = (data: unknown, { origin = ORIGIN, fromPlayer = true } = {}) => {
    const iframe = document.querySelector('iframe')!;
    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          data: typeof data === 'string' ? data : JSON.stringify(data),
          origin,
          source: fromPlayer ? iframe.contentWindow : null,
        }),
      );
    });
  };

  it('plays, hides and keeps the set loaded, then resumes through the embed', async () => {
    const user = userEvent.setup();
    render(<Player />);

    await user.click(screen.getByRole('button', { name: 'play chill' }));
    expect(state()).toEqual({ current: chill.id, playing: true, open: true });
    expect(screen.getByRole('dialog', { name: chill.title })).toHaveFocus();

    const iframe = document.querySelector('iframe')!;
    const postMessage = jest
      .spyOn(iframe.contentWindow!, 'postMessage')
      .mockImplementation(() => {});
    fireEvent.load(iframe);
    expect(postMessage).toHaveBeenCalledWith(
      JSON.stringify({ event: 'listening', id: 'pcn-music', channel: 'widget' }),
      ORIGIN,
    );

    await user.click(screen.getByRole('button', { name: 'Ocultar reproductor' }));
    expect(state().open).toBe(false);
    expect(document.querySelector('iframe')).toBe(iframe);

    await user.click(screen.getByRole('button', { name: 'pause' }));
    expect(postMessage).toHaveBeenLastCalledWith(
      JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }),
      ORIGIN,
    );
    expect(state().playing).toBe(false);

    await user.click(screen.getByRole('button', { name: 'resume' }));
    expect(postMessage).toHaveBeenLastCalledWith(
      JSON.stringify({ event: 'command', func: 'playVideo', args: [] }),
      ORIGIN,
    );
    expect(state()).toEqual({ current: chill.id, playing: true, open: true });

    await user.click(screen.getByRole('button', { name: 'play chill' }));
    expect(postMessage).toHaveBeenCalledTimes(4);
  });

  it('closes with Escape or the overlay and switches sets', async () => {
    const user = userEvent.setup();
    render(<Player />);
    await user.click(screen.getByRole('button', { name: 'play chill' }));

    await user.keyboard('{Escape}');
    expect(state().open).toBe(false);

    await user.click(screen.getByRole('button', { name: 'show' }));
    fireEvent.click(document.querySelector('[aria-hidden][data-state="open"]')!);
    expect(state().open).toBe(false);

    await user.click(screen.getByRole('button', { name: 'play dark' }));
    expect(state()).toEqual({ current: dark.id, playing: true, open: true });

    await user.click(screen.getByRole('button', { name: 'stop' }));
    expect(state()).toEqual({ current: null, playing: false, open: false });
    expect(document.querySelector('iframe')).toBeNull();
  });

  it('follows the state the embed reports', async () => {
    render(<Player />);
    await userEvent.click(screen.getByRole('button', { name: 'play chill' }));

    sendFromPlayer({ event: 'onStateChange', info: 2 });
    expect(state().playing).toBe(false);
    sendFromPlayer({ event: 'infoDelivery', info: { playerState: 1 } });
    expect(state().playing).toBe(true);
    sendFromPlayer({ event: 'infoDelivery', info: { playerState: 0 } });
    expect(state().playing).toBe(false);
    sendFromPlayer({ event: 'onStateChange', info: 3 });
    expect(state().playing).toBe(true);

    // Ignored: other origins, other windows, unknown or malformed messages
    sendFromPlayer({ event: 'onStateChange', info: 2 }, { origin: 'https://evil.example.com' });
    sendFromPlayer({ event: 'onStateChange', info: 2 }, { fromPlayer: false });
    sendFromPlayer('{not json');
    sendFromPlayer({ event: 'infoDelivery', info: { volume: 3 } });
    sendFromPlayer({ event: 'infoDelivery', info: null });
    sendFromPlayer({ event: 'onReady' });
    sendFromPlayer({ event: 'onStateChange', info: -1 });
    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          data: { not: 'a string' },
          origin: ORIGIN,
          source: document.querySelector('iframe')!.contentWindow,
        }),
      );
    });
    expect(state().playing).toBe(true);
  });
});
