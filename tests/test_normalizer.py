#!/usr/bin/env python3
"""
test_normalizer.py - Testes Unitarios para o Normalizador de Campos

Este arquivo contem testes para verificar o funcionamento correto
da biblioteca de nomenclatura.

Uso:
    pytest tests/test_normalizer.py -v
    python -m pytest tests/test_normalizer.py -v

Autor: Pipeline de Minutas
Data: Janeiro 2026
"""

import sys
from pathlib import Path

# Adiciona diretorio raiz ao path
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

import pytest


class TestFieldNormalizer:
    """Testes para a classe FieldNormalizer."""

    @pytest.fixture
    def normalizer(self):
        """Fixture que retorna uma instancia do normalizador."""
        from execution.nomenclature.normalizer import FieldNormalizer
        return FieldNormalizer()

    def test_initialization(self, normalizer):
        """Testa se o normalizador inicializa corretamente."""
        assert normalizer is not None
        stats = normalizer.get_stats()
        assert stats["total_canonical_fields"] > 0
        assert stats["total_aliases"] > 0

    def test_to_canonical_basic(self, normalizer):
        """Testa conversao basica de nomes de campo."""
        assert normalizer.to_canonical("nome") == "pn_nome"
        assert normalizer.to_canonical("cpf") == "pn_cpf"
        assert normalizer.to_canonical("cnpj") == "pj_cnpj"

    def test_to_canonical_schema_names(self, normalizer):
        """Testa conversao de nomes usados nos schemas."""
        assert normalizer.to_canonical("nome_completo") == "pn_nome"
        assert normalizer.to_canonical("numero_rg") == "pn_rg"
        assert normalizer.to_canonical("nome_pai") == "pn_filiacao_pai"
        assert normalizer.to_canonical("nome_mae") == "pn_filiacao_mae"

    def test_to_canonical_extraction_paths(self, normalizer):
        """Testa conversao de caminhos de extracao."""
        # Caminhos com prefixo dados_catalogados
        assert normalizer.to_canonical("dados_catalogados.nome_completo") == "pn_nome"
        assert normalizer.to_canonical("dados_catalogados.cpf") == "pn_cpf"

    def test_to_canonical_case_insensitive(self, normalizer):
        """Testa que a conversao e case-insensitive."""
        assert normalizer.to_canonical("NOME") == "pn_nome"
        assert normalizer.to_canonical("Nome") == "pn_nome"
        assert normalizer.to_canonical("CPF") == "pn_cpf"

    def test_to_canonical_unknown_field(self, normalizer):
        """Testa que campos desconhecidos retornam None."""
        assert normalizer.to_canonical("campo_inexistente_xyz") is None
        assert normalizer.to_canonical("") is None

    def test_to_display_default(self, normalizer):
        """Testa conversao para nome de exibicao padrao (maiusculas)."""
        assert normalizer.to_display("pn_nome") == "NOME"
        assert normalizer.to_display("pn_cpf") == "CPF"
        assert normalizer.to_display("pn_filiacao_pai") == "NOME DO PAI"

    def test_to_display_portuguese(self, normalizer):
        """Testa conversao para nome de exibicao em portugues."""
        assert normalizer.to_display("pn_nome", language="pt") == "Nome Completo"
        assert normalizer.to_display("pn_cpf", language="pt") == "CPF"
        assert normalizer.to_display("pn_filiacao_pai", language="pt") == "Nome do Pai"

    def test_get_field_metadata(self, normalizer):
        """Testa obtencao de metadados de campo."""
        metadata = normalizer.get_field_metadata("pn_cpf")

        assert metadata is not None
        assert metadata["canonical_id"] == "pn_cpf"
        assert metadata["type"] == "string"
        assert "validation" in metadata
        assert metadata["validation"] == "cpf_digito_verificador"

    def test_get_field_metadata_unknown(self, normalizer):
        """Testa metadados de campo inexistente."""
        metadata = normalizer.get_field_metadata("campo_inexistente")
        assert metadata is None

    def test_list_all_aliases(self, normalizer):
        """Testa listagem de aliases de um campo."""
        aliases = normalizer.list_all_aliases("pn_nome")

        assert len(aliases) > 0
        alias_names = [a["alias"] for a in aliases]
        assert "nome" in alias_names
        assert "nome_completo" in alias_names

    def test_normalize_extracted_data_basic(self, normalizer):
        """Testa normalizacao basica de dados extraidos."""
        data = {
            "nome_completo": "MARINA AYUB",
            "cpf": "368.366.718-43",
            "data_nascimento": "10/05/1985"
        }

        normalized = normalizer.normalize_extracted_data(data, "RG")

        assert "pn_nome" in normalized
        assert normalized["pn_nome"] == "MARINA AYUB"
        assert "pn_cpf" in normalized
        assert "pn_data_nascimento" in normalized

    def test_normalize_extracted_data_nested(self, normalizer):
        """Testa normalizacao de dados nested."""
        data = {
            "nome_completo": "JOAO SILVA",
            "filiacao": {
                "pai": "JOSE SILVA",
                "mae": "MARIA SILVA"
            }
        }

        normalized = normalizer.normalize_extracted_data(data, "RG")

        assert "pn_nome" in normalized
        assert "pn_filiacao_pai" in normalized
        assert normalized["pn_filiacao_pai"] == "JOSE SILVA"
        assert "pn_filiacao_mae" in normalized
        assert normalized["pn_filiacao_mae"] == "MARIA SILVA"

    def test_normalize_extracted_data_with_dados_catalogados(self, normalizer):
        """Testa normalizacao de dados com estrutura dados_catalogados."""
        data = {
            "dados_catalogados": {
                "nome_completo": "MARINA AYUB",
                "cpf": "368.366.718-43",
                "numero_rg": "12.345.678-9"
            }
        }

        normalized = normalizer.normalize_extracted_data(data, "RG")

        assert "pn_nome" in normalized
        assert "pn_cpf" in normalized
        assert "pn_rg" in normalized

    def test_get_document_fields(self, normalizer):
        """Testa obtencao de campos esperados por tipo de documento."""
        rg_fields = normalizer.get_document_fields("RG")

        assert len(rg_fields) > 0
        assert "pn_nome" in rg_fields
        assert "pn_cpf" in rg_fields
        assert "pn_rg" in rg_fields
        assert "pn_filiacao_pai" in rg_fields

    def test_get_all_canonical_ids(self, normalizer):
        """Testa obtencao de todos os IDs canonicos."""
        all_ids = normalizer.get_all_canonical_ids()

        assert len(all_ids) > 100  # Deve ter mais de 100 campos
        assert "pn_nome" in all_ids
        assert "pn_cpf" in all_ids
        assert "pj_cnpj" in all_ids
        assert "im_matricula_numero" in all_ids

    def test_get_fields_by_category(self, normalizer):
        """Testa obtencao de campos por categoria."""
        pn_fields = normalizer.get_fields_by_category("pessoa_natural")
        pj_fields = normalizer.get_fields_by_category("pessoa_juridica")
        im_fields = normalizer.get_fields_by_category("imovel")
        ng_fields = normalizer.get_fields_by_category("negocio")

        assert len(pn_fields) > 0
        assert all(f.startswith("pn_") for f in pn_fields)

        assert len(pj_fields) > 0
        assert all(f.startswith("pj_") for f in pj_fields)

        assert len(im_fields) > 0
        assert all(f.startswith("im_") for f in im_fields)

        assert len(ng_fields) > 0
        assert all(f.startswith("ng_") for f in ng_fields)

    def test_bulk_to_canonical(self, normalizer):
        """Testa conversao em lote."""
        field_names = ["nome", "cpf", "rg", "campo_inexistente"]
        result = normalizer.bulk_to_canonical(field_names)

        assert result["nome"] == "pn_nome"
        assert result["cpf"] == "pn_cpf"
        assert result["rg"] == "pn_rg"
        assert result["campo_inexistente"] is None


