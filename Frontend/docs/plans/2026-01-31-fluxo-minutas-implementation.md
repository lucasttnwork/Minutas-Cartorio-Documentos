# Fluxo de Minutas - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement the complete minutas workflow with 9 pages: Dashboard, Upload (5 sections), Processing, Outorgantes, Outorgados, Imoveis, Parecer Juridico, Negocio Juridico, and Minuta Final editor.

**Architecture:** React 19 + TypeScript + Vite. Context API for global minuta state. LocalStorage for persistence. Existing shadcn/ui components. New routes with react-router-dom. Collapsible cards for multiple entities.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS 4, Framer Motion, React Router DOM 7, React Hook Form, Zod, TipTap (rich-text editor)

**Design Doc:** `docs/plans/2026-01-30-fluxo-minutas-design.md`

---

## Phase 1: Foundation (Types, Context, Routes)

### Task 1.1: Create TypeScript Types

**Files:**
- Create: `src/types/minuta.ts`

**Step 1: Create the types file**

```typescript
// src/types/minuta.ts

// === Pessoa Natural ===
export interface PessoaNatural {
  id: string;
  nome: string;
  cpf: string;
  rg: string;
  orgaoEmissorRg: string;
  estadoEmissorRg: string;
  dataEmissaoRg: string;
  nacionalidade: string;
  profissao: string;
  dataNascimento: string;
  estadoCivil: string;
  regimeBens: string;
  domicilio: Endereco;
  contato: Contato;
  // Track AI vs user edits
  camposEditados: string[];
}

// === Pessoa Juridica ===
export interface PessoaJuridica {
  id: string;
  razaoSocial: string;
  cnpj: string;
  inscricaoEstadual: string;
  dataConstituicao: string;
  endereco: Endereco;
  contato: Contato;
  representantes: RepresentanteLegal[];
  camposEditados: string[];
}

export interface RepresentanteLegal {
  id: string;
  nome: string;
  cpf: string;
  cargo: string;
}

// === Imovel ===
export interface Imovel {
  id: string;
  matricula: MatriculaImobiliaria;
  descricao: DescricaoImovel;
  cadastro: CadastroImobiliario;
  valoresVenais: ValoresVenais;
  negativaIPTU: NegativaIPTU;
  certidaoMatricula: CertidaoMatricula;
  proprietarios: Proprietario[];
  onus: OnusRegistrado[];
  ressalvas: RessalvasMatricula;
  camposEditados: string[];
}

export interface MatriculaImobiliaria {
  numeroMatricula: string;
  numeroRegistroImoveis: string;
  cidadeRegistroImoveis: string;
  estadoRegistroImoveis: string;
  numeroNacionalMatricula: string;
}

export interface DescricaoImovel {
  denominacao: string;
  areaTotalM2: string;
  areaPrivativaM2: string;
  areaConstruida: string;
  endereco: Endereco;
  descricaoConformeMatricula: string;
}

export interface CadastroImobiliario {
  cadastroMunicipalSQL: string;
  dataExpedicaoCertidao: string;
}

export interface ValoresVenais {
  valorVenalIPTU: string;
  valorVenalReferenciaITBI: string;
}

export interface NegativaIPTU {
  numeroCertidao: string;
  dataExpedicao: string;
  certidaoValida: string;
}

export interface CertidaoMatricula {
  certidaoMatricula: string;
  dataExpedicao: string;
  certidaoValida: string;
}

export interface Proprietario {
  id: string;
  nome: string;
  fracaoIdeal: string;
  registroAquisicao: string;
  dataRegistroAquisicao: string;
  tituloAquisicao: string;
}

export interface OnusRegistrado {
  id: string;
  tituloOnus: string;
  registroOnus: string;
  dataRegistroOnus: string;
  descricaoConformeMatricula: string;
  titulares: TitularOnus[];
}

export interface TitularOnus {
  id: string;
  nome: string;
  fracaoIdeal: string;
}

export interface RessalvasMatricula {
  existeRessalva: string;
  descricaoRessalva: string;
}

// === Parecer Juridico ===
export interface ParecerJuridico {
  relatorioMatricula: string;
  matriculaApta: boolean | null;
  pontosAtencao: string;
}

// === Negocio Juridico ===
export interface NegocioJuridico {
  id: string;
  imovelId: string;
  tipoAto: string;
  valorNegocio: string;
  formaPagamento: string;
  condicoesEspeciais: string;
  clausulasAdicionais: string;
  camposEditados: string[];
}

// === Shared ===
export interface Endereco {
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

export interface Contato {
  email: string;
  telefone: string;
}

// === Upload ===
export interface UploadedDocument {
  id: string;
  file: File;
  category: 'outorgantes' | 'outorgados' | 'imoveis' | 'negocio' | 'outros';
  status: 'uploading' | 'complete' | 'error';
  progress: number;
  errorMessage?: string;
}

// === Minuta Principal ===
export type MinutaStatus = 'rascunho' | 'concluida';

export type MinutaStep =
  | 'upload'
  | 'processando'
  | 'outorgantes'
  | 'outorgados'
  | 'imoveis'
  | 'parecer'
  | 'negocio'
  | 'minuta';

export interface Minuta {
  id: string;
  titulo: string;
  dataCriacao: string;
  dataAtualizacao: string;
  status: MinutaStatus;
  currentStep: MinutaStep;

  // Uploaded documents
  documentos: UploadedDocument[];

  // Extracted/edited data
  outorgantes: {
    pessoasNaturais: PessoaNatural[];
    pessoasJuridicas: PessoaJuridica[];
  };
  outorgados: {
    pessoasNaturais: PessoaNatural[];
    pessoasJuridicas: PessoaJuridica[];
  };
  imoveis: Imovel[];
  parecer: ParecerJuridico;
  negociosJuridicos: NegocioJuridico[];

  // Final document
  minutaTexto: string;
}
```

**Step 2: Verify file was created**

Run: `ls Frontend/src/types/`
Expected: `minuta.ts`

**Step 3: Commit**

```bash
git add Frontend/src/types/minuta.ts
git commit -m "feat: add TypeScript types for minuta workflow"
```

---

### Task 1.2: Create Minuta Context

**Files:**
- Create: `src/contexts/MinutaContext.tsx`

**Step 1: Create the context file**

