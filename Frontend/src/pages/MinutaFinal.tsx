// src/pages/MinutaFinal.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { PageHeader } from "@/components/layout/PageHeader";
import { FlowStepper } from "@/components/layout/FlowStepper";
import { FlowNavigation } from "@/components/layout/FlowNavigation";
import { SectionCard } from "@/components/layout/SectionCard";
import { Button } from "@/components/ui/button";
import { useMinuta } from "@/contexts/MinutaContext";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function MinutaFinal() {
  const navigate = useNavigate();
  const { currentMinuta, isSaving, updateMinutaTexto, finalizarMinuta } = useMinuta();

  const generateDefaultMinuta = () => {
    if (!currentMinuta) return '<p>Carregando...</p>';

    const outorgantes = currentMinuta.outorgantes.pessoasNaturais
      .map(p => `<p><strong>${p.nome || '[NOME]'}</strong>, ${p.nacionalidade || '[NACIONALIDADE]'}, ${p.profissao || '[PROFISSAO]'}, ${p.estadoCivil || '[ESTADO CIVIL]'}, portador(a) do RG no ${p.rg || '[RG]'} e CPF no ${p.cpf || '[CPF]'}, residente e domiciliado(a) em ${p.domicilio?.logradouro || '[ENDERECO]'}, no ${p.domicilio?.numero || '[No]'}, ${p.domicilio?.bairro || '[BAIRRO]'}, ${p.domicilio?.cidade || '[CIDADE]'}-${p.domicilio?.estado || '[UF]'}.</p>`)
      .join('');

    const outorgantesJuridicos = currentMinuta.outorgantes.pessoasJuridicas
      .map(p => `<p><strong>${p.razaoSocial || '[RAZAO SOCIAL]'}</strong>, pessoa juridica de direito privado, inscrita no CNPJ sob no ${p.cnpj || '[CNPJ]'}, com sede em ${p.endereco?.logradouro || '[ENDERECO]'}, no ${p.endereco?.numero || '[No]'}, ${p.endereco?.bairro || '[BAIRRO]'}, ${p.endereco?.cidade || '[CIDADE]'}-${p.endereco?.estado || '[UF]'}.</p>`)
      .join('');

    const outorgados = currentMinuta.outorgados.pessoasNaturais
      .map(p => `<p><strong>${p.nome || '[NOME]'}</strong>, ${p.nacionalidade || '[NACIONALIDADE]'}, ${p.profissao || '[PROFISSAO]'}, ${p.estadoCivil || '[ESTADO CIVIL]'}, portador(a) do RG no ${p.rg || '[RG]'} e CPF no ${p.cpf || '[CPF]'}, residente e domiciliado(a) em ${p.domicilio?.logradouro || '[ENDERECO]'}, no ${p.domicilio?.numero || '[No]'}, ${p.domicilio?.bairro || '[BAIRRO]'}, ${p.domicilio?.cidade || '[CIDADE]'}-${p.domicilio?.estado || '[UF]'}.</p>`)
      .join('');

    const outorgadosJuridicos = currentMinuta.outorgados.pessoasJuridicas
      .map(p => `<p><strong>${p.razaoSocial || '[RAZAO SOCIAL]'}</strong>, pessoa juridica de direito privado, inscrita no CNPJ sob no ${p.cnpj || '[CNPJ]'}, com sede em ${p.endereco?.logradouro || '[ENDERECO]'}, no ${p.endereco?.numero || '[No]'}, ${p.endereco?.bairro || '[BAIRRO]'}, ${p.endereco?.cidade || '[CIDADE]'}-${p.endereco?.estado || '[UF]'}.</p>`)
      .join('');

    const imoveis = currentMinuta.imoveis
      .map(i => `<p>Imovel matriculado sob no <strong>${i.matricula?.numeroMatricula || '[MATRICULA]'}</strong> no ${i.matricula?.numeroRegistroImoveis || '[No]'}o Registro de Imoveis de ${i.matricula?.cidadeRegistroImoveis || '[CIDADE]'}-${i.matricula?.estadoRegistroImoveis || '[UF]'}, com area de ${i.descricao?.areaTotalM2 || '[AREA]'} m2, localizado em ${i.descricao?.endereco?.logradouro || '[ENDERECO]'}, no ${i.descricao?.endereco?.numero || '[No]'}, ${i.descricao?.endereco?.bairro || '[BAIRRO]'}, ${i.descricao?.endereco?.cidade || '[CIDADE]'}-${i.descricao?.endereco?.estado || '[UF]'}.</p>`)
      .join('');

    const allOutorgantes = outorgantes + outorgantesJuridicos;
    const allOutorgados = outorgados + outorgadosJuridicos;

    return `
      <h1>MINUTA DE ESCRITURA PUBLICA</h1>
      <h2>OUTORGANTES VENDEDORES:</h2>
      ${allOutorgantes || '<p>[Dados dos outorgantes nao preenchidos]</p>'}
      <h2>OUTORGADOS COMPRADORES:</h2>
      ${allOutorgados || '<p>[Dados dos outorgados nao preenchidos]</p>'}
      <h2>IMOVEL OBJETO:</h2>
      ${imoveis || '<p>[Dados do imovel nao preenchidos]</p>'}
      <h2>DO NEGOCIO:</h2>
      <p>[Inserir termos do negocio]</p>
      <h2>CLAUSULAS E CONDICOES:</h2>
      <p>[Inserir clausulas]</p>
    `;
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
    ],
    content: currentMinuta?.minutaTexto || generateDefaultMinuta(),
    onUpdate: ({ editor }) => {
      updateMinutaTexto(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && currentMinuta) {
      const currentContent = editor.getHTML();
      const minutaContent = currentMinuta.minutaTexto;

      // Only update if content is empty or needs initialization
      if (!minutaContent && currentContent === '<p></p>') {
        editor.commands.setContent(generateDefaultMinuta());
      } else if (minutaContent && currentContent !== minutaContent) {
        // Only update if the stored content is different and not empty
        if (minutaContent.length > 20) {
          editor.commands.setContent(minutaContent);
        }
      }
    }
  }, [editor, currentMinuta?.id]);

  const handleFinalizar = () => {
    finalizarMinuta();
    toast.success('Minuta finalizada com sucesso!');
    navigate('/');
  };

  const handleExport = () => {
    if (!editor) return;

    const content = editor.getHTML();
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `minuta-${currentMinuta?.id || 'documento'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Minuta exportada com sucesso!');
  };

  if (!editor) return null;

  return (
    <main className="min-h-screen p-4 md:p-8 pb-24">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="MINUTA FINAL"
          instruction="Revise e edite o documento final antes de finalizar."
        />

        <div className="mb-8 bg-card rounded-xl p-4 border border-border">
          <FlowStepper currentStep="minuta" />
        </div>

        <SectionCard
          title={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                <span>Editor de Minuta</span>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={handleExport}>
                  <Download className="w-4 h-4 mr-1" /> Exportar
                </Button>
                <Button size="sm" onClick={handleFinalizar}>
                  <CheckCircle2 className="w-4 h-4 mr-1" /> Finalizar Minuta
                </Button>
              </div>
            </div>
          }
        >
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border mb-4">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={cn("p-2 rounded hover:bg-secondary", editor.isActive('bold') && "bg-secondary")}
              title="Negrito"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={cn("p-2 rounded hover:bg-secondary", editor.isActive('italic') && "bg-secondary")}
              title="Italico"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={cn("p-2 rounded hover:bg-secondary", editor.isActive('underline') && "bg-secondary")}
              title="Sublinhado"
            >
              <UnderlineIcon className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-border mx-2" />
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={cn("p-2 rounded hover:bg-secondary", editor.isActive('bulletList') && "bg-secondary")}
              title="Lista com marcadores"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={cn("p-2 rounded hover:bg-secondary", editor.isActive('orderedList') && "bg-secondary")}
              title="Lista numerada"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-border mx-2" />
            <button
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className="p-2 rounded hover:bg-secondary disabled:opacity-50"
              title="Desfazer"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className="p-2 rounded hover:bg-secondary disabled:opacity-50"
              title="Refazer"
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>

          {/* Editor */}
          <div className="prose prose-sm dark:prose-invert max-w-none min-h-[500px] p-4 border border-border rounded-lg bg-background">
            <EditorContent editor={editor} className="min-h-[500px] outline-none" />
          </div>
        </SectionCard>

        <FlowNavigation currentStep="minuta" isSaving={isSaving} showSaveIndicator={true} />
      </div>
    </main>
  );
}
