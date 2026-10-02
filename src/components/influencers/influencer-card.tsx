'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ruledCellClassName } from '@/components/ui/ruled-grid';
import { cn } from '@/lib/utils';
import { ExternalLink, Github, Globe, Instagram, Linkedin, Youtube } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

interface Platform {
  youtube?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  github?: string;
  page?: string;
}

interface Influencer {
  id: string;
  name: string;
  image: string;
  description: string;
  platforms: Platform;
  specialties: string[];
}

const PlatformIcon: Record<string, React.ComponentType<any>> = {
  youtube: Youtube,
  instagram: Instagram,
  twitter: Globe,
  linkedin: Linkedin,
  github: Github,
  page: Globe,
};

const PlatformLabel: Record<string, string> = {
  youtube: 'YouTube',
  instagram: 'Instagram',
  twitter: 'X',
  linkedin: 'LinkedIn',
  github: 'GitHub',
  page: 'Página',
};

export function InfluencerCard({ influencer }: { influencer: Influencer }) {
  // Ajustar la ruta de la imagen para que apunte al directorio correcto
  const imagePath = influencer.image.startsWith('/')
    ? influencer.image
    : `/influencers/${influencer.image}`;

  return (
    <div className={cn(ruledCellClassName, 'flex gap-3 p-3')}>
      <Avatar className="h-9 w-9 shrink-0 rounded-sm">
        <AvatarImage src={imagePath} alt={influencer.name} />
        <AvatarFallback className="rounded-sm font-mono text-xs">
          {influencer.name.charAt(0)}
        </AvatarFallback>
      </Avatar>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2 font-mono text-sm">
          <h3 className="truncate font-semibold">{influencer.name}</h3>
          <div className="ml-auto flex shrink-0 items-center gap-1.5">
            {Object.entries(influencer.platforms).map(([platform, url]) => {
              if (!url) return null;
              const Icon = PlatformIcon[platform] || ExternalLink;
              return (
                <Link
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={PlatformLabel[platform] || platform}
                  title={PlatformLabel[platform] || platform}
                  className="text-muted-foreground transition-colors hover:text-pcnGreen"
                >
                  <Icon className="h-3.5 w-3.5" />
                </Link>
              );
            })}
          </div>
        </div>

        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {influencer.description}
        </p>

        <p className="truncate font-mono text-[11px] text-muted-foreground/70">
          <span className="text-pcnGreen-500"># </span>
          {influencer.specialties.join(' · ')}
        </p>
      </div>
    </div>
  );
}
