import { motion } from 'framer-motion';
import { Shield, CheckCircle2, Lock, Award, Users } from 'lucide-react';
import { socialProofBar } from '../../data/landing-copy';

const premiumEasing = [0.16, 1, 0.3, 1] as const;

// Mapeamento de ícones
const iconMap = {
  shield: Shield,
  check: CheckCircle2,
  lock: Lock,
  award: Award,
  users: Users,
} as const;

export function SocialProofBar() {
  return (
    <section
      data-testid="social-proof-bar"
      aria-label="Social Proof"
      className="relative py-20 overflow-hidden"
    >
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-background to-muted/30 pointer-events-none" />

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-0 w-96 h-96 -translate-x-1/2 -translate-y-1/2 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-0 w-96 h-96 translate-x-1/2 -translate-y-1/2 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: premiumEasing }}
          className="text-center mb-12"
        >
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Confiado por profissionais de cartórios em todo o Brasil
          </p>
        </motion.div>

        {/* Badges Grid - Inspired by 21st.dev trust badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {socialProofBar.badges.map((badge, index) => {
            const Icon = iconMap[badge.icon as keyof typeof iconMap];

            return (
              <motion.div
                key={badge.id}
                data-testid={`social-proof-badge-${index}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -2, scale: 1.02 }}
                transition={{
                  delay: 0.05 * index,
                  duration: 0.5,
                  ease: premiumEasing
                }}
                className="group relative"
              >
                {/* Badge Container */}
                <div className="flex items-center justify-center gap-3 p-4 rounded-xl border border-border bg-card shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:border-primary/20 group-hover:bg-card/80 backdrop-blur-sm h-full">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className="relative">
                      {/* Icon glow on hover */}
                      <div className="absolute inset-0 bg-primary/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <Icon className="relative w-5 h-5 text-primary transition-all duration-300 group-hover:scale-110" />
                    </div>
                  </div>

                  {/* Text */}
                  <span className="text-xs font-medium text-foreground/80 group-hover:text-foreground transition-colors duration-300 text-center leading-tight">
                    {badge.text}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom trust indicator - Inspired by testimonial badge pattern */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4, ease: premiumEasing }}
          className="mt-12 flex justify-center"
        >
          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full border border-border bg-card/80 backdrop-blur-sm shadow-sm">
            <div className="flex -space-x-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 ring-2 ring-background flex items-center justify-center"
                >
                  <span className="text-xs font-semibold text-primary">
                    {['A', 'M', 'R', 'C'][i]}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Confiado por <strong className="font-semibold text-foreground">150+</strong> escreventes
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
