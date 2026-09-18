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
  Clock,
  Calendar,
  Repeat,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Loader2,
  Gavel,
  Trophy,
  KeyRound,
  CheckCircle2,
  Star,
  Pencil,
  Handshake,
} from "lucide-react";
import type { RootState, AppDispatch } from "@/store/store";
import { loadWallet } from "@/store/walletSlice";
import Axios from "@/utils/Axios";
import { fetchProductById } from "@/modules/products/product.api";
import { toast } from "@/components/ui/toast";
import type { IProduct, ProductType } from "@/modules/products/product.types";
import { BookServiceModal } from "@/modules/orders/components/BookServiceModal";
import { SubscribeModal } from "@/modules/subscriptions/components/SubscribeModal";
import { MakeOfferModal } from "@/modules/negotiations/components/MakeOfferModal";
import { fetchAuctionById } from "@/modules/auctions/auction.api";
import { AuctionCountdown } from "@/modules/auctions/components/AuctionCountdown";
import { BidFeed } from "@/modules/auctions/components/BidFeed";
import { PlaceBidModal } from "@/modules/auctions/components/PlaceBidModal";
import type { IAuction, IBid } from "@/modules/auctions/auction.types";
import { getSocket } from "@/modules/messages/socket.client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TrustScoreBadge } from "@/modules/reviews/components/TrustScoreBadge";
import { UserReviewsList } from "@/modules/reviews/components/UserReviewsList";

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
  const [isMakeOfferOpen, setIsMakeOfferOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

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
      toast.success(
        checkoutType === "RENT"
          ? "Rental order placed! Escrow held securely."
          : "Purchase successful! Escrow held securely."
      );
      navigate("/dashboard/orders");
    } catch (err: unknown) {
      const msg = isAxiosError(err)
        ? err.response?.data?.message || err.response?.data?.error || err.message || "Failed to process order"
        : err instanceof Error
        ? err.message
        : "Failed to process order";
      toast.error(msg);
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
      navigate('/dashboard/messages', { state: { userId: targetUserId, productId: product.id } });
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
          <div className="flex items-center gap-1.5">
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-orange-600 text-white shadow-xs">
              Live Auction
            </span>
            {auction?.status === "PENDING" && (
              <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                ⏳ Pending Review
              </span>
            )}
          </div>
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
      const isPending = auction?.status === "PENDING";
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
          {isPending ? (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-sm">
              <Clock className="w-4 h-4 shrink-0" />
              <span>Auction countdown will begin once reviewed and approved by an administrator.</span>
            </div>
          ) : auction && (
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
      const cycle = "month";
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
                    <span>Days: {product.deliveryDays?.join(", ")}</span>
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

          <div className="bg-card/80 backdrop-blur-md rounded-2xl border border-border/70 p-5 shadow-xs space-y-2.5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Item Details & Overview
            </h3>
            <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="bg-card/80 backdrop-blur-md rounded-2xl border border-border/70 p-5 shadow-xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <Avatar className="w-12 h-12 border-2 border-orange-500/30">
                <AvatarImage src={sellerImage} />
                <AvatarFallback className="bg-orange-500/10 text-orange-600 font-bold">
                  {sellerName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="font-bold text-sm text-foreground truncate">{sellerName}</p>
                  <TrustScoreBadge size="sm" score={4.8} />
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 truncate mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  {sellerCollege}
                </p>
              </div>
            </div>

            {!isOwner && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMessageSeller}
                className="gap-1.5 rounded-xl border-border/80 hover:bg-muted/70 text-xs font-semibold shrink-0"
              >
                <MessageSquare className="w-3.5 h-3.5 text-orange-500" />
                <span>Chat</span>
              </Button>
            )}
          </div>

          <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent rounded-2xl border border-emerald-500/20 p-4 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Campus Escrow Handshake Guarantee</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              When you purchase or win this item, your payment is held safely in escrow. Arrange a campus meetup (e.g. Central Library Lawn, Hostel Lobby) and test the item in person. Funds are only transferred once you share your 6-digit OTP.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { icon: ShieldCheck, title: "1. Escrow Locked", copy: "Payment is held before meetup." },
                { icon: MapPin, title: "2. Inspect on Campus", copy: "Meet at a known safe spot." },
                { icon: KeyRound, title: "3. Share OTP", copy: "Seller gets paid after your code." },
              ].map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="rounded-xl border border-border/60 bg-card/70 p-3">
                    <Icon className="w-4 h-4 text-orange-500 mb-1.5" />
                    <p className="text-[11px] font-bold text-foreground">{step.title}</p>
                    <p className="text-[10px] text-muted-foreground leading-snug">{step.copy}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-card/80 backdrop-blur-md rounded-2xl border border-border/70 p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Suggested Safe Meetup Zones
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {["Central Library Lawn", "Student Cafeteria", "Hostel Lobby"].map((zone) => (
                <div key={zone} className="flex items-center gap-2 rounded-xl bg-muted/45 border border-border/50 px-3 py-2 text-xs font-semibold text-foreground">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{zone}</span>
                </div>
              ))}
            </div>
          </div>

          {product.type === "AUCTION" && auction && (
            <div className="bg-card/80 backdrop-blur-md rounded-2xl border border-border/70 p-5 shadow-xs">
              <BidFeed bids={auction.bids || []} startingBid={auction.startingBid} />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] gap-3 pt-2">
            {isOwner ? (
              auction?.status === "ENDED" ? (
                <Button disabled size="lg" className="font-semibold rounded-xl h-12 w-full">
                  Auction Finalized (Completed)
                </Button>
              ) : (
                <div className="space-y-2 w-full">
                  <Button asChild size="lg" className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold h-12 rounded-xl gap-2 w-full shadow-md shadow-orange-500/20 cursor-pointer">
                    <Link to={`/dashboard/products/${product.id}/edit`}>
                      <Pencil className="w-4 h-4" />
                      {product.type === "AUCTION" ? "Edit Auction Details (Photos & Info)" : "Edit Listing Details"}
                    </Link>
                  </Button>
                  {product.type === "AUCTION" && auction?.status === "PENDING" && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-medium text-center">
                      Your auction is awaiting review. It will go live automatically upon approval.
                    </p>
                  )}
                </div>
              )
            ) : product.status === "SOLD" ? (
              <Button disabled size="lg" className="font-semibold rounded-xl h-12 w-full">
                Listing Sold Out
              </Button>
            ) : product.type === "AUCTION" ? (
              auction?.status === "PENDING" ? (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-xs font-medium w-full">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>⏳ Under Review — Bidding opens once approved by campus moderators.</span>
                </div>
              ) : auction?.status === "ENDED" ? (
                (auction.winnerId === user.id || auction.currentBidderId === user.id) ? (
                  <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 rounded-xl gap-2 w-full shadow-md">
                    <Link to="/dashboard/orders">
                      <Trophy className="w-4 h-4" />
                      You Won! View Pickup Handshake OTP
                    </Link>
                  </Button>
                ) : (
                  <Button disabled size="lg" className="font-semibold rounded-xl h-12 w-full">
                    Auction Ended
                  </Button>
                )
              ) : (
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold h-12 rounded-xl gap-2 w-full shadow-md shadow-orange-500/20 cursor-pointer"
                  onClick={() => setIsBidModalOpen(true)}
                >
                  <Gavel className="w-4 h-4" />
                  Place Live Bid
                </Button>
              )
            ) : product.type === "SERVICE" ? (
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold h-12 rounded-xl gap-2 w-full shadow-md shadow-purple-500/20 cursor-pointer"
                onClick={() => setIsServiceModalOpen(true)}
              >
                <Sparkles className="w-4 h-4" />
                Book Campus Gig Now
              </Button>
            ) : product.type === "SUBSCRIPTION" ? (
              <Button
                size="lg"
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold h-12 rounded-xl gap-2 w-full shadow-md shadow-emerald-500/20 cursor-pointer"
                onClick={() => setIsSubscribeModalOpen(true)}
              >
                <Repeat className="w-4 h-4" />
                Subscribe with Vacation Pause
              </Button>
            ) : product.type === "RENT" ? (
              <Button
                size="lg"
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold h-12 rounded-xl gap-2 w-full shadow-md shadow-amber-500/20 cursor-pointer"
                disabled={actionLoading}
                onClick={() => handleDirectCheckout("RENT")}
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Clock className="w-4 h-4" />
                )}
                {actionLoading ? "Processing Deposit..." : "Rent This Item (Escrow Protected)"}
              </Button>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold h-12 rounded-xl gap-2 flex-1 w-full shadow-md shadow-orange-500/20 cursor-pointer"
                  disabled={actionLoading}
                  onClick={() => handleDirectCheckout("SELL")}
                >
                  {actionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ShoppingBag className="w-4 h-4" />
                  )}
                  {actionLoading ? "Locking Escrow..." : "Buy Now with Escrow Protection"}
                </Button>
                <Button
                  type="button"
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-xl gap-2 border-emerald-500/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50/20 font-bold shrink-0 w-full sm:w-auto cursor-pointer"
                  onClick={() => setIsMakeOfferOpen(true)}
                >
                  <Handshake className="w-4 h-4" />
                  Make Offer
                </Button>
              </div>
            )}

            <Button variant="outline" size="lg" asChild className="w-full sm:w-auto rounded-xl h-12 shrink-0">
              <Link to="/dashboard">Back</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-border/70 space-y-4">
        <div>
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            Campus Trust & Peer Reviews
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Verified feedback from campus trades and transactions
          </p>
        </div>
        <UserReviewsList productId={product.id} userId={product.owner?.id || product.seller?.id} />
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
          <MakeOfferModal
            isOpen={isMakeOfferOpen}
            onClose={() => setIsMakeOfferOpen(false)}
            product={product}
            onOfferCreated={() => {
              setIsMakeOfferOpen(false);
              handleMessageSeller();
            }}
          />
        </>
      )}
    </div>
  );
};

export default ProductDetail;
