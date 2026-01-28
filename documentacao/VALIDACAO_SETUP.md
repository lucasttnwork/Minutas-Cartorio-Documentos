# Guia de Validação de Setup

**Data:** 2026-01-28 | **Status:** Pronto para Uso | **Versão:** 1.0

---

## 📋 Checklist Completo de Setup

### Etapa 1: Verificação do Ambiente Python

```bash
# 1.1 Verificar versão Python
python --version
# Esperado: Python 3.8 ou superior
# Exemplo: Python 3.10.11

# 1.2 Verificar pip
pip --version
# Esperado: pip 23.0 ou superior

# 1.3 Verificar localização do Python
which python  # Linux/macOS
# ou
where python  # Windows
```

**Status de Aprovação:**
- [x] Python 3.8+
- [x] pip disponível
- [x] Acesso ao gerenciador de pacotes

---

### Etapa 2: Instalação de Dependências

```bash
# 2.1 Navegar até pasta do projeto
cd "C:\Users\Lucas\OneDrive\Documentos\PROJETOS - CODE\GOOGLE ANTIGRAVITY PROJECTS\Minutas-Cartorio-Documentos"

# 2.2 Instalar todas as dependências de uma vez
pip install -r execution/requirements.txt
# Esperado: Successfully installed [6 packages]

# 2.3 Verificação pós-instalação
pip list | grep -E "google|Pillow|PyMuPDF|docx2pdf"
```

**Saída esperada:**
```
docx2pdf                  0.1.8
google-api-core           [version]
google-cloud-documentai   2.20.1
google-generativeai       0.5.0
google-auth              [version]
Pillow                    10.1.0
PyMuPDF                   1.24.0
python-dotenv             1.0.0
```

**Status de Aprovação:**
- [x] Todas as 6 dependências instaladas
- [x] Versões atendem ao requirements.txt

---

### Etapa 3: Configuração de Variáveis de Ambiente

```bash
# 3.1 Verificar se arquivo .env existe
ls -la .env  # Linux/macOS
# ou
dir .env     # Windows

# 3.2 Se não existir, copiar do exemplo e preencher com seus valores
cp .env.example .env
# Edite o arquivo .env com seus valores reais:
# nano .env  # ou use seu editor preferido
#
# IMPORTANTE: Veja .env.example para a lista de variáveis necessárias
# NUNCA commite o arquivo .env com valores reais!

# 3.3 Verificar conteúdo
cat .env
```

**Variáveis obrigatórias:** (veja .env.example para detalhes)
```
GOOGLE_APPLICATION_CREDENTIALS=credentials/[SEU_ARQUIVO_CREDENCIAIS].json
GOOGLE_PROJECT_ID=[SEU_PROJECT_ID]
DOCUMENT_AI_PROCESSOR_ID=[SEU_PROCESSOR_ID]
DOCUMENT_AI_LOCATION=us
GEMINI_API_KEY=[SUA_GEMINI_API_KEY]
GEMINI_MODEL=gemini-3-flash-preview
GEMINI_MODEL_FALLBACK=gemini-2.5-flash
```

**Status de Aprovação:**
- [x] Arquivo .env existe
- [x] 5 variáveis presentes
- [x] Valores não vazios

---

### Etapa 4: Validação de Credenciais

```bash
# 4.1 Verificar se arquivo de credenciais existe
# Substitua [SEU_ARQUIVO] pelo nome do seu arquivo de credenciais
ls -la credentials/[SEU_ARQUIVO_CREDENCIAIS].json
# ou
dir credentials\[SEU_ARQUIVO_CREDENCIAIS].json  # Windows

# 4.2 Verificar formato JSON
python -c "import json; import os; json.load(open(os.getenv('GOOGLE_APPLICATION_CREDENTIALS')))"
# Esperado: Sem erro (retorna sem saída)

# 4.3 Verificar campo obrigatório
python -c "import json; import os; d = json.load(open(os.getenv('GOOGLE_APPLICATION_CREDENTIALS'))); print('✓ tipo:', d['type'])"
```

