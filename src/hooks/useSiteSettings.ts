import { useEffect, useState } from 'react';
import { getSiteSettings } from '../services/siteSettingsApi';
import type { SiteSettingsMap } from '../types/siteSettings';

interface UseSiteSettingsResult {
  settings: SiteSettingsMap;
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export function useSiteSettings(): UseSiteSettingsResult {
  const [settings, setSettings] = useState<SiteSettingsMap>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getSiteSettings();
      setSettings(result ?? {});
    } catch {
      setError('Pengaturan situs belum dapat dimuat.');
      setSettings({});
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, []);

  return { settings, isLoading, error, reload };
}

export function useSiteSetting<K extends keyof SiteSettingsMap>(
  key: K,
): { value: SiteSettingsMap[K] | undefined; isLoading: boolean; error: string | null } {
  const { settings, isLoading, error } = useSiteSettings();

  return {
    value: settings[key],
    isLoading,
    error,
  };
}