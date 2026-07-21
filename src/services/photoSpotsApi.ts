import { apiRequest } from '../lib/api';
import type {
  PhotoSpot,
  PhotoSpotGallery,
  PhotoSpotListMeta,
  PhotoSpotListParams,
  PhotoSpotListResult,
} from '../types/photoSpot';

const emptyPhotoSpotListMeta: PhotoSpotListMeta = {
  pagination: {
    current_page: 1,
    per_page: 0,
    last_page: 1,
    total: 0,
    from: null,
    to: null,
  },
  filters: {
    categories: [],
  },
};

function photoSpotListPath(path: string, params: PhotoSpotListParams = {}): string {
  const query = new URLSearchParams();
  const search = params.search?.trim();
  const category = params.category?.trim();

  if (search) {
    query.set('search', search);
  }

  if (category) {
    query.set('category', category);
  }

  if (params.page !== undefined) {
    query.set('page', String(params.page));
  }

  if (params.perPage !== undefined) {
    query.set('per_page', String(params.perPage));
  }

  const queryString = query.toString();

  return queryString ? `${path}?${queryString}` : path;
}

export async function getPhotoSpots(
  params: PhotoSpotListParams = {}
): Promise<PhotoSpotListResult> {
  const response = await apiRequest<PhotoSpot[], PhotoSpotListMeta>(
    photoSpotListPath('/photoSpots', params)
  );

  return {
    photoSpots: response.data,
    meta: response.meta ?? emptyPhotoSpotListMeta,
  };
}

export async function getAdminPhotoSpots(
  params: PhotoSpotListParams,
  token: string
): Promise<PhotoSpotListResult> {
  const response = await apiRequest<PhotoSpot[], PhotoSpotListMeta>(
    photoSpotListPath('/admin/photoSpots', params),
    { token }
  );

  return {
    photoSpots: response.data,
    meta: response.meta ?? emptyPhotoSpotListMeta,
  };
}

export async function getPhotoSpot(id: string): Promise<PhotoSpot> {
  const response = await apiRequest<PhotoSpot>(`/photoSpots/${id}`);

  return response.data;
}

export async function createPhotoSpot(payload: FormData, token: string): Promise<PhotoSpot> {
  const response = await apiRequest<PhotoSpot>('/admin/photoSpots', {
    method: 'POST',
    token,
    body: payload,
  });

  return response.data;
}

export async function updatePhotoSpot(
  id: string,
  payload: FormData,
  token: string
): Promise<PhotoSpot> {
  const response = await apiRequest<PhotoSpot>(`/admin/photoSpots/${id}`, {
    method: 'POST',
    token,
    body: payload,
  });

  return response.data;
}

export async function deletePhotoSpot(id: string, token: string): Promise<void> {
  await apiRequest<null>(`/admin/photoSpots/${id}`, {
    method: 'DELETE',
    token,
  });
}

export async function createPhotoSpotGallery(
  payload: FormData,
  token: string
): Promise<PhotoSpotGallery> {
  const response = await apiRequest<PhotoSpotGallery>('/admin/photoSpotGalleries', {
    method: 'POST',
    token,
    body: payload,
  });

  return response.data;
}

export async function deletePhotoSpotGallery(id: number, token: string): Promise<void> {
  await apiRequest<null>(`/admin/photoSpotGalleries/${id}`, {
    method: 'DELETE',
    token,
  });
}
