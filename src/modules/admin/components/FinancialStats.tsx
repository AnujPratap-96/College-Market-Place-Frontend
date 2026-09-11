import { useState, useEffect } from 'react'
import { fetchFinancialStats } from '../admin.api'
import type { IFinancialStats } from '../admin.types'
import {
  TrendingUp,
  ShieldCheck,
  IndianRupee,
  Wallet,
  ShoppingBag,
  Repeat,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react'

export const FinancialStats = () => {
  const [stats, setStats] = useState<IFinancialStats | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  const loadStats = async () => {
    setLoading(true)
    const res = await fetchFinancialStats()
    if (res.stats) {
      setStats(res.stats)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <RefreshCw className="animate-spin text-primary" size={32} />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="bg-card border rounded-2xl p-8 text-center text-xs text-muted-foreground">
        Unable to load financial analytics.
      </div>
    )
  }

  const statCards = [
    {
      title: 'Gross Marketplace Volume (GMV)',
      value: `₹${stats.totalVolume.toLocaleString()}`,
      subtext: 'Cumulative completed peer-to-peer volume',
      icon: <TrendingUp size={22} className="text-emerald-500" />,
      bg: 'bg-emerald-500/10',
    },
    {
      title: 'Active Escrow Protection',
      value: `₹${stats.totalEscrowHeld.toLocaleString()}`,
      subtext: 'Held safely until student delivery confirmation',
      icon: <ShieldCheck size={22} className="text-blue-500" />,
      bg: 'bg-blue-500/10',
    },
    {
      title: 'Platform Fees Collected',
      value: `₹${stats.totalPlatformFee.toLocaleString()}`,
      subtext: 'Earned via campus platform commission rate',
      icon: <IndianRupee size={22} className="text-purple-500" />,
      bg: 'bg-purple-500/10',
    },
    {
      title: 'Total Student Wallet Holdings',
      value: `₹${stats.totalUserBalances.toLocaleString()}`,
      subtext: 'Combined available balance across student wallets',
      icon: <Wallet size={22} className="text-amber-500" />,
      bg: 'bg-amber-500/10',
    },
  ]

  const countPills = [
    {
      label: 'Completed Orders',
      value: stats.completedOrdersCount,
      icon: <ShoppingBag size={16} className="text-emerald-500" />,
    },
    {
      label: 'Active Subscriptions',
      value: stats.activeSubscriptionsCount,
      icon: <Repeat size={16} className="text-blue-500" />,
    },
    {
      label: 'Active Disputes',
      value: stats.activeDisputesCount,
      icon: <AlertTriangle size={16} className="text-amber-500" />,
    },
  ]

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <h2 className="text-xl font-bold text-foreground">Marketplace Financial Metrics</h2>
          <p className="text-xs text-muted-foreground">
            Real-time double-entry ledger summaries, escrow balances, and platform volume
          </p>
        </div>

        <button
          type="button"
          onClick={loadStats}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg border hover:bg-muted transition"
        >
          <RefreshCw size={14} /> Refresh Analytics
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-card border rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">{card.title}</span>
              <div className={`p-2 rounded-xl ${card.bg}`}>{card.icon}</div>
            </div>
            <div className="text-2xl font-black text-foreground">{card.value}</div>
            <div className="text-[11px] text-muted-foreground leading-tight">{card.subtext}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        {countPills.map((pill, idx) => (
          <div
            key={idx}
            className="bg-card border rounded-2xl p-4 flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-muted">{pill.icon}</div>
              <span className="text-xs font-semibold text-foreground">{pill.label}</span>
            </div>
            <span className="text-lg font-black text-primary font-mono">{pill.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
