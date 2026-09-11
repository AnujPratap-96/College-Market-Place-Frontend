export type ReviewRole = 'BUYER_TO_SELLER' | 'SELLER_TO_BUYER';

export interface IReviewUser {
  id: string;
  name: string;
  profileImage?: string | null;
  college?: string;
  branch?: string;
}

export interface IReviewProduct {
  id: string;
  title: string;
  imageUrl?: string | null;
}

export interface IReview {
  id: string;
  orderId: string;
  productId?: string | null;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  headline?: string | null;
  comment: string;
  role: ReviewRole;
  isAnonymous: boolean;
  createdAt: string;
  reviewer?: IReviewUser;
  product?: IReviewProduct;
}

export interface ITrustMetrics {
  trustScore: number;
  rawAverage: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
  badges: string[];
}

export interface IPendingReview {
  orderId: string;
  orderNumber: string;
  orderType: string;
  totalAmount: number;
  completedAt?: string;
  targetUser: {
    id: string;
    name: string;
    profileImage?: string | null;
  };
  targetRole: 'BUYER' | 'SELLER';
  product: {
    id: string;
    title: string;
    imageUrl?: string | null;
  };
}

export interface CreateReviewInput {
  orderId: string;
  rating: number;
  headline?: string;
  comment: string;
  isAnonymous?: boolean;
}
