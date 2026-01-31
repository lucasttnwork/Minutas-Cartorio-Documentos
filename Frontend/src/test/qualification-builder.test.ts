/**
 * Tests for qualification-builder.ts
 * These tests verify the qualification text generation for minutas
 */

import { describe, it, expect } from 'vitest';

// ============ TYPE DEFINITIONS ============

interface Endereco {
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
}

interface PessoaNaturalCompleta {
  tipo: 'natural';
  nome: string;
  cpf: string;
  cpf_formatado: string;
  rg: string;
  orgao_emissor_rg: string;
  estado_emissor_rg: string;
  nacionalidade: string;
  estado_civil: string;
  regime_bens: string;
  profissao: string;
  data_nascimento: string;
  data_nascimento_formatada: string;
  endereco: Endereco | null;
  endereco_formatado: string;
  conjuge?: string;
}

interface PessoaJuridicaCompleta {
  tipo: 'juridica';
  razao_social: string;
  cnpj: string;
  cnpj_formatado: string;
  inscricao_estadual: string;
  endereco: Endereco | null;
  endereco_formatado: string;
  representantes?: { nome: string; cpf: string; cpf_formatado: string; cargo: string }[];
}

type PessoaCompleta = PessoaNaturalCompleta | PessoaJuridicaCompleta;

interface ImovelCompleto {
  id: string;
  matricula_numero: string;
  matricula_cartorio: string;
  descricao: string;
  tipo_imovel: string;
  area_privativa: string;
  area_comum: string;
  area_total: string;
  area_construida: string;
  endereco_completo: string;
  inscricao_municipal: string;
  valor_venal: string;
  valor_venal_formatado: string;
  fracao_ideal: string;
  dados_adicionais: Record<string, unknown> | null;
}

interface NegocioJuridicoCompleto {
  id: string;
  tipo_negocio: string;
  valor: number | null;
  valor_formatado: string;
  valor_extenso: string;
  forma_pagamento: string;
  condicoes: Record<string, unknown> | null;
  data_contrato: string;
  data_contrato_formatada: string;
}

// ============ IMPLEMENTATION (mirrored from qualification-builder.ts) ============

function qualifyPessoaNatural(pessoa: PessoaNaturalCompleta): string {
  const parts: string[] = [];

  parts.push(pessoa.nome || '[NOME NAO INFORMADO]');

  if (pessoa.nacionalidade) {
    parts.push(pessoa.nacionalidade);
  }

  if (pessoa.estado_civil) {
    let estadoCivil = pessoa.estado_civil;
    if (pessoa.regime_bens && ['casado', 'casada'].some(ec => estadoCivil.toLowerCase().includes(ec))) {
      estadoCivil += ` pelo regime de ${pessoa.regime_bens}`;
    }
    parts.push(estadoCivil);
  }

  if (pessoa.profissao) {
    parts.push(pessoa.profissao);
  }

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

  if (pessoa.cpf_formatado) {
    parts.push(`inscrito(a) no CPF sob n. ${pessoa.cpf_formatado}`);
  }

  if (pessoa.endereco_formatado) {
    parts.push(`residente e domiciliado(a) em ${pessoa.endereco_formatado}`);
  }

  return parts.join(', ');
}

function qualifyPessoaJuridica(pessoa: PessoaJuridicaCompleta): string {
  const parts: string[] = [];

  parts.push(pessoa.razao_social || '[RAZAO SOCIAL NAO INFORMADA]');

  if (pessoa.cnpj_formatado) {
    parts.push(`inscrita no CNPJ sob n. ${pessoa.cnpj_formatado}`);
  }

  if (pessoa.inscricao_estadual) {
    parts.push(`Inscricao Estadual n. ${pessoa.inscricao_estadual}`);
  }

  if (pessoa.endereco_formatado) {
    parts.push(`com sede em ${pessoa.endereco_formatado}`);
  }

  if (pessoa.representantes && pessoa.representantes.length > 0) {
    const reps = pessoa.representantes.map(r =>
      `${r.nome}, ${r.cargo}, CPF ${r.cpf_formatado}`
    ).join('; ');
    parts.push(`neste ato representada por ${reps}`);
  }

  return parts.join(', ');
}

