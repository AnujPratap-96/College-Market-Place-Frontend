# Admin Control Center, Dynamic Commission & Payment Sandbox Spec

- **Status**: Approved for Implementation
- **Target**: College Marketplace Backend & Frontend
- **Date**: 2026-09-09

---

## 1. Objectives

1. **Dynamic Platform Settings & Commission Management**:
   - Store configurable system parameters in a database table (`SystemSetting`).
   - Allow administrators to dynamically configure the platform commission rate (`0%` to any percentage), minimum withdrawal limits, and payment gateway mode (`SANDBOX` vs `LIVE`).
   - Replace hardcoded fee multipliers (`0.02`) in order and subscription settlements with dynamic database lookups.
2. **Payment Gateway Sandbox Integration**:
   - Support Razorpay Test Mode / Sandbox for wallet recharges and payouts.
   - Webhook signature validation (HMAC-SHA256).
   - "Withdraw to UPI" feature allowing students to withdraw wallet funds to their personal UPI address (`student@upi`).
3. **Frontend Admin Control Center (`/dashboard/admin`)**:
   - Restricted to authenticated users with `role: "ADMIN"`.
   - Tab 1: **Platform Settings & Commission Manager** (Live commission slider, withdrawal limit, sandbox mode).
   - Tab 2: **Escrow Disputes & Arbitration** (Live queue with 1-click `Refund Buyer` or `Release to Seller`).
   - Tab 3: **Content Moderation** (Review auto-flagged listings and user reports).
   - Tab 4: **Marketplace Analytics** (Total GMV, active escrow, platform fees collected).
4. **Student Wallet Payout UI**:
   - Add a "Withdraw to UPI" tab in `WalletModal.tsx` where students enter their UPI ID to withdraw funds.

---

## 2. Backend Architecture

### 2.1 Database Schema (`schema.prisma`)
```prisma
model SystemSetting {
  key       String   @id
  value     String
  updatedAt DateTime @updatedAt
}
```
Default seed values:
- `platform_commission_percent`: `"0"`
- `min_withdrawal_amount`: `"100"`
- `payout_gateway_mode`: `"SANDBOX"`
- `auto_complete_days`: `"3"`

### 2.2 Dynamic Fee Calculation Service Helper
```ts
export async function getPlatformCommissionRate(): Promise<number> {
  const setting = await prisma.systemSetting.findUnique({
    where: { key: 'platform_commission_percent' },
  });
  if (!setting) return 0;
  const rate = parseFloat(setting.value);
  return isNaN(rate) ? 0 : rate / 100;
}
```
Used across:
- `order.service.ts`: `platformFee = Number((product.price * commissionRate).toFixed(2))`
- `subscription.service.ts`: `platformFee = Number((netEscrow * commissionRate).toFixed(2))`

### 2.3 Admin API Endpoints
- `GET /api/admin/settings`: Retrieves all system settings.
- `PATCH /api/admin/settings`: Updates specified settings keys.
- `GET /api/admin/disputes`: Lists all orders currently in `DISPUTED` status.
- `POST /api/admin/arbitrate`: Arbitrates a dispute with action (`REFUND_BUYER` or `RELEASE_SELLER`).
- `GET /api/admin/reports`: Lists flagged listings and user reports.
- `POST /api/admin/reports/:id/action`: Handles report moderation action.

### 2.4 Wallet Payout / Withdrawal Endpoints
- `POST /api/wallet/withdraw`:
  - Validates `amount >= min_withdrawal_amount` and `amount <= wallet.balance`.
  - Validates valid UPI address format (`[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}`).
  - Opens `prisma.$transaction` with `{ maxWait: 15000, timeout: 30000 }`.
  - Deducts balance, logs double-entry ledger entry:
    - `type: LedgerType.DEBIT`
    - `referenceType: 'WITHDRAWAL'`
    - `description: 'Withdrawal to UPI: ' + upiId`
  - Calls payment gateway payout simulator / API in sandbox.

---

## 3. Frontend Architecture

### 3.1 Admin Module (`src/modules/admin`)
- `admin.types.ts`: `ISystemSetting`, `IDisputedOrder`, `IAdminStats`.
- `admin.api.ts`: API client functions for settings, disputes, and reports.
- Components:
  - `SettingsManager.tsx`: Commission rate slider/input, minimum payout limit, sandbox toggle, and save button.
  - `DisputeArbitrationQueue.tsx`: Table/cards of disputed orders with action buttons.
  - `ModerationQueue.tsx`: Flagged listings queue with unflag/delete actions.
  - `FinancialStats.tsx`: Stat cards for volume, escrow, and active orders.

### 3.2 Navigation & Access Control
- `Sidebar.tsx`: Checks `user.role === 'ADMIN'`. If true, displays **Admin Portal** link with `ShieldAlert` or `Sliders` icon.
- `router/index.tsx`: Registers `/dashboard/admin` mapped to `AdminDashboard.tsx`.

### 3.3 Wallet Withdrawal UI (`WalletModal.tsx`)
- Adds a **Withdraw** tab alongside Overview, Top-Up, and Ledger.
- Form inputs: UPI ID (`student@upi`), Amount (₹).
- Validation: checks minimum threshold and available balance.
- Instant submission dispatches `loadWallet()` to update balance immediately.

---

## 4. Verification Criteria
1. **Prisma Sync**: `npx prisma db push` syncs `SystemSetting` with zero errors.
2. **Backend Compilation**: `npm run build` in Backend exits 0.
3. **Frontend Compilation**: `npm run build` in Frontend exits 0.
4. **Integration Test Suite**:
   - Admin updates commission to `0%` -> Service booked has ₹0 platform fee.
   - Admin updates commission to `3%` -> Service booked has 3% platform fee.
   - Student requests withdrawal -> balance deducted and ledger logs `WITHDRAWAL`.
   - Admin arbitrates dispute -> escrow released or refunded cleanly.
