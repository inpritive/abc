import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Product } from '../../types';
import { Plus, Minus, Check, RefreshCw } from 'lucide-react';

interface BulkStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSuccess: (updatedProduct: Product) => void;
}

export const BulkStockModal: React.FC<BulkStockModalProps> = ({
  isOpen,
  onClose,
  product,
  onSuccess,
}) => {
  const [operation, setOperation] = useState<'add' | 'subtract' | 'set'>('add');
  const [changeAmount, setChangeAmount] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!product) return null;

  const getPreviewNewStock = () => {
    if (operation === 'add') return product.stockQuantity + changeAmount;
    if (operation === 'subtract') return Math.max(0, product.stockQuantity - changeAmount);
    return Math.max(0, changeAmount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const token = localStorage.getItem('procraft_token');
      const res = await fetch('/api/products/bulk-stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product._id,
          changeAmount,
          operation,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update stock');
      }

      onSuccess(data.product);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Quick Stock Update — ${product.name}`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-semibold">Current Stock Level:</span>
          <span className="text-base font-extrabold text-white">
            {product.stockQuantity} {product.unit}
          </span>
        </div>

        {/* Operation selector */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setOperation('add')}
            className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              operation === 'add'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5" /> Add Stock
          </button>
          <button
            type="button"
            onClick={() => setOperation('subtract')}
            className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              operation === 'subtract'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Minus className="w-3.5 h-3.5" /> Reduce
          </button>
          <button
            type="button"
            onClick={() => setOperation('set')}
            className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              operation === 'set'
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" /> Set Exact
          </button>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5">
            {operation === 'add'
              ? 'Quantity Received (e.g. fresh delivery)'
              : operation === 'subtract'
              ? 'Quantity to Subtract'
              : 'New Exact Stock Total'}
          </label>
          <input
            type="number"
            min={1}
            required
            value={changeAmount}
            onChange={(e) => setChangeAmount(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold text-white"
          />
        </div>

        {/* Preview new stock level */}
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-semibold">New Stock After Save:</span>
          <span className="text-lg font-extrabold text-primary-400">
            {getPreviewNewStock()} {product.unit}
          </span>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold shadow-lg shadow-primary-600/30"
          >
            {isSubmitting ? 'Updating...' : 'Save Stock Update'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