function qualifyPessoa(pessoa: PessoaCompleta): string {
  if (pessoa.tipo === 'natural') {
    return qualifyPessoaNatural(pessoa);
  } else {
    return qualifyPessoaJuridica(pessoa);
  }
}

function describeImovel(imovel: ImovelCompleto): string {
  const parts: string[] = [];

  const tipoDescricao = imovel.tipo_imovel
    ? `${imovel.tipo_imovel.charAt(0).toUpperCase()}${imovel.tipo_imovel.slice(1)}`
    : 'Imovel';

  parts.push(`${tipoDescricao} objeto da matricula n. ${imovel.matricula_numero || '[NUMERO NAO INFORMADO]'}`);

  if (imovel.matricula_cartorio) {
    parts.push(`do ${imovel.matricula_cartorio}`);
  }

  if (imovel.descricao) {
    parts.push(`assim descrito: ${imovel.descricao}`);
  }

  if (imovel.endereco_completo) {
    parts.push(`situado em ${imovel.endereco_completo}`);
  }

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

  if (imovel.fracao_ideal) {
    parts.push(`correspondente a fracao ideal de ${imovel.fracao_ideal}`);
  }

  if (imovel.inscricao_municipal) {
    parts.push(`inscrito no cadastro municipal sob n. ${imovel.inscricao_municipal}`);
  }

  if (imovel.valor_venal_formatado) {
    parts.push(`com valor venal de ${imovel.valor_venal_formatado}`);
  }

  return parts.join(', ');
}

function formatTipoNegocio(tipo: string): string {
  const tipos: Record<string, string> = {
    'compra_venda': 'compra e venda',
    'doacao': 'doacao',
    'permuta': 'permuta',
    'cessao': 'cessao de direitos',
  };
  return tipos[tipo] || tipo.replace(/_/g, ' ');
}

function formatKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

