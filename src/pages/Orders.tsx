import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Package,
  Search,
  RefreshCw,
  X,
  SlidersHorizontal,
  AlertCircle,
} from "lucide-react";
import { fetchMyOrders, fetchMySales } from "@/modules/orders/order.api";
import type { IOrder, OrderStatus, OrderType } from "@/modules/orders/order.types";
import OrderCard from "@/modules/orders/components/OrderCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Orders = () => {
  const [activeTab, setActiveTab] = useState<"purchases" | "sales">("purchases");
  const [purchases, setPurchases] = useState<IOrder[]>([]);
  const [sales, setSales] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    const [purchasesRes, salesRes] = await Promise.all([
      fetchMyOrders(),
      fetchMySales(),
    ]);

    if (purchasesRes.orders) {
      setPurchases(purchasesRes.orders);
    }
    if (salesRes.orders) {
      setSales(salesRes.orders);
    }

    if (purchasesRes.error && salesRes.error) {
      setError(purchasesRes.error);
    }

    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const currentList = activeTab === "purchases" ? purchases : sales;

  const filteredOrders = useMemo(() => {
    return currentList.filter((order) => {
      if (statusFilter !== "ALL" && order.status !== (statusFilter as OrderStatus)) {
        return false;
      }

      if (typeFilter !== "ALL" && order.orderType !== (typeFilter as OrderType)) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesNumber = order.orderNumber.toLowerCase().includes(q);
        const matchesTitle = order.product?.title?.toLowerCase().includes(q) || false;
        const matchesBuyer = order.buyer?.name?.toLowerCase().includes(q) || false;
        const matchesSeller = order.seller?.name?.toLowerCase().includes(q) || false;
        if (!matchesNumber && !matchesTitle && !matchesBuyer && !matchesSeller) {
          return false;
        }
      }

      return true;
    });
  }, [currentList, statusFilter, typeFilter, searchQuery]);

  const hasActiveFilters =
    searchQuery.trim() !== "" || statusFilter !== "ALL" || typeFilter !== "ALL";

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("ALL");
    setTypeFilter("ALL");
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Orders & Transactions
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track purchases, rental handshakes, and campus gig service completions.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => loadData(true)}
          disabled={loading || refreshing}
          className="gap-2 self-start sm:self-auto h-9"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm border border-destructive/20">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Tabs
        value={activeTab}
        onValueChange={(val) => {
          setActiveTab(val as "purchases" | "sales");
          clearFilters();
        }}
        className="space-y-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <TabsList className="bg-muted p-1 grid grid-cols-2 w-full md:w-auto">
            <TabsTrigger value="purchases" className="gap-2 text-xs sm:text-sm">
              <ShoppingBag className="w-4 h-4" />
              <span>My Purchases & Bookings</span>
              {purchases.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[11px] bg-background text-foreground font-semibold shadow-2xs">
                  {purchases.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="sales" className="gap-2 text-xs sm:text-sm">
              <Package className="w-4 h-4" />
              <span>My Sales & Gigs</span>
              {sales.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[11px] bg-background text-foreground font-semibold shadow-2xs">
                  {sales.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:w-60 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search orders, items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-8 h-9 text-xs sm:text-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] sm:w-[150px] h-9 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="ESCROW_HELD">Escrow Held</SelectItem>
                <SelectItem value="RENTAL_ACTIVE">Rental Active</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="DISPUTED">Disputed</SelectItem>
                <SelectItem value="REFUNDED">Refunded</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[120px] sm:w-[130px] h-9 text-xs">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="PURCHASE">Purchase</SelectItem>
                <SelectItem value="RENTAL">Rental</SelectItem>
                <SelectItem value="SERVICE">Service</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
              >
                <X className="w-3.5 h-3.5" />
                Reset
              </Button>
            )}
          </div>
        </div>

        <TabsContent value="purchases" className="mt-0 space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="p-5 space-y-4 animate-pulse">
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-muted rounded w-28" />
                    <div className="h-4 bg-muted rounded w-20" />
                  </div>
                  <div className="flex gap-4 items-center">
                    <div className="w-20 h-20 rounded-xl bg-muted shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                      <div className="h-4 bg-muted rounded w-1/3" />
                    </div>
                  </div>
                  <div className="h-8 bg-muted rounded w-full pt-2" />
                </Card>
              ))}
            </div>
          ) : purchases.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
              <div className="bg-primary/10 p-4 rounded-full inline-flex mb-4">
                <ShoppingBag className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No purchases or bookings yet
              </h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
                Explore campus listings, rent essentials, or hire student services safely with escrow protection.
              </p>
              <Button asChild>
                <Link to="/dashboard/products">Browse Products & Services</Link>
              </Button>
            </Card>
          ) : filteredOrders.length === 0 ? (
            <Card className="p-10 text-center border-dashed">
              <div className="bg-muted p-3 rounded-full inline-flex mb-3">
                <SlidersHorizontal className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1">
                No orders match your criteria
              </h3>
              <p className="text-muted-foreground text-xs mb-4">
                Try adjusting your search keywords or clearing your status filters.
              </p>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear All Filters
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredOrders.map((order, idx) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2, delay: idx * 0.03 }}
                  >
                    <OrderCard
                      order={order}
                      role="buyer"
                      onRefresh={() => loadData(true)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>

        <TabsContent value="sales" className="mt-0 space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="p-5 space-y-4 animate-pulse">
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-muted rounded w-28" />
                    <div className="h-4 bg-muted rounded w-20" />
                  </div>
                  <div className="flex gap-4 items-center">
                    <div className="w-20 h-20 rounded-xl bg-muted shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                      <div className="h-4 bg-muted rounded w-1/3" />
                    </div>
                  </div>
                  <div className="h-8 bg-muted rounded w-full pt-2" />
                </Card>
              ))}
            </div>
          ) : sales.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
              <div className="bg-primary/10 p-4 rounded-full inline-flex mb-4">
                <Package className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No sales or gigs yet
              </h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
                List your items for sale or rent, or offer campus services to earn money securely.
              </p>
              <Button asChild>
                <Link to="/dashboard/products/create">Create New Listing</Link>
              </Button>
            </Card>
          ) : filteredOrders.length === 0 ? (
            <Card className="p-10 text-center border-dashed">
              <div className="bg-muted p-3 rounded-full inline-flex mb-3">
                <SlidersHorizontal className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1">
                No sales match your criteria
              </h3>
              <p className="text-muted-foreground text-xs mb-4">
                Try adjusting your search keywords or clearing your status filters.
              </p>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear All Filters
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredOrders.map((order, idx) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2, delay: idx * 0.03 }}
                  >
                    <OrderCard
                      order={order}
                      role="seller"
                      onRefresh={() => loadData(true)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Orders;
