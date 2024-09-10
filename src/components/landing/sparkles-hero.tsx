'use client';
import React from 'react';
import { SparklesCore } from '../ui/sparkles';
import { Session } from 'next-auth';
import Link from 'next/link';
import { Button } from '../ui/button';
import { ArrowRightIcon, Eye } from 'lucide-react';
import { SignIn } from '../auth/sign-in';
import { ScrollArrow } from '@/components/landing/scroll-arrow';
import { TextGenerateEffect } from '@/components/ui/text-generate-effect';
import { GlowingText } from '../ui/glowing-text';

export const SparklesHero = ({ session }: { session: Session | null }) => (
  <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
    <div className="absolute inset-0 h-screen w-full">
      <SparklesCore
        id="tsparticlesfullpage"
        background="000000"
        minSize={0.6}
        maxSize={1.4}
        particleDensity={100}
        className="h-full w-full"
        particleColor="#04f4be"
      />
    </div>

    <div className="relative z-10 flex w-full flex-col items-center">
      <GlowingText>programaConNosotros</GlowingText>

      <TextGenerateEffect
        className="mt-6 max-w-xl px-6 text-center text-sm text-white md:px-0 md:text-2xl"
        words={'¡Somos la comunidad que necesitás para llevar tu carrera al siguiente nivel! 🚀⚡️'}
      />

      <div className="mt-6 flex w-full justify-center px-4 sm:px-0">
        {session?.user ? (
          <Link href="/home" passHref className="flex w-full justify-center sm:w-auto">
            <Button className="flex flex-row items-center justify-center gap-3">
              <span>Ir a la plataforma</span>
              <ArrowRightIcon className="h-4 w-4" />
            </Button>
          </Link>
        ) : (
          <div className="flex w-full flex-col items-center justify-center gap-4">
            <div className="flex w-full justify-center">
              <SignIn />
            </div>

            <Link href="/home" passHref className="flex w-full justify-center">
              <Button variant="outline" className="flex flex-row items-center justify-center gap-2">
                <span>Chusmear sin cuenta</span>
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>

    <ScrollArrow />
  </div>
);
