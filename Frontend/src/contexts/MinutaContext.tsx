// src/contexts/MinutaContext.tsx
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import type { Minuta, MinutaStep, UploadedDocument, PessoaNatural, PessoaJuridica, Imovel, NegocioJuridico, RepresentanteAdministrador, RepresentanteProcurador, ParticipanteNegocio } from '@/types/minuta';

interface MinutaContextType {
  minutas: Minuta[];
  currentMinuta: Minuta | null;
  createMinuta: () => string;
  loadMinuta: (id: string) => void;
  updateMinuta: (updates: Partial<Minuta>) => void;
  deleteMinuta: (id: string) => void;
  setCurrentStep: (step: MinutaStep) => void;
  addDocument: (doc: UploadedDocument) => void;
  removeDocument: (docId: string) => void;
  addPessoaNaturalOutorgante: (pessoa: PessoaNatural) => void;
  updatePessoaNaturalOutorgante: (id: string, updates: Partial<PessoaNatural>) => void;
  removePessoaNaturalOutorgante: (id: string) => void;
  addPessoaJuridicaOutorgante: (pessoa: PessoaJuridica) => void;
  updatePessoaJuridicaOutorgante: (id: string, updates: Partial<PessoaJuridica>) => void;
  removePessoaJuridicaOutorgante: (id: string) => void;
  addPessoaNaturalOutorgado: (pessoa: PessoaNatural) => void;
  updatePessoaNaturalOutorgado: (id: string, updates: Partial<PessoaNatural>) => void;
  removePessoaNaturalOutorgado: (id: string) => void;
  addPessoaJuridicaOutorgado: (pessoa: PessoaJuridica) => void;
  updatePessoaJuridicaOutorgado: (id: string, updates: Partial<PessoaJuridica>) => void;
  removePessoaJuridicaOutorgado: (id: string) => void;
  addImovel: (imovel: Imovel) => void;
  updateImovel: (id: string, updates: Partial<Imovel>) => void;
  removeImovel: (id: string) => void;
  addNegocioJuridico: (negocio: NegocioJuridico) => void;
  updateNegocioJuridico: (id: string, updates: Partial<NegocioJuridico>) => void;
  removeNegocioJuridico: (id: string) => void;
  // Administradores - Outorgante
  addAdministradorOutorgante: (pessoaJuridicaId: string, admin: RepresentanteAdministrador) => void;
  updateAdministradorOutorgante: (pessoaJuridicaId: string, adminId: string, updates: Partial<RepresentanteAdministrador>) => void;
  removeAdministradorOutorgante: (pessoaJuridicaId: string, adminId: string) => void;
  // Procuradores - Outorgante
  addProcuradorOutorgante: (pessoaJuridicaId: string, proc: RepresentanteProcurador) => void;
  updateProcuradorOutorgante: (pessoaJuridicaId: string, procId: string, updates: Partial<RepresentanteProcurador>) => void;
  removeProcuradorOutorgante: (pessoaJuridicaId: string, procId: string) => void;
  // Administradores - Outorgado
  addAdministradorOutorgado: (pessoaJuridicaId: string, admin: RepresentanteAdministrador) => void;
  updateAdministradorOutorgado: (pessoaJuridicaId: string, adminId: string, updates: Partial<RepresentanteAdministrador>) => void;
  removeAdministradorOutorgado: (pessoaJuridicaId: string, adminId: string) => void;
  // Procuradores - Outorgado
  addProcuradorOutorgado: (pessoaJuridicaId: string, proc: RepresentanteProcurador) => void;
  updateProcuradorOutorgado: (pessoaJuridicaId: string, procId: string, updates: Partial<RepresentanteProcurador>) => void;
  removeProcuradorOutorgado: (pessoaJuridicaId: string, procId: string) => void;
  // Alienantes - NegocioJuridico
  addAlienanteNegocio: (negocioId: string, alienante: ParticipanteNegocio) => void;
  updateAlienanteNegocio: (negocioId: string, alienanteId: string, updates: Partial<ParticipanteNegocio>) => void;
  removeAlienanteNegocio: (negocioId: string, alienanteId: string) => void;
  // Adquirentes - NegocioJuridico
  addAdquirenteNegocio: (negocioId: string, adquirente: ParticipanteNegocio) => void;
  updateAdquirenteNegocio: (negocioId: string, adquirenteId: string, updates: Partial<ParticipanteNegocio>) => void;
  removeAdquirenteNegocio: (negocioId: string, adquirenteId: string) => void;
  updateMinutaTexto: (texto: string) => void;
  finalizarMinuta: () => void;
  isSaving: boolean;
}

