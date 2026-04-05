'use strict';

// ─── Config ───────────────────────────────────────────────────────────────────
const API_URL = 'https://legooo-nu.vercel.app';
// Rebrickable image: free, no API key needed for thumbnails
const LEGO_IMG = (id) => `https://images.brickset.com/sets/images/${id}-1.jpg`;

// ─── State ────────────────────────────────────────────────────────────────────
let currentDeals = [];
let currentPagination = {};
let activeFilters = { discount: false, commented: false, hot: false, favorites: false };
let currentSort = '';
let favorites = JSON.parse(localStorage.getItem('lego-favorites')) || [];

// ─── Selectors ────────────────────────────────────────────────────────────────
const selectShow       = document.querySelector('#show-select');
const selectPage       = document.querySelector('#page-select');
const selectLegoSetIds = document.querySelector('#lego-set-id-select');
const selectSort       = document.querySelector('#sort-select');
const sectionDeals     = document.querySelector('#deals');
const spanNbDeals      = document.querySelector('#nbDeals');
const filtersDiv       = document.querySelector('#filters');
const indicatorsDiv    = document.querySelector('#indicators');
const legoSection      = document.querySelector('#lego');

// ─── Style ────────────────────────────────────────────────────────────────────
const styleSheet = document.createElement('style');
styleSheet.innerText = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background: #050510;
    color: #f0f0ff;
    min-height: 100vh;
    padding: 40px 24px;
    max-width: 1100px;
    margin: 0 auto;
  }

  body::before {
    content: '';
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background:
      radial-gradient(ellipse at 70% 10%, rgba(120,60,255,0.18) 0%, transparent 55%),
      radial-gradient(ellipse at 10% 90%, rgba(0,180,255,0.12) 0%, transparent 55%);
    pointer-events: none; z-index: 0;
  }

  h1 {
    font-size: 3rem; font-weight: 700; letter-spacing: -0.04em;
    background: linear-gradient(120deg, #fff 0%, #b0a0ff 40%, #00d4ff 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    margin-bottom: 36px; position: relative; z-index: 1;
  }

  section {
    position: relative; z-index: 1;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px; padding: 22px 24px; margin-bottom: 16px;
    backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
    transition: border-color 0.3s;
  }
  section:hover { border-color: rgba(255,255,255,0.12); }

  section h2 {
    font-size: 0.68rem; font-weight: 600; letter-spacing: 0.12em;
    text-transform: uppercase; color: rgba(255,255,255,0.35); margin-bottom: 18px;
  }

  /* ── Top controls ── */
  #options {
    display: flex; flex-wrap: wrap; gap: 12px; align-items: center;
  }
  #options > div { display: flex; align-items: center; gap: 8px; }

  label { font-size: 0.78rem; font-weight: 500; color: rgba(255,255,255,0.45); }

  select {
    background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px; color: #f0f0ff; font-family: inherit; font-size: 0.83rem;
    padding: 7px 32px 7px 12px; cursor: pointer; outline: none; transition: all 0.2s;
    -webkit-appearance: none; appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='rgba(255,255,255,0.35)'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 11px center;
  }
  select:focus { border-color: rgba(120,80,255,0.7); box-shadow: 0 0 0 3px rgba(120,80,255,0.15); }
  select option { background: #12122a; color: #f0f0ff; }

  #filters { display: flex; flex-wrap: wrap; gap: 8px; }
  #filters span {
    padding: 7px 16px; background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.09); border-radius: 100px;
    cursor: pointer; font-size: 0.8rem; font-weight: 500; color: rgba(255,255,255,0.6);
    transition: all 0.22s; user-select: none;
  }
  #filters span:hover { background: rgba(255,255,255,0.09); color: #fff; }
  #filters span.active {
    background: linear-gradient(135deg, #6644ff, #00c8ff);
    border-color: transparent; color: #fff;
    box-shadow: 0 4px 18px rgba(100,60,255,0.45);
  }

  /* ── Layout: 2 columns ── */
  #main-grid {
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: 16px;
    position: relative; z-index: 1;
  }
  #left-col { display: flex; flex-direction: column; gap: 16px; }
  #right-col { display: flex; flex-direction: column; gap: 16px; }

  @media (max-width: 768px) {
    #main-grid { grid-template-columns: 1fr; }
  }

  /* ── Deal cards ── */
  .deal {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 8px; border-bottom: 1px solid rgba(255,255,255,0.04);
    transition: background 0.18s; border-radius: 10px; margin-bottom: 2px;
  }
  .deal:last-child { border-bottom: none; }
  .deal:hover { background: rgba(255,255,255,0.04); }

  .deal-img {
    width: 52px; height: 40px; object-fit: contain; border-radius: 6px;
    background: rgba(255,255,255,0.05); flex-shrink: 0;
  }

  .fav-btn {
    background: none; border: none; font-size: 1rem; cursor: pointer;
    padding: 0; line-height: 1; opacity: 0.35; transition: all 0.2s; flex-shrink: 0;
  }
  .fav-btn:hover { opacity: 1; transform: scale(1.25); }
  .fav-btn.active { opacity: 1; }

  .deal-id { font-size: 0.7rem; font-weight: 600; color: rgba(255,255,255,0.28); min-width: 46px; }

  .deal a {
    color: rgba(255,255,255,0.82); text-decoration: none; flex: 1;
    font-size: 0.84rem; line-height: 1.4; transition: color 0.2s;
  }
  .deal a:hover { color: #00d4ff; }

  .deal-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
  .deal-price { font-size: 0.9rem; font-weight: 700; color: #00d4ff; font-variant-numeric: tabular-nums; }
  .deal-badge {
    font-size: 0.66rem; font-weight: 700; padding: 2px 7px; border-radius: 100px;
    background: rgba(255,80,80,0.15); color: #ff7070; border: 1px solid rgba(255,80,80,0.25);
  }

  /* ── Indicators ── */
  .indicator-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 11px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 0.86rem;
  }
  .indicator-row:last-child { border-bottom: none; }
  .indicator-row span:first-child { color: rgba(255,255,255,0.45); }
  .indicator-row span:last-child { font-weight: 700; color: #fff; font-variant-numeric: tabular-nums; }

  /* ── Lego set selector ── */
  #lego { padding-bottom: 16px; }
  #lego > div { display: flex; align-items: center; gap: 10px; margin-bottom: 0; }

  /* ── Sales list ── */
  .sale {
    display: flex; justify-content: space-between; align-items: center;
    padding: 10px 8px; border-bottom: 1px solid rgba(255,255,255,0.04);
    border-radius: 8px; transition: background 0.18s;
  }
  .sale:hover { background: rgba(255,255,255,0.04); }
  .sale:last-child { border-bottom: none; }
  .sale a { color: rgba(255,255,255,0.75); text-decoration: none; flex: 1; font-size: 0.82rem; transition: color 0.2s; }
  .sale a:hover { color: #b0a0ff; }
  .sale-price { font-weight: 700; color: #b0a0ff; min-width: 58px; text-align: right; font-size: 0.86rem; }

  #no-results { color: rgba(255,255,255,0.28); font-style: italic; font-size: 0.85rem; padding: 20px 0; text-align: center; }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 3px; }
`;
document.head.appendChild(styleSheet);

// ─── Restructure the DOM ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Wrap lego + indicators + sales into a grid
  const mainGrid = document.createElement('div');
  mainGrid.id = 'main-grid';

  const leftCol = document.createElement('div');
  leftCol.id = 'left-col';

  const rightCol = document.createElement('div');
  rightCol.id = 'right-col';

  const body = document.body;

  // Move sections into columns
  const optionsSection = document.querySelector('#options').parentElement;
  const legoSec = document.querySelector('#lego');
  const indicatorsSec = document.querySelector('#indicators');
  const dealsSec = document.querySelector('#deals');

  leftCol.appendChild(dealsSec);
  rightCol.appendChild(legoSec);
  rightCol.appendChild(indicatorsSec);

  mainGrid.appendChild(leftCol);
  mainGrid.appendChild(rightCol);
  body.appendChild(mainGrid);

  // Add "By favorites" filter
  const favSpan = document.createElement('span');
  favSpan.textContent = 'By favorites';
  filtersDiv.appendChild(favSpan);

  // Attach all filter listeners
  filtersDiv.querySelectorAll('span').forEach(span => {
    span.addEventListener('click', () => {
      span.classList.toggle('active');
      const text = span.textContent.toLowerCase();
      if (text.includes('discount'))  activeFilters.discount  = !activeFilters.discount;
      if (text.includes('commented')) activeFilters.commented = !activeFilters.commented;
      if (text.includes('hot'))       activeFilters.hot       = !activeFilters.hot;
      if (text.includes('favorites')) activeFilters.favorites = !activeFilters.favorites;
      applyFiltersAndSort();
    });
  });

  selectSort.addEventListener('change', (e) => { currentSort = e.target.value; applyFiltersAndSort(); });
  selectShow.addEventListener('change', async (e) => {
    const data = await fetchDeals(currentPagination.currentPage || 1, parseInt(e.target.value));
    setCurrentDeals(data); render(currentDeals, currentPagination);
  });
  selectPage.addEventListener('change', async (e) => {
    const data = await fetchDeals(parseInt(e.target.value), parseInt(selectShow.value));
    setCurrentDeals(data); render(currentDeals, currentPagination);
  });
  selectLegoSetIds.addEventListener('change', (e) => updateSales(e.target.value));

  // Populate vinted IDs selector with ALL vinted keys fetched from API
  await populateVintedIds();

  // Load deals
  const data = await fetchDeals();
  setCurrentDeals(data);
  render(currentDeals, currentPagination);
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
const extractPrice = (p) => {
  if (typeof p === 'number') return p;
  if (typeof p === 'string') return parseFloat(p);
  if (typeof p === 'object' && p !== null) return parseFloat(p.amount || p.value || 0);
  return 0;
};

const getPercentile = (arr, p) => {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const i = (s.length - 1) * p;
  const lo = Math.floor(i), hi = lo + 1, w = i % 1;
  return hi >= s.length ? s[lo] : s[lo] * (1 - w) + s[hi] * w;
};

const getAverage = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

const getLifetime = dates => {
  if (dates.length < 2) return 0;
  const times = dates.map(d => typeof d === 'number' ? d * 1000 : new Date(d).getTime());
  return Math.floor((Math.max(...times) - Math.min(...times)) / 86400000);
};

// ─── API ──────────────────────────────────────────────────────────────────────
const fetchDeals = async (page = 1, size = 6) => {
  try {
    const res = await fetch(`${API_URL}/deals/search?page=${page}&size=${size}`);
    const body = await res.json();
    if (!body.success) return { result: currentDeals, meta: currentPagination };
    return body.data;
  } catch { return { result: currentDeals, meta: currentPagination }; }
};

const fetchSales = async (id) => {
  try {
    const res = await fetch(`${API_URL}/sales/search?legoSetId=${id}`);
    const body = await res.json();
    return body.success ? body.data.result : [];
  } catch { return []; }
};

// Fetch all vinted set IDs by trying known IDs from vinted.json
// We expose a /sales/ids endpoint — fallback: hardcode the 27 known IDs
const VINTED_IDS = [
  '10343','10348','11384','31150','31162','31163','31165','31175','31218',
  '40747','40885','42179','43020','43221','43257','43268','43271','43272',
  '60444','71814','71858','75687','76281','77240','77251','77255'
];

const populateVintedIds = async () => {
  selectLegoSetIds.innerHTML = VINTED_IDS.map(id =>
    `<option value="${id}">${id}</option>`
  ).join('');
  // Trigger sales for first ID
  if (VINTED_IDS.length > 0) {
    await updateSales(VINTED_IDS[0]);
  }
};

// ─── State Setter ─────────────────────────────────────────────────────────────
const setCurrentDeals = ({ result, meta }) => {
  currentDeals = result;
  currentPagination = meta;
};

// ─── Renderers ────────────────────────────────────────────────────────────────
const renderDeals = (deals) => {
  if (!deals.length) {
    sectionDeals.innerHTML = '<p id="no-results">No deals match your filters.</p>';
    return;
  }
  const div = document.createElement('div');
  div.innerHTML = deals.map(deal => {
    const isFav = favorites.includes(deal.uuid);
    const badge = deal.discount > 0 ? `<span class="deal-badge">-${deal.discount}%</span>` : '';
    const imgSrc = deal.id ? LEGO_IMG(deal.id) : '';
    const imgTag = imgSrc
      ? `<img class="deal-img" src="${imgSrc}" alt="${deal.id}" onerror="this.style.display='none'">`
      : '<div class="deal-img"></div>';
    return `
      <div class="deal" id="${deal.uuid}">
        <button class="fav-btn ${isFav ? 'active' : ''}" data-uuid="${deal.uuid}">${isFav ? '⭐' : '☆'}</button>
        ${imgTag}
        <span class="deal-id">${deal.id || '—'}</span>
        <a href="${deal.link}" target="_blank" rel="noopener noreferrer">${deal.title}</a>
        <div class="deal-right">
          <span class="deal-price">${deal.price} €</span>
          ${badge}
        </div>
      </div>`;
  }).join('');

  const frag = document.createDocumentFragment();
  frag.appendChild(div);
  sectionDeals.innerHTML = `<h2>Deals — ${deals.length} results</h2>`;
  sectionDeals.appendChild(frag);

  document.querySelectorAll('.fav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const uuid = e.currentTarget.getAttribute('data-uuid');
      favorites = favorites.includes(uuid)
        ? favorites.filter(id => id !== uuid)
        : [...favorites, uuid];
      localStorage.setItem('lego-favorites', JSON.stringify(favorites));
      applyFiltersAndSort();
    });
  });
};

const renderPagination = ({ currentPage, pageCount }) => {
  if (!pageCount) { selectPage.innerHTML = '<option>1</option>'; return; }
  selectPage.innerHTML = Array.from({ length: pageCount }, (_, i) =>
    `<option value="${i + 1}">${i + 1}</option>`
  ).join('');
  selectPage.selectedIndex = (currentPage || 1) - 1;
};

const renderIndicators = ({ count }) => { spanNbDeals.innerHTML = count || 0; };

const render = (deals, pagination) => {
  applyFiltersAndSort();
  renderPagination(pagination);
  renderIndicators(pagination);
};

// ─── Filters & Sort ───────────────────────────────────────────────────────────
const applyFiltersAndSort = () => {
  let result = [...currentDeals];
  if (activeFilters.discount)  result = result.filter(d => d.discount > 20);
  if (activeFilters.commented) result = result.filter(d => d.comments > 15);
  if (activeFilters.hot)       result = result.filter(d => d.temperature > 100);
  if (activeFilters.favorites) result = result.filter(d => favorites.includes(d.uuid));
  if (currentSort === 'price-asc')  result.sort((a, b) => a.price - b.price);
  if (currentSort === 'price-desc') result.sort((a, b) => b.price - a.price);
  if (currentSort === 'date-asc')   result.sort((a, b) => a.published - b.published);
  if (currentSort === 'date-desc')  result.sort((a, b) => b.published - a.published);
  renderDeals(result);
};

// ─── Sales + Indicators ───────────────────────────────────────────────────────
const updateSales = async (id) => {
  const sales = await fetchSales(id);

  // Build indicator rows map from DOM
  const getIndicatorSpan = (label) => {
    const rows = indicatorsDiv.querySelectorAll('.indicator-row');
    const row = Array.from(rows).find(r => r.textContent.toLowerCase().includes(label.toLowerCase()));
    return row ? row.querySelectorAll('span')[1] : null;
  };

  // Rebuild indicators section with proper structure if needed
  if (!indicatorsDiv.querySelector('.indicator-row')) {
    const labels = [
      ['Number of deals', spanNbDeals ? spanNbDeals.textContent : '0'],
      ['Number of sales', '0'],
      ['Average sales price', '0 €'],
      ['p5 sales price value', '0 €'],
      ['p25 sales price value', '0 €'],
      ['p50 sales price value', '0 €'],
      ['Lifetime value', '0 days'],
    ];
    const existingH2 = indicatorsDiv.querySelector('h2');
    indicatorsDiv.innerHTML = '';
    if (existingH2) indicatorsDiv.appendChild(existingH2);
    labels.forEach(([label, val]) => {
      const row = document.createElement('div');
      row.className = 'indicator-row';
      row.innerHTML = `<span>${label}</span><span>${val}</span>`;
      indicatorsDiv.appendChild(row);
    });
    // restore nbDeals binding
    const nbDealsRow = Array.from(indicatorsDiv.querySelectorAll('.indicator-row'))
      .find(r => r.textContent.includes('Number of deals'));
    if (nbDealsRow) nbDealsRow.querySelectorAll('span')[1].id = 'nbDeals';
  }

  const nbSalesSpan  = getIndicatorSpan('Number of sales');
  const avgSpan      = getIndicatorSpan('Average');
  const p5Span       = getIndicatorSpan('p5');
  const p25Span      = getIndicatorSpan('p25');
  const p50Span      = getIndicatorSpan('p50');
  const lifetimeSpan = getIndicatorSpan('Lifetime');

  if (!sales.length) {
    if (nbSalesSpan)  nbSalesSpan.textContent  = '0';
    if (avgSpan)      avgSpan.textContent       = '0 €';
    if (p5Span)       p5Span.textContent        = '0 €';
    if (p25Span)      p25Span.textContent       = '0 €';
    if (p50Span)      p50Span.textContent       = '0 €';
    if (lifetimeSpan) lifetimeSpan.textContent  = '0 days';
    const old = document.querySelector('#sales-list');
    if (old) old.innerHTML = '<p id="no-results">No Vinted sales found for this set.</p>';
    return;
  }

  const prices = sales.map(s => extractPrice(s.price)).filter(p => !isNaN(p) && p > 0);
  const dates  = sales.map(s => s.published);

  if (nbSalesSpan)  nbSalesSpan.textContent  = sales.length;
  if (avgSpan)      avgSpan.textContent       = `${getAverage(prices).toFixed(2)} €`;
  if (p5Span)       p5Span.textContent        = `${getPercentile(prices, 0.05).toFixed(2)} €`;
  if (p25Span)      p25Span.textContent       = `${getPercentile(prices, 0.25).toFixed(2)} €`;
  if (p50Span)      p50Span.textContent       = `${getPercentile(prices, 0.50).toFixed(2)} €`;
  if (lifetimeSpan) lifetimeSpan.textContent  = `${getLifetime(dates)} days`;

  let salesListDiv = document.querySelector('#sales-list');
  if (!salesListDiv) {
    salesListDiv = document.createElement('div');
    salesListDiv.id = 'sales-list';
    // Insert INSIDE the lego section
    legoSection.appendChild(salesListDiv);
  }

  salesListDiv.innerHTML = `<h2 style="margin-top:16px;">Vinted Sales (${sales.length})</h2>` +
    sales.slice(0, 10).map(sale => `
      <div class="sale">
        <a href="${sale.link}" target="_blank" rel="noopener noreferrer">${sale.title}</a>
        <span class="sale-price">${extractPrice(sale.price).toFixed(2)} €</span>
      </div>`).join('');
};