export interface ISystemSettings {
  platform_commission_percent: string
  min_withdrawal_amount: string
  payout_gateway_mode: 'SANDBOX' | 'LIVE'
  auto_complete_days: string
  [key: string]: string
}

export interface IDisputedOrder {
  id: string
  orderNumber: string
  buyerId: string
  sellerId: string
  productId: string
  price: number
  platformFee: number
  totalAmount: number
  securityDeposit: number
  orderType: 'PURCHASE' | 'RENTAL' | 'SERVICE' | 'AUCTION'
  status: string
  disputeReason?: string
  disputedAt?: string
  disputeResolution?: string
  product?: {
    id: string
    title: string
    price: number
    imageUrl?: string
    type: string
  }
  buyer?: {
    id: string
    name: string
    email: string
    phone?: string
    college?: string
  }
  seller?: {
    id: string
    name: string
    email: string
    phone?: string
    college?: string
  }
  createdAt: string
}

export interface IReportItem {
  id: string
  productId: string
  reporterId: string
  reason: string
  details?: string
  status: 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED'
  createdAt: string
  reporter: {
    id: string
    name: string
    email: string
    college?: string
  }
  product: {
    id: string
    title: string
    price: number
    isFlagged: boolean
    owner: {
      id: string
      name: string
      email: string
      phone?: string
      college?: string
    }
  }
}

export interface IFinancialStats {
  totalVolume: number
  totalPlatformFee: number
  totalEscrowHeld: number
  totalUserBalances: number
  completedOrdersCount: number
  activeSubscriptionsCount: number
  activeDisputesCount: number
}
