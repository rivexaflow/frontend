import { BudgetingView } from "@/features/workspace/views/budgeting-view";

export const metadata = {
  title: "Departmental Budgeting — RivexaFlow",
  description: "Formulate target budgets, monitor department limits, and review variances",
};

export default function BudgetingPage() {
  return <BudgetingView />;
}
