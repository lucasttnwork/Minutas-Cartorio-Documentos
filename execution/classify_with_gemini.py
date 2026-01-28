#!/usr/bin/env python3
"""
classify_with_gemini.py - Fase 1.2 do Pipeline de Extração de Documentos

Este script lê um inventário bruto (JSON da Fase 1.1) e envia cada arquivo
ao Gemini 2.5 Flash para classificação visual do tipo de documento.

Uso:
    python classify_with_gemini.py FC_515_124
    python classify_with_gemini.py --input .tmp/inventarios/FC_515_124_bruto.json
    python classify_with_gemini.py --mock FC_515_124  # Modo teste sem API

Autor: Pipeline de Minutas
Data: Janeiro 2025
"""

import argparse
import json
import logging
import os
import sys
import time
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Optional, List, Dict, Any, Tuple

# Adiciona o diretório raiz ao path para imports
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

# Bibliotecas externas
try:
    from dotenv import load_dotenv
    import google.generativeai as genai
    from PIL import Image
    import fitz  # PyMuPDF
except ImportError as e:
    print(f"Erro: Biblioteca não encontrada - {e}")
    print("Instale as dependências: pip install python-dotenv google-generativeai Pillow PyMuPDF")
    sys.exit(1)

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# Constantes
RATE_LIMIT_DELAY = 6  # 10 requests por minuto = 1 a cada 6 segundos
MAX_RETRIES = 3
SAVE_PROGRESS_INTERVAL = 5  # Salvar a cada N arquivos
SUPPORTED_IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'}
SUPPORTED_PDF_EXTENSION = '.pdf'
SUPPORTED_DOCX_EXTENSIONS = {'.docx', '.doc'}

# Constantes para processamento paralelo
PARALLEL_WORKERS = 6  # Numero de workers para preparacao paralela
PARALLEL_BATCH_SIZE = 10  # Tamanho do lote de preparacao


# =============================================================================
# RATE LIMITER - Thread-safe para controle de rate limit global
# =============================================================================

class RateLimiter:
    """
    Thread-safe rate limiter para controlar chamadas a API Gemini.

    Garante que no maximo 10 requests sejam feitos por minuto (1 a cada 6 segundos).
    Implementa pattern Singleton para garantir controle global.

    Uso:
        rate_limiter = RateLimiter.get_instance()
        rate_limiter.wait()  # Bloqueia ate ser seguro enviar
        # ... faz a requisicao ...
    """

    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        """Singleton pattern - garante apenas uma instancia global."""
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._initialized = False
        return cls._instance

    def __init__(self, min_interval: float = RATE_LIMIT_DELAY):
        """
        Inicializa o rate limiter.

        Args:
            min_interval: Intervalo minimo entre requests em segundos (default: 6s)
        """
        if self._initialized:
            return

        self._min_interval = min_interval
        self._last_request_time = 0.0
        self._request_lock = threading.Lock()
        self._request_count = 0
        self._initialized = True
        logger.debug(f"RateLimiter inicializado com intervalo de {min_interval}s")

    @classmethod
    def get_instance(cls, min_interval: float = RATE_LIMIT_DELAY) -> 'RateLimiter':
        """
        Obtem a instancia singleton do RateLimiter.

        Args:
            min_interval: Intervalo minimo entre requests

        Returns:
            Instancia do RateLimiter
        """
        instance = cls()
        return instance

    @classmethod
    def reset_instance(cls):
        """Reseta a instancia singleton (util para testes)."""
        with cls._lock:
            cls._instance = None

    def wait(self) -> float:
        """
        Aguarda ate ser seguro fazer uma nova requisicao.

        Thread-safe: multiplas threads podem chamar wait() simultaneamente,
        mas apenas uma sera liberada a cada min_interval segundos.

        Returns:
            Tempo efetivamente esperado em segundos
        """
        with self._request_lock:
            current_time = time.time()
            elapsed = current_time - self._last_request_time

            if elapsed < self._min_interval:
                wait_time = self._min_interval - elapsed
                logger.debug(f"RateLimiter: aguardando {wait_time:.2f}s antes do proximo request")
                time.sleep(wait_time)
                waited = wait_time
            else:
                waited = 0.0

            self._last_request_time = time.time()
            self._request_count += 1
            logger.debug(f"RateLimiter: request #{self._request_count} liberado")

            return waited

    def get_stats(self) -> Dict[str, Any]:
        """
        Retorna estatisticas do rate limiter.

        Returns:
            Dicionario com estatisticas
        """
        return {
            'total_requests': self._request_count,
            'min_interval': self._min_interval,
            'last_request_time': self._last_request_time
        }


# =============================================================================
# ESTRUTURAS PARA PROCESSAMENTO PARALELO
# =============================================================================

@dataclass
class PreparedDocument:
    """
    Documento preparado para envio ao Gemini.

    Contem todas as informacoes necessarias para a classificacao,
    ja com a imagem carregada (ou resultado pre-computado para DOCX/mock).
    """
    file_info: Dict[str, Any]
    image: Optional[Any]  # PIL.Image ou None
    pre_result: Optional[Dict[str, Any]]  # Resultado pre-computado (DOCX, mock, erro)
    preparation_time: float
    error: Optional[str]

    @property
    def needs_api_call(self) -> bool:
        """Retorna True se este documento precisa de chamada a API."""
        return self.pre_result is None and self.image is not None

    @property
    def is_ready(self) -> bool:
        """Retorna True se o documento esta pronto para processamento."""
        return self.pre_result is not None or self.image is not None or self.error is not None

# Tipos de documento válidos (para normalização)
VALID_DOCUMENT_TYPES = {
    'RG', 'CNH', 'CPF', 'CERTIDAO_NASCIMENTO', 'CERTIDAO_CASAMENTO',
    'CERTIDAO_OBITO', 'CNDT', 'CND_FEDERAL', 'CND_ESTADUAL', 'CND_MUNICIPAL',
    'CND_CONDOMINIO', 'MATRICULA_IMOVEL', 'ITBI', 'VVR', 'IPTU',
    'DADOS_CADASTRAIS', 'COMPROMISSO_COMPRA_VENDA', 'ESCRITURA', 'PROCURACAO',
    'COMPROVANTE_RESIDENCIA', 'COMPROVANTE_PAGAMENTO', 'CONTRATO_SOCIAL',
    'PROTOCOLO_ONR', 'ASSINATURA_DIGITAL',
    'OUTRO', 'ILEGIVEL', 'DESCONHECIDO'
}

# Categorias válidas para documentos desconhecidos
VALID_CATEGORIES = {
    'DOCUMENTOS_PESSOAIS',
    'CERTIDOES',
    'DOCUMENTOS_IMOVEL',
    'DOCUMENTOS_NEGOCIO',
    'ADMINISTRATIVOS'
}

# Diretório para salvar descobertas de novos tipos
DISCOVERIES_DIR = '.tmp/descobertas'

