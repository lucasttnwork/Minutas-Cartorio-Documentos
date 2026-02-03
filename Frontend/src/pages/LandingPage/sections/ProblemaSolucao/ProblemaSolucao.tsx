import { motion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileX,
  AlertTriangle,
  Frown,
  ArrowRight,
  Zap,
  Shield,
  TrendingUp,
  Award,
  Sparkles,
} from 'lucide-react';
import { problemaSolucao } from '../../data/landing-copy';

const premiumEasing = [0.16, 1, 0.3, 1] as const;

// Mapeamento de ícones
const iconMap = {
  alertCircle: AlertCircle,
  checkCircle2: CheckCircle2,
  clock: Clock,
  fileX: FileX,
  alertTriangle: AlertTriangle,
  frown: Frown,
  zap: Zap,
  shield: Shield,
  trendingUp: TrendingUp,
  award: Award,
  sparkles: Sparkles,
};

export function ProblemaSolucao() {
  return (
    <section
      data-testid="problema-solucao"
      aria-label="Problema e Solução"
      className="relative py-24 sm:py-32 bg-muted/30"
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
            data-testid="problema-solucao-headline"
            className="text-3xl font-semibold text-foreground sm:text-4xl lg:text-5xl"
          >
            {problemaSolucao.problemas.headline}
          </h2>

          <p
            data-testid="problema-solucao-subheadline"
            className="mt-6 text-lg text-muted-foreground"
          >
            {problemaSolucao.problemas.subheadline}
          </p>
        </motion.div>

        {/* Split Layout: Problemas | Transição | Solução */}
        <div className="grid lg:grid-cols-[1fr_auto_1fr] gap-8 lg:gap-12 items-start">
          {/* COLUNA ESQUERDA: PROBLEMAS */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: premiumEasing }}
            className="space-y-6 p-6 lg:p-8 rounded-2xl bg-destructive/5 border border-destructive/10"
          >
            <div className="text-center lg:text-left mb-8">
              <h3 className="text-xl font-semibold text-destructive mb-2">
                Problemas Atuais
              </h3>
              <p className="text-sm text-muted-foreground">
                Desafios enfrentados diariamente
              </p>
            </div>

            {problemaSolucao.problemas.lista.map((problema, index) => {
              const Icon = iconMap[problema.icon as keyof typeof iconMap];

              return (
                <motion.div
                  key={problema.id}
                  data-testid={`problema-item-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: 0.1 * index,
                    duration: 0.6,
                    ease: premiumEasing,
                  }}
                  whileHover={{
                    y: -4,
                    scale: 1.01,
                    transition: { duration: 0.2, ease: premiumEasing }
                  }}
                  className="flex items-start gap-4 p-5 rounded-xl bg-background/80 border border-destructive/20 hover:border-destructive/40 hover:shadow-lg hover:shadow-destructive/10 transition-all duration-300 cursor-pointer"
                >
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    className="rounded-full bg-destructive/15 p-3 flex-shrink-0"
                  >
                    <Icon className="w-6 h-6 text-destructive" />
                  </motion.div>
                  <div className="flex-1">
                    <h4 className="text-base font-semibold text-foreground mb-2">
                      {problema.titulo}
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {problema.descricao}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* COLUNA CENTRAL: TRANSIÇÃO */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6, ease: premiumEasing }}
            className="hidden lg:flex flex-col items-center justify-center py-12"
          >
            <div className="flex flex-col items-center gap-6">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 3,
                  ease: 'easeInOut'
                }}
                className="w-14 h-14 rounded-full bg-gradient-to-br from-destructive/20 via-primary/20 to-primary/30 flex items-center justify-center shadow-lg"
              >
                <ArrowRight className="w-7 h-7 text-primary" />
              </motion.div>
              <div className="relative h-40 w-px">
                <div className="absolute inset-0 bg-gradient-to-b from-destructive/40 via-primary/40 to-primary/50" />
                <motion.div
                  animate={{
                    y: [0, 150, 0]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.5,
                    ease: 'easeInOut'
                  }}
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-8 bg-gradient-to-b from-primary to-transparent rounded-full"
                />
              </div>
              <p className="text-xs font-semibold text-center text-primary uppercase tracking-wider max-w-[140px] leading-tight px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
                {problemaSolucao.transicao.texto}
              </p>
            </div>
          </motion.div>

          {/* COLUNA DIREITA: SOLUÇÃO */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: premiumEasing }}
            className="space-y-6 p-6 lg:p-8 rounded-2xl bg-primary/5 border border-primary/10"
          >
            <div className="text-center lg:text-left mb-8">
              <h3 className="text-xl font-semibold text-primary mb-2">
                {problemaSolucao.solucao.headline}
              </h3>
              <p className="text-sm text-muted-foreground">
                {problemaSolucao.solucao.subheadline}
              </p>
            </div>

            {problemaSolucao.solucao.beneficios.map((beneficio, index) => {
              const Icon = iconMap[beneficio.icon as keyof typeof iconMap];

              return (
                <motion.div
                  key={beneficio.id}
                  data-testid={`solucao-item-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: 0.1 * index,
                    duration: 0.6,
                    ease: premiumEasing,
                  }}
                  whileHover={{
                    y: -4,
                    scale: 1.01,
                    transition: { duration: 0.2, ease: premiumEasing }
                  }}
                  className="flex items-start gap-4 p-5 rounded-xl bg-background/80 border border-primary/20 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 cursor-pointer"
                >
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    className="rounded-full bg-primary/15 p-3 flex-shrink-0"
                  >
                    <Icon className="w-6 h-6 text-primary" />
                  </motion.div>
                  <div className="flex-1">
                    <h4 className="text-base font-semibold text-foreground mb-2">
                      {beneficio.titulo}
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {beneficio.descricao}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