```typescript
// src/contexts/MinutaContext.tsx
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Minuta, MinutaStatus, MinutaStep, UploadedDocument, PessoaNatural, PessoaJuridica, Imovel, NegocioJuridico } from '@/types/minuta';

interface MinutaContextType {
  // List of all minutas
  minutas: Minuta[];

  // Current active minuta
  currentMinuta: Minuta | null;

  // Actions
  createMinuta: () => string;
  loadMinuta: (id: string) => void;
  updateMinuta: (updates: Partial<Minuta>) => void;
  deleteMinuta: (id: string) => void;

  // Step navigation
  setCurrentStep: (step: MinutaStep) => void;

  // Document upload
  addDocument: (doc: UploadedDocument) => void;
  removeDocument: (docId: string) => void;

  // Outorgantes
  addPessoaNaturalOutorgante: (pessoa: PessoaNatural) => void;
  updatePessoaNaturalOutorgante: (id: string, updates: Partial<PessoaNatural>) => void;
  removePessoaNaturalOutorgante: (id: string) => void;
  addPessoaJuridicaOutorgante: (pessoa: PessoaJuridica) => void;
  updatePessoaJuridicaOutorgante: (id: string, updates: Partial<PessoaJuridica>) => void;
  removePessoaJuridicaOutorgante: (id: string) => void;

  // Outorgados
  addPessoaNaturalOutorgado: (pessoa: PessoaNatural) => void;
  updatePessoaNaturalOutorgado: (id: string, updates: Partial<PessoaNatural>) => void;
  removePessoaNaturalOutorgado: (id: string) => void;
  addPessoaJuridicaOutorgado: (pessoa: PessoaJuridica) => void;
  updatePessoaJuridicaOutorgado: (id: string, updates: Partial<PessoaJuridica>) => void;
  removePessoaJuridicaOutorgado: (id: string) => void;

  // Imoveis
  addImovel: (imovel: Imovel) => void;
  updateImovel: (id: string, updates: Partial<Imovel>) => void;
  removeImovel: (id: string) => void;

  // Negocios
  updateNegocioJuridico: (id: string, updates: Partial<NegocioJuridico>) => void;

  // Minuta final
  updateMinutaTexto: (texto: string) => void;
  finalizarMinuta: () => void;

  // Auto-save status
  isSaving: boolean;
}

const MinutaContext = createContext<MinutaContextType | null>(null);

const STORAGE_KEY = 'minutas-cartorio';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function createEmptyMinuta(): Minuta {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    titulo: `Minuta ${new Date().toLocaleDateString('pt-BR')}`,
    dataCriacao: now,
    dataAtualizacao: now,
    status: 'rascunho',
    currentStep: 'upload',
    documentos: [],
    outorgantes: { pessoasNaturais: [], pessoasJuridicas: [] },
    outorgados: { pessoasNaturais: [], pessoasJuridicas: [] },
    imoveis: [],
    parecer: { relatorioMatricula: '', matriculaApta: null, pontosAtencao: '' },
    negociosJuridicos: [],
    minutaTexto: '',
  };
}

export function MinutaProvider({ children }: { children: ReactNode }) {
  const [minutas, setMinutas] = useState<Minuta[]>([]);
  const [currentMinutaId, setCurrentMinutaId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setMinutas(parsed);
      } catch (e) {
        console.error('Failed to parse stored minutas:', e);
      }
    }
  }, []);

  // Save to localStorage whenever minutas change
  useEffect(() => {
    if (minutas.length > 0) {
      setIsSaving(true);
      const timeout = setTimeout(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(minutas));
        setIsSaving(false);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [minutas]);

  const currentMinuta = minutas.find(m => m.id === currentMinutaId) || null;

  const updateMinutaInList = useCallback((id: string, updates: Partial<Minuta>) => {
    setMinutas(prev => prev.map(m =>
      m.id === id
        ? { ...m, ...updates, dataAtualizacao: new Date().toISOString() }
        : m
    ));
  }, []);

  const createMinuta = useCallback(() => {
    const newMinuta = createEmptyMinuta();
    setMinutas(prev => [newMinuta, ...prev]);
    setCurrentMinutaId(newMinuta.id);
    return newMinuta.id;
  }, []);

  const loadMinuta = useCallback((id: string) => {
    setCurrentMinutaId(id);
  }, []);

  const updateMinuta = useCallback((updates: Partial<Minuta>) => {
    if (currentMinutaId) {
      updateMinutaInList(currentMinutaId, updates);
    }
  }, [currentMinutaId, updateMinutaInList]);

  const deleteMinuta = useCallback((id: string) => {
    setMinutas(prev => prev.filter(m => m.id !== id));
    if (currentMinutaId === id) {
      setCurrentMinutaId(null);
    }
  }, [currentMinutaId]);

  const setCurrentStep = useCallback((step: MinutaStep) => {
    if (currentMinutaId) {
      updateMinutaInList(currentMinutaId, { currentStep: step });
    }
  }, [currentMinutaId, updateMinutaInList]);

  // Document actions
  const addDocument = useCallback((doc: UploadedDocument) => {
    if (currentMinuta) {
      updateMinutaInList(currentMinutaId!, {
        documentos: [...currentMinuta.documentos, doc],
      });
    }
  }, [currentMinuta, currentMinutaId, updateMinutaInList]);

  const removeDocument = useCallback((docId: string) => {
    if (currentMinuta) {
      updateMinutaInList(currentMinutaId!, {
        documentos: currentMinuta.documentos.filter(d => d.id !== docId),
      });
    }
  }, [currentMinuta, currentMinutaId, updateMinutaInList]);

  // Outorgantes - Pessoa Natural
  const addPessoaNaturalOutorgante = useCallback((pessoa: PessoaNatural) => {
    if (currentMinuta) {
      updateMinutaInList(currentMinutaId!, {
        outorgantes: {
          ...currentMinuta.outorgantes,
          pessoasNaturais: [...currentMinuta.outorgantes.pessoasNaturais, pessoa],
        },
      });
    }
  }, [currentMinuta, currentMinutaId, updateMinutaInList]);

  const updatePessoaNaturalOutorgante = useCallback((id: string, updates: Partial<PessoaNatural>) => {
    if (currentMinuta) {
      updateMinutaInList(currentMinutaId!, {
        outorgantes: {
          ...currentMinuta.outorgantes,
          pessoasNaturais: currentMinuta.outorgantes.pessoasNaturais.map(p =>
            p.id === id ? { ...p, ...updates } : p
          ),
        },
      });
    }
  }, [currentMinuta, currentMinutaId, updateMinutaInList]);

  const removePessoaNaturalOutorgante = useCallback((id: string) => {
    if (currentMinuta) {
      updateMinutaInList(currentMinutaId!, {
        outorgantes: {
          ...currentMinuta.outorgantes,
          pessoasNaturais: currentMinuta.outorgantes.pessoasNaturais.filter(p => p.id !== id),
        },
      });
    }
  }, [currentMinuta, currentMinutaId, updateMinutaInList]);

  // Outorgantes - Pessoa Juridica
  const addPessoaJuridicaOutorgante = useCallback((pessoa: PessoaJuridica) => {
    if (currentMinuta) {
      updateMinutaInList(currentMinutaId!, {
        outorgantes: {
          ...currentMinuta.outorgantes,
          pessoasJuridicas: [...currentMinuta.outorgantes.pessoasJuridicas, pessoa],
        },
      });
    }
  }, [currentMinuta, currentMinutaId, updateMinutaInList]);

  const updatePessoaJuridicaOutorgante = useCallback((id: string, updates: Partial<PessoaJuridica>) => {
    if (currentMinuta) {
      updateMinutaInList(currentMinutaId!, {
        outorgantes: {
          ...currentMinuta.outorgantes,
          pessoasJuridicas: currentMinuta.outorgantes.pessoasJuridicas.map(p =>
            p.id === id ? { ...p, ...updates } : p
          ),
        },
      });
    }
  }, [currentMinuta, currentMinutaId, updateMinutaInList]);

  const removePessoaJuridicaOutorgante = useCallback((id: string) => {
    if (currentMinuta) {
      updateMinutaInList(currentMinutaId!, {
        outorgantes: {
          ...currentMinuta.outorgantes,
          pessoasJuridicas: currentMinuta.outorgantes.pessoasJuridicas.filter(p => p.id !== id),
        },
      });
    }
  }, [currentMinuta, currentMinutaId, updateMinutaInList]);

  // Outorgados - Pessoa Natural
  const addPessoaNaturalOutorgado = useCallback((pessoa: PessoaNatural) => {
    if (currentMinuta) {
      updateMinutaInList(currentMinutaId!, {
        outorgados: {
          ...currentMinuta.outorgados,
          pessoasNaturais: [...currentMinuta.outorgados.pessoasNaturais, pessoa],
        },
      });
    }
  }, [currentMinuta, currentMinutaId, updateMinutaInList]);

  const updatePessoaNaturalOutorgado = useCallback((id: string, updates: Partial<PessoaNatural>) => {
    if (currentMinuta) {
      updateMinutaInList(currentMinutaId!, {
        outorgados: {
          ...currentMinuta.outorgados,
          pessoasNaturais: currentMinuta.outorgados.pessoasNaturais.map(p =>
            p.id === id ? { ...p, ...updates } : p
          ),
        },
      });
    }
  }, [currentMinuta, currentMinutaId, updateMinutaInList]);

  const removePessoaNaturalOutorgado = useCallback((id: string) => {
    if (currentMinuta) {
      updateMinutaInList(currentMinutaId!, {
        outorgados: {
          ...currentMinuta.outorgados,
          pessoasNaturais: currentMinuta.outorgados.pessoasNaturais.filter(p => p.id !== id),
        },
      });
    }
  }, [currentMinuta, currentMinutaId, updateMinutaInList]);

  // Outorgados - Pessoa Juridica
  const addPessoaJuridicaOutorgado = useCallback((pessoa: PessoaJuridica) => {
    if (currentMinuta) {
      updateMinutaInList(currentMinutaId!, {
        outorgados: {
          ...currentMinuta.outorgados,
          pessoasJuridicas: [...currentMinuta.outorgados.pessoasJuridicas, pessoa],
        },
      });
    }
  }, [currentMinuta, currentMinutaId, updateMinutaInList]);

  const updatePessoaJuridicaOutorgado = useCallback((id: string, updates: Partial<PessoaJuridica>) => {
    if (currentMinuta) {
      updateMinutaInList(currentMinutaId!, {
        outorgados: {
          ...currentMinuta.outorgados,
          pessoasJuridicas: currentMinuta.outorgados.pessoasJuridicas.map(p =>
            p.id === id ? { ...p, ...updates } : p
          ),
        },
      });
    }
  }, [currentMinuta, currentMinutaId, updateMinutaInList]);

  const removePessoaJuridicaOutorgado = useCallback((id: string) => {
    if (currentMinuta) {
      updateMinutaInList(currentMinutaId!, {
        outorgados: {
          ...currentMinuta.outorgados,
          pessoasJuridicas: currentMinuta.outorgados.pessoasJuridicas.filter(p => p.id !== id),
        },
      });
    }
  }, [currentMinuta, currentMinutaId, updateMinutaInList]);

  // Imoveis
  const addImovel = useCallback((imovel: Imovel) => {
    if (currentMinuta) {
      updateMinutaInList(currentMinutaId!, {
        imoveis: [...currentMinuta.imoveis, imovel],
      });
    }
  }, [currentMinuta, currentMinutaId, updateMinutaInList]);

  const updateImovel = useCallback((id: string, updates: Partial<Imovel>) => {
    if (currentMinuta) {
      updateMinutaInList(currentMinutaId!, {
        imoveis: currentMinuta.imoveis.map(i => i.id === id ? { ...i, ...updates } : i),
      });
    }
  }, [currentMinuta, currentMinutaId, updateMinutaInList]);

  const removeImovel = useCallback((id: string) => {
    if (currentMinuta) {
      updateMinutaInList(currentMinutaId!, {
        imoveis: currentMinuta.imoveis.filter(i => i.id !== id),
      });
    }
  }, [currentMinuta, currentMinutaId, updateMinutaInList]);

  // Negocios
  const updateNegocioJuridico = useCallback((id: string, updates: Partial<NegocioJuridico>) => {
    if (currentMinuta) {
      updateMinutaInList(currentMinutaId!, {
        negociosJuridicos: currentMinuta.negociosJuridicos.map(n =>
          n.id === id ? { ...n, ...updates } : n
        ),
      });
    }
  }, [currentMinuta, currentMinutaId, updateMinutaInList]);

  // Minuta texto
  const updateMinutaTexto = useCallback((texto: string) => {
    if (currentMinutaId) {
      updateMinutaInList(currentMinutaId, { minutaTexto: texto });
    }
  }, [currentMinutaId, updateMinutaInList]);

  const finalizarMinuta = useCallback(() => {
    if (currentMinutaId) {
      updateMinutaInList(currentMinutaId, { status: 'concluida' });
    }
  }, [currentMinutaId, updateMinutaInList]);

  return (
    <MinutaContext.Provider
      value={{
        minutas,
        currentMinuta,
        createMinuta,
        loadMinuta,
        updateMinuta,
        deleteMinuta,
        setCurrentStep,
        addDocument,
        removeDocument,
        addPessoaNaturalOutorgante,
        updatePessoaNaturalOutorgante,
        removePessoaNaturalOutorgante,
        addPessoaJuridicaOutorgante,
        updatePessoaJuridicaOutorgante,
        removePessoaJuridicaOutorgante,
        addPessoaNaturalOutorgado,
        updatePessoaNaturalOutorgado,
        removePessoaNaturalOutorgado,
        addPessoaJuridicaOutorgado,
        updatePessoaJuridicaOutorgado,
        removePessoaJuridicaOutorgado,
        addImovel,
        updateImovel,
        removeImovel,
        updateNegocioJuridico,
        updateMinutaTexto,
        finalizarMinuta,
        isSaving,
      }}
    >
      {children}
    </MinutaContext.Provider>
  );
}

export function useMinuta() {
  const context = useContext(MinutaContext);
  if (!context) {
    throw new Error('useMinuta must be used within a MinutaProvider');
  }
  return context;
}
```

