import { DupliGuardView } from "@/features/workspace/views/dupliguard-view";

export const metadata = {
  title: "DupliGuard Duplicate Checker — RivexaFlow",
  description: "Check leads databases for duplicate records, analyze scoring metrics, and auto-merge profiles",
};

export default function DupliGuardPage() {
  return <DupliGuardView />;
}
