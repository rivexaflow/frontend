"use client";

import { useEffect, useState } from "react";
import { Plus, Search, MapPin, Truck, RefreshCw, Navigation, Play } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { useHrCompanyId } from "@/features/workspace/hooks/use-hr-company-id";

type Shipment = {
  id: string;
  trackingNumber: string;
  carrier: string;
  origin: string;
  destination: string;
  status: string;
  estimatedArrival?: string;
  history?: any[];
};

export function LogisticsView() {
  const companyId = useHrCompanyId();
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New shipment state
  const [newShipment, setNewShipment] = useState({
    trackingNumber: "",
    carrier: "BlueDart",
    origin: "",
    destination: "",
    estimatedArrival: ""
  });
  const [shipmentModal, setShipmentModal] = useState(false);

  // Route optimization points
  const [routePoints, setRoutePoints] = useState([
    { lat: 28.6139, lng: 77.2090 }, // Delhi
    { lat: 19.0760, lng: 72.8777 }  // Mumbai
  ]);
  const [optimizedRoute, setOptimizedRoute] = useState<any | null>(null);

  const handleTrackShipment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!trackingNumber) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(`/logistics/tracking/${trackingNumber}`);
      if (res.data?.success) {
        setShipment(res.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Shipment tracking failed. Verify number.");
      setShipment(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post("/logistics/shipments", newShipment);
      setShipmentModal(false);
      alert(`Shipment registered successfully: ${newShipment.trackingNumber}`);
      setTrackingNumber(newShipment.trackingNumber);
      setNewShipment({ trackingNumber: "", carrier: "BlueDart", origin: "", destination: "", estimatedArrival: "" });
      handleTrackShipment();
    } catch (err: any) {
      alert("Failed to register shipment: " + (err.response?.data?.error || err.message));
    }
  };

  const handleOptimizeRoute = async () => {
    try {
      const res = await apiClient.post("/logistics/optimize-route", {
        points: routePoints
      });
      if (res.data?.success) {
        setOptimizedRoute(res.data.data);
      }
    } catch (err) {
      alert("Route optimization service unavailable.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/60 pb-4 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Logistics & Route Planner</h1>
          <p className="mt-1 text-sm text-slate-500">Track third-party carrier shipments, optimize delivery routes, and log dispatch schedules.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShipmentModal(true)} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
            <Plus className="h-4 w-4" /> Register Shipment
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tracking and Details panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Track Dispatch Shipment</h3>
            <form onSubmit={handleTrackShipment} className="flex gap-3">
              <input required type="text" value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} className="flex-1 rounded-lg border border-slate-200 p-2.5 dark:border-slate-800 text-sm" placeholder="Enter tracking number (e.g. TRK-10023)" />
              <button type="submit" className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
                <Search className="h-4 w-4" /> Track
              </button>
            </form>

            {loading && (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
              </div>
            )}

            {error && (
              <div className="mt-4 rounded-lg bg-rose-550/10 text-rose-600 p-3 text-xs font-semibold">
                {error}
              </div>
            )}

            {shipment && !loading && (
              <div className="mt-6 space-y-4">
                <div className="flex justify-between items-start border-b pb-4">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Shipment #{shipment.trackingNumber}</h4>
                    <p className="text-xs text-slate-400 mt-1">Carrier: {shipment.carrier}</p>
                  </div>
                  <span className="rounded-full bg-indigo-50 text-indigo-700 px-3 py-1 text-xs font-bold">{shipment.status || "TRANSIT"}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="block text-xs font-bold text-slate-400 uppercase">Origin</span>
                    <strong className="text-slate-700 dark:text-slate-300">{shipment.origin}</strong>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-400 uppercase">Destination</span>
                    <strong className="text-slate-700 dark:text-slate-300">{shipment.destination}</strong>
                  </div>
                </div>

                {shipment.estimatedArrival && (
                  <div className="pt-2 text-xs text-slate-500">
                    Estimated Arrival: <strong>{new Date(shipment.estimatedArrival).toLocaleDateString()}</strong>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Route Optimization tools */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Navigation className="h-4 w-4" /> Route Optimization
          </h3>
          <p className="text-xs text-slate-500">Solve TSP routing paths for multi-point drops and delivery vehicles.</p>
          
          <button onClick={handleOptimizeRoute} className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 py-2 text-xs font-semibold text-white hover:bg-indigo-700">
            <Play className="h-3 w-3" /> Optimize Delivery Path
          </button>

          {optimizedRoute && (
            <div className="rounded bg-slate-50 p-3 text-xs font-mono dark:bg-slate-800 space-y-2">
              <div>Est Distance: <strong>{optimizedRoute.totalDistance}</strong></div>
              <div>Est Time: <strong>{optimizedRoute.estimatedTime}</strong></div>
              <div className="text-[10px] text-emerald-600 font-bold">✓ Engine Path Optimized</div>
            </div>
          )}
        </div>
      </div>

      {/* Shipment Registration Modal */}
      {shipmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleCreateShipment} className="w-full max-w-md rounded-xl bg-white p-6 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Register Dispatch Shipment</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500">Tracking Number</label>
                <input required type="text" value={newShipment.trackingNumber} onChange={e => setNewShipment(p => ({ ...p, trackingNumber: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800" placeholder="e.g. TRK-10023" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500">Carrier</label>
                  <select required value={newShipment.carrier} onChange={e => setNewShipment(p => ({ ...p, carrier: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800 dark:bg-slate-800">
                    <option value="BlueDart">BlueDart</option>
                    <option value="DHL">DHL Express</option>
                    <option value="FedEx">FedEx</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500">Est. Arrival</label>
                  <input type="date" value={newShipment.estimatedArrival} onChange={e => setNewShipment(p => ({ ...p, estimatedArrival: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500">Origin</label>
                  <input required type="text" value={newShipment.origin} onChange={e => setNewShipment(p => ({ ...p, origin: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800" placeholder="e.g. New Delhi" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500">Destination</label>
                  <input required type="text" value={newShipment.destination} onChange={e => setNewShipment(p => ({ ...p, destination: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800" placeholder="e.g. Mumbai Hub" />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3 border-t pt-4">
              <button type="button" onClick={() => setShipmentModal(false)} className="rounded-lg px-4 py-2 text-sm border border-slate-200 hover:bg-slate-50">Cancel</button>
              <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Save Shipment</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
