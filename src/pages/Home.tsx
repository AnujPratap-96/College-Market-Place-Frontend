import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
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
import type { IProduct } from "@/modules/products/product.types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { liteClient as algoliasearch } from 'algoliasearch/lite';
import { InstantSearch, useHits, useSearchBox, Configure,  } from 'react-instantsearch';

const searchClient = algoliasearch(
  import.meta.env.VITE_ALGOLIA_APP_ID,
  import.meta.env.VITE_ALGOLIA_SEARCH_KEY
);

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

function CustomSearchBox({ 
  searchQuery, 
  setSearchQuery 
}: { 
  searchQuery: string; 
  setSearchQuery: (q: string) => void;
}) {
  const { refine } = useSearchBox();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const q = searchParams.get("q");
    if (q && q !== searchQuery) {
      setSearchQuery(q);
      refine(q);
      
      // Clean up the URL so it doesn't linger
      searchParams.delete("q");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, refine, setSearchQuery, searchQuery, setSearchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <form onSubmit={handleSearch} className="flex-1 relative">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search by title, category, description..."
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          refine(e.target.value);
        }}
        className="pl-10 pr-9 h-11 rounded-xl bg-background/50 border-border/70 focus-visible:ring-orange-500 text-xs sm:text-sm"
      />
      {searchQuery && (
        <button
          type="button"
          onClick={() => {
            setSearchQuery("");
            refine("");
          }}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </form>
  );
}

function CustomHits() {
  const { hits, results } = useHits();

  if (results && results.nbHits === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-card/50 backdrop-blur-md rounded-2xl border border-dashed border-border/70 mt-6">
        <Package className="w-12 h-12 text-muted-foreground/50 mb-4 stroke-[1.5]" />
        <h3 className="text-lg font-bold text-foreground mb-1">
          No items found
        </h3>
        <p className="text-sm text-muted-foreground">
          We couldn't find anything matching your search.
        </p>
        <Button variant="outline" className="mt-6 rounded-xl border-border/70" onClick={() => window.location.reload()}>
          Clear Filters
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5 mt-6">
      {hits.map((hit: any) => (
        <motion.div
          key={hit.objectID}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="h-full"
        >
          <ProductCard product={hit as IProduct} />
        </motion.div>
      ))}
    </div>
  );
}


const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("ALL");

  const handleClearFilters = () => {
    setSearchQuery("");
    setCategory("all");
    setSelectedType("ALL");
  };

  return (
    <InstantSearch searchClient={searchClient} indexName="college_marketplace_products">
      
      {/* Configure Algolia Filters based on React State */}
      <Configure 
        filters={
          [
            category !== "all" ? `category:${category}` : "",
            selectedType !== "ALL" ? `type:${selectedType}` : ""
          ].filter(Boolean).join(" AND ")
        }
      />

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
                onClick={() => {
                  handleClearFilters();
                  const event = new Event('reset-search');
                  document.dispatchEvent(event);
                }}
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
            
            {/* ALGOLIA SEARCH BOX */}
            <CustomSearchBox searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

            <div className="flex items-center gap-3 shrink-0">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full sm:w-[150px] h-11 bg-background/50 border-border/70 rounded-xl text-xs sm:text-sm">
                  <SelectValue placeholder="Listing Type" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/70">
                  {PRODUCT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value} className="text-xs sm:text-sm rounded-lg">
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-11 shrink-0 border-border/70 rounded-xl bg-background/50 text-muted-foreground hover:text-foreground"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* ALGOLIA HITS */}
        <CustomHits />

      </div>
    </InstantSearch>
  );
};

export default Home;
