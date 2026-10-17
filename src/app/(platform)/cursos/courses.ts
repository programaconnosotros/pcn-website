import { splitPeople } from '@/lib/people-names';

// The courses themselves live in the database (Recommendation, kind COURSE): read them with
// `getCourses` and `getCourseById` from `@/lib/recommendations`.

export type Course = {
  id: string;
  name: string;
  description: string;
  logo?: string;
  youtubeUrls?: Array<string>;
  websiteUrl?: string;
  teachedBy: string;
  acceptDonations: boolean;
  isMadeByCommunity: boolean;
  date: Date;
  hours?: number;
};

/** Who taught a course, one name each. */
export const courseTeachers = (course: Pick<Course, 'teachedBy'>) => splitPeople(course.teachedBy);
