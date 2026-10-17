import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { TalkWithEvent } from '@/components/talks/community-talks';
import { LatestTalksGrid } from './latest-talks-grid';

jest.mock('@/components/talks/community-talks', () => ({
  TalkCell: ({
    talk,
    index,
    onPlay,
    onSlides,
  }: {
    talk: { title: string };
    index: number;
    onPlay: () => void;
    onSlides: () => void;
  }) => (
    <div>
      <span>
        #{index} {talk.title}
      </span>
      <button onClick={onPlay}>play {talk.title}</button>
      <button onClick={onSlides}>slides {talk.title}</button>
    </div>
  ),
  TalkMediaDialogs: ({
    playing,
    slides,
    onClosePlaying,
    onCloseSlides,
  }: {
    playing: { title: string } | null;
    slides: { title: string } | null;
    onClosePlaying: () => void;
    onCloseSlides: () => void;
  }) => (
    <>
      {playing && <button onClick={onClosePlaying}>cerrar video {playing.title}</button>}
      {slides && <button onClick={onCloseSlides}>cerrar slides {slides.title}</button>}
    </>
  ),
}));

const talks = [
  { id: '1', title: 'React' },
  { id: '2', title: 'Rust' },
] as unknown as TalkWithEvent[];

describe('LatestTalksGrid', () => {
  it('numbers the talks as on /charlas and opens and closes their video and slides', async () => {
    const user = userEvent.setup();
    render(<LatestTalksGrid talks={talks} total={10} />);

    expect(screen.getByText('#10 React')).toBeInTheDocument();
    expect(screen.getByText('#9 Rust')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'play Rust' }));
    await user.click(screen.getByRole('button', { name: 'slides React' }));
    expect(screen.getByRole('button', { name: 'cerrar video Rust' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'cerrar video Rust' }));
    await user.click(screen.getByRole('button', { name: 'cerrar slides React' }));
    expect(screen.queryByRole('button', { name: /cerrar/ })).not.toBeInTheDocument();
  });
});
