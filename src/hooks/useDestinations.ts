import { useCallback, useEffect, useRef, useState } from 'react';
import { getAdminDestinations, getDestinations } from '../services/destinationsApi';
import type {
  Destination,
  DestinationListMeta,
  DestinationListParams,
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

interface UseDestinationsOptions {
  params?: DestinationListParams;
  admin?: boolean;
  token?: string | null;
  enabled?: boolean;
  allPages?: boolean;
}

const allPagesPerPage = 50;

export function useDestinations(options: UseDestinationsOptions = {}) {
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
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [meta, setMeta] = useState<DestinationListMeta>(emptyDestinationListMeta);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const reload = useCallback(async () => {
    requestId.current += 1;
    const activeRequestId = requestId.current;

    if (!enabled) {
      setDestinations([]);
      setMeta(emptyDestinationListMeta);
      setIsLoading(false);
      setError(null);
      return;
    }

    if (admin && !token) {
      setDestinations([]);
      setMeta(emptyDestinationListMeta);
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
      const fetchDestinations = admin
        ? (params: DestinationListParams) => getAdminDestinations(params, token ?? '')
        : getDestinations;
      let result = await fetchDestinations({
        ...requestParams,
        page: allPages ? 1 : page,
        perPage: allPages ? (perPage ?? allPagesPerPage) : perPage,
      });

      if (allPages) {
        let currentPage = result.meta.pagination.current_page;
        const lastPage = result.meta.pagination.last_page;
        const combinedDestinations = [...result.destinations];

        while (currentPage < lastPage) {
          currentPage += 1;
          const nextResult = await fetchDestinations({
            ...requestParams,
            page: currentPage,
            perPage: result.meta.pagination.per_page,
          });

          combinedDestinations.push(...nextResult.destinations);
          result = nextResult;
        }

        result = {
          destinations: combinedDestinations,
          meta: result.meta,
        };
      }

      if (activeRequestId !== requestId.current) {
        return;
      }

      setDestinations(result.destinations);
      setMeta(result.meta);
    } catch {
      if (activeRequestId === requestId.current) {
        setError('Data destinasi belum dapat dimuat.');
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
    destinations,
    meta,
    isLoading,
    error,
    reload,
    setDestinations,
  };
}
