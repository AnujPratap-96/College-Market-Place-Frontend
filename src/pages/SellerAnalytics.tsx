import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  DollarSign,
  ShieldCheck,
  ShoppingBag,
  Zap,
  PackageCheck,
  Calendar,
  Layers,
  RefreshCw,
  Sparkles,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchSellerAnalytics } from '@/modules/analytics/analytics.api';
import type { ISellerAnalytics } from '@/modules/analytics/analytics.types';
import { toast } from '@/components/ui/toast';

export const SellerAnalytics = () => {
  const [analytics, setAnalytics] = useState<ISellerAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const res = await fetchSellerAnalytics();
    if (res.error) {
      toast.error(res.error);
    } else if (res.analytics) {
      setAnalytics(res.analytics);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const maxMonthlyRevenue = analytics?.monthlyEarnings.reduce(
    (max, m) => Math.max(max, m.revenue),
    0
  ) || 1;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card/60 backdrop-blur-sm p-6 rounded-3xl border border-border/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Seller & Earnings Analytics
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Track your peer trade earnings, escrow volume, customer satisfaction, and top listings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="rounded-xl h-9 text-xs gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button asChild size="sm" className="rounded-xl h-9 text-xs bg-orange-500 hover:bg-orange-600 text-white font-semibold">
            <Link to="/dashboard/create">
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              New Listing
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl border border-emerald-500/30 bg-emerald-50/10 dark:bg-emerald-950/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Net Profit
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-foreground">
              ₹{analytics ? analytics.netEarnings.toFixed(2) : '0.00'}
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Available & settled earnings
            </p>
          </div>
        </div>

        <div className="p-5 rounded-3xl border border-border/80 bg-card/60 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Gross Sales
            </span>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-foreground">
              ₹{analytics ? analytics.grossEarnings.toFixed(2) : '0.00'}
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {analytics?.totalSalesCount || 0} completed transactions
            </p>
          </div>
        </div>

        <div className="p-5 rounded-3xl border border-blue-500/30 bg-blue-50/10 dark:bg-blue-950/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              In Escrow Hold
            </span>
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-foreground">
              ₹{analytics ? analytics.inEscrowEarnings.toFixed(2) : '0.00'}
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Locked until pickup OTP handshake
            </p>
          </div>
        </div>

        <div className="p-5 rounded-3xl border border-amber-500/30 bg-amber-50/10 dark:bg-amber-950/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Chat Response Rate
            </span>
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-foreground">
              {analytics ? analytics.responseRate : 100}%
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Avg Order Value: ₹{analytics ? analytics.averageOrderValue.toFixed(0) : '0'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-3xl border border-border/80 bg-card/60 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-orange-500" />
                <h2 className="text-base font-bold text-foreground">
                  Monthly Revenue (Last 6 Months)
                </h2>
              </div>
              <span className="text-xs text-muted-foreground">Settled Net Earnings</span>
            </div>

            <div className="h-48 flex items-end justify-between gap-3 pt-6 pb-2 px-2">
              {analytics?.monthlyEarnings.map((m, idx) => {
                const heightPercent = maxMonthlyRevenue > 0 ? (m.revenue / maxMonthlyRevenue) * 100 : 0;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[10px] font-semibold text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                      ₹{m.revenue.toFixed(0)}
                    </span>
                    <div className="w-full max-w-[44px] bg-muted/60 rounded-xl overflow-hidden h-full flex items-end p-0.5">
                      <div
                        className="w-full bg-gradient-to-t from-orange-500 to-amber-400 rounded-lg transition-all duration-500 group-hover:brightness-110"
                        style={{ height: `${Math.max(8, heightPercent)}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-medium text-muted-foreground whitespace-nowrap">
                      {m.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
            <span>{analytics?.activeListings || 0} active listings on campus</span>
            <span className="font-semibold text-foreground">
              Total Listed: {analytics?.totalListings || 0}
            </span>
          </div>
        </div>

        <div className="p-6 rounded-3xl border border-border/80 bg-card/60 shadow-xs flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4 text-orange-500" />
            <h2 className="text-base font-bold text-foreground">
              Sales by Category
            </h2>
          </div>

          {analytics?.categoryBreakdown.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-muted-foreground text-xs">
              No category sales yet.
            </div>
          ) : (
            <div className="space-y-3.5 flex-1">
              {analytics?.categoryBreakdown.map((cat, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground capitalize">
                      {cat.category}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">₹{cat.revenue.toFixed(0)}</span>
                      <span className="text-muted-foreground text-[11px]">
                        ({cat.percentage}%)
                      </span>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
                      style={{ width: `${Math.min(100, Math.max(5, cat.percentage))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl border border-border/80 bg-card/60 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-4 h-4 text-orange-500" />
            <h2 className="text-base font-bold text-foreground">
              Top Performing Listings
            </h2>
          </div>

          {!analytics?.topProducts || analytics.topProducts.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground border border-dashed rounded-2xl">
              No sales records yet. Products with completed orders will show here.
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {analytics.topProducts.map((p) => (
                <div key={p.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        className="w-10 h-10 rounded-xl object-cover border border-border shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                        <ShoppingBag className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{p.title}</p>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">
                        {p.category}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{p.totalRevenue.toFixed(0)}
                    </p>
                    <span className="text-[10px] text-muted-foreground">
                      {p.salesCount} sold
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 rounded-3xl border border-border/80 bg-card/60 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-orange-500" />
              <h2 className="text-base font-bold text-foreground">
                Recent Completed Sales
              </h2>
            </div>
            <Button variant="ghost" size="sm" asChild className="h-7 text-xs">
              <Link to="/dashboard/orders">View All Orders</Link>
            </Button>
          </div>

          {!analytics?.recentSales || analytics.recentSales.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground border border-dashed rounded-2xl">
              No completed trades yet. Completed sales will appear in this timeline.
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {analytics.recentSales.map((sale) => (
                <div key={sale.orderId} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {sale.productImage ? (
                      <img
                        src={sale.productImage}
                        alt={sale.productTitle}
                        className="w-10 h-10 rounded-xl object-cover border border-border shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                        <ShoppingBag className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{sale.productTitle}</p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        Buyer: {sale.buyerName} · #{sale.orderNumber.slice(-6)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-foreground">
                      ₹{sale.amount.toFixed(0)}
                    </p>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(sale.completedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerAnalytics;
