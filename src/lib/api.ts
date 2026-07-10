interface ApiEnvelope<T, M = unknown> {
  success: boolean;
  message: string;
  data: T;
  meta?: M;
  errors?: Record<string, string[]>;
}

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const defaultApiBaseUrl = import.meta.env.DEV
  ? `${window.location.protocol}//${window.location.hostname}:8000/api`
  : '/api';
const API_BASE_URL = (configuredApiBaseUrl || defaultApiBaseUrl).replace(/\/$/, '');

interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  token?: string | null;
}

let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null): () => void {
  unauthorizedHandler = handler;

  return () => {
    if (unauthorizedHandler === handler) {
      unauthorizedHandler = null;
    }
  };
}

export class ApiError extends Error {
  readonly status: number;
  readonly errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

export async function apiRequest<T, M = unknown>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<ApiEnvelope<T, M>> {
  const headers: Record<string, string> = {};

  const isFormData = options.body instanceof FormData;

  if(!isFormData) {
    headers['Accept'] = 'application/json';
    
    if (options.body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? 
      undefined 
          : 
      (isFormData ? 
      options.body as FormData 
          : 
      JSON.stringify(options.body)),
  });

  const payload = (await response.json()) as ApiEnvelope<T, M>;

  if (response.status === 401) {
    unauthorizedHandler?.();
  }

  if (!response.ok || !payload.success) {
    throw new ApiError(payload.message, response.status, payload.errors);
  }

  return payload;
}
