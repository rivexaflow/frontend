import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { AppProviders } from "@/components/providers/app-providers";

export const metadata: Metadata = {
  title: "Rivexaflow",
  description: "AI-driven B2B multi-tenant workspace"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