# Prompt de classificação padronizado
CLASSIFICATION_PROMPT = """Você é um especialista em documentos brasileiros de cartório e registro de imóveis.

Analise esta imagem de documento e identifique:

1. TIPO_DOCUMENTO: Qual o tipo exato? Escolha APENAS uma opção:
   - RG (Registro Geral / Carteira de Identidade)
   - CNH (Carteira Nacional de Habilitação)
   - CPF (Cadastro de Pessoa Física - documento avulso)
   - CERTIDAO_NASCIMENTO
   - CERTIDAO_CASAMENTO
   - CERTIDAO_OBITO
   - CNDT (Certidão Negativa de Débitos Trabalhistas)
   - CND_FEDERAL (Certidão da Receita Federal / PGFN)
   - CND_ESTADUAL
   - CND_MUNICIPAL (Certidão de Tributos Municipais / IPTU)
   - CND_CONDOMINIO (Declaração de quitação condominial)
   - MATRICULA_IMOVEL (Certidão de Matrícula do Registro de Imóveis)
   - ITBI (Guia de ITBI ou comprovante)
   - VVR (Valor Venal de Referência)
   - IPTU (Carnê ou certidão de IPTU)
   - DADOS_CADASTRAIS (Ficha cadastral do imóvel)
   - COMPROMISSO_COMPRA_VENDA (Contrato particular)
   - ESCRITURA (Escritura pública)
   - PROCURACAO
   - COMPROVANTE_RESIDENCIA
   - COMPROVANTE_PAGAMENTO (Recibo, transferência, etc)
   - CONTRATO_SOCIAL (Pessoa Jurídica)
   - PROTOCOLO_ONR (Protocolo/comprovante do Operador Nacional do Registro - SAEC, pedido de certidão digital, confirmação de protocolo ONR)
   - ASSINATURA_DIGITAL (Certificado de assinatura eletrônica - DocuSign, Adobe Sign, GOV.BR, ou similar com lista de assinaturas e validação)
   - OUTRO (documento reconhecido mas não se encaixa nas categorias acima)
   - ILEGIVEL (documento muito ruim para identificar)
   - DESCONHECIDO (documento claramente identificável mas de um tipo que não existe na lista acima)

ATENÇÃO - Exemplos para ajudar na classificação:
- Documentos com "SAEC", "ONR", "Operador Nacional", "protocolo gerado" -> PROTOCOLO_ONR
- Documentos com "Certificate of Completion", "DocuSign", "assinatura eletrônica", "Summary" de assinaturas -> ASSINATURA_DIGITAL

IMPORTANTE sobre DESCONHECIDO vs OUTRO:
- Use OUTRO quando você reconhece o documento mas ele não se encaixa nas categorias
- Use DESCONHECIDO quando você identifica um TIPO NOVO de documento que deveria ser adicionado à lista

2. CONFIANCA: Alta, Media ou Baixa

3. PESSOA_RELACIONADA: Se identificável, nome da pessoa no documento (ou null)

4. OBSERVACAO: Breve descrição do que você vê (máximo 100 caracteres)

5. SE E SOMENTE SE tipo_documento for "DESCONHECIDO", inclua TAMBÉM estes campos adicionais:
   - tipo_sugerido: Nome sugerido para este novo tipo de documento em SNAKE_CASE (ex: "CERTIDAO_AMBIENTAL")
   - descricao: Breve descrição do que é este tipo de documento (máximo 200 caracteres)
   - categoria_recomendada: Uma das categorias: DOCUMENTOS_PESSOAIS, CERTIDOES, DOCUMENTOS_IMOVEL, DOCUMENTOS_NEGOCIO, ADMINISTRATIVOS
   - caracteristicas_identificadoras: Lista de 3-5 características visuais/textuais que identificam este tipo de documento
   - campos_principais: Lista de 3-8 campos de dados importantes que aparecem neste documento

Responda APENAS em JSON válido, sem markdown.

Exemplo para documento CONHECIDO:
{"tipo_documento": "RG", "confianca": "Alta", "pessoa_relacionada": "JOAO SILVA", "observacao": "RG do estado de SP"}

Exemplo para documento DESCONHECIDO:
{"tipo_documento": "DESCONHECIDO", "confianca": "Alta", "pessoa_relacionada": null, "observacao": "Certidão ambiental do IBAMA", "tipo_sugerido": "CERTIDAO_AMBIENTAL", "descricao": "Certidão de regularidade ambiental emitida pelo IBAMA", "categoria_recomendada": "CERTIDOES", "caracteristicas_identificadoras": ["Logo do IBAMA", "Título Certidão Ambiental", "Número de protocolo", "QR Code de validação"], "campos_principais": ["numero_certidao", "cpf_cnpj", "nome_requerente", "data_emissao", "data_validade", "situacao_ambiental"]}"""


def load_environment():
    """Carrega variáveis de ambiente do arquivo .env"""
    env_path = ROOT_DIR / '.env'
    if env_path.exists():
        load_dotenv(env_path)
        logger.info(f"Variáveis de ambiente carregadas de {env_path}")
    else:
        logger.warning(f"Arquivo .env não encontrado em {env_path}")

    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        raise ValueError("GEMINI_API_KEY não encontrada no ambiente. Configure no arquivo .env")

    return api_key


def configure_gemini(api_key: str, mock_mode: bool = False):
    """Configura o cliente Gemini"""
    if mock_mode:
        logger.info("Modo MOCK ativado - não será feita conexão com a API")
        return None

    genai.configure(api_key=api_key)

    # Tenta usar gemini-2.0-flash-exp, fallback para gemini-1.5-flash
    model_names = ["gemini-2.0-flash-exp", "gemini-2.0-flash", "gemini-1.5-flash"]

    for model_name in model_names:
        try:
            model = genai.GenerativeModel(model_name)
            logger.info(f"Modelo configurado: {model_name}")
            return model
        except Exception as e:
            logger.warning(f"Modelo {model_name} não disponível: {e}")

    raise RuntimeError("Nenhum modelo Gemini disponível")


def extract_first_page_from_pdf(pdf_path: Path) -> Optional[Image.Image]:
    """
    Extrai a primeira página de um PDF como imagem usando PyMuPDF.

    Args:
        pdf_path: Caminho para o arquivo PDF

    Returns:
        Imagem PIL da primeira página ou None se falhar
    """
    try:
        doc = fitz.open(str(pdf_path))
        if len(doc) == 0:
            logger.warning(f"PDF vazio: {pdf_path}")
            return None

        # Pega a primeira página
        page = doc[0]

        # Renderiza em alta resolução (300 DPI)
        zoom = 2.0  # Fator de zoom para melhor qualidade
        mat = fitz.Matrix(zoom, zoom)
        pix = page.get_pixmap(matrix=mat)

        # Converte para PIL Image
        img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)

        doc.close()
        return img

    except Exception as e:
        logger.error(f"Erro ao extrair página do PDF {pdf_path}: {e}")
        return None


def load_image(file_path: Path) -> Optional[Image.Image]:
    """
    Carrega uma imagem de arquivo (suporta imagens e PDFs).

    Args:
        file_path: Caminho para o arquivo

    Returns:
        Imagem PIL ou None se falhar
    """
    extension = file_path.suffix.lower()

    try:
        if extension == SUPPORTED_PDF_EXTENSION:
            return extract_first_page_from_pdf(file_path)
        elif extension in SUPPORTED_IMAGE_EXTENSIONS:
            img = Image.open(file_path)
            # Converte para RGB se necessário (remove alpha channel)
            if img.mode in ('RGBA', 'P'):
                img = img.convert('RGB')
            return img
        else:
            logger.warning(f"Extensão não suportada: {extension} - {file_path}")
            return None
    except Exception as e:
        logger.error(f"Erro ao carregar arquivo {file_path}: {e}")
        return None


def normalize_document_type(tipo: str) -> str:
    """
    Normaliza o tipo de documento para o formato padrão.
    O Gemini pode retornar "CNDT (Certidão Negativa...)" ao invés de apenas "CNDT".

    Args:
        tipo: Tipo de documento retornado pelo Gemini

    Returns:
        Tipo normalizado
    """
    if not tipo:
        return 'OUTRO'

    tipo_upper = tipo.upper().strip()

    # Se já é um tipo válido, retorna direto
    if tipo_upper in VALID_DOCUMENT_TYPES:
        return tipo_upper

    # Tenta extrair o tipo do início (antes de parênteses ou descrições)
    # Exemplo: "CNDT (Certidão Negativa...)" -> "CNDT"
    for valid_type in VALID_DOCUMENT_TYPES:
        if tipo_upper.startswith(valid_type):
            return valid_type

    # Tenta encontrar por substring
    for valid_type in VALID_DOCUMENT_TYPES:
        if valid_type in tipo_upper:
            return valid_type

    # Se nada funcionou, retorna OUTRO
    logger.warning(f"Tipo de documento não reconhecido: {tipo}")
    return 'OUTRO'


def normalize_pessoa_relacionada(pessoa: str) -> Optional[str]:
    """
    Normaliza o campo pessoa_relacionada.
    Trata casos como "null" (string) ou valores vazios.

    Args:
        pessoa: Valor retornado pelo Gemini

    Returns:
        Nome da pessoa ou None
    """
    if not pessoa:
        return None
    if isinstance(pessoa, str):
        pessoa_strip = pessoa.strip().lower()
        if pessoa_strip in ('null', 'none', 'n/a', '-', ''):
            return None
        return pessoa.strip().upper()  # Retorna em maiúsculas
    return None


