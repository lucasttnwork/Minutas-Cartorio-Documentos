import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader, SectionCard, FieldGrid, NavigationBar } from "@/components/layout";
import { FormField } from "@/components/forms";
import { 
  FileText, 
  Plus, 
  Trash2, 
  Eye, 
  X, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Users, 
  CreditCard,
  FileCheck
} from "lucide-react";
import { toast } from "sonner";

// ===================== INTERFACES =====================

interface Alienante {
  id: string;
  tipo: "PESSOA_NATURAL" | "PESSOA_JURIDICA";
  nome: string;
  fracaoIdeal: string;
  valorAlienacao: string;
  // Campos específicos de Pessoa Natural
  conjuge?: string;
  compareceNaEscritura?: string;
  qualidadeComparecimento?: string;
}

interface Adquirente {
  id: string;
  tipo: "PESSOA_NATURAL" | "PESSOA_JURIDICA";
  nome: string;
  fracaoIdeal: string;
  valorAquisicao: string;
}

interface ContaBancaria {
  banco: string;
  agencia: string;
  conta: string;
}

interface FormaPagamento {
  tipoPagamento: string;
  modoPagamento: string;
  dataPagamento: string;
  contaOrigem: ContaBancaria;
  contaDestino: ContaBancaria;
}

interface TermosEspeciais {
  termosPromessa: string;
  termosEspeciais: string;
  instrucoesExtras: string;
}

interface DeclaracoesAlienante {
  inexistenciaAcoesReais: boolean;
  inexistenciaDebitosCondominiais: boolean;
  inexistenciaDebitosIPTU: boolean;
  inexistenciaDebitosAmbientais: boolean;
  naoVinculacaoINSS: boolean;
  naoEPEP: boolean;
}

interface Dispensas {
  dispensaCertidoesFeitos: boolean;
  dispensaCertidoesIPTU: boolean;
  dispensaCertidaoUniao: boolean;
  dispensaDeclaracaoSindico: boolean;
  dispensaCNDT: boolean;
  adquirenteNaoEPEP: boolean;
}

interface ResultadoIndisponibilidade {
  id: string;
  status: "NEGATIVO" | "POSITIVO";
  nome: string;
  hash: string;
}

interface ImpostoTransmissao {
  numeroGuiaITBI: string;
  baseCalculo: string;
  valorGuia: string;
}

// ===================== ESTADO INICIAL =====================

const initialState = {
  // SEÇÃO 1: VALOR (3 campos)
  valorMatricula: "1200000",
  fracaoIdealAlienada: "100%",
  valorTotalAlienacao: "1200000",

  // SEÇÃO 2: ALIENANTES
  alienantes: [
    {
      id: "ali-1",
      tipo: "PESSOA_NATURAL" as const,
      nome: "MARIA DA SILVA",
      fracaoIdeal: "50%",
      valorAlienacao: "600000",
      conjuge: "JOÃO DA SILVA",
      compareceNaEscritura: "SIM",
      qualidadeComparecimento: "ALIENANTE",
    },
    {
      id: "ali-2",
      tipo: "PESSOA_NATURAL" as const,
      nome: "JOÃO DA SILVA",
      fracaoIdeal: "50%",
      valorAlienacao: "600000",
      conjuge: "MARIA DA SILVA",
      compareceNaEscritura: "SIM",
      qualidadeComparecimento: "ALIENANTE",
    },
  ] as Alienante[],

  // SEÇÃO 3: ADQUIRENTES
  adquirentes: [
    {
      id: "adq-1",
      tipo: "PESSOA_NATURAL" as const,
      nome: "PEDRO SOUZA",
      fracaoIdeal: "100%",
      valorAquisicao: "1200000",
    },
  ] as Adquirente[],

  // SEÇÃO 4: FORMA DE PAGAMENTO (9 campos)
  formaPagamento: {
    tipoPagamento: "A_VISTA",
    modoPagamento: "TRANSFERENCIA_BANCARIA",
    dataPagamento: "2024-02-15",
    contaOrigem: {
      banco: "ITAÚ",
      agencia: "0001",
      conta: "12345-6",
    },
    contaDestino: {
      banco: "BRADESCO",
      agencia: "0002",
      conta: "78901-2",
    },
  } as FormaPagamento,

  // SEÇÃO 5: TERMOS ESPECIAIS (3 campos)
  termosEspeciais: {
    termosPromessa: "",
    termosEspeciais: "",
    instrucoesExtras: "",
  } as TermosEspeciais,

  // SEÇÃO 6: DECLARAÇÕES (12 checkboxes)
  declaracoesAlienante: {
    inexistenciaAcoesReais: true,
    inexistenciaDebitosCondominiais: true,
    inexistenciaDebitosIPTU: true,
    inexistenciaDebitosAmbientais: true,
    naoVinculacaoINSS: true,
    naoEPEP: true,
  } as DeclaracoesAlienante,

  dispensas: {
    dispensaCertidoesFeitos: false,
    dispensaCertidoesIPTU: false,
    dispensaCertidaoUniao: false,
    dispensaDeclaracaoSindico: false,
    dispensaCNDT: false,
    adquirenteNaoEPEP: true,
  } as Dispensas,

  // SEÇÃO 7: INDISPONIBILIDADE DE BENS
  resultadosIndisponibilidade: [] as ResultadoIndisponibilidade[],
  consultaRealizada: false,

  // SEÇÃO 8: IMPOSTO DE TRANSMISSÃO (3 campos)
  impostoTransmissao: {
    numeroGuiaITBI: "2024/00012345",
    baseCalculo: "1200000",
    valorGuia: "36000",
  } as ImpostoTransmissao,
};

