import { talkProposalSchema, talkProposalSpeakerSchema } from './talk-proposal-schema';

const professional = {
  speakerName: 'Ana Pérez',
  speakerPhone: '5493815123456',
  isProfessional: true,
  jobTitle: 'Dev',
  enterprise: 'ACME',
};

const messages = (input: unknown) =>
  talkProposalSpeakerSchema.safeParse(input).error?.issues.map((issue) => issue.message) ?? [];

describe('talkProposalSpeakerSchema', () => {
  it('accepts a professional speaker and normalizes the optional fields', () => {
    const parsed = talkProposalSpeakerSchema.parse({ ...professional, career: '' });
    expect(parsed).toMatchObject({ ...professional, userId: null, isStudent: false });
    expect(parsed.career).toBeUndefined();
    expect(parsed.studyPlace).toBeUndefined();
  });

  it('accepts a student speaker', () => {
    const student = {
      speakerName: 'Beto',
      speakerPhone: '12345678',
      isProfessional: null,
      isStudent: true,
      career: 'Sistemas',
      studyPlace: 'UTN',
    };
    expect(talkProposalSpeakerSchema.parse(student)).toMatchObject({ isProfessional: false });
  });

  it('requires choosing professional or student', () => {
    expect(messages({ speakerName: 'Ana', speakerPhone: '12345678' })).toEqual([
      'Debés seleccionar al menos una opción: profesional o estudiante',
    ]);
  });

  it('requires the role and company for professionals', () => {
    expect(messages({ ...professional, jobTitle: '', enterprise: undefined })).toEqual([
      'El rol es requerido para profesionales',
      'La empresa es requerida para profesionales',
    ]);
  });

  it('requires the career and university for students', () => {
    expect(messages({ ...professional, isStudent: true })).toEqual([
      'La carrera es requerida para estudiantes',
      'La universidad es requerida para estudiantes',
    ]);
  });

  it.each([
    ['1234567', 'El teléfono debe tener al menos 8 dígitos'],
    ['1234567890123456', 'El teléfono no puede exceder 15 dígitos'],
    ['+54 381 123', 'El teléfono debe contener solo dígitos'],
  ])('rejects the phone %s', (speakerPhone, message) => {
    expect(messages({ ...professional, speakerPhone })[0]).toContain(message);
  });

  // BUG: the transform maps '' to null, but .cuid() runs first and rejects ''.
  it('treats an empty user id as no linked user', () => {
    expect(talkProposalSpeakerSchema.parse({ ...professional, userId: '' }).userId).toBeNull();
  });

  it('rejects a userId that is not a cuid', () => {
    expect(talkProposalSpeakerSchema.safeParse({ ...professional, userId: 'x' }).success).toBe(
      false,
    );
  });
});

describe('talkProposalSchema', () => {
  const proposal = {
    title: 'Testing con Jest',
    description: 'Cómo testear una app de Next.',
    speakers: [professional],
  };

  it('accepts a proposal with at least one speaker', () => {
    expect(talkProposalSchema.safeParse(proposal).success).toBe(true);
  });

  it('requires a speaker, a title and a description', () => {
    const result = talkProposalSchema.safeParse({
      title: 'ab',
      description: 'corta',
      speakers: [],
    });
    expect(result.error?.issues.map((issue) => issue.message)).toEqual([
      'El título debe tener al menos 3 caracteres',
      'La descripción debe tener al menos 10 caracteres',
      'Agregá al menos un orador',
    ]);
  });
});
