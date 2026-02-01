import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { hero } from '../../data/landing-copy';

const premiumEasing = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  return (
    <section
      data-testid="hero"
      aria-label="Hero Section"
      className="relative w-full py-20 lg:py-40 overflow-hidden bg-gradient-to-br from-background via-background to-background/95"
    >
      {/* Background decorative elements - Platinum & Onyx theme */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Subtle gradient orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 gap-12 items-center lg:grid-cols-2 lg:gap-16">

          {/* Left Column: Content (inspired by 21st.dev hero pattern) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: premiumEasing }}
            className="flex gap-6 flex-col"
          >
            {/* Badge - Social Proof Indicator */}
            <div>
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-sm font-medium text-primary backdrop-blur-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>Transforme sua rotina hoje</span>
              </motion.span>
            </div>

            {/* Headline */}
            <div className="flex gap-4 flex-col">
              <h1
                data-testid="hero-headline"
                className="text-4xl md:text-5xl lg:text-6xl max-w-2xl tracking-tight text-left font-bold leading-tight text-foreground"
              >
                {hero.headline}
              </h1>

              {/* Subheadline */}
              <p
                data-testid="hero-subheadline"
                className="text-lg md:text-xl leading-relaxed tracking-tight text-muted-foreground max-w-xl text-left"
              >
                {hero.subheadline}
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <motion.a
                href="#contato"
                data-testid="hero-cta-primary"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 cursor-pointer"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2, ease: premiumEasing }}
              >
                {hero.ctas.primary}
                <ArrowRight className="w-5 h-5" />
              </motion.a>

              <motion.a
                href="#como-funciona"
                data-testid="hero-cta-secondary"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-medium text-foreground bg-transparent border-2 border-border rounded-lg hover:bg-muted/50 hover:border-primary/20 transition-all duration-200 cursor-pointer"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2, ease: premiumEasing }}
              >
                {hero.ctas.secondary}
              </motion.a>
            </div>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex items-center gap-2 text-sm text-muted-foreground mt-2"
            >
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
              <span data-testid="hero-social-proof">{hero.socialProof}</span>
            </motion.div>
          </motion.div>

          {/* Right Column: Stats Cards (2×2 Grid with Glassmorphism) */}
          <div className="grid grid-cols-2 gap-4 lg:gap-5">
            {hero.stats.map((stat, index) => (
              <motion.div
                key={index}
                data-testid={`hero-stat-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.2 + 0.1 * index,
                  duration: 0.6,
                  ease: premiumEasing
                }}
                className="relative group p-6 rounded-xl backdrop-blur-xl bg-card/40 border border-border/50 shadow-lg shadow-black/5 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300"
                whileHover={{ y: -4, scale: 1.02 }}
              >
                {/* Glassmorphism effect overlay */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative z-10">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground leading-snug">
                    {stat.label}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
