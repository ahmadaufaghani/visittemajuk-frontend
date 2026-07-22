import { useEffect, useState } from 'react';
import { getPhotographyTips } from '../services/photographyTipsApi';
import type { PhotographyTip } from '../types/photographyTip';

interface UsePhotographyTipsResult {
  tips: PhotographyTip[];
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export function usePhotographyTips(): UsePhotographyTipsResult {
  const [tips, setTips] = useState<PhotographyTip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getPhotographyTips();
      setTips(result);
    } catch {
      setError('Data tips fotografi belum dapat dimuat.');
      setTips([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, []);

  return { tips, isLoading, error, reload };
}
