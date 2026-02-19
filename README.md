# Fivrr — Freelance Marketplace

A Fiverr-like freelance marketplace built with Next.js and MongoDB. Features multi-role users (Client & Freelancer), gigs, orders, messaging, and reviews.

## Tech Stack

- **Frontend:** Next.js 16, React 19, CSS (globals.css)
- **Backend:** Next.js API Routes, MongoDB + Mongoose
- **Auth:** JWT-based (login, signup, /api/auth/me)

## Setup

### 1. Environment Variables

Ensure `.env.local` exists with:

```
MONGODB_URL=mongodb+srv://ashminaik14_db_user:jBbNuOwuJzIzmxnJ@clusterfivrr.oluyya3.mongodb.net/fiverr-db?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

**Note:** Replace `JWT_SECRET` with a strong random string in production.

### 2. MongoDB Atlas (if needed)

- Whitelist your IP in MongoDB Atlas: Network Access → Add IP Address (or `0.0.0.0/0` for dev)
- Ensure the database `fiverr-db` exists (created automatically on first write)

### 3. Seed Database (optional)

Populate with demo users, gigs, and orders:

```bash
node seed.js
```

Demo credentials:

- **Freelancer:** rajesh.kumar@email.com / password123
- **Client:** anjali.nair@email.com / password123

### 4. Run Development Server

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Implemented Features Checklist

### Gig System (Freelancer)
- **Edit gigs** — `/gigs/[id]/edit` with title, description, price, category, delivery time, images
- **Delete gigs** — Delete button on dashboard (My Gigs); API requires owner auth
- **Image upload (Cloudinary)** — `ImageUpload` component; `/api/upload`; set `CLOUDINARY_*` in `.env.local`
- **Protected routes for gig management** — Create/PATCH/DELETE require JWT; PATCH/DELETE require gig owner

### Gig Marketplace (Client)
- **Browse all gigs** — `/gigs` with grid and category filters
- **Search by keyword, category, and price** — API: `?q=`, `?category=`, `?minPrice=`, `?maxPrice=`
- **Gig detail page** — `/gigs/[id]` with freelancer info, rating, reviews section
- **Purchase button (Stripe mock checkout)** — "Order Now" → `/gigs/[id]/checkout` → mock payment → order created

### Orders System
- **Order schema** — `buyerId`, `sellerId`, `gigId`, `price`, `status`, `createdAt`
- **Status flow** — Pending → In Progress → Delivered → Completed (plus Cancelled)
- **Role-based dashboards** — Client: "My Orders" (purchased); Freelancer: "Orders Received"; status actions (Start Work, Mark Delivered, Complete, Message)

## API Routes

| Route | Methods | Description |
|-------|---------|-------------|
| `/api/auth/signup` | POST | Register new user |
| `/api/auth/login` | POST | Login, returns JWT |
| `/api/auth/me` | GET | Get current user (Bearer token) |
| `/api/gigs` | GET, POST | List/create gigs (q, category, minPrice, maxPrice) |
| `/api/gigs/[id]` | GET, PATCH, DELETE | Get/update/delete gig |
| `/api/orders` | GET, POST | List/create orders (buyerId, sellerId) |
| `/api/orders/[id]` | PATCH | Update order status |
| `/api/reviews` | GET, POST | List/create reviews (gigId, orderId) |
| `/api/messages` | GET, POST | List/create messages (orderId) |
| `/api/users` | GET | List users or get by id |

## Manual Steps

1. **MongoDB Atlas:** Add your IP to Network Access if you get connection errors
2. **JWT_SECRET:** Set a strong secret in production
3. **Deployment:** For Vercel/Render, set `MONGODB_URL` and `JWT_SECRET` as environment variables
