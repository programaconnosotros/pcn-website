// Fixtures for the talk component tests.
import type { TalkWithEvent } from '@/components/talks/community-talks';

type Speaker = TalkWithEvent['speakers'][number];

export const buildSpeaker = (overrides: Partial<Speaker> = {}): Speaker => ({
  id: 's1',
  talkId: 't1',
  userId: null,
  speakerName: 'Ada Lovelace',
  isProfessional: false,
  jobTitle: null,
  enterprise: null,
  isStudent: false,
  career: null,
  studyPlace: null,
  order: 0,
  createdAt: new Date('2030-01-01T00:00:00Z'),
  updatedAt: new Date('2030-01-01T00:00:00Z'),
  user: null,
  ...overrides,
});

export const buildTalk = (overrides: Partial<TalkWithEvent> = {}): TalkWithEvent => ({
  id: 't1',
  eventId: 'e1',
  proposalId: null,
  title: 'Intro a React',
  description: 'Una charla introductoria',
  manualEventTitle: null,
  manualEventDate: null,
  manualEventLocation: null,
  order: 0,
  portraitUrl: null,
  slidesUrl: null,
  slideImages: [],
  videoUrl: null,
  createdAt: new Date('2030-01-01T00:00:00Z'),
  updatedAt: new Date('2030-01-01T00:00:00Z'),
  event: {
    id: 'e1',
    name: 'Meetup PCN',
    date: new Date('2030-05-10T12:00:00Z'),
    placeName: 'Bar XYZ',
    city: 'Córdoba',
    isOnline: false,
  },
  speakers: [buildSpeaker()],
  ...overrides,
});
