import { apiClient } from './client';

export type ProductCategory = {
  id: string;
  name: string;
};

export type DealerProductScope = {
  dealerId?: string;
  userId?: string;
};

export type ProductStockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export type DealerProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  dealerId: string;
  categoryId: string;
  sku: string;
  stockStatus: ProductStockStatus;
  statusLabel: string;
  statusDetail: string;
  category: ProductCategory;
  dealer: {
    id: string;
    businessName: string;
    verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  };
  createdAt: string;
  updatedAt: string;
};

export type ProductStats = {
  totalItems: number;
  lowStock: number;
  outOfStock: number;
  activeValue: number;
  inStock: number;
  orders: number;
  totalSales: number;
  revenue: number;
  lowStockThreshold: number;
};

export type CreateProductPayload = DealerProductScope & {
  categoryId?: string;
  categoryName?: string;
  name: string;
  description: string;
  price: number;
  stock: number;
};

export type UpdateProductPayload = DealerProductScope & {
  categoryId?: string;
  categoryName?: string;
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
};

export type ListProductsParams = DealerProductScope & {
  categoryId?: string;
  search?: string;
};

export async function listProductCategories() {
  const response = await apiClient.get<ProductCategory[]>('/products/categories');
  return response.data;
}

export async function createProduct(payload: CreateProductPayload) {
  const response = await apiClient.post<DealerProduct>('/products', payload);
  return response.data;
}

export async function listProducts(params: ListProductsParams = {}) {
  const response = await apiClient.get<{ items: DealerProduct[]; total: number }>(
    '/products',
    { params },
  );
  return response.data;
}

export async function getProduct(id: string) {
  const response = await apiClient.get<DealerProduct>(`/products/${id}`);
  return response.data;
}

export async function compareProductPrices(params: ListProductsParams & { productId?: string } = {}) {
  const response = await apiClient.get<{
    items: DealerProduct[];
    total: number;
    lowestPrice: number;
    highestPrice: number;
    averagePrice: number;
  }>('/products/compare-prices', { params });
  return response.data;
}

export async function getProductStats(params: DealerProductScope = {}) {
  const response = await apiClient.get<ProductStats>('/products/stats', {
    params,
  });
  return response.data;
}

export async function updateProduct(id: string, payload: UpdateProductPayload) {
  const response = await apiClient.patch<DealerProduct>(`/products/${id}`, payload);
  return response.data;
}

export async function deleteProduct(id: string, params: DealerProductScope) {
  const response = await apiClient.delete<DealerProduct>(`/products/${id}`, {
    params,
  });
  return response.data;
}
