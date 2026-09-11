export interface IMessage {
  id: string;
  senderId: string;
  receiverId: string;
  productId?: string;
  content: string;
  isRead: boolean;
  createdAt: string;
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
}

export interface TypingPayload {
  toUserId: string;
  isTyping: boolean;
}
