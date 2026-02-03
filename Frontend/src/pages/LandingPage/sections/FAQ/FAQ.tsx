import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { faq } from '../../data/landing-copy';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const },
  },
};

// Type for FAQ questions
type FAQQuestion = { id: string; categoria: string; pergunta: string; resposta: string };

// Group questions by category
const categorizeQuestions = () => {
  const categories: Record<string, { label: string; questions: FAQQuestion[] }> = {
    geral: { label: 'Geral', questions: [] },
    tecnico: { label: 'Técnico', questions: [] },
    seguranca: { label: 'Segurança', questions: [] },
    preco: { label: 'Preço', questions: [] },
  };

  faq.perguntas.forEach((pergunta) => {
    if (categories[pergunta.categoria]) {
      categories[pergunta.categoria].questions.push(pergunta as FAQQuestion);
    }
  });

  return categories;
};

export function FAQ() {
  const categories = categorizeQuestions();

  return (
    <section
      data-testid="faq-section"
      className="relative w-full py-20 lg:py-32 overflow-hidden bg-gradient-to-b from-background to-muted/20"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={containerVariants}
          className="grid gap-12 lg:gap-16 lg:grid-cols-5"
        >
          {/* Left Column - Header */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
            <div className="inline-block">
              <div className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                FAQ
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                {faq.headline}
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                {faq.subheadline}
              </p>
            </div>

            {/* CTA for support */}
            <div className="pt-4">
              <p className="text-muted-foreground">
                Não encontrou o que procura?{' '}
                <a
                  href="#contato"
                  className="text-primary font-medium hover:underline underline-offset-4 transition-all"
                >
                  Entre em contato com nossa equipe
                </a>
              </p>
            </div>
          </motion.div>

          {/* Right Column - Accordion by Categories */}
          <motion.div variants={itemVariants} className="lg:col-span-3 space-y-10">
            {Object.entries(categories).map(([key, category]) => {
              if (category.questions.length === 0) return null;

              return (
                <div key={key} className="space-y-4">
                  <h3 className="text-lg font-semibold text-muted-foreground uppercase tracking-wide">
                    {category.label}
                  </h3>
                  <Accordion type="multiple" className="w-full space-y-2">
                    {category.questions.map((pergunta) => (
                      <AccordionItem
                        key={pergunta.id}
                        value={pergunta.id}
                        className="border border-border/50 rounded-lg px-6 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors"
                      >
                        <AccordionTrigger className="text-left text-base md:text-lg font-medium hover:no-underline py-5">
                          {pergunta.pergunta}
                        </AccordionTrigger>
                        <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                          {pergunta.resposta}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
