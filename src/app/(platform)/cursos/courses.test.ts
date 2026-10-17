import { courseTeachers } from './courses';

describe('courseTeachers', () => {
  it('splits who taught a course into one name each', () => {
    expect(courseTeachers({ teachedBy: 'Agustín Sánchez, Marcelo Núñez e Iván Taddei' })).toEqual([
      'Agustín Sánchez',
      'Marcelo Núñez',
      'Iván Taddei',
    ]);
    expect(courseTeachers({ teachedBy: 'Lydia Hallie & Addy Osmani' })).toEqual([
      'Lydia Hallie',
      'Addy Osmani',
    ]);
  });
});
