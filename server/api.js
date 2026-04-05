import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

// We load json files as data source
import DEALS from "./sources/deals.json" with { type: "json" };
import SALES from "./sources/vinted.json" with { type: "json" };

const PORT = 8092;

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(helmet());

app.get('/', (request, response) => {
  response.send({ 'ack': true });
});

// GET /deals/search?limit=12&price=10&date=best-discount
app.get('/deals/search', (request, response) => {
  try {
    const { limit = 12, price, date } = request.query;

    let result = [...DEALS];

    // Filter by max price
    if (price) {
      result = result.filter(deal => deal.price <= parseFloat(price));
    }

    // Sort by date or discount
    if (date === 'best-discount') {
      result = result.sort((a, b) => b.discount - a.discount);
    } else if (date === 'most-commented') {
      result = result.sort((a, b) => b.comments - a.comments);
    } else if (date === 'hot-deals') {
      result = result.sort((a, b) => b.temperature - a.temperature);
    } else {
      // Default: sort by most recent
      result = result.sort((a, b) => b.published - a.published);
    }

    // Apply limit
    result = result.slice(0, parseInt(limit));

    return response.status(200).json({
      'success': true,
      'data': {
        'result': result,
        'meta': {
          'count': result.length,
          'total': DEALS.length,
          'limit': parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.log(error);
    return response.status(500).json({
      'success': false,
      'data': { 'result': [] }
    });
  }
});

// GET /deals/:id
app.get('/deals/:id', (request, response) => {
  try {
    const { id } = request.params;
    const deal = DEALS.find(d => d.id === id || d.uuid === id);

    if (!deal) {
      return response.status(404).json({
        'success': false,
        'data': { 'result': null }
      });
    }

    return response.status(200).json({
      'success': true,
      'data': { 'result': deal }
    });
  } catch (error) {
    console.log(error);
    return response.status(500).json({
      'success': false,
      'data': { 'result': null }
    });
  }
});

// GET /sales/search?legoSetId=10348
app.get('/sales/search', (request, response) => {
  response.setHeader('Access-Control-Allow-Credentials', true);
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  try {
    const { legoSetId } = request.query;

    if (!legoSetId) {
      return response.status(400).json({
        'success': false,
        'data': { 'result': [], 'error': 'legoSetId query param is required' }
      });
    }

    const result = SALES[legoSetId] || [];

    // Compute stats if results exist
    const prices = result.map(s => parseFloat(s.price.amount));
    const avg = prices.length
      ? (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2)
      : null;
    const p5 = prices.length
      ? prices.sort((a, b) => a - b)[Math.floor(prices.length * 0.05)]
      : null;

    return response.status(200).json({
      'success': true,
      'data': {
        'result': result,
        'meta': {
          'count': result.length,
          'averagePrice': avg ? parseFloat(avg) : null,
          'p5Price': p5 || null
        }
      }
    });
  } catch (error) {
    console.log(error);
    return response.status(404).json({
      'success': false,
      'data': { 'result': [] }
    });
  }
});

app.listen(PORT);
console.log(`📡 Running on port ${PORT}`);