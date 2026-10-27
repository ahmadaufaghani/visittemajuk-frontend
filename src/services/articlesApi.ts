import { Article, ArticleDetailPayload, ArticleListMeta, ArticleListParams, ArticleListResult, ArticleMeta } from "../types/article";
import { apiRequest } from "../lib/api";
import { Banner } from "../types/banner";



const emptyArticleListMeta: ArticleListMeta = {
  pagination: {
    current_page:1,
    per_page:0,
    last_page:1,
    total:0,
    from:null,
    to:null
  }
}

const emptyArticleMeta: ArticleMeta = {
  prev: {
    id: 0,
    slug: "",
    title: ""
  },
  next: {
    id: 0,
    slug: "",
    title: ""
  }

}

function articleListPath(path: string, params: ArticleListParams = {}): string {
  const query = new URLSearchParams();
  const search = params.search?.trim();
  const sort = params.sort?.trim();

  if (search) {
    query.set('search', search);
  }

  if (sort) {
    query.set('sort', sort);
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

export async function getArticles(params: ArticleListParams = {}): Promise<ArticleListResult> {

  const response = await apiRequest<Article[], ArticleListMeta>(
    articleListPath('/articles', params)
  );

  return {
    articles :response.data,
    meta: response.meta ?? emptyArticleListMeta
  }
}

export async function getArticle(id: string): Promise<ArticleDetailPayload> {
    const response = await apiRequest<Article, ArticleMeta>(`/articles/${id}`);
    
    return {
      data: response.data,
      meta: response.meta ?? emptyArticleMeta
    };
}

export async function createArticle(
  payload: FormData,
  token: string
): Promise<Article> {
  const response = await apiRequest<Article>('/articles', {
    method: 'POST',
    token,
    body: payload,
  });

  return response.data;
}

export async function updateArticle(
    id: number,
    payload: FormData,
    token: string
): Promise<Article> {
    const response = await apiRequest<Article>(`/articles/${id}`, {
        method: 'POST',
        token,
        body: payload
    });
    
    return response.data;
}

export async function deleteArticle(id: number, token: string): Promise<void> {
  await apiRequest<null>(`/articles/${id}`, {
    method: 'DELETE',
    token: token
  });
}

export async function getArticleBanner() {
  const response = await apiRequest<Banner[]>(`/banners?menu=artikel`, {
    method: 'GET'
  });

  return response.data;
}

export async function createArticleBanner(
  payload: FormData,
  token: string
): Promise<Banner> {
  const response = await apiRequest<Banner>('/banners', {
    method: 'POST',
    token,
    body: payload,
  });

  return response.data;
}

export async function updateArticleBanner(
  id: number,
  payload: FormData,
  token: string
): Promise<Banner> {
  const response = await apiRequest<Banner>(`/banners/${id}`, {
    method: 'POST',
    token,
    body: payload,
  });

  return response.data;
}

