// ─── AdBroker — Ad Exchange & Campaign Management ─────────────────
// ─── Background Canvas (particle network) ──────────────────────────

const bgCanvas = document.getElementById('bgCanvas');
const bgCtx = bgCanvas.getContext('2d');
let bgW, bgH;

function resizeBg() {
  bgW = bgCanvas.width = window.innerWidth;
  bgH = bgCanvas.height = window.innerHeight;
}
resizeBg();
window.addEventListener('resize', resizeBg);

class BgParticle {
  constructor() {
    this.reset();
  }
  reset() {
    this.x = Math.random() * bgW;
    this.y = Math.random() * bgH;
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = (Math.random() - 0.5) * 0.3;
    this.radius = Math.random() * 1.5 + 0.5;
    this.opacity = Math.random() * 0.3 + 0.1;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > bgW) this.vx *= -1;
    if (this.y < 0 || this.y > bgH) this.vy *= -1;
  }
  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(108, 92, 231, ${this.opacity})`;
    ctx.fill();
  }
}

const bgParticles = Array.from({ length: 60 }, () => new BgParticle());

function drawBgConnections() {
  for (let i = 0; i < bgParticles.length; i++) {
    for (let j = i + 1; j < bgParticles.length; j++) {
      const dx = bgParticles[i].x - bgParticles[j].x;
      const dy = bgParticles[i].y - bgParticles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 150) {
        bgCtx.beginPath();
        bgCtx.moveTo(bgParticles[i].x, bgParticles[i].y);
        bgCtx.lineTo(bgParticles[j].x, bgParticles[j].y);
        bgCtx.strokeStyle = `rgba(108, 92, 231, ${(1 - dist / 150) * 0.08})`;
        bgCtx.lineWidth = 0.5;
        bgCtx.stroke();
      }
    }
  }
}

function animateBg() {
  bgCtx.clearRect(0, 0, bgW, bgH);
  for (const p of bgParticles) {
    p.update();
    p.draw(bgCtx);
  }
  drawBgConnections();
  requestAnimationFrame(animateBg);
}
animateBg();

// ─── Mock Data ─────────────────────────────────────────────────────

const MOCK_DATA = {
  campaigns: [
    {
      id: 1, name: 'Summer Sale 2026', type: 'banner', status: 'active',
      impressions: 2840000, clicks: 68200, spend: 12580, budget: 25000,
      dailyCap: 1000, startDate: '2026-06-01', endDate: '2026-08-31',
      description: 'Q3 summer promotion campaign targeting warm climates'
    },
    {
      id: 2, name: 'Mobile App Install', type: 'native', status: 'active',
      impressions: 1860000, clicks: 44500, spend: 8900, budget: 15000,
      dailyCap: 600, startDate: '2026-05-15', endDate: '2026-07-15',
      description: 'Cross-platform mobile app install campaign'
    },
    {
      id: 3, name: 'Brand Awareness Q3', type: 'video', status: 'paused',
      impressions: 920000, clicks: 12300, spend: 8400, budget: 30000,
      dailyCap: 1500, startDate: '2026-07-01', endDate: '2026-09-30',
      description: 'Premium video placements on news sites'
    },
    {
      id: 4, name: 'Retargeting Pool', type: 'banner', status: 'active',
      impressions: 3200000, clicks: 89600, spend: 14500, budget: 20000,
      dailyCap: 800, startDate: '2026-04-01', endDate: '2026-12-31',
      description: 'Site retargeting across display network'
    },
    {
      id: 5, name: 'Holiday Special', type: 'interstitial', status: 'draft',
      impressions: 0, clicks: 0, spend: 0, budget: 10000,
      dailyCap: 500, startDate: '2026-11-15', endDate: '2026-12-31',
      description: 'End-of-year holiday interstitial campaign'
    },
    {
      id: 6, name: 'Product Launch', type: 'video', status: 'completed',
      impressions: 4500000, clicks: 112000, spend: 22000, budget: 22000,
      dailyCap: 2000, startDate: '2026-01-15', endDate: '2026-03-15',
      description: 'New product line video campaign'
    },
    {
      id: 7, name: 'Newsletter Signup', type: 'native', status: 'active',
      impressions: 1450000, clicks: 52100, spend: 3200, budget: 8000,
      dailyCap: 300, startDate: '2026-06-15', endDate: '2026-08-15',
      description: 'Lead generation campaign for newsletter'
    },
    {
      id: 8, name: 'Geo-Targeted Local', type: 'banner', status: 'paused',
      impressions: 560000, clicks: 14800, spend: 2800, budget: 6000,
      dailyCap: 200, startDate: '2026-05-01', endDate: '2026-06-30',
      description: 'Local business geo-targeted display campaign'
    },
  ],
  inventory: [
    { id: 1, name: 'TechCrunch Leaderboard', type: 'banner', size: '728x90', ecpm: 4.20, fillRate: 96.5, status: 'active', publisher: 'TechCrunch' },
    { id: 2, name: 'Medium Native Feed', type: 'native', size: 'responsive', ecpm: 3.85, fillRate: 92.1, status: 'active', publisher: 'Medium' },
    { id: 3, name: 'YouTube Pre-Roll', type: 'video', size: '1920x1080', ecpm: 8.50, fillRate: 88.4, status: 'active', publisher: 'YouTube' },
    { id: 4, name: 'CNN Interstitial', type: 'interstitial', size: 'fullscreen', ecpm: 6.75, fillRate: 91.2, status: 'active', publisher: 'CNN' },
    { id: 5, name: 'Reddit Sidebar', type: 'banner', size: '300x250', ecpm: 2.95, fillRate: 94.8, status: 'active', publisher: 'Reddit' },
    { id: 6, name: 'Spotify Audio', type: 'native', size: 'audio', ecpm: 5.20, fillRate: 86.3, status: 'inactive', publisher: 'Spotify' },
    { id: 7, name: 'NYT Mid-Article', type: 'native', size: 'responsive', ecpm: 7.10, fillRate: 95.0, status: 'active', publisher: 'NYTimes' },
    { id: 8, name: 'Twitch Mid-Roll', type: 'video', size: '1920x1080', ecpm: 4.80, fillRate: 79.6, status: 'active', publisher: 'Twitch' },
    { id: 9, name: 'Instagram Story', type: 'interstitial', size: '1080x1920', ecpm: 9.20, fillRate: 97.1, status: 'active', publisher: 'Instagram' },
    { id: 10, name: 'Discord Banner', type: 'banner', size: '728x90', ecpm: 1.50, fillRate: 99.0, status: 'inactive', publisher: 'Discord' },
  ],
  publishers: [
    { id: 1, name: 'TechCrunch', domain: 'techcrunch.com', revenue: 12800, impressions: 3200000, fillRate: 96.5, color: '#e74c3c' },
    { id: 2, name: 'Medium', domain: 'medium.com', revenue: 9600, impressions: 2800000, fillRate: 92.1, color: '#2ecc71' },
    { id: 3, name: 'CNN', domain: 'cnn.com', revenue: 15400, impressions: 5100000, fillRate: 91.2, color: '#3498db' },
    { id: 4, name: 'Reddit', domain: 'reddit.com', revenue: 5200, impressions: 1800000, fillRate: 94.8, color: '#f39c12' },
    { id: 5, name: 'NYTimes', domain: 'nytimes.com', revenue: 11000, impressions: 2900000, fillRate: 95.0, color: '#9b59b6' },
    { id: 6, name: 'Instagram', domain: 'instagram.com', revenue: 18200, impressions: 6400000, fillRate: 97.1, color: '#e84393' },
    { id: 7, name: 'Twitch', domain: 'twitch.tv', revenue: 7200, impressions: 2100000, fillRate: 79.6, color: '#6c5ce7' },
    { id: 8, name: 'YouTube', domain: 'youtube.com', revenue: 20500, impressions: 7200000, fillRate: 88.4, color: '#fd79a8' },
  ],
  geoData: [
    { country: 'US', flag: '🇺🇸', percentage: 34, value: 16400 },
    { country: 'UK', flag: '🇬🇧', percentage: 12, value: 5800 },
    { country: 'Germany', flag: '🇩🇪', percentage: 10, value: 4800 },
    { country: 'Canada', flag: '🇨🇦', percentage: 8, value: 3850 },
    { country: 'Australia', flag: '🇦🇺', percentage: 6, value: 2900 },
    { country: 'France', flag: '🇫🇷', percentage: 5, value: 2400 },
    { country: 'Japan', flag: '🇯🇵', percentage: 4, value: 1920 },
    { country: 'Brazil', flag: '🇧🇷', percentage: 3, value: 1440 },
  ],
  deviceData: [
    { label: 'Desktop', percentage: 42, color: '#6c5ce7' },
    { label: 'Mobile', percentage: 45, color: '#a29bfe' },
    { label: 'Tablet', percentage: 13, color: '#74b9ff' },
  ],
  activityFeed: [
    { icon: '💰', text: 'Campaign <strong>Summer Sale 2026</strong> reached 50% budget', time: '2 min ago' },
    { icon: '📈', text: 'New high CTR of <strong>3.2%</strong> on Retargeting Pool', time: '15 min ago' },
    { icon: '🔄', text: 'Inventory <strong>Reddit Sidebar</strong> fill rate updated to 94.8%', time: '1 hr ago' },
    { icon: '➕', text: 'Publisher <strong>Instagram</strong> added to network', time: '3 hr ago' },
    { icon: '⚠️', text: 'Budget alert: <strong>Brand Awareness Q3</strong> approaching daily cap', time: '5 hr ago' },
    { icon: '✅', text: 'Campaign <strong>Product Launch</strong> completed successfully', time: '1 day ago' },
    { icon: '📊', text: 'Daily report generated — <strong>$1,892</strong> earned today', time: '1 day ago' },
    { icon: '🔗', text: 'Integration: <strong>RTB endpoint</strong> connected successfully', time: '2 days ago' },
  ]
};

// ─── Chart Utilities ───────────────────────────────────────────────

function generateChartData(days) {
  const data = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    data.push({
      label,
      value: Math.floor(Math.random() * 8000 + 2000) + i * 50,
    });
  }
  return data;
}

function drawLineChart(canvas, datasets, options = {}) {
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.parentElement.getBoundingClientRect();
  const W = canvas.parentElement.clientWidth - 24;
  const H = canvas.parentElement.clientHeight - 20;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';
  ctx.scale(dpr, dpr);

  const pad = { top: 10, right: 10, bottom: 22, left: 45 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;

  ctx.clearRect(0, 0, W, H);

  if (!datasets || datasets.length === 0 || !datasets[0].data.length) return;

  const allValues = datasets.flatMap(ds => ds.data.map(d => d.value));
  const maxVal = Math.max(...allValues, 1);
  const minVal = 0;
  const range = maxVal - minVal || 1;
  const len = datasets[0].data.length;

  const xStep = len > 1 ? chartW / (len - 1) : 0;

  // Grid lines
  const gridCount = 4;
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= gridCount; i++) {
    const y = pad.top + (chartH / gridCount) * i;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(pad.left + chartW, y);
    ctx.stroke();

    // Y-axis labels
    const val = maxVal - (range / gridCount) * i;
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(formatNumber(val), pad.left - 5, y + 3);
  }

  // Draw datasets
  datasets.forEach((ds, di) => {
    const color = ds.color || '#6c5ce7';
    const isFilled = ds.fill !== false;

    // Area fill
    if (isFilled) {
      ctx.beginPath();
      ctx.moveTo(pad.left, pad.top + chartH);
      for (let i = 0; i < len; i++) {
        const x = i === 0 ? pad.left : pad.left + xStep * i;
        const yRatio = (ds.data[i].value - minVal) / range;
        const y = pad.top + chartH - yRatio * chartH;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(pad.left + chartW, pad.top + chartH);
      ctx.closePath();
      const gradient = ctx.createLinearGradient(0, pad.top, 0, pad.top + chartH);
      gradient.addColorStop(0, `${color}20`);
      gradient.addColorStop(1, `${color}02`);
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    // Line
    ctx.beginPath();
    for (let i = 0; i < len; i++) {
      const x = i === 0 ? pad.left : pad.left + xStep * i;
      const yRatio = (ds.data[i].value - minVal) / range;
      const y = pad.top + chartH - yRatio * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Points (faded)
    for (let i = 0; i < len; i++) {
      const x = i === 0 ? pad.left : pad.left + xStep * i;
      const yRatio = (ds.data[i].value - minVal) / range;
      const y = pad.top + chartH - yRatio * chartH;
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }
  });

  // X-axis labels
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.font = '9px Inter, sans-serif';
  ctx.textAlign = 'center';
  const labelStep = Math.max(1, Math.floor(len / 6));
  for (let i = 0; i < len; i += labelStep) {
    const x = i === 0 ? pad.left : pad.left + xStep * i;
    ctx.fillText(datasets[0].data[i].label, x, pad.top + chartH + 15);
  }
}

function drawDoughnutChart(canvas, data) {
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const size = Math.min(canvas.parentElement.clientWidth - 24, 180);
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width = size + 'px';
  canvas.style.height = size + 'px';
  ctx.scale(dpr, dpr);

  ctx.clearRect(0, 0, size, size);

  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 10;
  const innerR = outerR * 0.55;

  const total = data.reduce((s, d) => s + d.percentage, 0);
  let startAngle = -Math.PI / 2;

  data.forEach(item => {
    const sliceAngle = (item.percentage / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(cx, cy, outerR, startAngle, startAngle + sliceAngle);
    ctx.arc(cx, cy, innerR, startAngle + sliceAngle, startAngle, true);
    ctx.closePath();
    ctx.fillStyle = item.color;
    ctx.fill();
    startAngle += sliceAngle;
  });

  // Center text
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = 'bold 14px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${data[0].percentage}%`, cx, cy - 4);
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.font = '9px Inter, sans-serif';
  ctx.fillText(data[0].label, cx, cy + 14);

  // Legend
  const legendY = size + 8;
  ctx.textBaseline = 'top';
  let lx = 0;
  data.forEach((item, i) => {
    const label = `${item.label} ${item.percentage}%`;
    ctx.font = '10px Inter, sans-serif';
    const tw = ctx.measureText(label).width;
    if (lx + tw + 20 > size) lx = 0;
    ctx.fillStyle = item.color;
    ctx.fillRect(lx, legendY, 8, 8);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.textAlign = 'left';
    ctx.fillText(label, lx + 12, legendY);
    lx += tw + 20;
  });
}

