export type ProductType = 'SELL' | 'RENT' | 'SERVICE' | 'SUBSCRIPTION' | 'AUCTION';

export type SubscriptionFrequency = 'WEEKLY' | 'MONTHLY';

export interface IProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  type: ProductType;
  category: string;
  status: string;
  imageUrl?: string;
  images?: string[];
  frequency?: SubscriptionFrequency;
  deliverySlots?: string;
  serviceDuration?: string;
  securityDeposit?: number;
  rentalDuration?: string;
  auction?: any;
  owner?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    college?: string;
    profileImage?: string;
  };
  seller?: {
    id: string;
    name: string;
    email: string;
    phoneNo?: string;
    college?: string;
    image?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductInput {
  title: string;
  description: string;
  price: number;
  category: string;
  type: ProductType;
  imageUrl?: string;
  images?: string[];
  frequency?: SubscriptionFrequency;
  deliverySlots?: string;
  serviceDuration?: string;
  securityDeposit?: number;
  rentalDuration?: string;
  startingBid?: number;
  minIncrement?: number;
  reservePrice?: number;
  durationHours?: number;
  antiSnipingSeconds?: number;
}
