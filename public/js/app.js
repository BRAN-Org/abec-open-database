import { SimpleChart } from './charts.js';

let appConfig = null;
let currentOffset = 0;
const currentLimit = 10;
let currentPalette = 'simeon';
let currentChartType = 'bar';
let currentSortDir = 'asc';

const chartInstances = {};

document.addEventListener('DOMContentLoaded', async () => {
  initTabs();
  initModal();

  try {
    const resConfig = await fetch('/api/v1/config');
    appConfig = await resConfig.json();

    applyConfigToUI(appConfig);
    initToolbarControls();

    await loadStatsDashboard();
    await loadExplorerData();
    await loadCorrelations();
    initSandbox();
  } catch (err) {
    console.error('⚠️ Falha na inicialização do portal:', err);
  }
});

function applyConfigToUI(config) {
  if (!config) return;
  const title = config.dataset?.title || 'OpenData OS';
  const orgName = config.organization?.name || 'BRAN Org';
  const instName = config.organization?.institutionName || 'Faculdade / Periódico / Evento Científico';
  const description = config.dataset?.description || '';

  document.title = title;

  // Header Title & Subtitle
  const headerTitle = document.getElementById('header-title');
  if (headerTitle) {
    if (orgName && orgName !== 'BRAN Org') {
      headerTitle.innerHTML = `${escapeHtml(orgName)} <span>OpenData</span>`;
    } else {
      headerTitle.innerHTML = `<span>OpenData</span> OS`;
    }
  }

  const headerSub = document.getElementById('header-subtitle');
  if (headerSub) headerSub.textContent = instName;

  // Home Hero Section (Clean display of institution name without "BRAN Org — " prefix)
  const homeOrgName = document.getElementById('home-org-name');
  if (homeOrgName) homeOrgName.textContent = instName;

  const homeDatasetTitle = document.getElementById('home-dataset-title');
  if (homeDatasetTitle) homeDatasetTitle.textContent = title;

  const homeDesc = document.getElementById('home-description-text');
  if (homeDesc && description) homeDesc.textContent = description;

  // Footer Info
  const footerOrg = document.getElementById('footer-org-name');
  if (footerOrg) footerOrg.textContent = instName;

  const footerInst = document.getElementById('footer-inst-name');
  if (footerInst) footerInst.textContent = '';

  // Badges & External Links
  const doiText = document.getElementById('badge-doi-text');
  const doiLink = document.getElementById('badge-doi-link');
  const footerDoi = document.getElementById('footer-doi-link');

  if (config.dataset?.doi) {
    const cleanDoi = config.dataset.doi.replace('https://doi.org/', '');
    const doiHref = config.dataset.doi.startsWith('http') ? config.dataset.doi : `https://doi.org/${config.dataset.doi}`;
    if (doiText) doiText.innerHTML = `<i class="fa-solid fa-link"></i> DOI: ${cleanDoi}`;
    if (doiLink) doiLink.href = doiHref;
    if (footerDoi) footerDoi.href = doiHref;
  }

  const githubLink = document.getElementById('badge-github-link');
  const footerGithub = document.getElementById('footer-github-link');
  if (config.organization?.githubUrl) {
    if (githubLink) githubLink.href = config.organization.githubUrl;
    if (footerGithub) footerGithub.href = config.organization.githubUrl;
  }

  const footerIssues = document.getElementById('footer-issues-link');
  if (config.organization?.issuesUrl && footerIssues) {
    footerIssues.href = config.organization.issuesUrl;
  }
}

window.addEventListener('resize', debounce(() => {
  updateAllCharts();
}, 150));

function initToolbarControls() {
  const paletteSelect = document.getElementById('chart-theme-select');
  const typeSelect = document.getElementById('chart-type-select');

  if (paletteSelect) {
    paletteSelect.addEventListener('change', (e) => {
      currentPalette = e.target.value;
      updateAllCharts();
    });
  }

  if (typeSelect) {
    typeSelect.addEventListener('change', (e) => {
      currentChartType = e.target.value;
      updateAllCharts();
    });
  }
}

