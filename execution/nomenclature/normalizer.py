#!/usr/bin/env python3
"""
normalizer.py - Classe Principal de Normalizacao de Campos

Esta classe fornece funcionalidades para:
1. Converter nomes de campo de qualquer formato para IDs canonicos
2. Converter IDs canonicos para nomes de exibicao
3. Normalizar dados extraidos de documentos para formato canonico flat
4. Aplicar transformacoes e mascaras de formatacao

Uso:
    from execution.nomenclature.normalizer import FieldNormalizer

    normalizer = FieldNormalizer()
    canonical_id = normalizer.to_canonical("nome_completo", context="schema")
    display_name = normalizer.to_display("pn_nome")
    normalized_data = normalizer.normalize_extracted_data(data, "RG")

Autor: Pipeline de Minutas
Data: Janeiro 2026
Versao: 2.0
"""

import json
import logging
import re
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union

logger = logging.getLogger(__name__)

# Diretorio da biblioteca de nomenclatura
NOMENCLATURE_DIR = Path(__file__).resolve().parent


class FieldNormalizer:
    """
    Classe principal para normalizacao de campos.

    Carrega as definicoes canonicas, aliases e transformacoes e fornece
    metodos para converter entre diferentes formatos de nomenclatura.
    """

    def __init__(self, lazy_load: bool = False):
        """
        Inicializa o normalizador.

        Args:
            lazy_load: Se True, carrega arquivos sob demanda. Se False, carrega tudo na inicializacao.
        """
        self._canonical_fields: Optional[Dict] = None
        self._aliases: Optional[Dict] = None
        self._transformations: Optional[Dict] = None

        # Cache de mapeamentos para busca rapida
        self._alias_to_canonical: Dict[str, str] = {}
        self._canonical_to_display: Dict[str, str] = {}
        self._canonical_to_display_pt: Dict[str, str] = {}
        self._field_metadata: Dict[str, Dict] = {}

        if not lazy_load:
            self._load_all()

    def _load_all(self) -> None:
        """Carrega todos os arquivos de configuracao."""
        self._load_canonical_fields()
        self._load_aliases()
        self._load_transformations()
        self._build_caches()

    def _load_canonical_fields(self) -> None:
        """Carrega o arquivo canonical_fields.json."""
        filepath = NOMENCLATURE_DIR / "canonical_fields.json"
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                self._canonical_fields = json.load(f)
            logger.debug(f"Carregado canonical_fields.json: {self._canonical_fields.get('total_fields', 0)} campos")
        except FileNotFoundError:
            logger.error(f"Arquivo nao encontrado: {filepath}")
            self._canonical_fields = {"categories": {}}
        except json.JSONDecodeError as e:
            logger.error(f"Erro ao decodificar JSON: {e}")
            self._canonical_fields = {"categories": {}}

    def _load_aliases(self) -> None:
        """Carrega o arquivo aliases.json."""
        filepath = NOMENCLATURE_DIR / "aliases.json"
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                self._aliases = json.load(f)
            logger.debug(f"Carregado aliases.json: {self._aliases.get('total_aliases', 0)} aliases")
        except FileNotFoundError:
            logger.error(f"Arquivo nao encontrado: {filepath}")
            self._aliases = {"alias_mappings": {}, "path_transformations": {}}
        except json.JSONDecodeError as e:
            logger.error(f"Erro ao decodificar JSON: {e}")
            self._aliases = {"alias_mappings": {}, "path_transformations": {}}

    def _load_transformations(self) -> None:
        """Carrega o arquivo transformations.json."""
        filepath = NOMENCLATURE_DIR / "transformations.json"
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                self._transformations = json.load(f)
            logger.debug(f"Carregado transformations.json: {len(self._transformations.get('document_transformations', {}))} tipos de documento")
        except FileNotFoundError:
            logger.error(f"Arquivo nao encontrado: {filepath}")
            self._transformations = {"document_transformations": {}, "global_transformations": {}}
        except json.JSONDecodeError as e:
            logger.error(f"Erro ao decodificar JSON: {e}")
            self._transformations = {"document_transformations": {}, "global_transformations": {}}

    def _build_caches(self) -> None:
        """Constroi caches de mapeamento para busca rapida."""
        if self._canonical_fields is None:
            self._load_canonical_fields()
        if self._aliases is None:
            self._load_aliases()

        # Cache de campos canonicos
        for category_name, category_data in self._canonical_fields.get("categories", {}).items():
            for field_id, field_data in category_data.get("fields", {}).items():
                self._canonical_to_display[field_id] = field_data.get("display_name", field_id)
                self._canonical_to_display_pt[field_id] = field_data.get("display_name_pt", field_id)
                self._field_metadata[field_id] = field_data

                # Adiciona o proprio ID canonico como alias
                self._alias_to_canonical[field_id.lower()] = field_id

        # Cache de aliases
        for canonical_id, mapping_data in self._aliases.get("alias_mappings", {}).items():
            for alias_entry in mapping_data.get("aliases", []):
                alias = alias_entry.get("alias", "").lower()
                if alias:
                    # Armazena alias -> canonical_id
                    # Se houver conflito, mantém o de maior prioridade
                    if alias not in self._alias_to_canonical:
                        self._alias_to_canonical[alias] = canonical_id

        logger.debug(f"Cache construido: {len(self._alias_to_canonical)} aliases mapeados")

    def to_canonical(self, field_name: str, context: str = "any") -> Optional[str]:
        """
        Converte qualquer nome de campo para seu ID canonico.

        Args:
            field_name: Nome do campo em qualquer formato
            context: Contexto da conversao ("schema", "extraction", "ui", "any")

        Returns:
            ID canonico do campo ou None se nao encontrado

        Examples:
            >>> normalizer.to_canonical("nome_completo")
            'pn_nome'
            >>> normalizer.to_canonical("NOME DO PAI")
            'pn_filiacao_pai'
            >>> normalizer.to_canonical("dados_catalogados.cpf")
            'pn_cpf'
        """
        if not self._alias_to_canonical:
            self._build_caches()

        # Normaliza o nome para busca
        normalized_name = field_name.lower().strip()

        # Busca direta no cache
        if normalized_name in self._alias_to_canonical:
            return self._alias_to_canonical[normalized_name]

        # Tenta remover prefixos comuns
        prefixes_to_strip = ["dados_catalogados.", "imovel.", "partes.", "valores."]
        for prefix in prefixes_to_strip:
            if normalized_name.startswith(prefix):
                stripped = normalized_name[len(prefix):]
                if stripped in self._alias_to_canonical:
                    return self._alias_to_canonical[stripped]

        # Tenta busca com contexto especifico
        if context != "any" and self._aliases:
            for canonical_id, mapping_data in self._aliases.get("alias_mappings", {}).items():
                for alias_entry in mapping_data.get("aliases", []):
                    if alias_entry.get("alias", "").lower() == normalized_name:
                        if alias_entry.get("context") == context or alias_entry.get("context") == "any":
                            return canonical_id

        logger.debug(f"Campo nao encontrado no mapeamento: {field_name}")
        return None

    def to_display(self, canonical_id: str, language: str = "default") -> str:
        """
        Converte um ID canonico para nome de exibicao.

        Args:
            canonical_id: ID canonico do campo
            language: Idioma ("default" para maiusculas, "pt" para portugues)

        Returns:
            Nome de exibicao do campo

        Examples:
            >>> normalizer.to_display("pn_nome")
            'NOME'
            >>> normalizer.to_display("pn_nome", language="pt")
            'Nome Completo'
        """
        if not self._canonical_to_display:
            self._build_caches()

        if language == "pt":
            return self._canonical_to_display_pt.get(canonical_id, canonical_id)
        return self._canonical_to_display.get(canonical_id, canonical_id)

    def get_field_metadata(self, canonical_id: str) -> Optional[Dict]:
        """
        Retorna os metadados completos de um campo canonico.

        Args:
            canonical_id: ID canonico do campo

        Returns:
            Dicionario com metadados do campo ou None
        """
        if not self._field_metadata:
            self._build_caches()
        return self._field_metadata.get(canonical_id)

    def list_all_aliases(self, canonical_id: str) -> List[Dict]:
        """
        Lista todos os aliases de um campo canonico.

        Args:
            canonical_id: ID canonico do campo

        Returns:
            Lista de aliases com contexto e prioridade
        """
        if self._aliases is None:
            self._load_aliases()

        mapping = self._aliases.get("alias_mappings", {}).get(canonical_id, {})
        return mapping.get("aliases", [])

    def normalize_extracted_data(
        self,
        data: Dict[str, Any],
        doc_type: str,
        flatten_nested: bool = True
    ) -> Dict[str, Any]:
        """
        Normaliza dados extraidos de um documento para formato canonico flat.

        Args:
            data: Dados extraidos (pode conter estruturas nested)
            doc_type: Tipo do documento (RG, CNH, ESCRITURA, etc.)
            flatten_nested: Se True, achata estruturas nested

        Returns:
            Dicionario com campos normalizados usando IDs canonicos

        Examples:
            >>> data = {"nome_completo": "MARINA AYUB", "filiacao": {"pai": "JOSE", "mae": "MARIA"}}
            >>> normalizer.normalize_extracted_data(data, "RG")
            {'pn_nome': 'MARINA AYUB', 'pn_filiacao_pai': 'JOSE', 'pn_filiacao_mae': 'MARIA'}
        """
        if self._transformations is None:
            self._load_transformations()

        normalized = {}
        doc_type_upper = doc_type.upper()

        # Obtem transformacoes especificas do tipo de documento
        doc_transforms = self._transformations.get("document_transformations", {}).get(doc_type_upper, {})
        nested_to_flat = doc_transforms.get("nested_to_flat", {})
        field_renames = doc_transforms.get("field_renames", {})

        # Primeiro, aplica transformacoes nested->flat
        if flatten_nested:
            flat_data = self._flatten_dict(data)
        else:
            flat_data = data.copy()

        # Aplica mapeamentos especificos do documento
        for source_path, canonical_id in nested_to_flat.items():
            value = self._get_nested_value(data, source_path)
            if value is not None:
                normalized[canonical_id] = self._apply_normalization(value, canonical_id)

        # Processa campos restantes
        for key, value in flat_data.items():
            if value is None or (isinstance(value, str) and not value.strip()):
                continue

            # Tenta mapear pelo rename especifico do documento
            if key in field_renames:
                canonical_id = field_renames[key]
            else:
                # Tenta encontrar o ID canonico
                canonical_id = self.to_canonical(key, context="extraction")

            if canonical_id and canonical_id not in normalized:
                normalized[canonical_id] = self._apply_normalization(value, canonical_id)

        return normalized

    def _flatten_dict(self, d: Dict, parent_key: str = '', sep: str = '.') -> Dict:
        """
        Achata um dicionario nested em um dicionario flat.

        Args:
            d: Dicionario a ser achatado
            parent_key: Chave do pai (para recursao)
            sep: Separador para chaves compostas

        Returns:
            Dicionario flat
        """
        items = []
        for k, v in d.items():
            new_key = f"{parent_key}{sep}{k}" if parent_key else k
            if isinstance(v, dict):
                items.extend(self._flatten_dict(v, new_key, sep).items())
            elif isinstance(v, list):
                # Trata arrays
                for i, item in enumerate(v):
                    if isinstance(item, dict):
                        items.extend(self._flatten_dict(item, f"{new_key}[{i}]", sep).items())
                    else:
                        items.append((f"{new_key}[{i}]", item))
            else:
                items.append((new_key, v))
        return dict(items)

    def _get_nested_value(self, data: Dict, path: str) -> Any:
        """
        Obtem valor de um caminho nested (ex: "filiacao.pai" ou "partes.outorgantes[0].nome").

        Args:
            data: Dicionario com dados
            path: Caminho no formato "chave.subchave" ou "chave[indice].subchave"

        Returns:
            Valor encontrado ou None
        """
        # Remove wildcards para busca simples (pega o primeiro elemento)
        path = re.sub(r'\[\*\]', '[0]', path)

        parts = path.replace('[', '.').replace(']', '').split('.')
        current = data

        for part in parts:
            if not part:
                continue

            if isinstance(current, dict):
                current = current.get(part)
            elif isinstance(current, list):
                try:
                    idx = int(part)
                    current = current[idx] if 0 <= idx < len(current) else None
                except (ValueError, IndexError):
                    current = None
            else:
                current = None

            if current is None:
                break

        return current

    def _apply_normalization(self, value: Any, canonical_id: str) -> Any:
        """
        Aplica regras de normalizacao ao valor baseado no campo canonico.

        Args:
            value: Valor a ser normalizado
            canonical_id: ID canonico do campo

        Returns:
            Valor normalizado
        """
        if value is None:
            return None

        metadata = self.get_field_metadata(canonical_id)
        if not metadata:
            return value

        normalization = metadata.get("normalization", {})

        if isinstance(value, str):
            value = value.strip()

            # Normalizacao de case
            if normalization.get("case") == "upper":
                value = value.upper()
            elif normalization.get("case") == "lower":
                value = value.lower()

            # Aplicar mascara (simplificado)
            # mask = normalization.get("mask")
            # if mask:
            #     value = self._apply_mask(value, mask)

        return value

    def get_document_fields(self, doc_type: str) -> List[str]:
        """
        Retorna lista de campos canonicos esperados para um tipo de documento.

        Args:
            doc_type: Tipo do documento

        Returns:
            Lista de IDs canonicos
        """
        if self._transformations is None:
            self._load_transformations()

        doc_type_upper = doc_type.upper()
        doc_transforms = self._transformations.get("document_transformations", {}).get(doc_type_upper, {})

        # Coleta todos os campos canonicos das transformacoes
        canonical_fields = set()

        for canonical_id in doc_transforms.get("nested_to_flat", {}).values():
            canonical_fields.add(canonical_id)

        for canonical_id in doc_transforms.get("field_renames", {}).values():
            canonical_fields.add(canonical_id)

        return sorted(list(canonical_fields))

    def get_all_canonical_ids(self) -> List[str]:
        """
        Retorna lista de todos os IDs canonicos definidos.

        Returns:
            Lista de IDs canonicos
        """
        if not self._field_metadata:
            self._build_caches()
        return sorted(list(self._field_metadata.keys()))

    def get_fields_by_category(self, category: str) -> List[str]:
        """
        Retorna campos canonicos de uma categoria especifica.

        Args:
            category: Nome da categoria (pessoa_natural, pessoa_juridica, imovel, negocio)

        Returns:
            Lista de IDs canonicos da categoria
        """
        if self._canonical_fields is None:
            self._load_canonical_fields()

        category_data = self._canonical_fields.get("categories", {}).get(category, {})
        return sorted(list(category_data.get("fields", {}).keys()))

    def validate_normalized_data(
        self,
        data: Dict[str, Any],
        doc_type: str
    ) -> Tuple[bool, List[str], List[str]]:
        """
        Valida se dados normalizados tem todos os campos obrigatorios.

        Args:
            data: Dados normalizados
            doc_type: Tipo do documento

        Returns:
            Tupla (valido, campos_faltantes, campos_extras)
        """
        expected_fields = set(self.get_document_fields(doc_type))
        actual_fields = set(data.keys())

        # Identifica campos obrigatorios faltantes
        missing = []
        for field_id in expected_fields:
            metadata = self.get_field_metadata(field_id)
            if metadata and metadata.get("required_in_minuta", False):
                if field_id not in actual_fields or data.get(field_id) is None:
                    missing.append(field_id)

        # Identifica campos nao mapeados
        extras = list(actual_fields - expected_fields)

        is_valid = len(missing) == 0

        return is_valid, missing, extras

    def bulk_to_canonical(self, field_names: List[str], context: str = "any") -> Dict[str, Optional[str]]:
        """
        Converte multiplos nomes de campo para IDs canonicos.

        Args:
            field_names: Lista de nomes de campo
            context: Contexto da conversao

        Returns:
            Dicionario {nome_original: canonical_id ou None}
        """
        return {name: self.to_canonical(name, context) for name in field_names}

    def get_stats(self) -> Dict[str, Any]:
        """
        Retorna estatisticas sobre a biblioteca de nomenclatura.

        Returns:
            Dicionario com estatisticas
        """
        if not self._field_metadata:
            self._build_caches()

        return {
            "total_canonical_fields": len(self._field_metadata),
            "total_aliases": len(self._alias_to_canonical),
            "categories": list(self._canonical_fields.get("categories", {}).keys()) if self._canonical_fields else [],
            "document_types": list(self._transformations.get("document_transformations", {}).keys()) if self._transformations else []
        }


# Instancia singleton para uso rapido
_default_normalizer: Optional[FieldNormalizer] = None


def get_normalizer() -> FieldNormalizer:
    """
    Retorna instancia singleton do normalizador.

    Returns:
        Instancia do FieldNormalizer
    """
    global _default_normalizer
    if _default_normalizer is None:
        _default_normalizer = FieldNormalizer()
    return _default_normalizer


# Funcoes de conveniencia
def to_canonical(field_name: str, context: str = "any") -> Optional[str]:
    """Funcao de conveniencia para conversao rapida."""
    return get_normalizer().to_canonical(field_name, context)


def to_display(canonical_id: str, language: str = "default") -> str:
    """Funcao de conveniencia para obtencao de nome de exibicao."""
    return get_normalizer().to_display(canonical_id, language)


def normalize_data(data: Dict, doc_type: str) -> Dict:
    """Funcao de conveniencia para normalizacao de dados."""
    return get_normalizer().normalize_extracted_data(data, doc_type)
