export interface RoomType {
  id: number;
  name: string;
  description: string;
  capacity: number;
  price: number;
}

export interface AccommodationGallery {
  id: number;
  image: string;
  accomodation_id: number;
}

export interface Accommodation {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
  image: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  location: string;
  location_map: string;
  contacs: string;
  siteUrl: string;
  facilities: string[];
  accomodation_galleries: AccommodationGallery[];
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
  category: string;
  minPrice: number;
  maxPrice: number;
  location: string;
  location_map: string;
  contacs: string;
  siteUrl: string;
  facilities: string[];
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
