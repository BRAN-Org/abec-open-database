# ABEC Meeting Open Database

<p align="center">
  <a href="https://doi.org/10.5281/zenodo.23595236"><img src="https://zenodo.org/badge/DOI/10.5281/zenodo.23595236.svg" alt="Zenodo DOI"></a>
  <a href="#-síntese-do-acervo--governança"><img src="https://img.shields.io/badge/Confiabilidade-Em%20Averigua%C3%A7%C3%A3o-orange" alt="Confiabilidade"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/Licen%C3%A7a-CC_BY--NC--SA_4.0-lightgrey.svg" alt="CC BY-NC-SA 4.0"></a>
  <a href="#-como-usar-os-dados"><img src="https://img.shields.io/badge/Formatos-SQLite_%7C_CSV_%7C_JSON-blue.svg" alt="Formatos"></a>
</p>

Base de dados aberta e acervo completo 100% digitalizado dos anais e resumos das edições do ABEC Meeting (2013–2025), promovidos pela Associação Brasileira de Editores Científicos (ABEC Brasil) e disponibilizados pela BRAN Org sob princípios FAIR e BOAI.

---

## 📊 Síntese do Acervo & Governança

> [!NOTE]
> **Status de Confiabilidade:** 🟠 **Em Averiguação**  
> 📌 **Diagnóstico Metodológico:** Acervo com 259 artigos (2013–2025) e 257 PDFs em texto completo preservados (99,2% de cobertura). A classificação laranja documenta acervo sob processo ativo de averiguação técnica pela curadoria, incluindo conferência cruzada de identificadores, desambiguação de autoria e validação estrita da integridade de metadados antes de ser promovido à classificação verde.

| Métrica / Atributo | Detalhes do Acervo |
| :--- | :--- |
| **Período Histórico** | 2013–2025 (14 Edições) |
| **Total de Trabalhos** | **259 trabalhos científicos catalogados** |
| **Textos Completos (PDF)** | 257 artigos com texto completo em PDF preservado (99,2% do acervo) |
| **Integridade Criptográfica** | Hash SHA-256 por arquivo e rastreabilidade estrita (`provenance.json`) |
| **Formatos Disponíveis** | SQLite3 (`.sqlite`), CSV (UTF-8 BOM), JSON, BibTeX (`.bib`), RIS (`.ris`) |
| **Licença dos Dados** | [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) (Uso acadêmico; vedada ingestão por IA comercial) |

---

## 📥 Download do Pacote Consolidado

O acervo bruto, o banco relacional completo e os arquivos individuais estão arquivados permanentemente no **CERN / Zenodo** sob DOI imutável:

- 🔗 **DOI Permanente:** [https://doi.org/10.5281/zenodo.23595236](https://doi.org/10.5281/zenodo.23595236)
- 📦 **Conteúdo do .zip:** Banco SQLite3 (`abec_articles.sqlite`), planilhas CSV consolidadas (`abec_articles.csv`), metadados estruturados JSON, referências BibTeX/RIS e coleção completa de PDFs.

```bash
# Download direto do pacote completo via terminal
curl -LO "https://zenodo.org/records/23595236/files/abec-open-database-zenodo.zip"
unzip abec-open-database-zenodo.zip
```

---

## ⚡ Como Usar os Dados

### Python (Pandas)
```python
import pandas as pd

df = pd.read_json("data/abec_articles.json")
print(f"Total: {len(df)} artigos | Período: {df['year'].min()} a {df['year'].max()}")
```

### SQLite3 (SQL no terminal)
```bash
sqlite3 data/abec_articles.sqlite "SELECT year, COUNT(*) as total FROM articles GROUP BY year ORDER BY year;"
```

---

## 🌐 API REST Pública

Endpoints públicos e gratuitos (sem necessidade de chave de autenticação):

| Método | Endpoint | Finalidade |
| :--- | :--- | :--- |
| `GET` | `/api/v1/articles` | Busca textual (`?q=`), filtros facetados (`?year=`, `?author=`) e paginação |
| `GET` | `/api/v1/articles/:key` | Consulta individual por ID ou DOI |
| `GET` | `/api/v1/articles/stats` | Métricas consolidadas, rankings de autores e palavras-chave |
| `GET` | `/api/v1/articles/export?format=csv` | Download instantâneo dos dados filtrados em CSV (BOM UTF-8) |

> **Executar localmente:** `npm install && npm start` (disponível em `http://localhost:3000`).

---

## 📖 Como Citar Este Dataset

```bibtex
@misc{abec_open_database_2026,
  author       = {BRAN Org},
  title        = {ABEC Meeting Open Database},
  year         = {2026},
  howpublished = {Zenodo},
  doi          = {10.5281/zenodo.23595236},
  url          = {https://doi.org/10.5281/zenodo.23595236}
}
```

**ABNT:**
> BRAN ORG. **ABEC Meeting Open Database**. Genebra: CERN / Zenodo, 2026. DOI: 10.5281/zenodo.23595236. Disponível em: &lt;https://doi.org/10.5281/zenodo.23593236&gt;.
