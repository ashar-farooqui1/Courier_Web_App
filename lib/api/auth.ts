import { API_ROUTES } from "@/lib/api/config";
import { parseApiErrorMessage } from "@/lib/api/errors";
import { extractToken, normalizeAuthUser } from "@/lib/auth/normalize-user";
import { loginRoleFromUser, type AuthSession } from "@/lib/auth/role";
import type {
  LoginApiResponse,
  LoginRequest,
  LoginResponseData,
  OtpVerificationApiResponse,
} from "@/lib/types/user";

export class EmailNotVerifiedError extends Error {
  readonly email: string;

  constructor(email: string, message: string) {
    super(message);
    this.name = "EmailNotVerifiedError";
    this.email = email;
  }
}

export function isEmailNotVerifiedMessage(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("email not verified") ||
    normalized.includes("not verified") ||
    normalized.includes("verify your email") ||
    normalized.includes("email verification") ||
    normalized.includes("check your email for otp")
  );
}

export function isEmailNotVerifiedError(error: unknown): boolean {
  if (error instanceof EmailNotVerifiedError) return true;
  if (error instanceof Error) {
    if (error.name === "EmailNotVerifiedError") return true;
    return isEmailNotVerifiedMessage(error.message);
  }
  return false;
}

export function getEmailNotVerifiedMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

function unwrapLoginData(payload: LoginApiResponse): LoginResponseData {
  const data = payload.data;
  if (!data || typeof data !== "object") {
    throw new Error("Login succeeded but user data was missing.");
  }

  const nested = data.user;
  if (nested && typeof nested === "object") {
    return {
      ...data,
      ...(nested as LoginResponseData),
    };
  }

  return data;
}

export async function login(credentials: LoginRequest): Promise<AuthSession> {
  const response = await fetch(`/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(credentials),
  });

  const text = await response.text();
  let payload: LoginApiResponse;

  try {
    payload = JSON.parse(text) as LoginApiResponse;
  } catch {
    throw new Error(parseApiErrorMessage(text, "Login failed"));
  }

  if (!response.ok || payload.success === false) {
    const message = parseApiErrorMessage(payload, "Invalid email or password");
    if (isEmailNotVerifiedMessage(message)) {
      throw new EmailNotVerifiedError(credentials.email.trim(), message);
    }
    throw new Error(message);
  }

  const data = unwrapLoginData(payload);
  const user = normalizeAuthUser(data, credentials.email.trim());
  const role = loginRoleFromUser(user);
  const token = extractToken(data);

  return { role, user, token };
}

const OTP_VERIFICATION_TYPE = "string";
const OTP_VERIFICATION_ROLE_ID = 3;

export async function verifyOtp(email: string, otp: number): Promise<string> {
  const response = await fetch("/api/auth/otp-verification", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      otp,
      email: email.trim(),
      type: OTP_VERIFICATION_TYPE,
      roleId: OTP_VERIFICATION_ROLE_ID,
    }),
  });

  const text = await response.text();
  let payload: OtpVerificationApiResponse;

  try {
    payload = JSON.parse(text) as OtpVerificationApiResponse;
  } catch {
    if (response.ok && (text === "true" || !text)) {
      return "Email verified successfully. You can sign in now.";
    }
    throw new Error(parseApiErrorMessage(text, "OTP verification failed"));
  }

  if (!response.ok || payload.success === false) {
    throw new Error(parseApiErrorMessage(payload, "OTP verification failed"));
  }

  if (payload.success === true || payload.data === "success") {
    return payload.message ?? "Email verified successfully. You can sign in now.";
  }

  return payload.message ?? "Email verified successfully. You can sign in now.";
}

export { API_ROUTES };
