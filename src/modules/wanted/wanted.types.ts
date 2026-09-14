export type WantedRequestStatus = 'OPEN' | 'IN_PROGRESS' | 'FULFILLED' | 'CANCELLED' | 'EXPIRED';

export type OfferStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';

export interface IWantedOffer {
  id: string;
  requestId: string;
  offererId: string;
  amount: number;
  pickupLocation: string;
  message?: string;
  status: OfferStatus;
  orderId?: string;
  offerer?: {
    id: string;
    name: string;
    college?: string;
    branch?: string;
    profileImage?: string;
    trustScore?: number;
  };
  request?: {
    id: string;
    title: string;
    budget: number;
    neededBy: string;
    requester?: {
      id: string;
      name: string;
      college?: string;
      profileImage?: string;
    };
  };
  createdAt: string;
}

export interface IWantedRequest {
  id: string;
  requesterId: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  neededBy: string;
  status: WantedRequestStatus;
  acceptedOfferId?: string;
  requester: {
    id: string;
    name: string;
    college?: string;
    branch?: string;
    year?: string;
    profileImage?: string;
    trustScore?: number;
  };
  offers?: IWantedOffer[];
  _count?: {
    offers: number;
  };
  createdAt: string;
}

export interface CreateWantedInput {
  title: string;
  description: string;
  category: string;
  budget: number;
  neededBy: string;
}

export interface CreateOfferInput {
  amount: number;
  pickupLocation: string;
  message?: string;
}

export interface WantedListResponse {
  requests: IWantedRequest[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
