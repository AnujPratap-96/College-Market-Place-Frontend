import React from 'react';
import { Star, ShieldCheck, Heart, Award } from 'lucide-react';
import { ITrustMetrics } from '../review.types';

interface TrustScoreBadgeProps {
  metrics?: Partial<ITrustMetrics> | null;
  score?: number;
  totalReviews?: number;
  badges?: string[];
  size?: 'sm' | 'md' | 'lg';
  showBadges?: boolean;
}

export const TrustScoreBadge: React.FC<TrustScoreBadgeProps> = ({
  metrics,
  score,
  totalReviews,
  badges,
  size = 'md',
  showBadges = true,
}) => {
  const currentScore = score ?? metrics?.trustScore ?? 4.0;
  const currentTotal = totalReviews ?? metrics?.totalReviews ?? 0;
  const currentBadges = badges ?? metrics?.badges ?? [];

  const getScoreColor = (sc: number) => {
    if (sc >= 4.5) return 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800';
    if (sc >= 4.0) return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800';
    if (sc >= 3.0) return 'text-sky-500 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800';
    return 'text-rose-500 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800';
  };

  const badgeConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    TOP_RATED_SELLER: {
      label: 'Top Rated Seller',
      icon: <Award size={12} className="shrink-0" />,
      color: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300',
    },
    COMMUNITY_FAVORITE: {
      label: 'Community Favorite',
      icon: <Heart size={12} className="shrink-0" />,
      color: 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300',
    },
    EXPERIENCED_TRADER: {
      label: 'Verified Trader',
      icon: <ShieldCheck size={12} className="shrink-0" />,
      color: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300',
    },
  };

  return (
    <div className="inline-flex items-center flex-wrap gap-1.5">
      <div
        className={`inline-flex items-center gap-1 font-bold rounded-lg border px-2 py-0.5 ${getScoreColor(
          currentScore
        )} ${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base py-1 px-2.5' : 'text-sm'}`}
      >
        <Star size={size === 'sm' ? 12 : size === 'lg' ? 18 : 14} className="fill-current" />
        <span>{currentScore.toFixed(1)}</span>
        {currentTotal > 0 && (
          <span className="text-muted-foreground font-normal text-[11px]">
            ({currentTotal})
          </span>
        )}
      </div>

      {showBadges &&
        currentBadges.map((badgeKey) => {
          const cfg = badgeConfig[badgeKey];
          if (!cfg) return null;
          return (
            <span
              key={badgeKey}
              className={`inline-flex items-center gap-1 text-[11px] font-semibold border px-2 py-0.5 rounded-full ${cfg.color}`}
            >
              {cfg.icon}
              {cfg.label}
            </span>
          );
        })}
    </div>
  );
};
