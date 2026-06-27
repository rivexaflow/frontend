"use client";

import { useEffect, useState } from "react";

import { useHrCompanyId } from "@/features/workspace/hooks/use-hr-company-id";
import {
  searchWorkspace,
  type WorkspaceSearchResult,
} from "@/lib/workspace/workspace-global-search";

type State = {
  results: WorkspaceSearchResult[];
  loading: boolean;
};

export function useWorkspaceGlobalSearch(query: string, enabled: boolean) {
  const companyId = useHrCompanyId();
  const [state, setState] = useState<State>({ results: [], loading: false });

  useEffect(() => {
    if (!enabled) {
      setState({ results: [], loading: false });
      return;
    }

    let cancelled = false;
    const trimmed = query.trim();

    if (!trimmed) {
      void searchWorkspace("", companyId).then((results) => {
        if (!cancelled) setState({ results, loading: false });
      });
      return () => {
        cancelled = true;
      };
    }

    setState((prev) => ({ ...prev, loading: true }));
    const timer = window.setTimeout(() => {
      void searchWorkspace(trimmed, companyId)
        .then((results) => {
          if (!cancelled) setState({ results, loading: false });
        })
        .catch(() => {
          if (!cancelled) setState({ results: [], loading: false });
        });
    }, 180);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query, companyId, enabled]);

  return state;
}
