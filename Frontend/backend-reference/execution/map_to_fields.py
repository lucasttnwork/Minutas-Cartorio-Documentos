#!/usr/bin/env python3
"""
map_to_fields.py - Fase 4: Mapeamento de Dados para Campos da Minuta

Este script mapeia os dados extraidos dos documentos de cartorio (Fase 3)
para os campos padronizados da minuta de escritura. Ele:

1. Le todos os JSONs de dados extraidos (.tmp/contextual/{caso_id}/*.json)
2. Identifica alienantes, adquirentes e imovel
3. Mapeia campos de cada tipo de documento para a estrutura da minuta
4. Resolve conflitos entre fontes de dados (prioridade: RG > Certidao > Matricula)
5. Gera arquivo de saida consolidado (.tmp/mapped/{caso_id}.json)

Uso:
    python execution/map_to_fields.py FC_515_124_p280509
    python execution/map_to_fields.py FC_515_124_p280509 --verbose
    python execution/map_to_fields.py FC_515_124_p280509 --output-format json

Autor: Pipeline de Minutas
Data: Janeiro 2026
Versao: 1.0
"""

import argparse
import json
import logging
import os
import re
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any, Set, Tuple

# Adiciona o diretorio raiz ao path para imports
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

# Bibliotecas externas
try:
    from dotenv import load_dotenv
except ImportError:
    print("Erro: python-dotenv nao encontrado. Instale: pip install python-dotenv")
    sys.exit(1)

# Carrega variaveis de ambiente
load_dotenv(ROOT_DIR / '.env')

# Configuracao de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# Constantes
TMP_DIR = ROOT_DIR / '.tmp'
CONTEXTUAL_DIR = TMP_DIR / 'contextual'
MAPPED_DIR = TMP_DIR / 'mapped'
CATALOGOS_DIR = TMP_DIR / 'catalogos'

# Prioridade de fontes para resolucao de conflitos (maior = maior prioridade)
SOURCE_PRIORITY = {
    'RG': 100,
    'CERTIDAO_NASCIMENTO': 95,
    'CERTIDAO_CASAMENTO': 90,
    'COMPROMISSO_COMPRA_VENDA': 85,
    'MATRICULA_IMOVEL': 80,
    'CNDT': 75,
    'ITBI': 70,
    'IPTU': 65,
    'VVR': 60,
    'CND_MUNICIPAL': 55,
    'CND_CONDOMINIO': 54,
    'ESCRITURA': 50,
    'COMPROVANTE_PAGAMENTO': 40,
    'PROTOCOLO_ONR': 30,
    'ASSINATURA_DIGITAL': 20,
    'OUTRO': 10
}


# =============================================================================
# CLASSES DE DADOS
# =============================================================================

class PessoaNatural:
    """Representa uma pessoa natural (fisica) na transacao."""

    def __init__(self):
        self.tipo = "pessoa_natural"
        self.nome: Optional[str] = None
        self.cpf: Optional[str] = None
        self.rg: Optional[str] = None
        self.orgao_emissor_rg: Optional[str] = None
        self.estado_emissor_rg: Optional[str] = None
        self.data_emissao_rg: Optional[str] = None
        self.data_nascimento: Optional[str] = None
        self.nacionalidade: Optional[str] = None
        self.naturalidade: Optional[str] = None
        self.profissao: Optional[str] = None
        self.estado_civil: Optional[str] = None
        self.regime_bens: Optional[str] = None
        self.data_casamento: Optional[str] = None
        self.conjuge: Optional[str] = None
        self.filiacao_pai: Optional[str] = None
        self.filiacao_mae: Optional[str] = None

        # Domicilio
        self.domicilio = {
            "logradouro": None,
            "numero": None,
            "complemento": None,
            "bairro": None,
            "cidade": None,
            "estado": None,
            "cep": None
        }

        # CNDT
        self.cndt = {
            "numero": None,
            "data_expedicao": None,
            "hora_expedicao": None,
            "validade": None,
            "status": None
        }

        # Dados da transacao
        self.fracao_ideal: Optional[str] = None
        self.valor_alienacao: Optional[str] = None

        # Rastreamento de fontes
        self._fontes: Dict[str, List[str]] = {}

    def set_field(self, field: str, value: Any, source: str) -> bool:
        """
        Define um campo com rastreamento de fonte e resolucao de conflitos.

        Args:
            field: Nome do campo
            value: Valor a ser definido
            source: Nome do arquivo fonte

        Returns:
            True se o valor foi aceito, False se foi rejeitado por conflito
        """
        if value is None or (isinstance(value, str) and not value.strip()):
            return False

        # Normaliza valor string
        if isinstance(value, str):
            value = value.strip().upper() if field in ['nome', 'nacionalidade', 'profissao', 'estado_civil', 'conjuge'] else value.strip()

        current_value = getattr(self, field, None) if hasattr(self, field) else None

        # Se campo ja tem valor, verifica prioridade
        if current_value is not None and current_value != value:
            # Extrai tipo do documento do nome do arquivo
            current_sources = self._fontes.get(field, [])
            current_priority = max(
                (self._get_source_priority(s) for s in current_sources),
                default=0
            )
            new_priority = self._get_source_priority(source)

            if new_priority <= current_priority:
                logger.debug(f"Conflito ignorado para {field}: mantendo '{current_value}' (prioridade {current_priority}) vs '{value}' (prioridade {new_priority})")
                return False
            else:
                logger.debug(f"Conflito resolvido para {field}: substituindo '{current_value}' por '{value}' (maior prioridade)")

        # Define o valor
        if hasattr(self, field):
            setattr(self, field, value)
        elif field.startswith('domicilio_'):
            subfield = field.replace('domicilio_', '')
            self.domicilio[subfield] = value
        elif field.startswith('cndt_'):
            subfield = field.replace('cndt_', '')
            self.cndt[subfield] = value

        # Registra fonte
        if field not in self._fontes:
            self._fontes[field] = []
        if source not in self._fontes[field]:
            self._fontes[field].append(source)

        return True

    def _get_source_priority(self, source: str) -> int:
        """Obtem prioridade de uma fonte baseado no tipo do documento."""
        for tipo, priority in SOURCE_PRIORITY.items():
            if tipo in source.upper():
                return priority
        return SOURCE_PRIORITY['OUTRO']

    def to_dict(self) -> Dict[str, Any]:
        """Converte para dicionario."""
        return {
            "tipo": self.tipo,
            "nome": self.nome,
            "cpf": self.cpf,
            "rg": self.rg,
            "orgao_emissor_rg": self.orgao_emissor_rg,
            "estado_emissor_rg": self.estado_emissor_rg,
            "data_emissao_rg": self.data_emissao_rg,
            "data_nascimento": self.data_nascimento,
            "nacionalidade": self.nacionalidade,
            "naturalidade": self.naturalidade,
            "profissao": self.profissao,
            "estado_civil": self.estado_civil,
            "regime_bens": self.regime_bens,
            "data_casamento": self.data_casamento,
            "conjuge": self.conjuge,
            "filiacao": {
                "pai": self.filiacao_pai,
                "mae": self.filiacao_mae
            },
            "domicilio": self.domicilio,
            "cndt": self.cndt,
            "fracao_ideal": self.fracao_ideal,
            "valor_alienacao": self.valor_alienacao,
            "_fontes": self._fontes
        }


class Imovel:
    """Representa os dados do imovel na transacao."""

    def __init__(self):
        # Matricula
        self.matricula_numero: Optional[str] = None
        self.matricula_cartorio: Optional[str] = None
        self.matricula_cidade: Optional[str] = None
        self.matricula_estado: Optional[str] = None

        # Descricao
        self.tipo_imovel: Optional[str] = None
        self.edificio: Optional[str] = None
        self.unidade: Optional[str] = None
        self.bloco: Optional[str] = None
        self.andar: Optional[str] = None
        self.area_total: Optional[str] = None
        self.area_privativa: Optional[str] = None
        self.area_comum: Optional[str] = None
        self.fracao_ideal: Optional[str] = None

        # Endereco
        self.logradouro: Optional[str] = None
        self.numero: Optional[str] = None
        self.complemento: Optional[str] = None
        self.bairro: Optional[str] = None
        self.cidade: Optional[str] = None
        self.estado: Optional[str] = None
        self.cep: Optional[str] = None

        # Cadastro municipal
        self.sql: Optional[str] = None

        # Valores venais
        self.valor_venal_iptu: Optional[str] = None
        self.valor_venal_referencia: Optional[str] = None
        self.ano_exercicio_iptu: Optional[int] = None

        # CND Municipal
        self.cnd_numero: Optional[str] = None
        self.cnd_data_emissao: Optional[str] = None
        self.cnd_validade: Optional[str] = None
        self.cnd_status: Optional[str] = None

        # CND Condomínio
        self.cnd_condominio_status: Optional[str] = None
        self.cnd_condominio_data_emissao: Optional[str] = None
        self.cnd_condominio_validade: Optional[str] = None
        self.cnd_condominio_codigo: Optional[str] = None

        # Proprietarios atuais (antes da venda)
        self.proprietarios: List[Dict] = []

        # Onus
        self.onus: Optional[List[Dict]] = None
        self.onus_historicos: Optional[List[Dict]] = None

        # Rastreamento de fontes
        self._fontes: Dict[str, List[str]] = {}

    def set_field(self, field: str, value: Any, source: str) -> bool:
        """
        Define um campo com rastreamento de fonte e resolução de conflitos.

        Respeita prioridade de fontes (como PessoaNatural) para evitar que
        fontes menos confiáveis sobrescrevam dados de fontes mais confiáveis.

        EXCEÇÃO: Para o campo tipo_imovel, a MATRICULA tem prioridade máxima
        quando o valor é específico (apartamento, vaga_garagem, etc.) em vez
        de genérico (outro, desconhecido).
        """
        if value is None or (isinstance(value, str) and not value.strip()):
            return False

        if isinstance(value, str):
            value = value.strip()

        current_value = getattr(self, field, None) if hasattr(self, field) else None

        # Se campo já tem valor, verifica prioridade
        if current_value is not None and current_value != value:
            # Tratamento especial para tipo_imovel: prioriza valores específicos sobre genéricos
            if field == 'tipo_imovel':
                tipos_genericos = ['outro', 'desconhecido', 'nao_informado', '']
                novo_eh_generico = value.lower() in tipos_genericos
                atual_eh_generico = current_value.lower() in tipos_genericos

                # Se atual é genérico e novo é específico, aceita
                if atual_eh_generico and not novo_eh_generico:
                    logger.debug(f"Imovel.set_field: tipo_imovel atualizado de genérico '{current_value}' para específico '{value}'")
                # Se atual é específico e novo é genérico, rejeita
                elif not atual_eh_generico and novo_eh_generico:
                    logger.debug(f"Imovel.set_field: tipo_imovel '{value}' (genérico) rejeitado em favor de '{current_value}' (específico)")
                    return False
                # Se ambos são específicos, usa a prioridade padrão de fonte
                # mas MATRICULA_IMOVEL tem prioridade especial para tipo
                elif 'MATRICULA_IMOVEL' in source.upper() and 'MATRICULA_IMOVEL' not in str(self._fontes.get(field, [])).upper():
                    logger.debug(f"Imovel.set_field: tipo_imovel '{value}' da MATRICULA substitui '{current_value}'")
                else:
                    # Verifica prioridade normal
                    current_sources = self._fontes.get(field, [])
                    current_priority = max(
                        (self._get_source_priority(s) for s in current_sources),
                        default=0
                    )
                    new_priority = self._get_source_priority(source)
                    if new_priority <= current_priority:
                        logger.debug(f"Imovel.set_field: tipo_imovel conflito ignorado: mantendo '{current_value}'")
                        return False
            else:
                # Prioridade normal para outros campos
                current_sources = self._fontes.get(field, [])
                current_priority = max(
                    (self._get_source_priority(s) for s in current_sources),
                    default=0
                )
                new_priority = self._get_source_priority(source)

                if new_priority <= current_priority:
                    logger.debug(f"Imovel.set_field: Conflito ignorado para {field}: mantendo '{current_value}' (prioridade {current_priority}) vs '{value}' (prioridade {new_priority})")
                    return False
                else:
                    logger.debug(f"Imovel.set_field: Conflito resolvido para {field}: substituindo '{current_value}' por '{value}' (maior prioridade)")

        if hasattr(self, field):
            setattr(self, field, value)

        if field not in self._fontes:
            self._fontes[field] = []
        if source not in self._fontes[field]:
            self._fontes[field].append(source)

        return True

    def _get_source_priority(self, source: str) -> int:
        """Obtém prioridade de uma fonte baseado no tipo do documento."""
        for tipo, priority in SOURCE_PRIORITY.items():
            if tipo in source.upper():
                return priority
        return SOURCE_PRIORITY['OUTRO']

    def to_dict(self) -> Dict[str, Any]:
        """Converte para dicionario."""
        return {
            "matricula": {
                "numero": self.matricula_numero,
                "registro_imoveis": self.matricula_cartorio,
                "cidade": self.matricula_cidade,
                "estado": self.matricula_estado
            },
            "descricao": {
                "tipo": self.tipo_imovel,
                "edificio": self.edificio,
                "unidade": self.unidade,
                "bloco": self.bloco,
                "andar": self.andar,
                "area_total": self.area_total,
                "area_privativa": self.area_privativa,
                "area_comum": self.area_comum,
                "fracao_ideal": self.fracao_ideal,
                "logradouro": self.logradouro,
                "numero": self.numero,
                "complemento": self.complemento,
                "bairro": self.bairro,
                "cidade": self.cidade,
                "estado": self.estado,
                "cep": self.cep
            },
            "cadastro": {
                "sql": self.sql
            },
            "valores_venais": {
                "iptu": self.valor_venal_iptu,
                "vvr": self.valor_venal_referencia,
                "ano_exercicio": self.ano_exercicio_iptu
            },
            "certidao_negativa_municipal": {
                "numero": self.cnd_numero,
                "data_emissao": self.cnd_data_emissao,
                "validade": self.cnd_validade,
                "status": self.cnd_status
            },
            "certidao_negativa_condominio": {
                "status": self.cnd_condominio_status,
                "data_emissao": self.cnd_condominio_data_emissao,
                "validade": self.cnd_condominio_validade,
                "codigo_verificacao": self.cnd_condominio_codigo
            },
            "proprietarios": self.proprietarios,
            "onus": self.onus,
            "onus_historicos": self.onus_historicos,
            "_fontes": self._fontes
        }


