# Beyond Tickets — Multi-Category Ticket Booking Marketplace

**Beyond Tickets** is a modern, production-oriented, multi-category ticket booking platform engineered to eliminate checkout surprises with **100% transparent pricing and zero hidden fees**.

It unifies ticketing across **8 core categories** — Live Concerts, Sports Fixtures, Stand-Up Comedy, Movies & Cinema, Intercity Luxury Buses, Tech Conferences, Theme Parks & Activities, and Cultural Heritage Festivals.

---

## 🌟 Key Product Features

1. **Unified Marketplace & Mobile-First UI**
   - High-performance React 18 + Vite + TypeScript frontend styled with a custom Tailwind CSS dark theme (Deep Indigo `#4F46E5`, Amber `#F59E0B`, Slate `#0F172A`).
   - Category exploration pills, city selector, search suggestions, and responsive event cards.

2. **Transparent Pricing Guarantee**
   - No surprise ₹250 booking fees on the payment screen.
   - Upfront itemized invoices: Ticket Subtotal, 5% Disclosed Platform Fee, and GST.

3. **Atomic Inventory & 10-Minute Cart Lock**
   - Real database concurrency protection with `select_for_update()` on general admission pools and reserved seats.
   - 10-minute hold countdown timer with automatic inventory release if checkout is abandoned.

4. **Digital Pass Wallet & Real QR Codes**
   - Cryptographically secure tokens for every pass issued (NOT primary keys).
   - Real, scannable PNG QR codes generated with `qrcode`.
   - Apple Wallet style presentation with seat assignments and venue details.

5. **Venue Gate QR Scanner Simulator (`/scanner`)**
   - Check-in terminal simulation for venue staff & gate scanners.
   - Live visual status: **ACCESS GRANTED**, **ALREADY SCANNED (Duplicate entry rejection)**, or **ACCESS DENIED**.
   - Real-time gate scan audit history log.

6. **Organizer Operations Portal (`/organizer`)**
   - Revenue analytics, ticket sales velocity, active event listings, and gate check-in rates.
   - Attendee check-in rosters with instant search.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies |
|---|---|
| **Backend** | Django 5.1, Django REST Framework 3.15, SimpleJWT, Celery, Redis, SQLite (Dev) / PostgreSQL 16 (Prod) |
| **API Docs** | drf-spectacular (OpenAPI 3.0 / Swagger UI / Redoc) |
| **Frontend** | React 18, Vite 6, TypeScript 5.6+, Tailwind CSS 3.4, React Router 6, Axios, Lucide Icons |
| **Payments** | Razorpay SDK + Instant Verified Sandbox Adapter |
| **Storage** | Django FileSystemStorage / WhiteNoise static files / MinIO / AWS S3 ready |

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- Python 3.12+ (or 3.14)
- Node.js 20+

### 1. Backend Setup
```bash
cd backend
# Activate virtual environment
.venv\Scripts\activate   # Windows
# source .venv/bin/activate # Linux/macOS

# Apply migrations
python manage.py migrate

# Seed demonstration data
python manage.py seed_data

# Run dev server on port 8001
python manage.py runserver 127.0.0.1:8001
```

### 2. Frontend Setup
```bash
cd frontend
# Install dependencies
npm install --legacy-peer-deps

# Run Vite dev server on port 5173
npm run dev
```

Open your browser to: **[http://127.0.0.1:5173](http://127.0.0.1:5173)**

---

## 👤 Pre-Seeded Demonstration Accounts

For one-click testing, click any of the demo login buttons on the `/login` page:

| Role | Email | Password | Access |
|---|---|---|---|
| **Customer** | `customer@example.com` | `Customer@123` | Browsing, cart holds, ticket wallet, booking history |
| **Organizer** | `organizer@beyondtickets.com` | `Organizer@123` | Organizer portal, sales metrics, attendee roster |
| **Admin** | `admin@beyondtickets.com` | `Admin@123456` | Platform-wide administration and Django Admin at `/admin/` |

---

## 🧪 Automated Test Suite

Run unit and integration tests across listings, reservations, orders, tickets, and gate scanning:

```bash
cd backend
.venv\Scripts\pytest -v
```

---

## 📁 Repository Structure

```
d:\Project\Planora\
├── backend/
│   ├── apps/
│   │   ├── accounts/          # Custom User, JWT auth, permissions
│   │   ├── categories/        # 8 core categories + seed data
│   │   ├── listings/          # Listings, venues, sessions, media
│   │   ├── inventory/         # Ticket types, inventory pools, seats
│   │   ├── reservations/      # 10-min hold engine & price snapshot
│   │   ├── orders/            # Orders, order items, attendees
│   │   ├── payments/          # Razorpay & Sandbox capture
│   │   ├── tickets/           # Digital passes, QR codes, gate scanner
│   │   ├── organizer/         # Organizer analytics & rosters
│   │   ├── movies/            # Cinemas, screens, showtimes, seat maps
│   │   ├── buses/             # Bus operators, routes, trips, boarding
│   │   ├── sports/            # Match fixtures, teams, sections
│   │   └── audit/             # Platform audit logging
│   ├── config/                # Django settings, routing, WSGI/ASGI
│   ├── manage.py
│   └── pytest.ini
├── frontend/
│   ├── src/
│   │   ├── components/        # Navbar, Footer, EventCard
│   │   ├── context/           # AuthContext (JWT auth & demo logins)
│   │   ├── lib/               # Axios API client with auto-refresh
│   │   ├── pages/             # Home, Explore, EventDetail, Checkout, Success, MyTickets, Scanner, Organizer, Orders, Login, Register
│   │   ├── types/             # TypeScript interfaces
│   │   ├── App.tsx            # Main router
│   │   └── main.tsx           # React entry point
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── package.json
├── docker-compose.yml
├── .env.example
└── README.md
```
