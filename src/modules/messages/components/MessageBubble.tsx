import React, { useState, useRef, useEffect } from 'react';
import { Check, CheckCheck, Play, Pause } from 'lucide-react';
import type { IMessage } from '../message.types';
import { NegotiationCard } from '@/modules/negotiations/components/NegotiationCard';
import { cn } from '@/lib/utils';

export interface MessageBubbleProps {
  message: IMessage;
  isSelf: boolean;
  currentUserId?: string;
  onOfferUpdated?: (offer: any) => void;
}

const formatMessageTime = (isoString?: string): string => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '';
  }
};

const formatAudioTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isSelf,
  currentUserId,
  onOfferUpdated,
}) => {
  const formattedTime = formatMessageTime(message.createdAt);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(message.audioDuration || 0);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => {
      if (!isNaN(audio.duration) && audio.duration > 0) {
        setDuration(Math.round(audio.duration));
      }
    };
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, [message.mediaUrl]);

  return (
    <div className={cn('flex w-full flex-col', isSelf ? 'items-end' : 'items-start')}>
      {message.offer ? (
        <NegotiationCard
          offer={message.offer}
          currentUserId={currentUserId || ''}
          onUpdated={onOfferUpdated}
        />
      ) : (
        <div
          className={cn(
            'max-w-[85%] sm:max-w-[70%] px-3.5 py-2 text-sm shadow-xs transition-colors rounded-2xl',
            isSelf
              ? 'bg-primary text-primary-foreground rounded-tr-xs'
              : 'bg-muted text-foreground rounded-tl-xs'
          )}
        >
          {message.mediaType === 'IMAGE' && message.mediaUrl && (
            <div className="mb-2 overflow-hidden rounded-xl">
              <img
                src={message.mediaUrl}
                alt="Shared in chat"
                className="max-h-64 w-auto rounded-lg object-cover cursor-pointer hover:opacity-95 transition-opacity"
                onClick={() => window.open(message.mediaUrl, '_blank')}
              />
            </div>
          )}

          {message.mediaType === 'AUDIO' && message.mediaUrl && (
            <div className="flex items-center gap-3 py-1 min-w-[220px]">
              <audio ref={audioRef} src={message.mediaUrl} preload="metadata" />
              <button
                type="button"
                onClick={toggleAudio}
                className={cn(
                  'size-9 rounded-full flex items-center justify-center shrink-0 cursor-pointer shadow-xs transition-transform active:scale-95',
                  isSelf
                    ? 'bg-white/20 hover:bg-white/30 text-primary-foreground'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                )}
              >
                {isPlaying ? <Pause className="size-4 fill-current" /> : <Play className="size-4 fill-current ml-0.5" />}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-0.5 h-6">
                  {[40, 70, 90, 45, 60, 100, 75, 50, 85, 65, 95, 40, 55, 80].map((h, i) => {
                    const progress = duration > 0 ? currentTime / duration : 0;
                    const barProgress = i / 14;
                    const active = barProgress <= progress;
                    return (
                      <div
                        key={i}
                        className={cn(
                          'w-1 rounded-full transition-colors',
                          active
                            ? isSelf
                              ? 'bg-white'
                              : 'bg-primary'
                            : isSelf
                            ? 'bg-white/30'
                            : 'bg-muted-foreground/30'
                        )}
                        style={{ height: `${h}%` }}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-between items-center text-[10px] mt-0.5 opacity-80 font-mono">
                  <span>{formatAudioTime(currentTime)}</span>
                  <span>{formatAudioTime(duration)}</span>
                </div>
              </div>
            </div>
          )}

          {message.content &&
            message.content !== 'Sent a photo' &&
            message.content !== 'Voice note' && (
              <p className="whitespace-pre-wrap break-words leading-relaxed text-[13.5px]">
                {message.content}
              </p>
            )}

          <div
            className={cn(
              'flex items-center gap-1 mt-1 text-[10px] select-none',
              isSelf ? 'justify-end text-primary-foreground/75' : 'justify-start text-muted-foreground'
            )}
          >
            <span>{formattedTime}</span>
            {isSelf &&
              (message.isRead ? (
                <CheckCheck className="size-3.5 text-blue-200 shrink-0" />
              ) : (
                <Check className="size-3.5 text-primary-foreground/70 shrink-0" />
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