async function loadStatsDashboard() {
  if (!appConfig) return;
  const entity = appConfig.dataset?.entityName || 'articles';

  try {
    const res = await fetch(`/api/v1/${entity}/stats`);
    const stats = await res.json();

    // Populate Metrics Summary Cards
    const totalCount = stats.totalRecords || 0;
    const toolRate = `${stats.metrics?.toolAdoptionRate || 0}%`;
    const uniqueSources = stats.topLists?.topSources?.data?.length || 0;
    const uniqueAuthors = stats.topLists?.topAuthors?.data?.length || 0;

    const totalEl = document.getElementById('stat-total-articles');
    if (totalEl) totalEl.textContent = totalCount;
    const homeTotal = document.getElementById('home-stat-total');
    if (homeTotal) homeTotal.textContent = totalCount;

    const toolRateEl = document.getElementById('stat-tool-percentage');
    if (toolRateEl) toolRateEl.textContent = toolRate;
    const homeTool = document.getElementById('home-stat-tools');
    if (homeTool) homeTool.textContent = toolRate;

    const sourcesEl = document.getElementById('stat-unique-sources');
    if (sourcesEl) sourcesEl.textContent = uniqueSources;
    const homeSources = document.getElementById('home-stat-sources');
    if (homeSources) homeSources.textContent = uniqueSources;

    const authorsEl = document.getElementById('stat-unique-authors');
    if (authorsEl) authorsEl.textContent = uniqueAuthors;
    const homeAuthors = document.getElementById('home-stat-authors');
    if (homeAuthors) homeAuthors.textContent = uniqueAuthors;

    // Pareto Ratio Text
    const paretoEl = document.getElementById('stat-pareto-ratio');
    if (paretoEl && stats.pareto?.pareto80Index !== undefined) {
      paretoEl.textContent = `Top ${stats.pareto.pareto80Index + 1}`;
    }

    // Initialize 6 Chart Instances
    chartInstances['years'] = new SimpleChart('chart-years');
    chartInstances['tools'] = new SimpleChart('chart-tools');
    chartInstances['sources'] = new SimpleChart('chart-sources');
    chartInstances['stages'] = new SimpleChart('chart-stages');
    chartInstances['pareto'] = new SimpleChart('chart-pareto');
    chartInstances['temporal'] = new SimpleChart('chart-temporal');

    chartInstances['years_data'] = stats.breakdowns?.yearDistribution?.data;
    chartInstances['tools_data'] = stats.topLists?.topTools?.data;
    chartInstances['sources_data'] = stats.topLists?.topSources?.data;
    chartInstances['stages_data'] = stats.breakdowns?.stageBreakdown?.data;
    chartInstances['pareto_data'] = stats.pareto;
    chartInstances['temporal_data'] = stats.temporalStacked;

    updateAllCharts();
    populateSidebarOptions(stats);
  } catch (err) {
    console.error('⚠️ Erro ao carregar dashboard:', err);
  }
}

function updateAllCharts() {
  Object.keys(chartInstances).forEach(key => {
    if (key.endsWith('_data') || !chartInstances[key]) return;
    const chart = chartInstances[key];
    chart.setPalette(currentPalette);
    chart.setChartType(currentChartType);
    
    const data = chartInstances[`${key}_data`];
    if (!data) return;

    if (key === 'pareto') {
      chart.renderPareto(data);
    } else if (key === 'temporal') {
      chart.renderTemporalStacked(data);
    } else {
      chart.render(data);
    }
  });
}

function populateSidebarOptions(stats) {
  const yearContainer = document.getElementById('year-checkbox-list');
  if (yearContainer && stats.breakdowns?.yearDistribution?.data) {
    const years = Object.keys(stats.breakdowns.yearDistribution.data).sort((a, b) => b - a);
    yearContainer.innerHTML = '';

    years.forEach(yr => {
      const label = document.createElement('label');
      label.className = 'checkbox-item';
      label.innerHTML = `
        <input type="checkbox" class="year-filter-cb" value="${yr}" checked>
        <span>Edição ${yr}</span>
      `;
      label.querySelector('input').addEventListener('change', () => {
        currentOffset = 0;
        loadExplorerData();
      });
      yearContainer.appendChild(label);
    });
  }

  const toolSelect = document.getElementById('filter-tool');
  if (toolSelect && stats.topLists?.topTools?.data) {
    stats.topLists.topTools.data.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.name;
      opt.textContent = t.name;
      toolSelect.appendChild(opt);
    });
    toolSelect.addEventListener('change', () => { currentOffset = 0; loadExplorerData(); });
  }

  const sourceSelect = document.getElementById('filter-source');
  if (sourceSelect && stats.topLists?.topSources?.data) {
    stats.topLists.topSources.data.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.name;
      opt.textContent = s.name;
      sourceSelect.appendChild(opt);
    });
    sourceSelect.addEventListener('change', () => { currentOffset = 0; loadExplorerData(); });
  }

  const stageSelect = document.getElementById('filter-stage');
  if (stageSelect) {
    stageSelect.addEventListener('change', () => { currentOffset = 0; loadExplorerData(); });
  }

  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => { currentOffset = 0; loadExplorerData(); });
  }

  const sortDirBtn = document.getElementById('btn-sort-dir');
  if (sortDirBtn) {
    sortDirBtn.addEventListener('click', () => {
      currentSortDir = currentSortDir === 'asc' ? 'desc' : 'asc';
      sortDirBtn.innerHTML = currentSortDir === 'asc' ? '<i class="fa-solid fa-sort-amount-down"></i>' : '<i class="fa-solid fa-sort-amount-up"></i>';
      currentOffset = 0;
      loadExplorerData();
    });
  }
}

