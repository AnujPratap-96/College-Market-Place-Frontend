import { useState } from "react";
import { useDispatch } from "react-redux";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  PauseCircle,
  XCircle,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Clock,
  Sparkles,
} from "lucide-react";
import type { AppDispatch } from "@/store/store";
import { loadWallet } from "@/store/walletSlice";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type {
  ISubscription,
  ISubscriptionDelivery,
  SubscriptionStatus,
} from "../subscription.types";
import { resumeVacation, cancelSubscription } from "../subscription.api";
import DeliveryCalendar from "./DeliveryCalendar";
import { toast } from "@/components/ui/toast";

interface SubscriptionCardProps {
  subscription: ISubscription;
  onRefresh: () => void;
  onOpenVacation: (sub: ISubscription) => void;
  onReportMissed: (sub: ISubscription, delivery: ISubscriptionDelivery) => void;
}

const getSubscriptionStatusBadge = (status: SubscriptionStatus) => {
  switch (status) {
    case "ACTIVE":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 className="w-3 h-3" />
          Active
        </span>
      );
    case "PAUSED":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          <PauseCircle className="w-3 h-3" />
          Paused (Vacation)
        </span>
      );
    case "CANCELLED":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700">
          <XCircle className="w-3 h-3" />
          Cancelled
        </span>
      );
    case "EXPIRED":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
          <Clock className="w-3 h-3" />
          Expired
        </span>
      );
    case "DISPUTED":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
          <AlertTriangle className="w-3 h-3" />
          Disputed
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground border">
          {status}
        </span>
      );
  }
};

export const SubscriptionCard = ({
  subscription,
  onRefresh,
  onOpenVacation,
  onReportMissed,
}: SubscriptionCardProps) => {
  const dispatch = useDispatch<AppDispatch>();

  const [showSchedule, setShowSchedule] = useState(false);
  const [resuming, setResuming] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  const isCurrentlyPaused =
    subscription.status === "PAUSED" ||
    Boolean(subscription.vacationFrom && subscription.vacationTo);

  const handleResume = async () => {
    setResuming(true);
    const res = await resumeVacation(subscription.id);
    setResuming(false);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Subscription resumed successfully!");
      dispatch(loadWallet());
      onRefresh();
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    const res = await cancelSubscription(subscription.id);
    setCancelling(false);
    setShowConfirmCancel(false);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Subscription cancelled successfully!");
      dispatch(loadWallet());
      onRefresh();
    }
  };

  const formatDate = (d?: string) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card className="p-5 border border-border/70 shadow-sm rounded-xl space-y-4 hover:border-border transition-all">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-4">
        <div className="flex items-start gap-3">
          {subscription.product?.imageUrl ? (
            <img
              src={subscription.product.imageUrl}
              alt={subscription.product.title}
              className="w-12 h-12 rounded-lg object-cover border border-border shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center font-bold text-lg border border-emerald-200 dark:border-emerald-800 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
          )}

          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-foreground truncate max-w-[280px]">
                {subscription.product?.title || `Plan ${subscription.subscriptionNumber}`}
              </h3>
              {getSubscriptionStatusBadge(subscription.status)}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="font-mono text-[11px] bg-muted/60 px-1.5 py-0.5 rounded border">
                #{subscription.subscriptionNumber}
              </span>
              <span>•</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full font-medium bg-primary/10 text-primary text-[11px]">
                {subscription.frequency}
              </span>
              {subscription.autoRenew ? (
                <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium text-[11px]">
                  <RefreshCw className="w-3 h-3" />
                  Auto-renew
                </span>
              ) : (
                <span className="text-muted-foreground text-[11px]">Manual renew</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-border/40">
          <span className="text-xs text-muted-foreground">Cycle Amount</span>
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
            ₹{subscription.cycleAmount}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-lg bg-muted/30 border border-border/50 text-xs">
        <div>
          <span className="text-muted-foreground block mb-0.5">Start Date</span>
          <span className="font-medium text-foreground">{formatDate(subscription.startDate)}</span>
        </div>
        <div>
          <span className="text-muted-foreground block mb-0.5">End Date</span>
          <span className="font-medium text-foreground">{formatDate(subscription.endDate)}</span>
        </div>
        <div>
          <span className="text-muted-foreground block mb-0.5">Deliveries</span>
          <span className="font-medium text-foreground">
            {subscription.deliveries?.length || 0} scheduled slots
          </span>
        </div>
        <div>
          <span className="text-muted-foreground block mb-0.5">Provider</span>
          <span className="font-medium text-foreground truncate block">
            {subscription.provider?.name || "Campus Provider"}
          </span>
        </div>
      </div>

      {isCurrentlyPaused && subscription.vacationFrom && subscription.vacationTo && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <PauseCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              <strong>Vacation Pause Active:</strong> {formatDate(subscription.vacationFrom)} to{" "}
              {formatDate(subscription.vacationTo)}
            </span>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={handleResume}
            disabled={resuming}
            className="h-7 text-xs bg-amber-600 hover:bg-amber-700 text-white font-medium"
          >
            {resuming && <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />}
            Resume Deliveries
          </Button>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowSchedule(!showSchedule)}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 px-2"
        >
          <Calendar className="w-3.5 h-3.5" />
          {showSchedule ? "Hide Schedule" : "View Delivery Schedule"}
          {showSchedule ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </Button>

        <div className="flex items-center gap-2">
          {subscription.status === "ACTIVE" && !isCurrentlyPaused && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenVacation(subscription)}
              className="text-xs border-amber-300 dark:border-amber-900 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30"
            >
              <PauseCircle className="w-3.5 h-3.5 mr-1" />
              Set Vacation Pause
            </Button>
          )}

          {isCurrentlyPaused && !subscription.vacationFrom && (
            <Button
              type="button"
              size="sm"
              onClick={handleResume}
              disabled={resuming}
              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {resuming && <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />}
              <PlayCircle className="w-3.5 h-3.5 mr-1" />
              Resume Deliveries
            </Button>
          )}

          {subscription.status !== "CANCELLED" && subscription.status !== "EXPIRED" && (
            <>
              {showConfirmCancel ? (
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="h-7 text-xs"
                  >
                    {cancelling && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                    Confirm Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowConfirmCancel(false)}
                    className="h-7 text-xs"
                  >
                    Back
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowConfirmCancel(true)}
                  className="text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <XCircle className="w-3.5 h-3.5 mr-1" />
                  Cancel
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {showSchedule && (
        <DeliveryCalendar
          subscription={subscription}
          onReportMissed={(delivery) => onReportMissed(subscription, delivery)}
        />
      )}
    </Card>
  );
};

export default SubscriptionCard;
