import { apiClient } from './client';
import type { DealerDocumentPayload, DealerRegisterPayload, RegisterResponse } from '@/types/auth';

export type DealerDocumentUpload = {
  type: string;
  name: string;
  uri: string;
  mimeType: string;
};

export async function uploadDealerDocument(document: DealerDocumentUpload) {
  try {
    console.log('Uploading document:', { type: document.type, name: document.name, uri: document.uri });

    const formData = new FormData();
    formData.append('type', document.type);

    // For Expo/React Native - append file with uri property
    const fileBlob = {
      uri: document.uri,
      name: document.name,
      type: document.mimeType,
    } as unknown as Blob;

    formData.append('file', fileBlob);

    const apiUrl = String(apiClient.defaults.baseURL ?? '').replace(/\/$/, '');
    console.log('Uploading to:', apiUrl);

    const response = await fetch(`${apiUrl}/dealers/documents/upload`, {
      method: 'POST',
      body: formData,
    });

    console.log('Upload response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload error response:', errorText);
      throw new Error(`Upload failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('Document uploaded successfully:', data);
    return data;
  } catch (error: any) {
    const errorMessage = error?.message || 'Document upload failed';
    console.error('Document upload error:', errorMessage);
    throw error;
  }
}

export async function registerDealerApplication(payload: DealerRegisterPayload) {
  try {
    console.log('Registering dealer with payload:', { email: payload.email, businessName: payload.businessName });
    const response = await apiClient.post<RegisterResponse>('/auth/register/dealer', payload);
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
    console.error('Registration error:', errorMessage);
    throw error;
  }
}