class Negocio:
    """Representa os dados do negocio juridico."""

    def __init__(self):
        # Valores
        self.valor_total: Optional[str] = None
        self.fracao_alienada: Optional[str] = None

        # Forma de pagamento
        self.tipo_pagamento: Optional[str] = None
        self.sinal: Optional[str] = None
        self.saldo: Optional[str] = None
        self.prazo_pagamento: Optional[str] = None

        # ITBI - Lista de guias para acumular multiplas guias
        self.itbi_guias: List[Dict] = []
        self.itbi_data_vencimento: Optional[str] = None
        self.itbi_data_pagamento: Optional[str] = None

        # Corretagem
        self.corretagem_valor: Optional[str] = None
        self.corretagem_responsavel: Optional[str] = None
        self.intermediador: Optional[str] = None

        # Rastreamento de fontes
        self._fontes: Dict[str, List[str]] = {}

    def set_field(self, field: str, value: Any, source: str) -> bool:
        """Define um campo com rastreamento de fonte."""
        if value is None or (isinstance(value, str) and not value.strip()):
            return False

        if isinstance(value, str):
            value = value.strip()
            # Ignora valores placeholder/invalidos
            if value.upper() == 'NAO_INFORMADO':
                return False

        # Nao sobrescreve valor valido existente
        current_value = getattr(self, field, None) if hasattr(self, field) else None
        if current_value is not None and current_value != value:
            # Se ja tem valor valido, nao sobrescreve
            return False

        if hasattr(self, field):
            setattr(self, field, value)

        if field not in self._fontes:
            self._fontes[field] = []
        if source not in self._fontes[field]:
            self._fontes[field].append(source)

        return True

    def _calcular_totais_itbi(self) -> Tuple[Optional[str], Optional[str]]:
        """Calcula totais de ITBI somando todas as guias."""
        if not self.itbi_guias:
            return None, None

        total_base = 0.0
        total_valor = 0.0

        for guia in self.itbi_guias:
            # Extrai valor da base de calculo
            base_str = guia.get('base_calculo', '')
            if base_str:
                try:
                    base_limpa = base_str.replace('R$', '').replace('.', '').replace(',', '.').strip()
                    total_base += float(base_limpa)
                except (ValueError, AttributeError):
                    pass

            # Extrai valor do ITBI
            valor_str = guia.get('valor', '')
            if valor_str:
                try:
                    valor_limpo = valor_str.replace('R$', '').replace('.', '').replace(',', '.').strip()
                    total_valor += float(valor_limpo)
                except (ValueError, AttributeError):
                    pass

        # Formata para string no padrao brasileiro
        total_base_str = f"R$ {total_base:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.') if total_base > 0 else None
        total_valor_str = f"R$ {total_valor:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.') if total_valor > 0 else None

        return total_base_str, total_valor_str

    def to_dict(self) -> Dict[str, Any]:
        """Converte para dicionario."""
        # Calcula totais das guias de ITBI
        total_base_calculo, total_valor_itbi = self._calcular_totais_itbi()

        return {
            "valor": {
                "total": self.valor_total,
                "fracao_alienada": self.fracao_alienada
            },
            "forma_pagamento": {
                "tipo": self.tipo_pagamento,
                "sinal": self.sinal,
                "saldo": self.saldo,
                "prazo": self.prazo_pagamento
            },
            "itbi": {
                "guias": self.itbi_guias,
                "total_base_calculo": total_base_calculo,
                "total_valor": total_valor_itbi,
                "data_vencimento": self.itbi_data_vencimento,
                "data_pagamento": self.itbi_data_pagamento
            },
            "corretagem": {
                "valor": self.corretagem_valor,
                "responsavel": self.corretagem_responsavel,
                "intermediador": self.intermediador
            },
            "_fontes": self._fontes
        }


# =============================================================================
# FUNCOES DE MAPEAMENTO POR TIPO DE DOCUMENTO
# =============================================================================

def normalizar_cpf(cpf: Optional[str]) -> Optional[str]:
    """Normaliza CPF para formato XXX.XXX.XXX-XX."""
    if not cpf:
        return None

    # Remove caracteres nao numericos
    numeros = re.sub(r'\D', '', cpf)

    if len(numeros) != 11:
        return cpf  # Retorna original se nao for CPF valido

    return f"{numeros[:3]}.{numeros[3:6]}.{numeros[6:9]}-{numeros[9:]}"


def normalizar_valor(valor: Any) -> Optional[str]:
    """Normaliza valor monetario para formato R$ X.XXX,XX."""
    if valor is None:
        return None

    if isinstance(valor, (int, float)):
        return f"R$ {valor:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')

    if isinstance(valor, str):
        # Remove R$ e espacos
        valor_limpo = valor.replace('R$', '').strip()

        # Tenta converter para float e formatar
        try:
            # Trata formato brasileiro (1.234,56)
            valor_limpo = valor_limpo.replace('.', '').replace(',', '.')
            valor_float = float(valor_limpo)
            return f"R$ {valor_float:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')
        except ValueError:
            return valor

    return str(valor)


def normalizar_area(area: Any) -> Optional[str]:
    """Normaliza area para formato XX,XX m2."""
    if area is None:
        return None

    if isinstance(area, (int, float)):
        return f"{area:.2f} m2".replace('.', ',')

    if isinstance(area, str):
        # Padroniza sufixo
        area = area.replace('m²', 'm2').replace(' m2', 'm2')
        if 'm2' not in area.lower():
            try:
                area_float = float(area.replace(',', '.'))
                return f"{area_float:.2f} m2".replace('.', ',')
            except ValueError:
                pass

    return str(area)


def extrair_unidade_andar(complemento: str) -> Tuple[Optional[str], Optional[str]]:
    """Extrai unidade e andar do complemento do endereco."""
    unidade = None
    andar = None

    if complemento:
        # Padroes comuns: "Unidade Autonoma no 124", "Apto 124", "Apt 124", etc
        unidade_match = re.search(r'(?:n[º°]?|Apto?\.?|Unidade)\s*(\d+)', complemento, re.IGNORECASE)
        if unidade_match:
            unidade = unidade_match.group(1)

        # Padroes: "12o andar", "12o andar", "andar 12", "no 12º andar"
        andar_match = re.search(r'(\d+)[º°o]?\s*andar|andar\s*(\d+)|no\s+(\d+)[º°o]?\s*andar', complemento, re.IGNORECASE)
        if andar_match:
            andar = f"{andar_match.group(1) or andar_match.group(2) or andar_match.group(3)}º"

    return unidade, andar


def extrair_andar_de_descricao(descricao: str) -> Optional[str]:
    """Extrai o andar de uma descrição completa do imóvel."""
    if not descricao:
        return None

    # Padrões comuns em descrições de matrícula
    # "Unidade autônoma nº 124 no 12º andar"
    # "apartamento 124, 12o andar"
    # "no 12º andar do Edifício"
    patterns = [
        r'no\s+(\d+)[º°o]?\s*andar',
        r'(\d+)[º°o]?\s*andar\s+do',
        r'(\d+)[º°o]?\s*andar',
        r'andar\s*(\d+)',
    ]

    for pattern in patterns:
        match = re.search(pattern, descricao, re.IGNORECASE)
        if match:
            numero = match.group(1)
            if numero:
                return f"{numero}º"

    return None


def parse_date_br(date_str: Optional[str]) -> Optional[datetime]:
    """Converte data no formato brasileiro (DD/MM/YYYY) para datetime."""
    if not date_str:
        return None
    try:
        # Tenta formato brasileiro
        return datetime.strptime(date_str.strip(), '%d/%m/%Y')
    except ValueError:
        try:
            # Tenta formato ISO
            return datetime.strptime(date_str.strip(), '%Y-%m-%d')
        except ValueError:
            return None


def normalizar_matricula(numero: str) -> str:
    """
    Normaliza numero de matricula para uso como chave de dicionario.

    Remove pontos, espacos e outros caracteres para garantir consistencia
    entre diferentes fontes (CCV pode ter "116239" enquanto matricula tem "116.239").
    """
    if not numero:
        return ""
    # Remove pontos, espacos, tracos e outros caracteres nao-numericos
    return re.sub(r'[^\d]', '', str(numero).strip())


