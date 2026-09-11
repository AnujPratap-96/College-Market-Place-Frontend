# Frontend Modular Architecture & Subscriptions Redesign Spec

- **Status**: Approved for Implementation
- **Target**: College Marketplace Frontend (`College Marketplace/Frontend`)
- **Date**: 2026-09-09

---

## 1. Objectives

1. **Restructure Frontend into Feature-Driven Modules**: Migrate from a flat, tightly coupled structure (`pages/`, monolithic `api.ts`, mixed `components/`) into cohesive domain modules under `src/modules/` (`auth`, `products`, `orders`, `subscriptions`, `wallet`).
2. **Unified Catalog Types**: Support all 4 listing types in listing creation and discovery:
   - `SELL`: Outright physical goods.
   - `RENT`: Rentals with security deposit and duration.
   - `SERVICE`: One-time gigs and tasks with duration and preferred booking times.
   - `SUBSCRIPTION`: Recurring meal plans and laundry deliveries with frequencies and delivery slots.
3. **Interactive Service & Order Workflows**:
   - OTP Handshakes for permanent sales and rentals (pickup and return).
   - Provider "Mark Completed" (`DELIVERED`) and Client "Confirm & Release" (`COMPLETED`) for service orders.
   - Order dispute submission for admin arbitration.
4. **Recurring Subscriptions Management**:
   - Student view: Active subscription cards, daily delivery schedule calendar.
   - Vacation Mode: Date-range picker with instant pro-rata wallet refund calculation.
   - Missed Delivery Reporting: 1-click issue reporting with instant daily rate refund.
   - Provider Manifest: Today's delivery roster with student contact and delivery slot details.
5. **Interactive Wallet Hub**:
   - Header balance pill showing available and escrow balances.
   - Slide-over drawer with Top-Up simulation, peer transfer, and double-entry ledger history.

---

## 2. Directory Architecture

```text
src/
├── components/
│   ├── ui/                         # Base primitives (Button, Card, Dialog, Sheet, Tabs, Input, Badge, etc.)
│   └── layout/                     # App shell (Header.tsx, Sidebar.tsx, Footer.tsx, DashboardLayout.tsx)
│
├── modules/
│   ├── auth/                       # Authentication & session
│   │   ├── components/             # LoginForm, SignUpForm, OtpInput, ForgotPassword
│   │   ├── auth.api.ts             # Authentication endpoints
│   │   └── auth.types.ts           # User, AuthState, LoginCredentials
│   │
│   ├── products/                   # Catalog & listing creation
│   │   ├── components/             # ProductCard, ProductGrid, FilterBar, CreateListingForm
│   │   ├── product.api.ts          # Catalog endpoints
│   │   └── product.types.ts        # Product, ProductType, Category
│   │
│   ├── orders/                     # Orders & one-time services
│   │   ├── components/             # OrderCard, OtpHandshakeModal, ServiceActionButtons, DisputeModal
│   │   ├── order.api.ts            # Orders endpoints
│   │   └── order.types.ts          # Order, OrderStatus, OrderType
│   │
│   ├── subscriptions/              # Recurring delivery plans
│   │   ├── components/             # SubscriptionCard, DeliveryScheduleCalendar, VacationModal, MissedDeliveryModal, ProviderManifestTable
│   │   ├── subscription.api.ts     # Subscription endpoints
│   │   └── subscription.types.ts   # Subscription, SubscriptionDelivery, SubscriptionFrequency
│   │
│   └── wallet/                     # Double-entry ledger & escrow
│       ├── components/             # WalletPill, WalletDrawer, TopupModal, TransferModal, LedgerTable
│       ├── wallet.api.ts           # Wallet endpoints
│       └── wallet.types.ts         # Wallet, LedgerEntry, LedgerType
│
├── pages/                          # Thin page wrappers
│   ├── Home.tsx                    # Marketplace browse
│   ├── Products.tsx                # My listings
│   ├── ProductDetail.tsx           # Listing details + contextual booking modals
│   ├── CreateListing.tsx           # Multi-type listing form
│   ├── Orders.tsx                  # My Purchases & Sales tabs
│   ├── Subscriptions.tsx           # Student Subscriptions & Provider Manifest tabs
│   └── Profile.tsx                 # Profile & settings
│
├── router/index.tsx                # Route definitions with ProtectedRoute
├── store/                          # Redux store & slices
│   ├── store.tsx                   # Store configuration
│   ├── userSlice.ts                # User profile state
│   └── walletSlice.ts              # Live wallet & escrow balance state
└── utils/Axios.ts                  # Axios instance configured with baseURL and JWT interceptor
```

