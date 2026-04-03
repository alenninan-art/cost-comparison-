const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

require('dotenv').config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const staticRoot = path.join(__dirname, '..');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('ERROR: Missing Supabase configuration.\nPlease set SUPABASE_URL and SUPABASE_ANON_KEY in backend/.env');
  process.exit(1);
}

if (!/^https?:\/\//i.test(supabaseUrl)) {
  console.error(`ERROR: Invalid SUPABASE_URL: ${supabaseUrl}. Must start with http:// or https://`);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

app.use(cors());
app.use(express.json());
app.use(express.static(staticRoot));

app.get('/api/health', async (_req, res) => {
  try {
    const { error } = await supabase.from('products').select('id', { head: true, count: 'exact' });

    if (error) {
      throw error;
    }

    res.json({ success: true, message: 'API and Supabase connection are healthy' });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/search', async (req, res) => {
  try {
    const query = typeof req.body?.query === 'string' ? req.body.query.trim() : '';
    const filters = isPlainObject(req.body?.filters) ? req.body.filters : {};

    let supabaseQuery = supabase
      .from('products')
      .select(`
        *,
        prices (*),
        eco_metrics (*)
      `)
      .order('created_at', { ascending: false });

    if (query) {
      const escapedQuery = escapeForIlike(query);
      supabaseQuery = supabaseQuery.or(
        `name.ilike.%${escapedQuery}%,description.ilike.%${escapedQuery}%,brand.ilike.%${escapedQuery}%`
      );
    }

    if (filters.category) {
      supabaseQuery = supabaseQuery.eq('category', filters.category);
    }

    if (filters.minEcoScore !== undefined && filters.minEcoScore !== null && filters.minEcoScore !== '') {
      const minEcoScore = toNumber(filters.minEcoScore);

      if (minEcoScore !== null) {
        supabaseQuery = supabaseQuery.gte('eco_score', minEcoScore);
      }
    }

    const { data, error } = await supabaseQuery;

    if (error) {
      throw error;
    }

    let products = processProductData(data || []);
    products = applyProductFilters(products, filters);

    res.json({ success: true, products });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const productId = Number.parseInt(req.params.id, 10);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({ success: false, error: 'A valid product id is required' });
    }

    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        prices (*),
        eco_metrics (*)
      `)
      .eq('id', productId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const product = processProductData([data])[0];
    res.json({ success: true, product });
  } catch (error) {
    console.error('Product fetch error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/wishlist', async (req, res) => {
  try {
    const userId = normalizeUserId(req.body?.user_id);
    const productId = Number.parseInt(req.body?.product_id, 10);

    if (!userId || !Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({ success: false, error: 'user_id and a valid product_id are required' });
    }

    const { data: existingItem, error: existingError } = await supabase
      .from('wishlist')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (existingItem) {
      return res.json({ success: true, message: 'Product already in wishlist' });
    }

    const { error } = await supabase
      .from('wishlist')
      .insert([{ user_id: userId, product_id: productId }]);

    if (error) {
      throw error;
    }

    res.status(201).json({ success: true, message: 'Product added to wishlist' });
  } catch (error) {
    console.error('Wishlist create error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/wishlist/:user_id', async (req, res) => {
  try {
    const userId = normalizeUserId(req.params.user_id);

    if (!userId) {
      return res.status(400).json({ success: false, error: 'A valid user_id is required' });
    }

    const { data: wishlistRows, error: wishlistError } = await supabase
      .from('wishlist')
      .select('product_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (wishlistError) {
      throw wishlistError;
    }

    const productIds = [...new Set((wishlistRows || []).map((item) => item.product_id).filter(Boolean))];

    if (!productIds.length) {
      return res.json({ success: true, products: [] });
    }

    const { data: productRows, error: productsError } = await supabase
      .from('products')
      .select(`
        *,
        prices (*),
        eco_metrics (*)
      `)
      .in('id', productIds);

    if (productsError) {
      throw productsError;
    }

    const productMap = new Map(processProductData(productRows || []).map((product) => [product.id, product]));
    const products = productIds.map((id) => productMap.get(id)).filter(Boolean);

    res.json({ success: true, products });
  } catch (error) {
    console.error('Wishlist fetch error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/wishlist', async (req, res) => {
  try {
    const userId = normalizeUserId(req.body?.user_id);
    const productId = Number.parseInt(req.body?.product_id, 10);

    if (!userId || !Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({ success: false, error: 'user_id and a valid product_id are required' });
    }

    const { error } = await supabase
      .from('wishlist')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) {
      throw error;
    }

    res.json({ success: true, message: 'Product removed from wishlist' });
  } catch (error) {
    console.error('Wishlist remove error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/categories', async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('category')
      .not('category', 'is', null)
      .order('category', { ascending: true });

    if (error) {
      throw error;
    }

    const categories = [...new Set((data || []).map((item) => item.category).filter(Boolean))];
    res.json({ success: true, categories });
  } catch (error) {
    console.error('Categories fetch error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/', (_req, res) => {
  res.sendFile(path.join(staticRoot, 'index.html'));
});

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function normalizeUserId(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function escapeForIlike(value) {
  return value.replace(/[%_,]/g, '\\$&');
}

function normalizeEcoMetrics(ecoMetrics) {
  if (Array.isArray(ecoMetrics)) {
    return ecoMetrics[0] || null;
  }

  return ecoMetrics || null;
}

function processProductData(rows) {
  return rows.map((item) => {
    const rawPrices = Array.isArray(item.prices) ? item.prices : [];
    const prices = {};
    let lowestPrice = null;
    let lowestPricePlatform = null;

    rawPrices.forEach((entry) => {
      const numericPrice = toNumber(entry.price);

      if (!entry.platform || numericPrice === null) {
        return;
      }

      const normalizedEntry = {
        ...entry,
        price: numericPrice,
        discount: toNumber(entry.discount) ?? 0,
        product_url: entry.product_url || '',
        availability: entry.availability || 'In Stock'
      };

      prices[entry.platform] = normalizedEntry;

      if (lowestPrice === null || numericPrice < lowestPrice) {
        lowestPrice = numericPrice;
        lowestPricePlatform = entry.platform;
      }
    });

    return {
      id: item.id,
      name: item.name,
      brand: item.brand,
      category: item.category,
      description: item.description,
      image_url: item.image_url,
      eco_score: toNumber(item.eco_score) ?? 0,
      materials: item.materials,
      created_at: item.created_at,
      prices,
      lowest_price: lowestPrice,
      lowest_price_platform: lowestPricePlatform,
      eco_metrics: normalizeEcoMetrics(item.eco_metrics)
    };
  });
}

function applyProductFilters(products, filters) {
  const platformFilter = typeof filters.platform === 'string' ? filters.platform.trim() : '';
  const minPrice = toNumber(filters.minPrice);
  const maxPrice = toNumber(filters.maxPrice);

  return products.filter((product) => {
    const platformEntries = Object.entries(product.prices);

    if (!platformEntries.length) {
      return false;
    }

    if (platformFilter && !platformEntries.some(([platform]) => platform === platformFilter)) {
      return false;
    }

    const relevantEntries = platformFilter
      ? platformEntries.filter(([platform]) => platform === platformFilter)
      : platformEntries;

    if (minPrice !== null && !relevantEntries.some(([, price]) => price.price >= minPrice)) {
      return false;
    }

    if (maxPrice !== null && !relevantEntries.some(([, price]) => price.price <= maxPrice)) {
      return false;
    }

    return true;
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
