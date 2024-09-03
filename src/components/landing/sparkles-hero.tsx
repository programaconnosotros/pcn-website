'use client';
import React from 'react';
import { SparklesCore } from '../ui/sparkles';
import { Session } from 'next-auth';
import Link from 'next/link';
import { Button } from '../ui/button';
import { ArrowRightIcon, Eye } from 'lucide-react';
import { SignIn } from '../auth/sign-in';

export const SparklesHero = ({ session }: { session: Session }) => (
  <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden rounded-md bg-black">
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

      <p className="mt-6 max-w-xl px-6 text-center text-sm text-white sm:p-0 md:text-2xl">
        Conectá, aprende y crece con otros profesionales y estudiantes de ingeniería de software.
      </p>

      <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row">
        {session?.user ? (
          <Link href="/home" passHref>
            <Button className="flex flex-row items-center justify-between gap-3">
              <span>Ir a la plataforma</span>
              <ArrowRightIcon className="h-4 w-4" />
            </Button>
          </Link>
        ) : (
          <div className="flex flex-col items-center gap-4 md:flex-row">
            <SignIn />

            <Link href="/home" passHref>
              <Button
                variant="outline"
                className="flex flex-row items-center justify-between gap-2"
              >
                <span>Chusmear sin cuenta</span>
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  </div>
);