class TestValidators:
    """Testes para as funcoes de validacao."""

    def test_validate_cpf_valid(self):
        """Testa validacao de CPF valido."""
        from execution.nomenclature.validators import validate_cpf

        is_valid, msg = validate_cpf("368.366.718-43")
        assert is_valid

        is_valid, msg = validate_cpf("36836671843")
        assert is_valid

    def test_validate_cpf_invalid(self):
        """Testa validacao de CPF invalido."""
        from execution.nomenclature.validators import validate_cpf

        is_valid, msg = validate_cpf("111.111.111-11")
        assert not is_valid

        is_valid, msg = validate_cpf("123.456.789-00")
        assert not is_valid

        is_valid, msg = validate_cpf("123")
        assert not is_valid

    def test_validate_cnpj_valid(self):
        """Testa validacao de CNPJ valido."""
        from execution.nomenclature.validators import validate_cnpj

        is_valid, msg = validate_cnpj("11.222.333/0001-81")
        assert is_valid

    def test_validate_cnpj_invalid(self):
        """Testa validacao de CNPJ invalido."""
        from execution.nomenclature.validators import validate_cnpj

        is_valid, msg = validate_cnpj("11.111.111/1111-11")
        assert not is_valid

    def test_validate_uf_valid(self):
        """Testa validacao de UF valida."""
        from execution.nomenclature.validators import validate_uf

        for uf in ["SP", "RJ", "MG", "BA", "RS"]:
            is_valid, msg = validate_uf(uf)
            assert is_valid

    def test_validate_uf_invalid(self):
        """Testa validacao de UF invalida."""
        from execution.nomenclature.validators import validate_uf

        is_valid, msg = validate_uf("XX")
        assert not is_valid

        is_valid, msg = validate_uf("SAO PAULO")
        assert not is_valid

    def test_validate_cep_valid(self):
        """Testa validacao de CEP valido."""
        from execution.nomenclature.validators import validate_cep

        is_valid, msg = validate_cep("01310-100")
        assert is_valid

        is_valid, msg = validate_cep("01310100")
        assert is_valid

    def test_validate_cep_invalid(self):
        """Testa validacao de CEP invalido."""
        from execution.nomenclature.validators import validate_cep

        is_valid, msg = validate_cep("123")
        assert not is_valid

    def test_validate_date_valid(self):
        """Testa validacao de data valida."""
        from execution.nomenclature.validators import validate_date

        is_valid, msg = validate_date("25/01/2026")
        assert is_valid

        is_valid, msg = validate_date("01/12/1985")
        assert is_valid

    def test_validate_date_invalid(self):
        """Testa validacao de data invalida."""
        from execution.nomenclature.validators import validate_date

        is_valid, msg = validate_date("2026-01-25")
        assert not is_valid

        is_valid, msg = validate_date("32/13/2026")
        assert not is_valid

    def test_validate_email_valid(self):
        """Testa validacao de e-mail valido."""
        from execution.nomenclature.validators import validate_email

        is_valid, msg = validate_email("teste@exemplo.com")
        assert is_valid

        is_valid, msg = validate_email("usuario.nome@empresa.com.br")
        assert is_valid

    def test_validate_email_invalid(self):
        """Testa validacao de e-mail invalido."""
        from execution.nomenclature.validators import validate_email

        is_valid, msg = validate_email("email_invalido")
        assert not is_valid

        is_valid, msg = validate_email("@exemplo.com")
        assert not is_valid

    def test_validate_field(self):
        """Testa validacao generica de campo."""
        from execution.nomenclature.validators import validate_field

        # Campo CPF
        is_valid, msg = validate_field("pn_cpf", "368.366.718-43")
        assert is_valid

        # Campo UF
        is_valid, msg = validate_field("pn_estado_emissor_rg", "SP")
        assert is_valid

        # Campo desconhecido (validacao generica)
        is_valid, msg = validate_field("campo_qualquer", "valor")
        assert is_valid

    def test_validate_data_batch(self):
        """Testa validacao em lote."""
        from execution.nomenclature.validators import validate_data_batch

        data = {
            "pn_cpf": "368.366.718-43",
            "pn_estado_emissor_rg": "SP",
            "pn_nome": "MARIA SILVA"
        }

        results = validate_data_batch(data)

        assert len(results) == 3
        assert results["pn_cpf"][0]  # CPF valido
        assert results["pn_estado_emissor_rg"][0]  # UF valida
        assert results["pn_nome"][0]  # Nome valido


