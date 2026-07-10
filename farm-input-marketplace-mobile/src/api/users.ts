import { apiClient } from './client';
import type { AuthUser } from '@/types/auth';

export type UpdateProfilePayload = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  businessName?: string;
  address?: string;
};

export async function getProfile() {
  const response = await apiClient.get<AuthUser>('/users/profile');
  return response.data;
}

export async function updateProfile(payload: UpdateProfilePayload) {
  const response = await apiClient.patch<AuthUser>('/users/profile', payload);
  return response.data;
}

export async function uploadProfileAvatar(file: { uri: string; name: string; mimeType: string }) {
  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.mimeType,
  } as unknown as Blob);

  const response = await apiClient.post<AuthUser>('/users/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}
