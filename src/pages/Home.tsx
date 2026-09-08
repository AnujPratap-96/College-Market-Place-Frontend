import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Plus, Filter, SlidersHorizontal } from "lucide-react";
import { fetchPosts, fetchFilteredPosts, type IPost } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProductCard from "@/components/ProductCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const categories = [
  { value: "all", label: "All Categories" },
  { value: "textbooks", label: "Textbooks" },
  { value: "notes", label: "Notes" },
  { value: "electronics", label: "Electronics" },
  { value: "stationery", label: "Stationery" },
  { value: "essentials", label: "Essentials" },
  { value: "furniture", label: "Furniture" },
  { value: "other", label: "Other" },
];

const Home = () => {
  const [posts, setPosts] = useState<IPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");

  const loadPosts = useCallback(async (cat: string, query: string) => {
    setLoading(true);
    setError(null);

    const result =
      cat !== "all" || query.trim()
        ? await fetchFilteredPosts(cat === "all" ? "" : cat, query)
        : await fetchPosts();

    if (result.success) {
      setPosts(result.success);
    } else {
      setError(result.error || "Failed to load products");
      setPosts([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPosts(category, searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [category, searchQuery, loadPosts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadPosts(category, searchQuery);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Browse <span className="text-primary">Products</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Find textbooks, notes, and essentials from your campus
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link to="/dashboard/products/create">
            <Plus className="w-4 h-4" />
            List Item
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-card rounded-xl border border-border/50">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </form>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
          <Button onClick={() => loadPosts(category, searchQuery)}>Try Again</Button>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <div className="bg-primary/10 p-4 rounded-full inline-flex mb-4">
            <Filter className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No products found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || category !== "all"
              ? "Try adjusting your search or filters"
              : "Be the first to list something on the marketplace!"}
          </p>
          <Button asChild>
            <Link to="/dashboard/products/create">List Item</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <ProductCard post={post} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