def parse_endereco(endereco_completo: str) -> Dict[str, Optional[str]]:
    """
    Parseia endereco completo em componentes individuais.

    Exemplo de entrada: "Rua Mil Oitocentos e Vinte e Dois - 1453 - 94 - Ipiranga - CEP 04216-001 - Sao Paulo - SP"

    Retorna dicionario com: logradouro, numero, complemento, bairro, cidade, estado, cep
    """
    resultado = {
        "logradouro": None,
        "numero": None,
        "complemento": None,
        "bairro": None,
        "cidade": None,
        "estado": None,
        "cep": None
    }

    if not endereco_completo or not isinstance(endereco_completo, str):
        return resultado

    endereco_completo = endereco_completo.strip()

    # Extrai CEP (formato: CEP 12345-678 ou CEP: 12345678)
    cep_match = re.search(r'CEP[:\s]*(\d{5}-?\d{3})', endereco_completo, re.IGNORECASE)
    if cep_match:
        resultado['cep'] = cep_match.group(1)
        # Remove o CEP do endereco para facilitar parsing
        endereco_completo = re.sub(r'\s*-?\s*CEP[:\s]*\d{5}-?\d{3}\s*-?\s*', ' - ', endereco_completo, flags=re.IGNORECASE)

    # Extrai UF (2 letras maiusculas no final ou isoladas)
    uf_match = re.search(r'\b([A-Z]{2})\s*$', endereco_completo)
    if uf_match:
        uf = uf_match.group(1)
        # Valida se e uma UF valida do Brasil
        ufs_validas = {'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
                       'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC',
                       'SP', 'SE', 'TO'}
        if uf in ufs_validas:
            resultado['estado'] = uf
            # Remove a UF do endereco
            endereco_completo = endereco_completo[:uf_match.start()].strip().rstrip('-').strip()

    # Divide por separadores comuns (-, –, ,)
    partes = re.split(r'\s*[-–,]\s*', endereco_completo)
    partes = [p.strip() for p in partes if p.strip()]

    if not partes:
        return resultado

    # Primeira parte geralmente e logradouro (pode incluir numero no final)
    primeira = partes[0]

    # Tenta extrair numero do final do logradouro
    num_match = re.search(r'\b(\d+)\s*$', primeira)
    if num_match:
        resultado['numero'] = num_match.group(1)
        resultado['logradouro'] = primeira[:num_match.start()].strip()
    else:
        resultado['logradouro'] = primeira

    # Processa partes restantes
    partes_restantes = []
    for i, parte in enumerate(partes[1:], 1):
        parte = parte.strip()
        if not parte:
            continue

        # Se e puramente numerico, pode ser numero ou complemento
        if parte.isdigit():
            if not resultado['numero']:
                resultado['numero'] = parte
            elif not resultado['complemento']:
                resultado['complemento'] = parte
        # Se comeca com indicador de complemento
        elif re.match(r'^(Apto?\.?|Ap\.?|Sala|Bloco|Loja|Casa|Lote|Quadra|Conjunto|Conj\.?|Bl\.?)\s*\d*', parte, re.IGNORECASE):
            if resultado['complemento']:
                resultado['complemento'] = f"{resultado['complemento']} - {parte}"
            else:
                resultado['complemento'] = parte
        else:
            partes_restantes.append(parte)

    # Das partes restantes, atribui bairro e cidade
    for parte in partes_restantes:
        if not resultado['bairro']:
            resultado['bairro'] = parte
        elif not resultado['cidade']:
            resultado['cidade'] = parte

    return resultado


def apply_parsed_endereco(pessoa: 'PessoaNatural', endereco_completo: str, source: str) -> None:
    """
    Aplica os componentes de endereco parseado aos campos de domicilio da pessoa.

    Args:
        pessoa: Instancia de PessoaNatural
        endereco_completo: String com endereco completo
        source: Nome do arquivo fonte
    """
    parsed = parse_endereco(endereco_completo)

    if parsed['logradouro']:
        pessoa.set_field('domicilio_logradouro', parsed['logradouro'], source)
    if parsed['numero']:
        pessoa.set_field('domicilio_numero', parsed['numero'], source)
    if parsed['complemento']:
        pessoa.set_field('domicilio_complemento', parsed['complemento'], source)
    if parsed['bairro']:
        pessoa.set_field('domicilio_bairro', parsed['bairro'], source)
    if parsed['cidade']:
        pessoa.set_field('domicilio_cidade', parsed['cidade'], source)
    if parsed['estado']:
        pessoa.set_field('domicilio_estado', parsed['estado'], source)
    if parsed['cep']:
        pessoa.set_field('domicilio_cep', parsed['cep'], source)


def map_rg_to_pessoa(dados: Dict, pessoa: PessoaNatural, source: str) -> None:
    """
    Mapeia dados de RG para pessoa.

    Campos extraidos: nome, rg, orgao_expedidor, data_nascimento, filiacao, cpf, naturalidade

    IMPORTANTE: Implementa priorização temporal - RGs mais recentes têm prioridade
    sobre RGs antigos, independente da ordem de processamento.
    """
    dados_cat = dados.get('dados_catalogados') or {}

    # Extrai data de emissão do novo RG
    nova_data_emissao_str = dados_cat.get('data_expedicao')
    nova_data_emissao = parse_date_br(nova_data_emissao_str)

    # Verifica se já existe RG e se o novo é mais recente
    rg_atual = pessoa.rg
    data_atual_str = pessoa.data_emissao_rg
    data_atual = parse_date_br(data_atual_str)

    # Determina se deve atualizar o RG baseado na data
    deve_atualizar_rg = True
    if rg_atual and nova_data_emissao and data_atual:
        # Ambos têm data - prioriza o mais recente
        if nova_data_emissao <= data_atual:
            deve_atualizar_rg = False
            logger.debug(f"RG ignorado por ser mais antigo: {dados_cat.get('numero_rg')} ({nova_data_emissao_str}) vs atual ({data_atual_str})")
    elif rg_atual and data_atual and not nova_data_emissao:
        # Atual tem data, novo não tem - mantém o atual
        deve_atualizar_rg = False
        logger.debug(f"RG ignorado por não ter data de emissão: {dados_cat.get('numero_rg')}")

    # Nome sempre pode ser atualizado (não depende de RG)
    pessoa.set_field('nome', dados_cat.get('nome_completo'), source)
    pessoa.set_field('data_nascimento', dados_cat.get('data_nascimento'), source)
    pessoa.set_field('naturalidade', dados_cat.get('naturalidade'), source)

    # RG e campos relacionados - só atualiza se for mais recente
    # Usa atribuição direta para forçar atualização quando priorização temporal indica
    if deve_atualizar_rg:
        novo_rg = dados_cat.get('numero_rg')
        if novo_rg:
            # Atribuição direta para ignorar prioridade de fonte (priorização temporal tem precedência)
            pessoa.rg = novo_rg
            if 'rg' not in pessoa._fontes:
                pessoa._fontes['rg'] = []
            if source not in pessoa._fontes['rg']:
                pessoa._fontes['rg'].append(source)

        novo_orgao = dados_cat.get('orgao_expedidor')
        if novo_orgao:
            pessoa.orgao_emissor_rg = novo_orgao
            if 'orgao_emissor_rg' not in pessoa._fontes:
                pessoa._fontes['orgao_emissor_rg'] = []
            if source not in pessoa._fontes['orgao_emissor_rg']:
                pessoa._fontes['orgao_emissor_rg'].append(source)

        novo_estado = dados_cat.get('uf_expedidor')
        if novo_estado:
            pessoa.estado_emissor_rg = novo_estado
            if 'estado_emissor_rg' not in pessoa._fontes:
                pessoa._fontes['estado_emissor_rg'] = []
            if source not in pessoa._fontes['estado_emissor_rg']:
                pessoa._fontes['estado_emissor_rg'].append(source)

        if nova_data_emissao_str:
            pessoa.data_emissao_rg = nova_data_emissao_str
            if 'data_emissao_rg' not in pessoa._fontes:
                pessoa._fontes['data_emissao_rg'] = []
            if source not in pessoa._fontes['data_emissao_rg']:
                pessoa._fontes['data_emissao_rg'].append(source)

        logger.debug(f"RG atualizado por priorização temporal: {novo_rg} (emissão: {nova_data_emissao_str})")

    # CPF pode estar no RG
    cpf = dados_cat.get('cpf')
    if cpf:
        pessoa.set_field('cpf', normalizar_cpf(cpf), source)

    # Filiacao
    filiacao = dados_cat.get('filiacao', {})
    if filiacao:
        pessoa.set_field('filiacao_pai', filiacao.get('pai'), source)
        pessoa.set_field('filiacao_mae', filiacao.get('mae'), source)


def map_certidao_nascimento_to_pessoa(dados: Dict, pessoa: PessoaNatural, source: str) -> None:
    """
    Mapeia dados de Certidao de Nascimento para pessoa.

    Campos extraidos: nome, data_nascimento, filiacao, naturalidade
    """
    dados_cat = dados.get('dados_catalogados') or {}

    pessoa.set_field('nome', dados_cat.get('nome_completo'), source)
    pessoa.set_field('data_nascimento', dados_cat.get('data_nascimento'), source)
    pessoa.set_field('naturalidade', dados_cat.get('naturalidade'), source)

    # Filiacao
    filiacao = dados_cat.get('filiacao', {})
    if filiacao:
        pessoa.set_field('filiacao_pai', filiacao.get('pai'), source)
        pessoa.set_field('filiacao_mae', filiacao.get('mae'), source)


def map_certidao_casamento_to_pessoa(dados: Dict, pessoa: PessoaNatural, nome_pessoa: str, source: str) -> Dict:
    """
    Mapeia dados de Certidao de Casamento para pessoa.

    Campos extraidos: estado_civil, conjuge, regime_bens, data_casamento, cpf

    IMPORTANTE: Prioriza casamentos mais recentes e detecta múltiplos casamentos.

    Returns:
        Dicionário com informações do casamento detectado para alertas
    """
    dados_cat = dados.get('dados_catalogados') or {}

    # Identifica qual conjuge corresponde a pessoa
    conjuge1 = dados_cat.get('conjuge1', {})
    conjuge2 = dados_cat.get('conjuge2', {})

    # Verifica se a pessoa e conjuge1 ou conjuge2
    nome_upper = nome_pessoa.upper() if nome_pessoa else ''

    meu_dados = None
    conjuge_dados = None

    if conjuge1.get('nome_completo', '').upper() == nome_upper or conjuge1.get('cpf') == pessoa.cpf:
        meu_dados = conjuge1
        conjuge_dados = conjuge2
    elif conjuge2.get('nome_completo', '').upper() == nome_upper or conjuge2.get('cpf') == pessoa.cpf:
        meu_dados = conjuge2
        conjuge_dados = conjuge1

    if meu_dados:
        pessoa.set_field('nome', meu_dados.get('nome_completo'), source)
        pessoa.set_field('cpf', normalizar_cpf(meu_dados.get('cpf')), source)
        pessoa.set_field('data_nascimento', meu_dados.get('data_nascimento'), source)

        # Filiacao
        filiacao = meu_dados.get('filiacao', {})
        if filiacao:
            pessoa.set_field('filiacao_pai', filiacao.get('pai'), source)
            pessoa.set_field('filiacao_mae', filiacao.get('mae'), source)

    # Extrai data do casamento para comparação temporal
    data_casamento_str = dados_cat.get('data_casamento')
    data_casamento = parse_date_br(data_casamento_str)

    # Verifica se já existe um casamento registrado e compara datas
    data_casamento_atual_str = pessoa.data_casamento
    data_casamento_atual = parse_date_br(data_casamento_atual_str)

    # Determina se este casamento é mais recente
    casamento_info = {
        'data': data_casamento_str,
        'conjuge': conjuge_dados.get('nome_completo') if conjuge_dados else None,
        'regime': dados_cat.get('regime_bens'),
        'situacao': dados_cat.get('situacao_atual_vinculo', ''),
        'fonte': source,
        'is_mais_recente': False
    }

    deve_atualizar = True
    if data_casamento and data_casamento_atual:
        if data_casamento > data_casamento_atual:
            # Novo casamento é mais recente
            casamento_info['is_mais_recente'] = True
            logger.info(f"Casamento mais recente detectado: {data_casamento_str} (anterior: {data_casamento_atual_str})")
        else:
            # Casamento atual é mais recente - não atualiza estado civil
            deve_atualizar = False
            logger.debug(f"Casamento ignorado por ser anterior: {data_casamento_str} vs {data_casamento_atual_str}")
    elif data_casamento:
        casamento_info['is_mais_recente'] = True

    # Atualiza dados do cônjuge atual
    if conjuge_dados and deve_atualizar:
        pessoa.set_field('conjuge', conjuge_dados.get('nome_completo'), source)

    # Dados do casamento - só atualiza estado civil se for o casamento mais recente
    if deve_atualizar:
        situacao = dados_cat.get('situacao_atual_vinculo', '').upper()
        if situacao == 'CASADOS':
            pessoa.set_field('estado_civil', 'CASADO', source)
        elif situacao == 'DIVORCIADOS':
            pessoa.set_field('estado_civil', 'DIVORCIADO', source)
        elif situacao == 'SEPARADOS':
            pessoa.set_field('estado_civil', 'SEPARADO JUDICIALMENTE', source)

        pessoa.set_field('regime_bens', dados_cat.get('regime_bens'), source)
        pessoa.set_field('data_casamento', data_casamento_str, source)

    return casamento_info


