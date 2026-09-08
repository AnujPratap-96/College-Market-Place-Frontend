import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { IndianRupee, MapPin, Clock } from "lucide-react";
import { formatDistanceToNow } from "@/lib/utils";

interface ProductCardProps {
  post: {
    id: string;
    title: string;
    description: string;
    price: string;
    images: string[];
    isAvailable: boolean;
    isApproved?: boolean;
    category: string;
    createdAt: string;
    seller: {
      name: string;
      college: string;
    };
  };
}

const ProductCard = ({ post }: ProductCardProps) => {
  return (
    <Link to={`/dashboard/products/${post.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -8, transition: { duration: 0.2 } }}
        className="group relative bg-card rounded-2xl overflow-hidden border border-border/50 shadow-sm hover:shadow-xl transition-all duration-300"
      >
        {/* Badge */}
        <div className="absolute top-3 left-3 z-10">
          {!post.isAvailable && (
            <span className="px-3 py-1.5 text-xs font-semibold bg-red-500 text-white rounded-full">
              Sold
            </span>
          )}
          {post.isAvailable && !post.isApproved && (
            <span className="px-3 py-1.5 text-xs font-semibold bg-yellow-500 text-white rounded-full">
              Pending
            </span>
          )}
        </div>

        {/* Image */}
        <div className="relative h-48 overflow-hidden bg-muted">
          <img
            src={post.images[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500"}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-lg text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {post.title}
            </h3>
            <div className="flex items-center font-bold text-primary shrink-0">
              <IndianRupee className="w-4 h-4" />
              <span>{post.price}</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">
            {post.description}
          </p>

          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border/50">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span className="line-clamp-1">{post.seller.college}</span>
            </div>
            <div className="flex items-center gap-1 ml-auto">
              <Clock className="w-3 h-3" />
              <span>{formatDistanceToNow(new Date(post.createdAt))}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default ProductCard;