import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { depoimentos } from '../../data/landing-copy';

const premiumEasing = [0.16, 1, 0.3, 1] as const;

// Star Rating Component
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" role="img" aria-label={`${rating} de 5 estrelas`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-5 h-5 ${
            i < rating
              ? 'fill-amber-400 text-amber-400'
              : 'fill-gray-300 text-gray-300'
          }`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export function Depoimentos() {
  return (
    <section
      id="depoimentos"
      data-testid="depoimentos"
      aria-label="Depoimentos de Clientes"
      className="relative py-24 sm:py-32 bg-gradient-to-br from-background via-primary/5 to-background"
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
            data-testid="depoimentos-headline"
            className="text-3xl font-semibold text-foreground sm:text-4xl lg:text-5xl tracking-tight"
          >
            {depoimentos.headline}
          </h2>

          <p
            data-testid="depoimentos-subheadline"
            className="mt-6 text-lg text-muted-foreground leading-relaxed"
          >
            {depoimentos.subheadline}
          </p>
        </motion.div>

        {/* Grid de Depoimentos - Inspired by 21st.dev */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {depoimentos.testemunhos.map((testemunho, index) => (
            <motion.article
              key={testemunho.id}
              data-testid={`depoimento-${index}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: 0.1 * index,
                duration: 0.6,
                ease: premiumEasing
              }}
              className="text-sm border border-gray-200 pb-6 rounded-lg bg-white shadow-[0px_4px_15px_0px] shadow-black/5 overflow-hidden hover:shadow-[0px_8px_25px_0px] hover:shadow-black/10 transition-all duration-300"
            >
              {/* Header com Avatar e Info */}
              <div className="flex items-center gap-4 px-5 py-4 bg-primary/10">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/40 to-primary/20 border-2 border-primary/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img
                    src={testemunho.avatar}
                    alt={testemunho.autor}
                    data-testid={`depoimento-${index}-avatar`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to initials if image doesn't load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const initials = testemunho.autor
                        .split(' ')
                        .map(n => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2);
                      const parent = target.parentElement;
                      if (parent && parent.children.length === 1) {
                        const span = document.createElement('span');
                        span.className = 'text-lg font-semibold text-primary';
                        span.textContent = initials;
                        parent.appendChild(span);
                      }
                    }}
                  />
                </div>

                <div className="flex-grow">
                  <h3
                    data-testid={`depoimento-${index}-autor`}
                    className="text-lg font-medium text-gray-800"
                  >
                    {testemunho.autor}
                  </h3>
                  <p
                    data-testid={`depoimento-${index}-cargo`}
                    className="text-gray-800/80"
                  >
                    {testemunho.cargo}
                  </p>
                  <p
                    data-testid={`depoimento-${index}-empresa`}
                    className="text-xs text-gray-700/70 mt-0.5"
                  >
                    {testemunho.empresa}
                  </p>
                </div>
              </div>

              {/* Conteúdo do Card */}
              <div className="p-5 pb-7">
                {/* Star Rating */}
                <div className="mb-4" data-testid={`depoimento-${index}-rating`}>
                  <StarRating rating={testemunho.rating} />
                </div>

                {/* Texto do Depoimento */}
                <blockquote
                  data-testid={`depoimento-${index}-texto`}
                  className="text-gray-500 leading-relaxed mb-4"
                >
                  {testemunho.texto}
                </blockquote>

                {/* Destaque (Callout) */}
                <div
                  data-testid={`depoimento-${index}-destaque`}
                  className="mb-4 px-4 py-3 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border-l-4 border-primary"
                >
                  <p className="text-sm font-medium text-primary italic">
                    "{testemunho.destaque}"
                  </p>
                </div>

                {/* Resultado */}
                <div
                  data-testid={`depoimento-${index}-resultado`}
                  className="px-4 py-2 rounded-lg bg-gray-50 border border-gray-200"
                >
                  <p className="text-xs text-gray-600 font-medium">
                    <strong className="text-gray-800">Resultado:</strong> {testemunho.resultado}
                  </p>
                </div>
              </div>

            </motion.article>
          ))}
        </div>

      </div>
    </section>
  );
}
