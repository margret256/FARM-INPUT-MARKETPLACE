import { apiClient } from './client';

export type DeliveryAddress = {
  id: string;
  userId: string;
  type: string;
  label: string;
  address: string;
  phone: string;
  isDefault: boolean;
};

export async function listDeliveryAddresses(userId?: string) {
  const response = await apiClient.get<{ items: DeliveryAddress[]; total: number }>(
    '/delivery-addresses',
    { params: { userId } },
  );
  return response.data;
}

export async function addDeliveryAddress(payload: Omit<DeliveryAddress, 'id'> & { id?: string }) {
  const response = await apiClient.post<DeliveryAddress>('/delivery-addresses', payload);
  return response.data;
}

export async function deleteDeliveryAddress(id: string, userId?: string) {
  const response = await apiClient.delete(`/delivery-addresses/${id}`, { params: { userId } });
  return response.data;
}

export async function setDefaultDeliveryAddress(id: string, userId?: string) {
  const response = await apiClient.patch<DeliveryAddress>(`/delivery-addresses/${id}/default`, undefined, {
    params: { userId },
  });
  return response.data;
}
