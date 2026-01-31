import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressStepper } from "@/components/layout";
import { FileText, Users, Building2, Briefcase, Upload } from "lucide-react";

const modules = [
  {
    title: "Pessoa Natural",
    description: "Conferência de dados de pessoas físicas",
    icon: Users,
    href: "/pessoa-natural",
    color: "text-blue-400",
  },
  {
    title: "Pessoa Jurídica",
    description: "Conferência de dados de empresas",
    icon: Building2,
    href: "/pessoa-juridica",
    color: "text-green-400",
  },
  {
    title: "Dados do Imóvel",
    description: "Informações da matrícula e propriedade",
    icon: FileText,
    href: "/imovel",
    color: "text-yellow-400",
  },
  {
    title: "Negócio Jurídico",
    description: "Valores, partes e condições da transação",
    icon: Briefcase,
    href: "/negocio-juridico",
    color: "text-purple-400",
  },
  {
    title: "Upload de Arquivos",
    description: "Envie documentos e anexos",
    icon: Upload,
    href: "/upload",
    color: "text-cyan-400",
  },
];

const steps = [
  { id: "pessoa-natural", label: "Pessoa Natural", href: "/pessoa-natural" },
  { id: "pessoa-juridica", label: "Pessoa Jurídica", href: "/pessoa-juridica" },
  { id: "imovel", label: "Imóvel", href: "/imovel" },
  { id: "negocio", label: "Negócio Jurídico", href: "/negocio-juridico" },
  { id: "upload", label: "Upload", href: "/upload" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  
  // TODO: Em produção, calcular o passo atual baseado nos dados preenchidos
  const currentStep = 0;

  const handleStepClick = (stepIndex: number) => {
    navigate(steps[stepIndex].href);
  };

  return (
    <main className="min-h-screen p-6 md:p-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Sistema de Minutas
          </h1>
          <p className="text-muted-foreground text-lg">
            Conferência e Complementação de Documentos
          </p>
        </header>

        {/* Progress Stepper */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-10 bg-card rounded-xl p-4 border border-border"
        >
          <p className="text-sm text-muted-foreground text-center mb-4">
            Progresso do Fluxo
          </p>
          <ProgressStepper
            steps={steps}
            currentStep={currentStep}
            onStepClick={handleStepClick}
          />
        </motion.div>

        {/* Module Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {modules.map((module, index) => (
            <motion.div
              key={module.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Link to={module.href}>
                <Card className="bg-card border-2 border-border hover:border-accent transition-colors cursor-pointer group">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-secondary ${module.color}`}>
                        <module.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <CardTitle className="text-foreground group-hover:text-primary transition-colors">
                          {module.title}
                        </CardTitle>
                        <CardDescription>{module.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button variant="secondary" className="w-full uppercase tracking-wide">
                      Acessar Módulo
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Footer info */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12 text-center text-muted-foreground text-sm"
        >
          <p>Sistema de Minutas v1.0 • Cartório de Notas</p>
        </motion.footer>
      </motion.div>
    </main>
  );
}
