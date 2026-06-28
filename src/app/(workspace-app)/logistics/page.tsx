import { LogisticsView } from "@/features/workspace/views/logistics-view";

export const metadata = {
  title: "Logistics & Cargo Tracking — RivexaFlow",
  description: "Track shipment deliveries, solve delivery paths TSP, and coordinate cargo dispatch",
};

export default function LogisticsPage() {
  return <LogisticsView />;
}
