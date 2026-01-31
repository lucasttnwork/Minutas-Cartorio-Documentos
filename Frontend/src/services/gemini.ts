// src/services/gemini.ts
// Cliente Gemini configurado para análise de documentos

import { GoogleGenAI } from '@google/genai';

// Configurações do modelo
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash-preview-05-20';
const USE_REAL_GEMINI = import.meta.env.VITE_USE_REAL_GEMINI === 'true';

// Configurações de geração
export const generationConfig = {
  temperature: 0.1,
  maxOutputTokens: 16384,
};

// Cliente Gemini inicializado
let geminiClient: GoogleGenAI | null = null;

/**
 * Obtém o cliente Gemini (lazy initialization)
 */
export function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    if (!GEMINI_API_KEY) {
      throw new Error(
        'VITE_GEMINI_API_KEY não configurada. Adicione no arquivo .env.local'
      );
    }
    geminiClient = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  }
  return geminiClient;
}

/**
 * Retorna o nome do modelo configurado
 */
export function getModelName(): string {
  return GEMINI_MODEL;
}

/**
 * Verifica se deve usar Gemini real ou mock
 */
export function shouldUseRealGemini(): boolean {
  return USE_REAL_GEMINI && Boolean(GEMINI_API_KEY);
}

/**
 * Tipo para as partes de conteúdo do Gemini
 */
export interface GeminiPart {
  inlineData?: {
    mimeType: string;
    data: string;
  };
  text?: string;
}

/**
 * Tipo para mensagem de conteúdo
 */
export interface GeminiContent {
  role: 'user' | 'model';
  parts: GeminiPart[];
}

export { GEMINI_MODEL, USE_REAL_GEMINI };
