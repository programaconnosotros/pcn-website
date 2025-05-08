'use client';

import React from 'react';
import { Youtube, Instagram, Twitter, Linkedin, Github, ExternalLink, Globe } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Platform {
  youtube?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  github?: string;
  page?: string;
}

interface Followers {
  youtube?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  github?: string;
}

interface Influencer {
  id: string;
  name: string;
  image: string;
  description: string;
  platforms: Platform;
  specialties: string[];
  followers: Followers;
}

const PlatformIcon: Record<string, React.ComponentType<any>> = {
  youtube: Youtube,
  instagram: Instagram,
  twitter: Twitter,
  linkedin: Linkedin,
  github: Github,
  page: Globe,
};

export function InfluencerCard({ influencer }: { influencer: Influencer }) {
  // Ajustar la ruta de la imagen para que apunte al directorio correcto
  const imagePath = influencer.image.startsWith('/')
    ? influencer.image
    : `/influencers/${influencer.image}`;

  return (
    <Card className="w-full bg-gray-50 dark:bg-transparent">
      <CardHeader className="flex flex-row items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={imagePath} alt={influencer.name} />
            <AvatarFallback>{influencer.name.charAt(0)}</AvatarFallback>
          </Avatar>

          <div className="flex flex-col">
            <h3 className="text-lg font-semibold leading-tight">{influencer.name}</h3>
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

      <CardContent className="px-4 py-3">
        <p className="mb-4 text-sm">{influencer.description}</p>

        <div className="flex flex-wrap gap-2">
          {Object.entries(influencer.platforms).map(([platform, url]) => {
            if (!url) return null;
            const Icon = PlatformIcon[platform] || ExternalLink;
            const followerCount =
              influencer.followers[platform as keyof typeof influencer.followers];

            return (
              <Link key={platform} href={url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span className="capitalize">{platform}</span>
                  {followerCount && <span className="ml-1 text-xs">({followerCount})</span>}
                </Button>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
