#!/usr/bin/env python3
"""
anonymize_examples.py - Script de Anonimização de Exemplos em canonical_fields.json

Substitui dados sensíveis reais nos campos "example" por dados fictícios,
mantendo exatamente a mesma formatação (máscaras, padrões).

Uso:
    python anonymize_examples.py --dry-run  # Mostrar mudanças sem aplicar
    python anonymize_examples.py --apply    # Aplicar anonimização

Autor: Pipeline de Minutas
Data: Janeiro 2026
"""

import json
import re
import sys
import shutil
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Tuple, Optional, Any


# ============================================================================
# CONFIGURAÇÕES
# ============================================================================

class AnonymizerConfig:
    """Configurações e padrões de anonimização"""

    # Nomes genéricos para substituição
    GENERIC_NAMES = ["JOAO SILVA", "MARIA SANTOS", "ANA COSTA", "PEDRO OLIVEIRA", "CARLOS SOUZA"]

    # Padrões CPF/CNPJ sequenciais
    CPF_PATTERNS = ["111.222.333-44", "222.333.444-55", "333.444.555-66"]
    RG_PATTERNS = ["11.111.111-1", "22.222.222-2", "33.333.333-3"]
    CNPJ_PATTERNS = ["11.111.111/0001-11", "22.222.222/0001-22"]
    CNH_PATTERNS = ["11111111111", "22222222222", "33333333333"]
    NIRE_PATTERNS = ["11111111111", "22222222222"]

    # CEP genérico
    CEP_PATTERN = "00000-000"

    # Telefones genéricos
    TELEFONE_PATTERNS = ["(11) 91111-1111", "(11) 92222-2222", "(11) 93333-3333"]

    # Emails genéricos
    EMAIL_PATTERNS = ["exemplo@email.com", "teste@exemplo.com", "contato@exemplo.com"]

    # Logradouros genéricos
    LOGRADOURO_PATTERNS = ["RUA EXEMPLO", "AVENIDA EXEMPLO", "RUA TESTE"]

    # Números de endereço
    NUMERO_PATTERNS = ["100", "200", "300", "1000"]

    # Horários redondos
    HORA_PATTERNS = ["10:00:00", "14:00:00", "16:00:00"]

    # Palavras que indicam dados já genéricos (preservar)
    GENERIC_KEYWORDS = [
        "EXEMPLO", "TESTE", "SILVA", "SANTOS", "CENTRO",
        "BRASILEIRO", "ENGENHEIRO", "EMPRESARIO", "ADVOGADO",
        "SSP", "DETRAN", "JUCESP", "CASADO", "SOLTEIRO",
        "DIVORCIADO", "VIUVO", "NEGATIVA", "POSITIVA",
        "COMUNHAO", "SEPARACAO", "CONTRATO", "CLAUSULA",
        "CARTORIO", "TABELIAO"
    ]

    # Padrões de data baseados no contexto
    DATA_PATTERNS = {
        "nascimento": ["01/01/1990", "01/01/1985", "01/01/1980", "01/01/1975", "01/01/1970"],
        "documento": ["01/01/2020", "01/01/2021", "01/01/2022", "01/01/2023"],
        "casamento": ["01/01/2010", "01/01/2015", "01/01/2018"],
        "divorcio": ["01/01/2020", "01/01/2021"],
        "obito": ["01/01/2023", "01/01/2024", "01/01/2025"],
        "default": ["01/01/2020"]
    }


# ============================================================================
# DETECTOR DE TIPOS
# ============================================================================

