import { screen, within } from '@testing-library/react';
import { fetchEvent } from '@/actions/events/fetch-event';
import { fetchTalkProposals } from '@/actions/talk-proposals/fetch-talk-proposals';
import { ProposalStatusActions } from '@/components/talk-proposals/proposal-status-actions';
import { WhatsappSpeakerButton } from '@/components/talk-proposals/whatsapp-speaker-button';
import { getEventManager } from '@/lib/event-access';
import { buildEvent } from '@/test/events';
import { buildSession, renderInPlatform } from '@/test/platform';
import TalkProposalsPage, { generateMetadata } from './page';

jest.mock('@/lib/event-access', () => ({ getEventManager: jest.fn() }));
jest.mock('@/actions/events/fetch-event', () => ({ fetchEvent: jest.fn() }));
jest.mock('@/actions/talk-proposals/fetch-talk-proposals', () => ({
  fetchTalkProposals: jest.fn(),
}));
jest.mock('@/components/talk-proposals/whatsapp-speaker-button', () => ({
  WhatsappSpeakerButton: jest.fn(() => null),
}));
jest.mock('@/components/talk-proposals/proposal-status-actions', () => ({
  ProposalStatusActions: jest.fn(() => null),
}));

const params = { params: Promise.resolve({ id: 'e1' }) };

const speaker = (overrides: Record<string, unknown>) => ({
  id: 'sp',
  speakerName: 'Ana',
  speakerPhone: '+549381',
  isProfessional: false,
  jobTitle: null,
  enterprise: null,
  isStudent: false,
  career: null,
  studyPlace: null,
  ...overrides,
});

const proposal = (overrides: Record<string, unknown>) => ({
  id: 'p',
  title: 'Charla',
  description: 'De qué trata',
  status: 'PENDING',
  createdAt: new Date('2030-04-01T12:00:00Z'),
  talk: null,
  speakers: [],
  ...overrides,
});

const asManager = () => {
  jest.mocked(getEventManager).mockResolvedValue(buildSession().user as never);
  jest.mocked(fetchEvent).mockResolvedValue(buildEvent() as never);
};

const rowOf = (title: string) => screen.getByText(title).closest('tr')!;

describe('TalkProposalsPage', () => {
  it('sends people who do not manage the event back to it', async () => {
    jest.mocked(getEventManager).mockResolvedValue(null as never);
    await expect(TalkProposalsPage(params)).rejects.toThrow('NEXT_REDIRECT:/eventos/e1');
  });

  it('sends managers to the events list when the event is gone', async () => {
    jest.mocked(getEventManager).mockResolvedValue(buildSession().user as never);
    jest.mocked(fetchEvent).mockResolvedValue(null);
    await expect(TalkProposalsPage(params)).rejects.toThrow(/^NEXT_REDIRECT:\/eventos$/);
  });

  it('says when nobody has proposed a talk yet', async () => {
    asManager();
    jest.mocked(fetchTalkProposals).mockResolvedValue([]);
    renderInPlatform(await TalkProposalsPage(params));

    expect(screen.getByText(/propuestas · 0 total/)).toBeInTheDocument();
    expect(
      screen.getByText('Aún no hay propuestas de charlas para este evento.'),
    ).toBeInTheDocument();
  });

  it("lists each proposal with its speakers' profiles, status and actions", async () => {
    asManager();
    jest.mocked(fetchTalkProposals).mockResolvedValue([
      proposal({
        id: 'p1',
        title: 'Agentes en prod',
        status: 'ACCEPTED',
        talk: { id: 't1' },
        speakers: [
          speaker({
            id: 's1',
            speakerName: 'Pía',
            isProfessional: true,
            jobTitle: 'SRE',
            enterprise: 'Acme',
          }),
          speaker({
            id: 's2',
            speakerName: 'Esteban',
            isStudent: true,
            career: 'Sistemas',
            studyPlace: 'UTN',
          }),
        ],
      }),
      proposal({
        id: 'p2',
        title: 'Charla rechazada',
        status: 'REJECTED',
        speakers: [speaker({ id: 's3', speakerName: 'Nadia', isProfessional: true })],
      }),
      proposal({ id: 'p3', title: 'Charla pendiente' }),
    ] as never);
    renderInPlatform(await TalkProposalsPage(params));

    expect(screen.getByText(/propuestas · 3 total/)).toBeInTheDocument();
    const accepted = within(rowOf('Agentes en prod'));
    expect(accepted.getByText('Aceptada')).toBeInTheDocument();
    expect(accepted.getByText('Profesional')).toBeInTheDocument();
    expect(accepted.getByText('SRE')).toBeInTheDocument();
    expect(accepted.getByText('Estudiante')).toBeInTheDocument();
    expect(accepted.getByText('UTN')).toBeInTheDocument();

    const rejected = within(rowOf('Charla rechazada'));
    expect(rejected.getByText('Rechazada')).toBeInTheDocument();
    expect(rejected.getByText('Sin información adicional')).toBeInTheDocument();
    expect(within(rowOf('Charla pendiente')).getByText('Pendiente')).toBeInTheDocument();

    expect(jest.mocked(WhatsappSpeakerButton).mock.calls.map(([props]) => props)).toEqual([
      {
        phone: '+549381',
        speakerName: 'Pía',
        talkTitle: 'Agentes en prod',
        eventName: 'Meetup PCN',
      },
      {
        phone: '+549381',
        speakerName: 'Esteban',
        talkTitle: 'Agentes en prod',
        eventName: 'Meetup PCN',
      },
      {
        phone: '+549381',
        speakerName: 'Nadia',
        talkTitle: 'Charla rechazada',
        eventName: 'Meetup PCN',
      },
    ]);
    expect(jest.mocked(ProposalStatusActions).mock.calls[0][0]).toEqual({
      proposalId: 'p1',
      currentStatus: 'ACCEPTED',
      speakerName: 'Pía, Esteban',
      hasTalk: true,
    });
    expect(jest.mocked(ProposalStatusActions).mock.calls[2][0]).toMatchObject({ hasTalk: false });
  });

  it('has a tab title', async () => {
    expect((await generateMetadata()).title).toMatch(/propuestas-de-charlas/);
  });
});
