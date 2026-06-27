"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export function useListSearchFromUrl(setQuery: (value: string) => void, param = "q") {
  const searchParams = useSearchParams();
  const value = searchParams.get(param);

  useEffect(() => {
    if (value) setQuery(value);
  }, [value, setQuery]);
}
