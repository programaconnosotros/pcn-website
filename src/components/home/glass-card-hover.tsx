'use client';

import { useEffect } from 'react';

export const GlassCardHover = () => {
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const cards = document.querySelectorAll('.group');

      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const gradient = card.querySelector('.glass-card-gradient-hover') as HTMLDivElement;
        if (gradient) {
          gradient.style.setProperty('--x', `${x}px`);
          gradient.style.setProperty('--y', `${y}px`);
        }
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return null;
};
