// src/components/agentes/ResultadoAnalise.tsx
// Componente de resultado com suporte a streaming em tempo real

import { useEffect, useRef, memo, useMemo, useState, useCallback } from 'react';
import { Copy, FileDown, Maximize2, FileText as FileIcon, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ThinkingIndicator } from '@/components/streaming';
import { FormSection } from '@/components/forms/FormSection';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AnaliseStatus } from '@/types/agente';

interface ResultadoAnaliseProps {
  status: AnaliseStatus;
  conteudo: string;
  thinking?: string;
  thinkingDuration?: number;
  isStreaming?: boolean;
  onCopy: () => void;
  onDownloadDocx: () => void;
  onDownloadPdf: () => void;
  onExpand: () => void;
}

interface CampoDados {
  label: string;
  value: string;
  section?: string;
}

/**
 * Extrai o bloco JSON do conteúdo retornado pelo Gemini
 * O JSON vem após "## DADOS CATALOGADOS (JSON)" dentro de ```json ... ```
 */
function extractJsonFromContent(conteudo: string): Record<string, unknown> | null {
  if (!conteudo) return null;

  try {
    // Procurar por bloco JSON após "DADOS CATALOGADOS"
    const jsonBlockRegex = /```json\s*([\s\S]*?)```/;
    const match = conteudo.match(jsonBlockRegex);

    if (match && match[1]) {
      const jsonStr = match[1].trim();
      return JSON.parse(jsonStr);
    }

    return null;
  } catch (error) {
    console.error('[extractJsonFromContent] Erro ao parsear JSON:', error);
    return null;
  }
}

/**
 * Formata o nome de uma chave para exibição amigável
 * Ex: "nome_completo" -> "Nome Completo"
 */
function formatKeyToLabel(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Formata um valor para exibição
 */
function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
  if (typeof value === 'number') return value.toLocaleString('pt-BR');
  if (Array.isArray(value)) {
    if (value.length === 0) return '-';
    // Se for array de strings, junta com vírgula
    if (typeof value[0] === 'string') return value.join(', ');
    // Se for array de objetos, retorna quantidade
    return `${value.length} item(s)`;
  }
  return String(value);
}

/**
 * Converte um objeto JSON em campos para o formulário
 * Suporta estruturas aninhadas e cria seções automaticamente
 */
function jsonToCampos(
  json: Record<string, unknown>,
  parentSection: string = 'DADOS GERAIS',
  parentKey: string = ''
): CampoDados[] {
  const campos: CampoDados[] = [];

  // Chaves a ignorar (metadados internos)
  const ignoredKeys = new Set([
    'tipo_documento',
    'tipo_certidao',
    'pessoa_relacionada',
    'papel_inferido',
    'qualidade_imagem',
    'confianca_extracao'
  ]);

  // Chaves que devem ser seções
  const sectionKeys = new Set([
    'dados_catalogados',
    'filiacao',
    'habilitacao',
    'elementos_presentes',
    'autoridade_emissora',
    'imovel',
    'endereco',
    'partes',
    'valores',
    'pagamento',
    'conjuge1',
    'conjuge2',
    'avos',
    'cartorio',
    'registro',
    'matricula',
    'local_nascimento',
    'declarante',
    'identificacao',
    'datas',
    'transacao',
    'empresa',
    'capital_social',
    'base_legal',
    'cadeia_dominial',
    'proprietarios_atuais',
    'onus_ativos',
    'onus_historicos',
    'valores_financeiros',
    'prazos',
    'penalidades',
    'responsabilidades',
    'dados_terreno',
    'dados_construcao',
    'valores_m2',
    'valores_venais',
    'identificacao_imovel',
    'metadados_documento',
    'pacto_antenupcial',
    'responsaveis',
    'documentos_complementares'
  ]);

  for (const [key, value] of Object.entries(json)) {
    // Pular chaves ignoradas
    if (ignoredKeys.has(key)) continue;

    // Pular campos vazios ou arrays vazios
    if (value === null || value === undefined) continue;
    if (Array.isArray(value) && value.length === 0) continue;

    const fullKey = parentKey ? `${parentKey}.${key}` : key;

    // Se for um objeto (não array), trata como seção aninhada
    if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
      const newSection = sectionKeys.has(key)
        ? formatKeyToLabel(key).toUpperCase()
        : parentSection;

      // Recursivamente processa o objeto aninhado
      const nestedCampos = jsonToCampos(
        value as Record<string, unknown>,
        newSection,
        fullKey
      );
      campos.push(...nestedCampos);
    }
    // Se for array de objetos complexos (ex: socios, administradores)
    else if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
      const sectionName = formatKeyToLabel(key).toUpperCase();

      value.forEach((item, index) => {
        if (typeof item === 'object' && item !== null) {
          const itemSection = value.length > 1
            ? `${sectionName} ${index + 1}`
            : sectionName;

          const nestedCampos = jsonToCampos(
            item as Record<string, unknown>,
            itemSection,
            `${fullKey}[${index}]`
          );
          campos.push(...nestedCampos);
        }
      });
    }
    // Valores primitivos ou arrays simples
    else {
      campos.push({
        label: formatKeyToLabel(key),
        value: formatValue(value),
        section: parentSection
      });
    }
  }

  return campos;
}

