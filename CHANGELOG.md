# 📋 CHANGELOG — ABEC Meeting Open Database

Registro de alterações e evolução do acervo e plataforma das edições do **ABEC Meeting (2013-2025)** seguindo os padrões da **BRAN Org**.

---

## [1.1.0] - 2026-09-18 (Auditoria Criptográfica, Conformidade de Schemas e Exportadores BibTeX & RIS)

### 🚀 Novas Funcionalidades (Feat)
- **Exportação Acadêmica Dual (BibTeX & RIS)**: Adicionado suporte completo aos formatos `.bib` e `.ris` para importação direta no Zotero, Mendeley e VOSviewer.
- **Botões Rápidos no Explorer**: Novos atalhos de exportação no frontend para BibTeX e RIS.

### 🐛 Correções de Bugs (Fix)
- **Auditoria de Proveniência (`provenance.json`)**:
  - Atualizada a contagem de registros para o total real de **259 artigos** (estava como 150).
  - Calculado e injetado o hash criptográfico SHA-256 real do arquivo `abec_articles.json` (`341d2f797f2971d4...`).
  - Alinhado nível de saúde para `ORANGE` (Em Curadoria) em total conformidade com o catálogo e o README.
  - Ajustadas contagens de DOIs e resumos faltantes para 0.

### ⚙️ Infraestrutura & Testes (Chore/Test)
- **Validador Formal (`data-truth-assert.yml`)**: Removido o mascarador `|| true`.
- **Expansão da Suíte de Testes**: 19 testes automatizados cobrindo DataManager, StatsEngine e todos os endpoints REST de exportação.

---

## [1.0.0] - 2026-09-13 (Lançamento Oficial do Acervo ABEC Meeting)
- Ingestão automatizada das edições 2013 a 2025 via OJS (`scripts/scrape_abec.py`).
- 259 artigos com títulos originais e alternativos, afiliações, resumos, DOIs e links de PDF.

### 🏠 Tela Inicial (Landing Overview)
- **Apresentação Institucional**: Adicionada a aba **"Início"** com o nome da Organização / Periódico / Faculdade / Evento em destaque.
- **Espaço para Descrição**: Área expansível para apresentação do acervo, missão de Ciência Aberta e escopo dos dados.
- **Atalhos Rápidos**: Cards de navegação para o Explorador, Painel Geral e Sandbox de API.

### 🔝 Barra Superior (Top Header / Navbar)
- **Esquerda**: Logo genérica substituível (`.svg`) + Nome do Evento / Faculdade / Periódico.
- **Centro**: Barra de navegação em pílulas para as telas do portal (`Início`, `Explorador de Dados`, `Painel Geral`, `Análises & Correlações`, `Documentação da API`).
- **Direita**:
  - **Barra de Busca Rápida**: Campo de pesquisa direta no topo que redireciona automaticamente para os registros do Explorador de Dados.
  - **Links Externos de Destaque**: Botões com ícones diretos para o **GitHub** do repositório e o **DOI** do Zenodo.

### 👣 Footer Institucional & Suporte
- Créditos de desenvolvimento e marca da **BRAN Org**.
- **Seção de Suporte / Reportar Problemas**: Link direto para **Reportar Problemas / Issues no GitHub**.

---

## [1.3.0] - 2026-09-11 (Redesign Fiel Focado no EBBC OpenData - Branch `feat/redesign-ui`)

### 🎨 Painel de Estatísticas & Explorador em Cartões
- Painel com 4 Cards de Estatísticas e Toolbar de Personalização de Gráficos (Paletas e Tipos).
- Explorador com Cartões de Artigos, badges coloridos e Modal de Detalhes.

---

## [1.2.0] - 2026-09-11 (Redesign Visual Minimalista & Corporativo - Branch `feat/redesign-ui`)

### 🎨 Design & Interface de Usuário (UI/UX)
- Identidade visual minimalista com paleta Slate Navy e Plus Jakarta Sans.

---

## [1.1.0] - 2026-09-11 (Módulo de Correlações Cientométricas & Skill de Automação)

### 🚀 Novas Funcionalidades (Feat)
- Skill customizada `changelog-generator`.
- Análises de coocorrência 2D, dispersão e novos endpoints REST.

---

## [1.0.0] - 2026-09-11 (Lançamento Inicial do Template)

### 🚀 Novas Funcionalidades (Feat)
- Estrutura de configuração agnóstica, busca em memória, REST API e deploy Vercel.
