import Axios from '@/utils/Axios';
import { isAxiosError } from 'axios';
import type { IConversation, IMessage } from './message.types';

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (isAxiosError(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      fallback
    );
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
};

export const fetchConversations = async (): Promise<{
  conversations?: IConversation[];
  error?: string;
}> => {
  try {
    const res = await Axios.get('/messages/conversations');
    const raw = res.data?.data?.conversations || res.data?.conversations || [];
    const conversations: IConversation[] = Array.isArray(raw)
      ? raw.map((c: any) => ({
          ...c,
          otherUser: c.otherUser || c.user,
        }))
      : [];
    return { conversations };
  } catch (error: unknown) {
    return { error: getErrorMessage(error, 'Failed to fetch conversations') };
  }
};

export const fetchMessages = async (
  otherUserId: string
): Promise<{ messages?: IMessage[]; error?: string }> => {
  try {
    let res;
    try {
      res = await Axios.get(`/messages/${otherUserId}`);
    } catch (err: unknown) {
      if (isAxiosError(err) && err.response?.status === 404) {
        res = await Axios.get(`/messages/conversation/${otherUserId}`);
      } else {
        throw err;
      }
    }
    const messages = res.data?.data?.messages || res.data?.messages || [];
    return { messages };
  } catch (error: unknown) {
    return { error: getErrorMessage(error, 'Failed to fetch messages') };
  }
};

export const fetchUnreadCount = async (): Promise<{
  unreadCount?: number;
  error?: string;
}> => {
  try {
    const res = await Axios.get('/messages/unread-count');
    const unreadCount =
      res.data?.data?.unreadCount ?? res.data?.unreadCount ?? 0;
    return { unreadCount };
  } catch (error: unknown) {
    return { error: getErrorMessage(error, 'Failed to fetch unread count') };
  }
};

export const markConversationRead = async (
  otherUserId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    try {
      await Axios.patch(`/messages/${otherUserId}/read`);
    } catch (err: unknown) {
      if (
        isAxiosError(err) &&
        (err.response?.status === 404 || err.response?.status === 405)
      ) {
        await Axios.post(`/messages/read/${otherUserId}`);
      } else {
        throw err;
      }
    }
    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error, 'Failed to mark conversation as read'),
    };
  }
};
