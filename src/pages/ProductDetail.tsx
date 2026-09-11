import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { isAxiosError } from "axios";
import {
  ArrowLeft,
  IndianRupee,
  MapPin,
  MessageSquare,
  User,
  Clock,
  Calendar,
  Repeat,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Loader2,
  AlertCircle,
  Gavel,
  Trophy,
} from "lucide-react";
import type { RootState, AppDispatch } from "@/store/store";
import { loadWallet } from "@/store/walletSlice";
import Axios from "@/utils/Axios";
import { fetchProductById } from "@/modules/products/product.api";
import type { IProduct, ProductType } from "@/modules/products/product.types";
import { BookServiceModal } from "@/modules/orders/components/BookServiceModal";
import { SubscribeModal } from "@/modules/subscriptions/components/SubscribeModal";
import { fetchAuctionById } from "@/modules/auctions/auction.api";
import { AuctionCountdown } from "@/modules/auctions/components/AuctionCountdown";
import { BidFeed } from "@/modules/auctions/components/BidFeed";
import { PlaceBidModal } from "@/modules/auctions/components/PlaceBidModal";
import type { IAuction, IBid } from "@/modules/auctions/auction.types";
import { getSocket } from "@/modules/messages/socket.client";
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
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.user);

  const [product, setProduct] = useState<IProduct | null>(null);
  const [auction, setAuction] = useState<IAuction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadProduct(id);
    }
  }, [id]);

  const loadAuction = async (productIdOrAuctionId: string) => {
    const res = await fetchAuctionById(productIdOrAuctionId);
    if (res.auction) {
      setAuction(res.auction);
    }
  };

  const loadProduct = async (productId: string) => {
    setLoading(true);
    setError(null);
    const result = await fetchProductById(productId);
    if (result.product) {
      setProduct(result.product);
      if (result.product.type === "AUCTION" || (result.product as any).auction) {
        loadAuction(result.product.id);
      }
    } else {
      setError(result.error || "Failed to load product");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!auction?.id) return;
    const socket = getSocket();
    if (!socket) return;

    socket.emit("join_auction", { auctionId: auction.id });

    const handleNewBid = (data: {
      auctionId: string;
      bid: IBid;
      currentBid: number;
      currentBidder: any;
      endTime?: string;
      status?: string;
    }) => {
      if (data.auctionId === auction.id) {
        setAuction((prev) =>
          prev
            ? {
                ...prev,
                currentBid: data.currentBid,
                currentBidder: data.currentBidder,
                endTime: data.endTime || prev.endTime,
                status: (data.status as any) || prev.status,
                bids: [data.bid, ...(prev.bids || [])],
              }
            : null
        );
      }
    };

    const handleAuctionEnded = (data: {
      auctionId: string;
      status: string;
      winner?: any;
      winningBid?: number;
    }) => {
      if (data.auctionId === auction.id) {
        setAuction((prev) =>
          prev
            ? {
                ...prev,
                status: data.status as any,
                winner: data.winner,
                winningBid: data.winningBid,
              }
            : null
        );
      }
    };

    socket.on("new_bid", handleNewBid);
    socket.on("auction_ended", handleAuctionEnded);

    return () => {
      socket.emit("leave_auction", { auctionId: auction.id });
      socket.off("new_bid", handleNewBid);
      socket.off("auction_ended", handleAuctionEnded);
    };
  }, [auction?.id]);

  const handleDirectCheckout = async (checkoutType: "RENT" | "SELL") => {
    if (!product) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const payload: Record<string, any> = {
        productId: product.id,
        paymentMethod: "WALLET",
      };
      if (checkoutType === "RENT") {
        payload.rentalDays = 1;
        payload.securityDeposit = product.securityDeposit ?? 0;
      }
      await Axios.post("/orders/checkout", payload);
      dispatch(loadWallet());
      navigate("/dashboard/orders");
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        setActionError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            err.message ||
            "Failed to process order"
        );
      } else if (err instanceof Error) {
        setActionError(err.message);
      } else {
        setActionError("Failed to process order");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const isOwner = Boolean(
    user.id &&
      (product?.owner?.id === user.id || product?.seller?.id === user.id)
  );

  const handleMessageSeller = () => {
    if (!product) return;
    const targetUserId = product.seller?.id || product.owner?.id;
    if (targetUserId) {
      navigate('/dashboard/messages?userId=' + targetUserId + '&productId=' + product.id);
    }
  };

  const renderTypeBadge = (type: ProductType) => {
    switch (type) {
      case "RENT":
        return (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-600 text-white shadow-xs">
            For Rent
          </span>
        );
      case "SERVICE":
        return (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-600 text-white shadow-xs">
            Campus Service
          </span>
        );
      case "SUBSCRIPTION":
        return (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-600 text-white shadow-xs">
            Subscription Plan
          </span>
        );
      case "AUCTION":
        return (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-orange-600 text-white shadow-xs">
            Live Auction
          </span>
        );
      case "SELL":
      default:
        return (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-600 text-white shadow-xs">
            For Sale
          </span>
        );
    }
  };

  const renderPrice = () => {
    if (!product) return null;
    if (product.type === "AUCTION") {
      const activeBid = auction?.currentBid ?? product.price;
      return (
        <div className="space-y-4 mt-4">
          <div className="flex items-baseline gap-2">
            <IndianRupee className="w-7 h-7 text-orange-600 dark:text-orange-400 self-center" />
            <span className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {activeBid.toFixed(2)}
            </span>
            <span className="text-muted-foreground text-sm font-medium">
              {auction?.bids && auction.bids.length > 0 ? "Current Leading Bid" : "Starting Bid"}
            </span>
          </div>
          {auction && (
            <div className="space-y-3">
              <AuctionCountdown
                endTime={auction.endTime}
                isExtended={auction.status === "EXTENDED"}
                onExpire={() => {
                  if (id) loadAuction(id);
                }}
              />
              {auction.currentBidder && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span>
                    Highest Bidder: <strong className="text-foreground">{auction.currentBidder.name}</strong>
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }
    if (product.type === "RENT") {
      return (
        <div className="flex items-baseline gap-1 mt-4">
          <IndianRupee className="w-6 h-6 text-primary self-center" />
          <span className="text-3xl font-bold text-primary">{product.price}</span>
          <span className="text-muted-foreground text-sm font-medium">/ day</span>
        </div>
      );
    }
    if (product.type === "SERVICE") {
      return (
        <div className="flex items-baseline gap-1 mt-4">
          <IndianRupee className="w-6 h-6 text-primary self-center" />
          <span className="text-3xl font-bold text-primary">{product.price}</span>
          <span className="text-muted-foreground text-sm font-medium">
            {" "}
            (one-time service)
          </span>
        </div>
      );
    }
    if (product.type === "SUBSCRIPTION") {
      const cycle = product.frequency === "WEEKLY" ? "week" : "month";
      return (
        <div className="flex items-baseline gap-1 mt-4">
          <IndianRupee className="w-6 h-6 text-primary self-center" />
          <span className="text-3xl font-bold text-primary">{product.price}</span>
          <span className="text-muted-foreground text-sm font-medium">
            {" "}
            / {cycle}
          </span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 mt-4">
        <IndianRupee className="w-6 h-6 text-primary" />
        <span className="text-3xl font-bold text-primary">{product.price}</span>
      </div>
    );
  };

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
                <div
                  key={i}
                  className="w-20 h-20 bg-muted rounded-lg animate-pulse"
                />
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

  if (error || !product) {
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

  const images =
    product.images && product.images.length > 0
      ? product.images
      : product.imageUrl
      ? [product.imageUrl]
      : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800"];

  const sellerName =
    product.owner?.name || product.seller?.name || "Campus Seller";
  const sellerCollege =
    product.owner?.college || product.seller?.college || "Campus";
  const sellerImage =
    product.owner?.profileImage || product.seller?.image;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/dashboard">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <span className="text-muted-foreground text-sm">Back to Browse</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="aspect-square rounded-2xl overflow-hidden bg-muted"
          >
            <img
              src={images[activeImage] || images[0]}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </motion.div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={`w-20 h-20 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                    activeImage === i
                      ? "border-primary"
                      : "border-transparent hover:border-border"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.title} ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {renderTypeBadge(product.type)}
              {product.status === "SOLD" && (
                <span className="px-3 py-1 text-xs font-semibold bg-red-500 text-white rounded-full">
                  Sold
                </span>
              )}
              <span className="px-3 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-full capitalize">
                {product.category}
              </span>
            </div>

            <h1 className="text-3xl font-bold text-foreground">
              {product.title}
            </h1>

            {renderPrice()}

            <div className="flex flex-wrap items-center gap-2 mt-3">
              {product.type === "SERVICE" && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span>Duration: {product.serviceDuration || "Flexible"}</span>
                </div>
              )}

              {product.type === "SUBSCRIPTION" && (
                <>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <Repeat className="w-3.5 h-3.5 shrink-0" />
                    <span>Frequency: {product.frequency || "MONTHLY"}</span>
                  </div>
                  {product.deliverySlots && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span>Slots: {product.deliverySlots}</span>
                    </div>
                  )}
                </>
              )}

              {product.type === "RENT" && (
                <>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    <span>Security Deposit: ₹{product.securityDeposit || 0}</span>
                  </div>
                  {product.rentalDuration && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>Duration: {product.rentalDuration}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {product.description}
              </p>
            </CardContent>
          </Card>

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
                  <AvatarImage src={sellerImage} />
                  <AvatarFallback>{sellerName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{sellerName}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {sellerCollege}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {product.type === "AUCTION" && auction && (
            <Card>
              <CardContent className="pt-6">
                <BidFeed bids={auction.bids || []} startingBid={auction.startingBid} />
              </CardContent>
            </Card>
          )}

          {actionError && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-xs border border-destructive/20">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{actionError}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {isOwner ? (
              <Button disabled size="lg" className="font-medium">
                {product.type === "AUCTION" ? "This is your auction listing" : "This is your listing"}
              </Button>
            ) : product.status === "SOLD" ? (
              <Button disabled size="lg" className="font-medium">
                Listing Sold Out
              </Button>
            ) : product.type === "AUCTION" ? (
              auction?.status === "ENDED" ? (
                (auction.winnerId === user.id || auction.currentBidderId === user.id) ? (
                  <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium gap-2">
                    <Link to="/dashboard/orders">
                      <Trophy className="w-4 h-4" />
                      You Won! View Pickup OTP
                    </Link>
                  </Button>
                ) : (
                  <Button disabled size="lg" className="font-medium">
                    Auction Ended
                  </Button>
                )
              ) : (
                <Button
                  size="lg"
                  className="bg-orange-600 hover:bg-orange-700 text-white font-medium gap-2"
                  onClick={() => setIsBidModalOpen(true)}
                >
                  <Gavel className="w-4 h-4" />
                  Place Bid
                </Button>
              )
            ) : product.type === "SERVICE" ? (
              <Button
                size="lg"
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium gap-2"
                onClick={() => setIsServiceModalOpen(true)}
              >
                <Sparkles className="w-4 h-4" />
                Book Service Now
              </Button>
            ) : product.type === "SUBSCRIPTION" ? (
              <Button
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium gap-2"
                onClick={() => setIsSubscribeModalOpen(true)}
              >
                <Repeat className="w-4 h-4" />
                Subscribe to Plan
              </Button>
            ) : product.type === "RENT" ? (
              <Button
                size="lg"
                className="bg-amber-600 hover:bg-amber-700 text-white font-medium gap-2"
                disabled={actionLoading}
                onClick={() => handleDirectCheckout("RENT")}
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Clock className="w-4 h-4" />
                )}
                {actionLoading ? "Processing..." : "Rent This Item"}
              </Button>
            ) : (
              <Button
                size="lg"
                className="gap-2 font-medium"
                disabled={actionLoading}
                onClick={() => handleDirectCheckout("SELL")}
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ShoppingBag className="w-4 h-4" />
                )}
                {actionLoading ? "Processing..." : "Buy Now"}
              </Button>
            )}

            {!isOwner && (
              <Button
                variant="outline"
                size="lg"
                className="gap-2"
                onClick={handleMessageSeller}
              >
                <MessageSquare className="w-4 h-4" />
                {product.type === "SERVICE" || product.type === "SUBSCRIPTION"
                  ? "Message Provider"
                  : product.type === "AUCTION"
                  ? "Message Auctioneer"
                  : "Message Seller"}
              </Button>
            )}

            <Button variant="outline" size="lg" asChild>
              <Link to="/dashboard">Back</Link>
            </Button>
          </div>
        </div>
      </div>

      {product && (
        <>
          <BookServiceModal
            isOpen={isServiceModalOpen}
            onClose={() => setIsServiceModalOpen(false)}
            product={product}
          />
          <SubscribeModal
            isOpen={isSubscribeModalOpen}
            onClose={() => setIsSubscribeModalOpen(false)}
            product={product}
          />
          {auction && (
            <PlaceBidModal
              isOpen={isBidModalOpen}
              onClose={() => setIsBidModalOpen(false)}
              auction={auction}
              onBidSuccess={() => {
                loadAuction(product.id);
                dispatch(loadWallet());
              }}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ProductDetail;