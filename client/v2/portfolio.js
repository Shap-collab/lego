// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';

/**
Description of the available api
GET https://lego-api-blue.vercel.app/deals

Search for specific deals

This endpoint accepts the following optional query string parameters:

- `page` - page of deals to return
- `size` - number of deals to return

GET https://lego-api-blue.vercel.app/sales

Search for current Vinted sales for a given lego set id

This endpoint accepts the following optional query string parameters:

- `id` - lego set id to return
*/

// current deals on the page
let currentDeals = [];
let currentPagination = {};

// instantiate the selectors
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const selectLegoSetIds = document.querySelector('#lego-set-id-select');
const sectionDeals= document.querySelector('#deals');
const spanNbDeals = document.querySelector('#nbDeals');

/**
 * Set global value
 * @param {Array} result - deals to display
 * @param {Object} meta - pagination meta info
 */
const setCurrentDeals = ({result, meta}) => {
  currentDeals = result;
  currentPagination = meta;
};

/**
 * Fetch deals from api
 * @param  {Number}  [page=1] - current page to fetch
 * @param  {Number}  [size=12] - size of the page
 * @return {Object}
 */
const fetchDeals = async (page = 1, size = 6) => {
  try {
    const response = await fetch(
      `https://lego-api-blue.vercel.app/deals?page=${page}&size=${size}`
    );
    const body = await response.json();

    if (body.success !== true) {
      console.error(body);
      return {currentDeals, currentPagination};
    }

    return body.data;
  } catch (error) {
    console.error(error);
    return {currentDeals, currentPagination};
  }
};

/**
 * Render list of deals
 * @param  {Array} deals
 */
