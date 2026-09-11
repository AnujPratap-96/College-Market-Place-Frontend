import Axios from '@/utils/Axios';
import { isAxiosError } from 'axios';
import type { IOrder } from './order.types';

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

export const normalizeOrder = (raw: any): IOrder => {
  const product = raw.product
    ? {
        id: raw.product.id || '',
        title: raw.product.title || '',
        imageUrl:
          raw.product.imageUrl ||
          (Array.isArray(raw.product.images) && raw.product.images.length > 0
            ? raw.product.images[0]
            : '') ||
          '',
        price:
          typeof raw.product.price === 'number'
            ? raw.product.price
            : Number(raw.product.price) || 0,
        type: raw.product.type || '',
      }
    : undefined;

  const buyer = raw.buyer
    ? {
        id: raw.buyer.id || '',
        name: raw.buyer.name || '',
        email: raw.buyer.email || '',
        phone: raw.buyer.phone || raw.buyer.phoneNo || '',
        college: raw.buyer.college || '',
      }
    : undefined;

  const seller = raw.seller
    ? {
        id: raw.seller.id || '',
        name: raw.seller.name || '',
        email: raw.seller.email || '',
        phone: raw.seller.phone || raw.seller.phoneNo || '',
        college: raw.seller.college || '',
      }
    : undefined;

  return {
    id: raw.id || '',
    orderNumber: raw.orderNumber || '',
    buyerId: raw.buyerId || '',
    sellerId: raw.sellerId || '',
    productId: raw.productId || '',
    price: typeof raw.price === 'number' ? raw.price : Number(raw.price) || 0,
    platformFee:
      typeof raw.platformFee === 'number'
        ? raw.platformFee
        : Number(raw.platformFee) || 0,
    totalAmount:
      typeof raw.totalAmount === 'number'
        ? raw.totalAmount
        : Number(raw.totalAmount) || 0,
    securityDeposit:
      typeof raw.securityDeposit === 'number'
        ? raw.securityDeposit
        : Number(raw.securityDeposit) || 0,
    rentalDays: raw.rentalDays ?? undefined,
    rentalStartDate: raw.rentalStartDate ? String(raw.rentalStartDate) : undefined,
    rentalEndDate: raw.rentalEndDate ? String(raw.rentalEndDate) : undefined,
    orderType: raw.orderType || 'PURCHASE',
    status: raw.status || 'PENDING_PAYMENT',
    pickupOtp: raw.pickupOtp ?? undefined,
    returnOtp: raw.returnOtp ?? undefined,
    paymentMethod: raw.paymentMethod || 'WALLET',
    disputeReason: raw.disputeReason ?? undefined,
    disputeResolution: raw.disputeResolution ?? undefined,
    product,
    buyer,
    seller,
    createdAt: raw.createdAt ? String(raw.createdAt) : new Date().toISOString(),
    completedAt: raw.completedAt ? String(raw.completedAt) : undefined,
    cancelledAt: raw.cancelledAt ? String(raw.cancelledAt) : undefined,
  };
};

export const fetchMyOrders = async (): Promise<{ orders?: IOrder[]; error?: string }> => {
  try {
    const res = await Axios.get('/orders/my-orders');
    const rawList =
      res.data?.data?.orders ||
      res.data?.orders ||
      (Array.isArray(res.data?.data) ? res.data.data : []);
    const orders = Array.isArray(rawList) ? rawList.map(normalizeOrder) : [];
    return { orders };
  } catch (error: unknown) {
    return { error: getErrorMessage(error, 'Failed to fetch orders') };
  }
};

export const fetchMySales = async (): Promise<{ orders?: IOrder[]; error?: string }> => {
  try {
    const res = await Axios.get('/orders/my-sales');
    const rawList =
      res.data?.data?.sales ||
      res.data?.sales ||
      res.data?.data?.orders ||
      (Array.isArray(res.data?.data) ? res.data.data : []);
    const orders = Array.isArray(rawList) ? rawList.map(normalizeOrder) : [];
    return { orders };
  } catch (error: unknown) {
    return { error: getErrorMessage(error, 'Failed to fetch sales') };
  }
};

export const verifyHandover = async (
  orderId: string,
  pickupOtp: string
): Promise<{ success: boolean; order?: IOrder; message?: string; error?: string }> => {
  try {
    const res = await Axios.post(`/orders/${orderId}/verify-handover`, { pickupOtp });
    const rawOrder = res.data?.data?.order || res.data?.order;
    return {
      success: true,
      order: rawOrder ? normalizeOrder(rawOrder) : undefined,
      message: res.data?.message,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error, 'Failed to verify handover OTP'),
    };
  }
};

export const verifyReturn = async (
  orderId: string,
  returnOtp: string
): Promise<{ success: boolean; order?: IOrder; message?: string; error?: string }> => {
  try {
    const res = await Axios.post(`/orders/${orderId}/verify-return`, { returnOtp });
    const rawOrder = res.data?.data?.order || res.data?.order;
    return {
      success: true,
      order: rawOrder ? normalizeOrder(rawOrder) : undefined,
      message: res.data?.message,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error, 'Failed to verify return OTP'),
    };
  }
};

export const completeService = async (
  orderId: string
): Promise<{ success: boolean; order?: IOrder; message?: string; error?: string }> => {
  try {
    const res = await Axios.post(`/orders/${orderId}/service-complete`);
    const rawOrder = res.data?.data?.order || res.data?.order;
    return {
      success: true,
      order: rawOrder ? normalizeOrder(rawOrder) : undefined,
      message: res.data?.message,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error, 'Failed to complete service'),
    };
  }
};

export const confirmService = async (
  orderId: string
): Promise<{ success: boolean; order?: IOrder; message?: string; error?: string }> => {
  try {
    const res = await Axios.post(`/orders/${orderId}/service-confirm`);
    const rawOrder = res.data?.data?.order || res.data?.order;
    return {
      success: true,
      order: rawOrder ? normalizeOrder(rawOrder) : undefined,
      message: res.data?.message,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error, 'Failed to confirm service'),
    };
  }
};

export const cancelOrder = async (
  orderId: string
): Promise<{ success: boolean; order?: IOrder; message?: string; error?: string }> => {
  try {
    const res = await Axios.post(`/orders/${orderId}/cancel`);
    const rawOrder = res.data?.data?.order || res.data?.order;
    return {
      success: true,
      order: rawOrder ? normalizeOrder(rawOrder) : undefined,
      message: res.data?.message,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error, 'Failed to cancel order'),
    };
  }
};

export const disputeOrder = async (
  orderId: string,
  reason: string,
  notes?: string
): Promise<{ success: boolean; order?: IOrder; message?: string; error?: string }> => {
  try {
    const trimmedNotes = notes ? notes.trim() : '';
    const trimmedReason = reason.trim();
    const payloadReason = trimmedNotes ? `${trimmedReason} - ${trimmedNotes}` : trimmedReason;
    const res = await Axios.post(`/orders/${orderId}/dispute`, {
      reason: payloadReason,
      notes: trimmedNotes || undefined,
    });
    const rawOrder = res.data?.data?.order || res.data?.order;
    return {
      success: true,
      order: rawOrder ? normalizeOrder(rawOrder) : undefined,
      message: res.data?.message,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error, 'Failed to file dispute'),
    };
  }
};
