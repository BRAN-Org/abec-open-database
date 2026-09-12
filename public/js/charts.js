/**
 * Componente de Gráficos Leves em Canvas HTML5 (Zero-Dependency)
 * Visual OS inspirado em simeon.sh com fonte Geist & Geist Mono.
 * Suporta alternância de paletas (Simeon, Apple, Monocromático, Neon, Pastel) e tipos de gráfico (Barras, Linhas, Radar, Pareto, Empilhado).
 */
export class SimpleChart {
  constructor(canvasId) {
    this.canvas = typeof canvasId === 'string' ? document.getElementById(canvasId) : canvasId;
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.palette = 'simeon';
    this.chartType = 'bar';
  }

  setPalette(paletteName) {
    this.palette = paletteName || 'simeon';
  }

  setChartType(type) {
    this.chartType = type || 'bar';
  }

  getPaletteColors() {
    switch (this.palette) {
      case 'neon':
        return ['#00f0ff', '#ff007f', '#00ff66', '#ff00ff', '#ffff00'];
      case 'pastel':
        return ['#a7f3d0', '#fef08a', '#fbcfe8', '#bae6fd', '#c084fc'];
      case 'monochrome':
        return ['#ffffff', '#d4d4d4', '#a3a3a3', '#737373', '#525252'];
      case 'apple':
        return ['#ffffff', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
      case 'simeon':
      default:
        return ['#ffffff', '#3064ff', '#30d158', '#ff9f0a', '#fe257f', '#b59aff'];
    }
  }

  setupCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const parent = this.canvas.parentElement;

    let width = parent ? parent.clientWidth : this.canvas.getBoundingClientRect().width;
    let height = parent ? parent.clientHeight : this.canvas.getBoundingClientRect().height;

    if (!width || width <= 0) width = 400;
    if (!height || height <= 0) height = 260;

    this.canvas.width = Math.floor(width * dpr);
    this.canvas.height = Math.floor(height * dpr);
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    if (typeof this.ctx.resetTransform === 'function') {
      this.ctx.resetTransform();
    } else {
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    this.ctx.scale(dpr, dpr);
    return { width, height };
  }

  render(data, labelKey = 'name', valueKey = 'count') {
    if (!this.ctx || !data) return;

    if (this.chartType === 'radar') {
      this.renderRadarChart(data, labelKey, valueKey);
    } else if (this.chartType === 'line') {
      this.renderLineChart(data, labelKey, valueKey);
    } else {
      this.renderBarChart(data, labelKey, valueKey);
    }
  }

  renderBarChart(data, labelKey = 'name', valueKey = 'count') {
    const { ctx } = this;
    const { width, height } = this.setupCanvas();
    ctx.clearRect(0, 0, width, height);

    const items = Array.isArray(data) ? data : Object.entries(data).map(([name, count]) => ({ name, count }));
    if (items.length === 0) return;

    const colors = this.getPaletteColors();
    const maxVal = Math.max(...items.map(d => d[valueKey] || d.count || 0), 1);
    const barHeight = Math.min(24, Math.floor((height - 20) / items.length - 6));
    const startX = Math.min(130, Math.floor(width * 0.28));
    const rightMargin = 45;
    const chartWidth = Math.max(width - startX - rightMargin, 50);

    items.forEach((item, index) => {
      const label = String(item[labelKey] || item.name || '');
      const val = item[valueKey] ?? item.count ?? 0;
      const y = 10 + index * (barHeight + 6);
      const barW = Math.min((val / maxVal) * chartWidth, chartWidth);

      // Label
      ctx.fillStyle = '#8a9390';
      ctx.font = '500 11px "Geist Mono", monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      const truncatedLabel = label.length > 16 ? label.substring(0, 14) + '..' : label;
      ctx.fillText(truncatedLabel, startX - 8, y + barHeight / 2);

      // Track
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      this.drawRoundedRect(startX, y, chartWidth, barHeight, 4);
      ctx.fill();

      // Bar Fill
      ctx.fillStyle = colors[index % colors.length];
      if (barW > 0) {
        this.drawRoundedRect(startX, y, Math.max(barW, 4), barHeight, 4);
        ctx.fill();
      }

      // Value text
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 11px "Geist Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(String(val), startX + barW + 6, y + barHeight / 2);
    });
  }

  renderLineChart(data, labelKey = 'name', valueKey = 'count') {
    const { ctx } = this;
    const { width, height } = this.setupCanvas();
    ctx.clearRect(0, 0, width, height);

    const items = Array.isArray(data) ? data : Object.entries(data).map(([name, count]) => ({ name, count }));
    if (items.length === 0) return;

    const colors = this.getPaletteColors();
    const padding = 40;
    const chartW = Math.max(width - padding * 2, 50);
    const chartH = Math.max(height - padding * 2, 50);
    const maxVal = Math.max(...items.map(d => d[valueKey] || d.count || 0), 1);

    ctx.beginPath();
    ctx.strokeStyle = colors[0];
    ctx.lineWidth = 3;

    const points = [];
    items.forEach((item, idx) => {
      const label = item[labelKey] || item.name || '';
      const val = item[valueKey] ?? item.count ?? 0;
      const x = padding + (idx / (items.length - 1 || 1)) * chartW;
      const y = height - padding - (val / maxVal) * chartH;
      points.push({ x, y, label, val });
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    points.forEach(p => {
      ctx.fillStyle = colors[1] || colors[0];
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#8a9390';
      ctx.font = '500 11px "Geist Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(String(p.label), p.x, height - 15);
      ctx.fillText(String(p.val), p.x, p.y - 10);
    });
  }

  renderRadarChart(data, labelKey = 'name', valueKey = 'count') {
    const { ctx } = this;
    const { width, height } = this.setupCanvas();
    ctx.clearRect(0, 0, width, height);

    const items = Array.isArray(data) ? data : Object.entries(data).map(([name, count]) => ({ name, count }));
    if (items.length === 0) return;

    const colors = this.getPaletteColors();
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.max(Math.min(centerX, centerY) - 35, 20);
    const total = items.length;
    const maxVal = Math.max(...items.map(d => d[valueKey] || d.count || 0), 1);

    // Grid circles
    for (let r = 1; r <= 3; r++) {
      const rad = (radius / 3) * r;
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.arc(centerX, centerY, rad, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Points
    const points = [];
    items.forEach((item, i) => {
      const angle = (Math.PI * 2 / total) * i - Math.PI / 2;
      const val = item[valueKey] ?? item.count ?? 0;
      const dist = (val / maxVal) * radius;
      const x = centerX + Math.cos(angle) * dist;
      const y = centerY + Math.sin(angle) * dist;
      points.push({ x, y, label: item[labelKey] || item.name, angle, dist });
    });

    // Polygon
    ctx.beginPath();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.strokeStyle = colors[0];
    ctx.lineWidth = 2;

    points.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Labels
    points.forEach(p => {
      const lx = centerX + Math.cos(p.angle) * (radius + 18);
      const ly = centerY + Math.sin(p.angle) * (radius + 18);
      ctx.fillStyle = '#8a9390';
      ctx.font = '500 11px "Geist Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(p.label).substring(0, 10), lx, ly);
    });
  }

  renderPareto(data) {
    const items = data?.items || data?.data;
    if (!this.ctx || !data || !items || items.length === 0) return;
    const { ctx } = this;
    const { width, height } = this.setupCanvas();
    ctx.clearRect(0, 0, width, height);

    const paddingLeft = 50;
    const paddingRight = 50;
    const paddingTop = 30;
    const paddingBottom = 40;

    const chartW = Math.max(width - paddingLeft - paddingRight, 50);
    const chartH = Math.max(height - paddingTop - paddingBottom, 50);
    const maxVal = Math.max(...items.map(d => d.count), 1);

    const barW = (chartW / items.length) * 0.55;
    const colors = this.getPaletteColors();

    // Bar chart (Individual counts)
    items.forEach((item, i) => {
      const x = paddingLeft + (i / items.length) * chartW + (chartW / items.length - barW) / 2;
      const barH = (item.count / maxVal) * chartH;
      const y = height - paddingBottom - barH;

      ctx.fillStyle = colors[i % colors.length];
      this.drawRoundedRect(x, y, barW, barH, 4);
      ctx.fill();

      // Label
      ctx.fillStyle = '#8a9390';
      ctx.font = '500 10px "Geist Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(item.name.substring(0, 8), x + barW / 2, height - paddingBottom + 16);
    });

    // Cumulative line
    ctx.beginPath();
    ctx.strokeStyle = '#fe257f';
    ctx.lineWidth = 2.5;

    items.forEach((item, i) => {
      const x = paddingLeft + (i / items.length) * chartW + (chartW / items.length) / 2;
      const pct = item.cumulativePercentage ?? item.cumulativePercent ?? 0;
      const y = height - paddingBottom - (pct / 100) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // 80% line
    const y80 = height - paddingBottom - 0.8 * chartH;
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.moveTo(paddingLeft, y80);
    ctx.lineTo(width - paddingRight, y80);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#fe257f';
    ctx.font = '600 10px "Geist Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText('80% Pareto', width - paddingRight, y80 - 6);
  }

  renderTemporalStacked(data) {
    if (!this.ctx || !data || !data.years || !data.series) return;
    const { ctx } = this;
    const { width, height } = this.setupCanvas();
    ctx.clearRect(0, 0, width, height);

    const { years, series } = data;
    if (years.length === 0 || series.length === 0) return;

    const paddingLeft = 50;
    const paddingRight = 20;
    const paddingTop = 30;
    const paddingBottom = 40;

    const chartW = Math.max(width - paddingLeft - paddingRight, 50);
    const chartH = Math.max(height - paddingTop - paddingBottom, 50);
    const colors = this.getPaletteColors();

    const getValue = (item) => {
      if (typeof item === 'number') return item;
      if (item && typeof item === 'object') return item.count ?? item.percentage ?? 0;
      return 0;
    };

    const yearlyTotals = years.map((_, yIdx) => {
      return series.reduce((sum, s) => sum + getValue(s.data[yIdx]), 0);
    });
    const maxVal = Math.max(...yearlyTotals, 1);

    const groupW = chartW / years.length;
    const barW = groupW * 0.6;

    years.forEach((yr, yIdx) => {
      let currentY = height - paddingBottom;
      const x = paddingLeft + yIdx * groupW + (groupW - barW) / 2;

      series.forEach((s, sIdx) => {
        const val = getValue(s.data[yIdx]);
        const sliceH = (val / maxVal) * chartH;
        currentY -= sliceH;

        if (sliceH > 0) {
          ctx.fillStyle = colors[sIdx % colors.length];
          this.drawRoundedRect(x, currentY, barW, sliceH, 2);
          ctx.fill();
        }
      });

      // Year Label
      ctx.fillStyle = '#8a9390';
      ctx.font = '500 11px "Geist Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(String(yr), x + barW / 2, height - paddingBottom + 18);
    });
  }

  renderHeatmapMatrix(data) {
    if (!this.ctx || !data || !data.rows || !data.cols) return;
    const { ctx } = this;
    const { width, height } = this.setupCanvas();
    ctx.clearRect(0, 0, width, height);

    const { rows, cols, matrix } = data;
    if (rows.length === 0 || cols.length === 0) return;

    const startX = 120;
    const startY = 40;
    const cellW = (width - startX - 20) / cols.length;
    const cellH = (height - startY - 20) / rows.length;

    let maxVal = 1;
    rows.forEach(r => cols.forEach(c => { if (matrix[r][c] > maxVal) maxVal = matrix[r][c]; }));

    cols.forEach((col, j) => {
      ctx.fillStyle = '#8a9390';
      ctx.font = '600 11px "Geist Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(col.substring(0, 10), startX + j * cellW + cellW / 2, startY - 12);
    });

    rows.forEach((row, i) => {
      ctx.fillStyle = '#8a9390';
      ctx.font = '600 11px "Geist Mono", monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(row.substring(0, 14), startX - 10, startY + i * cellH + cellH / 2);

      cols.forEach((col, j) => {
        const count = matrix[row][col] || 0;
        const alpha = Math.max(0.06, count / maxVal);
        
        ctx.fillStyle = `rgba(48, 209, 88, ${alpha})`;
        this.drawRoundedRect(startX + j * cellW + 2, startY + i * cellH + 2, cellW - 4, cellH - 4, 4);
        ctx.fill();

        if (count > 0) {
          ctx.fillStyle = count / maxVal > 0.5 ? '#ffffff' : '#8a9390';
          ctx.font = '700 12px "Geist Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillText(String(count), startX + j * cellW + cellW / 2, startY + i * cellH + cellH / 2);
        }
      });
    });
  }

  renderScatterPlot(data) {
    if (!this.ctx || !data || !data.points) return;
    const { ctx } = this;
    const { width, height } = this.setupCanvas();
    ctx.clearRect(0, 0, width, height);

    const padding = 45;
    const chartW = Math.max(width - padding * 2, 50);
    const chartH = Math.max(height - padding * 2, 50);
    const points = data.points;
    if (points.length === 0) return;

    const maxX = Math.max(...points.map(p => p.x), 5);
    const maxY = Math.max(...points.map(p => p.y), 5);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    points.forEach(p => {
      const cx = padding + (p.x / maxX) * chartW;
      const cy = height - padding - (p.y / maxY) * chartH;

      ctx.fillStyle = 'rgba(48, 100, 255, 0.7)';
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
    });

    if (data.slope !== undefined && data.intercept !== undefined) {
      const x1 = 0;
      const y1 = data.intercept;
      const x2 = maxX;
      const y2 = data.slope * maxX + data.intercept;

      const px1 = padding + (x1 / maxX) * chartW;
      const py1 = height - padding - Math.min(Math.max(y1, 0), maxY) / maxY * chartH;
      const px2 = padding + (x2 / maxX) * chartW;
      const py2 = height - padding - Math.min(Math.max(y2, 0), maxY) / maxY * chartH;

      ctx.strokeStyle = '#30d158';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(px1, py1);
      ctx.lineTo(px2, py2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  exportPNG(filename = 'grafico-estatistico.png') {
    if (!this.canvas) return;
    const link = document.createElement('a');
    link.download = filename;
    link.href = this.canvas.toDataURL('image/png');
    link.click();
  }

  drawRoundedRect(x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    const { ctx } = this;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
}
