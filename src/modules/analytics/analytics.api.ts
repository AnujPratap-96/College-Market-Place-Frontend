import Axios from '@/utils/Axios';
import { isAxiosError } from 'axios';
import type { ISellerAnalytics } from './analytics.types';

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (isAxiosError(error)) {
    return error.response?.data?.message || error.response?.data?.error || error.message || fallback;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
};

export const fetchSellerAnalytics = async (): Promise<{
  analytics?: ISellerAnalytics;
  error?: string;
}> => {
  try {
    const res = await Axios.get('/analytics/seller');
    const data = res.data?.data;
    return { analytics: data };
  } catch (err) {
    return { error: getErrorMessage(err, 'Failed to fetch seller analytics') };
  }
};
