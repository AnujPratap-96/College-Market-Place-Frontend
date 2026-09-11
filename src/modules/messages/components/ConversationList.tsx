import { useState, useMemo } from 'react';
import { Search, GraduationCap, MessageSquare, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { IConversation } from '../message.types';

export interface ConversationListProps {
  conversations: IConversation[];
  selectedUserId: string | null;
  onSelectUser: (userId: string) => void;
  loading: boolean;
}

const getInitials = (name?: string): string => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const formatConversationTime = (dateStr?: string): string => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    const now = new Date();

    const isSameDay =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isSameDay) {
      return date.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();

    if (isYesterday) {
      return 'Yesterday';
    }

    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }

    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
};

export const ConversationList = ({
  conversations,
  selectedUserId,
  onSelectUser,
  loading,
}: ConversationListProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase().trim();
    return conversations.filter((conv) => {
      const nameMatch = conv.otherUser?.name?.toLowerCase().includes(q);
      const msgMatch = conv.lastMessage?.content?.toLowerCase().includes(q);
      const collegeMatch = conv.otherUser?.college?.toLowerCase().includes(q);
      return Boolean(nameMatch || msgMatch || collegeMatch);
    });
  }, [conversations, searchQuery]);

  return (
    <div className="flex flex-col h-full bg-card border-r border-border/70 overflow-hidden">
      <div className="p-3.5 border-b border-border/70">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="pl-9 pr-8 h-9 text-xs bg-muted/40"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {loading && conversations.length === 0 ? (
          <div className="p-3 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-2.5 rounded-xl animate-pulse"
              >
                <div className="size-11 rounded-full bg-muted shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-muted rounded w-2/3" />
                  <div className="h-2.5 bg-muted rounded w-4/5" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
            <div className="size-12 rounded-2xl bg-muted/60 flex items-center justify-center mb-3">
              <MessageSquare className="size-6 opacity-60" />
            </div>
            {searchQuery ? (
              <>
                <p className="text-sm font-semibold text-foreground">
                  No conversations found
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  No matches for &ldquo;{searchQuery}&rdquo;
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-foreground">
                  No messages yet
                </p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                  When you chat with buyers or sellers, conversations will appear here.
                </p>
              </>
            )}
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const isSelected = selectedUserId === conv.otherUser?.id;
            return (
              <button
                key={conv.otherUser?.id}
                type="button"
                onClick={() => onSelectUser(conv.otherUser?.id)}
                className={cn(
                  'w-full flex items-start gap-3 p-3 rounded-xl text-left transition-colors cursor-pointer border',
                  isSelected
                    ? 'bg-primary/10 border-primary/30 shadow-xs'
                    : 'hover:bg-muted/60 border-transparent'
                )}
              >
                <div className="relative shrink-0">
                  <Avatar className="size-11 border border-border">
                    <AvatarImage
                      src={conv.otherUser?.profileImage}
                      alt={conv.otherUser?.name}
                    />
                    <AvatarFallback className="font-semibold text-xs bg-primary/10 text-primary">
                      {getInitials(conv.otherUser?.name)}
                    </AvatarFallback>
                  </Avatar>
                  {conv.unreadCount > 0 && !isSelected && (
                    <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-primary ring-2 ring-background" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-1 mb-0.5">
                    <h4
                      className={cn(
                        'text-sm truncate',
                        conv.unreadCount > 0 && !isSelected
                          ? 'font-bold text-foreground'
                          : 'font-semibold text-foreground'
                      )}
                    >
                      {conv.otherUser?.name}
                    </h4>
                    <span className="text-[11px] text-muted-foreground shrink-0">
                      {formatConversationTime(conv.lastMessage?.createdAt)}
                    </span>
                  </div>

                  {conv.otherUser?.college && (
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground truncate mb-1">
                      <GraduationCap className="size-3 shrink-0" />
                      <span className="truncate">{conv.otherUser.college}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={cn(
                        'text-xs truncate',
                        conv.unreadCount > 0 && !isSelected
                          ? 'font-medium text-foreground'
                          : 'text-muted-foreground'
                      )}
                    >
                      {conv.lastMessage?.content || 'No messages yet'}
                    </p>

                    {conv.unreadCount > 0 && !isSelected && (
                      <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground shrink-0 shadow-xs">
                        {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ConversationList;
