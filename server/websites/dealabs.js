import * as cheerio from 'cheerio';
import { v5 as uuidv5 } from 'uuid';

/**
 * Format the image object or string to a usable URL
 * @param {Object|String} mainImage - Image data from the vue3 object
 * @returns {String} formatted image url
 */
const formatImage = (mainImage) => {
  if (!mainImage) return null;
  return mainImage.path || mainImage.url || mainImage;
};

/**
 * Extract Lego set ID from the deal title
 * @param {String} title - Deal title
 * @returns {String|null} set ID
 */
const extractSetId = (title) => {
  if (!title) return null;
  // Assuming Lego set IDs are usually 4 to 5 digits
  const match = title.match(/\b\d{4,5}\b/);
  return match ? match[0] : null;
};

/**
 * Parse webpage data response
 * @param  {String} data - html response
 * @return {Array} deals
 */
const parse = data => {
  const $ = cheerio.load(data, {'xmlMode': true});

  return $('div.js-threadList article')
    .map((i, element) => {
      const link = $(element)
        .find('a[data-t="threadLink"]')
        .attr('href');

      const vueDataString = $(element)
        .find('div.js-vue3')
        .attr('data-vue3');

      if (!vueDataString) return null;

      const vue3Data = JSON.parse(vueDataString);
      const thread = vue3Data.props.thread;

      if (!thread) return null;

      const retail = thread.nextBestPrice;
      const price = thread.price;
      const discount = (retail && price) ? parseInt(((retail - price) / retail) * 100) : 0;
      const temperature = +thread.temperature;
      const photo = formatImage(thread.mainImage);
      const comments = +thread.commentCount;
      const published = thread.publishedAt;
      const title = thread.title;
      const id = extractSetId(title);

      return {
        id,
        title,
        link,
        price,
        retail,
        discount,
        temperature,
        photo,
        comments,
        published,
        'uuid': uuidv5(link, uuidv5.URL)
      };
    })
    .get()
    .filter(item => item !== null);
};

/**
 * Scrape a given url page
 * @param {String} url - url to parse and scrape
 * @returns {Promise<Array|null>}
 */
const scrape = async url => {
  try {
    const response = await fetch(url, {
      "headers": {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "accept-language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36"
      }
    });

    if (response.ok) {
      const body = await response.text();
      return parse(body);
    }

    console.error(`Error fetching Dealabs: ${response.status}`);
    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export { scrape };