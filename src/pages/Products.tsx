import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Package, Sparkles, Loader2, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "@/modules/products/components/ProductCard";
import { fetchProducts, fetchMyProducts, deleteProduct } from "@/modules/products/product.api";
import type { IProduct } from "@/modules/products/product.types";
import { toast } from "@/components/ui/toast";
import { scrollToTop } from "@/utils/scroll";

const PAGE_LIMIT = 12;

const Products = () => {
  const [posts, setPosts] = useState<IProduct[]>([]);
  const [viewMode, setViewMode] = useState<"mine" | "all">("mine");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingMoreRef = useRef(false);
  loadingMoreRef.current = loadingMore;

  const loadInitialPosts = useCallback(async (mode: "mine" | "all") => {
    setLoading(true);
    setPage(1);
    const result = mode === "mine" 
      ? await fetchMyProducts({ page: 1, limit: PAGE_LIMIT }) 
      : await fetchProducts({ page: 1, limit: PAGE_LIMIT });

    if (result.error) {
      toast.error(result.error);
      setPosts([]);
      setHasMore(false);
      setTotal(0);
    } else {
      setPosts(result.products || []);
      setHasMore(result.pagination?.hasMore ?? false);
      setTotal(result.pagination?.total ?? (result.products?.length || 0));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadInitialPosts(viewMode);
  }, [viewMode, loadInitialPosts]);

  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    const result = viewMode === "mine"
      ? await fetchMyProducts({ page: nextPage, limit: PAGE_LIMIT })
      : await fetchProducts({ page: nextPage, limit: PAGE_LIMIT });

    if (result.error) {
      toast.error(result.error);
    } else {
      setPosts((prev) => [...prev, ...(result.products || [])]);
      setPage(nextPage);
      setHasMore(result.pagination?.hasMore ?? false);
      if (result.pagination?.total) setTotal(result.pagination.total);
    }
    setLoadingMore(false);
  }, [viewMode, page, hasMore]);

  useEffect(() => {
    if (!sentinelRef.current || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMoreRef.current) {
          loadMore();
        }
      },
      { rootMargin: "350px" }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, loadMore]);

  const handleDelete = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    const result = await deleteProduct(postId);
    if (result.success) {
      toast.success("Listing deleted successfully!");
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      setTotal((prev) => Math.max(0, prev - 1));
    } else {
      toast.error(result.error || "Failed to delete listing");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 mb-1">
            <Sparkles className="w-3 h-3" />
            <span>Listing Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            {viewMode === "mine" ? "My Campus Listings" : "All Campus Offerings"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {viewMode === "mine"
              ? "Manage your active items, rentals, tutoring services, and live auctions"
              : "Explore peer-to-peer items listed across the university"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-xl bg-muted/80 p-1 border border-border/60">
            <button
              type="button"
              onClick={() => setViewMode("mine")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "mine"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              My Listings ({viewMode === "mine" ? total : "..."})
            </button>
            <button
              type="button"
              onClick={() => setViewMode("all")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "all"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Campus Listings ({viewMode === "all" ? total : "..."})
            </button>
          </div>

          <Button
            asChild
            className="gap-2 h-10 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold shadow-md shadow-orange-500/20 cursor-pointer"
          >
            <Link to="/dashboard/products/create">
              <Plus className="w-4 h-4" />
              New Listing
            </Link>
          </Button>
        </div>
      </div>

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
      ) : posts.length === 0 ? (
        <div className="p-12 text-center bg-card/75 backdrop-blur-md rounded-3xl border border-border/70 shadow-xs max-w-lg mx-auto">
          <div className="bg-orange-500/10 p-4 rounded-2xl inline-flex mb-4 text-orange-600 dark:text-orange-400">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">
            {viewMode === "mine" ? "No Listings Posted Yet" : "No Campus Products Available"}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mb-6 leading-relaxed">
            {viewMode === "mine"
              ? "Post books, gear, lab equipment, or campus services to reach thousands of peers across hostels."
              : "Check back later or be the first student to list something!"}
          </p>
          <Button
            asChild
            className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold px-6 shadow-md shadow-orange-500/20"
          >
            <Link to="/dashboard/products/create">Create First Listing</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min((index % PAGE_LIMIT) * 0.04, 0.25) }}
              >
                <ProductCard
                  product={post}
                  onDelete={viewMode === "mine" ? handleDelete : undefined}
                />
              </motion.div>
            ))}
          </div>

          {/* Infinite Scroll Sentinel and Status */}
          <div ref={sentinelRef} className="py-6 flex flex-col items-center justify-center">
            {hasMore ? (
              <div className="flex flex-col items-center gap-3">
                <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-muted-foreground bg-card/70 border border-border/60 px-4 py-2 rounded-full shadow-xs">
                  <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                  <span>Loading more listings...</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="text-xs rounded-xl border-border/70 hover:border-orange-500/50 hover:text-orange-500 cursor-pointer"
                >
                  {loadingMore ? "Loading..." : "Load More Manually"}
                </Button>
              </div>
            ) : posts.length > 0 ? (
              <div className="flex flex-col items-center gap-2 text-center text-muted-foreground pt-4 border-t border-border/40 w-full max-w-md mx-auto">
                <p className="text-xs sm:text-sm font-medium text-foreground">
                  🎉 Showing all {posts.length} {viewMode === "mine" ? "of your listings" : "campus offerings"}!
                </p>
                <button
                  type="button"
                  onClick={() => scrollToTop()}
                  className="inline-flex items-center gap-1.5 text-xs text-orange-600 dark:text-orange-400 hover:underline cursor-pointer font-medium"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                  Back to top
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
