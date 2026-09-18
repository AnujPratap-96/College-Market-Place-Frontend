import { useEffect } from 'react';
import { subscribeToPush } from '@/modules/push/push.api';

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export const usePushNotifications = () => {
  useEffect(() => {
    const initPush = async () => {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        try {
          const registration = await navigator.serviceWorker.register('/service-worker.js');
          
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            const publicVapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
            if (!publicVapidKey) return;
            
            const subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
            });
            
            await subscribeToPush(subscription);
          }
        } catch (err) {
          console.error('Service Worker registration failed:', err);
        }
      }
    };
    initPush();
  }, []);
};
