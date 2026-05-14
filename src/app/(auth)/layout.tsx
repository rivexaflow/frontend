import { ReactNode } from "react";

/** Pages own their layout (full-bleed for /login, centered for the rest) */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-[#f4f7ff]">{children}</div>;
}