**Step 2: Verify file was created**

Run: `ls Frontend/src/contexts/`
Expected: `MinutaContext.tsx`

**Step 3: Commit**

```bash
git add Frontend/src/contexts/MinutaContext.tsx
git commit -m "feat: add MinutaContext for global state management"
```

---

### Task 1.3: Update App with Provider and New Routes

**Files:**
- Modify: `src/App.tsx`

**Step 1: Update App.tsx with provider and new routes**

```typescript
// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { MinutaProvider } from "./contexts/MinutaContext";
import Dashboard from "./pages/Dashboard";
import UploadDocumentos from "./pages/UploadDocumentos";
import Processando from "./pages/Processando";
import ConferenciaOutorgantes from "./pages/ConferenciaOutorgantes";
import ConferenciaOutorgados from "./pages/ConferenciaOutorgados";
import ConferenciaImoveis from "./pages/ConferenciaImoveis";
import ParecerJuridico from "./pages/ParecerJuridico";
import ConferenciaNegocio from "./pages/ConferenciaNegocio";
import MinutaFinal from "./pages/MinutaFinal";
import { Toaster } from "./components/ui/sonner";
import { GlobalNavigation } from "./components/layout";

function App() {
  return (
    <MinutaProvider>
      <Router>
        <div className="min-h-screen bg-background">
          <GlobalNavigation />
          <Routes>
            {/* Dashboard */}
            <Route path="/" element={<Dashboard />} />

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
          <Toaster position="top-right" richColors closeButton />
        </div>
      </Router>
    </MinutaProvider>
  );
}

export default App;
```

