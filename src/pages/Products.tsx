import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Package, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ProductCard from "@/modules/products/components/ProductCard";
import { fetchProducts, fetchMyProducts, deleteProduct } from "@/modules/products/product.api";
import type { IProduct } from "@/modules/products/product.types";

const Products = () => {
  const [posts, setPosts] = useState<IProduct[]>([]);
  const [viewMode, setViewMode] = useState<"mine" | "all">("mine");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = viewMode === "mine" ? await fetchMyProducts() : await fetchProducts();
    if (result.error) {
      setError(result.error);
      setPosts([]);
    } else {
      setPosts(result.products || []);
    }
    setLoading(false);
  }, [viewMode]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleDelete = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    const result = await deleteProduct(postId);
    if (result.success) {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } else {
      setError(result.error || "Failed to delete listing");
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/20">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {viewMode === "mine" ? "My Listings" : "All Products"}
          </h1>
          <p className="text-muted-foreground">
            {viewMode === "mine"
              ? "Manage your active listings, rentals, and service offerings"
              : "Explore all items, rentals, and services across the campus"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg bg-muted p-1 border border-border/50">
            <button
              type="button"
              onClick={() => setViewMode("mine")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                viewMode === "mine"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              My Listings
            </button>
            <button
              type="button"
              onClick={() => setViewMode("all")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                viewMode === "all"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Listings
            </button>
          </div>
          <Button asChild className="gap-2">
            <Link to="/dashboard/products/create">
              <Plus className="w-4 h-4" />
              New Listing
            </Link>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(6)].map((_, i) => (
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
      ) : posts.length === 0 ? (
        <Card className="p-12 text-center border-border/50">
          <div className="bg-primary/10 p-4 rounded-full inline-flex mb-4">
            <Package className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {viewMode === "mine" ? "No listings yet" : "No products available"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {viewMode === "mine"
              ? "Create your first listing to start selling, renting, or offering services"
              : "Check back later or list the first item yourself"}
          </p>
          <Button asChild>
            <Link to="/dashboard/products/create">Create Listing</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
            >
              <ProductCard
                product={post}
                onDelete={viewMode === "mine" ? handleDelete : undefined}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
