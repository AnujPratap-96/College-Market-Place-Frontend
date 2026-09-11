export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'ESCROW_HELD'
  | 'RENTAL_ACTIVE'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DISPUTED'
  | 'REFUNDED';

export type OrderType = 'PURCHASE' | 'RENTAL' | 'SERVICE';

export interface IOrder {
  id: string;
  orderNumber: string;
  buyerId: string;
  sellerId: string;
  productId: string;
  price: number;
  platformFee: number;
  totalAmount: number;
  securityDeposit: number;
  rentalDays?: number;
  rentalStartDate?: string;
  rentalEndDate?: string;
  orderType: OrderType;
  status: OrderStatus;
  pickupOtp?: string;
  returnOtp?: string;
  paymentMethod: string;
  disputeReason?: string;
  disputeResolution?: string;
  product?: {
    id: string;
    title: string;
    imageUrl?: string;
    price: number;
    type: string;
  };
  buyer?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    college?: string;
  };
  seller?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    college?: string;
  };
  createdAt: string;
  completedAt?: string;
  cancelledAt?: string;
}
