import { useState, useEffect } from 'react'
import { fetchDisputes, resolveDispute } from '../admin.api'
import type { IDisputedOrder } from '../admin.types'
import { toast } from '@/components/ui/toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  Undo2,
  Send,
  User,
  Package,
  Calendar,
} from 'lucide-react'

export const DisputeArbitrationQueue = () => {
  const [disputes, setDisputes] = useState<IDisputedOrder[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedOrder, setSelectedOrder] = useState<IDisputedOrder | null>(null)
  const [actionType, setActionType] = useState<'REFUND_BUYER' | 'RELEASE_SELLER' | null>(null)
  const [resolutionNote, setResolutionNote] = useState<string>('')
  const [submitting, setSubmitting] = useState<boolean>(false)

  const loadDisputes = async () => {
    setLoading(true)
    const res = await fetchDisputes()
    if (res.disputes) {
      setDisputes(res.disputes)
    } else if (res.error) {
      toast.error(res.error)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadDisputes()
  }, [])

  const openArbitrateModal = (order: IDisputedOrder, action: 'REFUND_BUYER' | 'RELEASE_SELLER') => {
    setSelectedOrder(order)
    setActionType(action)
    setResolutionNote(
      action === 'REFUND_BUYER'
        ? 'Buyer claimed product/service was not delivered as promised. Approved full refund from escrow.'
        : 'Seller provided satisfactory fulfillment proof. Escrow funds released to seller.'
    )
  }

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOrder || !actionType) return

    setSubmitting(true)

    const res = await resolveDispute(selectedOrder.id, actionType, resolutionNote)
    if (res.success) {
      toast.success(
        `Order #${selectedOrder.orderNumber} resolved with decision: ${actionType.replace('_', ' ')}`
      )
      setSelectedOrder(null)
      setActionType(null)
      loadDisputes()
    } else if (res.error) {
      toast.error(res.error)
    }
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <RefreshCw className="animate-spin text-primary" size={32} />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Escrow Dispute Arbitration</h2>
            <p className="text-xs text-muted-foreground">
              Review and arbitrate contested funds held in campus marketplace escrow
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadDisputes}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg border hover:bg-muted transition"
        >
          <RefreshCw size={14} /> Refresh Queue ({disputes.length})
        </button>
      </div>

      {disputes.length === 0 ? (
        <div className="bg-card border rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 size={28} />
          </div>
          <h3 className="text-base font-bold text-foreground">No Pending Disputes</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            All campus transactions, rentals, and services are running smoothly with no active escrow claims.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {disputes.map((order) => (
            <div
              key={order.id}
              className="bg-card border border-amber-300/40 dark:border-amber-700/40 rounded-2xl p-5 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2.5 py-1 rounded-md">
                    #{order.orderNumber}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {order.orderType}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar size={13} />
                  Disputed: {new Date(order.disputedAt || order.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <div className="text-[11px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                    <Package size={13} /> Listing Item
                  </div>
                  <div className="font-semibold text-sm text-foreground">
                    {order.product?.title || 'Product Item'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Item Price: ₹{order.price} | Total Escrow: ₹{order.totalAmount}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                    <User size={13} /> Buyer (Claims Refund)
                  </div>
                  <div className="font-semibold text-sm text-foreground">
                    {order.buyer?.name || 'Buyer Student'}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">
                    {order.buyer?.email} | {order.buyer?.college}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                    <User size={13} /> Seller / Provider
                  </div>
                  <div className="font-semibold text-sm text-foreground">
                    {order.seller?.name || 'Seller Student'}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">
                    {order.seller?.email} | {order.seller?.college}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs">
                <span className="font-bold text-amber-900 dark:text-amber-200">Dispute Reason: </span>
                <span className="text-amber-800 dark:text-amber-300">
                  {order.disputeReason || 'Buyer requested arbitration due to fulfillment issue.'}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => openArbitrateModal(order, 'REFUND_BUYER')}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <Undo2 size={14} /> Refund Buyer (₹{order.totalAmount})
                </button>

                <button
                  type="button"
                  onClick={() => openArbitrateModal(order, 'RELEASE_SELLER')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <Send size={14} /> Release to Seller
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedOrder && actionType && (
        <Dialog open={Boolean(selectedOrder)} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle
                  className={actionType === 'REFUND_BUYER' ? 'text-rose-500' : 'text-emerald-500'}
                  size={20}
                />
                Confirm Arbitration: {actionType === 'REFUND_BUYER' ? 'Refund Buyer' : 'Release to Seller'}
              </DialogTitle>
              <DialogDescription>
                Order #{selectedOrder.orderNumber} ({selectedOrder.product?.title})
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleResolve} className="space-y-4 pt-2">
              <div className="p-3.5 rounded-xl border bg-muted/30 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Escrow Amount:</span>
                  <span className="font-bold text-foreground">₹{selectedOrder.totalAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Beneficiary:</span>
                  <span className="font-bold text-foreground">
                    {actionType === 'REFUND_BUYER' ? selectedOrder.buyer?.name : selectedOrder.seller?.name}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground block">
                  Official Arbitration Note (Shared with both parties)
                </label>
                <textarea
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  rows={3}
                  className="w-full p-3 rounded-xl border bg-background text-xs focus:ring-2 focus:ring-primary outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 rounded-xl border text-xs font-medium hover:bg-muted transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-5 py-2 rounded-xl text-white text-xs font-bold transition flex items-center gap-1.5 ${
                    actionType === 'REFUND_BUYER' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                  } disabled:opacity-50`}
                >
                  {submitting ? <RefreshCw className="animate-spin" size={14} /> : null}
                  Confirm & Execute Decision
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
