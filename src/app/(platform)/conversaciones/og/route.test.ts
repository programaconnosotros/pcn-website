import type { NextRequest } from 'next/server';
import { conversations } from '@/data/whatsapp-conversations';
import { shortHash } from '@/components/conversations/conversation-utils';
import { readOgImage } from '@/test/pages-a-l';
import { GET } from './route';

jest.mock('next/og', () => require('@/test/pages-a-l').nextOgMock);

const request = (query = '') =>
  ({
    nextUrl: new URL(`https://programaconnosotros.com/conversaciones/og${query}`),
  }) as NextRequest;

describe('GET /conversaciones/og', () => {
  it('renders the conversation title for a shared link', async () => {
    const conversation = conversations[0];
    const { options, text } = await readOgImage(GET(request(`?c=${shortHash(conversation)}`)));
    expect(options).toMatchObject({ width: 1200, height: 630 });
    expect(text).toContain('~/conversaciones');
    expect(text).toContain(`git show ${shortHash(conversation)}`);
  });

  it('falls back to the section card', async () => {
    const { text } = await readOgImage(GET(request('?c=nope')));
    expect(text).toContain('Conversaciones');
  });
});
