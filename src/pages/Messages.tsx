import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/store/store';
import {
  setConversations,
  setActiveUserId,
  setActiveMessages,
  appendMessage,
  setUserTyping,
  setUnreadTotal,
  markOutgoingAsRead,
  markConversationAsReadState,
} from '@/store/messagesSlice';
import {
  fetchConversations,
  fetchMessages,
  markConversationRead,
} from '@/modules/messages/message.api';
import { fetchProductById } from '@/modules/products/product.api';
import { getSocket } from '@/modules/messages/socket.client';
import { ConversationList, ChatWindow } from '@/modules/messages/components';
import type { IMessage } from '@/modules/messages/message.types';

export const Messages = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();

  const urlUserId = searchParams.get('userId');
  const urlProductId = searchParams.get('productId');

  const { conversations, activeMessages, typingUsers } = useSelector(
    (state: RootState) => state.messages
  );

  const [selectedUserId, setSelectedUserId] = useState<string | null>(urlUserId || null);
  const [productContext, setProductContext] = useState<{
    id: string;
    title: string;
    price: number;
    imageUrl?: string;
    type: string;
  } | null>(null);
  const [fallbackRecipient, setFallbackRecipient] = useState<{
    id: string;
    name: string;
    email?: string;
    college?: string;
    profileImage?: string;
  } | null>(null);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [conversationsLoading, setConversationsLoading] = useState(false);

  const selectedUserIdRef = useRef<string | null>(selectedUserId);
  selectedUserIdRef.current = selectedUserId;

  useEffect(() => {
    if (urlUserId && urlUserId !== selectedUserId) {
      setSelectedUserId(urlUserId);
    }
  }, [urlUserId, selectedUserId]);

  useEffect(() => {
    if (!urlProductId) {
      setProductContext(null);
      return;
    }

    let isMounted = true;
    fetchProductById(urlProductId).then((res) => {
      if (!isMounted || !res.product) return;
      setProductContext({
        id: res.product.id,
        title: res.product.title,
        price: res.product.price,
        imageUrl: res.product.imageUrl || res.product.images?.[0] || '',
        type: res.product.type,
      });

      const rawOwner = res.product.owner || res.product.seller;
      if (rawOwner && rawOwner.id === urlUserId) {
        const profileImage =
          ('profileImage' in rawOwner ? rawOwner.profileImage : undefined) ||
          ('image' in rawOwner ? rawOwner.image : undefined);
        setFallbackRecipient({
          id: rawOwner.id,
          name: rawOwner.name || 'User',
          email: rawOwner.email,
          college: rawOwner.college,
          profileImage,
        });
      }
    });

    return () => {
      isMounted = false;
    };
  }, [urlProductId, urlUserId]);

  const loadConversations = useCallback(async () => {
    setConversationsLoading(true);
    const res = await fetchConversations();
    if (res.conversations) {
      dispatch(setConversations(res.conversations));
      const totalUnread = res.conversations.reduce(
        (acc, c) => acc + (c.unreadCount || 0),
        0
      );
      dispatch(setUnreadTotal(totalUnread));
    }
    setConversationsLoading(false);
  }, [dispatch]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleReceiveMessage = (message: IMessage) => {
      const currentSelected = selectedUserIdRef.current;
      const isCurrentThread =
        Boolean(currentSelected) &&
        (message.senderId === currentSelected || message.receiverId === currentSelected);

      if (isCurrentThread && currentSelected) {
        dispatch(appendMessage(message));
        if (message.senderId === currentSelected) {
          markConversationRead(currentSelected);
          socket.emit('mark_read', { fromUserId: currentSelected });
          dispatch(markConversationAsReadState(currentSelected));
        }
      }

      loadConversations();
    };

    const handleUserTyping = (data: { fromUserId: string; isTyping: boolean }) => {
      dispatch(setUserTyping({ userId: data.fromUserId, isTyping: data.isTyping }));
    };

    const handleMessagesRead = (data: { readBy: string }) => {
      dispatch(markOutgoingAsRead(data.readBy));
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('messages_read', handleMessagesRead);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('messages_read', handleMessagesRead);
    };
  }, [dispatch, loadConversations]);

  useEffect(() => {
    if (!selectedUserId) {
      dispatch(setActiveUserId(null));
      dispatch(setActiveMessages([]));
      return;
    }

    dispatch(setActiveUserId(selectedUserId));
    let isMounted = true;
    setMessagesLoading(true);

    const loadThread = async () => {
      const res = await fetchMessages(selectedUserId);
      if (isMounted) {
        if (res.messages) {
          dispatch(setActiveMessages(res.messages));
        }
        setMessagesLoading(false);
      }

      await markConversationRead(selectedUserId);
      dispatch(markConversationAsReadState(selectedUserId));

      const socket = getSocket();
      socket?.emit('mark_read', { fromUserId: selectedUserId });
    };

    loadThread();

    return () => {
      isMounted = false;
    };
  }, [selectedUserId, dispatch]);

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    const currentProductId = searchParams.get('productId');
    const currentUserId = searchParams.get('userId');
    if (currentProductId && currentUserId === userId) {
      setSearchParams({ userId, productId: currentProductId });
    } else {
      setSearchParams({ userId });
    }
  };

  const handleBack = () => {
    setSelectedUserId(null);
    setSearchParams({});
  };

  const handleSendMessage = (content: string) => {
    if (!selectedUserId) return;
    const socket = getSocket();
    const payload = {
      toUserId: selectedUserId,
      content,
      productId: productContext?.id,
    };

    if (socket) {
      socket.emit(
        'send_message',
        payload,
        (response?: { success: boolean; message?: IMessage }) => {
          if (response?.success && response.message) {
            dispatch(appendMessage(response.message));
            loadConversations();
          }
        }
      );
    }
  };

  const handleTyping = useCallback(
    (isTypingState: boolean) => {
      if (!selectedUserId) return;
      const socket = getSocket();
      socket?.emit('typing', { toUserId: selectedUserId, isTyping: isTypingState });
    },
    [selectedUserId]
  );

  const recipient = useMemo(() => {
    if (!selectedUserId) return null;

    const matchedConversation = conversations.find(
      (c) => c.otherUser?.id === selectedUserId
    );
    if (matchedConversation?.otherUser) {
      return matchedConversation.otherUser;
    }

    if (fallbackRecipient && fallbackRecipient.id === selectedUserId) {
      return fallbackRecipient;
    }

    const matchedMessage = activeMessages.find(
      (m) =>
        (m.senderId === selectedUserId && m.sender) ||
        (m.receiverId === selectedUserId && m.receiver)
    );
    if (matchedMessage) {
      const userObj =
        matchedMessage.senderId === selectedUserId
          ? matchedMessage.sender
          : matchedMessage.receiver;
      if (userObj) {
        return {
          id: userObj.id,
          name: userObj.name || 'User',
          college: userObj.college,
          profileImage: userObj.profileImage,
        };
      }
    }

    return {
      id: selectedUserId,
      name: 'User',
    };
  }, [selectedUserId, conversations, fallbackRecipient, activeMessages]);

  const isTyping = Boolean(selectedUserId && typingUsers[selectedUserId]);

  return (
    <div className="h-[calc(100vh-7rem)] min-h-[550px] rounded-2xl border border-border bg-card shadow-xs overflow-hidden flex">
      <div
        className={`
          h-full w-full md:w-80 lg:w-96 shrink-0
          ${selectedUserId ? 'hidden md:flex flex-col' : 'flex flex-col'}
        `}
      >
        <ConversationList
          conversations={conversations}
          selectedUserId={selectedUserId}
          onSelectUser={handleSelectUser}
          loading={conversationsLoading}
        />
      </div>
      <div
        className={`
          h-full flex-1 min-w-0
          ${selectedUserId ? 'flex flex-col' : 'hidden md:flex flex-col'}
        `}
      >
        <ChatWindow
          recipient={recipient}
          productContext={productContext}
          messages={activeMessages}
          isTyping={isTyping}
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
          loading={messagesLoading}
          onBack={handleBack}
        />
      </div>
    </div>
  );
};

export default Messages;
