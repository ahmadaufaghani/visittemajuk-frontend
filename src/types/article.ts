export interface Article {
    id: number,
    title: string,
    content:string,
    image: string,
    date: string,
    user: string,
    user_id: number,
    slug: string
}

export interface ArticleDetailPayload {
  data: Article,
  meta: ArticleMeta
}

export interface ArticleMeta {
  prev : prevProperties,
  next : nextProperties
}

export interface prevProperties {
  id: number,
  slug : string,
  title : string
}

export interface nextProperties {
  id: number,
  slug : string,
  title : string
}

export interface ArticlePayload {
    id: number,
    title: string,
    content:string,
    image: string,
    user_id: number,
}

export interface ArticlePayloadCreate {
  data : ArticlePayload
}

export interface ArticlePayloadUpdate {
  data : Article
}

export interface ArticleListParams {
  search?: string;
  sort?: string;
  page?: number;
  perPage?: number;
}

export interface ArticlePaginationMeta {
  current_page: number;
  per_page: number;
  last_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface ArticleListMeta {
  pagination: ArticlePaginationMeta;
}

export interface ArticleListResult {
  articles: Article[];
  meta: ArticleListMeta;
}