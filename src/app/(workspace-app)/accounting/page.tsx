import { AccountingView } from "@/features/workspace/views/accounting-view";

export const metadata = {
  title: "Accounting & Chart of Accounts — RivexaFlow",
  description: "Manage general ledger journals, double-entry balance sheets, and tax reports",
};

export default function AccountingPage() {
  return <AccountingView />;
}
