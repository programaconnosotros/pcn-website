'use client';

import { useEffect, useState } from 'react';
import { ChevronsUp } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { ScrollHudButton } from './scroll-hud-button';

export const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      // Mostrar el botón cuando el usuario haya scrolleado más de 300px
      setIsVisible(window.scrollY > 300);
      setProgress(max > 0 ? Math.min(window.scrollY / max, 1) : 0);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);

    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <ScrollHudButton
          onClick={scrollToTop}
          label="Volver arriba"
          code={String(Math.round(progress * 100)).padStart(2, '0')}
          progress={progress}
          icon={<ChevronsUp className="h-4 w-4" strokeWidth={2.25} />}
        />
      )}
    </AnimatePresence>
  );
};