const renderDeals = deals => {
  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');
  const template = deals
    .map(deal => {
      return `
      <div class="deal" id=${deal.uuid}>
        <span>${deal.id}</span>
        <a href="${deal.link}">${deal.title}</a>
        <span>${deal.price}</span>
      </div>
    `;
    })
    .join('');

  div.innerHTML = template;
  fragment.appendChild(div);
  sectionDeals.innerHTML = '<h2>Deals</h2>';
  sectionDeals.appendChild(fragment);
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderPagination = pagination => {
  const {currentPage, pageCount} = pagination;
  const options = Array.from(
    {'length': pageCount},
    (value, index) => `<option value="${index + 1}">${index + 1}</option>`
  ).join('');

  selectPage.innerHTML = options;
  selectPage.selectedIndex = currentPage - 1;
};

/**
 * Render lego set ids selector
 * @param  {Array} lego set ids
 */
const renderLegoSetIds = deals => {
  const ids = getIdsFromDeals(deals);
  const options = ids.map(id => 
    `<option value="${id}">${id}</option>`
  ).join('');

  selectLegoSetIds.innerHTML = options;
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderIndicators = pagination => {
  const {count} = pagination;

  spanNbDeals.innerHTML = count;
};

const render = (deals, pagination) => {
  renderDeals(deals);
  renderPagination(pagination);
  renderIndicators(pagination);
  renderLegoSetIds(deals)
};

/**
 * Declaration of all Listeners
 */

/**
 * Select the number of deals to display
 */
selectShow.addEventListener('change', async (event) => {
  const deals = await fetchDeals(currentPagination.currentPage, parseInt(event.target.value));

  setCurrentDeals(deals);
  render(currentDeals, currentPagination);
});

document.addEventListener('DOMContentLoaded', async () => {
  const deals = await fetchDeals();

  setCurrentDeals(deals);
  render(currentDeals, currentPagination);
});

// ----------------------------------------------------------------------------------
// --- NEW FEATURES IMPLEMENTATION ---
// Code added without modifying the original content above
// ----------------------------------------------------------------------------------

// 1. Setup Feature 15 (Usable and pleasant UX) dynamically
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f9; color: #333; padding: 20px; max-width: 900px; margin: auto; }
  section { background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-bottom: 20px; }
  .deal, .sale { display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #eee; }
  .deal a, .sale a { color: #007bff; text-decoration: none; font-weight: bold; flex: 1; margin: 0 15px; }
  .deal a:hover, .sale a:hover { text-decoration: underline; }
  .fav-btn { cursor: pointer; background: none; border: none; font-size: 1.2rem; }
  #filters span { display: inline-block; padding: 5px 15px; margin: 5px 10px 5px 0; background: #e0e0e0; border-radius: 15px; cursor: pointer; user-select: none; transition: 0.2s; }
  #filters span.active { background: #007bff; color: white; }
  #indicators div { display: flex; justify-content: space-between; border-bottom: 1px dashed #ccc; padding: 5px 0; }
`;
document.head.appendChild(styleSheet);

// 2. Additional Selectors
const selectSort = document.querySelector('#sort-select');
const filtersDiv = document.querySelector('#filters');
const indicatorsDiv = document.querySelector('#indicators');
const legoSection = document.querySelector('#lego');

// Create the "Favorites" filter element dynamically (Feature 14)
const favFilterSpan = document.createElement('span');
favFilterSpan.textContent = 'By favorites';
filtersDiv.appendChild(favFilterSpan);
const filterSpans = filtersDiv.querySelectorAll('span');

// 3. States for filtering, sorting and favorites
let activeFilters = { discount: false, commented: false, hot: false, favorites: false };
let currentSort = selectSort ? selectSort.value : '';
let favorites = JSON.parse(localStorage.getItem('lego-favorites')) || [];

// 4. Mathematical Helper Functions (Features 9 & 10)
const getPercentile = (arr, p) => {
  if (!arr.length) return 0;
  arr.sort((a, b) => a - b);
  const index = (arr.length - 1) * p;
  const lower = Math.floor(index);
  const upper = lower + 1;
  const weight = index % 1;
  if (upper >= arr.length) return arr[lower];
  return arr[lower] * (1 - weight) + arr[upper] * weight;
};
const getAverage = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
const getLifetime = dates => {
  if (dates.length < 2) return 0;
  const times = dates.map(d => new Date(d).getTime());
  return Math.floor((Math.max(...times) - Math.min(...times)) / (1000 * 60 * 60 * 24));
};

// Helper to extract price robustly (Fixes the [object Object] rendering issue)
const extractPrice = (priceInfo) => {
  if (typeof priceInfo === 'number') return priceInfo;
  if (typeof priceInfo === 'string') return parseFloat(priceInfo);
  if (typeof priceInfo === 'object' && priceInfo !== null) {
    return parseFloat(priceInfo.amount || priceInfo.value || priceInfo.price || 0);
  }
  return 0;
};

// 5. Override renderDeals to implement Features 11 (target=_blank) & 13 (favorites)
window.renderDeals = (deals) => {
  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');
  const template = deals.map(deal => {
    const isFav = favorites.includes(deal.uuid);
    return `
      <div class="deal" id="${deal.uuid}">
        <button class="fav-btn" data-uuid="${deal.uuid}">${isFav ? '⭐' : '☆'}</button>
        <span style="min-width: 60px;">${deal.id}</span>
        <a href="${deal.link}" target="_blank" rel="noopener noreferrer">${deal.title}</a>
        <span style="font-weight:bold;">${deal.price} €</span>
      </div>
    `;
  }).join('');

  div.innerHTML = template;
  fragment.appendChild(div);
  sectionDeals.innerHTML = `<h2>Deals (${deals.length})</h2>`;
  sectionDeals.appendChild(fragment);

  // Feature 13: Save as favorite
  document.querySelectorAll('.fav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const uuid = e.target.getAttribute('data-uuid');
      if (favorites.includes(uuid)) {
        favorites = favorites.filter(id => id !== uuid);
      } else {
        favorites.push(uuid);
      }
      localStorage.setItem('lego-favorites', JSON.stringify(favorites));
      applyFiltersAndSort(); 
    });
  });
};

// 6. Override global render to inject filter logic dynamically
const originalRender = render;
window.render = (deals, pagination) => {
  renderPagination(pagination);
  renderIndicators(pagination);
  
  // Deduplicate IDs before rendering to clean up the selector
  const uniqueDeals = [];
  const seenIds = new Set();
  for(const d of deals) {
    if(!seenIds.has(d.id)) {
      seenIds.add(d.id);
      uniqueDeals.push(d);
    }
  }
  renderLegoSetIds(uniqueDeals);
  
  applyFiltersAndSort();
};

// 7. Core Logic: Apply filters and sorting (Features 2, 3, 4, 5, 6, 14)
const applyFiltersAndSort = () => {
  if (!currentDeals) return;
  let result = [...currentDeals];
  
  if (activeFilters.discount) result = result.filter(d => d.discount > 50);
  if (activeFilters.commented) result = result.filter(d => d.comments > 15);
  if (activeFilters.hot) result = result.filter(d => d.temperature > 100);
  if (activeFilters.favorites) result = result.filter(d => favorites.includes(d.uuid));

  if (currentSort === 'price-asc') result.sort((a, b) => a.price - b.price);
  if (currentSort === 'price-desc') result.sort((a, b) => b.price - a.price);
  if (currentSort === 'date-asc') result.sort((a, b) => new Date(a.published) - new Date(b.published));
  if (currentSort === 'date-desc') result.sort((a, b) => new Date(b.published) - new Date(a.published));

  window.renderDeals(result);
};

// 8. Event Listeners for Filters & Sorting
filterSpans.forEach(span => {
  span.addEventListener('click', () => {
    span.classList.toggle('active');
    const text = span.textContent.toLowerCase();
    if (text.includes('discount')) activeFilters.discount = !activeFilters.discount;
    if (text.includes('commented')) activeFilters.commented = !activeFilters.commented;
    if (text.includes('hot')) activeFilters.hot = !activeFilters.hot;
    if (text.includes('favorites')) activeFilters.favorites = !activeFilters.favorites;
    applyFiltersAndSort();
  });
});

selectSort.addEventListener('change', (event) => {
  currentSort = event.target.value;
  applyFiltersAndSort();
});

// Feature 1: Browse Pages
selectPage.addEventListener('change', async (event) => {
  const deals = await fetchDeals(parseInt(event.target.value), parseInt(selectShow.value));
  setCurrentDeals(deals);
  render(currentDeals, currentPagination);
});

// 9. Vinted Sales Tracking (Features 7, 8, 9, 10, 12)
const fetchSales = async (id) => {
  try {
    const response = await fetch(`https://lego-api-blue.vercel.app/sales?id=${id}`);
    const body = await response.json();
    return body.success ? body.data.result : [];
  } catch (e) {
    return [];
  }
};

selectLegoSetIds.addEventListener('change', async (event) => {
  const id = event.target.value;
  if (!id) return;
  
  const sales = await fetchSales(id);
  
  // Ensure the "Average" indicator row exists dynamically without breaking the layout
  const indDivsList = Array.from(indicatorsDiv.querySelectorAll('div'));
  let avgDiv = indDivsList.find(div => div.textContent.includes('Average'));
  if (!avgDiv) {
    avgDiv = document.createElement('div');
    avgDiv.innerHTML = `<span>Average sales price value</span> <span>0 €</span>`;
    indicatorsDiv.insertBefore(avgDiv, indicatorsDiv.querySelectorAll('div')[2]);
  }

  // Robustly find target spans by their text labels
  const getTargetSpan = (labelText) => {
    const row = Array.from(indicatorsDiv.querySelectorAll('div')).find(div => div.textContent.includes(labelText));
    return row ? row.querySelectorAll('span')[1] : null;
  };

  const nbSalesSpan = getTargetSpan('Number of sales');
  const avgSpan = getTargetSpan('Average');
  const p5Span = getTargetSpan('p5');
  const p25Span = getTargetSpan('p25');
  const p50Span = getTargetSpan('p50');
  const lifetimeSpan = getTargetSpan('Lifetime');

  if (!sales.length) {
    if (nbSalesSpan) nbSalesSpan.innerHTML = '0';
    if (avgSpan) avgSpan.innerHTML = '0 €';
    if (p5Span) p5Span.innerHTML = '0 €';
    if (p25Span) p25Span.innerHTML = '0 €';
    if (p50Span) p50Span.innerHTML = '0 €';
    if (lifetimeSpan) lifetimeSpan.innerHTML = '0 days';
    
    const oldList = document.querySelector('#sales-list');
    if (oldList) oldList.innerHTML = '';
    return;
  }

  const prices = sales.map(s => extractPrice(s.price)).filter(p => !isNaN(p));
  const dates = sales.map(s => s.published);

  if (nbSalesSpan) nbSalesSpan.innerHTML = sales.length;
  if (avgSpan) avgSpan.innerHTML = `${getAverage(prices).toFixed(2)} €`;
  if (p5Span) p5Span.innerHTML = `${getPercentile(prices, 0.05).toFixed(2)} €`;
  if (p25Span) p25Span.innerHTML = `${getPercentile(prices, 0.25).toFixed(2)} €`;
  if (p50Span) p50Span.innerHTML = `${getPercentile(prices, 0.50).toFixed(2)} €`;
  if (lifetimeSpan) lifetimeSpan.innerHTML = `${getLifetime(dates)} days`;

  // Render the actual sales below indicators
  let salesListDiv = document.querySelector('#sales-list');
  if (!salesListDiv) {
    salesListDiv = document.createElement('div');
    salesListDiv.id = 'sales-list';
    legoSection.appendChild(salesListDiv);
  }
  
  salesListDiv.innerHTML = '<h3 style="margin-top:20px;">Recent Vinted Sales</h3>' + sales.slice(0, 5).map(sale => `
    <div class="sale">
      <a href="${sale.link}" target="_blank" rel="noopener noreferrer">${sale.title}</a>
      <span>${extractPrice(sale.price)} €</span>
    </div>
  `).join('');
});