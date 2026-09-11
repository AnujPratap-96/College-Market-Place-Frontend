import Axios from '@/utils/Axios';
import { isAxiosError } from 'axios';
import type { ISubscription, IProviderManifest } from './subscription.types';

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (isAxiosError(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      fallback
    );
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
};

export const fetchMySubscriptions = async (): Promise<{ subscriptions?: ISubscription[]; error?: string }> => {
  try {
    let res;
    try {
      res = await Axios.get('/subscriptions/my');
    } catch (e: unknown) {
      if (isAxiosError(e) && e.response?.status === 404) {
        res = await Axios.get('/subscriptions/my-subscriptions');
      } else {
        throw e;
      }
    }
    const rawList = res.data?.data?.subscriptions || res.data?.subscriptions || [];
    return { subscriptions: rawList };
  } catch (error: unknown) {
    return { error: getErrorMessage(error, 'Failed to fetch subscriptions') };
  }
};

export const fetchProviderManifest = async (): Promise<{ manifest?: IProviderManifest; error?: string }> => {
  try {
    const res = await Axios.get('/subscriptions/provider/manifest');
    const rawManifest = res.data?.data?.manifest || res.data?.data || res.data?.manifest;
    return { manifest: rawManifest };
  } catch (error: unknown) {
    return { error: getErrorMessage(error, 'Failed to fetch provider manifest') };
  }
};

export const setVacation = async (
  subscriptionId: string,
  fromDate: string,
  toDate: string
): Promise<{ success?: boolean; subscription?: ISubscription; refundedAmount?: number; message?: string; error?: string }> => {
  try {
    const res = await Axios.post(`/subscriptions/${subscriptionId}/vacation`, {
      vacationFrom: fromDate,
      vacationTo: toDate,
    });
    return {
      success: true,
      subscription: res.data?.data?.subscription,
      refundedAmount: res.data?.data?.refundedAmount,
      message: res.data?.message,
    };
  } catch (error: unknown) {
    return { error: getErrorMessage(error, 'Failed to set vacation mode') };
  }
};

export const resumeVacation = async (
  subscriptionId: string
): Promise<{ success?: boolean; subscription?: ISubscription; message?: string; error?: string }> => {
  try {
    const res = await Axios.post(`/subscriptions/${subscriptionId}/resume`);
    return {
      success: true,
      subscription: res.data?.data?.subscription,
      message: res.data?.message,
    };
  } catch (error: unknown) {
    return { error: getErrorMessage(error, 'Failed to resume subscription') };
  }
};

export const reportMissedDelivery = async (
  subscriptionId: string,
  deliveryId: string,
  reason: string
): Promise<{ success?: boolean; subscription?: ISubscription; refundedAmount?: number; message?: string; error?: string }> => {
  try {
    const res = await Axios.post(`/subscriptions/${subscriptionId}/report-missed`, {
      deliveryId,
      reason,
    });
    return {
      success: true,
      subscription: res.data?.data?.subscription,
      refundedAmount: res.data?.data?.refundedAmount,
      message: res.data?.message,
    };
  } catch (error: unknown) {
    return { error: getErrorMessage(error, 'Failed to report missed delivery') };
  }
};

export const cancelSubscription = async (
  subscriptionId: string
): Promise<{ success?: boolean; subscription?: ISubscription; message?: string; error?: string }> => {
  try {
    const res = await Axios.post(`/subscriptions/${subscriptionId}/cancel`);
    return {
      success: true,
      subscription: res.data?.data?.subscription,
      message: res.data?.message,
    };
  } catch (error: unknown) {
    return { error: getErrorMessage(error, 'Failed to cancel subscription') };
  }
};
