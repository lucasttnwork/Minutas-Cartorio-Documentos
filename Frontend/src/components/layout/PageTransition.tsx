// src/components/layout/PageTransition.tsx

import { Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

const pageVariants = {
  initial: {
    opacity: 0,
  },
  in: {
    opacity: 1,
  },
  out: {
    opacity: 0,
  },
};

const pageTransition = {
  duration: 0.2,
  ease: [0.16, 1, 0.3, 1] as const,
};

// Minimal loading fallback that doesn't break the transition
function TransitionFallback() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className="min-h-full"
        style={{
          willChange: 'opacity',
          // Previne que animações afetem o layout de elementos fixos
          contain: 'layout',
        }}
      >
        <Suspense fallback={<TransitionFallback />}>
          {children}
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}
