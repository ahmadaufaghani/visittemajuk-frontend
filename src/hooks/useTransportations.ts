import { useCallback, useEffect, useRef, useState } from 'react';
import { getTransportations } from '../services/transportationsApi';
import type {
 Transportation,
 TransportationListParams,
 TransportationListMeta
} from '../types/transportation';

const emptyTransportationListMeta: TransportationListMeta = {
  pagination: {
    current_page: 1,
    per_page: 0,
    last_page: 1,
    total: 0,
    from: null,
    to: null,
  },
  filters: {
    difficulties: [],
  },
};

interface UseTransportationsOptions {
  params?: TransportationListParams;
  token?: string | null;
  enabled?: boolean;
  allPages?: boolean;
}

const allPagesPerPage = 50;

export function useTransportation(options: UseTransportationsOptions = {}) {
  const {
    params,
    enabled = true,
    allPages = false,
  } = options;
  const search = params?.search ?? '';
  const difficulty = params?.difficulty ?? '';
  const page = params?.page ?? 1;
  const perPage = params?.perPage;
  const [transportations, setTransportations] = useState<Transportation[]>([]);
  const [meta, setMeta] = useState<TransportationListMeta>(emptyTransportationListMeta);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const reload = useCallback(async () => {
    requestId.current += 1;
    const activeRequestId = requestId.current;

    if (!enabled) {
      setTransportations([]);
      setMeta(emptyTransportationListMeta);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const requestParams = {
        search,
        difficulty,
        page,
        perPage,
      };
      const fetchTransportations = getTransportations;
      let result = await fetchTransportations({
        ...requestParams,
        page: allPages ? 1 : page,
        perPage: allPages ? (perPage ?? allPagesPerPage) : perPage,
      });

      if (allPages) {
        let currentPage = result.meta.pagination.current_page;
        const lastPage = result.meta.pagination.last_page;
        const combinedTransportations = [...result.transportations];

        while (currentPage < lastPage) {
          currentPage += 1;
          const nextResult = await fetchTransportations({
            ...requestParams,
            page: currentPage,
            perPage: result.meta.pagination.per_page,
          });

          combinedTransportations.push(...nextResult.transportations);
          result = nextResult;
        }

        result = {
          transportations: combinedTransportations,
          meta: result.meta,
        };
      }

      if (activeRequestId !== requestId.current) {
        return;
      }

      setTransportations(result.transportations);
      setMeta(result.meta);
    } catch {
      if (activeRequestId === requestId.current) {
        setError('Data transportasi belum dapat dimuat.');
      }
    } finally {
      if (activeRequestId === requestId.current) {
        setIsLoading(false);
      }
    }
  }, [allPages, difficulty, enabled, page, perPage, search]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    transportations,
    meta,
    isLoading,
    error,
    reload,
    setTransportations,
  };
}
