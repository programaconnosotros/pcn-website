import { screen } from '@testing-library/react';
import { fetchEvent } from '@/actions/events/fetch-event';
import { NewTalkProposalForm } from '@/components/talk-proposals/new-talk-proposal-form';
import { findSession } from '@/lib/session';
import { mockCookies } from '@/test/cookies';
import { buildEvent } from '@/test/events';
import { buildSession, renderInPlatform } from '@/test/platform';
import ProponerCharlaPage, { metadata } from './page';

jest.mock('next/headers', () => ({ cookies: jest.fn() }));
jest.mock('@/lib/session', () => ({ findSession: jest.fn() }));
jest.mock('@/actions/events/fetch-event', () => ({ fetchEvent: jest.fn() }));
jest.mock('@/components/talk-proposals/new-talk-proposal-form', () => ({
  NewTalkProposalForm: jest.fn(() => <form aria-label="propuesta" />),
}));

const params = { params: Promise.resolve({ id: 'e1' }) };
const signInRedirect =
  'NEXT_REDIRECT:/autenticacion/iniciar-sesion?redirect=/eventos/e1/proponer-charla';

const signIn = (user: Record<string, unknown> = {}) => {
  mockCookies({ sessionId: 'token' });
  const session = buildSession();
  Object.assign(session.user, {
    phoneNumber: null,
    jobTitle: null,
    enterprise: null,
    career: null,
    studyPlace: null,
    ...user,
  });
  jest.mocked(findSession).mockResolvedValue(session as never);
};

describe('ProponerCharlaPage', () => {
  it('asks anonymous visitors to sign in first', async () => {
    mockCookies();
    await expect(ProponerCharlaPage(params)).rejects.toThrow(signInRedirect);
    expect(findSession).not.toHaveBeenCalled();
  });

  it('asks to sign in again when the session expired', async () => {
    mockCookies({ sessionId: 'stale' });
    jest.mocked(findSession).mockResolvedValue(null as never);
    await expect(ProponerCharlaPage(params)).rejects.toThrow(signInRedirect);
  });

  it('sends members back to the event when it does not take proposals', async () => {
    signIn();
    jest.mocked(fetchEvent).mockResolvedValue(buildEvent() as never);
    await expect(ProponerCharlaPage(params)).rejects.toThrow(/^NEXT_REDIRECT:\/eventos\/e1$/);

    jest.mocked(fetchEvent).mockResolvedValue(null);
    await expect(ProponerCharlaPage(params)).rejects.toThrow(/^NEXT_REDIRECT:\/eventos\/e1$/);
  });

  it('prefills the first speaker with a professional profile', async () => {
    signIn({ phoneNumber: '+54 9 381', jobTitle: 'Dev', enterprise: 'Acme', career: 'Sistemas' });
    jest
      .mocked(fetchEvent)
      .mockResolvedValue(buildEvent({ callForSpeakersEnabled: true }) as never);
    renderInPlatform(await ProponerCharlaPage(params));

    expect(screen.getByRole('form', { name: 'propuesta' })).toBeInTheDocument();
    expect(jest.mocked(NewTalkProposalForm).mock.calls[0][0]).toEqual({
      eventId: 'e1',
      defaults: {
        firstSpeaker: {
          userId: 'user-1',
          speakerName: 'Ana',
          speakerPhone: '+54 9 381',
          isProfessional: true,
          jobTitle: 'Dev',
          enterprise: 'Acme',
          isStudent: false,
          career: 'Sistemas',
          studyPlace: '',
        },
      },
    });
  });

  it('prefills a student profile with blanks for what is missing', async () => {
    signIn({ career: 'Sistemas', studyPlace: 'UTN' });
    jest
      .mocked(fetchEvent)
      .mockResolvedValue(buildEvent({ callForSpeakersEnabled: true }) as never);
    renderInPlatform(await ProponerCharlaPage(params));

    expect(jest.mocked(NewTalkProposalForm).mock.calls[0][0].defaults.firstSpeaker).toMatchObject({
      speakerPhone: '',
      isProfessional: false,
      jobTitle: '',
      enterprise: '',
      isStudent: true,
    });
  });

  it('has a tab title', () => {
    expect(metadata.title).toMatch(/proponer-charla/);
  });
});
