'use client';
import React from 'react';
import { SparklesCore } from '../ui/sparkles';
import { Session } from 'next-auth';
import Link from 'next/link';
import { Button } from '../ui/button';
import { ArrowRightIcon, Eye } from 'lucide-react';
import { SignIn } from '../auth/sign-in';
import { ScrollArrow } from '@/components/landing/scroll-arrow';

export const SparklesHero = ({ session }: { session: Session | null }) => (
  <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
    <div className="absolute inset-0 h-screen w-full">
      <SparklesCore
        id="tsparticlesfullpage"
        background="transparent"
        minSize={0.6}
        maxSize={1.4}
        particleDensity={100}
        className="h-full w-full"
        particleColor="#FFFFFF"
      />
    </div>

    <div className="relative z-10 flex w-full flex-col items-center">
      <h2 className="text-center font-mono text-2xl font-bold text-white md:text-6xl">
        <code>programaConNosotros</code>
      </h2>

      <p className="mt-6 max-w-xl text-center text-sm text-white md:text-2xl">
        Conectá, aprende y crece con otros profesionales y estudiantes de ingeniería de software.
      </p>

      <div className="mt-6 flex w-full flex-col items-center gap-4">
        {session?.user ? (
          <Link href="/home" passHref className="w-full sm:w-auto">
            <Button className="mx-auto flex w-full flex-row items-center justify-center gap-3 sm:w-auto">
              <span>Ir a la plataforma</span>
              <ArrowRightIcon className="h-4 w-4" />
            </Button>
          </Link>
        ) : (
          <div className="flex w-full flex-col items-center gap-4 sm:flex-row">
            <SignIn />
            <Link href="/home" passHref className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="flex w-full flex-row items-center justify-center gap-2 sm:w-auto"
              >
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
