/**
 * Qualification Builder for Minuta Generation
 *
 * Generates formatted qualification text for pessoas naturais and juridicas
 * following Brazilian notary standards.
 */

import type { PessoaNaturalCompleta, PessoaJuridicaCompleta, PessoaCompleta, ImovelCompleto, NegocioJuridicoCompleto } from './data-aggregator.ts';

/**
 * Generates qualification text for a pessoa natural
 */
export function qualifyPessoaNatural(pessoa: PessoaNaturalCompleta): string {
  const parts: string[] = [];

  // Nome
  parts.push(pessoa.nome || '[NOME NAO INFORMADO]');

  // Nacionalidade
  if (pessoa.nacionalidade) {
    parts.push(pessoa.nacionalidade);
  }

  // Estado civil e regime de bens
  if (pessoa.estado_civil) {
    let estadoCivil = pessoa.estado_civil;
    if (pessoa.regime_bens && ['casado', 'casada'].some(ec => estadoCivil.toLowerCase().includes(ec))) {
      estadoCivil += ` pelo regime de ${pessoa.regime_bens}`;
    }
    parts.push(estadoCivil);
  }

  // Profissao
  if (pessoa.profissao) {
    parts.push(pessoa.profissao);
  }

  // RG
  if (pessoa.rg) {
    let rgText = `portador(a) do RG n. ${pessoa.rg}`;
    if (pessoa.orgao_emissor_rg) {
      rgText += ` ${pessoa.orgao_emissor_rg}`;
      if (pessoa.estado_emissor_rg) {
        rgText += `/${pessoa.estado_emissor_rg}`;
      }
    }
    parts.push(rgText);
  }

  // CPF
  if (pessoa.cpf_formatado) {
    parts.push(`inscrito(a) no CPF sob n. ${pessoa.cpf_formatado}`);
  }

  // Endereco
  if (pessoa.endereco_formatado) {
    parts.push(`residente e domiciliado(a) em ${pessoa.endereco_formatado}`);
  }

  return parts.join(', ');
}

/**
 * Generates qualification text for a pessoa juridica
 */
export function qualifyPessoaJuridica(pessoa: PessoaJuridicaCompleta): string {
  const parts: string[] = [];

  // Razao social
  parts.push(pessoa.razao_social || '[RAZAO SOCIAL NAO INFORMADA]');

  // CNPJ
  if (pessoa.cnpj_formatado) {
    parts.push(`inscrita no CNPJ sob n. ${pessoa.cnpj_formatado}`);
  }

  // Inscricao estadual
  if (pessoa.inscricao_estadual) {
    parts.push(`Inscricao Estadual n. ${pessoa.inscricao_estadual}`);
  }

  // Endereco
  if (pessoa.endereco_formatado) {
    parts.push(`com sede em ${pessoa.endereco_formatado}`);
  }

  // Representantes
  if (pessoa.representantes && pessoa.representantes.length > 0) {
    const reps = pessoa.representantes.map(r =>
      `${r.nome}, ${r.cargo}, CPF ${r.cpf_formatado}`
    ).join('; ');
    parts.push(`neste ato representada por ${reps}`);
  }

  return parts.join(', ');
}

/**
 * Generates qualification text for any pessoa (natural or juridica)
 */
export function qualifyPessoa(pessoa: PessoaCompleta): string {
  if (pessoa.tipo === 'natural') {
    return qualifyPessoaNatural(pessoa);
  } else {
    return qualifyPessoaJuridica(pessoa);
  }
}

/**
 * Generates description text for an imovel
 */
export function describeImovel(imovel: ImovelCompleto): string {
  const parts: string[] = [];

  // Tipo e matricula
  const tipoDescricao = imovel.tipo_imovel
    ? `${imovel.tipo_imovel.charAt(0).toUpperCase()}${imovel.tipo_imovel.slice(1)}`
    : 'Imovel';

  parts.push(`${tipoDescricao} objeto da matricula n. ${imovel.matricula_numero || '[NUMERO NAO INFORMADO]'}`);

  // Cartorio
  if (imovel.matricula_cartorio) {
    parts.push(`do ${imovel.matricula_cartorio}`);
  }

  // Descricao conforme matricula
  if (imovel.descricao) {
    parts.push(`assim descrito: ${imovel.descricao}`);
  }

  // Endereco
  if (imovel.endereco_completo) {
    parts.push(`situado em ${imovel.endereco_completo}`);
  }

  // Areas
  const areas: string[] = [];
  if (imovel.area_total) {
    areas.push(`area total de ${imovel.area_total}`);
  }
  if (imovel.area_privativa) {
    areas.push(`area privativa de ${imovel.area_privativa}`);
  }
  if (imovel.area_comum) {
    areas.push(`area comum de ${imovel.area_comum}`);
  }
  if (imovel.area_construida) {
    areas.push(`area construida de ${imovel.area_construida}`);
  }
  if (areas.length > 0) {
    parts.push(`com ${areas.join(', ')}`);
  }

  // Fracao ideal
  if (imovel.fracao_ideal) {
    parts.push(`correspondente a fracao ideal de ${imovel.fracao_ideal}`);
  }

  // Inscricao municipal
  if (imovel.inscricao_municipal) {
    parts.push(`inscrito no cadastro municipal sob n. ${imovel.inscricao_municipal}`);
  }

  // Valor venal
  if (imovel.valor_venal_formatado) {
    parts.push(`com valor venal de ${imovel.valor_venal_formatado}`);
  }

  return parts.join(', ');
}