def map_cndt_to_pessoa(dados: Dict, pessoa: PessoaNatural, source: str) -> None:
    """
    Mapeia dados de CNDT para pessoa.

    Campos extraidos: cndt (numero, data_expedicao, hora_expedicao, validade, status)
    """
    dados_cat = dados.get('dados_catalogados') or {}

    pessoa.set_field('cndt_numero', dados_cat.get('numero_certidao'), source)
    pessoa.set_field('cndt_data_expedicao', dados_cat.get('data_emissao'), source)
    pessoa.set_field('cndt_hora_expedicao', dados_cat.get('hora_emissao'), source)
    pessoa.set_field('cndt_validade', dados_cat.get('data_validade'), source)
    pessoa.set_field('cndt_status', dados_cat.get('resultado_certidao'), source)


def map_compromisso_to_partes(dados: Dict, pessoas: Dict[str, PessoaNatural], imoveis: Dict[str, Imovel], negocio: Negocio, source: str) -> Tuple[List[str], List[str], List[str]]:
    """
    Mapeia dados do Compromisso de Compra e Venda.

    Campos extraidos: dados das partes (vendedores, compradores, usufrutuarios), imovel, valores, forma_pagamento

    Args:
        dados: Dados do documento
        pessoas: Dicionario de pessoas (CPF -> PessoaNatural)
        imoveis: Dicionario de imoveis (matricula_numero -> Imovel)
        negocio: Objeto Negocio
        source: Nome do arquivo fonte

    Returns:
        Tuple com (lista de CPFs dos vendedores, lista de CPFs dos compradores, lista de CPFs dos usufrutuarios)
    """
    dados_cat = dados.get('dados_catalogados') or {}

    cpfs_vendedores = []
    cpfs_compradores = []
    cpfs_usufrutuarios = []

    # Processa vendedores
    for vendedor in (dados_cat.get('vendedores') or []):
        cpf = normalizar_cpf(vendedor.get('cpf'))
        if cpf:
            cpfs_vendedores.append(cpf)

            if cpf not in pessoas:
                pessoas[cpf] = PessoaNatural()

            pessoa = pessoas[cpf]
            pessoa.set_field('nome', vendedor.get('nome'), source)
            pessoa.set_field('cpf', cpf, source)
            pessoa.set_field('nacionalidade', vendedor.get('nacionalidade'), source)
            pessoa.set_field('profissao', vendedor.get('profissao'), source)
            pessoa.set_field('estado_civil', vendedor.get('estado_civil'), source)
            pessoa.set_field('regime_bens', vendedor.get('regime_casamento'), source)
            pessoa.set_field('conjuge', vendedor.get('conjuge'), source)

            # Endereco - usa parser para separar componentes
            endereco = vendedor.get('endereco', '')
            if endereco:
                apply_parsed_endereco(pessoa, endereco, source)

            # Proporcao
            proporcao = vendedor.get('proporcao_venda_percentual')
            if proporcao:
                pessoa.set_field('fracao_ideal', f"{proporcao}%", source)

    # Processa compradores
    for comprador in (dados_cat.get('compradores') or []):
        cpf = normalizar_cpf(comprador.get('cpf'))
        if cpf:
            cpfs_compradores.append(cpf)

            if cpf not in pessoas:
                pessoas[cpf] = PessoaNatural()

            pessoa = pessoas[cpf]
            pessoa.set_field('nome', comprador.get('nome'), source)
            pessoa.set_field('cpf', cpf, source)
            pessoa.set_field('nacionalidade', comprador.get('nacionalidade'), source)
            pessoa.set_field('profissao', comprador.get('profissao'), source)
            pessoa.set_field('estado_civil', comprador.get('estado_civil'), source)

            # Endereco - usa parser para separar componentes
            endereco = comprador.get('endereco', '')
            if endereco:
                apply_parsed_endereco(pessoa, endereco, source)

    # Processa usufrutuarios
    for usufrutuario in (dados_cat.get('usufrutuarios') or []):
        cpf = normalizar_cpf(usufrutuario.get('cpf'))
        if cpf:
            cpfs_usufrutuarios.append(cpf)

            if cpf not in pessoas:
                pessoas[cpf] = PessoaNatural()

            pessoa = pessoas[cpf]
            pessoa.set_field('nome', usufrutuario.get('nome'), source)
            pessoa.set_field('cpf', cpf, source)
            pessoa.set_field('nacionalidade', usufrutuario.get('nacionalidade'), source)
            pessoa.set_field('profissao', usufrutuario.get('profissao'), source)
            pessoa.set_field('estado_civil', usufrutuario.get('estado_civil'), source)
            pessoa.set_field('regime_bens', usufrutuario.get('regime_casamento'), source)
            pessoa.set_field('conjuge', usufrutuario.get('conjuge'), source)

            # Endereco - usa parser para separar componentes
            endereco = usufrutuario.get('endereco', '')
            if endereco:
                apply_parsed_endereco(pessoa, endereco, source)

    # Dados do imovel - processa todas as matriculas do compromisso
    imovel_dados = dados_cat.get('imovel', {})
    if imovel_dados:
        # Matriculas do compromisso
        matriculas = imovel_dados.get('matriculas') or []

        if matriculas:
            # Processa cada matricula como um imovel separado
            for mat in matriculas:
                matricula_num = normalizar_matricula(mat.get('numero', ''))
                if not matricula_num:
                    matricula_num = f"_compromisso_{source}"

                # Cria imovel se nao existe
                if matricula_num not in imoveis:
                    imoveis[matricula_num] = Imovel()
                    logger.debug(f"Novo imovel criado para matricula {matricula_num} (compromisso)")

                imovel = imoveis[matricula_num]

                # Dados da matricula
                imovel.set_field('matricula_numero', mat.get('numero'), source)
                imovel.set_field('matricula_cartorio', mat.get('cartorio'), source)
                imovel.set_field('matricula_cidade', mat.get('cidade_cartorio'), source)

                # Dados comuns do imovel (aplicados a todas as matriculas)
                imovel.set_field('tipo_imovel', imovel_dados.get('tipo'), source)
                imovel.set_field('logradouro', imovel_dados.get('logradouro'), source)
                imovel.set_field('numero', imovel_dados.get('numero'), source)
                imovel.set_field('complemento', imovel_dados.get('complemento'), source)
                imovel.set_field('bloco', imovel_dados.get('bloco'), source)
                imovel.set_field('bairro', imovel_dados.get('bairro'), source)
                imovel.set_field('cidade', imovel_dados.get('cidade'), source)
                imovel.set_field('estado', imovel_dados.get('estado'), source)
                imovel.set_field('cep', imovel_dados.get('cep'), source)
                imovel.set_field('sql', imovel_dados.get('inscricao_iptu'), source)

                # Areas
                imovel.set_field('area_privativa', normalizar_area(imovel_dados.get('area_privativa_m2')), source)
                imovel.set_field('area_comum', normalizar_area(imovel_dados.get('area_comum_m2')), source)
                imovel.set_field('area_total', normalizar_area(imovel_dados.get('area_total_m2')), source)
                imovel.set_field('fracao_ideal', imovel_dados.get('fracao_ideal_terreno'), source)
        else:
            # Sem matriculas especificas, usa chave temporaria
            temp_key = f"_compromisso_{source}"
            if temp_key not in imoveis:
                imoveis[temp_key] = Imovel()
                logger.debug(f"Novo imovel temporario criado: {temp_key}")

            imovel = imoveis[temp_key]
            imovel.set_field('tipo_imovel', imovel_dados.get('tipo'), source)
            imovel.set_field('logradouro', imovel_dados.get('logradouro'), source)
            imovel.set_field('numero', imovel_dados.get('numero'), source)
            imovel.set_field('complemento', imovel_dados.get('complemento'), source)
            imovel.set_field('bloco', imovel_dados.get('bloco'), source)
            imovel.set_field('bairro', imovel_dados.get('bairro'), source)
            imovel.set_field('cidade', imovel_dados.get('cidade'), source)
            imovel.set_field('estado', imovel_dados.get('estado'), source)
            imovel.set_field('cep', imovel_dados.get('cep'), source)
            imovel.set_field('sql', imovel_dados.get('inscricao_iptu'), source)

            # Areas
            imovel.set_field('area_privativa', normalizar_area(imovel_dados.get('area_privativa_m2')), source)
            imovel.set_field('area_comum', normalizar_area(imovel_dados.get('area_comum_m2')), source)
            imovel.set_field('area_total', normalizar_area(imovel_dados.get('area_total_m2')), source)
            imovel.set_field('fracao_ideal', imovel_dados.get('fracao_ideal_terreno'), source)

    # Dados do negocio
    valores = dados_cat.get('valores_financeiros', {})
    if valores:
        negocio.set_field('valor_total', normalizar_valor(valores.get('preco_total')), source)
        negocio.set_field('sinal', normalizar_valor(valores.get('sinal_entrada')), source)
        negocio.set_field('saldo', normalizar_valor(valores.get('saldo')), source)

    # Forma de pagamento
    forma_sinal = dados_cat.get('forma_pagamento_sinal', '')
    forma_saldo = dados_cat.get('forma_pagamento_saldo', '')
    if forma_sinal or forma_saldo:
        negocio.set_field('tipo_pagamento', f"Sinal: {forma_sinal}. Saldo: {forma_saldo}", source)

    # Prazos
    prazos = dados_cat.get('prazos', {})
    if prazos:
        negocio.set_field('prazo_pagamento', prazos.get('prazo_escritura'), source)

    # Corretagem
    responsabilidades = dados_cat.get('responsabilidades', {})
    corretagem = responsabilidades.get('comissao_corretagem', {})
    if corretagem:
        negocio.set_field('corretagem_valor', normalizar_valor(corretagem.get('valor')), source)
        negocio.set_field('corretagem_responsavel', corretagem.get('responsavel'), source)

    # Intermediador
    intermediador = dados_cat.get('intermediador', {})
    if intermediador:
        negocio.set_field('intermediador', intermediador.get('nome'), source)

    return cpfs_vendedores, cpfs_compradores, cpfs_usufrutuarios


