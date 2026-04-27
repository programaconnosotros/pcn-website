'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

type Props = {
  phone: string;
  speakerName: string;
  talkTitle: string;
  eventName: string;
};

export function WhatsappSpeakerButton({ phone, speakerName, talkTitle, eventName }: Props) {
  const message = encodeURIComponent(
    `Hola ${speakerName}, te escribimos desde PCN por tu propuesta de charla "${talkTitle}" para el evento ${eventName}.`,
  );
  const href = `https://wa.me/${phone}?text=${message}`;

  return (
    <Link href={href} target="_blank" rel="noopener noreferrer">
      <Button size="sm" variant="outline" className="gap-2">
        <MessageCircle className="h-4 w-4" />
        WhatsApp
      </Button>
    </Link>
  );
}
