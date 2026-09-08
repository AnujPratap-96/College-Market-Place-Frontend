import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Package, MoreVertical } from "lucide-react";
import { deletePost } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Axios from "@/utils/Axios";

interface MyProduct {
  id: string;
  title: string;
  price: number;
  imageUrl?: string;
  status: string;
  category: string;
  createdAt: string;
}

const Products = () => {
  const [myPosts, setMyPosts] = useState<MyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMyPosts();
  }, []);

  const loadMyPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await Axios.get("/products/my-products");
      setMyPosts(response.data.products || []);
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.response?.data?.message || "Failed to load listings");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    const result = await deletePost(postId);
    if (result.success) {
      setMyPosts(myPosts.filter((p) => p.id !== postId));
    } else {
      setError(result.error || "Failed to delete");
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <div className="h-40 bg-muted animate-pulse" />
            <CardContent className="p-4 space-y-2">
              <div className="h-5 bg-muted rounded animate-pulse" />
              <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Listings</h1>
          <p className="text-muted-foreground">Manage your products on the marketplace</p>
        </div>
        <Button asChild className="gap-2">
          <Link to="/dashboard/products/create">
            <Plus className="w-4 h-4" />
            New Listing
          </Link>
        </Button>
      </div>

      {myPosts.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="bg-primary/10 p-4 rounded-full inline-flex mb-4">
            <Package className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No listings yet</h3>
          <p className="text-muted-foreground mb-4">Create your first listing to start selling</p>
          <Button asChild>
            <Link to="/dashboard/products/create">Create Listing</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="flex">
                  <div className="w-24 h-24 bg-muted flex-shrink-0">
                    <img
                      src={post.imageUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200"}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="flex-1 p-4">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold truncate">{post.title}</h3>
                        <p className="text-primary font-bold">₹{post.price}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {post.status === "SOLD" && (
                            <span className="text-xs text-red-500 font-medium">Sold</span>
                          )}
                          {post.status === "RESERVED" && (
                            <span className="text-xs text-yellow-500 font-medium">Reserved</span>
                          )}
                          {post.status === "AVAILABLE" && (
                            <span className="text-xs text-green-500 font-medium">Active</span>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/dashboard/products/${post.id}`}>View</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(post.id)}
                            className="text-destructive"
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
