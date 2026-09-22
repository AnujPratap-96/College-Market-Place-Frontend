import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Clock, Calendar, Trash2, ShieldCheck, Tag, Sparkles, Gavel, Repeat, Pencil } from "lucide-react";
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
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-full bg-amber-500/90 text-white shadow-xs backdrop-blur-md border border-amber-400/40">
            <Clock className="w-3 h-3" />
            For Rent
          </span>
        );
      case "SERVICE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-full bg-purple-600/90 text-white shadow-xs backdrop-blur-md border border-purple-400/40">
            <Sparkles className="w-3 h-3" />
            Campus Gig
          </span>
        );
      case "SUBSCRIPTION":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-full bg-emerald-600/90 text-white shadow-xs backdrop-blur-md border border-emerald-400/40">
            <Repeat className="w-3 h-3" />
            Subscription
          </span>
        );
      case "AUCTION": {
        const isAuctionEnded =
          item.status === "SOLD" ||
          item.status === "ENDED" ||
          item.auction?.status === "ENDED" ||
          (item.auction?.endTime && new Date(item.auction.endTime).getTime() <= Date.now());
        if (isAuctionEnded) {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-full bg-muted/95 text-muted-foreground shadow-xs backdrop-blur-md border border-border/70">
              <Gavel className="w-3 h-3" />
              Ended
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-full bg-orange-500/95 text-white shadow-xs backdrop-blur-md border border-orange-400/40 animate-pulse">
            <Gavel className="w-3 h-3" />
            Live Auction
          </span>
        );
      }
      case "SELL":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-full bg-blue-600/90 text-white shadow-xs backdrop-blur-md border border-blue-400/40">
            <Tag className="w-3 h-3" />
            For Sale
          </span>
        );
    }
  };

  const getFormattedPrice = () => {
    const price = item.price ?? 0;
    if (item.type === "AUCTION") {
      return `₹${price.toLocaleString()} (Start)`;
    }
    if (item.type === "RENT") {
      return `₹${price.toLocaleString()}/day`;
    }
    if (item.type === "SERVICE") {
      return `₹${price.toLocaleString()} (Fixed)`;
    }
    if (item.type === "SUBSCRIPTION") {
      const period = "mo";
      return `₹${price.toLocaleString()}/${period}`;
    }
    return `₹${price.toLocaleString()}`;
  };

  return (
    <Link to={`/dashboard/products/${item.id}`} className="block h-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -6, transition: { duration: 0.2 } }}
        className="group relative h-full flex flex-col bg-card/85 backdrop-blur-md rounded-2xl overflow-hidden border border-border/70 shadow-xs hover:border-orange-500/40 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300"
      >
        {/* Floating Top Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-1.5">
          {renderTypeBadge()}
          {item.status === "SOLD" && (
            <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-red-600 text-white shadow-xs">
              Sold
            </span>
          )}
          {item.status === "PENDING" && (
            <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-amber-500 text-white shadow-xs">
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
              <>
                <Link
                  to={`/dashboard/products/${item.id}/edit`}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="p-1.5 rounded-full bg-background/90 hover:bg-orange-500 hover:text-white backdrop-blur-md transition-colors shadow-xs text-muted-foreground cursor-pointer"
                  title="Edit listing"
                >
                  <Pencil className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete(item.id);
                  }}
                  className="p-1.5 rounded-full bg-background/90 hover:bg-destructive hover:text-white backdrop-blur-md transition-colors shadow-xs text-muted-foreground cursor-pointer"
                  title="Delete listing"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            ) : null}
          </div>
        )}

        {/* Product Image Showcase */}
        <div className="relative h-48 overflow-hidden bg-muted">
          <img
            src={displayImage}
            alt={item.title}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Card Body */}
        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-base text-foreground line-clamp-1 group-hover:text-orange-500 transition-colors">
                {item.title}
              </h3>
              <div className="font-extrabold text-orange-600 dark:text-orange-400 shrink-0 text-sm whitespace-nowrap">
                {getFormattedPrice()}
              </div>
            </div>

            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {item.description}
            </p>

            {(item.deliverySlots || item.serviceDuration || item.securityDeposit !== undefined) && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {item.serviceDuration && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                    <Clock className="w-3 h-3 shrink-0" />
                    <span className="truncate max-w-[140px]">{item.serviceDuration}</span>
                  </span>
                )}
                {item.deliverySlots && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                    <Calendar className="w-3 h-3 shrink-0" />
                    <span className="truncate max-w-[140px]">
                      {isNaN(Number(item.deliverySlots)) ? item.deliverySlots : `${item.deliverySlots} ${Number(item.deliverySlots) === 1 ? 'Slot/Day' : 'Slots/Day'}`}
                    </span>
                  </span>
                )}
                {item.type === "RENT" && typeof item.securityDeposit === "number" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                    Deposit: ₹{item.securityDeposit}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/60">
            <div className="flex items-center gap-1 min-w-0">
              <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
              <span className="truncate font-medium">{college || "Campus Circle"}</span>
            </div>
            <div className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Escrow</span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default ProductCard;
