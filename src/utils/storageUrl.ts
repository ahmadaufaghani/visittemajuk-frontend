const FALLBACK_IMAGE = '/images/batu-nenek-aluwi.jpg';

function apiOrigin(): string {
  const configured = import.meta.env.VITE_API_BASE_URL?.trim();

  if (configured) {
    return configured.replace(/\/api\/?$/, '');
  }

  if (import.meta.env.DEV) {
    return `${window.location.protocol}//${window.location.hostname}:8000`;
  }

  return '';
}

export function storageUrl(path: string | File | null | undefined): string {
  if (path === null || path === undefined) {
    return FALLBACK_IMAGE;
  }

  if (typeof path === 'string') {
    if (path === '') {
      return FALLBACK_IMAGE;
    }

    if (/^https?:\/\//i.test(path) || path.startsWith('data:')) {
      return path;
    }

    const origin = apiOrigin();
    const normalized = path.replace(/^\/+/, '');
    if (origin) {
      return `${origin}/storage/${normalized}`;
    }

    return `/storage/${normalized}`;
  }

  return URL.createObjectURL(path);
}
