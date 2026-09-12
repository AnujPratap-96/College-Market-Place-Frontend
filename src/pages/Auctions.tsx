import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Gavel, Plus, Search, Filter, Loader2, Sparkles, Flame } from 'lucide-react';
import { fetchAuctions } from '@/modules/auctions/auction.api';
import type { IAuction } from '@/modules/auctions/auction.types';
import { AuctionCard } from '@/modules/auctions/components/AuctionCard';
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadAuctions();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-3xl border border-primary/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Live Campus Arena
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Senior Move-Out Auctions
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl">
            Bid on premium cycles, monitors, mini-fridges, and gear from graduating seniors. Powered by real-time WebSockets with anti-sniping protection.
          </p>
        </div>

        <Button asChild size="lg" className="gap-2 shrink-0 rounded-xl shadow-md">
          <Link to="/dashboard/products/create">
            <Plus className="w-4 h-4" />
            Host an Auction
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <Tabs value={tab} onValueChange={(val) => setTab(val as any)} className="w-full md:w-auto">
          <TabsList className="grid grid-cols-4 w-full md:w-auto">
            <TabsTrigger value="ALL" className="text-xs">All</TabsTrigger>
            <TabsTrigger value="ACTIVE" className="text-xs">Active</TabsTrigger>
            <TabsTrigger value="EXTENDED" className="text-xs flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-500" />
              Ending Soon
            </TabsTrigger>
            <TabsTrigger value="ENDED" className="text-xs">Completed</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2 flex-1 md:max-w-md">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search auctions (e.g., monitor, cycle)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs h-9"
            />
          </form>

          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[140px] text-xs h-9">
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

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-xs text-muted-foreground font-medium">Loading live campus auctions...</span>
        </div>
      ) : auctions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 border border-dashed rounded-3xl text-center max-w-md mx-auto space-y-4">
          <div className="p-4 rounded-full bg-primary/10 text-primary">
            <Gavel className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">No Auctions Found</h3>
            <p className="text-xs text-muted-foreground">
              {tab === 'EXTENDED'
                ? 'No auctions are currently in anti-sniping extension.'
                : 'There are currently no active auctions matching your filters. Be the first to host one!'}
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/dashboard/create-listing">
              Create Auction Listing
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {auctions.map((auction) => (
            <AuctionCard key={auction.id} auction={auction} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Auctions;
