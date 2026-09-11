import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { KeyRound, ShieldCheck, Copy, Check, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import type { AppDispatch } from "@/store/store";
import { loadWallet } from "@/store/walletSlice";
import type { IOrder } from "../order.types";
import { verifyHandover, verifyReturn } from "../order.api";
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

interface OtpHandshakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: IOrder;
  mode: "SHOW_BUYER_OTP" | "VERIFY_SELLER_OTP";
  otpType: "PICKUP" | "RETURN";
  onSuccess: () => void;
}

export const OtpHandshakeModal = ({
  isOpen,
  onClose,
  order,
  mode,
  otpType,
  onSuccess,
}: OtpHandshakeModalProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const [otpInput, setOtpInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setOtpInput("");
      setError(null);
      setSuccess(null);
      setCopied(false);
      setLoading(false);
    }
  }, [isOpen]);

  const otpValue =
    otpType === "PICKUP"
      ? order.pickupOtp || "------"
      : order.returnOtp || "------";

  const handleCopy = async () => {
    if (otpValue && otpValue !== "------") {
      await navigator.clipboard.writeText(otpValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleVerify = async () => {
    if (otpInput.trim().length !== 6) {
      setError("Please enter the complete 6-digit OTP");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const result =
      otpType === "PICKUP"
        ? await verifyHandover(order.id, otpInput.trim())
        : await verifyReturn(order.id, otpInput.trim());

    setLoading(false);

    if (result.success) {
      dispatch(loadWallet());
      setSuccess(
        result.message ||
          (otpType === "PICKUP"
            ? "Handover verified successfully! Funds transferred."
            : "Return verified successfully! Deposit refunded.")
      );
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 900);
    } else {
      setError(result.error || "Failed to verify OTP");
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !loading) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-primary" />
            {mode === "SHOW_BUYER_OTP"
              ? otpType === "PICKUP"
                ? "Pickup Verification OTP"
                : "Return Verification OTP"
              : otpType === "PICKUP"
              ? "Verify Handover OTP"
              : "Verify Return & Refund Deposit"}
          </DialogTitle>
          <DialogDescription>
            {mode === "SHOW_BUYER_OTP"
              ? `Order #${order.orderNumber} • ${order.product?.title || "Product"}`
              : `Confirm in-person physical exchange for order #${order.orderNumber}`}
          </DialogDescription>
        </DialogHeader>

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

        {mode === "SHOW_BUYER_OTP" ? (
          <div className="space-y-4 pt-1">
            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-muted/50 border border-border/80">
              <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1">
                {otpType === "PICKUP" ? "Pickup Code" : "Return Code"}
              </span>
              <div className="flex items-center gap-3">
                <span className="font-mono text-4xl font-extrabold tracking-[0.25em] text-foreground select-all">
                  {otpValue}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  onClick={handleCopy}
                  title="Copy OTP"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 text-xs text-blue-900 dark:text-blue-200">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
              <div>
                <span className="font-semibold block mb-0.5">
                  {otpType === "PICKUP"
                    ? "Inspect before sharing"
                    : "Inspect upon return"}
                </span>
                <span>
                  {otpType === "PICKUP"
                    ? "Only share this 6-digit OTP with the seller after inspecting and receiving the item. Once verified, escrow payment will be released to the seller."
                    : "Share this 6-digit OTP with the owner after returning the rental item. Verifying will refund your security deposit."}
                </span>
              </div>
            </div>

            <Button
              type="button"
              onClick={onClose}
              className="w-full font-medium"
            >
              Close
            </Button>
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            <div className="space-y-2">
              <Label htmlFor="handshake-otp" className="text-xs font-semibold">
                6-Digit Verification OTP
              </Label>
              <Input
                id="handshake-otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={otpInput}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setOtpInput(val);
                  setError(null);
                }}
                disabled={loading || Boolean(success)}
                autoFocus
                className="text-center font-mono text-3xl font-extrabold tracking-[0.35em] h-14"
              />
              <p className="text-xs text-muted-foreground">
                {otpType === "PICKUP"
                  ? "Ask the buyer for their 6-digit pickup OTP once you meet and complete handover."
                  : "Ask the renter for their 6-digit return OTP once you inspect the returned item."}
              </p>
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
                type="button"
                onClick={handleVerify}
                disabled={otpInput.trim().length !== 6 || loading || Boolean(success)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {loading ? "Verifying..." : "Verify & Complete"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OtpHandshakeModal;
