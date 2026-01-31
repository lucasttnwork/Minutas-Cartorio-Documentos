// src/data/agentePrompts.test.ts
// Testes unitários para o sistema de prompts dos agentes

import { describe, it, expect } from 'vitest';
import {
  AGENT_PROMPTS,
  GENERIC_PROMPT,
  getAgentPrompt,
  buildFullPrompt,
  hasSpecificPrompt,
} from './agentePrompts';

describe('agentePrompts', () => {
  // ==========================================================================
  // AGENT_PROMPTS constant
  // ==========================================================================
  describe('AGENT_PROMPTS', () => {
    it('contém prompts para documentos pessoais', () => {
      expect(AGENT_PROMPTS).toHaveProperty('rg');
      expect(AGENT_PROMPTS).toHaveProperty('cnh');
    });

    it('contém prompts para certidões', () => {
      expect(AGENT_PROMPTS).toHaveProperty('certidao-casamento');
      expect(AGENT_PROMPTS).toHaveProperty('certidao-nascimento');
    });

    it('contém prompts para documentos imobiliários', () => {
      expect(AGENT_PROMPTS).toHaveProperty('matricula-imovel');
      expect(AGENT_PROMPTS).toHaveProperty('itbi');
      expect(AGENT_PROMPTS).toHaveProperty('iptu');
      expect(AGENT_PROMPTS).toHaveProperty('escritura');
    });

    it('contém prompts para documentos empresariais', () => {
      expect(AGENT_PROMPTS).toHaveProperty('contrato-social');
      expect(AGENT_PROMPTS).toHaveProperty('cndt');
    });

    it('contém prompt para compromisso de compra e venda', () => {
      expect(AGENT_PROMPTS).toHaveProperty('compromisso-compra-venda');
    });
  });

  // ==========================================================================
  // getAgentPrompt()
  // ==========================================================================
  describe('getAgentPrompt', () => {
    it('retorna prompt específico para "rg"', () => {
      const prompt = getAgentPrompt('rg');

      expect(prompt).toBe(AGENT_PROMPTS['rg']);
      expect(prompt).toContain('RG');
      expect(prompt).toContain('Registro Geral');
    });

    it('retorna prompt específico para "cnh"', () => {
      const prompt = getAgentPrompt('cnh');

      expect(prompt).toBe(AGENT_PROMPTS['cnh']);
      expect(prompt).toContain('CNH');
      expect(prompt).toContain('Habilitacao');
    });

    it('retorna prompt específico para "certidao-casamento"', () => {
      const prompt = getAgentPrompt('certidao-casamento');

      expect(prompt).toBe(AGENT_PROMPTS['certidao-casamento']);
      expect(prompt).toContain('Casamento');
      expect(prompt).toContain('conjuge');
    });

    it('retorna prompt específico para "certidao-nascimento"', () => {
      const prompt = getAgentPrompt('certidao-nascimento');

      expect(prompt).toBe(AGENT_PROMPTS['certidao-nascimento']);
      expect(prompt).toContain('Nascimento');
    });

    it('retorna prompt específico para "matricula-imovel"', () => {
      const prompt = getAgentPrompt('matricula-imovel');

      expect(prompt).toBe(AGENT_PROMPTS['matricula-imovel']);
      expect(prompt).toContain('MATRICULA');
      // O prompt contém "Cadeia Dominial" com acentos
      expect(prompt.toUpperCase()).toContain('CADEIA DOMINIAL');
    });

    it('retorna prompt específico para "itbi"', () => {
      const prompt = getAgentPrompt('itbi');

      expect(prompt).toBe(AGENT_PROMPTS['itbi']);
      expect(prompt).toContain('ITBI');
      expect(prompt).toContain('Imposto');
    });

    it('retorna prompt específico para "iptu"', () => {
      const prompt = getAgentPrompt('iptu');

      expect(prompt).toBe(AGENT_PROMPTS['iptu']);
      expect(prompt).toContain('IPTU');
    });

    it('retorna prompt específico para "escritura"', () => {
      const prompt = getAgentPrompt('escritura');

      expect(prompt).toBe(AGENT_PROMPTS['escritura']);
      expect(prompt).toContain('Escritura');
    });

    it('retorna prompt específico para "compromisso-compra-venda"', () => {
      const prompt = getAgentPrompt('compromisso-compra-venda');

      expect(prompt).toBe(AGENT_PROMPTS['compromisso-compra-venda']);
      expect(prompt).toContain('COMPROMISSO');
    });

    it('retorna prompt específico para "contrato-social"', () => {
      const prompt = getAgentPrompt('contrato-social');

      expect(prompt).toBe(AGENT_PROMPTS['contrato-social']);
      expect(prompt).toContain('Contrato Social');
    });

    it('retorna prompt específico para "cndt"', () => {
      const prompt = getAgentPrompt('cndt');

      expect(prompt).toBe(AGENT_PROMPTS['cndt']);
      expect(prompt).toContain('CNDT');
      expect(prompt).toContain('Trabalhistas');
    });

    it('retorna prompt genérico para slug desconhecido', () => {
      const prompt = getAgentPrompt('documento-inexistente');

      expect(prompt).toBe(GENERIC_PROMPT);
      expect(prompt).toContain('analise generica');
    });

    it('retorna prompt genérico para string vazia', () => {
      const prompt = getAgentPrompt('');

      expect(prompt).toBe(GENERIC_PROMPT);
    });

    it('retorna prompt genérico para slug com typo', () => {
      const prompt = getAgentPrompt('cnh-typo');

      expect(prompt).toBe(GENERIC_PROMPT);
    });

    it('prompt contém instruções de formato JSON', () => {
      const rgPrompt = getAgentPrompt('rg');
      const cnhPrompt = getAgentPrompt('cnh');
      const genericPrompt = getAgentPrompt('unknown');

      expect(rgPrompt).toContain('```json');
      expect(cnhPrompt).toContain('```json');
      expect(genericPrompt).toContain('```json');
    });

    it('todos os prompts específicos têm seção DADOS CATALOGADOS', () => {
      Object.values(AGENT_PROMPTS).forEach((prompt) => {
        expect(prompt).toContain('DADOS CATALOGADOS');
      });
    });

    it('todos os prompts específicos têm seção REESCRITA', () => {
      Object.values(AGENT_PROMPTS).forEach((prompt) => {
        expect(prompt).toContain('REESCRITA');
      });
    });
  });

  // ==========================================================================
  // buildFullPrompt()
  // ==========================================================================
  describe('buildFullPrompt', () => {
    it('retorna apenas prompt base sem instruções', () => {
      const fullPrompt = buildFullPrompt('rg');

      expect(fullPrompt).toBe(AGENT_PROMPTS['rg']);
    });

    it('retorna apenas prompt base quando instruções são undefined', () => {
      const fullPrompt = buildFullPrompt('cnh', undefined);

      expect(fullPrompt).toBe(AGENT_PROMPTS['cnh']);
    });

    it('combina prompt base com instruções do usuário', () => {
      const instructions = 'Foque especialmente no CPF e data de nascimento.';
      const fullPrompt = buildFullPrompt('rg', instructions);

      expect(fullPrompt).toContain(AGENT_PROMPTS['rg']);
      expect(fullPrompt).toContain(instructions);
    });

    it('adiciona seção "INSTRUCOES ADICIONAIS DO USUARIO"', () => {
      const instructions = 'Extraia também o número do telefone se visível.';
      const fullPrompt = buildFullPrompt('cnh', instructions);

      expect(fullPrompt).toContain('INSTRUCOES ADICIONAIS DO USUARIO');
      expect(fullPrompt).toContain(instructions);
    });

    it('ignora instruções vazias', () => {
      const fullPrompt = buildFullPrompt('rg', '');

      expect(fullPrompt).toBe(AGENT_PROMPTS['rg']);
      expect(fullPrompt).not.toContain('INSTRUCOES ADICIONAIS');
    });

    it('ignora instruções só com espaços', () => {
      const fullPrompt = buildFullPrompt('rg', '   \n\t   ');

      expect(fullPrompt).toBe(AGENT_PROMPTS['rg']);
      expect(fullPrompt).not.toContain('INSTRUCOES ADICIONAIS');
    });

    it('mantém formato original do prompt base', () => {
      const instructions = 'Minhas instruções';
      const fullPrompt = buildFullPrompt('matricula-imovel', instructions);

      // Verificar que o prompt base está intacto no início
      expect(fullPrompt.startsWith(AGENT_PROMPTS['matricula-imovel'])).toBe(true);
    });

    it('adiciona separador visual antes das instruções', () => {
      const instructions = 'Instruções customizadas';
      const fullPrompt = buildFullPrompt('iptu', instructions);

      expect(fullPrompt).toContain('---');
    });

    it('trim nas instruções do usuário', () => {
      const instructions = '   Instruções com espaços   ';
      const fullPrompt = buildFullPrompt('rg', instructions);

      expect(fullPrompt).toContain('Instruções com espaços');
      expect(fullPrompt).not.toContain('   Instruções com espaços   \n');
    });

    it('funciona com prompt genérico', () => {
      const instructions = 'Análise detalhada por favor';
      const fullPrompt = buildFullPrompt('unknown-doc', instructions);

      expect(fullPrompt).toContain(GENERIC_PROMPT);
      expect(fullPrompt).toContain(instructions);
    });

    it('mantém aviso sobre formato de saída', () => {
      const instructions = 'Foque no nome completo';
      const fullPrompt = buildFullPrompt('cnh', instructions);

      expect(fullPrompt).toContain('mantenha o formato de saida');
    });

    it('preserva instruções com múltiplas linhas', () => {
      const instructions = `Linha 1
Linha 2
Linha 3`;
      const fullPrompt = buildFullPrompt('rg', instructions);

      expect(fullPrompt).toContain('Linha 1');
      expect(fullPrompt).toContain('Linha 2');
      expect(fullPrompt).toContain('Linha 3');
    });

    it('preserva caracteres especiais nas instruções', () => {
      const instructions = 'Extrair CPF: 000.000.000-00 e RG: 00.000.000-X';
      const fullPrompt = buildFullPrompt('rg', instructions);

      expect(fullPrompt).toContain('000.000.000-00');
      expect(fullPrompt).toContain('00.000.000-X');
    });
  });

  // ==========================================================================
  // hasSpecificPrompt()
  // ==========================================================================
  describe('hasSpecificPrompt', () => {
    it('retorna true para slugs conhecidos', () => {
      expect(hasSpecificPrompt('rg')).toBe(true);
      expect(hasSpecificPrompt('cnh')).toBe(true);
      expect(hasSpecificPrompt('certidao-casamento')).toBe(true);
      expect(hasSpecificPrompt('certidao-nascimento')).toBe(true);
      expect(hasSpecificPrompt('matricula-imovel')).toBe(true);
      expect(hasSpecificPrompt('itbi')).toBe(true);
      expect(hasSpecificPrompt('iptu')).toBe(true);
      expect(hasSpecificPrompt('escritura')).toBe(true);
      expect(hasSpecificPrompt('compromisso-compra-venda')).toBe(true);
      expect(hasSpecificPrompt('contrato-social')).toBe(true);
      expect(hasSpecificPrompt('cndt')).toBe(true);
    });

    it('retorna false para slugs desconhecidos', () => {
      expect(hasSpecificPrompt('documento-generico')).toBe(false);
      expect(hasSpecificPrompt('unknown')).toBe(false);
      expect(hasSpecificPrompt('')).toBe(false);
      expect(hasSpecificPrompt('carteira-trabalho')).toBe(false);
      expect(hasSpecificPrompt('passaporte')).toBe(false);
    });

    it('é case-sensitive', () => {
      expect(hasSpecificPrompt('RG')).toBe(false);
      expect(hasSpecificPrompt('CNH')).toBe(false);
      expect(hasSpecificPrompt('Cnh')).toBe(false);
    });

    it('não aceita slugs com espaços', () => {
      expect(hasSpecificPrompt('certidao casamento')).toBe(false);
      expect(hasSpecificPrompt(' rg')).toBe(false);
      expect(hasSpecificPrompt('cnh ')).toBe(false);
    });
  });

  // ==========================================================================
  // GENERIC_PROMPT
  // ==========================================================================
  describe('GENERIC_PROMPT', () => {
    it('contém instruções para identificar tipo de documento', () => {
      expect(GENERIC_PROMPT).toContain('IDENTIFICACAO DO TIPO');
    });

    it('lista tipos de documentos conhecidos', () => {
      expect(GENERIC_PROMPT).toContain('Documentos Pessoais');
      expect(GENERIC_PROMPT).toContain('Certidoes');
      expect(GENERIC_PROMPT).toContain('Documentos do Imovel');
      expect(GENERIC_PROMPT).toContain('Documentos do Negocio');
    });

    it('contém regra para não inventar dados', () => {
      expect(GENERIC_PROMPT).toContain('NUNCA INVENTAR DADOS');
    });

    it('requer explicação contextual', () => {
      expect(GENERIC_PROMPT).toContain('EXPLICACAO OBRIGATORIA');
      expect(GENERIC_PROMPT).toContain('3-5 paragrafos');
    });

    it('contém formato de saída JSON', () => {
      expect(GENERIC_PROMPT).toContain('```json');
      expect(GENERIC_PROMPT).toContain('tipo_documento_identificado');
    });
  });

  // ==========================================================================
  // Consistência entre prompts
  // ==========================================================================
  describe('Consistência entre prompts', () => {
    it('maioria dos prompts proíbem inventar dados', () => {
      const allPrompts = Object.values(AGENT_PROMPTS);
      let promptsWithRule = 0;

      allPrompts.forEach((prompt) => {
        const upperPrompt = prompt.toUpperCase();
        // Verifica se contém regra contra inventar/fabricar dados
        // Os prompts podem usar diferentes formulações: "NUNCA INVENTAR", "NUNCA INVENTE", etc.
        const hasRule =
          upperPrompt.includes('NUNCA INVENTAR') ||
          upperPrompt.includes('NUNCA INVENTE') ||
          upperPrompt.includes('NAO INVENTAR') ||
          upperPrompt.includes('ANTI-FABRICACAO') ||
          upperPrompt.includes('PROIBIDO') ||
          upperPrompt.includes('USE NULL');
        if (hasRule) promptsWithRule++;
      });

      // Pelo menos 80% dos prompts devem ter a regra
      expect(promptsWithRule / allPrompts.length).toBeGreaterThanOrEqual(0.8);
    });

    it('todos os prompts requerem explicação contextual', () => {
      const allPrompts = [...Object.values(AGENT_PROMPTS), GENERIC_PROMPT];

      allPrompts.forEach((prompt) => {
        expect(prompt.toUpperCase()).toContain('EXPLICACAO');
      });
    });

    it('todos os prompts têm formato JSON estruturado', () => {
      const allPrompts = [...Object.values(AGENT_PROMPTS), GENERIC_PROMPT];

      allPrompts.forEach((prompt) => {
        expect(prompt).toContain('```json');
        expect(prompt).toContain('```');
      });
    });
  });
});
