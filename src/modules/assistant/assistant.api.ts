import Axios from "@/utils/Axios";

export interface AssistantProduct {
  id: string;
  title: string;
  price: number;
  type: string;
  category: string;
  status?: string;
  imageUrl?: string | null;
}

export interface AssistantOrder {
  id: string;
  orderNumber: string;
  status: string;
  productId?: string;
  productTitle: string;
  productImage?: string | null;
  productCategory?: string;
  totalAmount: number;
  pickupOtp?: string | null;
  role: string;
  counterparty?: string | null;
}

export interface AssistantWallet {
  balance: number;
  escrowBalance: number;
}

export interface AssistantApiResponse {
  message: string;
  products?: AssistantProduct[];
  orders?: AssistantOrder[];
  wallet?: AssistantWallet;
}

export const askAssistant = async (
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  category?: string
): Promise<AssistantApiResponse> => {
  const response = await Axios.post('/assistant/chat', { messages, category });
  return (response.data.data || response.data) as AssistantApiResponse;
};
