# Frontend Modular Architecture & Subscriptions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the College Marketplace React frontend into a modular domain architecture (`src/modules/*`) and implement full UI support for One-Time Services, Recurring Subscriptions, Double-Entry Wallet Escrow, and OTP Handshake order fulfillment.

**Architecture:** Decompose monolithic files into self-contained feature modules (`auth`, `products`, `orders`, `subscriptions`, `wallet`) each containing their own components, API client, and TypeScript definitions. Integrate a live wallet escrow pill in the layout header and connect all service and subscription operations directly to the backend.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS v4, Redux Toolkit, React Router v7, Framer Motion, Lucide React, Axios.

---

### Task 1: Foundation - Directory Structure & UI Dialog Primitive

**Files:**
- Create: `src/components/ui/dialog.tsx`
- Create: `src/components/layout/Header.tsx`
- Create: `src/components/layout/Sidebar.tsx`
- Create: `src/components/layout/DashboardLayout.tsx`
- Modify: `src/router/index.tsx`

- [ ] **Step 1: Install @radix-ui/react-dialog**

Run in `Frontend`:
```bash
npm install @radix-ui/react-dialog
```

- [ ] **Step 2: Create Dialog component primitive**

Create `src/components/ui/dialog.tsx`:
```tsx
import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogTitle = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
};
```

- [ ] **Step 3: Move layout components into `src/components/layout/`**

Create `src/components/layout/Header.tsx`, `Sidebar.tsx`, and `DashboardLayout.tsx` adapted from existing components with support for the `/dashboard/subscriptions` link in `Sidebar.tsx`.

- [ ] **Step 4: Verify build succeeds**

Run: `npm run build`
Expected: Exits 0

---

### Task 2: Wallet Module & Real-Time Balance State

**Files:**
- Create: `src/modules/wallet/wallet.types.ts`
- Create: `src/modules/wallet/wallet.api.ts`
- Create: `src/modules/wallet/components/WalletPill.tsx`
- Create: `src/modules/wallet/components/WalletModal.tsx`
- Create: `src/store/walletSlice.ts`
- Modify: `src/store/store.tsx`
- Modify: `src/components/layout/Header.tsx`

- [ ] **Step 1: Create `wallet.types.ts`**

Create `src/modules/wallet/wallet.types.ts`:
```ts
export type LedgerType = 'CREDIT' | 'DEBIT' | 'HOLD' | 'RELEASE' | 'REFUND';

export interface ILedgerEntry {
  id: string;
  walletId: string;
  amount: number;
  type: LedgerType;
  balanceBefore: number;
  balanceAfter: number;
  escrowBefore: number;
  escrowAfter: number;
  referenceType?: string;
  referenceId?: string;
  description?: string;
  createdAt: string;
}

export interface IWallet {
  id: string;
  userId: string;
  balance: number;
  escrowBalance: number;
  createdAt: string;
  updatedAt: string;
}
```

- [ ] **Step 2: Create `wallet.api.ts`**

Create `src/modules/wallet/wallet.api.ts`:
```ts
import axios from "@/utils/Axios";
import type { IWallet, ILedgerEntry } from "./wallet.types";

export const fetchWallet = async (): Promise<{ wallet?: IWallet; error?: string }> => {
  try {
    const res = await axios.get("/wallet");
    return { wallet: res.data.data.wallet };
  } catch (err: any) {
    return { error: err.response?.data?.message || "Failed to fetch wallet" };
  }
};

export const topupWallet = async (amount: number): Promise<{ wallet?: IWallet; error?: string }> => {
  try {
    const res = await axios.post("/wallet/topup", { amount });
    return { wallet: res.data.data.wallet };
  } catch (err: any) {
    return { error: err.response?.data?.message || "Top-up failed" };
  }
};

export const transferWallet = async (recipient: string, amount: number, note?: string): Promise<{ success?: boolean; error?: string }> => {
  try {
    await axios.post("/wallet/transfer", { recipient, amount, note });
    return { success: true };
  } catch (err: any) {
    return { error: err.response?.data?.message || "Transfer failed" };
  }
};

export const fetchLedger = async (): Promise<{ entries?: ILedgerEntry[]; error?: string }> => {
  try {
    const res = await axios.get("/wallet/ledger");
    return { entries: res.data.data.ledger };
  } catch (err: any) {
    return { error: err.response?.data?.message || "Failed to fetch ledger history" };
  }
};
```

