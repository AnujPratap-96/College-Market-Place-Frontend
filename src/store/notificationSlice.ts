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
        linkState?: { userId?: string; productId?: string };
        eventId?: string;
      }>
    ) => {
      if (action.payload.eventId && state.notifications.some((n) => n.id === action.payload.eventId)) {
        return;
      }
      const newNotification: INotification = {
        id:
          action.payload.eventId || (typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`),
        type: action.payload.type,
        title: action.payload.title,
        message: action.payload.message,
        link: action.payload.link,
        linkState: action.payload.linkState,
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
    removeNotification: (state, action: PayloadAction<string>) => {
      const removed = state.notifications.find((n) => n.id === action.payload);
      state.notifications = state.notifications.filter((n) => n.id !== action.payload);
      if (removed && !removed.isRead) state.unreadCount = Math.max(0, state.unreadCount - 1);
    },
  },
});

export const {
  addNotification,
  markAllRead,
  markAsRead,
  clearNotifications,
  removeNotification,
} = notificationSlice.actions;

export const notificationReducer = notificationSlice.reducer;
export default notificationSlice.reducer;
