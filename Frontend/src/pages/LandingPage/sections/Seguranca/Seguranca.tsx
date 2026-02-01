import { motion } from 'framer-motion';
import { Shield, Lock, Scale, CheckCircle2 } from 'lucide-react';
import { segurancaConformidade } from '../../data/landing-copy';

const premiumEasing = [0.16, 1, 0.3, 1] as const;

// Mapeamento de ícones
const iconMap = {
  Shield,
  Lock,
  Scale,
} as const;

export function Seguranca() {
  return (
    <section
      id="seguranca"
      data-testid="seguranca"
      aria-label="Segurança e Conformidade"
      className="relative py-24 sm:py-32 overflow-hidden"
    >
      {/* Background decorativo */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-background to-background" />
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: premiumEasing }}
          className="mx-auto max-w-3xl text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: premiumEasing }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-primary/10 border border-primary/20"
          >
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Segurança Enterprise</span>
          </motion.div>

          <h2
            data-testid="seguranca-headline"
            className="text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl tracking-tight mb-6 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text"
          >
            {segurancaConformidade.headline}
          </h2>

          <p
            data-testid="seguranca-subheadline"
            className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto"
          >
            {segurancaConformidade.subheadline}
          </p>
        </motion.div>

        {/* Grid de Pilares com design aprimorado */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {segurancaConformidade.pilares.map((pilar, index) => {
            const Icon = iconMap[pilar.icone as keyof typeof iconMap];

            return (
              <motion.div
                key={pilar.id}
                data-testid={`seguranca-pilar-${index}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  delay: 0.1 * index,
                  duration: 0.5,
                  ease: premiumEasing
                }}
                className="group relative"
              >
                {/* Card com glass effect aprimorado */}
                <motion.div
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.3, ease: premiumEasing }}
                  className="relative h-full glass-card p-8 rounded-3xl border border-border/50 hover:border-primary/30 transition-all duration-300 overflow-hidden"
                >
                  {/* Gradient overlay no hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:via-primary/3 group-hover:to-transparent transition-all duration-500" />

                  {/* Conteúdo */}
                  <div className="relative z-10">
                    {/* Icon com efeito 21st.dev */}
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                      className="mb-6 inline-flex"
                    >
                      <div className="relative">
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        {/* Icon container */}
                        <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 flex items-center justify-center border border-primary/30 shadow-lg shadow-primary/10 group-hover:shadow-xl group-hover:shadow-primary/20 transition-all duration-300">
                          <Icon className="w-7 h-7 text-primary" strokeWidth={2} />
                        </div>
                      </div>
                    </motion.div>

                    {/* Título */}
                    <h3
                      data-testid={`seguranca-pilar-${index}-titulo`}
                      className="text-xl font-bold text-foreground mb-3 tracking-tight"
                    >
                      {pilar.titulo}
                    </h3>

                    {/* Descrição */}
                    <p
                      data-testid={`seguranca-pilar-${index}-descricao`}
                      className="text-sm text-muted-foreground leading-relaxed mb-6"
                    >
                      {pilar.descricao}
                    </p>

                    {/* Highlights com checkmarks */}
                    <div className="space-y-2.5 pt-4 border-t border-border/30">
                      {pilar.highlights.map((highlight, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.05 * i }}
                          data-testid={`seguranca-pilar-${index}-highlight-${i}`}
                          className="flex items-start gap-2.5 group/item"
                        >
                          <CheckCircle2 className="w-4 h-4 text-primary/70 flex-shrink-0 mt-0.5 group-hover/item:text-primary transition-colors" strokeWidth={2.5} />
                          <span className="text-xs text-muted-foreground group-hover/item:text-foreground transition-colors leading-relaxed">
                            {highlight}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Decorative corner accent */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Trust Badges - Design inspirado em 21st.dev */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6, ease: premiumEasing }}
          className="relative"
        >
          <div className="flex flex-wrap justify-center items-center gap-3 md:gap-4 pt-4">
            {segurancaConformidade.badges.map((badge, index) => (
              <motion.div
                key={badge.id}
                data-testid={`seguranca-badge-${index}`}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.05 * index }}
                whileHover={{ scale: 1.05, y: -2 }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <span className="text-lg" aria-hidden="true">{badge.icon}</span>
                <span className="text-xs font-medium text-foreground whitespace-nowrap">
                  {badge.text}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}
