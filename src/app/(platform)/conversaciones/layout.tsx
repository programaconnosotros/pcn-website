import type { Metadata } from 'next';
import { conversationOgImagePath } from '@/components/conversations/conversation-share';
import { OG_SIZE } from '@/lib/og/size';
import { tabTitle } from '@/lib/tab-title';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

const description =
  'Las mejores conversaciones del WhatsApp de la comunidad: debates técnicos, anécdotas y momentos memorables entre apasionados por el software.';

// The page swaps these for the conversation's own when the link carries `?c=<hash>`.
const image = {
  url: conversationOgImagePath(null),
  ...OG_SIZE,
  alt: 'Conversaciones · programaConNosotros',
};

export const metadata: Metadata = {
  title: tabTitle.ls('conversaciones'),
  description,
  openGraph: {
    title: 'Conversaciones de la comunidad | programaConNosotros',
    description,
    url: `${SITE_URL}/conversaciones`,
    type: 'website',
    siteName: 'programaConNosotros',
    images: [image],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Conversaciones de la comunidad | programaConNosotros',
    description,
    images: [image],
  },
};

const ConversacionesLayout = ({ children }: { children: React.ReactNode }) => <>{children}</>;

export default ConversacionesLayout;
