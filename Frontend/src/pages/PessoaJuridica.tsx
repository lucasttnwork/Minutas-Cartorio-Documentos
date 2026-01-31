import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PageHeader, SectionCard, FieldGrid, NavigationBar } from "@/components/layout";
import { FormField, AddressFields, ContactFields, CertidaoSection } from "@/components/forms";

// Tipos para os dados aninhados
interface EnderecoData {
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

interface ContatoData {
  email: string;
  telefone: string;
}

interface DadosPessoaisRepresentante {
  nome: string;
  cpf: string;
  rg: string;
  orgaoEmissorRg: string;
  estadoEmissorRg: string;
  dataEmissaoRg: string;
  cnh: string;
  orgaoEmissorCnh: string;
  dataNascimento: string;
  estadoCivil: string;
  profissao: string;
  nacionalidade: string;
}

interface InstrumentoAdministracao {
  tipoRepresentacao: string;
  clausulaIndicaAdministrador: string;
  dataAtaIndicaAdministrador: string;
  numeroRegistroAta: string;
  clausulaPoderesAdministrador: string;
}

interface InstrumentoProcuracao {
  tabelionatoProcuracao: string;
  dataProcuracao: string;
  livroProcuracao: string;
  paginasProcuracao: string;
  dataExpedicaoCertidaoProcuracao: string;
}

interface RepresentanteData {
  dadosPessoais: DadosPessoaisRepresentante;
  domicilio: EnderecoData;
  contato: ContatoData;
}

interface CndtData {
  numero: string;
  dataExpedicao: string;
  horaExpedicao: string;
}

interface CertidaoUniaoData {
  tipo: string;
  dataEmissao: string;
  horaEmissao: string;
  validade: string;
  codigoControle: string;
}

// Estado inicial completo - 76 campos
const initialState = {
  // === SEÇÃO 1: QUALIFICAÇÃO (3 campos) ===
  denominacao: "EMPRESA EXEMPLO LTDA",
  cnpj: "00.000.000/0001-00",
  nire: "35.000.000.000-0",

  // === SEÇÃO 2: SEDE (7 campos) ===
  sede: {
    logradouro: "AVENIDA PAULISTA",
    numero: "1000",
    complemento: "SALA 501",
    bairro: "BELA VISTA",
    cidade: "SÃO PAULO",
    estado: "SP",
    cep: "01310-100",
  } as EnderecoData,

  // === SEÇÃO 3: REGISTRO VIGENTE (4 campos) ===
  instrumentoConstitutivo: "CONTRATO SOCIAL",
  juntaComercial: "JUCESP",
  numeroRegistroContratoSocial: "123456789",
  dataSessaoRegistroContratoSocial: "2020-05-15",

  // === SEÇÃO 4: CERTIDÃO (2 campos) ===
  dataExpedicaoFichaCadastral: "2024-01-10",
  dataExpedicaoCertidaoRegistro: "2024-01-10",

  // === SEÇÃO 5: REPRESENTAÇÃO POR ADMINISTRAÇÃO (26 campos) ===
  administrador: {
    dadosPessoais: {
      nome: "JOÃO DA SILVA",
      cpf: "000.000.000-00",
      rg: "00.000.000",
      orgaoEmissorRg: "SSP",
      estadoEmissorRg: "SP",
      dataEmissaoRg: "2010-01-15",
      cnh: "000000000000",
      orgaoEmissorCnh: "DETRAN-SP",
      dataNascimento: "1980-03-20",
      estadoCivil: "CASADO",
      profissao: "EMPRESÁRIO",
      nacionalidade: "BRASILEIRO",
    },
    domicilio: {
      logradouro: "RUA DAS FLORES",
      numero: "500",
      complemento: "APTO 201",
      bairro: "JARDIM PAULISTA",
      cidade: "SÃO PAULO",
      estado: "SP",
      cep: "01400-000",
    },
    contato: {
      email: "joao.silva@empresa.com.br",
      telefone: "+55 (11) 99999-1111",
    },
  } as RepresentanteData,

  instrumentoAdministracao: {
    tipoRepresentacao: "ADMINISTRADOR_CONTRATO_SOCIAL",
    clausulaIndicaAdministrador: "CLÁUSULA 5ª",
    dataAtaIndicaAdministrador: "",
    numeroRegistroAta: "",
    clausulaPoderesAdministrador: "CLÁUSULA 6ª",
  } as InstrumentoAdministracao,

  // === SEÇÃO 6: REPRESENTAÇÃO POR PROCURAÇÃO (26 campos) ===
  procurador: {
    dadosPessoais: {
      nome: "",
      cpf: "",
      rg: "",
      orgaoEmissorRg: "",
      estadoEmissorRg: "",
      dataEmissaoRg: "",
      cnh: "",
      orgaoEmissorCnh: "",
      dataNascimento: "",
      estadoCivil: "",
      profissao: "",
      nacionalidade: "",
    },
    domicilio: {
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
      cep: "",
    },
    contato: {
      email: "",
      telefone: "",
    },
  } as RepresentanteData,

  instrumentoProcuracao: {
    tabelionatoProcuracao: "",
    dataProcuracao: "",
    livroProcuracao: "",
    paginasProcuracao: "",
    dataExpedicaoCertidaoProcuracao: "",
  } as InstrumentoProcuracao,

  // === SEÇÃO 7: CNDT (3 campos) ===
  cndt: {
    numero: "12345678901234567890",
    dataExpedicao: "2024-01-15",
    horaExpedicao: "14:30",
  } as CndtData,

  // === SEÇÃO 8: CERTIDÃO DA UNIÃO (5 campos) ===
  certidaoUniao: {
    tipo: "POSITIVA_EFEITOS_NEGATIVA",
    dataEmissao: "2024-01-10",
    horaEmissao: "10:00",
    validade: "2024-07-10",
    codigoControle: "ABC123456789",
  } as CertidaoUniaoData,
};

// Options para selects
const estadoCivilOptions = [
  { value: "SOLTEIRO", label: "Solteiro(a)" },
  { value: "CASADO", label: "Casado(a)" },
  { value: "DIVORCIADO", label: "Divorciado(a)" },
  { value: "VIUVO", label: "Viúvo(a)" },
  { value: "SEPARADO", label: "Separado(a)" },
];

const tipoRepresentacaoOptions = [
  { value: "ADMINISTRADOR_CONTRATO_SOCIAL", label: "Administrador indicado no Contrato Social" },
  { value: "ADMINISTRADOR_ATA", label: "Administrador indicado em Ata" },
];

const instrumentoConstitutivoOptions = [
  { value: "CONTRATO_SOCIAL", label: "Contrato Social" },
  { value: "ESTATUTO_SOCIAL", label: "Estatuto Social" },
  { value: "REQUERIMENTO_EMPRESARIO", label: "Requerimento de Empresário" },
];

const certidaoUniaoTipoOptions = [
  { value: "NEGATIVA", label: "Negativa" },
  { value: "POSITIVA", label: "Positiva" },
  { value: "POSITIVA_EFEITOS_NEGATIVA", label: "Positiva com Efeitos de Negativa" },
];

export default function PessoaJuridica() {
  const navigate = useNavigate();
  const [data, setData] = useState(initialState);

  // Helpers para atualização de campos
  const updateField = (field: string, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const updateSede = (field: keyof EnderecoData, value: string) => {
    setData((prev) => ({
      ...prev,
      sede: { ...prev.sede, [field]: value },
    }));
  };

  // Administrador updates
  const updateAdministradorDadosPessoais = (field: keyof DadosPessoaisRepresentante, value: string) => {
    setData((prev) => ({
      ...prev,
      administrador: {
        ...prev.administrador,
        dadosPessoais: { ...prev.administrador.dadosPessoais, [field]: value },
      },
    }));
  };

  const updateAdministradorDomicilio = (field: keyof EnderecoData, value: string) => {
    setData((prev) => ({
      ...prev,
      administrador: {
        ...prev.administrador,
        domicilio: { ...prev.administrador.domicilio, [field]: value },
      },
    }));
  };

  const updateAdministradorContato = (field: keyof ContatoData, value: string) => {
    setData((prev) => ({
      ...prev,
      administrador: {
        ...prev.administrador,
        contato: { ...prev.administrador.contato, [field]: value },
      },
    }));
  };

  const updateInstrumentoAdministracao = (field: keyof InstrumentoAdministracao, value: string) => {
    setData((prev) => ({
      ...prev,
      instrumentoAdministracao: { ...prev.instrumentoAdministracao, [field]: value },
    }));
  };

  // Procurador updates
  const updateProcuradorDadosPessoais = (field: keyof DadosPessoaisRepresentante, value: string) => {
    setData((prev) => ({
      ...prev,
      procurador: {
        ...prev.procurador,
        dadosPessoais: { ...prev.procurador.dadosPessoais, [field]: value },
      },
    }));
  };

  const updateProcuradorDomicilio = (field: keyof EnderecoData, value: string) => {
    setData((prev) => ({
      ...prev,
      procurador: {
        ...prev.procurador,
        domicilio: { ...prev.procurador.domicilio, [field]: value },
      },
    }));
  };

  const updateProcuradorContato = (field: keyof ContatoData, value: string) => {
    setData((prev) => ({
      ...prev,
      procurador: {
        ...prev.procurador,
        contato: { ...prev.procurador.contato, [field]: value },
      },
    }));
  };

  const updateInstrumentoProcuracao = (field: keyof InstrumentoProcuracao, value: string) => {
    setData((prev) => ({
      ...prev,
      instrumentoProcuracao: { ...prev.instrumentoProcuracao, [field]: value },
    }));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="CONFERÊNCIA E COMPLEMENTAÇÃO"
          subtitle="(POLO OUTORGANTE)"
          instruction="Confira todos os dados e preencha os campos faltantes."
        />

        <motion.div
          className="text-lg font-semibold text-foreground mb-6 uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Pessoa Jurídica
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* ====== LINHA 1: Qualificação + Sede ====== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SEÇÃO 1: QUALIFICAÇÃO (3 campos) */}
            <SectionCard title="Qualificação da Empresa">
              <FieldGrid cols={1}>
                <FormField
                  label="Denominação / Razão Social"
                  value={data.denominacao}
                  onChange={(v) => updateField("denominacao", v)}
                  fullWidth
                />
                <FormField
                  label="CNPJ"
                  type="cnpj"
                  value={data.cnpj}
                  onChange={(v) => updateField("cnpj", v)}
                />
                <FormField
                  label="NIRE"
                  value={data.nire}
                  onChange={(v) => updateField("nire", v)}
                  placeholder="00.000.000.000-0"
                />
              </FieldGrid>
            </SectionCard>

            {/* SEÇÃO 2: SEDE (7 campos) */}
            <SectionCard title="Sede">
              <AddressFields
                values={data.sede}
                onChange={updateSede}
              />
            </SectionCard>
          </div>

          {/* ====== LINHA 2: Registro Vigente + Certidão ====== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SEÇÃO 3: REGISTRO VIGENTE (4 campos) */}
            <SectionCard title="Registro Vigente">
              <FieldGrid cols={2}>
                <FormField
                  label="Instrumento Constitutivo"
                  type="select"
                  value={data.instrumentoConstitutivo}
                  onChange={(v) => updateField("instrumentoConstitutivo", v)}
                  options={instrumentoConstitutivoOptions}
                  fullWidth
                  className="col-span-2"
                />
                <FormField
                  label="Junta Comercial"
                  value={data.juntaComercial}
                  onChange={(v) => updateField("juntaComercial", v)}
                  placeholder="Ex: JUCESP"
                />
                <FormField
                  label="Nº Registro do Contrato Social"
                  value={data.numeroRegistroContratoSocial}
                  onChange={(v) => updateField("numeroRegistroContratoSocial", v)}
                />
                <FormField
                  label="Data da Sessão do Registro"
                  type="date"
                  value={data.dataSessaoRegistroContratoSocial}
                  onChange={(v) => updateField("dataSessaoRegistroContratoSocial", v)}
                  className="col-span-2"
                />
              </FieldGrid>
            </SectionCard>

            {/* SEÇÃO 4: CERTIDÃO (2 campos) */}
            <SectionCard title="Certidões de Registro">
              <FieldGrid cols={1}>
                <FormField
                  label="Data de Expedição da Ficha Cadastral"
                  type="date"
                  value={data.dataExpedicaoFichaCadastral}
                  onChange={(v) => updateField("dataExpedicaoFichaCadastral", v)}
                />
                <FormField
                  label="Data de Expedição da Certidão de Registro"
                  type="date"
                  value={data.dataExpedicaoCertidaoRegistro}
                  onChange={(v) => updateField("dataExpedicaoCertidaoRegistro", v)}
                />
              </FieldGrid>
            </SectionCard>
          </div>

          {/* ====== SEÇÃO 5: REPRESENTAÇÃO POR ADMINISTRAÇÃO (26 campos) ====== */}
          <motion.div
            className="border-2 border-accent/50 rounded-lg p-4 space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-lg font-semibold text-accent uppercase tracking-wide">
              Representação por Administração
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Dados Pessoais do Administrador (12 campos) */}
              <SectionCard title="Dados Pessoais do Administrador" variant="nested">
                <FieldGrid cols={2}>
                  <FormField
                    label="Nome"
                    value={data.administrador.dadosPessoais.nome}
                    onChange={(v) => updateAdministradorDadosPessoais("nome", v)}
                    fullWidth
                    className="col-span-2"
                  />
                  <FormField
                    label="CPF"
                    type="cpf"
                    value={data.administrador.dadosPessoais.cpf}
                    onChange={(v) => updateAdministradorDadosPessoais("cpf", v)}
                  />
                  <FormField
                    label="RG"
                    type="rg"
                    value={data.administrador.dadosPessoais.rg}
                    onChange={(v) => updateAdministradorDadosPessoais("rg", v)}
                  />
                  <FormField
                    label="Órgão Emissor do RG"
                    value={data.administrador.dadosPessoais.orgaoEmissorRg}
                    onChange={(v) => updateAdministradorDadosPessoais("orgaoEmissorRg", v)}
                  />
                  <FormField
                    label="Estado Emissor do RG"
                    value={data.administrador.dadosPessoais.estadoEmissorRg}
                    onChange={(v) => updateAdministradorDadosPessoais("estadoEmissorRg", v)}
                  />
                  <FormField
                    label="Data de Emissão do RG"
                    type="date"
                    value={data.administrador.dadosPessoais.dataEmissaoRg}
                    onChange={(v) => updateAdministradorDadosPessoais("dataEmissaoRg", v)}
                  />
                  <FormField
                    label="CNH"
                    value={data.administrador.dadosPessoais.cnh}
                    onChange={(v) => updateAdministradorDadosPessoais("cnh", v)}
                  />
                  <FormField
                    label="Órgão Emissor da CNH"
                    value={data.administrador.dadosPessoais.orgaoEmissorCnh}
                    onChange={(v) => updateAdministradorDadosPessoais("orgaoEmissorCnh", v)}
                  />
                  <FormField
                    label="Data de Nascimento"
                    type="date"
                    value={data.administrador.dadosPessoais.dataNascimento}
                    onChange={(v) => updateAdministradorDadosPessoais("dataNascimento", v)}
                  />
                  <FormField
                    label="Estado Civil"
                    type="select"
                    value={data.administrador.dadosPessoais.estadoCivil}
                    onChange={(v) => updateAdministradorDadosPessoais("estadoCivil", v)}
                    options={estadoCivilOptions}
                  />
                  <FormField
                    label="Profissão"
                    value={data.administrador.dadosPessoais.profissao}
                    onChange={(v) => updateAdministradorDadosPessoais("profissao", v)}
                  />
                  <FormField
                    label="Nacionalidade"
                    value={data.administrador.dadosPessoais.nacionalidade}
                    onChange={(v) => updateAdministradorDadosPessoais("nacionalidade", v)}
                  />
                </FieldGrid>
              </SectionCard>

              {/* Domicílio e Contato do Administrador (9 campos) */}
              <div className="space-y-4">
                <SectionCard title="Domicílio do Administrador" variant="nested">
                  <AddressFields
                    values={data.administrador.domicilio}
                    onChange={updateAdministradorDomicilio}
                  />
                </SectionCard>

                <SectionCard title="Contato do Administrador" variant="nested">
                  <ContactFields
                    values={data.administrador.contato}
                    onChange={updateAdministradorContato}
                  />
                </SectionCard>
              </div>
            </div>

            {/* Instrumento da Representação (5 campos) */}
            <SectionCard title="Instrumento da Representação" variant="nested">
              <FieldGrid cols={2}>
                <FormField
                  label="Tipo de Representação"
                  type="select"
                  value={data.instrumentoAdministracao.tipoRepresentacao}
                  onChange={(v) => updateInstrumentoAdministracao("tipoRepresentacao", v)}
                  options={tipoRepresentacaoOptions}
                  fullWidth
                  className="col-span-2"
                />
                <FormField
                  label="Cláusula que Indica o Administrador"
                  value={data.instrumentoAdministracao.clausulaIndicaAdministrador}
                  onChange={(v) => updateInstrumentoAdministracao("clausulaIndicaAdministrador", v)}
                  placeholder="Ex: Cláusula 5ª"
                />
                <FormField
                  label="Data da Ata (se aplicável)"
                  type="date"
                  value={data.instrumentoAdministracao.dataAtaIndicaAdministrador}
                  onChange={(v) => updateInstrumentoAdministracao("dataAtaIndicaAdministrador", v)}
                />
                <FormField
                  label="Nº Registro da Ata"
                  value={data.instrumentoAdministracao.numeroRegistroAta}
                  onChange={(v) => updateInstrumentoAdministracao("numeroRegistroAta", v)}
                />
                <FormField
                  label="Cláusula dos Poderes do Administrador"
                  value={data.instrumentoAdministracao.clausulaPoderesAdministrador}
                  onChange={(v) => updateInstrumentoAdministracao("clausulaPoderesAdministrador", v)}
                  placeholder="Ex: Cláusula 6ª"
                />
              </FieldGrid>
            </SectionCard>
          </motion.div>

          {/* ====== SEÇÃO 6: REPRESENTAÇÃO POR PROCURAÇÃO (26 campos) ====== */}
          <motion.div
            className="border-2 border-muted/50 rounded-lg p-4 space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-lg font-semibold text-muted-foreground uppercase tracking-wide">
              Representação por Procuração
              <span className="text-sm font-normal ml-2 opacity-70">(se aplicável)</span>
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Dados Pessoais do Procurador (12 campos) */}
              <SectionCard title="Dados Pessoais do Procurador" variant="nested">
                <FieldGrid cols={2}>
                  <FormField
                    label="Nome"
                    value={data.procurador.dadosPessoais.nome}
                    onChange={(v) => updateProcuradorDadosPessoais("nome", v)}
                    fullWidth
                    className="col-span-2"
                  />
                  <FormField
                    label="CPF"
                    type="cpf"
                    value={data.procurador.dadosPessoais.cpf}
                    onChange={(v) => updateProcuradorDadosPessoais("cpf", v)}
                  />
                  <FormField
                    label="RG"
                    type="rg"
                    value={data.procurador.dadosPessoais.rg}
                    onChange={(v) => updateProcuradorDadosPessoais("rg", v)}
                  />
                  <FormField
                    label="Órgão Emissor do RG"
                    value={data.procurador.dadosPessoais.orgaoEmissorRg}
                    onChange={(v) => updateProcuradorDadosPessoais("orgaoEmissorRg", v)}
                  />
                  <FormField
                    label="Estado Emissor do RG"
                    value={data.procurador.dadosPessoais.estadoEmissorRg}
                    onChange={(v) => updateProcuradorDadosPessoais("estadoEmissorRg", v)}
                  />
                  <FormField
                    label="Data de Emissão do RG"
                    type="date"
                    value={data.procurador.dadosPessoais.dataEmissaoRg}
                    onChange={(v) => updateProcuradorDadosPessoais("dataEmissaoRg", v)}
                  />
                  <FormField
                    label="CNH"
                    value={data.procurador.dadosPessoais.cnh}
                    onChange={(v) => updateProcuradorDadosPessoais("cnh", v)}
                  />
                  <FormField
                    label="Órgão Emissor da CNH"
                    value={data.procurador.dadosPessoais.orgaoEmissorCnh}
                    onChange={(v) => updateProcuradorDadosPessoais("orgaoEmissorCnh", v)}
                  />
                  <FormField
                    label="Data de Nascimento"
                    type="date"
                    value={data.procurador.dadosPessoais.dataNascimento}
                    onChange={(v) => updateProcuradorDadosPessoais("dataNascimento", v)}
                  />
                  <FormField
                    label="Estado Civil"
                    type="select"
                    value={data.procurador.dadosPessoais.estadoCivil}
                    onChange={(v) => updateProcuradorDadosPessoais("estadoCivil", v)}
                    options={estadoCivilOptions}
                  />
                  <FormField
                    label="Profissão"
                    value={data.procurador.dadosPessoais.profissao}
                    onChange={(v) => updateProcuradorDadosPessoais("profissao", v)}
                  />
                  <FormField
                    label="Nacionalidade"
                    value={data.procurador.dadosPessoais.nacionalidade}
                    onChange={(v) => updateProcuradorDadosPessoais("nacionalidade", v)}
                  />
                </FieldGrid>
              </SectionCard>

