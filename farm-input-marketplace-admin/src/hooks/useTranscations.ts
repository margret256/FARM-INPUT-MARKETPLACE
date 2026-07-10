import { useCallback, useEffect, useState } from 'react';
import { fetchTransactions, type TransactionsData } from '../api/transcations';

interface UseTransactionsResult {
  data: TransactionsData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTransactions(): UseTransactionsResult {
  const [data, setData] = useState<TransactionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchTransactions();
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load transactions');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return { data, loading, error, refetch };
}