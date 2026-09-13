import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Gavel, Plus, Search, Filter, Loader2, Sparkles, Flame } from 'lucide-react';
import { fetchAuctions } from '@/modules/auctions/auction.api';
import type { IAuction } from '@/modules/auctions/auction.types';
import { AuctionCard } from '@/modules/auctions/components/AuctionCard';
import { PlaceBidModal } from '@/modules/auctions/components/PlaceBidModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const CATEGORIES = [
  'ALL',
  'ELECTRONICS',
  'BOOKS',
  'STATIONERY',
  'FURNITURE',
  'CYCLES',
  'APPLIANCES',
  'SPORTS',
  'OTHER',
];

const Auctions = () => {
  const [auctions, setAuctions] = useState<IAuction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [tab, setTab] = useState<'ALL' | 'ACTIVE' | 'EXTENDED' | 'ENDED'>('ALL');
  const [fastBidModalOpen, setFastBidModalOpen] = useState(false);
  const [selectedAuctionForFastBid, setSelectedAuctionForFastBid] = useState<IAuction | null>(null);
  const loadAuctions = async () => {
    setLoading(true);
    const statusFilter = tab === 'ALL' ? undefined : tab;
    const res = await fetchAuctions({
      status: statusFilter,
      category,
      query: search || undefined,
    });
    if (res.auctions) {
      setAuctions(res.auctions);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAuctions();
  }, [category, tab]);

  useEffect(() => {
    const handleFastBidRequest = (event: Event) => {
      const { auction } = (event as CustomEvent<{ auction?: IAuction }>).detail || {};
      if (!auction) return;
      setSelectedAuctionForFastBid(auction);
      setFastBidModalOpen(true);
    };

    window.addEventListener('fastBidRequest', handleFastBidRequest);
    return () => window.removeEventListener('fastBidRequest', handleFastBidRequest);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadAuctions();
  };

  return (
    <div className="space-y-6">
      {/* Live Campus Arena Hero Banner */}
      <div className="relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-transparent p-6 sm:p-8 rounded-3xl border border-orange-500/20 shadow-xs">
        <div className="space-y-2.5 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Live Campus Move-Out Arena
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              <Flame className="w-3 h-3 fill-amber-500" />
              Anti-Sniping Protected
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-foreground leading-tight">
            Senior Move-Out Auctions
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Bid on gear, bicycles, monitors, room coolers, and textbooks from graduating seniors. Powered by real-time WebSockets with automatic +60s anti-sniping protection.
          </p>
        </div>

        <Button
          asChild
          size="lg"
          className="gap-2 shrink-0 h-11 px-5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold shadow-md shadow-orange-500/20 cursor-pointer"
        >
          <Link to="/dashboard/products/create">
            <Plus className="w-4 h-4" />
            Host an Auction
          </Link>
        </Button>

        <div className="absolute right-0 top-0 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 bg-card/85 backdrop-blur-md rounded-2xl border border-border/70 shadow-xs">
        <Tabs value={tab} onValueChange={(val) => setTab(val as any)} className="w-full md:w-auto">
          <TabsList className="grid grid-cols-4 w-full md:w-auto bg-muted/70 p-1 rounded-xl h-10 border border-border/50">
            <TabsTrigger value="ALL" className="text-xs font-semibold rounded-lg">All</TabsTrigger>
            <TabsTrigger value="ACTIVE" className="text-xs font-semibold rounded-lg">Active</TabsTrigger>
            <TabsTrigger value="EXTENDED" className="text-xs font-semibold rounded-lg flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
              Ending Soon
            </TabsTrigger>
            <TabsTrigger value="ENDED" className="text-xs font-semibold rounded-lg">Ended</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2 flex-1 md:max-w-md">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search auctions (cooler, cycle, book)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 rounded-xl bg-background/50 border-border/70 text-xs focus-visible:ring-orange-500"
            />
          </form>

          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[140px] text-xs h-10 rounded-xl bg-background/50 border-border/70">
              <Filter className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat} className="text-xs">
                  {cat === 'ALL' ? 'All Categories' : cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          <span className="text-xs text-muted-foreground font-semibold">Connecting to live campus auction arena...</span>
        </div>
      ) : auctions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-6 bg-card/75 backdrop-blur-md rounded-3xl border border-border/70 text-center max-w-md mx-auto space-y-4">
          <div className="p-4 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
            <Gavel className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-foreground">No Live Auctions Found</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              No auctions match your current search or status filter. Be the first senior to host a move-out auction!
            </p>
          </div>
          <Button asChild className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold">
            <Link to="/dashboard/products/create">Host First Auction</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {auctions.map((auction) => (
            <AuctionCard key={auction.id} auction={auction} />
          ))}
        </div>
      )}

      {selectedAuctionForFastBid && (
        <PlaceBidModal
          isOpen={fastBidModalOpen}
          onClose={() => setFastBidModalOpen(false)}
          auction={selectedAuctionForFastBid}
          onBidSuccess={loadAuctions}
        />
      )}
    </div>
  );
};

export default Auctions;
