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
  ShieldCheck,
  KeyRound,
  Zap,
  Plus,
  Gavel,
} from "lucide-react";
import { fetchMyOrders, fetchMySales } from "@/modules/orders/order.api";
import type { IOrder, OrderStatus, OrderType } from "@/modules/orders/order.types";
import OrderCard from "@/modules/orders/components/OrderCard";
import { toast } from "@/components/ui/toast";
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

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

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
      toast.error(purchasesRes.error);
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

      <Tabs
        value={activeTab}
        onValueChange={(val) => {
          setActiveTab(val as "purchases" | "sales");
          clearFilters();
        }}
        className="space-y-6"
      >
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <TabsList className="bg-muted/80 p-1.5 h-auto rounded-xl inline-flex flex-col sm:flex-row w-full sm:w-auto gap-1.5 border border-border/50 shrink-0">
            <TabsTrigger
              value="purchases"
              className="gap-2.5 px-5 py-2.5 h-10 rounded-lg text-xs sm:text-sm font-semibold transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm min-w-0 sm:min-w-[230px] justify-center"
            >
              <ShoppingBag className="w-4 h-4 shrink-0" />
              <span>My Purchases & Bookings</span>
              {purchases.length > 0 && (
                <span className="ml-1.5 px-2 py-0.5 rounded-full text-[11px] bg-primary/10 text-primary font-bold">
                  {purchases.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="sales"
              className="gap-2.5 px-5 py-2.5 h-10 rounded-lg text-xs sm:text-sm font-semibold transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm min-w-0 sm:min-w-[230px] justify-center"
            >
              <Package className="w-4 h-4 shrink-0" />
              <span>My Sales & Gigs</span>
              {sales.length > 0 && (
                <span className="ml-1.5 px-2 py-0.5 rounded-full text-[11px] bg-primary/10 text-primary font-bold">
                  {sales.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {currentList.length > 0 && (
            <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto">
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
                  <SelectItem value="AUCTION">Auction</SelectItem>
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
          )}
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
            <div className="rounded-2xl border border-border/60 bg-card/60 p-8 sm:p-12 text-center shadow-xs">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-xs">
                <ShoppingBag className="h-7 w-7 text-primary" />
              </div>

              <h3 className="text-xl font-bold tracking-tight text-foreground">
                No purchases or bookings yet
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground leading-relaxed">
                When you buy used textbooks, rent gear, or hire student services, your live transactions and escrow verification OTPs will appear here.
              </p>

              <div className="my-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left max-w-2xl mx-auto">
                <div className="rounded-xl border border-border/40 bg-background/60 p-4 space-y-1">
                  <div className="flex items-center gap-2 text-primary font-semibold text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Escrow Protected</span>
                  </div>
                  <p className="text-[12px] text-muted-foreground leading-snug">
                    Your money is held securely until you inspect the item in person.
                  </p>
                </div>

                <div className="rounded-xl border border-border/40 bg-background/60 p-4 space-y-1">
                  <div className="flex items-center gap-2 text-primary font-semibold text-xs">
                    <KeyRound className="w-4 h-4 text-amber-500" />
                    <span>4-Digit Pickup OTP</span>
                  </div>
                  <p className="text-[12px] text-muted-foreground leading-snug">
                    Share your code with the seller only when receiving the item.
                  </p>
                </div>

                <div className="rounded-xl border border-border/40 bg-background/60 p-4 space-y-1">
                  <div className="flex items-center gap-2 text-primary font-semibold text-xs">
                    <Zap className="w-4 h-4 text-sky-500" />
                    <span>Instant Settlement</span>
                  </div>
                  <p className="text-[12px] text-muted-foreground leading-snug">
                    Instant wallet releases with full transparent receipt history.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button asChild className="gap-2 h-10 px-5">
                  <Link to="/dashboard">
                    <ShoppingBag className="w-4 h-4" />
                    <span>Browse Campus Items</span>
                  </Link>
                </Button>
                <Button variant="outline" asChild className="gap-2 h-10 px-5">
                  <Link to="/dashboard/auctions">
                    <Gavel className="w-4 h-4" />
                    <span>Live Auctions</span>
                  </Link>
                </Button>
              </div>

              <div className="mt-8 pt-6 border-t border-border/40 flex items-center justify-center gap-2 flex-wrap text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Explore categories:</span>
                <Link to="/dashboard?category=textbooks" className="px-2.5 py-1 rounded-full bg-muted hover:bg-accent hover:text-foreground transition-colors">
                  📚 Textbooks
                </Link>
                <Link to="/dashboard?category=electronics" className="px-2.5 py-1 rounded-full bg-muted hover:bg-accent hover:text-foreground transition-colors">
                  💻 Electronics
                </Link>
                <Link to="/dashboard?category=services" className="px-2.5 py-1 rounded-full bg-muted hover:bg-accent hover:text-foreground transition-colors">
                  🛠️ Services & Gigs
                </Link>
              </div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-8 text-center max-w-lg mx-auto space-y-3">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <SlidersHorizontal className="h-5 w-5" />
              </div>
              <h4 className="text-base font-semibold text-foreground">
                No matching orders found
              </h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                No orders match your current search query or status filter.
              </p>
              <Button variant="outline" size="sm" onClick={clearFilters} className="mt-2 h-8 text-xs">
                Clear All Filters
              </Button>
            </div>
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
            <div className="rounded-2xl border border-border/60 bg-card/60 p-8 sm:p-12 text-center shadow-xs">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-xs">
                <Package className="h-7 w-7 text-primary" />
              </div>

              <h3 className="text-xl font-bold tracking-tight text-foreground">
                No sales or gigs yet
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground leading-relaxed">
                Turn your unused textbooks, electronics, or campus skills into cash. When a student places an order, you'll manage handshakes and OTP verifications here.
              </p>

              <div className="my-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left max-w-2xl mx-auto">
                <div className="rounded-xl border border-border/40 bg-background/60 p-4 space-y-1">
                  <div className="flex items-center gap-2 text-primary font-semibold text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Guaranteed Payment</span>
                  </div>
                  <p className="text-[12px] text-muted-foreground leading-snug">
                    Buyer funds are held in escrow before you prepare the item.
                  </p>
                </div>

                <div className="rounded-xl border border-border/40 bg-background/60 p-4 space-y-1">
                  <div className="flex items-center gap-2 text-primary font-semibold text-xs">
                    <KeyRound className="w-4 h-4 text-amber-500" />
                    <span>Verification OTP</span>
                  </div>
                  <p className="text-[12px] text-muted-foreground leading-snug">
                    Enter buyer's code at handover to immediately release money.
                  </p>
                </div>

                <div className="rounded-xl border border-border/40 bg-background/60 p-4 space-y-1">
                  <div className="flex items-center gap-2 text-primary font-semibold text-xs">
                    <Zap className="w-4 h-4 text-sky-500" />
                    <span>Direct to Wallet</span>
                  </div>
                  <p className="text-[12px] text-muted-foreground leading-snug">
                    Payouts land in your wallet immediately upon completion.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button asChild className="gap-2 h-10 px-5">
                  <Link to="/dashboard/products/create">
                    <Plus className="w-4 h-4" />
                    <span>Create a Listing</span>
                  </Link>
                </Button>
                <Button variant="outline" asChild className="gap-2 h-10 px-5">
                  <Link to="/dashboard/products">
                    <Package className="w-4 h-4" />
                    <span>View My Listings</span>
                  </Link>
                </Button>
              </div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-8 text-center max-w-lg mx-auto space-y-3">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <SlidersHorizontal className="h-5 w-5" />
              </div>
              <h4 className="text-base font-semibold text-foreground">
                No matching sales found
              </h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                No sales match your current search query or status filter.
              </p>
              <Button variant="outline" size="sm" onClick={clearFilters} className="mt-2 h-8 text-xs">
                Clear All Filters
              </Button>
            </div>
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
