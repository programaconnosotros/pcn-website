import { render } from '@testing-library/react';
import prisma from '@/lib/prisma';
import EventRegistrationPage from './page';
import Loading from './loading';

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: { event: { findUnique: jest.fn() } },
}));

const visit = (autoRegister?: string) =>
  EventRegistrationPage({
    params: Promise.resolve({ id: 'e1' }),
    searchParams: Promise.resolve(autoRegister === undefined ? {} : { autoRegister }),
  });

describe('EventRegistrationPage', () => {
  it('sends people to the external registration when the event has one', async () => {
    jest
      .mocked(prisma.event.findUnique)
      .mockResolvedValue({ externalRegistrationUrl: 'https://tickets.test' } as never);
    await expect(visit('true')).rejects.toThrow('NEXT_REDIRECT:https://tickets.test');
  });

  it('opens the event asking to register automatically', async () => {
    jest
      .mocked(prisma.event.findUnique)
      .mockResolvedValue({ externalRegistrationUrl: null } as never);
    await expect(visit('true')).rejects.toThrow('NEXT_REDIRECT:/eventos/e1?autoRegister=true');
  });

  it('opens the event otherwise, even when it does not exist', async () => {
    jest.mocked(prisma.event.findUnique).mockResolvedValue(null);
    await expect(visit()).rejects.toThrow(/^NEXT_REDIRECT:\/eventos\/e1$/);
    await expect(visit('false')).rejects.toThrow(/^NEXT_REDIRECT:\/eventos\/e1$/);
  });

  it('loads with placeholders only', () => {
    const { container } = render(<Loading />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
    expect(container).toHaveTextContent('');
  });
});
