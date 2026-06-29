"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Users, ShieldCheck, DollarSign, RefreshCw, Layers } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { useHrCompanyId } from "@/features/workspace/hooks/use-hr-company-id";

type Vendor = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  gstNumber?: string;
  status: "ACTIVE" | "INACTIVE";
  _count?: { purchaseOrders: number };
};

type PurchaseOrder = {
  id: string;
  orderNumber: string;
  total: number;
  status: "DRAFT" | "PENDING" | "APPROVED" | "SENT" | "RECEIVED" | "CANCELLED";
  paymentStatus: "PENDING" | "PAID" | "PARTIAL";
  createdAt: string;
  vendor: { name: string };
};

export function PurchaseView() {
  const companyId = useHrCompanyId();
  const [activeTab, setActiveTab] = useState<"vendors" | "orders">("vendors");
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [vendorModal, setVendorModal] = useState(false);
  const [orderModal, setOrderModal] = useState(false);

  // Form states
  const [newVendor, setNewVendor] = useState({ name: "", email: "", phone: "", address: "", gstNumber: "" });
  const [newOrder, setNewOrder] = useState({
    vendorId: "",
    taxPercent: "18",
    discount: "0",
    items: [{ description: "Stock Purchase", quantity: 10, unitPrice: 500 }]
  });

  const loadData = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const [vRes, oRes] = await Promise.all([
        apiClient.get(`/purchase/${companyId}/vendors`),
        apiClient.get(`/purchase/${companyId}/orders`),
      ]);
      setVendors(vRes.data?.data || []);
      setOrders(oRes.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post(`/purchase/${companyId}/vendors`, newVendor);
      setVendorModal(false);
      setNewVendor({ name: "", email: "", phone: "", address: "", gstNumber: "" });
      loadData();
    } catch (err) {
      alert("Failed to create vendor profile");
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post(`/purchase/${companyId}/orders`, {
        ...newOrder,
        taxPercent: parseFloat(newOrder.taxPercent),
        discount: parseFloat(newOrder.discount),
        items: newOrder.items.map(i => ({
          ...i,
          quantity: parseFloat(String(i.quantity)),
          unitPrice: parseFloat(String(i.unitPrice))
        }))
      });
      setOrderModal(false);
      setNewOrder({
        vendorId: "",
        taxPercent: "18",
        discount: "0",
        items: [{ description: "Stock Purchase", quantity: 10, unitPrice: 500 }]
      });
      loadData();
    } catch (err) {
      alert("Failed to post Purchase Order");
    }
  };

  const handleAddLine = () => {
    setNewOrder(p => ({
      ...p,
      items: [...p.items, { description: "", quantity: 1, unitPrice: 0 }]
    }));
  };

  const handleLineChange = (index: number, field: string, value: any) => {
    setNewOrder(p => {
      const copy = [...p.items];
      copy[index] = { ...copy[index], [field]: value };
      return { ...p, items: copy };
    });
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/60 pb-4 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Procurement & Purchase Orders</h1>
          <p className="mt-1 text-sm text-slate-500">Manage external supply vendors directory, purchase pipeline orders, and log receipts logs.</p>
        </div>
        <div className="flex gap-2">
          {activeTab === "vendors" && (
            <button onClick={() => setVendorModal(true)} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
              <Plus className="h-4 w-4" /> Create Vendor
            </button>
          )}
          {activeTab === "orders" && (
            <button onClick={() => setOrderModal(true)} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
              <Plus className="h-4 w-4" /> Create Purchase Order
            </button>
          )}
          <button onClick={loadData} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800">
        <button onClick={() => setActiveTab("vendors")} className={`pb-3 text-sm font-semibold ${activeTab === "vendors" ? "border-b-2 border-indigo-600 text-indigo-600" : "text-slate-500 hover:text-slate-900"}`}>
          Vendors Directory
        </button>
        <button onClick={() => setActiveTab("orders")} className={`pb-3 text-sm font-semibold ${activeTab === "orders" ? "border-b-2 border-indigo-600 text-indigo-600" : "text-slate-500 hover:text-slate-900"}`}>
          Purchase Orders (PO)
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : (
        <div>
          {/* Vendors Directory */}
          {activeTab === "vendors" && (
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <tr>
                    <th className="px-6 py-4">Vendor Name</th>
                    <th className="px-6 py-4">GSTIN</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {vendors.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-500">No supply vendors recorded.</td>
                    </tr>
                  ) : (
                    vendors.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                        <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{v.name}</td>
                        <td className="px-6 py-4 font-mono text-xs">{v.gstNumber || "—"}</td>
                        <td className="px-6 py-4 text-xs text-slate-500">{v.email || v.phone || "—"}</td>
                        <td className="px-6 py-4">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${v.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-850"}`}>
                            {v.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Purchase Orders */}
          {activeTab === "orders" && (
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <tr>
                    <th className="px-6 py-4">PO Number</th>
                    <th className="px-6 py-4">Supplier Vendor</th>
                    <th className="px-6 py-4">Total Value</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-500">No purchase orders issued.</td>
                    </tr>
                  ) : (
                    orders.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                        <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white">{o.orderNumber}</td>
                        <td className="px-6 py-4">{o.vendor?.name}</td>
                        <td className="px-6 py-4 font-bold">₹{o.total.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className="rounded bg-indigo-50 text-indigo-700 px-2 py-0.5 text-xs font-bold">{o.status}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Vendor Modal */}
      {vendorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleCreateVendor} className="w-full max-w-md rounded-xl bg-white p-6 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Register Supply Vendor</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500">Vendor Name</label>
                <input required type="text" value={newVendor.name} onChange={e => setNewVendor(p => ({ ...p, name: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500">GSTIN Identification</label>
                <input type="text" value={newVendor.gstNumber} onChange={e => setNewVendor(p => ({ ...p, gstNumber: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500">Email Address</label>
                  <input type="email" value={newVendor.email} onChange={e => setNewVendor(p => ({ ...p, email: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500">Phone</label>
                  <input type="text" value={newVendor.phone} onChange={e => setNewVendor(p => ({ ...p, phone: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800" />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3 border-t pt-4">
              <button type="button" onClick={() => setVendorModal(false)} className="rounded-lg px-4 py-2 text-sm border border-slate-200 hover:bg-slate-50">Cancel</button>
              <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Save Profile</button>
            </div>
          </form>
        </div>
      )}

      {/* PO Modal */}
      {orderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleCreateOrder} className="w-full max-w-2xl rounded-xl bg-white p-6 dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Create Purchase Order (PO)</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500">Supplier Vendor</label>
                <select required value={newOrder.vendorId} onChange={e => setNewOrder(p => ({ ...p, vendorId: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800 dark:bg-slate-800">
                  <option value="">Select Vendor</option>
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>

              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-4">Required Item Lines</h4>
              <div className="space-y-3">
                {newOrder.items.map((line, idx) => (
                  <div key={idx} className="grid grid-cols-4 gap-3 items-end">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-semibold text-slate-400">Description</label>
                      <input required type="text" value={line.description} onChange={e => handleLineChange(idx, "description", e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs dark:border-slate-800" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400">Quantity</label>
                      <input required type="number" value={line.quantity} onChange={e => handleLineChange(idx, "quantity", e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs dark:border-slate-800" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400">Unit Price</label>
                      <input required type="number" value={line.unitPrice} onChange={e => handleLineChange(idx, "unitPrice", e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs dark:border-slate-800" />
                    </div>
                  </div>
                ))}
              </div>
              <button type="button" onClick={handleAddLine} className="text-xs text-indigo-600 font-semibold hover:underline mt-2">
                + Add Line Item
              </button>
            </div>
            <div className="mt-6 flex justify-end gap-3 border-t pt-4">
              <button type="button" onClick={() => setOrderModal(false)} className="rounded-lg px-4 py-2 text-sm border border-slate-200 hover:bg-slate-50">Cancel</button>
              <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Save Purchase Order</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
