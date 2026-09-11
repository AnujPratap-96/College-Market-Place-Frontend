import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Bell } from 'lucide-react';
import type { AppDispatch, RootState } from '@/store/store';
import { addNotification } from '@/store/notificationSlice';
import { getSocket } from '@/modules/messages/socket.client';
import { NotificationDropdown } from './NotificationDropdown';

export const NotificationBell = () => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.user);
  const { unreadCount } = useSelector((state: RootState) => state.notifications);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!user.isLoggedIn) {
      return;
    }

    const socket = getSocket();
    if (!socket) {
      return;
    }

    const handleServiceBooked = (payload: {
      orderId?: string;
      orderNumber?: string;
      message?: string;
    }) => {
      dispatch(
        addNotification({
          type: 'SERVICE',
          title: 'Service Booked',
          message:
            payload?.message ||
            `A new service booking (#${payload?.orderNumber || ''}) was requested.`,
          link: '/dashboard/orders',
        })
      );
    };

    const handleServiceCompleted = (payload: {
      orderId?: string;
      orderNumber?: string;
      message?: string;
    }) => {
      dispatch(
        addNotification({
          type: 'SERVICE',
          title: 'Service Completed',
          message:
            payload?.message ||
            `Service #${payload?.orderNumber || ''} has been marked completed.`,
          link: '/dashboard/orders',
        })
      );
    };

    const handleServicePaymentReleased = (payload: {
      orderId?: string;
      orderNumber?: string;
      message?: string;
    }) => {
      dispatch(
        addNotification({
          type: 'WALLET',
          title: 'Payment Released',
          message:
            payload?.message ||
            `Payment released for service #${payload?.orderNumber || ''}.`,
          link: '/dashboard/orders',
        })
      );
    };

    const handleNewSubscriber = (payload: {
      subscriptionId?: string;
      subscriptionNumber?: string;
      message?: string;
    }) => {
      dispatch(
        addNotification({
          type: 'SUBSCRIPTION',
          title: 'New Subscriber',
          message:
            payload?.message ||
            `A new subscriber joined plan #${payload?.subscriptionNumber || ''}.`,
          link: '/dashboard/subscriptions',
        })
      );
    };

    const handleVacationAlert = (payload: {
      subscriptionId?: string;
      subscriptionNumber?: string;
      pausedDays?: number;
      message?: string;
    }) => {
      dispatch(
        addNotification({
          type: 'SUBSCRIPTION',
          title: 'Vacation Break Alert',
          message:
            payload?.message ||
            `Subscriber paused deliveries for ${payload?.pausedDays || ''} days.`,
          link: '/dashboard/subscriptions',
        })
      );
    };

    const handleSubscriptionSettled = (payload: {
      subscriptionId?: string;
      payoutAmount?: number;
      message?: string;
    }) => {
      dispatch(
        addNotification({
          type: 'SUBSCRIPTION',
          title: 'Subscription Settled',
          message:
            payload?.message ||
            `Cycle ended and payout was credited to your wallet.`,
          link: '/dashboard/subscriptions',
        })
      );
    };

    const handleMissedDeliveryAlert = (payload: {
      subscriptionId?: string;
      deliveryId?: string;
      reason?: string;
      message?: string;
    }) => {
      dispatch(
        addNotification({
          type: 'SUBSCRIPTION',
          title: 'Missed Delivery Reported',
          message:
            payload?.message ||
            `A missed delivery was reported: ${payload?.reason || ''}.`,
          link: '/dashboard/subscriptions',
        })
      );
    };

    const handleDisputeResolved = (payload: {
      orderId?: string;
      orderNumber?: string;
      decision?: string;
      message?: string;
    }) => {
      dispatch(
        addNotification({
          type: 'DISPUTE',
          title: 'Dispute Resolved',
          message:
            payload?.message ||
            `Dispute on order #${payload?.orderNumber || ''} has been resolved.`,
          link: '/dashboard/orders',
        })
      );
    };

    const handleReceiveMessage = (payload: {
      senderId?: string;
      content?: string;
      sender?: { name?: string };
    }) => {
      const senderName = payload?.sender?.name;
      dispatch(
        addNotification({
          type: 'CHAT',
          title: senderName ? `Message from ${senderName}` : 'New Message',
          message: payload?.content || 'You have received a new message.',
          link: `/dashboard/messages?userId=${payload?.senderId || ''}`,
        })
      );
    };

    socket.on('service_booked', handleServiceBooked);
    socket.on('service_completed_by_provider', handleServiceCompleted);
    socket.on('service_payment_released', handleServicePaymentReleased);
    socket.on('subscription_new_subscriber', handleNewSubscriber);
    socket.on('subscription_vacation_alert', handleVacationAlert);
    socket.on('subscription_settled', handleSubscriptionSettled);
    socket.on('subscription_missed_delivery_alert', handleMissedDeliveryAlert);
    socket.on('dispute_resolved', handleDisputeResolved);
    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('service_booked', handleServiceBooked);
      socket.off('service_completed_by_provider', handleServiceCompleted);
      socket.off('service_payment_released', handleServicePaymentReleased);
      socket.off('subscription_new_subscriber', handleNewSubscriber);
      socket.off('subscription_vacation_alert', handleVacationAlert);
      socket.off('subscription_settled', handleSubscriptionSettled);
      socket.off('subscription_missed_delivery_alert', handleMissedDeliveryAlert);
      socket.off('dispute_resolved', handleDisputeResolved);
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [dispatch, user.isLoggedIn]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative inline-flex items-center justify-center p-2 rounded-full hover:bg-muted text-foreground transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-xs">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <NotificationDropdown
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationBell;
