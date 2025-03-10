'use client';
import React from 'react';
import { SparklesCore } from '../ui/sparkles';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Eye, UserPlus, LogIn, User } from 'lucide-react';
import { ScrollArrow } from '@/components/landing/scroll-arrow';
import { TextGenerateEffect } from '@/components/ui/text-generate-effect';
import { GlowingText } from '../ui/glowing-text';

export const Hero = () => (
  <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black">
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

    {/* Add this new div for the gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70" />

    <div className="relative z-10 flex w-full flex-col items-center">
      <GlowingText>programaConNosotros</GlowingText>

      <TextGenerateEffect
        className="mt-6 max-w-xl px-6 text-center text-white md:px-0 md:text-2xl"
        words={'¡Somos la comunidad que necesitás para llevar tu carrera al siguiente nivel!'}
      />

      <div className="mt-6 flex w-full justify-center px-4 sm:px-0">
        <div className="flex w-full flex-col items-center justify-center gap-4">
          <div className="flex w-full flex-row justify-center gap-4">
            <Link href="/auth/sign-in" passHref>
              <Button className="flex flex-row items-center justify-center gap-2">
                <span>Ingresar</span>
                <LogIn className="h-4 w-4" />
              </Button>
            </Link>

            <Link href="/auth/sign-up" passHref>
              <Button variant="outline" className="flex flex-row items-center justify-center gap-2">
                <span>Crear cuenta</span>
                <UserPlus className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <Link href="/home" passHref className="flex w-full justify-center">
            <Button variant="outline" className="flex flex-row items-center justify-center gap-2">
              <span>Chusmear sin cuenta</span>
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>

    <ScrollArrow />
  </div>
);
