import { apiRequest } from '../lib/api';
import type {
  Destination,
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

export async function createDestination(
  payload: DestinationPayload,
  token: string
): Promise<Destination> {
  const response = await apiRequest<Destination>('/admin/destinations', {
    method: 'POST',
    token,
    body: payload,
  });

  return response.data;
}

export async function updateDestination(
  id: string,
  payload: DestinationPayload,
  token: string
): Promise<Destination> {
  const response = await apiRequest<Destination>(`/admin/destinations/${id}`, {
    method: 'PUT',
    token,
    body: payload,
  });

  return response.data;
}

export async function deleteDestination(id: string, token: string): Promise<void> {
  await apiRequest<null>(`/admin/destinations/${id}`, {
    method: 'DELETE',
    token,
  });
}
