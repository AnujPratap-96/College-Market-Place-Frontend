import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Laptop,
  Bike,
  Armchair,
  GraduationCap,
  Gavel,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchProducts } from "@/modules/products/product.api";
import { fetchAuctions } from "@/modules/auctions/auction.api";
import type { IProduct } from "@/modules/products/product.types";
import type { IAuction } from "@/modules/auctions/auction.types";

const CATEGORIES = [
  { id: "all", label: "All Items", icon: Sparkles },
  { id: "books", label: "Books & Notes", icon: BookOpen },
  { id: "electronics", label: "Laptops & Gadgets", icon: Laptop },
  { id: "cycles", label: "Cycles & Mobility", icon: Bike },
  { id: "furniture", label: "Hostel Essentials", icon: Armchair },
  { id: "services", label: "Campus Gigs & Tutoring", icon: GraduationCap },
  { id: "auctions", label: "Live Move-Out Auctions", icon: Gavel },
];

export const CategoryShowcase = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [products, setProducts] = useState<IProduct[]>([]);
  const [auctions, setAuctions] = useState<IAuction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      try {
        const [prodRes, aucRes] = await Promise.all([
          fetchProducts(),
          fetchAuctions({ status: "ACTIVE" }),
        ]);

        if (isMounted) {
          if (prodRes.products && prodRes.products.length > 0) {
            // Limit to authentic 12 products (between 10-15 as requested)
            setProducts(prodRes.products.slice(0, 12));
          }
          if (aucRes.auctions && aucRes.auctions.length > 0) {
            setAuctions(aucRes.auctions);
          }
        }
      } catch (err) {
        console.error("Error loading authentic items for showcase:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter products by activeTab
  const filteredProducts = products.filter((prod) => {
    if (activeTab === "all") return true;
    if (activeTab === "auctions") return prod.type === "AUCTION";
    if (activeTab === "cycles") return prod.category === "cycles" || prod.category === "mobility";
    if (activeTab === "furniture") return prod.category === "furniture" || prod.category === "essentials";
    return prod.category?.toLowerCase() === activeTab.toLowerCase();
  });

  // Calculate remaining time for auction item
  const getAuctionTimeRemaining = (prodId: string) => {
    const auc = auctions.find((a) => a.productId === prodId || a.product?.id === prodId);
    if (!auc || !auc.endTime) return null;
    const diff = new Date(auc.endTime).getTime() - Date.now();
    if (diff <= 0) return "Ended";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m left`;
  };

  return (
    <section id="explore" className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
        <Badge variant="outline" className="px-3 py-1 text-xs font-semibold text-orange-600 border-orange-400/40 bg-orange-500/10">
          CAMPUS LIVE DISCOVERY
        </Badge>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
          Authentic Campus Listings Available Now
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg">
          Live products and senior move-out clearance auctions currently listed by verified peers.
        </p>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-orange-500 text-white shadow-md shadow-orange-500/25"
                    : "bg-muted/70 hover:bg-muted text-foreground/80 hover:text-foreground border border-border/60"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-border/70 bg-card p-4 space-y-4 animate-pulse">
              <div className="aspect-16/10 rounded-xl bg-muted" />
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="h-8 bg-muted rounded pt-4" />
            </div>
          ))}
        </div>
      )}

      {/* Grid of authentic products */}
      {!loading && (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredProducts.map((item) => {
              const auctionTime = item.type === "AUCTION" ? getAuctionTimeRemaining(item.id) : null;
              const sellerName = item.owner?.name || "Campus Student";
              const sellerCollege = item.owner?.college || "University Campus";

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  key={item.id}
                  className="rounded-2xl border border-border/80 bg-card overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-xl hover:border-orange-500/30 transition-all group"
                >
                  <div>
                    <div className="relative aspect-16/10 overflow-hidden bg-muted">
                      <img
                        src={item.imageUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80"}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <Badge
                          className={`text-[10px] font-bold ${
                            item.type === "AUCTION"
                              ? "bg-orange-600 text-white"
                              : item.type === "SERVICE"
                              ? "bg-purple-600 text-white"
                              : item.type === "SUBSCRIPTION"
                              ? "bg-emerald-600 text-white"
                              : "bg-blue-600 text-white"
                          }`}
                        >
                          {item.type === "AUCTION"
                            ? "Live Auction"
                            : item.type === "SERVICE"
                            ? "Campus Service"
                            : item.type === "SUBSCRIPTION"
                            ? "Meal Plan"
                            : "For Sale"}
                        </Badge>
                      </div>

                      {auctionTime && (
                        <span className="absolute bottom-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-black/80 text-amber-300 backdrop-blur-xs flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {auctionTime}
                        </span>
                      )}

                      {!auctionTime && item.serviceDuration && (
                        <span className="absolute bottom-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-black/75 text-white backdrop-blur-xs">
                          {item.serviceDuration}
                        </span>
                      )}
                    </div>

                    <div className="p-5 space-y-2.5">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="font-semibold text-orange-600 dark:text-orange-400">
                          {sellerCollege}
                        </span>
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                          <ShieldCheck className="w-3.5 h-3.5" /> Escrow Protected
                        </span>
                      </div>

                      <h3 className="font-bold text-base text-foreground leading-snug line-clamp-2 group-hover:text-orange-500 transition-colors">
                        {item.title}
                      </h3>

                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {item.description}
                      </p>

                      <p className="text-xs text-muted-foreground pt-1">
                        Seller: <span className="font-medium text-foreground">{sellerName}</span>
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <div className="flex items-baseline justify-between border-t border-border/60 pt-3">
                      <div>
                        <span className="text-xs text-muted-foreground block">
                          {item.type === "AUCTION" ? "Starting Bid" : "Price"}
                        </span>
                        <span className="text-xl font-extrabold text-foreground font-mono">
                          ₹{item.price}
                        </span>
                      </div>

                      <Button
                        size="sm"
                        className="bg-orange-500/10 hover:bg-orange-500 text-orange-600 hover:text-white font-semibold transition-all cursor-pointer"
                        asChild
                      >
                        <Link to="/auth/signup">View Details</Link>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Explore More CTA */}
      <div className="text-center mt-12">
        <Button
          size="lg"
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 shadow-md shadow-orange-500/20 gap-2 cursor-pointer"
          asChild
        >
          <Link to="/auth/signup">
            <span>Explore All Campus Listings</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default CategoryShowcase;
