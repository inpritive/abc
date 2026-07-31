import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Plus,
  TrendingDown,
  Trash2,
  Calendar,
  FileText,
} from 'lucide-react';
import { Expense } from '../../types';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';

interface ExpensesTabProps {
  onOpenExpenseModal: () => void;
}

export const ExpensesTab: React.FC<ExpensesTabProps> = ({ onOpenExpenseModal }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchExpenses = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('procraft_token');
      const res = await fetch('/api/expenses', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setExpenses(data.expenses);
      }
    } catch (err) {
      console.error('Error fetching expenses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleDeleteExpense = async (id: string) => {
    if (!window.confirm('Remove this expense entry from the ledger?')) return;
    try {
      const token = localStorage.getItem('procraft_token');
      const res = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setExpenses((prev) => prev.filter((ex) => ex._id !== id));
      }
    } catch (err) {
      console.error('Error deleting expense:', err);
    }
  };

  const totalExpenseAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary-400">
            Overhead & Purchase Accounting
          </span>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Shop Expenses & Profit Ledger
          </h2>
        </div>

        <button
          onClick={onOpenExpenseModal}
          className="bg-gradient-to-r from-primary-600 to-amber-600 hover:from-primary-500 hover:to-amber-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-primary-600/20 flex items-center gap-1.5 transition-all self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Record Shop Expense / Purchase</span>
        </button>
      </div>

      {/* Summary KPI */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase">
            Total Recorded Expenses
          </span>
          <div className="text-3xl font-extrabold text-red-400 mt-1">
            ₹{totalExpenseAmount.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Deducted from Total Revenue & COGS to calculate Net Profit on the Dashboard.
          </p>
        </div>
      </div>

      {/* Expense Table */}
      {isLoading ? (
        <SkeletonLoader count={5} type="table" />
      ) : (
        <div className="glass-card rounded-2xl border border-slate-800 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase tracking-wider font-bold">
              <tr>
                <th className="p-4">Expense Title</th>
                <th className="p-4">Category</th>
                <th className="p-4">Notes / Invoice Ref</th>
                <th className="p-4">Date Recorded</th>
                <th className="p-4">Amount</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {expenses.map((exp) => (
                <tr key={exp._id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-4 font-bold text-white">{exp.title}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-slate-800 text-primary-400 border border-slate-700">
                      {exp.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-slate-300">{exp.notes || '—'}</td>
                  <td className="p-4 text-slate-400">
                    {new Date(exp.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="p-4 font-extrabold text-white">
                    ₹{exp.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDeleteExpense(exp._id)}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-red-900/40 text-slate-400 hover:text-red-400 transition-colors"
                      title="Delete expense"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
