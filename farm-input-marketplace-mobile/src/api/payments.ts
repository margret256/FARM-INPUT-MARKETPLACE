import { apiClient } from './client';

export type PaymentMethod = {
  id: string;
  userId: string;
  type: string;
  provider: string;
  identifier: string;
  isDefault: boolean;
};

export async function listPaymentMethods(userId?: string) {
  const response = await apiClient.get<PaymentMethod[]>('/payments/methods', {
    params: { userId },
  });
  return response.data;
}

export async function addPaymentMethod(payload: Partial<PaymentMethod> & { userId?: string }) {
  const response = await apiClient.post<PaymentMethod>('/payments/methods', payload);
  return response.data;
}

export async function deletePaymentMethod(id: string, userId?: string) {
  const response = await apiClient.delete(`/payments/methods/${id}`, { params: { userId } });
  return response.data;
}

export async function initiateMobileMoney(payload: {
  userId?: string;
  orderId?: string;
  amount: number;
  phone: string;
  provider?: string;
}) {
  const response = await apiClient.post('/payments/mobile-money', payload);
  return response.data;
}