class TestConvenienceFunctions:
    """Testes para funcoes de conveniencia."""

    def test_to_canonical_function(self):
        """Testa funcao de conveniencia to_canonical."""
        from execution.nomenclature import to_canonical

        assert to_canonical("nome") == "pn_nome"
        assert to_canonical("cpf") == "pn_cpf"

    def test_to_display_function(self):
        """Testa funcao de conveniencia to_display."""
        from execution.nomenclature import to_display

        assert to_display("pn_nome") == "NOME"
        assert to_display("pn_cpf") == "CPF"

    def test_normalize_data_function(self):
        """Testa funcao de conveniencia normalize_data."""
        from execution.nomenclature import normalize_data

        data = {"nome_completo": "TESTE"}
        normalized = normalize_data(data, "RG")

        assert "pn_nome" in normalized


class TestEdgeCases:
    """Testes para casos de borda."""

    @pytest.fixture
    def normalizer(self):
        from execution.nomenclature.normalizer import FieldNormalizer
        return FieldNormalizer()

    def test_empty_data(self, normalizer):
        """Testa normalizacao de dados vazios."""
        normalized = normalizer.normalize_extracted_data({}, "RG")
        assert normalized == {}

    def test_none_values(self, normalizer):
        """Testa tratamento de valores None."""
        data = {"nome_completo": None, "cpf": None}
        normalized = normalizer.normalize_extracted_data(data, "RG")
        # Valores None devem ser ignorados
        assert "pn_nome" not in normalized or normalized.get("pn_nome") is None

    def test_whitespace_values(self, normalizer):
        """Testa tratamento de valores com apenas espacos."""
        data = {"nome_completo": "   ", "cpf": ""}
        normalized = normalizer.normalize_extracted_data(data, "RG")
        # Valores vazios/espacos devem ser ignorados
        assert "pn_nome" not in normalized

    def test_unknown_document_type(self, normalizer):
        """Testa normalizacao com tipo de documento desconhecido."""
        data = {"nome_completo": "TESTE", "cpf": "123"}
        # Deve funcionar mesmo com tipo desconhecido
        normalized = normalizer.normalize_extracted_data(data, "TIPO_DESCONHECIDO")
        # Campos comuns ainda devem ser mapeados
        assert isinstance(normalized, dict)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