def map_matricula_to_imovel(dados: Dict, imovel: Imovel, source: str) -> List[Dict]:
    """
    Mapeia dados da Matricula do Imovel.

    Campos extraidos: matricula, areas, endereco, proprietarios, onus

    Returns:
        Lista de proprietarios encontrados na matricula
    """
    dados_cat = dados.get('dados_catalogados') or {}

    # Matricula
    imovel.set_field('matricula_numero', dados_cat.get('numero_matricula'), source)
    imovel.set_field('matricula_cartorio', dados_cat.get('cartorio'), source)

    # Imovel
    imovel_dados = dados_cat.get('imovel', {})
    if imovel_dados:
        imovel.set_field('tipo_imovel', imovel_dados.get('tipo_unidade'), source)
        imovel.set_field('sql', imovel_dados.get('sql'), source)

        # Areas
        imovel.set_field('area_privativa', normalizar_area(imovel_dados.get('area_util_m2')), source)
        imovel.set_field('area_comum', normalizar_area(imovel_dados.get('area_comum_m2')), source)
        imovel.set_field('area_total', normalizar_area(imovel_dados.get('area_total_m2')), source)
        imovel.set_field('fracao_ideal', imovel_dados.get('fracao_ideal'), source)

        # Endereco
        endereco = imovel_dados.get('endereco', {})
        if endereco:
            imovel.set_field('logradouro', endereco.get('logradouro'), source)
            imovel.set_field('numero', endereco.get('numero'), source)
            imovel.set_field('complemento', endereco.get('complemento'), source)
            imovel.set_field('edificio', endereco.get('edificio'), source)
            imovel.set_field('bairro', endereco.get('bairro'), source)
            imovel.set_field('cidade', endereco.get('cidade'), source)
            imovel.set_field('estado', endereco.get('uf'), source)
            imovel.set_field('cep', endereco.get('cep'), source)
            # Mapeia UF para matricula_estado (estado do cartorio)
            imovel.set_field('matricula_estado', endereco.get('uf'), source)
            imovel.set_field('matricula_cidade', endereco.get('cidade'), source)

        # Fallback: tenta extrair CEP de campos de texto se nao foi encontrado
        if not imovel.cep:
            # Tenta de endereco_completo do imovel
            endereco_completo = imovel_dados.get('endereco_completo', '') or ''
            if not endereco_completo:
                # Tenta da descricao_completa
                endereco_completo = imovel_dados.get('descricao_completa', '') or ''
            if endereco_completo:
                cep_match = re.search(r'CEP[:\s]*(\d{5}-?\d{3})', endereco_completo, re.IGNORECASE)
                if cep_match:
                    imovel.set_field('cep', cep_match.group(1), source)
                else:
                    # Tenta padrao CEP sem prefixo (ex: 05074-010)
                    cep_match = re.search(r'\b(\d{5}-\d{3})\b', endereco_completo)
                    if cep_match:
                        imovel.set_field('cep', cep_match.group(1), source)

            # Extrai unidade e andar - primeiro tenta campos diretos, depois do complemento/descrição
            # Campo andar direto (prioridade)
            andar_direto = imovel_dados.get('andar')
            if andar_direto:
                imovel.set_field('andar', andar_direto, source)
            else:
                # Tenta extrair da descrição completa
                descricao_completa = imovel_dados.get('descricao_completa', '')
                andar_de_descricao = extrair_andar_de_descricao(descricao_completa)
                if andar_de_descricao:
                    imovel.set_field('andar', andar_de_descricao, source)
                else:
                    # Tenta extrair do complemento
                    complemento = endereco.get('complemento', '')
                    unidade_extraida, andar_extraido = extrair_unidade_andar(complemento)
                    if unidade_extraida:
                        imovel.set_field('unidade', unidade_extraida, source)
                    if andar_extraido:
                        imovel.set_field('andar', andar_extraido, source)

    # Proprietarios atuais - com merge inteligente
    proprietarios_novos = []
    for prop in (dados_cat.get('proprietarios_atuais') or []):
        prop_data = {
            'nome': prop.get('nome'),
            'cpf': normalizar_cpf(prop.get('cpf')),
            'rg': prop.get('rg'),
            'estado_civil': prop.get('estado_civil'),
            'profissao': prop.get('profissao'),
            'fracao': prop.get('fracao', {}).get('valor'),
            'data_aquisicao': prop.get('data_aquisicao'),
            '_fonte': source  # Rastreia fonte para auditoria
        }
        proprietarios_novos.append(prop_data)

    if proprietarios_novos:
        if not imovel.proprietarios:
            # Se não há proprietários ainda, simplesmente atribui
            imovel.proprietarios = proprietarios_novos
            logger.debug(f"Proprietários iniciais definidos para imóvel: {len(proprietarios_novos)} proprietário(s)")
        else:
            # Merge inteligente: evita duplicatas por CPF ou nome
            cpfs_existentes = {p.get('cpf') for p in imovel.proprietarios if p.get('cpf')}
            nomes_existentes = {p.get('nome', '').upper() for p in imovel.proprietarios if p.get('nome')}

            for prop_novo in proprietarios_novos:
                cpf_novo = prop_novo.get('cpf')
                nome_novo = (prop_novo.get('nome') or '').upper()

                # Verifica se já existe por CPF
                if cpf_novo and cpf_novo in cpfs_existentes:
                    # Atualiza dados do proprietário existente se houver info nova
                    for i, p_existente in enumerate(imovel.proprietarios):
                        if p_existente.get('cpf') == cpf_novo:
                            for campo, valor in prop_novo.items():
                                if campo != '_fonte' and valor and not p_existente.get(campo):
                                    p_existente[campo] = valor
                                    logger.debug(f"Campo '{campo}' atualizado para proprietário CPF {cpf_novo}")
                            break
                # Verifica se já existe por nome
                elif nome_novo and nome_novo in nomes_existentes:
                    # Atualiza dados do proprietário existente se houver info nova
                    for i, p_existente in enumerate(imovel.proprietarios):
                        if (p_existente.get('nome') or '').upper() == nome_novo:
                            for campo, valor in prop_novo.items():
                                if campo != '_fonte' and valor and not p_existente.get(campo):
                                    p_existente[campo] = valor
                            # Se não tinha CPF e agora tem, atualiza
                            if cpf_novo and not p_existente.get('cpf'):
                                p_existente['cpf'] = cpf_novo
                                cpfs_existentes.add(cpf_novo)
                            break
                else:
                    # Proprietário novo, adiciona à lista
                    imovel.proprietarios.append(prop_novo)
                    if cpf_novo:
                        cpfs_existentes.add(cpf_novo)
                    if nome_novo:
                        nomes_existentes.add(nome_novo)
                    logger.debug(f"Novo proprietário adicionado: {prop_novo.get('nome')} (fonte: {source})")

    # Onus - com lógica de prioridade para não sobrescrever imóvel livre com status desconhecido
    onus_ativos = dados_cat.get('onus_ativos') or []

    # Se já temos ônus definido, verifica prioridade
    onus_atual = imovel.onus
    should_update = True

    if onus_atual is not None:
        # Se ônus atual é vazio (imóvel livre), não sobrescrever com status desconhecido
        if onus_atual == [] and onus_ativos:
            # Verifica se os novos ônus são todos "DESCONHECIDO"
            todos_desconhecidos = all(
                o.get('status', '').upper() in ['DESCONHECIDO', 'NAO_INFORMADO', '']
                for o in onus_ativos
            )
            if todos_desconhecidos:
                should_update = False
                logger.debug(f"Mantendo onus vazio (imóvel livre) - novos onus são desconhecidos: {source}")
        # Se ônus atual tem status desconhecido e novo é vazio, sobrescrever
        elif onus_ativos == [] and onus_atual:
            should_update = True
            logger.debug(f"Sobrescrevendo onus desconhecido com lista vazia (imóvel livre): {source}")

    if should_update:
        imovel.set_field('onus', onus_ativos, source)

    # Onus historicos (cancelados)
    onus_historicos = dados_cat.get('onus_historicos') or []
    if onus_historicos:
        # Normaliza formato para output padronizado
        onus_hist_normalizados = []
        for onus in onus_historicos:
            onus_hist_normalizados.append({
                'tipo': onus.get('tipo'),
                'registro': onus.get('registro'),
                'status': onus.get('status'),
                'data_cancelamento': onus.get('data_cancelamento'),
                'averbacao_cancelamento': onus.get('averbacao_cancelamento'),
                'observacoes': onus.get('motivo_cancelamento')
            })
        imovel.set_field('onus_historicos', onus_hist_normalizados, source)

    return proprietarios_novos


def map_iptu_to_imovel(dados: Dict, imovel: Imovel, source: str) -> None:
    """
    Mapeia dados do IPTU.

    Campos extraidos: sql, endereco, valores_venais
    """
    dados_cat = dados.get('dados_catalogados') or {}

    # Identificacao
    identificacao = dados_cat.get('identificacao_imovel', {})
    if identificacao:
        imovel.set_field('sql', identificacao.get('sql'), source)
        imovel.set_field('logradouro', identificacao.get('logradouro'), source)
        imovel.set_field('numero', identificacao.get('numero'), source)
        imovel.set_field('complemento', identificacao.get('complemento'), source)
        imovel.set_field('bairro', identificacao.get('bairro'), source)
        imovel.set_field('cidade', identificacao.get('cidade'), source)
        imovel.set_field('estado', identificacao.get('estado'), source)
        imovel.set_field('cep', identificacao.get('cep'), source)

    # Valores venais
    valores = dados_cat.get('valores_venais', {})
    if valores:
        imovel.set_field('valor_venal_iptu', normalizar_valor(valores.get('valor_venal_total')), source)
        imovel.set_field('ano_exercicio_iptu', valores.get('ano_exercicio'), source)


def map_vvr_to_imovel(dados: Dict, imovel: Imovel, source: str) -> None:
    """
    Mapeia dados do VVR.

    Campos extraidos: valor_venal_referencia, cep
    """
    dados_cat = dados.get('dados_catalogados') or {}

    imovel.set_field('sql', dados_cat.get('sql'), source)
    imovel.set_field('valor_venal_referencia', normalizar_valor(dados_cat.get('valor_venal_referencia')), source)

    # Tenta extrair CEP do VVR se ainda nao definido
    if not imovel.cep:
        # Tenta do campo cep direto
        cep = dados_cat.get('cep')
        if cep:
            imovel.set_field('cep', cep, source)
        else:
            # Tenta do endereco ou endereco_completo
            endereco = dados_cat.get('endereco') or dados_cat.get('endereco_completo') or ''
            if endereco:
                cep_match = re.search(r'CEP[:\s]*(\d{5}-?\d{3})', endereco, re.IGNORECASE)
                if cep_match:
                    imovel.set_field('cep', cep_match.group(1), source)
                else:
                    # Tenta padrao CEP sem prefixo (ex: 05074-010)
                    cep_match = re.search(r'\b(\d{5}-\d{3})\b', endereco)
                    if cep_match:
                        imovel.set_field('cep', cep_match.group(1), source)


def map_cnd_municipal_to_imovel(dados: Dict, imovel: Imovel, source: str) -> None:
    """
    Mapeia dados da CND Municipal.

    Campos extraidos: certidao_municipal (numero, data_emissao, validade, status), cep
    """
    dados_cat = dados.get('dados_catalogados') or {}

    imovel.set_field('sql', dados_cat.get('sql'), source)
    imovel.set_field('cnd_numero', dados_cat.get('numero_certidao'), source)
    imovel.set_field('cnd_data_emissao', dados_cat.get('data_emissao'), source)
    imovel.set_field('cnd_validade', dados_cat.get('data_validade'), source)
    imovel.set_field('cnd_status', dados_cat.get('status'), source)

    # Tenta extrair CEP do endereco se presente na CND Municipal
    if not imovel.cep:
        # Tenta do campo cep direto
        cep = dados_cat.get('cep')
        if cep:
            imovel.set_field('cep', cep, source)
        else:
            # Tenta do endereco ou endereco_completo
            endereco = dados_cat.get('endereco') or dados_cat.get('endereco_completo') or ''
            if endereco:
                cep_match = re.search(r'CEP[:\s]*(\d{5}-?\d{3})', endereco, re.IGNORECASE)
                if cep_match:
                    imovel.set_field('cep', cep_match.group(1), source)
                else:
                    # Tenta padrao CEP sem prefixo (ex: 05074-010)
                    cep_match = re.search(r'\b(\d{5}-\d{3})\b', endereco)
                    if cep_match:
                        imovel.set_field('cep', cep_match.group(1), source)


def map_cnd_condominio_to_imovel(dados: Dict, imovel: Imovel, source: str) -> None:
    """
    Mapeia dados da CND de Condomínio para o imóvel.

    Campos extraídos: status, data_emissao, validade, codigo_verificacao
    """
    dados_cat = dados.get('dados_catalogados') or {}

    imovel.set_field('cnd_condominio_status', dados_cat.get('status'), source)
    imovel.set_field('cnd_condominio_data_emissao', dados_cat.get('data_emissao'), source)

    # Validade pode estar em diferentes locais
    validade = dados_cat.get('validade') or dados_cat.get('data_validade')
    if not validade:
        datas = dados_cat.get('datas_importantes', [])
        for d in datas:
            if isinstance(d, dict) and 'validade' in d.get('tipo', '').lower():
                validade = d.get('data')
                break

    imovel.set_field('cnd_condominio_validade', validade, source)
    imovel.set_field('cnd_condominio_codigo', dados_cat.get('codigo_verificacao'), source)


