# Real-Time Chat & In-App Notification Center Spec

- **Status**: Approved for Implementation
- **Target**: College Marketplace Frontend (`College Marketplace/Frontend`)
- **Date**: 2026-09-09

---

## 1. Objectives

1. **Integrate Real-Time Socket.io Connection**: Establish an authenticated WebSocket client singleton connecting to the backend's Socket.io server with auto-reconnect, JWT token passing, and room subscriptions.
2. **Dedicated Messages Inbox (`/dashboard/messages`)**:
   - Split-pane interface: Conversations list on the left, active chat thread on the right.
   - Pinned product context card at the top of each conversation displaying product thumbnail, title, price, type badge (`SELL`, `RENT`, `SERVICE`, `SUBSCRIPTION`), and quick view link.
   - Real-time message exchange, live typing indicators, and read status.
3. **Deep-Link Actions**:
   - Add "Message Seller / Provider" button on `ProductDetail.tsx` and `OrderCard.tsx` that links directly to `/dashboard/messages?userId=...&productId=...`.
4. **Header Notification Bell & Live Activity Feed**:
   - Real-time notification bell in `Header.tsx` with unread badge counter.
   - Dropdown activity feed displaying real-time events for escrow holds, service milestones, vacation pauses, missed delivery refunds, and disputes.
   - In-app toast popups for incoming messages and milestone alerts.

---

## 2. Architecture & File Structure

```text
src/
├── modules/
│   ├── messages/
│   │   ├── socket.client.ts              # Authenticated Socket.io client singleton
│   │   ├── message.types.ts              # Message, Conversation, ChatPayload types
│   │   ├── message.api.ts                # REST API (fetchConversations, fetchMessages, markAsRead)
│   │   └── components/
│   │       ├── ConversationList.tsx      # Left-pane conversations list & search
│   │       ├── ChatWindow.tsx            # Right-pane active thread with bubbles & input
│   │       ├── ProductContextBanner.tsx  # Pinned product context card
│   │       ├── MessageBubble.tsx         # Outgoing/Incoming message bubble with timestamp
│   │       └── TypingIndicator.tsx       # Animated typing dots
│   │
│   └── notifications/
│       ├── notification.types.ts         # Notification, NotificationType
│       ├── components/
│       │   ├── NotificationBell.tsx      # Header icon with live unread badge
│       │   └── NotificationDropdown.tsx  # Dropdown menu with activity feed
│       └── notificationSlice.ts          # Redux slice tracking notifications
│
├── store/
│   ├── messagesSlice.ts                  # Redux slice tracking conversations, active chat, and unread counts
│   ├── notificationSlice.ts              # Redux slice tracking system alerts
│   └── store.tsx                         # Redux root configuration
│
├── pages/
│   └── Messages.tsx                      # Split-pane messages page at /dashboard/messages
│
├── components/layout/
│   ├── Header.tsx                        # Integrates NotificationBell & WalletPill
│   └── Sidebar.tsx                       # Integrates Messages nav link with unread badge
│
└── router/index.tsx                      # Registers /dashboard/messages route
```

---

## 3. Data Flow & Socket Contract

### 3.1 Socket Client Lifecycle (`socket.client.ts`)
- **Connection URL**: Backend base URL (`http://localhost:5000` or `VITE_API_URL` origin).
- **Authentication**: Passes JWT bearer token in `auth: { token }` extracted from `localStorage.getItem("authToken") || localStorage.getItem("token")`.
- **Rooms**: Automatically joined to `user_${userId}` by the backend upon handshake.

### 3.2 WebSocket Events
- **Outgoing**:
  - `send_message`: `{ toUserId: string, content: string, productId?: string }`
  - `typing`: `{ toUserId: string, isTyping: boolean }`
  - `mark_read`: `{ fromUserId: string }`
- **Incoming**:
  - `receive_message`: `IMessage` (appends to active thread if open; otherwise increments unread count and updates conversation snippet).
  - `user_typing`: `{ fromUserId: string, isTyping: boolean }`
  - `messages_read`: `{ readBy: string }`
  - `service_booked`: Emitted when client books a gig.
  - `service_completed_by_provider`: Emitted when provider marks service delivered.
  - `service_payment_released`: Emitted when client confirms service completion.
  - `subscription_new_subscriber`: Emitted when student subscribes to plan.
  - `subscription_vacation_alert`: Emitted when student pauses deliveries.
  - `subscription_settled`: Emitted when cycle settlement finishes.
  - `dispute_resolved`: Emitted when admin resolves dispute.

---

## 4. Module Specifications

### 4.1 Messages Module (`src/modules/messages`)
- **`message.types.ts`**:
  ```ts
  export interface IMessage {
    id: string;
    senderId: string;
    receiverId: string;
    productId?: string;
    content: string;
    isRead: boolean;
    createdAt: string;
    product?: {
      id: string;
      title: string;
      price: number;
      imageUrl?: string;
      type: string;
    };
    sender?: {
      id: string;
      name: string;
      college?: string;
      profileImage?: string;
    };
  }

  export interface IConversation {
    otherUser: {
      id: string;
      name: string;
      email: string;
      college?: string;
      profileImage?: string;
    };
    lastMessage: IMessage;
    unreadCount: number;
  }
  ```
- **`message.api.ts`**:
  - `fetchConversations()`: `GET /messages/conversations`
  - `fetchMessages(otherUserId: string)`: `GET /messages/${otherUserId}`
  - `fetchUnreadCount()`: `GET /messages/unread-count`
  - `sendMessage(toUserId: string, content: string, productId?: string)`: `POST /messages` (fallback if socket is disconnected)
  - `markConversationRead(otherUserId: string)`: `PATCH /messages/${otherUserId}/read`

### 4.2 Notifications Module (`src/modules/notifications`)
- **`notification.types.ts`**:
  ```ts
  export type NotificationType = 'ORDER' | 'SERVICE' | 'SUBSCRIPTION' | 'WALLET' | 'DISPUTE';

  export interface INotification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
    isRead: boolean;
    createdAt: string;
  }
  ```
- **`NotificationBell.tsx` & `NotificationDropdown.tsx`**:
  - Displays bell icon with red pill counter if `unreadNotificationsCount > 0`.
  - Dropdown lists recent events with category-specific icons (`ShoppingBag`, `Calendar`, `DollarSign`, `AlertTriangle`).
  - Clicking an item marks it read and navigates to the target route.

---

## 5. Testing & Verification Criteria

1. **Dependencies**: `socket.io-client` installed in `Frontend`.
2. **Build Verification**: `npm run build` exits 0 with zero TypeScript errors.
3. **Real-Time Verification**:
   - Connection established cleanly on authentication.
   - Message sending and receiving between users with immediate bubble rendering.
   - Typing indicator displays smoothly when peer is typing.
   - Notifications bell accurately reflects unread events and deep-links properly.