**Campos esperados no JSON:**
```json
{
  "type": "service_account",
  "project_id": "[SEU_PROJECT_ID]",
  "private_key_id": "[id]",
  "private_key": "[chave_privada]",
  "client_email": "[email_service_account]",
  "client_id": "[id]",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "[url]"
}
```

**Status de Aprovação:**
- [x] Arquivo JSON existe
- [x] JSON é válido
- [x] Campos obrigatórios presentes

---

### Etapa 5: Teste de Importações

```bash
# 5.1 Teste individual de cada dependência
python << 'EOF'
import sys

tests = [
    ("google.cloud.documentai", "Document AI"),
    ("google.generativeai", "Gemini AI"),
    ("dotenv", "python-dotenv"),
    ("PIL", "Pillow"),
    ("fitz", "PyMuPDF"),
    ("docx2pdf", "docx2pdf"),
]

results = []
for module, name in tests:
    try:
        __import__(module)
        print(f"✓ {name:20} OK")
        results.append(True)
    except ImportError as e:
        print(f"✗ {name:20} FALHA: {e}")
        results.append(False)

print(f"\nTotal: {sum(results)}/{len(results)} OK")
sys.exit(0 if all(results) else 1)
EOF
```

**Saída esperada:**
```
✓ Document AI         OK
✓ Gemini AI          OK
✓ python-dotenv      OK
✓ Pillow             OK
✓ PyMuPDF            OK
✓ docx2pdf           OK

Total: 6/6 OK
```

**Status de Aprovação:**
- [x] Todas as 6 importações bem-sucedidas
- [x] Nenhuma falha de módulo

---

### Etapa 6: Teste de Carregamento de Variáveis

```bash
# 6.1 Teste de carregamento .env
python << 'EOF'
from dotenv import load_dotenv
import os

load_dotenv()

vars_needed = [
    "GOOGLE_APPLICATION_CREDENTIALS",
    "GOOGLE_PROJECT_ID",
    "DOCUMENT_AI_PROCESSOR_ID",
    "DOCUMENT_AI_LOCATION",
    "GEMINI_API_KEY"
]

results = []
for var in vars_needed:
    value = os.getenv(var)
    if value:
        # Mostrar primeiros 20 chars (segurança)
        display = f"{value[:20]}..." if len(value) > 20 else value
        print(f"✓ {var:40} = {display}")
        results.append(True)
    else:
        print(f"✗ {var:40} FALTANDO")
        results.append(False)

print(f"\nTotal: {sum(results)}/{len(results)} OK")
EOF
```

**Saída esperada:**
```
✓ GOOGLE_APPLICATION_CREDENTIALS     = credentials/[seu-a...
✓ GOOGLE_PROJECT_ID                  = [seu-project-id]
✓ DOCUMENT_AI_PROCESSOR_ID           = [seu-processor-id]
✓ DOCUMENT_AI_LOCATION               = us
✓ GEMINI_API_KEY                     = [sua-api-key]...

Total: 5/5 OK
```

**Status de Aprovação:**
- [x] .env carregado corretamente
- [x] Todas as 5 variáveis acessíveis
- [x] Nenhuma variável faltando

---

### Etapa 7: Teste de Autenticação Google

```bash
# 7.1 Teste de autenticação Document AI
python << 'EOF'
import os
from google.cloud import documentai

try:
    # Verificar se credenciais podem ser carregadas
    credentials_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

    if not os.path.exists(credentials_path):
        print(f"✗ Arquivo de credenciais não encontrado: {credentials_path}")
    else:
        print(f"✓ Arquivo de credenciais encontrado")

        # Tentar criar cliente (não faz requisição de rede)
        from google.oauth2 import service_account
        credentials = service_account.Credentials.from_service_account_file(
            credentials_path
        )
        print(f"✓ Credenciais carregadas com sucesso")
        print(f"✓ Email de serviço: {credentials.service_account_email}")
except Exception as e:
    print(f"✗ Erro ao carregar credenciais: {e}")
EOF

# 7.2 Teste de autenticação Gemini
python << 'EOF'
import os
import google.generativeai as genai

try:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("✗ GEMINI_API_KEY não definido")
    else:
        genai.configure(api_key=api_key)
        print("✓ Gemini API configurado com sucesso")

        # Listar modelos disponíveis (conexão com API)
        models = genai.list_models()
        count = len([m for m in models if "gemini" in m.name.lower()])
        print(f"✓ {count} modelos Gemini disponíveis")
except Exception as e:
    print(f"✗ Erro ao configurar Gemini: {e}")
EOF
```

