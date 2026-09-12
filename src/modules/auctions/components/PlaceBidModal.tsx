import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Gavel, ShieldCheck, Wallet, Loader2 } from 'lucide-react';
import type { AppDispatch, RootState } from '@/store/store';
import { loadWallet } from '@/store/walletSlice';
import { placeBid } from '../auction.api';
import type { IAuction } from '../auction.types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/toast';

interface PlaceBidModalProps {
  isOpen: boolean;
  onClose: () => void;
  auction: IAuction;
  onBidSuccess: () => void;
}

export const PlaceBidModal = ({
  isOpen,
  onClose,
  auction,
  onBidSuccess,
}: PlaceBidModalProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const wallet = useSelector((state: RootState) => state.wallet);

  const hasBids = (auction.bids && auction.bids.length > 0) || (auction._count?.bids ?? 0) > 0;
  const minRequiredBid = hasBids
    ? auction.currentBid + auction.minIncrement
    : auction.startingBid;

  const [amount, setAmount] = useState<number>(minRequiredBid);
  const [loading, setLoading] = useState(false);

  const isBalanceSufficient = wallet.balance >= amount;

  const handleQuickAdd = (value: number) => {
    setAmount(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount < minRequiredBid) {
      toast.error(`Minimum bid required is ₹${minRequiredBid.toFixed(2)}`);
      return;
    }

    if (!isBalanceSufficient) {
      toast.error(`Insufficient wallet balance. You need ₹${amount.toFixed(2)}, but have ₹${wallet.balance.toFixed(2)}.`);
      return;
    }

    setLoading(true);

    const res = await placeBid(auction.id, amount);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(`🎉 Bid placed: ₹${amount.toFixed(2)}! You are now the leading bidder.`);
      await dispatch(loadWallet());
      onBidSuccess();
      setTimeout(() => {
        onClose();
      }, 700);
    }
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary mb-1">
            <Gavel className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Campus Live Bidding</span>
          </div>
          <DialogTitle className="text-xl">Place Your Bid</DialogTitle>
          <DialogDescription className="text-xs line-clamp-1">
            {auction.product.title}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">Current Highest Bid</span>
              <span className="text-lg font-bold font-mono">₹{auction.currentBid.toFixed(2)}</span>
            </div>
            <div className="text-right">
              <span className="text-muted-foreground block text-[11px]">Min Bid Increment</span>
              <span className="font-mono font-semibold">+₹{auction.minIncrement.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bidAmount" className="text-xs font-semibold">
              Your Bid Amount (INR)
            </Label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                ₹
              </span>
              <Input
                id="bidAmount"
                type="number"
                min={minRequiredBid}
                step={1}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="pl-8 text-lg font-bold font-mono h-11"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] text-muted-foreground font-medium">Quick Bid Suggestions:</span>
            <div className="grid grid-cols-4 gap-2">
              {[
                minRequiredBid,
                minRequiredBid + 50,
                minRequiredBid + 100,
                minRequiredBid + 250,
              ].map((val) => (
                <Button
                  key={val}
                  type="button"
                  size="sm"
                  variant={amount === val ? 'default' : 'outline'}
                  onClick={() => handleQuickAdd(val)}
                  className="font-mono text-xs h-8"
                >
                  ₹{val}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-card border text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Wallet className="w-3.5 h-3.5 text-primary" />
              Available Balance:
            </span>
            <span className={`font-mono font-bold ${isBalanceSufficient ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}>
              ₹{wallet.balance.toFixed(2)}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[11px] flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Your bid is protected in escrow. If another student outbids you, this entire amount is immediately refunded back to your available balance.
            </span>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !isBalanceSufficient || amount < minRequiredBid}
              className="flex-1 gap-1.5"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Placing Bid...
                </>
              ) : (
                <>
                  <Gavel className="w-4 h-4" />
                  Confirm Bid ₹{amount}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
