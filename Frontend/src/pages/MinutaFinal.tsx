// src/pages/MinutaFinal.tsx
import { useEffect, useCallback, useState, useMemo } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { PageHeader } from "@/components/layout/PageHeader";
import { FlowStepper } from "@/components/layout/FlowStepper";
import { FlowNavigation } from "@/components/layout/FlowNavigation";
import { SectionCard } from "@/components/layout/SectionCard";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AnimatedBackground } from "@/components/layout/AnimatedBackground";
import { useMinuta } from "@/contexts/MinutaContext";
import { useDocumentPipeline } from "@/hooks/useDocumentPipeline";
import { supabase } from "@/lib/supabase";
import {
  FileText,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Undo,
  Redo,
  Download,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Loader2,
  AlertCircle,
  Copy,
  Save,
  Users,
  Building2,
  Home,
  Clock,
  FileCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type GeracaoStatus = "pendente" | "gerando" | "gerado" | "erro";

interface MinutaDbData {
  conteudo_gerado: string | null;
  template_usado: string | null;
  geracao_status: GeracaoStatus | null;
  gerado_em: string | null;
  geracao_erro: string | null;
}

export default function MinutaFinal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    currentMinuta,
    isSaving,
    isLoading: contextLoading,
    syncError,
    loadMinutaFromDatabase,
    updateMinutaTexto,
    finalizarMinuta,
  } = useMinuta();

  const { generateMinuta, isGenerating, generationStatus } = useDocumentPipeline();

  // Local state
  const [dbData, setDbData] = useState<MinutaDbData | null>(null);
  const [isLoadingDb, setIsLoadingDb] = useState(true);
  const [isCopying, setIsCopying] = useState(false);
  const [isSavingEdits, setIsSavingEdits] = useState(false);

  // Track if we need to load from context
  const needsLoad = id && (!currentMinuta || currentMinuta.id !== id);

  // Load minuta from database if needed
  useEffect(() => {
    if (needsLoad && id) {
      loadMinutaFromDatabase(id);
    }
  }, [id, needsLoad, loadMinutaFromDatabase]);

  // Load database metadata (generation status, timestamps, etc)
  const loadDbData = useCallback(async () => {
    if (!id) return;

    setIsLoadingDb(true);
    try {
      const { data, error } = await supabase
        .from("minutas")
        .select("conteudo_gerado, template_usado, geracao_status, gerado_em, geracao_erro")
        .eq("id", id)
        .single();

      if (error) {
        console.error("[MinutaFinal] Error loading db data:", error);
      } else {
        setDbData(data as MinutaDbData);
      }
    } catch (err) {
      console.error("[MinutaFinal] Failed to load db data:", err);
    } finally {
      setIsLoadingDb(false);
    }
  }, [id]);

  useEffect(() => {
    if (id && !needsLoad) {
      loadDbData();
    }
  }, [id, needsLoad, loadDbData]);

  // Calculate data summary
  const dataSummary = useMemo(() => {
    if (!currentMinuta) return null;

    const totalOutorgantes =
      currentMinuta.outorgantes.pessoasNaturais.length +
      currentMinuta.outorgantes.pessoasJuridicas.length;
    const totalOutorgados =
      currentMinuta.outorgados.pessoasNaturais.length +
      currentMinuta.outorgados.pessoasJuridicas.length;
    const totalImoveis = currentMinuta.imoveis.length;
    const totalNegocios = currentMinuta.negociosJuridicos.length;

    return {
      outorgantes: totalOutorgantes,
      outorgados: totalOutorgados,
      imoveis: totalImoveis,
      negocios: totalNegocios,
    };
  }, [currentMinuta]);

  // Check if already has generated content
  const hasGeneratedContent = useMemo(() => {
    return !!(dbData?.conteudo_gerado && dbData.conteudo_gerado.length > 100);
  }, [dbData?.conteudo_gerado]);

  // Fallback: generate basic template from local data
  const generateDefaultMinuta = useCallback(() => {
    if (!currentMinuta) return "<p>Carregando...</p>";

    const outorgantes = currentMinuta.outorgantes.pessoasNaturais
      .map(
        (p) =>
          `<p><strong>${p.nome || "[NOME]"}</strong>, ${p.nacionalidade || "[NACIONALIDADE]"}, ${p.profissao || "[PROFISSAO]"}, ${p.dadosFamiliares?.estadoCivil || "[ESTADO CIVIL]"}, portador(a) do RG no ${p.rg || "[RG]"} e CPF no ${p.cpf || "[CPF]"}, residente e domiciliado(a) em ${p.domicilio?.logradouro || "[ENDERECO]"}, no ${p.domicilio?.numero || "[No]"}, ${p.domicilio?.bairro || "[BAIRRO]"}, ${p.domicilio?.cidade || "[CIDADE]"}-${p.domicilio?.estado || "[UF]"}.</p>`
      )
      .join("");

    const outorgantesJuridicos = currentMinuta.outorgantes.pessoasJuridicas
      .map(
        (p) =>
          `<p><strong>${p.razaoSocial || "[RAZAO SOCIAL]"}</strong>, pessoa juridica de direito privado, inscrita no CNPJ sob no ${p.cnpj || "[CNPJ]"}, com sede em ${p.endereco?.logradouro || "[ENDERECO]"}, no ${p.endereco?.numero || "[No]"}, ${p.endereco?.bairro || "[BAIRRO]"}, ${p.endereco?.cidade || "[CIDADE]"}-${p.endereco?.estado || "[UF]"}.</p>`
      )
      .join("");

    const outorgados = currentMinuta.outorgados.pessoasNaturais
      .map(
        (p) =>
          `<p><strong>${p.nome || "[NOME]"}</strong>, ${p.nacionalidade || "[NACIONALIDADE]"}, ${p.profissao || "[PROFISSAO]"}, ${p.dadosFamiliares?.estadoCivil || "[ESTADO CIVIL]"}, portador(a) do RG no ${p.rg || "[RG]"} e CPF no ${p.cpf || "[CPF]"}, residente e domiciliado(a) em ${p.domicilio?.logradouro || "[ENDERECO]"}, no ${p.domicilio?.numero || "[No]"}, ${p.domicilio?.bairro || "[BAIRRO]"}, ${p.domicilio?.cidade || "[CIDADE]"}-${p.domicilio?.estado || "[UF]"}.</p>`
      )
      .join("");

    const outorgadosJuridicos = currentMinuta.outorgados.pessoasJuridicas
      .map(
        (p) =>
          `<p><strong>${p.razaoSocial || "[RAZAO SOCIAL]"}</strong>, pessoa juridica de direito privado, inscrita no CNPJ sob no ${p.cnpj || "[CNPJ]"}, com sede em ${p.endereco?.logradouro || "[ENDERECO]"}, no ${p.endereco?.numero || "[No]"}, ${p.endereco?.bairro || "[BAIRRO]"}, ${p.endereco?.cidade || "[CIDADE]"}-${p.endereco?.estado || "[UF]"}.</p>`
      )
      .join("");

    const imoveis = currentMinuta.imoveis
      .map(
        (i) =>
          `<p>Imovel matriculado sob no <strong>${i.matricula?.numeroMatricula || "[MATRICULA]"}</strong> no ${i.matricula?.numeroRegistroImoveis || "[No]"}o Registro de Imoveis de ${i.matricula?.cidadeRegistroImoveis || "[CIDADE]"}-${i.matricula?.estadoRegistroImoveis || "[UF]"}, com area de ${i.descricao?.areaTotalM2 || "[AREA]"} m2, localizado em ${i.descricao?.endereco?.logradouro || "[ENDERECO]"}, no ${i.descricao?.endereco?.numero || "[No]"}, ${i.descricao?.endereco?.bairro || "[BAIRRO]"}, ${i.descricao?.endereco?.cidade || "[CIDADE]"}-${i.descricao?.endereco?.estado || "[UF]"}.</p>`
      )
      .join("");

    const allOutorgantes = outorgantes + outorgantesJuridicos;
    const allOutorgados = outorgados + outorgadosJuridicos;

    return `
      <h1>MINUTA DE ESCRITURA PUBLICA</h1>
      <h2>OUTORGANTES VENDEDORES:</h2>
      ${allOutorgantes || "<p>[Dados dos outorgantes nao preenchidos]</p>"}
      <h2>OUTORGADOS COMPRADORES:</h2>
      ${allOutorgados || "<p>[Dados dos outorgados nao preenchidos]</p>"}
      <h2>IMOVEL OBJETO:</h2>
      ${imoveis || "<p>[Dados do imovel nao preenchidos]</p>"}
      <h2>DO NEGOCIO:</h2>
      <p>[Inserir termos do negocio]</p>
      <h2>CLAUSULAS E CONDICOES:</h2>
      <p>[Inserir clausulas]</p>
    `;
  }, [currentMinuta]);

  // Determine initial content for editor
  const initialContent = useMemo(() => {
    // Prioritize database generated content
    if (dbData?.conteudo_gerado) {
      return dbData.conteudo_gerado;
    }
    // Fall back to context minutaTexto
    if (currentMinuta?.minutaTexto && currentMinuta.minutaTexto.length > 50) {
      return currentMinuta.minutaTexto;
    }
    // Generate default placeholder
    return generateDefaultMinuta();
  }, [dbData?.conteudo_gerado, currentMinuta?.minutaTexto, generateDefaultMinuta]);

  // TipTap editor
  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: initialContent,
    onUpdate: ({ editor: e }) => {
      updateMinutaTexto(e.getHTML());
    },
  });

  // Sync editor content when database data loads
  useEffect(() => {
    if (editor && dbData?.conteudo_gerado) {
      const currentContent = editor.getHTML();
      if (currentContent !== dbData.conteudo_gerado) {
        editor.commands.setContent(dbData.conteudo_gerado);
      }
    }
  }, [editor, dbData?.conteudo_gerado]);

  // Handle generate minuta
  const handleGenerate = useCallback(async () => {
    if (!id) return;

    toast.info("Gerando minuta com IA...", { duration: 3000 });

    const result = await generateMinuta(id, "VENDA_COMPRA");

    if (result.success && result.minuta_texto) {
      editor?.commands.setContent(result.minuta_texto);
      updateMinutaTexto(result.minuta_texto);
      toast.success("Minuta gerada com sucesso!");
      // Reload database data to get updated timestamps
      loadDbData();
    } else {
      toast.error(result.error || "Erro ao gerar minuta");
    }
  }, [id, generateMinuta, editor, updateMinutaTexto, loadDbData]);

  // Handle copy to clipboard
  const handleCopy = useCallback(async () => {
    if (!editor) return;

    setIsCopying(true);
    try {
      const text = editor.getText();
      await navigator.clipboard.writeText(text);
      toast.success("Conteudo copiado para a area de transferencia!");
    } catch {
      toast.error("Erro ao copiar conteudo");
    } finally {
      setTimeout(() => setIsCopying(false), 500);
    }
  }, [editor]);

  // Handle save edits
  const handleSave = useCallback(async () => {
    if (!id || !editor) return;

    setIsSavingEdits(true);
    try {
      const content = editor.getHTML();

      const { error } = await supabase
        .from("minutas")
        .update({
          conteudo_gerado: content,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      toast.success("Alteracoes salvas com sucesso!");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao salvar";
      toast.error(message);
    } finally {
      setIsSavingEdits(false);
    }
  }, [id, editor]);

  // Handle finalize
  const handleFinalizar = useCallback(() => {
    finalizarMinuta();
    toast.success("Minuta finalizada com sucesso!");
    navigate("/dashboard");
  }, [finalizarMinuta, navigate]);

  // Handle export
  const handleExport = useCallback(() => {
    if (!editor) return;

    const content = editor.getHTML();

    // Create a styled HTML document
    const htmlDocument = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Minuta - ${currentMinuta?.titulo || "Documento"}</title>
  <style>
    body {
      font-family: "Times New Roman", Times, serif;
      font-size: 12pt;
      line-height: 1.6;
      max-width: 21cm;
      margin: 2cm auto;
      padding: 0 1cm;
    }
    h1, h2, h3 {
      font-family: Arial, sans-serif;
      margin-top: 1.5em;
    }
    h1 { font-size: 16pt; text-align: center; }
    h2 { font-size: 14pt; }
    strong { font-weight: bold; }
    p { text-align: justify; margin: 0.5em 0; }
  </style>
</head>
<body>
${content}
</body>
</html>`;

    const blob = new Blob([htmlDocument], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `minuta-${currentMinuta?.id || "documento"}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Minuta exportada com sucesso!");
  }, [editor, currentMinuta]);

  // Format generation timestamp
  const formatGeradoEm = useCallback((dateString: string | null | undefined) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return date.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return null;
    }
  }, []);

  // Loading state
  if (contextLoading || needsLoad || isLoadingDb) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-muted-foreground">Carregando minuta...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (syncError) {
    return (
      <div className="p-4 md:p-8 min-h-screen bg-background">
        <div className="max-w-2xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro ao carregar dados</AlertTitle>
            <AlertDescription>{syncError}</AlertDescription>
          </Alert>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/dashboard")}>
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // No minuta loaded
  if (!currentMinuta) {
    return <Navigate to="/dashboard" replace />;
  }

  // No editor loaded yet
  if (!editor) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-muted-foreground">Carregando editor...</span>
        </div>
      </div>
    );
  }

  const geradoEmFormatted = formatGeradoEm(dbData?.gerado_em);

  return (
    <AnimatedBackground starCount={50} showGradient={true} className="min-h-screen">
      <main className="p-4 md:p-8 pb-24">
        <div className="max-w-7xl mx-auto form-container-elevated">
          <PageHeader
            title="MINUTA FINAL"
            instruction="Revise e edite o documento final antes de finalizar."
          />

          <div className="mb-8 bg-card/90 backdrop-blur-sm rounded-xl p-4 border border-border shadow-md">
            <FlowStepper currentStep="minuta" />
          </div>

          {/* Generation Status & Data Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Generation Status Card */}
            <SectionCard
              variant="elevated"
              title={
                <div className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-primary" />
                  <span>Status da Geracao</span>
                </div>
              }
            >
              <div className="space-y-3">
                {hasGeneratedContent ? (
                  <>
                    <div className="flex items-center gap-2 text-success">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-sm font-medium">Minuta Gerada</span>
                    </div>
                    {geradoEmFormatted && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">Gerada em: {geradoEmFormatted}</span>
                      </div>
                    )}
                    {dbData?.template_usado && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <FileText className="w-4 h-4" />
                        <span className="text-sm">
                          Template: {dbData.template_usado.replace(/_/g, " ")}
                        </span>
                      </div>
                    )}
                  </>
                ) : isGenerating || generationStatus.status === "generating" ? (
                  <div className="flex items-center gap-2 text-primary">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm font-medium">Gerando minuta...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">Minuta ainda nao foi gerada via IA</span>
                  </div>
                )}

                {(generationStatus.error || dbData?.geracao_erro) && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      {generationStatus.error || dbData?.geracao_erro}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </SectionCard>

            {/* Data Summary Card */}
            <SectionCard
              variant="elevated"
              title={
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  <span>Dados Utilizados</span>
                </div>
              }
            >
              {dataSummary && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-green-500" />
                    <span>{dataSummary.outorgantes} Outorgante(s)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span>{dataSummary.outorgados} Outorgado(s)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Home className="w-4 h-4 text-amber-500" />
                    <span>{dataSummary.imoveis} Imovel(is)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="w-4 h-4 text-purple-500" />
                    <span>{dataSummary.negocios} Negocio(s)</span>
                  </div>
                </div>
              )}

              {/* Link to edit data */}
              <div className="mt-4 pt-3 border-t border-border">
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs text-muted-foreground hover:text-primary"
                  onClick={() => navigate(`/minuta/${id}/outorgantes`)}
                >
                  Editar dados da minuta
                </Button>
              </div>
            </SectionCard>
          </div>

          {/* Editor Section */}
          <SectionCard
            variant="featured"
            title={
              <div className="flex items-center justify-between w-full flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <span>Editor de Minuta</span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Generate/Regenerate */}
                  {hasGeneratedContent ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleGenerate}
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          Gerando...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 mr-1" />
                          Regenerar
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          Gerando...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-1" />
                          Gerar Minuta
                        </>
                      )}
                    </Button>
                  )}

                  {/* Copy */}
                  <Button size="sm" variant="outline" onClick={handleCopy} disabled={isCopying}>
                    {isCopying ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <Copy className="w-4 h-4 mr-1" />
                    )}
                    Copiar
                  </Button>

                  {/* Save */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSave}
                    disabled={isSavingEdits}
                  >
                    {isSavingEdits ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-1" />
                    )}
                    Salvar
                  </Button>

                  {/* Export */}
                  <Button size="sm" variant="outline" onClick={handleExport}>
                    <Download className="w-4 h-4 mr-1" />
                    Exportar
                  </Button>

                  {/* Finalize */}
                  <Button
                    size="sm"
                    onClick={handleFinalizar}
                    className="bg-success hover:bg-success/90"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Finalizar
                  </Button>
                </div>
              </div>
            }
          >
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border mb-4 bg-secondary/20 rounded-t-lg">
              <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={cn(
                  "p-2 rounded hover:bg-secondary transition-colors",
                  editor.isActive("bold") && "bg-secondary text-primary"
                )}
                title="Negrito"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={cn(
                  "p-2 rounded hover:bg-secondary transition-colors",
                  editor.isActive("italic") && "bg-secondary text-primary"
                )}
                title="Italico"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={cn(
                  "p-2 rounded hover:bg-secondary transition-colors",
                  editor.isActive("underline") && "bg-secondary text-primary"
                )}
                title="Sublinhado"
              >
                <UnderlineIcon className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-border mx-2" />
              <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={cn(
                  "p-2 rounded hover:bg-secondary transition-colors",
                  editor.isActive("bulletList") && "bg-secondary text-primary"
                )}
                title="Lista com marcadores"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={cn(
                  "p-2 rounded hover:bg-secondary transition-colors",
                  editor.isActive("orderedList") && "bg-secondary text-primary"
                )}
                title="Lista numerada"
              >
                <ListOrdered className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-border mx-2" />
              <button
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                className="p-2 rounded hover:bg-secondary disabled:opacity-50 transition-colors"
                title="Desfazer"
              >
                <Undo className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                className="p-2 rounded hover:bg-secondary disabled:opacity-50 transition-colors"
                title="Refazer"
              >
                <Redo className="w-4 h-4" />
              </button>
            </div>

            {/* Editor */}
            <div className="prose prose-sm dark:prose-invert max-w-none min-h-[500px] p-6 border border-border rounded-lg bg-background/50 backdrop-blur-sm">
              <EditorContent editor={editor} className="min-h-[500px] outline-none" />
            </div>
          </SectionCard>

          <FlowNavigation currentStep="minuta" isSaving={isSaving} showSaveIndicator={true} />
        </div>
      </main>
    </AnimatedBackground>
  );
}
