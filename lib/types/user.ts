export interface AuthUser {
  userId: number;
  email: string;
  displayName: string;
  roleId: number;
  roleName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface OtpVerificationRequest {
  otp: number;
  email: string;
  type: string;
  roleId: number;
}

export interface OtpVerificationApiResponse {
  success?: boolean;
  message?: string;
  data?: unknown;
}

export interface LoginApiResponse {
  success: boolean;
  message?: string;
  data?: LoginResponseData | null;
}

/** Shape varies by role — normalize in auth layer. */
export interface LoginResponseData {
  token?: string;
  accessToken?: string;
  userId?: number;
  id?: number;
  email?: string;
  userName?: string;
  name?: string;
  adminName?: string;
  clientName?: string;
  roleId?: number;
  roleName?: string;
  [key: string]: unknown;
}
