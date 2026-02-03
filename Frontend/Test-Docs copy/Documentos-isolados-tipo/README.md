# Documentos Isolados por Tipo

Organizacao automatizada de documentos de escrituras por tipo, facilitando localizacao rapida e treinamento de modelos de IA.

## Estrutura de Nomenclatura

Os arquivos seguem o padrao:
```
{TIPO}_{PESSOA}_{ORIGEM}[_pg{N}].{ext}
```

| Campo | Descricao | Exemplo |
|-------|-----------|---------|
| TIPO | Tipo do documento | `RG`, `CNDT`, `ITBI` |
| PESSOA | Nome da pessoa (se identificavel) | `MARINA_AYUB` |
| ORIGEM | Codigo da escritura de origem | `FC515`, `GS357` |
| pg{N} | Numero sequencial (se multiplas paginas) | `_pg2`, `_pg3` |

## Tipos de Documentos (26)

### Documentos Pessoais (7)
| Pasta | Descricao | Qtd |
|-------|-----------|-----|
| `RG/` | Carteira de Identidade | 8 |
| `CNH/` | Carteira Nacional de Habilitacao | 1 |
| `CPF/` | Cadastro de Pessoa Fisica | - |
| `CERTIDAO_NASCIMENTO/` | Certidao de Nascimento | 2 |
| `CERTIDAO_CASAMENTO/` | Certidao de Casamento | 4 |
| `CERTIDAO_OBITO/` | Certidao de Obito | - |
| `COMPROVANTE_RESIDENCIA/` | Comprovante de Endereco | - |

### Certidoes (7)
| Pasta | Descricao | Qtd |
|-------|-----------|-----|
| `CNDT/` | Certidao Negativa de Debitos Trabalhistas | 5 |
| `CND_FEDERAL/` | CND da Receita Federal/PGFN | - |
| `CND_ESTADUAL/` | CND Estadual (SEFAZ) | - |
| `CND_MUNICIPAL/` | CND Municipal (Prefeitura) | 1 |
| `CND_IMOVEL/` | CND especifica do imovel | 1 |
| `CND_CONDOMINIO/` | Declaracao de Quitacao Condominial | 1 |
| `CONTRATO_SOCIAL/` | Contrato Social de PJ | - |

### Documentos do Imovel (6)
| Pasta | Descricao | Qtd |
|-------|-----------|-----|
| `MATRICULA_IMOVEL/` | Certidao de Matricula do RI | 7 |
| `ITBI/` | Imposto de Transmissao | 5 |
| `VVR/` | Valor Venal de Referencia | 2 |
| `IPTU/` | Carne ou Certidao de IPTU | - |
| `DADOS_CADASTRAIS/` | Ficha Cadastral da Prefeitura | 3 |
| `ESCRITURA/` | Escritura Publica | - |

### Documentos do Negocio (3)
| Pasta | Descricao | Qtd |
|-------|-----------|-----|
| `COMPROMISSO_COMPRA_VENDA/` | Contrato de Compra e Venda | 4 |
| `PROCURACAO/` | Procuracao | - |
| `COMPROVANTE_PAGAMENTO/` | Comprovante de transacao | 7 |

### Documentos Administrativos (3)
| Pasta | Descricao | Qtd |
|-------|-----------|-----|
| `PROTOCOLO_ONR/` | Protocolo do SAEC/ONR | 3 |
| `ASSINATURA_DIGITAL/` | Certificado de assinatura eletronica | 2 |
| `OUTRO/` | Documentos nao classificados | 1 |

## Estatisticas Atuais

- **Total de documentos**: 57
- **Escrituras processadas**: 2 (FC515, GS357)
- **Data da organizacao**: 2026-01-30

### Documentos por Tipo
```
RG                      8
COMPROVANTE_PAGAMENTO   7
MATRICULA_IMOVEL        7
CNDT                    5
ITBI                    5
CERTIDAO_CASAMENTO      4
COMPROMISSO_COMPRA_VENDA 4
DADOS_CADASTRAIS        3
PROTOCOLO_ONR           3
ASSINATURA_DIGITAL      2
CERTIDAO_NASCIMENTO     2
VVR                     2
CND_CONDOMINIO          1
CND_IMOVEL              1
CND_MUNICIPAL           1
CNH                     1
OUTRO                   1
```

## Como Adicionar Novos Documentos

1. Coloque a nova pasta de escritura em `Test-Docs/`
2. Execute o inventario:
   ```bash
   python execution/inventory_files.py "Test-Docs/NOVA_PASTA"
   ```
3. Use Claude Code com sub-agentes para classificar os documentos
4. Execute a organizacao:
   ```bash
   python execution/organize_by_type.py
   ```

## Rastreabilidade

O manifesto completo com o mapeamento origem->destino esta em:
`.tmp/classificacoes/manifesto_organizacao.json`

## Referencia

Para detalhes sobre cada tipo de documento, consulte:
`directives/02_tipos_documentos.md`
