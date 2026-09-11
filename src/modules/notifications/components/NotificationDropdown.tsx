import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Repeat,
  Wallet,
  AlertTriangle,
  MessageSquare,
  BellOff,
} from 'lucide-react';
import type { AppDispatch, RootState } from '@/store/store';
import { markAllRead, markAsRead } from '@/store/notificationSlice';
import type {
  INotification,
  NotificationType,
} from '@/modules/notifications/notification.types';

export interface NotificationDropdownProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const formatRelativeTime = (isoDate: string): string => {
  const date = new Date(isoDate);
  const now = new Date();
  const diffInSeconds = Math.max(
    0,
    Math.floor((now.getTime() - date.getTime()) / 1000)
  );

  if (diffInSeconds < 60) {
    return 'Just now';
  }
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }
  return date.toLocaleDateString();
};

const renderIcon = (type: NotificationType) => {
  switch (type) {
    case 'ORDER':
    case 'SERVICE':
      return <ShoppingBag className="size-4 text-blue-500 shrink-0" />;
    case 'SUBSCRIPTION':
      return <Repeat className="size-4 text-emerald-500 shrink-0" />;
    case 'WALLET':
      return <Wallet className="size-4 text-amber-500 shrink-0" />;
    case 'DISPUTE':
      return <AlertTriangle className="size-4 text-rose-500 shrink-0" />;
    case 'CHAT':
      return <MessageSquare className="size-4 text-indigo-500 shrink-0" />;
    default:
      return <ShoppingBag className="size-4 text-blue-500 shrink-0" />;
  }
};

export const NotificationDropdown = ({
  isOpen = true,
  onClose,
}: NotificationDropdownProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { notifications, unreadCount } = useSelector(
    (state: RootState) => state.notifications
  );

  if (!isOpen) {
    return null;
  }

  const handleItemClick = (notification: INotification) => {
    dispatch(markAsRead(notification.id));
    if (notification.link) {
      navigate(notification.link);
    }
    onClose?.();
  };

  const handleMarkAllRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(markAllRead());
  };

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-border bg-popover text-popover-foreground shadow-2xl z-50 overflow-hidden flex flex-col max-h-[480px]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/40">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold tracking-tight text-foreground">
            Notifications
          </span>
          {unreadCount > 0 && (
            <span className="rounded-full bg-orange-500/15 dark:bg-orange-500/25 text-orange-600 dark:text-orange-400 text-xs font-semibold px-2 py-0.5">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="text-xs font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 transition-colors cursor-pointer"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-border/60">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
            <BellOff className="size-8 mb-2 opacity-50" />
            <p className="text-sm font-medium text-foreground">No notifications</p>
            <p className="text-xs mt-0.5">You're all caught up!</p>
          </div>
        ) : (
          notifications.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => handleItemClick(n)}
              className={`w-full text-left flex items-start gap-3 p-3.5 transition-colors hover:bg-muted/60 cursor-pointer ${
                !n.isRead ? 'bg-orange-50/50 dark:bg-orange-950/20' : ''
              }`}
            >
              <div className="p-2 rounded-lg shrink-0 bg-muted">
                {renderIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-1">
                  <p
                    className={`text-xs font-medium truncate ${
                      !n.isRead
                        ? 'font-semibold text-foreground'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {n.title}
                  </p>
                  <span className="text-[10px] text-muted-foreground shrink-0 whitespace-nowrap ml-1">
                    {formatRelativeTime(n.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                  {n.message}
                </p>
              </div>
              {!n.isRead && (
                <span className="size-2 mt-1.5 rounded-full bg-orange-500 shrink-0" />
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;
