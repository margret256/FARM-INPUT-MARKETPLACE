import { api, getCurrentUser, resolveApiAssetUrl } from './client';

export interface ProfileData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'FARMER' | 'DEALER' | 'ADMIN';
  status: string;
  avatarUrl?: string;
  // NOT confirmed to exist on the backend yet — see caveats above.
  location?: string;
  farmType?: string;
  farmSize?: string;
  cropsGrown?: string[];
  businessName?: string;
  businessLocation?: string;
}

export async function fetchProfile(): Promise<ProfileData> {
  const profile = await api.users.getProfile();
  return profile;
}

export interface UpdatableProfileFields {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  location?: string;
  farmType?: string;
  farmSize?: string;
  cropsGrown?: string[];
  businessName?: string;
  businessLocation?: string;
}

export async function saveProfile(fields: UpdatableProfileFields): Promise<ProfileData> {
  return api.users.updateProfile(fields);
}

export async function uploadAvatar(file: File): Promise<string> {
  const result = await api.users.uploadAvatar(file);
  return resolveApiAssetUrl(result.avatarUrl);
}

export { getCurrentUser };