function formatNumber(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toFixed(0);
}

function formatCurrency(n) {
  if (n >= 1000) return '$' + (n / 1000).toFixed(1) + 'K';
  return '$' + n.toFixed(0);
}

function formatCTR(clicks, impressions) {
  if (!impressions) return '0%';
  return ((clicks / impressions) * 100).toFixed(2) + '%';
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

// ─── Chart Instances ───────────────────────────────────────────────

let revenueData30 = generateChartData(30);
let impressionData30 = generateChartData(30);
let clickData30 = generateChartData(30);
let analyticsData = generateChartData(30);

function renderRevenueChart() {
  const canvas = document.getElementById('revenueChart');
  if (!canvas) return;
  drawLineChart(canvas, [
    { data: revenueData30, color: '#6c5ce7', fill: true }
  ]);
}

function renderImpressionChart() {
  const canvas = document.getElementById('impressionChart');
  if (!canvas) return;
  drawLineChart(canvas, [
    { data: impressionData30, color: '#74b9ff', fill: true },
    { data: clickData30.map(d => ({ ...d, value: Math.floor(d.value * 0.04) })), color: '#00cec9', fill: true }
  ]);
}

function renderAnalyticsChart() {
  const canvas = document.getElementById('analyticsChart');
  if (!canvas) return;
  drawLineChart(canvas, [
    { data: analyticsData, color: '#a29bfe', fill: true }
  ]);
}

function renderDeviceChart() {
  const canvas = document.getElementById('deviceChart');
  if (!canvas) return;
  drawDoughnutChart(canvas, MOCK_DATA.deviceData);
}

function renderAllCharts() {
  renderRevenueChart();
  renderImpressionChart();
  renderAnalyticsChart();
  renderDeviceChart();
}

// ─── Render Dashboard Components ──────────────────────────────────

function renderTopCampaigns() {
  const tbody = document.getElementById('topCampaignsBody');
  if (!tbody) return;
  const top = [...MOCK_DATA.campaigns]
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 5);
  tbody.innerHTML = top.map(c => `
    <tr>
      <td>${c.name}</td>
      <td>${formatNumber(c.impressions)}</td>
      <td>${formatNumber(c.clicks)}</td>
      <td>${formatCTR(c.clicks, c.impressions)}</td>
      <td>${formatCurrency(c.spend)}</td>
      <td><span class="status-badge ${c.status}"><span class="status-dot-sm"></span>${c.status}</span></td>
    </tr>
  `).join('');
}

