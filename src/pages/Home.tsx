import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  SlidersHorizontal,
  Gavel,
  Sparkles,
  BookOpen,
  Laptop,
  PenTool,
  Bike,
  Armchair,
  Utensils,
  Zap,
  Package,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProductCard from "@/modules/products/components/ProductCard";
import { fetchProducts } from "@/modules/products/product.api";
import type { IProduct } from "@/modules/products/product.types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CATEGORIES = [
  { value: "all", label: "All Items", icon: Sparkles },
  { value: "textbooks", label: "Books & Notes", icon: BookOpen },
  { value: "electronics", label: "Electronics & Tech", icon: Laptop },
  { value: "cycles", label: "Cycles & Mobility", icon: Bike },
  { value: "furniture", label: "Furniture & Coolers", icon: Armchair },
  { value: "stationery", label: "Stationery & Tools", icon: PenTool },
  { value: "food", label: "Meal Plans & Tiffin", icon: Utensils },
  { value: "services", label: "Tutoring & Gigs", icon: Zap },
];

const PRODUCT_TYPES = [
  { value: "ALL", label: "All Listings" },
  { value: "SELL", label: "For Sale" },
  { value: "RENT", label: "Rentals" },
  { value: "SERVICE", label: "Campus Gigs" },
  { value: "SUBSCRIPTION", label: "Subscriptions" },
  { value: "AUCTION", label: "Live Auctions" },
];

const Home = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("ALL");

  const loadProducts = useCallback(async (cat: string, query: string, typeFilter: string) => {
    setLoading(true);
    setError(null);

    const result = await fetchProducts({
      category: cat !== "all" ? cat : undefined,
      query: query.trim() ? query : undefined,
      type: typeFilter !== "ALL" ? typeFilter : undefined,
    });

    if (result.error) {
      setError(result.error);
      setProducts([]);
    } else {
      setProducts(result.products || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts(category, searchQuery, selectedType);
    }, 350);
    return () => clearTimeout(timer);
  }, [category, searchQuery, selectedType, loadProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadProducts(category, searchQuery, selectedType);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setCategory("all");
    setSelectedType("ALL");
  };

  return (
    <div className="space-y-8">
      {/* Dynamic Campus Announcement Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-transparent border border-orange-500/20 p-6 sm:p-8 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Campus Live Marketplace · IIT / BITS / NIT Circle</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-foreground leading-tight">
              Peer-to-Peer Campus Essentials,{" "}
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                Scam-Free.
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Find textbooks, rent lab gear, bid on move-out cycles, or book hostel tiffin services. Every trade is secured by our physical 6-digit OTP Escrow Handshake.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <Button
              asChild
              variant="outline"
              className="gap-2 h-11 px-5 rounded-xl border-orange-500/30 hover:border-orange-500/60 hover:bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold text-xs sm:text-sm"
            >
              <Link to="/dashboard/auctions">
                <Gavel className="w-4 h-4 text-orange-500" />
                Live Auctions Arena
              </Link>
            </Button>
            <Button
              asChild
              className="gap-2 h-11 px-5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold shadow-md shadow-orange-500/20 text-xs sm:text-sm cursor-pointer"
            >
              <Link to="/dashboard/products/create">
                <Plus className="w-4 h-4" />
                List an Item
              </Link>
            </Button>
          </div>
        </div>

        {/* Ambient decorative blob */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Category Chips Bar */}
      <div className="min-w-0 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Explore Categories
          </h2>
          {(category !== "all" || selectedType !== "ALL" || searchQuery) && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-xs font-semibold text-orange-600 hover:text-orange-500 cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        <div className="flex min-w-0 items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = category === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer border ${
                  isSelected
                    ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20"
                    : "bg-card/80 hover:bg-muted/70 text-muted-foreground hover:text-foreground border-border/70"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="space-y-3 p-4 bg-card/85 backdrop-blur-md rounded-2xl border border-border/70 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by title, department, course, or hostel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-9 h-11 rounded-xl bg-background/50 border-border/70 focus-visible:ring-orange-500 text-xs sm:text-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-[200px] h-11 rounded-xl bg-background/50 border-border/70 text-xs sm:text-sm">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Segmented Type Filter Buttons */}
        <div className="flex min-w-0 items-center gap-1.5 overflow-x-auto pt-1 scrollbar-none">
          {PRODUCT_TYPES.map((t) => {
            const isSelected = selectedType === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setSelectedType(t.value)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? "bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30 shadow-xs"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Listings Grid / Empty / Error / Loading States */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-card/70 rounded-2xl overflow-hidden border border-border/60">
              <div className="h-48 bg-muted animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-5 bg-muted rounded animate-pulse w-3/4" />
                <div className="h-4 bg-muted rounded animate-pulse w-full" />
                <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16 p-8 bg-card/60 rounded-3xl border border-border/60">
          <div className="bg-destructive/10 p-4 rounded-2xl inline-flex mb-4 text-destructive">
            <SlidersHorizontal className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">Unable to Load Listings</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">{error}</p>
          <Button
            onClick={() => loadProducts(category, searchQuery, selectedType)}
            className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6"
          >
            Retry Connection
          </Button>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 p-8 bg-card/60 rounded-3xl border border-border/60">
          <div className="bg-orange-500/10 p-4 rounded-2xl inline-flex mb-4 text-orange-600 dark:text-orange-400">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">No Campus Listings Found</h3>
          <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">
            {searchQuery || category !== "all" || selectedType !== "ALL"
              ? "Try adjusting your search query, selecting 'All Items', or resetting the listing filters."
              : "No listings posted in this category yet. Be the first student to post!"}
          </p>
          <div className="flex justify-center gap-3">
            {(searchQuery || category !== "all" || selectedType !== "ALL") && (
              <Button variant="outline" onClick={handleClearFilters} className="rounded-xl">
                Clear Filters
              </Button>
            )}
            <Button asChild className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold">
              <Link to="/dashboard/products/create">Post First Item</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Showing <span className="text-foreground font-black">{products.length}</span> verified campus items
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.04, 0.3) }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