**Step 2: Commit (after creating placeholder pages)**

```bash
git add Frontend/src/App.tsx
git commit -m "feat: update App with MinutaProvider and new routes"
```

---

## Phase 2: Reusable Components

### Task 2.1: Create EntityCard Component (Collapsible Card for Entities)

**Files:**
- Create: `src/components/layout/EntityCard.tsx`
- Modify: `src/components/layout/index.ts`

**Step 1: Create EntityCard component**

```typescript
// src/components/layout/EntityCard.tsx
import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface EntityCardProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  isComplete?: boolean;
  defaultOpen?: boolean;
  onRemove?: () => void;
  removeLabel?: string;
  children: ReactNode;
  className?: string;
  accentColor?: string;
}

export function EntityCard({
  title,
  subtitle,
  icon,
  isComplete = false,
  defaultOpen = true,
  onRemove,
  removeLabel = "Remover",
  children,
  className,
  accentColor = "accent",
}: EntityCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={cn(
        "border-2 rounded-lg overflow-hidden",
        `border-${accentColor}/50`,
        className
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center justify-between p-4 cursor-pointer hover:bg-secondary/50 transition-colors",
          `bg-${accentColor}/5`
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          {icon && (
            <div className={cn("p-2 rounded-lg", `bg-${accentColor}/10 text-${accentColor}`)}>
              {icon}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{title}</h3>
              {isComplete ? (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-yellow-500" />
              )}
            </div>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onRemove && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-destructive hover:text-destructive/80 bg-destructive/10 hover:bg-destructive/20 rounded-md transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {removeLabel}
            </button>
          )}
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="p-4 border-t border-border/50">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
```

**Step 2: Export from index**

Add to `src/components/layout/index.ts`:
```typescript
export { EntityCard } from "./EntityCard";
```

**Step 3: Commit**

```bash
git add Frontend/src/components/layout/EntityCard.tsx Frontend/src/components/layout/index.ts
git commit -m "feat: add EntityCard collapsible component"
```

---

### Task 2.2: Create EditableField Component (Tracks AI vs User Edits)

**Files:**
- Create: `src/components/forms/EditableField.tsx`
- Modify: `src/components/forms/index.ts`

**Step 1: Create EditableField component**

```typescript
// src/components/forms/EditableField.tsx
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SimpleTooltip } from "@/components/ui/tooltip";
import { Pencil } from "lucide-react";

interface EditableFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  wasEditedByUser?: boolean;
  onUserEdit?: () => void;
  type?: "text" | "date" | "email" | "tel";
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function EditableField({
  label,
  value,
  onChange,
  onBlur,
  wasEditedByUser = false,
  onUserEdit,
  type = "text",
  placeholder,
  className,
  disabled = false,
}: EditableFieldProps) {
  const [localValue, setLocalValue] = useState(value);
  const [hasUserEdited, setHasUserEdited] = useState(wasEditedByUser);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    setHasUserEdited(wasEditedByUser);
  }, [wasEditedByUser]);

  const handleChange = (newValue: string) => {
    setLocalValue(newValue);
    onChange(newValue);

    if (!hasUserEdited && newValue !== value) {
      setHasUserEdited(true);
      onUserEdit?.();
    }
  };

  const handleBlur = () => {
    onBlur?.();
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </Label>
        {hasUserEdited && (
          <SimpleTooltip content="Campo alterado pelo usuário">
            <span className="flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium text-blue-500 bg-blue-500/10 rounded">
              <Pencil className="w-3 h-3" />
            </span>
          </SimpleTooltip>
        )}
      </div>
      <Input
        type={type}
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "transition-colors",
          hasUserEdited && "border-blue-500/50 bg-blue-500/5"
        )}
      />
    </div>
  );
}
```

