// src/pages/HomePage/sections/HomeHero.tsx
// Full-screen hero section with Apple-style minimalism - no header, centered content

import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { getAppUrl } from '@/lib/domain';
import { hero } from '../data/home-copy';

const premiumEasing = [0.16, 1, 0.3, 1] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: premiumEasing,
    },
  },
};

export function HomeHero() {
  const handleScrollToFeatures = () => {
    const featuresSection = document.getElementById('funcionalidades');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      data-testid="home-hero"
      aria-label="Hero Section"
      className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Background with subtle gradient mesh */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background/95">
        {/* Subtle gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/3 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/3 rounded-full blur-[100px]" />
      </div>

      {/* Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col items-center justify-center text-center px-6 max-w-4xl mx-auto"
      >
        {/* Badge */}
        <motion.div variants={itemVariants}>
          <span
            data-testid="home-hero-badge"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-sm font-medium text-primary backdrop-blur-sm"
          >
            {hero.badge}
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={itemVariants}
          data-testid="home-hero-headline"
          className="mt-8 text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1]"
        >
          {hero.headline}
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={itemVariants}
          data-testid="home-hero-subheadline"
          className="mt-6 text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl leading-relaxed"
        >
          {hero.subheadline}
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={itemVariants}
          className="mt-10 flex flex-col sm:flex-row items-center gap-4"
        >
          {/* Primary CTA */}
          <motion.a
            href={getAppUrl('/login')}
            data-testid="home-hero-cta-primary"
            className="group inline-flex items-center justify-center gap-2 min-w-[200px] h-12 px-8 text-base font-semibold text-primary-foreground bg-primary rounded-lg shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 cursor-pointer"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2, ease: premiumEasing }}
          >
            {hero.ctas.primary}
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </motion.a>

          {/* Secondary CTA */}
          <motion.button
            onClick={handleScrollToFeatures}
            data-testid="home-hero-cta-secondary"
            className="inline-flex items-center justify-center min-w-[160px] h-12 px-8 text-base font-semibold text-foreground bg-transparent border-2 border-border rounded-lg hover:bg-muted/50 hover:border-primary/20 transition-all duration-200 cursor-pointer"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2, ease: premiumEasing }}
          >
            {hero.ctas.secondary}
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.button
        onClick={handleScrollToFeatures}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6, ease: premiumEasing }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        aria-label="Rolar para funcionalidades"
      >
        <span className="text-xs font-medium uppercase tracking-wider">Explore</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.button>
    </section>
  );
}
