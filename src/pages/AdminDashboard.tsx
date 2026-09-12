import { useState } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store/store'
import { Link } from 'react-router-dom'
import { SettingsManager } from '@/modules/admin/components/SettingsManager'
import { DisputeArbitrationQueue } from '@/modules/admin/components/DisputeArbitrationQueue'
import { ModerationQueue } from '@/modules/admin/components/ModerationQueue'
import { FinancialStats } from '@/modules/admin/components/FinancialStats'
import { AuctionApprovalQueue } from '@/modules/admin/components/AuctionApprovalQueue'
import {
  ShieldAlert,
  Sliders,
  AlertTriangle,
  FileCheck,
  TrendingUp,
  ArrowLeft,
  Lock,
  Gavel,
} from 'lucide-react'

export const AdminDashboard = () => {
  const user = useSelector((state: RootState) => state.user)
  const [activeTab, setActiveTab] = useState<'settings' | 'disputes' | 'moderation' | 'financial' | 'auctions'>(
    'settings'
  )

  if (user.isLoggedIn && user.role !== 'ADMIN') {
    return (
      <div className="max-w-xl mx-auto my-16 bg-card border border-rose-300 dark:border-rose-800 rounded-3xl p-8 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400 flex items-center justify-center mx-auto">
          <Lock size={32} />
        </div>
        <h2 className="text-xl font-bold text-foreground">Administrator Access Required</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          The Admin Control Center is restricted to designated campus marketplace staff and administrators.
          Your account ({user.email}) currently holds the student role.
        </p>
        <div className="pt-2">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition"
          >
            <ArrowLeft size={14} /> Return to Campus Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const tabs = [
    {
      id: 'settings',
      label: 'Platform Settings & Commission',
      icon: <Sliders size={16} />,
    },
    {
      id: 'disputes',
      label: 'Escrow Disputes',
      icon: <AlertTriangle size={16} />,
    },
    {
      id: 'moderation',
      label: 'Listing Moderation',
      icon: <FileCheck size={16} />,
    },
    {
      id: 'financial',
      label: 'Financial Metrics',
      icon: <TrendingUp size={16} />,
    },
    {
      id: 'auctions',
      label: 'Auction Approvals',
      icon: <Gavel size={16} />,
    },
  ] as const

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary">
            <ShieldAlert size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">
              Admin Control Center
            </h1>
            <p className="text-xs text-muted-foreground">
              Dynamic marketplace governance, zero/custom commission management, and dispute arbitration
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live System Active
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="pt-2">
        {activeTab === 'settings' && <SettingsManager />}
        {activeTab === 'disputes' && <DisputeArbitrationQueue />}
        {activeTab === 'moderation' && <ModerationQueue />}
        {activeTab === 'financial' && <FinancialStats />}
        {activeTab === 'auctions' && <AuctionApprovalQueue />}
      </div>
    </div>
  )
}

export default AdminDashboard