async function loadExplorerData() {
  if (!appConfig) return;
  const entity = appConfig.dataset?.entityName || 'articles';

  const params = new URLSearchParams();
  params.set('limit', currentLimit);
  params.set('offset', currentOffset);
  params.set('order', currentSortDir);

  const searchInput = document.getElementById('search-input');
  if (searchInput && searchInput.value) {
    params.set('search', searchInput.value);
  }

  const selectedYears = Array.from(document.querySelectorAll('.year-filter-cb:checked')).map(cb => cb.value);
  if (selectedYears.length > 0) {
    params.set('year', selectedYears.join(','));
  }

  const toolVal = document.getElementById('filter-tool')?.value;
  if (toolVal) params.set('tool', toolVal);

  const sourceVal = document.getElementById('filter-source')?.value;
  if (sourceVal) params.set('source', sourceVal);

  const stageVal = document.getElementById('filter-stage')?.value;
  if (stageVal) params.set('stage', stageVal);

  const hasToolCb = document.getElementById('filter-has-tool');
  if (hasToolCb && hasToolCb.checked) {
    params.set('has_tool', 'true');
  }

  const sortVal = document.getElementById('sort-select')?.value;
  if (sortVal) params.set('sort', sortVal);

  try {
    const res = await fetch(`/api/v1/${entity}?${params.toString()}`);
    const data = await res.json();

    renderArticleCards(data.results);
    renderPaginationInfo(data);
    updateExportLinks(params);
  } catch (err) {
    console.error('⚠️ Erro ao carregar explorador:', err);
  }
}

function renderArticleCards(items) {
  const container = document.getElementById('articles-list');
  if (!container) return;

  container.innerHTML = '';

  if (!items || items.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; color: var(--text-secondary); padding: 40px; background: var(--bg-surface); border-radius: var(--border-radius-lg); border: 1px solid var(--border-color); font-family: var(--font-mono);">
        Nenhum registro encontrado para os filtros selecionados.
      </div>
    `;
    return;
  }

  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'article-card';

    const year = item.year || item.ano || 'N/A';
    const doi = (item.doi && item.doi !== 'N/A') ? item.doi : (item.id && item.id !== 'N/A' ? item.id : '');
    const title = item.title || item.titulo || 'Sem título';
    const authors = Array.isArray(item.authors) ? item.authors.join(', ') : (item.authors || 'N/A');

    let badgesHtml = '';
    if (Array.isArray(item.data_sources)) {
      item.data_sources.forEach(src => {
        badgesHtml += `<span class="badge-source">${escapeHtml(src)}</span> `;
      });
    }

    if (Array.isArray(item.usage_stages)) {
      item.usage_stages.forEach(stg => {
        badgesHtml += `<span class="badge-stage">${escapeHtml(stg)}</span> `;
      });
    }

    if (Array.isArray(item.tools)) {
      item.tools.forEach(t => {
        badgesHtml += `<span class="badge-tool">${escapeHtml(t)}</span> `;
      });
    }

    const doiBadgeHtml = doi ? `<span class="doi-link-text">${escapeHtml(doi)}</span>` : '';

    card.innerHTML = `
      <div class="article-card-header">
        <span class="badge-year">${year}</span>
        ${doiBadgeHtml}
      </div>
      <h3 class="article-title">${escapeHtml(title)}</h3>
      <p class="article-authors">${escapeHtml(authors)}</p>
      <div class="badge-list">${badgesHtml}</div>
    `;

    card.addEventListener('click', () => openArticleModal(item));
    container.appendChild(card);
  });
  initChartExports();
}

let currentModalItem = null;
let currentCitationFmt = 'bibtex';

function openArticleModal(item) {
  currentModalItem = item;
  const modal = document.getElementById('article-modal');
  if (!modal) return;

  document.getElementById('modal-year').textContent = item.year || 'N/A';
  document.getElementById('modal-title').textContent = item.title || 'Sem título';
  document.getElementById('modal-authors').textContent = Array.isArray(item.authors) ? item.authors.join(', ') : (item.authors || 'N/A');
  document.getElementById('modal-abstract').textContent = item.abstract || 'Resumo não disponível para este registro.';

  const toolsEl = document.getElementById('modal-tools');
  if (toolsEl) {
    toolsEl.innerHTML = Array.isArray(item.tools) && item.tools.length > 0
      ? item.tools.map(t => `<span class="badge-tool">${escapeHtml(t)}</span>`).join(' ')
      : 'Nenhuma ferramenta identificada';
  }

  const sourcesEl = document.getElementById('modal-sources');
  if (sourcesEl) {
    sourcesEl.innerHTML = Array.isArray(item.data_sources) && item.data_sources.length > 0
      ? item.data_sources.map(s => `<span class="badge-source">${escapeHtml(s)}</span>`).join(' ')
      : 'N/A';
  }

  const doiLink = document.getElementById('modal-doi-link');
  if (doiLink && item.doi) {
    doiLink.href = item.doi.startsWith('http') ? item.doi : `https://doi.org/${item.doi}`;
  }

  updateCitationBox();
  modal.classList.add('active');
}

