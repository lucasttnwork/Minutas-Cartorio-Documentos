-- Migration: Adicionar campos de extração de texto para minutas_padrao
-- Esta migration adiciona suporte para armazenar texto extraído de PDFs/DOCX
-- IMPORTANTE: Preserva todos os dados existentes

-- 1. Adicionar campos de texto extraído (nullable por padrão)
ALTER TABLE public.minutas_padrao
ADD COLUMN IF NOT EXISTS texto_extraido TEXT,
ADD COLUMN IF NOT EXISTS conteudo_markdown TEXT,
ADD COLUMN IF NOT EXISTS status_extracao TEXT DEFAULT 'pendente',
ADD COLUMN IF NOT EXISTS erro_extracao TEXT,
ADD COLUMN IF NOT EXISTS extraido_em TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS revisado_em TIMESTAMPTZ;

-- 2. Adicionar CHECK constraint para status_extracao
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_status_extracao_values'
  ) THEN
    ALTER TABLE public.minutas_padrao
    ADD CONSTRAINT check_status_extracao_values
    CHECK (status_extracao IN ('pendente', 'extraindo', 'extraido', 'erro', 'revisado'));
  END IF;
END $$;

-- 3. Atualizar registros existentes para ter status_extracao = 'pendente'
UPDATE public.minutas_padrao
SET status_extracao = 'pendente'
WHERE status_extracao IS NULL;

-- 4. Agora tornar status_extracao NOT NULL
ALTER TABLE public.minutas_padrao
ALTER COLUMN status_extracao SET NOT NULL;

-- 5. Tornar campos de arquivo opcionais (para templates criados via texto colado)
-- Verificar se a coluna tem NOT NULL antes de tentar remover
DO $$
BEGIN
  -- storage_path
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'minutas_padrao'
    AND column_name = 'storage_path' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.minutas_padrao ALTER COLUMN storage_path DROP NOT NULL;
  END IF;

  -- nome_original
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'minutas_padrao'
    AND column_name = 'nome_original' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.minutas_padrao ALTER COLUMN nome_original DROP NOT NULL;
  END IF;

  -- mime_type
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'minutas_padrao'
    AND column_name = 'mime_type' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.minutas_padrao ALTER COLUMN mime_type DROP NOT NULL;
  END IF;

  -- tamanho_bytes
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'minutas_padrao'
    AND column_name = 'tamanho_bytes' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.minutas_padrao ALTER COLUMN tamanho_bytes DROP NOT NULL;
  END IF;
END $$;

-- 6. Constraint: deve ter arquivo OU texto
-- Usar NOT VALID primeiro para não validar dados existentes durante a criação
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_has_content'
  ) THEN
    ALTER TABLE public.minutas_padrao
    ADD CONSTRAINT check_has_content CHECK (
      storage_path IS NOT NULL OR texto_extraido IS NOT NULL
    ) NOT VALID;
  END IF;
END $$;

-- Validar constraint (dados existentes têm storage_path, então vai passar)
ALTER TABLE public.minutas_padrao VALIDATE CONSTRAINT check_has_content;

-- 7. Index para extração pendente (otimiza queries da edge function)
CREATE INDEX IF NOT EXISTS idx_minutas_padrao_status_extracao
ON public.minutas_padrao(status_extracao)
WHERE deleted_at IS NULL AND status_extracao = 'pendente';

-- 8. Função para agentes acessarem conteúdo de templates
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

-- Comentário: Após esta migration, os templates existentes terão status 'pendente'
-- e precisarão ter o texto extraído via edge function ou adicionado manualmente