**Status de Aprovação:**
- [x] Arquivo de credenciais carregável
- [x] Credenciais validáveis
- [x] Gemini API configurável

---

### Etapa 8: Teste de Estrutura de Diretórios

```bash
# 8.1 Verificar diretórios críticos
echo "Verificando estrutura de diretórios..."

dirs=(
    "execution"
    "execution/schemas"
    "execution/prompts"
    "directives"
    "credentials"
    "Test-Docs"
)

for dir in "${dirs[@]}"; do
    if [ -d "$dir" ]; then
        echo "✓ $dir"
    else
        echo "✗ $dir FALTANDO"
    fi
done

# 8.2 Verificar arquivos críticos
files=(
    "execution/requirements.txt"
    "execution/__init__.py"
    "CLAUDE.md"
    "README.md"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✓ $file"
    else
        echo "✗ $file FALTANDO"
    fi
done

# 8.3 Contar schemas
echo ""
echo "Schemas disponíveis: $(ls execution/schemas/*.json 2>/dev/null | wc -l)"
echo "Prompts disponíveis: $(ls execution/prompts/*.txt 2>/dev/null | wc -l)"
```

**Saída esperada:**
```
Verificando estrutura de diretórios...
✓ execution
✓ execution/schemas
✓ execution/prompts
✓ directives
✓ credentials
✓ Test-Docs
✓ execution/requirements.txt
✓ execution/__init__.py
✓ CLAUDE.md
✓ README.md

Schemas disponíveis: 14
Prompts disponíveis: 15
```

**Status de Aprovação:**
- [x] Todos os diretórios principais existem
- [x] Todos os arquivos críticos presentes
- [x] 14 schemas + 15 prompts disponíveis

---

### Etapa 9: Teste de Primeira Execução (Fase 1.1)

```bash
# 9.1 Executar inventory_files.py
python execution/inventory_files.py "Test-Docs/FC 515 - 124 p280509"

# Esperado: Sem erros, arquivo gerado
# Saída: .tmp/inventarios/FC_515_124_p280509_bruto.json
```

**Verificar resultado:**
```bash
# 9.2 Verificar se arquivo foi criado
ls -la .tmp/inventarios/FC_515_124_p280509_bruto.json

# 9.3 Validar JSON
python << 'EOF'
import json
with open('.tmp/inventarios/FC_515_124_p280509_bruto.json') as f:
    data = json.load(f)
    print(f"✓ JSON válido")
    print(f"  Total arquivos: {len(data.get('arquivos', []))}")
    print(f"  Primeiro arquivo: {data['arquivos'][0]['nome_arquivo'] if data['arquivos'] else 'N/A'}")
EOF
```

**Status de Aprovação:**
- [x] Script executável (sem ModuleNotFoundError)
- [x] Arquivo .tmp/inventarios/ criado
- [x] JSON gerado é válido
- [x] Dados fazem sentido (>0 arquivos)

---

### Etapa 10: Teste de Fase 1.2 com Mock (Sem API)

```bash
# 10.1 Executar classificação em modo mock
python execution/classify_with_gemini.py FC_515_124_p280509 --mock --limit 5

# Esperado: Rápido (<10s), sem chamadas de API
# Saída: .tmp/classificacoes/FC_515_124_p280509_classificacao.json
```

**Verificar resultado:**
```bash
# 10.2 Validar saída
python << 'EOF'
import json
with open('.tmp/classificacoes/FC_515_124_p280509_classificacao.json') as f:
    data = json.load(f)
    docs = data.get('documentos', [])
    print(f"✓ {len(docs)} documentos classificados")

    # Mostrar amostra
    if docs:
        first = docs[0]
        print(f"  Exemplo: {first['nome_arquivo']} → {first['tipo_classificado']}")
EOF
```

**Status de Aprovação:**
- [x] Script executável
- [x] Modo mock funciona (sem API)
- [x] Arquivo gerado é válido
- [x] Documentos têm tipos classificados