**Step 2: Export from index**

Add to `src/components/forms/index.ts`:
```typescript
export { EditableField } from "./EditableField";
```

**Step 3: Commit**

```bash
git add Frontend/src/components/forms/EditableField.tsx Frontend/src/components/forms/index.ts
git commit -m "feat: add EditableField component with edit tracking"
```

---

### Task 2.3: Create FlowNavigation Component

**Files:**
- Create: `src/components/layout/FlowNavigation.tsx`
- Modify: `src/components/layout/index.ts`

**Step 1: Create FlowNavigation component**

```typescript
// src/components/layout/FlowNavigation.tsx
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Save, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MinutaStep } from "@/types/minuta";

interface FlowNavigationProps {
  currentStep: MinutaStep;
  onBack?: () => void;
  onNext?: () => void;
  backLabel?: string;
  nextLabel?: string;
  showSaveIndicator?: boolean;
  isSaving?: boolean;
  className?: string;
}

const STEP_ORDER: MinutaStep[] = [
  'upload',
  'processando',
  'outorgantes',
  'outorgados',
  'imoveis',
  'parecer',
  'negocio',
  'minuta',
];

const STEP_ROUTES: Record<MinutaStep, string> = {
  upload: '/minuta/nova',
  processando: '/minuta/:id/processando',
  outorgantes: '/minuta/:id/outorgantes',
  outorgados: '/minuta/:id/outorgados',
  imoveis: '/minuta/:id/imoveis',
  parecer: '/minuta/:id/parecer',
  negocio: '/minuta/:id/negocio',
  minuta: '/minuta/:id/minuta',
};

export function FlowNavigation({
  currentStep,
  onBack,
  onNext,
  backLabel = "Voltar",
  nextLabel = "Próximo",
  showSaveIndicator = true,
  isSaving = false,
  className,
}: FlowNavigationProps) {
  const navigate = useNavigate();
  const { id } = useParams();

  const currentIndex = STEP_ORDER.indexOf(currentStep);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < STEP_ORDER.length - 1;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (hasPrevious) {
      const prevStep = STEP_ORDER[currentIndex - 1];
      const route = STEP_ROUTES[prevStep].replace(':id', id || '');
      navigate(route);
    } else {
      navigate('/');
    }
  };

  const handleNext = () => {
    if (onNext) {
      onNext();
    } else if (hasNext) {
      const nextStep = STEP_ORDER[currentIndex + 1];
      const route = STEP_ROUTES[nextStep].replace(':id', id || '');
      navigate(route);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "sticky bottom-0 left-0 right-0 p-4 mt-8 bg-background/95 backdrop-blur border-t border-border",
        className
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {backLabel}
        </Button>

        <div className="flex items-center gap-4">
          {showSaveIndicator && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-green-500" />
                  <span>Salvo automaticamente</span>
                </>
              )}
            </div>
          )}

          {hasNext && (
            <Button onClick={handleNext} className="flex items-center gap-2">
              {nextLabel}
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
```

**Step 2: Export from index**

Add to `src/components/layout/index.ts`:
```typescript
export { FlowNavigation } from "./FlowNavigation";
```

**Step 3: Commit**

```bash
git add Frontend/src/components/layout/FlowNavigation.tsx Frontend/src/components/layout/index.ts
git commit -m "feat: add FlowNavigation component for step navigation"
```

---

### Task 2.4: Create FlowStepper Component

**Files:**
- Create: `src/components/layout/FlowStepper.tsx`
- Modify: `src/components/layout/index.ts`

**Step 1: Create FlowStepper component**