def parse_gemini_response(response_text: str) -> dict:
    """
    Faz o parsing da resposta do Gemini, tratando possíveis erros de formato.

    Suporta campos adicionais para documentos DESCONHECIDO:
    - tipo_sugerido: Nome sugerido para o novo tipo
    - descricao: Descrição do tipo de documento
    - categoria_recomendada: Categoria sugerida
    - caracteristicas_identificadoras: Lista de características
    - campos_principais: Lista de campos importantes

    Args:
        response_text: Texto de resposta do Gemini

    Returns:
        Dicionário com os campos extraídos
    """
    # Remove possíveis marcadores de código markdown
    cleaned = response_text.strip()
    if cleaned.startswith('```json'):
        cleaned = cleaned[7:]
    if cleaned.startswith('```'):
        cleaned = cleaned[3:]
    if cleaned.endswith('```'):
        cleaned = cleaned[:-3]
    cleaned = cleaned.strip()

    try:
        data = json.loads(cleaned)

        # Valida campos obrigatórios
        required_fields = ['tipo_documento', 'confianca', 'pessoa_relacionada', 'observacao']
        for field in required_fields:
            if field not in data:
                data[field] = None

        # Normaliza o tipo de documento
        data['tipo_documento'] = normalize_document_type(data.get('tipo_documento'))

        # Normaliza pessoa relacionada
        data['pessoa_relacionada'] = normalize_pessoa_relacionada(data.get('pessoa_relacionada'))

        # Normaliza confiança
        confianca = data.get('confianca', '').strip().title() if data.get('confianca') else 'Baixa'
        if confianca not in ('Alta', 'Media', 'Baixa'):
            confianca = 'Media'
        data['confianca'] = confianca

        # Trunca observação se necessário
        if data.get('observacao') and len(data['observacao']) > 100:
            data['observacao'] = data['observacao'][:97] + '...'

        # Processa campos adicionais para documentos DESCONHECIDO
        if data['tipo_documento'] == 'DESCONHECIDO':
            data = _process_unknown_document_fields(data)

        return data

    except json.JSONDecodeError as e:
        logger.error(f"Erro ao fazer parsing do JSON: {e}")
        logger.debug(f"Resposta original: {response_text}")

        # Retorna resposta parcial indicando erro de parsing
        return {
            'tipo_documento': 'OUTRO',
            'confianca': 'Baixa',
            'pessoa_relacionada': None,
            'observacao': f'Erro parsing: {str(e)[:50]}'
        }


def _process_unknown_document_fields(data: dict) -> dict:
    """
    Processa e valida os campos adicionais para documentos DESCONHECIDO.

    Args:
        data: Dicionário com dados já parseados

    Returns:
        Dicionário com campos de documento desconhecido validados
    """
    # Normaliza tipo_sugerido para SNAKE_CASE
    tipo_sugerido = data.get('tipo_sugerido', '')
    if tipo_sugerido:
        # Remove caracteres especiais e converte para SNAKE_CASE
        tipo_sugerido = tipo_sugerido.upper().strip()
        tipo_sugerido = ''.join(c if c.isalnum() or c == '_' else '_' for c in tipo_sugerido)
        tipo_sugerido = '_'.join(filter(None, tipo_sugerido.split('_')))  # Remove underscores duplicados
        data['tipo_sugerido'] = tipo_sugerido
    else:
        data['tipo_sugerido'] = None

    # Trunca descrição se necessário
    descricao = data.get('descricao', '')
    if descricao and len(descricao) > 200:
        data['descricao'] = descricao[:197] + '...'
    elif not descricao:
        data['descricao'] = None

    # Valida categoria_recomendada
    categoria = data.get('categoria_recomendada', '').upper().strip() if data.get('categoria_recomendada') else None
    if categoria and categoria in VALID_CATEGORIES:
        data['categoria_recomendada'] = categoria
    else:
        data['categoria_recomendada'] = 'ADMINISTRATIVOS'  # Default

    # Valida caracteristicas_identificadoras (deve ser lista)
    caracteristicas = data.get('caracteristicas_identificadoras', [])
    if isinstance(caracteristicas, list):
        # Filtra strings vazias e limita a 10 itens
        data['caracteristicas_identificadoras'] = [
            str(c).strip() for c in caracteristicas if c and str(c).strip()
        ][:10]
    else:
        data['caracteristicas_identificadoras'] = []

    # Valida campos_principais (deve ser lista)
    campos = data.get('campos_principais', [])
    if isinstance(campos, list):
        # Normaliza para snake_case e filtra vazios
        normalized_campos = []
        for c in campos:
            if c and str(c).strip():
                campo = str(c).lower().strip()
                campo = ''.join(ch if ch.isalnum() or ch == '_' else '_' for ch in campo)
                campo = '_'.join(filter(None, campo.split('_')))
                if campo:
                    normalized_campos.append(campo)
        data['campos_principais'] = normalized_campos[:15]  # Limita a 15 campos
    else:
        data['campos_principais'] = []

    return data


def classify_docx_by_name(file_info: dict) -> dict:
    """
    Classifica arquivos DOCX/DOC baseado em heuristicas do nome do arquivo.
    Arquivos DOCX em pastas de escritura geralmente sao:
    - Minutas (rascunho da escritura)
    - Custas (planilha de custos do cartorio)

    Como o Gemini Vision precisa de imagens, usamos heuristicas para DOCX.

    Args:
        file_info: Informacoes do arquivo do inventario

    Returns:
        Resultado da classificacao
    """
    nome = file_info['nome'].upper()

    # Heuristicas para DOCX de cartorios
    if 'MINUTA' in nome:
        return {
            'tipo_documento': 'ESCRITURA',
            'confianca': 'Alta',
            'pessoa_relacionada': None,
            'observacao': 'Minuta de escritura (arquivo DOCX)'
        }
    elif 'CUSTAS' in nome or 'CUSTO' in nome:
        return {
            'tipo_documento': 'OUTRO',
            'confianca': 'Alta',
            'pessoa_relacionada': None,
            'observacao': 'Planilha de custas do cartorio (DOCX)'
        }
    elif 'PROCURA' in nome:
        return {
            'tipo_documento': 'PROCURACAO',
            'confianca': 'Media',
            'pessoa_relacionada': None,
            'observacao': 'Procuracao (arquivo DOCX)'
        }
    elif 'CONTRATO' in nome:
        return {
            'tipo_documento': 'COMPROMISSO_COMPRA_VENDA',
            'confianca': 'Media',
            'pessoa_relacionada': None,
            'observacao': 'Contrato (arquivo DOCX)'
        }
    else:
        # Default para DOCX nao reconhecidos
        return {
            'tipo_documento': 'OUTRO',
            'confianca': 'Baixa',
            'pessoa_relacionada': None,
            'observacao': 'Documento DOCX - tipo nao identificado pelo nome'
        }


