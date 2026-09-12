import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  AlertTriangle,
  Coins,
  Loader2,
  Calendar,
} from "lucide-react";
import type { AppDispatch } from "@/store/store";
import { loadWallet } from "@/store/walletSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import type { ISubscription, ISubscriptionDelivery } from "../subscription.types";
import { reportMissedDelivery } from "../subscription.api";

interface MissedDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: ISubscription;
  delivery: ISubscriptionDelivery | null;
  onSuccess: () => void;
}

export const MissedDeliveryModal = ({
  isOpen,
  onClose,
  subscription,
  delivery,
  onSuccess,
}: MissedDeliveryModalProps) => {
  const dispatch = useDispatch<AppDispatch>();

  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setReason("");
      setLoading(false);
    }
  }, [isOpen]);

  const deliveriesCount = subscription.deliveries?.length || 1;
  const dailyCost = Number((subscription.cycleAmount / deliveriesCount).toFixed(2));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!delivery) {
      toast.error("No scheduled delivery selected");
      return;
    }

    if (!reason.trim()) {
      toast.error("Please describe why this delivery was missed");
      return;
    }

    setLoading(true);

    const res = await reportMissedDelivery(subscription.id, delivery.id, reason.trim());
    if (res.error) {
      toast.error(res.error);
      setLoading(false);
    } else {
      dispatch(loadWallet());
      toast.success(res.message || "Missed delivery reported and refund credited!");
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 700);
    }
  };

  const deliveryDateFormatted = delivery
    ? new Date(delivery.scheduledDate).toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-lg p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            Report Missed Delivery
          </DialogTitle>
          <DialogDescription>
            If your scheduled delivery did not arrive, submit a report for an immediate pro-rata refund from escrow.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">

          <div className="p-3.5 rounded-lg border border-border/70 bg-muted/30 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Plan:</span>
              <span className="font-semibold text-foreground truncate max-w-[240px]">
                {subscription.product?.title || subscription.subscriptionNumber}
              </span>
            </div>
            {delivery && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Scheduled Slot:
                </span>
                <span className="font-medium text-foreground">
                  {deliveryDateFormatted} {delivery.note ? `(${delivery.note})` : ""}
                </span>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-rose-500/20 bg-rose-50/60 dark:bg-rose-950/30 p-4 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-rose-900 dark:text-rose-200 text-sm font-medium">
              <Coins className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              Instant Refund:
            </span>
            <span className="text-lg font-bold text-rose-700 dark:text-rose-300">
              ₹{dailyCost}
            </span>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="missedReason" className="text-xs font-medium">
              Reason for Missed Delivery
            </Label>
            <textarea
              id="missedReason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Delivery agent did not arrive at hostel room, meal was missing"
              disabled={loading}
              required
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !reason.trim()}
              className="bg-rose-600 hover:bg-rose-700 text-white font-medium"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {loading ? "Processing..." : "Report Missed & Claim Refund"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MissedDeliveryModal;