- [ ] **Step 3: Create Redux `walletSlice.ts`**

Create `src/store/walletSlice.ts`:
```ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchWallet } from "@/modules/wallet/wallet.api";

export const loadWallet = createAsyncThunk("wallet/load", async () => {
  const res = await fetchWallet();
  if (res.error) throw new Error(res.error);
  return res.wallet;
});

interface WalletState {
  balance: number;
  escrowBalance: number;
  loading: boolean;
}

const initialState: WalletState = {
  balance: 0,
  escrowBalance: 0,
  loading: false,
};

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadWallet.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadWallet.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.balance = action.payload.balance;
          state.escrowBalance = action.payload.escrowBalance;
        }
      })
      .addCase(loadWallet.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default walletSlice.reducer;
```

- [ ] **Step 4: Register wallet reducer in `src/store/store.tsx`**

Update `src/store/store.tsx` to include `wallet: walletReducer`.

- [ ] **Step 5: Create `WalletPill.tsx` and `WalletModal.tsx`**

Create `src/modules/wallet/components/WalletModal.tsx` supporting top-ups, transfers, and ledger view.
Create `src/modules/wallet/components/WalletPill.tsx` mounted inside `Header.tsx`.

- [ ] **Step 6: Build verification**

Run: `npm run build`
Expected: PASS

---

### Task 3: Products Module & Multi-Type Listing Creation

**Files:**
- Create: `src/modules/products/product.types.ts`
- Create: `src/modules/products/product.api.ts`
- Create: `src/modules/products/components/ProductCard.tsx`
- Create: `src/modules/products/components/CreateListingForm.tsx`
- Modify: `src/pages/CreateListing.tsx`
- Modify: `src/pages/Home.tsx`

- [ ] **Step 1: Create `product.types.ts`**

Define `ProductType`: `'SELL' | 'RENT' | 'SERVICE' | 'SUBSCRIPTION'`.
Support optional attributes: `frequency`, `deliverySlots`, `serviceDuration`, `securityDeposit`.

- [ ] **Step 2: Create `product.api.ts`**

Implement `fetchProducts`, `fetchProductById`, `createProduct`, `deleteProduct`.

- [ ] **Step 3: Create `CreateListingForm.tsx`**

Add responsive form controls:
- If `RENT`: security deposit input.
- If `SERVICE`: service duration input.
- If `SUBSCRIPTION`: frequency dropdown (`WEEKLY`, `MONTHLY`) and delivery slots input.

- [ ] **Step 4: Update `ProductCard.tsx`**

Display distinct colored badges:
- `SELL`: Blue badge
- `RENT`: Orange badge (`₹X/day`)
- `SERVICE`: Purple badge (`One-Time Gig`)
- `SUBSCRIPTION`: Emerald badge (`Recurring Plan`)

- [ ] **Step 5: Wire into `pages/CreateListing.tsx` and `pages/Home.tsx`**

- [ ] **Step 6: Build verification**

Run: `npm run build`
Expected: PASS

---

### Task 4: Product Detail Dynamic Actions (Book Service & Subscribe)

**Files:**
- Create: `src/modules/orders/components/BookServiceModal.tsx`
- Create: `src/modules/subscriptions/components/SubscribeModal.tsx`
- Modify: `src/pages/ProductDetail.tsx`

- [ ] **Step 1: Create `BookServiceModal.tsx`**

Modal with notes and preferred delivery time inputs.
Calls `POST /api/orders/service-book`.
Dispatches `loadWallet()` on success to reflect newly locked escrow.

- [ ] **Step 2: Create `SubscribeModal.tsx`**

Modal with delivery slot notes and auto-renew toggle.
Calls `POST /api/subscriptions/subscribe`.
Dispatches `loadWallet()` on success.

- [ ] **Step 3: Update `ProductDetail.tsx`**

Render appropriate action button based on `post.type`:
- `SERVICE` -> Opens `BookServiceModal`.
- `SUBSCRIPTION` -> Opens `SubscribeModal`.
- `RENT` -> Shows rental details and deposit hold notice.
- `SELL` -> Normal purchase/request flow.

- [ ] **Step 4: Build verification**

