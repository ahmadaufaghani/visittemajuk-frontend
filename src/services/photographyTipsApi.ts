import { apiRequest } from '../lib/api';
import type { PhotographyTip, PhotographyTipPayload } from '../types/photographyTip';

export async function getPhotographyTips(): Promise<PhotographyTip[]> {
  const response = await apiRequest<PhotographyTip[]>('/photography-tips');

  return response.data ?? [];
}

export async function getAdminPhotographyTips(token: string): Promise<PhotographyTip[]> {
  const response = await apiRequest<PhotographyTip[]>('/admin/photography-tips', { token });

  return response.data ?? [];
}

export async function createPhotographyTip(
  payload: PhotographyTipPayload,
  token: string,
): Promise<PhotographyTip> {
  const formData = new FormData();
  formData.append('title', payload.title);
  formData.append('description', payload.description);

  if (payload.order !== undefined) {
    formData.append('order', String(payload.order));
  }

  if (payload.image instanceof File) {
    formData.append('image', payload.image);
  }

  const response = await apiRequest<PhotographyTip>('/admin/photography-tips', {
    method: 'POST',
    token,
    body: formData,
  });

  return response.data;
}

export async function updatePhotographyTip(
  id: number,
  payload: PhotographyTipPayload,
  token: string,
): Promise<PhotographyTip> {
  const formData = new FormData();
  formData.append('title', payload.title);
  formData.append('description', payload.description);
  formData.append('_method', 'PUT');

  if (payload.order !== undefined) {
    formData.append('order', String(payload.order));
  }

  if (payload.image instanceof File) {
    formData.append('image', payload.image);
  }

  const response = await apiRequest<PhotographyTip>(`/admin/photography-tips/${id}`, {
    method: 'POST',
    token,
    body: formData,
  });

  return response.data;
}

export async function deletePhotographyTip(id: number, token: string): Promise<void> {
  await apiRequest<null>(`/admin/photography-tips/${id}`, {
    method: 'DELETE',
    token,
  });
}