function renderActivityFeed() {
  const feed = document.getElementById('activityFeed');
  if (!feed) return;
  feed.innerHTML = MOCK_DATA.activityFeed.map(a => `
    <div class="activity-item">
      <span class="activity-icon">${a.icon}</span>
      <div class="activity-content">
        <div class="activity-text">${a.text}</div>
        <div class="activity-time">${a.time}</div>
      </div>
    </div>
  `).join('');
}

function renderGeoList() {
  const geoList = document.getElementById('geoList');
  if (!geoList) return;
  geoList.innerHTML = MOCK_DATA.geoData.map(g => `
    <div class="geo-item">
      <span class="geo-name"><span class="geo-flag">${g.flag}</span> ${g.country}</span>
      <div class="geo-bar"><div class="geo-bar-fill" style="width:${g.percentage}%"></div></div>
      <span class="geo-value">${formatCurrency(g.value)}</span>
    </div>
  `).join('');
}

// ─── Render Campaigns ──────────────────────────────────────────────

function renderCampaigns(filter = 'all', sort = 'date') {
  const grid = document.getElementById('campaignGrid');
  if (!grid) return;

  let filtered = [...MOCK_DATA.campaigns];
  if (filter !== 'all') {
    filtered = filtered.filter(c => c.status === filter);
  }

  switch (sort) {
    case 'name':
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'budget':
      filtered.sort((a, b) => b.budget - a.budget);
      break;
    case 'performance':
      filtered.sort((a, b) => (b.clicks / (b.impressions || 1)) - (a.clicks / (a.impressions || 1)));
      break;
    default:
      filtered.sort((a, b) => b.id - a.id);
  }

  grid.innerHTML = filtered.map(c => {
    const progress = c.budget > 0 ? Math.min((c.spend / c.budget) * 100, 100) : 0;
    return `
      <div class="campaign-card" data-id="${c.id}">
        <div class="campaign-top">
          <span class="campaign-name">${c.name}</span>
          <span class="campaign-type">${c.type}</span>
        </div>
        <div class="campaign-stats">
          <div class="campaign-stat">
            <span class="campaign-stat-value">${formatNumber(c.impressions)}</span>
            <span class="campaign-stat-label">Impressions</span>
          </div>
          <div class="campaign-stat">
            <span class="campaign-stat-value">${formatCTR(c.clicks, c.impressions)}</span>
            <span class="campaign-stat-label">CTR</span>
          </div>
          <div class="campaign-stat">
            <span class="campaign-stat-value">${formatCurrency(c.spend)}</span>
            <span class="campaign-stat-label">Spend</span>
          </div>
          <div class="campaign-stat">
            <span class="campaign-stat-value">${formatNumber(c.clicks)}</span>
            <span class="campaign-stat-label">Clicks</span>
          </div>
        </div>
        <div class="campaign-progress">
          <div class="campaign-progress-bar" style="width:${progress}%"></div>
        </div>
        <div class="campaign-footer">
          <span class="status-badge ${c.status}"><span class="status-dot-sm"></span>${c.status}</span>
          <span class="campaign-budget">Budget: <strong>${formatCurrency(c.budget)}</strong></span>
        </div>
      </div>
    `;
  }).join('');
}

