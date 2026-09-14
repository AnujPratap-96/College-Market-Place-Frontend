import Axios from '@/utils/Axios';
import type {
  IWantedRequest,
  IWantedOffer,
  CreateWantedInput,
  CreateOfferInput,
  WantedListResponse,
} from './wanted.types';

export const fetchWantedRequests = async (params?: {
  category?: string;
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<WantedListResponse> => {
  const response = await Axios.get('/wanted', { params });
  return response.data.data;
};

export const fetchWantedRequestById = async (id: string): Promise<IWantedRequest> => {
  const response = await Axios.get(`/wanted/${id}`);
  return response.data.data.request;
};

export const createWantedRequest = async (data: CreateWantedInput): Promise<IWantedRequest> => {
  const response = await Axios.post('/wanted', data);
  return response.data.data.request;
};

export const submitWantedOffer = async (
  requestId: string,
  data: CreateOfferInput
): Promise<IWantedOffer> => {
  const response = await Axios.post(`/wanted/${requestId}/offers`, data);
  return response.data.data.offer;
};

export const acceptWantedOffer = async (offerId: string): Promise<{ order: any }> => {
  const response = await Axios.post(`/wanted/offers/${offerId}/accept`);
  return response.data.data;
};

export const cancelWantedRequest = async (id: string): Promise<void> => {
  await Axios.delete(`/wanted/${id}`);
};

export const fetchMyWantedRequests = async (): Promise<IWantedRequest[]> => {
  const response = await Axios.get('/wanted/my-requests');
  return response.data.data.requests;
};

export const fetchMyWantedOffers = async (): Promise<IWantedOffer[]> => {
  const response = await Axios.get('/wanted/my-offers');
  return response.data.data.offers;
};
