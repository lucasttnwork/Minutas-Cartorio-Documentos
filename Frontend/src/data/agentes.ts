// src/data/agentes.ts

import type { AgenteConfig } from '@/types/agente';

export const agentes: AgenteConfig[] = [
  // Pessoais
  {
    id: '1',
    slug: 'rg',
    nome: 'Extrator de RG',
    descricao: 'Extrai dados de documentos de identidade (RG)',
    categoria: 'pessoais',
    icone: 'IdCard',
  },
  {
    id: '2',
    slug: 'cnh',
    nome: 'Extrator de CNH',
    descricao: 'Extrai dados de Carteira Nacional de Habilitação',
    categoria: 'pessoais',
    icone: 'Car',
  },
  {
    id: '3',
    slug: 'certidao-casamento',
    nome: 'Extrator de Certidão de Casamento',
    descricao: 'Extrai dados de certidões de casamento',
    categoria: 'pessoais',
    icone: 'Heart',
  },
  {
    id: '4',
    slug: 'certidao-nascimento',
    nome: 'Extrator de Certidão de Nascimento',
    descricao: 'Extrai dados de certidões de nascimento',
    categoria: 'pessoais',
    icone: 'Baby',
  },
  // Imobiliários
  {
    id: '5',
    slug: 'matricula-imovel',
    nome: 'Extrator de Matrícula de Imóvel',
    descricao: 'Extrai dados de matrículas imobiliárias',
    categoria: 'imobiliarios',
    icone: 'FileText',
  },
  {
    id: '6',
    slug: 'itbi',
    nome: 'Extrator de ITBI',
    descricao: 'Extrai dados de guias de ITBI',
    categoria: 'imobiliarios',
    icone: 'Receipt',
  },
  {
    id: '7',
    slug: 'iptu',
    nome: 'Extrator de IPTU',
    descricao: 'Extrai dados de carnês e certidões de IPTU',
    categoria: 'imobiliarios',
    icone: 'Home',
  },
  {
    id: '8',
    slug: 'escritura',
    nome: 'Extrator de Escritura',
    descricao: 'Extrai dados de escrituras públicas',
    categoria: 'imobiliarios',
    icone: 'Scroll',
  },
  {
    id: '9',
    slug: 'compromisso-compra-venda',
    nome: 'Extrator de Compromisso de Compra e Venda',
    descricao: 'Extrai dados de contratos de compromisso',
    categoria: 'imobiliarios',
    icone: 'FileSignature',
  },
  // Empresariais
  {
    id: '10',
    slug: 'contrato-social',
    nome: 'Extrator de Contrato Social',
    descricao: 'Extrai dados de contratos sociais e alterações',
    categoria: 'empresariais',
    icone: 'Building2',
  },
  {
    id: '11',
    slug: 'cndt',
    nome: 'Extrator de CNDT',
    descricao: 'Extrai dados de Certidão Negativa de Débitos Trabalhistas',
    categoria: 'empresariais',
    icone: 'ShieldCheck',
  },
];

export const categorias = [
  { id: 'todos', nome: 'Todos' },
  { id: 'pessoais', nome: 'Pessoais' },
  { id: 'imobiliarios', nome: 'Imobiliários' },
  { id: 'empresariais', nome: 'Empresariais' },
] as const;

export function getAgenteBySlug(slug: string): AgenteConfig | undefined {
  return agentes.find(a => a.slug === slug);
}

export function getAgentesByCategoria(categoria: string): AgenteConfig[] {
  if (categoria === 'todos') return agentes;
  return agentes.filter(a => a.categoria === categoria);
}
