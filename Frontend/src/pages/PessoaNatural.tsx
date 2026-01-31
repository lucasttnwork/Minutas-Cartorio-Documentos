import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PageHeader, SectionCard, FieldGrid, NavigationBar } from "@/components/layout";
import { FormField, AddressFields, ContactFields, CertidaoSection } from "@/components/forms";

// Estado inicial dos dados
const initialState = {
  // Dados Individuais
  nome: "FULANO DE TAL",
  cpf: "000.000.000-00",
  rg: "00.000.000",
  orgaoEmissorRg: "SSP",
  estadoEmissorRg: "SP",
  dataEmissaoRg: "2010-01-15",
  nacionalidade: "BRASILEIRO",
  profissao: "ESTUDANTE",
  dataNascimento: "1995-05-05",
  dataObito: "",
  cnh: "000000000000",
  orgaoEmissorCnh: "DETRAN-SP",
  
  // Dados Familiares
  estadoCivil: "CASADO",
  regimeBens: "COMUNHAO_PARCIAL",
  dataCasamento: "2020-06-15",
  dataSeparacao: "",
  dataDivorcio: "",
  dataFalecimentoConjuge: "",
  uniaoEstavel: "NAO",
  regimeBensUniao: "",
  dataUniaoEstavel: "",
  dataExtincaoUniao: "",
  
  // Domicílio
  domicilio: {
    logradouro: "RUA EXEMPLO",
    numero: "123",
    complemento: "APTO 101",
    bairro: "CENTRO",
    cidade: "SÃO PAULO",
    estado: "SP",
    cep: "01234-567",
  },
  
  // Contatos
  contato: {
    email: "fulano@email.com",
    telefone: "+55 (11) 99999-9999",
  },
  
  // CNDT
  cndt: {
    numero: "12345678",
    dataExpedicao: "2024-01-15",
    horaExpedicao: "14:30",
  },
  
  // Certidão da União
  certidaoUniao: {
    tipo: "POSITIVA_EFEITOS_NEGATIVA",
    dataEmissao: "2024-01-10",
    horaEmissao: "10:00",
    validade: "2024-07-10",
    codigoControle: "ABC123456",
  },
};

const estadoCivilOptions = [
  { value: "SOLTEIRO", label: "Solteiro(a)" },
  { value: "CASADO", label: "Casado(a)" },
  { value: "DIVORCIADO", label: "Divorciado(a)" },
  { value: "VIUVO", label: "Viúvo(a)" },
  { value: "SEPARADO", label: "Separado(a)" },
];

const regimeBensOptions = [
  { value: "COMUNHAO_PARCIAL", label: "Comunhão Parcial de Bens" },
  { value: "COMUNHAO_UNIVERSAL", label: "Comunhão Universal de Bens" },
  { value: "SEPARACAO_TOTAL", label: "Separação Total de Bens" },
  { value: "PARTICIPACAO_FINAL", label: "Participação Final nos Aquestos" },
];

const simnaoOptions = [
  { value: "SIM", label: "Sim" },
  { value: "NAO", label: "Não" },
];

// Opção para uso futuro no select de certidão
// const certidaoUniaoOptions = [
//   { value: "NEGATIVA", label: "Negativa" },
//   { value: "POSITIVA", label: "Positiva" },
//   { value: "POSITIVA_EFEITOS_NEGATIVA", label: "Positiva com Efeitos de Negativa" },
// ];

