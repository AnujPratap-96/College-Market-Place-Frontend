import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { isAxiosError } from "axios";
import { Clock, ShieldCheck, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BookServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: IProduct;
}

export const BookServiceModal = ({
  isOpen,
  onClose,
  product,
}: BookServiceModalProps) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [preferredTime, setPreferredTime] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPreferredTime("");
      setNotes("");
      setError(null);
      setSuccess(null);
      setLoading(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const payload = {
        productId: product.id,
        notes: notes.trim() || undefined,
        preferredTime: preferredTime.trim() || undefined,
      };

      const res = await Axios.post("/orders/service-book", payload);
      dispatch(loadWallet());
      setSuccess(
        res.data?.message ||
          "Service booked successfully! Payment held in secure escrow."
      );

      setTimeout(() => {
        onClose();
        navigate("/dashboard/orders");
      }, 1200);
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            err.message ||
            "Failed to book service"
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to book service");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-lg p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" />
            Book Service
          </DialogTitle>
          <DialogDescription>
            Schedule and lock escrow for this campus service.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-xs border border-destructive/20">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{success}</span>
            </div>
          )}

          <div className="rounded-xl border border-border/70 bg-muted/40 p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-muted-foreground">Service</span>
              <span className="font-semibold text-foreground truncate max-w-[220px]">
                {product.title}
              </span>
            </div>

            {product.serviceDuration && (
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Duration</span>
                <span className="font-medium text-foreground">
                  {product.serviceDuration}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-border/50 pt-2 text-sm">
              <span className="font-medium text-foreground">Service Price:</span>
              <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                ₹{product.price}
              </span>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <span className="font-semibold block mb-0.5">Escrow Protection</span>
                <span>
                  Funds will be held securely in escrow and only released when you confirm service completion.
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="preferredTime" className="text-xs font-medium">
              Preferred Delivery / Service Date and Time
            </Label>
            <Input
              id="preferredTime"
              type="text"
              placeholder="e.g. Tomorrow at 5:00 PM or Saturday morning"
              value={preferredTime}
              onChange={(e) => setPreferredTime(e.target.value)}
              disabled={loading || Boolean(success)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs font-medium">
              Special Notes or Requirements
            </Label>
            <textarea
              id="notes"
              rows={3}
              placeholder="e.g. Room 304, Hall 4. Bring screwdriver kit if possible."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={loading || Boolean(success)}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading || Boolean(success)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || Boolean(success)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {loading ? "Booking Service..." : "Confirm & Book Service"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookServiceModal;
