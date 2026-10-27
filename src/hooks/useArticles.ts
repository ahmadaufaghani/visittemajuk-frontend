import { useCallback, useEffect, useRef, useState } from 'react';
import type {
 Article,
 ArticleListParams,
 ArticleListMeta
} from '../types/article';
import { getArticles } from '../services/articlesApi';

const emptyArticleListMeta: ArticleListMeta = {
  pagination: {
    current_page: 1,
    per_page: 0,
    last_page: 1,
    total: 0,
    from: null,
    to: null,
  },
};

interface UseArticlesOptions {
  params?: ArticleListParams;
  admin?: boolean;
  token?: string | null;
  enabled?: boolean;
  allPages?: boolean;
}

const allPagesPerPage = 50;

export function useArticles(options: UseArticlesOptions = {}) {
  const {
    params,
    enabled = true,
    allPages = false,
  } = options;
  const search = params?.search ?? '';
  const sort = params?.sort ?? '';
  const page = params?.page ?? 1;
  const perPage = params?.perPage;
  const [articles, setArticles] = useState<Article[]>([]);
  const [meta, setMeta] = useState<ArticleListMeta>(emptyArticleListMeta);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const reload = useCallback(async () => {
    requestId.current += 1;
    const activeRequestId = requestId.current;

    if (!enabled) {
      setArticles([]);
      setMeta(emptyArticleListMeta);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const requestParams = {
        search,
        sort,
        page,
        perPage,
      };
      const fetchArticles = getArticles;
      let result = await fetchArticles({
        ...requestParams,
        page: allPages ? 1 : page,
        perPage: allPages ? (perPage ?? allPagesPerPage) : perPage,
      });

      if (allPages) {
        let currentPage = result.meta.pagination.current_page;
        const lastPage = result.meta.pagination.last_page;
        const combinedCulinaries = [...result.articles];

        while (currentPage < lastPage) {
          currentPage += 1;
          const nextResult = await fetchArticles({
            ...requestParams,
            page: currentPage,
            perPage: result.meta.pagination.per_page,
          });

          combinedCulinaries.push(...nextResult.articles);
          result = nextResult;
        }

        result = {
          articles: combinedCulinaries,
          meta: result.meta,
        };
      }

      if (activeRequestId !== requestId.current) {
        return;
      }

      setArticles(result.articles);
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
  }, [allPages, sort, enabled, page, perPage, search]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    articles,
    meta,
    isLoading,
    error,
    reload,
    setArticles,
  };
}
