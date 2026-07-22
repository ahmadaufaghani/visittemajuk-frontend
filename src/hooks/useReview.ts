import { useCallback, useEffect, useRef, useState } from 'react';
import { getReviews } from '../services/reviewsApi';
import type {
  Review,
  ReviewListMeta,
  ReviewListParams,
} from '../types/review';

const emptyReviewsListMeta: ReviewListMeta = {
  pagination: {
    current_page: 1,
    per_page: 0,
    last_page: 1,
    total: 0,
    from: null,
    to: null,
  }
};

interface UseReviewsOptions {
  params?: ReviewListParams;
  enabled?: boolean;
  allPages?: boolean;
}

const allPagesPerPage = 50;

export function useReviews(options: UseReviewsOptions = {}) {
  const {
    params,
    enabled = true,
    allPages = false,
  } = options;
  const search = params?.search ?? '';
  const destination = params?.destination ?? undefined;
  const rating = params?.rating ?? undefined;
  const page = params?.page ?? 1;
  const perPage = params?.perPage;
  const [reviews, setReviews] = useState<Review[]>([]);
  const [meta, setMeta] = useState<ReviewListMeta>(emptyReviewsListMeta);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const reload = useCallback(async () => {
    requestId.current += 1;
    const activeRequestId = requestId.current;

    if (!enabled) {
      setReviews([]);
      setMeta(emptyReviewsListMeta);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const requestParams = {
        search,
        destination,
        rating,
        page,
        perPage,
      };
      const fetchReviews =  getReviews;

      let result = await fetchReviews({
        ...requestParams,
        page: allPages ? 1 : page,
        perPage: allPages ? (perPage ?? allPagesPerPage) : perPage,
      });

      if (allPages) {
        let currentPage = result.meta.pagination.current_page;
        const lastPage = result.meta.pagination.last_page;
        const combinedReviews = [...result.reviews];

        while (currentPage < lastPage) {
          currentPage += 1;
          const nextResult = await fetchReviews({
            ...requestParams,
            page: currentPage,
            perPage: result.meta.pagination.per_page,
          });

          combinedReviews.push(...nextResult.reviews);
          result = nextResult;
        }

        result = {
          reviews: combinedReviews,
          meta: result.meta,
        };
      }

      if (activeRequestId !== requestId.current) {
        return;
      }

      setReviews(result.reviews);
      setMeta(result.meta);
    } catch {
      if (activeRequestId === requestId.current) {
        setError('Data review belum dapat dimuat.');
      }
    } finally {
      if (activeRequestId === requestId.current) {
        setIsLoading(false);
      }
    }
  }, [allPages, destination, rating, enabled, page, perPage, search]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    reviews,
    meta,
    isLoading,
    error,
    reload,
    setReviews,
  };
}
