const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('Starting final robust seed for PriceDrop India...');

  const products = [
    {
      name: 'Sony WH-1000XM5 Wireless Headphones',
      brand: 'Sony',
      category: 'Electronics',
      description: 'Industry-leading noise canceling with Auto NC Optimizer and 30-hour battery life.',
      image_url: 'https://images.unsplash.com/photo-1618366712214-8c0751893058?auto=format&fit=crop&w=900&q=80',
      eco_score: 95, 
      materials: 'Premium Recycled Plastic'
    },
    {
      name: 'iPhone 15 Pro (Titanium)',
      brand: 'Apple',
      category: 'Smartphones',
      description: 'Advanced titanium design with the A17 Pro chip and professional zoom.',
      image_url: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&w=900&q=80',
      eco_score: 82,
      materials: 'Titanium'
    },
    {
      name: 'Nike Air Zoom Pegasus 40',
      brand: 'Nike',
      category: 'Fashion',
      description: 'Responsive foam and engineered mesh for the ultimate running experience.',
      image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
      eco_score: 75,
      materials: 'Engineered Mesh'
    }
  ];

  for (const product of products) {
    console.log(`Processing: ${product.name}`);

    // 1. Handle Product
    const { data: existing } = await supabase.from('products').select('id').eq('name', product.name).maybeSingle();
    let productId;
    if (existing) {
      productId = existing.id;
      await supabase.from('products').update(product).eq('id', productId);
    } else {
      const { data, error } = await supabase.from('products').insert(product).select().single();
      if (error) { console.error(`Error product:`, error.message); continue; }
      productId = data.id;
    }

    // 2. Handle Prices (Delete then Insert)
    await supabase.from('prices').delete().eq('product_id', productId);
    
    const prices = [];
    if (product.name.includes('Sony')) {
      prices.push(
        { product_id: productId, platform: 'Amazon', price: 26990, url: 'https://www.amazon.in/' },
        { product_id: productId, platform: 'Flipkart', price: 29990, url: 'https://www.flipkart.com/' }
      );
    } else if (product.name.includes('iPhone')) {
      prices.push(
        { product_id: productId, platform: 'Amazon', price: 127990, url: 'https://www.amazon.in/' },
        { product_id: productId, platform: 'Flipkart', price: 124990, url: 'https://www.flipkart.com/' }
      );
    } else if (product.name.includes('Nike')) {
      prices.push(
        { product_id: productId, platform: 'Myntra', price: 7495, url: 'https://www.myntra.com/' },
        { product_id: productId, platform: 'Ajio', price: 8995, url: 'https://www.ajio.com/' }
      );
    }
    if (prices.length > 0) {
      const { error } = await supabase.from('prices').insert(prices);
      if (error) console.error(`Error prices:`, error.message);
    }

    // 3. Handle Metrics (Delete then Insert)
    await supabase.from('eco_metrics').delete().eq('product_id', productId);
    
    let metrics = { product_id: productId, carbon_footprint: 0, water_usage: 0, recyclability_score: product.eco_score };
    if (product.name.includes('Sony')) { metrics.carbon_footprint = 34990; metrics.water_usage = 25; }
    else if (product.name.includes('iPhone')) { metrics.carbon_footprint = 134900; metrics.water_usage = 8; }
    else if (product.name.includes('Nike')) { metrics.carbon_footprint = 11995; metrics.water_usage = 45; }

    const { error: mError } = await supabase.from('eco_metrics').insert(metrics);
    if (mError) console.error(`Error metrics:`, mError.message);
  }

  console.log('Final Seed Completed');
}

seed().catch(console.error);
