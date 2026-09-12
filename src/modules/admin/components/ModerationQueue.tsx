import { useState, useEffect } from 'react'
import { fetchReports, handleReportAction } from '../admin.api'
import type { IReportItem } from '../admin.types'
import { toast } from '@/components/ui/toast'
import {
  ShieldAlert,
  RefreshCw,
  CheckCircle2,
  Trash2,
  EyeOff,
  Eye,
  Check,
  Package,
} from 'lucide-react'

export const ModerationQueue = () => {
  const [reports, setReports] = useState<IReportItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  const loadReports = async () => {
    setLoading(true)
    const res = await fetchReports()
    if (res.reports) {
      setReports(res.reports)
    } else if (res.error) {
      toast.error(res.error)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadReports()
  }, [])

  const executeAction = async (
    reportId: string,
    action: 'DISMISS' | 'FLAG_PRODUCT' | 'UNFLAG_PRODUCT' | 'DELETE_PRODUCT'
  ) => {
    setProcessingId(reportId)

    const res = await handleReportAction(reportId, action)
    if (res.success) {
      toast.success(res.message || 'Report action completed successfully.')
      loadReports()
    } else if (res.error) {
      toast.error(res.error)
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
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Listing Content Moderation</h2>
            <p className="text-xs text-muted-foreground">
              Review flagged campus listings and student safety reports
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadReports}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg border hover:bg-muted transition"
        >
          <RefreshCw size={14} /> Refresh Reports ({reports.length})
        </button>
      </div>

      {reports.length === 0 ? (
        <div className="bg-card border rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 size={28} />
          </div>
          <h3 className="text-base font-bold text-foreground">No Flagged Reports</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Campus listing catalog is clean. All active products satisfy student community guidelines.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-card border rounded-2xl p-5 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/50 dark:text-rose-400 px-2.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
                    {report.reason}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    Status: {report.status}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Reported: {new Date(report.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-[11px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                    <Package size={13} /> Product Listing
                  </div>
                  <div className="font-semibold text-sm text-foreground">
                    {report.product?.title || 'Unknown Product'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Price: ₹{report.product?.price || 0} | Flagged:{' '}
                    {report.product?.isFlagged ? 'Yes (Hidden)' : 'No'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Seller: {report.product?.owner?.name} ({report.product?.owner?.college})
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] uppercase font-bold text-muted-foreground">
                    Reporter Details & Details
                  </div>
                  <div className="text-xs text-foreground font-semibold">
                    {report.reporter?.name} ({report.reporter?.college})
                  </div>
                  <div className="text-xs text-muted-foreground italic bg-muted/30 p-2.5 rounded-lg border">
                    "{report.details || 'No additional details provided by reporter.'}"
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  disabled={processingId === report.id}
                  onClick={() => executeAction(report.id, 'DISMISS')}
                  className="px-3.5 py-1.5 rounded-xl border text-xs font-semibold hover:bg-muted transition flex items-center gap-1"
                >
                  <Check size={13} /> Dismiss Report
                </button>

                {report.product?.isFlagged ? (
                  <button
                    type="button"
                    disabled={processingId === report.id}
                    onClick={() => executeAction(report.id, 'UNFLAG_PRODUCT')}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 text-xs font-semibold transition flex items-center gap-1 border border-blue-200 dark:border-blue-800"
                  >
                    <Eye size={13} /> Unflag & Restore
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={processingId === report.id}
                    onClick={() => executeAction(report.id, 'FLAG_PRODUCT')}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300 text-xs font-semibold transition flex items-center gap-1 border border-amber-200 dark:border-amber-800"
                  >
                    <EyeOff size={13} /> Flag & Hide Product
                  </button>
                )}

                <button
                  type="button"
                  disabled={processingId === report.id}
                  onClick={() => {
                    if (confirm('Permanently remove this product from the database?')) {
                      executeAction(report.id, 'DELETE_PRODUCT')
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition flex items-center gap-1"
                >
                  <Trash2 size={13} /> Delete Listing
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