```typescript
// src/components/layout/FlowStepper.tsx
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MinutaStep } from "@/types/minuta";

interface FlowStepperProps {
  currentStep: MinutaStep;
  completedSteps?: MinutaStep[];
  onStepClick?: (step: MinutaStep) => void;
  className?: string;
}

const STEPS: { id: MinutaStep; label: string; route: string }[] = [
  { id: 'upload', label: 'Upload', route: '/minuta/nova' },
  { id: 'outorgantes', label: 'Outorgantes', route: '/minuta/:id/outorgantes' },
  { id: 'outorgados', label: 'Outorgados', route: '/minuta/:id/outorgados' },
  { id: 'imoveis', label: 'Imóveis', route: '/minuta/:id/imoveis' },
  { id: 'parecer', label: 'Parecer', route: '/minuta/:id/parecer' },
  { id: 'negocio', label: 'Negócio', route: '/minuta/:id/negocio' },
  { id: 'minuta', label: 'Minuta', route: '/minuta/:id/minuta' },
];

export function FlowStepper({
  currentStep,
  completedSteps = [],
  onStepClick,
  className,
}: FlowStepperProps) {
  const navigate = useNavigate();
  const { id } = useParams();

  const currentIndex = STEPS.findIndex(s => s.id === currentStep);

  const handleStepClick = (step: typeof STEPS[number], index: number) => {
    // Can navigate to completed steps or current step
    if (index <= currentIndex || completedSteps.includes(step.id)) {
      if (onStepClick) {
        onStepClick(step.id);
      } else {
        const route = step.route.replace(':id', id || '');
        navigate(route);
      }
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id) || index < currentIndex;
          const isCurrent = step.id === currentStep;
          const isClickable = index <= currentIndex || completedSteps.includes(step.id);

          return (
            <div key={step.id} className="flex-1 flex items-center">
              <button
                onClick={() => handleStepClick(step, index)}
                disabled={!isClickable}
                className={cn(
                  "flex flex-col items-center gap-1 transition-colors",
                  isClickable ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                )}
              >
                <motion.div
                  initial={false}
                  animate={{
                    scale: isCurrent ? 1.1 : 1,
                    backgroundColor: isCompleted
                      ? "hsl(var(--accent))"
                      : isCurrent
                      ? "hsl(var(--primary))"
                      : "hsl(var(--muted))",
                  }}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium",
                    isCompleted || isCurrent ? "text-background" : "text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </motion.div>
                <span
                  className={cn(
                    "text-xs font-medium hidden sm:block",
                    isCurrent ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </button>

              {/* Connector line */}
              {index < STEPS.length - 1 && (
                <div className="flex-1 h-0.5 mx-2">
                  <motion.div
                    initial={false}
                    animate={{
                      backgroundColor: index < currentIndex
                        ? "hsl(var(--accent))"
                        : "hsl(var(--muted))",
                    }}
                    className="h-full rounded-full"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

**Step 2: Export from index**

Add to `src/components/layout/index.ts`:
```typescript
export { FlowStepper } from "./FlowStepper";
```

**Step 3: Commit**

```bash
git add Frontend/src/components/layout/FlowStepper.tsx Frontend/src/components/layout/index.ts
git commit -m "feat: add FlowStepper component for workflow progress"
```

---

## Phase 3: Page Implementation

### Task 3.1: Implement New Dashboard Page

**Files:**
- Modify: `src/pages/Dashboard.tsx`

**Step 1: Update Dashboard with minuta list**

```typescript
// src/pages/Dashboard.tsx
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMinuta } from "@/contexts/MinutaContext";
import { Plus, FileText, Clock, CheckCircle2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function Dashboard() {
  const navigate = useNavigate();
  const { minutas, createMinuta, loadMinuta, deleteMinuta } = useMinuta();

  const handleNewMinuta = () => {
    const id = createMinuta();
    navigate('/minuta/nova');
  };

  const handleOpenMinuta = (id: string, status: string, currentStep: string) => {
    loadMinuta(id);

    if (status === 'concluida') {
      navigate(`/minuta/${id}/minuta`);
    } else {
      // Navigate to current step
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

  const handleDeleteMinuta = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja excluir esta minuta?')) {
      deleteMinuta(id);
      toast.success('Minuta excluída');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <main className="min-h-screen p-6 md:p-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Sistema de Minutas
          </h1>
          <p className="text-muted-foreground text-lg">
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
            className="w-full md:w-auto flex items-center gap-2"
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
                          onClick={(e) => handleDeleteMinuta(e, minuta.id)}
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

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12 text-center text-muted-foreground text-sm"
        >
          <p>Sistema de Minutas v2.0 • Cartório de Notas</p>
        </motion.footer>
      </motion.div>
    </main>
  );
}
```

**Step 2: Verify it compiles**

Run: `cd Frontend && npm run build`
Expected: No TypeScript errors related to Dashboard

**Step 3: Commit**

```bash
git add Frontend/src/pages/Dashboard.tsx
git commit -m "feat: update Dashboard with minuta list and create flow"
```

---

### Task 3.2: Create UploadDocumentos Page

**Files:**
- Create: `src/pages/UploadDocumentos.tsx`

**Step 1: Create Upload page with 5 sections**

```typescript
// src/pages/UploadDocumentos.tsx
import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/layout/SectionCard";
import { FlowStepper } from "@/components/layout/FlowStepper";
import { useMinuta } from "@/contexts/MinutaContext";
import {
  Upload,
  X,
  FileText,
  Image,
  File,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  CloudUpload,
  Users,
  Building2,
  Home,
  Briefcase,
  FolderOpen,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { UploadedDocument } from "@/types/minuta";

type UploadCategory = UploadedDocument['category'];

interface CategoryConfig {
  id: UploadCategory;
  title: string;
  description: string;
  icon: typeof Users;
  color: string;
}

const CATEGORIES: CategoryConfig[] = [
  {
    id: 'outorgantes',
    title: 'Documentos dos Outorgantes',
    description: 'RG, CPF, Certidões, Comprovantes',
    icon: Users,
    color: 'blue',
  },
  {
    id: 'outorgados',
    title: 'Documentos dos Outorgados',
    description: 'RG, CPF, Certidões, Comprovantes',
    icon: Users,
    color: 'green',
  },
  {
    id: 'imoveis',
    title: 'Documentos dos Imóveis',
    description: 'Matrículas, IPTU, Certidões',
    icon: Home,
    color: 'yellow',
  },
  {
    id: 'negocio',
    title: 'Documentos do Negócio Jurídico',
    description: 'Contratos, Procurações, Acordos',
    icon: Briefcase,
    color: 'purple',
  },
  {
    id: 'outros',
    title: 'Demais Documentos',
    description: 'Outros documentos relevantes',
    icon: FolderOpen,
    color: 'gray',
  },
];

const ACCEPTED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const MAX_FILE_SIZE = 50 * 1024 * 1024;

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return Image;
  if (type.includes('pdf') || type.includes('document')) return FileText;
  return File;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function UploadDocumentos() {
  const navigate = useNavigate();
  const { currentMinuta, addDocument, removeDocument } = useMinuta();
  const [isDragging, setIsDragging] = useState<UploadCategory | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRefs = useRef<Record<UploadCategory, HTMLInputElement | null>>({
    outorgantes: null,
    outorgados: null,
    imoveis: null,
    negocio: null,
    outros: null,
  });

  const documents = currentMinuta?.documentos || [];

  const getDocumentsByCategory = (category: UploadCategory) =>
    documents.filter((d) => d.category === category);

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: 'Arquivo muito grande (max 50MB)' };
    }
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return { valid: false, error: `Tipo não suportado` };
    }
    return { valid: true };
  };

  const simulateUpload = useCallback(
    (file: File, category: UploadCategory) => {
      const validation = validateFile(file);
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const newDoc: UploadedDocument = {
        id,
        file,
        category,
        status: validation.valid ? 'uploading' : 'error',
        progress: validation.valid ? 0 : 100,
        errorMessage: validation.error,
      };

      addDocument(newDoc);

      if (!validation.valid) {
        toast.error(`Erro: ${validation.error}`);
        return;
      }

      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          clearInterval(interval);
          // Update to complete (simplified - in real app would update via context)
        }
      }, 200);
    },
    [addDocument]
  );

  const handleFiles = useCallback(
    (files: FileList | null, category: UploadCategory) => {
      if (!files) return;
      Array.from(files).forEach((file) => simulateUpload(file, category));
    },
    [simulateUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent, category: UploadCategory) => {
      e.preventDefault();
      setIsDragging(null);
      handleFiles(e.dataTransfer.files, category);
    },
    [handleFiles]
  );

  const handleProcessar = async () => {
    if (documents.length === 0) {
      toast.error('Adicione pelo menos um documento');
      return;
    }

    setIsProcessing(true);
    toast.info('Iniciando processamento...');

    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    if (currentMinuta) {
      navigate(`/minuta/${currentMinuta.id}/processando`);
    }
  };

  const totalDocs = documents.length;
  const completedDocs = documents.filter((d) => d.status === 'complete').length;

  return (
    <main className="min-h-screen p-6 md:p-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto"
      >
        {/* Header */}
        <header className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Dashboard</span>
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Upload de Documentos
          </h1>
          <p className="text-muted-foreground text-lg">
            Envie os documentos separados por categoria
          </p>
        </header>

        {/* Stepper */}
        <div className="mb-8 bg-card rounded-xl p-4 border border-border">
          <FlowStepper currentStep="upload" />
        </div>

        {/* Upload Sections */}
        <div className="space-y-6">
          {CATEGORIES.map((category) => {
            const categoryDocs = getDocumentsByCategory(category.id);
            const Icon = category.icon;

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <SectionCard
                  title={
                    <div className="flex items-center gap-2">
                      <Icon className={cn('w-5 h-5', `text-${category.color}-500`)} />
                      <span>{category.title}</span>
                      {categoryDocs.length > 0 && (
                        <span className="text-sm font-normal text-muted-foreground">
                          ({categoryDocs.length})
                        </span>
                      )}
                    </div>
                  }
                >
                  <p className="text-sm text-muted-foreground mb-4">{category.description}</p>

                  {/* Drop Zone */}
                  <div
                    onDrop={(e) => handleDrop(e, category.id)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(category.id);
                    }}
                    onDragLeave={() => setIsDragging(null)}
                    onClick={() => fileInputRefs.current[category.id]?.click()}
                    className={cn(
                      'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all',
                      isDragging === category.id
                        ? 'border-primary bg-primary/10'
                        : 'border-muted hover:border-accent hover:bg-accent/5'
                    )}
                  >
                    <input
                      ref={(el) => (fileInputRefs.current[category.id] = el)}
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx"
                      className="hidden"
                      onChange={(e) => handleFiles(e.target.files, category.id)}
                    />
                    <CloudUpload
                      className={cn(
                        'w-8 h-8 mx-auto mb-2',
                        isDragging === category.id ? 'text-primary' : 'text-muted-foreground'
                      )}
                    />
                    <p className="text-sm text-muted-foreground">
                      Arraste arquivos ou clique para selecionar
                    </p>
                  </div>

                  {/* File List */}
                  {categoryDocs.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <AnimatePresence>
                        {categoryDocs.map((doc) => {
                          const FileIcon = getFileIcon(doc.file.type);
                          return (
                            <motion.div
                              key={doc.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              className={cn(
                                'flex items-center gap-3 p-3 rounded-lg border',
                                doc.status === 'complete'
                                  ? 'bg-green-500/5 border-green-500/30'
                                  : doc.status === 'error'
                                  ? 'bg-destructive/5 border-destructive/30'
                                  : 'bg-secondary/50 border-border'
                              )}
                            >
                              <FileIcon className="w-5 h-5 text-muted-foreground" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{doc.file.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatFileSize(doc.file.size)}
                                </p>
                              </div>
                              {doc.status === 'complete' && (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              )}
                              {doc.status === 'error' && (
                                <AlertCircle className="w-4 h-4 text-destructive" />
                              )}
                              <button
                                onClick={() => removeDocument(doc.id)}
                                className="p-1 hover:bg-destructive/10 rounded"
                              >
                                <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                              </button>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  )}
                </SectionCard>
              </motion.div>
            );
          })}
        </div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 flex justify-end"
        >
          <Button
            size="lg"
            onClick={handleProcessar}
            disabled={totalDocs === 0 || isProcessing}
            className="flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Processar Documentos ({totalDocs})
              </>
            )}
          </Button>
        </motion.div>
      </motion.div>
    </main>
  );
}
```

**Step 2: Commit**

```bash
git add Frontend/src/pages/UploadDocumentos.tsx
git commit -m "feat: add UploadDocumentos page with 5 category sections"
```

---

### Task 3.3: Create Processando Page (Loading Screen)

**Files:**
- Create: `src/pages/Processando.tsx`

**Step 1: Create processing/loading page**

```typescript
// src/pages/Processando.tsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { useMinuta } from "@/contexts/MinutaContext";
import { Loader2, FileSearch, CheckCircle2, Brain } from "lucide-react";

