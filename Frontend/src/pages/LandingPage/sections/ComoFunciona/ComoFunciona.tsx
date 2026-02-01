"use client";

import { motion } from 'framer-motion';
import { Upload, Cpu, Search, CheckCircle2 } from 'lucide-react';
import { comoFunciona } from '../../data/landing-copy';

const premiumEasing = [0.16, 1, 0.3, 1] as const;

// Mapeamento de ícones
const iconMap = {
  upload: Upload,
  cpu: Cpu,
  search: Search,
  checkCircle2: CheckCircle2,
} as const;

export function ComoFunciona() {
  return (
    <section
      id="como-funciona"
      data-testid="como-funciona"
      aria-label="Como Funciona"
      className="relative py-24 sm:py-32 bg-background overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: premiumEasing }}
          className="mx-auto max-w-2xl text-center mb-20"
        >
          <h2
            data-testid="como-funciona-headline"
            className="text-3xl font-semibold text-foreground sm:text-4xl lg:text-5xl tracking-tight"
          >
            {comoFunciona.headline}
          </h2>

          <p
            data-testid="como-funciona-subheadline"
            className="mt-6 text-lg text-muted-foreground leading-relaxed"
          >
            {comoFunciona.subheadline}
          </p>
        </motion.div>

        {/* Timeline Container */}
        <div className="relative">

          {/* Animated Timeline Line - Desktop */}
          <div className="hidden lg:block absolute left-0 right-0 top-16 h-0.5 -z-0">
            <div className="max-w-6xl mx-auto px-16 relative h-full">
              {/* Background Line */}
              <div className="absolute inset-0 bg-border rounded-full" />

              {/* Animated Progress Line */}
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 1.5, ease: premiumEasing, delay: 0.2 }}
                className="absolute inset-0 bg-gradient-to-r from-primary/60 via-primary to-primary/60 rounded-full origin-left"
                style={{ transformOrigin: "left" }}
              />
            </div>
          </div>

          {/* Steps Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 relative">
            {comoFunciona.steps.map((step, index) => {
              const Icon = iconMap[step.icon as keyof typeof iconMap];

              return (
                <motion.div
                  key={step.id}
                  data-testid={`step-${index}`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{
                    delay: 0.15 * index,
                    duration: 0.6,
                    ease: premiumEasing
                  }}
                  className="relative flex flex-col items-center text-center pt-8"
                >

                  {/* Timeline Dot with Badge */}
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="relative mb-8 z-10"
                  >
                    {/* Dot on Timeline */}
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.4,
                        delay: 0.15 * index + 0.3,
                        ease: [0.34, 1.56, 0.64, 1] // Bouncy
                      }}
                      className="absolute -top-8 left-1/2 -translate-x-1/2 hidden lg:flex h-8 w-8 rounded-full bg-primary items-center justify-center shadow-lg shadow-primary/40 border-4 border-background"
                    >
                      <div className="h-2 w-2 rounded-full bg-background" />
                    </motion.div>

                    {/* Number Badge */}
                    <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center shadow-xl shadow-primary/30 border-2 border-background">
                      <span className="text-2xl font-bold text-primary-foreground">
                        {step.numero}
                      </span>
                    </div>

                    {/* Floating Icon */}
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.6,
                        delay: 0.15 * index + 0.4,
                        ease: [0.34, 1.56, 0.64, 1]
                      }}
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-background border-2 border-primary flex items-center justify-center shadow-lg shadow-primary/40"
                    >
                      <Icon className="w-4 h-4 text-primary" />
                    </motion.div>
                  </motion.div>

                  {/* Content Card */}
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.3 }}
                    className="glass-card p-6 rounded-2xl border border-border/50 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 w-full h-full"
                  >
                    {/* Title */}
                    <h3
                      data-testid={`step-${index}-titulo`}
                      className="text-lg font-semibold text-foreground mb-3 leading-tight"
                    >
                      {step.titulo}
                    </h3>

                    {/* Description */}
                    <p
                      data-testid={`step-${index}-descricao`}
                      className="text-sm text-muted-foreground leading-relaxed mb-4"
                    >
                      {step.descricao}
                    </p>

                    {/* Time Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                      <svg
                        className="w-3.5 h-3.5 text-primary"
                        fill="none"
                        strokeWidth="2"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" />
                      </svg>
                      <span className="text-xs font-medium text-primary">
                        {step.tempo}
                      </span>
                    </div>
                  </motion.div>

                </motion.div>
              );
            })}
          </div>

          {/* Bottom Progress Indicator - Mobile */}
          <div className="lg:hidden mt-12">
            <div className="relative w-full h-1 bg-border rounded-full overflow-hidden">
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: premiumEasing }}
                className="absolute inset-0 bg-primary rounded-full origin-left"
              />
            </div>
            <div className="mt-4 flex justify-between px-4">
              {comoFunciona.steps.map((step, i) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * i, duration: 0.4 }}
                  className="text-center"
                >
                  <span className="text-xs font-semibold text-primary block">
                    {step.numero}
                  </span>
                  <p className="text-[10px] text-muted-foreground mt-1 max-w-[60px]">
                    {step.titulo.split(' ')[0]}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
