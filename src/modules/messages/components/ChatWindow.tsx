import { useState, useRef, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  Send,
  MessagesSquare,
  GraduationCap,
  Loader2,
  ArrowLeft,
  Image as ImageIcon,
  Mic,
  Square,
  Trash2,
  Handshake,
} from 'lucide-react';
import type { RootState } from '@/store/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import type { IMessage } from '../message.types';
import { MessageBubble } from './MessageBubble';
import { ProductContextBanner } from './ProductContextBanner';
import { TypingIndicator } from './TypingIndicator';
import { MakeOfferModal } from '@/modules/negotiations/components/MakeOfferModal';
import { uploadChatMediaApi } from '../message.api';

export interface ChatSendMessageData {
  content?: string;
  mediaType?: 'TEXT' | 'IMAGE' | 'AUDIO';
  mediaUrl?: string;
  audioDuration?: number;
}

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
  onSendMessage: (data: ChatSendMessageData | string) => void;
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
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
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
    onSendMessage({
      content: trimmed,
      mediaType: 'TEXT',
    });
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Only image photos are supported. Videos are not allowed.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size exceeds 10MB limit.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    try {
      setIsUploadingMedia(true);
      const res = await uploadChatMediaApi(file);
      setIsUploadingMedia(false);

      if (res.error || !res.mediaUrl) {
        toast.error(res.error || 'Failed to upload photo.');
      } else {
        onSendMessage({
          content: 'Sent a photo',
          mediaType: 'IMAGE',
          mediaUrl: res.mediaUrl,
        });
      }
    } catch {
      setIsUploadingMedia(false);
      toast.error('Failed to upload photo.');
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 120) {
            stopAndSendRecording();
            return 120;
          }
          return prev + 1;
        });
      }, 1000);
    } catch {
      toast.error('Microphone permission denied or not available.');
    }
  };

  const cancelRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
    audioChunksRef.current = [];
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  const stopAndSendRecording = () => {
    if (!mediaRecorderRef.current) return;

    const duration = recordingSeconds;
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      setRecordingSeconds(0);

      if (duration < 1) {
        toast.info('Voice note too short.');
        return;
      }

      try {
        setIsUploadingMedia(true);
        const res = await uploadChatMediaApi(audioBlob, `voice-${Date.now()}.webm`);
        setIsUploadingMedia(false);

        if (res.error || !res.mediaUrl) {
          toast.error(res.error || 'Failed to upload voice note.');
        } else {
          onSendMessage({
            content: 'Voice note',
            mediaType: 'AUDIO',
            mediaUrl: res.mediaUrl,
            audioDuration: duration,
          });
        }
      } catch {
        setIsUploadingMedia(false);
        toast.error('Failed to send voice note.');
      }
    };

    mediaRecorderRef.current.stop();
  };

  const formatRecordingTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  useEffect(() => {
    setInputText('');
    stopTyping();
    cancelRecording();
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

        {productContext && productContext.type === 'SELL' && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 gap-1 text-xs border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50/20"
            onClick={() => setIsOfferModalOpen(true)}
          >
            <Handshake className="size-3.5" />
            Make Offer
          </Button>
        )}
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
              Say hello or make an offer to start the conversation with {recipient.name}!
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
                currentUserId={currentUserId}
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
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {isRecording ? (
          <div className="flex items-center justify-between gap-3 max-w-4xl mx-auto bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-destructive animate-pulse" />
              <span className="text-xs font-medium text-destructive">
                Recording Voice Note... ({formatRecordingTime(recordingSeconds)})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 rounded-lg text-muted-foreground hover:text-destructive"
                onClick={cancelRecording}
              >
                <Trash2 className="size-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                className="h-8 gap-1.5 bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs"
                onClick={stopAndSendRecording}
              >
                <Square className="size-3 fill-current" />
                Done & Send
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-end gap-2 max-w-4xl mx-auto">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={isUploadingMedia}
              onClick={() => fileInputRef.current?.click()}
              className="size-11 rounded-xl shrink-0 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              {isUploadingMedia ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <ImageIcon className="size-5" />
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={isUploadingMedia}
              onClick={startRecording}
              className="size-11 rounded-xl shrink-0 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <Mic className="size-5" />
            </Button>

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
        )}
      </div>

      {productContext && (
        <MakeOfferModal
          isOpen={isOfferModalOpen}
          onClose={() => setIsOfferModalOpen(false)}
          product={productContext}
          onOfferCreated={() => {
            setIsOfferModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default ChatWindow;
