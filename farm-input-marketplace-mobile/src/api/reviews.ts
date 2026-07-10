import { apiClient } from './client';

export async function listReviews(params: { productId?: string; dealerId?: string; userId?: string } = {}) {
  const response = await apiClient.get<{ items: any[]; total: number; summary: any }>('/reviews', {
    params,
  });
  return response.data;
}

export async function createReview(payload: {
  userId?: string;
  productId?: string;
  dealerId?: string;
  rating: number;
  title?: string;
  comment?: string;
}) {
  const response = await apiClient.post('/reviews', payload);
  return response.data;
}
