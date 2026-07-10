import { apiClient } from './client';

export type CartItem = {
  id: string;
  productId?: string;
  product?: any;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type CartResponse = {
  userId: string;
  items: CartItem[];
  summary: {
    subtotal: number;
    deliveryFee: number;
    tax: number;
    total: number;
    itemCount: number;
  };
};

export async function getCart(userId?: string) {
  const response = await apiClient.get<CartResponse>('/cart', { params: { userId } });
  return response.data;
}

export async function addCartItem(payload: { userId?: string; productId?: string; product?: any; quantity?: number }) {
  const response = await apiClient.post<CartItem>('/cart/items', payload);
  return response.data;
}

export async function updateCartItem(id: string, payload: { userId?: string; quantity: number }) {
  const response = await apiClient.patch<CartItem>(`/cart/items/${id}`, payload);
  return response.data;
}

export async function removeCartItem(id: string, userId?: string) {
  const response = await apiClient.delete(`/cart/items/${id}`, { params: { userId } });
  return response.data;
}

export async function checkoutCart(payload: { userId?: string; deliveryAddressId?: string; paymentMethodId?: string }) {
  const response = await apiClient.post<CartResponse & { readyForOrder: boolean }>('/cart/checkout', payload);
  return response.data;
}
