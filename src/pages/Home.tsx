import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Plus, Filter, SlidersHorizontal, Gavel } from "lucide-react";
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
  { value: "all", label: "All Categories" },
  { value: "textbooks", label: "Textbooks" },
  { value: "notes", label: "Notes & Material" },
  { value: "electronics", label: "Electronics" },
  { value: "stationery", label: "Stationery" },
  { value: "essentials", label: "Essentials" },
  { value: "furniture", label: "Furniture" },
  { value: "food", label: "Food & Meals" },
  { value: "services", label: "Services" },
  { value: "other", label: "Other" },
];

const PRODUCT_TYPES = [
  { value: "ALL", label: "All Items" },
  { value: "SELL", label: "For Sale" },
  { value: "RENT", label: "For Rent" },
  { value: "SERVICE", label: "Services" },
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Browse <span className="text-primary">Marketplace</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Find textbooks, gear rentals, student services, and recurring hostel plans
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild className="gap-2 border-orange-500/30 hover:border-orange-500/50 hover:bg-orange-500/10 text-orange-600 dark:text-orange-400">
            <Link to="/dashboard/auctions">
              <Gavel className="w-4 h-4" />
              Live Auctions Arena
            </Link>
          </Button>
          <Button asChild className="gap-2">
            <Link to="/dashboard/products/create">
              <Plus className="w-4 h-4" />
              List Item
            </Link>
          </Button>
        </div>
      </div>

      <div className="space-y-3 p-4 bg-card rounded-xl border border-border/50 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search products, services, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </form>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-[190px]">
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

        <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1">
          {PRODUCT_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setSelectedType(t.value)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                selectedType === t.value
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-card rounded-2xl overflow-hidden border border-border/50">
              <div className="h-48 bg-muted animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-6 bg-muted rounded animate-pulse" />
                <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <div className="bg-destructive/10 p-4 rounded-full inline-flex mb-4">
            <SlidersHorizontal className="w-8 h-8 text-destructive" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Something went wrong</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => loadProducts(category, searchQuery, selectedType)}>
            Try Again
          </Button>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <div className="bg-primary/10 p-4 rounded-full inline-flex mb-4">
            <Filter className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No listings found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || category !== "all" || selectedType !== "ALL"
              ? "Try adjusting your search filters or listing type"
              : "Be the first to list an item or service on the marketplace!"}
          </p>
          <Button asChild>
            <Link to="/dashboard/products/create">List Item</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
