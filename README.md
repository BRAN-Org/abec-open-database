# 🏛️ ABEC Meeting Open Database

<p align="center">
  <a href="https://github.com/BRAN-Org"><img src="https://img.shields.io/badge/BRAN%20Org-Open%20Data-blue.svg?style=for-the-badge&logo=github" alt="BRAN Org"></a>
  <a href="https://www.budapestopenaccessinitiative.org/"><img src="https://img.shields.io/badge/BOAI-Signatory-orange.svg?style=for-the-badge" alt="BOAI Signatory"></a>
  <a href="https://www.go-fair.org/fair-principles/"><img src="https://img.shields.io/badge/FAIR-Compliant-green.svg?style=for-the-badge" alt="FAIR Principles"></a>
  <img src="https://img.shields.io/badge/Node.js-v18%2B-brightgreen?style=for-the-badge&logo=nodedotjs" alt="Node.js">
</p>

Acervo público, modular e reproduzível contendo a **digitalização 100% integral** dos anais e resumos das edições do **ABEC Meeting** (2013-2025), organizados pela **Associação Brasileira de Editores Científicos (ABEC Brasil)** e mantidos pela **[BRAN Org](https://github.com/BRAN-Org)**.

---

## ⚡ Recursos Principais

- **100% Digitalizado**: Raspagem completa e metadados padronizados de todas as 14 edições (2013 a 2025) do acervo histórico do ABEC Meeting.
- **API REST Pública**:
  - `GET /api/v1/articles`: Busca textual global, filtros por ano, autor, seção, palavra-chave e ordenação.
  - `GET /api/v1/articles/stats`: Estatísticas agregadas calculadas dinamicamente (ranking de autores, palavras-chave e distribuição temporal).
  - `GET /api/v1/articles/:key`: Busca direta por DOI ou ID do artigo.
  - `GET /api/v1/articles/export`: Exportação em streaming nos formatos **JSON** e **CSV** (BOM UTF-8 para Excel).
- **Dashboard Web Interativo (Portal)**:
  - Visualizações gráficas dinâmicas em Canvas (evolução temporal, principais seções).
  - Tabela interativa com busca em tempo real e filtros multifacetados.
  - API Sandbox gerando trechos de código em JavaScript (Fetch), Python (Requests) e cURL.
- **Conformidade FAIR & BOAI**: Disponibilizado sob licença livre Creative Commons Attribution 4.0 International (CC-BY 4.0).

---

## 📁 Estrutura do Projeto

```
abec-open-database/
├── config/
│   └── dataset.config.json      # Configuração central do dataset, entidade, licença e filtros
├── data/
│   └── abec_articles.json       # Dataset consolidado 100% digitalizado
├── public/
│   ├── css/style.css            # Interface e temas visuais
│   ├── js/
│   │   ├── app.js               # Lógica do portal e API Sandbox
│   │   └── charts.js            # Gráficos dinâmicos em Canvas
│   └── index.html               # Interface do Portal Web
├── scripts/
│   ├── scrape_abec.py           # Script de extração e web scraping do OJS
│   ├── convert_csv_to_json.js   # Script conversor utilitário
│   └── validate_dataset.js      # Validador de integridade do dataset
├── src/
│   ├── config.js                # Loader de configurações
│   ├── dataManager.js           # Indexação em memória e motor de busca
│   ├── exportEngine.js          # Exportação em streaming (JSON / CSV)
│   ├── statsEngine.js           # Agregador de métricas e estatísticas
│   └── routes.js                # Rotas da API REST
├── server.js                    # Servidor Express principal
└── vercel.json                  # Configuração para deploy na Vercel
```

---

## 🚀 Como Executar Localmente

### 1. Clonar e Instalar Dependências
```bash
git clone https://github.com/BRAN-Org/abec-open-database.git
cd abec-open-database
npm install
```

### 2. Executar o Web Scraping (Opcional - Dados já inclusos)
```bash
npm run data:scrape
```

### 3. Validar a Base de Dados
```bash
npm run data:validate
```

### 4. Iniciar o Servidor
```bash
# Modo desenvolvimento (com auto-reload)
npm run dev

# Modo produção
npm start
```
Acesse no navegador: `http://localhost:3000`

---

## 📜 Princípios e Licença

- **[Princípios FAIR](https://www.go-fair.org/fair-principles/)**: Dados *Findable, Accessible, Interoperable, Reusable*.
- **[BOAI](https://www.budapestopenaccessinitiative.org/)**: Livre acesso à informação e produção acadêmica.
- **Licença**: [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/).

---

<p align="center">
  Desenvolvido com ❤️ pela <strong>BRAN Org</strong> & <strong>ABEC Brasil</strong>
</p>