import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setEventCoverFraming } from '@/actions/events/set-event-cover-framing';
import { mockRouter } from '@/test/dom';
import { MemoryCoverFraming } from './memory-cover-framing';

jest.mock('@/actions/events/set-event-cover-framing', () => ({
  setEventCoverFraming: jest.fn(),
}));

describe('MemoryCoverFraming', () => {
  it('previews the zoom and saves the framing', async () => {
    jest.mocked(setEventCoverFraming).mockResolvedValue(undefined);
    render(
      <MemoryCoverFraming eventId="e1" photo="/cover.jpg" framing={{ x: 30, y: 40, zoom: 100 }} />,
    );

    await userEvent.click(screen.getByRole('button', { name: /encuadre/ }));
    fireEvent.change(screen.getByLabelText('Zoom'), { target: { value: '150' } });
    expect(screen.getByRole('img', { name: /foco en 30% 40%, zoom 150%/ })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'guardarEncuadre();' }));
    await waitFor(() =>
      expect(setEventCoverFraming).toHaveBeenCalledWith('e1', { x: 30, y: 40, zoom: 150 }),
    );
    expect(mockRouter.refresh).toHaveBeenCalled();
  });

  it('centers the photo again', async () => {
    render(
      <MemoryCoverFraming eventId="e1" photo="/cover.jpg" framing={{ x: 10, y: 90, zoom: 200 }} />,
    );
    await userEvent.click(screen.getByRole('button', { name: /encuadre/ }));
    await userEvent.click(screen.getByRole('button', { name: /centrar/ }));
    expect(screen.getByRole('img', { name: /foco en 50% 50%, zoom 100%/ })).toBeInTheDocument();
  });
});