def map_itbi_to_negocio(dados: Dict, negocio: Negocio, source: str) -> None:
    """
    Mapeia dados do ITBI para a lista de guias.

    Acumula multiplas guias de ITBI em vez de sobrescrever.
    Campos extraidos: numero_guia, base_calculo, valor, proporcao, fonte
    """
    dados_cat = dados.get('dados_catalogados') or {}

    # Extrai dados da guia
    identificacao = dados_cat.get('identificacao', {})
    valores = dados_cat.get('valores', {})
    transacao = dados_cat.get('transacao', {})
    datas = dados_cat.get('datas', {})

    # Cria dicionario da guia
    guia = {
        "numero_guia": identificacao.get('numero_transacao') if identificacao else None,
        "base_calculo": normalizar_valor(valores.get('base_calculo')) if valores else None,
        "valor": normalizar_valor(valores.get('valor_itbi')) if valores else None,
        "proporcao": f"{transacao.get('proporcao_transmitida')}%" if transacao and transacao.get('proporcao_transmitida') else None,
        "fonte": source
    }

    # Adiciona guia a lista (evita duplicatas pelo numero da guia)
    guia_existente = False
    for g in negocio.itbi_guias:
        if g.get('numero_guia') == guia.get('numero_guia'):
            guia_existente = True
            break

    if not guia_existente and guia.get('numero_guia'):
        negocio.itbi_guias.append(guia)

        # Registra fonte
        if 'itbi_guias' not in negocio._fontes:
            negocio._fontes['itbi_guias'] = []
        if source not in negocio._fontes['itbi_guias']:
            negocio._fontes['itbi_guias'].append(source)

    # Data de vencimento (pega a primeira encontrada)
    if datas and datas.get('data_vencimento'):
        negocio.set_field('itbi_data_vencimento', datas.get('data_vencimento'), source)

    # Proporcao transmitida total (soma das guias)
    # Nota: fracao_alienada sera calculada pela soma das proporcoes das guias
    if transacao and transacao.get('proporcao_transmitida'):
        # Atualiza fracao_alienada apenas se for a primeira guia ou nao estiver definida
        if not negocio.fracao_alienada:
            negocio.set_field('fracao_alienada', f"{transacao.get('proporcao_transmitida')}%", source)


def map_comprovante_pagamento_to_negocio(dados: Dict, negocio: Negocio, source: str) -> None:
    """
    Mapeia dados de Comprovante de Pagamento para extrair data de pagamento do ITBI.

    Campos extraidos: data_pagamento (do ITBI)
    """
    dados_cat = dados.get('dados_catalogados') or {}

    # Verifica se é comprovante de ITBI
    metadados = dados_cat.get('metadados_documento', {})
    resumo = dados_cat.get('resumo', {})
    tipo_tributo = resumo.get('tipo_tributo', '').upper() if resumo else ''

    # Também verifica no arquivo de origem
    arquivo_origem = dados.get('arquivo_origem', '').upper()
    is_itbi = 'ITBI' in tipo_tributo or 'ITBI' in arquivo_origem

    if not is_itbi:
        return

    # Processa pagamentos
    pagamentos = dados_cat.get('pagamentos', [])

    for pagamento in pagamentos:
        datas = pagamento.get('datas', {})

        # Data de pagamento efetivo tem prioridade
        data_pagamento = datas.get('pagamento_efetivo') or datas.get('transacao')

        if data_pagamento:
            # Só atualiza se não tiver data de pagamento ainda
            if not negocio.itbi_data_pagamento:
                negocio.set_field('itbi_data_pagamento', data_pagamento, source)
                logger.debug(f"Data de pagamento ITBI definida: {data_pagamento} (fonte: {source})")

        # Também vincula ao guia correspondente pelo valor
        valor_pagamento = pagamento.get('valor')
        if valor_pagamento:
            valor_str = normalizar_valor(valor_pagamento)
            for guia in negocio.itbi_guias:
                if guia.get('valor') == valor_str and not guia.get('data_pagamento'):
                    guia['data_pagamento'] = data_pagamento
                    guia['status_pagamento'] = pagamento.get('status_pagamento', 'PAGO')
                    guia['codigo_autenticacao'] = pagamento.get('codigo_autenticacao')
                    logger.debug(f"Guia ITBI {guia.get('numero_guia')} atualizada com data de pagamento")
                    break


# =============================================================================
# FUNCAO PRINCIPAL DE MAPEAMENTO
# =============================================================================

def load_extracted_documents(caso_id: str) -> List[Dict]:
    """
    Carrega todos os documentos extraidos de um caso.

    Args:
        caso_id: ID do caso (ex: FC_515_124_p280509)

    Returns:
        Lista de documentos com seus dados extraidos
    """
    contextual_path = CONTEXTUAL_DIR / caso_id

    if not contextual_path.exists():
        raise FileNotFoundError(f"Diretorio de dados contextuais nao encontrado: {contextual_path}")

    documentos = []

    for json_file in sorted(contextual_path.glob("*.json")):
        # Ignora arquivos de relatorio
        if 'relatorio' in json_file.name.lower():
            continue

        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                dados = json.load(f)
                dados['_source_file'] = json_file.name
                documentos.append(dados)
        except json.JSONDecodeError as e:
            logger.warning(f"Erro ao ler {json_file}: {e}")

    return documentos


def load_catalog(caso_id: str) -> Dict:
    """Carrega catalogo do caso."""
    catalog_path = CATALOGOS_DIR / f"{caso_id}.json"

    if not catalog_path.exists():
        raise FileNotFoundError(f"Catalogo nao encontrado: {catalog_path}")

    with open(catalog_path, 'r', encoding='utf-8') as f:
        return json.load(f)


