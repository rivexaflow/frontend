"use client";

import { useEffect, useState, useCallback } from "react";
import { Package, Plus, Home, ArrowUpRight, ArrowDownLeft, AlertTriangle, Layers, RefreshCw } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { useHrCompanyId } from "@/features/workspace/hooks/use-hr-company-id";

type Product = {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  description?: string;
  category: string;
  unit: string;
  costPrice: number;
  salePrice: number;
  currentStock: number;
  minStock: number;
  maxStock?: number;
  isActive: boolean;
  warehouse?: { name: string };
};

type Warehouse = {
  id: string;
  name: string;
  address?: string;
  isDefault: boolean;
  _count?: { products: number };
};

type Movement = {
  id: string;
  type: "IN" | "OUT" | "ADJUST" | "TRANSFER" | "RETURN";
  quantity: number;
  reason?: string;
  createdAt: string;
  product?: { name: string; sku: string };
};

export function InventoryView() {
  const companyId = useHrCompanyId();
  const [activeTab, setActiveTab] = useState<"products" | "warehouses" | "movements">("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [lowStock, setLowStock] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [productModal, setProductModal] = useState(false);
  const [warehouseModal, setWarehouseModal] = useState(false);
  const [movementModal, setMovementModal] = useState(false);

  // Form states
  const [newProduct, setNewProduct] = useState({ name: "", sku: "", category: "General", unit: "PCS", costPrice: "", salePrice: "", minStock: "5", warehouseId: "" });
  const [newWarehouse, setNewWarehouse] = useState({ name: "", address: "", isDefault: false });
  const [newMovement, setNewMovement] = useState({ productId: "", type: "IN", quantity: "", reason: "" });

  const loadData = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const [prodRes, whRes, movRes, lowRes] = await Promise.all([
        apiClient.get(`/api/inventory/${companyId}/products`),
        apiClient.get(`/api/inventory/${companyId}/warehouses`),
        apiClient.get(`/api/inventory/${companyId}/movements`),
        apiClient.get(`/api/inventory/${companyId}/low-stock`),
      ]);
      setProducts(prodRes.data?.data || []);
      setWarehouses(whRes.data?.data || []);
      setMovements(movRes.data?.data || []);
      setLowStock(lowRes.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post(`/api/inventory/${companyId}/products`, {
        ...newProduct,
        costPrice: parseFloat(newProduct.costPrice || "0"),
        salePrice: parseFloat(newProduct.salePrice || "0"),
        minStock: parseFloat(newProduct.minStock || "0"),
        warehouseId: newProduct.warehouseId || undefined
      });
      setProductModal(false);
      setNewProduct({ name: "", sku: "", category: "General", unit: "PCS", costPrice: "", salePrice: "", minStock: "5", warehouseId: "" });
      loadData();
    } catch (err) {
      alert("Failed to create product");
    }
  };

  const handleCreateWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post(`/api/inventory/${companyId}/warehouses`, newWarehouse);
      setWarehouseModal(false);
      setNewWarehouse({ name: "", address: "", isDefault: false });
      loadData();
    } catch (err) {
      alert("Failed to create warehouse");
    }
  };

  const handleCreateMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post(`/api/inventory/${companyId}/movements`, {
        ...newMovement,
        quantity: parseFloat(newMovement.quantity)
      });
      setMovementModal(false);
      setNewMovement({ productId: "", type: "IN", quantity: "", reason: "" });
      loadData();
    } catch (err: any) {
      alert("Stock update failed: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/60 pb-4 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Inventory & Stock Control</h1>
          <p className="mt-1 text-sm text-slate-500">Track physical product levels across multiple locations and log stock movement trails.</p>
        </div>
        <div className="flex gap-2">
          {activeTab === "products" && (
            <>
              <button onClick={() => setMovementModal(true)} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
                Adjust Stock
              </button>
              <button onClick={() => setProductModal(true)} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
                <Plus className="h-4 w-4" /> Add Product
              </button>
            </>
          )}
          {activeTab === "warehouses" && (
            <button onClick={() => setWarehouseModal(true)} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
              <Plus className="h-4 w-4" /> Create Warehouse
            </button>
          )}
          <button onClick={loadData} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Alert banner for low stock */}
      {lowStock.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-400">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <div className="text-sm">
            You have <strong className="font-semibold">{lowStock.length}</strong> items below the minimum stock threshold!
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800">
        <button onClick={() => setActiveTab("products")} className={`pb-3 text-sm font-semibold ${activeTab === "products" ? "border-b-2 border-indigo-600 text-indigo-600" : "text-slate-500 hover:text-slate-900"}`}>
          Products catalog
        </button>
        <button onClick={() => setActiveTab("warehouses")} className={`pb-3 text-sm font-semibold ${activeTab === "warehouses" ? "border-b-2 border-indigo-600 text-indigo-600" : "text-slate-500 hover:text-slate-900"}`}>
          Warehouses
        </button>
        <button onClick={() => setActiveTab("movements")} className={`pb-3 text-sm font-semibold ${activeTab === "movements" ? "border-b-2 border-indigo-600 text-indigo-600" : "text-slate-500 hover:text-slate-900"}`}>
          Movements logs
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : (
        <div>
          {/* Catalog Tab */}
          {activeTab === "products" && (
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <tr>
                    <th className="px-6 py-4">Item Name</th>
                    <th className="px-6 py-4">SKU</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Cost Price</th>
                    <th className="px-6 py-4">Sale Price</th>
                    <th className="px-6 py-4">Stock status</th>
                    <th className="px-6 py-4">Warehouse</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-500">No products configured.</td>
                    </tr>
                  ) : (
                    products.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                        <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{p.name}</td>
                        <td className="px-6 py-4 font-mono text-xs">{p.sku}</td>
                        <td className="px-6 py-4">{p.category}</td>
                        <td className="px-6 py-4">₹{p.costPrice}</td>
                        <td className="px-6 py-4">₹{p.salePrice}</td>
                        <td className="px-6 py-4">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${p.currentStock <= p.minStock ? "bg-red-100 text-red-800" : "bg-emerald-100 text-emerald-800"}`}>
                            {p.currentStock} {p.unit}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500">{p.warehouse?.name || "Global"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Warehouses Tab */}
          {activeTab === "warehouses" && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {warehouses.length === 0 ? (
                <div className="col-span-full rounded-xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
                  <Home className="mx-auto h-12 w-12 text-slate-400" />
                  <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">No warehouses registered</h3>
                </div>
              ) : (
                warehouses.map((wh) => (
                  <div key={wh.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-950 dark:text-white">{wh.name}</h3>
                      {wh.isDefault && <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold rounded px-1.5 py-0.5">DEFAULT</span>}
                    </div>
                    <p className="mt-2 text-xs text-slate-500">{wh.address || "No address listed"}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Movements Tab */}
          {activeTab === "movements" && (
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <tr>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Quantity</th>
                    <th className="px-6 py-4">Reason</th>
                    <th className="px-6 py-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {movements.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500">No stock movements tracked.</td>
                    </tr>
                  ) : (
                    movements.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                        <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                          {m.product?.name} <span className="text-xs font-normal text-slate-400">({m.product?.sku})</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`flex items-center gap-1 text-xs font-bold ${m.type === "IN" || m.type === "RETURN" ? "text-emerald-600" : "text-rose-600"}`}>
                            {m.type === "IN" ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                            {m.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold">{m.quantity}</td>
                        <td className="px-6 py-4 text-slate-500">{m.reason || "Stock update"}</td>
                        <td className="px-6 py-4 text-xs text-slate-400">{new Date(m.createdAt).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Product Creation modal */}
      {productModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleCreateProduct} className="w-full max-w-md rounded-xl bg-white p-6 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Add Product Catalog</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500">Product Name</label>
                <input required type="text" value={newProduct.name} onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500">SKU</label>
                  <input required type="text" value={newProduct.sku} onChange={e => setNewProduct(p => ({ ...p, sku: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500">Unit</label>
                  <input required type="text" value={newProduct.unit} onChange={e => setNewProduct(p => ({ ...p, unit: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500">Cost Price (INR)</label>
                  <input required type="number" step="0.01" value={newProduct.costPrice} onChange={e => setNewProduct(p => ({ ...p, costPrice: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500">Sale Price (INR)</label>
                  <input required type="number" step="0.01" value={newProduct.salePrice} onChange={e => setNewProduct(p => ({ ...p, salePrice: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500">Min Alert Limit</label>
                  <input required type="number" value={newProduct.minStock} onChange={e => setNewProduct(p => ({ ...p, minStock: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500">Warehouse</label>
                  <select value={newProduct.warehouseId} onChange={e => setNewProduct(p => ({ ...p, warehouseId: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800 dark:bg-slate-800">
                    <option value="">Select Warehouse</option>
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setProductModal(false)} className="rounded-lg px-4 py-2 text-sm border border-slate-200 hover:bg-slate-50">Cancel</button>
              <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Save Product</button>
            </div>
          </form>
        </div>
      )}

      {/* Warehouse Creation modal */}
      {warehouseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleCreateWarehouse} className="w-full max-w-md rounded-xl bg-white p-6 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Create Warehouse Location</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500">Warehouse Name</label>
                <input required type="text" value={newWarehouse.name} onChange={e => setNewWarehouse(p => ({ ...p, name: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500">Address Details</label>
                <input type="text" value={newWarehouse.address} onChange={e => setNewWarehouse(p => ({ ...p, address: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="defaultWh" checked={newWarehouse.isDefault} onChange={e => setNewWarehouse(p => ({ ...p, isDefault: e.target.checked }))} />
                <label htmlFor="defaultWh" className="text-xs font-semibold text-slate-600 dark:text-slate-400">Set as Default Warehouse</label>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setWarehouseModal(false)} className="rounded-lg px-4 py-2 text-sm border border-slate-200 hover:bg-slate-50">Cancel</button>
              <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Create Warehouse</button>
            </div>
          </form>
        </div>
      )}

      {/* Stock Adjustment modal */}
      {movementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleCreateMovement} className="w-full max-w-md rounded-xl bg-white p-6 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Stock Ledger Adjustment</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500">Product</label>
                <select required value={newMovement.productId} onChange={e => setNewMovement(p => ({ ...p, productId: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800 dark:bg-slate-800">
                  <option value="">Select Product</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500">Adjustment Type</label>
                  <select required value={newMovement.type} onChange={e => setNewMovement(p => ({ ...p, type: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800 dark:bg-slate-800">
                    <option value="IN">Stock IN (+)</option>
                    <option value="OUT">Stock OUT (-)</option>
                    <option value="ADJUST">Force Adjust (=)</option>
                    <option value="RETURN">Return IN (+)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500">Quantity</label>
                  <input required type="number" step="0.01" value={newMovement.quantity} onChange={e => setNewMovement(p => ({ ...p, quantity: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500">Reason / Reference</label>
                <input required type="text" value={newMovement.reason} onChange={e => setNewMovement(p => ({ ...p, reason: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800" placeholder="e.g. Monthly Audit, Damaged goods" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setMovementModal(false)} className="rounded-lg px-4 py-2 text-sm border border-slate-200 hover:bg-slate-50">Cancel</button>
              <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Save Adjustment</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
