import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from '@/store/store'
import { loadWallet } from '@/store/walletSlice'
import { Wallet } from 'lucide-react'
import { WalletModal } from './WalletModal'

export const WalletPill = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { balance, escrowBalance } = useSelector((state: RootState) => state.wallet)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    dispatch(loadWallet())
  }, [dispatch])

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-orange-200 dark:border-orange-900/60 bg-orange-50/90 dark:bg-orange-950/40 hover:bg-orange-100 dark:hover:bg-orange-900/50 text-xs sm:text-sm font-semibold text-orange-800 dark:text-orange-300 transition-colors shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
      >
        <Wallet className="size-4 text-orange-500 shrink-0" />
        <span>₹{balance.toFixed(2)}</span>
        {escrowBalance > 0 && (
          <span className="text-[11px] font-normal text-amber-700 dark:text-amber-400">
            (₹{escrowBalance.toFixed(2)} escrow)
          </span>
        )}
      </button>

      <WalletModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  )
}

export default WalletPill
