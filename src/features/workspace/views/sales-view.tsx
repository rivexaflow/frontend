"use client";

import { useEffect, useState, useCallback } from "react";
import { FileText, Plus, CheckCircle2, ArrowRight, DollarSign, Calendar, Clock, RefreshCw, Trash2 } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { useHrCompanyId } from "@/features/workspace/hooks/use-hr-company-id";

type SalesItem = {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

type Quotation = {
  id: string;
  quotationNumber: string;
  clientName: string;
  total: number;
  status: "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED";
  validUntil?: string;
  items?: SalesItem[];
  order?: { id: string };
};

type SalesOrder = {
  id: string;
  orderNumber: string;
  clientName: string;
  total: number;
  status: "DRAFT" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  paymentStatus: "PENDING" | "PAID" | "PARTIAL";
  createdAt: string;
  items?: SalesItem[];
};

export function SalesView() {
  const companyId = useHrCompanyId();
  const [activeTab, setActiveTab] = useState<"quotations" | "orders">("quotations");
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [quoteModal, setQuoteModal] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quotation | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);

  // Form state
  const [newQuote, setNewQuote] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    clientAddress: "",
    taxPercent: "18",
    discount: "0",
    items: [
      { description: "Product A", quantity: 1, unitPrice: 1500 },
      { description: "Service Charge", quantity: 1, unitPrice: 500 }
    ]
  });

  const loadData = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const [qRes, oRes] = await Promise.all([
        apiClient.get(`/sales/${companyId}/quotations`),
        apiClient.get(`/sales/${companyId}/orders`),
      ]);
      setQuotations(qRes.data?.data || []);
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

  const handleCreateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post(`/sales/${companyId}/quotations`, {
        ...newQuote,
        taxPercent: parseFloat(newQuote.taxPercent),
        discount: parseFloat(newQuote.discount),
        items: newQuote.items.map(i => ({
          ...i,
          quantity: parseFloat(String(i.quantity)),
          unitPrice: parseFloat(String(i.unitPrice))
        }))
      });
      setQuoteModal(false);
      setNewQuote({
        clientName: "",
        clientEmail: "",
        clientPhone: "",
        clientAddress: "",
        taxPercent: "18",
        discount: "0",
        items: [
          { description: "Product A", quantity: 1, unitPrice: 1500 },
          { description: "Service Charge", quantity: 1, unitPrice: 500 }
        ]
      });
      loadData();
    } catch (err) {
      alert("Failed to create quotation");
    }
  };

  const handleConfirmQuote = async (quoteId: string) => {
    try {
      await apiClient.patch(`/sales/${companyId}/quotations/${quoteId}/confirm`);
      alert("Quotation confirmed and converted to Sales Order!");
      loadData();
    } catch (err) {
      alert("Confirmation failed");
    }
  };

  const handleAddLine = () => {
    setNewQuote(p => ({
      ...p,
      items: [...p.items, { description: "", quantity: 1, unitPrice: 0 }]
    }));
  };

  const handleLineChange = (index: number, field: string, value: any) => {
    setNewQuote(p => {
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Sales & Customer Orders</h1>
          <p className="mt-1 text-sm text-slate-500">Formulate client quotes, manage pipeline quotations, and execute customer purchase orders.</p>
        </div>
        <div className="flex gap-2">
          {activeTab === "quotations" && (
            <button onClick={() => setQuoteModal(true)} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
              <Plus className="h-4 w-4" /> Create Quotation
            </button>
          )}
          <button onClick={loadData} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800">
        <button onClick={() => { setActiveTab("quotations"); setSelectedQuote(null); }} className={`pb-3 text-sm font-semibold ${activeTab === "quotations" ? "border-b-2 border-indigo-600 text-indigo-600" : "text-slate-500 hover:text-slate-900"}`}>
          Quotations
        </button>
        <button onClick={() => { setActiveTab("orders"); setSelectedOrder(null); }} className={`pb-3 text-sm font-semibold ${activeTab === "orders" ? "border-b-2 border-indigo-600 text-indigo-600" : "text-slate-500 hover:text-slate-900"}`}>
          Sales Orders
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Main items list */}
          <div className="lg:col-span-2 space-y-4">
            {activeTab === "quotations" ? (
              quotations.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800 bg-white dark:bg-slate-900">
                  <FileText className="mx-auto h-12 w-12 text-slate-400" />
                  <p className="text-slate-500 mt-4">No active quotations.</p>
                </div>
              ) : (
                quotations.map((q) => (
                  <div key={q.id} onClick={() => setSelectedQuote(q)} className={`cursor-pointer rounded-xl border p-5 shadow-sm transition-all bg-white dark:bg-slate-900 ${selectedQuote?.id === q.id ? "border-indigo-600 ring-1 ring-indigo-600" : "border-slate-200 dark:border-slate-800"}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">{q.clientName}</h4>
                        <p className="text-xs text-slate-400 mt-1">{q.quotationNumber}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-950 dark:text-white">₹{q.total.toLocaleString()}</span>
                        <div className="mt-1">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${q.status === "ACCEPTED" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                            {q.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )
            ) : (
              orders.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800 bg-white dark:bg-slate-900">
                  <CheckCircle2 className="mx-auto h-12 w-12 text-slate-400" />
                  <p className="text-slate-500 mt-4">No sales orders found.</p>
                </div>
              ) : (
                orders.map((o) => (
                  <div key={o.id} onClick={() => setSelectedOrder(o)} className={`cursor-pointer rounded-xl border p-5 shadow-sm transition-all bg-white dark:bg-slate-900 ${selectedOrder?.id === o.id ? "border-indigo-600 ring-1 ring-indigo-600" : "border-slate-200 dark:border-slate-800"}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">{o.clientName}</h4>
                        <p className="text-xs text-slate-400 mt-1">{o.orderNumber}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-950 dark:text-white">₹{o.total.toLocaleString()}</span>
                        <div className="mt-1 flex gap-1">
                          <span className="rounded bg-indigo-50 text-indigo-700 px-1.5 py-0.5 text-[9px] font-bold">{o.status}</span>
                          <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${o.paymentStatus === "PAID" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{o.paymentStatus}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )
            )}
          </div>

          {/* Details Sidebar panel */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {activeTab === "quotations" && selectedQuote ? (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">{selectedQuote.quotationNumber} Details</h3>
                <div className="text-xs space-y-2 text-slate-600 dark:text-slate-400">
                  <div>Client: <strong>{selectedQuote.clientName}</strong></div>
                  <div>Status: <strong>{selectedQuote.status}</strong></div>
                  {selectedQuote.validUntil && <div>Valid Until: <strong>{new Date(selectedQuote.validUntil).toLocaleDateString()}</strong></div>}
                </div>
                {selectedQuote.status === "SENT" && (
                  <button onClick={() => handleConfirmQuote(selectedQuote.id)} className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">
                    <CheckCircle2 className="h-4 w-4" /> Convert to Sales Order
                  </button>
                )}
              </div>
            ) : activeTab === "orders" && selectedOrder ? (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">{selectedOrder.orderNumber} Details</h3>
                <div className="text-xs space-y-2 text-slate-600 dark:text-slate-400">
                  <div>Client: <strong>{selectedOrder.clientName}</strong></div>
                  <div>Delivery Status: <strong>{selectedOrder.status}</strong></div>
                  <div>Payment Status: <strong>{selectedOrder.paymentStatus}</strong></div>
                  <div>Date Logged: <strong>{new Date(selectedOrder.createdAt).toLocaleDateString()}</strong></div>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-400 text-sm py-12">Select an item to view transaction lines.</div>
            )}
          </div>
        </div>
      )}

      {/* Quote creation Modal */}
      {quoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleCreateQuotation} className="w-full max-w-2xl rounded-xl bg-white p-6 dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Create Client Quotation</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500">Client Name</label>
                  <input required type="text" value={newQuote.clientName} onChange={e => setNewQuote(p => ({ ...p, clientName: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500">Client Email</label>
                  <input type="email" value={newQuote.clientEmail} onChange={e => setNewQuote(p => ({ ...p, clientEmail: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800" />
                </div>
              </div>

              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-4">Invoice Lines</h4>
              <div className="space-y-3">
                {newQuote.items.map((line, idx) => (
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
              <button type="button" onClick={() => setQuoteModal(false)} className="rounded-lg px-4 py-2 text-sm border border-slate-200 hover:bg-slate-50">Cancel</button>
              <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Save Quote</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
