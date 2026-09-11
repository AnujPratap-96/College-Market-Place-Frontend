import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from '@/store/store'
import { loadWallet } from '@/store/walletSlice'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Wallet,
  Lock,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Send,
  Plus,
  Landmark,
  ShieldCheck,
} from 'lucide-react'
import {
  topupWallet,
  transferWallet,
  fetchLedger,
  withdrawWallet,
  createPaymentOrder,
  verifyPayment,
} from '../wallet.api'
import type { ILedgerEntry, LedgerType } from '../wallet.types'

interface WalletModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultTab?: string
}

const PRESET_AMOUNTS = [200, 500, 1000, 2000]

export const WalletModal = ({
  open,
  onOpenChange,
  defaultTab = 'overview',
}: WalletModalProps) => {
  const dispatch = useDispatch<AppDispatch>()
  const { balance, escrowBalance } = useSelector((state: RootState) => state.wallet)
  const user = useSelector((state: RootState) => state.user)

  const [activeTab, setActiveTab] = useState(defaultTab)

  const [topupAmount, setTopupAmount] = useState('')
  const [isTopupLoading, setIsTopupLoading] = useState(false)
  const [topupSuccess, setTopupSuccess] = useState<string | null>(null)
  const [topupError, setTopupError] = useState<string | null>(null)

  const [recipient, setRecipient] = useState('')
  const [transferAmount, setTransferAmount] = useState('')
  const [transferNote, setTransferNote] = useState('')
  const [isTransferLoading, setIsTransferLoading] = useState(false)
  const [transferSuccess, setTransferSuccess] = useState<string | null>(null)
  const [transferError, setTransferError] = useState<string | null>(null)

  const [upiId, setUpiId] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [isWithdrawLoading, setIsWithdrawLoading] = useState(false)
  const [withdrawSuccess, setWithdrawSuccess] = useState<string | null>(null)
  const [withdrawError, setWithdrawError] = useState<string | null>(null)

  const [ledgerEntries, setLedgerEntries] = useState<ILedgerEntry[]>([])
  const [isLedgerLoading, setIsLedgerLoading] = useState(false)
  const [ledgerError, setLedgerError] = useState<string | null>(null)

  const loadLedger = async () => {
    setIsLedgerLoading(true)
    setLedgerError(null)
    const res = await fetchLedger()
    if (res.error) {
      setLedgerError(res.error)
    } else if (res.entries) {
      setLedgerEntries(res.entries)
    }
    setIsLedgerLoading(false)
  }

  useEffect(() => {
    if (open) {
      dispatch(loadWallet())
      loadLedger()
      setTopupSuccess(null)
      setTopupError(null)
      setTransferSuccess(null)
      setTransferError(null)
      setWithdrawSuccess(null)
      setWithdrawError(null)
    }
  }, [open, dispatch])

  useEffect(() => {
    if (open && activeTab === 'ledger') {
      loadLedger()
    }
  }, [activeTab, open])

  const handleTopup = async (e: React.FormEvent) => {
    e.preventDefault()
    const amountNum = parseFloat(topupAmount)
    if (isNaN(amountNum) || amountNum <= 0) {
      setTopupError('Please enter a valid amount greater than 0.')
      return
    }

    setIsTopupLoading(true)
    setTopupError(null)
    setTopupSuccess(null)

    const orderData = await createPaymentOrder(amountNum)
    if (
      orderData.keyId &&
      !orderData.keyId.includes('placeholder') &&
      typeof (window as any).Razorpay !== 'undefined'
    ) {
      const rzp = new (window as any).Razorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'College Marketplace',
        description: 'Student Wallet Recharge',
        order_id: orderData.orderId,
        handler: async (response: any) => {
          const verifyRes = await verifyPayment({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            amount: amountNum,
          })
          setIsTopupLoading(false)
          if (verifyRes.error) {
            setTopupError(verifyRes.error)
          } else {
            setTopupSuccess(`₹${amountNum.toFixed(2)} added to your wallet via Razorpay!`)
            setTopupAmount('')
            dispatch(loadWallet())
            loadLedger()
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone,
        },
        theme: {
          color: '#f97316',
        },
        modal: {
          ondismiss: () => {
            setIsTopupLoading(false)
          },
        },
      })
      rzp.open()
      return
    }

    const res = await topupWallet(amountNum)
    setIsTopupLoading(false)

    if (res.error) {
      setTopupError(res.error)
    } else {
      setTopupSuccess(`₹${amountNum.toFixed(2)} added to your wallet via Razorpay Sandbox!`)
      setTopupAmount('')
      dispatch(loadWallet())
      loadLedger()
    }
  }

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault()
    const amountNum = parseFloat(transferAmount)
    if (!recipient.trim()) {
      setTransferError('Please enter recipient email or phone number.')
      return
    }
    if (isNaN(amountNum) || amountNum <= 0) {
      setTransferError('Please enter a valid amount greater than 0.')
      return
    }
    if (amountNum > balance) {
      setTransferError(`Insufficient balance. You have ₹${balance.toFixed(2)} available.`)
      return
    }

    setIsTransferLoading(true)
    setTransferError(null)
    setTransferSuccess(null)

    const res = await transferWallet(
      recipient.trim(),
      amountNum,
      transferNote.trim() || undefined
    )
    setIsTransferLoading(false)

    if (res.error) {
      setTransferError(res.error)
    } else {
      setTransferSuccess(`₹${amountNum.toFixed(2)} transferred successfully!`)
      setRecipient('')
      setTransferAmount('')
      setTransferNote('')
      dispatch(loadWallet())
      loadLedger()
    }
  }

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault()
    const amountNum = parseFloat(withdrawAmount)
    const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/

    if (!upiRegex.test(upiId.trim())) {
      setWithdrawError('Please enter a valid UPI address (e.g. username@okhdfcbank or phone@upi).')
      return
    }
    if (isNaN(amountNum) || amountNum <= 0) {
      setWithdrawError('Please enter a valid amount greater than 0.')
      return
    }
    if (amountNum > balance) {
      setWithdrawError(`Insufficient wallet balance. You have ₹${balance.toFixed(2)} available.`)
      return
    }

    setIsWithdrawLoading(true)
    setWithdrawError(null)
    setWithdrawSuccess(null)

    const res = await withdrawWallet(upiId.trim(), amountNum)
    setIsWithdrawLoading(false)

    if (res.error) {
      setWithdrawError(res.error)
    } else {
      setWithdrawSuccess(
        `₹${amountNum.toFixed(2)} payout initiated to ${upiId.trim()}! Payout Ref: ${res.withdrawalId || 'PROCESSED'}`
      )
      setWithdrawAmount('')
      dispatch(loadWallet())
      loadLedger()
    }
  }

  const getLedgerBadge = (type: LedgerType) => {
    switch (type) {
      case 'CREDIT':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
            CREDIT
          </span>
        )
      case 'RELEASE':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-400 border border-teal-300 dark:border-teal-800">
            RELEASE
          </span>
        )
      case 'REFUND':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-300 dark:border-blue-800">
            REFUND
          </span>
        )
      case 'HOLD':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-300 dark:border-amber-800">
            HOLD
          </span>
        )
      case 'DEBIT':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-300 dark:border-rose-800">
            DEBIT
          </span>
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-xl font-bold pr-4">
            <div className="flex items-center gap-2">
              <Wallet className="size-6 text-orange-500" />
              Campus Digital Wallet
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
              <ShieldCheck size={12} /> Razorpay Test Gateway
            </span>
          </DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full mt-2"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transfer">Send</TabsTrigger>
            <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
            <TabsTrigger value="ledger">Ledger</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-5 pt-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl border border-border bg-card shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Available Balance
                  </span>
                  <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400">
                    <Wallet className="size-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-bold tracking-tight text-foreground">
                    ₹{balance.toFixed(2)}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Instant checkout & direct peer transfers
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-border bg-card shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    In Escrow
                  </span>
                  <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                    <Lock className="size-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-bold tracking-tight text-foreground">
                    ₹{escrowBalance.toFixed(2)}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Secured for active rentals & subscriptions
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <Plus className="size-4 text-orange-500" />
                  Quick Top-Up
                </h4>
                <span className="text-xs text-muted-foreground font-medium">Razorpay Sandbox</span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {PRESET_AMOUNTS.map((amt) => (
                  <Button
                    key={amt}
                    type="button"
                    variant={topupAmount === amt.toString() ? 'default' : 'outline'}
                    size="sm"
                    className={`font-medium text-xs ${
                      topupAmount === amt.toString()
                        ? 'bg-orange-500 hover:bg-orange-600 text-white'
                        : ''
                    }`}
                    onClick={() => {
                      setTopupAmount(amt.toString())
                      setTopupError(null)
                      setTopupSuccess(null)
                    }}
                  >
                    +₹{amt}
                  </Button>
                ))}
              </div>

              <form onSubmit={handleTopup} className="space-y-3 pt-1">
                <div className="space-y-1.5">
                  <Label htmlFor="topup-amount" className="text-xs text-muted-foreground">
                    Custom Amount (₹)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">
                      ₹
                    </span>
                    <Input
                      id="topup-amount"
                      type="number"
                      min="1"
                      step="any"
                      placeholder="Enter amount (e.g. 500)"
                      value={topupAmount}
                      onChange={(e) => {
                        setTopupAmount(e.target.value)
                        setTopupError(null)
                        setTopupSuccess(null)
                      }}
                      className="pl-7"
                    />
                  </div>
                </div>

                {topupError && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg text-xs font-medium text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900">
                    <AlertCircle className="size-4 shrink-0" />
                    <span>{topupError}</span>
                  </div>
                )}

                {topupSuccess && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
                    <CheckCircle2 className="size-4 shrink-0" />
                    <span>{topupSuccess}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isTopupLoading || !topupAmount || parseFloat(topupAmount) <= 0}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium"
                >
                  {isTopupLoading ? (
                    <RefreshCw className="size-4 animate-spin mr-2" />
                  ) : null}
                  {isTopupLoading
                    ? 'Processing...'
                    : `Add ₹${topupAmount ? parseFloat(topupAmount).toFixed(2) : '0.00'} to Wallet`}
                </Button>
              </form>
            </div>
          </TabsContent>

          <TabsContent value="transfer" className="space-y-4 pt-3">
            <form onSubmit={handleTransfer} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="transfer-recipient" className="text-xs">
                  Recipient Phone or Email
                </Label>
                <Input
                  id="transfer-recipient"
                  type="text"
                  placeholder="student@college.edu or 9876543210"
                  value={recipient}
                  onChange={(e) => {
                    setRecipient(e.target.value)
                    setTransferError(null)
                    setTransferSuccess(null)
                  }}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="transfer-amount" className="text-xs">
                    Transfer Amount (₹)
                  </Label>
                  <span className="text-[11px] text-muted-foreground">
                    Available: ₹{balance.toFixed(2)}
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">
                    ₹
                  </span>
                  <Input
                    id="transfer-amount"
                    type="number"
                    min="1"
                    step="any"
                    max={balance}
                    placeholder="Enter amount"
                    value={transferAmount}
                    onChange={(e) => {
                      setTransferAmount(e.target.value)
                      setTransferError(null)
                      setTransferSuccess(null)
                    }}
                    className="pl-7"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="transfer-note" className="text-xs">
                  Note / Remarks (Optional)
                </Label>
                <Input
                  id="transfer-note"
                  type="text"
                  placeholder="e.g. For semester book, lab project"
                  value={transferNote}
                  onChange={(e) => setTransferNote(e.target.value)}
                />
              </div>

              {transferError && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg text-xs font-medium text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{transferError}</span>
                </div>
              )}

              {transferSuccess && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
                  <CheckCircle2 className="size-4 shrink-0" />
                  <span>{transferSuccess}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={
                  isTransferLoading ||
                  !recipient.trim() ||
                  !transferAmount ||
                  parseFloat(transferAmount) <= 0 ||
                  parseFloat(transferAmount) > balance
                }
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium mt-2"
              >
                {isTransferLoading ? (
                  <RefreshCw className="size-4 animate-spin mr-2" />
                ) : (
                  <Send className="size-4 mr-2" />
                )}
                {isTransferLoading ? 'Sending Transfer...' : 'Send Money'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="withdraw" className="space-y-4 pt-3">
            <div className="p-3.5 rounded-xl border bg-muted/30 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-foreground">
                <Landmark size={15} className="text-primary" />
                Instant UPI Payout (Sandbox Active)
              </div>
              <p className="text-muted-foreground">
                Withdraw student wallet earnings directly to your personal UPI VPA (Google Pay, PhonePe, Paytm, or bank UPI).
              </p>
            </div>

            <form onSubmit={handleWithdraw} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="withdraw-upi" className="text-xs">
                  Your UPI Address (VPA)
                </Label>
                <Input
                  id="withdraw-upi"
                  type="text"
                  placeholder="e.g. yourname@okhdfcbank or 9876543210@paytm"
                  value={upiId}
                  onChange={(e) => {
                    setUpiId(e.target.value)
                    setWithdrawError(null)
                    setWithdrawSuccess(null)
                  }}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="withdraw-amount" className="text-xs">
                    Withdrawal Amount (₹)
                  </Label>
                  <span className="text-[11px] text-muted-foreground">
                    Available: ₹{balance.toFixed(2)}
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">
                    ₹
                  </span>
                  <Input
                    id="withdraw-amount"
                    type="number"
                    min="10"
                    step="any"
                    max={balance}
                    placeholder="Enter amount to withdraw"
                    value={withdrawAmount}
                    onChange={(e) => {
                      setWithdrawAmount(e.target.value)
                      setWithdrawError(null)
                      setWithdrawSuccess(null)
                    }}
                    className="pl-7"
                    required
                  />
                </div>
              </div>

              {withdrawError && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg text-xs font-medium text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{withdrawError}</span>
                </div>
              )}

              {withdrawSuccess && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
                  <CheckCircle2 className="size-4 shrink-0" />
                  <span>{withdrawSuccess}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={
                  isWithdrawLoading ||
                  !upiId.trim() ||
                  !withdrawAmount ||
                  parseFloat(withdrawAmount) <= 0 ||
                  parseFloat(withdrawAmount) > balance
                }
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium mt-2"
              >
                {isWithdrawLoading ? (
                  <RefreshCw className="size-4 animate-spin mr-2" />
                ) : (
                  <ArrowUpRight className="size-4 mr-2" />
                )}
                {isWithdrawLoading
                  ? 'Processing Payout...'
                  : `Withdraw ₹${withdrawAmount ? parseFloat(withdrawAmount).toFixed(2) : '0.00'} to UPI`}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="ledger" className="space-y-3 pt-3">
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-medium text-muted-foreground">
                Immutable Transaction Log
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={loadLedger}
                disabled={isLedgerLoading}
                className="h-7 text-xs flex items-center gap-1"
              >
                <RefreshCw
                  className={`size-3 ${isLedgerLoading ? 'animate-spin' : ''}`}
                />
                Refresh
              </Button>
            </div>

            {ledgerError && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg text-xs font-medium text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900">
                <AlertCircle className="size-4 shrink-0" />
                <span>{ledgerError}</span>
              </div>
            )}

            {isLedgerLoading ? (
              <div className="py-12 flex flex-col items-center justify-center text-muted-foreground gap-2">
                <RefreshCw className="size-6 animate-spin text-orange-500" />
                <span className="text-xs">Loading ledger entries...</span>
              </div>
            ) : ledgerEntries.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-muted-foreground border border-dashed rounded-xl">
                <Wallet className="size-8 text-muted-foreground/40 mb-2" />
                <span className="text-sm font-medium">No transactions recorded yet</span>
                <span className="text-xs text-muted-foreground/80 mt-1">
                  Top up or receive transfers to see audit records here
                </span>
              </div>
            ) : (
              <div className="max-h-72 overflow-y-auto space-y-2 pr-1 divide-y divide-border/60">
                {ledgerEntries.map((entry) => {
                  const isPositive =
                    entry.type === 'CREDIT' ||
                    entry.type === 'RELEASE' ||
                    entry.type === 'REFUND'

                  return (
                    <div
                      key={entry.id}
                      className="pt-2.5 pb-2 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div
                          className={`mt-0.5 p-1.5 rounded-full shrink-0 ${
                            isPositive
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400'
                          }`}
                        >
                          {isPositive ? (
                            <ArrowDownLeft className="size-3.5" />
                          ) : (
                            <ArrowUpRight className="size-3.5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {entry.description || entry.referenceType || 'Wallet Transaction'}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {new Date(entry.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="flex items-center justify-end gap-1.5 mb-0.5">
                          {getLedgerBadge(entry.type)}
                          <span
                            className={`font-semibold ${
                              isPositive
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {isPositive ? '+' : '-'}₹{entry.amount.toFixed(2)}
                          </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          Bal: ₹{entry.balanceAfter.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

export default WalletModal
