// src/pages/HomePage/sections/HomeFuncionalidades.tsx
// Features section with bento grid layout

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { funcionalidades } from '../data/home-copy';

const premiumEasing = [0.16, 1, 0.3, 1] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: premiumEasing,
    },
  },
};

export function HomeFuncionalidades() {
  return (
    <section
      id="funcionalidades"
      data-testid="home-funcionalidades"
      aria-label="Funcionalidades"
      className="relative w-full py-24 lg:py-32 overflow-hidden bg-background"
    >
      {/* Subtle background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
        <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-primary/3 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: premiumEasing }}
          className="text-center mb-16"
        >
          {/* Badge */}
          <span
            data-testid="home-funcionalidades-badge"
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-secondary/50 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4"
          >
            {funcionalidades.badge}
          </span>

          {/* Headline */}
          <h2
            data-testid="home-funcionalidades-headline"
            className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground"
          >
            {funcionalidades.headline}
          </h2>

          {/* Subheadline */}
          <p
            data-testid="home-funcionalidades-subheadline"
            className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto"
          >
            {funcionalidades.subheadline}
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {funcionalidades.features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                data-testid={`home-feature-${index}`}
                className={cn(
                  'group relative p-6 rounded-2xl',
                  'bg-card/50 backdrop-blur-sm',
                  'border border-border/50',
                  'shadow-sm',
                  'transition-all duration-300',
                  'hover:shadow-lg hover:shadow-primary/5',
                  'hover:border-primary/20',
                  'hover:-translate-y-1 hover:scale-[1.02]'
                )}
              >
                {/* Glassmorphism hover effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative z-10">
                  {/* Icon Container */}
                  <div
                    className={cn(
                      'inline-flex items-center justify-center',
                      'w-12 h-12 rounded-xl mb-4',
                      'bg-gradient-to-br from-primary/10 to-primary/5',
                      'border border-primary/10',
                      'group-hover:from-primary/15 group-hover:to-primary/10',
                      'transition-colors duration-300'
                    )}
                  >
                    <Icon className="w-6 h-6 text-primary" />
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