---

## 3. Module Specifications & Contracts

### 3.1 Products Module (`src/modules/products`)
- **Types**:
  - `ProductType`: `'SELL' | 'RENT' | 'SERVICE' | 'SUBSCRIPTION'`
  - `frequency`: `'WEEKLY' | 'MONTHLY'` (optional, for `SUBSCRIPTION`)
  - `deliverySlots`: `string` (optional, for `SUBSCRIPTION`)
  - `serviceDuration`: `string` (optional, for `SERVICE`)
- **Components**:
  - `CreateListingForm`:
    - Dropdown to select listing type (`Sell`, `Rent`, `Service`, `Subscription`).
    - Dynamic fields display based on chosen type.
  - `ProductCard`:
    - Shows category, title, price, and type badge (e.g., `SERVICE` in purple, `SUBSCRIPTION` in green, `RENT` in orange).
- **API Functions**:
  - `fetchProducts(filters)`: `GET /products`
  - `fetchProductById(id)`: `GET /products/:id`
  - `createProduct(payload)`: `POST /products`
  - `deleteProduct(id)`: `DELETE /products/:id`

### 3.2 Orders Module (`src/modules/orders`)
- **Types**:
  - `OrderStatus`: `'PENDING_PAYMENT' | 'ESCROW_HELD' | 'RENTAL_ACTIVE' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED' | 'REFUNDED'`
  - `OrderType`: `'PURCHASE' | 'RENTAL' | 'SERVICE'`
- **Components**:
  - `OrderCard`: Shows order number, product thumbnail, total amount, status badge, and role-based actions.
  - `OtpHandshakeModal`: Buyer view displays pickup/return OTP; seller view presents input field to verify and complete transaction.
  - `ServiceActionButtons`:
    - Provider view: `Mark Service Completed` button (`POST /orders/:id/service-complete`).
    - Buyer view: `Confirm & Release Funds` button (`POST /orders/:id/service-confirm`).
  - `DisputeModal`: Form to submit dispute reason and notes (`POST /orders/:id/dispute`).
- **API Functions**:
  - `getMyOrders()`: `GET /orders/my-orders`
  - `getMySales()`: `GET /orders/my-sales`
  - `bookService(payload)`: `POST /orders/service-book`
  - `verifyHandover(orderId, otp)`: `POST /orders/:id/verify-handover`
  - `verifyReturn(orderId, otp)`: `POST /orders/:id/verify-return`
  - `completeService(orderId)`: `POST /orders/:id/service-complete`
  - `confirmService(orderId)`: `POST /orders/:id/service-confirm`
  - `cancelOrder(orderId)`: `POST /orders/:id/cancel`
  - `disputeOrder(orderId, payload)`: `POST /orders/:id/dispute`

### 3.3 Subscriptions Module (`src/modules/subscriptions`)
- **Types**:
  - `SubscriptionStatus`: `'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'EXPIRED' | 'DISPUTED'`
  - `DeliveryScheduleStatus`: `'SCHEDULED' | 'COMPLETED' | 'SKIPPED' | 'MISSED'`
