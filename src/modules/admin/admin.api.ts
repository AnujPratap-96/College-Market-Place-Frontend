import Axios from '@/utils/Axios'
import { isAxiosError } from 'axios'
import type { ISystemSettings, IDisputedOrder, IReportItem, IFinancialStats } from './admin.types'

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (isAxiosError(error)) {
    return error.response?.data?.message || error.message || fallback
  }
  if (error instanceof Error) {
    return error.message
  }
  return fallback
}

export const fetchAdminSettings = async (): Promise<{ settings?: ISystemSettings; error?: string }> => {
  try {
    const res = await Axios.get('/admin/settings')
    return { settings: res.data?.data?.settings }
  } catch (error: unknown) {
    return { error: getErrorMessage(error, 'Failed to fetch settings') }
  }
}

export const updateAdminSettings = async (
  updates: Record<string, string>
): Promise<{ settings?: ISystemSettings; error?: string }> => {
  try {
    const res = await Axios.patch('/admin/settings', updates)
    return { settings: res.data?.data?.settings }
  } catch (error: unknown) {
    return { error: getErrorMessage(error, 'Failed to update settings') }
  }
}

export const fetchDisputes = async (
  page = 1,
  limit = 20
): Promise<{ disputes?: IDisputedOrder[]; total?: number; error?: string }> => {
  try {
    const res = await Axios.get('/admin/disputes', { params: { page, limit } })
    const data = res.data?.data
    return {
      disputes: data?.disputes || [],
      total: data?.total || 0,
    }
  } catch (error: unknown) {
    return { error: getErrorMessage(error, 'Failed to fetch disputes') }
  }
}

export const resolveDispute = async (
  orderId: string,
  action: 'REFUND_BUYER' | 'RELEASE_SELLER',
  resolutionNote: string
): Promise<{ success?: boolean; error?: string }> => {
  try {
    await Axios.post(`/admin/disputes/${orderId}/resolve`, { action, resolutionNote })
    return { success: true }
  } catch (error: unknown) {
    return { error: getErrorMessage(error, 'Failed to resolve dispute') }
  }
}

export const fetchReports = async (
  page = 1,
  limit = 20
): Promise<{ reports?: IReportItem[]; total?: number; error?: string }> => {
  try {
    const res = await Axios.get('/admin/reports', { params: { page, limit } })
    const data = res.data?.data
    return {
      reports: data?.reports || [],
      total: data?.total || 0,
    }
  } catch (error: unknown) {
    return { error: getErrorMessage(error, 'Failed to fetch reports') }
  }
}

export const handleReportAction = async (
  reportId: string,
  action: 'DISMISS' | 'FLAG_PRODUCT' | 'UNFLAG_PRODUCT' | 'DELETE_PRODUCT',
  notes?: string
): Promise<{ success?: boolean; message?: string; error?: string }> => {
  try {
    const res = await Axios.post(`/admin/reports/${reportId}/action`, { action, notes })
    return { success: true, message: res.data?.message }
  } catch (error: unknown) {
    return { error: getErrorMessage(error, 'Failed to perform report action') }
  }
}

export const fetchFinancialStats = async (): Promise<{ stats?: IFinancialStats; error?: string }> => {
  try {
    const res = await Axios.get('/admin/stats/financial')
    return { stats: res.data?.data }
  } catch (error: unknown) {
    return { error: getErrorMessage(error, 'Failed to fetch financial statistics') }
  }
}