// ─── Render Inventory ──────────────────────────────────────────────

function renderInventory(filterType = 'all', filterStatus = 'all', search = '') {
  const grid = document.getElementById('inventoryGrid');
  if (!grid) return;

  let items = [...MOCK_DATA.inventory];
  if (filterType !== 'all') items = items.filter(i => i.type === filterType);
  if (filterStatus !== 'all') items = items.filter(i => i.status === filterStatus);
  if (search) items = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  grid.innerHTML = items.map(i => `
    <div class="inventory-item">
      <div class="inv-header">
        <span class="inv-name">${i.name}</span>
        <span class="inv-type">${i.type} · ${i.size}</span>
      </div>
      <div class="inv-metrics">
        <div class="inv-metric">
          <span class="inv-metric-value">$${i.ecpm.toFixed(2)}</span>
          <span class="inv-metric-label">eCPM</span>
        </div>
        <div class="inv-metric">
          <span class="inv-metric-value">${i.fillRate}%</span>
          <span class="inv-metric-label">Fill Rate</span>
        </div>
        <div class="inv-metric">
          <span class="inv-metric-value">${i.publisher}</span>
          <span class="inv-metric-label">Publisher</span>
        </div>
      </div>
      <span class="inv-status ${i.status}"><span class="status-dot-sm"></span>${i.status}</span>
    </div>
  `).join('');
}

