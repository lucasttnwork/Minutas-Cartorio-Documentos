// src/pages/HomePage/data/home-copy.ts
// Centralized copy for the HomePage "Cartório Paulista"

import {
  FileText,
  ScanSearch,
  Shield,
  CheckCircle,
  Zap,
  History,
  type LucideIcon,
} from 'lucide-react';

export interface HeroCopy {
  badge: string;
  headline: string;
  subheadline: string;
  ctas: {
    primary: string;
    secondary: string;
  };
}

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface FuncionalidadesCopy {
  badge: string;
  headline: string;
  subheadline: string;
  features: Feature[];
}

export const hero: HeroCopy = {
  badge: 'Cartório Paulista',
  headline: 'Seu Copiloto de Minutas',
  subheadline:
    'Assistente inteligente para escreventes. Gere minutas validadas em minutos, com segurança jurídica e conformidade total.',
  ctas: {
    primary: 'Entrar no Sistema',
    secondary: 'Saiba Mais',
  },
};

export const funcionalidades: FuncionalidadesCopy = {
  badge: 'Funcionalidades',
  headline: 'Tudo que você precisa',
  subheadline: 'Ferramentas pensadas para sua rotina diária',
  features: [
    {
      icon: FileText,
      title: 'Geração de Minutas com IA',
      description: 'Fluxo completo de envio de documentos e geração de minuta',
    },
    {
      icon: ScanSearch,
      title: 'Extração Inteligente',
      description: 'Upload de documentos e extração automática de dados',
    },
    {
      icon: Shield,
      title: 'Conformidade LGPD',
      description: 'Dados criptografados e hospedados no Brasil',
    },
    {
      icon: CheckCircle,
      title: 'Melhoria Contínua',
      description: 'Aprimoramento constante das capacidades e assertividade dos agentes',
    },
    {
      icon: Zap,
      title: 'Processamento Rápido',
      description: 'De horas para minutos, sem sacrificar qualidade',
    },
    {
      icon: History,
      title: 'Histórico Completo',
      description: 'Busca inteligente e rastreabilidade total',
    },
  ],
};
