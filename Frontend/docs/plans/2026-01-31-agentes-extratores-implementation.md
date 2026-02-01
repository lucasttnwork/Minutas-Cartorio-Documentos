# Agentes Extratores - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a document extraction agents feature with sidebar navigation, agent dashboard, and individual agent pages with mock AI streaming.

**Architecture:** Hub layout with sidebar for switching between Minutas and Agentes dashboards. Individual agent pages with two-column layout: inputs on left, results on right. Mock streaming simulates AI response for frontend-only implementation.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, Radix UI, Framer Motion, Lucide React, docx (DOCX generation), jspdf (PDF generation)

---

## Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install DOCX and PDF generation libraries**

Run:
```bash
npm install docx jspdf
```

Expected: Dependencies added to package.json

**Step 2: Verify installation**

Run:
```bash
npm run build
```

Expected: Build succeeds without errors

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add docx and jspdf dependencies for document export"
```

---

## Task 2: Create Agent Types

**Files:**
- Create: `src/types/agente.ts`

**Step 1: Create the types file**

```typescript
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
```

**Step 2: Commit**

```bash
git add src/types/agente.ts
git commit -m "feat: add TypeScript types for agentes feature"
```

---

## Task 3: Create Agents Data

**Files:**
- Create: `src/data/agentes.ts`

**Step 1: Create the agents configuration file**

```typescript
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
```

**Step 2: Commit**

```bash
git add src/data/agentes.ts
git commit -m "feat: add agents configuration data"
```

---

## Task 4: Create Mock Streaming Utilities

**Files:**
- Create: `src/utils/mockStreaming.ts`

**Step 1: Create mock streaming utilities**

```typescript
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
```

**Step 2: Commit**

```bash
git add src/utils/mockStreaming.ts
git commit -m "feat: add mock streaming utilities for AI simulation"
```

---

## Task 5: Create Document Export Utilities

**Files:**
- Create: `src/utils/documentExport.ts`

**Step 1: Create document export utilities**

```typescript
// src/utils/documentExport.ts

import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { jsPDF } from 'jspdf';

function parseMarkdownToElements(markdown: string) {
  const lines = markdown.split('\n');
  const elements: Array<{ type: 'h1' | 'h2' | 'h3' | 'p' | 'bold' | 'list'; text: string }> = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('### ')) {
      elements.push({ type: 'h3', text: trimmed.slice(4) });
    } else if (trimmed.startsWith('## ')) {
      elements.push({ type: 'h2', text: trimmed.slice(3) });
    } else if (trimmed.startsWith('# ')) {
      elements.push({ type: 'h1', text: trimmed.slice(2) });
    } else if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      elements.push({ type: 'bold', text: trimmed.slice(2, -2) });
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      elements.push({ type: 'list', text: trimmed.slice(2) });
    } else if (trimmed.match(/^\d+\.\s/)) {
      elements.push({ type: 'list', text: trimmed.replace(/^\d+\.\s/, '') });
    } else {
      // Handle inline bold
      const processed = trimmed.replace(/\*\*([^*]+)\*\*/g, '$1');
      elements.push({ type: 'p', text: processed });
    }
  }

  return elements;
}

export async function exportToDocx(content: string, filename: string): Promise<void> {
  const elements = parseMarkdownToElements(content);

  const children = elements.map(el => {
    switch (el.type) {
      case 'h1':
        return new Paragraph({
          text: el.text,
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        });
      case 'h2':
        return new Paragraph({
          text: el.text,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 150 },
        });
      case 'h3':
        return new Paragraph({
          text: el.text,
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 100 },
        });
      case 'bold':
        return new Paragraph({
          children: [new TextRun({ text: el.text, bold: true })],
          spacing: { before: 100, after: 100 },
        });
      case 'list':
        return new Paragraph({
          children: [new TextRun({ text: `• ${el.text}` })],
          spacing: { before: 50, after: 50 },
        });
      default:
        return new Paragraph({
          children: [new TextRun(el.text)],
          spacing: { before: 100, after: 100 },
        });
    }
  });

  const doc = new Document({
    sections: [{
      properties: {},
      children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, `${filename}.docx`);
}

export function exportToPdf(content: string, filename: string): void {
  const doc = new jsPDF();
  const elements = parseMarkdownToElements(content);

  let y = 20;
  const marginLeft = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxWidth = pageWidth - 40;

  for (const el of elements) {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }

    switch (el.type) {
      case 'h1':
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        y += 5;
        break;
      case 'h2':
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        y += 3;
        break;
      case 'h3':
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        y += 2;
        break;
      case 'bold':
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        break;
      case 'list':
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        break;
      default:
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
    }

    const text = el.type === 'list' ? `• ${el.text}` : el.text;
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, marginLeft, y);
    y += lines.length * 6 + 4;
  }

  doc.save(`${filename}.pdf`);
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}
```

**Step 2: Commit**

```bash
git add src/utils/documentExport.ts
git commit -m "feat: add document export utilities for DOCX and PDF"
```

---

## Task 6: Create Hub Sidebar Component

**Files:**
- Create: `src/components/layout/HubSidebar.tsx`

**Step 1: Create the sidebar component**

```typescript
// src/components/layout/HubSidebar.tsx

