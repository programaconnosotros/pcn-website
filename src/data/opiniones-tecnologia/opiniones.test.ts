import { members } from '@/data/whatsapp-conversations/members';
import { rawTechnologyOpinions, technologyTimelines } from '.';

describe('technology opinion timelines', () => {
  it('links every opinion to an existing conversation, oldest first', () => {
    technologyTimelines.forEach((timeline, i) => {
      expect(timeline.opinions).toHaveLength(rawTechnologyOpinions[i].opinions.length);
      const dates = timeline.opinions.map(({ date }) => date);
      expect(dates).toEqual([...dates].sort());
      for (const { conversation } of timeline.opinions) {
        expect(conversation.href).toMatch(/^\/conversaciones\?c=[0-9a-f]{7}$/);
      }
    });
  });

  it('has unique slugs, at least three moments each and valid stances', () => {
    const slugs = rawTechnologyOpinions.map(({ slug }) => slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const tech of rawTechnologyOpinions) {
      expect(tech.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(tech.opinions.length).toBeGreaterThanOrEqual(3);
      for (const { stance } of tech.opinions) {
        expect(['positiva', 'negativa', 'mixta']).toContain(stance);
      }
    }
  });

  it('speaks of the group, never of a member', () => {
    const texts = rawTechnologyOpinions.flatMap((tech) => [
      tech.summary,
      ...tech.opinions.map(({ text }) => text),
    ]);
    for (const { name } of members) {
      for (const text of texts) expect(text).not.toContain(name);
    }
  });
});