const MinutaContext = createContext<MinutaContextType | null>(null);

const STORAGE_KEY = 'minutas-cartorio';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
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

// Initialize state from localStorage (lazy initialization)
function getInitialMinutas(): Minuta[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to parse stored minutas:', e);
  }
  return [];
}

export function MinutaProvider({ children }: { children: ReactNode }) {
  const [minutas, setMinutas] = useState<Minuta[]>(getInitialMinutas);
  const [currentMinutaId, setCurrentMinutaId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const isInitialMount = useRef(true);

  // Save to localStorage when minutas change (skip initial mount)
  // This pattern is intentional for showing save indicator during debounced localStorage writes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional: showing save indicator
    setIsSaving(true);
    const timeout = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(minutas));
      setIsSaving(false);
    }, 500);
    return () => clearTimeout(timeout);
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
  const addNegocioJuridico = useCallback((negocio: NegocioJuridico) => {
    if (currentMinuta) {
      updateMinutaInList(currentMinutaId!, {
        negociosJuridicos: [...currentMinuta.negociosJuridicos, negocio],
      });
    }
  }, [currentMinuta, currentMinutaId, updateMinutaInList]);

  const updateNegocioJuridico = useCallback((id: string, updates: Partial<NegocioJuridico>) => {
    if (currentMinuta) {
      updateMinutaInList(currentMinutaId!, {
        negociosJuridicos: currentMinuta.negociosJuridicos.map(n =>
          n.id === id ? { ...n, ...updates } : n
        ),
      });
    }
  }, [currentMinuta, currentMinutaId, updateMinutaInList]);

  const removeNegocioJuridico = useCallback((id: string) => {
    if (currentMinuta) {
      updateMinutaInList(currentMinutaId!, {
        negociosJuridicos: currentMinuta.negociosJuridicos.filter(n => n.id !== id),
      });
    }
  }, [currentMinuta, currentMinutaId, updateMinutaInList]);

  // Administradores - Outorgante
  const addAdministradorOutorgante = useCallback((pessoaJuridicaId: string, admin: RepresentanteAdministrador) => {
    if (currentMinuta) {
      const updatedPJ = currentMinuta.outorgantes.pessoasJuridicas.map(pj =>
        pj.id === pessoaJuridicaId
          ? { ...pj, administradores: [...pj.administradores, admin] }
          : pj
      );
      updateMinutaInList(currentMinutaId!, {
        outorgantes: {
          ...currentMinuta.outorgantes,
          pessoasJuridicas: updatedPJ,
        },
      });
    }
  }, [currentMinuta, currentMinutaId, updateMinutaInList]);

  const updateAdministradorOutorgante = useCallback((pessoaJuridicaId: string, adminId: string, updates: Partial<RepresentanteAdministrador>) => {
    if (currentMinuta) {
      const updatedPJ = currentMinuta.outorgantes.pessoasJuridicas.map(pj =>
        pj.id === pessoaJuridicaId
          ? {
              ...pj,
              administradores: pj.administradores.map(admin =>
                admin.id === adminId ? { ...admin, ...updates } : admin
              ),
            }
          : pj
      );
      updateMinutaInList(currentMinutaId!, {
        outorgantes: {
          ...currentMinuta.outorgantes,
          pessoasJuridicas: updatedPJ,
        },
      });
    }
  }, [currentMinuta, currentMinutaId, updateMinutaInList]);

  const removeAdministradorOutorgante = useCallback((pessoaJuridicaId: string, adminId: string) => {
    if (currentMinuta) {
      const updatedPJ = currentMinuta.outorgantes.pessoasJuridicas.map(pj =>
        pj.id === pessoaJuridicaId
          ? { ...pj, administradores: pj.administradores.filter(admin => admin.id !== adminId) }
          : pj
      );
      updateMinutaInList(currentMinutaId!, {
        outorgantes: {
          ...currentMinuta.outorgantes,
          pessoasJuridicas: updatedPJ,
        },
      });
    }
  }, [currentMinuta, currentMinutaId, updateMinutaInList]);

  // Procuradores - Outorgante
  const addProcuradorOutorgante = useCallback((pessoaJuridicaId: string, proc: RepresentanteProcurador) => {
    if (currentMinuta) {
      const updatedPJ = currentMinuta.outorgantes.pessoasJuridicas.map(pj =>
        pj.id === pessoaJuridicaId
          ? { ...pj, procuradores: [...pj.procuradores, proc] }
          : pj
      );
      updateMinutaInList(currentMinutaId!, {
        outorgantes: {
          ...currentMinuta.outorgantes,
          pessoasJuridicas: updatedPJ,
        },
      });
    }
  }, [currentMinuta, currentMinutaId, updateMinutaInList]);

  const updateProcuradorOutorgante = useCallback((pessoaJuridicaId: string, procId: string, updates: Partial<RepresentanteProcurador>) => {
    if (currentMinuta) {
      const updatedPJ = currentMinuta.outorgantes.pessoasJuridicas.map(pj =>
        pj.id === pessoaJuridicaId
          ? {
              ...pj,
              procuradores: pj.procuradores.map(proc =>
                proc.id === procId ? { ...proc, ...updates } : proc
              ),
            }
          : pj
      );
      updateMinutaInList(currentMinutaId!, {
        outorgantes: {
          ...currentMinuta.outorgantes,
          pessoasJuridicas: updatedPJ,
        },
      });
    }
  }, [currentMinuta, currentMinutaId, updateMinutaInList]);

  const removeProcuradorOutorgante = useCallback((pessoaJuridicaId: string, procId: string) => {
    if (currentMinuta) {
      const updatedPJ = currentMinuta.outorgantes.pessoasJuridicas.map(pj =>
        pj.id === pessoaJuridicaId
          ? { ...pj, procuradores: pj.procuradores.filter(proc => proc.id !== procId) }
          : pj
      );
      updateMinutaInList(currentMinutaId!, {
        outorgantes: {
          ...currentMinuta.outorgantes,
          pessoasJuridicas: updatedPJ,
        },
      });
    }
  }, [currentMinuta, currentMinutaId, updateMinutaInList]);

  // Administradores - Outorgado
  const addAdministradorOutorgado = useCallback((pessoaJuridicaId: string, admin: RepresentanteAdministrador) => {
    if (currentMinuta) {
      const updatedPJ = currentMinuta.outorgados.pessoasJuridicas.map(pj =>
        pj.id === pessoaJuridicaId
          ? { ...pj, administradores: [...pj.administradores, admin] }
          : pj
      );
      updateMinutaInList(currentMinutaId!, {
        outorgados: {
          ...currentMinuta.outorgados,
          pessoasJuridicas: updatedPJ,
        },
      });
    }
  }, [currentMinuta, currentMinutaId, updateMinutaInList]);

  const updateAdministradorOutorgado = useCallback((pessoaJuridicaId: string, adminId: string, updates: Partial<RepresentanteAdministrador>) => {
    if (currentMinuta) {
      const updatedPJ = currentMinuta.outorgados.pessoasJuridicas.map(pj =>
        pj.id === pessoaJuridicaId
          ? {
              ...pj,
              administradores: pj.administradores.map(admin =>
                admin.id === adminId ? { ...admin, ...updates } : admin
              ),
            }
          : pj
      );
      updateMinutaInList(currentMinutaId!, {
        outorgados: {
          ...currentMinuta.outorgados,
          pessoasJuridicas: updatedPJ,
        },
      });
    }
  }, [currentMinuta, currentMinutaId, updateMinutaInList]);

  const removeAdministradorOutorgado = useCallback((pessoaJuridicaId: string, adminId: string) => {
    if (currentMinuta) {
      const updatedPJ = currentMinuta.outorgados.pessoasJuridicas.map(pj =>
        pj.id === pessoaJuridicaId
          ? { ...pj, administradores: pj.administradores.filter(admin => admin.id !== adminId) }
          : pj
      );
      updateMinutaInList(currentMinutaId!, {
        outorgados: {
          ...currentMinuta.outorgados,
          pessoasJuridicas: updatedPJ,
        },
      });
    }
  }, [currentMinuta, currentMinutaId, updateMinutaInList]);

  // Procuradores - Outorgado
  const addProcuradorOutorgado = useCallback((pessoaJuridicaId: string, proc: RepresentanteProcurador) => {
    if (currentMinuta) {
      const updatedPJ = currentMinuta.outorgados.pessoasJuridicas.map(pj =>
        pj.id === pessoaJuridicaId
          ? { ...pj, procuradores: [...pj.procuradores, proc] }
          : pj
      );
      updateMinutaInList(currentMinutaId!, {
        outorgados: {
          ...currentMinuta.outorgados,
          pessoasJuridicas: updatedPJ,
        },
      });
    }
  }, [currentMinuta, currentMinutaId, updateMinutaInList]);

  const updateProcuradorOutorgado = useCallback((pessoaJuridicaId: string, procId: string, updates: Partial<RepresentanteProcurador>) => {
    if (currentMinuta) {
      const updatedPJ = currentMinuta.outorgados.pessoasJuridicas.map(pj =>
        pj.id === pessoaJuridicaId
          ? {
              ...pj,
              procuradores: pj.procuradores.map(proc =>
                proc.id === procId ? { ...proc, ...updates } : proc
              ),
            }
          : pj
      );
      updateMinutaInList(currentMinutaId!, {
        outorgados: {
          ...currentMinuta.outorgados,
          pessoasJuridicas: updatedPJ,
        },
      });
    }
  }, [currentMinuta, currentMinutaId, updateMinutaInList]);

  const removeProcuradorOutorgado = useCallback((pessoaJuridicaId: string, procId: string) => {
    if (currentMinuta) {
      const updatedPJ = currentMinuta.outorgados.pessoasJuridicas.map(pj =>
        pj.id === pessoaJuridicaId
          ? { ...pj, procuradores: pj.procuradores.filter(proc => proc.id !== procId) }
          : pj
      );
      updateMinutaInList(currentMinutaId!, {
        outorgados: {
          ...currentMinuta.outorgados,
          pessoasJuridicas: updatedPJ,
        },
      });
    }
  }, [currentMinuta, currentMinutaId, updateMinutaInList]);

  // Alienantes - NegocioJuridico
  const addAlienanteNegocio = useCallback((negocioId: string, alienante: ParticipanteNegocio) => {
    if (currentMinuta) {
      const updatedNegocios = currentMinuta.negociosJuridicos.map(negocio =>
        negocio.id === negocioId
          ? { ...negocio, alienantes: [...negocio.alienantes, alienante] }
          : negocio
      );
      updateMinutaInList(currentMinutaId!, {
        negociosJuridicos: updatedNegocios,
      });
    }
  }, [currentMinuta, currentMinutaId, updateMinutaInList]);

  const updateAlienanteNegocio = useCallback((negocioId: string, alienanteId: string, updates: Partial<ParticipanteNegocio>) => {
    if (currentMinuta) {
      const updatedNegocios = currentMinuta.negociosJuridicos.map(negocio =>
        negocio.id === negocioId
          ? {
              ...negocio,
              alienantes: negocio.alienantes.map(alienante =>
                alienante.id === alienanteId ? { ...alienante, ...updates } : alienante
              ),
            }
          : negocio
      );
      updateMinutaInList(currentMinutaId!, {
        negociosJuridicos: updatedNegocios,
      });
    }
  }, [currentMinuta, currentMinutaId, updateMinutaInList]);

  const removeAlienanteNegocio = useCallback((negocioId: string, alienanteId: string) => {
    if (currentMinuta) {
      const updatedNegocios = currentMinuta.negociosJuridicos.map(negocio =>
        negocio.id === negocioId
          ? { ...negocio, alienantes: negocio.alienantes.filter(alienante => alienante.id !== alienanteId) }
          : negocio
      );
      updateMinutaInList(currentMinutaId!, {
        negociosJuridicos: updatedNegocios,
      });
    }
  }, [currentMinuta, currentMinutaId, updateMinutaInList]);

  // Adquirentes - NegocioJuridico
  const addAdquirenteNegocio = useCallback((negocioId: string, adquirente: ParticipanteNegocio) => {
    if (currentMinuta) {
      const updatedNegocios = currentMinuta.negociosJuridicos.map(negocio =>
        negocio.id === negocioId
          ? { ...negocio, adquirentes: [...negocio.adquirentes, adquirente] }
          : negocio
      );
      updateMinutaInList(currentMinutaId!, {
        negociosJuridicos: updatedNegocios,
      });
    }
  }, [currentMinuta, currentMinutaId, updateMinutaInList]);

  const updateAdquirenteNegocio = useCallback((negocioId: string, adquirenteId: string, updates: Partial<ParticipanteNegocio>) => {
    if (currentMinuta) {
      const updatedNegocios = currentMinuta.negociosJuridicos.map(negocio =>
        negocio.id === negocioId
          ? {
              ...negocio,
              adquirentes: negocio.adquirentes.map(adquirente =>
                adquirente.id === adquirenteId ? { ...adquirente, ...updates } : adquirente
              ),
            }
          : negocio
      );
      updateMinutaInList(currentMinutaId!, {
        negociosJuridicos: updatedNegocios,
      });
    }
  }, [currentMinuta, currentMinutaId, updateMinutaInList]);

  const removeAdquirenteNegocio = useCallback((negocioId: string, adquirenteId: string) => {
    if (currentMinuta) {
      const updatedNegocios = currentMinuta.negociosJuridicos.map(negocio =>
        negocio.id === negocioId
          ? { ...negocio, adquirentes: negocio.adquirentes.filter(adquirente => adquirente.id !== adquirenteId) }
          : negocio
      );
      updateMinutaInList(currentMinutaId!, {
        negociosJuridicos: updatedNegocios,
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
        addNegocioJuridico,
        updateNegocioJuridico,
        removeNegocioJuridico,
        addAdministradorOutorgante,
        updateAdministradorOutorgante,
        removeAdministradorOutorgante,
        addProcuradorOutorgante,
        updateProcuradorOutorgante,
        removeProcuradorOutorgante,
        addAdministradorOutorgado,
        updateAdministradorOutorgado,
        removeAdministradorOutorgado,
        addProcuradorOutorgado,
        updateProcuradorOutorgado,
        removeProcuradorOutorgado,
        addAlienanteNegocio,
        updateAlienanteNegocio,
        removeAlienanteNegocio,
        addAdquirenteNegocio,
        updateAdquirenteNegocio,
        removeAdquirenteNegocio,
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
