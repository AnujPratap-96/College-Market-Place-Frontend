import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Package,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Calendar,
  User,
  CheckCircle2,
  XCircle,
  KeyRound,
  Loader2,
  Tag,
  AlertCircle,
  MessageSquare,
} from "lucide-react";
import type { AppDispatch, RootState } from "@/store/store";
import { loadWallet } from "@/store/walletSlice";
import type { IOrder, OrderStatus, OrderType } from "../order.types";
import {
  completeService,
  confirmService,
  cancelOrder,
} from "../order.api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import OtpHandshakeModal from "./OtpHandshakeModal";
import DisputeModal from "./DisputeModal";

interface OrderCardProps {
  order: IOrder;
  role: "buyer" | "seller";
  onRefresh: () => void;
}

const getOrderTypeBadge = (type: OrderType) => {
  switch (type) {
    case "PURCHASE":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          <Tag className="w-3 h-3" />
          Purchase
        </span>
      );
    case "RENTAL":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          <Clock className="w-3 h-3" />
          Rental
        </span>
      );
    case "SERVICE":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
          <Package className="w-3 h-3" />
          Service
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground border">
          {type}
        </span>
      );
  }
};

const getStatusBadge = (status: OrderStatus) => {
  switch (status) {
    case "PENDING_PAYMENT":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          <Clock className="w-3 h-3" />
          Pending Payment
        </span>
      );
    case "ESCROW_HELD":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          <ShieldCheck className="w-3 h-3" />
          Escrow Held
        </span>
      );
    case "RENTAL_ACTIVE":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <Clock className="w-3 h-3" />
          Rental Active
        </span>
      );
    case "DELIVERED":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
          <CheckCircle2 className="w-3 h-3" />
          Delivered / Pending Release
        </span>
      );
    case "COMPLETED":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300 border border-green-200 dark:border-green-800">
          <CheckCircle2 className="w-3 h-3" />
          Completed
        </span>
      );
    case "CANCELLED":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
          <XCircle className="w-3 h-3" />
          Cancelled
        </span>
      );
    case "DISPUTED":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
          <AlertTriangle className="w-3 h-3" />
          Disputed
        </span>
      );
    case "REFUNDED":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
          <XCircle className="w-3 h-3" />
          Refunded
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border">
          {status}
        </span>
      );
  }
};

