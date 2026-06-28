import { PurchaseView } from "@/features/workspace/views/purchase-view";

export const metadata = {
  title: "Purchase & Vendor Procurement — RivexaFlow",
  description: "Manage supplier directory profiles, purchase pipeline orders, and log receipts",
};

export default function PurchasePage() {
  return <PurchaseView />;
}