export default function PessoaNatural() {
  const navigate = useNavigate();
  const [data, setData] = useState(initialState);

  const updateField = (field: string, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const updateDomicilio = (field: string, value: string) => {
    setData((prev) => ({
      ...prev,
      domicilio: { ...prev.domicilio, [field]: value },
    }));
  };

  const updateContato = (field: string, value: string) => {
    setData((prev) => ({
      ...prev,
      contato: { ...prev.contato, [field]: value },
    }));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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
          Pessoa Natural
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Dados Individuais */}
          <SectionCard title="Dados Individuais">
            <FieldGrid cols={2}>
              <FormField
                label="Nome"
                value={data.nome}
                onChange={(v) => updateField("nome", v)}
                fullWidth
                className="col-span-2"
              />
              <FormField
                label="CPF"
                type="cpf"
                value={data.cpf}
                onChange={(v) => updateField("cpf", v)}
              />
              <FormField
                label="RG"
                type="rg"
                value={data.rg}
                onChange={(v) => updateField("rg", v)}
              />
              <FormField
                label="Órgão Emissor do RG"
                value={data.orgaoEmissorRg}
                onChange={(v) => updateField("orgaoEmissorRg", v)}
              />
              <FormField
                label="Estado Emissor do RG"
                value={data.estadoEmissorRg}
                onChange={(v) => updateField("estadoEmissorRg", v)}
              />
              <FormField
                label="Data de Emissão do RG"
                type="date"
                value={data.dataEmissaoRg}
                onChange={(v) => updateField("dataEmissaoRg", v)}
              />
              <FormField
                label="Nacionalidade"
                value={data.nacionalidade}
                onChange={(v) => updateField("nacionalidade", v)}
              />
              <FormField
                label="Profissão"
                value={data.profissao}
                onChange={(v) => updateField("profissao", v)}
              />
              <FormField
                label="Data de Nascimento"
                type="date"
                value={data.dataNascimento}
                onChange={(v) => updateField("dataNascimento", v)}
              />
              <FormField
                label="Data do Óbito"
                type="date"
                value={data.dataObito}
                onChange={(v) => updateField("dataObito", v)}
              />
              <FormField
                label="CNH"
                value={data.cnh}
                onChange={(v) => updateField("cnh", v)}
              />
              <FormField
                label="Órgão Emissor da CNH"
                value={data.orgaoEmissorCnh}
                onChange={(v) => updateField("orgaoEmissorCnh", v)}
              />
            </FieldGrid>
          </SectionCard>

          {/* Dados Familiares */}
          <SectionCard title="Dados Familiares">
            <FieldGrid cols={2}>
              <FormField
                label="Estado Civil"
                type="select"
                value={data.estadoCivil}
                onChange={(v) => updateField("estadoCivil", v)}
                options={estadoCivilOptions}
              />
              <FormField
                label="Regime de Bens"
                type="select"
                value={data.regimeBens}
                onChange={(v) => updateField("regimeBens", v)}
                options={regimeBensOptions}
              />
              <FormField
                label="Data do Casamento"
                type="date"
                value={data.dataCasamento}
                onChange={(v) => updateField("dataCasamento", v)}
              />
              <FormField
                label="Data da Separação"
                type="date"
                value={data.dataSeparacao}
                onChange={(v) => updateField("dataSeparacao", v)}
              />
              <FormField
                label="Data do Divórcio"
                type="date"
                value={data.dataDivorcio}
                onChange={(v) => updateField("dataDivorcio", v)}
              />
              <FormField
                label="Data Falecimento Cônjuge"
                type="date"
                value={data.dataFalecimentoConjuge}
                onChange={(v) => updateField("dataFalecimentoConjuge", v)}
              />
              <FormField
                label="União Estável"
                type="select"
                value={data.uniaoEstavel}
                onChange={(v) => updateField("uniaoEstavel", v)}
                options={simnaoOptions}
              />
              <FormField
                label="Regime de Bens (União)"
                type="select"
                value={data.regimeBensUniao}
                onChange={(v) => updateField("regimeBensUniao", v)}
                options={regimeBensOptions}
              />
              <FormField
                label="Data da União Estável"
                type="date"
                value={data.dataUniaoEstavel}
                onChange={(v) => updateField("dataUniaoEstavel", v)}
              />
              <FormField
                label="Data Extinção União"
                type="date"
                value={data.dataExtincaoUniao}
                onChange={(v) => updateField("dataExtincaoUniao", v)}
              />
            </FieldGrid>
          </SectionCard>

          {/* Domicílio */}
          <SectionCard title="Domicílio">
            <AddressFields
              values={data.domicilio}
              onChange={updateDomicilio}
            />
          </SectionCard>

          {/* Contatos */}
          <SectionCard title="Contatos">
            <ContactFields
              values={data.contato}
              onChange={updateContato}
            />
          </SectionCard>
        </motion.div>

        {/* Certidões - Full Width */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
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

          <CertidaoSection
            title="Certidão da União"
            fields={[
              { key: "tipo", label: "Certidão da União", value: data.certidaoUniao.tipo },
              { key: "dataEmissao", label: "Data de Emissão", value: data.certidaoUniao.dataEmissao, type: "date" },
              { key: "horaEmissao", label: "Hora de Emissão", value: data.certidaoUniao.horaEmissao },
              { key: "validade", label: "Validade", value: data.certidaoUniao.validade, type: "date" },
              { key: "codigoControle", label: "Código de Controle", value: data.certidaoUniao.codigoControle },
            ]}
            onUpdate={() => console.log("Atualizar Certidão")}
            onChange={(key, value) => setData((prev) => ({
              ...prev,
              certidaoUniao: { ...prev.certidaoUniao, [key]: value },
            }))}
          />
        </div>

        <NavigationBar
          onBack={() => navigate("/")}
          onNext={() => navigate("/pessoa-juridica")}
        />
      </div>
    </main>
  );
}