              {/* Domicílio e Contato do Procurador (9 campos) */}
              <div className="space-y-4">
                <SectionCard title="Domicílio do Procurador" variant="nested">
                  <AddressFields
                    values={data.procurador.domicilio}
                    onChange={updateProcuradorDomicilio}
                  />
                </SectionCard>

                <SectionCard title="Contato do Procurador" variant="nested">
                  <ContactFields
                    values={data.procurador.contato}
                    onChange={updateProcuradorContato}
                  />
                </SectionCard>
              </div>
            </div>

            {/* Instrumento da Procuração (5 campos) */}
            <SectionCard title="Instrumento da Procuração" variant="nested">
              <FieldGrid cols={2}>
                <FormField
                  label="Tabelionato da Procuração Pública"
                  value={data.instrumentoProcuracao.tabelionatoProcuracao}
                  onChange={(v) => updateInstrumentoProcuracao("tabelionatoProcuracao", v)}
                  placeholder="Ex: 2º Tabelião de Notas"
                  fullWidth
                  className="col-span-2"
                />
                <FormField
                  label="Data da Procuração"
                  type="date"
                  value={data.instrumentoProcuracao.dataProcuracao}
                  onChange={(v) => updateInstrumentoProcuracao("dataProcuracao", v)}
                />
                <FormField
                  label="Livro da Procuração"
                  value={data.instrumentoProcuracao.livroProcuracao}
                  onChange={(v) => updateInstrumentoProcuracao("livroProcuracao", v)}
                  placeholder="Ex: Livro 500"
                />
                <FormField
                  label="Páginas da Procuração"
                  value={data.instrumentoProcuracao.paginasProcuracao}
                  onChange={(v) => updateInstrumentoProcuracao("paginasProcuracao", v)}
                  placeholder="Ex: Folhas 100-102"
                />
                <FormField
                  label="Data de Expedição da Certidão"
                  type="date"
                  value={data.instrumentoProcuracao.dataExpedicaoCertidaoProcuracao}
                  onChange={(v) => updateInstrumentoProcuracao("dataExpedicaoCertidaoProcuracao", v)}
                />
              </FieldGrid>
            </SectionCard>
          </motion.div>

