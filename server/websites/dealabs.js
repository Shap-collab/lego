import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { v5 as uuidv5 } from 'uuid';

/**
 * Parse webpage data response
 * @param  {String} data - html response
 * @return {Array} deals
 */
const parse = data => {
  const $ = cheerio.load(data);

  return $('article.thread')
    .map((i, element) => {
      const titleElement = $(element).find('a.thread-title--card, a.thread-title--list');
      const title = titleElement.text().trim();
      const link = titleElement.attr('href');

      // Extraction du prix : on nettoie les caractères non numériques
      const priceText = $(element).find('.thread-price').text().trim();
      const price = parseFloat(priceText.replace(/[^0-9,.]/g, '').replace(',', '.')) || 0;

      if (!title || !link) return null;

      return {
        title,
        link,
        price,
        'uuid': uuidv5(link, uuidv5.URL),
        'source': 'dealabs'
      };
    })
    .get()
    .filter(deal => deal !== null);
};

/**
 * Scrape Dealabs
 * @param {String} url
 * @returns {Array}
 */
export const scrape = async url => {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7'
    }
  });

  if (response.ok) {
    const body = await response.text();
    return parse(body);
  }

  console.error(`[Dealabs] Failed to fetch: ${response.status} ${response.statusText}`);
  return [];
};