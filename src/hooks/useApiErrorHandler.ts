import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ApiError } from '../lib/api';

export function useApiErrorHandler() {
  const navigate = useNavigate();

  return useCallback((error: unknown) => {
    if (error instanceof ApiError) {
      // Handle 401 Unauthorized - redirect to login
      if (error.status === 401) {
        toast.error('Sesi Anda telah berakhir. Silakan login kembali.');
        navigate('/admin/login');
        return;
      }

      // Handle 422 Validation Error - display all errors
      if (error.status === 422 && error.errors) {
        const allErrors = Object.values(error.errors).flat();
        allErrors.forEach((msg) => toast.error(msg));
        return;
      }

      // Handle other API errors
      if (error.message) {
        toast.error(error.message);
      } else {
        toast.error(`Terjadi kesalahan (${error.status}). Silakan coba lagi.`);
      }
    } else {
      // Handle non-API errors
      toast.error('Terjadi kesalahan. Silakan coba lagi.');
    }
  }, [navigate]);
}