def map_documents_to_fields(caso_id: str, verbose: bool = False) -> Dict[str, Any]:
    """
    Processa todos os documentos e mapeia para campos da minuta.

    Args:
        caso_id: ID do caso
        verbose: Modo verbose

    Returns:
        Dicionario com dados mapeados
    """
    logger.info(f"Carregando documentos extraidos de {caso_id}...")
    documentos = load_extracted_documents(caso_id)
    catalog = load_catalog(caso_id)

    logger.info(f"Total de documentos carregados: {len(documentos)}")

    # Estruturas de dados
    pessoas: Dict[str, PessoaNatural] = {}  # CPF -> PessoaNatural
    imoveis: Dict[str, Imovel] = {}  # matricula_numero -> Imovel
    negocio = Negocio()

    # Listas para rastrear papeis
    cpfs_vendedores: Set[str] = set()
    cpfs_compradores: Set[str] = set()
    cpfs_usufrutuarios: Set[str] = set()

    # Estrutura para rastrear múltiplos casamentos e alertas jurídicos
    casamentos_por_pessoa: Dict[str, List[Dict]] = {}  # CPF -> lista de casamentos detectados
    alertas_juridicos: List[Dict] = []

    # Primeira passagem: Compromisso de Compra e Venda (define papeis)
    for doc in documentos:
        if doc.get('tipo_documento') == 'COMPROMISSO_COMPRA_VENDA':
            source = doc.get('_source_file', 'unknown')
            vendedores, compradores, usufrutuarios = map_compromisso_to_partes(doc, pessoas, imoveis, negocio, source)
            cpfs_vendedores.update(vendedores)
            cpfs_compradores.update(compradores)
            cpfs_usufrutuarios.update(usufrutuarios)
            logger.info(f"Compromisso processado: {len(vendedores)} vendedores, {len(compradores)} compradores, {len(usufrutuarios)} usufrutuarios")

    # Segunda passagem: demais documentos
    for doc in documentos:
        tipo = doc.get('tipo_documento')
        source = doc.get('_source_file', 'unknown')

        if doc.get('status') != 'sucesso':
            logger.warning(f"Documento com erro ignorado: {source}")
            continue

        if verbose:
            logger.info(f"Processando {tipo}: {source}")

        # Identifica pessoa relacionada
        pessoa_nome = doc.get('pessoa_relacionada', '')
        dados_cat = doc.get('dados_catalogados', {})

        # Tenta encontrar CPF no documento
        cpf_doc = None
        if tipo == 'RG':
            cpf_doc = normalizar_cpf(dados_cat.get('cpf'))
        elif tipo == 'CNDT':
            cpf_doc = normalizar_cpf(dados_cat.get('cpf'))
        elif tipo == 'CERTIDAO_CASAMENTO':
            # Busca por nome nos conjuges
            conjuge1 = dados_cat.get('conjuge1', {})
            conjuge2 = dados_cat.get('conjuge2', {})
            for conj in [conjuge1, conjuge2]:
                cpf = normalizar_cpf(conj.get('cpf'))
                if cpf and cpf in pessoas:
                    cpf_doc = cpf
                    break

        # Se nao achou CPF, busca por nome
        if not cpf_doc and pessoa_nome:
            for cpf, pessoa in pessoas.items():
                if pessoa.nome and pessoa.nome.upper() in pessoa_nome.upper():
                    cpf_doc = cpf
                    break
                if pessoa_nome.upper() in (pessoa.nome or '').upper():
                    cpf_doc = cpf
                    break

        # Processa por tipo de documento
        if tipo == 'RG':
            # Cria pessoa se nao existir
            cpf_rg = normalizar_cpf(dados_cat.get('cpf'))
            nome_rg_raw = dados_cat.get('nome_completo')
            nome_rg = nome_rg_raw.upper() if nome_rg_raw else ''

            target_cpf = cpf_rg or cpf_doc

            # Se nao tem CPF, tenta encontrar por nome
            if not target_cpf and nome_rg:
                for cpf, pessoa in pessoas.items():
                    if pessoa.nome and (pessoa.nome.upper() == nome_rg or nome_rg in pessoa.nome.upper()):
                        target_cpf = cpf
                        break

            if target_cpf:
                if target_cpf not in pessoas:
                    pessoas[target_cpf] = PessoaNatural()
                map_rg_to_pessoa(doc, pessoas[target_cpf], source)
            elif nome_rg:
                # Cria nova pessoa sem CPF (sera identificada depois)
                temp_id = f"_TEMP_{nome_rg[:20]}"
                if temp_id not in pessoas:
                    pessoas[temp_id] = PessoaNatural()
                map_rg_to_pessoa(doc, pessoas[temp_id], source)
            else:
                logger.warning(f"RG sem nome ou CPF ignorado: {source}")

        elif tipo == 'CERTIDAO_NASCIMENTO':
            if cpf_doc and cpf_doc in pessoas:
                map_certidao_nascimento_to_pessoa(doc, pessoas[cpf_doc], source)

        elif tipo == 'CERTIDAO_CASAMENTO':
            # Processa para ambos os conjuges
            conjuge1 = dados_cat.get('conjuge1', {})
            conjuge2 = dados_cat.get('conjuge2', {})

            for conj in [conjuge1, conjuge2]:
                cpf = normalizar_cpf(conj.get('cpf'))
                nome_conj = conj.get('nome_completo', '')
                nome_conj_upper = nome_conj.upper() if nome_conj else ''

                # Tenta encontrar pessoa por CPF primeiro
                pessoa_key = None
                if cpf and cpf in pessoas:
                    pessoa_key = cpf
                # Se nao tem CPF, tenta encontrar por nome
                elif nome_conj_upper:
                    for key, pessoa in pessoas.items():
                        pessoa_nome = (pessoa.nome or '').upper()
                        # Match exato ou nome contido (ex: nome de solteira vs casada)
                        if pessoa_nome == nome_conj_upper or nome_conj_upper in pessoa_nome or pessoa_nome in nome_conj_upper:
                            pessoa_key = key
                            logger.debug(f"Certidao casamento: vinculado por nome '{nome_conj}' -> pessoa '{pessoa.nome}' (CPF: {key})")
                            break

                if pessoa_key:
                    casamento_info = map_certidao_casamento_to_pessoa(doc, pessoas[pessoa_key], nome_conj, source)

                    # Rastreia múltiplos casamentos
                    if pessoa_key not in casamentos_por_pessoa:
                        casamentos_por_pessoa[pessoa_key] = []
                    casamentos_por_pessoa[pessoa_key].append(casamento_info)

                    # Se detectou mais de um casamento para mesma pessoa, gera alerta
                    if len(casamentos_por_pessoa[pessoa_key]) > 1:
                        nome_pessoa = pessoas[pessoa_key].nome or pessoa_key
                        alerta = {
                            'tipo': 'MULTIPLOS_CASAMENTOS',
                            'severidade': 'ALTA',
                            'pessoa': nome_pessoa,
                            'cpf': pessoa_key,
                            'casamentos': casamentos_por_pessoa[pessoa_key],
                            'mensagem': f"Detectados {len(casamentos_por_pessoa[pessoa_key])} casamentos para {nome_pessoa}. Verificar situação de dissolução do(s) casamento(s) anterior(es).",
                            'recomendacao': "Solicitar certidão de averbação de divórcio ou óbito do cônjuge anterior."
                        }
                        # Evita duplicatas de alertas
                        alertas_existentes = [a for a in alertas_juridicos if a.get('cpf') == pessoa_key and a.get('tipo') == 'MULTIPLOS_CASAMENTOS']
                        if alertas_existentes:
                            # Atualiza alerta existente
                            alertas_existentes[0]['casamentos'] = casamentos_por_pessoa[pessoa_key]
                            alertas_existentes[0]['mensagem'] = alerta['mensagem']
                        else:
                            alertas_juridicos.append(alerta)
                            logger.warning(f"ALERTA JURÍDICO: {alerta['mensagem']}")

        elif tipo == 'CNDT':
            cpf_cndt = normalizar_cpf(dados_cat.get('cpf'))
            if cpf_cndt and cpf_cndt in pessoas:
                map_cndt_to_pessoa(doc, pessoas[cpf_cndt], source)

        elif tipo == 'MATRICULA_IMOVEL':
            dados_cat = doc.get('dados_catalogados', {})
            matricula_num = normalizar_matricula(dados_cat.get('numero_matricula', ''))

            # Se nao tem numero de matricula, usa chave generica
            if not matricula_num:
                matricula_num = f"_sem_matricula_{source}"

            # Cria imovel se nao existe
            if matricula_num not in imoveis:
                imoveis[matricula_num] = Imovel()
                logger.debug(f"Novo imovel criado para matricula {matricula_num}")

            map_matricula_to_imovel(doc, imoveis[matricula_num], source)

        elif tipo == 'IPTU':
            # IPTU geralmente aplica a todos os imoveis com mesmo SQL
            for imovel in imoveis.values():
                map_iptu_to_imovel(doc, imovel, source)
            # Se nao tem imoveis ainda, cria um temporario
            if not imoveis:
                imoveis['_temp_iptu'] = Imovel()
                map_iptu_to_imovel(doc, imoveis['_temp_iptu'], source)

        elif tipo == 'VVR':
            for imovel in imoveis.values():
                map_vvr_to_imovel(doc, imovel, source)
            if not imoveis:
                imoveis['_temp_vvr'] = Imovel()
                map_vvr_to_imovel(doc, imoveis['_temp_vvr'], source)

        elif tipo == 'CND_MUNICIPAL':
            for imovel in imoveis.values():
                map_cnd_municipal_to_imovel(doc, imovel, source)
            if not imoveis:
                imoveis['_temp_cnd'] = Imovel()
                map_cnd_municipal_to_imovel(doc, imoveis['_temp_cnd'], source)

        elif tipo == 'CND_CONDOMINIO':
            for imovel in imoveis.values():
                map_cnd_condominio_to_imovel(doc, imovel, source)
            if not imoveis:
                imoveis['_temp_cnd_cond'] = Imovel()
                map_cnd_condominio_to_imovel(doc, imoveis['_temp_cnd_cond'], source)

        elif tipo == 'ITBI':
            map_itbi_to_negocio(doc, negocio, source)

        elif tipo == 'COMPROVANTE_PAGAMENTO':
            map_comprovante_pagamento_to_negocio(doc, negocio, source)

    # Consolida pessoas temporarias (sem CPF)
    temp_pessoas = [k for k in pessoas.keys() if k.startswith('_TEMP_')]
    for temp_id in temp_pessoas:
        temp_pessoa = pessoas[temp_id]
        # Tenta encontrar pessoa existente com mesmo nome
        found = False
        for cpf, pessoa in pessoas.items():
            if not cpf.startswith('_TEMP_') and pessoa.nome == temp_pessoa.nome:
                # Merge dados
                for field in ['rg', 'orgao_emissor_rg', 'estado_emissor_rg', 'data_nascimento', 'naturalidade', 'filiacao_pai', 'filiacao_mae']:
                    if not getattr(pessoa, field) and getattr(temp_pessoa, field):
                        setattr(pessoa, field, getattr(temp_pessoa, field))
                found = True
                break

        if found:
            del pessoas[temp_id]

    # Separa alienantes, adquirentes e usufrutuarios (evitando duplicatas)
    alienantes_dict: Dict[str, Dict] = {}  # CPF -> dados
    adquirentes_dict: Dict[str, Dict] = {}  # CPF -> dados
    usufrutuarios_dict: Dict[str, Dict] = {}  # CPF -> dados

    for cpf, pessoa in pessoas.items():
        if cpf.startswith('_TEMP_'):
            continue

        pessoa_dict = pessoa.to_dict()

        # Pula entradas com CPF invalido
        cpf_valido = cpf and not cpf.startswith('_TEMP_') and cpf != 'NAO_INFORMADO'

        if cpf in cpfs_vendedores:
            # Verifica se ja existe alienante com mesmo nome
            nome = pessoa_dict.get('nome', '').upper()
            duplicata_key = None

            if cpf_valido and cpf in alienantes_dict:
                duplicata_key = cpf
            else:
                for key, existente in alienantes_dict.items():
                    if existente.get('nome', '').upper() == nome:
                        duplicata_key = key
                        break

            if duplicata_key:
                # Mescla dados: mantem valores existentes, adiciona novos
                existente = alienantes_dict[duplicata_key]
                for campo, valor in pessoa_dict.items():
                    if campo == '_fontes':
                        # Mescla fontes
                        for k, v in valor.items():
                            if k not in existente['_fontes']:
                                existente['_fontes'][k] = v
                            else:
                                existente['_fontes'][k].extend([x for x in v if x not in existente['_fontes'][k]])
                    elif not existente.get(campo) and valor and valor != 'NAO_INFORMADO':
                        existente[campo] = valor
            else:
                # Nova entrada
                key = cpf if cpf_valido else f"_nome_{nome}"
                alienantes_dict[key] = pessoa_dict

        elif cpf in cpfs_compradores:
            if cpf_valido:
                adquirentes_dict[cpf] = pessoa_dict
            else:
                # Usa nome como chave
                nome = pessoa_dict.get('nome', '').upper()
                adquirentes_dict[f"_nome_{nome}"] = pessoa_dict

        # Processa usufrutuarios (pode ser usufrutuario E vendedor/comprador, entao nao eh elif)
        if cpf in cpfs_usufrutuarios:
            if cpf_valido:
                usufrutuarios_dict[cpf] = pessoa_dict
            else:
                nome = pessoa_dict.get('nome', '').upper()
                usufrutuarios_dict[f"_nome_{nome}"] = pessoa_dict

        # Se nao eh vendedor, comprador nem usufrutuario, tenta determinar pelo catalogo
        if cpf not in cpfs_vendedores and cpf not in cpfs_compradores and cpf not in cpfs_usufrutuarios:
            # Tenta determinar pelo papel_inferido do catalogo
            for arq in catalog.get('arquivos', []):
                if arq.get('pessoa_relacionada', '').upper() == (pessoa.nome or '').upper():
                    if arq.get('papel_inferido') == 'vendedor':
                        nome = pessoa_dict.get('nome', '').upper()
                        key = cpf if cpf_valido else f"_nome_{nome}"
                        if key not in alienantes_dict:
                            alienantes_dict[key] = pessoa_dict
                    elif arq.get('papel_inferido') == 'comprador':
                        key = cpf if cpf_valido else f"_nome_{pessoa_dict.get('nome', '').upper()}"
                        if key not in adquirentes_dict:
                            adquirentes_dict[key] = pessoa_dict
                    break

    # Converte dicts para listas, filtrando entradas invalidas
    alienantes = [p for p in alienantes_dict.values() if p.get('cpf') and p.get('cpf') != 'NAO_INFORMADO']
    adquirentes = [p for p in adquirentes_dict.values() if p.get('cpf') and p.get('cpf') != 'NAO_INFORMADO']
    usufrutuarios = [p for p in usufrutuarios_dict.values() if p.get('cpf') and p.get('cpf') != 'NAO_INFORMADO']

    # Funcao de consolidacao de imoveis
    def consolidar_imoveis(imoveis_dict: Dict[str, Imovel]) -> List[Dict]:
        """
        Consolida e filtra imoveis, removendo duplicatas e entradas incompletas.

        Criterios de filtragem:
        1. Remove imoveis sem matricula_numero valida (temporarios)
        2. Remove imoveis sem proprietarios E sem dados de matricula oficial
        3. Detecta possiveis duplicatas por area e mantem o mais completo
        """
        imoveis_consolidados = []
        areas_vistas: Dict[str, List[str]] = {}  # area_total -> lista de matriculas com essa area
        imoveis_a_incluir: Dict[str, Dict] = {}  # matricula -> imovel_dict

        for matricula, imovel in imoveis_dict.items():
            # Ignora temporarios
            if matricula.startswith('_'):
                continue

            imovel_dict = imovel.to_dict()

            # Verifica completude
            tem_proprietarios = bool(imovel.proprietarios)
            fontes = imovel._fontes.get('matricula_numero', [])
            tem_fontes_matricula = any('MATRICULA_IMOVEL' in f for f in fontes)
            tem_dados_minimos = imovel.matricula_numero and (imovel.area_total or imovel.area_privativa)

            # Filtra imoveis muito incompletos (sem proprietarios E sem fonte de matricula)
            if not tem_proprietarios and not tem_fontes_matricula:
                logger.debug(f"Imovel {matricula} filtrado: sem proprietarios e sem fonte de matricula")
                continue

            # Verifica duplicata por area
            area = imovel.area_total
            should_include = True

            if area:
                if area in areas_vistas:
                    # Possivel duplicata - verifica se eh o mesmo tipo/endereco
                    for mat_existente in areas_vistas[area]:
                        imovel_existente = imoveis_dict.get(mat_existente)
                        if imovel_existente:
                            # Mesmo tipo e mesmo endereco = duplicata provavel
                            mesmo_tipo = imovel_existente.tipo_imovel == imovel.tipo_imovel
                            mesmo_logradouro = imovel_existente.logradouro == imovel.logradouro

                            if mesmo_tipo and mesmo_logradouro:
                                # Mantem o que tem mais dados (proprietarios)
                                existente_tem_prop = bool(imovel_existente.proprietarios)

                                if tem_proprietarios and not existente_tem_prop:
                                    # Remove o existente e adiciona este
                                    logger.debug(f"Imovel {matricula} mantido sobre duplicata {mat_existente}")
                                    if mat_existente in imoveis_a_incluir:
                                        del imoveis_a_incluir[mat_existente]
                                elif existente_tem_prop and not tem_proprietarios:
                                    # Este eh a duplicata incompleta
                                    logger.debug(f"Imovel {matricula} filtrado: duplicata de {mat_existente}")
                                    should_include = False
                                    break
                                # Se ambos tem ou nao tem proprietarios, mantem ambos
                else:
                    areas_vistas[area] = []

                if should_include:
                    areas_vistas[area].append(matricula)

            if should_include:
                imovel_dict['_matricula_key'] = matricula
                imoveis_a_incluir[matricula] = imovel_dict

        imoveis_consolidados = list(imoveis_a_incluir.values())
        return imoveis_consolidados

    # Consolida imoveis - remove temporarios, duplicatas e incompletos
    imoveis_list = consolidar_imoveis(imoveis)

    # Se tiver apenas temporarios, usa o primeiro
    if not imoveis_list and imoveis:
        primeiro_key = next(iter(imoveis.keys()))
        primeiro = imoveis[primeiro_key]
        imovel_dict = primeiro.to_dict()
        imovel_dict['_matricula_key'] = primeiro_key
        imoveis_list.append(imovel_dict)

    # Calcula campos preenchidos vs faltantes
    campos_preenchidos = 0
    campos_faltantes = []

    # Conta campos de pessoas
    for lista, tipo_pessoa in [(alienantes, 'alienante'), (adquirentes, 'adquirente')]:
        for idx, pessoa in enumerate(lista):
            for campo in ['nome', 'cpf', 'rg', 'data_nascimento', 'estado_civil', 'profissao', 'nacionalidade']:
                if pessoa.get(campo):
                    campos_preenchidos += 1
                else:
                    campos_faltantes.append(f"{tipo_pessoa}[{idx}].{campo}")

    # Conta campos de cada imovel na lista
    for imovel_idx, imovel_dict in enumerate(imoveis_list):
        for secao, campos in [
            ('matricula', ['numero', 'registro_imoveis']),
            ('descricao', ['area_total', 'logradouro', 'numero', 'cidade', 'estado']),
            ('cadastro', ['sql'])
        ]:
            for campo in campos:
                if imovel_dict.get(secao, {}).get(campo):
                    campos_preenchidos += 1
                else:
                    campos_faltantes.append(f"imoveis[{imovel_idx}].{secao}.{campo}")

    # Conta campos do negocio
    negocio_dict = negocio.to_dict()
    for secao, campos in [
        ('valor', ['total']),
        ('itbi', ['guias', 'total_valor'])
    ]:
        for campo in campos:
            valor = negocio_dict.get(secao, {}).get(campo)
            # Para 'guias', verifica se a lista tem itens
            if campo == 'guias':
                if valor and len(valor) > 0:
                    campos_preenchidos += 1
                else:
                    campos_faltantes.append(f"negocio.{secao}.{campo}")
            else:
                if valor:
                    campos_preenchidos += 1
                else:
                    campos_faltantes.append(f"negocio.{secao}.{campo}")

    # Extrai certidoes do primeiro imovel para retrocompatibilidade
    primeiro_imovel_dict = imoveis_list[0] if imoveis_list else {}

    # Monta resultado final
    resultado = {
        "metadata": {
            "caso_id": caso_id,
            "data_processamento": datetime.now().isoformat(),
            "documentos_processados": len(documentos),
            "campos_preenchidos": campos_preenchidos,
            "campos_faltantes": campos_faltantes,
            "total_imoveis": len(imoveis_list),
            "total_alienantes": len(alienantes),
            "total_adquirentes": len(adquirentes),
            "total_usufrutuarios": len(usufrutuarios),
            "total_alertas": len(alertas_juridicos)
        },
        "alienantes": alienantes,
        "adquirentes": adquirentes,
        "usufrutuarios": usufrutuarios,
        "imoveis": imoveis_list,  # LISTA de imoveis em vez de objeto unico
        "negocio": negocio_dict,
        "certidoes": {
            "cndt_alienantes": [
                {
                    "nome": a.get('nome'),
                    "cpf": a.get('cpf'),
                    "cndt": a.get('cndt')
                }
                for a in alienantes if a.get('cndt', {}).get('numero')
            ],
            "cndt_usufrutuarios": [
                {
                    "nome": u.get('nome'),
                    "cpf": u.get('cpf'),
                    "cndt": u.get('cndt')
                }
                for u in usufrutuarios if u.get('cndt', {}).get('numero')
            ],
            "cnd_municipal": {
                "numero": primeiro_imovel_dict.get('certidao_negativa_municipal', {}).get('numero'),
                "data_emissao": primeiro_imovel_dict.get('certidao_negativa_municipal', {}).get('data_emissao'),
                "validade": primeiro_imovel_dict.get('certidao_negativa_municipal', {}).get('validade'),
                "status": primeiro_imovel_dict.get('certidao_negativa_municipal', {}).get('status')
            },
            "vvr": {
                "valor": primeiro_imovel_dict.get('valores_venais', {}).get('vvr')
            }
        },
        "alertas_juridicos": alertas_juridicos
    }

    return resultado


