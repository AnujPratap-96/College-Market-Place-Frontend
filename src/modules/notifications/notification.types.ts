export type NotificationType =
  | 'ORDER'
  | 'SERVICE'
  | 'SUBSCRIPTION'
  | 'WALLET'
  | 'DISPUTE'
  | 'CHAT';

export interface INotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  linkState?: { userId?: string; productId?: string };
  isRead: boolean;
  createdAt: string;
}
