# ABEC Meeting Open Database

<p align="center">
  <a href="https://doi.org/10.5281/zenodo.23595236"><img src="https://zenodo.org/badge/DOI/10.5281/zenodo.23595236.svg" alt="Zenodo DOI"></a>
  <a href="https://www.go-fair.org/fair-principles/"><img src="https://img.shields.io/badge/FAIR-Compliant-green.svg?style=for-the-badge" alt="FAIR Principles"></a>
  <a href="https://www.budapestopenaccessinitiative.org/"><img src="https://img.shields.io/badge/BOAI-Signatory-orange.svg?style=for-the-badge" alt="BOAI Signatory"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/Data_License-CC_BY--NC--SA_4.0-lightgrey.svg?style=for-the-badge" alt="CC BY-NC-SA 4.0"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/Code_License-GPLv3-blue.svg?style=for-the-badge" alt="GPLv3"></a>
</p>

Base de dados aberta e acervo completo 100% digitalizado dos anais e resumos das edições do ABEC Meeting (2013-2025), promovidos pela Associação Brasileira de Editores Científicos (ABEC Brasil) e disponibilizados pela BRAN Org sob princípios FAIR e BOAI.

---

## 📊 Acervo em Números

| Métrica / Atributo | Detalhes do Acervo |
| :--- | :--- |
| **Período Histórico** | 2013–2025 (14 Edições) |
| **Total de Artigos** | **259 trabalhos científicos catalogados** |
| **Textos Completos (PDF)** | 257 artigos com texto completo em PDF preservado (99,2% do acervo) |
| **Formatos Estruturados** | SQLite3 (`.sqlite`), CSV UTF-8 BOM, JSON, BibTeX (`.bib`), RIS (`.ris`) |
| **Curadoria & Proveniência** | Curadoria independente com integridade criptográfica (hash SHA-256) pela [BRAN Org](https://github.com/BRAN-Org) |
| **Licença dos Dados** | [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) (Uso acadêmico/não-comercial; vedada ingestão para IA comercial) |
| **Licença do Código** | [GNU GPLv3](https://www.gnu.org/licenses/gpl-3.0.html) |

---

## 📦 Onde Baixar (Pacote Completo no Zenodo)

Todo o acervo bruto, o banco relacional completo e os arquivos individuais estão arquivados permanentemente no **CERN / Zenodo** sob DOI imutável. Você pode baixar todos os arquivos de uma só vez:

- 🔗 **Registro Permanente**: [https://doi.org/10.5281/zenodo.23595236](https://doi.org/10.5281/zenodo.23595236)
- 📥 **Pacote Consolidado (.zip)**: Inclui o banco relacional SQLite3 (`abec_articles.sqlite`), planilhas CSV consolidadas (`abec_articles.csv`), metadados estruturados JSON, arquivos de referência BibTeX/RIS e a coleção de PDFs em texto completo.

### Download direto via terminal (cURL / Wget)
```bash
# Baixar o pacote completo do Zenodo
curl -LO "https://zenodo.org/records/23595236/files/abec-open-database-zenodo.zip"
unzip abec-open-database-zenodo.zip
```

---

## ⚡ Como Usar os Dados

### 1. Python (Pandas)
```python
import pandas as pd

# Carregar o dataset estruturado
df = pd.read_json("data/abec_articles.json")
print(f"Total de registros: {len(df)}")
print(df[["title", "year", "authors"]].head())
```

### 2. SQLite3 (SQL direto no terminal)
```bash
# Consultar distribuição temporal direto no banco relacional
sqlite3 data/abec_articles.sqlite "SELECT year, COUNT(*) as total FROM articles GROUP BY year ORDER BY year;"
```

---

## 🌐 API REST Pública

O repositório fornece uma API REST de alta performance, gratuita e sem necessidade de chave de autenticação (API Key):

| Método | Endpoint | Finalidade |
| :--- | :--- | :--- |
| `GET` | `/api/v1/articles` | Lista registros com busca textual global (`?q=`), filtros facetados (`?year=`, `?author=`), ordenação e paginação |
| `GET` | `/api/v1/articles/:key` | Consulta individual exata por DOI ou ID do artigo |
| `GET` | `/api/v1/articles/stats` | Estatísticas agregadas (rankings de autores, tópicos e evolução temporal) |
| `GET` | `/api/v1/articles/export?format=csv` | Download instantâneo dos registros filtrados em **CSV (BOM UTF-8)** |
| `GET` | `/api/v1/articles/export?format=bibtex` | Download das referências bibliográficas filtradas em **BibTeX** |

### Exemplo de Requisição (cURL)
```bash
curl -s "http://localhost:3000/api/v1/articles?q=informacao&limit=5"
```

---

## 🚀 Como Executar o Portal Localmente

Para rodar o portal interativo com gráficos dinâmicos, sandbox e explorador de artigos:

```bash
git clone https://github.com/BRAN-Org/abec-open-database.git
cd abec-open-database
npm install
npm start
```
Acesse no navegador: `http://localhost:3000`

---

## 📖 Como Citar Este Dataset

Se você utilizar estes dados em pesquisas acadêmicas, teses ou softwares, por favor cite:

```bibtex
@misc{abec_open_database_2026,
  author       = {BRAN Org},
  title        = {ABEC Meeting Open Database},
  year         = {2026},
  howpublished = {Zenodo},
  doi          = {10.5281/zenodo.23595236},
  url          = {https://doi.org/10.5281/zenodo.23595236},
  note         = {Base de dados bibliométrica aberta curada pela Brazilian Research Archive Network}
}
```

**ABNT:**
> BRAN ORG. **ABEC Meeting Open Database**. Genebra: CERN / Zenodo, 2026. DOI: 10.5281/zenodo.23595236. Disponível em: &lt;https://doi.org/10.5281/zenodo.23595236&gt;.

---

## 🛡️ Confiabilidade e Governança

- **Classificação**: 🟠 **Em Averiguação** — Acervo extraído sob averiguação ativa de integridade, normalização de metadados e checagem de identificadores.
- **Auditoria Independente**: Verificação e catalogação executada com rigor metodológico, conferência contra publicações e integridade criptográfica.
- **Calendário de Curadoria**: Acompanhe os ciclos de atualização no repositório [BRAN-Org/.github](https://github.com/BRAN-Org/.github/blob/main/CALENDAR.md).

---

<p align="center">
  Curadoria e Preservação Digital por <strong><a href="https://github.com/BRAN-Org">BRAN Org</a></strong>
</p>
