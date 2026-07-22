import { apiRequest } from '../lib/api';
import type { SiteSettingsMap } from '../types/siteSettings';

export async function getSiteSettings(): Promise<SiteSettingsMap> {
  const response = await apiRequest<SiteSettingsMap>('/site/settings');

  return response.data ?? {};
}

/**
 * Dotted key segments joined as PHP nested-array bracketed notation.
 * Handles:
 *   'home.hero'  => 'home[hero]'
 *   'home.features' => 'home[features]'
 *   'home.features[0].title' => 'home[features][0][title]'
 */
function dottedToBracket(key: string): string {
  return key.split('.').map((seg, i) => i === 0 ? seg : `[${seg}]`).join('');
}

function flattenForMultipart(input: Record<string, unknown>): FormData {
  const formData = new FormData();

  const walk = (value: unknown, path: string[]): void => {
    if (value === null || value === undefined) {
      return;
    }

    if (value instanceof File) {
      formData.append(dottedToBracket(path.join('.')), value);
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        walk(item, [...path, String(index)]);
      });
      return;
    }

    if (typeof value === 'object') {
      Object.entries(value as Record<string, unknown>).forEach(([key, child]) => {
        walk(child, [...path, key]);
      });
      return;
    }

    formData.append(dottedToBracket(path.join('.')), String(value));
  };

  Object.entries(input).forEach(([key, value]) => {
    walk(value, [key]);
  });

  return formData;
}

export async function updateSiteSettings(
  input: Record<string, unknown>,
  token: string,
): Promise<SiteSettingsMap> {
  const formData = flattenForMultipart(input);
  formData.append('_method', 'PUT');

  const response = await apiRequest<SiteSettingsMap>('/admin/site/settings', {
    method: 'POST',
    token,
    body: formData,
  });

  return response.data ?? {};
}