def classify_with_mock(file_info: dict) -> dict:
    """
    Classifica arquivo em modo mock (teste sem API).
    Retorna classificação baseada no nome do arquivo.

    Args:
        file_info: Informações do arquivo do inventário

    Returns:
        Resultado da classificação mock
    """
    nome = file_info['nome'].upper()

    # Heurísticas simples baseadas no nome
    mock_results = {
        'RG': {'tipo': 'RG', 'conf': 'Alta'},
        'CNH': {'tipo': 'CNH', 'conf': 'Alta'},
        'CPF': {'tipo': 'CPF', 'conf': 'Alta'},
        'CNDT': {'tipo': 'CNDT', 'conf': 'Alta'},
        'CND': {'tipo': 'CND_FEDERAL', 'conf': 'Media'},
        'MATRICULA': {'tipo': 'MATRICULA_IMOVEL', 'conf': 'Alta'},
        'MATRÍCULA': {'tipo': 'MATRICULA_IMOVEL', 'conf': 'Alta'},
        'ITBI': {'tipo': 'ITBI', 'conf': 'Alta'},
        'VVR': {'tipo': 'VVR', 'conf': 'Alta'},
        'IPTU': {'tipo': 'IPTU', 'conf': 'Alta'},
        'DADOS': {'tipo': 'DADOS_CADASTRAIS', 'conf': 'Media'},
        'CADASTRA': {'tipo': 'DADOS_CADASTRAIS', 'conf': 'Media'},
        'COMPROMISSO': {'tipo': 'COMPROMISSO_COMPRA_VENDA', 'conf': 'Alta'},
        'CCV': {'tipo': 'COMPROMISSO_COMPRA_VENDA', 'conf': 'Alta'},
        'ESCRITURA': {'tipo': 'ESCRITURA', 'conf': 'Alta'},
        'PROCURA': {'tipo': 'PROCURACAO', 'conf': 'Alta'},
        'COMPROVANTE': {'tipo': 'COMPROVANTE_PAGAMENTO', 'conf': 'Media'},
        'RECIBO': {'tipo': 'COMPROVANTE_PAGAMENTO', 'conf': 'Media'},
        'CASAMENTO': {'tipo': 'CERTIDAO_CASAMENTO', 'conf': 'Alta'},
        'NASCIMENTO': {'tipo': 'CERTIDAO_NASCIMENTO', 'conf': 'Alta'},
        'OBITO': {'tipo': 'CERTIDAO_OBITO', 'conf': 'Alta'},
        'ÓBITO': {'tipo': 'CERTIDAO_OBITO', 'conf': 'Alta'},
        'CONDOMINIO': {'tipo': 'CND_CONDOMINIO', 'conf': 'Alta'},
        'CONDOMÍNIO': {'tipo': 'CND_CONDOMINIO', 'conf': 'Alta'},
        # Novos tipos: Protocolo ONR e Assinatura Digital
        'SAEC': {'tipo': 'PROTOCOLO_ONR', 'conf': 'Alta'},
        'ONR': {'tipo': 'PROTOCOLO_ONR', 'conf': 'Alta'},
        'PROTOCOLO': {'tipo': 'PROTOCOLO_ONR', 'conf': 'Media'},
        'SUMMARY': {'tipo': 'ASSINATURA_DIGITAL', 'conf': 'Alta'},
        'DOCUSIGN': {'tipo': 'ASSINATURA_DIGITAL', 'conf': 'Alta'},
        'CERTIFICATE': {'tipo': 'ASSINATURA_DIGITAL', 'conf': 'Media'},
        'ASSINATURA': {'tipo': 'ASSINATURA_DIGITAL', 'conf': 'Media'},
    }

    # Procura por keywords no nome
    for keyword, result in mock_results.items():
        if keyword in nome:
            return {
                'tipo_documento': result['tipo'],
                'confianca': result['conf'],
                'pessoa_relacionada': None,
                'observacao': f'[MOCK] Classificado por nome do arquivo'
            }

    # Default para arquivos não reconhecidos
    return {
        'tipo_documento': 'OUTRO',
        'confianca': 'Baixa',
        'pessoa_relacionada': None,
        'observacao': '[MOCK] Tipo não identificado pelo nome'
    }


def classify_document(model, file_info: dict, mock_mode: bool = False, caso_id: str = 'unknown') -> dict:
    """
    Classifica um único documento usando o Gemini.
    Implementa retry com backoff exponencial.

    Para documentos DESCONHECIDO, salva automaticamente em .tmp/descobertas/.

    Args:
        model: Modelo Gemini configurado
        file_info: Informações do arquivo do inventário
        mock_mode: Se True, usa classificação mock
        caso_id: ID do caso/escritura para registro de descobertas

    Returns:
        Resultado da classificação
    """
    file_path = Path(file_info['caminho_absoluto'])

    # Verifica se arquivo existe
    if not file_path.exists():
        return {
            'id': file_info['id'],
            'nome': file_info['nome'],
            'tipo_documento': None,
            'confianca': None,
            'pessoa_relacionada': None,
            'observacao': None,
            'status': 'erro',
            'erro_mensagem': f'Arquivo não encontrado: {file_path}'
        }

    # Verifica extensão suportada
    ext = file_path.suffix.lower()
    if ext not in SUPPORTED_IMAGE_EXTENSIONS and ext != SUPPORTED_PDF_EXTENSION and ext not in SUPPORTED_DOCX_EXTENSIONS:
        return {
            'id': file_info['id'],
            'nome': file_info['nome'],
            'tipo_documento': None,
            'confianca': None,
            'pessoa_relacionada': None,
            'observacao': None,
            'status': 'erro',
            'erro_mensagem': f'Extensão não suportada: {ext}'
        }

    # Arquivos DOCX/DOC sao classificados por heuristica (nao visual)
    if ext in SUPPORTED_DOCX_EXTENSIONS:
        docx_result = classify_docx_by_name(file_info)
        return {
            'id': file_info['id'],
            'nome': file_info['nome'],
            'tipo_documento': docx_result['tipo_documento'],
            'confianca': docx_result['confianca'],
            'pessoa_relacionada': docx_result['pessoa_relacionada'],
            'observacao': docx_result['observacao'],
            'status': 'sucesso'
        }

    # Modo mock
    if mock_mode:
        mock_result = classify_with_mock(file_info)
        return {
            'id': file_info['id'],
            'nome': file_info['nome'],
            'tipo_documento': mock_result['tipo_documento'],
            'confianca': mock_result['confianca'],
            'pessoa_relacionada': mock_result['pessoa_relacionada'],
            'observacao': mock_result['observacao'],
            'status': 'sucesso'
        }

    # Carrega a imagem
    image = load_image(file_path)
    if image is None:
        return {
            'id': file_info['id'],
            'nome': file_info['nome'],
            'tipo_documento': None,
            'confianca': None,
            'pessoa_relacionada': None,
            'observacao': None,
            'status': 'erro',
            'erro_mensagem': 'Não foi possível ler o arquivo'
        }

    # Retry com backoff exponencial
    for attempt in range(MAX_RETRIES):
        try:
            # Envia para o Gemini
            response = model.generate_content([CLASSIFICATION_PROMPT, image])

            # Parse da resposta
            result = parse_gemini_response(response.text)

            # Monta resultado base
            classification = {
                'id': file_info['id'],
                'nome': file_info['nome'],
                'tipo_documento': result.get('tipo_documento'),
                'confianca': result.get('confianca'),
                'pessoa_relacionada': result.get('pessoa_relacionada'),
                'observacao': result.get('observacao'),
                'status': 'sucesso'
            }

            # Se for DESCONHECIDO, adiciona campos extras e salva descoberta
            if result.get('tipo_documento') == 'DESCONHECIDO':
                classification['tipo_sugerido'] = result.get('tipo_sugerido')
                classification['descricao'] = result.get('descricao')
                classification['categoria_recomendada'] = result.get('categoria_recomendada')
                classification['caracteristicas_identificadoras'] = result.get('caracteristicas_identificadoras', [])
                classification['campos_principais'] = result.get('campos_principais', [])

                # Salva descoberta para análise posterior
                save_discovery(caso_id, file_info['nome'], classification)

            return classification

        except Exception as e:
            wait_time = (2 ** attempt) * 2  # 2, 4, 8 segundos
            logger.warning(f"Tentativa {attempt + 1}/{MAX_RETRIES} falhou: {e}")

            if attempt < MAX_RETRIES - 1:
                logger.info(f"Aguardando {wait_time}s antes de retry...")
                time.sleep(wait_time)

    # Todas as tentativas falharam
    return {
        'id': file_info['id'],
        'nome': file_info['nome'],
        'tipo_documento': None,
        'confianca': None,
        'pessoa_relacionada': None,
        'observacao': None,
        'status': 'erro',
        'erro_mensagem': f'Falha após {MAX_RETRIES} tentativas'
    }


# =============================================================================
# PROCESSAMENTO PARALELO - Funcoes para batch processing otimizado
# =============================================================================

