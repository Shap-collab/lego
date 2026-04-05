/* eslint-disable no-console, no-process-exit */
import * as avenuedelabrique from './websites/avenuedelabrique.js';
import * as vinted from './websites/vinted.js';
import * as dealabs from './websites/dealabs.js';
import fs from 'fs'; // 👈 Ajout du module pour lire/écrire des fichiers

async function scrapeADLB (website = 'https://www.avenuedelabrique.com/promotions-et-bons-plans-lego') {
  try {
    console.log(`browsing ${website} website`);

    const deals = await avenuedelabrique.scrape(website);

    console.log(deals);
    console.log('done');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

async function scrapeDealabs (url = 'https://www.dealabs.com/groupe/lego') {
  try {
    console.log(`browsing ${url} website`);

    const deals = await dealabs.scrape(url);

    // Étape 3 : Sauvegarder la liste dans un fichier JSON
    // On le sauvegarde dans le dossier "sources" pour que ton API puisse le lire ensuite !
    const filePath = './sources/deals.json'; 
    
    fs.writeFileSync(filePath, JSON.stringify(deals, null, 2));

    console.log(`💾 Fichier sauvegardé avec succès dans : ${filePath}`);
    console.log('done');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

const [,, param] = process.argv;

// scrapeADLB(param);
// scrapeVinted(param);
scrapeDealabs(param);