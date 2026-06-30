<div align="center">

# 🏍️ Bike Auction Platform

**A production-quality real-time auction platform for used motorcycles, built with the MERN stack.**

[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)](https://docker.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

[Live Demo](https://bike-auction-platform.vercel.app) · [API Health](https://bike-auction-api.onrender.com/api/health) · [Report Bug](https://github.com/sumitgupta24/bike-auction-platform/issues)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Database Schema](#-database-schema)
- [API Design](#-api-design)
- [Engineering Decisions](#-engineering-decisions)
- [Local Setup](#-local-setup)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Trade-offs & Future Improvements](#-trade-offs--future-improvements)

---

## 🔭 Overview

A full-stack real-time bike auction platform where registered users can browse, list, and bid on used motorcycles. Built as an intern assignment with emphasis on **engineering depth over feature breadth** — every decision is deliberate and documented.

**Test Credentials**

| Role   | Email                                           | Password   |
|--------|-------------------------------------------------|------------|
| Admin  | admin@test.com                                  | admin123   |
| Seller | seller1@test.com, seller2@test.com              | seller123  |
| Buyer  | buyer1@test.com, buyer2@test.com, buyer3@test.com | buyer123   |

> ℹ️ Admin actions (approve listings, create auctions) are performed directly via the API using a JWT. No admin UI is provided — this was a deliberate scope decision.

---

## ✨ Features

- 🔐 **JWT Authentication** — register, login, role-based access (buyer / seller / admin)
- 🏍️ **Bike Listings** — sellers create listings, admin approves them before they go live
- 🏁 **Auction Lifecycle** — automated `scheduled → live → ended` transitions via cron
- ⚡ **Real-time Bidding** — live bid feed powered by Server-Sent Events (SSE)
- 🔒 **Atomic Bids** — MongoDB transactions ensure bid + price update are always in sync
- 📋 **Bid History** — full history per auction, open to all users
- 📡 **Structured Logging** — every request logged as JSON with a unique request ID
- 🐳 **One-command Setup** — entire stack runs with `docker compose up`

---

## 🛠 Tech Stack

| Layer        | Technology                          |
|--------------|-------------------------------------|
| Frontend     | React 18, Vite, Tailwind CSS        |
| Backend      | Node.js, Express.js                 |
| Database     | MongoDB 7 with Mongoose             |
| Real-time    | Server-Sent Events (SSE)            |
| Auth         | JWT (jsonwebtoken, bcryptjs)        |
| Scheduler    | node-cron                           |
| Logging      | Morgan + custom JSON logger         |
| Testing      | Jest + Supertest                    |
| Infra (local)| Docker Compose                      |
| Hosting      | Render (backend), Vercel (frontend) |
| DB (prod)    | MongoDB Atlas (M0 free tier)        |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│              React SPA (Vite + Tailwind)                    │
│         REST calls + SSE stream (EventSource)               │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP / SSE
┌────────────────────────▼────────────────────────────────────┐
│                   Express API  :5001                        │
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│  │  Routes  │ │Middleware│ │ Services │ │  Scheduler   │  │
│  │ auth     │ │ protect  │ │  bid     │ │  node-cron   │  │
│  │ listings │ │ requireR │ │ auction  │ │  every 30s   │  │
│  │ auctions │ │ requestId│ │  sse     │ │  open/close  │  │
│  │ bids     │ │ errorHdlr│ │          │ │  auctions    │  │
│  │ admin    │ └──────────┘ └──────────┘ └──────────────┘  │
│  └──────────┘                                               │
└───────────┬────────────────────────┬────────────────────────┘
            │                        │
┌───────────▼──────────┐  ┌──────────▼───────────┐
│      MongoDB         │  │   SSE Client Map      │
│  (Replica Set for    │  │  Map<auctionId,       │
│   transactions)      │  │    Set<Response>>     │
│                      │  │  in-process fan-out   │
│  users               │  └───────────────────────┘
│  listings            │
│  auctions            │
│  bids                │
└──────────────────────┘
```

**Request flow for a bid:**

```
Client → POST /api/auctions/:id/bids
       → protect middleware (verify JWT)
       → requireRole('buyer')
       → bid.service.js
           → validate auction is live
           → validate amount > currentPrice
           → MongoDB transaction:
               → insert Bid document
               → update Auction.currentPrice + bidCount
           → SSE fan-out to all watchers
       → 201 { data: bid, meta: { requestId } }
```

---

## 🗄 Database Schema

```js
User {
  email:        String  (unique, required),
  passwordHash: String  (never returned in responses),
  role:         Enum['buyer', 'seller', 'admin'],
  createdAt:    Date
}

Listing {
  sellerId:     ObjectId → User,
  make:         String,
  model:        String,
  year:         Number,
  description:  String,
  photoUrl:     String,
  status:       Enum['draft', 'approved'],
  createdAt:    Date
}

Auction {
  listingId:    ObjectId → Listing  (unique),
  startsAt:     Date,
  endsAt:       Date,
  reservePrice: Number,
  currentPrice: Number,
  status:       Enum['scheduled', 'live', 'ended', 'cancelled'],
  winnerId:     ObjectId → User  (nullable),
  bidCount:     Number,
  createdAt:    Date
}

Bid {
  auctionId:    ObjectId → Auction,
  bidderId:     ObjectId → User,
  amount:       Number,
  placedAt:     Date
}
```

> **Why 4 tables?** Each collection maps to exactly one domain aggregate. No premature normalisation, no embedded documents for things that need to be queried independently.

---

## 🔌 API Design

All responses follow a standard envelope:

```json
// Success
{ "data": { ... }, "meta": { "requestId": "uuid" } }

// Error
{ "error": { "code": "BID_TOO_LOW", "message": "Bid must exceed current price of $1200" }, "meta": { "requestId": "uuid" } }
```

### Endpoints

| Method | Endpoint                             | Auth         | Description                          |
|--------|--------------------------------------|--------------|--------------------------------------|
| POST   | `/api/auth/register`                 | Public       | Register, returns JWT                |
| POST   | `/api/auth/login`                    | Public       | Login, returns JWT                   |
| GET    | `/api/listings`                      | Public       | All listings                         |
| POST   | `/api/listings`                      | Seller       | Create listing (draft)               |
| GET    | `/api/auctions`                      | Public       | All auctions, `?status=live` filter  |
| GET    | `/api/auctions/:id`                  | Public       | Single auction detail                |
| POST   | `/api/auctions`                      | Admin        | Schedule an auction for a listing    |
| GET    | `/api/auctions/:id/bids`             | Public       | Bid history for an auction           |
| POST   | `/api/auctions/:id/bids`             | Buyer        | Place a bid                          |
| GET    | `/api/auctions/:id/stream`           | Public       | SSE stream for live bid updates      |
| POST   | `/api/admin/listings/:id/approve`    | Admin        | Approve a draft listing              |
| GET    | `/api/health`                        | Public       | Health check                         |

---

## ⚙️ Engineering Decisions

### 1. MongoDB Transactions for Bid Atomicity
When a bid is placed, two writes must succeed together:
1. Insert a `Bid` document
2. Update `Auction.currentPrice` and `Auction.bidCount`

These are wrapped in a **MongoDB session transaction**. If either write fails, both are rolled back. This prevents a bid existing in the database without the auction price reflecting it — a silent financial inconsistency that would be very hard to debug later.

> **Requirement:** Transactions require MongoDB to run as a Replica Set. The Docker Compose setup configures a single-node replica set automatically.

### 2. SSE over WebSocket for Real-time
The bid feed is **unidirectional** — the server pushes new bid data to watching clients. SSE is the correct tool for this:
- Works over standard HTTP (no upgrade handshake)
- Automatic reconnection built into the browser `EventSource` API
- No socket server or additional library needed
- Passes through standard HTTP infrastructure (proxies, load balancers)

WebSocket would add bidirectional complexity with zero benefit for a read-only feed.

### 3. node-cron In-process Scheduler
A cron job fires every 30 seconds to open scheduled auctions and close expired ones. Running it inside the API process is appropriate for a single instance.

**Known trade-off:** if the API scales horizontally, the cron fires on every pod. The production fix is a **Redis `SETNX` distributed lock** — only the pod that acquires the lock runs the job. Documented here as a future improvement rather than over-engineered for this scope.

### 4. Structured JSON Logging
Every request gets a `requestId` (`crypto.randomUUID()`) attached in middleware. All log lines include it:

```json
{ "level": "info", "msg": "bid placed", "requestId": "abc-123", "auctionId": "...", "amount": 1500, "ts": "2024-01-01T..." }
```

This makes it trivial to trace a full request lifecycle in any log aggregation tool (Datadog, ELK, CloudWatch).

### 5. Render + Vercel Hosting Split
- **Render** for the backend: native support for long-lived HTTP connections, which is critical for SSE. Many platforms (including Vercel serverless functions) impose response timeouts that would kill SSE streams. `X-Accel-Buffering: no` header is set on SSE routes to disable Render's response buffering.
- **Vercel** for the frontend: edge CDN with zero config for a Vite SPA, fast global asset delivery, and automatic HTTPS.

---

## 💻 Local Setup

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/sumitgupta24/bike-auction-platform
cd bike-auction-platform

# 2. Copy environment variables
cp backend/.env.example backend/.env

# 3. Start all services (API, frontend, MongoDB replica set, Mongo Express)
docker compose up -d

# 4. Seed the database
docker compose exec backend npm run seed
```

| Service       | URL                        |
|---------------|----------------------------|
| Frontend      | http://localhost:5174       |
| Backend API   | http://localhost:5001/api   |
| Health Check  | http://localhost:5001/api/health |
| Mongo Express | http://localhost:8082       |

> **Mongo Express** gives you a browser UI to inspect the database directly — useful during development and evaluation.

### Environment Variables

```bash
# backend/.env.example
MONGO_URI=mongodb://mongo:27017/bike-auction?replicaSet=rs0
JWT_SECRET=your_jwt_secret_here
PORT=5001
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5174
```

---

## 🧪 Testing

Tests use **Jest + Supertest** against an isolated test database (dropped and re-seeded before each test file).

```bash
cd backend
npm install
npm test
```

### Test Coverage

| File               | What is tested                                                                 |
|--------------------|--------------------------------------------------------------------------------|
| `auth.test.js`     | Register (valid, duplicate email), Login (correct, wrong password)             |
| `bids.test.js`     | Successful bid, bid below price, bid on non-live auction, seller bids own item |

```
backend/tests/
├── auth.test.js
├── bids.test.js
└── helpers/
    └── seed.js     ← creates admin, seller, buyer + live auction before each suite
```

---

## 🚀 Deployment

### Overview

```
GitHub Repo
    │
    ├──► Vercel       (frontend — auto-deploy on push to main)
    │
    └──► Render       (backend  — auto-deploy on push to main)
                            │
                            └──► MongoDB Atlas  (M0 free cluster)
```

---

### Phase 1 — Database: MongoDB Atlas

1. Create a free **M0 cluster** at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. **Network Access** → Add IP `0.0.0.0/0` *(Render's IPs are dynamic on the free tier)*
3. **Database Access** → Create a user (e.g. `bikeadmin`), save the password
4. **Databases** → Connect → Drivers → copy the connection string
   ```
   mongodb+srv://bikeadmin:<password>@cluster0.xxxxx.mongodb.net/bike-auction?retryWrites=true&w=majority
   ```

---

### Phase 2 — Frontend: Vercel

1. Push your code to GitHub
2. [vercel.com](https://vercel.com) → **Add New Project** → import your repo
3. **Root Directory** → set to `frontend`
4. **Framework Preset** → Vite (auto-detected)
5. Skip environment variables for now → **Deploy**
6. Copy your Vercel domain (e.g. `https://bike-auction-platform.vercel.app`)

---

### Phase 3 — Backend: Render

1. [render.com](https://render.com) → **New Web Service** → connect your GitHub repo
2. Render detects `render.yaml` automatically and configures build + start commands
3. Set these **Environment Variables** in the Render dashboard:

   | Key             | Value                                      |
   |-----------------|--------------------------------------------|
   | `MONGO_URI`     | Your Atlas connection string               |
   | `JWT_SECRET`    | Any long random string                     |
   | `CLIENT_ORIGIN` | Your Vercel URL (e.g. `https://bike-auction-platform.vercel.app`) |
   | `NODE_ENV`      | `production`                               |

4. Deploy → copy your Render URL (e.g. `https://bike-auction-api.onrender.com`)

---

### Phase 4 — Final Wiring

1. Vercel dashboard → your project → **Settings** → **Environment Variables**
2. Add:

   | Key            | Value                                                  |
   |----------------|--------------------------------------------------------|
   | `VITE_API_URL` | `https://bike-auction-api.onrender.com/api`            |

3. **Redeploy** the frontend on Vercel
4. ✅ Platform is live — visit your Vercel URL to confirm

---

## 📊 Trade-offs & Future Improvements

| Area             | Current approach                        | Production improvement                                      |
|------------------|-----------------------------------------|-------------------------------------------------------------|
| Bid ordering     | MongoDB transaction                     | Redis sorted set (`ZADD NX GT`) for atomic ordering under high concurrency |
| Scheduler        | node-cron in API process                | Dedicated worker + Redis `SETNX` distributed lock across pods |
| Real-time scale  | SSE, in-process client map              | Redis pub/sub adapter to fan-out across multiple API instances |
| Auth             | JWT, 24h expiry, localStorage           | Refresh token rotation, httpOnly cookies                    |
| Search           | Mongoose query + filter                 | MongoDB Atlas Search / Elasticsearch for full-text          |
| Payments         | Winner marked `payment_pending` in DB   | Stripe Payment Intents — capture on win, release on loss    |
| Rate limiting    | None                                    | express-rate-limit per user on the bid endpoint             |
| Auto-bidding     | Not implemented                         | Proxy bidding with max amount, re-bids automatically        |

---

## 📁 Project Structure

```
/
├── backend/
│   ├── src/
│   │   ├── routes/          auth.routes.js, listings.routes.js, auctions.routes.js, bids.routes.js, admin.routes.js, health.routes.js
│   │   ├── controllers/     auth.controller.js, listings.controller.js, auctions.controller.js, bids.controller.js, admin.controller.js, health.controller.js
│   │   ├── middleware/      protect.js, requireRole.js, requestId.js, errorHandler.js
│   │   ├── models/          User.js, Listing.js, Auction.js, Bid.js
│   │   ├── services/        bid.service.js, auction.service.js, sse.service.js
│   │   ├── lib/             logger.js, scheduler.js
│   │   ├── db/              seed.js
│   │   └── index.js
│   ├── tests/
│   │   ├── auth.test.js
│   │   ├── bids.test.js
│   │   └── helpers/seed.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/            AuctionList.jsx, AuctionDetail.jsx, Auth.jsx
│   │   ├── components/       AuctionCard.jsx, BidForm.jsx, BidFeed.jsx, Countdown.jsx
│   │   └── lib/              api.js, AuthContext.jsx
│   ├── vercel.json
│   └── package.json
├── render.yaml
├── docker-compose.yml
└── README.md
```

---

## 👤 Author

**Sumit Gupta**

[![GitHub](https://img.shields.io/badge/GitHub-sumitgupta24-181717?style=flat-square&logo=github)](https://github.com/sumitgupta24)
[![Portfolio](https://img.shields.io/badge/Portfolio-sumitgupta24.github.io-0A66C2?style=flat-square&logo=google-chrome&logoColor=white)](https://sumitgupta24.github.io/Portfolio)

---

<div align="center">
  <sub>Built with ❤️ as a software engineering intern assignment</sub>
</div>
