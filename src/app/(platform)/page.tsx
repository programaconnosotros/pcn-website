import { InviteDevsToWork } from '@/components/home/invite-devs-to-work';
import { Heading2 } from '@/components/ui/heading-2';
import prisma from '@/lib/prisma';
import { MainSponsorCard } from '@components/home/main-sponsor-card';
import { MotivationalQuotes } from '@components/home/motivational-quotes';
import { Team } from '@components/landing/team';
import { Session, User } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { Button } from '@/components/ui/button';
import { Heading3 } from '@/components/ui/heading-3';
import { Paragraph } from '@/components/ui/paragraph';
import { Images, LogIn, ScrollText, UserPlus } from 'lucide-react';
import { Heading1 } from '@/components/ui/heading-1';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { GlassCardHover } from '@/components/home/glass-card-hover';
import { motion } from 'motion/react';
import HomeClientSide from './home-client-side';

// TODO: Add section to show our Instagram profile.
// TODO: Add section to show our YouTube channel.
// TODO: Add section to show our LinkedIn profile.

const Home = async () => {
  const sessionId = cookies().get('sessionId')?.value;

  let session: (Session & { user: User }) | null = null;

  if (sessionId) {
    session = await prisma.session.findUnique({
      where: {
        id: sessionId,
      },
      include: {
        user: true,
      },
    });
  }

  // Leer las imágenes de la carpeta gallery-photos
  const galleryPath = path.join(process.cwd(), 'public', 'gallery-photos');
  const files = fs.readdirSync(galleryPath);

  const images = files
    .filter((file) => /\.(webp|jpg|jpeg|png|gif)$/i.test(file))
    .map((file) => `/gallery-photos/${file}`);

  return <HomeClientSide session={session} />;
};

export default Home;
