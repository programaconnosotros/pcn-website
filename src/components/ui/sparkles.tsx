'use client';
import React, { useId } from 'react';
import Particles, { ParticlesProvider, useParticlesProvider } from '@tsparticles/react';
import type { Container, ISourceOptions } from '@tsparticles/engine';
import { loadSlim } from '@tsparticles/slim';
import { cn } from '@/lib/utils';
import { motion, useAnimation } from 'motion/react';

type ParticlesProps = {
  id?: string;
  className?: string;
  background?: string;
  particleSize?: number;
  minSize?: number;
  maxSize?: number;
  speed?: number;
  particleColor?: string;
  particleDensity?: number;
};

// Twinkling dots that drift slowly; a click adds a few more. Only what differs from the
// tsParticles defaults.
const sparklesOptions = ({
  background,
  minSize,
  maxSize,
  speed,
  particleColor,
  particleDensity,
}: ParticlesProps): ISourceOptions => ({
  background: { color: { value: background || '#0d47a1' } },
  fullScreen: { enable: false, zIndex: 1 },
  fpsLimit: 120,
  interactivity: {
    events: { onClick: { enable: true, mode: 'push' } },
    modes: { push: { quantity: 4 } },
  },
  particles: {
    color: { value: particleColor || '#ffffff' },
    move: {
      enable: true,
      direction: 'none',
      outModes: { default: 'out' },
      speed: { min: 0.1, max: 1 },
    },
    number: {
      density: { enable: true, width: 400, height: 400 },
      value: particleDensity || 120,
    },
    opacity: {
      value: { min: 0.1, max: 1 },
      animation: { enable: true, speed: speed || 4, sync: false, startValue: 'random' },
    },
    shape: { type: 'circle' },
    size: { value: { min: minSize || 1, max: maxSize || 3 } },
  },
  detectRetina: true,
});

const Sparkles = (props: ParticlesProps) => {
  const { loaded } = useParticlesProvider();
  const controls = useAnimation();
  const generatedId = useId();

  // Fade in once the particles are drawn.
  const particlesLoaded = async (container?: Container) => {
    if (container) controls.start({ opacity: 1, transition: { duration: 1 } });
  };

  return (
    <motion.div animate={controls} className={cn('opacity-0', props.className)}>
      {loaded && (
        <Particles
          id={props.id || generatedId}
          className={cn('h-full w-full')}
          particlesLoaded={particlesLoaded}
          options={sparklesOptions(props)}
        />
      )}
    </motion.div>
  );
};

export const SparklesCore = (props: ParticlesProps) => (
  <ParticlesProvider init={loadSlim}>
    <Sparkles {...props} />
  </ParticlesProvider>
);
