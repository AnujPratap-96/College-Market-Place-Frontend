export type SubscriptionStatus = 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'EXPIRED' | 'DISPUTED';

export type SubscriptionFrequency = 'WEEKLY' | 'MONTHLY';

export type DeliveryScheduleStatus = 'SCHEDULED' | 'COMPLETED' | 'SKIPPED' | 'MISSED';

export interface ISubscriptionDelivery {
  id: string;
  subscriptionId: string;
  scheduledDate: string;
  status: DeliveryScheduleStatus;
  note?: string;
  deliveredAt?: string;
  createdAt: string;
}

export interface ISubscription {
  id: string;
  subscriptionNumber: string;
  subscriberId: string;
  providerId: string;
  productId: string;
  frequency: SubscriptionFrequency;
  cycleAmount: number;
  platformFee: number;
  startDate: string;
  endDate: string;
  nextBillingDate: string;
  deliverySlots?: string;
  autoRenew: boolean;
  status: SubscriptionStatus;
  vacationFrom?: string;
  vacationTo?: string;
  deliveries: ISubscriptionDelivery[];
  product?: {
    id: string;
    title: string;
    imageUrl?: string;
    price: number;
  };
  subscriber?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    college?: string;
  };
  provider?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    college?: string;
  };
  createdAt: string;
}

export interface IProviderManifestItem {
  subscriptionId: string;
  subscriptionNumber: string;
  productTitle: string;
  subscriber: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  delivery: ISubscriptionDelivery;
}

export interface IProviderManifest {
  date: string;
  totalCount: number;
  deliveries: IProviderManifestItem[];
}
