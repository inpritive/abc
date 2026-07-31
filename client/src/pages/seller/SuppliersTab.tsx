import React, { useState, useEffect } from 'react';
import {
  Truck,
  Plus,
  FileText,
  CheckCircle,
  Clock,
  DollarSign,
  Phone,
  MapPin,
  Camera,
  Scan,
  AlertCircle,
  Check,
} from 'lucide-react';
import { Supplier, PurchaseOrder, Product } from '../../types';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { Modal } from '../../components/common/Modal';

export const SuppliersTab: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [isCreatePOOpen, setIsCreatePOOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedSupplierForPay, setSelectedSupplierForPay] = useState<Supplier | null>(null);
  const [payAmount, setPayAmount] = useState('');

  // OCR Bill Scanner Modal state
  const [isOCRModalOpen, setIsOCRModalOpen] = useState(false);
  const [ocrSampleType, setOcrSampleType] = useState('paint_invoice');
  const [isScanning, setIsScanning] = useState(false);
  const [extractedItems, setExtractedItems] = useState<any[]>([]);
  const [ocrSuccessMsg, setOcrSuccessMsg] = useState('');

  // New supplier form state
  const [supName, setSupName] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supAddress, setSupAddress] = useState('');
  const [supItems, setSupItems] = useState('paint, tools');

  // Create PO form state
  const [poSupplierId, setPoSupplierId] = useState('');
  const [poItemsList, setPoItemsList] = useState<
    { product: string; productName: string; quantity: number; unitCost: number }[]
  >([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [itemQty, setItemQty] = useState(10);
  const [itemCost, setItemCost] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('procraft_token');
      const headers = { Authorization: `Bearer ${token}` };
      const [supRes, poRes, prodRes] = await Promise.all([
        fetch('/api/suppliers', { headers }),
        fetch('/api/purchase-orders', { headers }),
        fetch('/api/products'),
      ]);

      if (supRes.ok && poRes.ok && prodRes.ok) {
        const supData = await supRes.json();
        const poData = await poRes.json();
        const prodData = await prodRes.json();

        setSuppliers(supData.suppliers || []);
        setPurchaseOrders(poData.purchaseOrders || []);
        setProducts(prodData.products || []);
        if (supData.suppliers?.length > 0) {
          setPoSupplierId(supData.suppliers[0]._id);
        }
        if (prodData.products?.length > 0) {
          setSelectedProductId(prodData.products[0]._id);
          setItemCost(prodData.products[0].costPrice);
        }
      }
    } catch (err) {
      console.error('Error fetching suppliers & POs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName || !supPhone) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('procraft_token');
      const res = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: supName,
          phone: supPhone,
          address: supAddress,
          itemsSupplied: supItems.split(',').map((s) => s.trim()),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSuppliers((prev) => [data.supplier, ...prev]);
        setIsAddSupplierOpen(false);
        setSupName('');
        setSupPhone('');
        setSupAddress('');
      }
    } catch (err) {
      console.error('Error adding supplier:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaySupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierForPay || !payAmount || Number(payAmount) <= 0) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('procraft_token');
      const res = await fetch(`/api/suppliers/${selectedSupplierForPay._id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: Number(payAmount) }),
      });
      if (res.ok) {
        const data = await res.json();
        setSuppliers((prev) =>
          prev.map((s) => (s._id === selectedSupplierForPay._id ? data.supplier : s))
        );
        setIsPayModalOpen(false);
        setPayAmount('');
      }
    } catch (err) {
      console.error('Error paying supplier:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddItemToPO = () => {
    const prod = products.find((p) => p._id === selectedProductId);
    if (!prod) return;
    setPoItemsList((prev) => [
      ...prev,
      {
        product: prod._id,
        productName: prod.name,
        quantity: itemQty,
        unitCost: itemCost,
      },
    ]);
  };

  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!poSupplierId || poItemsList.length === 0) {
      setErrorMsg('Please select a supplier and add at least one item to the PO.');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const token = localStorage.getItem('procraft_token');
      const res = await fetch('/api/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          supplier: poSupplierId,
          items: poItemsList,
          amountPaid: 0,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setPurchaseOrders((prev) => [data.purchaseOrder, ...prev]);
        setIsCreatePOOpen(false);
        setPoItemsList([]);
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReceivePO = async (id: string, poNumber: string) => {
    if (
      !window.confirm(
        `Mark Purchase Order #${poNumber} as RECEIVED?\n\nThis will automatically INCREASE inventory stock for all items in this PO!`
      )
    )
      return;
    try {
      const token = localStorage.getItem('procraft_token');
      const res = await fetch(`/api/purchase-orders/${id}/receive`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPurchaseOrders((prev) =>
          prev.map((po) => (po._id === id ? data.purchaseOrder : po))
        );
        fetchData();
        alert(data.message || 'PO Received and stock updated!');
      }
    } catch (err) {
      console.error('Error receiving PO:', err);
    }
  };

  // Run AI OCR Invoice Scan
  const handleScanBill = async () => {
    setIsScanning(true);
    setOcrSuccessMsg('');
    try {
      const token = localStorage.getItem('procraft_token');
      const res = await fetch('/api/purchase-orders/scan-bill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ sampleBillType: ocrSampleType }),
      });
      if (res.ok) {
        const data = await res.json();
        setExtractedItems(data.extractedItems || []);
        setOcrSuccessMsg('Bill OCR extracted successfully! Review items below.');
      }
    } catch (err) {
      console.error('OCR scan error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  // Convert OCR items to a live Purchase Order and auto-receive
  const handleConfirmOCRBill = async () => {
    if (!suppliers.length || !extractedItems.length) return;
    const validItems = extractedItems
      .filter((it) => it.matchedProductId)
      .map((it) => ({
        product: it.matchedProductId,
        productName: it.rawName,
        quantity: it.quantity,
        unitCost: it.unitCost,
      }));

    if (validItems.length === 0) {
      alert('Please match at least one item to an existing product.');
      return;
    }

    try {
      const token = localStorage.getItem('procraft_token');
      const res = await fetch('/api/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          supplier: suppliers[0]._id,
          items: validItems,
          amountPaid: 0,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Immediately receive the PO so stock increments!
        await fetch(`/api/purchase-orders/${data.purchaseOrder._id}/receive`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsOCRModalOpen(false);
        setExtractedItems([]);
        fetchData();
        alert('OCR Bill confirmed! Stock quantities automatically increased in inventory.');
      }
    } catch (err) {
      console.error('Error confirming OCR bill:', err);
    }
  };

  const totalOutstanding = suppliers.reduce((sum, s) => sum + s.outstandingBalance, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary-400">
            Supply Chain & Procurement
          </span>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Supplier & Purchase Order Management
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsOCRModalOpen(true)}
            className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-amber-600/20 flex items-center gap-1.5 transition-all"
          >
            <Scan className="w-4 h-4" />
            <span>Scan Supplier Bill (OCR)</span>
          </button>

          <button
            onClick={() => setIsCreatePOOpen(true)}
            className="bg-gradient-to-r from-primary-600 to-amber-600 hover:from-primary-500 hover:to-amber-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-primary-600/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Purchase Order</span>
          </button>

          <button
            onClick={() => setIsAddSupplierOpen(true)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Supplier</span>
          </button>
        </div>
      </div>

      {/* KPI Header */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase">
            Total Outstanding Supplier Dues
          </span>
          <div className="text-3xl font-extrabold text-amber-400 mt-1">
            ₹{totalOutstanding.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Total unpaid balance across all {suppliers.length} active wholesale suppliers.
          </p>
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="glass-card rounded-2xl border border-slate-800/80 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
            Wholesale Suppliers Directory
          </h3>
          <span className="text-xs text-slate-400">{suppliers.length} suppliers</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 text-[10px] font-bold text-slate-400 uppercase">
                <th className="py-3.5 px-4">Supplier Name</th>
                <th className="py-3.5 px-4">Phone / Address</th>
                <th className="py-3.5 px-4">Categories Supplied</th>
                <th className="py-3.5 px-4">Outstanding Due</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
              {suppliers.map((s) => (
                <tr key={s._id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-3 px-4 font-extrabold text-white">{s.name}</td>
                  <td className="py-3 px-4 text-slate-400">
                    <div>{s.phone}</div>
                    <div className="text-[11px] text-slate-500">{s.address}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {s.itemsSupplied.map((cat, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] uppercase font-bold text-slate-300"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold">
                    <span
                      className={
                        s.outstandingBalance > 0 ? 'text-red-400' : 'text-emerald-400'
                      }
                    >
                      ₹{s.outstandingBalance.toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {s.outstandingBalance > 0 && (
                      <button
                        onClick={() => {
                          setSelectedSupplierForPay(s);
                          setIsPayModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 text-xs font-bold transition-all"
                      >
                        Pay Dues
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Purchase Orders Table */}
      <div className="glass-card rounded-2xl border border-slate-800/80 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
            Purchase Orders (POs) & Stock Inward
          </h3>
          <span className="text-xs text-slate-400">{purchaseOrders.length} orders</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 text-[10px] font-bold text-slate-400 uppercase">
                <th className="py-3.5 px-4">PO Number</th>
                <th className="py-3.5 px-4">Supplier</th>
                <th className="py-3.5 px-4">Items Count</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Inward Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
              {purchaseOrders.map((po) => (
                <tr key={po._id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-extrabold text-amber-400">
                    {po.poNumber}
                  </td>
                  <td className="py-3 px-4 font-bold text-white">{po.supplierName}</td>
                  <td className="py-3 px-4">
                    {po.items.length} items (
                    {po.items.reduce((s, i) => s + i.quantity, 0)} units total)
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-white">
                    ₹{po.totalAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                        po.status === 'RECEIVED'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {po.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {po.status === 'PENDING' ? (
                      <button
                        onClick={() => handleReceivePO(po._id, po.poNumber)}
                        className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 ml-auto"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Mark Received (+Stock)</span>
                      </button>
                    ) : (
                      <span className="text-xs text-slate-500 flex items-center justify-end gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Stock
                        Added
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pay Supplier Modal */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        title={`Pay Supplier Dues: ${selectedSupplierForPay?.name}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handlePaySupplier} className="space-y-4">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-xs text-slate-400">Current Outstanding Balance:</span>
            <div className="text-xl font-bold text-amber-400 mt-1">
              ₹{selectedSupplierForPay?.outstandingBalance.toLocaleString('en-IN')}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">
              Payment Amount (₹)
            </label>
            <input
              type="number"
              required
              min={1}
              max={selectedSupplierForPay?.outstandingBalance || 1000000}
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              placeholder="Enter amount being paid"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-1.5 transition-all mt-4"
          >
            {isSubmitting ? 'Recording Payment...' : 'Confirm Supplier Payment'}
          </button>
        </form>
      </Modal>

      {/* Add Supplier Modal */}
      <Modal
        isOpen={isAddSupplierOpen}
        onClose={() => setIsAddSupplierOpen(false)}
        title="Register New Wholesale Supplier"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddSupplier} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">
              Supplier Name
            </label>
            <input
              type="text"
              required
              value={supName}
              onChange={(e) => setSupName(e.target.value)}
              placeholder="e.g. Berger Paints Wholesale Hub"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              required
              value={supPhone}
              onChange={(e) => setSupPhone(e.target.value)}
              placeholder="+91 80 1234 5678"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">
              Address
            </label>
            <input
              type="text"
              value={supAddress}
              onChange={(e) => setSupAddress(e.target.value)}
              placeholder="Warehouse location / City"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">
              Categories Supplied (comma-separated)
            </label>
            <input
              type="text"
              value={supItems}
              onChange={(e) => setSupItems(e.target.value)}
              placeholder="paint, tools, hardware"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-600 to-amber-600 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-1.5 transition-all mt-4"
          >
            {isSubmitting ? 'Saving...' : 'Register Supplier'}
          </button>
        </form>
      </Modal>

      {/* Create Purchase Order Modal */}
      <Modal
        isOpen={isCreatePOOpen}
        onClose={() => setIsCreatePOOpen(false)}
        title="Create New Purchase Order (PO)"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreatePO} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">
              Select Supplier
            </label>
            <select
              value={poSupplierId}
              onChange={(e) => setPoSupplierId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
            >
              {suppliers.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-300">Add Item to PO</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="md:col-span-2">
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value);
                    const p = products.find((pr) => pr._id === e.target.value);
                    if (p) setItemCost(p.costPrice);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                >
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.brand})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <input
                  type="number"
                  min={1}
                  placeholder="Qty"
                  value={itemQty}
                  onChange={(e) => setItemQty(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddItemToPO}
              className="px-3.5 py-1.5 rounded-xl bg-primary-600/30 border border-primary-500/50 text-primary-300 hover:bg-primary-600/40 text-xs font-bold"
            >
              + Add Item to PO Table
            </button>
          </div>

          {poItemsList.length > 0 && (
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400">Items in this PO:</span>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {poItemsList.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex justify-between text-xs text-slate-300"
                  >
                    <span>{item.productName}</span>
                    <span className="font-mono font-bold text-amber-400">
                      {item.quantity} units @ ₹{item.unitCost} = ₹
                      {(item.quantity * item.unitCost).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || poItemsList.length === 0}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-600 to-amber-600 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-1.5 transition-all mt-4 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating PO...' : 'Create Purchase Order'}
          </button>
        </form>
      </Modal>

      {/* Bill Scanning OCR Modal */}
      <Modal
        isOpen={isOCRModalOpen}
        onClose={() => setIsOCRModalOpen(false)}
        title="AI OCR Bill & Invoice Scanner (Auto-Add Stock)"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <Scan className="w-4 h-4" /> AI OCR Engine
              </span>
              <h4 className="text-sm font-extrabold text-white mt-0.5">
                Upload or Scan Supplier Paper Bill
              </h4>
              <p className="text-xs text-slate-400">
                OCR vision parses item names, quantities, and unit costs automatically.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={ocrSampleType}
                onChange={(e) => setOcrSampleType(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
              >
                <option value="paint_invoice">Sample Paint Invoice</option>
                <option value="tools_invoice">Sample Power Tools Bill</option>
                <option value="mixed_invoice">Sample Mixed Hardware Invoice</option>
              </select>

              <button
                onClick={handleScanBill}
                disabled={isScanning}
                className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                {isScanning ? 'Scanning...' : 'Run OCR Scan'}
              </button>
            </div>
          </div>

          {ocrSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{ocrSuccessMsg}</span>
            </div>
          )}

          {extractedItems.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Extracted Bill Line Items (Editable)
              </h4>

              <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-800">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                      <th className="py-2.5 px-3">Extracted Item Name</th>
                      <th className="py-2.5 px-3">Qty</th>
                      <th className="py-2.5 px-3">Unit Cost (₹)</th>
                      <th className="py-2.5 px-3">Database Match</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    {extractedItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/50">
                        <td className="py-2.5 px-3 font-bold">{item.rawName}</td>
                        <td className="py-2.5 px-3 font-mono">{item.quantity}</td>
                        <td className="py-2.5 px-3 font-mono">₹{item.unitCost}</td>
                        <td className="py-2.5 px-3">
                          {item.status === 'MATCHED' ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold border border-emerald-500/30">
                              Matched: {item.matchedProductName}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-extrabold border border-amber-500/30">
                              Unmatched (Mapping required)
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                onClick={handleConfirmOCRBill}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all"
              >
                <CheckCircle className="w-4 h-4" />
                <span>
                  Confirm & Auto-Add Stock (+
                  {extractedItems.reduce((s, i) => s + i.quantity, 0)} units)
                </span>
              </button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
