import Axios from '@/utils/Axios';
import { isAxiosError } from 'axios';
import type { INegotiationOffer } from './negotiation.types';

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (isAxiosError(error)) {
    return error.response?.data?.message || error.response?.data?.error || error.message || fallback;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
};

export const createNegotiationOffer = async (
  productId: string,
  offeredPrice: number,
  note?: string
): Promise<{ offer?: INegotiationOffer; error?: string }> => {
  try {
    const res = await Axios.post('/negotiations/offer', { productId, offeredPrice, note });
    const offer = res.data?.data?.offer || res.data?.offer;
    return { offer };
  } catch (err) {
    return { error: getErrorMessage(err, 'Failed to make offer') };
  }
};

export const counterNegotiationOffer = async (
  negotiationId: string,
  counterPrice: number,
  note?: string
): Promise<{ offer?: INegotiationOffer; error?: string }> => {
  try {
    const res = await Axios.post(`/negotiations/${negotiationId}/counter`, { counterPrice, note });
    const offer = res.data?.data?.offer || res.data?.offer;
    return { offer };
  } catch (err) {
    return { error: getErrorMessage(err, 'Failed to counter offer') };
  }
};

export const acceptNegotiationOffer = async (
  negotiationId: string
): Promise<{ offer?: INegotiationOffer; order?: any; error?: string }> => {
  try {
    const res = await Axios.post(`/negotiations/${negotiationId}/accept`, {});
    const offer = res.data?.data?.offer || res.data?.offer;
    const order = res.data?.data?.order || res.data?.order;
    return { offer, order };
  } catch (err) {
    return { error: getErrorMessage(err, 'Failed to accept offer') };
  }
};

export const declineNegotiationOffer = async (
  negotiationId: string
): Promise<{ offer?: INegotiationOffer; error?: string }> => {
  try {
    const res = await Axios.post(`/negotiations/${negotiationId}/decline`, {});
    const offer = res.data?.data?.offer || res.data?.offer;
    return { offer };
  } catch (err) {
    return { error: getErrorMessage(err, 'Failed to decline offer') };
  }
};

export const getActiveOfferForProduct = async (
  productId: string
): Promise<{ offer?: INegotiationOffer | null; error?: string }> => {
  try {
    const res = await Axios.get(`/negotiations/product/${productId}`);
    const offer = res.data?.data?.offer ?? res.data?.offer ?? null;
    return { offer };
  } catch (err) {
    return { error: getErrorMessage(err, 'Failed to load offer') };
  }
};
