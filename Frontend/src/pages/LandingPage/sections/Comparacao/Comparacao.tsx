import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { comparacao } from '../../data/landing-copy';

const premiumEasing = [0.16, 1, 0.3, 1] as const;

export function Comparacao() {
  return (
    <section
      id="comparacao"
      data-testid="comparacao"
      aria-label="Comparação: Método Tradicional vs Sistema Inteligente"
      className="relative py-24 sm:py-32 bg-background"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: premiumEasing }}
          className="mx-auto max-w-3xl text-center mb-16"
        >
          <h2
            data-testid="comparacao-headline"
            className="text-3xl font-semibold text-foreground sm:text-4xl lg:text-5xl tracking-tight"
          >
            {comparacao.headline}
          </h2>

          <p
            data-testid="comparacao-subheadline"
            className="mt-6 text-lg text-muted-foreground leading-relaxed"
          >
            {comparacao.subheadline}
          </p>
        </motion.div>

        {/* Desktop: Comparison Table */}
        <div className="hidden lg:block">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: premiumEasing, delay: 0.1 }}
            className="glass-card rounded-2xl border border-border/30 overflow-hidden"
          >
            {/* Table Header */}
            <div className="grid grid-cols-3 gap-6 p-6 bg-gradient-to-r from-muted/50 to-muted/30 border-b border-border/30">
              <div className="text-sm font-medium text-muted-foreground">
                Aspecto
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-destructive/10 flex items-center justify-center">
                  <X className="w-4 h-4 text-destructive" />
                </div>
                <span className="text-sm font-semibold text-foreground">
                  Método Tradicional
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-semibold text-foreground">
                  Com Nossa Solução
                </span>
              </div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-border/20">
              {comparacao.aspectos.map((item, index) => (
                <motion.div
                  key={item.id}
                  data-testid={`comparacao-row-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: 0.05 * index,
                    duration: 0.5,
                    ease: premiumEasing
                  }}
                  className="grid grid-cols-3 gap-6 p-6 hover:bg-muted/20 transition-colors duration-200"
                >
                  {/* Aspecto */}
                  <div
                    data-testid={`comparacao-${index}-aspecto`}
                    className="font-medium text-foreground"
                  >
                    {item.aspecto}
                  </div>

                  {/* Tradicional (Antes) */}
                  <div className="flex items-start gap-3">
                    <X className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <span
                      data-testid={`comparacao-${index}-tradicional`}
                      className="text-sm text-muted-foreground"
                    >
                      {item.tradicional}
                    </span>
                  </div>

                  {/* Com Solução (Depois) */}
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <span
                      data-testid={`comparacao-${index}-solucao`}
                      className="text-sm font-medium text-foreground"
                    >
                      {item.comSolucao}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Mobile: Stacked Cards */}
        <div className="lg:hidden space-y-6">
          {comparacao.aspectos.map((item, index) => (
            <motion.div
              key={item.id}
              data-testid={`comparacao-card-${index}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: 0.05 * index,
                duration: 0.5,
                ease: premiumEasing
              }}
              className="glass-card rounded-xl border border-border/30 p-6 space-y-4"
            >
              {/* Aspecto */}
              <h3
                data-testid={`comparacao-mobile-${index}-aspecto`}
                className="text-lg font-semibold text-foreground pb-3 border-b border-border/20"
              >
                {item.aspecto}
              </h3>

              {/* Antes */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-destructive/10 flex items-center justify-center">
                    <X className="w-4 h-4 text-destructive" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Antes
                  </span>
                </div>
                <p
                  data-testid={`comparacao-mobile-${index}-tradicional`}
                  className="text-sm text-muted-foreground pl-8"
                >
                  {item.tradicional}
                </p>
              </div>

              {/* Depois */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    Depois
                  </span>
                </div>
                <p
                  data-testid={`comparacao-mobile-${index}-solucao`}
                  className="text-sm font-medium text-foreground pl-8"
                >
                  {item.comSolucao}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
