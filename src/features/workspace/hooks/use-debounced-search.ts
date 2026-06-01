"use client";

import { useEffect, useMemo, useState } from "react";

type Options = {
  minLength?: number;
  debounceMs?: number;
};

export function useDebouncedSearch(query: string, { minLength = 0, debounceMs = 200 }: Options = {}) {
  const [debounced, setDebounced] = useState(query);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(query), debounceMs);
    return () => window.clearTimeout(t);
  }, [query, debounceMs]);

  const validation = useMemo(() => {
    const trimmed = debounced.trim();
    if (trimmed.length === 0) return { valid: true, message: null as string | null };
    if (trimmed.length < minLength) {
      return {
        valid: false,
        message: `Type at least ${minLength} characters to search`,
      };
    }
    return { valid: true, message: null as string | null };
  }, [debounced, minLength]);

  const effectiveQuery = validation.valid ? debounced.trim().toLowerCase() : "";

  return { debounced, effectiveQuery, validation };
}
