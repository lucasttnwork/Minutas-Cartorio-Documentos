import { motion } from 'framer-motion';
import { ArrowRight, Clock, TrendingUp, Zap, Star } from 'lucide-react';
import { transformacoes } from '../../data/landing-copy';

const premiumEasing = [0.16, 1, 0.3, 1];

export function Transformacoes() {
  return (
    <section
      data-testid="transformacoes"
      aria-label="Transformações e Resultados"
      className="relative py-24 sm:py-32 bg-gradient-to-b from-background via-background to-muted/20"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: premiumEasing }}
          className="mx-auto max-w-2xl text-center mb-16"
        >
          <h2
            data-testid="transformacoes-headline"
            className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
          >
            {transformacoes.headline}
          </h2>

          <p
            data-testid="transformacoes-subheadline"
            className="mt-6 text-lg leading-8 text-muted-foreground"
          >
            {transformacoes.subheadline}
          </p>
        </motion.div>

        {/* Grid de Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {transformacoes.cards.map((card, index) => (
            <motion.article
              key={card.id}
              data-testid={`transformacao-card-${index}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: 0.1 * index,
                duration: 0.6,
                ease: premiumEasing
              }}
              whileHover={{ y: -8 }}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-lg transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/30"
            >
              {/* Card Header - Author Info */}
              <div className="relative bg-gradient-to-br from-muted/50 to-muted/30 px-6 py-5 border-b border-border/50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-foreground truncate">
                      {card.autor}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">{card.cargo}</p>
                  </div>
                  {/* Rating Stars */}
                  <div className="flex gap-0.5 flex-shrink-0" aria-label={`${card.rating} estrelas`}>
                    {Array.from({ length: card.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="flex-1 p-6 space-y-6">

                {/* Antes - Problem State */}
                <div className="relative">
                  <div className="flex items-start gap-3">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: -5 }}
                      className="rounded-lg bg-destructive/10 p-2.5 flex-shrink-0 border border-destructive/20"
                    >
                      <Clock className="w-5 h-5 text-destructive" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold text-destructive uppercase tracking-wider">
                          Antes
                        </span>
                        <div className="h-px flex-1 bg-gradient-to-r from-destructive/30 to-transparent" />
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {card.antes}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Arrow Divider */}
                <div className="flex items-center justify-center">
                  <motion.div
                    initial={{ y: 0 }}
                    animate={{ y: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <ArrowRight className="w-5 h-5 text-primary rotate-90" />
                  </motion.div>
                </div>

                {/* Depois - Success State */}
                <div className="relative">
                  <div className="flex items-start gap-3">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="rounded-lg bg-primary/10 p-2.5 flex-shrink-0 border border-primary/20"
                    >
                      <Zap className="w-5 h-5 text-primary" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold text-primary uppercase tracking-wider">
                          Depois
                        </span>
                        <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">
                        {card.depois}
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Card Footer - Metrics */}
              <div className="relative bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-t border-primary/20 px-6 py-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 0.5 }}
                    className="rounded-lg bg-primary/20 p-2 flex-shrink-0"
                  >
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-primary/80 uppercase tracking-wide mb-0.5">
                      Resultado
                    </div>
                    <div className="text-sm font-bold text-foreground leading-tight">
                      {card.metrica}
                    </div>
                  </div>
                </div>
              </div>

              {/* Hover Accent Border */}
              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-primary/0 group-hover:ring-primary/20 transition-all duration-300 pointer-events-none" />

            </motion.article>
          ))}
        </div>

      </div>
    </section>
  );
}
