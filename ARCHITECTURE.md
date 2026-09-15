# College Marketplace — Frontend Architecture & Component Specification

> **Live Application**: [http://college-market-place-frontend.vercel.app/](http://college-market-place-frontend.vercel.app/)  
> **Framework**: React 19 (TypeScript) with Vite  
> **State & Networking**: Redux Toolkit, Axios Interceptors, Socket.IO Client  
> **UI & Styling**: Tailwind CSS, Radix UI Primitives, Lucide Icons, Framer Motion  
> **Deployment**: Vercel SPA with Client-Side Route Rewrites

---

## 1. High-Level Frontend Architecture

The frontend follows a **feature-first modular architecture**. All domain logic, API clients, TypeScript definitions, and UI components are encapsulated under `src/modules/<feature>/`, while `src/pages/` orchestrates modular components into full-screen views.

```mermaid
graph TD
    subgraph BrowserRuntime["Browser Runtime"]
        URL["Client Navigation / URL Routing"]
        LocalStorage["LocalStorage (Auth & Refresh Tokens)"]
        MediaAPIs["Browser Web APIs: MediaRecorder, AudioContext, File API"]
    end

    subgraph CoreServices["Cross-Cutting Infrastructure (/src)"]
        AxiosClient["Axios Singleton (/utils/Axios.ts)"]
        SocketSingleton["Socket.IO Client Singleton (/modules/messages/socket.client.ts)"]
        ReduxStore["Redux Toolkit Store (/store/store.tsx)"]
        ThemeEngine["Theme Provider (Dark / Light Mode)"]
        AlgoliaEngine["Algolia React InstantSearch (Global Search)"]
    end

    subgraph ReduxSlices["Global State Slices (/src/store)"]
        UserSlice["userSlice: Auth token, user profile, role"]
        WalletSlice["walletSlice: Available balance, escrow hold, thunks"]
        MessagesSlice["messagesSlice: Active threads, typing state, unread counts"]
        NotifSlice["notificationSlice: Real-time event notifications"]
    end

    subgraph PageRouters["Route View Controllers (/src/pages)"]
        HomePage["Home.tsx (Algolia Search UI, Hits, Filtering)"]
        ProductDetailPage["ProductDetail.tsx (Item Overview & Offer CTAs)"]
        CreateListingPage["CreateListing.tsx (Listing Creation)"]
        MessagesPage["Messages.tsx (Split-Pane Chat & Negotiation)"]
        OrdersPage["Orders.tsx (Escrow Orders & OTP Handshake)"]
        SubsPage["Subscriptions.tsx (Hostel Meal Plans & Vacation)"]
        AuctionsPage["Auctions.tsx (24h Live Move-Out Bidding)"]
        AnalyticsPage["SellerAnalytics.tsx (Earnings & KPI Dashboards)"]
    end

    subgraph FeatureComponents["Feature Modular Layer (/src/modules)"]
        NegModule["negotiations/components: NegotiationCard, MakeOfferModal"]
        ProdModule["products/components: CreateListingForm, ProductCard, MultiImageUploader"]
        MsgModule["messages/components: ChatWindow, MessageBubble, ConversationList"]
        WalletModule["wallet/components: WalletModal, WalletPill, LedgerHistory"]
        OrderModule["orders/components: OrderCard, OtpHandshakeModal, DisputeModal"]
        SubModule["subscriptions/components: SubscriptionCard, VacationModal, DeliveryCalendar"]
        AuctionModule["auctions/components: AuctionCard, PlaceBidModal, BidFeed"]
    end

    URL --> PageRouters
    PageRouters --> FeatureComponents
    FeatureComponents --> ReduxStore
    FeatureComponents --> AxiosClient
    FeatureComponents --> SocketSingleton
    FeatureComponents --> MediaAPIs
    ReduxStore --> ReduxSlices
    AxiosClient --> LocalStorage
```

---

## 2. Comprehensive Directory Structure & Modular Breakdown

```
Frontend/
├── index.html                            # HTML5 SPA entry with canonical link to vercel.app
├── vercel.json                           # Vercel SPA routing rewrites to /index.html
├── package.json                          # Dependencies, homepage URL, build scripts
├── tsconfig.json                         # TypeScript configuration
├── vite.config.ts                        # Vite build configuration and path aliases
├── src/
│   ├── main.tsx                          # React DOM root mounting Provider & Router
│   ├── App.tsx                           # Core App wrapper & theme initialization
│   ├── vite-env.d.ts                     # Vite client environment types
│   ├── index.css                         # Tailwind CSS base, components & utility directives
│   ├── config/
│   │   └── site.ts                       # Global site metadata & live Vercel app URL
│   ├── router/
│   │   └── index.tsx                     # React Router v7 route tree with ProtectedRoute
│   ├── store/                            # Redux Toolkit global state store
│   │   ├── store.tsx                     # configureStore combining all domain reducers
│   │   ├── userSlice.ts                  # User credentials, college verification & profile
│   │   ├── walletSlice.ts                # Wallet balance, escrow hold & loadWallet thunk
│   │   ├── messagesSlice.ts              # Active conversation threads, typing state & unread
│   │   └── notificationSlice.ts          # Real-time event notifications banner store
│   ├── lib/
│   │   └── utils.ts                      # clsx and tailwind-merge helper function (`cn`)
│   ├── utils/
│   │   ├── Axios.ts                      # Centralized Axios client with JWT interceptors
│   │   ├── mode.toggle.tsx               # Theme switcher toggle component
│   │   └── theme-provider.tsx            # Context provider for dark/light theme switching
│   ├── hooks/
│   │   └── useFetchUser.ts               # Custom hook for active student session polling
│   ├── services/
│   │   └── api.ts                        # Legacy API wrapper services
│   ├── components/                       # Shared global components & UI primitives
│   │   ├── Header.tsx                    # Shared platform header
│   │   ├── Footer.tsx                    # Campus marketplace footer
│   │   ├── Sidebar.tsx                   # Side navigation with badge counters
│   │   ├── ProtectedRoute.tsx            # Authentication route barrier
│   │   ├── ProductCard.tsx               # Reusable product card component
│   │   ├── auth/                         # Student auth modal & forms
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignUp.tsx
│   │   │   ├── OtpInput.tsx
│   │   │   ├── VerifyEmail.tsx
│   │   │   ├── ForgotPassword.tsx
│   │   │   ├── ResetOtp.tsx
│   │   │   ├── ResetPassword.tsx
│   │   │   └── Thankyou.tsx
│   │   ├── landing/                      # Landing page presentation blocks
│   │   │   ├── HeroSection.tsx
│   │   │   ├── CategoryShowcase.tsx
│   │   │   ├── FeatureSection.tsx
│   │   │   ├── HowItWorksSection.tsx
│   │   │   ├── StatsBanner.tsx
│   │   │   ├── SafetySection.tsx
│   │   │   ├── TestimonialsSection.tsx
│   │   │   ├── FAQSection.tsx
│   │   │   └── CTASection.tsx
│   │   ├── layout/                       # Structured dashboard layout templates
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Sidebar.tsx
│   │   └── ui/                           # Radix UI design system primitives
│   │       ├── accordion.tsx
│   │       ├── avatar.tsx
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── carousel.tsx
│   │       ├── dialog.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── ImageUploader.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── MultiImageUploader.tsx
│   │       ├── select.tsx
│   │       ├── tabs.tsx
│   │       ├── textarea.tsx
│   │       └── toast.tsx
│   ├── modules/                          # Feature modules (API, TypeScript types, UI)
│   │   ├── admin/                        # Superadmin control panel
│   │   │   ├── admin.api.ts
│   │   │   ├── admin.types.ts
│   │   │   └── components/
│   │   ├── analytics/                    # Seller revenue & sales analytics
│   │   │   ├── analytics.api.ts
│   │   │   └── analytics.types.ts
│   │   ├── assistant/                    # AI campus assistant chatbot
│   │   │   ├── assistant.api.ts
│   │   │   └── components/
│   │   ├── auctions/                     # 24-hour move-out live auctions
│   │   │   ├── auction.api.ts
│   │   │   ├── auction.types.ts
│   │   │   └── components/
│   │   ├── messages/                     # Socket.IO chat, voice notes & media
│   │   │   ├── message.api.ts
│   │   │   ├── message.types.ts
│   │   │   ├── socket.client.ts
│   │   │   └── components/
│   │   ├── negotiations/                 # In-chat bargaining cards & MakeOfferModal
│   │   │   ├── negotiation.api.ts
│   │   │   ├── negotiation.types.ts
│   │   │   └── components/
│   │   ├── notifications/                # Real-time notifications dropdown & bell
│   │   │   ├── notification.types.ts
│   │   │   └── components/
│   │   ├── orders/                       # Escrow purchase, rental & OTP handshake
│   │   │   ├── order.api.ts
│   │   │   ├── order.types.ts
│   │   │   └── components/
│   │   ├── products/                     # Product catalog, types & AI auto-fill
│   │   │   ├── product.api.ts
│   │   │   ├── product.types.ts
│   │   │   └── components/
│   │   ├── reviews/                      # User & service reviews
│   │   │   ├── review.api.ts
│   │   │   ├── review.types.ts
│   │   │   └── components/
│   │   ├── subscriptions/                # Recurring meal/laundry subscriptions & vacation pause
│   │   │   ├── subscription.api.ts
│   │   │   ├── subscription.types.ts
│   │   │   └── components/
│   │   ├── upload/                       # Media upload API client
│   │   │   └── upload.api.ts
│   │   ├── wallet/                       # Wallet balance, UPI payout modal & ledger
│   │   │   ├── wallet.api.ts
│   │   │   ├── wallet.types.ts
│   │   │   └── components/
│   │   └── wanted/                       # Campus "Wanted" bulletin board
│   │       ├── wanted.api.ts
│   │       ├── wanted.types.ts
│   │       └── components/
│   └── pages/                            # Full-page routes
│       ├── LandingPage.tsx
│       ├── Home.tsx
│       ├── Products.tsx
│       ├── ProductDetail.tsx
│       ├── CreateListing.tsx
│       ├── EditListing.tsx
│       ├── Messages.tsx
│       ├── Orders.tsx
│       ├── Subscriptions.tsx
│       ├── Auctions.tsx
│       ├── SellerAnalytics.tsx
│       ├── WantedBoard.tsx
│       ├── Profile.tsx
│       ├── AdminDashboard.tsx
│       ├── auth.tsx
│       ├── layout.tsx
│       └── DashboardLayout.tsx
```

---

## 3. Frontend Component & Flow Architectures

### 3.1 Direct Negotiation & Counter-Offers Flow

```mermaid
sequenceDiagram
    autonumber
    actor Buyer as Student Buyer
    participant Detail as ProductDetail.tsx
    participant Modal as MakeOfferModal.tsx
    participant NegAPI as negotiation.api.ts
    participant Chat as ChatWindow.tsx
    participant Card as NegotiationCard.tsx
    actor Seller as Student Seller

    Buyer->>Detail: Clicks "Make Offer" Button
    Detail->>Modal: Opens with prefilled listed price
    Buyer->>Modal: Enters offer price (e.g. ₹450 vs ₹600) & submits
    Modal->>NegAPI: createNegotiationOffer(productId, 450)
    NegAPI-->>Modal: Returns offer object
    Modal->>Detail: Closes & redirects to /dashboard/messages?userId=seller
    
    Note over Chat,Card: Real-time Socket syncs negotiation card into chat
    Chat->>Card: Renders NegotiationCard (Status: PENDING, Offered: ₹450)
    
    alt Seller Counters
        Seller->>Card: Clicks "Counter" & Enters ₹500
        Card->>NegAPI: counterNegotiationOffer(id, 500)
        Card-->>Chat: Updates card to Counter Offer ₹500
    else Seller Accepts
        Seller->>Card: Clicks "Accept (₹450)"
        Card->>NegAPI: acceptNegotiationOffer(id)
        NegAPI-->>Card: Returns { offer: ACCEPTED, orderId }
        Card-->>Chat: Displays "Accepted & Escrow Reserved" with "View Order" CTA
    else Seller Declines
        Seller->>Card: Clicks "Decline"
        Card->>NegAPI: declineNegotiationOffer(id)
        Card-->>Chat: Updates status badge to DECLINED
    end
```

---

### 3.2 AI Visual Listing Creator Flow

```mermaid
flowchart TD
    User["Student on /dashboard/products/create"] --> Dropzone["Click 'Snap / Upload Photo'"]
    Dropzone --> FileInput["Hidden File Input (accept='image/*')"]
    FileInput --> DirectUpload["POST /api/upload/direct via Axios"]
    DirectUpload --> PublicURL["Obtain CDN Public URL"]
    
    PublicURL --> AddGallery["Pre-populate MultiImageUploader with image"]
    PublicURL --> AiEstimate["POST /api/products/ai-estimate-listing { imageUrl }"]
    
    subgraph ClientFeedback["Reactive Form Population"]
        AiEstimate --> AutoTitle["Form: setTitle(res.title)"]
        AiEstimate --> AutoCat["Form: setCategory(res.category)"]
        AiEstimate --> AutoPrice["Form: setPrice(res.suggestedPrice)"]
        AiEstimate --> AutoDesc["Form: setDescription(res.description)"]
        AiEstimate --> RenderBanner["Display AI Valuation Banner: Condition + Price Range [Min - Max] + Tags"]
    end

    ClientFeedback --> Ready["Student reviews details and clicks 'Publish Listing'"]
```

---

### 3.3 In-Chat Media & Voice Notes Engine

```mermaid
flowchart TD
    subgraph ChatInputBar["ChatWindow Footer Controls"]
        PhotoBtn["Camera Button"] --> PickImage["File Picker (accept='image/*')"]
        MicBtn["Mic Button"] --> Stream["navigator.mediaDevices.getUserMedia({ audio: true })"]
    end

    PickImage --> ValidateImg{"File.type starts with 'image/'?"}
    ValidateImg -->|Yes| UploadImg["uploadChatMediaApi(file)"]
    ValidateImg -->|No (e.g. video/*)| ToastError["toast.error('Only photos & voice notes allowed')"]

    Stream --> Recorder["MediaRecorder(stream) starts recording"]
    Recorder --> Timer["Active Recording UI: Red Pulse + Timer (0:00 / 2:00)"]
    Timer --> StopAction{"Student Action"}
    StopAction -->|Cancel / Trash| Discard["Stop stream & clear audio chunks"]
    StopAction -->|Done & Send| GenBlob["Generate audio/webm Blob"]
    GenBlob --> UploadAudio["uploadChatMediaApi(blob)"]

    UploadImg --> EmitSocketMsg["socket.emit('send_message', { mediaType: 'IMAGE', mediaUrl })"]
    UploadAudio --> EmitSocketVoice["socket.emit('send_message', { mediaType: 'AUDIO', mediaUrl, audioDuration })"]

    subgraph MessageRendering["MessageBubble.tsx"]
        EmitSocketMsg --> ImgBubble["Render Image Thumbnail with Lightbox Click"]
        EmitSocketVoice --> AudioBubble["Render Voice Note Player: Play/Pause + Interactive Waveform + Duration"]
    end
```

---

### 3.4 Real UPI Withdrawals & Wallet Modal Flow

```mermaid
sequenceDiagram
    autonumber
    actor Student as Student Seller
    participant Pill as WalletPill.tsx (Header)
    participant Modal as WalletModal.tsx (Withdraw Tab)
    participant API as wallet.api.ts
    participant Redux as walletSlice.ts

    Student->>Pill: Clicks Wallet Pill (Displays Available & Escrow)
    Pill->>Modal: Opens WalletModal on "Overview" tab
    Student->>Modal: Selects "Withdraw" Tab
    Modal->>API: fetchWithdrawals()
    API-->>Modal: Renders Recent Payout History with UTR numbers
    
    Student->>Modal: Enters Amount (₹500) & UPI VPA (student@okaxis)
    Modal->>Modal: Client regex check: ^[a-zA-Z0-9.-_]{2,256}@[a-zA-Z]{2,64}$
    
    Student->>Modal: Clicks "Withdraw ₹500 to UPI"
    Modal->>API: withdrawWallet(upiId, 500)
    API-->>Modal: Returns { success: true, withdrawalId }
    Modal->>Redux: dispatch(loadWallet()) -> Updates Available Balance
    Modal->>API: fetchWithdrawals() -> Appends payout to history table
    Modal->>Student: Toast: "₹500.00 payout initiated to student@okaxis!"
```

---

### 3.5 Seller Analytics & Financial Intelligence Dashboard

```mermaid
flowchart TD
    Route["Navigate to /dashboard/analytics"] --> Mount["SellerAnalytics.tsx Mounted"]
    Mount --> FetchAPI["fetchSellerAnalytics() (/modules/analytics/analytics.api.ts)"]
    FetchAPI --> ParseMetrics["Parse ISellerAnalytics Payload"]

    subgraph DashboardViews["Interactive Analytical Views"]
        ParseMetrics --> KPICards["Hero KPI Cards: Net Profit, Gross Sales, In Escrow, Response Rate"]
        ParseMetrics --> MonthlyChart["Interactive Monthly Revenue Bars (6-Month Rolling Timeline)"]
        ParseMetrics --> CatProgress["Category Progress Bars with Revenue & Percentage Share"]
        ParseMetrics --> TopItems["Top Performing Listings Roster with Units Sold"]
        ParseMetrics --> RecentFeed["Recent Completed Sales Feed with Buyer Details & Dates"]
    end
```

---

## 4. State Management Topology

The frontend uses **Redux Toolkit** for predictable state updates across disparate components:

| Redux Slice | Primary State Keys | Key Actions / Thunks | Subscribed Components |
|---|---|---|---|
| `walletSlice` | `balance`, `escrowBalance`, `loading` | `loadWallet()` (async thunk) | `WalletPill`, `WalletModal`, `ProductDetail`, `Orders` |
| `messagesSlice` | `conversations`, `activeMessages`, `unreadTotal`, `typingUsers` | `setConversations`, `appendMessage`, `setUserTyping` | `Messages`, `ChatWindow`, `ConversationList`, `Sidebar` |
| `userSlice` | `id`, `name`, `email`, `college`, `role` | `setUser`, `clearUser` | `Header`, `Sidebar`, `ProtectedRoute`, `ProductDetail` |
| `notificationSlice` | `notifications`, `unreadCount` | `addNotification`, `markAsRead` | `NotificationBell`, `NotificationDropdown` |

---

## 5. Deployment & Vercel Configuration

The frontend is deployed to Vercel at [http://college-market-place-frontend.vercel.app/](http://college-market-place-frontend.vercel.app/). All HTML5 PushState routes are routed to `/index.html` via `Frontend/vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
