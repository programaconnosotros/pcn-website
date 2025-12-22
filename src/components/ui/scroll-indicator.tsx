'use client';

import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
    window.addEventListener('scroll', checkScroll);
    
    // Verificar al cambiar el tamaño de la ventana
    window.addEventListener('resize', checkScroll);

    return () => {
      window.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-6 right-6 z-40 flex flex-col items-center gap-2 pointer-events-none"
        >
          <motion.div
            animate={{
              y: [0, 8, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="flex flex-col items-center gap-1"
          >
            <ChevronDown className="h-6 w-6 text-pcnPurple dark:text-pcnGreen" strokeWidth={2} />
            <ChevronDown className="h-6 w-6 text-pcnPurple dark:text-pcnGreen opacity-50 -mt-3" strokeWidth={2} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