def prepare_document(file_info: Dict[str, Any], mock_mode: bool = False) -> PreparedDocument:
    """
    Prepara um documento para classificacao (sem chamar a API).

    Esta funcao faz todo o trabalho de I/O:
    - Verifica se arquivo existe
    - Carrega imagem ou converte PDF
    - Trata casos especiais (DOCX, mock)

    Pode ser executada em paralelo pois nao faz chamadas a API.

    Args:
        file_info: Informacoes do arquivo do inventario
        mock_mode: Se True, prepara resultado mock

    Returns:
        PreparedDocument com imagem carregada ou resultado pre-computado
    """
    start_time = time.time()
    file_path = Path(file_info['caminho_absoluto'])

    # Verifica se arquivo existe
    if not file_path.exists():
        return PreparedDocument(
            file_info=file_info,
            image=None,
            pre_result={
                'id': file_info['id'],
                'nome': file_info['nome'],
                'tipo_documento': None,
                'confianca': None,
                'pessoa_relacionada': None,
                'observacao': None,
                'status': 'erro',
                'erro_mensagem': f'Arquivo não encontrado: {file_path}'
            },
            preparation_time=time.time() - start_time,
            error=f'Arquivo não encontrado: {file_path}'
        )

    # Verifica extensao suportada
    ext = file_path.suffix.lower()
    if ext not in SUPPORTED_IMAGE_EXTENSIONS and ext != SUPPORTED_PDF_EXTENSION and ext not in SUPPORTED_DOCX_EXTENSIONS:
        return PreparedDocument(
            file_info=file_info,
            image=None,
            pre_result={
                'id': file_info['id'],
                'nome': file_info['nome'],
                'tipo_documento': None,
                'confianca': None,
                'pessoa_relacionada': None,
                'observacao': None,
                'status': 'erro',
                'erro_mensagem': f'Extensão não suportada: {ext}'
            },
            preparation_time=time.time() - start_time,
            error=f'Extensão não suportada: {ext}'
        )

    # Arquivos DOCX/DOC - resultado pre-computado por heuristica
    if ext in SUPPORTED_DOCX_EXTENSIONS:
        docx_result = classify_docx_by_name(file_info)
        return PreparedDocument(
            file_info=file_info,
            image=None,
            pre_result={
                'id': file_info['id'],
                'nome': file_info['nome'],
                'tipo_documento': docx_result['tipo_documento'],
                'confianca': docx_result['confianca'],
                'pessoa_relacionada': docx_result['pessoa_relacionada'],
                'observacao': docx_result['observacao'],
                'status': 'sucesso'
            },
            preparation_time=time.time() - start_time,
            error=None
        )

    # Modo mock - resultado pre-computado por nome
    if mock_mode:
        mock_result = classify_with_mock(file_info)
        return PreparedDocument(
            file_info=file_info,
            image=None,
            pre_result={
                'id': file_info['id'],
                'nome': file_info['nome'],
                'tipo_documento': mock_result['tipo_documento'],
                'confianca': mock_result['confianca'],
                'pessoa_relacionada': mock_result['pessoa_relacionada'],
                'observacao': mock_result['observacao'],
                'status': 'sucesso'
            },
            preparation_time=time.time() - start_time,
            error=None
        )

    # Carrega a imagem (I/O pesado - beneficia de paralelismo)
    try:
        image = load_image(file_path)
        if image is None:
            return PreparedDocument(
                file_info=file_info,
                image=None,
                pre_result={
                    'id': file_info['id'],
                    'nome': file_info['nome'],
                    'tipo_documento': None,
                    'confianca': None,
                    'pessoa_relacionada': None,
                    'observacao': None,
                    'status': 'erro',
                    'erro_mensagem': 'Não foi possível ler o arquivo'
                },
                preparation_time=time.time() - start_time,
                error='Não foi possível ler o arquivo'
            )

        return PreparedDocument(
            file_info=file_info,
            image=image,
            pre_result=None,  # Precisa de chamada a API
            preparation_time=time.time() - start_time,
            error=None
        )

    except Exception as e:
        logger.error(f"Erro ao preparar documento {file_info['nome']}: {e}")
        return PreparedDocument(
            file_info=file_info,
            image=None,
            pre_result={
                'id': file_info['id'],
                'nome': file_info['nome'],
                'tipo_documento': None,
                'confianca': None,
                'pessoa_relacionada': None,
                'observacao': None,
                'status': 'erro',
                'erro_mensagem': f'Erro de preparação: {str(e)[:50]}'
            },
            preparation_time=time.time() - start_time,
            error=str(e)
        )


def classify_prepared_document(
    model,
    prepared: PreparedDocument,
    rate_limiter: RateLimiter,
    caso_id: str = 'unknown'
) -> Dict[str, Any]:
    """
    Classifica um documento ja preparado usando o Gemini.

    Se o documento tem resultado pre-computado (DOCX, mock, erro), retorna direto.
    Caso contrario, usa o rate_limiter para aguardar e faz a chamada a API.

    Para documentos DESCONHECIDO, salva automaticamente em .tmp/descobertas/.

    Args:
        model: Modelo Gemini configurado
        prepared: Documento preparado
        rate_limiter: Instancia do rate limiter
        caso_id: ID do caso/escritura para registro de descobertas

    Returns:
        Resultado da classificacao
    """
    # Se ja tem resultado pre-computado, retorna direto
    if prepared.pre_result is not None:
        return prepared.pre_result

    # Se nao tem imagem, algo deu errado
    if prepared.image is None:
        return {
            'id': prepared.file_info['id'],
            'nome': prepared.file_info['nome'],
            'tipo_documento': None,
            'confianca': None,
            'pessoa_relacionada': None,
            'observacao': None,
            'status': 'erro',
            'erro_mensagem': prepared.error or 'Documento não preparado corretamente'
        }

    # Aguarda rate limit
    wait_time = rate_limiter.wait()
    if wait_time > 0:
        logger.debug(f"Rate limit: aguardou {wait_time:.2f}s para {prepared.file_info['nome']}")

    # Retry com backoff exponencial
    for attempt in range(MAX_RETRIES):
        try:
            # Envia para o Gemini
            response = model.generate_content([CLASSIFICATION_PROMPT, prepared.image])

            # Parse da resposta
            result = parse_gemini_response(response.text)

            # Monta resultado base
            classification = {
                'id': prepared.file_info['id'],
                'nome': prepared.file_info['nome'],
                'tipo_documento': result.get('tipo_documento'),
                'confianca': result.get('confianca'),
                'pessoa_relacionada': result.get('pessoa_relacionada'),
                'observacao': result.get('observacao'),
                'status': 'sucesso'
            }

            # Se for DESCONHECIDO, adiciona campos extras e salva descoberta
            if result.get('tipo_documento') == 'DESCONHECIDO':
                classification['tipo_sugerido'] = result.get('tipo_sugerido')
                classification['descricao'] = result.get('descricao')
                classification['categoria_recomendada'] = result.get('categoria_recomendada')
                classification['caracteristicas_identificadoras'] = result.get('caracteristicas_identificadoras', [])
                classification['campos_principais'] = result.get('campos_principais', [])

                # Salva descoberta para análise posterior
                save_discovery(caso_id, prepared.file_info['nome'], classification)

            return classification

        except Exception as e:
            wait_time_retry = (2 ** attempt) * 2  # 2, 4, 8 segundos
            logger.warning(f"Tentativa {attempt + 1}/{MAX_RETRIES} falhou para {prepared.file_info['nome']}: {e}")

            if attempt < MAX_RETRIES - 1:
                logger.info(f"Aguardando {wait_time_retry}s antes de retry...")
                time.sleep(wait_time_retry)

    # Todas as tentativas falharam
    return {
        'id': prepared.file_info['id'],
        'nome': prepared.file_info['nome'],
        'tipo_documento': None,
        'confianca': None,
        'pessoa_relacionada': None,
        'observacao': None,
        'status': 'erro',
        'erro_mensagem': f'Falha após {MAX_RETRIES} tentativas'
    }


