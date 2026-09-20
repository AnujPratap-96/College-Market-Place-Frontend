import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Star, EyeOff, Check, Loader2 } from 'lucide-react';
import { submitReview } from '../review.api';
import { toast } from '@/components/ui/toast';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderNumber?: string;
  productTitle?: string;
  targetName?: string;
  onSuccess: () => void;
}

const TAG_SUGGESTIONS = [
  'Punctual & Responsive',
  'Item as Described',
  'Mint Condition',
  'Smooth Handover',
  'Fair Pricing',
  'Trustworthy Senior',
];

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  orderId,
  orderNumber,
  productTitle,
  targetName,
  onSuccess,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [headline, setHeadline] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleTagClick = (tag: string) => {
    if (comment.includes(tag)) return;
    setComment((prev) => (prev ? `${prev} • ${tag}` : tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('Please enter feedback comment.');
      return;
    }

    setLoading(true);

    try {
      await submitReview({
        orderId,
        rating,
        headline: headline.trim() || undefined,
        comment: comment.trim(),
        isAnonymous,
      });

      toast.success('Review submitted successfully! Thank you.');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[95%] sm:w-full rounded-2xl p-5 bg-card border-border max-h-[85vh] overflow-y-auto">
        <DialogHeader className="space-y-1 text-left pb-1 border-b border-border/50">
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <Star className="text-amber-500 fill-amber-500" size={18} />
            Leave a Campus Review
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground truncate">
            {orderNumber && <span className="font-semibold text-foreground">Order #{orderNumber}</span>}
            {productTitle && <span> • {productTitle}</span>}
            {targetName && <span> with {targetName}</span>}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 pt-2">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Your Rating
              </label>
              <span className="text-xs font-bold text-amber-500">
                {rating === 5 && 'Outstanding (5★)'}
                {rating === 4 && 'Very Good (4★)'}
                {rating === 3 && 'Average (3★)'}
                {rating === 2 && 'Disappointing (2★)'}
                {rating === 1 && 'Poor Experience (1★)'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => {
                const active = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 hover:scale-110 transition-transform focus:outline-none"
                  >
                    <Star
                      size={24}
                      className={
                        active
                          ? 'text-amber-500 fill-amber-500'
                          : 'text-muted-foreground/30'
                      }
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
              Quick Tags
            </label>
            <div className="flex flex-wrap gap-1">
              {TAG_SUGGESTIONS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagClick(tag)}
                  className="text-[11px] bg-muted/60 hover:bg-muted border border-border/80 px-2 py-0.5 rounded-lg transition-colors text-foreground"
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
              Headline (Optional)
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Spotless item, punctual handover"
              className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
              Feedback Comment
            </label>
            <textarea
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Item condition, meetup timeliness, communication..."
              required
              className="w-full bg-background border border-border rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          <div className="flex items-center justify-between p-2.5 bg-muted/30 border border-border rounded-xl">
            <div className="flex items-center gap-2">
              <EyeOff size={15} className="text-muted-foreground" />
              <div>
                <div className="text-xs font-semibold">Post Anonymously</div>
                <div className="text-[10px] text-muted-foreground">
                  Displays as "Campus Peer"
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl border border-border hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white transition-all flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={13} className="animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <Check size={13} /> Submit Review
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
