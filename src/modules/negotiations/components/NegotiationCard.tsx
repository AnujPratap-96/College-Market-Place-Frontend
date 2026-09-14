import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Handshake, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/toast';
import type { INegotiationOffer } from '../negotiation.types';
import {
  acceptNegotiationOffer,
  counterNegotiationOffer,
  declineNegotiationOffer,
} from '../negotiation.api';

interface NegotiationCardProps {
  offer: INegotiationOffer;
  currentUserId: string;
  onUpdated?: (updatedOffer: INegotiationOffer) => void;
}

export const NegotiationCard: React.FC<NegotiationCardProps> = ({
  offer: initialOffer,
  currentUserId,
  onUpdated,
}) => {
  const navigate = useNavigate();
  const [offer, setOffer] = useState<INegotiationOffer>(initialOffer);
  const [isCountering, setIsCountering] = useState(false);
  const [counterPrice, setCounterPrice] = useState('');
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const isMyOffer = currentUserId === offer.offeredById;
  const discountPercent =
    offer.originalPrice > offer.offeredPrice
      ? Math.round(((offer.originalPrice - offer.offeredPrice) / offer.originalPrice) * 100)
      : 0;

  const handleAccept = async () => {
    setLoadingAction('accept');
    const res = await acceptNegotiationOffer(offer.id);
    setLoadingAction(null);
    if (res.error) {
      toast.error(res.error);
    } else if (res.offer) {
      setOffer(res.offer);
      onUpdated?.(res.offer);
      toast.success('Offer accepted! Order created with escrow hold.');
    }
  };

  const handleDecline = async () => {
    setLoadingAction('decline');
    const res = await declineNegotiationOffer(offer.id);
    setLoadingAction(null);
    if (res.error) {
      toast.error(res.error);
    } else if (res.offer) {
      setOffer(res.offer);
      onUpdated?.(res.offer);
      toast.info('Negotiation declined.');
    }
  };

  const handleSendCounter = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(counterPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error('Enter a valid counter offer price.');
      return;
    }
    setLoadingAction('counter');
    const res = await counterNegotiationOffer(offer.id, priceNum);
    setLoadingAction(null);
    if (res.error) {
      toast.error(res.error);
    } else if (res.offer) {
      setOffer(res.offer);
      setIsCountering(false);
      setCounterPrice('');
      onUpdated?.(res.offer);
      toast.success(`Counter offer of ₹${priceNum} sent!`);
    }
  };

  return (
    <div className="my-2 p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-50/10 dark:bg-emerald-950/20 shadow-sm max-w-md w-full">
      <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-2 mb-2.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          <Handshake className="w-4 h-4" />
          <span>Campus Price Negotiation</span>
        </div>
        <span
          className={`px-2 py-0.5 text-[11px] font-medium rounded-full ${
            offer.status === 'ACCEPTED'
              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
              : offer.status === 'PENDING'
              ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
              : offer.status === 'COUNTERED'
              ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {offer.status}
        </span>
      </div>

      {offer.product && (
        <div className="flex items-center gap-2.5 mb-2.5">
          {offer.product.imageUrl && (
            <img
              src={offer.product.imageUrl}
              alt={offer.product.title}
              className="w-10 h-10 rounded-lg object-cover border border-border"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate text-foreground">{offer.product.title}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-muted-foreground line-through">
                ₹{offer.originalPrice.toFixed(0)}
              </span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                ₹{offer.offeredPrice.toFixed(0)}
              </span>
              {discountPercent > 0 && (
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  {discountPercent}% OFF
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {offer.status === 'ACCEPTED' && (
        <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
          <span>Escrow order reserved at agreed price!</span>
          {offer.orderId && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={() => navigate('/dashboard/orders')}
            >
              View Order
            </Button>
          )}
        </div>
      )}

      {offer.status === 'PENDING' && (
        <div className="mt-2.5 pt-2 border-t border-border/40">
          {isMyOffer ? (
            <p className="text-xs text-muted-foreground italic">
              You proposed ₹{offer.offeredPrice}. Awaiting response...
            </p>
          ) : isCountering ? (
            <form onSubmit={handleSendCounter} className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">₹</span>
                <Input
                  type="number"
                  placeholder="Your counter price"
                  value={counterPrice}
                  onChange={(e) => setCounterPrice(e.target.value)}
                  className="h-8 text-xs"
                  autoFocus
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setIsCountering(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={loadingAction === 'counter'}
                >
                  {loadingAction === 'counter' ? (
                    <Loader2 className="w-3 h-3 animate-spin mr-1" />
                  ) : null}
                  Send Counter
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex-1"
                onClick={handleAccept}
                disabled={loadingAction !== null}
              >
                {loadingAction === 'accept' ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                ) : (
                  <Check className="w-3.5 h-3.5 mr-1" />
                )}
                Accept (₹{offer.offeredPrice})
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={() => {
                  setIsCountering(true);
                  setCounterPrice(String(offer.offeredPrice));
                }}
                disabled={loadingAction !== null}
              >
                Counter
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs text-destructive hover:text-destructive"
                onClick={handleDecline}
                disabled={loadingAction !== null}
              >
                {loadingAction === 'decline' ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <X className="w-3.5 h-3.5" />
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