function updateCitationBox() {
  if (!currentModalItem) return;
  const item = currentModalItem;
  const citationEl = document.getElementById('citation-content');
  if (!citationEl) return;

  const authors = Array.isArray(item.authors) ? item.authors : (item.authors ? [item.authors] : ['Autor Desconhecido']);
  const year = item.year || '2024';
  const title = item.title || 'Sem título';
  const doi = item.doi || item.id || '';
  const doiUrl = doi.startsWith('http') ? doi : `https://doi.org/${doi}`;
  const doiKey = doi.replace(/[^a-zA-Z0-9]/g, '_');

  if (currentCitationFmt === 'bibtex') {
    citationEl.textContent = `@article{${doiKey || 'ebbc_' + year},\n  title     = {${title}},\n  author    = {${authors.join(' and ')}},\n  year      = {${year}},\n  publisher = {EBBC OpenData},\n  url       = {${doiUrl}}\n}`;
  } else if (currentCitationFmt === 'apa') {
    citationEl.textContent = `${authors.join(', ')} (${year}). ${title}. EBBC OpenData. ${doiUrl}`;
  } else if (currentCitationFmt === 'abnt') {
    const abntAuthors = authors.map(a => {
      const parts = a.trim().split(' ');
      const last = parts.pop().toUpperCase();
      return `${last}, ${parts.join(' ')}`;
    }).join('; ');
    citationEl.textContent = `${abntAuthors}. ${title}. EBBC OpenData, ${year}. Disponível em: <${doiUrl}>.`;
  }
}

function initModal() {
  const modal = document.getElementById('article-modal');
  const closeBtn = document.getElementById('btn-close-modal');

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }

  // Citation format tabs
  document.querySelectorAll('.citation-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.citation-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentCitationFmt = tab.getAttribute('data-fmt');
      updateCitationBox();
    });
  });

  const copyCitationBtn = document.getElementById('btn-copy-citation');
  if (copyCitationBtn) {
    copyCitationBtn.addEventListener('click', () => {
      const citationEl = document.getElementById('citation-content');
      if (citationEl) {
        navigator.clipboard.writeText(citationEl.textContent);
        copyCitationBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copiado!';
        setTimeout(() => copyCitationBtn.innerHTML = '<i class="fa-regular fa-copy"></i> Copiar Citação', 2000);
      }
    });
  }
}

function initChartExports() {
  document.querySelectorAll('.btn-chart-export').forEach(btn => {
    btn.addEventListener('click', () => {
      const chartKey = btn.getAttribute('data-chart');
      if (chartInstances[chartKey]) {
        chartInstances[chartKey].exportPNG(`grafico-${chartKey}.png`);
      }
    });
  });
}

