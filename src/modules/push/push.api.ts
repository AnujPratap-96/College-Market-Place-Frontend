import Axios from '@/utils/Axios';

export const subscribeToPush = async (subscription: PushSubscription) => {
  return Axios.post('/push/subscribe', subscription);
};
