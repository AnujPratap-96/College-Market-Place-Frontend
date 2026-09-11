import { Link } from 'react-router-dom';
import { Gavel, Trophy, User, Flame } from 'lucide-react';
import type { IAuction } from '../auction.types';
import { AuctionCountdown } from './AuctionCountdown';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface AuctionCardProps {
  auction: IAuction;
}

export const AuctionCard = ({ auction }: AuctionCardProps) => {
  const bidsCount = auction.bids?.length ?? auction._count?.bids ?? 0;
  const isExtended = auction.status === 'EXTENDED';
  const isEnded = auction.status === 'ENDED' || new Date(auction.endTime).getTime() <= Date.now();

  return (
    <div className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col">
      <div className="relative aspect-4/3 overflow-hidden bg-muted/40">
        {auction.product.imageUrl ? (
          <img
            src={auction.product.imageUrl}
            alt={auction.product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <Gavel className="w-12 h-12 stroke-[1.5]" />
          </div>
        )}

        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <Badge className="bg-primary/95 text-primary-foreground backdrop-blur-md shadow-sm font-semibold flex items-center gap-1 text-[11px]">
            <Gavel className="w-3 h-3" />
            Live Auction
          </Badge>
          {isExtended && (
            <Badge className="bg-amber-500 text-white font-semibold flex items-center gap-1 text-[11px] animate-pulse">
              <Flame className="w-3 h-3 fill-white" />
              Extended
            </Badge>
          )}
        </div>

        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between">
          <div className="backdrop-blur-md bg-background/90 rounded-full px-2 py-0.5 shadow-sm border border-border/50">
            <AuctionCountdown
              endTime={auction.endTime}
              isExtended={isExtended}
              compact
            />
          </div>

          <div className="backdrop-blur-md bg-background/90 text-foreground text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm border border-border/50">
            {bidsCount} {bidsCount === 1 ? 'bid' : 'bids'}
          </div>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span className="uppercase tracking-wider font-semibold text-[10px] text-primary">
              {auction.product.category}
            </span>
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {auction.seller?.name?.split(' ')[0] || 'Senior'}
            </span>
          </div>

          <h3 className="font-semibold text-base line-clamp-1 group-hover:text-primary transition-colors">
            {auction.product.title}
          </h3>

          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
            {auction.product.description}
          </p>
        </div>

        <div className="pt-2 border-t border-border flex items-center justify-between">
          <div>
            <span className="text-[10px] text-muted-foreground block uppercase font-medium">
              Current Highest Bid
            </span>
            <span className="text-lg font-bold font-mono text-foreground">
              ₹{auction.currentBid.toFixed(2)}
            </span>
          </div>

          {auction.currentBidder && (
            <div className="text-right">
              <span className="text-[10px] text-muted-foreground block">Leader</span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Trophy className="w-3 h-3" />
                {auction.currentBidder.name.split(' ')[0]}
              </span>
            </div>
          )}
        </div>

        <Button
          asChild
          className="w-full gap-1.5 font-semibold mt-1"
          variant={isEnded ? 'secondary' : 'default'}
        >
          <Link to={`/dashboard/products/${auction.productId}`}>
            <Gavel className="w-4 h-4" />
            {isEnded ? 'View Result' : 'Enter Auction Room'}
          </Link>
        </Button>
      </div>
    </div>
  );
};
