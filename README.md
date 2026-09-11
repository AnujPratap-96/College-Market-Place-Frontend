<p align="center">
  <h1 align="center">🎓 CampusCart — Student Marketplace Frontend</h1>
  <p align="center">A full-featured React 19 + TypeScript SPA for a student-driven campus marketplace with real-time auctions, subscriptions, in-app messaging, escrow wallet, and more.</p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-7.0-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Redux_Toolkit-2.8-764ABC?style=for-the-badge&logo=redux&logoColor=white" />
  <img src="https://img.shields.io/badge/Socket.io-4.8-010101?style=for-the-badge&logo=socket.io&logoColor=white" />
</p>

---

## Table of Contents

- [Overview](#overview)
- [Feature Set](#feature-set)
  - [Authentication](#1-authentication)
  - [Marketplace Browse](#2-marketplace-browse)
  - [Listing Types](#3-listing-types)
  - [Product Detail](#4-product-detail)
  - [Live Auction Arena](#5-live-auction-arena)
  - [In-App Wallet](#6-in-app-wallet)
  - [Orders & OTP Pickup](#7-orders--otp-pickup)
  - [Subscriptions](#8-subscriptions)
  - [Real-Time Messaging](#9-real-time-messaging)
  - [Notifications](#10-notifications)
  - [Profile](#11-profile)
  - [Admin Dashboard](#12-admin-dashboard)
  - [Image Uploads](#13-image-uploads)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Architecture Decisions](#architecture-decisions)

---

## Overview

CampusCart is a peer-to-peer student marketplace built for college campuses. It handles four core commerce models — one-time sales, daily rentals, freelance services, and recurring hostel subscriptions — plus a fully real-time live auction engine for senior move-out sales and high-demand campus gear.

Everything is built in a strict feature-module architecture so every concern (types, API calls, components) lives next to the feature it belongs to.

---

## Feature Set

### 1. Authentication

Full multi-step registration and session management:

| Flow | Description |
|---|---|
| Email Verification | Enter college email → receive 6-digit OTP → verified before continuing |
| Signup Completion | Profile details (name, phone, college, branch, year) entered post-OTP |
| Login | Email + password with JWT token persisted in localStorage |
| Forgot Password | Email input → OTP reset → new password confirmation |
| Protected Routes | `ProtectedRoute` wrapper redirects unauthenticated users to `/auth/login` |
| Session Persistence | Redux `userSlice` re-hydrated from localStorage on app load |

---

### 2. Marketplace Browse

The main discovery feed at `/dashboard`:

- **Search** — live-debounced (350ms) full-text search across product titles
- **Category Filter** — Books, Electronics, Stationery, Cycles, Clothing, Furniture, Food, Services, and more
- **Type Filter Pills** — All Items / For Sale / For Rent / Services / Subscriptions / Live Auctions
- **Live Auctions Arena Button** — quick-jump to the dedicated auctions page
- **Product Grid** — animated cards with type badges, price formatting, and hover effects
- **Skeleton Loaders** — 8-card pulse skeleton while fetching

---

### 3. Listing Types

Four distinct product types with tailored fields and UI:

| Type | Badge | Price Format | Extra Fields |
|---|---|---|---|
| **SELL** | 🔵 For Sale | ₹{price} | — |
| **RENT** | 🟠 For Rent | ₹{price}/day | Security deposit, rental terms |
| **SERVICE** | 🟣 Campus Service | ₹{price} (One-Time) | Service duration / scope |
| **SUBSCRIPTION** | 🟢 Subscription | ₹{price}/wk or /mo | Frequency (weekly/monthly), delivery slots |
| **AUCTION** | 🔶 Live Auction | ₹{price} (Starting Bid) | Duration hours, min increment, reserve price, anti-sniping buffer |

**Create Listing Form** (`/dashboard/products/create`):

- Contextual placeholder text changes per type
- Price label changes (e.g. "Starting Bid" for auctions)
- Conditional panels slide in for Rent / Service / Subscription / Auction
- Photo upload via Supabase Storage signed URLs
- Auction listings route to `/dashboard/auctions` after creation

---

### 4. Product Detail

Rich detail page at `/dashboard/products/:id`:

- **Multi-image gallery** with thumbnail strip
- **Type badge** and category pill
- **Price display** adapts to listing type
- **Seller card** with avatar, college, and message button
- **Context-aware CTA**:
  - SELL → **Buy Now** (wallet deduction)
  - RENT → **Rent This Item** (wallet deduction, rental days)
  - SERVICE → **Book Service Now** (opens `BookServiceModal`)
  - SUBSCRIPTION → **Subscribe to Plan** (opens `SubscribeModal`)
  - AUCTION → **Place Bid** (opens `PlaceBidModal`) or **You Won! View Pickup OTP**
- Navigates to **Messages** with seller pre-selected via query params

---

### 5. Live Auction Arena

Dedicated page at `/dashboard/auctions` plus real-time integration in Product Detail.

#### Auction Listing Page
- Filter by status: ALL / ACTIVE / EXTENDED / ENDED
- Filter by category
- Live search
- `AuctionCard` shows: image, title, current bid, bid count, time remaining countdown, and EXTENDED flame badge

#### Real-Time Bidding (Socket.io)
On entering a product detail page for an AUCTION:

1. Joins a Socket.io room `auction_{id}`
2. Listens for `new_bid` events → updates current bid and bidder in real time
3. Listens for `auction_ended` → freezes clock, shows winner notice
4. On unmount, emits `leave_auction` and removes event listeners

#### AuctionCountdown Component
- Live countdown (days / hours / minutes / seconds)
- Turns red + pulsing when < 5 minutes remain
- Shows **🔥 EXTENDED** flame badge when anti-sniping triggered
- Compact mode for use inside cards

#### PlaceBidModal
- Shows current bid and minimum required bid
- Quick-increment pills (+50 / +100 / +200 / +500 above current)
- Validates wallet balance before submitting
- Escrow protection banner explaining wallet hold
- Instant success feedback + auto-close

#### BidFeed Component
- Real-time scrolling list of all bids
- Avatar + name + bid amount + time
- 🏆 Trophy pill on the current highest bidder row

#### Anti-Sniping
If a bid arrives within 30 seconds of the auction end time, the server automatically extends the clock. The `EXTENDED` status badge appears on all clients in real time.

#### Wallet Escrow
- Every bid locks the bid amount in the bidder's `escrowBalance`
- Outbid → instant refund to `balance`
- Winner settlement creates an `Order` with status `ESCROW_HELD` and a 6-digit pickup OTP

---

### 6. In-App Wallet

Accessible from the header via `WalletPill` on every page.

**WalletPill**
- Displays live `₹{balance}` from Redux state
- Shows `(₹{escrowBalance} escrow)` when funds are held in active auctions
- Click opens `WalletModal`

**WalletModal — 3 Tabs**

| Tab | Feature |
|---|---|
| **Overview** | Available balance card, In Escrow card, quick top-up buttons (₹200 / ₹500 / ₹1000 / ₹2000 / custom) |
| **Send Money** | Recipient (phone/email), amount, optional note — instant peer transfer |
| **Ledger** | Full transaction history with CREDIT/DEBIT/HOLD/RELEASE/REFUND badges, color-coded |

Wallet state is managed in Redux (`walletSlice`) and re-fetched after every transaction.

---

### 7. Orders & OTP Pickup

Orders page at `/dashboard/orders`:

- Tabs: **All / As Buyer / As Seller**
- Status pipeline:
  ```
  PENDING → CONFIRMED → ESCROW_HELD → PICKUP_VERIFIED → COMPLETED
  ```
- **Seller actions**: Confirm order, Cancel order
- **OTP Verification**: Seller enters the buyer's 6-digit OTP to mark `PICKUP_VERIFIED`
- **Buyer actions**: View pickup OTP, mark received
- **Auction orders** show auction badge and `AUC-` prefixed order number
- Formatted price display with platform fee breakdown
- Empty states per tab

---

### 8. Subscriptions

Page at `/dashboard/subscriptions`:

- View all active subscriptions as subscriber
- View all active plans as provider
- Status: ACTIVE / PAUSED / CANCELLED
- Pause / Resume / Cancel controls
- Subscription start date, next billing date
- Delivery slot and frequency display
- Managed via `SubscribeModal` on product detail

---

### 9. Real-Time Messaging

Full in-app chat at `/dashboard/messages`:

- **Conversation list** — all chats with unread badge counts
- **Message thread** — chronological message bubbles with timestamps
- Socket.io powered — messages appear instantly without page refresh
- Unread count badge on sidebar nav link, auto-cleared on conversation open
- Pre-select a seller from any Product Detail page (`?userId=&productId=`)
- `NotificationBell` in header shows real-time notification count

---

### 10. Notifications

`NotificationBell` in the header:

- Receives real-time server push events via Socket.io
- Dropdown list of recent notifications
- Mark as read / mark all as read
- Notification types include: new bid, outbid alert, auction won, auction sold, new message, order confirmed, order completed

---

### 11. Profile

Page at `/dashboard/profile`:

- Edit name, phone, college, branch, year of study
- Upload profile photo (Supabase Storage)
- Change password
- Account stats summary (listings, orders, subscriptions)

---

### 12. Admin Dashboard

Restricted to users with `ADMIN` role at `/dashboard/admin`:

- Platform-wide statistics
- User management
- Listing moderation (flag / remove)
- Order oversight
- Platform commission rate configuration

---

### 13. Image Uploads

`ImageUploader` component handles all photo uploads:

- Calls backend for a **Supabase signed upload URL**
- Uploads directly from browser to Supabase Storage (no server bandwidth used)
- Returns a permanent CDN URL stored in the database
- Used on: Create Listing, Profile photo

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 19 (with concurrent features) |
| **Language** | TypeScript 5.8 (strict mode) |
| **Build Tool** | Vite 7 |
| **Styling** | Tailwind CSS v4 + `tw-animate-css` |
| **Component Library** | Radix UI primitives (Dialog, Select, Tabs, Dropdown, Avatar, etc.) |
| **Design System** | Custom `shadcn/ui`-style components in `src/components/ui/` |
| **Animation** | Framer Motion 12 |
| **Icons** | Lucide React |
| **State Management** | Redux Toolkit + React-Redux |
| **Routing** | React Router DOM v7 |
| **HTTP Client** | Axios (with base URL and auth token interceptor) |
| **Real-Time** | Socket.io Client v4 |
| **Forms** | React Hook Form v7 |
| **Theme** | next-themes (dark / light / system) |
| **Utilities** | clsx, class-variance-authority, tailwind-merge |

---

## Project Structure

```
Frontend/
├── src/
│   ├── components/
│   │   ├── auth/                   # Login, Signup, OTP, ForgotPassword flows
│   │   ├── landing/                # Landing page sections
│   │   ├── layout/
│   │   │   ├── Header.tsx          # Top bar with WalletPill, NotificationBell, theme toggle
│   │   │   ├── Sidebar.tsx         # Nav links with unread message badge
│   │   │   └── DashboardLayout.tsx # Shell wrapping all dashboard pages
│   │   └── ui/                     # Reusable primitives (button, card, dialog, badge, etc.)
│   │
│   ├── modules/                    # Feature modules (co-located types + API + components)
│   │   ├── admin/
│   │   ├── auctions/
│   │   │   ├── auction.types.ts
│   │   │   ├── auction.api.ts
│   │   │   └── components/
│   │   │       ├── AuctionCard.tsx
│   │   │       ├── AuctionCountdown.tsx
│   │   │       ├── BidFeed.tsx
│   │   │       └── PlaceBidModal.tsx
│   │   ├── messages/
│   │   │   ├── message.types.ts
│   │   │   ├── message.api.ts
│   │   │   ├── socket.client.ts    # Socket.io singleton
│   │   │   └── components/
│   │   ├── notifications/
│   │   ├── orders/
│   │   ├── products/
│   │   │   ├── product.types.ts
│   │   │   ├── product.api.ts
│   │   │   └── components/
│   │   │       ├── ProductCard.tsx
│   │   │       └── CreateListingForm.tsx
│   │   ├── subscriptions/
│   │   ├── upload/
│   │   └── wallet/
│   │       ├── wallet.types.ts
│   │       ├── wallet.api.ts
│   │       └── components/
│   │           ├── WalletPill.tsx
│   │           └── WalletModal.tsx
│   │
│   ├── pages/                      # Route-level page components
│   │   ├── Home.tsx                # Browse marketplace
│   │   ├── Auctions.tsx            # Live Auction Arena
│   │   ├── ProductDetail.tsx       # Single product + auction + bidding
│   │   ├── CreateListing.tsx
│   │   ├── Orders.tsx
│   │   ├── Subscriptions.tsx
│   │   ├── Messages.tsx
│   │   ├── Profile.tsx
│   │   └── AdminDashboard.tsx
│   │
│   ├── router/
│   │   └── index.tsx               # createBrowserRouter config
│   │
│   ├── store/                      # Redux Toolkit slices
│   │   ├── store.tsx
│   │   ├── userSlice.ts
│   │   ├── walletSlice.ts
│   │   ├── messagesSlice.ts
│   │   └── notificationSlice.ts
│   │
│   ├── utils/
│   │   └── Axios.ts                # Configured Axios instance (base URL + auth header)
│   │
│   └── lib/
│       └── utils.ts                # cn(), formatDistanceToNow()
│
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.app.json
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 20+ and npm
- The [Backend](../Backend/README.md) server running locally or deployed

### Install Dependencies

```bash
cd Frontend
npm install
```

### Configure Environment

```bash
cp .env.example .env
# Fill in VITE_API_URL and VITE_SOCKET_URL
```

### Start Development Server

```bash
npm run dev
```

The app is available at `http://localhost:5173`.

---

## Environment Variables

| Variable | Example | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:3000/api` | Backend REST API base URL |
| `VITE_SOCKET_URL` | `http://localhost:3000` | Socket.io server URL |

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | TypeScript compile + Vite production build |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint across all TypeScript files |

---

## Architecture Decisions

**Feature-module layout** — every module owns its own types, API client, and components. This makes each feature independently testable and portable.

**Redux only for cross-cutting state** — `userSlice`, `walletSlice`, `messagesSlice`, and `notificationSlice` are global. All page-local state stays in component `useState`.

**Socket.io singleton** — `socket.client.ts` exports a `getSocket()` helper that initialises the connection once and reuses it. Components call `emit` and `on` directly; cleanup is handled in `useEffect` return functions.

**Signed URL uploads** — the browser requests a Supabase signed PUT URL from the backend and uploads the file directly. The backend never sees the binary; it only stores the resulting CDN URL. This keeps server costs near zero.

**Escrow auction bidding** — every bid locks the exact bid amount in the bidder's `escrowBalance`. An outbid event instantly releases the previous bidder's funds back to their spendable `balance`. The winner's escrow converts to a confirmed order only after the seller scans the OTP.

**Zero comments policy** — the entire codebase contains no inline or block comments. Types, naming conventions, and module boundaries serve as the documentation.
