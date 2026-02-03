-- ============================================================================
-- SEED: Templates Globais de Minutas Padrao
-- ============================================================================
-- Insere 3 templates globais padrao para uso do sistema.
-- Estes templates ficam disponiveis para todos os usuarios.
-- ============================================================================

-- Template 1: Escritura de Compra e Venda
insert into public.minutas_padrao (
  user_id,
  is_global,
  nome,
  descricao,
  tipo_negocio,
  storage_path,
  nome_original,
  mime_type,
  tamanho_bytes
) values (
  null, -- null para global
  true,
  'Escritura de Compra e Venda - Modelo Padrao',
  'Modelo padrao de escritura publica de compra e venda de imovel. Inclui clausulas padrao de preco, forma de pagamento, transmissao de posse e responsabilidades das partes.',
  'compra_venda',
  'global/compra-venda-padrao.pdf',
  'compra-venda-padrao.pdf',
  'application/pdf',
  0 -- Placeholder - sera atualizado quando arquivo real for uploadado
);

-- Template 2: Escritura de Doacao
insert into public.minutas_padrao (
  user_id,
  is_global,
  nome,
  descricao,
  tipo_negocio,
  storage_path,
  nome_original,
  mime_type,
  tamanho_bytes
) values (
  null, -- null para global
  true,
  'Escritura de Doacao - Modelo Padrao',
  'Modelo padrao de escritura publica de doacao de imovel. Contempla doacao pura e simples, com clausulas de reserva de usufruto vitalicio e reversao.',
  'doacao',
  'global/doacao-padrao.pdf',
  'doacao-padrao.pdf',
  'application/pdf',
  0 -- Placeholder - sera atualizado quando arquivo real for uploadado
);

-- Template 3: Escritura de Permuta
insert into public.minutas_padrao (
  user_id,
  is_global,
  nome,
  descricao,
  tipo_negocio,
  storage_path,
  nome_original,
  mime_type,
  tamanho_bytes
) values (
  null, -- null para global
  true,
  'Escritura de Permuta - Modelo Padrao',
  'Modelo padrao de escritura publica de permuta de imoveis. Inclui clausulas de descricao dos imoveis permutados, valores para fins fiscais e eventuais tornas.',
  'permuta',
  'global/permuta-padrao.pdf',
  'permuta-padrao.pdf',
  'application/pdf',
  0 -- Placeholder - sera atualizado quando arquivo real for uploadado
);
