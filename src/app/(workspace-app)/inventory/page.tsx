import { InventoryView } from "@/features/workspace/views/inventory-view";

export const metadata = {
  title: "Inventory & Warehousing — RivexaFlow",
  description: "Manage product stock levels, warehouses operations, and logs movements history",
};

export default function InventoryPage() {
  return <InventoryView />;
}
