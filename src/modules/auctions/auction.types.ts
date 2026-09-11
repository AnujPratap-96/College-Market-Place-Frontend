export type AuctionStatus = 'PENDING' | 'ACTIVE' | 'EXTENDED' | 'ENDED' | 'CANCELLED';

export interface IBid {
  id: string;
  auctionId: string;
  bidderId: string;
  amount: number;
  isWinning: boolean;
  createdAt: string;
  bidder?: {
    id: string;
    name: string;
    college?: string;
    profileImage?: string;
  };
}

export interface IAuction {
  id: string;
  productId: string;
  sellerId: string;
  startingBid: number;
  currentBid: number;
  minIncrement: number;
  reservePrice?: number | null;
  startTime: string;
  endTime: string;
  antiSnipingSeconds: number;
  status: AuctionStatus;
  currentBidderId?: string | null;
  winnerId?: string | null;
  winner?: {
    id: string;
    name: string;
    college?: string;
    profileImage?: string;
  } | null;
  currentBidder?: {
    id: string;
    name: string;
    college?: string;
    profileImage?: string;
  } | null;
  seller?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    college?: string;
    profileImage?: string;
  };
  product: {
    id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    imageUrl?: string | null;
    type: string;
    status: string;
  };
  bids?: IBid[];
  _count?: {
    bids: number;
  };
  orderId?: string | null;
  order?: {
    id: string;
    orderNumber: string;
    status: string;
    pickupOtp?: string;
    completedAt?: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAuctionInput {
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  startingBid: number;
  minIncrement?: number;
  reservePrice?: number;
  durationHours: number;
  antiSnipingSeconds?: number;
}
