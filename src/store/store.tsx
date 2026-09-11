import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import walletReducer from './walletSlice';
import messagesReducer from './messagesSlice';
import notificationReducer from './notificationSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    wallet: walletReducer,
    messages: messagesReducer,
    notifications: notificationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
