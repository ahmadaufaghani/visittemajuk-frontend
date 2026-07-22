export interface DestinationGalleryImage {
  id: number;
  image: string;
  sort_order: number;
}

export interface Destination {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
  image: string;
  category: string;
  price: string;
  location: string;
  locationMap: string | null;
  openHours: string;
  facilities: string[];
  activities: string[];
  tips: string[];
  galleries: DestinationGalleryImage[];
}

export interface DestinationPayload {
  title: string;
  description: string;
  fullDescription: string;
  category: string;
  price: string;
  location: string;
  locationMap?: string | null;
  openHours: string;
  facilities: string[];
  activities: string[];
  tips: string[];
  image?: File | null;
  gallery?: File[];
  removedGalleryIds?: number[];
}

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
