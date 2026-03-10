/* eslint-disable no-console, no-process-exit */
import * as avenuedelabrique from './websites/avenuedelabrique.js';
import * as vinted from './websites/vinted.js';

async function scrapeADLB (website = 'https://www.avenuedelabrique.com/promotions-et-bons-plans-lego') {
  try {
    console.log(`🕵️‍♀️  browsing ${website} website`);

    const deals = await avenuedelabrique.scrape(website);

    console.log(deals);
    console.log('done');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

async function scrapeVinted (lego) {
  try {
    console.log(`🕵️‍♀️  scraping lego ${lego} from vinted.fr`);

    const sales = await vinted.scrape(lego);

    console.log(sales);
    console.log('done');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

/* eslint-disable no-console, no-process-exit */
import * as dealabs from './websites/dealabs.js';
import fs from 'fs'; // Pour l'écriture de fichier

async function scrapeDealabs(url = 'https://www.dealabs.com/groupe/lego') {
  try {
    console.log(`🕵️‍♀️  Browsing Dealabs: ${url}`);

    const deals = await dealabs.scrape(url);

    console.log(`✅ Found ${deals.length} deals.`);

    // Étape : Stocker la liste dans un fichier JSON
    fs.writeFileSync('deals.json', JSON.stringify(deals, null, 2));
    console.log('💾 Data saved to deals.json');

    process.exit(0);
  } catch (e) {
    console.error('❌ Error:', e);
    process.exit(1);
  }
}


const [,, param] = process.argv;

//scrapeADLB(param);
//scrapeVinted(param)
scrapeDealabs(param);
