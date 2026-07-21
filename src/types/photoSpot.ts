export interface PhotoSpotGallery {
  id: number;
  image: string;
  photo_spot_id: number;
}

export interface PhotoSpot {
  id: number;
  title: string;
  description: string;
  full_description: string;
  image: string;
  category: string;
  bestHour: string;
  location: string;
  location_map: string | null;
  tips: string[];
  nearestAttraction: string[];
  slug: string;
  photo_spot_galleries: PhotoSpotGallery[];
}

export interface PhotoSpotListParams {
  search?: string;
  category?: string;
  page?: number;
  perPage?: number;
}

export interface PhotoSpotPaginationMeta {
  current_page: number;
  per_page: number;
  last_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface PhotoSpotFiltersMeta {
  categories: string[];
}

export interface PhotoSpotListMeta {
  pagination: PhotoSpotPaginationMeta;
  filters: PhotoSpotFiltersMeta;
}

export interface PhotoSpotListResult {
  photoSpots: PhotoSpot[];
  meta: PhotoSpotListMeta;
}
