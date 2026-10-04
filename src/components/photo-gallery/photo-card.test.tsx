import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { buildTile } from '@/test/gallery';
import { PhotoCard } from './photo-card';

describe('PhotoCard', () => {
  it('links to the photo with its caption, number, date and people', () => {
    render(
      <PhotoCard
        photo={buildTile({
          description: 'Brindis',
          tags: [{ user: { id: 'u1', name: 'Ada' } }, { user: { id: 'u2', name: 'Bruno' } }],
        })}
        index={2}
        total={120}
        href="/galeria/photo-abc123?tipo=fotos"
      />,
    );

    expect(screen.getByRole('link', { name: 'Ver foto: Brindis' })).toHaveAttribute(
      'href',
      '/galeria/photo-abc123?tipo=fotos',
    );
    expect(screen.getByText('#118')).toBeInTheDocument();
    expect(screen.getByText('2030-05-10 · 2 personas')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Descargar' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Compartir' })).not.toBeInTheDocument();
  });

  it('marks videos with their duration and shares them', async () => {
    const onShare = jest.fn();
    render(
      <PhotoCard
        photo={buildTile({
          kind: 'VIDEO',
          durationSeconds: 65,
          event: { id: 'e1', name: 'Meetup' },
          tags: [{ user: { id: 'u1', name: 'Ada' } }],
        })}
        index={0}
        total={1}
        href="/galeria/v"
        onShare={onShare}
      />,
    );

    expect(screen.getByRole('link', { name: /Ver video: Meetup/ })).toHaveTextContent('1:05');
    expect(screen.getByText(/1 persona$/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Compartir' }));
    expect(onShare).toHaveBeenCalled();
  });

  it('says "video" when the duration is unknown, and drifts with the pointer', () => {
    const { container } = render(
      <PhotoCard
        photo={buildTile({ kind: 'VIDEO', durationSeconds: null })}
        index={0}
        total={1}
        href="/galeria/v"
      />,
    );
    const frame = container.firstElementChild as HTMLElement;
    frame.getBoundingClientRect = () => ({ left: 0, top: 0, width: 100, height: 100 }) as DOMRect;

    expect(screen.getByRole('link', { name: /Ver video/ })).toHaveTextContent('video');

    const move = new Event('pointermove') as PointerEvent;
    Object.assign(move, { pointerType: 'mouse', clientX: 75, clientY: 25 });
    fireEvent(frame, move);
    expect(frame.style.getPropertyValue('--px')).toBe('0.500');
    expect(frame.style.getPropertyValue('--py')).toBe('-0.500');

    const touch = new Event('pointermove') as PointerEvent;
    Object.assign(touch, { pointerType: 'touch', clientX: 0, clientY: 0 });
    fireEvent(frame, touch);
    expect(frame.style.getPropertyValue('--px')).toBe('0.500');

    fireEvent.pointerLeave(frame);
    expect(frame.style.getPropertyValue('--px')).toBe('0');
  });
});
