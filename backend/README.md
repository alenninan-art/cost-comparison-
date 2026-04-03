# EcoFind Backend

Backend API for EcoFind - Indian Product Comparison platform.

## Features

- Product search with filters
- Product details by ID
- User wishlist management
- Product categories
- Eco-friendly product metrics

## Tech Stack

- Node.js
- Express.js
- Supabase (Database & Auth)
- CORS for cross-origin requests

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   - Copy `.env.example` to `.env` and fill in your Supabase credentials
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_KEY`: Your Supabase anonymous key

3. **Database Setup:**
   - Run `supabase/schema.sql` in the Supabase SQL editor
   - Optionally run `supabase/seed.sql` to load sample products

4. **Run the server:**
   ```bash
   npm start
   ```

   For development with auto-restart:
   ```bash
   npm run dev
   ```

## API Endpoints

### Products
- `GET /api/health` - Verify API and Supabase connectivity
- `POST /api/search` - Search products with filters
- `GET /api/products/:id` - Get product by ID
- `GET /api/categories` - Get all product categories

### Wishlist
- `POST /api/wishlist` - Add product to wishlist
- `GET /api/wishlist/:user_id` - Get user's wishlist
- `DELETE /api/wishlist` - Remove product from wishlist

## Request/Response Format

All responses follow this format:
```json
{
  "success": true|false,
  "data": {...} | "error": "error message"
}
```
