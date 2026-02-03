// src/lib/animations.ts
// Configurações de animação iOS-style para uso consistente no app

export const springConfig = {
  stiff: { type: 'spring' as const, stiffness: 400, damping: 30 },
  gentle: { type: 'spring' as const, stiffness: 300, damping: 25 },
  bouncy: { type: 'spring' as const, stiffness: 500, damping: 25 },
};

export const easeConfig = {
  ios: [0.16, 1, 0.3, 1] as const,
  smooth: [0.4, 0, 0.2, 1] as const,
  sharp: [0.4, 0, 0.6, 1] as const,
};

export const durationConfig = {
  fast: 0.15,
  normal: 0.2,
  slow: 0.3,
};

// Preset animation variants
export const fadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const slideUpVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export const slideRightVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

export const scaleVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

// Tap feedback for interactive elements
export const tapFeedback = {
  whileTap: { scale: 0.97 },
};

export const tapFeedbackSubtle = {
  whileTap: { scale: 0.98 },
};

// Hover feedback for desktop
export const hoverFeedback = {
  whileHover: { scale: 1.02 },
};

// Combined presets
export const interactivePreset = {
  ...tapFeedback,
  ...hoverFeedback,
};

// Stagger children animations
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

// Reduced motion check helper
export const getReducedMotionConfig = (normalConfig: object, reducedConfig: object = {}) => {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return reducedConfig;
  }
  return normalConfig;
};
