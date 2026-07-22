import { useCallback, useState } from 'react';
import { ApiError } from '../lib/api';
import { changePasswordRequest, type ChangePasswordPayload } from '../services/authApi';

interface UseChangePasswordResult {
  changePassword: (payload: ChangePasswordPayload) => Promise<boolean>;
  isSubmitting: boolean;
  errorMessage: string | null;
  fieldErrors: Record<string, string[]>;
  reset: () => void;
}

export function useChangePassword(token: string | null): UseChangePasswordResult {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const reset = useCallback(() => {
    setErrorMessage(null);
    setFieldErrors({});
  }, []);

  const changePassword = async (payload: ChangePasswordPayload): Promise<boolean> => {
    if (!token) {
      setErrorMessage('Sesi admin tidak valid.');
      return false;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setFieldErrors({});

    try {
      await changePasswordRequest(payload, token);
      return true;
    } catch (caught) {
      if (caught instanceof ApiError) {
        setErrorMessage(caught.message);
        setFieldErrors(caught.errors ?? {});
        return false;
      }
      setErrorMessage('Password belum dapat diperbarui.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { changePassword, isSubmitting, errorMessage, fieldErrors, reset };
}