// ─── Render Publishers ─────────────────────────────────────────────

function renderPublishers(filter = 'all') {
  const grid = document.getElementById('publisherGrid');
  if (!grid) return;

  let pubs = [...MOCK_DATA.publishers];
  if (filter === 'top') pubs = pubs.sort((a, b) => b.revenue - a.revenue).slice(0, 4);
  if (filter === 'flagged') pubs = pubs.filter(p => p.fillRate < 80);

  grid.innerHTML = pubs.map(p => `
    <div class="publisher-card">
      <div class="pub-avatar" style="background:${p.color}22; color:${p.color}">
        ${p.name[0]}
      </div>
      <div class="pub-info">
        <div class="pub-name">${p.name}</div>
        <div class="pub-domain">${p.domain}</div>
      </div>
      <div class="pub-metrics">
        <span class="pub-metric-value">${formatCurrency(p.revenue)}</span>
        <span class="pub-metric-label">Revenue</span>
      </div>
    </div>
  `).join('');
}

// ─── Navigation ────────────────────────────────────────────────────

const views = ['dashboard', 'campaigns', 'inventory', 'analytics', 'publishers', 'settings'];
const viewTitles = {
  dashboard: 'Dashboard',
  campaigns: 'Campaigns',
  inventory: 'Inventory',
  analytics: 'Analytics',
  publishers: 'Publishers',
  settings: 'Settings',
};

