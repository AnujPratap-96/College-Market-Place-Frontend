import { useState, useRef, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Send, MessagesSquare, GraduationCap, Loader2, ArrowLeft } from 'lucide-react';
import type { RootState } from '@/store/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { IMessage } from '../message.types';
import { MessageBubble } from './MessageBubble';
import { ProductContextBanner } from './ProductContextBanner';
import { TypingIndicator } from './TypingIndicator';

export interface ChatWindowProps {
  recipient: {
    id: string;
    name: string;
    email?: string;
    college?: string;
    profileImage?: string;
  } | null;
  productContext?: {
    id: string;
    title: string;
    price: number;
    imageUrl?: string;
    type: string;
  } | null;
  messages: IMessage[];
  isTyping: boolean;
  onSendMessage: (content: string) => void;
  onTyping: (isTyping: boolean) => void;
  loading: boolean;
  onBack?: () => void;
}

const getInitials = (name?: string): string => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const ChatWindow = ({
  recipient,
  productContext,
  messages,
  isTyping,
  onSendMessage,
  onTyping,
  loading,
  onBack,
}: ChatWindowProps) => {
  const currentUserId = useSelector((state: RootState) => state.user?.id);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isTypingActiveRef = useRef(false);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopTyping = useCallback(() => {
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    if (isTypingActiveRef.current) {
      isTypingActiveRef.current = false;
      onTyping(false);
    }
  }, [onTyping]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);

    if (!isTypingActiveRef.current) {
      isTypingActiveRef.current = true;
      onTyping(true);
    }

    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }

    typingTimerRef.current = setTimeout(() => {
      isTypingActiveRef.current = false;
      onTyping(false);
    }, 2000);
  };

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;

    stopTyping();
    onSendMessage(trimmed);
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setInputText('');
    stopTyping();
  }, [recipient?.id, stopTyping]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!recipient) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-muted/10 h-full">
        <div className="size-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 shadow-xs">
          <MessagesSquare className="size-8" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          Your Messages
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Select a conversation from the left to start messaging.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/80 bg-card/60 backdrop-blur-xs shrink-0">
        {onBack && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="md:hidden size-8 -ml-1 text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
          >
            <ArrowLeft className="size-4" />
          </Button>
        )}
        <Avatar className="size-10 border border-border shrink-0">
          <AvatarImage src={recipient.profileImage} alt={recipient.name} />
          <AvatarFallback className="font-semibold text-xs bg-primary/10 text-primary">
            {getInitials(recipient.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-foreground truncate">
            {recipient.name}
          </h3>
          {recipient.college && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground truncate">
              <GraduationCap className="size-3 shrink-0" />
              <span className="truncate">{recipient.college}</span>
            </div>
          )}
        </div>
      </div>

      {productContext && <ProductContextBanner product={productContext} />}

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading && messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
            <MessagesSquare className="size-10 stroke-[1.5] mb-2 opacity-50" />
            <p className="text-sm font-semibold text-foreground">
              No messages yet
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              Say hello to start the conversation with {recipient.name}!
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isSelf = currentUserId
              ? message.senderId === currentUserId
              : message.senderId !== recipient.id;
            return (
              <MessageBubble
                key={message.id || `${message.senderId}-${message.createdAt}`}
                message={message}
                isSelf={isSelf}
              />
            );
          })
        )}

        {isTyping && (
          <div className="pt-1">
            <TypingIndicator name={recipient.name} />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-border/80 bg-card/60 backdrop-blur-xs shrink-0">
        <div className="flex items-end gap-2 max-w-4xl mx-auto">
          <textarea
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 bg-muted/40 border border-input rounded-xl px-3.5 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/50 resize-none max-h-32 min-h-[44px] leading-relaxed transition-all"
          />
          <Button
            type="button"
            onClick={handleSend}
            disabled={!inputText.trim()}
            size="icon"
            className="size-11 rounded-xl shrink-0 cursor-pointer"
          >
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
