export type MessageMediaType = 'TEXT' | 'IMAGE' | 'AUDIO';

export type NegotiationStatus = 'PENDING' | 'ACCEPTED' | 'COUNTERED' | 'DECLINED' | 'EXPIRED';

export interface INegotiationOffer {
  id: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  originalPrice: number;
  offeredPrice: number;
  status: NegotiationStatus;
  offeredById: string;
  messageId?: string;
  orderId?: string;
  createdAt: string;
  updatedAt: string;
  product?: {
    id: string;
    title: string;
    price: number;
    imageUrl?: string;
  };
}

export interface IMessage {
  id: string;
  senderId: string;
  receiverId: string;
  productId?: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  mediaType?: MessageMediaType;
  mediaUrl?: string;
  audioDuration?: number;
  offer?: INegotiationOffer;
  product?: {
    id: string;
    title: string;
    price: number;
    imageUrl?: string;
    type: string;
  };
  sender?: {
    id: string;
    name: string;
    college?: string;
    profileImage?: string;
  };
  receiver?: {
    id: string;
    name: string;
    college?: string;
    profileImage?: string;
  };
}

export interface IConversation {
  otherUser: {
    id: string;
    name: string;
    email: string;
    college?: string;
    profileImage?: string;
  };
  lastMessage: IMessage;
  unreadCount: number;
}

export interface SendMessagePayload {
  toUserId: string;
  content: string;
  productId?: string;
  mediaType?: MessageMediaType;
  mediaUrl?: string;
  audioDuration?: number;
}

export interface TypingPayload {
  toUserId: string;
  isTyping: boolean;
}
