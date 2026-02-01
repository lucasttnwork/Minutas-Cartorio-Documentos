import { motion } from 'framer-motion';
import { ArrowRight, Check, Lock, Phone, Target, Percent } from 'lucide-react';
import { ctaFinal } from '../../data/landing-copy';

const premiumEasing = [0.16, 1, 0.3, 1] as const;

const iconMap = {
  check: Check,
  lock: Lock,
  phone: Phone,
  target: Target,
  percent: Percent
};

export function CTAFinal() {
  return (
    <section
      id="cta-final"
      data-testid="cta-final"
      aria-label="Call to Action Final"
      className="relative w-full py-20 lg:py-32 overflow-hidden"
    >
      {/* Background gradient - Platinum & Onyx theme with urgency */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/5" />

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto">

          {/* Main CTA Card with Glassmorphism */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: premiumEasing }}
            className="relative rounded-2xl backdrop-blur-xl bg-card/60 border border-border/50 shadow-2xl shadow-primary/10 overflow-hidden"
          >
            {/* Glassmorphism overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />

            <div className="relative z-10 p-8 lg:p-12">

              {/* Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

                {/* Left Column: Headlines + CTAs */}
                <div className="flex flex-col gap-6">

                  {/* Headline */}
                  <div className="flex flex-col gap-3">
                    <h2
                      data-testid="cta-final-headline"
                      className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-foreground"
                    >
                      {ctaFinal.headline}
                    </h2>

                    {/* Subheadline */}
                    <p
                      data-testid="cta-final-subheadline"
                      className="text-base md:text-lg leading-relaxed text-muted-foreground"
                    >
                      {ctaFinal.subheadline}
                    </p>
                  </div>

                  {/* CTAs */}
                  <div className="flex flex-col sm:flex-row gap-4 mt-2">
                    <motion.a
                      href="#contato"
                      data-testid="cta-final-primary"
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 cursor-pointer"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.2, ease: premiumEasing }}
                    >
                      {ctaFinal.ctaPrimary}
                      <ArrowRight className="w-5 h-5" />
                    </motion.a>

                    <motion.a
                      href="#contato"
                      data-testid="cta-final-secondary"
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-medium text-foreground bg-transparent border-2 border-border rounded-lg hover:bg-muted/50 hover:border-primary/20 transition-all duration-200 cursor-pointer"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.2, ease: premiumEasing }}
                    >
                      {ctaFinal.ctaSecondary}
                      <ArrowRight className="w-5 h-5" />
                    </motion.a>
                  </div>

                </div>

                {/* Right Column: Trust Elements / Garantias */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Garantias e Benefícios
                  </h3>

                  {ctaFinal.garantias.map((garantia, index) => {
                    // Extract icon name from emoji-based icons or use fallback
                    const iconName = garantia.icon.replace('✅', 'check')
                      .replace('🔒', 'lock')
                      .replace('📞', 'phone')
                      .replace('🎯', 'target')
                      .replace('💯', 'percent') as keyof typeof iconMap;

                    const IconComponent = iconMap[iconName] || Check;

                    return (
                      <motion.div
                        key={garantia.id}
                        data-testid={`cta-garantia-${garantia.id}`}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{
                          delay: 0.1 * index,
                          duration: 0.4,
                          ease: premiumEasing
                        }}
                        className="flex items-center gap-3 text-sm md:text-base"
                      >
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                          <IconComponent className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-foreground/90">{garantia.text}</span>
                      </motion.div>
                    );
                  })}
                </div>

              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
