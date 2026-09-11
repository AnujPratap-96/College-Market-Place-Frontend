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
  const [error, setError] = useState<string | null>(null);

  const handleTagClick = (tag: string) => {
    if (comment.includes(tag)) return;
    setComment((prev) => (prev ? `${prev} • ${tag}` : tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please enter feedback comment.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await submitReview({
        orderId,
        rating,
        headline: headline.trim() || undefined,
        comment: comment.trim(),
        isAnonymous,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[95%] sm:w-full rounded-2xl p-6 bg-card border-border">
        <DialogHeader className="space-y-1 text-left">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Star className="text-amber-500 fill-amber-500" size={20} />
            Leave a Campus Review
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {orderNumber && <span className="font-semibold text-foreground">Order #{orderNumber}</span>}
            {productTitle && <span> • {productTitle}</span>}
            {targetName && <span> with {targetName}</span>}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs p-3 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
              Your Rating
            </label>
            <div className="flex items-center gap-2">
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
                      size={28}
                      className={
                        active
                          ? 'text-amber-500 fill-amber-500'
                          : 'text-muted-foreground/30'
                      }
                    />
                  </button>
                );
              })}
              <span className="text-sm font-extrabold ml-2 text-foreground">
                {rating === 5 && 'Outstanding ⭐⭐⭐⭐⭐'}
                {rating === 4 && 'Very Good ⭐⭐⭐⭐'}
                {rating === 3 && 'Average ⭐⭐⭐'}
                {rating === 2 && 'Disappointing ⭐⭐'}
                {rating === 1 && 'Poor Experience ⭐'}
              </span>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
              Quick Feedback Tags
            </label>
            <div className="flex flex-wrap gap-1.5">
              {TAG_SUGGESTIONS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagClick(tag)}
                  className="text-xs bg-muted/60 hover:bg-muted border border-border/80 px-2.5 py-1 rounded-lg transition-colors text-foreground"
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
              Headline (Optional)
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Textbook was spotless, very punctual handover!"
              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
              Detailed Feedback
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share details about item condition, meetup timeliness, or communication..."
              required
              className="w-full bg-background border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/30 border border-border rounded-xl">
            <div className="flex items-center gap-2">
              <EyeOff size={16} className="text-muted-foreground" />
              <div>
                <div className="text-xs font-semibold">Post Anonymously</div>
                <div className="text-[10px] text-muted-foreground">
                  Shows your feedback as "Campus Peer" instead of your name
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

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <Check size={14} /> Submit Review
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
