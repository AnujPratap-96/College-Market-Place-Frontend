import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { IConversation, IMessage } from '@/modules/messages/message.types';

export interface MessagesState {
  conversations: IConversation[];
  activeUserId: string | null;
  activeMessages: IMessage[];
  unreadTotal: number;
  typingUsers: Record<string, boolean>;
  loading: boolean;
}

const initialState: MessagesState = {
  conversations: [],
  activeUserId: null,
  activeMessages: [],
  unreadTotal: 0,
  typingUsers: {},
  loading: false,
};

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setConversations: (state, action: PayloadAction<IConversation[]>) => {
      state.conversations = action.payload;
    },
    setActiveUserId: (state, action: PayloadAction<string | null>) => {
      state.activeUserId = action.payload;
    },
    setActiveMessages: (state, action: PayloadAction<IMessage[]>) => {
      state.activeMessages = action.payload;
    },
    appendMessage: (state, action: PayloadAction<IMessage>) => {
      const msg = action.payload;
      const matchesActive =
        !state.activeUserId ||
        msg.senderId === state.activeUserId ||
        msg.receiverId === state.activeUserId;

      if (matchesActive) {
        const exists = state.activeMessages.some((m) => m.id === msg.id);
        if (!exists) {
          state.activeMessages.push(msg);
        }
      }

      const conversationIndex = state.conversations.findIndex(
        (c) => c.otherUser.id === msg.senderId || c.otherUser.id === msg.receiverId
      );
      if (conversationIndex !== -1) {
        state.conversations[conversationIndex].lastMessage = msg;
      }
    },
    setUserTyping: (
      state,
      action: PayloadAction<{ userId: string; isTyping: boolean }>
    ) => {
      state.typingUsers[action.payload.userId] = action.payload.isTyping;
    },
    setUnreadTotal: (state, action: PayloadAction<number>) => {
      state.unreadTotal = Math.max(0, action.payload);
    },
    decrementUnread: (state, action: PayloadAction<number>) => {
      state.unreadTotal = Math.max(0, state.unreadTotal - action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    markOutgoingAsRead: (state, action: PayloadAction<string>) => {
      const readByUserId = action.payload;
      state.activeMessages = state.activeMessages.map((m) =>
        m.receiverId === readByUserId ? { ...m, isRead: true } : m
      );
    },
    markConversationAsReadState: (state, action: PayloadAction<string>) => {
      const otherUserId = action.payload;
      const conv = state.conversations.find((c) => c.otherUser.id === otherUserId);
      if (conv && conv.unreadCount > 0) {
        state.unreadTotal = Math.max(0, state.unreadTotal - conv.unreadCount);
        conv.unreadCount = 0;
      }
    },
  },
});

export const {
  setConversations,
  setActiveUserId,
  setActiveMessages,
  appendMessage,
  setUserTyping,
  setUnreadTotal,
  decrementUnread,
  setLoading,
  markOutgoingAsRead,
  markConversationAsReadState,
} = messagesSlice.actions;

export const messagesReducer = messagesSlice.reducer;
export default messagesSlice.reducer;
