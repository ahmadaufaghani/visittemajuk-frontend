import { apiRequest } from '../lib/api';
import type {
  Destination,
  DestinationGalleryImage,
  DestinationListMeta,
  DestinationListParams,
  DestinationListResult,
  DestinationPayload,
} from '../types/destination';

const emptyDestinationListMeta: DestinationListMeta = {
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

function destinationListPath(path: string, params: DestinationListParams = {}): string {
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

export async function getDestinations(
  params: DestinationListParams = {}
): Promise<DestinationListResult> {
  const response = await apiRequest<Destination[], DestinationListMeta>(
    destinationListPath('/destinations', params)
  );

  return {
    destinations: response.data,
    meta: response.meta ?? emptyDestinationListMeta,
  };
}

export async function getAdminDestinations(
  params: DestinationListParams,
  token: string
): Promise<DestinationListResult> {
  const response = await apiRequest<Destination[], DestinationListMeta>(
    destinationListPath('/admin/destinations', params),
    { token }
  );

  return {
    destinations: response.data,
    meta: response.meta ?? emptyDestinationListMeta,
  };
}

export async function getDestination(id: string): Promise<Destination> {
  const response = await apiRequest<Destination>(`/destinations/${id}`);

  return response.data;
}

function buildDestinationFormData(payload: DestinationPayload): FormData {
  const formData = new FormData();
  formData.append('title', payload.title);
  formData.append('description', payload.description);
  formData.append('fullDescription', payload.fullDescription);
  formData.append('category', payload.category);
  formData.append('price', payload.price);
  formData.append('location', payload.location);

  if (payload.locationMap) {
    formData.append('locationMap', payload.locationMap);
  }

  formData.append('openHours', payload.openHours);

  payload.facilities.forEach((value) => formData.append('facilities[]', value));
  payload.activities.forEach((value) => formData.append('activities[]', value));
  payload.tips.forEach((value) => formData.append('tips[]', value));

  if (payload.image instanceof File) {
    formData.append('image', payload.image);
  }

  // Include gallery files
  if (payload.gallery && payload.gallery.length > 0) {
    payload.gallery.forEach((file) => {
      formData.append('gallery[]', file);
    });
  }

  // Include removed gallery IDs
  if (payload.removedGalleryIds && payload.removedGalleryIds.length > 0) {
    payload.removedGalleryIds.forEach((id) => {
      formData.append('removed_gallery_ids[]', String(id));
    });
  }

  return formData;
}

export async function createDestination(
  payload: DestinationPayload,
  token: string
): Promise<Destination> {
  const response = await apiRequest<Destination>('/admin/destinations', {
    method: 'POST',
    token,
    body: buildDestinationFormData(payload),
  });

  return response.data;
}

export async function updateDestination(
  id: string,
  payload: DestinationPayload,
  token: string
): Promise<Destination> {
  const formData = buildDestinationFormData(payload);

  const response = await apiRequest<Destination>(`/admin/destinations/${id}`, {
    method: 'POST',
    token,
    body: formData,
  });

  return response.data;
}

export async function deleteDestination(id: string, token: string): Promise<void> {
  await apiRequest<null>(`/admin/destinations/${id}`, {
    method: 'DELETE',
    token,
  });
}

export async function uploadDestinationGallery(
  destinationSlug: string,
  image: File,
  token: string,
): Promise<DestinationGalleryImage> {
  const formData = new FormData();
  formData.append('image', image);

  const response = await apiRequest<DestinationGalleryImage>(
    `/admin/destinations/${destinationSlug}/galleries`,
    {
      method: 'POST',
      token,
      body: formData,
    },
  );

  return response.data;
}

export async function deleteDestinationGallery(
  galleryId: number,
  token: string,
): Promise<void> {
  await apiRequest<null>(`/admin/destinations/galleries/${galleryId}`, {
    method: 'DELETE',
    token,
  });
}
