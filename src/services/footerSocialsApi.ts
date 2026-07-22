import { apiRequest } from '../lib/api';
import type {
  FooterSocial,
  FooterSocialListResult,
  FooterSocialPayload,
} from '../types/footerSocial';

export async function listFooterSocials(): Promise<FooterSocialListResult> {
  const response = await apiRequest<FooterSocial[]>('/footer/socials');

  return { socials: response.data ?? [] };
}

export async function createFooterSocial(
  payload: FooterSocialPayload,
  token: string,
): Promise<FooterSocial> {
  const response = await apiRequest<FooterSocial>('/admin/footer/socials', {
    method: 'POST',
    token,
    body: payload,
  });

  return response.data;
}

export async function updateFooterSocial(
  id: number,
  payload: Partial<FooterSocialPayload>,
  token: string,
): Promise<FooterSocial> {
  const response = await apiRequest<FooterSocial>(`/admin/footer/socials/${id}`, {
    method: 'PUT',
    token,
    body: payload,
  });

  return response.data;
}

export async function deleteFooterSocial(id: number, token: string): Promise<void> {
  await apiRequest<null>(`/admin/footer/socials/${id}`, {
    method: 'DELETE',
    token,
  });
}