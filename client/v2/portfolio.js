'use strict';

const API_URL = 'https://legooo-nu.vercel.app';
const LEGO_IMG = (id) => `https://images.brickset.com/sets/images/${id}-1.jpg`;

const VINTED_IDS = [
  '10343','10348','11384','31150','31162','31163','31165','31175','31218',
  '40747','40885','42179','43020','43221','43257','43268','43271','43272',
  '60444','71814','71858','75687','76281','77240','77251','77255'
];

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
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Space Grotesk', -apple-system, sans-serif;
    background: #06060f;
    color: #e8e8f8;
    min-height: 100vh;
    padding: 40px 28px;
    max-width: 1140px;
    margin: 0 auto;
  }

  body::before {
    content: '';
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background:
      radial-gradient(ellipse at 75% 5%, rgba(110,50,255,0.22) 0%, transparent 50%),
      radial-gradient(ellipse at 5% 95%, rgba(0,160,255,0.14) 0%, transparent 50%);
    pointer-events: none; z-index: 0;
  }

  h1 {
    font-size: 3.2rem; font-weight: 700; letter-spacing: -0.05em;
    background: linear-gradient(120deg, #ffffff 0%, #c0b0ff 45%, #00e0ff 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    margin-bottom: 32px; position: relative; z-index: 1;
  }

  section {
    position: relative; z-index: 1;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 18px; padding: 20px 22px; margin-bottom: 14px;
    backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
    transition: border-color 0.3s;
    overflow: hidden;
  }
  section:hover { border-color: rgba(255,255,255,0.13); }

  section h2 {
    font-size: 0.65rem; font-weight: 600; letter-spacing: 0.14em;
    text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 16px;
    font-family: 'Space Grotesk', sans-serif;
  }

  /* ── Controls ── */
  #options { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
  #options > div { display: flex; align-items: center; gap: 8px; }

  label {
    font-size: 0.78rem; font-weight: 500;
    color: rgba(255,255,255,0.4);
    font-family: 'Space Grotesk', sans-serif;
    letter-spacing: 0.02em;
  }

  select {
    background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px; color: #e8e8f8; font-family: 'Space Grotesk', sans-serif;
    font-size: 0.82rem; font-weight: 500;
    padding: 7px 30px 7px 12px; cursor: pointer; outline: none; transition: all 0.2s;
    -webkit-appearance: none; appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='rgba(255,255,255,0.35)'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 10px center;
  }
  select:focus { border-color: rgba(110,60,255,0.7); box-shadow: 0 0 0 3px rgba(110,60,255,0.15); }
  select option { background: #13132a; color: #e8e8f8; }

  #filters { display: flex; flex-wrap: wrap; gap: 8px; }
  #filters span {
    padding: 7px 16px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 100px;
    cursor: pointer; font-size: 0.79rem; font-weight: 500;
    color: rgba(255,255,255,0.55); transition: all 0.22s; user-select: none;
    font-family: 'Space Grotesk', sans-serif; letter-spacing: 0.01em;
  }
  #filters span:hover { background: rgba(255,255,255,0.08); color: #fff; }
  #filters span.active {
    background: linear-gradient(135deg, #6040ff, #00ccff);
    border-color: transparent; color: #fff;
    box-shadow: 0 4px 20px rgba(100,60,255,0.4);
  }

  /* ── Grid layout ── */
  #main-grid {
    display: grid;
    grid-template-columns: 1fr 310px;
    gap: 14px;
    position: relative; z-index: 1;
    align-items: start;
  }
  #left-col, #right-col { display: flex; flex-direction: column; gap: 14px; }
  @media (max-width: 760px) { #main-grid { grid-template-columns: 1fr; } }

  /* ── Deal cards ── */
  .deal {
    display: flex; align-items: center; gap: 12px;
    padding: 11px 6px; border-bottom: 1px solid rgba(255,255,255,0.04);
    transition: background 0.18s; border-radius: 10px;
  }
  .deal:last-child { border-bottom: none; }
  .deal:hover { background: rgba(255,255,255,0.04); }

  .deal-img {
    width: 54px; height: 40px; object-fit: contain; border-radius: 7px;
    background: rgba(255,255,255,0.04); flex-shrink: 0;
  }

  .fav-btn {
    background: none; border: none; cursor: pointer; padding: 0;
    line-height: 1; flex-shrink: 0; font-size: 0; /* hide emoji */
    width: 22px; height: 22px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.22s;
    position: relative;
  }
  /* Custom heart icon using CSS */
  .fav-btn::before {
    content: '♡';
    font-size: 1rem;
    color: rgba(255,255,255,0.25);
    transition: all 0.22s;
    font-style: normal;
  }
  .fav-btn:hover::before { color: #ff6090; transform: scale(1.2); }
  .fav-btn.active::before {
    content: '♥';
    color: #ff4080;
    text-shadow: 0 0 12px rgba(255,60,120,0.6);
  }

  .deal-id {
    font-size: 0.68rem; font-weight: 600;
    color: rgba(255,255,255,0.25); min-width: 44px;
    font-variant-numeric: tabular-nums;
  }

  .deal a {
    color: rgba(255,255,255,0.8); text-decoration: none; flex: 1;
    font-size: 0.83rem; line-height: 1.4; font-weight: 400;
    transition: color 0.2s;
  }
  .deal a:hover { color: #00e0ff; }

  .deal-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; min-width: 68px; }

  .deal-price {
    font-size: 0.92rem; font-weight: 700; color: #00e0ff;
    font-variant-numeric: tabular-nums; letter-spacing: -0.02em;
  }

  .deal-badge {
    font-size: 0.65rem; font-weight: 700; padding: 2px 7px; border-radius: 100px;
    background: rgba(255,70,70,0.15); color: #ff7575;
    border: 1px solid rgba(255,70,70,0.2);
  }

  /* ── Indicators ── */
  .indicator-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05);
    font-size: 0.83rem;
  }
  .indicator-row:last-child { border-bottom: none; }
  .indicator-row .ind-label { color: rgba(255,255,255,0.42); font-weight: 400; }
  .indicator-row .ind-value { font-weight: 700; color: #e8e8f8; font-variant-numeric: tabular-nums; }

  /* ── Lego set selector ── */
  #lego-set-row { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }

  /* ── Sales list — stays INSIDE the lego section ── */
  #sales-list { margin-top: 4px; }
  #sales-list h2 { margin-bottom: 12px; }

  .sale {
    display: flex; justify-content: space-between; align-items: center;
    padding: 9px 6px; border-bottom: 1px solid rgba(255,255,255,0.04);
    border-radius: 8px; transition: background 0.18s;
  }
  .sale:hover { background: rgba(255,255,255,0.04); }
  .sale:last-child { border-bottom: none; }
  .sale a {
    color: rgba(255,255,255,0.72); text-decoration: none; flex: 1;
    font-size: 0.8rem; transition: color 0.2s; padding-right: 8px; line-height: 1.35;
  }
  .sale a:hover { color: #c0b0ff; }
  .sale-price {
    font-weight: 700; color: #c0b0ff; min-width: 58px;
    text-align: right; font-size: 0.84rem; flex-shrink: 0;
  }

  #no-results {
    color: rgba(255,255,255,0.25); font-style: italic; font-size: 0.83rem;
    padding: 18px 0; text-align: center;
  }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
`;
document.head.appendChild(styleSheet);

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
  const i = (s.length - 1) * p, lo = Math.floor(i), hi = lo + 1, w = i % 1;
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

// ─── State Setter ─────────────────────────────────────────────────────────────
const setCurrentDeals = ({ result, meta }) => {
  currentDeals = result;
  currentPagination = meta;
};

// ─── Build indicators section ─────────────────────────────────────────────────
const buildIndicators = () => {
  const h2 = indicatorsDiv.querySelector('h2');
  indicatorsDiv.innerHTML = '';
  if (h2) indicatorsDiv.appendChild(h2);

  const rows = [
    { label: 'Number of deals',    id: 'ind-nb-deals',    value: '0' },
    { label: 'Number of sales',    id: 'ind-nb-sales',    value: '0' },
    { label: 'Average price',      id: 'ind-avg',         value: '—' },
    { label: 'p5 price',           id: 'ind-p5',          value: '—' },
    { label: 'p25 price',          id: 'ind-p25',         value: '—' },
    { label: 'p50 price',          id: 'ind-p50',         value: '—' },
    { label: 'Lifetime',           id: 'ind-lifetime',    value: '—' },
  ];
  rows.forEach(({ label, id, value }) => {
    const row = document.createElement('div');
    row.className = 'indicator-row';
    row.innerHTML = `<span class="ind-label">${label}</span><span class="ind-value" id="${id}">${value}</span>`;
    indicatorsDiv.appendChild(row);
  });
};

const setIndicator = (id, value) => {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
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
    const imgTag = deal.id
      ? `<img class="deal-img" src="${LEGO_IMG(deal.id)}" alt="" onerror="this.style.opacity='0'">`
      : `<div class="deal-img"></div>`;
    return `
      <div class="deal" id="${deal.uuid}">
        <button class="fav-btn ${isFav ? 'active' : ''}" data-uuid="${deal.uuid}"></button>
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
  const h2 = sectionDeals.querySelector('h2');
  sectionDeals.innerHTML = '';
  if (h2) { h2.textContent = `Deals — ${deals.length} results`; sectionDeals.appendChild(h2); }
  else {
    const newH2 = document.createElement('h2');
    newH2.textContent = `Deals — ${deals.length} results`;
    sectionDeals.appendChild(newH2);
  }
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

  // Get or create #sales-list INSIDE legoSection
  let salesListDiv = legoSection.querySelector('#sales-list');
  if (!salesListDiv) {
    salesListDiv = document.createElement('div');
    salesListDiv.id = 'sales-list';
    legoSection.appendChild(salesListDiv);
  }

  if (!sales.length) {
    setIndicator('ind-nb-sales', '0');
    setIndicator('ind-avg', '—');
    setIndicator('ind-p5', '—');
    setIndicator('ind-p25', '—');
    setIndicator('ind-p50', '—');
    setIndicator('ind-lifetime', '—');
    salesListDiv.innerHTML = '<p id="no-results">No Vinted sales found.</p>';
    return;
  }

  const prices = sales.map(s => extractPrice(s.price)).filter(p => !isNaN(p) && p > 0);
  const dates  = sales.map(s => s.published);

  setIndicator('ind-nb-sales', sales.length);
  setIndicator('ind-avg',      `${getAverage(prices).toFixed(2)} €`);
  setIndicator('ind-p5',       `${getPercentile(prices, 0.05).toFixed(2)} €`);
  setIndicator('ind-p25',      `${getPercentile(prices, 0.25).toFixed(2)} €`);
  setIndicator('ind-p50',      `${getPercentile(prices, 0.50).toFixed(2)} €`);
  setIndicator('ind-lifetime', `${getLifetime(dates)} days`);

  salesListDiv.innerHTML =
    `<h2>Vinted Sales (${sales.length})</h2>` +
    sales.slice(0, 10).map(sale => `
      <div class="sale">
        <a href="${sale.link}" target="_blank" rel="noopener noreferrer">${sale.title}</a>
        <span class="sale-price">${extractPrice(sale.price).toFixed(2)} €</span>
      </div>`).join('');
};

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {

  // 1. Restructure DOM into 2-column grid
  const mainGrid = document.createElement('div');
  mainGrid.id = 'main-grid';
  const leftCol = document.createElement('div');
  leftCol.id = 'left-col';
  const rightCol = document.createElement('div');
  rightCol.id = 'right-col';

  leftCol.appendChild(sectionDeals);
  rightCol.appendChild(legoSection);
  rightCol.appendChild(indicatorsDiv);
  mainGrid.appendChild(leftCol);
  mainGrid.appendChild(rightCol);
  document.body.appendChild(mainGrid);

  // 2. Wrap lego set select in a labelled row
  legoSection.innerHTML = '<h2>Lego Sets</h2>';
  const legoRow = document.createElement('div');
  legoRow.id = 'lego-set-row';
  legoRow.innerHTML = `<label>Lego set id:</label>`;
  legoRow.appendChild(selectLegoSetIds);
  legoSection.appendChild(legoRow);

  // 3. Build clean indicators
  buildIndicators();

  // 4. Add "By favorites" filter pill
  const favSpan = document.createElement('span');
  favSpan.textContent = 'By favorites';
  filtersDiv.appendChild(favSpan);

  // 5. Attach events
  filtersDiv.querySelectorAll('span').forEach(span => {
    span.addEventListener('click', () => {
      span.classList.toggle('active');
      const t = span.textContent.toLowerCase();
      if (t.includes('discount'))  activeFilters.discount  = !activeFilters.discount;
      if (t.includes('commented')) activeFilters.commented = !activeFilters.commented;
      if (t.includes('hot'))       activeFilters.hot       = !activeFilters.hot;
      if (t.includes('favorites')) activeFilters.favorites = !activeFilters.favorites;
      applyFiltersAndSort();
    });
  });

  selectSort.addEventListener('change', (e) => { currentSort = e.target.value; applyFiltersAndSort(); });

  selectShow.addEventListener('change', async (e) => {
    const data = await fetchDeals(currentPagination.currentPage || 1, parseInt(e.target.value));
    setCurrentDeals(data);
    setIndicator('ind-nb-deals', data.meta.count || 0);
    renderPagination(data.meta);
    applyFiltersAndSort();
  });

  selectPage.addEventListener('change', async (e) => {
    const data = await fetchDeals(parseInt(e.target.value), parseInt(selectShow.value));
    setCurrentDeals(data);
    setIndicator('ind-nb-deals', data.meta.count || 0);
    renderPagination(data.meta);
    applyFiltersAndSort();
  });

  selectLegoSetIds.addEventListener('change', (e) => updateSales(e.target.value));

  // 6. Populate vinted IDs
  selectLegoSetIds.innerHTML = VINTED_IDS.map(id =>
    `<option value="${id}">${id}</option>`
  ).join('');

  // 7. Load deals
  const data = await fetchDeals();
  setCurrentDeals(data);
  setIndicator('ind-nb-deals', data.meta.count || 0);
  renderPagination(data.meta);
  applyFiltersAndSort();

  // 8. Auto-load sales for first vinted ID
  await updateSales(VINTED_IDS[0]);
});