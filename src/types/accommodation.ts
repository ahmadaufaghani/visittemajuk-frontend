export interface RoomType {
  id: number;
  name: string;
  description: string;
  capacity: number;
  price: number;
}

export interface Accommodation {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
  imageUrl: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  location: string;
  contacs: string;
  siteUrl: string;
  facilities: string[];
  gallery: string[];
  roomTypes: RoomType[];
}

export interface RoomTypePayload {
  name: string;
  description: string;
  capacity: number;
  price: number;
}

export interface AccommodationPayload {
  title: string;
  description: string;
  fullDescription: string;
  imageUrl: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  location: string;
  contacs: string;
  siteUrl: string;
  facilities: string[];
  gallery: string[];
  roomTypes: RoomTypePayload[];
}

export interface AccommodationListParams {
  search?: string;
  category?: string;
  page?: number;
  perPage?: number;
}

export interface AccommodationPaginationMeta {
  current_page: number;
  per_page: number;
  last_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface AccommodationFiltersMeta {
  categories: string[];
}

export interface AccommodationListMeta {
  pagination: AccommodationPaginationMeta;
  filters: AccommodationFiltersMeta;
}

export interface AccommodationListResult {
  accommodations: Accommodation[];
  meta: AccommodationListMeta;
}
