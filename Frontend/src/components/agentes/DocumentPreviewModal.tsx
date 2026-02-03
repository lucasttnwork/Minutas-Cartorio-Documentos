// src/components/agentes/DocumentPreviewModal.tsx
// Modal para preview de documentos (imagens, PDF, TXT, DOCX)

import { useState, useEffect, useCallback } from 'react';
import { X, Download, FileText, Image as ImageIcon, File, Loader2, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { ArquivoUpload } from '@/types/agente';

interface DocumentPreviewModalProps {
  arquivo: ArquivoUpload | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type PreviewType = 'image' | 'pdf' | 'text' | 'unsupported';

function getPreviewType(mimeType: string): PreviewType {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType === 'text/plain' || mimeType === 'text/csv') return 'text';
  return 'unsupported';
}

function getFileIcon(tipo: string) {
  if (tipo.startsWith('image/')) return ImageIcon;
  if (tipo === 'application/pdf') return FileText;
  return File;
}

export function DocumentPreviewModal({ arquivo, open, onOpenChange }: DocumentPreviewModalProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const previewType = arquivo ? getPreviewType(arquivo.tipo) : 'unsupported';

  // Cleanup object URLs on unmount or when arquivo changes
  useEffect(() => {
    if (!arquivo || !open) {
      setObjectUrl(null);
      setTextContent(null);
      setIsLoading(true);
      setZoom(1);
      setRotation(0);
      return;
    }

    const loadPreview = async () => {
      setIsLoading(true);

      try {
        if (previewType === 'image' || previewType === 'pdf') {
          const url = URL.createObjectURL(arquivo.file);
          setObjectUrl(url);
        } else if (previewType === 'text') {
          const text = await arquivo.file.text();
          setTextContent(text);
        }
      } catch (error) {
        console.error('Error loading preview:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreview();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [arquivo, open, previewType]);

  const handleDownload = useCallback(() => {
    if (!arquivo) return;

    const url = URL.createObjectURL(arquivo.file);
    const a = document.createElement('a');
    a.href = url;
    a.download = arquivo.nome;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [arquivo]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  if (!arquivo) return null;

  const FileIcon = getFileIcon(arquivo.tipo);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <DialogHeader className="flex-shrink-0 px-4 py-3 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileIcon className="w-5 h-5 text-muted-foreground" />
              <DialogTitle className="text-base font-medium truncate max-w-[400px]">
                {arquivo.nome}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Preview do arquivo {arquivo.nome}. Use os controles para zoom e rotacao.
              </DialogDescription>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                {formatFileSize(arquivo.tamanho)}
              </span>
            </div>

            <div className="flex items-center gap-1">
              {previewType === 'image' && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleZoomOut}
                    aria-label={`Diminuir zoom da imagem para ${Math.round((zoom - 0.25) * 100)}%`}
                    disabled={zoom <= 0.5}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-xs text-muted-foreground min-w-[40px] text-center" aria-live="polite">
                    {Math.round(zoom * 100)}%
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleZoomIn}
                    aria-label={`Aumentar zoom da imagem para ${Math.round((zoom + 0.25) * 100)}%`}
                    disabled={zoom >= 3}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRotate}
                    aria-label={`Rotacionar imagem 90 graus para ${(rotation + 90) % 360} graus`}
                  >
                    <RotateCw className="w-4 h-4" />
                  </Button>
                  <div className="w-px h-4 bg-border mx-1" />
                </>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                aria-label={`Baixar arquivo ${arquivo.nome}`}
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                aria-label="Fechar preview do documento"
                className="h-9 w-9"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-muted/30 flex items-center justify-center p-4">
          {isLoading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Carregando preview...</p>
            </div>
          ) : (
            <>
              {/* Image Preview */}
              {previewType === 'image' && objectUrl && (
                <div
                  className="max-w-full max-h-full overflow-auto flex items-center justify-center"
                  style={{
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    transition: 'transform 0.2s ease-out'
                  }}
                >
                  <img
                    src={objectUrl}
                    alt={arquivo.nome}
                    className="max-w-full max-h-full object-contain rounded shadow-lg"
                  />
                </div>
              )}

              {/* PDF Preview */}
              {previewType === 'pdf' && objectUrl && (
                <iframe
                  src={objectUrl}
                  title={arquivo.nome}
                  className="w-full h-full rounded border border-border bg-white"
                />
              )}

              {/* Text Preview */}
              {previewType === 'text' && textContent !== null && (
                <div className="w-full h-full overflow-auto">
                  <pre className="font-mono text-sm whitespace-pre-wrap break-words p-4 bg-card rounded border border-border">
                    {textContent}
                  </pre>
                </div>
              )}

              {/* Unsupported Format */}
              {previewType === 'unsupported' && (
                <div className="text-center p-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <File className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium mb-2">Preview não disponível</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {arquivo.tipo === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                      ? 'Arquivos DOCX não podem ser visualizados diretamente.'
                      : `O formato ${arquivo.tipo || 'desconhecido'} não é suportado para preview.`
                    }
                  </p>
                  <Button onClick={handleDownload} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Baixar arquivo
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
