import React, { useEffect, useState } from 'react';
import { Star, MessageSquare, User, Loader2 } from 'lucide-react';
import type { IReview, ITrustMetrics } from '../review.types';
import { fetchUserReviews, fetchProductReviews } from '../review.api';
import { TrustScoreBadge } from './TrustScoreBadge';

interface UserReviewsListProps {
  userId?: string;
  productId?: string;
}

export const UserReviewsList: React.FC<UserReviewsListProps> = ({ userId, productId }) => {
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [metrics, setMetrics] = useState<ITrustMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadReviews = async () => {
      setLoading(true);
      try {
        if (userId) {
          const res = await fetchUserReviews(userId);
          setReviews(res.reviews || []);
          setMetrics(res.trustMetrics);
        } else if (productId) {
          const res = await fetchProductReviews(productId);
          setReviews(res.reviews || []);
        }
      } catch (err) {
        console.error('Failed loading reviews:', err);
      } finally {
        setLoading(false);
      }
    };

    if (userId || productId) {
      loadReviews();
    }
  }, [userId, productId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground gap-2">
        <Loader2 size={18} className="animate-spin" />
        <span className="text-xs">Loading campus reviews...</span>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 px-4 bg-muted/20 border border-border/60 rounded-2xl">
        <MessageSquare className="mx-auto text-muted-foreground/40 mb-2" size={28} />
        <div className="text-sm font-semibold text-foreground">No Reviews Yet</div>
        <div className="text-xs text-muted-foreground mt-1">
          Reviews from verified campus transactions will appear here.
        </div>
      </div>
    );
  }

  const total = metrics?.totalReviews || reviews.length;

  return (
    <div className="space-y-4">
      {metrics && (
        <div className="bg-muted/30 border border-border rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-6">
          <div className="text-center sm:text-left shrink-0">
            <div className="text-3xl font-black text-foreground">
              {metrics.trustScore.toFixed(1)}
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-0.5 text-amber-500 my-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={14}
                  className={
                    metrics.trustScore >= s
                      ? 'fill-amber-500 text-amber-500'
                      : 'text-muted-foreground/30'
                  }
                />
              ))}
            </div>
            <div className="text-xs text-muted-foreground">
              Based on {metrics.totalReviews} verified trades
            </div>
            <div className="mt-2">
              <TrustScoreBadge metrics={metrics} size="sm" />
            </div>
          </div>

          <div className="w-full space-y-1.5 flex-1">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = metrics.ratingDistribution[star] || 0;
              const percent = total > 0 ? (count / total) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-4 font-semibold text-muted-foreground">{star}★</span>
                  <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-muted-foreground text-[11px]">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-2.5">
        {reviews.map((r) => (
          <div
            key={r.id}
            className="p-3.5 bg-card border border-border rounded-2xl space-y-2 hover:border-border/80 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                  {r.reviewer?.name ? r.reviewer.name.charAt(0).toUpperCase() : <User size={14} />}
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground">
                    {r.isAnonymous ? 'Campus Peer' : r.reviewer?.name || 'Student'}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {r.isAnonymous ? 'Verified Student' : r.reviewer?.college || 'Campus'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-amber-500">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={12}
                    className={s <= r.rating ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground/30'}
                  />
                ))}
              </div>
            </div>

            {r.headline && (
              <div className="text-xs font-bold text-foreground">{r.headline}</div>
            )}

            <div className="text-xs text-muted-foreground leading-relaxed">
              {r.comment}
            </div>

            <div className="text-[10px] text-muted-foreground/80 flex items-center justify-between pt-1 border-t border-border/40">
              <span>{r.role === 'BUYER_TO_SELLER' ? 'Reviewed as Buyer' : 'Reviewed as Seller'}</span>
              <span>{new Date(r.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
