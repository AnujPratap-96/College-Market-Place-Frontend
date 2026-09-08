import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  IndianRupee,
  MapPin,
  MessageCircle,
  User,
  Star,
} from "lucide-react";
import type { RootState } from "@/store/store";
import { fetchPost, type IPost } from "@/services/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const user = useSelector((state: RootState) => state.user);
  const [post, setPost] = useState<IPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (id) loadPost(id);
  }, [id]);

  const loadPost = async (postId: string) => {
    setLoading(true);
    setError(null);
    const result = await fetchPost(postId);
    if (result.success) {
      setPost(result.success);
    } else {
      setError(result.error || "Failed to load product");
    }
    setLoading(false);
  };

  const isOwner = post?.seller.id === user.id;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div className="h-8 bg-muted rounded animate-pulse w-48" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-2xl animate-pulse" />
            <div className="flex gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-20 h-20 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-10 bg-muted rounded animate-pulse" />
            <div className="h-6 bg-muted rounded animate-pulse w-32" />
            <div className="h-32 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="text-center py-16">
        <h3 className="text-xl font-semibold text-foreground mb-2">
          {error || "Product not found"}
        </h3>
        <Button asChild>
          <Link to="/dashboard">Go Back</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/dashboard">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <span className="text-muted-foreground text-sm">
          Back to Browse
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="aspect-square rounded-2xl overflow-hidden bg-muted"
          >
            <img
              src={post.images[activeImage] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800"}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </motion.div>
          {post.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {post.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                    activeImage === i
                      ? "border-primary"
                      : "border-transparent hover:border-border"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${post.title} ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {!post.isAvailable && (
                <span className="px-3 py-1 text-xs font-semibold bg-red-500 text-white rounded-full">
                  Sold
                </span>
              )}
              <span className="px-3 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-full capitalize">
                {post.category}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              {post.title}
            </h1>
            <div className="flex items-center gap-2 mt-4">
              <IndianRupee className="w-6 h-6 text-primary" />
              <span className="text-3xl font-bold text-primary">
                {post.price}
              </span>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {post.description}
              </p>
            </CardContent>
          </Card>

          {/* Seller Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5" />
                Seller
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={post.seller.image} />
                  <AvatarFallback>
                    {post.seller.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{post.seller.name}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {post.seller.college}
                  </p>
                </div>
              </div>
              {post.feedback && (
                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-medium">
                    {post.feedback.rating}/5
                  </span>
                  {post.feedback.text && (
                    <span className="text-muted-foreground text-sm">
                      - {post.feedback.text}
                    </span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            {!isOwner && post.isAvailable && (
              <Button size="lg" className="gap-2">
                <MessageCircle className="w-4 h-4" />
                Message Seller
              </Button>
            )}
            <Button variant="outline" size="lg" asChild>
              <Link to="/dashboard">Back</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;