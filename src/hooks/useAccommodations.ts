import { useCallback, useEffect, useRef, useState } from 'react';
import { getAdminAccommodations, getAccommodations } from '../services/accommodationsApi';
import type {
  Accommodation,
  AccommodationListMeta,
  AccommodationListParams,
} from '../types/accommodation';

const emptyAccommodationListMeta: AccommodationListMeta = {
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

interface UseAccommodationsOptions {
  params?: AccommodationListParams;
  admin?: boolean;
  token?: string | null;
  enabled?: boolean;
  allPages?: boolean;
}

const allPagesPerPage = 50;

export function useAccommodations(options: UseAccommodationsOptions = {}) {
  const {
    params,
    admin = false,
    token = null,
    enabled = true,
    allPages = false,
  } = options;
  const search = params?.search ?? '';
  const category = params?.category ?? '';
  const page = params?.page ?? 1;
  const perPage = params?.perPage;
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [meta, setMeta] = useState<AccommodationListMeta>(emptyAccommodationListMeta);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const reload = useCallback(async () => {
    requestId.current += 1;
    const activeRequestId = requestId.current;

    if (!enabled) {
      setAccommodations([]);
      setMeta(emptyAccommodationListMeta);
      setIsLoading(false);
      setError(null);
      return;
    }

    if (admin && !token) {
      setAccommodations([]);
      setMeta(emptyAccommodationListMeta);
      setIsLoading(false);
      setError('Sesi admin tidak valid.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const requestParams = {
        search,
        category,
        page,
        perPage,
      };
      const fetchAccommodations = admin
        ? (params: AccommodationListParams) => getAdminAccommodations(params, token ?? '')
        : getAccommodations;
      let result = await fetchAccommodations({
        ...requestParams,
        page: allPages ? 1 : page,
        perPage: allPages ? (perPage ?? allPagesPerPage) : perPage,
      });

      if (allPages) {
        let currentPage = result.meta.pagination.current_page;
        const lastPage = result.meta.pagination.last_page;
        const combinedAccommodations = [...result.accommodations];

        while (currentPage < lastPage) {
          currentPage += 1;
          const nextResult = await fetchAccommodations({
            ...requestParams,
            page: currentPage,
            perPage: result.meta.pagination.per_page,
          });

          combinedAccommodations.push(...nextResult.accommodations);
          result = nextResult;
        }

        result = {
          accommodations: combinedAccommodations,
          meta: result.meta,
        };
      }

      if (activeRequestId !== requestId.current) {
        return;
      }

      setAccommodations(result.accommodations);
      setMeta(result.meta);
    } catch {
      if (activeRequestId === requestId.current) {
        setError('Data akomodasi belum dapat dimuat.');
      }
    } finally {
      if (activeRequestId === requestId.current) {
        setIsLoading(false);
      }
    }
  }, [admin, allPages, category, enabled, page, perPage, search, token]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    accommodations,
    meta,
    isLoading,
    error,
    reload,
    setAccommodations,
  };
}
