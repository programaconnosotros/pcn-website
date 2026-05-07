import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export const metadata: Metadata = {
  title: 'Conversaciones',
  description:
    'Las mejores conversaciones del WhatsApp de la comunidad: debates técnicos, anécdotas y momentos memorables entre apasionados por el software.',
  openGraph: {
    title: 'Conversaciones de la comunidad | programaConNosotros',
    description:
      'Las mejores conversaciones del WhatsApp de la comunidad: debates técnicos, anécdotas y momentos memorables entre apasionados por el software.',
    images: [`${SITE_URL}/pcn-link-preview.png`],
    url: `${SITE_URL}/conversaciones`,
    type: 'website',
    siteName: 'programaConNosotros',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Conversaciones de la comunidad | programaConNosotros',
    description:
      'Las mejores conversaciones del WhatsApp de la comunidad: debates técnicos, anécdotas y momentos memorables entre apasionados por el software.',
    images: [`${SITE_URL}/pcn-link-preview.png`],
  },
};

const ConversacionesLayout = ({ children }: { children: React.ReactNode }) => <>{children}</>;

export default ConversacionesLayout;
