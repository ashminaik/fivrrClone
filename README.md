# fivrrClone — Freelance Marketplace

A full-stack freelance marketplace web application inspired by Fiverr, built with **Next.js (SSR)** and **MongoDB Atlas**. Supports multi-role users (Client & Freelancer), gig management, order workflows, real-time messaging, reviews, and image uploads.

## Tech Stack

- **Frontend & Backend:** Next.js 16 (App Router, Server-Side Rendering), React 19
- **Database:** MongoDB Atlas + Mongoose ODM
- **Authentication:** JWT-based (bcrypt password hashing)
- **Styling:** Tailwind CSS v3 + Custom CSS (light blue theme)
- **Form Validation:** React Hook Form + Zod schemas
- **Image Storage:** Cloudinary (persistent cloud storage)
- **Deployment:** Vercel

## Features

### User Authentication & Roles
- User registration and login with JWT token-based authentication
- Two distinct roles: **Client** (buyer) and **Freelancer** (seller)
- Password hashing with bcrypt for security
- Protected routes and role-based access control
- Persistent auth state across sessions via token stored in localStorage

### Gig Management (Freelancer)
- Create new gigs with title, description, price, category, delivery time, and multiple images
- Edit existing gigs with pre-populated form data
- Delete gigs from the dashboard
- Image upload to Cloudinary with drag-and-drop support
- Form validation using React Hook Form + Zod (minimum title length, description length, price, etc.)
- Gigs are displayed with category icons, star ratings, and review counts

### Browse & Discover Gigs (Client)
- Browse all available gigs in a responsive grid layout
- **Keyword search** with magnifying glass icon input
- **Category filter chips** — clickable pill buttons to filter by category (Web Development, Design, Marketing, Writing, Video, Music, etc.)
- **Price range filter** — native range slider to set maximum price
- Category dropdown for quick filtering
- Gig cards show title, seller name, price, rating, and category badge

### Gig Detail Page
- Full gig details with image gallery, seller info, description, and purchase card
- Seller avatar with dynamic color generation
- Star rating display with review count
- "What's Included" section with delivery time
- **Order Now** button for purchasing
- **Chat with Seller** button — allows clients to message freelancers before purchasing
- Reviews section with all reviews displayed chronologically

### Order System
- Mock payment checkout flow (simulates Stripe-like experience)
- Order status workflow: **Pending → In Progress → Delivered → Completed** (+ Cancelled)
- Role-based order actions:
  - **Freelancer:** Start Work, Mark as Delivered
  - **Client:** Mark as Completed
- Order tracking on the dashboard for both roles

### Messaging System
- **Split-pane chat interface** (modern design like WhatsApp Web / Slack)
  - Left panel: Scrollable conversation list with avatars, names, last message preview, and timestamps
  - Right panel: Active chat with message history and input bar
- Real-time message updates via 3-second polling
- Auto-scroll to latest messages
- Chat accessible from order dashboard or gig detail page
- URL parameter support (`/messages?order=<id>`) for deep linking to conversations

### Reviews & Ratings
- Clients can leave star ratings (1-5) and optional comments on gigs after placing an order
- Review form with React Hook Form + Zod validation
- Average rating automatically calculated and updated on gig cards
- Review count displayed on gig detail page and gig cards
- "My Reviews" section on client dashboard showing all reviews left by the user
- One review per order (duplicate prevention)

### Dashboard
- **Client Dashboard:**
  - Overview stats (total orders, active orders, completed orders, reviews given)
  - My Orders section with status badges and action buttons
  - My Reviews section with star ratings and links to gig pages
- **Freelancer Dashboard:**
  - Overview stats (active gigs, total orders, completed orders, total earnings)
  - My Gigs management (edit/delete)
  - Orders Received with status management actions

### UI & Design
- Light blue color theme with modern gradient accents
- Responsive design for desktop and mobile
- Dynamic avatar colors based on username
- Category icons for visual identification
- Animated hero section on homepage
- Clean card-based layouts throughout

## Setup

### 1. Clone the Repository

```bash
git clone git@github.com:ashminaik/fivrrClone.git
cd fivrrClone
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```
MONGODB_URL=your-mongodb-atlas-connection-string
JWT_SECRET=your-jwt-secret-key
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

### 3. Seed Database (Optional)

Populate the database with demo users, gigs, and orders:

```bash
node seed.js
```

Demo credentials:
- **Freelancer:** rajesh.kumar@email.com / password123
- **Client:** anjali.nair@email.com / password123

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## API Routes

| Route | Methods | Description |
|-------|---------|-------------|
| `/api/auth/signup` | POST | Register a new user (client or freelancer) |
| `/api/auth/login` | POST | Login with email/password, returns JWT |
| `/api/auth/me` | GET | Get current authenticated user |
| `/api/gigs` | GET, POST | List gigs (with search, category, price filters) / Create gig |
| `/api/gigs/[id]` | GET, PATCH, DELETE | Get, update, or delete a specific gig |
| `/api/orders` | GET, POST | List orders (by buyer or seller) / Create order |
| `/api/orders/[id]` | PATCH | Update order status |
| `/api/reviews` | GET, POST | List reviews (by gig, order, or buyer) / Create review |
| `/api/messages` | GET, POST | List messages (by order) / Send message |
| `/api/upload` | POST | Upload image to Cloudinary |
| `/api/users` | GET | List users or get user by ID |

## Project Structure

```
src/
├── app/
│   ├── api/                    # API route handlers
│   │   ├── auth/               # Login, signup, session
│   │   ├── gigs/               # Gig CRUD
│   │   ├── orders/             # Order management
│   │   ├── reviews/            # Review system
│   │   ├── messages/           # Messaging
│   │   ├── upload/             # Image upload
│   │   └── users/              # User queries
│   ├── components/             # Shared components
│   │   ├── AuthProvider.js     # JWT auth context
│   │   ├── Navbar.js           # Navigation bar
│   │   ├── ImageUpload.js      # Drag-and-drop image upload
│   │   ├── HeroSearch.js       # Homepage search
│   │   └── PriceSlider.js      # Price range filter
│   ├── dashboard/              # Role-based dashboard
│   ├── gigs/                   # Gig pages (browse, create, edit, detail)
│   ├── messages/               # Split-pane messaging UI
│   ├── login/                  # Login page
│   ├── signup/                 # Registration page
│   ├── globals.css             # Global styles + Tailwind
│   ├── layout.js               # Root layout
│   └── page.js                 # Homepage
├── lib/
│   ├── db.js                   # MongoDB connection + Mongoose models
│   ├── jwt.js                  # JWT token utilities
│   ├── middleware.js            # Auth middleware
│   └── schemas.js              # Zod validation schemas
```

## Deployment

Deployed on **Vercel** with environment variables configured for MongoDB Atlas, JWT authentication, and Cloudinary image storage.