function navigateTo(view) {
  // Update sidebar
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
  const navBtn = document.querySelector(`.nav-btn[data-view="${view}"]`);
  if (navBtn) navBtn.classList.add('active');

  // Update view
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const viewEl = document.getElementById(`view-${view}`);
  if (viewEl) viewEl.classList.add('active');

  // Update title
  const titleEl = document.getElementById('viewTitle');
  if (titleEl) titleEl.textContent = viewTitles[view] || view;
}

// ─── Modal ─────────────────────────────────────────────────────────

function showModal() {
  const modal = document.getElementById('campaignModal');
  if (modal) modal.classList.remove('hidden');
}

function hideModal() {
  const modal = document.getElementById('campaignModal');
  if (modal) modal.classList.add('hidden');
}

function createCampaign() {
  const name = document.getElementById('campaignName').value.trim();
  const budget = parseFloat(document.getElementById('campaignBudget').value) || 0;
  const dailyCap = parseFloat(document.getElementById('campaignTarget').value) || 0;
  const type = document.getElementById('campaignType').value;
  const targeting = document.getElementById('campaignTargeting').value;
  const desc = document.getElementById('campaignDesc').value.trim();

  if (!name || budget <= 0) {
    alert('Please enter a campaign name and budget.');
    return;
  }

  const newCampaign = {
    id: Date.now(),
    name,
    type,
    status: 'active',
    impressions: 0,
    clicks: 0,
    spend: 0,
    budget,
    dailyCap,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    description: desc,
  };

  MOCK_DATA.campaigns.unshift(newCampaign);
  MOCK_DATA.activityFeed.unshift({
    icon: '🎯',
    text: `Campaign <strong>${name}</strong> created successfully`,
    time: 'just now',
  });

  renderCampaigns(
    document.getElementById('campaignFilter')?.value || 'all',
    document.getElementById('campaignSort')?.value || 'date'
  );
  renderTopCampaigns();
  renderActivityFeed();

  // Reset form
  document.getElementById('campaignName').value = '';
  document.getElementById('campaignBudget').value = '';
  document.getElementById('campaignTarget').value = '';
  document.getElementById('campaignDesc').value = '';

  hideModal();
}

