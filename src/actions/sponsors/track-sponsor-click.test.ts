import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { enforceRateLimit } from '@/lib/rate-limit';
import { trackSponsorClick } from './track-sponsor-click';

jest.mock('@/lib/rate-limit', () => ({ enforceRateLimit: jest.fn() }));

describe('trackSponsorClick', () => {
  beforeEach(() => mockCookies());

  it("counts a click on one of the site's partners", async () => {
    await trackSponsorClick({ name: 'Dizenz', source: 'inicio' });

    expect(prismaMock.sponsorClick.create).toHaveBeenCalledWith({
      data: { name: 'Dizenz', eventId: null, source: 'inicio', userId: null },
    });
  });

  it('counts a click on an event sponsor, with who clicked when signed in', async () => {
    mockCookies({ sessionId: 's1' });
    prismaMock.session.findUnique.mockResolvedValue({ id: 's1', userId: 'u1', user: {} } as any);
    prismaMock.sponsor.findFirst.mockResolvedValue({ id: 'sp1' } as any);

    await trackSponsorClick({ name: 'Acme', eventId: 'e1', source: 'evento' });

    expect(prismaMock.sponsor.findFirst).toHaveBeenCalledWith({
      where: { eventId: 'e1', name: 'Acme', event: { deletedAt: null } },
      select: { id: true },
    });
    expect(prismaMock.sponsorClick.create).toHaveBeenCalledWith({
      data: { name: 'Acme', eventId: 'e1', source: 'evento', userId: 'u1' },
    });
  });

  it('ignores sponsors that do not exist and unknown places', async () => {
    prismaMock.sponsor.findFirst.mockResolvedValue(null);

    await trackSponsorClick({ name: 'Inventado', source: 'partners' });
    await trackSponsorClick({ name: 'Acme', eventId: 'e1', source: 'evento' });
    await trackSponsorClick({ name: 'Dizenz', source: 'spam' as never });

    expect(prismaMock.sponsorClick.create).not.toHaveBeenCalled();
  });

  it('drops the click silently when rate limited or the database fails', async () => {
    jest.mocked(enforceRateLimit).mockRejectedValueOnce(new Error('rate'));
    await expect(trackSponsorClick({ name: 'Dizenz', source: 'feed' })).resolves.toBeUndefined();
    expect(prismaMock.sponsorClick.create).not.toHaveBeenCalled();

    jest.spyOn(console, 'error').mockImplementation(() => {});
    prismaMock.sponsorClick.create.mockRejectedValue(new Error('db'));
    await expect(trackSponsorClick({ name: 'Dizenz', source: 'feed' })).resolves.toBeUndefined();
  });
});
