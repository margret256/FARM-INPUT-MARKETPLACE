const DEFAULT_API_URL = 'http://localhost:3000/api';
 
export const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ??
  DEFAULT_API_URL;
 
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');
 
// Types
export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: string[];
}
 
export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: 'FARMER' | 'DEALER' | 'ADMIN';
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';
    createdAt: string;
    updatedAt: string;
  };
}
 
export function resolveApiAssetUrl(url: string) {
  if (/^(https?:|data:|file:)/.test(url)) {
    return url;
  }
 
  return `${API_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`;
}
 
// Get auth token from localStorage
function getAuthToken(): string | null {
  return localStorage.getItem('accessToken');
}
 
// Get user from localStorage
export function getCurrentUser(): AuthResponse['user'] | null {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
 
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}
 
// Check if user is authenticated and has admin role
export function isAuthenticated(): boolean {
  const token = getAuthToken();
  const user = getCurrentUser();
 
  if (!token || !user) return false;
 
  return user.role === 'ADMIN';
}
 
// Check if user is admin
export function isAdmin(): boolean {
  const user = getCurrentUser();
  return user?.role === 'ADMIN';
}
 
// Main API request function with auth support
export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  requireAuth: boolean = false,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
 
  if (options.headers) {
    const customHeaders = options.headers as Record<string, string>;
    Object.keys(customHeaders).forEach(key => {
      headers[key] = customHeaders[key];
    });
  }
 
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else if (requireAuth) {
    throw new Error('Authentication required');
  }
 
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
 
  // Only treat 401 as session expiry on protected routes, not on auth endpoints
  if (response.status === 401) {
    const isAuthEndpoint = path.startsWith('/auth/');
 
    if (!isAuthEndpoint) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
 
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
 
      throw new Error('Session expired. Please login again.');
    }
 
    // For auth endpoints, fall through to normal error handling below
    // so the backend's actual message ("Invalid login credentials",
    // "Verify your account before login", etc.) reaches the UI
  }
 
  if (!response.ok) {
    let errorMessage = `API request failed with status ${response.status}`;
    let errorData: ApiError | null = null;
 
    try {
      const errorBody = await response.json();
      errorData = errorBody;
 
      if (errorBody?.message) {
        errorMessage = Array.isArray(errorBody.message)
          ? errorBody.message.join(', ')
          : errorBody.message;
      } else if (errorBody?.error) {
        errorMessage = errorBody.error;
      }
    } catch {
      errorMessage = response.statusText || errorMessage;
    }
 
    const error = new Error(errorMessage) as Error & { statusCode?: number; data?: ApiError };
    error.statusCode = response.status;
    error.data = errorData || undefined;
 
    throw error;
  }
 
  const contentLength = response.headers.get('content-length');
  if (contentLength === '0') {
    return {} as T;
  }
 
  return response.json() as Promise<T>;
}
 
// Helper for GET requests
export async function get<T>(path: string, requireAuth: boolean = true): Promise<T> {
  return apiRequest<T>(path, { method: 'GET' }, requireAuth);
}
 
// Helper for POST requests
export async function post<T>(path: string, data?: any, requireAuth: boolean = true): Promise<T> {
  return apiRequest<T>(
    path,
    {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    },
    requireAuth,
  );
}
 
// Helper for PUT requests
export async function put<T>(path: string, data?: any, requireAuth: boolean = true): Promise<T> {
  return apiRequest<T>(
    path,
    {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    },
    requireAuth,
  );
}
 
// Helper for PATCH requests
export async function patch<T>(path: string, data?: any, requireAuth: boolean = true): Promise<T> {
  return apiRequest<T>(
    path,
    {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    },
    requireAuth,
  );
}
 
// Helper for DELETE requests
export async function del<T>(path: string, requireAuth: boolean = true): Promise<T> {
  return apiRequest<T>(path, { method: 'DELETE' }, requireAuth);
}
 
// Auth specific functions
export const auth = {
  login: async (identifier: string, password: string): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ identifier, password }),
      },
      false,
    );
 
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('user', JSON.stringify(response.user));
 
    return response;
  },
 
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  },
 
  getCurrentUser,
  isAuthenticated,
  isAdmin,
};

export async function uploadFile<T>(path: string, file: File): Promise<T> {
  const token = getAuthToken();
  if (!token) throw new Error('Authentication required');

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!response.ok) {
    let message = `Upload failed with status ${response.status}`;
    try {
      const body = await response.json();
      message = body?.message ?? message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}
 
// API endpoints organized by resource
export const api = {
  auth,
 
  users: {
    getAll: () => get<any[]>('/users'),
    getById: (id: string) => get<any>(`/users/${id}`),
    update: (id: string, data: any) => patch(`/users/${id}`, data),
    delete: (id: string) => del(`/users/${id}`),
    getProfile: () => get<any>('/users/profile'),
    updateProfile: (data: any) => patch<any>('/users/profile', data),
    uploadAvatar: (file: File) => uploadFile<{ avatarUrl: string }>('/users/profile/avatar', file),
  },
 
  dealers: {
    getAll: () => get<any[]>('/dealers'),
    getById: (id: string) => get<any>(`/dealers/${id}`),
    approve: (id: string, reviewNote?: string) =>
      patch(`/dealers/${id}/approve`, { reviewNote }),
    reject: (id: string, reviewNote?: string) =>
      patch(`/dealers/${id}/reject`, { reviewNote }),
    review: (id: string, data: { status: 'APPROVED' | 'REJECTED'; reviewNote?: string }) =>
      patch(`/dealers/${id}/review`, data),
  },
 
  products: {
    getAll: () => get<any[]>('/products'),
    getById: (id: string) => get<any>(`/products/${id}`),
    create: (data: any) => post('/products', data),
    update: (id: string, data: any) => patch(`/products/${id}`, data),
    delete: (id: string) => del(`/products/${id}`),
    getCategories: () => get<any[]>('/products/categories'),
  },
 
  orders: {
    getAll: () => get<any[]>('/orders'),
    getById: (id: string) => get<any>(`/orders/${id}`),
    updateStatus: (id: string, status: string) =>
      patch(`/orders/${id}/status`, { status }),
  },
 
  payments: {
    getAll: () => get<any[]>('/payments'),
    getById: (id: string) => get<any>(`/payments/${id}`),
  },

  
};