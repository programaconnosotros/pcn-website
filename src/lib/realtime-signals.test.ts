import { publish } from '@/lib/realtime';
import { signalWrite } from './realtime-signals';

jest.mock('@/lib/realtime', () => ({ publish: jest.fn() }));

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

describe('signalWrite', () => {
  it('announces new content to the feed once a burst settles', () => {
    signalWrite('GalleryItem', 'createMany', { count: 30 });
    signalWrite('ForumPost', 'create', { id: 'p1', title: 'Un tema' });
    expect(publish).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1_500);
    expect(publish).toHaveBeenCalledTimes(1);
    expect(publish).toHaveBeenCalledWith('feed', {
      kind: 'foro',
      title: 'Un tema',
      href: '/foro/tema/p1',
    });
  });

  it('builds each kind of announcement', () => {
    const cases: [Parameters<typeof signalWrite>[0], object, object][] = [
      [
        'Event',
        { id: 'e1', name: 'Meetup' },
        { kind: 'evento', title: 'Meetup', href: '/eventos/e1' },
      ],
      ['Talk', { title: 'Testing' }, { kind: 'charla', title: 'Testing', href: '/charlas' }],
      ['Setup', { id: 's1', title: 'Escritorio' }, { kind: 'setup', href: '/setups/s1' }],
      ['Project', { id: 'p1', title: 'App' }, { kind: 'proyecto', href: '/proyectos/p1' }],
      ['Advice', { id: 'a1', content: 'x'.repeat(100) }, { kind: 'consejo', href: '/consejos/a1' }],
    ];
    for (const [model, row, expected] of cases) {
      signalWrite(model, 'create', row);
      jest.advanceTimersByTime(1_500);
      expect(publish).toHaveBeenLastCalledWith('feed', expect.objectContaining(expected));
    }
    expect((jest.mocked(publish).mock.lastCall![1] as { title: string }).title).toHaveLength(80);
  });

  it('ignores edits, deletions, untitled rows and models outside the feed', () => {
    signalWrite('Advice', 'update', { id: 'a1', content: 'editado' });
    signalWrite('ForumPost', 'delete', { id: 'p1', title: 'Borrado' });
    signalWrite('Setup', 'create', { id: 's1', title: '' });
    signalWrite('Comment', 'create', { id: 'c1' });
    signalWrite('Event', 'create', { id: 'e1', name: 'Borrador', deletedAt: new Date() });
    jest.advanceTimersByTime(1_500);
    expect(publish).not.toHaveBeenCalled();
  });

  it("tells an event's page when its registrations or the event change", () => {
    signalWrite('EventRegistration', 'create', { id: 'r1', eventId: 'e1' });
    signalWrite('EventWaitlistEntry', 'delete', { id: 'w1', eventId: 'e1' });
    signalWrite('Event', 'update', { id: 'e2', name: 'Meetup' });
    signalWrite('EventRegistration', 'updateMany', { count: 3 });
    jest.advanceTimersByTime(1_500);
    expect(publish).toHaveBeenCalledWith('event:e1', undefined);
    expect(publish).toHaveBeenCalledWith('event:e2', undefined);
    expect(publish).toHaveBeenCalledTimes(2);
  });
});