/**
 * Componente de Markdown otimizado para streaming
 * Usa memo para evitar re-renders desnecessários
 */
const MarkdownRenderer = memo(function MarkdownRenderer({
  content,
  isStreaming,
}: {
  content: string;
  isStreaming: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prevLengthRef = useRef(0);

  // Auto-scroll quando novo conteúdo chega durante streaming
  useEffect(() => {
    if (isStreaming && containerRef.current && content.length > prevLengthRef.current) {
      const container = containerRef.current;
      // Verificar se o usuário está perto do final (dentro de 100px)
      const isNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight < 100;

      if (isNearBottom) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth',
        });
      }
    }
    prevLengthRef.current = content.length;
  }, [content, isStreaming]);

  // Renderizar markdown de forma otimizada
  const renderedContent = useMemo(() => {
    return content.split('\n').map((line, i) => {
      const trimmed = line.trim();

      // Código block
      if (trimmed.startsWith('```')) {
        return (
          <div key={i} className="font-mono text-xs bg-muted/50 px-2 py-0.5 rounded">
            {trimmed}
          </div>
        );
      }

      // Headers
      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={i} className="text-base font-semibold mt-4 mb-2 text-foreground">
            {trimmed.slice(4)}
          </h3>
        );
      }
      if (trimmed.startsWith('## ')) {
        return (
          <h2 key={i} className="text-lg font-semibold mt-5 mb-2 text-foreground border-b border-border pb-1">
            {trimmed.slice(3)}
          </h2>
        );
      }
      if (trimmed.startsWith('# ')) {
        return (
          <h1 key={i} className="text-xl font-bold mt-6 mb-3 text-foreground">
            {trimmed.slice(2)}
          </h1>
        );
      }

      // Listas
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return (
          <li key={i} className="ml-4 mb-1 list-disc text-muted-foreground">
            {renderInlineStyles(trimmed.slice(2))}
          </li>
        );
      }
      if (trimmed.match(/^\d+\.\s/)) {
        return (
          <li key={i} className="ml-4 mb-1 list-decimal text-muted-foreground">
            {renderInlineStyles(trimmed.replace(/^\d+\.\s/, ''))}
          </li>
        );
      }

      // Linha vazia
      if (!trimmed) {
        return <div key={i} className="h-2" />;
      }

      // Parágrafo normal
      return (
        <p key={i} className="mb-2 leading-relaxed text-muted-foreground">
          {renderInlineStyles(trimmed)}
        </p>
      );
    });
  }, [content]);

  return (
    <div
      ref={containerRef}
      className="prose prose-sm max-w-none dark:prose-invert font-serif overflow-auto h-full"
    >
      {renderedContent}
      {/* Cursor piscante durante streaming */}
      {isStreaming && (
        <span className="inline-block w-0.5 h-5 bg-primary ml-0.5 align-middle animate-blink" />
      )}
    </div>
  );
});

/**
 * Renderiza estilos inline (bold, italic, code)
 */
