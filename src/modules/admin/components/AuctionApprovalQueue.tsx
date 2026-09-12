import { useState, useEffect } from 'react'
import { fetchPendingAuctions, approveAuction, rejectAuction } from '../admin.api'
import { toast } from '@/components/ui/toast'
import {
  Gavel,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  User,
  ExternalLink,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export const AuctionApprovalQueue = () => {
  const [auctions, setAuctions] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [selectedDuration, setSelectedDuration] = useState<Record<string, number>>({})
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({})
  const [showRejectInput, setShowRejectInput] = useState<Record<string, boolean>>({})

  const loadPendingAuctions = async () => {
    setLoading(true)
    const res = await fetchPendingAuctions()
    if (res.auctions) {
      setAuctions(res.auctions)
    } else if (res.error) {
      toast.error(res.error)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadPendingAuctions()
  }, [])

  const handleApprove = async (auctionId: string) => {
    setProcessingId(auctionId)
    const duration = selectedDuration[auctionId] || 24
    const res = await approveAuction(auctionId, duration)
    if (res.success) {
      toast.success(`Auction approved and live for ${duration} hours!`)
      loadPendingAuctions()
    } else {
      toast.error(res.error || 'Failed to approve auction')
    }
    setProcessingId(null)
  }

  const handleReject = async (auctionId: string) => {
    setProcessingId(auctionId)
    const reason = rejectReason[auctionId]?.trim()
    const res = await rejectAuction(auctionId, reason)
    if (res.success) {
      toast.success('Auction rejected and seller notified.')
      loadPendingAuctions()
    } else {
      toast.error(res.error || 'Failed to reject auction')
    }
    setProcessingId(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <RefreshCw className="animate-spin text-primary" size={32} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
            <Gavel className="text-orange-500" size={22} />
            Auction Moderation Queue
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Review student-submitted live auctions to prevent spam, joke items, and price gouging.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadPendingAuctions}
          disabled={loading}
          className="gap-2 text-xs"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </Button>
      </div>

      {auctions.length === 0 ? (
        <div className="border border-dashed border-border rounded-2xl p-12 text-center space-y-3 bg-muted/20">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <ShieldCheck size={24} />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Auction Queue Clean</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            No live auctions currently waiting for admin moderation. New student listings will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {auctions.map((auction) => {
            const isProcessing = processingId === auction.id
            const duration = selectedDuration[auction.id] || 24
            const isRejecting = showRejectInput[auction.id]

            return (
              <div
                key={auction.id}
                className="bg-card border border-border rounded-2xl p-5 shadow-xs flex flex-col md:flex-row gap-5 items-start justify-between"
              >
                <div className="flex gap-4 items-start flex-1">
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-muted shrink-0 border border-border">
                    {auction.product?.imageUrl ? (
                      <img
                        src={auction.product.imageUrl}
                        alt={auction.product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                        No Photo
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm text-foreground truncate">
                        {auction.product?.title}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300">
                        {auction.product?.category || 'AUCTION'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        ⏳ Awaiting Approval
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {auction.product?.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs pt-1 flex-wrap">
                      <span className="font-medium text-foreground flex items-center gap-1">
                        Starting Bid: <span className="text-primary font-bold">₹{auction.startingBid}</span>
                      </span>
                      {auction.reservePrice && (
                        <span className="text-muted-foreground">
                          Reserve: ₹{auction.reservePrice}
                        </span>
                      )}
                      <span className="text-muted-foreground">
                        Min Increment: ₹{auction.minIncrement || 50}
                      </span>
                    </div>

                    {auction.seller && (
                      <div className="flex items-center gap-2 pt-1 text-[11px] text-muted-foreground">
                        <User size={12} />
                        <span>Seller: {auction.seller.name} ({auction.seller.college || 'Student'} • {auction.seller.branch || ''})</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 w-full md:w-56">
                  <div className="flex items-center gap-2 text-xs bg-muted/40 p-2 rounded-lg border border-border">
                    <Clock size={14} className="text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground text-[11px]">Duration:</span>
                    <select
                      value={duration}
                      onChange={(e) =>
                        setSelectedDuration({
                          ...selectedDuration,
                          [auction.id]: Number(e.target.value),
                        })
                      }
                      className="bg-transparent text-foreground text-xs font-semibold focus:outline-none cursor-pointer"
                    >
                      <option value={12}>12 Hours</option>
                      <option value={24}>24 Hours (1 Day)</option>
                      <option value={48}>48 Hours (2 Days)</option>
                      <option value={72}>72 Hours (3 Days)</option>
                    </select>
                  </div>

                  <Button
                    size="sm"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs gap-1.5"
                    disabled={isProcessing}
                    onClick={() => handleApprove(auction.id)}
                  >
                    <CheckCircle2 size={14} />
                    Approve & Launch
                  </Button>

                  {!isRejecting ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-rose-600 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-xs gap-1.5"
                      disabled={isProcessing}
                      onClick={() =>
                        setShowRejectInput({ ...showRejectInput, [auction.id]: true })
                      }
                    >
                      <XCircle size={14} />
                      Reject Listing
                    </Button>
                  ) : (
                    <div className="space-y-1.5 pt-1">
                      <input
                        type="text"
                        placeholder="Rejection reason..."
                        value={rejectReason[auction.id] || ''}
                        onChange={(e) =>
                          setRejectReason({ ...rejectReason, [auction.id]: e.target.value })
                        }
                        className="w-full px-2 py-1 text-xs border rounded-md bg-background"
                      />
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="destructive"
                          className="flex-1 text-[11px] h-7"
                          disabled={isProcessing}
                          onClick={() => handleReject(auction.id)}
                        >
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-[11px] h-7"
                          onClick={() =>
                            setShowRejectInput({ ...showRejectInput, [auction.id]: false })
                          }
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  <Button variant="ghost" size="sm" asChild className="text-[11px] h-7 gap-1 text-muted-foreground">
                    <Link to={`/dashboard/products/${auction.productId}`} target="_blank">
                      <ExternalLink size={12} />
                      Inspect Listing
                    </Link>
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
