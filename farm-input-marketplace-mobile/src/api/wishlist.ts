import { apiClient } from './client';

export type WishlistItem = {
  id: string;
  userId: string;
  productId?: string;
  product?: any;
  createdAt: string;
};

export async function listWishlist(userId?: string) {
  const response = await apiClient.get<{ items: WishlistItem[]; total: number }>('/wishlist', {
    params: { userId },
  });
  return response.data;
}

export async function addWishlistItem(payload: { userId?: string; productId?: string; product?: any }) {
  const response = await apiClient.post<WishlistItem>('/wishlist/items', payload);
  return response.data;
}

export async function removeWishlistItem(id: string, userId?: string) {
  const response = await apiClient.delete(`/wishlist/items/${id}`, { params: { userId } });
  return response.data;
}
