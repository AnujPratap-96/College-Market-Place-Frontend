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
  productTitle: string;
  totalAmount: number;
  pickupOtp?: string | null;
  role: string;
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
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<AssistantApiResponse> => {
  const response = await Axios.post('/assistant/chat', { messages });
  return (response.data.data || response.data) as AssistantApiResponse;
};
