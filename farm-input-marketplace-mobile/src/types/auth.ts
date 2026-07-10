export type UserRole = 'FARMER' | 'DEALER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';

export type AuthUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string | null;
  dealer?: {
    id: string;
    businessName: string;
    phone?: string;
    address?: string;
    verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  };
};

export type RegisterPayload = {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type DealerRegisterPayload = {
  businessName: string;
  ownerName: string;
  businessLocation: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  documents?: DealerDocumentPayload[];
};

export type DealerDocumentPayload = {
  type: string;
  name: string;
  url: string;
  mimeType?: string;
};

export type LoginPayload = {
  identifier: string;
  password: string;
};

export type VerifyOtpPayload = {
  identifier: string;
  code: string;
};

export type AuthResponse = {
  accessToken: string;
  user: AuthUser;
};

export type RegisterResponse = {
  message: string;
  otpSent: boolean;
  user: AuthUser;
  dealer?: {
    id: string;
    businessName: string;
    verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
    documents?: DealerDocumentPayload[];
  };
};
