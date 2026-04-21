"use client";

import { ReactNode, useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

type Props = { children: ReactNode };

export function AppProviders({ children }: Props) {
  const queryClient = useMemo(() => new QueryClient(), []);
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
