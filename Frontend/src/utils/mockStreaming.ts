// src/utils/mockStreaming.ts

const mockResponses: Record<string, string> = {
  rg: `# Dados Extraídos do RG

## Informações Pessoais

**Nome Completo:** João da Silva Santos
**Filiação:** Maria da Silva Santos e José Santos
**Data de Nascimento:** 15/03/1985
**Naturalidade:** São Paulo - SP

## Documento

**Número do RG:** 12.345.678-9
**Órgão Emissor:** SSP/SP
**Data de Expedição:** 20/05/2010

## Observações

Documento em bom estado de conservação. Todos os dados foram extraídos com sucesso.`,

  cnh: `# Dados Extraídos da CNH

## Informações do Condutor

**Nome:** Maria Oliveira Souza
**CPF:** 123.456.789-00
**Data de Nascimento:** 22/07/1990

## Documento

**Número de Registro:** 01234567890
**Categoria:** AB
**Primeira Habilitação:** 15/08/2010
**Validade:** 22/07/2030

## Observações

CNH válida. Categoria permite condução de veículos de duas rodas e automóveis.`,

  'matricula-imovel': `# Dados Extraídos da Matrícula

## Identificação do Imóvel

**Número da Matrícula:** 123.456
**Cartório:** 1º Registro de Imóveis de São Paulo
**CNS:** SP-1-123456

## Descrição

**Tipo:** Apartamento
**Área Total:** 85,00 m²
**Área Privativa:** 65,00 m²
**Endereço:** Rua das Flores, 123, Apto 45 - Jardim Paulista - São Paulo/SP

## Proprietários Atuais

1. **João Carlos Silva** - CPF: 111.222.333-44 - 50%
2. **Maria José Silva** - CPF: 555.666.777-88 - 50%

## Ônus e Gravames

Não constam ônus ou gravames registrados.`,

  default: `# Dados Extraídos

## Informações do Documento

Os dados foram extraídos com sucesso do documento fornecido.

## Conteúdo Principal

O documento contém as informações esperadas para este tipo de extração.

## Observações

Extração realizada sem erros. Verifique os dados acima.`,
};

export function getMockResponse(agenteSlug: string): string {
  return mockResponses[agenteSlug] || mockResponses.default;
}

export async function simulateStreaming(
  text: string,
  onChunk: (chunk: string) => void,
  onComplete: () => void,
  delayMs: number = 20
): Promise<void> {
  const words = text.split(' ');

  for (let i = 0; i < words.length; i++) {
    await new Promise(resolve => setTimeout(resolve, delayMs));
    onChunk(words[i] + (i < words.length - 1 ? ' ' : ''));
  }

  onComplete();
}

export function createAbortableStream() {
  let aborted = false;

  return {
    abort: () => { aborted = true; },
    isAborted: () => aborted,
  };
}
