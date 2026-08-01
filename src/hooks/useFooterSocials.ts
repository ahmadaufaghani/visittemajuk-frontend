import { useCallback, useEffect, useState } from 'react';
import { listFooterSocials } from '../services/footerSocialsApi';
import type { FooterSocial } from '../types/footerSocial';

interface UseFooterSocialsResult {
  socials: FooterSocial[];
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export function useFooterSocials(token?: string): UseFooterSocialsResult {
  const [socials, setSocials] = useState<FooterSocial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await listFooterSocials(token);
      setSocials(result.socials);
    } catch {
      setError('Daftar media sosial belum dapat dimuat.');
      setSocials([]);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { socials, isLoading, error, reload };
}