import { Trophy, History } from 'lucide-react';
import type { IBid } from '../auction.types';

interface BidFeedProps {
  bids: IBid[];
  startingBid: number;
}

export const BidFeed = ({ bids, startingBid }: BidFeedProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold flex items-center gap-1.5">
          <History className="w-4 h-4 text-muted-foreground" />
          Bid History ({bids.length})
        </h4>
        <span className="text-xs text-muted-foreground">Starting: ₹{startingBid.toFixed(2)}</span>
      </div>

      {bids.length === 0 ? (
        <div className="text-center py-6 border border-dashed rounded-xl bg-muted/20 text-muted-foreground text-xs">
          No bids placed yet. Be the first to place a bid!
        </div>
      ) : (
        <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
          {bids.map((bid, index) => {
            const isHighest = index === 0;
            return (
              <div
                key={bid.id}
                className={`flex items-center justify-between p-2.5 rounded-lg border text-xs transition-colors ${
                  isHighest
                    ? 'bg-emerald-500/10 border-emerald-500/30 dark:bg-emerald-950/20'
                    : 'bg-card border-border'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[11px] overflow-hidden">
                    {bid.bidder?.profileImage ? (
                      <img
                        src={bid.bidder.profileImage}
                        alt={bid.bidder?.name || 'Bidder'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      bid.bidder?.name?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 font-medium">
                      <span>{bid.bidder?.name || 'Student Bidder'}</span>
                      {isHighest && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded-full">
                          <Trophy className="w-3 h-3" /> Highest
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {bid.bidder?.college || 'Campus Peer'} • {new Date(bid.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`font-mono font-bold text-sm ${isHighest ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>
                    ₹{bid.amount.toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
