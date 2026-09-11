import Axios from '@/utils/Axios'
import { isAxiosError } from 'axios'
import type { IWallet, ILedgerEntry } from './wallet.types'

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (isAxiosError(error)) {
    return error.response?.data?.message || error.message || fallback
  }
  if (error instanceof Error) {
    return error.message
  }
  return fallback
}

export const fetchWallet = async (): Promise<{ wallet?: IWallet; error?: string }> => {
  try {
    const res = await Axios.get('/wallet')
    const data = res.data?.data
    const wallet: IWallet | undefined = data?.wallet || (data && typeof data.balance === 'number' ? {
      id: data.walletId || data.id || '',
      userId: data.userId || '',
      balance: data.balance,
      escrowBalance: data.escrowBalance ?? 0,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    } : undefined)
    return { wallet }
  } catch (error: unknown) {
    return { error: getErrorMessage(error, 'Failed to fetch wallet') }
  }
}

export const topupWallet = async (amount: number): Promise<{ wallet?: IWallet; error?: string }> => {
  try {
    const res = await Axios.post('/wallet/topup', { amount })
    const data = res.data?.data
    const wallet: IWallet | undefined = data?.wallet || (data && typeof data.balance === 'number' ? {
      id: data.walletId || data.id || '',
      userId: data.userId || '',
      balance: data.balance,
      escrowBalance: data.escrowBalance ?? 0,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    } : undefined)
    return { wallet }
  } catch (error: unknown) {
    return { error: getErrorMessage(error, 'Failed to top up wallet') }
  }
}

export const transferWallet = async (
  recipient: string,
  amount: number,
  note?: string
): Promise<{ success?: boolean; error?: string; data?: unknown }> => {
  try {
    const res = await Axios.post('/wallet/transfer', { recipient, amount, note })
    return { success: true, data: res.data?.data }
  } catch (error: unknown) {
    return { error: getErrorMessage(error, 'Failed to transfer funds') }
  }
}

export const fetchLedger = async (): Promise<{ entries?: ILedgerEntry[]; error?: string }> => {
  try {
    let res
    try {
      res = await Axios.get('/wallet/ledger')
    } catch (e: unknown) {
      if (isAxiosError(e) && e.response?.status === 404) {
        res = await Axios.get('/wallet/history')
      } else {
        throw e
      }
    }
    const data = res.data?.data
    const entries: ILedgerEntry[] = data?.ledger || data?.entries || (Array.isArray(data) ? data : [])
    return { entries }
  } catch (error: unknown) {
    return { error: getErrorMessage(error, 'Failed to fetch ledger') }
  }
}

export const withdrawWallet = async (
  upiId: string,
  amount: number
): Promise<{ success?: boolean; withdrawalId?: string; error?: string }> => {
  try {
    const res = await Axios.post('/wallet/withdraw', { upiId, amount })
    return { success: true, withdrawalId: res.data?.data?.withdrawalId }
  } catch (error: unknown) {
    return { error: getErrorMessage(error, 'Failed to withdraw funds') }
  }
}

export const createPaymentOrder = async (
  amount: number
): Promise<{ orderId?: string; amount?: number; currency?: string; keyId?: string; error?: string }> => {
  try {
    const res = await Axios.post('/wallet/create-order', { amount })
    return res.data?.data || {}
  } catch (error: unknown) {
    return { error: getErrorMessage(error, 'Failed to initialize payment gateway') }
  }
}

export const verifyPayment = async (payload: {
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature?: string
  amount: number
}): Promise<{ success?: boolean; error?: string }> => {
  try {
    await Axios.post('/wallet/verify-payment', payload)
    return { success: true }
  } catch (error: unknown) {
    return { error: getErrorMessage(error, 'Payment verification failed') }
  }
}