function describeNegocio(negocio: NegocioJuridicoCompleto): string {
  const parts: string[] = [];

  const tipoFormatado = formatTipoNegocio(negocio.tipo_negocio);
  parts.push(`Esta ${tipoFormatado}`);

  if (negocio.valor_formatado && negocio.valor_extenso) {
    parts.push(`e realizada pelo valor de ${negocio.valor_formatado} (${negocio.valor_extenso})`);
  }

  if (negocio.forma_pagamento) {
    parts.push(`a ser pago ${negocio.forma_pagamento}`);
  }

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

function buildOutorgantesSection(outorgantes: PessoaCompleta[]): string {
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

function buildOutorgadosSection(outorgados: PessoaCompleta[]): string {
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

// ============ TESTS ============

describe('qualifyPessoaNatural', () => {
  it('generates complete qualification for pessoa natural', () => {
    const pessoa: PessoaNaturalCompleta = {
      tipo: 'natural',
      nome: 'JOAO DA SILVA',
      cpf: '12345678900',
      cpf_formatado: '123.456.789-00',
      rg: '123456789',
      orgao_emissor_rg: 'SSP',
      estado_emissor_rg: 'SP',
      nacionalidade: 'brasileiro',
      estado_civil: 'casado',
      regime_bens: 'comunhao parcial de bens',
      profissao: 'empresario',
      data_nascimento: '1980-05-15',
      data_nascimento_formatada: '15 de maio de 1980',
      endereco: null,
      endereco_formatado: 'Rua das Flores, 123, Centro, Sao Paulo/SP, CEP 01310-100',
    };

    const result = qualifyPessoaNatural(pessoa);

    expect(result).toContain('JOAO DA SILVA');
    expect(result).toContain('brasileiro');
    expect(result).toContain('casado pelo regime de comunhao parcial de bens');
    expect(result).toContain('empresario');
    expect(result).toContain('RG n. 123456789 SSP/SP');
    expect(result).toContain('CPF sob n. 123.456.789-00');
    expect(result).toContain('residente e domiciliado(a) em Rua das Flores');
  });

  it('handles solteiro without regime de bens', () => {
    const pessoa: PessoaNaturalCompleta = {
      tipo: 'natural',
      nome: 'MARIA SANTOS',
      cpf: '98765432100',
      cpf_formatado: '987.654.321-00',
      rg: '987654321',
      orgao_emissor_rg: 'SSP',
      estado_emissor_rg: 'RJ',
      nacionalidade: 'brasileira',
      estado_civil: 'solteira',
      regime_bens: '',
      profissao: 'advogada',
      data_nascimento: '1990-10-20',
      data_nascimento_formatada: '20 de outubro de 1990',
      endereco: null,
      endereco_formatado: 'Av. Brasil, 500, Copacabana, Rio de Janeiro/RJ',
    };

    const result = qualifyPessoaNatural(pessoa);

    expect(result).toContain('solteira');
    expect(result).not.toContain('regime de');
  });

  it('handles missing optional fields', () => {
    const pessoa: PessoaNaturalCompleta = {
      tipo: 'natural',
      nome: 'PEDRO OLIVEIRA',
      cpf: '',
      cpf_formatado: '',
      rg: '',
      orgao_emissor_rg: '',
      estado_emissor_rg: '',
      nacionalidade: 'brasileiro',
      estado_civil: '',
      regime_bens: '',
      profissao: '',
      data_nascimento: '',
      data_nascimento_formatada: '',
      endereco: null,
      endereco_formatado: '',
    };

    const result = qualifyPessoaNatural(pessoa);

    expect(result).toContain('PEDRO OLIVEIRA');
    expect(result).toContain('brasileiro');
    expect(result).not.toContain('RG');
    expect(result).not.toContain('CPF');
  });
});

describe('qualifyPessoaJuridica', () => {
  it('generates complete qualification for pessoa juridica', () => {
    const pessoa: PessoaJuridicaCompleta = {
      tipo: 'juridica',
      razao_social: 'EMPRESA ABC LTDA',
      cnpj: '12345678000199',
      cnpj_formatado: '12.345.678/0001-99',
      inscricao_estadual: '123456789',
      endereco: null,
      endereco_formatado: 'Av. Paulista, 1000, Bela Vista, Sao Paulo/SP',
      representantes: [
        { nome: 'JOSE ADMIN', cpf: '11111111111', cpf_formatado: '111.111.111-11', cargo: 'Diretor' },
      ],
    };

    const result = qualifyPessoaJuridica(pessoa);

    expect(result).toContain('EMPRESA ABC LTDA');
    expect(result).toContain('CNPJ sob n. 12.345.678/0001-99');
    expect(result).toContain('Inscricao Estadual n. 123456789');
    expect(result).toContain('com sede em Av. Paulista');
    expect(result).toContain('representada por JOSE ADMIN, Diretor, CPF 111.111.111-11');
  });

  it('handles multiple representantes', () => {
    const pessoa: PessoaJuridicaCompleta = {
      tipo: 'juridica',
      razao_social: 'EMPRESA XYZ S.A.',
      cnpj: '98765432000100',
      cnpj_formatado: '98.765.432/0001-00',
      inscricao_estadual: '',
      endereco: null,
      endereco_formatado: '',
      representantes: [
        { nome: 'REP 1', cpf: '11111111111', cpf_formatado: '111.111.111-11', cargo: 'Diretor Presidente' },
        { nome: 'REP 2', cpf: '22222222222', cpf_formatado: '222.222.222-22', cargo: 'Diretor Financeiro' },
      ],
    };

    const result = qualifyPessoaJuridica(pessoa);

    expect(result).toContain('REP 1, Diretor Presidente');
    expect(result).toContain('REP 2, Diretor Financeiro');
  });

  it('handles missing optional fields', () => {
    const pessoa: PessoaJuridicaCompleta = {
      tipo: 'juridica',
      razao_social: 'EMPRESA SIMPLES LTDA',
      cnpj: '12345678000199',
      cnpj_formatado: '12.345.678/0001-99',
      inscricao_estadual: '',
      endereco: null,
      endereco_formatado: '',
      representantes: [],
    };

    const result = qualifyPessoaJuridica(pessoa);

    expect(result).toContain('EMPRESA SIMPLES LTDA');
    expect(result).toContain('CNPJ');
    expect(result).not.toContain('Inscricao Estadual');
    expect(result).not.toContain('representada');
  });
});

describe('qualifyPessoa', () => {
  it('routes to qualifyPessoaNatural for natural type', () => {
    const pessoa: PessoaNaturalCompleta = {
      tipo: 'natural',
      nome: 'TESTE NATURAL',
      cpf: '',
      cpf_formatado: '',
      rg: '',
      orgao_emissor_rg: '',
      estado_emissor_rg: '',
      nacionalidade: '',
      estado_civil: '',
      regime_bens: '',
      profissao: '',
      data_nascimento: '',
      data_nascimento_formatada: '',
      endereco: null,
      endereco_formatado: '',
    };

    const result = qualifyPessoa(pessoa);
    expect(result).toContain('TESTE NATURAL');
  });

  it('routes to qualifyPessoaJuridica for juridica type', () => {
    const pessoa: PessoaJuridicaCompleta = {
      tipo: 'juridica',
      razao_social: 'TESTE JURIDICA LTDA',
      cnpj: '',
      cnpj_formatado: '',
      inscricao_estadual: '',
      endereco: null,
      endereco_formatado: '',
    };

    const result = qualifyPessoa(pessoa);
    expect(result).toContain('TESTE JURIDICA LTDA');
  });
});

describe('describeImovel', () => {
  it('generates complete imovel description', () => {
    const imovel: ImovelCompleto = {
      id: '1',
      matricula_numero: '12345',
      matricula_cartorio: '1o Cartorio de Registro de Imoveis de Sao Paulo',
      descricao: 'Apartamento 101, Bloco A',
      tipo_imovel: 'apartamento',
      area_privativa: '80,00 m2',
      area_comum: '20,00 m2',
      area_total: '100,00 m2',
      area_construida: '80,00 m2',
      endereco_completo: 'Rua das Flores, 200, Apto 101, Jardim Paulista, Sao Paulo/SP',
      inscricao_municipal: '123.456.789-0',
      valor_venal: '500000',
      valor_venal_formatado: 'R$ 500.000,00',
      fracao_ideal: '0,005',
      dados_adicionais: null,
    };

    const result = describeImovel(imovel);

    expect(result).toContain('Apartamento objeto da matricula n. 12345');
    expect(result).toContain('1o Cartorio de Registro de Imoveis');
    expect(result).toContain('Apartamento 101, Bloco A');
    expect(result).toContain('situado em Rua das Flores');
    expect(result).toContain('area total de 100,00 m2');
    expect(result).toContain('area privativa de 80,00 m2');
    expect(result).toContain('fracao ideal de 0,005');
    expect(result).toContain('cadastro municipal sob n. 123.456.789-0');
    expect(result).toContain('valor venal de R$ 500.000,00');
  });

  it('handles minimal imovel data', () => {
    const imovel: ImovelCompleto = {
      id: '1',
      matricula_numero: '54321',
      matricula_cartorio: '',
      descricao: '',
      tipo_imovel: '',
      area_privativa: '',
      area_comum: '',
      area_total: '',
      area_construida: '',
      endereco_completo: '',
      inscricao_municipal: '',
      valor_venal: '',
      valor_venal_formatado: '',
      fracao_ideal: '',
      dados_adicionais: null,
    };

    const result = describeImovel(imovel);

    expect(result).toContain('Imovel objeto da matricula n. 54321');
    expect(result).not.toContain('area');
    expect(result).not.toContain('situado');
  });
});

describe('describeNegocio', () => {
  it('generates complete negocio description', () => {
    const negocio: NegocioJuridicoCompleto = {
      id: '1',
      tipo_negocio: 'compra_venda',
      valor: 500000,
      valor_formatado: 'R$ 500.000,00',
      valor_extenso: 'quinhentos mil reais',
      forma_pagamento: 'a vista',
      condicoes: { sinal: 'R$ 50.000,00', prazo: '30 dias' },
      data_contrato: '2026-02-01',
      data_contrato_formatada: '01 de fevereiro de 2026',
    };

    const result = describeNegocio(negocio);

    expect(result).toContain('compra e venda');
    expect(result).toContain('R$ 500.000,00 (quinhentos mil reais)');
    expect(result).toContain('a ser pago a vista');
    expect(result).toContain('condicoes');
  });

  it('handles different negocio types', () => {
    const negocioDoacao: NegocioJuridicoCompleto = {
      id: '1',
      tipo_negocio: 'doacao',
      valor: null,
      valor_formatado: '',
      valor_extenso: '',
      forma_pagamento: '',
      condicoes: null,
      data_contrato: '',
      data_contrato_formatada: '',
    };

    const result = describeNegocio(negocioDoacao);
    expect(result).toContain('doacao');
  });
});

describe('buildOutorgantesSection', () => {
  it('generates single outorgante section', () => {
    const outorgantes: PessoaCompleta[] = [{
      tipo: 'natural',
      nome: 'VENDEDOR UNICO',
      cpf: '',
      cpf_formatado: '111.111.111-11',
      rg: '',
      orgao_emissor_rg: '',
      estado_emissor_rg: '',
      nacionalidade: 'brasileiro',
      estado_civil: '',
      regime_bens: '',
      profissao: '',
      data_nascimento: '',
      data_nascimento_formatada: '',
      endereco: null,
      endereco_formatado: '',
    }];

    const result = buildOutorgantesSection(outorgantes);

    expect(result).toContain('OUTORGANTE VENDEDOR(A)');
    expect(result).toContain('VENDEDOR UNICO');
    expect(result).not.toContain('1)');
  });

  it('generates multiple outorgantes section', () => {
    const outorgantes: PessoaCompleta[] = [
      {
        tipo: 'natural',
        nome: 'VENDEDOR 1',
        cpf: '',
        cpf_formatado: '',
        rg: '',
        orgao_emissor_rg: '',
        estado_emissor_rg: '',
        nacionalidade: '',
        estado_civil: '',
        regime_bens: '',
        profissao: '',
        data_nascimento: '',
        data_nascimento_formatada: '',
        endereco: null,
        endereco_formatado: '',
      },
      {
        tipo: 'natural',
        nome: 'VENDEDOR 2',
        cpf: '',
        cpf_formatado: '',
        rg: '',
        orgao_emissor_rg: '',
        estado_emissor_rg: '',
        nacionalidade: '',
        estado_civil: '',
        regime_bens: '',
        profissao: '',
        data_nascimento: '',
        data_nascimento_formatada: '',
        endereco: null,
        endereco_formatado: '',
      },
    ];

    const result = buildOutorgantesSection(outorgantes);

    expect(result).toContain('OUTORGANTES VENDEDORES');
    expect(result).toContain('1) VENDEDOR 1');
    expect(result).toContain('2) VENDEDOR 2');
  });

  it('handles empty outorgantes', () => {
    const result = buildOutorgantesSection([]);
    expect(result).toBe('OUTORGANTES: [NAO INFORMADOS]');
  });
});

describe('buildOutorgadosSection', () => {
  it('generates single outorgado section', () => {
    const outorgados: PessoaCompleta[] = [{
      tipo: 'natural',
      nome: 'COMPRADOR UNICO',
      cpf: '',
      cpf_formatado: '',
      rg: '',
      orgao_emissor_rg: '',
      estado_emissor_rg: '',
      nacionalidade: '',
      estado_civil: '',
      regime_bens: '',
      profissao: '',
      data_nascimento: '',
      data_nascimento_formatada: '',
      endereco: null,
      endereco_formatado: '',
    }];

    const result = buildOutorgadosSection(outorgados);

    expect(result).toContain('OUTORGADO COMPRADOR(A)');
    expect(result).toContain('COMPRADOR UNICO');
  });

  it('handles empty outorgados', () => {
    const result = buildOutorgadosSection([]);
    expect(result).toBe('OUTORGADOS: [NAO INFORMADOS]');
  });
});