def run_classification_parallel(
    input_path: Path,
    output_path: Path,
    mock_mode: bool = False,
    limit: Optional[int] = None,
    num_workers: int = PARALLEL_WORKERS
) -> Dict[str, Any]:
    """
    Executa o pipeline de classificacao com processamento paralelo.

    Estrategia de 2 estagios:
    1. Preparacao paralela: Carrega imagens/PDFs em paralelo (I/O bound)
    2. Envio sequencial: Envia ao Gemini respeitando rate limit (6s entre requests)

    A preparacao paralela economiza tempo de I/O enquanto o rate limit da API
    garante que nao excedemos 10 requests/minuto.

    Args:
        input_path: Caminho do inventario de entrada
        output_path: Caminho do arquivo de saida
        mock_mode: Se True, usa classificacao mock sem API
        limit: Limita o numero de arquivos processados (para testes)
        num_workers: Numero de workers para preparacao paralela

    Returns:
        Resultado completo da classificacao
    """
    start_time = time.time()

    # Carrega ambiente e configura Gemini
    if not mock_mode:
        api_key = load_environment()
        model = configure_gemini(api_key, mock_mode)
        model_name = "gemini-2.0-flash-exp"
    else:
        model = None
        model_name = "mock"

    # Carrega inventario
    inventory = load_inventory(input_path)
    escritura_id = inventory.get('escritura_id', 'unknown')

    # Filtra arquivos processaveis
    all_files = inventory.get('arquivos', [])
    files_to_process = filter_processable_files(all_files)

    if limit:
        files_to_process = files_to_process[:limit]
        logger.info(f"Limitando processamento a {limit} arquivos (modo teste)")

    total = len(files_to_process)
    logger.info(f"=" * 60)
    logger.info(f"MODO PARALELO ATIVADO")
    logger.info(f"  Workers de preparacao: {num_workers}")
    logger.info(f"  Total de arquivos: {total}")
    logger.info(f"  Rate limit: {RATE_LIMIT_DELAY}s entre requests")
    logger.info(f"=" * 60)

    # Estrutura de resultado
    result = {
        'escritura_id': escritura_id,
        'data_classificacao': datetime.now().isoformat(),
        'modelo_utilizado': model_name,
        'modo_processamento': 'paralelo',
        'workers_preparacao': num_workers,
        'total_processados': 0,
        'total_sucesso': 0,
        'total_erro': 0,
        'tempo_preparacao_total': 0.0,
        'tempo_classificacao_total': 0.0,
        'classificacoes': []
    }

    # Inicializa rate limiter
    rate_limiter = RateLimiter.get_instance()

    # ==========================================================================
    # ESTAGIO 1: Preparacao paralela
    # ==========================================================================
    logger.info(f"[ESTAGIO 1] Preparando {total} documentos em paralelo...")
    prep_start = time.time()

    prepared_docs: List[PreparedDocument] = []

    with ThreadPoolExecutor(max_workers=num_workers) as executor:
        # Submete todas as tarefas de preparacao
        future_to_file = {
            executor.submit(prepare_document, file_info, mock_mode): file_info
            for file_info in files_to_process
        }

        # Coleta resultados conforme completam
        for idx, future in enumerate(as_completed(future_to_file), 1):
            file_info = future_to_file[future]
            try:
                prepared = future.result()
                prepared_docs.append(prepared)
                logger.debug(f"Preparado {idx}/{total}: {file_info['nome']} ({prepared.preparation_time:.2f}s)")
            except Exception as e:
                logger.error(f"Erro ao preparar {file_info['nome']}: {e}")
                # Cria documento com erro
                prepared_docs.append(PreparedDocument(
                    file_info=file_info,
                    image=None,
                    pre_result={
                        'id': file_info['id'],
                        'nome': file_info['nome'],
                        'tipo_documento': None,
                        'confianca': None,
                        'pessoa_relacionada': None,
                        'observacao': None,
                        'status': 'erro',
                        'erro_mensagem': f'Erro de preparação: {str(e)[:50]}'
                    },
                    preparation_time=0.0,
                    error=str(e)
                ))

    prep_time = time.time() - prep_start
    result['tempo_preparacao_total'] = prep_time

    # Ordena por ID para manter ordem consistente
    prepared_docs.sort(key=lambda x: x.file_info['id'])

    # Estatisticas de preparacao
    docs_need_api = sum(1 for p in prepared_docs if p.needs_api_call)
    docs_pre_computed = sum(1 for p in prepared_docs if p.pre_result is not None)
    avg_prep_time = sum(p.preparation_time for p in prepared_docs) / len(prepared_docs) if prepared_docs else 0

    logger.info(f"[ESTAGIO 1] Preparacao concluida em {prep_time:.2f}s")
    logger.info(f"  - Documentos que precisam de API: {docs_need_api}")
    logger.info(f"  - Documentos pre-computados: {docs_pre_computed}")
    logger.info(f"  - Tempo medio de preparacao: {avg_prep_time:.3f}s")

    # ==========================================================================
    # ESTAGIO 2: Classificacao com rate limit
    # ==========================================================================
    logger.info(f"[ESTAGIO 2] Classificando {total} documentos...")
    class_start = time.time()

    for idx, prepared in enumerate(prepared_docs, 1):
        logger.info(f"Classificando {idx}/{total}: {prepared.file_info['nome']}")

        # Classifica (respeitando rate limit se necessario)
        classification = classify_prepared_document(model, prepared, rate_limiter, escritura_id)
        result['classificacoes'].append(classification)

        # Atualiza contadores
        result['total_processados'] = idx
        if classification['status'] == 'sucesso':
            result['total_sucesso'] += 1
        else:
            result['total_erro'] += 1
            logger.warning(f"  Erro: {classification.get('erro_mensagem', 'desconhecido')}")

        # Salva progresso parcial
        if idx % SAVE_PROGRESS_INTERVAL == 0:
            save_progress(output_path, result)
            logger.info(f"Progresso salvo ({idx}/{total})")

    class_time = time.time() - class_start
    result['tempo_classificacao_total'] = class_time

    # Salva resultado final
    total_time = time.time() - start_time
    result['data_classificacao'] = datetime.now().isoformat()
    result['tempo_total'] = total_time
    save_progress(output_path, result)

    # Resumo
    logger.info("=" * 60)
    logger.info("CLASSIFICACAO CONCLUIDA (MODO PARALELO)")
    logger.info(f"  Escritura: {escritura_id}")
    logger.info(f"  Total processados: {result['total_processados']}")
    logger.info(f"  Sucesso: {result['total_sucesso']}")
    logger.info(f"  Erros: {result['total_erro']}")
    logger.info(f"  Tempo de preparacao: {prep_time:.2f}s")
    logger.info(f"  Tempo de classificacao: {class_time:.2f}s")
    logger.info(f"  Tempo total: {total_time:.2f}s")
    logger.info(f"  Rate limiter stats: {rate_limiter.get_stats()}")
    logger.info(f"  Arquivo de saida: {output_path}")
    logger.info("=" * 60)

    return result


def save_progress(output_path: Path, result: dict):
    """Salva o progresso atual para o arquivo de saída"""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    logger.debug(f"Progresso salvo em {output_path}")


def save_discovery(
    caso_id: str,
    arquivo_origem: str,
    classification: Dict[str, Any]
) -> Optional[Path]:
    """
    Salva informações de um documento DESCONHECIDO para análise posterior.

    Cria um arquivo JSON em .tmp/descobertas/ com as informações do novo tipo
    sugerido pelo Gemini.

    Args:
        caso_id: ID do caso/escritura
        arquivo_origem: Nome do arquivo de origem
        classification: Resultado da classificação contendo campos de documento desconhecido

    Returns:
        Path do arquivo salvo ou None se não for documento DESCONHECIDO
    """
    # Só salva se for documento DESCONHECIDO com tipo sugerido
    if classification.get('tipo_documento') != 'DESCONHECIDO':
        return None

    if not classification.get('tipo_sugerido'):
        logger.warning(f"Documento DESCONHECIDO sem tipo_sugerido: {arquivo_origem}")
        return None

    # Cria diretório de descobertas se não existir
    discoveries_dir = ROOT_DIR / DISCOVERIES_DIR
    discoveries_dir.mkdir(parents=True, exist_ok=True)

    # Gera timestamp para nome único
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_%f')

    # Monta dados da descoberta
    discovery = {
        'caso_id': caso_id,
        'arquivo_origem': arquivo_origem,
        'data_descoberta': datetime.now().isoformat(),
        'tipo_sugerido': classification.get('tipo_sugerido'),
        'descricao': classification.get('descricao'),
        'categoria_recomendada': classification.get('categoria_recomendada'),
        'caracteristicas_identificadoras': classification.get('caracteristicas_identificadoras', []),
        'campos_principais': classification.get('campos_principais', []),
        'observacao_original': classification.get('observacao'),
        'confianca': classification.get('confianca')
    }

    # Salva arquivo
    discovery_file = discoveries_dir / f'{caso_id}_descoberta_{timestamp}.json'
    with open(discovery_file, 'w', encoding='utf-8') as f:
        json.dump(discovery, f, ensure_ascii=False, indent=2)

    logger.info(f"Descoberta salva: {discovery_file.name} - tipo_sugerido: {classification.get('tipo_sugerido')}")
    return discovery_file


