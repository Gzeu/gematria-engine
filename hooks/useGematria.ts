import { useState, useCallback } from 'react';
import type { GematriaResponse } from '@/lib/gematria-engine';

type State = {
  data: GematriaResponse | null;
  loading: boolean;
  error: string | null;
};

export function useGematria() {
  const [state, setState] = useState<State>({
    data: null,
    loading: false,
    error: null,
  });

  const analyze = useCallback(async (input: string) => {
    if (!input.trim()) return;

    setState({ data: null, loading: true, error: null });

    try {
      const res = await fetch('/api/gematria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      });

      const json = await res.json();

      if (!res.ok) {
        setState({ data: null, loading: false, error: json.error });
        return;
      }

      setState({ data: json, loading: false, error: null });
    } catch {
      setState({ data: null, loading: false, error: 'Network error. Please try again.' });
    }
  }, []);

  return { ...state, analyze };
}
