export type LedgerType = 'CREDIT' | 'DEBIT' | 'HOLD' | 'RELEASE' | 'REFUND'

export interface ILedgerEntry {
  id: string
  walletId: string
  amount: number
  type: LedgerType
  balanceBefore: number
  balanceAfter: number
  escrowBefore: number
  escrowAfter: number
  referenceType?: string | null
  referenceId?: string | null
  description?: string | null
  createdAt: string | Date
}

export interface IWallet {
  id: string
  userId: string
  balance: number
  escrowBalance: number
  createdAt?: string | Date
  updatedAt?: string | Date
}
