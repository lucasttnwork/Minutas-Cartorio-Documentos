import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader, SectionCard, FieldGrid, NavigationBar } from "@/components/layout";
import { FormField, AddressFields, ESTADOS_BR } from "@/components/forms";
import { RefreshCw, Plus, Trash2, Eye, X, Building2, AlertTriangle } from "lucide-react";

// ===================== INTERFACES =====================

interface EnderecoImovel {
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

interface MatriculaImobiliaria {
  numeroMatricula: string;
  numeroRegistroImoveis: string;
  cidadeRegistroImoveis: string;
  estadoRegistroImoveis: string;
  numeroNacionalMatricula: string;
}

interface DescricaoImovel {
  denominacao: string;
  areaTotalM2: string;
  areaPrivativaM2: string;
  areaConstruida: string;
  endereco: EnderecoImovel;
  descricaoConformeMatricula: string;
}

interface CadastroImobiliario {
  cadastroMunicipalSQL: string;
  dataExpedicaoCertidao: string;
}

interface ValoresVenais {
  valorVenalIPTU: string;
  valorVenalReferenciaITBI: string;
}

interface NegativaIPTU {
  numeroCertidao: string;
  dataExpedicao: string;
  certidaoValida: string;
}

interface CertidaoMatricula {
  certidaoMatricula: string;
  dataExpedicao: string;
  certidaoValida: string;
}

interface Proprietario {
  id: string;
  nome: string;
  fracaoIdeal: string;
  registroAquisicao: string;
  dataRegistroAquisicao: string;
  tituloAquisicao: string;
}

interface TitularOnus {
  id: string;
  nome: string;
  fracaoIdeal: string;
}

interface OnusRegistrado {
  id: string;
  tituloOnus: string;
  registroOnus: string;
  dataRegistroOnus: string;
  descricaoConformeMatricula: string;
  titulares: TitularOnus[];
}

interface RessalvasMatricula {
  existeRessalva: string;
  descricaoRessalva: string;
}

// ===================== ESTADO INICIAL =====================

const initialState = {
  // SEÇÃO 1: MATRÍCULA IMOBILIÁRIA (5 campos)
  matricula: {
    numeroMatricula: "123.456",
    numeroRegistroImoveis: "1º Ofício",
    cidadeRegistroImoveis: "SÃO PAULO",
    estadoRegistroImoveis: "SP",
    numeroNacionalMatricula: "0001234567890123456789012345678901234567",
  } as MatriculaImobiliaria,

  // SEÇÃO 2: DESCRIÇÃO DO IMÓVEL (12 campos)
  descricao: {
    denominacao: "APARTAMENTO",
    areaTotalM2: "120,00",
    areaPrivativaM2: "95,00",
    areaConstruida: "110,00",
    endereco: {
      logradouro: "AVENIDA PAULISTA",
      numero: "1000",
      complemento: "APTO 101 - TORRE A",
      bairro: "BELA VISTA",
      cidade: "SÃO PAULO",
      estado: "SP",
      cep: "01310-100",
    },
    descricaoConformeMatricula: "APARTAMENTO RESIDENCIAL Nº 101, LOCALIZADO NO 10º ANDAR DO EDIFÍCIO PAULISTA TOWER, CONTENDO SALA, 3 DORMITÓRIOS (SENDO 1 SUÍTE), COZINHA, ÁREA DE SERVIÇO, BANHEIRO SOCIAL E 2 VAGAS DE GARAGEM COBERTAS NOS NºS 101 E 102.",
  } as DescricaoImovel,

  // SEÇÃO 3: CADASTRO IMOBILIÁRIO (2 campos)
  cadastro: {
    cadastroMunicipalSQL: "000.000.0000-0",
    dataExpedicaoCertidao: "2024-01-15",
  } as CadastroImobiliario,

  // SEÇÃO 4: VALORES VENAIS (2 campos)
  valoresVenais: {
    valorVenalIPTU: "R$ 850.000,00",
    valorVenalReferenciaITBI: "R$ 920.000,00",
  } as ValoresVenais,

  // SEÇÃO 5: NEGATIVA DE IPTU (3 campos)
  negativaIPTU: {
    numeroCertidao: "2024/001234",
    dataExpedicao: "2024-01-10",
    certidaoValida: "SIM",
  } as NegativaIPTU,

  // SEÇÃO 6: CERTIDÃO DA MATRÍCULA (3 campos)
  certidaoMatricula: {
    certidaoMatricula: "CERT-2024-00567",
    dataExpedicao: "2024-01-12",
    certidaoValida: "SIM",
  } as CertidaoMatricula,

  // SEÇÃO 7: PROPRIETÁRIOS (5 campos cada)
  proprietarios: [
    {
      id: "prop-1",
      nome: "MARIA DA SILVA",
      fracaoIdeal: "50%",
      registroAquisicao: "R.4",
      dataRegistroAquisicao: "2015-03-20",
      tituloAquisicao: "COMPRA E VENDA",
    },
    {
      id: "prop-2",
      nome: "JOÃO DA SILVA",
      fracaoIdeal: "50%",
      registroAquisicao: "R.4",
      dataRegistroAquisicao: "2015-03-20",
      tituloAquisicao: "COMPRA E VENDA",
    },
  ] as Proprietario[],

  // SEÇÃO 8: ÔNUS REGISTRADO(S) (4 campos + titulares)
  onus: [] as OnusRegistrado[],

  // SEÇÃO 9: RESSALVAS NA CERTIFICAÇÃO (2 campos)
  ressalvas: {
    existeRessalva: "NAO",
    descricaoRessalva: "",
  } as RessalvasMatricula,
};

// ===================== OPTIONS =====================

const denominacaoOptions = [
  { value: "APARTAMENTO", label: "Apartamento" },
  { value: "CASA", label: "Casa" },
  { value: "TERRENO", label: "Terreno" },
  { value: "SALA_COMERCIAL", label: "Sala Comercial" },
  { value: "LOJA", label: "Loja" },
  { value: "GALPAO", label: "Galpão" },
  { value: "FAZENDA", label: "Fazenda" },
  { value: "SITIO", label: "Sítio" },
  { value: "CHACARA", label: "Chácara" },
  { value: "VAGA_GARAGEM", label: "Vaga de Garagem" },
];

const simnaoOptions = [
  { value: "SIM", label: "Sim" },
  { value: "NAO", label: "Não" },
];

const tituloAquisicaoOptions = [
  { value: "COMPRA_E_VENDA", label: "Compra e Venda" },
  { value: "DOACAO", label: "Doação" },
  { value: "HERANCA", label: "Herança" },
  { value: "PERMUTA", label: "Permuta" },
  { value: "ADJUDICACAO", label: "Adjudicação" },
  { value: "USUCAPIAO", label: "Usucapião" },
  { value: "DACAO_PAGAMENTO", label: "Dação em Pagamento" },
];

const tipoOnusOptions = [
  { value: "HIPOTECA", label: "Hipoteca" },
  { value: "PENHORA", label: "Penhora" },
  { value: "ALIENACAO_FIDUCIARIA", label: "Alienação Fiduciária" },
  { value: "USUFRUTO", label: "Usufruto" },
  { value: "SERVIDAO", label: "Servidão" },
  { value: "CLAUSULA_RESTRITIVA", label: "Cláusula Restritiva" },
  { value: "INDISPONIBILIDADE", label: "Indisponibilidade" },
  { value: "OUTRO", label: "Outro" },
];

const estadosOptions = ESTADOS_BR.map((e) => ({ value: e.value, label: `${e.value} - ${e.label}` }));

// ===================== COMPONENTE PRINCIPAL =====================

export default function Imovel() {
  const navigate = useNavigate();
  const [data, setData] = useState(initialState);
  const [modalProprietario, setModalProprietario] = useState<Proprietario | null>(null);
  const [modalTitular, setModalTitular] = useState<TitularOnus | null>(null);

  // ========== HELPERS DE ATUALIZAÇÃO ==========

  const updateMatricula = (field: keyof MatriculaImobiliaria, value: string) => {
    setData((prev) => ({
      ...prev,
      matricula: { ...prev.matricula, [field]: value },
    }));
  };

  const updateDescricao = (field: keyof Omit<DescricaoImovel, "endereco">, value: string) => {
    setData((prev) => ({
      ...prev,
      descricao: { ...prev.descricao, [field]: value },
    }));
  };

  const updateDescricaoEndereco = (field: keyof EnderecoImovel, value: string) => {
    setData((prev) => ({
      ...prev,
      descricao: {
        ...prev.descricao,
        endereco: { ...prev.descricao.endereco, [field]: value },
      },
    }));
  };

  const updateCadastro = (field: keyof CadastroImobiliario, value: string) => {
    setData((prev) => ({
      ...prev,
      cadastro: { ...prev.cadastro, [field]: value },
    }));
  };

  const updateValoresVenais = (field: keyof ValoresVenais, value: string) => {
    setData((prev) => ({
      ...prev,
      valoresVenais: { ...prev.valoresVenais, [field]: value },
    }));
  };

  const updateNegativaIPTU = (field: keyof NegativaIPTU, value: string) => {
    setData((prev) => ({
      ...prev,
      negativaIPTU: { ...prev.negativaIPTU, [field]: value },
    }));
  };

  const updateCertidaoMatricula = (field: keyof CertidaoMatricula, value: string) => {
    setData((prev) => ({
      ...prev,
      certidaoMatricula: { ...prev.certidaoMatricula, [field]: value },
    }));
  };

  const updateRessalvas = (field: keyof RessalvasMatricula, value: string) => {
    setData((prev) => ({
      ...prev,
      ressalvas: { ...prev.ressalvas, [field]: value },
    }));
  };

  // ========== PROPRIETÁRIOS ==========

  const addProprietario = () => {
    const newProp: Proprietario = {
      id: `prop-${Date.now()}`,
      nome: "",
      fracaoIdeal: "",
      registroAquisicao: "",
      dataRegistroAquisicao: "",
      tituloAquisicao: "",
    };
    setData((prev) => ({
      ...prev,
      proprietarios: [...prev.proprietarios, newProp],
    }));
  };

  const updateProprietario = (id: string, field: keyof Proprietario, value: string) => {
    setData((prev) => ({
      ...prev,
      proprietarios: prev.proprietarios.map((p) =>
        p.id === id ? { ...p, [field]: value } : p
      ),
    }));
  };

  const removeProprietario = (id: string) => {
    setData((prev) => ({
      ...prev,
      proprietarios: prev.proprietarios.filter((p) => p.id !== id),
    }));
  };

  // ========== ÔNUS ==========

  const addOnus = () => {
    const newOnus: OnusRegistrado = {
      id: `onus-${Date.now()}`,
      tituloOnus: "",
      registroOnus: "",
      dataRegistroOnus: "",
      descricaoConformeMatricula: "",
      titulares: [],
    };
    setData((prev) => ({
      ...prev,
      onus: [...prev.onus, newOnus],
    }));
  };

  const updateOnus = (id: string, field: keyof Omit<OnusRegistrado, "titulares" | "id">, value: string) => {
    setData((prev) => ({
      ...prev,
      onus: prev.onus.map((o) =>
        o.id === id ? { ...o, [field]: value } : o
      ),
    }));
  };

  const removeOnus = (id: string) => {
    setData((prev) => ({
      ...prev,
      onus: prev.onus.filter((o) => o.id !== id),
    }));
  };

  const addTitularOnus = (onusId: string) => {
    const newTitular: TitularOnus = {
      id: `titular-${Date.now()}`,
      nome: "",
      fracaoIdeal: "",
    };
    setData((prev) => ({
      ...prev,
      onus: prev.onus.map((o) =>
        o.id === onusId ? { ...o, titulares: [...o.titulares, newTitular] } : o
      ),
    }));
  };

  const updateTitularOnus = (onusId: string, titularId: string, field: keyof TitularOnus, value: string) => {
    setData((prev) => ({
      ...prev,
      onus: prev.onus.map((o) =>
        o.id === onusId
          ? {
              ...o,
              titulares: o.titulares.map((t) =>
                t.id === titularId ? { ...t, [field]: value } : t
              ),
            }
          : o
      ),
    }));
  };

  const removeTitularOnus = (onusId: string, titularId: string) => {
    setData((prev) => ({
      ...prev,
      onus: prev.onus.map((o) =>
        o.id === onusId
          ? { ...o, titulares: o.titulares.filter((t) => t.id !== titularId) }
          : o
      ),
    }));
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
          title="CONFERÊNCIA E COMPLEMENTAÇÃO DOS IMÓVEIS"
          instruction="Confira todos os dados e preencha os campos faltantes."
        />

        <motion.div
          className="flex items-center gap-3 text-lg font-semibold text-foreground mb-6 uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Building2 className="w-6 h-6 text-accent" />
          Dados do Imóvel
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* ====== LINHA 1: Matrícula Imobiliária + Cadastro Imobiliário ====== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SEÇÃO 1: MATRÍCULA IMOBILIÁRIA (5 campos) */}
            <SectionCard title="Matrícula Imobiliária">
              <FieldGrid cols={2}>
                <FormField
                  label="Número da Matrícula"
                  value={data.matricula.numeroMatricula}
                  onChange={(v) => updateMatricula("numeroMatricula", v)}
                  placeholder="000.000"
                />
                <FormField
                  label="Nº do Registro de Imóveis"
                  value={data.matricula.numeroRegistroImoveis}
                  onChange={(v) => updateMatricula("numeroRegistroImoveis", v)}
                  placeholder="Ex: 1º Ofício"
                />
                <FormField
                  label="Cidade do Registro"
                  value={data.matricula.cidadeRegistroImoveis}
                  onChange={(v) => updateMatricula("cidadeRegistroImoveis", v)}
                />
                <FormField
                  label="Estado do Registro"
                  type="select"
                  value={data.matricula.estadoRegistroImoveis}
                  onChange={(v) => updateMatricula("estadoRegistroImoveis", v)}
                  options={estadosOptions}
                />
                <FormField
                  label="Número Nacional de Matrícula"
                  value={data.matricula.numeroNacionalMatricula}
                  onChange={(v) => updateMatricula("numeroNacionalMatricula", v)}
                  placeholder="40 dígitos"
                  fullWidth
                  className="col-span-2"
                />
              </FieldGrid>
            </SectionCard>

            {/* SEÇÃO 3: CADASTRO IMOBILIÁRIO (2 campos) */}
            <SectionCard title="Cadastro Imobiliário">
              <FieldGrid cols={1}>
                <FormField
                  label="Cadastro Municipal (SQL)"
                  value={data.cadastro.cadastroMunicipalSQL}
                  onChange={(v) => updateCadastro("cadastroMunicipalSQL", v)}
                  placeholder="000.000.0000-0"
                />
                <FormField
                  label="Data de Expedição da Certidão de Cadastro Municipal"
                  type="date"
                  value={data.cadastro.dataExpedicaoCertidao}
                  onChange={(v) => updateCadastro("dataExpedicaoCertidao", v)}
                />
              </FieldGrid>
            </SectionCard>
          </div>

          {/* ====== SEÇÃO 2: DESCRIÇÃO DO IMÓVEL (12 campos) ====== */}
          <SectionCard title="Descrição do Imóvel">
            <div className="space-y-4">
              <FieldGrid cols={4}>
                <FormField
                  label="Denominação"
                  type="select"
                  value={data.descricao.denominacao}
                  onChange={(v) => updateDescricao("denominacao", v)}
                  options={denominacaoOptions}
                />
                <FormField
                  label="Área Total (m²)"
                  value={data.descricao.areaTotalM2}
                  onChange={(v) => updateDescricao("areaTotalM2", v)}
                  placeholder="000,00"
                />
                <FormField
                  label="Área Privativa (m²)"
                  value={data.descricao.areaPrivativaM2}
                  onChange={(v) => updateDescricao("areaPrivativaM2", v)}
                  placeholder="000,00"
                />
                <FormField
                  label="Área Construída (m²)"
                  value={data.descricao.areaConstruida}
                  onChange={(v) => updateDescricao("areaConstruida", v)}
                  placeholder="000,00"
                />
              </FieldGrid>

              <div className="border-t border-border/50 pt-4">
                <p className="text-sm text-muted-foreground mb-3 uppercase tracking-wide">Endereço do Imóvel</p>
                <AddressFields
                  values={data.descricao.endereco}
                  onChange={updateDescricaoEndereco}
                />
              </div>

              <div className="border-t border-border/50 pt-4">
                <FormField
                  label="Descrição conforme a Matrícula"
                  type="textarea"
                  value={data.descricao.descricaoConformeMatricula}
                  onChange={(v) => updateDescricao("descricaoConformeMatricula", v)}
                  placeholder="Descrição completa do imóvel conforme consta na matrícula..."
                  fullWidth
                />
              </div>
            </div>
          </SectionCard>

          {/* ====== LINHA 2: Valores Venais + Negativa IPTU + Certidão Matrícula ====== */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* SEÇÃO 4: VALORES VENAIS (2 campos) */}
            <SectionCard 
              title="Valores Venais"
              action={
                <button
                  onClick={() => console.log("Atualizar valores venais")}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-accent hover:text-accent/80 bg-accent/10 hover:bg-accent/20 rounded-md transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Atualizar
                </button>
              }
            >
              <FieldGrid cols={1}>
                <FormField
                  label="Valor Venal (IPTU)"
                  value={data.valoresVenais.valorVenalIPTU}
                  onChange={(v) => updateValoresVenais("valorVenalIPTU", v)}
                  placeholder="R$ 0,00"
                />
                <FormField
                  label="Valor Venal de Referência (ITBI)"
                  value={data.valoresVenais.valorVenalReferenciaITBI}
                  onChange={(v) => updateValoresVenais("valorVenalReferenciaITBI", v)}
                  placeholder="R$ 0,00"
                />
              </FieldGrid>
            </SectionCard>

            {/* SEÇÃO 5: NEGATIVA DE IPTU (3 campos) */}
            <SectionCard 
              title="Negativa de IPTU"
              action={
                <button
                  onClick={() => console.log("Atualizar certidão IPTU")}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-accent hover:text-accent/80 bg-accent/10 hover:bg-accent/20 rounded-md transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Atualizar
                </button>
              }
            >
              <FieldGrid cols={1}>
                <FormField
                  label="Número da Certidão"
                  value={data.negativaIPTU.numeroCertidao}
                  onChange={(v) => updateNegativaIPTU("numeroCertidao", v)}
                />
                <FormField
                  label="Data de Expedição"
                  type="date"
                  value={data.negativaIPTU.dataExpedicao}
                  onChange={(v) => updateNegativaIPTU("dataExpedicao", v)}
                />
                <FormField
                  label="Certidão Válida?"
                  type="select"
                  value={data.negativaIPTU.certidaoValida}
                  onChange={(v) => updateNegativaIPTU("certidaoValida", v)}
                  options={simnaoOptions}
                />
              </FieldGrid>
            </SectionCard>

            {/* SEÇÃO 6: CERTIDÃO DA MATRÍCULA (3 campos) */}
            <SectionCard title="Certidão da Matrícula">
              <FieldGrid cols={1}>
                <FormField
                  label="Certidão da Matrícula"
                  value={data.certidaoMatricula.certidaoMatricula}
                  onChange={(v) => updateCertidaoMatricula("certidaoMatricula", v)}
                />
                <FormField
                  label="Data de Expedição"
                  type="date"
                  value={data.certidaoMatricula.dataExpedicao}
                  onChange={(v) => updateCertidaoMatricula("dataExpedicao", v)}
                />
                <FormField
                  label="Certidão Válida?"
                  type="select"
                  value={data.certidaoMatricula.certidaoValida}
                  onChange={(v) => updateCertidaoMatricula("certidaoValida", v)}
                  options={simnaoOptions}
                />
              </FieldGrid>
            </SectionCard>
          </div>

          {/* ====== SEÇÃO 7: PROPRIETÁRIOS ====== */}
          <motion.div
            variants={itemVariants}
            className="border-2 border-accent/50 rounded-lg p-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-accent uppercase tracking-wide">
                Proprietários
                <span className="text-sm font-normal ml-2 opacity-70">({data.proprietarios.length})</span>
              </h3>
              <button
                onClick={addProprietario}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-background bg-accent hover:bg-accent/90 rounded-md transition-colors"
              >
                <Plus className="w-4 h-4" />
                Adicionar Proprietário
              </button>
            </div>

            <AnimatePresence mode="popLayout">
              {data.proprietarios.map((prop, index) => (
                <motion.div
                  key={prop.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-card/50 border border-border rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-muted-foreground">
                      Proprietário {index + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setModalProprietario(prop)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-accent hover:text-accent/80 bg-accent/10 hover:bg-accent/20 rounded-md transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Ver Dados Completos
                      </button>
                      <button
                        onClick={() => removeProprietario(prop.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-destructive hover:text-destructive/80 bg-destructive/10 hover:bg-destructive/20 rounded-md transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <FieldGrid cols={4}>
                    <FormField
                      label="Nome"
                      value={prop.nome}
                      onChange={(v) => updateProprietario(prop.id, "nome", v)}
                      className="col-span-2"
                    />
                    <FormField
                      label="Fração Ideal"
                      value={prop.fracaoIdeal}
                      onChange={(v) => updateProprietario(prop.id, "fracaoIdeal", v)}
                      placeholder="Ex: 50%"
                    />
                    <FormField
                      label="Registro de Aquisição"
                      value={prop.registroAquisicao}
                      onChange={(v) => updateProprietario(prop.id, "registroAquisicao", v)}
                      placeholder="Ex: R.4"
                    />
                  </FieldGrid>

                  <div className="mt-3">
                    <FormField
                      label="Data do Registro de Aquisição"
                      type="date"
                      value={prop.dataRegistroAquisicao}
                      onChange={(v) => updateProprietario(prop.id, "dataRegistroAquisicao", v)}
                    />
                  </div>

                  <div className="mt-3">
                    <FormField
                      label="Título de Aquisição"
                      type="select"
                      value={prop.tituloAquisicao}
                      onChange={(v) => updateProprietario(prop.id, "tituloAquisicao", v)}
                      options={tituloAquisicaoOptions}
                    />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {data.proprietarios.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhum proprietário cadastrado.</p>
                <p className="text-sm mt-1">Clique em "Adicionar Proprietário" para começar.</p>
              </div>
            )}
          </motion.div>

          {/* ====== SEÇÃO 8: ÔNUS REGISTRADO(S) ====== */}
          <motion.div
            variants={itemVariants}
            className="border-2 border-orange-500/50 rounded-lg p-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                <h3 className="text-lg font-semibold text-orange-500 uppercase tracking-wide">
                  Ônus Registrado(s)
                  <span className="text-sm font-normal ml-2 opacity-70">({data.onus.length})</span>
                </h3>
              </div>
              <button
                onClick={addOnus}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-md transition-colors"
              >
                <Plus className="w-4 h-4" />
                Adicionar Ônus
              </button>
            </div>

            <AnimatePresence mode="popLayout">
              {data.onus.map((onus, index) => (
                <motion.div
                  key={onus.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-orange-500/5 border border-orange-500/30 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-orange-500">
                      Ônus {index + 1}
                    </span>
                    <button
                      onClick={() => removeOnus(onus.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-destructive hover:text-destructive/80 bg-destructive/10 hover:bg-destructive/20 rounded-md transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remover
                    </button>
                  </div>

                  <FieldGrid cols={4}>
                    <FormField
                      label="Título do Ônus"
                      type="select"
                      value={onus.tituloOnus}
                      onChange={(v) => updateOnus(onus.id, "tituloOnus", v)}
                      options={tipoOnusOptions}
                    />
                    <FormField
                      label="Registro do Ônus"
                      value={onus.registroOnus}
                      onChange={(v) => updateOnus(onus.id, "registroOnus", v)}
                      placeholder="Ex: R.5"
                    />
                    <FormField
                      label="Data do Registro"
                      type="date"
                      value={onus.dataRegistroOnus}
                      onChange={(v) => updateOnus(onus.id, "dataRegistroOnus", v)}
                    />
                    <div className="flex items-end">
                      <button
                        onClick={() => addTitularOnus(onus.id)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-accent hover:text-accent/80 bg-accent/10 hover:bg-accent/20 rounded-md transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Adicionar Titular
                      </button>
                    </div>
                  </FieldGrid>

                  <div className="mt-3">
                    <FormField
                      label="Descrição do Ônus conforme a Matrícula"
                      type="textarea"
                      value={onus.descricaoConformeMatricula}
                      onChange={(v) => updateOnus(onus.id, "descricaoConformeMatricula", v)}
                      placeholder="Descrição completa do ônus..."
                      fullWidth
                    />
                  </div>

                  {/* Titulares do Ônus */}
                  {onus.titulares.length > 0 && (
                    <div className="mt-4 pl-4 border-l-2 border-orange-500/30">
                      <p className="text-sm font-medium text-muted-foreground mb-3">
                        Titulares do Ônus ({onus.titulares.length})
                      </p>
                      {onus.titulares.map((titular, tIndex) => (
                        <div key={titular.id} className="flex items-center gap-4 mb-2">
                          <span className="text-xs text-muted-foreground w-6">{tIndex + 1}.</span>
                          <FormField
                            label=""
                            value={titular.nome}
                            onChange={(v) => updateTitularOnus(onus.id, titular.id, "nome", v)}
                            placeholder="Nome do Titular"
                          />
                          <FormField
                            label=""
                            value={titular.fracaoIdeal}
                            onChange={(v) => updateTitularOnus(onus.id, titular.id, "fracaoIdeal", v)}
                            placeholder="Fração Ideal"
                          />
                          <button
                            onClick={() => setModalTitular(titular)}
                            className="p-2 text-accent hover:text-accent/80 hover:bg-accent/10 rounded-md transition-colors"
                            title="Ver dados completos"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeTitularOnus(onus.id, titular.id)}
                            className="p-2 text-destructive hover:text-destructive/80 hover:bg-destructive/10 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {data.onus.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-green-500 font-medium">✓ Nenhum ônus registrado</p>
                <p className="text-sm mt-1">O imóvel está livre de ônus.</p>
              </div>
            )}
          </motion.div>

          {/* ====== SEÇÃO 9: RESSALVAS NA CERTIFICAÇÃO ====== */}
          <SectionCard title="Ressalvas na Certificação da Matrícula">
            <FieldGrid cols={2}>
              <FormField
                label="Existência de Ressalva"
                type="select"
                value={data.ressalvas.existeRessalva}
                onChange={(v) => updateRessalvas("existeRessalva", v)}
                options={simnaoOptions}
              />
              {data.ressalvas.existeRessalva === "SIM" && (
                <FormField
                  label="Descrição da Ressalva"
                  type="textarea"
                  value={data.ressalvas.descricaoRessalva}
                  onChange={(v) => updateRessalvas("descricaoRessalva", v)}
                  placeholder="Descreva a ressalva..."
                  fullWidth
                  className="col-span-2"
                />
              )}
            </FieldGrid>
          </SectionCard>
        </motion.div>

        <NavigationBar
          onBack={() => navigate("/pessoa-juridica")}
          onNext={() => navigate("/negocio-juridico")}
        />
      </div>

      {/* ====== MODAL: PROPRIETÁRIO ====== */}
      <AnimatePresence>
        {modalProprietario && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setModalProprietario(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border-2 border-accent rounded-lg p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-accent">Dados Completos do Proprietário</h3>
                <button
                  onClick={() => setModalProprietario(null)}
                  className="p-2 hover:bg-muted rounded-md transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Nome</p>
                    <p className="font-medium">{modalProprietario.nome || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Fração Ideal</p>
                    <p className="font-medium">{modalProprietario.fracaoIdeal || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Registro de Aquisição</p>
                    <p className="font-medium">{modalProprietario.registroAquisicao || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Data do Registro</p>
                    <p className="font-medium">{modalProprietario.dataRegistroAquisicao || "-"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Título de Aquisição</p>
                    <p className="font-medium">{modalProprietario.tituloAquisicao || "-"}</p>
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

      {/* ====== MODAL: TITULAR DO ÔNUS ====== */}
      <AnimatePresence>
        {modalTitular && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setModalTitular(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border-2 border-orange-500 rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-orange-500">Dados do Titular do Ônus</h3>
                <button
                  onClick={() => setModalTitular(null)}
                  className="p-2 hover:bg-muted rounded-md transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Nome</p>
                    <p className="font-medium">{modalTitular.nome || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Fração Ideal</p>
                    <p className="font-medium">{modalTitular.fracaoIdeal || "-"}</p>
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