// ─── Event Handlers ────────────────────────────────────────────────

function setupEvents() {
  // Navigation
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      navigateTo(view);
      if (view === 'analytics') renderAllCharts();
      if (view === 'campaigns') renderCampaigns();
      if (view === 'inventory') renderInventory();
      if (view === 'publishers') renderPublishers();
    });
  });

  // Sidebar toggle (mobile)
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });

    // Close sidebar on nav click (mobile)
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (window.innerWidth <= 768) sidebar.classList.remove('open');
      });
    });
  }

  // Modal
  const createBtn = document.getElementById('createCampaignBtn');
  const addBtn = document.getElementById('addCampaignBtn');
  const modalClose = document.getElementById('modalClose');
  const modalCancel = document.getElementById('modalCancel');
  const modalCreate = document.getElementById('modalCreate');

  if (createBtn) createBtn.addEventListener('click', showModal);
  if (addBtn) addBtn.addEventListener('click', showModal);
  if (modalClose) modalClose.addEventListener('click', hideModal);
  if (modalCancel) modalCancel.addEventListener('click', hideModal);
  if (modalCreate) modalCreate.addEventListener('click', createCampaign);

  // Close modal on overlay click
  const modalOverlay = document.getElementById('campaignModal');
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) hideModal();
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modalOverlay.classList.contains('hidden')) hideModal();
    });
  }

  // Campaign filters
  const campaignFilter = document.getElementById('campaignFilter');
  const campaignSort = document.getElementById('campaignSort');
  if (campaignFilter) {
    campaignFilter.addEventListener('change', () => {
      renderCampaigns(campaignFilter.value, campaignSort?.value || 'date');
    });
  }
  if (campaignSort) {
    campaignSort.addEventListener('change', () => {
      renderCampaigns(campaignFilter?.value || 'all', campaignSort.value);
    });
  }

  // Inventory filters
  const invFilter = document.getElementById('inventoryFilter');
  const invStatus = document.getElementById('inventoryStatus');
  const invSearch = document.getElementById('inventorySearch');
  if (invFilter) invFilter.addEventListener('change', () => renderInventory(invFilter.value, invStatus?.value || 'all', invSearch?.value || ''));
  if (invStatus) invStatus.addEventListener('change', () => renderInventory(invFilter?.value || 'all', invStatus.value, invSearch?.value || ''));
  if (invSearch) invSearch.addEventListener('input', () => renderInventory(invFilter?.value || 'all', invStatus?.value || 'all', invSearch.value));

  // Publisher filter
  const pubFilter = document.getElementById('publisherFilter');
  if (pubFilter) pubFilter.addEventListener('change', () => renderPublishers(pubFilter.value));

  // Chart range selectors
  const revenueRange = document.getElementById('revenueRange');
  const impressionRange = document.getElementById('impressionRange');
  if (revenueRange) revenueRange.addEventListener('change', () => {
    revenueData30 = generateChartData(parseInt(revenueRange.value));
    renderRevenueChart();
  });
  if (impressionRange) impressionRange.addEventListener('change', () => {
    impressionData30 = generateChartData(parseInt(impressionRange.value));
    clickData30 = generateChartData(parseInt(impressionRange.value));
    renderImpressionChart();
  });

  // Analytics controls
  const dateBtns = document.querySelectorAll('.date-btn');
  dateBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      dateBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const range = btn.dataset.range;
      let days = 30;
      if (range === 'today') days = 1;
      else if (range === '7d') days = 7;
      else if (range === '30d') days = 30;
      else if (range === '90d') days = 90;
      analyticsData = generateChartData(days);
      renderAnalyticsChart();
    });
  });

  const analyticsMetric = document.getElementById('analyticsMetric');
  if (analyticsMetric) {
    analyticsMetric.addEventListener('change', () => {
      renderAnalyticsChart();
    });
  }

  // API Key reveal
  const revealBtn = document.getElementById('revealKey');
  if (revealBtn) {
    revealBtn.addEventListener('click', () => {
      const input = revealBtn.previousElementSibling;
      if (input) {
        input.type = input.type === 'password' ? 'text' : 'password';
        revealBtn.textContent = input.type === 'password' ? 'Show' : 'Hide';
      }
    });
  }

  // Export campaigns
  const exportBtn = document.getElementById('exportCampaigns');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const csv = [
        ['Name', 'Type', 'Status', 'Impressions', 'Clicks', 'CTR', 'Spend', 'Budget'].join(','),
        ...MOCK_DATA.campaigns.map(c =>
          [c.name, c.type, c.status, c.impressions, c.clicks, formatCTR(c.clicks, c.impressions), c.spend, c.budget].join(',')
        )
      ].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'campaigns_export.csv';
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  // Search
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      // Simple search: highlight matching campaigns count
      const matchCount = MOCK_DATA.campaigns.filter(c =>
        c.name.toLowerCase().includes(q) || c.type.includes(q)
      ).length;
      if (q.length > 0) {
        searchInput.title = `${matchCount} matching campaigns`;
      } else {
        searchInput.title = '';
      }
    });
  }

  // Resize handler for charts
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const activeView = document.querySelector('.view.active');
      if (activeView) {
        const id = activeView.id;
        if (id === 'view-dashboard') {
          renderRevenueChart();
          renderImpressionChart();
        } else if (id === 'view-analytics') {
          renderAnalyticsChart();
          renderDeviceChart();
        }
      }
    }, 300);
  });
}

