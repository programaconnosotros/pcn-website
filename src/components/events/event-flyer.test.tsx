import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EventFlyer from './event-flyer';

// User-event flows through Radix portals: give them room on a busy machine
jest.setTimeout(20_000);

describe('EventFlyer', () => {
  it('shows the schedule with end time and opens the flyer in a dialog', async () => {
    render(
      <EventFlyer
        name="Meetup"
        flyerSrc="/f.png"
        date={new Date(2030, 4, 10, 19, 0)}
        endDate={new Date(2030, 4, 10, 22, 30)}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Meetup' })).toBeInTheDocument();
    expect(screen.getByText(/19:00 - 22:30/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('dialog', { name: 'Flyer del evento Meetup' })).toBeInTheDocument();
  });

  it('skips the flyer and end time when missing', () => {
    render(<EventFlyer name="Meetup" flyerSrc="" date={new Date(2030, 4, 10, 19, 0)} />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText(/Horario del evento: .*19:00$/)).toBeInTheDocument();
  });
});
