import { apiRequest } from '../lib/api';

export interface AuthUser {
  id: number;
  username: string;
  role: 'admin';
  created_at?: string | null;
  updated_at?: string | null;
}

interface AuthPayload {
  user: AuthUser;
  token: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export async function loginRequest(username: string, password: string): Promise<AuthPayload> {
  const response = await apiRequest<AuthPayload>('/auth/login', {
    method: 'POST',
    body: { username, password },
  });

  return response.data;
}

export async function logoutRequest(token: string): Promise<void> {
  await apiRequest<null>('/auth/logout', {
    method: 'POST',
    token,
  });
}

export async function getCurrentUser(token: string): Promise<AuthUser> {
  const response = await apiRequest<AuthUser>('/user', {
    token,
  });

  return response.data;
}

export async function changePasswordRequest(
  payload: ChangePasswordPayload,
  token: string,
): Promise<void> {
  await apiRequest<null>('/auth/password', {
    method: 'PUT',
    token,
    body: payload,
  });
}
