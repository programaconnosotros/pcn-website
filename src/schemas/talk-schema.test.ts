import { talkSchema, talkSpeakerSchema } from './talk-schema';

const speaker = {
  speakerName: 'Ana Pérez',
  isProfessional: true,
  jobTitle: 'Dev',
  enterprise: 'ACME',
};

const talk = {
  title: 'Testing con Jest',
  description: 'Cómo testear una app de Next.',
  speakers: [speaker],
};

const messages = (input: unknown) =>
  talkSchema.safeParse(input).error?.issues.map((issue) => issue.message) ?? [];

describe('talkSpeakerSchema', () => {
  it('defaults the phone and normalizes the optional fields', () => {
    expect(talkSpeakerSchema.parse({ ...speaker, userId: null })).toEqual({
      ...speaker,
      userId: null,
      speakerPhone: '',
      isStudent: false,
      career: undefined,
      studyPlace: undefined,
    });
  });

  it('requires choosing professional or student, with their fields', () => {
    const issues = (input: unknown) =>
      talkSpeakerSchema.safeParse(input).error?.issues.map((issue) => issue.message);
    expect(issues({ speakerName: 'Ana' })).toEqual([
      'Debés seleccionar al menos una opción: profesional o estudiante',
    ]);
    expect(issues({ speakerName: 'Ana', isProfessional: true })).toEqual([
      'El rol es requerido para profesionales',
      'La empresa es requerida para profesionales',
    ]);
    expect(issues({ speakerName: 'Ana', isStudent: true, career: '' })).toEqual([
      'La carrera es requerida para estudiantes',
      'La universidad es requerida para estudiantes',
    ]);
  });
});

describe('talkSchema', () => {
  it('accepts a talk and fills the defaults', () => {
    const parsed = talkSchema.parse(talk);
    expect(parsed).toMatchObject({ order: 0, slideImages: [] });
    expect(parsed.manualEventTitle).toBeUndefined();
    expect(parsed.manualEventDate).toBeUndefined();
    expect(parsed.portraitUrl).toBeUndefined();
  });

  it('trims the manual event fields and drops empty ones', () => {
    const parsed = talkSchema.parse({
      ...talk,
      manualEventTitle: '  Meetup 2019  ',
      manualEventLocation: '   ',
    });
    expect(parsed.manualEventTitle).toBe('Meetup 2019');
    expect(parsed.manualEventLocation).toBeUndefined();
    expect(messages({ ...talk, manualEventTitle: 'a'.repeat(201) })).toEqual([
      'El título del evento no puede exceder 200 caracteres',
    ]);
  });

  it('turns the manual date into noon UTC of that day', () => {
    expect(talkSchema.parse({ ...talk, manualEventDate: '2019-11-23' }).manualEventDate).toEqual(
      new Date('2019-11-23T12:00:00.000Z'),
    );
    expect(talkSchema.parse({ ...talk, manualEventDate: '' }).manualEventDate).toBeUndefined();
  });

  it.each([['2019-02-30'], ['2019-13-01'], ['23/11/2019'], ['2019-1-1']])(
    'rejects the impossible or malformed date %s',
    (manualEventDate) => {
      expect(messages({ ...talk, manualEventDate })).toEqual(['La fecha del evento no es válida']);
    },
  );

  it('accepts a leap day', () => {
    expect(talkSchema.safeParse({ ...talk, manualEventDate: '2024-02-29' }).success).toBe(true);
  });

  it('validates the media URLs and treats empty ones as none', () => {
    const parsed = talkSchema.parse({
      ...talk,
      portraitUrl: '',
      slidesUrl: 'https://slides.com/x',
      videoUrl: '',
      slideImages: ['https://cdn/1.png'],
    });
    expect(parsed).toMatchObject({
      portraitUrl: undefined,
      slidesUrl: 'https://slides.com/x',
      videoUrl: undefined,
    });
    expect(
      messages({ ...talk, portraitUrl: 'x', slidesUrl: 'y', videoUrl: 'z', slideImages: ['w'] }),
    ).toEqual([
      'La URL de la foto no es válida',
      'La URL de slides no es válida',
      'Cada imagen debe ser una URL válida',
      'La URL del video no es válida',
    ]);
  });

  it('rejects a negative order, a non-cuid event and an empty speaker list', () => {
    expect(talkSchema.safeParse({ ...talk, order: -1 }).success).toBe(false);
    expect(talkSchema.safeParse({ ...talk, eventId: 'x' }).success).toBe(false);
    expect(messages({ ...talk, speakers: [] })).toEqual(['Agregá al menos un orador']);
  });
});
