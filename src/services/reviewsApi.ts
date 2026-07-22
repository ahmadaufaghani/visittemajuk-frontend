import { apiRequest } from '../lib/api';
import type {
  Review,
  AddReview,
  ReviewListMeta,
  ReviewListParams,
  ReviewListResult,
} from '../types/review';

const emptyReviewListMeta: ReviewListMeta = {
  pagination: {
    current_page: 1,
    per_page: 0,
    last_page: 1,
    total: 0,
    from: null,
    to: null,
  }
};

function reviewListPath(path: string, params: ReviewListParams = {}): string {
  const query = new URLSearchParams();
  const search = params.search?.trim();
  const destination = params.destination;
  const rating = params.rating;

  if (search) {
    query.set('search', search);
  }

  if (destination !== undefined && destination !== '') {
    query.set('destination', String(destination));
  }

  if (rating !== undefined) {
    query.set('rate', String(rating));
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

export async function getReviews(
  params: ReviewListParams = {}
): Promise<ReviewListResult> {
  const response = await apiRequest<Review[], ReviewListMeta>(
    reviewListPath('/reviews', params)
  );

  return {
    reviews: response.data,
    meta: response.meta ?? emptyReviewListMeta,
  };
}

export async function createReviews(
  payload: AddReview,
  token: string
): Promise<Review> {
  const response = await apiRequest<Review>('/reviews', {
    method: 'POST',
    token,
    body: payload,
  });

  return response.data;
}