'use client';

import { createContext, useContext } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { LinkedUser } from '@/lib/identity-links';
import { cn } from '@/lib/utils';

/** WhatsApp member name → the platform user an admin linked it to. */
export const ProfileLinksContext = createContext<Record<string, LinkedUser>>({});

interface ParticipantChipProps {
  name: string;
  active: boolean;
  onClick: () => void;
  title?: string;
}

// `@name` filters the conversations by that person; members linked to a platform user also get
// an arrow straight to their profile.
export function ParticipantChip({ name, active, onClick, title }: ParticipantChipProps) {
  const profile = useContext(ProfileLinksContext)[name];

  return (
    <span
      className={cn(
        'inline-flex border leading-5 transition-colors',
        active ? 'border-pcnGreen bg-pcnGreen/15 text-pcnGreen' : 'border-pcnGreen-200',
      )}
    >
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        title={title}
        className={cn(
          'px-1.5 transition-colors',
          !active && 'text-muted-foreground hover:text-pcnGreen',
        )}
      >
        <span className="text-pcnGreen-600">@</span>
        {name}
      </button>
      {profile && (
        <Link
          href={`/perfil/${profile.id}`}
          title={`Ver el perfil de ${profile.name}`}
          className="flex items-center border-l border-pcnGreen-200 px-1 text-pcnGreen-600 transition-colors hover:bg-pcnGreen/15 hover:text-pcnGreen"
        >
          <ArrowUpRight className="size-3" />
          <span className="sr-only">Ver el perfil de {profile.name}</span>
        </Link>
      )}
    </span>
  );
}
