# Real-Time Chat & In-App Notification Center Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a real-time product-contextual chat system (`/dashboard/messages`) and a live in-app notification center bell in the College Marketplace Frontend using Socket.io and Redux Toolkit.

**Architecture:** Connect an authenticated Socket.io client singleton to the backend WebSocket gateway. Manage conversations, active message threads, and system notification alerts in Redux slices. Provide a split-pane inbox with pinned product cards, real-time typing indicators, and a header notification bell.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS v4, Socket.io-client, Redux Toolkit, React Router v7, Lucide React, Axios.

---

### Task 1: Foundation - Socket.io Client, Types & Messages Redux Slice

**Files:**
- Modify: `package.json` (install `socket.io-client`)
- Create: `src/modules/messages/message.types.ts`
- Create: `src/modules/messages/socket.client.ts`
- Create: `src/modules/messages/message.api.ts`
- Create: `src/store/messagesSlice.ts`
- Modify: `src/store/store.tsx`

- [ ] **Step 1: Install `socket.io-client`**

Run in `Frontend`:
```bash
npm install socket.io-client
```

- [ ] **Step 2: Create `src/modules/messages/message.types.ts`**

Define `IMessage`, `IConversation`, `SendMessagePayload`, and `TypingPayload`.

- [ ] **Step 3: Create `src/modules/messages/socket.client.ts`**

Implement `getSocket()` singleton:
- Resolves backend WebSocket URL.
- Reads auth token from storage and passes in `auth: { token }`.
- Connects, reconnects on reconnect events, and handles disconnect cleanly.

- [ ] **Step 4: Create `src/modules/messages/message.api.ts`**

Implement REST fallback and inbox loaders:
- `fetchConversations()`: `GET /messages/conversations`
- `fetchMessages(otherUserId)`: `GET /messages/:otherUserId`
- `fetchUnreadCount()`: `GET /messages/unread-count`
- `markConversationRead(otherUserId)`: `PATCH /messages/:otherUserId/read`

- [ ] **Step 5: Create `src/store/messagesSlice.ts`**

Redux slice managing:
- `conversations: IConversation[]`
- `activeUserId: string | null`
- `activeMessages: IMessage[]`
- `unreadTotal: number`
- `typingMap: Record<string, boolean>`
- Reducers: `setConversations`, `setActiveMessages`, `appendMessage`, `setUserTyping`, `setUnreadTotal`.

- [ ] **Step 6: Register `messages` in `src/store/store.tsx`**

- [ ] **Step 7: Build verification**

Run: `npm run build`
Expected: PASS

---

### Task 2: Notification Bell & In-App Activity Center

**Files:**
- Create: `src/modules/notifications/notification.types.ts`
- Create: `src/store/notificationSlice.ts`
- Create: `src/modules/notifications/components/NotificationBell.tsx`
- Create: `src/modules/notifications/components/NotificationDropdown.tsx`
- Modify: `src/components/layout/Header.tsx`
- Modify: `src/store/store.tsx`

- [ ] **Step 1: Create `src/modules/notifications/notification.types.ts`**

Define `NotificationType` (`'ORDER' | 'SERVICE' | 'SUBSCRIPTION' | 'WALLET' | 'DISPUTE' | 'CHAT'`) and `INotification`.

- [ ] **Step 2: Create `src/store/notificationSlice.ts`**

Redux slice managing:
- `notifications: INotification[]`
- `unreadCount: number`
- Reducers: `addNotification`, `markAllNotificationsRead`, `clearNotifications`.

- [ ] **Step 3: Create `NotificationDropdown.tsx`**

Popover / Dropdown listing recent activity feed with category icons and links.

- [ ] **Step 4: Create `NotificationBell.tsx`**

Button with bell icon and red unread counter badge that opens `NotificationDropdown`.
Listens to WebSocket system events (`service_booked`, `subscription_vacation_alert`, etc.) and dispatches `addNotification`.

- [ ] **Step 5: Mount `NotificationBell` in `src/components/layout/Header.tsx`**

Position next to `WalletPill` and user avatar.

- [ ] **Step 6: Build verification**

Run: `npm run build`
Expected: PASS

---

### Task 3: Chat Components & Product Context Banner

**Files:**
- Create: `src/modules/messages/components/ProductContextBanner.tsx`
- Create: `src/modules/messages/components/MessageBubble.tsx`
- Create: `src/modules/messages/components/TypingIndicator.tsx`
- Create: `src/modules/messages/components/ConversationList.tsx`
- Create: `src/modules/messages/components/ChatWindow.tsx`

- [ ] **Step 1: Create `ProductContextBanner.tsx`**

Displays pinned product thumbnail, title, price, listing type badge, and link to item.

- [ ] **Step 2: Create `MessageBubble.tsx`**

Renders incoming and outgoing chat bubbles with timestamp, sender name, and read checkmark.

- [ ] **Step 3: Create `TypingIndicator.tsx`**

Animated 3-dot bounce indicator when peer is typing.

- [ ] **Step 4: Create `ConversationList.tsx`**

Filterable search bar and list of conversations showing student avatar, name, last message snippet, relative time, and unread badge.

- [ ] **Step 5: Create `ChatWindow.tsx`**

Active conversation view:
- Top bar with peer avatar, name, college, and online status.
- Pinned `ProductContextBanner` (if product context is attached).
- Scrollable message thread.
- `TypingIndicator`.
- Input box with `Enter` key send, debounced typing event emitter, and send button.

- [ ] **Step 6: Build verification**

Run: `npm run build`
Expected: PASS

---

### Task 4: Messages Page & Sidebar Navigation

**Files:**
- Create: `src/pages/Messages.tsx`
- Modify: `src/router/index.tsx`
- Modify: `src/components/layout/Sidebar.tsx`

- [ ] **Step 1: Create `src/pages/Messages.tsx`**

Split-pane layout coordinating `ConversationList` and `ChatWindow`.
Supports query parameters: `?userId=...&productId=...` to automatically open or start a chat with a specific user.

- [ ] **Step 2: Register `/dashboard/messages` in `src/router/index.tsx`**

Add route mapping under dashboard children.

- [ ] **Step 3: Update `Sidebar.tsx`**

Add Messages navigation link with `MessageSquare` icon and unread message counter badge.

- [ ] **Step 4: Build verification**

Run: `npm run build`
Expected: PASS

---

### Task 5: Deep-Link Integration from Product Details & Orders

**Files:**
- Modify: `src/pages/ProductDetail.tsx`
- Modify: `src/modules/orders/components/OrderCard.tsx`

- [ ] **Step 1: Update `ProductDetail.tsx`**

Add a "Message Seller / Provider" button with chat icon.
Clicking navigates to `/dashboard/messages?userId=${product.owner?.id || product.seller?.id}&productId=${product.id}`.

- [ ] **Step 2: Update `OrderCard.tsx`**

Add a "Chat" button for each order.
Clicking navigates to `/dashboard/messages?userId=${isBuyer ? order.sellerId : order.buyerId}&productId=${order.productId}`.

- [ ] **Step 3: Build verification**

Run: `npm run build`
Expected: PASS

---

### Task 6: End-to-End Build & Compilation Verification

**Files:**
- Full build check across Frontend and Backend.

- [ ] **Step 1: Run Frontend build**

Run: `npm run build` in `Frontend`
Expected: Exits 0 with zero errors.

- [ ] **Step 2: Run Backend build**

Run: `npm run build` in `Backend`
Expected: Exits 0 with zero errors.
