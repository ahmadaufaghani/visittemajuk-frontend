export interface Review {
    id: number,
    name: string,
    text: string,
    rating: number,
    created_at: string,
    updated_at: string,
    destination: {
        id : number,
        title : string
    }
}

export interface AddReview {
    name: string,
    text: string,
    destination_slug: string,
    rating: number
}

export interface ReviewListParams {
  search?: string;
  destination?: string | number;
  rating?: number;
  page?: number;
  perPage?: number;
}

export interface ReviewPaginationMeta {
  current_page: number;
  per_page: number;
  last_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface ReviewListMeta {
  pagination: ReviewPaginationMeta;
}

export interface ReviewListResult {
  reviews: Review[];
  meta: ReviewListMeta;
}