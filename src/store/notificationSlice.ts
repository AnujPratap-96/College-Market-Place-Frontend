import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { INotification, NotificationType } from '@/modules/notifications/notification.types';

export interface NotificationState {
  notifications: INotification[];
  unreadCount: number;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (
      state,
      action: PayloadAction<{
        type: NotificationType;
        title: string;
        message: string;
        link?: string;
      }>
    ) => {
      const newNotification: INotification = {
        id:
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        type: action.payload.type,
        title: action.payload.title,
        message: action.payload.message,
        link: action.payload.link,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      state.notifications.unshift(newNotification);
      state.unreadCount += 1;
    },
    markAllRead: (state) => {
      for (const notification of state.notifications) {
        notification.isRead = true;
      }
      state.unreadCount = 0;
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const target = state.notifications.find((n) => n.id === action.payload);
      if (target && !target.isRead) {
        target.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
  },
});

export const {
  addNotification,
  markAllRead,
  markAsRead,
  clearNotifications,
} = notificationSlice.actions;

export const notificationReducer = notificationSlice.reducer;
export default notificationSlice.reducer;
