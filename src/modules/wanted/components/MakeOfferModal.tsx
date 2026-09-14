import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tag, MapPin, IndianRupee, ShieldCheck, Loader2 } from 'lucide-react';
import type { IWantedRequest } from '../wanted.types';
import { submitWantedOffer } from '../wanted.api';
import { toast } from '@/components/ui/toast';
import { isAxiosError } from 'axios';

interface MakeOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: IWantedRequest;
  onSuccess: () => void;
}

export const MakeOfferModal: React.FC<MakeOfferModalProps> = ({
  isOpen,
  onClose,
  request,
  onSuccess,
}) => {
  const [amount, setAmount] = useState<string>(request.budget ? String(request.budget) : '');
  const [pickupLocation, setPickupLocation] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountNum = Number(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid offer price.');
      return;
    }

    if (!pickupLocation.trim()) {
      toast.error('Please specify a campus pickup or meetup spot.');
      return;
    }

    setLoading(true);
    try {
      await submitWantedOffer(request.id, {
        amount: amountNum,
        pickupLocation: pickupLocation.trim(),
        message: message.trim() || undefined,
      });
      toast.success('Your offer has been pitched to the requester!');
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = isAxiosError(err)
        ? err.response?.data?.message || err.response?.data?.error || err.message
        : err instanceof Error
        ? err.message
        : 'Failed to submit offer';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-background border border-border/80 shadow-2xl rounded-2xl p-6">
        <DialogHeader className="space-y-1 text-left">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-1">
            <Tag size={22} />
          </div>
          <DialogTitle className="text-xl font-black text-foreground">
            Pitch Your Item / Offer
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Responding to <span className="font-semibold text-foreground">"{request.title}"</span> requested by {request.requester?.name || 'Student'}.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted/30 border border-border/60 rounded-xl p-3 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Target Budget:</span>
          <span className="font-bold text-foreground flex items-center">
            <IndianRupee size={12} className="inline" />
            {request.budget.toFixed(2)}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="amount" className="text-xs font-bold text-foreground">
              Your Asking Price (₹)
            </Label>
            <div className="relative">
              <IndianRupee
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="amount"
                type="number"
                min="1"
                step="any"
                placeholder="e.g. 450"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-10 pl-8 rounded-xl bg-muted/30 text-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="location" className="text-xs font-bold text-foreground">
              Handover / Pickup Spot on Campus
            </Label>
            <div className="relative">
              <MapPin
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="location"
                placeholder="e.g. Central Library Lawn, Hostel 2 Common Room"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                className="h-10 pl-8 rounded-xl bg-muted/30 text-xs"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="message" className="text-xs font-bold text-foreground">
              Note for Requester (Condition, accessories, etc.)
            </Label>
            <Textarea
              id="message"
              placeholder="Describe what you have, its condition, or when you can meet..."
              rows={3}
              value={message}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
              className="rounded-xl bg-muted/30 text-xs resize-none"
            />
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-start gap-2.5">
            <ShieldCheck size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-emerald-700 dark:text-emerald-300 leading-relaxed">
              If accepted, the requester funds will lock into escrow instantly. Hand over the item at your campus spot and collect your OTP code to claim funds.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-10 rounded-xl text-xs font-medium"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="h-10 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs px-5 shadow-md shadow-emerald-500/20"
            >
              {loading && <Loader2 size={14} className="mr-1.5 animate-spin" />}
              Send Offer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
