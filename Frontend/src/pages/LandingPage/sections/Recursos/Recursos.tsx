import { motion } from 'framer-motion';
import {
  PenTool,
  Shield,
  Scale,
  Zap,
  Layers,
  Search,
  Users,
  MessageCircle,
} from 'lucide-react';
import { recursos } from '../../data/landing-copy';

const premiumEasing = [0.16, 1, 0.3, 1] as const;

// Mapeamento de ícones
const iconMap = {
  PenTool,
  Shield,
  Scale,
  Zap,
  FileStack: Layers,
  Search,
  Users,
  MessageCircle,
} as const;

export function Recursos() {
  return (
    <section
      id="recursos"
      data-testid="recursos"
      aria-label="Recursos e Benefícios"
      className="relative py-24 sm:py-32 bg-muted/30"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: premiumEasing }}
          className="mx-auto max-w-2xl text-center mb-16"
        >
          <h2
            data-testid="recursos-headline"
            className="text-3xl font-semibold text-foreground sm:text-4xl lg:text-5xl tracking-tight"
          >
            {recursos.headline}
          </h2>

          <p
            data-testid="recursos-subheadline"
            className="mt-6 text-lg text-muted-foreground leading-relaxed"
          >
            {recursos.subheadline}
          </p>
        </motion.div>

        {/* Grid de Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {recursos.cards.map((card, index) => {
            const Icon = iconMap[card.icone as keyof typeof iconMap];

            return (
              <motion.div
                key={card.id}
                data-testid={`recurso-card-${index}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: 0.1 * index,
                  duration: 0.6,
                  ease: premiumEasing
                }}
                whileHover={{ y: -6, scale: 1.03 }}
                className="glass-card p-6 rounded-xl hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 cursor-pointer border border-border/30 hover:border-primary/30"
              >
                {/* Icon */}
                <motion.div
                  whileHover={{ scale: 1.15, rotate: 8 }}
                  className="mb-5"
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/25 transition-all duration-300">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                </motion.div>

                {/* Título */}
                <h3
                  data-testid={`recurso-card-${index}-titulo`}
                  className="text-lg font-semibold text-foreground mb-3"
                >
                  {card.titulo}
                </h3>

                {/* Descrição */}
                <p
                  data-testid={`recurso-card-${index}-descricao`}
                  className="text-sm text-muted-foreground leading-relaxed mb-4"
                >
                  {card.descricao}
                </p>

                {/* Benefício Callout */}
                <div className="pt-4 mt-4 border-t border-primary/20 bg-gradient-to-br from-primary/5 to-transparent -mx-6 -mb-6 px-6 pb-6 rounded-b-xl">
                  <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-primary"></span>
                    Benefício
                  </p>
                  <p
                    data-testid={`recurso-card-${index}-beneficio`}
                    className="text-sm text-foreground font-semibold leading-snug"
                  >
                    {card.beneficio}
                  </p>
                </div>

              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
