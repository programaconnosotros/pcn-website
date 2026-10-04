import { communityCourses, externalCourses, getCourseById } from './courses';

describe('getCourseById', () => {
  it('finds community and external courses', () => {
    expect(getCourseById(communityCourses[0].id)).toBe(communityCourses[0]);
    expect(getCourseById(externalCourses[0].id)).toBe(externalCourses[0]);
  });

  it('returns undefined for an unknown id', () => {
    expect(getCourseById('no-existe')).toBeUndefined();
  });

  it('has unique ids across both lists', () => {
    const ids = [...communityCourses, ...externalCourses].map((course) => course.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
