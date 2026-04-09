
const API_BASE_URL = 'http://127.0.0.1:5001/api';

const liveData = [
  {
    name: 'iPhone 16 (128GB)',
    brand: 'Apple',
    category: 'Smartphones',
    description: 'Latest iPhone model featuring the A18 chip and advanced camera system.',
    image_url: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&w=900&q=80',
    eco_score: 98,
    prices: {
      Amazon: { price: 79900, discount: 0, url: 'https://www.amazon.in/Apple-iPhone-16-128-GB/dp/B0DGJ9B5XF' },
      Flipkart: { price: 61900, discount: 22, url: 'https://www.flipkart.com/apple-iphone-16-ultramarine-128-gb/p/itmd5b172a537f1c' }
    }
  },
  {
    name: 'iPhone 15 (128GB)',
    brand: 'Apple',
    category: 'Smartphones',
    description: 'Powerful performance with the A16 Bionic chip and 48MP main camera.',
    image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d251a?auto=format&fit=crop&w=900&q=80',
    eco_score: 92,
    prices: {
      Amazon: { price: 69900, discount: 0, url: 'https://www.amazon.in/Apple-iPhone-15-128-GB/dp/B0CHX1W1XY' },
      Flipkart: { price: 48999, discount: 29, url: 'https://www.flipkart.com/apple-iphone-15-black-128-gb/p/itm6ac6485515ae4' }
    }
  },
  {
    name: 'Sony WH-1000XM5',
    brand: 'Sony',
    category: 'Electronics',
    description: 'Best-in-class noise cancelling headphones with exceptional sound quality.',
    image_url: 'https://images.unsplash.com/photo-1618366712214-8c0751893058?auto=format&fit=crop&w=900&q=80',
    eco_score: 94,
    prices: {
      Amazon: { price: 26990, discount: 23, url: 'https://www.amazon.in/Sony-WH-1000XM5-Wireless-Cancelling-Headphones/dp/B0B1GQTHT6' },
      Flipkart: { price: 29990, discount: 15, url: 'https://www.flipkart.com/sony-wh-1000xm5-industry-leading-active-noise-cancellation-anc-bluetooth-headset/p/itme358a9d82136e' }
    }
  }
];

async function sync() {
  try {
    console.log('Pushing live data to backend...');
    const response = await fetch(`${API_BASE_URL}/sync-live`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ products: liveData })
    });
    const data = await response.json();
    console.log('Sync Success:', data.message);
  } catch (error) {
    console.error('Sync Failed:', error.message);
  }
}

sync();
