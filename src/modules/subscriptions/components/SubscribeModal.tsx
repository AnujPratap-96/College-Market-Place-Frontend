import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { isAxiosError } from "axios";
import { Repeat, ShieldCheck, Loader2 } from "lucide-react";
import Axios from "@/utils/Axios";
import type { AppDispatch } from "@/store/store";
import { loadWallet } from "@/store/walletSlice";
import type { IProduct } from "@/modules/products/product.types";
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

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: IProduct;
}

export const SubscribeModal = ({
  isOpen,
  onClose,
  product,
}: SubscribeModalProps) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [deliverySlots, setDeliverySlots] = useState(product.deliverySlots || "");
  const [autoRenew, setAutoRenew] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDeliverySlots(product.deliverySlots || "");
      setAutoRenew(false);
      setLoading(false);
    }
  }, [isOpen, product.deliverySlots]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        productId: product.id,
        deliverySlots: deliverySlots.trim() || undefined,
        autoRenew: Boolean(autoRenew),
        frequency: product.frequency || "MONTHLY",
      };

      const res = await Axios.post("/subscriptions/subscribe", payload);
      dispatch(loadWallet());
      toast.success(
        res.data?.message ||
          "Subscribed successfully! Escrow funds held for the active cycle."
      );

      setTimeout(() => {
        onClose();
        navigate("/dashboard/subscriptions");
      }, 700);
    } catch (err: unknown) {
      let errMsg = "Failed to subscribe to plan";
      if (isAxiosError(err)) {
        errMsg =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to subscribe to plan";
      } else if (err instanceof Error) {
        errMsg = err.message;
      }
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const frequency = product.frequency || "MONTHLY";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-lg p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Repeat className="w-5 h-5 text-emerald-600" />
            Subscribe to Plan
          </DialogTitle>
          <DialogDescription>
            Join recurring campus subscription with flexible pause and refund coverage.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">

          <div className="rounded-xl border border-border/70 bg-muted/40 p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-muted-foreground">Plan</span>
              <span className="font-semibold text-foreground truncate max-w-[220px]">
                {product.title}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Frequency</span>
              <span className="font-semibold text-foreground tracking-wide">
                {frequency}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-border/50 pt-2 text-sm">
              <span className="font-medium text-foreground">Upfront Cycle Cost:</span>
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                ₹{product.price}
              </span>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <span className="font-semibold block mb-0.5">Escrow Hold Protection</span>
                <span>
                  Upfront cycle fee is held securely in escrow. You can pause during vacation or report missed deliveries anytime for instant pro-rata refunds.
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="deliverySlots" className="text-xs font-medium">
              Delivery Slot Notes & Room Details
            </Label>
            <textarea
              id="deliverySlots"
              rows={3}
              placeholder="e.g. Room 210, Hostel 4 (Lunch: 1:00 PM, Dinner: 8:30 PM)"
              value={deliverySlots}
              onChange={(e) => setDeliverySlots(e.target.value)}
              disabled={loading}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/60 bg-muted/20">
            <input
              id="autoRenew"
              type="checkbox"
              checked={autoRenew}
              onChange={(e) => setAutoRenew(e.target.checked)}
              disabled={loading}
              className="mt-1 h-4 w-4 rounded border-border text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
            <div className="space-y-0.5">
              <Label htmlFor="autoRenew" className="text-sm font-medium cursor-pointer">
                Auto-renew subscription
              </Label>
              <p className="text-xs text-muted-foreground">
                Automatically renew the cycle from your wallet when the period concludes.
              </p>
            </div>
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
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {loading ? "Subscribing..." : "Confirm & Subscribe"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SubscribeModal;
