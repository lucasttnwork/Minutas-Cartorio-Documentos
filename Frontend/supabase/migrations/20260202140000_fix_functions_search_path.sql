-- =====================================================
-- Migration: Fix search_path security for functions
-- Issue: Functions should have immutable search_path
-- Applied: 2026-02-02
-- =====================================================

-- Fix handle_updated_at function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix increment_template_usage function
CREATE OR REPLACE FUNCTION public.increment_template_usage(p_template_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.minutas_padrao
  SET uso_count = uso_count + 1
  WHERE id = p_template_id
    AND deleted_at IS NULL
    AND (is_global = true OR user_id = auth.uid());
END;
$$;

-- Fix get_available_templates function
CREATE OR REPLACE FUNCTION public.get_available_templates(p_tipo_negocio text DEFAULT NULL)
RETURNS TABLE (
  id uuid,
  nome text,
  descricao text,
  tipo_negocio text,
  is_global boolean,
  storage_path text,
  nome_original text,
  mime_type text,
  tamanho_bytes bigint,
  thumbnail_path text,
  uso_count integer,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    m.id,
    m.nome,
    m.descricao,
    m.tipo_negocio,
    m.is_global,
    m.storage_path,
    m.nome_original,
    m.mime_type,
    m.tamanho_bytes,
    m.thumbnail_path,
    m.uso_count,
    m.created_at
  FROM public.minutas_padrao m
  WHERE m.deleted_at IS NULL
    AND (m.is_global = true OR m.user_id = auth.uid())
    AND (p_tipo_negocio IS NULL OR m.tipo_negocio = p_tipo_negocio)
  ORDER BY
    m.is_global DESC,
    m.uso_count DESC,
    m.nome;
$$;

-- Fix soft_delete_template function
CREATE OR REPLACE FUNCTION public.soft_delete_template(p_template_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.minutas_padrao
  SET deleted_at = now()
  WHERE id = p_template_id
    AND user_id = auth.uid()
    AND is_global = false
    AND deleted_at IS NULL;

  RETURN FOUND;
END;
$$;
