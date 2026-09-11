import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Clock, Calendar, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "@/lib/utils";
import type { IProduct } from "../product.types";

interface ProductCardProps {
  product?: IProduct;
  post?: any;
  onDelete?: (id: string) => void;
  action?: React.ReactNode;
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500";

const ProductCard = ({ product, post, onDelete, action }: ProductCardProps) => {
  const item: IProduct = product || post;
  if (!item) return null;

  const displayImage = item.imageUrl || (item.images && item.images[0]) || FALLBACK_IMAGE;
  const college = item.owner?.college || item.seller?.college;

  const renderTypeBadge = () => {
    switch (item.type) {
      case "RENT":
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-600 text-white shadow-sm">
            For Rent
          </span>
        );
      case "SERVICE":
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-600 text-white shadow-sm">
            Service
          </span>
        );
      case "SUBSCRIPTION":
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-600 text-white shadow-sm">
            Subscription
          </span>
        );
      case "AUCTION":
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-orange-600 text-white shadow-sm">
            Live Auction
          </span>
        );
      case "SELL":
      default:
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-600 text-white shadow-sm">
            For Sale
          </span>
        );
    }
  };

  const getFormattedPrice = () => {
    const price = item.price ?? 0;
    if (item.type === "AUCTION") {
      return `₹${price} (Starting Bid)`;
    }
    if (item.type === "RENT") {
      return `₹${price}/day`;
    }
    if (item.type === "SERVICE") {
      return `₹${price} (One-Time)`;
    }
    if (item.type === "SUBSCRIPTION") {
      const period = item.frequency === "WEEKLY" ? "wk" : "mo";
      return `₹${price}/${period}`;
    }
    return `₹${price}`;
  };

  return (
    <Link to={`/dashboard/products/${item.id}`} className="block h-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -6, transition: { duration: 0.2 } }}
        className="group relative h-full flex flex-col bg-card rounded-2xl overflow-hidden border border-border/60 shadow-xs hover:shadow-xl transition-all duration-300"
      >
        <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-1.5">
          {renderTypeBadge()}
          {item.status === "SOLD" && (
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-600 text-white shadow-sm">
              Sold
            </span>
          )}
          {item.status === "PENDING" && (
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-yellow-500 text-white shadow-sm">
              Pending
            </span>
          )}
        </div>

        {(onDelete || action) && (
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1">
            {action ? (
              <div
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                {action}
              </div>
            ) : null}
            {onDelete ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(item.id);
                }}
                className="p-1.5 rounded-full bg-background/90 hover:bg-destructive hover:text-white backdrop-blur-xs transition-colors shadow-xs text-muted-foreground"
                title="Delete listing"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            ) : null}
          </div>
        )}

        <div className="relative h-48 overflow-hidden bg-muted">
          <img
            src={displayImage}
            alt={item.title}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-base text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                {item.title}
              </h3>
              <div className="font-bold text-primary shrink-0 text-sm whitespace-nowrap">
                {getFormattedPrice()}
              </div>
            </div>

            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {item.description}
            </p>

            {(item.deliverySlots || item.serviceDuration || item.securityDeposit !== undefined) && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {item.serviceDuration && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    <Clock className="w-3 h-3 shrink-0" />
                    <span className="truncate max-w-[140px]">{item.serviceDuration}</span>
                  </span>
                )}
                {item.deliverySlots && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <Calendar className="w-3 h-3 shrink-0" />
                    <span className="truncate max-w-[140px]">{item.deliverySlots}</span>
                  </span>
                )}
                {item.type === "RENT" && typeof item.securityDeposit === "number" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    Deposit: ₹{item.securityDeposit}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-3 border-t border-border/50">
            {college && (
              <div className="flex items-center gap-1 min-w-0">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate">{college}</span>
              </div>
            )}
            {item.createdAt && (
              <div className="flex items-center gap-1 ml-auto shrink-0">
                <Clock className="w-3 h-3" />
                <span>{formatDistanceToNow(new Date(item.createdAt))}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default ProductCard;
