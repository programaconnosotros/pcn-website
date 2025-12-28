'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ExternalLink, Github, Globe, Instagram, Linkedin, Twitter, Youtube } from 'lucide-react';
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
    <Card className="flex flex-col border-2 border-transparent bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:scale-[1.02] hover:border-pcnPurple hover:shadow-xl dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-800 dark:hover:border-pcnGreen dark:hover:shadow-pcnGreen/20">
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={imagePath} alt={influencer.name} />
            <AvatarFallback>{influencer.name.charAt(0)}</AvatarFallback>
          </Avatar>

          <div className="flex flex-col">
            <h3 className="mb-1 text-lg font-semibold leading-tight">{influencer.name}</h3>
            <div className="mt-1 flex flex-wrap gap-1">
              {influencer.specialties.map((specialty: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col">
        <p className="mb-4 text-sm">{influencer.description}</p>

        <div className="flex flex-wrap gap-2">
          {Object.entries(influencer.platforms).map(([platform, url]) => {
            if (!url) return null;
            const Icon = PlatformIcon[platform] || ExternalLink;
            return (
              <Link key={platform} href={url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span>{PlatformLabel[platform] || platform}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
