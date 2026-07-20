
import { apiRequest } from '../lib/api';
import type {
  AdditionalCulinary,
  AdditionalCulinaryList,
  AdditionalCulinaryPayload,
  Culinary,
  CulinaryListMeta,
  CulinaryListParams,
  CulinaryListResult,
  Gallery,
  Specialty,
  SpecialtyPayload,
} from '../types/culinary';

const emptyCulinaryListMeta: CulinaryListMeta = {
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

function culinaryListPath(path: string, params: CulinaryListParams = {}): string {
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

export async function getCulinaries(
  params: CulinaryListParams = {}
): Promise<CulinaryListResult> {
  const response = await apiRequest<Culinary[], CulinaryListMeta>(
    culinaryListPath('/culinaries', params)
  );

  return {
    culinaries: response.data,
    meta: response.meta ?? emptyCulinaryListMeta,
  };
}

export async function getCulinary(id: string): Promise<Culinary> {
  const response = await apiRequest<Culinary>(`/culinaries/${id}`);

  return response.data;
}

export async function createCulinary(
  payload: FormData,
  token: string
): Promise<Culinary> {
  const response = await apiRequest<Culinary>('/culinaries', {
    method: 'POST',
    token,
    body: payload,
  });

  return response.data;
}

export async function updateCulinary(
  id: number,
  payload: FormData,
  token: string
): Promise<Culinary> {
  const response = await apiRequest<Culinary>(`/culinaries/${id}`, {
    method: 'POST',
    token,
    body: payload,
  });

  return response.data;
}

export async function deleteCulinary(id: number, token: string): Promise<void> {
  await apiRequest<null>(`/culinaries/${id}`, {
    method: 'DELETE',
    token,
  });
}

export async function createSpeciality(
  payload: SpecialtyPayload,
  token: string
): Promise<Specialty> {
  const response = await apiRequest<Specialty>('/specialties', {
    method: 'POST',
    token,
    body: payload,
  });

  return response.data;
}

export async function updateSpeciality(
  id: number,
  payload: SpecialtyPayload,
  token: string
): Promise<Specialty> {
  const response = await apiRequest<Specialty>(`/specialties/${id}`, {
    method: 'PUT',
    token,
    body: payload,
  });

  return response.data;
}

export async function deleteSpeciality(id: number, token: string): Promise<void> {
  await apiRequest<null>(`/specialties/${id}`, {
    method: 'DELETE',
    token,
  });
}


export async function createGallery(
  payload: FormData,
  token: string
): Promise<Gallery> {
  const response = await apiRequest<Gallery>('/culinaryGalleries', {
    method: 'POST',
    token,
    body: payload,
  });

  return response.data;
}

export async function deleteGallery(id: number, token: string): Promise<void> {
  await apiRequest<null>(`/culinaryGalleries/${id}`, {
    method: 'DELETE',
    token,
  });
}

export async function getAdditionalCulinaries(): Promise<AdditionalCulinary[]> {
  const response = await apiRequest<AdditionalCulinary[]>('/additionalCulinaries', {
    method: 'GET'
  });

  return response.data;
}

export async function createAdditionalCulinary(
  payload: FormData,
  token: string
): Promise<AdditionalCulinaryPayload> {
  const response = await apiRequest<AdditionalCulinaryPayload>('/additionalCulinaries', {
    method: 'POST',
    token,
    body: payload,
  });

  return response.data;
}

export async function updateAdditionalCulinary(
  id: number,
  payload: FormData,
  token: string
): Promise<AdditionalCulinary> {
  const response = await apiRequest<AdditionalCulinary>(`/additionalCulinaries/${id}`, {
    method: 'POST',
    token,
    body: payload,
  });

  return response.data;
}

export async function deleteAdditionalCulinary(id: number, token: string): Promise<void> {
  await apiRequest<null>(`/additionalCulinaries/${id}`, {
    method: 'DELETE',
    token,
  });
}

