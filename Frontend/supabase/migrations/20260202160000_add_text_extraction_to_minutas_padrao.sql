-- Migration: Adicionar campos de extração de texto para minutas_padrao
-- Esta migration adiciona suporte para armazenar texto extraído de PDFs/DOCX

-- 1. Adicionar campos de texto extraído
ALTER TABLE public.minutas_padrao
ADD COLUMN IF NOT EXISTS texto_extraido TEXT,
ADD COLUMN IF NOT EXISTS conteudo_markdown TEXT,
ADD COLUMN IF NOT EXISTS status_extracao TEXT NOT NULL DEFAULT 'pendente'
  CHECK (status_extracao IN ('pendente', 'extraindo', 'extraido', 'erro', 'revisado')),
ADD COLUMN IF NOT EXISTS erro_extracao TEXT,
ADD COLUMN IF NOT EXISTS extraido_em TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS revisado_em TIMESTAMPTZ;

-- 2. Tornar campos de arquivo opcionais (para templates criados via texto colado)
ALTER TABLE public.minutas_padrao
ALTER COLUMN storage_path DROP NOT NULL;

ALTER TABLE public.minutas_padrao
ALTER COLUMN nome_original DROP NOT NULL;

ALTER TABLE public.minutas_padrao
ALTER COLUMN mime_type DROP NOT NULL;

ALTER TABLE public.minutas_padrao
ALTER COLUMN tamanho_bytes DROP NOT NULL;

-- 3. Constraint: deve ter arquivo OU texto
ALTER TABLE public.minutas_padrao
ADD CONSTRAINT check_has_content CHECK (
  storage_path IS NOT NULL OR texto_extraido IS NOT NULL
);

-- 4. Index para extração pendente (otimiza queries da edge function)
CREATE INDEX IF NOT EXISTS idx_minutas_padrao_status_extracao
ON public.minutas_padrao(status_extracao)
WHERE deleted_at IS NULL AND status_extracao = 'pendente';

-- 5. Função para agentes acessarem conteúdo de templates
CREATE OR REPLACE FUNCTION public.get_template_content(p_template_id uuid)
RETURNS TABLE (id uuid, nome text, tipo_negocio text, conteudo text)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT m.id, m.nome, m.tipo_negocio,
         COALESCE(m.conteudo_markdown, m.texto_extraido) as conteudo
  FROM public.minutas_padrao m
  WHERE m.id = p_template_id
    AND m.deleted_at IS NULL
    AND (m.is_global = true OR m.user_id = auth.uid())
    AND m.status_extracao IN ('extraido', 'revisado');
$$;

-- 6. Atualizar templates globais existentes para ter status_extracao = 'pendente'
-- (Templates sem arquivo precisam ter texto_extraido para satisfazer constraint)
UPDATE public.minutas_padrao
SET status_extracao = 'pendente'
WHERE is_global = true AND texto_extraido IS NULL;

-- Comentário: Para templates globais existentes que não têm arquivo,
-- eles precisarão ter o texto adicionado manualmente ou via outra migration