export const OrderCard = ({ order, role, onRefresh }: OrderCardProps) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const currentUserId = useSelector((state: RootState) => state.user?.id);

  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpMode, setOtpMode] = useState<"SHOW_BUYER_OTP" | "VERIFY_SELLER_OTP">("SHOW_BUYER_OTP");
  const [otpType, setOtpType] = useState<"PICKUP" | "RETURN">("PICKUP");

  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const formattedDate = new Date(order.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const counterparty = role === "buyer" ? order.seller : order.buyer;
  const counterpartyLabel = role === "buyer" ? "Seller" : "Buyer";

  const handleServiceComplete = async () => {
    setActionLoading(true);
    setActionError(null);
    const result = await completeService(order.id);
    setActionLoading(false);
    if (result.success) {
      onRefresh();
    } else {
      setActionError(result.error || "Failed to mark service complete");
    }
  };

  const handleServiceConfirm = async () => {
    setActionLoading(true);
    setActionError(null);
    const result = await confirmService(order.id);
    setActionLoading(false);
    if (result.success) {
      dispatch(loadWallet());
      onRefresh();
    } else {
      setActionError(result.error || "Failed to confirm service");
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order? Any held escrow will be refunded.")) {
      return;
    }
    setActionLoading(true);
    setActionError(null);
    const result = await cancelOrder(order.id);
    setActionLoading(false);
    if (result.success) {
      dispatch(loadWallet());
      onRefresh();
    } else {
      setActionError(result.error || "Failed to cancel order");
    }
  };

  const canCancel =
    order.status === "ESCROW_HELD" || order.status === "PENDING_PAYMENT";

  const canDispute =
    order.status !== "COMPLETED" &&
    order.status !== "CANCELLED" &&
    order.status !== "REFUNDED" &&
    order.status !== "DISPUTED";

  const handleMessage = () => {
    const targetUserId =
      order.buyerId === currentUserId ? order.sellerId : order.buyerId;
    if (targetUserId) {
      navigate(
        '/dashboard/messages?userId=' +
          targetUserId +
          '&productId=' +
          order.productId
      );
    }
  };

  return (
    <>
      <Card className="overflow-hidden border border-border/70 hover:shadow-md transition-shadow">
        <div className="p-4 sm:p-5 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-muted-foreground">
                #{order.orderNumber}
              </span>
              {getOrderTypeBadge(order.orderType)}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formattedDate}</span>
              </div>
              {getStatusBadge(order.status)}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-muted flex-shrink-0 border border-border/50">
              <img
                src={
                  order.product?.imageUrl ||
                  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200"
                }
                alt={order.product?.title || "Item"}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0 space-y-2">
              <h3 className="font-semibold text-base text-foreground truncate">
                {order.product?.title || "Listing Item"}
              </h3>

              {counterparty && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <User className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {counterpartyLabel}:{" "}
                    <strong className="text-foreground font-medium">
                      {counterparty.name}
                    </strong>
                    {counterparty.college ? ` • ${counterparty.college}` : ""}
                  </span>
                </div>
              )}

              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-xs pt-1">
                <div>
                  <span className="text-muted-foreground">Total: </span>
                  <span className="text-base font-bold text-foreground">
                    ₹{order.totalAmount}
                  </span>
                </div>

                {order.orderType === "RENTAL" && order.securityDeposit > 0 && (
                  <div>
                    <span className="text-muted-foreground">Deposit: </span>
                    <span className="font-semibold text-amber-600 dark:text-amber-400">
                      ₹{order.securityDeposit}
                    </span>
                  </div>
                )}

                {order.orderType === "RENTAL" && order.rentalDays && (
                  <div>
                    <span className="text-muted-foreground">Duration: </span>
                    <span className="font-medium text-foreground">
                      {order.rentalDays} {order.rentalDays === 1 ? "day" : "days"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {order.status === "DISPUTED" && (
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-800 dark:text-rose-300">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <div>
                <span className="font-semibold block">Under Dispute Review</span>
                <span>
                  {order.disputeReason || "Escalated for administrative mediation."}
                </span>
              </div>
            </div>
          )}

          {actionError && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-destructive/10 text-destructive text-xs border border-destructive/20">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{actionError}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleMessage}
                className="text-xs h-8 gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Message
              </Button>

              {canCancel && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCancelOrder}
                  disabled={actionLoading}
                  className="text-xs h-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Cancel Order"}
                </Button>
              )}

              {canDispute && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setDisputeModalOpen(true)}
                  disabled={actionLoading}
                  className="text-xs h-8 text-muted-foreground hover:text-rose-600"
                >
                  Dispute
                </Button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 ml-auto">
              {order.orderType === "SERVICE" && (
                <>
                  {role === "seller" && order.status === "ESCROW_HELD" && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleServiceComplete}
                      disabled={actionLoading}
                      className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-8"
                    >
                      {actionLoading && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                      Mark Service Delivered
                    </Button>
                  )}

                  {role === "buyer" && order.status === "DELIVERED" && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleServiceConfirm}
                      disabled={actionLoading}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 font-medium"
                    >
                      {actionLoading && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                      Confirm Service & Release Funds
                    </Button>
                  )}
                </>
              )}

              {order.orderType === "RENTAL" && (
                <>
                  {order.status === "ESCROW_HELD" && (
                    <>
                      {role === "buyer" ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setOtpMode("SHOW_BUYER_OTP");
                            setOtpType("PICKUP");
                            setOtpModalOpen(true);
                          }}
                          className="text-xs h-8 gap-1.5"
                        >
                          <KeyRound className="w-3.5 h-3.5 text-primary" />
                          View Pickup OTP
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            setOtpMode("VERIFY_SELLER_OTP");
                            setOtpType("PICKUP");
                            setOtpModalOpen(true);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 gap-1.5 font-medium"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          Verify Pickup OTP
                        </Button>
                      )}
                    </>
                  )}

                  {order.status === "RENTAL_ACTIVE" && (
                    <>
                      {role === "buyer" ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setOtpMode("SHOW_BUYER_OTP");
                            setOtpType("RETURN");
                            setOtpModalOpen(true);
                          }}
                          className="text-xs h-8 gap-1.5"
                        >
                          <KeyRound className="w-3.5 h-3.5 text-primary" />
                          View Return OTP
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            setOtpMode("VERIFY_SELLER_OTP");
                            setOtpType("RETURN");
                            setOtpModalOpen(true);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 gap-1.5 font-medium"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          Verify Return & Refund Deposit
                        </Button>
                      )}
                    </>
                  )}
                </>
              )}

              {order.orderType === "PURCHASE" && (
                <>
                  {order.status === "ESCROW_HELD" && (
                    <>
                      {role === "buyer" ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setOtpMode("SHOW_BUYER_OTP");
                            setOtpType("PICKUP");
                            setOtpModalOpen(true);
                          }}
                          className="text-xs h-8 gap-1.5"
                        >
                          <KeyRound className="w-3.5 h-3.5 text-primary" />
                          View Delivery OTP
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            setOtpMode("VERIFY_SELLER_OTP");
                            setOtpType("PICKUP");
                            setOtpModalOpen(true);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 gap-1.5 font-medium"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          Verify Handover
                        </Button>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </Card>

      {otpModalOpen && (
        <OtpHandshakeModal
          isOpen={otpModalOpen}
          onClose={() => setOtpModalOpen(false)}
          order={order}
          mode={otpMode}
          otpType={otpType}
          onSuccess={onRefresh}
        />
      )}

      {disputeModalOpen && (
        <DisputeModal
          isOpen={disputeModalOpen}
          onClose={() => setDisputeModalOpen(false)}
          order={order}
          onSuccess={onRefresh}
        />
      )}
    </>
  );
};

export default OrderCard;
