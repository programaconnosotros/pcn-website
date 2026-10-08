'use client';

import { useEffect, useState } from 'react';
import { ChevronsDown } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { ScrollHudButton } from './scroll-hud-button';

export const ScrollIndicator = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      const isAtTop = window.scrollY === 0;
      const hasScrollableContent = document.documentElement.scrollHeight > window.innerHeight;

      setIsVisible(isAtTop && hasScrollableContent);
    };

    // Verificar al cargar
    checkScroll();

    // Verificar al hacer scroll
    window.addEventListener('scroll', checkScroll, { passive: true });

    // Verificar al cambiar el tamaño de la ventana
    window.addEventListener('resize', checkScroll);

    return () => {
      window.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  const scrollDown = () => {
    window.scrollBy({ top: window.innerHeight * 0.85, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <ScrollHudButton
          onClick={scrollDown}
          label="Bajar"
          code="DN"
          icon={
            <motion.span
              className="block motion-reduce:transform-none!"
              animate={{ y: [-2, 2, -2] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ChevronsDown className="h-4 w-4" strokeWidth={2.25} />
            </motion.span>
          }
        />
      )}
    </AnimatePresence>
  );
};
