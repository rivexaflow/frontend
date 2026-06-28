"use client";

import { useEffect, useState, useCallback } from "react";
import { Store, ShoppingCart, Tag, Check, CreditCard, RefreshCw, Layers, UserCheck } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { useHrCompanyId } from "@/features/workspace/hooks/use-hr-company-id";

type Product = {
  id: string;
  name: string;
  sku: string;
  salePrice: number;
  taxPercent: number;
};

type CartItem = {
  product: Product;
  quantity: number;
};

export function PosView() {
  const companyId = useHrCompanyId();
  const [session, setSession] = useState<any | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<string>("CASH");
  const [cashReceived, setCashReceived] = useState<string>("");
  const [cashierName, setCashierName] = useState<string>("Active Cashier");
  
  const [loading, setLoading] = useState(true);
  const [openingCash, setOpeningCash] = useState("1000");

  const loadProducts = useCallback(async () => {
    try {
      const res = await apiClient.get(`/api/inventory/${companyId}/products?limit=50`);
      if (res.data?.success) {
        setProducts(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  }, [companyId]);

  const checkActiveSession = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const res = await apiClient.get(`/api/pos/${companyId}/sessions?status=OPEN`);
      if (res.data?.success && res.data.data?.length > 0) {
        setSession(res.data.data[0]);
        await loadProducts();
      } else {
        setSession(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [companyId, loadProducts]);

  useEffect(() => {
    checkActiveSession();
  }, [checkActiveSession]);

  const handleOpenSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiClient.post(`/api/pos/${companyId}/sessions/open`, {
        openingCash: parseFloat(openingCash)
      });
      if (res.data?.success) {
        setSession(res.data.data);
        await loadProducts();
      }
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to open session");
    }
  };

  const handleCloseSession = async () => {
    if (!session) return;
    try {
      const res = await apiClient.post(`/api/pos/${companyId}/sessions/${session.id}/close`, {
        closingCash: session.openingCash
      });
      if (res.data?.success) {
        alert("Session closed successfully!");
        setSession(null);
        setCart([]);
      }
    } catch (err) {
      alert("Failed to close session");
    }
  };

  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const subtotal = cart.reduce((acc, item) => acc + item.product.salePrice * item.quantity, 0);
  const tax = cart.reduce((acc, item) => acc + (item.product.salePrice * item.quantity) * (item.product.taxPercent / 100), 0);
  const total = subtotal + tax - discount;

  const handleCheckout = async () => {
    if (!session || cart.length === 0) return;
    try {
      const res = await apiClient.post(`/api/pos/${companyId}/sales`, {
        sessionId: session.id,
        paymentMode,
        cashReceived: cashReceived ? parseFloat(cashReceived) : undefined,
        discount,
        items: cart.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          unitPrice: item.product.salePrice,
          taxPercent: item.product.taxPercent
        }))
      });
      if (res.data?.success) {
        alert("Receipt Generated: " + res.data.data.receiptNumber);
        setCart([]);
        setDiscount(0);
        setCashReceived("");
      }
    } catch (err: any) {
      alert("Checkout failed: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/60 pb-4 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">POS Cashier Terminal</h1>
          <p className="mt-1 text-sm text-slate-500">Retail counter workspace for sales transactions, bar-coding, and printing billing receipts.</p>
        </div>
        {session && (
          <div className="flex gap-2 items-center">
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 rounded-full px-3 py-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Active Session
            </span>
            <button onClick={handleCloseSession} className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700">
              Close Register
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : !session ? (
        // Open session gate
        <div className="max-w-md mx-auto rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 mt-12 text-center">
          <Store className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Register Closed</h2>
          <p className="text-sm text-slate-500 mt-1">Open a new terminal cash session to start logging sales transactions.</p>
          <form onSubmit={handleOpenSession} className="mt-6 space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-500">Opening Drawer Cash (INR)</label>
              <input required type="number" value={openingCash} onChange={e => setOpeningCash(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800" />
            </div>
            <button type="submit" className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
              Open Register Session
            </button>
          </form>
        </div>
      ) : (
        // Active Checkout Grid
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products grid */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Product Catalog</h3>
            {products.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800 bg-white dark:bg-slate-900">
                <p className="text-slate-500">No products available in this location.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {products.map((p) => (
                  <div key={p.id} onClick={() => handleAddToCart(p)} className="cursor-pointer rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md dark:border-slate-800 dark:bg-slate-900 transition-all">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2">{p.name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5 font-mono">{p.sku}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm font-bold text-indigo-600">₹{p.salePrice}</span>
                      <span className="text-[10px] text-slate-400">+{p.taxPercent}% Tax</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Sidebar */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col min-h-[500px]">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <ShoppingCart className="h-4 w-4" /> Shopping Cart
            </h3>
            
            <div className="flex-1 divide-y divide-slate-100 dark:divide-slate-800 overflow-y-auto max-h-[300px]">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">Cart is empty. Click catalog items.</div>
              ) : (
                cart.map((item) => (
                  <div key={item.product.id} className="py-3 flex justify-between items-start gap-4">
                    <div>
                      <h4 className="font-semibold text-xs text-slate-900 dark:text-white line-clamp-1">{item.product.name}</h4>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {item.quantity} x ₹{item.product.salePrice}
                      </div>
                    </div>
                    <button onClick={() => handleRemoveFromCart(item.product.id)} className="text-xs text-red-500 hover:underline">Remove</button>
                  </div>
                ))
              )}
            </div>

            {/* Billing Summary */}
            <div className="border-t border-slate-150 dark:border-slate-800 pt-4 mt-4 space-y-2">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Sales Tax</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500 items-center">
                <span>Discount</span>
                <input type="number" value={discount} onChange={e => setDiscount(parseFloat(e.target.value || "0"))} className="w-20 rounded border border-slate-200 text-right text-xs p-1 dark:border-slate-800" />
              </div>
              <div className="flex justify-between font-bold text-sm border-t border-slate-100 dark:border-slate-800 pt-2 text-slate-900 dark:text-white">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment & Action */}
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Payment Mode</label>
                <select value={paymentMode} onChange={e => setPaymentMode(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs dark:border-slate-800 dark:bg-slate-800">
                  <option value="CASH">Cash Payment</option>
                  <option value="CARD">Card Swipe</option>
                  <option value="UPI">UPI/Digital QR</option>
                </select>
              </div>
              {paymentMode === "CASH" && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Cash Received</label>
                  <input type="number" value={cashReceived} onChange={e => setCashReceived(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs dark:border-slate-800" />
                </div>
              )}
              <button onClick={handleCheckout} disabled={cart.length === 0} className="w-full rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">
                Generate Receipt & Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
