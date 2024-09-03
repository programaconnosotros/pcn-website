'use client';
import React from 'react';
import { Vortex } from '../ui/vortex';
import { SignIn } from '@/components/auth/sign-in';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Session } from 'next-auth';
import { ArrowRightIcon } from 'lucide-react';

export const Hero = ({ session }: { session: Session | null }) => {
  return (
    <div className="h-screen w-full overflow-hidden rounded-md">
      <Vortex
        rangeY={800}
        particleCount={100}
        baseHue={120}
        className="flex h-full w-full flex-col items-center justify-center px-2 py-4 md:px-10"
        baseSpeed={0.001}
      >
        <h2 className="text-center font-mono text-2xl font-bold text-white md:text-6xl">
          <code>programaConNosotros</code>
        </h2>

        <p className="mt-6 max-w-xl text-center text-sm text-white md:text-2xl">
          Conectá, aprende y crece con otros profesionales y estudiantes de ingeniería de software.
        </p>

        <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row">
          {session?.user ? (
            <Link href="/home">
              <Button className="flex flex-row items-center justify-between gap-3">
                <span>Ir a la plataforma</span>
                <ArrowRightIcon className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <div className="flex flex-row gap-4">
              <SignIn />

              <Link href="/home">
                <Button
                  variant="outline"
                  className="flex flex-row items-center justify-between gap-3"
                >
                  <span>Chusmear sin cuenta</span>
                  <ArrowRightIcon className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </Vortex>
    </div>
  );
};