def remove_sources_from_result(resultado: Dict[str, Any]) -> Dict[str, Any]:
    """
    Remove todas as informacoes de fontes (_fontes) do resultado,
    gerando uma versao limpa apenas com os dados finais.

    Args:
        resultado: Resultado completo do mapeamento

    Returns:
        Copia do resultado sem os campos de fontes
    """
    import copy

    # Faz copia profunda para nao alterar o original
    clean = copy.deepcopy(resultado)

    # Remove _fontes dos alienantes
    for alienante in clean.get('alienantes', []):
        if '_fontes' in alienante:
            del alienante['_fontes']

    # Remove _fontes dos adquirentes
    for adquirente in clean.get('adquirentes', []):
        if '_fontes' in adquirente:
            del adquirente['_fontes']

    # Remove _fontes dos usufrutuarios
    for usufrutuario in clean.get('usufrutuarios', []):
        if '_fontes' in usufrutuario:
            del usufrutuario['_fontes']

    # Remove _fontes e _matricula_key dos imoveis
    for imovel in clean.get('imoveis', []):
        if '_fontes' in imovel:
            del imovel['_fontes']
        if '_matricula_key' in imovel:
            del imovel['_matricula_key']

    # Remove _fontes do negocio
    if '_fontes' in clean.get('negocio', {}):
        del clean['negocio']['_fontes']

    # Remove metadata interna (documentos_fonte, etc)
    if 'metadata' in clean:
        # Mantem apenas campos essenciais no metadata
        metadata_clean = {
            'caso_id': clean['metadata'].get('caso_id'),
            'timestamp': clean['metadata'].get('timestamp'),
            'documentos_processados': clean['metadata'].get('documentos_processados'),
            'total_imoveis': clean['metadata'].get('total_imoveis'),
            'campos_preenchidos': clean['metadata'].get('campos_preenchidos'),
            'campos_faltantes': clean['metadata'].get('campos_faltantes', [])
        }
        clean['metadata'] = metadata_clean

    return clean


def run_mapping(caso_id: str, verbose: bool = False, output_format: str = 'json') -> Dict[str, Any]:
    """
    Executa o mapeamento completo de um caso.

    Args:
        caso_id: ID do caso
        verbose: Modo verbose
        output_format: Formato de saida ('json' ou 'summary')

    Returns:
        Resultado do mapeamento
    """
    logger.info("=" * 60)
    logger.info("MAPEAMENTO DE CAMPOS - FASE 4")
    logger.info(f"  Caso: {caso_id}")
    logger.info("=" * 60)

    # Executa mapeamento
    resultado = map_documents_to_fields(caso_id, verbose)

    # Cria diretorio de saida
    MAPPED_DIR.mkdir(parents=True, exist_ok=True)

    # Salva resultado COMPLETO (com fontes)
    output_path = MAPPED_DIR / f"{caso_id}.json"
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(resultado, f, ensure_ascii=False, indent=2)

    # Gera e salva versao LIMPA (sem fontes)
    resultado_limpo = remove_sources_from_result(resultado)
    output_path_clean = MAPPED_DIR / f"{caso_id}_clean.json"
    with open(output_path_clean, 'w', encoding='utf-8') as f:
        json.dump(resultado_limpo, f, ensure_ascii=False, indent=2)

    # Imprime resumo
    logger.info("=" * 60)
    logger.info("MAPEAMENTO CONCLUIDO")
    logger.info(f"  Documentos processados: {resultado['metadata']['documentos_processados']}")
    logger.info(f"  Alienantes encontrados: {len(resultado['alienantes'])}")
    logger.info(f"  Adquirentes encontrados: {len(resultado['adquirentes'])}")
    logger.info(f"  Imoveis encontrados: {resultado['metadata']['total_imoveis']}")
    logger.info(f"  Campos preenchidos: {resultado['metadata']['campos_preenchidos']}")
    logger.info(f"  Campos faltantes: {len(resultado['metadata']['campos_faltantes'])}")
    logger.info(f"  Saida completa: {output_path}")
    logger.info(f"  Saida limpa: {output_path_clean}")
    logger.info("=" * 60)

    # Resumo detalhado
    if verbose or output_format == 'summary':
        logger.info("\n--- ALIENANTES ---")
        for i, alienante in enumerate(resultado['alienantes'], 1):
            logger.info(f"  {i}. {alienante.get('nome', 'N/A')} - CPF: {alienante.get('cpf', 'N/A')}")
            logger.info(f"     Estado civil: {alienante.get('estado_civil', 'N/A')} | Profissao: {alienante.get('profissao', 'N/A')}")

        logger.info("\n--- ADQUIRENTES ---")
        for i, adquirente in enumerate(resultado['adquirentes'], 1):
            logger.info(f"  {i}. {adquirente.get('nome', 'N/A')} - CPF: {adquirente.get('cpf', 'N/A')}")
            logger.info(f"     Estado civil: {adquirente.get('estado_civil', 'N/A')} | Profissao: {adquirente.get('profissao', 'N/A')}")

        logger.info(f"\n--- IMOVEIS ({len(resultado['imoveis'])}) ---")
        for i, imovel in enumerate(resultado['imoveis'], 1):
            logger.info(f"  {i}. Matricula: {imovel.get('matricula', {}).get('numero', 'N/A')}")
            logger.info(f"     Cartorio: {imovel.get('matricula', {}).get('registro_imoveis', 'N/A')}")
            logger.info(f"     Tipo: {imovel.get('descricao', {}).get('tipo', 'N/A')}")
            logger.info(f"     SQL: {imovel.get('cadastro', {}).get('sql', 'N/A')}")
            logger.info(f"     Area total: {imovel.get('descricao', {}).get('area_total', 'N/A')}")
            logger.info(f"     Endereco: {imovel.get('descricao', {}).get('logradouro', 'N/A')}, {imovel.get('descricao', {}).get('numero', 'N/A')}")

        logger.info("\n--- NEGOCIO ---")
        negocio = resultado['negocio']
        logger.info(f"  Valor total: {negocio.get('valor', {}).get('total', 'N/A')}")
        logger.info(f"  Sinal: {negocio.get('forma_pagamento', {}).get('sinal', 'N/A')}")
        logger.info(f"  Saldo: {negocio.get('forma_pagamento', {}).get('saldo', 'N/A')}")
        itbi_info = negocio.get('itbi', {})
        num_guias = len(itbi_info.get('guias', []))
        logger.info(f"  ITBI: {itbi_info.get('total_valor', 'N/A')} ({num_guias} guia(s))")

        if resultado['metadata']['campos_faltantes']:
            logger.info("\n--- CAMPOS FALTANTES ---")
            for campo in resultado['metadata']['campos_faltantes'][:10]:
                logger.info(f"  - {campo}")
            if len(resultado['metadata']['campos_faltantes']) > 10:
                logger.info(f"  ... e mais {len(resultado['metadata']['campos_faltantes']) - 10} campos")

    return resultado


def main():
    """Funcao principal - entry point do script."""
    parser = argparse.ArgumentParser(
        description='Mapeia dados extraidos para campos da minuta de escritura',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemplos:
  python execution/map_to_fields.py FC_515_124_p280509
  python execution/map_to_fields.py FC_515_124_p280509 --verbose
  python execution/map_to_fields.py FC_515_124_p280509 --output-format summary

Este script e a Fase 4 do pipeline de processamento de documentos.
Ele le os dados extraidos pela Fase 3 e mapeia para a estrutura
padronizada da minuta de escritura.

Saida: .tmp/mapped/{caso_id}.json
        """
    )

    parser.add_argument(
        'caso_id',
        help='ID do caso (ex: FC_515_124_p280509)'
    )

    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Modo verbose: mostra detalhes do processamento'
    )

    parser.add_argument(
        '--output-format', '-o',
        choices=['json', 'summary'],
        default='json',
        help='Formato de saida: json (padrao) ou summary (com resumo detalhado)'
    )

    args = parser.parse_args()

    # Configura nivel de log
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    try:
        resultado = run_mapping(
            caso_id=args.caso_id,
            verbose=args.verbose,
            output_format=args.output_format
        )

        # Retorna codigo de saida baseado em campos faltantes
        if len(resultado['metadata']['campos_faltantes']) > 20:
            sys.exit(2)  # Muitos campos faltantes
        sys.exit(0)

    except FileNotFoundError as e:
        logger.error(f"Arquivo nao encontrado: {e}")
        sys.exit(1)
    except Exception as e:
        logger.exception(f"Erro fatal: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
