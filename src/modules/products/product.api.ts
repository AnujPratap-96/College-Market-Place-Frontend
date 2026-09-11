import Axios from '@/utils/Axios';
import { isAxiosError } from 'axios';
import type { IProduct, CreateProductInput } from './product.types';

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (isAxiosError(error)) {
    return error.response?.data?.message || error.response?.data?.error || error.message || fallback;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
};

export const normalizeProduct = (item: any): IProduct => {
  const images = Array.isArray(item.images) && item.images.length > 0
    ? item.images
    : item.imageUrl
      ? [item.imageUrl]
      : [];

  const rawOwner = item.owner || item.seller;
  const owner = rawOwner ? {
    id: rawOwner.id || '',
    name: rawOwner.name || '',
    email: rawOwner.email || '',
    phone: rawOwner.phone || rawOwner.phoneNo || '',
    college: rawOwner.college || '',
    profileImage: rawOwner.profileImage || rawOwner.image || '',
  } : undefined;

  const seller = rawOwner ? {
    id: rawOwner.id || '',
    name: rawOwner.name || '',
    email: rawOwner.email || '',
    phoneNo: rawOwner.phoneNo || rawOwner.phone || '',
    college: rawOwner.college || '',
    image: rawOwner.image || rawOwner.profileImage || '',
  } : undefined;

  return {
    id: item.id || '',
    title: item.title || '',
    description: item.description || '',
    price: typeof item.price === 'number' ? item.price : Number(item.price) || 0,
    type: item.type || 'SELL',
    category: item.category || '',
    status: item.status || (item.isAvailable === false ? 'SOLD' : 'AVAILABLE'),
    imageUrl: item.imageUrl || images[0] || '',
    images,
    frequency: item.frequency,
    deliverySlots: item.deliverySlots,
    serviceDuration: item.serviceDuration,
    securityDeposit: typeof item.securityDeposit === 'number' ? item.securityDeposit : (item.securityDeposit ? Number(item.securityDeposit) : undefined),
    rentalDuration: item.rentalDuration,
    auction: item.auction,
    owner,
    seller,
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: item.updatedAt || new Date().toISOString(),
  };
};

export const fetchProducts = async (filters?: {
  category?: string;
  query?: string;
  type?: string;
}): Promise<{ products: IProduct[]; error?: string }> => {
  try {
    const params = new URLSearchParams();
    const hasQuery = Boolean(filters?.query && filters.query.trim());
    const hasCategory = Boolean(filters?.category && filters.category.toLowerCase() !== 'all');
    const hasType = Boolean(filters?.type && filters.type.toLowerCase() !== 'all');

    let endpoint = '/products';
    if (hasQuery || hasCategory || hasType) {
      endpoint = '/products/filters';
      if (hasQuery && filters?.query) {
        params.append('q', filters.query.trim());
      }
      if (hasCategory && filters?.category) {
        params.append('category', filters.category);
      }
      if (hasType && filters?.type) {
        params.append('type', filters.type);
      }
    }

    const url = params.toString() ? `${endpoint}?${params.toString()}` : endpoint;
    const res = await Axios.get(url);
    const rawList = res.data?.data?.products || res.data?.products || (Array.isArray(res.data) ? res.data : []);
    const products = rawList.map(normalizeProduct);
    return { products };
  } catch (error: unknown) {
    return { products: [], error: getErrorMessage(error, 'Failed to fetch products') };
  }
};

export const fetchProductById = async (
  id: string
): Promise<{ product?: IProduct; error?: string }> => {
  try {
    const res = await Axios.get(`/products/${id}`);
    const raw = res.data?.data?.product || res.data?.product || res.data;
    if (!raw) {
      return { error: 'Product not found' };
    }
    return { product: normalizeProduct(raw) };
  } catch (error: unknown) {
    return { error: getErrorMessage(error, 'Failed to fetch product') };
  }
};

export const createProduct = async (
  data: CreateProductInput
): Promise<{ product?: IProduct; error?: string; success: boolean }> => {
  try {
    const payload: Record<string, any> = {
      title: data.title.trim(),
      description: data.description.trim(),
      price: Number(data.price),
      type: data.type,
      category: data.category.trim(),
    };

    const imageUrl = data.imageUrl?.trim() || (data.images && data.images[0]?.trim());
    if (imageUrl) {
      payload.imageUrl = imageUrl;
    }

    if (data.frequency) {
      payload.frequency = data.frequency;
    }
    if (data.deliverySlots && data.deliverySlots.trim()) {
      payload.deliverySlots = data.deliverySlots.trim();
    }
    if (data.serviceDuration && data.serviceDuration.trim()) {
      payload.serviceDuration = data.serviceDuration.trim();
    }
    if (data.securityDeposit !== undefined && data.securityDeposit !== null && !isNaN(Number(data.securityDeposit))) {
      payload.securityDeposit = Number(data.securityDeposit);
    }
    if (data.type === 'AUCTION') {
      const auctionRes = await Axios.post('/auctions', {
        title: data.title.trim(),
        description: data.description.trim(),
        category: data.category.trim(),
        imageUrl: data.imageUrl?.trim() || (data.images && data.images[0]?.trim()),
        startingBid: data.startingBid || Number(data.price),
        minIncrement: data.minIncrement || 50,
        reservePrice: data.reservePrice,
        durationHours: data.durationHours || 24,
        antiSnipingSeconds: data.antiSnipingSeconds || 60,
      });
      const rawAuction = auctionRes.data?.data?.auction;
      const rawProd = rawAuction?.product;
      if (rawProd && rawAuction) {
        rawProd.auction = rawAuction;
      }
      return {
        success: true,
        product: rawProd ? normalizeProduct(rawProd) : undefined,
      };
    }

    const res = await Axios.post('/products', payload);
    const raw = res.data?.data?.product || res.data?.product;
    return {
      success: true,
      product: raw ? normalizeProduct(raw) : undefined,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error, 'Failed to create product'),
    };
  }
};

export const deleteProduct = async (
  id: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    await Axios.delete(`/products/${id}`);
    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error, 'Failed to delete product'),
    };
  }
};

export const fetchMyProducts = async (): Promise<{ products: IProduct[]; error?: string }> => {
  try {
    const res = await Axios.get('/products/my-products');
    const rawList = res.data?.data?.products || res.data?.products || (Array.isArray(res.data) ? res.data : []);
    return { products: rawList.map(normalizeProduct) };
  } catch (error: unknown) {
    return { products: [], error: getErrorMessage(error, 'Failed to fetch your listings') };
  }
};
