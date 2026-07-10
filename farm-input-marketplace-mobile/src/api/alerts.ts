import { apiClient } from './client';

export type ApiAlert = {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export async function listAlerts(params: { userId?: string; type?: string; unread?: boolean } = {}) {
  const response = await apiClient.get<{ items: ApiAlert[]; total: number; unreadCount: number }>(
    '/alerts',
    { params },
  );
  return response.data;
}

export async function markAlertRead(id: string, userId?: string) {
  const response = await apiClient.patch<ApiAlert>(`/alerts/${id}/read`, undefined, {
    params: { userId },
  });
  return response.data;
}

export async function markAllAlertsRead(userId?: string) {
  const response = await apiClient.patch('/alerts/read-all', undefined, { params: { userId } });
  return response.data;
}

export async function deleteAlert(id: string, userId?: string) {
  const response = await apiClient.delete(`/alerts/${id}`, { params: { userId } });
  return response.data;
}