---

## 🎯 Resumo de Status

### Checklist Final

```
SETUP VALIDATION CHECKLIST
────────────────────────────────────────────────────────────────

✓ Etapa 1: Ambiente Python
  ├─ Python 3.8+
  ├─ pip disponível
  └─ Acesso gerenciador pacotes

✓ Etapa 2: Dependências Instaladas
  ├─ google-cloud-documentai
  ├─ google-generativeai
  ├─ python-dotenv
  ├─ Pillow
  ├─ PyMuPDF
  └─ docx2pdf

✓ Etapa 3: Configuração .env
  ├─ Arquivo .env existe
  ├─ GOOGLE_APPLICATION_CREDENTIALS
  ├─ GOOGLE_PROJECT_ID
  ├─ DOCUMENT_AI_PROCESSOR_ID
  ├─ DOCUMENT_AI_LOCATION
  └─ GEMINI_API_KEY

✓ Etapa 4: Credenciais GCP
  ├─ Arquivo JSON existe
  ├─ JSON é válido
  └─ Campos obrigatórios presentes

✓ Etapa 5: Importações
  ├─ Document AI
  ├─ Gemini AI
  ├─ python-dotenv
  ├─ Pillow
  ├─ PyMuPDF
  └─ docx2pdf

✓ Etapa 6: Carregamento .env
  ├─ GOOGLE_APPLICATION_CREDENTIALS carregado
  ├─ GOOGLE_PROJECT_ID carregado
  ├─ DOCUMENT_AI_PROCESSOR_ID carregado
  ├─ DOCUMENT_AI_LOCATION carregado
  └─ GEMINI_API_KEY carregado

✓ Etapa 7: Autenticação Google
  ├─ Credenciais GCP validáveis
  ├─ Email de serviço acessível
  └─ Gemini API configurável

✓ Etapa 8: Estrutura de Diretórios
  ├─ execution/
  ├─ execution/schemas/ (14 arquivos)
  ├─ execution/prompts/ (15 arquivos)
  ├─ directives/
  ├─ credentials/
  ├─ Test-Docs/
  └─ .tmp/ (criado ao rodar)

✓ Etapa 9: Primeira Execução
  ├─ inventory_files.py funciona
  ├─ .tmp/inventarios/ criado
  └─ JSON válido gerado

✓ Etapa 10: Teste Fase 1.2 (Mock)
  ├─ classify_with_gemini.py executável
  ├─ Modo --mock funciona
  └─ Classificações geradas
```

---

## 🚀 Próximos Passos

Se todos os testes passarem:

### Fase 1: Catalogação (Completa)
```bash
# 1.1 - Inventário (já testado ✓)
python execution/inventory_files.py "Test-Docs/FC 515 - 124 p280509"

# 1.2 - Classificação (com API)
python execution/classify_with_gemini.py FC_515_124_p280509 --parallel

# 1.3 - Gerar catálogo
python execution/generate_catalog.py FC_515_124_p280509
```

### Fase 2: OCR (Com Google Document AI)
```bash
python execution/batch_ocr.py FC_515_124_p280509 --parallel --workers 4
```

### Fase 3: Extração
```bash
python execution/extract_structured.py FC_515_124_p280509
```

### Fase 4: Mapeamento
```bash
python execution/map_to_fields.py FC_515_124_p280509
```

---

## 📞 Suporte

Se alguma etapa falhar:

1. **Etapa 1-2:** `pip install --upgrade pip && pip install -r execution/requirements.txt`
2. **Etapa 3:** Verificar arquivo `.env` (não está em .gitignore de verdade?)
3. **Etapa 4:** Verificar arquivo JSON de credenciais em `credentials/`
4. **Etapa 5-6:** Executar etapa 2 novamente (reinstalar)
5. **Etapa 7:** Verificar Google Cloud Console - APIs ativas?
6. **Etapa 8:** Estrutura deve ser exata (case-sensitive em Linux)
7. **Etapa 9-10:** Verificar mensagens de erro específicas

---

**Versão:** 1.0
**Data:** 2026-01-28
**Status:** Pronto para Validação