- **Components**:
  - `SubscriptionCard`: Details plan title, provider name, cycle amount, next renewal date, and action triggers.
  - `DeliveryScheduleCalendar`: Chronological list of daily delivery slots with status badges.
  - `VacationModal`:
    - Date range input (`vacationFrom` to `vacationTo`).
    - Real-time calculator: `pausedDays = count(deliveries in range)`.
    - Live refund preview: `refundAmount = (cycleAmount / totalDeliveries) * pausedDays`.
    - Submit calls `POST /subscriptions/:id/vacation` and updates wallet balance.
  - `MissedDeliveryModal`: Form to report missed delivery with reason; displays instant pro-rata refund upon submission (`POST /subscriptions/:id/report-missed`).
  - `ProviderManifestTable`: Table for tiffin/laundry providers displaying today's scheduled deliveries, student names, phone numbers, and delivery slots.
- **API Functions**:
  - `getMySubscriptions()`: `GET /subscriptions/my`
  - `getProviderManifest()`: `GET /subscriptions/provider/manifest`
  - `createSubscription(payload)`: `POST /subscriptions/subscribe`
  - `setVacation(id, fromDate, toDate)`: `POST /subscriptions/:id/vacation`
  - `resumeVacation(id)`: `POST /subscriptions/:id/resume`
  - `reportMissedDelivery(id, deliveryId, reason)`: `POST /subscriptions/:id/report-missed`
  - `cancelSubscription(id)`: `POST /subscriptions/:id/cancel`

### 3.4 Wallet Module (`src/modules/wallet`)
- **Types**:
  - `LedgerType`: `'CREDIT' | 'DEBIT' | 'HOLD' | 'RELEASE' | 'REFUND'`
  - `LedgerEntry`: `{ id, amount, type, referenceType, referenceId, description, balanceAfter, escrowAfter, createdAt }`
- **Components**:
  - `WalletPill`: Header badge displaying `₹{balance} (₹{escrowBalance} escrow)` with quick click to open drawer.
  - `WalletDrawer`: Slide-over sheet containing:
    - Available balance card & Escrow balance card.
    - Quick actions: `Top Up` and `Send Money`.
    - Ledger history table displaying all audit records.
  - `TopupModal`: Input amount with quick presets (₹200, ₹500, ₹1,000, ₹2,000) invoking `POST /wallet/topup`.
  - `TransferModal`: Recipient phone/email and amount inputs invoking `POST /wallet/transfer`.
- **API Functions**:
  - `fetchWallet()`: `GET /wallet`
  - `topupWallet(amount)`: `POST /wallet/topup`
  - `transferWallet(recipient, amount, note)`: `POST /wallet/transfer`
  - `fetchLedger()`: `GET /wallet/ledger`

---

## 4. State Synchronization & Reactivity

- **Redux Slice (`walletSlice.ts`)**:
  - Tracks `balance`, `escrowBalance`, and `loading`.
  - Exported actions: `fetchWalletBalance()`.
  - Dispatched after every financial event:
    - Service booked (`bookService`)
    - Subscription created (`createSubscription`)
    - Vacation paused (`setVacation`)
    - Missed delivery reported (`reportMissedDelivery`)
    - Handover or service confirmed (`confirmService`, `verifyHandover`)
    - Topup or transfer completed (`topupWallet`, `transferWallet`)

---

## 5. Testing & Verification Criteria

1. **Build Validation**: `npm run build` exits 0 with zero TypeScript compiler errors.
2. **Modular Integrity**: No circular dependencies between modules; all feature imports reference domain directories cleanly.
3. **End-to-End Verification**:
   - Create and display `SERVICE` and `SUBSCRIPTION` listings.
   - Execute service booking with escrow hold and subsequent provider completion & buyer confirmation.
   - Execute subscription creation, view delivery calendar, apply vacation mode with instant pro-rata refund, and view provider manifest.
   - Top-up wallet and inspect ledger updates in the wallet drawer.
