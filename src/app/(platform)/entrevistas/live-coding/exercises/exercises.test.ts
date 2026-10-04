import { isValidContentMark } from '@/actions/content-marks/content-marks';
import { SENIORITIES } from '../../questions/types';
import { exerciseKey, getLivePractice, livePractices } from '.';

const practices = Object.values(livePractices);

describe('live coding practice', () => {
  it.each(practices.map((practice) => [practice.track, practice]))(
    '%s has exercises and LeetCode problems for every seniority',
    (_track, practice) => {
      for (const { id } of SENIORITIES) {
        expect(practice.exercises[id].length).toBeGreaterThan(0);
        expect(practice.leetcode[id].length).toBeGreaterThan(0);
      }
    },
  );

  it.each(practices.map((practice) => [practice.track, practice]))(
    '%s has unique, storable exercise ids',
    (_track, practice) => {
      const ids = Object.values(practice.exercises)
        .flat()
        .map((exercise) => exercise.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const id of ids) {
        expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
        expect(exerciseKey(practice.track, id).length).toBeLessThanOrEqual(100);
      }
    },
  );

  it('links LeetCode problems by slug', () => {
    for (const practice of practices) {
      for (const problem of Object.values(practice.leetcode).flat()) {
        expect(problem.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      }
    }
  });

  it('stores solved exercises and problems as content marks', () => {
    expect(isValidContentMark('coding-exercise', 'solved')).toBe(true);
    expect(isValidContentMark('leetcode-problem', 'solved')).toBe(true);
  });
});

describe('getLivePractice', () => {
  it('returns the practice of a track that has one', () => {
    expect(getLivePractice('node')).toBe(livePractices.node);
  });

  it('returns undefined for unknown tracks and inherited keys', () => {
    expect(getLivePractice('cobol')).toBeUndefined();
    expect(getLivePractice('toString')).toBeUndefined();
  });
});
