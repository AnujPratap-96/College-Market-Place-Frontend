import { useState, useEffect } from 'react'
import { fetchAdminSettings, updateAdminSettings } from '../admin.api'
import type { ISystemSettings } from '../admin.types'
import { Sliders, CheckCircle2, AlertCircle, RefreshCw, ShieldCheck, Zap } from 'lucide-react'

export const SettingsManager = () => {
  const [settings, setSettings] = useState<ISystemSettings>({
    platform_commission_percent: '0',
    min_withdrawal_amount: '100',
    payout_gateway_mode: 'SANDBOX',
    auto_complete_days: '3',
  })
  const [loading, setLoading] = useState<boolean>(true)
  const [saving, setSaving] = useState<boolean>(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const loadSettings = async () => {
    setLoading(true)
    setMessage(null)
    const res = await fetchAdminSettings()
    if (res.settings) {
      setSettings(res.settings)
    } else if (res.error) {
      setMessage({ type: 'error', text: res.error })
    }
    setLoading(false)
  }

  useEffect(() => {
    loadSettings()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    const res = await updateAdminSettings({
      platform_commission_percent: settings.platform_commission_percent,
      min_withdrawal_amount: settings.min_withdrawal_amount,
      payout_gateway_mode: settings.payout_gateway_mode,
      auto_complete_days: settings.auto_complete_days,
    })

    if (res.settings) {
      setSettings(res.settings)
      setMessage({ type: 'success', text: 'Platform settings and commission rates saved successfully.' })
    } else if (res.error) {
      setMessage({ type: 'error', text: res.error })
    }
    setSaving(false)
  }

  const commissionNum = parseFloat(settings.platform_commission_percent) || 0

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <RefreshCw className="animate-spin text-primary" size={32} />
      </div>
    )
  }

  return (
    <div className="bg-card border rounded-2xl p-6 shadow-sm max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <Sliders size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Platform Governance & Commission</h2>
            <p className="text-xs text-muted-foreground">Configure marketplace fee structures, withdrawal rules, and payment gateways</p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadSettings}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg border hover:bg-muted transition"
        >
          <RefreshCw size={14} /> Refresh Live Values
        </button>
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 p-4 rounded-xl text-sm font-medium border ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="p-5 rounded-xl border bg-muted/20 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-bold text-foreground block">Campus Platform Commission (%)</label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Dynamic deduction on transactions, rentals, and service settlements
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-primary">{commissionNum.toFixed(1)}%</span>
              {commissionNum === 0 ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-300 dark:border-emerald-700">
                  <ShieldCheck size={12} /> Non-Profit Campus Mode
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 px-2.5 py-1 rounded-full border border-blue-300 dark:border-blue-700">
                  <Zap size={12} /> Revenue Mode
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="15"
              step="0.5"
              value={commissionNum}
              onChange={(e) => setSettings({ ...settings, platform_commission_percent: e.target.value })}
              className="w-full accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
              <span>0% (Free for students)</span>
              <span>2.5%</span>
              <span>5.0%</span>
              <span>10.0%</span>
              <span>15.0% (Max)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => setSettings({ ...settings, platform_commission_percent: '0' })}
              className={`p-3 rounded-xl border text-left transition ${
                commissionNum === 0
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                  : 'hover:bg-muted'
              }`}
            >
              <div className="text-xs font-bold text-foreground">0% Non-Profit (Recommended)</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                Students keep 100% of their earnings with zero commission deductions.
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSettings({ ...settings, platform_commission_percent: '2' })}
              className={`p-3 rounded-xl border text-left transition ${
                commissionNum === 2
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30'
                  : 'hover:bg-muted'
              }`}
            >
              <div className="text-xs font-bold text-foreground">2% Operational Fee</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                Funds server hosting, SMS OTP gateways, and campus club activities.
              </div>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-xl border bg-muted/20 space-y-3">
            <label className="text-sm font-bold text-foreground block">Minimum Withdrawal Limit (₹)</label>
            <p className="text-xs text-muted-foreground">
              Minimum wallet balance required for students to withdraw to their personal UPI address
            </p>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">₹</span>
              <input
                type="number"
                min="10"
                max="5000"
                value={settings.min_withdrawal_amount}
                onChange={(e) => setSettings({ ...settings, min_withdrawal_amount: e.target.value })}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border bg-background text-sm font-semibold focus:ring-2 focus:ring-primary outline-none"
                required
              />
            </div>
            <p className="text-[11px] text-muted-foreground">Prevents micro-transaction fee overhead on payment rails.</p>
          </div>

          <div className="p-5 rounded-xl border bg-muted/20 space-y-3">
            <label className="text-sm font-bold text-foreground block">Payment Gateway Sandbox Mode</label>
            <p className="text-xs text-muted-foreground">
              Controls whether wallet top-ups and UPI payouts use test simulations or live banking rails
            </p>
            <select
              value={settings.payout_gateway_mode}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  payout_gateway_mode: e.target.value as 'SANDBOX' | 'LIVE',
                })
              }
              className="w-full px-3 py-2.5 rounded-xl border bg-background text-sm font-semibold focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="SANDBOX">SANDBOX (Razorpay Test Mode / Safe Testing)</option>
              <option value="LIVE">LIVE (Production Real-Money Rail)</option>
            </select>
            <p className="text-[11px] text-muted-foreground">
              {settings.payout_gateway_mode === 'SANDBOX'
                ? 'All top-ups and UPI payouts are processed safely without real fund risk.'
                : 'Production credentials in .env are actively used to route real currency.'}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-xl border bg-muted/20 space-y-3">
          <label className="text-sm font-bold text-foreground block">Auto-Complete Inactive Orders (Days)</label>
          <p className="text-xs text-muted-foreground">
            Days after delivery before funds are automatically released to the seller if the buyer does not confirm or dispute
          </p>
          <input
            type="number"
            min="1"
            max="14"
            value={settings.auto_complete_days}
            onChange={(e) => setSettings({ ...settings, auto_complete_days: e.target.value })}
            className="w-full sm:w-48 px-4 py-2.5 rounded-xl border bg-background text-sm font-semibold focus:ring-2 focus:ring-primary outline-none"
            required
          />
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2 shadow-sm"
          >
            {saving ? <RefreshCw className="animate-spin" size={16} /> : <Sliders size={16} />}
            {saving ? 'Applying Updates...' : 'Save Platform Settings'}
          </button>
        </div>
      </form>
    </div>
  )
}