function renderInlineStyles(text: string) {
  // Handle inline code
  const codeRegex = /`([^`]+)`/g;

  const parts: Array<string | JSX.Element> = [];
  let lastIndex = 0;
  let match;
  let keyIndex = 0;

  // Primeiro, processar código inline
  const textWithCode = text.replace(codeRegex, (_match, code) => {
    return `<code>${code}</code>`;
  });

  // Depois, processar bold e code tags
  const regex = /\*\*([^*]+)\*\*|<code>([^<]+)<\/code>/g;
  const processedText = textWithCode;

  while ((match = regex.exec(processedText)) !== null) {
    if (match.index > lastIndex) {
      parts.push(processedText.slice(lastIndex, match.index));
    }

    if (match[1]) {
      // Bold match
      parts.push(<strong key={keyIndex++}>{match[1]}</strong>);
    } else if (match[2]) {
      // Code match
      parts.push(
        <code key={keyIndex++} className="bg-muted px-1 py-0.5 rounded text-xs font-mono">
          {match[2]}
        </code>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < processedText.length) {
    parts.push(processedText.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

/**
 * Indicador de loading animado
 */
const LoadingIndicator = memo(function LoadingIndicator() {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="relative">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <div className="absolute inset-0 w-8 h-8 rounded-full border-2 border-primary/20" />
      </div>
      <p className="text-sm text-muted-foreground mt-4">Analisando documento...</p>
      <div className="flex gap-1 mt-2">
        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
});

/**
 * Formata contagem de caracteres para exibicao
 */
function formatCharCount(count: number): string {
  if (count < 1000) return `${count} chars`;
  return `${(count / 1000).toFixed(1)}k chars`;
}

/**
 * Remove a seção "DADOS CATALOGADOS (JSON)" e todo o conteúdo JSON após ela
 * Essa seção é usada internamente mas não deve ser exibida ao usuário
 */
export function filterJsonSection(content: string): string {
  if (!content) return content;

  // Padrões para detectar o início da seção JSON
  const patterns = [
    /##\s*DADOS\s+CATALOGADOS\s*\(JSON\)/i,
    /##\s*DADOS\s+CATALOGADOS/i,
    /##\s*JSON/i,
    /```json\s*\n\s*\{/,
  ];

  let cutIndex = content.length;

  for (const pattern of patterns) {
    const match = content.search(pattern);
    if (match !== -1 && match < cutIndex) {
      cutIndex = match;
    }
  }

  // Retorna o conteúdo até o ponto de corte, removendo espaços em branco no final
  return content.slice(0, cutIndex).trim();
}

/**
 * Campo de formulário somente leitura para exibir dados extraídos
 */
function ReadOnlyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!value || value === '-') return;

    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [value]);

  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </Label>
      <div className="flex">
        <Input
          value={value || '-'}
          readOnly
          className="bg-muted/50 border-border/50 text-foreground cursor-default focus-visible:ring-0 rounded-r-none border-r-0"
        />
        <button
          type="button"
          onClick={handleCopy}
          disabled={!value || value === '-'}
          className={cn(
            "flex items-center justify-center px-3",
            "border border-border/50 rounded-r-md",
            "bg-muted/30 hover:bg-muted transition-colors duration-150",
            "text-muted-foreground hover:text-foreground",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-muted/30",
            copied && "text-green-500 hover:text-green-500 bg-green-500/10"
          )}
          title={copied ? "Copiado!" : "Copiar"}
        >
          {copied ? (
            <Check className="w-4 h-4" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}

/**
 * Componente de campos de dados extraídos usando FormSection
 */
const CamposDados = memo(function CamposDados({
  campos,
}: {
  campos: CampoDados[];
}) {
  // Agrupar campos por seção
  const camposPorSecao = useMemo(() => {
    const grupos: Record<string, CampoDados[]> = {};
    campos.forEach((campo) => {
      const secao = campo.section || 'DADOS GERAIS';
      if (!grupos[secao]) {
        grupos[secao] = [];
      }
      grupos[secao].push(campo);
    });
    return grupos;
  }, [campos]);

  return (
    <div className="space-y-2">
      {Object.entries(camposPorSecao).map(([secao, camposSecao], index) => (
        <FormSection
          key={secao}
          title={secao}
          columns={2}
          variant="ghost"
          isFirst={index === 0}
        >
          {camposSecao.map((campo, idx) => (
            <ReadOnlyField
              key={idx}
              label={campo.label}
              value={campo.value}
            />
          ))}
        </FormSection>
      ))}
    </div>
  );
});

/**
 * Extrai campos estruturados do JSON retornado pelo Gemini
 * Fallback para parsing de Markdown se JSON não estiver disponível
 */
function extractCamposFromContent(conteudo: string): CampoDados[] {
  // Tentar extrair do JSON primeiro (fonte principal)
  const jsonData = extractJsonFromContent(conteudo);

  if (jsonData) {
    // Se o JSON tem dados_catalogados aninhado (ex: CNH), usar ele
    const dataToProcess = (jsonData.dados_catalogados as Record<string, unknown>) || jsonData;
    return jsonToCampos(dataToProcess);
  }

  // Fallback: parsing do Markdown (compatibilidade com respostas antigas)
  console.warn('[extractCamposFromContent] JSON não encontrado, usando fallback de Markdown');

  const campos: CampoDados[] = [];
  let currentSection = 'DADOS GERAIS';

  const lines = conteudo.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();

    // Detectar seções (headers)
    if (trimmed.startsWith('## ') || trimmed.startsWith('### ')) {
      currentSection = trimmed.replace(/^#+\s*/, '').toUpperCase();
      continue;
    }

    // Detectar campos no formato "- **Label:** Valor" ou "- Label: Valor"
    const bulletMatch = trimmed.match(/^[-*]\s*\*?\*?([^:*]+)\*?\*?:\s*(.+)$/);
    if (bulletMatch) {
      campos.push({
        label: bulletMatch[1].trim(),
        value: bulletMatch[2].trim(),
        section: currentSection,
      });
    }
  }

  return campos;
}

/**
 * Container de documento estilo A4 com efeito papel
 */
function DocumentContainer({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("h-full flex flex-col", className)}>
      {/* Header do documento */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-border/50 bg-muted/20">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
          {title}
        </h3>
      </div>
      {/* Conteúdo scrollável */}
      <div className="flex-1 overflow-auto p-6">
        {children}
      </div>
    </div>
  );
}

export function ResultadoAnalise({
  status,
  conteudo,
  thinking,
  thinkingDuration = 0,
  isStreaming = false,
  onCopy,
  onDownloadDocx,
  onDownloadPdf,
  onExpand,
}: ResultadoAnaliseProps) {
  const hasContent = status === 'completed' || status === 'analyzing';
  const showThinking = thinking && thinking.length > 0;

  // Extrair campos estruturados do conteúdo
  const camposExtraidos = useMemo(() => {
    if (!conteudo) return [];
    return extractCamposFromContent(conteudo);
  }, [conteudo]);

  const showDataFields = hasContent && camposExtraidos.length > 0;

  return (
    <div className="h-full flex flex-col bg-card overflow-hidden">
      {/* Header Principal */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-sm">Resultado da Análise</h3>
          {isStreaming && (
            <span className="inline-flex items-center gap-1.5 text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              Streaming
              {conteudo.length > 0 && (
                <span className="text-primary/70 border-l border-primary/30 pl-1.5">
                  {formatCharCount(conteudo.length)}
                </span>
              )}
            </span>
          )}
        </div>

        {status === 'completed' && (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={onCopy} title="Copiar">
              <Copy className="w-4 h-4" />
              <span className="sr-only">Copiar</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={onDownloadDocx} title="Baixar DOCX">
              <FileIcon className="w-4 h-4" />
              <span className="sr-only">Baixar DOCX</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={onDownloadPdf} title="Baixar PDF">
              <FileDown className="w-4 h-4" />
              <span className="sr-only">Baixar PDF</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={onExpand} title="Expandir">
              <Maximize2 className="w-4 h-4" />
              <span className="sr-only">Expandir</span>
            </Button>
          </div>
        )}
      </div>

      {/* Content - Layout de duas colunas iguais */}
      <div className="flex-1 overflow-hidden bg-gradient-to-b from-background/50 to-background/30 p-6">
        {/* Estados sem conteúdo */}
        {!hasContent && (
          <div className="h-full flex items-center justify-center">
            {status === 'idle' && (
              <div className="text-center text-muted-foreground py-8">
                <FileIcon className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">O resultado da análise aparecerá aqui</p>
              </div>
            )}
            {status === 'error' && (
              <div className="text-center text-destructive">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-destructive/10 flex items-center justify-center">
                  <FileIcon className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium">Erro ao processar documento</p>
                <p className="text-xs mt-1 opacity-70">
                  Tente novamente ou use outro documento
                </p>
              </div>
            )}
          </div>
        )}

        {/* Estado analyzing - sem conteúdo ainda */}
        {status === 'analyzing' && !conteudo && (
          <div className="h-full flex items-center justify-center">
            <LoadingIndicator />
          </div>
        )}

        {/* Grid de duas colunas quando há conteúdo */}
        {hasContent && conteudo && (
          <div className={cn(
            "h-full grid gap-6",
            showDataFields ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
          )}>
            {/* Coluna Esquerda - Texto do Agente */}
            <div className="bg-card shadow-sm border border-border/50 rounded-lg overflow-hidden">
              <DocumentContainer title="Dados Extraídos">
                {/* Thinking indicator (se disponível) */}
                {showThinking && (
                  <div className="mb-4">
                    <ThinkingIndicator
                      content={thinking}
                      isStreaming={isStreaming}
                      duration={thinkingDuration}
                      isVisible={true}
                      autoCollapse={!isStreaming}
                    />
                  </div>
                )}
                <MarkdownRenderer content={filterJsonSection(conteudo)} isStreaming={isStreaming} />
              </DocumentContainer>
            </div>

            {/* Coluna Direita - Formulário de Dados */}
            {showDataFields && (
              <div className="bg-card shadow-sm border border-border/50 rounded-lg overflow-hidden">
                <DocumentContainer title="Formulário de Dados">
                  <CamposDados campos={camposExtraidos} />
                </DocumentContainer>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