Run: `npm run build`
Expected: PASS

---

### Task 5: Orders & Service Fulfillment Module

**Files:**
- Create: `src/modules/orders/order.types.ts`
- Create: `src/modules/orders/order.api.ts`
- Create: `src/modules/orders/components/OrderCard.tsx`
- Create: `src/modules/orders/components/OtpHandshakeModal.tsx`
- Modify: `src/pages/Orders.tsx`

- [ ] **Step 1: Create `order.types.ts` and `order.api.ts`**

Endpoints:
- `getMyOrders()` (`GET /orders/my-orders`)
- `getMySales()` (`GET /orders/my-sales`)
- `verifyHandover(orderId, otp)`
- `verifyReturn(orderId, otp)`
- `completeService(orderId)`
- `confirmService(orderId)`
- `cancelOrder(orderId)`

- [ ] **Step 2: Create `OtpHandshakeModal.tsx`**

Allows buyer to see their 6-digit pickup OTP / return OTP, and seller to submit it to release escrow.

- [ ] **Step 3: Create `OrderCard.tsx`**

Renders order cards with action buttons:
- For `SERVICE` orders: Provider sees `Mark Completed`; Buyer sees `Confirm & Release Funds`.
- For `RENTAL` orders: Shows Pickup OTP or Return OTP buttons.
- Dispatches `loadWallet()` upon fulfillment.

- [ ] **Step 4: Update `pages/Orders.tsx`**

Replaces mock profile items with real `getMyOrders()` and `getMySales()` tabbed view.

- [ ] **Step 5: Build verification**

Run: `npm run build`
Expected: PASS

---

### Task 6: Subscriptions & Provider Manifest Module

**Files:**
- Create: `src/modules/subscriptions/subscription.types.ts`
- Create: `src/modules/subscriptions/subscription.api.ts`
- Create: `src/modules/subscriptions/components/SubscriptionCard.tsx`
- Create: `src/modules/subscriptions/components/DeliveryCalendar.tsx`
- Create: `src/modules/subscriptions/components/VacationModal.tsx`
- Create: `src/modules/subscriptions/components/MissedDeliveryModal.tsx`
- Create: `src/modules/subscriptions/components/ProviderManifestTable.tsx`
- Create: `src/pages/Subscriptions.tsx`
- Modify: `src/router/index.tsx`
- Modify: `src/components/layout/Sidebar.tsx`

- [ ] **Step 1: Create `subscription.types.ts` and `subscription.api.ts`**

Endpoints:
- `getMySubscriptions()` (`GET /subscriptions/my`)
- `getProviderManifest()` (`GET /subscriptions/provider/manifest`)
- `setVacation(id, from, to)` (`POST /subscriptions/:id/vacation`)
- `reportMissedDelivery(id, deliveryId, reason)` (`POST /subscriptions/:id/report-missed`)
- `cancelSubscription(id)` (`POST /subscriptions/:id/cancel`)

- [ ] **Step 2: Create `VacationModal.tsx`**

Provides date pickers with live refund preview:
`refundAmount = (cycleAmount / totalDeliveries) * pausedDays`
Submits to `setVacation` and refreshes wallet and schedule.

- [ ] **Step 3: Create `MissedDeliveryModal.tsx`**

Enables 1-click missed meal reporting with reason input, giving instant refund confirmation.

- [ ] **Step 4: Create `ProviderManifestTable.tsx`**

Renders daily operational manifest table with delivery slots, student names, room numbers, and contact numbers.

- [ ] **Step 5: Create `pages/Subscriptions.tsx`**

Tabs:
- `My Plans`: Active subscriptions + delivery calendar + vacation & missed buttons.
- `Provider Manifest`: Today's delivery roster for meal/laundry providers.

- [ ] **Step 6: Register `/dashboard/subscriptions` route in `router/index.tsx`**

- [ ] **Step 7: Build verification**

Run: `npm run build`
Expected: PASS

---

### Task 7: End-to-End Verification & Cleanup

**Files:**
- Run: `npm run build` in `Frontend`
- Verify zero compiler/type errors
- Remove obsolete unused imports from old flat structure

- [ ] **Step 1: Run TypeScript compiler build**

Run: `npm run build`
Expected: Output `tsc -b && vite build` exits with code 0.
