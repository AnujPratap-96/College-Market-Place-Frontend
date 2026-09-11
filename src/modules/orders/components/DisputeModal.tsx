import { useState, useEffect } from "react";
import { AlertTriangle, ShieldAlert, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import type { IOrder } from "../order.types";
import { disputeOrder } from "../order.api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: IOrder;
  onSuccess: () => void;
}

const COMMON_REASONS = [
  "Item not received / Handover issue",
  "Item damaged, defective, or not working",
  "Item does not match listing description",
  "Counterparty unreachable or unresponsive",
  "Service not delivered or incomplete",
  "Security deposit dispute",
  "Other issue",
];

export const DisputeModal = ({
  isOpen,
  onClose,
  order,
  onSuccess,
}: DisputeModalProps) => {
  const [reason, setReason] = useState(COMMON_REASONS[0]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setReason(COMMON_REASONS[0]);
      setNotes("");
      setError(null);
      setSuccess(null);
      setLoading(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason) {
      setError("Please select a dispute reason");
      return;
    }

    if (notes.trim().length > 0 && notes.trim().length < 5) {
      setError("Additional notes must be at least 5 characters");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const result = await disputeOrder(order.id, reason, notes);

    setLoading(false);

    if (result.success) {
      setSuccess(
        result.message ||
          "Dispute filed successfully! Escrow frozen and escalated to campus admin."
      );
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } else {
      setError(result.error || "Failed to file dispute");
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !loading) onClose();
      }}
    >
      <DialogContent className="sm:max-w-lg p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            Raise Order Dispute
          </DialogTitle>
          <DialogDescription>
            Order #{order.orderNumber} • {order.product?.title || "Listing"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
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

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <div>
              <span className="font-semibold block mb-0.5">Escrow Hold Protection</span>
              <span>
                Filing a dispute freezes all remaining funds in escrow. Both parties will be notified, and campus support will arbitrate the resolution.
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dispute-reason" className="text-xs font-semibold">
              Primary Reason
            </Label>
            <Select
              value={reason}
              onValueChange={(val) => setReason(val)}
              disabled={loading || Boolean(success)}
            >
              <SelectTrigger id="dispute-reason" className="w-full">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {COMMON_REASONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dispute-notes" className="text-xs font-semibold">
              Detailed Explanation / Notes (Optional)
            </Label>
            <textarea
              id="dispute-notes"
              rows={4}
              placeholder="Provide specific details about what went wrong, condition issues, or attempts to contact the counterparty..."
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
              disabled={!reason || loading || Boolean(success)}
              className="bg-rose-600 hover:bg-rose-700 text-white font-medium"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {loading ? "Filing Dispute..." : "Submit Dispute"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DisputeModal;
