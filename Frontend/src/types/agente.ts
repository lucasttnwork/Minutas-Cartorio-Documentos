// src/types/agente.ts

export type AgenteCategoria = 'pessoais' | 'imobiliarios' | 'empresariais';

export interface AgenteConfig {
  id: string;
  slug: string;
  nome: string;
  descricao: string;
  categoria: AgenteCategoria;
  icone: string; // Lucide icon name
  imagemUrl?: string;
  promptBase?: string;
}

export interface ArquivoUpload {
  id: string;
  file: File;
  nome: string;
  tamanho: number;
  tipo: string;
  preview?: string;
}

export type AnaliseStatus = 'idle' | 'analyzing' | 'completed' | 'error';

export interface AnaliseState {
  status: AnaliseStatus;
  resultado: string;
  erro?: string;
}
