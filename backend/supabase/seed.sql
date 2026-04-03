insert into public.products (name, brand, category, description, image_url, eco_score, materials)
select *
from (
  values
    (
      'Organic Bamboo Toothbrush',
      'EarthSmile',
      'Personal Care',
      'Biodegradable toothbrush with soft bristles and a compostable bamboo handle.',
      'https://images.unsplash.com/photo-1559591937-abc9d9a4b2f2?auto=format&fit=crop&w=900&q=80',
      92,
      'Bamboo, castor oil bristles'
    ),
    (
      'Organic Cotton T-Shirt',
      'GreenWeave',
      'Fashion',
      'Breathable everyday tee made with certified organic cotton and low-impact dyes.',
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
      88,
      'Organic cotton'
    ),
    (
      'Reusable Steel Water Bottle',
      'EcoSip',
      'Lifestyle',
      'Double-wall insulated bottle designed to reduce single-use plastic waste.',
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80',
      95,
      'Food-grade stainless steel'
    )
) as seed_data (name, brand, category, description, image_url, eco_score, materials)
where not exists (
  select 1
  from public.products
  where public.products.name = seed_data.name
);

insert into public.prices (product_id, platform, price, discount, product_url, availability)
select id, 'Amazon', 299, 25, 'https://www.amazon.in/', 'In Stock'
from public.products
where name = 'Organic Bamboo Toothbrush'
on conflict do nothing;

insert into public.prices (product_id, platform, price, discount, product_url, availability)
select id, 'Flipkart', 319, 18, 'https://www.flipkart.com/', 'In Stock'
from public.products
where name = 'Organic Bamboo Toothbrush'
on conflict do nothing;

insert into public.prices (product_id, platform, price, discount, product_url, availability)
select id, 'Myntra', 899, 30, 'https://www.myntra.com/', 'In Stock'
from public.products
where name = 'Organic Cotton T-Shirt'
on conflict do nothing;

insert into public.prices (product_id, platform, price, discount, product_url, availability)
select id, 'Ajio', 949, 22, 'https://www.ajio.com/', 'Limited Stock'
from public.products
where name = 'Organic Cotton T-Shirt'
on conflict do nothing;

insert into public.prices (product_id, platform, price, discount, product_url, availability)
select id, 'Amazon', 749, 20, 'https://www.amazon.in/', 'In Stock'
from public.products
where name = 'Reusable Steel Water Bottle'
on conflict do nothing;

insert into public.prices (product_id, platform, price, discount, product_url, availability)
select id, 'Flipkart', 729, 24, 'https://www.flipkart.com/', 'In Stock'
from public.products
where name = 'Reusable Steel Water Bottle'
on conflict do nothing;

insert into public.eco_metrics (product_id, carbon_footprint, water_usage, recyclability)
select id, 0.2, 1.5, 90
from public.products
where name = 'Organic Bamboo Toothbrush'
on conflict do nothing;

insert into public.eco_metrics (product_id, carbon_footprint, water_usage, recyclability)
select id, 2.8, 1500, 75
from public.products
where name = 'Organic Cotton T-Shirt'
on conflict do nothing;

insert into public.eco_metrics (product_id, carbon_footprint, water_usage, recyclability)
select id, 1.1, 3.2, 96
from public.products
where name = 'Reusable Steel Water Bottle'
on conflict do nothing;
