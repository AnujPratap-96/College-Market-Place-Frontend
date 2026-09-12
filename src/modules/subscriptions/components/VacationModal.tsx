import { useState, useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import {
  Calendar,
  PauseCircle,
  Coins,
  Loader2,
  Info,
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
import type { ISubscription } from "../subscription.types";
import { setVacation } from "../subscription.api";

interface VacationModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: ISubscription;
  onSuccess: () => void;
}

export const VacationModal = ({
  isOpen,
  onClose,
  subscription,
  onSuccess,
}: VacationModalProps) => {
  const dispatch = useDispatch<AppDispatch>();

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFromDate("");
      setToDate("");
      setLoading(false);
    }
  }, [isOpen]);

  const matchingDeliveries = useMemo(() => {
    if (!fromDate || !toDate || fromDate > toDate || !subscription.deliveries) {
      return [];
    }
    return subscription.deliveries.filter((d) => {
      const itemDate = d.scheduledDate ? d.scheduledDate.slice(0, 10) : "";
      return itemDate >= fromDate && itemDate <= toDate && d.status === "SCHEDULED";
    });
  }, [fromDate, toDate, subscription.deliveries]);

  const pausedDays = matchingDeliveries.length;
  const totalDeliveriesCount = subscription.deliveries?.length || 1;
  const dailyCost = subscription.cycleAmount / totalDeliveriesCount;
  const refundAmount = Number((dailyCost * pausedDays).toFixed(2));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromDate || !toDate) {
      toast.error("Please select both start and end dates");
      return;
    }
    if (fromDate > toDate) {
      toast.error("End date must be on or after start date");
      return;
    }

    setLoading(true);

    const res = await setVacation(subscription.id, fromDate, toDate);
    if (res.error) {
      toast.error(res.error);
      setLoading(false);
    } else {
      dispatch(loadWallet());
      toast.success(res.message || "Vacation mode activated and pro-rata refund credited!");
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 700);
    }
  };

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-lg p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <PauseCircle className="w-5 h-5 text-amber-500" />
            Set Vacation Pause
          </DialogTitle>
          <DialogDescription>
            Pause upcoming deliveries while you are away. Unused scheduled slots are instantly refunded to your wallet.
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
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Cycle Cost / Total Deliveries:</span>
              <span className="font-medium text-foreground">
                ₹{subscription.cycleAmount} / {subscription.deliveries?.length || 0} slots
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="fromDate" className="text-xs font-medium">
                Vacation Start Date
              </Label>
              <div className="relative">
                <input
                  id="fromDate"
                  type="date"
                  min={todayStr}
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  disabled={loading}
                  required
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="toDate" className="text-xs font-medium">
                Vacation End Date
              </Label>
              <div className="relative">
                <input
                  id="toDate"
                  type="date"
                  min={fromDate || todayStr}
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  disabled={loading}
                  required
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {fromDate && toDate && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-50/60 dark:bg-amber-950/30 p-4 space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-amber-900 dark:text-amber-200 font-medium">
                  <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  Deliveries to Pause:
                </span>
                <span className="font-bold text-amber-950 dark:text-amber-100">
                  {pausedDays} {pausedDays === 1 ? "day" : "days"}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm border-t border-amber-500/20 pt-2">
                <span className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-medium">
                  <Coins className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Instant Pro-Rata Refund:
                </span>
                <span className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                  ₹{refundAmount}
                </span>
              </div>

              {pausedDays === 0 && (
                <div className="flex items-start gap-1.5 text-xs text-amber-700 dark:text-amber-300 pt-1">
                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>No scheduled deliveries found within this date range.</span>
                </div>
              )}
            </div>
          )}

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
              disabled={loading || !fromDate || !toDate || pausedDays === 0}
              className="bg-amber-600 hover:bg-amber-700 text-white font-medium"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {loading ? "Processing..." : "Confirm Vacation Pause"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default VacationModal;
