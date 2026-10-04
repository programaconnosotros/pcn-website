import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { buildTalk } from '@/test/talks';
import { MemoryTalks } from './memory-talks';

// User-event flows through Radix portals: give them room on a busy machine
jest.setTimeout(20_000);

describe('MemoryTalks', () => {
  it('lists the talks without repeating the event, and plays them in place', async () => {
    render(
      <MemoryTalks
        talks={[
          buildTalk({ id: 't1', title: 'Con video', videoUrl: 'https://youtu.be/abcdefghijk' }),
          buildTalk({ id: 't2', title: 'Con slides', slideImages: ['/s1.png', '/s2.png'] }),
        ]}
      />,
    );

    expect(screen.getByText('#001')).toBeInTheDocument();
    expect(screen.getByText('#002')).toBeInTheDocument();
    expect(screen.queryByText('Meetup PCN')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Con video' }));
    expect(screen.getByTitle('Con video')).toHaveAttribute(
      'src',
      'https://www.youtube-nocookie.com/embed/abcdefghijk?autoplay=1&rel=0',
    );
    await userEvent.keyboard('{Escape}');

    await userEvent.click(screen.getByRole('button', { name: 'slides · 2' }));
    expect(await screen.findByRole('img', { name: 'Slide 2 de 2' })).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
