import React, { useState } from 'react';
import { Handshake, Loader2 } from 'lucide-react';
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
import { createNegotiationOffer } from '../negotiation.api';
import type { INegotiationOffer } from '../negotiation.types';

interface MakeOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    title: string;
    price: number;
    imageUrl?: string;
  };
  onOfferCreated?: (offer: INegotiationOffer) => void;
}

export const MakeOfferModal: React.FC<MakeOfferModalProps> = ({
  isOpen,
  onClose,
  product,
  onOfferCreated,
}) => {
  const [offeredPrice, setOfferedPrice] = useState(
    product.price > 0 ? String(Math.round(product.price * 0.9)) : ''
  );
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(offeredPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error('Please enter a valid offer price.');
      return;
    }
    if (priceNum >= product.price) {
      toast.error('Offer price should be less than the current listed price.');
      return;
    }

    setSubmitting(true);
    const res = await createNegotiationOffer(product.id, priceNum, note.trim() || undefined);
    setSubmitting(false);

    if (res.error) {
      toast.error(res.error);
    } else if (res.offer) {
      toast.success(`Bargain offer of ₹${priceNum} submitted to seller!`);
      onOfferCreated?.(res.offer);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md w-[95%] sm:w-full rounded-2xl p-6 bg-card border-border overflow-hidden">
        <DialogHeader className="space-y-1 text-left">
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <Handshake className="w-5 h-5 text-emerald-500" />
            Make a Negotiation Offer
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Bargain directly with the student seller. Once accepted, an escrow order is automatically created at this price.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-border/50">
            {product.imageUrl && (
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-12 h-12 rounded object-cover border border-border"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{product.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Listed Price: <span className="font-semibold text-foreground">₹{product.price}</span>
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="offerPrice" className="text-xs">
              Your Offer Price (₹ INR)
            </Label>
            <Input
              id="offerPrice"
              type="number"
              min="1"
              max={product.price}
              value={offeredPrice}
              onChange={(e) => setOfferedPrice(e.target.value)}
              placeholder={`e.g. ${Math.round(product.price * 0.85)}`}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="offerNote" className="text-xs">
              Quick Note / Pickup Message (Optional)
            </Label>
            <Input
              id="offerNote"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Can pick up today from Hostel 4"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={submitting}
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
              Send Offer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
