import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  IndianRupee,
  MapPin,
  Tag,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Send,
  Loader2,
} from 'lucide-react';
import type { IWantedRequest, IWantedOffer } from '../wanted.types';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TrustScoreBadge } from '@/modules/reviews/components/TrustScoreBadge';
import { MakeOfferModal } from './MakeOfferModal';
import { acceptWantedOffer, cancelWantedRequest } from '../wanted.api';
import { toast } from '@/components/ui/toast';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/store/store';
import { loadWallet } from '@/store/walletSlice';
import { isAxiosError } from 'axios';

interface WantedCardProps {
  request: IWantedRequest;
  currentUserId?: string;
  onRefresh: () => void;
}

export const WantedCard: React.FC<WantedCardProps> = ({
  request,
  currentUserId,
  onRefresh,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [showOffers, setShowOffers] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const isOwner = currentUserId === request.requesterId;
  const isExpired = new Date(request.neededBy) < new Date();
  const offerCount = request._count?.offers ?? request.offers?.length ?? 0;

  const handleAcceptOffer = async (offerId: string) => {
    setActionLoading(true);
    try {
      await acceptWantedOffer(offerId);
      dispatch(loadWallet());
      toast.success('Offer accepted! Escrow held securely for campus handover.');
      onRefresh();
      navigate('/dashboard/orders');
    } catch (err: unknown) {
      const msg = isAxiosError(err)
        ? err.response?.data?.message || err.response?.data?.error || err.message
        : err instanceof Error
        ? err.message
        : 'Failed to accept offer';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!confirm('Are you sure you want to cancel this wanted request?')) return;
    setActionLoading(true);
    try {
      await cancelWantedRequest(request.id);
      toast.success('Wanted request cancelled.');
      onRefresh();
    } catch (err: unknown) {
      const msg = isAxiosError(err)
        ? err.response?.data?.message || err.response?.data?.error || err.message
        : err instanceof Error
        ? err.message
        : 'Failed to cancel request';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (request.status === 'FULFILLED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 size={12} />
          Fulfilled
        </span>
      );
    }
    if (request.status === 'IN_PROGRESS') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
          <Clock size={12} />
          Escrow Handshake
        </span>
      );
    }
    if (request.status === 'CANCELLED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
          <XCircle size={12} />
          Cancelled
        </span>
      );
    }
    if (isExpired) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
          <AlertCircle size={12} />
          Expired
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800 animate-pulse">
        Open for Offers
      </span>
    );
  };

  const formattedDate = new Date(request.neededBy).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <>
      <div className="bg-card border border-border/80 rounded-2xl p-5 space-y-4 hover:border-border transition-all shadow-xs">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border border-border/80">
              <AvatarImage src={request.requester?.profileImage} />
              <AvatarFallback className="bg-orange-500/10 text-orange-600 font-bold text-xs">
                {request.requester?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-foreground">
                  {request.requester?.name || 'Student'}
                </span>
                <TrustScoreBadge size="sm" score={request.requester?.trustScore || 4.7} />
              </div>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <MapPin size={11} className="text-orange-500" />
                {request.requester?.college || 'Campus Peer'}
                {request.requester?.branch && ` • ${request.requester.branch}`}
              </p>
            </div>
          </div>

          <div className="shrink-0">{getStatusBadge()}</div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary/10 text-primary uppercase">
              {request.category}
            </span>
            <h3 className="font-bold text-base text-foreground leading-snug">
              {request.title}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {request.description}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/60">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1 font-bold text-foreground">
              <span className="text-muted-foreground font-normal">Max Budget:</span>
              <IndianRupee size={13} className="text-emerald-600" />
              <span>{request.budget.toFixed(2)}</span>
            </div>

            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar size={13} className="text-orange-500" />
              <span>Needed: {formattedDate}</span>
            </div>

            <div className="flex items-center gap-1 font-semibold text-muted-foreground">
              <Tag size={13} className="text-primary" />
              <span>{offerCount} {offerCount === 1 ? 'offer' : 'offers'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isOwner && request.status === 'OPEN' && !isExpired && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    navigate('/dashboard/messages', {
                      state: { userId: request.requesterId },
                    })
                  }
                  className="h-8 text-xs rounded-xl gap-1"
                >
                  <MessageSquare size={13} />
                  Chat
                </Button>
                <Button
                  size="sm"
                  onClick={() => setOfferModalOpen(true)}
                  className="h-8 text-xs rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold gap-1 shadow-xs"
                >
                  <Send size={13} />
                  Pitch Item
                </Button>
              </>
            )}

            {isOwner && (
              <>
                {offerCount > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowOffers((prev) => !prev)}
                    className="h-8 text-xs rounded-xl gap-1 font-semibold"
                  >
                    {showOffers ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    {showOffers ? 'Hide Offers' : `Review Offers (${offerCount})`}
                  </Button>
                )}
                {request.status === 'OPEN' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCancelRequest}
                    disabled={actionLoading}
                    className="h-8 text-xs rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  >
                    Cancel
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {isOwner && showOffers && request.offers && request.offers.length > 0 && (
          <div className="space-y-2.5 pt-3 border-t border-border/80">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-500" />
              Offers Pitched by Campus Peers
            </h4>

            <div className="space-y-2">
              {request.offers.map((offer: IWantedOffer) => (
                <div
                  key={offer.id}
                  className="p-3 bg-muted/30 border border-border/70 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">
                        {offer.offerer?.name || 'Student'}
                      </span>
                      <TrustScoreBadge size="sm" score={offer.offerer?.trustScore || 4.8} />
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(offer.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="font-black text-emerald-600 dark:text-emerald-400 flex items-center">
                        <IndianRupee size={12} className="inline" />
                        {offer.amount.toFixed(2)}
                      </span>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <MapPin size={11} className="text-orange-500" />
                        {offer.pickupLocation}
                      </span>
                    </div>

                    {offer.message && (
                      <p className="text-[11px] text-muted-foreground italic">
                        "{offer.message}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        navigate('/dashboard/messages', {
                          state: { userId: offer.offererId },
                        })
                      }
                      className="h-8 text-xs rounded-xl"
                    >
                      <MessageSquare size={13} className="mr-1" />
                      Chat
                    </Button>

                    {request.status === 'OPEN' && offer.status === 'PENDING' && (
                      <Button
                        size="sm"
                        disabled={actionLoading}
                        onClick={() => handleAcceptOffer(offer.id)}
                        className="h-8 text-xs rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold shadow-xs"
                      >
                        {actionLoading && <Loader2 size={12} className="mr-1 animate-spin" />}
                        Accept & Lock Escrow
                      </Button>
                    )}

                    {offer.status === 'ACCEPTED' && (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 size={13} />
                        Accepted
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <MakeOfferModal
        isOpen={offerModalOpen}
        onClose={() => setOfferModalOpen(false)}
        request={request}
        onSuccess={onRefresh}
      />
    </>
  );
};
