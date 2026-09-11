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
  isRead: boolean;
  createdAt: string;
}
