import { isValidContentMark } from '@/actions/content-marks/content-marks';
import { TRACKS } from '../../questions/types';
import { crossTrackGuides, getGuideMeta, guideSectionKey, interviewGuides } from '.';

describe('interview guides', () => {
  it('has a guide for every interview track', () => {
    for (const { id } of TRACKS) {
      expect(interviewGuides[id].track).toBe(id);
    }
  });

  it.each(TRACKS.map(({ id }) => id))('%s has unique, storable section ids', (track) => {
    const ids = interviewGuides[track].sections.map((section) => section.id);

    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      // setContentMark rejects content ids longer than 100 characters.
      expect(guideSectionKey(track, id).length).toBeLessThanOrEqual(100);
    }
  });

  it.each(TRACKS.map(({ id }) => id))('%s sections have content to read', (track) => {
    for (const section of interviewGuides[track].sections) {
      expect(section.body.length).toBeGreaterThan(0);
      expect(section.checklist.length).toBeGreaterThan(0);
      for (const item of section.checklist) {
        expect(item.text.trim()).not.toBe('');
        expect(item.explanation.trim()).not.toBe('');
      }
    }
  });

  it('stores read sections as content marks', () => {
    expect(isValidContentMark('interview-guide', 'read')).toBe(true);
    expect(isValidContentMark('interview-guide', 'watched')).toBe(false);
  });

  it('includes the cross-track guides with somewhere to practice', () => {
    for (const { id, guide } of crossTrackGuides) {
      expect(guide.track).toBe(id);
      expect(getGuideMeta(id)?.practice.href).toBeTruthy();
      for (const section of guide.sections) {
        expect(section.checklist.every((item) => item.explanation.trim() !== '')).toBe(true);
      }
    }
  });
});

describe('getGuideMeta', () => {
  it('describes a track guide with where to simulate the interview', () => {
    const track = TRACKS[0];
    expect(getGuideMeta(track.id)).toMatchObject({
      label: track.label,
      stack: track.stack,
      guide: interviewGuides[track.id],
      practice: { href: `/entrevistas?tipo=${track.id}`, label: 'simular entrevista' },
    });
  });

  it('includes the partner courses a track recommends', () => {
    expect(getGuideMeta('security')?.courses?.length).toBeGreaterThan(0);
  });

  it('returns the cross-track guide as is', () => {
    expect(getGuideMeta('live-coding')).toBe(crossTrackGuides[0]);
  });

  it('returns undefined for an unknown guide', () => {
    expect(getGuideMeta('cobol')).toBeUndefined();
  });
});
