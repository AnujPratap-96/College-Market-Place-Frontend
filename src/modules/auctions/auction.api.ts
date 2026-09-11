import axios from '@/utils/Axios';
import type { IAuction, IBid, CreateAuctionInput } from './auction.types';

export const fetchAuctions = async (filters?: {
  status?: string;
  category?: string;
  query?: string;
}): Promise<{ auctions?: IAuction[]; error?: string }> => {
  try {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'ALL') params.append('status', filters.status);
    if (filters?.category && filters.category !== 'ALL') params.append('category', filters.category);
    if (filters?.query) params.append('query', filters.query);

    const res = await axios.get(`/auctions?${params.toString()}`);
    return { auctions: res.data?.data?.auctions || [] };
  } catch (err: any) {
    return { error: err.response?.data?.message || 'Failed to fetch auctions' };
  }
};

export const fetchAuctionById = async (
  id: string
): Promise<{ auction?: IAuction; error?: string }> => {
  try {
    const res = await axios.get(`/auctions/${id}`);
    return { auction: res.data?.data?.auction };
  } catch (err: any) {
    return { error: err.response?.data?.message || 'Failed to fetch auction details' };
  }
};

export const createAuction = async (
  data: CreateAuctionInput
): Promise<{ auction?: IAuction; error?: string }> => {
  try {
    const res = await axios.post('/auctions', data);
    return { auction: res.data?.data?.auction };
  } catch (err: any) {
    return { error: err.response?.data?.message || 'Failed to create auction listing' };
  }
};

export const placeBid = async (
  auctionId: string,
  amount: number
): Promise<{ auction?: IAuction; bid?: IBid; error?: string }> => {
  try {
    const res = await axios.post(`/auctions/${auctionId}/bid`, { amount });
    return {
      auction: res.data?.data?.auction,
      bid: res.data?.data?.bid,
    };
  } catch (err: any) {
    return { error: err.response?.data?.message || 'Failed to place bid' };
  }
};

export const settleAuction = async (
  auctionId: string
): Promise<{ auction?: IAuction; error?: string }> => {
  try {
    const res = await axios.post(`/auctions/${auctionId}/settle`);
    return { auction: res.data?.data?.auction };
  } catch (err: any) {
    return { error: err.response?.data?.message || 'Failed to settle auction' };
  }
};
