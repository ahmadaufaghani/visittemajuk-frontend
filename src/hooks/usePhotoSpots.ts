import { useCallback, useEffect, useRef, useState } from 'react';
import { getAdminPhotoSpots, getPhotoSpots } from '../services/photoSpotsApi';
import type {
  PhotoSpot,
  PhotoSpotListMeta,
  PhotoSpotListParams,
} from '../types/photoSpot';

const emptyPhotoSpotListMeta: PhotoSpotListMeta = {
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

interface UsePhotoSpotsOptions {
  params?: PhotoSpotListParams;
  admin?: boolean;
  token?: string | null;
  enabled?: boolean;
  allPages?: boolean;
}

const allPagesPerPage = 50;

export function usePhotoSpots(options: UsePhotoSpotsOptions = {}) {
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
  const [photoSpots, setPhotoSpots] = useState<PhotoSpot[]>([]);
  const [meta, setMeta] = useState<PhotoSpotListMeta>(emptyPhotoSpotListMeta);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const reload = useCallback(async () => {
    requestId.current += 1;
    const activeRequestId = requestId.current;

    if (!enabled) {
      setPhotoSpots([]);
      setMeta(emptyPhotoSpotListMeta);
      setIsLoading(false);
      setError(null);
      return;
    }

    if (admin && !token) {
      setPhotoSpots([]);
      setMeta(emptyPhotoSpotListMeta);
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
      const fetchPhotoSpots = admin
        ? (listParams: PhotoSpotListParams) => getAdminPhotoSpots(listParams, token ?? '')
        : getPhotoSpots;
      let result = await fetchPhotoSpots({
        ...requestParams,
        page: allPages ? 1 : page,
        perPage: allPages ? (perPage ?? allPagesPerPage) : perPage,
      });

      if (allPages) {
        let currentPage = result.meta.pagination.current_page;
        const lastPage = result.meta.pagination.last_page;
        const combinedPhotoSpots = [...result.photoSpots];

        while (currentPage < lastPage) {
          currentPage += 1;
          const nextResult = await fetchPhotoSpots({
            ...requestParams,
            page: currentPage,
            perPage: result.meta.pagination.per_page,
          });

          combinedPhotoSpots.push(...nextResult.photoSpots);
          result = nextResult;
        }

        result = {
          photoSpots: combinedPhotoSpots,
          meta: result.meta,
        };
      }

      if (activeRequestId !== requestId.current) {
        return;
      }

      setPhotoSpots(result.photoSpots);
      setMeta(result.meta);
    } catch {
      if (activeRequestId === requestId.current) {
        setError('Data spot foto belum dapat dimuat.');
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
    photoSpots,
    meta,
    isLoading,
    error,
    reload,
    setPhotoSpots,
  };
}
