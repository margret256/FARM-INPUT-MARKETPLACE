import { apiClient } from './client';

export type ApiOrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export type ApiOrder = {
  id: string;
  number: string;
  userId: string;
  customer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  total: number;
  status: ApiOrderStatus;
  items?: any[];
  createdAt: string;
};

export async function listOrders(params: { userId?: string; dealerId?: string; status?: ApiOrderStatus } = {}) {
  const url = params.dealerId ? `/orders/dealer/${params.dealerId}` : '/orders';
  const response = await apiClient.get<{ items: ApiOrder[]; total: number }>(url, {
    params: { userId: params.userId, status: params.status },
  });
  return response.data;
}

export async function createOrder(payload: { userId: string; total: number; items?: any[] }) {
  const response = await apiClient.post<ApiOrder>('/orders', payload);
  return response.data;
}

export async function getOrder(id: string) {
  const response = await apiClient.get<ApiOrder>(`/orders/${id}`);
  return response.data;
}

export async function trackOrder(id: string) {
  const response = await apiClient.get<{ order: ApiOrder; timeline: any[] }>(`/orders/${id}/tracking`);
  return response.data;
}

export async function updateOrderStatus(id: string, status: ApiOrderStatus) {
  const response = await apiClient.patch<ApiOrder>(`/orders/${id}/status`, { status });
  return response.data;
}
