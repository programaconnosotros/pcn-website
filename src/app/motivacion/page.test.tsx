import { act, render, screen } from '@testing-library/react';
import MotivacionPage from './page';
import { fraseAt, ROTATION_MS, slotAt } from './scene';

jest.mock('@/components/analytics/page-visit-tracker', () => ({ PageVisitTracker: () => null }));

const START = 5_000 * ROTATION_MS + 60_000;

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(START);
});

afterEach(() => {
  jest.useRealTimers();
});

describe('/motivacion', () => {
  it('shows the quote of the current 5 minutes and moves on to the next one', () => {
    render(<MotivacionPage />);

    const first = fraseAt(slotAt(START));
    expect(screen.getByText(`“${first.text}”`)).toBeInTheDocument();
    expect(screen.getByText(`— ${first.author}`)).toBeInTheDocument();
    expect(screen.getByText('próxima frase en 04:00')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(4 * 60_000);
    });
    const next = fraseAt(slotAt(START) + 1);
    expect(screen.getByText(`“${next.text}”`)).toBeInTheDocument();
    expect(screen.getByText('próxima frase en 05:00')).toBeInTheDocument();
  });

  it('offers full screen and a way back home', () => {
    render(<MotivacionPage />);
    expect(screen.getByRole('button', { name: 'Pantalla completa' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'cd ~' })).toHaveAttribute('href', '/');
  });
});
