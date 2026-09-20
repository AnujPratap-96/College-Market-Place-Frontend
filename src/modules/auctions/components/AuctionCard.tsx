import { Link } from 'react-router-dom';
import { Gavel, Trophy, User, Flame, Zap } from 'lucide-react';
import type { IAuction } from '../auction.types';
import { AuctionCountdown } from './AuctionCountdown';
import { Button } from '@/components/ui/button';

interface AuctionCardProps {
  auction: IAuction;
}

export const AuctionCard = ({ auction }: AuctionCardProps) => {
  const bidsCount = auction.bids?.length ?? auction._count?.bids ?? 0;
  const isExtended = auction.status === 'EXTENDED';
  const isEnded = auction.status === 'ENDED' || new Date(auction.endTime).getTime() <= Date.now();

  return (
    <div className="group rounded-2xl border border-border/70 bg-card/85 backdrop-blur-md overflow-hidden hover:border-orange-500/40 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 flex flex-col">
      <div className="relative aspect-4/3 overflow-hidden bg-muted/40">
        {auction.product.imageUrl ? (
          <img
            src={auction.product.imageUrl}
            alt={auction.product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <Gavel className="w-12 h-12 stroke-[1.5]" />
          </div>
        )}

        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          {isEnded ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-full bg-background/90 text-muted-foreground shadow-xs backdrop-blur-md border border-border/70">
              <Gavel className="w-3 h-3" />
              Ended
            </span>
          ) : (
            <>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-full bg-orange-500/95 text-white shadow-xs backdrop-blur-md border border-orange-400/40 animate-pulse">
                <Gavel className="w-3 h-3" />
                Live Auction
              </span>
              {isExtended && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-full bg-amber-500 text-white shadow-xs backdrop-blur-md animate-pulse">
                  <Flame className="w-3 h-3 fill-white" />
                  +60s Anti-Sniping
                </span>
              )}
            </>
          )}
        </div>

        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between">
          <div className="backdrop-blur-md bg-background/90 rounded-full px-2.5 py-1 shadow-xs border border-border/60">
            <AuctionCountdown
              endTime={auction.endTime}
              isExtended={isExtended}
              compact
            />
          </div>

          <div className="backdrop-blur-md bg-background/90 text-foreground text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs border border-border/60">
            {bidsCount} {bidsCount === 1 ? 'bid' : 'bids'}
          </div>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span className="uppercase tracking-wider font-bold text-[10px] text-orange-600 dark:text-orange-400">
              {auction.product.category}
            </span>
            <span className="flex items-center gap-1 font-medium">
              <User className="w-3 h-3 text-muted-foreground" />
              {auction.seller?.name?.split(' ')[0] || 'Senior'}
            </span>
          </div>

          <h3 className="font-bold text-base line-clamp-1 group-hover:text-orange-500 transition-colors">
            {auction.product.title}
          </h3>

          <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
            {auction.product.description}
          </p>
        </div>

        <div className="pt-2 border-t border-border/60 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-muted-foreground block uppercase font-bold tracking-wider">
              {bidsCount > 0 ? "Highest Bid" : "Starting Bid"}
            </span>
            <span className="text-lg font-black font-mono text-orange-600 dark:text-orange-400">
              ₹{auction.currentBid.toFixed(2)}
            </span>
          </div>

          {auction.currentBidder && (
            <div className="text-right">
              <span className="text-[10px] text-muted-foreground block font-medium">Top Bidder</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 justify-end">
                <Trophy className="w-3 h-3 text-amber-500" />
                {auction.currentBidder.name.split(' ')[0]}
              </span>
            </div>
          )}
        </div>

        <div>
          {isEnded ? (
            <Button
              asChild
              className="w-full gap-1.5 px-3 font-bold h-10 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground border border-border/70 cursor-pointer transition-all"
            >
              <Link to={`/dashboard/products/${auction.productId}`} className="min-w-0 justify-center">
                <Gavel className="w-4 h-4 shrink-0" />
                <span>Ended</span>
              </Link>
            </Button>
          ) : (
            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
              <Button
                asChild
                className="min-w-0 gap-1.5 px-3 font-bold h-10 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-md shadow-orange-500/20 cursor-pointer transition-all"
              >
                <Link to={`/dashboard/products/${auction.productId}`} className="min-w-0">
                  <Gavel className="w-4 h-4 shrink-0" />
                  <span className="truncate">Enter Room</span>
                </Link>
              </Button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.dispatchEvent(new CustomEvent('fastBidRequest', {
                    detail: { auction, amount: auction.currentBid + 50 }
                  }));
                }}
                className="inline-flex w-[92px] shrink-0 items-center justify-center gap-1 px-2.5 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 cursor-pointer transition-all"
              >
                <Zap className="w-4 h-4 shrink-0" />
                <span>Fast Bid</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