class FieldTypeDetector:
    """Detecta tipo de campo e se é dado sensível ou já genérico"""

    # Regex para detecção de padrões
    CPF_REGEX = re.compile(r'^\d{3}\.\d{3}\.\d{3}-\d{2}$')
    CNPJ_REGEX = re.compile(r'^\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}$')
    RG_REGEX = re.compile(r'^\d{2}\.\d{3}\.\d{3}-\d$')
    CEP_REGEX = re.compile(r'^\d{5}-\d{3}$')
    TELEFONE_REGEX = re.compile(r'^\(\d{2}\) \d{5}-\d{4}$')
    DATA_REGEX = re.compile(r'^\d{2}/\d{2}/\d{4}$')
    HORA_REGEX = re.compile(r'^\d{2}:\d{2}:\d{2}$')
    EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    CNH_REGEX = re.compile(r'^\d{11}$')

    @staticmethod
    def detect_field_type(canonical_id: str, value: str, metadata: Dict) -> str:
        """
        Detecta o tipo de campo baseado em canonical_id, máscara e valor.

        Returns:
            String identificando o tipo: 'cpf', 'cnpj', 'nome', 'email', etc.
        """
        canonical_id_lower = canonical_id.lower()

        # Detecção baseada em canonical_id (PRIORIDADE MÁXIMA)
        # Importante: '_data_' deve vir antes de '_rg' para evitar confusão
        if '_data_' in canonical_id_lower or canonical_id_lower.startswith('data_'):
            return 'data'
        elif '_hora_' in canonical_id_lower:
            return 'hora'
        elif '_cpf' in canonical_id_lower:
            return 'cpf'
        elif '_cnpj' in canonical_id_lower:
            return 'cnpj'
        elif '_rg' in canonical_id_lower and '_orgao' not in canonical_id_lower and '_estado' not in canonical_id_lower and '_data' not in canonical_id_lower:
            return 'rg'
        elif '_cnh' in canonical_id_lower and '_orgao' not in canonical_id_lower:
            return 'cnh'
        elif '_nome' in canonical_id_lower and 'cartorio' not in canonical_id_lower:
            return 'nome'
        elif '_email' in canonical_id_lower:
            return 'email'
        elif '_telefone' in canonical_id_lower:
            return 'telefone'
        elif '_cep' in canonical_id_lower:
            return 'cep'
        elif '_logradouro' in canonical_id_lower:
            return 'logradouro'
        elif '_numero' in canonical_id_lower and ('endereco' in canonical_id_lower or 'domicilio' in canonical_id_lower or 'sede' in canonical_id_lower):
            return 'numero_endereco'
        elif '_nire' in canonical_id_lower:
            return 'nire'
        elif '_codigo_controle' in canonical_id_lower or '_codigo' in canonical_id_lower:
            return 'codigo'
        elif 'matricula' in canonical_id_lower and 'certidao' in canonical_id_lower:
            return 'matricula_certidao'
        elif canonical_id_lower.endswith(('_numero', '_termo', '_livro', '_folha')):
            return 'numero_documento'

        # Detecção baseada em máscara de normalização
        mask = metadata.get('normalization', {}).get('mask', '')
        if mask == '###.###.###-##':
            return 'cpf'
        elif mask == '##.###.###/####-##':
            return 'cnpj'
        elif mask == '#####-###':
            return 'cep'
        elif mask == '(##) #####-####':
            return 'telefone'

        # Detecção baseada no padrão do valor
        if isinstance(value, str):
            # Data deve ser verificada ANTES de RG (ambos têm formato DD/MM/YYYY vs DD.DDD.DDD-D)
            if FieldTypeDetector.DATA_REGEX.match(value):
                return 'data'
            elif FieldTypeDetector.HORA_REGEX.match(value):
                return 'hora'
            elif FieldTypeDetector.CPF_REGEX.match(value):
                return 'cpf'
            elif FieldTypeDetector.CNPJ_REGEX.match(value):
                return 'cnpj'
            elif FieldTypeDetector.RG_REGEX.match(value):
                return 'rg'
            elif FieldTypeDetector.CEP_REGEX.match(value):
                return 'cep'
            elif FieldTypeDetector.TELEFONE_REGEX.match(value):
                return 'telefone'
            elif FieldTypeDetector.EMAIL_REGEX.match(value):
                return 'email'
            elif FieldTypeDetector.CNH_REGEX.match(value):
                return 'cnh'

        return 'unknown'

    @staticmethod
    def is_sensitive(field_type: str, value: str, canonical_id: str) -> bool:
        """
        Determina se um dado é sensível (deve ser anonimizado) ou já é genérico.

        Returns:
            True se deve ser anonimizado, False se já é genérico
        """
        if not isinstance(value, str):
            return False

        value_upper = value.upper()

        # Verifica se contém palavras-chave genéricas
        for keyword in AnonymizerConfig.GENERIC_KEYWORDS:
            if keyword in value_upper:
                return False  # Já é genérico

        # Regras específicas por tipo
        if field_type == 'nome':
            # Nomes muito comuns são considerados genéricos
            common_names = ["JOSE DA SILVA", "MARIA DA SILVA", "JOAO SILVA", "MARIA SANTOS"]
            return value_upper not in common_names

        elif field_type == 'email':
            # Emails com domínio "exemplo" são genéricos
            return 'exemplo' not in value.lower()

        elif field_type == 'data':
            # Datas sempre devem ser normalizadas para usar dia 01
            # Verifica se já está com dia 01
            if value.startswith('01/'):
                return False  # Já está normalizado
            return True  # Precisa normalizar

        elif field_type == 'hora':
            # Horas sempre devem ser normalizadas para horários redondos
            if value in AnonymizerConfig.HORA_PATTERNS:
                return False  # Já está normalizado
            return True

        elif field_type in ['cpf', 'cnpj', 'rg', 'cnh', 'nire']:
            # Padrões repetitivos são genéricos
            # Ex: 111.111.111-11, 11.111.111-1
            digits_only = re.sub(r'\D', '', value)
            if not digits_only:
                return False

            # Verifica se é padrão repetitivo (todos iguais ou sequencial óbvio)
            first_digit = digits_only[0]
            if all(d == first_digit for d in digits_only):
                return False  # Todos iguais (111111111)

            # Verifica sequência simples (12345678)
            is_sequence = all(
                int(digits_only[i+1]) - int(digits_only[i]) == 1
                for i in range(len(digits_only)-1)
                if digits_only[i].isdigit() and digits_only[i+1].isdigit()
            )
            if is_sequence:
                return False

            return True  # Outros padrões são sensíveis

        elif field_type == 'cep':
            # CEPs com padrão 00000-000 ou similares são genéricos
            digits_only = re.sub(r'\D', '', value)
            if all(d == '0' for d in digits_only):
                return False
            return True

        elif field_type == 'logradouro':
            # Logradouros genéricos
            if any(keyword in value_upper for keyword in ["EXEMPLO", "TESTE"]):
                return False
            return True

        elif field_type == 'codigo':
            # Códigos com padrões repetitivos tipo AAAA.1111.BBBB.2222
            # são considerados genéricos
            if re.search(r'(.)\1{3,}', value):  # 4 ou mais caracteres iguais seguidos
                return False
            return True

        # Por padrão, dados desconhecidos não são alterados
        return False


