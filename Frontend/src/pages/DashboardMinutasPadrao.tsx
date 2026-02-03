// src/pages/DashboardMinutasPadrao.tsx

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, LayoutTemplate, RefreshCw, AlertCircle, FolderOpen, Globe } from 'lucide-react';
import { useMinutasPadrao } from '@/hooks/useMinutasPadrao';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  TemplateGrid,
  TemplateFilter,
  TemplateUploadForm,
  TemplateEditModal,
  TemplateDeleteDialog,
  TemplateTextReviewModal,
} from '@/components/minutas-padrao';
import { cn } from '@/lib/utils';
import type { MinutaPadrao, TipoNegocio, MinutaPadraoUpdate, MinutaPadraoInsertUpload, MinutaPadraoInsertText } from '@/types/minutas-padrao';

export function DashboardMinutasPadrao() {
  const {
    templates,
    isLoading,
    error,
    loadTemplates,
    uploadTemplate,
    createFromText,
    updateTemplate,
    deleteTemplate,
    saveMarkdown,
    reExtract,
  } = useMinutasPadrao();

  const [activeTab, setActiveTab] = useState<'user' | 'global'>('user');
  const [tipoFilter, setTipoFilter] = useState<TipoNegocio | undefined>();

  // Modal states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MinutaPadrao | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<MinutaPadrao | null>(null);
  const [viewingTextTemplate, setViewingTextTemplate] = useState<MinutaPadrao | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load templates on mount and when filter changes
  useEffect(() => {
    loadTemplates(tipoFilter);
  }, [loadTemplates, tipoFilter]);

  // Filter templates by tab
  const userTemplates = templates.filter(t => !t.is_global);
  const globalTemplates = templates.filter(t => t.is_global);
  const displayedTemplates = activeTab === 'user' ? userTemplates : globalTemplates;

  // Handlers
  const handleUploadFile = useCallback(async (
    data: Omit<MinutaPadraoInsertUpload, 'storage_path' | 'nome_original' | 'mime_type' | 'tamanho_bytes' | 'status_extracao'>,
    file: File
  ) => {
    setIsSubmitting(true);
    try {
      await uploadTemplate(file, data);
      setIsUploadModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  }, [uploadTemplate]);

  const handleUploadText = useCallback(async (
    data: Omit<MinutaPadraoInsertText, 'status_extracao'>
  ) => {
    setIsSubmitting(true);
    try {
      await createFromText(data);
      setIsUploadModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  }, [createFromText]);

  const handleEdit = useCallback(async (id: string, data: MinutaPadraoUpdate) => {
    setIsSubmitting(true);
    try {
      await updateTemplate(id, data);
      setEditingTemplate(null);
    } finally {
      setIsSubmitting(false);
    }
  }, [updateTemplate]);

  const handleDelete = useCallback(async (id: string) => {
    setIsSubmitting(true);
    try {
      await deleteTemplate(id);
      setDeletingTemplate(null);
    } finally {
      setIsSubmitting(false);
    }
  }, [deleteTemplate]);

  const handleFilterChange = useCallback((tipo: TipoNegocio | undefined) => {
    setTipoFilter(tipo);
  }, []);

  const handleRetry = useCallback(() => {
    loadTemplates(tipoFilter);
  }, [loadTemplates, tipoFilter]);

  const handleSaveMarkdown = useCallback(async (id: string, markdown: string) => {
    await saveMarkdown(id, markdown);
    setViewingTextTemplate(null);
  }, [saveMarkdown]);

  const handleReExtract = useCallback(async (id: string) => {
    await reExtract(id);
    // Atualizar o template local
    const updated = templates.find(t => t.id === id);
    if (updated) {
      setViewingTextTemplate(updated);
    }
  }, [reExtract, templates]);

  // Empty state message
  const emptyMessage = activeTab === 'user'
    ? 'Nenhum template criado. Crie seu primeiro template!'
    : 'Nenhum template global disponivel.';

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between px-6 py-4 border-b"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <LayoutTemplate className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Templates de Minuta</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie seus modelos de minutas
            </p>
          </div>
        </div>

        <Button onClick={() => setIsUploadModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Template
        </Button>
      </motion.header>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex-1 overflow-auto p-6"
      >
        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 p-4 mb-6 rounded-lg bg-destructive/10 text-destructive"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="flex-1">{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar novamente
            </Button>
          </motion.div>
        )}

        {/* Tabs + Filter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6"
        >
          {/* Tab Navigation */}
          <div className="flex gap-2 border-b border-border" role="tablist">
            <button
              role="tab"
              aria-selected={activeTab === 'user'}
              onClick={() => setActiveTab('user')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
                activeTab === 'user'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              <FolderOpen className="w-4 h-4" />
              Meus Templates ({userTemplates.length})
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'global'}
              onClick={() => setActiveTab('global')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
                activeTab === 'global'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              <Globe className="w-4 h-4" />
              Templates Globais ({globalTemplates.length})
            </button>
          </div>

          <TemplateFilter
            value={tipoFilter}
            onChange={handleFilterChange}
          />
        </motion.div>

        {/* Templates Grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <TemplateGrid
            templates={displayedTemplates}
            isLoading={isLoading}
            emptyMessage={emptyMessage}
            onEdit={activeTab === 'user' ? setEditingTemplate : undefined}
            onDelete={activeTab === 'user' ? setDeletingTemplate : undefined}
            onViewText={setViewingTextTemplate}
          />
        </motion.div>
      </motion.div>

      {/* Upload Modal */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Template</DialogTitle>
            <DialogDescription>
              Faça upload de um arquivo PDF/DOCX ou cole o texto diretamente.
            </DialogDescription>
          </DialogHeader>
          <TemplateUploadForm
            onSubmitFile={handleUploadFile}
            onSubmitText={handleUploadText}
            onCancel={() => setIsUploadModalOpen(false)}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      {editingTemplate && (
        <TemplateEditModal
          isOpen={!!editingTemplate}
          template={editingTemplate}
          onClose={() => setEditingTemplate(null)}
          onSave={handleEdit}
          isLoading={isSubmitting}
        />
      )}

      {/* Delete Dialog */}
      {deletingTemplate && (
        <TemplateDeleteDialog
          isOpen={!!deletingTemplate}
          template={deletingTemplate}
          onClose={() => setDeletingTemplate(null)}
          onConfirm={handleDelete}
          isLoading={isSubmitting}
        />
      )}

      {/* Text Review Modal */}
      <TemplateTextReviewModal
        template={viewingTextTemplate}
        isOpen={!!viewingTextTemplate}
        onClose={() => setViewingTextTemplate(null)}
        onSave={handleSaveMarkdown}
        onReExtract={handleReExtract}
      />
    </div>
  );
}

export default DashboardMinutasPadrao;
