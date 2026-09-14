import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  HelpCircle,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Loader2,
  Inbox,
  Send,
  Sparkles,
  MapPin,
  Calendar,
  IndianRupee,
} from 'lucide-react';
import type { RootState } from '@/store/store';
import type { IWantedRequest, IWantedOffer } from '@/modules/wanted/wanted.types';
import {
  fetchWantedRequests,
  fetchMyWantedRequests,
  fetchMyWantedOffers,
} from '@/modules/wanted/wanted.api';
import { WantedCard } from '@/modules/wanted/components/WantedCard';
import { CreateWantedModal } from '@/modules/wanted/components/CreateWantedModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const CATEGORIES = [
  'ALL',
  'Electronics',
  'Books',
  'Lab Equipment',
  'Furniture',
  'Cycle & Mobility',
  'Clothing',
  'Other',
];

export const WantedBoard: React.FC = () => {
  const currentUser = useSelector((state: RootState) => state.user);
  const [activeTab, setActiveTab] = useState<'ALL' | 'MY_REQUESTS' | 'MY_OFFERS'>('ALL');
  const [requests, setRequests] = useState<IWantedRequest[]>([]);
  const [myRequests, setMyRequests] = useState<IWantedRequest[]>([]);
  const [myOffers, setMyOffers] = useState<IWantedOffer[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'ALL') {
        const res = await fetchWantedRequests({
          category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
          search: searchQuery.trim() || undefined,
        });
        setRequests(res.requests || []);
      } else if (activeTab === 'MY_REQUESTS') {
        const res = await fetchMyWantedRequests();
        setMyRequests(res || []);
      } else if (activeTab === 'MY_OFFERS') {
        const res = await fetchMyWantedOffers();
        setMyOffers(res || []);
      }
    } catch (err) {
      console.error('Failed to load wanted data:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedCategory, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight flex items-center gap-2">
            <HelpCircle className="w-8 h-8 text-orange-500" />
            Campus Wanted Board
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Can't find what you need? Announce it here or pitch items directly to student requests.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="h-10 rounded-xl"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </Button>

          <Button
            onClick={() => setCreateModalOpen(true)}
            className="h-10 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs gap-1.5 px-4 shadow-md shadow-orange-500/20"
          >
            <Plus size={16} />
            Post Wanted Request
          </Button>
        </div>
      </div>

      <div className="flex border-b border-border/80 gap-1 sm:gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('ALL')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'ALL'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sparkles size={14} />
          All Requests
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('MY_REQUESTS')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'MY_REQUESTS'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Inbox size={14} />
          My Requests
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('MY_OFFERS')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'MY_OFFERS'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Send size={14} />
          My Pitched Offers
        </button>
      </div>

      {activeTab === 'ALL' && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder="Search requests (e.g. calculator, lab coat, cycle, textbook)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 pl-10 rounded-xl bg-card border-border/70 text-xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <Filter size={13} className="text-muted-foreground shrink-0 ml-1 mr-1" />
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-muted/40 text-muted-foreground hover:text-foreground border border-border/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
          <Loader2 size={32} className="animate-spin text-primary" />
          <p className="text-xs font-semibold">Loading campus wanted board...</p>
        </div>
      ) : activeTab === 'ALL' ? (
        requests.length === 0 ? (
          <div className="text-center py-16 px-4 bg-muted/20 border border-border/60 rounded-3xl space-y-3">
            <HelpCircle className="mx-auto text-muted-foreground/30" size={42} />
            <h3 className="text-base font-bold text-foreground">No Requests Found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              No campus requests match your current filters. Be the first to broadcast what you're looking for!
            </p>
            <Button
              onClick={() => setCreateModalOpen(true)}
              className="mt-2 rounded-xl text-xs font-bold"
            >
              Post First Request
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests.map((req) => (
              <WantedCard
                key={req.id}
                request={req}
                currentUserId={currentUser.id}
                onRefresh={loadData}
              />
            ))}
          </div>
        )
      ) : activeTab === 'MY_REQUESTS' ? (
        myRequests.length === 0 ? (
          <div className="text-center py-16 px-4 bg-muted/20 border border-border/60 rounded-3xl space-y-3">
            <Inbox className="mx-auto text-muted-foreground/30" size={42} />
            <h3 className="text-base font-bold text-foreground">You Haven't Posted Any Requests</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Broadcast items you need for your courses, hostel, or exams to your fellow students.
            </p>
            <Button
              onClick={() => setCreateModalOpen(true)}
              className="mt-2 rounded-xl text-xs font-bold"
            >
              Post a Request
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myRequests.map((req) => (
              <WantedCard
                key={req.id}
                request={req}
                currentUserId={currentUser.id}
                onRefresh={loadData}
              />
            ))}
          </div>
        )
      ) : myOffers.length === 0 ? (
        <div className="text-center py-16 px-4 bg-muted/20 border border-border/60 rounded-3xl space-y-3">
          <Send className="mx-auto text-muted-foreground/30" size={42} />
          <h3 className="text-base font-bold text-foreground">No Offers Pitched Yet</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Browse campus requests and pitch items you're willing to sell or lend to earn extra cash.
          </p>
          <Button
            onClick={() => setActiveTab('ALL')}
            variant="outline"
            className="mt-2 rounded-xl text-xs font-bold"
          >
            Browse Open Requests
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {myOffers.map((offer) => (
            <div
              key={offer.id}
              className="p-4 bg-card border border-border/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-border transition-all"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-foreground">
                    Pitch for "{offer.request?.title || 'Wanted Item'}"
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      offer.status === 'ACCEPTED'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : offer.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}
                  >
                    {offer.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="font-black text-emerald-600 dark:text-emerald-400 flex items-center">
                    Asking: <IndianRupee size={12} className="inline ml-1" />
                    {offer.amount.toFixed(2)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={11} className="text-orange-500" />
                    {offer.pickupLocation}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={11} className="text-primary" />
                    {new Date(offer.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {offer.message && (
                  <p className="text-xs text-muted-foreground italic">
                    "{offer.message}"
                  </p>
                )}
              </div>

              {offer.status === 'ACCEPTED' && (
                <div className="shrink-0">
                  <span className="px-3 py-1 text-xs font-bold bg-emerald-600 text-white rounded-xl shadow-xs">
                    Order Created (Check Orders)
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <CreateWantedModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
};

export default WantedBoard;
