export type NegotiationStatus = 'PENDING' | 'ACCEPTED' | 'COUNTERED' | 'DECLINED' | 'EXPIRED';

export interface INegotiationOffer {
  id: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  originalPrice: number;
  offeredPrice: number;
  status: NegotiationStatus;
  offeredById: string;
  messageId?: string;
  orderId?: string;
  createdAt: string;
  updatedAt: string;
  product?: {
    id: string;
    title: string;
    price: number;
    imageUrl?: string;
  };
}
