import { eventSchema } from './event-schema';

const baseEvent = {
  name: 'Café Virtual',
  description: 'Charla sobre tecnología.',
  date: '2026-10-02T20:00:00.000Z',
  isOnline: true,
  streamingUrl: 'https://meet.google.com/jmg-uaxv-vmt',
};

describe('eventSchema shortcut', () => {
  it('accepts the already-parsed client output when no shortcut was entered', () => {
    const clientOutput = eventSchema.parse({ ...baseEvent, shortcut: '' });

    expect(clientOutput.shortcut).toBeUndefined();
    expect(() => eventSchema.parse(clientOutput)).not.toThrow();
  });

  it('normalizes a provided shortcut', () => {
    expect(eventSchema.parse({ ...baseEvent, shortcut: ' CoWork ' }).shortcut).toBe('cowork');
  });
});