/**
 * Generates description text for negocio juridico
 */
export function describeNegocio(negocio: NegocioJuridicoCompleto): string {
  const parts: string[] = [];

  // Tipo de negocio
  const tipoFormatado = formatTipoNegocio(negocio.tipo_negocio);
  parts.push(`Esta ${tipoFormatado}`);

  // Valor
  if (negocio.valor_formatado && negocio.valor_extenso) {
    parts.push(`e realizada pelo valor de ${negocio.valor_formatado} (${negocio.valor_extenso})`);
  }

  // Forma de pagamento
  if (negocio.forma_pagamento) {
    parts.push(`a ser pago ${negocio.forma_pagamento}`);
  }

  // Condicoes especiais
  if (negocio.condicoes && Object.keys(negocio.condicoes).length > 0) {
    const conds = Object.entries(negocio.condicoes)
      .filter(([_, v]) => v !== null && v !== undefined && v !== '')
      .map(([k, v]) => `${formatKey(k)}: ${v}`)
      .join('; ');
    if (conds) {
      parts.push(`nas seguintes condicoes: ${conds}`);
    }
  }

  return parts.join(', ');
}

/**
 * Formats tipo de negocio to a readable label
 */
function formatTipoNegocio(tipo: string): string {
  const tipos: Record<string, string> = {
    'compra_venda': 'compra e venda',
    'doacao': 'doacao',
    'permuta': 'permuta',
    'cessao': 'cessao de direitos',
    'usucapiao': 'usucapiao',
    'inventario': 'inventario',
    'divorcio': 'divorcio',
    'uniao_estavel': 'uniao estavel',
    'procuracao': 'procuracao',
    'testamento': 'testamento',
  };
  return tipos[tipo] || tipo.replace(/_/g, ' ');
}

/**
 * Formats a snake_case key to readable format
 */
function formatKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Builds complete qualification section for outorgantes
 */
export function buildOutorgantesSection(outorgantes: PessoaCompleta[]): string {
  if (outorgantes.length === 0) {
    return 'OUTORGANTES: [NAO INFORMADOS]';
  }

  const label = outorgantes.length === 1 ? 'OUTORGANTE VENDEDOR(A)' : 'OUTORGANTES VENDEDORES';
  const qualifications = outorgantes.map((p, i) => {
    const prefix = outorgantes.length > 1 ? `${i + 1}) ` : '';
    return `${prefix}${qualifyPessoa(p)}`;
  }).join('; ');

  return `${label}: ${qualifications}`;
}

/**
 * Builds complete qualification section for outorgados
 */
export function buildOutorgadosSection(outorgados: PessoaCompleta[]): string {
  if (outorgados.length === 0) {
    return 'OUTORGADOS: [NAO INFORMADOS]';
  }

  const label = outorgados.length === 1 ? 'OUTORGADO COMPRADOR(A)' : 'OUTORGADOS COMPRADORES';
  const qualifications = outorgados.map((p, i) => {
    const prefix = outorgados.length > 1 ? `${i + 1}) ` : '';
    return `${prefix}${qualifyPessoa(p)}`;
  }).join('; ');

  return `${label}: ${qualifications}`;
}

/**
 * Builds complete imoveis section
 */
export function buildImoveisSection(imoveis: ImovelCompleto[]): string {
  if (imoveis.length === 0) {
    return 'IMOVEL: [NAO INFORMADO]';
  }

  const label = imoveis.length === 1 ? 'IMOVEL' : 'IMOVEIS';
  const descriptions = imoveis.map((im, i) => {
    const prefix = imoveis.length > 1 ? `${i + 1}) ` : '';
    return `${prefix}${describeImovel(im)}`;
  }).join('; ');

  return `${label}: ${descriptions}`;
}

/**
 * Builds complete negocio section
 */
export function buildNegocioSection(negocio: NegocioJuridicoCompleto | null): string {
  if (!negocio) {
    return 'NEGOCIO: [NAO INFORMADO]';
  }

  return `NEGOCIO: ${describeNegocio(negocio)}`;
}