function renderPaginationInfo(data) {
  const displayedCount = document.getElementById('displayed-count');
  const filteredCount = document.getElementById('filtered-count');
  const pageIndicator = document.getElementById('page-indicator');
  const prevBtn = document.getElementById('btn-prev');
  const nextBtn = document.getElementById('btn-next');

  const start = data.offset + 1;
  const end = Math.min(data.offset + data.limit, data.filteredCount);
  const totalPages = Math.ceil(data.filteredCount / currentLimit) || 1;
  const currentPage = Math.floor(data.offset / currentLimit) + 1;

  if (displayedCount) displayedCount.textContent = `${start}-${end}`;
  if (filteredCount) filteredCount.textContent = data.filteredCount;
  if (pageIndicator) pageIndicator.textContent = `Pág. ${currentPage} de ${totalPages}`;

  if (prevBtn) {
    prevBtn.disabled = data.offset <= 0;
    prevBtn.onclick = () => {
      if (currentOffset > 0) {
        currentOffset -= currentLimit;
        loadExplorerData();
      }
    };
  }

  if (nextBtn) {
    nextBtn.disabled = data.offset + data.limit >= data.filteredCount;
    nextBtn.onclick = () => {
      currentOffset += currentLimit;
      loadExplorerData();
    };
  }
}

function updateExportLinks(params) {
  if (!appConfig) return;
  const entity = appConfig.dataset?.entityName || 'articles';

  const exportParams = new URLSearchParams(params);
  exportParams.delete('limit');
  exportParams.delete('offset');

  const jsonBtn = document.getElementById('btn-export-json');
  if (jsonBtn) {
    exportParams.set('format', 'json');
    jsonBtn.href = `/api/v1/${entity}/export?${exportParams.toString()}`;
  }

  const csvBtn = document.getElementById('btn-export-csv');
  if (csvBtn) {
    exportParams.set('format', 'csv');
    csvBtn.href = `/api/v1/${entity}/export?${exportParams.toString()}`;
  }
}

async function loadCorrelations() {
  if (!appConfig) return;
  const entity = appConfig.dataset?.entityName || 'articles';

  try {
    const resMatrix = await fetch(`/api/v1/${entity}/stats/correlations`);
    const matrixData = await resMatrix.json();
    const heatmapChart = new SimpleChart('chart-heatmap-matrix');
    heatmapChart.renderHeatmapMatrix(matrixData);
    chartInstances['heatmap'] = heatmapChart;

    const resScatter = await fetch(`/api/v1/${entity}/stats/scatter`);
    const scatterData = await resScatter.json();
    const scatterChart = new SimpleChart('chart-scatter-plot');
    scatterChart.renderScatterPlot(scatterData);
    chartInstances['scatter'] = scatterChart;
  } catch (err) {
    console.error('⚠️ Erro ao carregar correlações:', err);
  }
}

function initSandbox() {
  const executeBtn = document.getElementById('btn-execute-api');
  const endpointSelect = document.getElementById('playground-endpoint-select');
  const badgeEl = document.getElementById('playground-status-badge');
  const codeEl = document.getElementById('sandbox-code');

  if (executeBtn && endpointSelect) {
    executeBtn.addEventListener('click', async () => {
      const path = endpointSelect.value;
      const t0 = performance.now();
      executeBtn.disabled = true;
      executeBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Executando...';

      try {
        const res = await fetch(path);
        const t1 = performance.now();
        const latency = Math.round(t1 - t0);
        const data = await res.json();

        if (badgeEl) {
          badgeEl.className = 'playground-status';
          badgeEl.innerHTML = `<i class="fa-solid fa-circle-check"></i> HTTP ${res.status} OK (${latency}ms)`;
        }

        if (codeEl) {
          codeEl.textContent = JSON.stringify(data, null, 2);
        }
      } catch (err) {
        if (badgeEl) {
          badgeEl.className = 'playground-status error';
          badgeEl.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> Erro na Requisição`;
        }
        if (codeEl) {
          codeEl.textContent = `// Erro ao conectar à API:\n${err.message}`;
        }
      } finally {
        executeBtn.disabled = false;
        executeBtn.innerHTML = '<i class="fa-solid fa-play"></i> Executar Requisição';
      }
    });
  }

  const langSelect = document.getElementById('sandbox-lang');
  if (langSelect) {
    langSelect.addEventListener('change', updateSandboxCode);
  }

  const copyBtn = document.getElementById('sandbox-copy-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const textToCopy = codeEl ? codeEl.textContent : '';
      if (textToCopy) {
        navigator.clipboard.writeText(textToCopy);
        copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copiado!';
        setTimeout(() => copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i> Copiar Código', 2000);
      }
    });
  }

  const docLinks = document.querySelectorAll('.docs-menu-link');
  docLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetDocId = link.getAttribute('data-doc');
      
      docLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      document.querySelectorAll('.doc-card').forEach(card => card.classList.remove('active'));
      document.getElementById(targetDocId)?.classList.add('active');
    });
  });

  updateSandboxCode();
}

