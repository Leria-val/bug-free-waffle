import { useState, useCallback } from 'react';
import api from '../services/api';

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const request = useCallback(async (method, url, data = null, config = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api({ method, url, data, ...config });
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Erro desconhecido.';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const get   = useCallback((url, config)       => request('GET',    url, null, config), [request]);
  const post  = useCallback((url, data, config) => request('POST',   url, data, config), [request]);
  const patch = useCallback((url, data, config) => request('PATCH',  url, data, config), [request]);
  const del   = useCallback((url, config)       => request('DELETE', url, null, config), [request]);

  return { loading, error, setError, get, post, patch, del };
}