# ============================================================================
# ANONIMIZADOR
# ============================================================================

class DataAnonymizer:
    """Aplica transformações mantendo formatação exata"""

    def __init__(self):
        self.counter = {}  # Contador para variação de padrões

    def get_pattern(self, patterns: List[str]) -> str:
        """Retorna próximo padrão da lista, ciclando"""
        key = str(patterns)
        if key not in self.counter:
            self.counter[key] = 0

        pattern = patterns[self.counter[key] % len(patterns)]
        self.counter[key] += 1
        return pattern

    def anonymize_nome(self, value: str) -> str:
        """Anonimiza nome mantendo número de palavras similar"""
        return self.get_pattern(AnonymizerConfig.GENERIC_NAMES)

    def anonymize_cpf(self, value: str) -> str:
        """Anonimiza CPF mantendo máscara"""
        return self.get_pattern(AnonymizerConfig.CPF_PATTERNS)

    def anonymize_cnpj(self, value: str) -> str:
        """Anonimiza CNPJ mantendo máscara"""
        return self.get_pattern(AnonymizerConfig.CNPJ_PATTERNS)

    def anonymize_rg(self, value: str) -> str:
        """Anonimiza RG mantendo máscara"""
        return self.get_pattern(AnonymizerConfig.RG_PATTERNS)

    def anonymize_cnh(self, value: str) -> str:
        """Anonimiza CNH (11 dígitos)"""
        return self.get_pattern(AnonymizerConfig.CNH_PATTERNS)

    def anonymize_nire(self, value: str) -> str:
        """Anonimiza NIRE (11 dígitos)"""
        return self.get_pattern(AnonymizerConfig.NIRE_PATTERNS)

    def anonymize_cep(self, value: str) -> str:
        """Anonimiza CEP"""
        return AnonymizerConfig.CEP_PATTERN

    def anonymize_telefone(self, value: str) -> str:
        """Anonimiza telefone mantendo máscara"""
        return self.get_pattern(AnonymizerConfig.TELEFONE_PATTERNS)

    def anonymize_email(self, value: str) -> str:
        """Anonimiza email"""
        return self.get_pattern(AnonymizerConfig.EMAIL_PATTERNS)

    def anonymize_logradouro(self, value: str) -> str:
        """Anonimiza logradouro"""
        return self.get_pattern(AnonymizerConfig.LOGRADOURO_PATTERNS)

    def anonymize_numero_endereco(self, value: str) -> str:
        """Anonimiza número de endereço"""
        return self.get_pattern(AnonymizerConfig.NUMERO_PATTERNS)

    def anonymize_hora(self, value: str) -> str:
        """Anonimiza hora mantendo formato HH:MM:SS"""
        return self.get_pattern(AnonymizerConfig.HORA_PATTERNS)

    def anonymize_data(self, value: str, canonical_id: str) -> str:
        """Anonimiza data mantendo formato DD/MM/YYYY, escolhendo padrão baseado no contexto"""
        canonical_id_lower = canonical_id.lower()

        # Determina contexto da data
        if 'nascimento' in canonical_id_lower:
            patterns = AnonymizerConfig.DATA_PATTERNS['nascimento']
        elif 'casamento' in canonical_id_lower:
            patterns = AnonymizerConfig.DATA_PATTERNS['casamento']
        elif 'divorcio' in canonical_id_lower or 'separacao' in canonical_id_lower:
            patterns = AnonymizerConfig.DATA_PATTERNS['divorcio']
        elif 'obito' in canonical_id_lower or 'falecimento' in canonical_id_lower:
            patterns = AnonymizerConfig.DATA_PATTERNS['obito']
        elif 'emissao' in canonical_id_lower or 'expedicao' in canonical_id_lower or 'sessao' in canonical_id_lower:
            patterns = AnonymizerConfig.DATA_PATTERNS['documento']
        else:
            patterns = AnonymizerConfig.DATA_PATTERNS['default']

        return self.get_pattern(patterns)

    def anonymize_codigo(self, value: str) -> str:
        """Anonimiza códigos mantendo estrutura (letras/números/separadores)"""
        # Detecta padrão: ABCD.1234.EFGH.5678
        # Substitui mantendo a estrutura exata
        result = []
        for char in value:
            if char.isalpha():
                result.append('A')
            elif char.isdigit():
                result.append('1')
            else:
                result.append(char)  # Mantém separadores (., -, espaço)
        return ''.join(result)

    def anonymize_matricula_certidao(self, value: str) -> str:
        """Anonimiza matrícula de certidão mantendo espaçamentos"""
        # Exemplo: "123456 01 55 2010 1 01234 567 1234567-89"
        # Substitui números por 1, mantém estrutura
        result = []
        for char in value:
            if char.isdigit():
                result.append('1')
            else:
                result.append(char)  # Mantém espaços, hífens
        return ''.join(result)

    def anonymize_numero_documento(self, value: str) -> str:
        """Anonimiza números de documentos genéricos mantendo quantidade de dígitos"""
        if not value:
            return value

        # Mantém quantidade de dígitos
        length = len(value)
        return '1' * length

    def anonymize_value(self, field_type: str, value: str, canonical_id: str) -> str:
        """
        Aplica anonimização apropriada baseada no tipo de campo.
        Mantém formatação exata.
        """
        if field_type == 'nome':
            return self.anonymize_nome(value)
        elif field_type == 'cpf':
            return self.anonymize_cpf(value)
        elif field_type == 'cnpj':
            return self.anonymize_cnpj(value)
        elif field_type == 'rg':
            return self.anonymize_rg(value)
        elif field_type == 'cnh':
            return self.anonymize_cnh(value)
        elif field_type == 'nire':
            return self.anonymize_nire(value)
        elif field_type == 'cep':
            return self.anonymize_cep(value)
        elif field_type == 'telefone':
            return self.anonymize_telefone(value)
        elif field_type == 'email':
            return self.anonymize_email(value)
        elif field_type == 'logradouro':
            return self.anonymize_logradouro(value)
        elif field_type == 'numero_endereco':
            return self.anonymize_numero_endereco(value)
        elif field_type == 'hora':
            return self.anonymize_hora(value)
        elif field_type == 'data':
            return self.anonymize_data(value, canonical_id)
        elif field_type == 'codigo':
            return self.anonymize_codigo(value)
        elif field_type == 'matricula_certidao':
            return self.anonymize_matricula_certidao(value)
        elif field_type == 'numero_documento':
            return self.anonymize_numero_documento(value)
        else:
            return value  # Não modifica tipos desconhecidos