def consolidate_discoveries() -> Dict[str, Any]:
    """
    Consolida todas as descobertas em .tmp/descobertas/ agrupadas por tipo_sugerido.

    Útil para o orquestrador analisar padrões e decidir quais novos tipos
    devem ser adicionados ao sistema.

    Returns:
        Dicionário com descobertas consolidadas:
        {
            'data_consolidacao': timestamp,
            'total_descobertas': int,
            'tipos_sugeridos': {
                'TIPO_A': {
                    'contagem': int,
                    'categoria_mais_comum': str,
                    'descricoes': [str, ...],
                    'caracteristicas_unificadas': [str, ...],
                    'campos_unificados': [str, ...],
                    'arquivos_exemplo': [str, ...],
                    'casos': [str, ...]
                },
                ...
            }
        }
    """
    discoveries_dir = ROOT_DIR / DISCOVERIES_DIR

    # Verifica se diretório existe
    if not discoveries_dir.exists():
        logger.info("Nenhuma descoberta encontrada - diretório não existe")
        return {
            'data_consolidacao': datetime.now().isoformat(),
            'total_descobertas': 0,
            'tipos_sugeridos': {}
        }

    # Carrega todas as descobertas
    discovery_files = list(discoveries_dir.glob('*_descoberta_*.json'))

    if not discovery_files:
        logger.info("Nenhuma descoberta encontrada")
        return {
            'data_consolidacao': datetime.now().isoformat(),
            'total_descobertas': 0,
            'tipos_sugeridos': {}
        }

    # Agrupa por tipo_sugerido
    tipos_agrupados: Dict[str, Dict[str, Any]] = {}

    for discovery_file in discovery_files:
        try:
            with open(discovery_file, 'r', encoding='utf-8') as f:
                discovery = json.load(f)

            tipo = discovery.get('tipo_sugerido')
            if not tipo:
                continue

            if tipo not in tipos_agrupados:
                tipos_agrupados[tipo] = {
                    'contagem': 0,
                    'categorias': [],
                    'descricoes': [],
                    'caracteristicas_todas': [],
                    'campos_todos': [],
                    'arquivos_exemplo': [],
                    'casos': []
                }

            grupo = tipos_agrupados[tipo]
            grupo['contagem'] += 1

            if discovery.get('categoria_recomendada'):
                grupo['categorias'].append(discovery['categoria_recomendada'])

            if discovery.get('descricao'):
                grupo['descricoes'].append(discovery['descricao'])

            if discovery.get('caracteristicas_identificadoras'):
                grupo['caracteristicas_todas'].extend(discovery['caracteristicas_identificadoras'])

            if discovery.get('campos_principais'):
                grupo['campos_todos'].extend(discovery['campos_principais'])

            if discovery.get('arquivo_origem'):
                grupo['arquivos_exemplo'].append(discovery['arquivo_origem'])

            if discovery.get('caso_id'):
                grupo['casos'].append(discovery['caso_id'])

        except Exception as e:
            logger.warning(f"Erro ao processar descoberta {discovery_file}: {e}")

    # Processa grupos para formato final
    tipos_consolidados = {}
    for tipo, grupo in tipos_agrupados.items():
        # Encontra categoria mais comum
        categorias = grupo['categorias']
        categoria_mais_comum = max(set(categorias), key=categorias.count) if categorias else 'ADMINISTRATIVOS'

        # Remove duplicatas mantendo ordem
        caracteristicas_unicas = list(dict.fromkeys(grupo['caracteristicas_todas']))
        campos_unicos = list(dict.fromkeys(grupo['campos_todos']))
        arquivos_unicos = list(dict.fromkeys(grupo['arquivos_exemplo']))[:10]  # Máximo 10 exemplos
        casos_unicos = list(dict.fromkeys(grupo['casos']))

        tipos_consolidados[tipo] = {
            'contagem': grupo['contagem'],
            'categoria_mais_comum': categoria_mais_comum,
            'descricoes': list(dict.fromkeys(grupo['descricoes']))[:5],  # Máximo 5 descrições
            'caracteristicas_unificadas': caracteristicas_unicas[:15],  # Máximo 15
            'campos_unificados': campos_unicos[:20],  # Máximo 20
            'arquivos_exemplo': arquivos_unicos,
            'casos': casos_unicos
        }

    # Ordena por contagem (mais frequentes primeiro)
    tipos_ordenados = dict(
        sorted(tipos_consolidados.items(), key=lambda x: x[1]['contagem'], reverse=True)
    )

    resultado = {
        'data_consolidacao': datetime.now().isoformat(),
        'total_descobertas': len(discovery_files),
        'total_tipos_unicos': len(tipos_ordenados),
        'tipos_sugeridos': tipos_ordenados
    }

    # Salva consolidação
    consolidation_file = discoveries_dir / '_consolidacao.json'
    with open(consolidation_file, 'w', encoding='utf-8') as f:
        json.dump(resultado, f, ensure_ascii=False, indent=2)

    logger.info(f"Consolidação salva: {consolidation_file}")
    logger.info(f"Total de descobertas: {len(discovery_files)}")
    logger.info(f"Tipos únicos sugeridos: {len(tipos_ordenados)}")

    return resultado