function updateSandboxCode() {
  if (!appConfig) return;
  const entity = appConfig.dataset?.entityName || 'articles';
  const baseUrl = window.location.origin;

  const lang = document.getElementById('sandbox-lang')?.value || 'curl';
  const targetUrl = `${baseUrl}/api/v1/${entity}?limit=10`;

  const codeEl = document.getElementById('sandbox-code');
  if (!codeEl) return;

  if (lang === 'curl') {
    codeEl.textContent = `curl -X GET "${targetUrl}" \\\n  -H "Accept: application/json"`;
  } else if (lang === 'javascript') {
    codeEl.textContent = `// Requisição em JavaScript (Fetch API)\nfetch("${targetUrl}")\n  .then(response => response.json())\n  .then(data => console.log(data));`;
  } else if (lang === 'python') {
    codeEl.textContent = `# Requisição em Python (Requests)\nimport requests\n\nurl = "${targetUrl}"\nresponse = requests.get(url)\ndata = response.json()\nprint(data)`;
  } else if (lang === 'node') {
    codeEl.textContent = `// Requisição em Node.js (Axios)\nconst axios = require('axios');\n\naxios.get("${targetUrl}")\n  .then(response => console.log(response.data))\n  .catch(error => console.error(error));`;
  } else if (lang === 'r') {
    codeEl.textContent = `# Requisição em R (httr & jsonlite)\nlibrary(httr)\nlibrary(jsonlite)\n\nres <- GET("${targetUrl}")\ndata <- fromJSON(content(res, "text"))\nprint(data)`;
  }
}

function switchTab(tabId) {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabBtns.forEach(b => {
    if (b.getAttribute('data-tab') === tabId) {
      b.classList.add('active');
    } else {
      b.classList.remove('active');
    }
  });

  tabPanels.forEach(p => {
    if (p.id === tabId) {
      p.classList.add('active');
    } else {
      p.classList.remove('active');
    }
  });

  if (tabId === 'dashboard-tab' || tabId === 'home-tab') {
    setTimeout(() => {
      updateAllCharts();
    }, 50);
  } else if (tabId === 'correlations-tab') {
    setTimeout(() => {
      loadCorrelations();
    }, 50);
  }
}

function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab');
      switchTab(target);
    });
  });

  const btnHeroExplore = document.getElementById('btn-hero-explore');
  if (btnHeroExplore) {
    btnHeroExplore.addEventListener('click', () => switchTab('explorer-tab'));
  }

  const btnHeroStats = document.getElementById('btn-hero-stats');
  if (btnHeroStats) {
    btnHeroStats.addEventListener('click', () => switchTab('dashboard-tab'));
  }

  const topSearchInput = document.getElementById('top-quick-search');
  const searchInput = document.getElementById('search-input');

  if (topSearchInput) {
    topSearchInput.addEventListener('input', debounce(() => {
      const val = topSearchInput.value;
      if (searchInput) searchInput.value = val;
      switchTab('explorer-tab');
      currentOffset = 0;
      loadExplorerData();
    }, 300));
  }

  if (searchInput) {
    searchInput.addEventListener('input', debounce(() => {
      if (topSearchInput) topSearchInput.value = searchInput.value;
      currentOffset = 0;
      loadExplorerData();
    }, 300));
  }

  const clearBtn = document.getElementById('btn-clear-filters');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (topSearchInput) topSearchInput.value = '';
      document.querySelectorAll('.year-filter-cb').forEach(cb => cb.checked = true);
      const toolSelect = document.getElementById('filter-tool');
      if (toolSelect) toolSelect.value = '';
      const sourceSelect = document.getElementById('filter-source');
      if (sourceSelect) sourceSelect.value = '';
      const stageSelect = document.getElementById('filter-stage');
      if (stageSelect) stageSelect.value = '';
      const hasToolCb = document.getElementById('filter-has-tool');
      if (hasToolCb) hasToolCb.checked = false;

      currentOffset = 0;
      loadExplorerData();
    });
  }
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
