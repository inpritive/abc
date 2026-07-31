import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Expense } from '../../types';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (savedExpense: Expense) => void;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<any>('STOCK_PURCHASE');
  const [notes, setNotes] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) {
      setErrorMsg('Please enter expense title and amount.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const token = localStorage.getItem('procraft_token');
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          amount: Number(amount),
          category,
          notes,
          expenseDate,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to record expense');
      }

      onSuccess(data.expense);
      onClose();
      setTitle('');
      setAmount('');
      setNotes('');
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Shop Expense / Purchase" maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1">
            Expense Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Shop Rent / Asian Paints Bulk Delivery"
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Amount (₹) *
            </label>
            <input
              type="number"
              min={0}
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 25000"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
            >
              <option value="STOCK_PURCHASE">Stock Purchase</option>
              <option value="RENT">Shop Rent</option>
              <option value="ELECTRICITY">Electricity & Power</option>
              <option value="SALARY">Staff Salaries</option>
              <option value="TRANSPORT">Transport & Freight</option>
              <option value="LOGISTICS">Logistics & Delivery</option>
              <option value="UTILITIES">Showroom Utilities</option>
              <option value="MISC">Miscellaneous</option>
              <option value="OTHER">Other Expense</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1">
            Expense Date *
          </label>
          <input
            type="date"
            required
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1">
            Notes / Invoice Reference
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Invoice number, payment method, supplier name..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-amber-600 hover:from-primary-500 hover:to-amber-500 text-white text-xs font-extrabold shadow-lg shadow-primary-600/30 disabled:opacity-50"
          >
            {isSubmitting ? 'Recording...' : 'Record Expense'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