def load_inventory(input_path: Path) -> dict:
    """
    Carrega o inventário bruto da Fase 1.1.

    Args:
        input_path: Caminho para o arquivo JSON de inventário

    Returns:
        Dados do inventário
    """
    if not input_path.exists():
        raise FileNotFoundError(f"Inventário não encontrado: {input_path}")

    with open(input_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    logger.info(f"Inventário carregado: {len(data.get('arquivos', []))} arquivos")
    return data


def filter_processable_files(arquivos: list) -> list:
    """
    Filtra apenas arquivos que podem ser processados (imagens e PDFs).

    Args:
        arquivos: Lista de arquivos do inventário

    Returns:
        Lista filtrada de arquivos processáveis
    """
    processable = []
    skipped = []

    for arquivo in arquivos:
        ext = arquivo.get('extensao', '').lower()
        if ext.startswith('.'):
            ext = ext[1:]

        full_ext = f'.{ext}'
        if full_ext in SUPPORTED_IMAGE_EXTENSIONS or full_ext == SUPPORTED_PDF_EXTENSION or full_ext in SUPPORTED_DOCX_EXTENSIONS:
            processable.append(arquivo)
        else:
            skipped.append(arquivo['nome'])

    if skipped:
        logger.info(f"Arquivos ignorados (extensão não suportada): {len(skipped)}")
        for name in skipped[:5]:  # Mostra apenas os 5 primeiros
            logger.debug(f"  - {name}")
        if len(skipped) > 5:
            logger.debug(f"  ... e mais {len(skipped) - 5}")

    return processable


def run_classification(
    input_path: Path,
    output_path: Path,
    mock_mode: bool = False,
    limit: Optional[int] = None
):
    """
    Executa o pipeline de classificação completo.

    Args:
        input_path: Caminho do inventário de entrada
        output_path: Caminho do arquivo de saída
        mock_mode: Se True, usa classificação mock sem API
        limit: Limita o número de arquivos processados (para testes)
    """
    # Carrega ambiente e configura Gemini
    if not mock_mode:
        api_key = load_environment()
        model = configure_gemini(api_key, mock_mode)
        model_name = "gemini-2.0-flash-exp"
    else:
        model = None
        model_name = "mock"

    # Carrega inventário
    inventory = load_inventory(input_path)
    escritura_id = inventory.get('escritura_id', 'unknown')

    # Filtra arquivos processáveis
    all_files = inventory.get('arquivos', [])
    files_to_process = filter_processable_files(all_files)

    if limit:
        files_to_process = files_to_process[:limit]
        logger.info(f"Limitando processamento a {limit} arquivos (modo teste)")

    total = len(files_to_process)
    logger.info(f"Iniciando classificação de {total} arquivos para escritura {escritura_id}")

    # Estrutura de resultado
    result = {
        'escritura_id': escritura_id,
        'data_classificacao': datetime.now().isoformat(),
        'modelo_utilizado': model_name,
        'total_processados': 0,
        'total_sucesso': 0,
        'total_erro': 0,
        'classificacoes': []
    }

    # Processa cada arquivo
    for idx, file_info in enumerate(files_to_process, 1):
        logger.info(f"Processando {idx}/{total}: {file_info['nome']}")

        # Classifica
        classification = classify_document(model, file_info, mock_mode, escritura_id)
        result['classificacoes'].append(classification)

        # Atualiza contadores
        result['total_processados'] = idx
        if classification['status'] == 'sucesso':
            result['total_sucesso'] += 1
        else:
            result['total_erro'] += 1
            logger.warning(f"  Erro: {classification.get('erro_mensagem', 'desconhecido')}")

        # Salva progresso parcial
        if idx % SAVE_PROGRESS_INTERVAL == 0:
            save_progress(output_path, result)
            logger.info(f"Progresso salvo ({idx}/{total})")

        # Rate limiting (exceto mock e último arquivo)
        if not mock_mode and idx < total:
            logger.debug(f"Rate limiting: aguardando {RATE_LIMIT_DELAY}s...")
            time.sleep(RATE_LIMIT_DELAY)

    # Salva resultado final
    result['data_classificacao'] = datetime.now().isoformat()
    save_progress(output_path, result)

    # Resumo
    logger.info("=" * 50)
    logger.info("CLASSIFICAÇÃO CONCLUÍDA")
    logger.info(f"  Escritura: {escritura_id}")
    logger.info(f"  Total processados: {result['total_processados']}")
    logger.info(f"  Sucesso: {result['total_sucesso']}")
    logger.info(f"  Erros: {result['total_erro']}")
    logger.info(f"  Arquivo de saída: {output_path}")
    logger.info("=" * 50)

    return result


def main():
    """Função principal - entry point do script"""
    parser = argparse.ArgumentParser(
        description='Classifica documentos de cartório usando Gemini Vision',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemplos:
  python classify_with_gemini.py FC_515_124
  python classify_with_gemini.py --input .tmp/inventarios/FC_515_124_bruto.json
  python classify_with_gemini.py --mock FC_515_124
  python classify_with_gemini.py --mock --limit 5 FC_515_124

Modo Paralelo (recomendado para lotes grandes):
  python classify_with_gemini.py --parallel FC_515_124
  python classify_with_gemini.py --parallel --workers 8 FC_515_124
  python classify_with_gemini.py --parallel --mock FC_515_124

Consolidar Descobertas (documentos DESCONHECIDO):
  python classify_with_gemini.py --consolidar-descobertas

O modo paralelo prepara documentos (carrega imagens/PDFs) em paralelo
enquanto mantém o rate limit de 6s entre chamadas à API Gemini.

Documentos DESCONHECIDO:
  Quando o Gemini identifica um documento que não se encaixa nos tipos
  conhecidos, ele sugere um novo tipo com descrição, categoria e campos.
  Essas descobertas são salvas em .tmp/descobertas/ para análise posterior.
  Use --consolidar-descobertas para ver um resumo agrupado por tipo sugerido.
        """
    )

    parser.add_argument(
        'escritura_id',
        nargs='?',
        help='ID da escritura (ex: FC_515_124)'
    )

    parser.add_argument(
        '--input', '-i',
        type=str,
        help='Caminho completo para o arquivo de inventário JSON'
    )

    parser.add_argument(
        '--output', '-o',
        type=str,
        help='Caminho para o arquivo de saída (opcional)'
    )

    parser.add_argument(
        '--mock', '-m',
        action='store_true',
        help='Modo mock: classifica baseado no nome do arquivo sem usar API'
    )

    parser.add_argument(
        '--limit', '-l',
        type=int,
        help='Limita o número de arquivos processados (para testes)'
    )

    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Modo verbose: mostra mais detalhes'
    )

    parser.add_argument(
        '--parallel', '-p',
        action='store_true',
        help='Modo paralelo: prepara documentos em paralelo (recomendado para lotes grandes)'
    )

    parser.add_argument(
        '--workers', '-w',
        type=int,
        default=PARALLEL_WORKERS,
        help=f'Número de workers para preparação paralela (default: {PARALLEL_WORKERS})'
    )

    parser.add_argument(
        '--consolidar-descobertas',
        action='store_true',
        help='Consolida todas as descobertas de documentos DESCONHECIDO em .tmp/descobertas/'
    )

    args = parser.parse_args()

    # Configura nível de log
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    # Se solicitou consolidação de descobertas, executa e sai
    if args.consolidar_descobertas:
        logger.info("Consolidando descobertas de documentos DESCONHECIDO...")
        result = consolidate_discoveries()
        if result['total_descobertas'] > 0:
            print(f"\nConsolidação concluída:")
            print(f"  Total de descobertas: {result['total_descobertas']}")
            print(f"  Tipos únicos sugeridos: {result['total_tipos_unicos']}")
            print(f"\nTipos sugeridos (ordenados por frequência):")
            for tipo, dados in result['tipos_sugeridos'].items():
                print(f"  - {tipo}: {dados['contagem']}x ({dados['categoria_mais_comum']})")
            print(f"\nArquivo de consolidação: {ROOT_DIR / DISCOVERIES_DIR / '_consolidacao.json'}")
        else:
            print("Nenhuma descoberta encontrada para consolidar.")
        sys.exit(0)

    # Determina caminhos
    tmp_dir = ROOT_DIR / '.tmp'

    if args.input:
        input_path = Path(args.input)
        if not input_path.is_absolute():
            input_path = ROOT_DIR / input_path
        # Extrai escritura_id do nome do arquivo
        escritura_id = input_path.stem.replace('_bruto', '')
    elif args.escritura_id:
        escritura_id = args.escritura_id
        input_path = tmp_dir / 'inventarios' / f'{escritura_id}_bruto.json'
    else:
        parser.error('Forneça escritura_id ou --input')

    if args.output:
        output_path = Path(args.output)
        if not output_path.is_absolute():
            output_path = ROOT_DIR / args.output
    else:
        output_path = tmp_dir / 'classificacoes' / f'{escritura_id}_classificacao.json'

    # Verifica se inventário existe
    if not input_path.exists():
        logger.error(f"Arquivo de inventário não encontrado: {input_path}")
        logger.info("Execute primeiro a Fase 1.1 para gerar o inventário bruto.")
        sys.exit(1)

    # Executa classificação
    try:
        if args.parallel:
            # Modo paralelo: prepara documentos em paralelo, envia com rate limit
            logger.info("Usando modo PARALELO para classificação")
            result = run_classification_parallel(
                input_path=input_path,
                output_path=output_path,
                mock_mode=args.mock,
                limit=args.limit,
                num_workers=args.workers
            )
        else:
            # Modo serial: processamento tradicional sequencial
            logger.info("Usando modo SERIAL para classificação")
            result = run_classification(
                input_path=input_path,
                output_path=output_path,
                mock_mode=args.mock,
                limit=args.limit
            )

        # Retorna código de saída baseado em erros
        if result['total_erro'] > 0:
            sys.exit(2)  # Concluído com erros
        sys.exit(0)  # Sucesso total

    except Exception as e:
        logger.exception(f"Erro fatal: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
