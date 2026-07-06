export interface Destination {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
  imageUrl: string;
  category: string;
  price: string;
  location: string;
  openHours: string;
  facilities: string[];
  activities: string[];
  tips: string[];
  gallery: string[];
}

export type DestinationPayload = Omit<Destination, 'id'>;

export interface DestinationListParams {
  search?: string;
  category?: string;
  page?: number;
  perPage?: number;
}

export interface DestinationPaginationMeta {
  current_page: number;
  per_page: number;
  last_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface DestinationFiltersMeta {
  categories: string[];
}

export interface DestinationListMeta {
  pagination: DestinationPaginationMeta;
  filters: DestinationFiltersMeta;
}

export interface DestinationListResult {
  destinations: Destination[];
  meta: DestinationListMeta;
}
