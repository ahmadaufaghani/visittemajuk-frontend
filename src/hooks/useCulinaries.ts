import { useCallback, useEffect, useRef, useState } from 'react';
import { getCulinaries } from '../services/culinariesApi';
import type {
 Culinary,
 CulinaryListParams,
 CulinaryListMeta
} from '../types/culinary';

const emptyCulinaryListMeta: CulinaryListMeta = {
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

interface UseCulinariesOptions {
  params?: CulinaryListParams;
  admin?: boolean;
  token?: string | null;
  enabled?: boolean;
  allPages?: boolean;
}

const allPagesPerPage = 50;

export function useCulinaries(options: UseCulinariesOptions = {}) {
  const {
    params,
    enabled = true,
    allPages = false,
  } = options;
  const search = params?.search ?? '';
  const category = params?.category ?? '';
  const page = params?.page ?? 1;
  const perPage = params?.perPage;
  const [culinaries, setCulinaries] = useState<Culinary[]>([]);
  const [meta, setMeta] = useState<CulinaryListMeta>(emptyCulinaryListMeta);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const reload = useCallback(async () => {
    requestId.current += 1;
    const activeRequestId = requestId.current;

    if (!enabled) {
      setCulinaries([]);
      setMeta(emptyCulinaryListMeta);
      setIsLoading(false);
      setError(null);
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
      const fetchCulinaries = getCulinaries;
      let result = await fetchCulinaries({
        ...requestParams,
        page: allPages ? 1 : page,
        perPage: allPages ? (perPage ?? allPagesPerPage) : perPage,
      });

      if (allPages) {
        let currentPage = result.meta.pagination.current_page;
        const lastPage = result.meta.pagination.last_page;
        const combinedCulinaries = [...result.culinaries];

        while (currentPage < lastPage) {
          currentPage += 1;
          const nextResult = await fetchCulinaries({
            ...requestParams,
            page: currentPage,
            perPage: result.meta.pagination.per_page,
          });

          combinedCulinaries.push(...nextResult.culinaries);
          result = nextResult;
        }

        result = {
          culinaries: combinedCulinaries,
          meta: result.meta,
        };
      }

      if (activeRequestId !== requestId.current) {
        return;
      }

      setCulinaries(result.culinaries);
      setMeta(result.meta);
    } catch {
      if (activeRequestId === requestId.current) {
        setError('Data kuliner belum dapat dimuat.');
      }
    } finally {
      if (activeRequestId === requestId.current) {
        setIsLoading(false);
      }
    }
  }, [allPages, category, enabled, page, perPage, search]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    culinaries,
    meta,
    isLoading,
    error,
    reload,
    setCulinaries,
  };
}