// ===================== OPTIONS =====================

const simnaoOptions = [
  { value: "SIM", label: "Sim" },
  { value: "NAO", label: "Não" },
];

const qualidadeComparecimentoOptions = [
  { value: "ALIENANTE", label: "Só Alienante" },
  { value: "AUTOCONTRATANTE", label: "Autocontratante" },
];

const tipoPagamentoOptions = [
  { value: "A_VISTA", label: "À Vista" },
  { value: "PARCELADO", label: "Parcelado" },
  { value: "FINANCIAMENTO", label: "Financiamento Bancário" },
  { value: "PERMUTA", label: "Permuta" },
];

const modoPagamentoOptions = [
  { value: "TRANSFERENCIA_BANCARIA", label: "Transferência Bancária (TED/DOC)" },
  { value: "PIX", label: "PIX" },
  { value: "CHEQUE", label: "Cheque" },
  { value: "DINHEIRO", label: "Dinheiro" },
  { value: "DEPOSITO", label: "Depósito em Conta" },
];

// ===================== COMPONENTE PRINCIPAL =====================

export default function NegocioJuridico() {
  const navigate = useNavigate();
  const [data, setData] = useState(initialState);
  const [modalAlienante, setModalAlienante] = useState<Alienante | null>(null);
  const [modalAdquirente, setModalAdquirente] = useState<Adquirente | null>(null);
  const [consultando, setConsultando] = useState(false);
  const [showMinutaModal, setShowMinutaModal] = useState(false);

  // ========== HELPERS DE ATUALIZAÇÃO ==========

  const updateField = (field: string, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  // ========== ALIENANTES ==========

  const addAlienante = (tipo: "PESSOA_NATURAL" | "PESSOA_JURIDICA") => {
    const newAlienante: Alienante = {
      id: `ali-${Date.now()}`,
      tipo,
      nome: "",
      fracaoIdeal: "",
      valorAlienacao: "",
      ...(tipo === "PESSOA_NATURAL" && {
        conjuge: "",
        compareceNaEscritura: "SIM",
        qualidadeComparecimento: "ALIENANTE",
      }),
    };
    setData((prev) => ({
      ...prev,
      alienantes: [...prev.alienantes, newAlienante],
    }));
  };

  const updateAlienante = (id: string, field: keyof Alienante, value: string) => {
    setData((prev) => ({
      ...prev,
      alienantes: prev.alienantes.map((a) =>
        a.id === id ? { ...a, [field]: value } : a
      ),
    }));
  };

  const removeAlienante = (id: string) => {
    setData((prev) => ({
      ...prev,
      alienantes: prev.alienantes.filter((a) => a.id !== id),
    }));
  };

  // ========== ADQUIRENTES ==========

  const addAdquirente = (tipo: "PESSOA_NATURAL" | "PESSOA_JURIDICA") => {
    const newAdquirente: Adquirente = {
      id: `adq-${Date.now()}`,
      tipo,
      nome: "",
      fracaoIdeal: "",
      valorAquisicao: "",
    };
    setData((prev) => ({
      ...prev,
      adquirentes: [...prev.adquirentes, newAdquirente],
    }));
  };

  const updateAdquirente = (id: string, field: keyof Adquirente, value: string) => {
    setData((prev) => ({
      ...prev,
      adquirentes: prev.adquirentes.map((a) =>
        a.id === id ? { ...a, [field]: value } : a
      ),
    }));
  };

  const removeAdquirente = (id: string) => {
    setData((prev) => ({
      ...prev,
      adquirentes: prev.adquirentes.filter((a) => a.id !== id),
    }));
  };

  // ========== FORMA DE PAGAMENTO ==========

  const updateFormaPagamento = (field: keyof Omit<FormaPagamento, "contaOrigem" | "contaDestino">, value: string) => {
    setData((prev) => ({
      ...prev,
      formaPagamento: { ...prev.formaPagamento, [field]: value },
    }));
  };

  const updateContaOrigem = (field: keyof ContaBancaria, value: string) => {
    setData((prev) => ({
      ...prev,
      formaPagamento: {
        ...prev.formaPagamento,
        contaOrigem: { ...prev.formaPagamento.contaOrigem, [field]: value },
      },
    }));
  };

  const updateContaDestino = (field: keyof ContaBancaria, value: string) => {
    setData((prev) => ({
      ...prev,
      formaPagamento: {
        ...prev.formaPagamento,
        contaDestino: { ...prev.formaPagamento.contaDestino, [field]: value },
      },
    }));
  };

  // ========== TERMOS ESPECIAIS ==========

  const updateTermosEspeciais = (field: keyof TermosEspeciais, value: string) => {
    setData((prev) => ({
      ...prev,
      termosEspeciais: { ...prev.termosEspeciais, [field]: value },
    }));
  };

  // ========== DECLARAÇÕES ==========

  const toggleDeclaracaoAlienante = (field: keyof DeclaracoesAlienante) => {
    setData((prev) => ({
      ...prev,
      declaracoesAlienante: {
        ...prev.declaracoesAlienante,
        [field]: !prev.declaracoesAlienante[field],
      },
    }));
  };

  const toggleDispensa = (field: keyof Dispensas) => {
    setData((prev) => ({
      ...prev,
      dispensas: {
        ...prev.dispensas,
        [field]: !prev.dispensas[field],
      },
    }));
  };

  // ========== INDISPONIBILIDADE ==========

  const realizarConsultaIndisponibilidade = async () => {
    setConsultando(true);
    toast.info("Consultando indisponibilidade de bens...");
    
    // Simulação de consulta
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    const resultados: ResultadoIndisponibilidade[] = [
      ...data.alienantes.map((a) => ({
        id: `res-${a.id}`,
        status: "NEGATIVO" as const,
        nome: a.nome,
        hash: `HASH-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      })),
    ];

    setData((prev) => ({
      ...prev,
      resultadosIndisponibilidade: resultados,
      consultaRealizada: true,
    }));
    setConsultando(false);
    toast.success("Consulta realizada com sucesso!");
  };

  // ========== IMPOSTO ==========

  const updateImpostoTransmissao = (field: keyof ImpostoTransmissao, value: string) => {
    setData((prev) => ({
      ...prev,
      impostoTransmissao: { ...prev.impostoTransmissao, [field]: value },
    }));
  };

  // ========== GERAR MINUTA ==========

  const handleGerarMinuta = () => {
    setShowMinutaModal(true);
  };

  const confirmGerarMinuta = () => {
    setShowMinutaModal(false);
    toast.success("Minuta gerada com sucesso!", {
      description: "O documento está sendo preparado para download."
    });
    // Aqui viria a lógica de geração da minuta
  };

  // ========== ANIMAÇÕES ==========

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // ========== RENDER ==========

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="NEGÓCIO JURÍDICO"
          instruction="Configure os dados da operação de compra e venda."
        />

        <motion.div
          className="flex items-center gap-3 text-lg font-semibold text-foreground mb-6 uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <FileText className="w-6 h-6 text-accent" />
          Configuração do Negócio
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* ====== SEÇÃO 1: VALOR ====== */}
          <SectionCard title="Valor da Transação">
            <FieldGrid cols={3}>
              <FormField
                label="Valor da Matrícula"
                type="currency"
                value={data.valorMatricula}
                onChange={(v) => updateField("valorMatricula", v)}
                placeholder="R$ 0,00"
              />
              <FormField
                label="Fração Ideal Alienada"
                value={data.fracaoIdealAlienada}
                onChange={(v) => updateField("fracaoIdealAlienada", v)}
                placeholder="100%"
              />
              <FormField
                label="Valor Total da Alienação"
                type="currency"
                value={data.valorTotalAlienacao}
                onChange={(v) => updateField("valorTotalAlienacao", v)}
                placeholder="R$ 0,00"
              />
            </FieldGrid>
          </SectionCard>

          {/* ====== SEÇÃO 2: ALIENANTES ====== */}
          <motion.div
            variants={itemVariants}
            className="border-2 border-red-500/50 rounded-lg p-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-semibold text-red-500 uppercase tracking-wide">
                  Alienantes (Vendedores)
                  <span className="text-sm font-normal ml-2 opacity-70">({data.alienantes.length})</span>
                </h3>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => addAlienante("PESSOA_NATURAL")}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Pessoa Natural
                </button>
                <button
                  onClick={() => addAlienante("PESSOA_JURIDICA")}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-500 border border-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Pessoa Jurídica
                </button>
              </div>
            </div>

            <AnimatePresence mode="popLayout">
              {data.alienantes.map((ali, index) => (
                <motion.div
                  key={ali.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-red-500/5 border border-red-500/30 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-red-500">
                        Alienante {index + 1}
                      </span>
                      <span className="px-2 py-0.5 text-xs bg-red-500/20 text-red-500 rounded">
                        {ali.tipo === "PESSOA_NATURAL" ? "Pessoa Natural" : "Pessoa Jurídica"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setModalAlienante(ali)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-accent hover:text-accent/80 bg-accent/10 hover:bg-accent/20 rounded-md transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Ver Dados Completos
                      </button>
                      <button
                        onClick={() => removeAlienante(ali.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-destructive hover:text-destructive/80 bg-destructive/10 hover:bg-destructive/20 rounded-md transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <FieldGrid cols={4}>
                    <FormField
                      label={ali.tipo === "PESSOA_NATURAL" ? "Nome" : "Denominação"}
                      value={ali.nome}
                      onChange={(v) => updateAlienante(ali.id, "nome", v)}
                      className="col-span-2"
                    />
                    <FormField
                      label="Fração Ideal"
                      value={ali.fracaoIdeal}
                      onChange={(v) => updateAlienante(ali.id, "fracaoIdeal", v)}
                      placeholder="Ex: 50%"
                    />
                    <FormField
                      label="Valor da Alienação"
                      type="currency"
                      value={ali.valorAlienacao}
                      onChange={(v) => updateAlienante(ali.id, "valorAlienacao", v)}
                      placeholder="R$ 0,00"
                    />
                  </FieldGrid>
                  {ali.tipo === "PESSOA_NATURAL" && (
                    <FieldGrid cols={2} className="mt-3">
                      <FormField
                        label="Cônjuge"
                        value={ali.conjuge || ""}
                        onChange={(v) => updateAlienante(ali.id, "conjuge", v)}
                      />
                      <FormField
                        label="Comparece na Escritura?"
                        type="select"
                        value={ali.compareceNaEscritura || "SIM"}
                        onChange={(v) => updateAlienante(ali.id, "compareceNaEscritura", v)}
                        options={simnaoOptions}
                      />
                    </FieldGrid>
                  )}

                  {ali.tipo === "PESSOA_NATURAL" && (
                    <div className="mt-3">
                      <FormField
                        label="Qualidade do Comparecimento"
                        type="select"
                        value={ali.qualidadeComparecimento || "ALIENANTE"}
                        onChange={(v) => updateAlienante(ali.id, "qualidadeComparecimento", v)}
                        options={qualidadeComparecimentoOptions}
                      />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {data.alienantes.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhum alienante cadastrado.</p>
                <p className="text-sm mt-1">Adicione pelo menos um alienante para continuar.</p>
              </div>
            )}
          </motion.div>

          {/* ====== SEÇÃO 3: ADQUIRENTES ====== */}
          <motion.div
            variants={itemVariants}
            className="border-2 border-green-500/50 rounded-lg p-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-500" />
                <h3 className="text-lg font-semibold text-green-500 uppercase tracking-wide">
                  Adquirentes (Compradores)
                  <span className="text-sm font-normal ml-2 opacity-70">({data.adquirentes.length})</span>
                </h3>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => addAdquirente("PESSOA_NATURAL")}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-500 hover:bg-green-600 rounded-md transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Pessoa Natural
                </button>
                <button
                  onClick={() => addAdquirente("PESSOA_JURIDICA")}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-500 border border-green-500 hover:bg-green-500/10 rounded-md transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Pessoa Jurídica
                </button>
              </div>
            </div>

            <AnimatePresence mode="popLayout">
              {data.adquirentes.map((adq, index) => (
                <motion.div
                  key={adq.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-green-500/5 border border-green-500/30 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-green-500">
                        Adquirente {index + 1}
                      </span>
                      <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-500 rounded">
                        {adq.tipo === "PESSOA_NATURAL" ? "Pessoa Natural" : "Pessoa Jurídica"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setModalAdquirente(adq)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-accent hover:text-accent/80 bg-accent/10 hover:bg-accent/20 rounded-md transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Ver Dados Completos
                      </button>
                      <button
                        onClick={() => removeAdquirente(adq.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-destructive hover:text-destructive/80 bg-destructive/10 hover:bg-destructive/20 rounded-md transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <FieldGrid cols={3}>
                    <FormField
                      label={adq.tipo === "PESSOA_NATURAL" ? "Nome" : "Denominação"}
                      value={adq.nome}
                      onChange={(v) => updateAdquirente(adq.id, "nome", v)}
                    />
                    <FormField
                      label="Fração Ideal"
                      value={adq.fracaoIdeal}
                      onChange={(v) => updateAdquirente(adq.id, "fracaoIdeal", v)}
                      placeholder="Ex: 100%"
                    />
                    <FormField
                      label="Valor da Aquisição"
                      type="currency"
                      value={adq.valorAquisicao}
                      onChange={(v) => updateAdquirente(adq.id, "valorAquisicao", v)}
                      placeholder="R$ 0,00"
                    />
                  </FieldGrid>
                </motion.div>
              ))}
            </AnimatePresence>

            {data.adquirentes.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhum adquirente cadastrado.</p>
                <p className="text-sm mt-1">Adicione pelo menos um adquirente para continuar.</p>
              </div>
            )}
          </motion.div>

          {/* ====== SEÇÃO 4: FORMA DE PAGAMENTO ====== */}
          <SectionCard title="Forma de Pagamento">
            <div className="space-y-4">
              <FieldGrid cols={3}>
                <FormField
                  label="Tipo de Pagamento"
                  type="select"
                  value={data.formaPagamento.tipoPagamento}
                  onChange={(v) => updateFormaPagamento("tipoPagamento", v)}
                  options={tipoPagamentoOptions}
                />
                <FormField
                  label="Modo de Pagamento"
                  type="select"
                  value={data.formaPagamento.modoPagamento}
                  onChange={(v) => updateFormaPagamento("modoPagamento", v)}
                  options={modoPagamentoOptions}
                />
                <FormField
                  label="Data do Pagamento"
                  type="date"
                  value={data.formaPagamento.dataPagamento}
                  onChange={(v) => updateFormaPagamento("dataPagamento", v)}
                />
              </FieldGrid>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4 border-t border-border/50">
                {/* Conta de Origem */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    <CreditCard className="w-4 h-4" />
                    Conta Bancária de Origem (Adquirente)
                  </div>
                  <FieldGrid cols={3}>
                    <FormField
                      label="Banco"
                      value={data.formaPagamento.contaOrigem.banco}
                      onChange={(v) => updateContaOrigem("banco", v)}
                    />
                    <FormField
                      label="Agência"
                      value={data.formaPagamento.contaOrigem.agencia}
                      onChange={(v) => updateContaOrigem("agencia", v)}
                    />
                    <FormField
                      label="Conta"
                      value={data.formaPagamento.contaOrigem.conta}
                      onChange={(v) => updateContaOrigem("conta", v)}
                    />
                  </FieldGrid>
                </div>

                {/* Conta de Destino */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    <CreditCard className="w-4 h-4" />
                    Conta Bancária de Destino (Alienante)
                  </div>
                  <FieldGrid cols={3}>
                    <FormField
                      label="Banco"
                      value={data.formaPagamento.contaDestino.banco}
                      onChange={(v) => updateContaDestino("banco", v)}
                    />
                    <FormField
                      label="Agência"
                      value={data.formaPagamento.contaDestino.agencia}
                      onChange={(v) => updateContaDestino("agencia", v)}
                    />
                    <FormField
                      label="Conta"
                      value={data.formaPagamento.contaDestino.conta}
                      onChange={(v) => updateContaDestino("conta", v)}
                    />
                  </FieldGrid>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* ====== SEÇÃO 5: TERMOS ESPECIAIS ====== */}
          <SectionCard title="Termos Especiais da Escritura">
            <div className="space-y-4">
              <FormField
                label="Termos Constantes na Promessa de Compra e Venda"
                type="textarea"
                value={data.termosEspeciais.termosPromessa}
                onChange={(v) => updateTermosEspeciais("termosPromessa", v)}
                placeholder="Insira os termos da promessa, se houver..."
                fullWidth
              />
              <FormField
                label="Insira Termos Especiais (Constarão na Minuta Conforme Digitado)"
                type="textarea"
                value={data.termosEspeciais.termosEspeciais}
                onChange={(v) => updateTermosEspeciais("termosEspeciais", v)}
                placeholder="Ex: Condição resolutiva, cláusulas especiais..."
                fullWidth
              />
              <FormField
                label="Explique o que Você Quer que Conste na Minuta ou Dê Instruções Extras"
                type="textarea"
                value={data.termosEspeciais.instrucoesExtras}
                onChange={(v) => updateTermosEspeciais("instrucoesExtras", v)}
                placeholder="Instruções adicionais para a minuta..."
                fullWidth
              />
            </div>
          </SectionCard>

          {/* ====== SEÇÃO 6: DECLARAÇÕES ====== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Declarações do Alienante */}
            <SectionCard title="Declarações do(s) Alienante(s)">
              <div className="space-y-3">
                <CheckboxField
                  checked={data.declaracoesAlienante.inexistenciaAcoesReais}
                  onChange={() => toggleDeclaracaoAlienante("inexistenciaAcoesReais")}
                  label="Inexistência de ações reais e pessoais reipersecutórias e de outros ônus reais sobre o(s) imóvel(is)"
                />
                <CheckboxField
                  checked={data.declaracoesAlienante.inexistenciaDebitosCondominiais}
                  onChange={() => toggleDeclaracaoAlienante("inexistenciaDebitosCondominiais")}
                  label="Inexistência de débitos condominiais"
                />
                <CheckboxField
                  checked={data.declaracoesAlienante.inexistenciaDebitosIPTU}
                  onChange={() => toggleDeclaracaoAlienante("inexistenciaDebitosIPTU")}
                  label="Inexistência de débitos de IPTU"
                />
                <CheckboxField
                  checked={data.declaracoesAlienante.inexistenciaDebitosAmbientais}
                  onChange={() => toggleDeclaracaoAlienante("inexistenciaDebitosAmbientais")}
                  label="Inexistência de débitos ambientais"
                />
                <CheckboxField
                  checked={data.declaracoesAlienante.naoVinculacaoINSS}
                  onChange={() => toggleDeclaracaoAlienante("naoVinculacaoINSS")}
                  label="Não vinculação ao INSS na qualidade de empregador ou produtor rural"
                />
                <CheckboxField
                  checked={data.declaracoesAlienante.naoEPEP}
                  onChange={() => toggleDeclaracaoAlienante("naoEPEP")}
                  label="Não é Pessoa Exposta Politicamente (PEP)"
                />
              </div>
            </SectionCard>

            {/* Dispensas */}
            <SectionCard title="Dispensas">
              <div className="space-y-3">
                <CheckboxField
                  checked={data.dispensas.dispensaCertidoesFeitos}
                  onChange={() => toggleDispensa("dispensaCertidoesFeitos")}
                  label="Dispensa de certidões de ações de feitos ajuizados"
                />
                <CheckboxField
                  checked={data.dispensas.dispensaCertidoesIPTU}
                  onChange={() => toggleDispensa("dispensaCertidoesIPTU")}
                  label="Dispensa de certidões negativas de IPTU"
                />
                <CheckboxField
                  checked={data.dispensas.dispensaCertidaoUniao}
                  onChange={() => toggleDispensa("dispensaCertidaoUniao")}
                  label="Dispensa de certidão da União"
                />
                <CheckboxField
                  checked={data.dispensas.dispensaDeclaracaoSindico}
                  onChange={() => toggleDispensa("dispensaDeclaracaoSindico")}
                  label="Dispensa de declaração de quitação condominial pelo síndico"
                />
                <CheckboxField
                  checked={data.dispensas.dispensaCNDT}
                  onChange={() => toggleDispensa("dispensaCNDT")}
                  label="Dispensa de Certidão Negativa de Débitos Trabalhistas (CNDT)"
                />
                <CheckboxField
                  checked={data.dispensas.adquirenteNaoEPEP}
                  onChange={() => toggleDispensa("adquirenteNaoEPEP")}
                  label="Adquirente não é Pessoa Exposta Politicamente (PEP)"
                />
              </div>
            </SectionCard>
          </div>

          {/* ====== SEÇÃO 7: INDISPONIBILIDADE DE BENS ====== */}
          <motion.div
            variants={itemVariants}
            className="border-2 border-purple-500/50 rounded-lg p-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-purple-500" />
                <h3 className="text-lg font-semibold text-purple-500 uppercase tracking-wide">
                  Indisponibilidade de Bens
                </h3>
              </div>
              <button
                onClick={realizarConsultaIndisponibilidade}
                disabled={consultando}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
              >
                {consultando ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Search className="w-4 h-4" />
                    </motion.div>
                    Consultando...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Realizar Consulta
                  </>
                )}
              </button>
            </div>

            {data.consultaRealizada && (
              <div className="space-y-2">
                {data.resultadosIndisponibilidade.map((resultado) => (
                  <div
                    key={resultado.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      resultado.status === "NEGATIVO"
                        ? "bg-green-500/10 border border-green-500/30"
                        : "bg-red-500/10 border border-red-500/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {resultado.status === "NEGATIVO" ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <div>
                        <p className="font-medium">{resultado.nome}</p>
                        <p className="text-xs text-muted-foreground">Hash: {resultado.hash}</p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        resultado.status === "NEGATIVO"
                          ? "bg-green-500/20 text-green-500"
                          : "bg-red-500/20 text-red-500"
                      }`}
                    >
                      {resultado.status}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {!data.consultaRealizada && (
              <div className="text-center py-8 text-muted-foreground">
                <p>Consulta não realizada.</p>
                <p className="text-sm mt-1">Clique em "Realizar Consulta" para verificar indisponibilidade de bens.</p>
              </div>
            )}
          </motion.div>

          {/* ====== SEÇÃO 8: IMPOSTO DE TRANSMISSÃO ====== */}
          <SectionCard title="Imposto de Transmissão (ITBI)">
            <FieldGrid cols={3}>
              <FormField
                label="Número da Guia de ITBI"
                value={data.impostoTransmissao.numeroGuiaITBI}
                onChange={(v) => updateImpostoTransmissao("numeroGuiaITBI", v)}
              />
              <FormField
                label="Base de Cálculo"
                type="currency"
                value={data.impostoTransmissao.baseCalculo}
                onChange={(v) => updateImpostoTransmissao("baseCalculo", v)}
                placeholder="R$ 0,00"
              />
              <FormField
                label="Valor da Guia"
                type="currency"
                value={data.impostoTransmissao.valorGuia}
                onChange={(v) => updateImpostoTransmissao("valorGuia", v)}
                placeholder="R$ 0,00"
              />
            </FieldGrid>
          </SectionCard>

          {/* ====== BOTÃO GERAR MINUTA ====== */}
          <motion.div
            variants={itemVariants}
            className="flex justify-center pt-6"
          >
            <button
              onClick={handleGerarMinuta}
              className="flex items-center gap-3 px-8 py-4 text-lg font-semibold text-background bg-accent hover:bg-accent/90 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              <FileCheck className="w-6 h-6" />
              GERAR MINUTA
            </button>
          </motion.div>
        </motion.div>

        <NavigationBar
          onBack={() => navigate("/imovel")}
          onNext={() => navigate("/upload")}
          nextLabel="Upload de Arquivos"
        />
      </div>

      {/* ====== MODAL: CONFIRMAÇÃO GERAR MINUTA ====== */}
      <AnimatePresence>
        {showMinutaModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowMinutaModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border-2 border-accent rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <FileCheck className="w-6 h-6 text-accent" />
                <h3 className="text-lg font-semibold text-foreground">Gerar Minuta</h3>
              </div>

              <p className="text-muted-foreground mb-6">
                Você está prestes a gerar a minuta do negócio jurídico. 
                Certifique-se de que todos os dados estão corretos antes de prosseguir.
              </p>

              <div className="bg-secondary/50 rounded-lg p-4 mb-6">
                <p className="text-sm text-muted-foreground">
                  <strong>Resumo:</strong>
                </p>
                <ul className="text-sm mt-2 space-y-1">
                  <li>• {data.alienantes.length} alienante(s)</li>
                  <li>• {data.adquirentes.length} adquirente(s)</li>
                  <li>• Valor: R$ {Number(data.valorTotalAlienacao).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</li>
                </ul>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowMinutaModal(false)}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmGerarMinuta}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-background bg-accent hover:bg-accent/90 rounded-md transition-colors"
                >
                  <FileCheck className="w-4 h-4" />
                  Confirmar e Gerar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ====== MODAL: ALIENANTE ====== */}
      <AnimatePresence>
        {modalAlienante && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setModalAlienante(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border-2 border-red-500 rounded-lg p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-red-500">Dados Completos do Alienante</h3>
                <button
                  onClick={() => setModalAlienante(null)}
                  className="p-2 hover:bg-muted rounded-md transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Tipo</p>
                    <p className="font-medium">{modalAlienante.tipo === "PESSOA_NATURAL" ? "Pessoa Natural" : "Pessoa Jurídica"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{modalAlienante.tipo === "PESSOA_NATURAL" ? "Nome" : "Denominação"}</p>
                    <p className="font-medium">{modalAlienante.nome || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Fração Ideal</p>
                    <p className="font-medium">{modalAlienante.fracaoIdeal || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Valor da Alienação</p>
                    <p className="font-medium">R$ {Number(modalAlienante.valorAlienacao || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                  {modalAlienante.tipo === "PESSOA_NATURAL" && (
                    <>
                      <div>
                        <p className="text-muted-foreground">Cônjuge</p>
                        <p className="font-medium">{modalAlienante.conjuge || "-"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Comparece na Escritura?</p>
                        <p className="font-medium">{modalAlienante.compareceNaEscritura || "-"}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-muted-foreground">Qualidade do Comparecimento</p>
                        <p className="font-medium">{modalAlienante.qualidadeComparecimento || "-"}</p>
                      </div>
                    </>
                  )}
                </div>

                <p className="text-xs text-muted-foreground pt-4 border-t border-border">
                  Para ver dados pessoais completos, consulte a página de Pessoa Natural ou Pessoa Jurídica.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ====== MODAL: ADQUIRENTE ====== */}
      <AnimatePresence>
        {modalAdquirente && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setModalAdquirente(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border-2 border-green-500 rounded-lg p-6 max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-green-500">Dados Completos do Adquirente</h3>
                <button
                  onClick={() => setModalAdquirente(null)}
                  className="p-2 hover:bg-muted rounded-md transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Tipo</p>
                    <p className="font-medium">{modalAdquirente.tipo === "PESSOA_NATURAL" ? "Pessoa Natural" : "Pessoa Jurídica"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{modalAdquirente.tipo === "PESSOA_NATURAL" ? "Nome" : "Denominação"}</p>
                    <p className="font-medium">{modalAdquirente.nome || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Fração Ideal</p>
                    <p className="font-medium">{modalAdquirente.fracaoIdeal || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Valor da Aquisição</p>
                    <p className="font-medium">R$ {Number(modalAdquirente.valorAquisicao || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground pt-4 border-t border-border">
                  Para ver dados pessoais completos, consulte a página de Pessoa Natural ou Pessoa Jurídica.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

// ===================== COMPONENTE CHECKBOX =====================

interface CheckboxFieldProps {
  checked: boolean;
  onChange: () => void;
  label: string;
}

function CheckboxField({ checked, onChange, label }: CheckboxFieldProps) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div
        onClick={onChange}
        className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
          checked
            ? "bg-accent border-accent"
            : "border-border hover:border-accent/50"
        }`}
      >
        {checked && (
          <motion.svg
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-3 h-3 text-background"
            viewBox="0 0 12 12"
          >
            <path
              fill="currentColor"
              d="M10.28 2.28L4.5 8.06 1.72 5.28a1 1 0 00-1.44 1.44l3.5 3.5a1 1 0 001.44 0l6.5-6.5a1 1 0 00-1.44-1.44z"
            />
          </motion.svg>
        )}
      </div>
      <span className="text-sm text-foreground group-hover:text-accent transition-colors">
        {label}
      </span>
    </label>
  );
}
