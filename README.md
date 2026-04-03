# EcoFind - Indian Product Comparison

A platform to find and compare eco-friendly products across Indian e-commerce platforms like Amazon, Flipkart, Myntra, and Ajio.

## Quick Start

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Supabase:**
   - Create a [Supabase](https://supabase.com) account
   - Create a new project
   - Copy `backend/.env.example` to `backend/.env`
   - Add your project URL and anonymous key from Supabase project settings

4. **Set up database tables and policies:**
   - Open the Supabase SQL editor
   - Run `backend/supabase/schema.sql`
   - Optionally run `backend/supabase/seed.sql` to load sample products

5. **Start the backend server:**
   ```bash
   npm start
   ```

### Frontend Setup

1. **Open the frontend:**
   - Open `index.html` in your web browser
   - Or serve it with a local server:
     ```bash
     npx serve .
     ```

2. **Test the application:**
   - The frontend will connect to the backend API at `http://localhost:5000`
   - Make sure the backend is running

## Features

- Search for eco-friendly products
- Compare prices across multiple platforms
- View eco-scores and sustainability metrics
- User wishlist functionality
- Filter by category, price, platform, and eco-score

## Deployment

This project is set up to deploy as a single Node web service on Render.

1. Push this folder to a GitHub repository.
2. In Render, create a new Blueprint or Web Service from that repo.
3. Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` in Render environment variables.
4. Deploy using the included `render.yaml`.

The deployed app will serve both the frontend and API from the same public URL.

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Supabase account

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `backend/.env.example` to `backend/.env`
   - Add your Supabase URL and anonymous key

4. Set up Supabase database:
   - Run `backend/supabase/schema.sql`
   - Optionally run `backend/supabase/seed.sql`

5. Start the backend server:
   ```bash
   npm start
   ```

### Frontend Setup

1. Open `index.html` in a web browser
2. Or serve it with a local server:
   ```bash
   npx serve .
   ```

## API Endpoints

- `POST /api/search` - Search products
- `GET /api/products/:id` - Get product details
- `GET /api/categories` - Get product categories
- `GET /api/health` - Verify the backend can reach Supabase
- `POST /api/wishlist` - Add to wishlist
- `GET /api/wishlist/:user_id` - Get user wishlist
- `DELETE /api/wishlist` - Remove from wishlist

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
