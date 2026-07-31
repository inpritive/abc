import React, { useState, useEffect } from 'react';
import {
  WifiOff,
  Wifi,
  RefreshCw,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  ShoppingBag,
  DollarSign,
  User,
  Phone,
} from 'lucide-react';
import { Product } from '../../types';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';

interface OfflinePOSTabProps {
  onSyncCompleted?: () => void;
}

export const OfflinePOSTab: React.FC<OfflinePOSTabProps> = ({ onSyncCompleted }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineBills, setOfflineBills] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  // POS Cart State
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [selectedProdId, setSelectedProdId] = useState('');
  const [addQty, setAddQty] = useState(1);
  const [custName, setCustName] = useState('Walk-in Customer');
  const [custPhone, setCustPhone] = useState('9876543210');
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'UPI'>('CASH');

  const loadOfflineBills = () => {
    try {
      const stored = localStorage.getItem('procraft_offline_bills');
      setOfflineBills(stored ? JSON.parse(stored) : []);
    } catch {
      setOfflineBills([]);
    }
  };

  const saveOfflineBills = (bills: any[]) => {
    localStorage.setItem('procraft_offline_bills', JSON.stringify(bills));
    setOfflineBills(bills);
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        const prods = data.products || [];
        setProducts(prods);
        if (prods.length > 0) {
          setSelectedProdId(prods[0]._id);
        }
      }
    } catch {
      // Offline fallback: load from cached products if available
      const cached = localStorage.getItem('procraft_cached_products');
      if (cached) {
        const prods = JSON.parse(cached);
        setProducts(prods);
        if (prods.length > 0) setSelectedProdId(prods[0]._id);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    loadOfflineBills();

    const handleOnline = () => {
      setIsOnline(true);
      // Auto-sync when internet reconnects!
      syncOfflineBills();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Cache products for offline use whenever we fetch them online
  useEffect(() => {
    if (products.length > 0) {
      localStorage.setItem('procraft_cached_products', JSON.stringify(products));
    }
  }, [products]);

  const handleAddToCart = () => {
    const p = products.find((pr) => pr._id === selectedProdId);
    if (!p) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.product._id === p._id);
      if (existing) {
        return prev.map((item) =>
          item.product._id === p._id
            ? { ...item, quantity: item.quantity + addQty }
            : item
        );
      }
      return [...prev, { product: p, quantity: addQty }];
    });
  };

  const handleRemoveFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.product._id !== id));
  };

  const subtotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);

  const handleCompleteWalkinBill = () => {
    if (cart.length === 0) return;

    const newBill = {
      id: `LOCAL-${Date.now()}`,
      orderNumber: `POS-${Math.floor(100000 + Math.random() * 900000)}`,
      customerName: custName || 'Walk-in Customer',
      customerPhone: custPhone || '0000000000',
      paymentMethod: paymentMode,
      items: cart.map((item) => ({
        product: item.product._id,
        productName: item.product.name,
        price: item.product.price,
        costPrice: item.product.costPrice,
        quantity: item.quantity,
      })),
      totalAmount: subtotal,
      createdAt: new Date().toISOString(),
      status: 'Not yet synced',
    };

    const updated = [newBill, ...offlineBills];
    saveOfflineBills(updated);
    setCart([]);
    setCustName('Walk-in Customer');
    setCustPhone('9876543210');
    setSyncMsg({
      type: 'success',
      text: `Walk-in Bill #${newBill.orderNumber} saved locally! (${updated.length} bills pending sync)`,
    });

    // If online, trigger auto sync immediately
    if (navigator.onLine) {
      syncOfflineBills(updated);
    }
  };

  const syncOfflineBills = async (billsToSync?: any[]) => {
    const list = billsToSync || offlineBills;
    if (list.length === 0) return;
    if (!navigator.onLine) {
      setSyncMsg({
        type: 'error',
        text: 'Cannot sync right now: No internet connection.',
      });
      return;
    }

    setIsSyncing(true);
    setSyncMsg(null);
    try {
      const token = localStorage.getItem('procraft_token');
      const res = await fetch('/api/orders/offline-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bills: list }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to sync offline bills');
      }

      saveOfflineBills([]);
      setSyncMsg({
        type: 'success',
        text: `Successfully synced ${data.count} offline bill(s) to server! Inventory & revenue updated.`,
      });
      if (onSyncCompleted) onSyncCompleted();
    } catch (err: any) {
      setSyncMsg({ type: 'error', text: err.message });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary-400">
            Resilient Counter Billing
          </span>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Offline POS & Walk-in Billing</span>
            {isOnline ? (
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5" /> Online
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold flex items-center gap-1.5">
                <WifiOff className="w-3.5 h-3.5 animate-pulse" /> Offline Mode
              </span>
            )}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {offlineBills.length > 0 && (
            <button
              onClick={() => syncOfflineBills()}
              disabled={isSyncing || !isOnline}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>
                {isSyncing
                  ? 'Syncing to Server...'
                  : `Sync Now (${offlineBills.length} pending)`}
              </span>
            </button>
          )}
        </div>
      </div>

      {syncMsg && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
            syncMsg.type === 'success'
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
              : 'bg-red-500/20 border-red-500/40 text-red-300'
          }`}
        >
          {syncMsg.type === 'success' ? (
            <CheckCircle className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{syncMsg.text}</span>
        </div>
      )}

      {/* Grid: Walk-in POS Terminal + Pending Offline Bills */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* POS Cart Terminal */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-800/80 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary-500" />
              <span>Quick Counter Walk-in Sale</span>
            </h3>
            <span className="text-xs text-slate-400">Works 100% Offline</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                Customer Name
              </label>
              <input
                type="text"
                value={custName}
                onChange={(e) => setCustName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={custPhone}
                onChange={(e) => setCustPhone(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-300">Add Product to Counter Sale</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="md:col-span-2">
                <select
                  value={selectedProdId}
                  onChange={(e) => setSelectedProdId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                >
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} — ₹{p.price}/{p.unit} (In stock: {p.stockQuantity})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <input
                  type="number"
                  min={1}
                  value={addQty}
                  onChange={(e) => setAddQty(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                />
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="px-4 py-2 rounded-xl bg-primary-600/30 border border-primary-500/50 text-primary-300 hover:bg-primary-600/40 text-xs font-bold"
            >
              + Add Item to Walk-in Bill
            </button>
          </div>

          {/* Cart Table */}
          {cart.length > 0 ? (
            <div className="space-y-3">
              <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-900 text-[10px] text-slate-400 uppercase">
                      <th className="py-2.5 px-3">Product Name</th>
                      <th className="py-2.5 px-3">Qty</th>
                      <th className="py-2.5 px-3">Price</th>
                      <th className="py-2.5 px-3 text-right">Remove</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    {cart.map((item) => (
                      <tr key={item.product._id} className="hover:bg-slate-900/50">
                        <td className="py-2 px-3 font-bold">{item.product.name}</td>
                        <td className="py-2 px-3">{item.quantity}</td>
                        <td className="py-2 px-3 font-mono">
                          ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <button
                            onClick={() => handleRemoveFromCart(item.product._id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400">Total Payable Amount</span>
                  <div className="text-2xl font-extrabold text-amber-400 font-mono">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </div>
                </div>

                <button
                  onClick={handleCompleteWalkinBill}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-amber-600 hover:from-primary-500 hover:to-amber-500 text-white font-extrabold text-xs shadow-lg shadow-primary-600/30 flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Complete Walk-in Sale</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-xl bg-slate-900/40 border border-slate-800/80 text-center">
              <ShoppingBag className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <span className="text-xs font-bold text-slate-400">Cart is Empty</span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Add store items above to generate an instant walk-in invoice.
              </p>
            </div>
          )}
        </div>

        {/* Pending Offline Bills Queue */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
              Offline Bills Queue
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30">
              {offlineBills.length} Unsynced
            </span>
          </div>

          {offlineBills.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              <CheckCircle className="w-8 h-8 text-emerald-500/50 mx-auto mb-2" />
              <span>All bills are synced with the server!</span>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {offlineBills.map((bill) => (
                <div
                  key={bill.id}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-extrabold text-amber-400 text-xs">
                      {bill.orderNumber}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-extrabold border border-red-500/30">
                      Not yet synced
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 font-bold">
                    {bill.customerName}
                  </div>

                  <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-800">
                    <span className="text-slate-500">
                      {bill.items.length} items
                    </span>
                    <span className="font-mono font-extrabold text-white">
                      ₹{bill.totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
