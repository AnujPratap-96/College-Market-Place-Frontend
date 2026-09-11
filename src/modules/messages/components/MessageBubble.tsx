import { Check, CheckCheck } from 'lucide-react';
import type { IMessage } from '../message.types';
import { cn } from '@/lib/utils';

export interface MessageBubbleProps {
  message: IMessage;
  isSelf: boolean;
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

export const MessageBubble = ({ message, isSelf }: MessageBubbleProps) => {
  const formattedTime = formatMessageTime(message.createdAt);

  return (
    <div className={cn('flex w-full', isSelf ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[78%] sm:max-w-[65%] px-3.5 py-2 text-sm shadow-xs transition-colors',
          isSelf
            ? 'bg-primary text-primary-foreground rounded-2xl rounded-tr-xs'
            : 'bg-muted text-foreground rounded-2xl rounded-tl-xs'
        )}
      >
        <p className="whitespace-pre-wrap break-words leading-relaxed text-[13.5px]">
          {message.content}
        </p>
        <div
          className={cn(
            'flex items-center gap-1 mt-1 text-[10px] select-none',
            isSelf
              ? 'justify-end text-primary-foreground/75'
              : 'justify-start text-muted-foreground'
          )}
        >
          <span>{formattedTime}</span>
          {isSelf && (
            message.isRead ? (
              <CheckCheck className="size-3.5 text-blue-200 shrink-0" />
            ) : (
              <Check className="size-3.5 text-primary-foreground/70 shrink-0" />
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