// ─── Live Simulation ───────────────────────────────────────────────

function simulateLiveData() {
  // Simulate small changes to campaign data
  MOCK_DATA.campaigns.forEach(c => {
    if (c.status === 'active') {
      const impDelta = Math.floor(randomBetween(50, 500));
      const clickDelta = Math.floor(impDelta * randomBetween(0.01, 0.05));
      c.impressions += impDelta;
      c.clicks += clickDelta;
      c.spend += parseFloat((impDelta * randomBetween(0.001, 0.005)).toFixed(2));
    }
  });

  // Update dashboard stats
  const totalImpressions = MOCK_DATA.campaigns.reduce((s, c) => s + c.impressions, 0);
  const totalClicks = MOCK_DATA.campaigns.reduce((s, c) => s + c.clicks, 0);
  const totalSpend = MOCK_DATA.campaigns.reduce((s, c) => s + c.spend, 0);
  const totalBudget = MOCK_DATA.campaigns.reduce((s, c) => s + c.budget, 0);
  const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const ecpm = totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0;
  const fillRate = 94 + Math.random() * 1;

  document.getElementById('statImpressions').textContent = formatNumber(totalImpressions);
  document.getElementById('statClicks').textContent = formatNumber(totalClicks);
  document.getElementById('statRevenue').textContent = formatCurrency(totalSpend);
  document.getElementById('statCTR').textContent = ctr.toFixed(2) + '%';
  document.getElementById('statECPM').textContent = '$' + ecpm.toFixed(2);
  document.getElementById('statFillRate').textContent = fillRate.toFixed(1) + '%';

  // Re-render tables without full campaign grid re-render (for performance)
  renderTopCampaigns();

  // Occasionally add activity
  if (Math.random() < 0.05) {
    const campaign = MOCK_DATA.campaigns[Math.floor(Math.random() * MOCK_DATA.campaigns.length)];
    MOCK_DATA.activityFeed.unshift({
      icon: '📊',
      text: `<strong>${campaign.name}</strong> — ${formatNumber(Math.floor(randomBetween(100, 5000)))} new impressions`,
      time: 'just now',
    });
    if (MOCK_DATA.activityFeed.length > 12) MOCK_DATA.activityFeed.length = 12;
    renderActivityFeed();
  }
}

// ─── Init ──────────────────────────────────────────────────────────

function init() {
  renderAllCharts();
  renderTopCampaigns();
  renderActivityFeed();
  renderGeoList();
  renderCampaigns();
  renderInventory();
  renderPublishers();
  setupEvents();

  // Live simulation every 4 seconds
  setInterval(simulateLiveData, 4000);
}

document.addEventListener('DOMContentLoaded', init);