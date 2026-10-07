import { modelsIn } from './prisma-models';

describe('modelsIn', () => {
  it('follows includes, selects and _count to the related tables', () => {
    const read = modelsIn('Event', {
      where: { deletedAt: null },
      include: {
        organizers: { select: { user: { select: { name: true } } } },
        _count: { select: { registrations: { where: { cancelledAt: null } } } },
      },
    });
    expect([...read].sort()).toEqual(['Event', 'EventOrganizer', 'EventRegistration', 'User']);
  });

  it('follows relation filters', () => {
    const read = modelsIn('User', { where: { advice: { some: {} } } });
    expect([...read].sort()).toEqual(['Advice', 'User']);
  });

  it('finds the tables a nested write touches', () => {
    const written = modelsIn('Project', {
      data: { title: 'x', members: { create: [{ userId: 'u1' }] } },
    });
    expect([...written].sort()).toEqual(['Project', 'ProjectMember']);
  });

  it('adds what a delete removes in cascade', () => {
    const written = modelsIn('Advice', { where: { id: 'a1' } }, true);
    expect(written.has('Advice')).toBe(true);
    expect(written.has('Comment')).toBe(true);
    expect(written.has('Like')).toBe(true);
  });

  it('cascades transitively', () => {
    const written = modelsIn('User', { where: { id: 'u1' } }, true);
    for (const model of ['User', 'Advice', 'Comment', 'Like', 'Session', 'ProjectMember'])
      expect(written.has(model as never)).toBe(true);
  });

  it('ignores Dates and plain values', () => {
    expect([...modelsIn('Event', { where: { date: { gte: new Date() } } })]).toEqual(['Event']);
  });
});