const PROCESSING_STEPS = [
  { id: 1, label: 'Analisando documentos...', icon: FileSearch },
  { id: 2, label: 'Extraindo dados com IA...', icon: Brain },
  { id: 3, label: 'Identificando pessoas...', icon: FileSearch },
  { id: 4, label: 'Identificando imóveis...', icon: FileSearch },
  { id: 5, label: 'Gerando parecer jurídico...', icon: Brain },
  { id: 6, label: 'Finalizando...', icon: CheckCircle2 },
];

export default function Processando() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentMinuta, setCurrentStep, updateMinuta } = useMinuta();
  const [currentProcessingStep, setCurrentProcessingStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate AI processing
    const stepInterval = setInterval(() => {
      setCurrentProcessingStep((prev) => {
        if (prev >= PROCESSING_STEPS.length - 1) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    // Complete processing after all steps
    const completeTimeout = setTimeout(() => {
      // Simulate extracted data (in real app, this would come from AI)
      setCurrentStep('outorgantes');

      // Mock data injection would happen here
      // updateMinuta({ ... extracted data ... })

      navigate(`/minuta/${id}/outorgantes`);
    }, PROCESSING_STEPS.length * 1500 + 500);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
      clearTimeout(completeTimeout);
    };
  }, [id, navigate, setCurrentStep]);

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center"
      >
        {/* Animated Icon */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-20 h-20 mx-auto mb-8 rounded-full bg-primary/10 flex items-center justify-center"
        >
          <Brain className="w-10 h-10 text-primary" />
        </motion.div>

        <h1 className="text-2xl font-bold text-foreground mb-2">
          Processando Documentos
        </h1>
        <p className="text-muted-foreground mb-8">
          A IA está analisando seus documentos...
        </p>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-8">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Processing Steps */}
        <div className="space-y-3 text-left">
          {PROCESSING_STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentProcessingStep;
            const isComplete = index < currentProcessingStep;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary/10 border border-primary/30'
                    : isComplete
                    ? 'bg-green-500/10'
                    : 'bg-muted/50'
                }`}
              >
                {isActive ? (
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                ) : isComplete ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <Icon className="w-5 h-5 text-muted-foreground" />
                )}
                <span
                  className={`text-sm ${
                    isActive
                      ? 'text-primary font-medium'
                      : isComplete
                      ? 'text-green-500'
                      : 'text-muted-foreground'
                  }`}
                >
                  {step.label}
                </span>
              </motion.div>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground mt-8">
          Não feche esta página. O processamento pode levar alguns minutos.
        </p>
      </motion.div>
    </main>
  );
}
```

**Step 2: Commit**

```bash
git add Frontend/src/pages/Processando.tsx
git commit -m "feat: add Processando page with AI processing simulation"
```

---

### Task 3.4: Create Placeholder Pages

**Files:**
- Create: `src/pages/ConferenciaOutorgantes.tsx`
- Create: `src/pages/ConferenciaOutorgados.tsx`
- Create: `src/pages/ConferenciaImoveis.tsx`
- Create: `src/pages/ParecerJuridico.tsx`
- Create: `src/pages/ConferenciaNegocio.tsx`
- Create: `src/pages/MinutaFinal.tsx`

**Step 1: Create ConferenciaOutorgantes placeholder**

```typescript
// src/pages/ConferenciaOutorgantes.tsx
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { FlowStepper } from "@/components/layout/FlowStepper";
import { FlowNavigation } from "@/components/layout/FlowNavigation";
import { useMinuta } from "@/contexts/MinutaContext";

export default function ConferenciaOutorgantes() {
  const { id } = useParams();
  const { currentMinuta, isSaving } = useMinuta();

  return (
    <main className="min-h-screen p-4 md:p-8 pb-24">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="CONFERÊNCIA E COMPLEMENTAÇÃO"
          subtitle="(POLO OUTORGANTE)"
          instruction="Confira todos os dados e preencha os campos faltantes."
        />

        <div className="mb-8 bg-card rounded-xl p-4 border border-border">
          <FlowStepper currentStep="outorgantes" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 text-muted-foreground"
        >
          <p>Página de Conferência de Outorgantes</p>
          <p className="text-sm mt-2">Em desenvolvimento...</p>
        </motion.div>

        <FlowNavigation currentStep="outorgantes" isSaving={isSaving} />
      </div>
    </main>
  );
}
```

**Step 2: Create remaining placeholder pages** (same pattern)

Create similar placeholders for:
- ConferenciaOutorgados.tsx (currentStep="outorgados")
- ConferenciaImoveis.tsx (currentStep="imoveis")
- ParecerJuridico.tsx (currentStep="parecer")
- ConferenciaNegocio.tsx (currentStep="negocio")
- MinutaFinal.tsx (currentStep="minuta")

**Step 3: Commit**

```bash
git add Frontend/src/pages/ConferenciaOutorgantes.tsx \
        Frontend/src/pages/ConferenciaOutorgados.tsx \
        Frontend/src/pages/ConferenciaImoveis.tsx \
        Frontend/src/pages/ParecerJuridico.tsx \
        Frontend/src/pages/ConferenciaNegocio.tsx \
        Frontend/src/pages/MinutaFinal.tsx
git commit -m "feat: add placeholder pages for minuta workflow"
```

---

## Phase 4: Complete Page Implementations

### Task 4.1: Complete ConferenciaOutorgantes Page

**Files:**
- Modify: `src/pages/ConferenciaOutorgantes.tsx`

**Step 1: Implement full page with collapsible cards**

(Full implementation with EntityCard, EditableField, add/remove functionality)

**Step 2: Commit**

```bash
git add Frontend/src/pages/ConferenciaOutorgantes.tsx
git commit -m "feat: complete ConferenciaOutorgantes page implementation"
```

---

### Task 4.2: Complete ConferenciaOutorgados Page

(Copy structure from Outorgantes, change context methods)

---

### Task 4.3: Complete ConferenciaImoveis Page

(Adapt existing Imovel.tsx to work with multiple collapsible imóveis)

---

### Task 4.4: Complete ParecerJuridico Page

(Read-only fields with AI data display)

---

### Task 4.5: Complete ConferenciaNegocio Page

(One negócio per imóvel, collapsible cards)

---

### Task 4.6: Complete MinutaFinal Page

**Files:**
- Modify: `src/pages/MinutaFinal.tsx`

**Step 1: Install TipTap**

Run: `cd Frontend && npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-underline`

**Step 2: Implement rich-text editor page**

(Full implementation with TipTap, export buttons, finalize action)

**Step 3: Commit**

```bash
git add Frontend/src/pages/MinutaFinal.tsx Frontend/package.json Frontend/package-lock.json
git commit -m "feat: complete MinutaFinal page with rich-text editor"
```

---

## Phase 5: Cleanup and Polish

### Task 5.1: Remove Old Unused Pages

**Files:**
- Delete: `src/pages/PessoaNatural.tsx`
- Delete: `src/pages/PessoaJuridica.tsx`
- Delete: `src/pages/Imovel.tsx`
- Delete: `src/pages/NegocioJuridico.tsx`
- Delete: `src/pages/Upload.tsx`

**Step 1: Remove old pages**

Run: `rm Frontend/src/pages/PessoaNatural.tsx Frontend/src/pages/PessoaJuridica.tsx Frontend/src/pages/Imovel.tsx Frontend/src/pages/NegocioJuridico.tsx Frontend/src/pages/Upload.tsx`

**Step 2: Commit**

```bash
git add -u Frontend/src/pages/
git commit -m "chore: remove old unused page components"
```

---

### Task 5.2: Final Build Verification

**Step 1: Run build**

Run: `cd Frontend && npm run build`
Expected: Build succeeds with no errors

**Step 2: Run lint**

Run: `cd Frontend && npm run lint`
Expected: No critical lint errors

**Step 3: Commit any fixes**

```bash
git add -A Frontend/
git commit -m "fix: resolve build and lint issues"
```

---

## Summary

**Total Tasks:** 20+ bite-sized tasks
**Key Deliverables:**
1. TypeScript types for entire minuta workflow
2. MinutaContext for global state management with localStorage persistence
3. New reusable components: EntityCard, EditableField, FlowNavigation, FlowStepper
4. 9 new/updated pages: Dashboard, UploadDocumentos, Processando, ConferenciaOutorgantes, ConferenciaOutorgados, ConferenciaImoveis, ParecerJuridico, ConferenciaNegocio, MinutaFinal
5. Full workflow from upload to final document generation

**Dependencies to Install:**
- @tiptap/react, @tiptap/starter-kit, @tiptap/extension-underline (for rich-text editor)

**Routes Structure:**
```
/                         → Dashboard (lista de minutas)
/minuta/nova              → UploadDocumentos
/minuta/:id/processando   → Processando (loading)
/minuta/:id/outorgantes   → ConferenciaOutorgantes
/minuta/:id/outorgados    → ConferenciaOutorgados
/minuta/:id/imoveis       → ConferenciaImoveis
/minuta/:id/parecer       → ParecerJuridico
/minuta/:id/negocio       → ConferenciaNegocio
/minuta/:id/minuta        → MinutaFinal (editor)
```