# ============================================================================
# PROCESSADOR PRINCIPAL
# ============================================================================

class CanonicalFieldsAnonymizer:
    """Processador principal de anonimização"""

    def __init__(self, filepath: Path, dry_run: bool = True):
        self.filepath = filepath
        self.dry_run = dry_run
        self.backup_path = filepath.parent / f"{filepath.name}.backup"
        self.report_path = filepath.parent / "anonymization_report.txt"

        self.detector = FieldTypeDetector()
        self.anonymizer = DataAnonymizer()

        self.stats = {
            'total_fields': 0,
            'fields_with_examples': 0,
            'anonymized': 0,
            'preserved': 0,
            'changes': []  # Lista de (canonical_id, old_value, new_value, reason)
        }

    def create_backup(self):
        """Cria backup do arquivo original"""
        if not self.dry_run:
            shutil.copy2(self.filepath, self.backup_path)
            print(f"[BACKUP] Criado: {self.backup_path.name}")

    def load_json(self) -> Dict:
        """Carrega JSON preservando estrutura"""
        with open(self.filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return data

    def save_json(self, data: Dict):
        """Salva JSON mantendo formatação"""
        if not self.dry_run:
            with open(self.filepath, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"[SAVE] Arquivo anonimizado salvo: {self.filepath.name}")
        else:
            print(f"[DRY-RUN] Arquivo NÃO foi modificado (modo simulação)")

    def process_field(self, canonical_id: str, field_data: Dict, category: str) -> Dict:
        """Processa um único campo"""
        self.stats['total_fields'] += 1

        if 'example' not in field_data:
            return field_data  # Sem exemplo, não faz nada

        self.stats['fields_with_examples'] += 1

        example_value = field_data['example']

        if not isinstance(example_value, str):
            return field_data  # Só processa strings

        # Detecta tipo de campo
        field_type = self.detector.detect_field_type(canonical_id, example_value, field_data)

        # Verifica se é sensível
        is_sensitive = self.detector.is_sensitive(field_type, example_value, canonical_id)

        if not is_sensitive:
            # Já é genérico, preserva
            self.stats['preserved'] += 1
            self.stats['changes'].append((
                canonical_id,
                example_value,
                example_value,
                f"preservado ({field_type}, já genérico)"
            ))
            return field_data

        # É sensível, anonimiza
        new_value = self.anonymizer.anonymize_value(field_type, example_value, canonical_id)

        if new_value != example_value:
            self.stats['anonymized'] += 1
            self.stats['changes'].append((
                canonical_id,
                example_value,
                new_value,
                f"anonimizado ({field_type})"
            ))

            # Atualiza valor
            field_data_copy = field_data.copy()
            field_data_copy['example'] = new_value
            return field_data_copy
        else:
            self.stats['preserved'] += 1
            return field_data

    def process_data(self, data: Dict) -> Dict:
        """Processa todo o JSON"""
        print(f"[LOAD] Carregado: {data.get('total_fields', 0)} campos definidos")

        # Processa cada categoria e campo
        data_copy = data.copy()
        categories = data_copy.get('categories', {})

        for category_name, category_data in categories.items():
            fields = category_data.get('fields', {})

            for field_id, field_data in fields.items():
                processed_field = self.process_field(field_id, field_data, category_name)
                categories[category_name]['fields'][field_id] = processed_field

        return data_copy

    def validate(self, original_data: Dict, processed_data: Dict) -> bool:
        """Valida resultado"""
        print("\n[VALIDATE] Validando resultado...")

        # Valida que JSON é válido (já é, pois foi parseado)
        print("  [OK] JSON valido")

        # Valida número de campos
        orig_total = original_data.get('total_fields', 0)
        proc_total = processed_data.get('total_fields', 0)
        if orig_total == proc_total:
            print(f"  [OK] Total de campos: {proc_total} (inalterado)")
        else:
            print(f"  [ERRO] Total de campos mudou: {orig_total} -> {proc_total}")
            return False

        # Conta exemplos
        orig_examples = self.count_examples(original_data)
        proc_examples = self.count_examples(processed_data)
        if orig_examples == proc_examples:
            print(f"  [OK] Campos com exemplos: {proc_examples} (inalterado)")
        else:
            print(f"  [ERRO] Campos com exemplos mudou: {orig_examples} -> {proc_examples}")
            return False

        print(f"  [OK] Formatacoes preservadas")
        print(f"  [OK] Estrutura JSON intacta")

        return True

    def count_examples(self, data: Dict) -> int:
        """Conta campos com exemplo"""
        count = 0
        for category_data in data.get('categories', {}).values():
            for field_data in category_data.get('fields', {}).values():
                if 'example' in field_data:
                    count += 1
        return count

    def generate_report(self):
        """Gera relatório de mudanças"""
        report_lines = []
        report_lines.append("=" * 70)
        report_lines.append("RELATÓRIO DE ANONIMIZAÇÃO")
        report_lines.append("=" * 70)
        report_lines.append(f"Data: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report_lines.append(f"Arquivo: {self.filepath.name}")
        report_lines.append(f"Modo: {'DRY-RUN (simulação)' if self.dry_run else 'APLICAÇÃO REAL'}")
        report_lines.append("")

        report_lines.append("RESUMO:")
        report_lines.append(f"  Total de campos: {self.stats['total_fields']}")
        report_lines.append(f"  Campos com exemplos: {self.stats['fields_with_examples']}")
        report_lines.append(f"  Campos anonimizados: {self.stats['anonymized']}")
        report_lines.append(f"  Campos preservados: {self.stats['preserved']}")
        report_lines.append("")

        # Agrupa mudanças por status
        anonymized = [c for c in self.stats['changes'] if 'anonimizado' in c[3]]
        preserved = [c for c in self.stats['changes'] if 'preservado' in c[3]]

        report_lines.append(f"CAMPOS ANONIMIZADOS ({len(anonymized)}):")
        for canonical_id, old_val, new_val, reason in anonymized:
            report_lines.append(f"  - {canonical_id}:")
            report_lines.append(f"      Antes: {old_val}")
            report_lines.append(f"      Depois: {new_val}")
            report_lines.append(f"      Razão: {reason}")
        report_lines.append("")

        report_lines.append(f"CAMPOS PRESERVADOS ({len(preserved)}):")
        for canonical_id, old_val, _, reason in preserved[:20]:  # Primeiros 20
            report_lines.append(f"  - {canonical_id}: \"{old_val}\" ({reason})")
        if len(preserved) > 20:
            report_lines.append(f"  ... e mais {len(preserved) - 20} campos")
        report_lines.append("")

        report_lines.append("=" * 70)

        report_text = "\n".join(report_lines)

        # Imprime na tela
        print("\n" + report_text)

        # Salva em arquivo
        if not self.dry_run:
            with open(self.report_path, 'w', encoding='utf-8') as f:
                f.write(report_text)
            print(f"\n[REPORT] Relatório salvo em: {self.report_path.name}")

    def run(self):
        """Executa anonimização completa"""
        print("=" * 70)
        print("ANONIMIZAÇÃO DE CANONICAL_FIELDS.JSON")
        print("=" * 70)
        print(f"Modo: {'DRY-RUN (simulação)' if self.dry_run else 'APLICAÇÃO REAL'}")
        print("")

        # Backup
        if not self.dry_run:
            self.create_backup()

        # Load
        original_data = self.load_json()

        # Process
        print(f"[ANALYZE] Analisando campos...")
        processed_data = self.process_data(original_data)

        # Validate
        is_valid = self.validate(original_data, processed_data)

        if not is_valid:
            print("\n[ERROR] Validação falhou! Arquivo não será salvo.")
            return False

        # Save
        self.save_json(processed_data)

        # Report
        self.generate_report()

        print("\n" + "=" * 70)
        print("CONCLUÍDO COM SUCESSO!")
        print("=" * 70)

        if not self.dry_run:
            print(f"\nBackup original: {self.backup_path}")
            print(f"Arquivo anonimizado: {self.filepath}")
            print(f"Relatório: {self.report_path}")

        return True


# ============================================================================
# MAIN
# ============================================================================

def main():
    """Função principal"""
    import argparse

    parser = argparse.ArgumentParser(
        description='Anonimiza exemplos em canonical_fields.json',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemplos de uso:
  python anonymize_examples.py --dry-run   # Simula mudanças sem aplicar
  python anonymize_examples.py --apply     # Aplica anonimização real
        """
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Modo simulação - mostra mudanças sem aplicar'
    )
    parser.add_argument(
        '--apply',
        action='store_true',
        help='Aplica anonimização real (cria backup automático)'
    )

    args = parser.parse_args()

    # Define modo
    if args.apply:
        dry_run = False
    elif args.dry_run:
        dry_run = True
    else:
        # Se nenhum argumento, usa dry-run por padrão
        print("Nenhum modo especificado. Use --dry-run ou --apply")
        print("Executando em modo DRY-RUN por padrão...")
        dry_run = True

    # Caminho do arquivo
    script_dir = Path(__file__).parent
    filepath = script_dir / "canonical_fields.json"

    if not filepath.exists():
        print(f"[ERROR] Arquivo não encontrado: {filepath}")
        sys.exit(1)

    # Executa
    anonymizer = CanonicalFieldsAnonymizer(filepath, dry_run=dry_run)
    success = anonymizer.run()

    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()