import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  {
    to: '/dashboard/minutas',
    label: 'Minutas',
    icon: FileText,
  },
  {
    to: '/dashboard/agentes',
    label: 'Agentes',
    icon: Bot,
  },
];

export function HubSidebar() {
  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="w-64 min-h-screen border-r border-border bg-card/50 p-4"
    >
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-foreground px-3">
          Sistema de Minutas
        </h2>
        <p className="text-xs text-muted-foreground px-3 mt-1">
          Selecione uma opção
        </p>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                'hover:bg-accent/50',
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </motion.aside>
  );
}
```

**Step 2: Export from layout index**

Modify `src/components/layout/index.ts` to add:

```typescript
export { HubSidebar } from "./HubSidebar";
```

**Step 3: Commit**

```bash
git add src/components/layout/HubSidebar.tsx src/components/layout/index.ts
git commit -m "feat: add HubSidebar component for dashboard navigation"
```

---

## Task 7: Create Agent Card Component

**Files:**
- Create: `src/components/agentes/AgenteCard.tsx`

**Step 1: Create the agent card component**

```typescript
// src/components/agentes/AgenteCard.tsx

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { AgenteConfig } from '@/types/agente';

interface AgenteCardProps {
  agente: AgenteConfig;
  index: number;
}

export function AgenteCard({ agente, index }: AgenteCardProps) {
  const navigate = useNavigate();

  // Get icon component dynamically
  const IconComponent = (Icons as Record<string, React.ComponentType<{ className?: string }>>)[agente.icone] || Icons.FileText;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card
        className="cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all duration-200 group h-full"
        onClick={() => navigate(`/agentes/${agente.slug}`)}
      >
        <CardHeader className="pb-3">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
            <IconComponent className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-lg group-hover:text-primary transition-colors">
            {agente.nome}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-sm">
            {agente.descricao}
          </CardDescription>
        </CardContent>
      </Card>
    </motion.div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/agentes/AgenteCard.tsx
git commit -m "feat: add AgenteCard component"
```

---

## Task 8: Create Agent Filter Component

**Files:**
- Create: `src/components/agentes/AgenteFilter.tsx`

**Step 1: Create the filter component**

```typescript
// src/components/agentes/AgenteFilter.tsx

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { categorias } from '@/data/agentes';

interface AgenteFilterProps {
  categoriaAtiva: string;
  onCategoriaChange: (categoria: string) => void;
  busca: string;
  onBuscaChange: (busca: string) => void;
}

export function AgenteFilter({
  categoriaAtiva,
  onCategoriaChange,
  busca,
  onBuscaChange,
}: AgenteFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
      {/* Category Tabs */}
      <div className="flex gap-2 flex-wrap">
        {categorias.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCategoriaChange(cat.id)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              categoriaAtiva === cat.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            )}
          >
            {cat.nome}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar agente..."
          value={busca}
          onChange={(e) => onBuscaChange(e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/agentes/AgenteFilter.tsx
git commit -m "feat: add AgenteFilter component with tabs and search"
```

---

## Task 9: Create Upload Zone Component

**Files:**
- Create: `src/components/agentes/UploadZone.tsx`

**Step 1: Create the upload zone component**

```typescript
// src/components/agentes/UploadZone.tsx

import { useCallback, useState } from 'react';
import { Upload, X, FileText, Image } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ArquivoUpload } from '@/types/agente';

interface UploadZoneProps {
  arquivos: ArquivoUpload[];
  onArquivosChange: (arquivos: ArquivoUpload[]) => void;
  disabled?: boolean;
}

export function UploadZone({ arquivos, onArquivosChange, disabled }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  }, [disabled]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled || !e.target.files) return;
    const files = Array.from(e.target.files);
    addFiles(files);
    e.target.value = '';
  }, [disabled]);

  const addFiles = (files: File[]) => {
    const newArquivos: ArquivoUpload[] = files.map(file => ({
      id: crypto.randomUUID(),
      file,
      nome: file.name,
      tamanho: file.size,
      tipo: file.type,
    }));
    onArquivosChange([...arquivos, ...newArquivos]);
  };

  const removeFile = (id: string) => {
    if (disabled) return;
    onArquivosChange(arquivos.filter(a => a.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (tipo: string) => {
    if (tipo.startsWith('image/')) return Image;
    return FileText;
  };

  return (
    <div className="space-y-3">
      {/* Drop Zone */}
      {!disabled && (
        <label
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50 hover:bg-muted/30'
          )}
        >
          <Upload className={cn(
            'w-8 h-8 mb-2 transition-colors',
            isDragging ? 'text-primary' : 'text-muted-foreground'
          )} />
          <p className="text-sm text-muted-foreground text-center">
            Arraste arquivos ou <span className="text-primary">clique aqui</span>
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            PDF, JPG, PNG, DOCX
          </p>
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.docx"
            onChange={handleFileInput}
            className="hidden"
          />
        </label>
      )}

      {/* File List */}
      <AnimatePresence mode="popLayout">
        {arquivos.map((arquivo) => {
          const FileIcon = getFileIcon(arquivo.tipo);
          return (
            <motion.div
              key={arquivo.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
            >
              <FileIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{arquivo.nome}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(arquivo.tamanho)}
                </p>
              </div>
              {!disabled && (
                <button
                  onClick={() => removeFile(arquivo.id)}
                  className="p-1 hover:bg-destructive/10 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                </button>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/agentes/UploadZone.tsx
git commit -m "feat: add UploadZone component with drag-and-drop"
```

---

## Task 10: Create Resultado Analise Component

**Files:**
- Create: `src/components/agentes/ResultadoAnalise.tsx`

**Step 1: Create the resultado component**

```typescript
// src/components/agentes/ResultadoAnalise.tsx

import { Copy, FileDown, Maximize2, FileText as FileIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { AnaliseStatus } from '@/types/agente';

interface ResultadoAnaliseProps {
  status: AnaliseStatus;
  conteudo: string;
  onCopy: () => void;
  onDownloadDocx: () => void;
  onDownloadPdf: () => void;
  onExpand: () => void;
}

export function ResultadoAnalise({
  status,
  conteudo,
  onCopy,
  onDownloadDocx,
  onDownloadPdf,
  onExpand,
}: ResultadoAnaliseProps) {
  const renderMarkdown = (text: string) => {
    // Simple markdown to HTML conversion for display
    return text
      .split('\n')
      .map((line, i) => {
        const trimmed = line.trim();

        if (trimmed.startsWith('### ')) {
          return <h3 key={i} className="text-base font-semibold mt-4 mb-2">{trimmed.slice(4)}</h3>;
        }
        if (trimmed.startsWith('## ')) {
          return <h2 key={i} className="text-lg font-semibold mt-5 mb-2">{trimmed.slice(3)}</h2>;
        }
        if (trimmed.startsWith('# ')) {
          return <h1 key={i} className="text-xl font-bold mt-6 mb-3">{trimmed.slice(2)}</h1>;
        }
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return <li key={i} className="ml-4 mb-1">{trimmed.slice(2)}</li>;
        }
        if (trimmed.match(/^\d+\.\s/)) {
          return <li key={i} className="ml-4 mb-1 list-decimal">{trimmed.replace(/^\d+\.\s/, '')}</li>;
        }
        if (!trimmed) {
          return <div key={i} className="h-2" />;
        }

        // Handle inline bold
        const parts = trimmed.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p key={i} className="mb-2 leading-relaxed">
            {parts.map((part, j) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={j}>{part.slice(2, -2)}</strong>;
              }
              return part;
            })}
          </p>
        );
      });
  };

  const hasContent = status === 'completed' || status === 'analyzing';

  return (
    <div className="h-full flex flex-col border border-border rounded-lg bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <h3 className="font-medium text-sm">Resultado da Análise</h3>

        {status === 'completed' && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onCopy}
              title="Copiar"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDownloadDocx}
              title="Baixar DOCX"
            >
              <FileIcon className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDownloadPdf}
              title="Baixar PDF"
            >
              <FileDown className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onExpand}
              title="Expandir"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={cn(
        'flex-1 overflow-auto p-6',
        !hasContent && 'flex items-center justify-center'
      )}>
        {status === 'idle' && (
          <div className="text-center text-muted-foreground">
            <FileIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">O resultado da análise aparecerá aqui</p>
          </div>
        )}

        {status === 'analyzing' && (
          <div className="prose prose-sm max-w-none dark:prose-invert font-serif">
            {renderMarkdown(conteudo)}
            <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />
          </div>
        )}

        {status === 'completed' && (
          <div className="prose prose-sm max-w-none dark:prose-invert font-serif">
            {renderMarkdown(conteudo)}
          </div>
        )}

        {status === 'error' && (
          <div className="text-center text-destructive">
            <p className="text-sm">Erro ao processar documento</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/agentes/ResultadoAnalise.tsx
git commit -m "feat: add ResultadoAnalise component with markdown rendering"
```

---

## Task 11: Create Resultado Modal Component

**Files:**
- Create: `src/components/agentes/ResultadoModal.tsx`

**Step 1: Create the modal component**

```typescript
// src/components/agentes/ResultadoModal.tsx

import { Copy, FileDown, X, FileText as FileIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ResultadoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titulo: string;
  conteudo: string;
  onCopy: () => void;
  onDownloadDocx: () => void;
  onDownloadPdf: () => void;
}

export function ResultadoModal({
  open,
  onOpenChange,
  titulo,
  conteudo,
  onCopy,
  onDownloadDocx,
  onDownloadPdf,
}: ResultadoModalProps) {
  const renderMarkdown = (text: string) => {
    return text
      .split('\n')
      .map((line, i) => {
        const trimmed = line.trim();

        if (trimmed.startsWith('### ')) {
          return <h3 key={i} className="text-base font-semibold mt-4 mb-2">{trimmed.slice(4)}</h3>;
        }
        if (trimmed.startsWith('## ')) {
          return <h2 key={i} className="text-lg font-semibold mt-5 mb-2">{trimmed.slice(3)}</h2>;
        }
        if (trimmed.startsWith('# ')) {
          return <h1 key={i} className="text-xl font-bold mt-6 mb-3">{trimmed.slice(2)}</h1>;
        }
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return <li key={i} className="ml-4 mb-1">{trimmed.slice(2)}</li>;
        }
        if (trimmed.match(/^\d+\.\s/)) {
          return <li key={i} className="ml-4 mb-1 list-decimal">{trimmed.replace(/^\d+\.\s/, '')}</li>;
        }
        if (!trimmed) {
          return <div key={i} className="h-2" />;
        }

        const parts = trimmed.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p key={i} className="mb-2 leading-relaxed">
            {parts.map((part, j) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={j}>{part.slice(2, -2)}</strong>;
              }
              return part;
            })}
          </p>
        );
      });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between pr-8">
            <DialogTitle>{titulo}</DialogTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onCopy}
                title="Copiar"
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDownloadDocx}
                title="Baixar DOCX"
              >
                <FileIcon className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDownloadPdf}
                title="Baixar PDF"
              >
                <FileDown className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-6 border border-border rounded-lg bg-muted/20">
          <div className="prose prose-sm max-w-none dark:prose-invert font-serif">
            {renderMarkdown(conteudo)}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/agentes/ResultadoModal.tsx
git commit -m "feat: add ResultadoModal component for fullscreen view"
```

---

## Task 12: Create Agentes Components Index

**Files:**
- Create: `src/components/agentes/index.ts`

**Step 1: Create the index file**

```typescript
// src/components/agentes/index.ts

export { AgenteCard } from './AgenteCard';
export { AgenteFilter } from './AgenteFilter';
export { UploadZone } from './UploadZone';
export { ResultadoAnalise } from './ResultadoAnalise';
export { ResultadoModal } from './ResultadoModal';
```

**Step 2: Commit**

```bash
git add src/components/agentes/index.ts
git commit -m "feat: add agentes components index"
```

---

## Task 13: Create Dashboard Hub Page

**Files:**
- Create: `src/pages/DashboardHub.tsx`

**Step 1: Create the hub page**

```typescript
// src/pages/DashboardHub.tsx

import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { HubSidebar } from '@/components/layout';

export default function DashboardHub() {
  const location = useLocation();

  // Redirect /dashboard to /dashboard/minutas
  if (location.pathname === '/dashboard') {
    return <Navigate to="/dashboard/minutas" replace />;
  }

  return (
    <div className="flex min-h-screen">
      <HubSidebar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/pages/DashboardHub.tsx
git commit -m "feat: add DashboardHub page with sidebar layout"
```

---

## Task 14: Create Dashboard Minutas Page

**Files:**
- Create: `src/pages/DashboardMinutas.tsx`

**Step 1: Create the minutas dashboard (refactored from Dashboard.tsx)**

```typescript
// src/pages/DashboardMinutas.tsx

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMinuta } from "@/contexts/MinutaContext";
import { Plus, FileText, Clock, CheckCircle2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function DashboardMinutas() {
  const navigate = useNavigate();
  const { minutas, createMinuta, loadMinuta, deleteMinuta } = useMinuta();

  const handleNewMinuta = () => {
    createMinuta();
    navigate('/minuta/nova');
  };

  const handleOpenMinuta = (id: string, status: string, currentStep: string) => {
    loadMinuta(id);

    if (status === 'concluida') {
      navigate(`/minuta/${id}/minuta`);
    } else {
      const stepRoutes: Record<string, string> = {
        upload: '/minuta/nova',
        processando: `/minuta/${id}/processando`,
        outorgantes: `/minuta/${id}/outorgantes`,
        outorgados: `/minuta/${id}/outorgados`,
        imoveis: `/minuta/${id}/imoveis`,
        parecer: `/minuta/${id}/parecer`,
        negocio: `/minuta/${id}/negocio`,
        minuta: `/minuta/${id}/minuta`,
      };
      navigate(stepRoutes[currentStep] || '/minuta/nova');
    }
  };

  const handleDeleteMinuta = (e: React.MouseEvent, id: string, titulo: string) => {
    e.stopPropagation();
    toast.warning(`Excluir "${titulo}"?`, {
      description: 'Esta ação não pode ser desfeita.',
      action: {
        label: 'Excluir',
        onClick: () => {
          deleteMinuta(id);
          toast.success('Minuta excluída com sucesso');
        },
      },
      cancel: {
        label: 'Cancelar',
        onClick: () => {},
      },
      duration: 10000,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="p-6 md:p-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl"
      >
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Criação de Minutas
          </h1>
          <p className="text-muted-foreground">
            Conferência e Complementação de Documentos
          </p>
        </header>

        {/* New Minuta Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <Button
            size="lg"
            onClick={handleNewMinuta}
            className="flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nova Minuta
          </Button>
        </motion.div>

        {/* Minutas List */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Suas Minutas
          </h2>

          {minutas.length === 0 ? (
            <Card className="bg-card/50 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground text-center">
                  Nenhuma minuta criada ainda.
                </p>
                <p className="text-sm text-muted-foreground/70 text-center mt-1">
                  Clique em "Nova Minuta" para começar.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {minutas.map((minuta, index) => (
                <motion.div
                  key={minuta.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <Card
                    className="bg-card border-2 border-border hover:border-accent transition-colors cursor-pointer group"
                    onClick={() => handleOpenMinuta(minuta.id, minuta.status, minuta.currentStep)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-2 rounded-lg",
                            minuta.status === 'concluida'
                              ? "bg-green-500/10 text-green-500"
                              : "bg-yellow-500/10 text-yellow-500"
                          )}>
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <CardTitle className="text-foreground group-hover:text-primary transition-colors text-lg">
                              {minuta.titulo}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                              <Clock className="w-3 h-3" />
                              Criada em {formatDate(minuta.dataCriacao)}
                            </CardDescription>
                          </div>
                        </div>
                        <button
                          onClick={(e) => handleDeleteMinuta(e, minuta.id, minuta.titulo)}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        {minuta.status === 'concluida' ? (
                          <span className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-green-500 bg-green-500/10 rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            Concluída
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-yellow-500 bg-yellow-500/10 rounded-full">
                            <Clock className="w-3 h-3" />
                            Rascunho
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/pages/DashboardMinutas.tsx
git commit -m "feat: add DashboardMinutas page (refactored from Dashboard)"
```

---

## Task 15: Create Dashboard Agentes Page

**Files:**
- Create: `src/pages/DashboardAgentes.tsx`

**Step 1: Create the agentes dashboard**

```typescript
// src/pages/DashboardAgentes.tsx

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { AgenteCard, AgenteFilter } from '@/components/agentes';
import { agentes, getAgentesByCategoria } from '@/data/agentes';

export default function DashboardAgentes() {
  const [categoriaAtiva, setCategoriaAtiva] = useState('todos');
  const [busca, setBusca] = useState('');

  const agentesFiltrados = useMemo(() => {
    let resultado = getAgentesByCategoria(categoriaAtiva);

    if (busca.trim()) {
      const termo = busca.toLowerCase();
      resultado = resultado.filter(
        a => a.nome.toLowerCase().includes(termo) ||
             a.descricao.toLowerCase().includes(termo)
      );
    }

    return resultado;
  }, [categoriaAtiva, busca]);

  return (
    <div className="p-6 md:p-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl"
      >
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Agentes Auxiliares
          </h1>
          <p className="text-muted-foreground">
            Selecione um agente para extrair dados de documentos
          </p>
        </header>

        {/* Filters */}
        <AgenteFilter
          categoriaAtiva={categoriaAtiva}
          onCategoriaChange={setCategoriaAtiva}
          busca={busca}
          onBuscaChange={setBusca}
        />

        {/* Agents Grid */}
        {agentesFiltrados.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 text-muted-foreground"
          >
            <p>Nenhum agente encontrado para "{busca}"</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {agentesFiltrados.map((agente, index) => (
              <AgenteCard
                key={agente.id}
                agente={agente}
                index={index}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/pages/DashboardAgentes.tsx
git commit -m "feat: add DashboardAgentes page with agent cards grid"
```

---

## Task 16: Create Agente Extrator Page

**Files:**
- Create: `src/pages/AgenteExtrator.tsx`

**Step 1: Create the individual agent page**

```typescript
// src/pages/AgenteExtrator.tsx

import { useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Square, RefreshCw, FilePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { UploadZone, ResultadoAnalise, ResultadoModal } from '@/components/agentes';
import { getAgenteBySlug } from '@/data/agentes';
import { getMockResponse, simulateStreaming, createAbortableStream } from '@/utils/mockStreaming';
import { exportToDocx, exportToPdf, copyToClipboard } from '@/utils/documentExport';
import { toast } from 'sonner';
import type { ArquivoUpload, AnaliseStatus } from '@/types/agente';

export default function AgenteExtrator() {
  const { tipo } = useParams<{ tipo: string }>();
  const navigate = useNavigate();

  const agente = getAgenteBySlug(tipo || '');

  const [arquivos, setArquivos] = useState<ArquivoUpload[]>([]);
  const [instrucoes, setInstrucoes] = useState('');
  const [status, setStatus] = useState<AnaliseStatus>('idle');
  const [resultado, setResultado] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const abortRef = useRef<ReturnType<typeof createAbortableStream> | null>(null);

  if (!agente) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Agente não encontrado</p>
      </div>
    );
  }

  const canAnalyze = arquivos.length > 0 && status !== 'analyzing';
  const isAnalyzing = status === 'analyzing';
  const isCompleted = status === 'completed';

  const handleAnalyze = useCallback(async () => {
    if (!canAnalyze) return;

    setStatus('analyzing');
    setResultado('');

    const stream = createAbortableStream();
    abortRef.current = stream;

    const mockText = getMockResponse(agente.slug);

    await simulateStreaming(
      mockText,
      (chunk) => {
        if (!stream.isAborted()) {
          setResultado(prev => prev + chunk);
        }
      },
      () => {
        if (!stream.isAborted()) {
          setStatus('completed');
        }
      },
      30
    );
  }, [canAnalyze, agente.slug]);

  const handleStop = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      setStatus('completed');
    }
  }, []);

  const handleRegenerate = useCallback(() => {
    handleAnalyze();
  }, [handleAnalyze]);

  const handleNewDocument = useCallback(() => {
    setArquivos([]);
    setInstrucoes('');
    setStatus('idle');
    setResultado('');
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await copyToClipboard(resultado);
      toast.success('Copiado para a área de transferência');
    } catch {
      toast.error('Erro ao copiar');
    }
  }, [resultado]);

  const handleDownloadDocx = useCallback(async () => {
    try {
      await exportToDocx(resultado, `${agente.slug}-extracao`);
      toast.success('DOCX baixado com sucesso');
    } catch {
      toast.error('Erro ao gerar DOCX');
    }
  }, [resultado, agente.slug]);

  const handleDownloadPdf = useCallback(() => {
    try {
      exportToPdf(resultado, `${agente.slug}-extracao`);
      toast.success('PDF baixado com sucesso');
    } catch {
      toast.error('Erro ao gerar PDF');
    }
  }, [resultado, agente.slug]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 px-6 py-4">
        <div className="flex items-center gap-4 mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard/agentes')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
        </div>
        <Breadcrumbs
          items={[
            { label: 'Agentes', href: '/dashboard/agentes' },
            { label: agente.nome },
          ]}
        />
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Column - Inputs */}
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="w-96 border-r border-border p-6 overflow-auto flex flex-col"
        >
          {/* Agent Info */}
          <div className="mb-6">
            <h1 className="text-xl font-bold text-foreground mb-1">
              {agente.nome}
            </h1>
            <p className="text-sm text-muted-foreground">
              {agente.descricao}
            </p>
          </div>

          {/* Upload Zone */}
          <div className="mb-6">
            <label className="text-sm font-medium mb-2 block">
              Documentos
            </label>
            <UploadZone
              arquivos={arquivos}
              onArquivosChange={setArquivos}
              disabled={isAnalyzing || isCompleted}
            />
          </div>

          {/* Instructions */}
          <div className="mb-6 flex-1">
            <label className="text-sm font-medium mb-2 block">
              Instruções extras (opcional)
            </label>
            <Textarea
              value={instrucoes}
              onChange={(e) => setInstrucoes(e.target.value)}
              placeholder="Adicione instruções específicas para a extração..."
              className="min-h-[100px] resize-none"
            />
          </div>

          {/* Actions */}
          <div className="space-y-2">
            {status === 'idle' && (
              <Button
                onClick={handleAnalyze}
                disabled={!canAnalyze}
                className="w-full"
                size="lg"
              >
                Analisar
              </Button>
            )}

            {isAnalyzing && (
              <Button
                onClick={handleStop}
                variant="destructive"
                className="w-full"
                size="lg"
              >
                <Square className="w-4 h-4 mr-2" />
                Parar
              </Button>
            )}

            {isCompleted && (
              <>
                <Button
                  onClick={handleRegenerate}
                  className="w-full"
                  size="lg"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Gerar Novamente
                </Button>
                <Button
                  onClick={handleNewDocument}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <FilePlus className="w-4 h-4 mr-2" />
                  Novo Documento
                </Button>
              </>
            )}
          </div>
        </motion.aside>

        {/* Right Column - Result */}
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex-1 p-6"
        >
          <ResultadoAnalise
            status={status}
            conteudo={resultado}
            onCopy={handleCopy}
            onDownloadDocx={handleDownloadDocx}
            onDownloadPdf={handleDownloadPdf}
            onExpand={() => setModalOpen(true)}
          />
        </motion.main>
      </div>

      {/* Fullscreen Modal */}
      <ResultadoModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        titulo={agente.nome}
        conteudo={resultado}
        onCopy={handleCopy}
        onDownloadDocx={handleDownloadDocx}
        onDownloadPdf={handleDownloadPdf}
      />
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/pages/AgenteExtrator.tsx
git commit -m "feat: add AgenteExtrator page with analysis flow"
```

---

## Task 17: Update Routes in App.tsx

**Files:**
- Modify: `src/App.tsx`

**Step 1: Update the routes**

Replace the entire content of `src/App.tsx` with:

```typescript
// src/App.tsx
import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { MinutaProvider } from "./contexts/MinutaContext";
import { Toaster } from "./components/ui/sonner";
import { GlobalNavigation, ErrorBoundary } from "./components/layout";

// Lazy load all pages for code splitting
const DashboardHub = lazy(() => import("./pages/DashboardHub"));
const DashboardMinutas = lazy(() => import("./pages/DashboardMinutas"));
const DashboardAgentes = lazy(() => import("./pages/DashboardAgentes"));
const AgenteExtrator = lazy(() => import("./pages/AgenteExtrator"));
const UploadDocumentos = lazy(() => import("./pages/UploadDocumentos"));
const Processando = lazy(() => import("./pages/Processando"));
const ConferenciaOutorgantes = lazy(() => import("./pages/ConferenciaOutorgantes"));
const ConferenciaOutorgados = lazy(() => import("./pages/ConferenciaOutorgados"));
const ConferenciaImoveis = lazy(() => import("./pages/ConferenciaImoveis"));
const ParecerJuridico = lazy(() => import("./pages/ParecerJuridico"));
const ConferenciaNegocio = lazy(() => import("./pages/ConferenciaNegocio"));
const MinutaFinal = lazy(() => import("./pages/MinutaFinal"));

// Loading spinner for Suspense fallback
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground text-sm">Carregando...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <MinutaProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <GlobalNavigation />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Root redirect to dashboard */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* Dashboard Hub with nested routes */}
                <Route path="/dashboard" element={<DashboardHub />}>
                  <Route index element={<Navigate to="/dashboard/minutas" replace />} />
                  <Route path="minutas" element={<DashboardMinutas />} />
                  <Route path="agentes" element={<DashboardAgentes />} />
                </Route>

                {/* Agentes individual pages */}
                <Route path="/agentes/:tipo" element={<AgenteExtrator />} />

                {/* Minuta Flow */}
                <Route path="/minuta/nova" element={<UploadDocumentos />} />
                <Route path="/minuta/:id/processando" element={<Processando />} />
                <Route path="/minuta/:id/outorgantes" element={<ConferenciaOutorgantes />} />
                <Route path="/minuta/:id/outorgados" element={<ConferenciaOutorgados />} />
                <Route path="/minuta/:id/imoveis" element={<ConferenciaImoveis />} />
                <Route path="/minuta/:id/parecer" element={<ParecerJuridico />} />
                <Route path="/minuta/:id/negocio" element={<ConferenciaNegocio />} />
                <Route path="/minuta/:id/minuta" element={<MinutaFinal />} />
              </Routes>
            </Suspense>
            <Toaster position="top-right" richColors closeButton />
          </div>
        </Router>
      </MinutaProvider>
    </ErrorBoundary>
  );
}

export default App;
```

**Step 2: Commit**

```bash
git add src/App.tsx
git commit -m "feat: update routes for hub navigation and agentes pages"
```

---

## Task 18: Delete Old Dashboard.tsx

**Files:**
- Delete: `src/pages/Dashboard.tsx`

**Step 1: Remove the old dashboard file**

Run:
```bash
rm src/pages/Dashboard.tsx
```

**Step 2: Commit**

```bash
git add -A
git commit -m "chore: remove old Dashboard.tsx (replaced by DashboardMinutas)"
```

---

## Task 19: Build and Verify

**Step 1: Run build**

Run:
```bash
npm run build
```

Expected: Build succeeds without errors

**Step 2: Run lint**

Run:
```bash
npm run lint
```

Expected: No lint errors

**Step 3: Test locally**

Run:
```bash
npm run dev
```

Verify:
1. Navigate to http://localhost:5173
2. Should redirect to /dashboard/minutas
3. Sidebar visible with "Minutas" and "Agentes" options
4. Click "Agentes" - should show agent cards
5. Click an agent card - should open agent page
6. Upload a file and click "Analisar" - should show streaming result
7. Test copy, download DOCX, download PDF, expand modal

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete agentes extratores feature (frontend)"
```

---

## Summary

This plan creates the complete frontend for the Agentes Extratores feature:

1. **Types & Data** - Agent configuration with 11 predefined agents
2. **Utilities** - Mock streaming simulation and document export (DOCX/PDF)
3. **Components** - HubSidebar, AgenteCard, AgenteFilter, UploadZone, ResultadoAnalise, ResultadoModal
4. **Pages** - DashboardHub, DashboardMinutas, DashboardAgentes, AgenteExtrator
5. **Routing** - Updated App.tsx with nested routes for hub navigation

Total: 19 tasks, ~18 commits
