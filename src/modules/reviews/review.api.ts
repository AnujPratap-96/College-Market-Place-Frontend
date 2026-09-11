import Axios from '@/utils/Axios';
import type { IReview, ITrustMetrics, IPendingReview, CreateReviewInput } from './review.types';

export const submitReview = async (data: CreateReviewInput): Promise<{ review: IReview; trustMetrics: ITrustMetrics }> => {
  const response = await Axios.post('/reviews', data);
  return response.data.data;
};

export const fetchUserReviews = async (
  userId: string,
  page = 1,
  limit = 10
): Promise<{
  reviews: IReview[];
  trustMetrics: ITrustMetrics;
  pagination: { page: number; limit: number; total: number; totalPages: number };
}> => {
  const response = await Axios.get(`/reviews/user/${userId}`, {
    params: { page, limit },
  });
  return response.data.data;
};

export const fetchProductReviews = async (
  productId: string,
  page = 1,
  limit = 10
): Promise<{
  reviews: IReview[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}> => {
  const response = await Axios.get(`/reviews/product/${productId}`, {
    params: { page, limit },
  });
  return response.data.data;
};

export const fetchPendingReviews = async (): Promise<IPendingReview[]> => {
  const response = await Axios.get('/reviews/pending');
  return response.data.data.pending || [];
};
