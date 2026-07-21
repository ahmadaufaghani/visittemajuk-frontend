import { apiRequest } from '../lib/api';
import type {
  Accommodation,
  AccommodationListMeta,
  AccommodationListParams,
  AccommodationListResult,
} from '../types/accommodation';

const emptyAccommodationListMeta: AccommodationListMeta = {
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

function accommodationListPath(path: string, params: AccommodationListParams = {}): string {
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

export async function getAccommodations(
  params: AccommodationListParams = {}
): Promise<AccommodationListResult> {
  const response = await apiRequest<Accommodation[], AccommodationListMeta>(
    accommodationListPath('/accomodations', params)
  );

  return {
    accommodations: response.data,
    meta: response.meta ?? emptyAccommodationListMeta,
  };
}

export async function getAdminAccommodations(
  params: AccommodationListParams,
  token: string
): Promise<AccommodationListResult> {
  const response = await apiRequest<Accommodation[], AccommodationListMeta>(
    accommodationListPath('/admin/accomodations', params),
    { token }
  );

  return {
    accommodations: response.data,
    meta: response.meta ?? emptyAccommodationListMeta,
  };
}

export async function getAccommodation(id: string): Promise<Accommodation> {
  const response = await apiRequest<Accommodation>(`/accomodations/${id}`);

  return response.data;
}

export async function createAccommodation(
  payload: FormData,
  token: string
): Promise<Accommodation> {
  const response = await apiRequest<Accommodation>('/admin/accomodations', {
    method: 'POST',
    token,
    body: payload,
  });

  return response.data;
}

export async function updateAccommodation(
  id: string,
  payload: FormData,
  token: string
): Promise<Accommodation> {
  const response = await apiRequest<Accommodation>(`/admin/accomodations/${id}`, {
    method: 'POST',
    token,
    body: payload,
  });

  return response.data;
}

export async function deleteAccommodation(id: string, token: string): Promise<void> {
  await apiRequest<null>(`/admin/accomodations/${id}`, {
    method: 'DELETE',
    token,
  });
}

export async function createAccommodationGallery(
  payload: FormData,
  token: string
): Promise<void> {
  await apiRequest<unknown>('/admin/accomodationGalleries', {
    method: 'POST',
    token,
    body: payload,
  });
}

export async function deleteAccommodationGallery(id: number, token: string): Promise<void> {
  await apiRequest<null>(`/admin/accomodationGalleries/${id}`, {
    method: 'DELETE',
    token,
  });
}