          {/* ====== LINHA FINAL: CNDT + Certidão da União (8 campos) ====== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SEÇÃO 7: CNDT (3 campos) */}
            <CertidaoSection
              title="CNDT"
              fields={[
                { key: "numero", label: "Número da CNDT", value: data.cndt.numero },
                { key: "dataExpedicao", label: "Data de Expedição", value: data.cndt.dataExpedicao, type: "date" },
                { key: "horaExpedicao", label: "Hora de Expedição", value: data.cndt.horaExpedicao },
              ]}
              onUpdate={() => console.log("Atualizar CNDT")}
              onChange={(key, value) => setData((prev) => ({
                ...prev,
                cndt: { ...prev.cndt, [key]: value },
              }))}
            />

            {/* SEÇÃO 8: CERTIDÃO DA UNIÃO (5 campos) */}
            <CertidaoSection
              title="Certidão da União"
              fields={[
                { 
                  key: "tipo", 
                  label: "Tipo de Certidão", 
                  value: data.certidaoUniao.tipo,
                  type: "select",
                  options: certidaoUniaoTipoOptions,
                },
                { key: "dataEmissao", label: "Data de Emissão", value: data.certidaoUniao.dataEmissao, type: "date" },
                { key: "horaEmissao", label: "Hora de Emissão", value: data.certidaoUniao.horaEmissao },
                { key: "validade", label: "Validade", value: data.certidaoUniao.validade, type: "date" },
                { key: "codigoControle", label: "Código de Controle", value: data.certidaoUniao.codigoControle },
              ]}
              onUpdate={() => console.log("Atualizar Certidão da União")}
              onChange={(key, value) => setData((prev) => ({
                ...prev,
                certidaoUniao: { ...prev.certidaoUniao, [key]: value },
              }))}
            />
          </div>
        </motion.div>

        <NavigationBar
          onBack={() => navigate("/pessoa-natural")}
          onNext={() => navigate("/imovel")}
        />
      </div>
    </main>
  );
}
