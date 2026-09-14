export interface ISellerAnalytics {
  grossEarnings: number;
  netEarnings: number;
  inEscrowEarnings: number;
  totalSalesCount: number;
  averageOrderValue: number;
  totalListings: number;
  activeListings: number;
  responseRate: number;
  monthlyEarnings: Array<{
    month: string;
    revenue: number;
    ordersCount: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    revenue: number;
    count: number;
    percentage: number;
  }>;
  topProducts: Array<{
    id: string;
    title: string;
    category: string;
    price: number;
    imageUrl?: string | null;
    salesCount: number;
    totalRevenue: number;
  }>;
  recentSales: Array<{
    orderId: string;
    orderNumber: string;
    productTitle: string;
    productImage?: string | null;
    amount: number;
    buyerName: string;
    completedAt: string;
  }>;
}
