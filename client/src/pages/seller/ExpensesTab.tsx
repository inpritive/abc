import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Plus,
  Trash2,
  Calendar,
  FileText,
  Download,
  TrendingUp,
  TrendingDown,
  PieChart,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { Expense } from '../../types';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';

interface ExpensesTabProps {
  onOpenExpenseModal: () => void;
}

export const ExpensesTab: React.FC<ExpensesTabProps> = ({ onOpenExpenseModal }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<any>({
    totalRevenue: 0,
    totalCostOfGoods: 0,
    grossProfit: 0,
    totalExpenses: 0,
    netProfit: 0,
    profitMargin: 0,
  });
  const [trendData, setTrendData] = useState<any[]>([]);
  const [range, setRange] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async (currentRange: string) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('procraft_token');
      const headers = { Authorization: `Bearer ${token}` };

      const [expRes, sumRes] = await Promise.all([
        fetch(`/api/expenses?range=${currentRange}`, { headers }),
        fetch(`/api/expenses/profit-summary?range=${currentRange}`, { headers }),
      ]);

      if (expRes.ok && sumRes.ok) {
        const expData = await expRes.json();
        const sumData = await sumRes.json();
        setExpenses(expData.expenses || []);
        if (sumData.summary) setSummary(sumData.summary);
        if (sumData.trendData) setTrendData(sumData.trendData);
      }
    } catch (err) {
      console.error('Error fetching expenses & profit summary:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(range);
  }, [range]);

  const handleDeleteExpense = async (id: string) => {
    if (!window.confirm('Remove this expense entry from the ledger?')) return;
    try {
      const token = localStorage.getItem('procraft_token');
      const res = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setExpenses((prev) => prev.filter((ex) => ex._id !== id));
        fetchData(range);
      }
    } catch (err) {
      console.error('Error deleting expense:', err);
    }
  };

  const handleExportCSV = () => {
    const token = localStorage.getItem('procraft_token');
    const url = `/api/expenses/export?range=${range}&token=${token}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary-400">
            Accounting & Financial Intelligence
          </span>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Profit & Expense Tracking System
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Date Range Selector */}
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs font-bold px-3 py-2.5 rounded-xl focus:outline-none focus:border-primary-500"
          >
            <option value="all">All Time History</option>
            <option value="today">Today</option>
            <option value="week">This Week (Last 7 Days)</option>
            <option value="month">This Month (Last 30 Days)</option>
          </select>

          <button
            onClick={handleExportCSV}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV Report</span>
          </button>

          <button
            onClick={onOpenExpenseModal}
            className="bg-gradient-to-r from-primary-600 to-amber-600 hover:from-primary-500 hover:to-amber-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-primary-600/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Log New Expense / Purchase</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <SkeletonLoader count={5} type="table" />
      ) : (
        <>
          {/* Financial P&L KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">
                  Sales Revenue
                </span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-extrabold text-white mt-2 font-mono">
                ₹{summary.totalRevenue.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-slate-500 mt-1">
                Total gross receipts from orders
              </span>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">
                  Cost of Goods (COGS)
                </span>
                <TrendingDown className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-extrabold text-amber-400 mt-2 font-mono">
                ₹{summary.totalCostOfGoods.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-slate-500 mt-1">
                Wholesale cost of items sold
              </span>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">
                  Shop Expenses
                </span>
                <DollarSign className="w-4 h-4 text-red-400" />
              </div>
              <div className="text-2xl font-extrabold text-red-400 mt-2 font-mono">
                ₹{summary.totalExpenses.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-slate-500 mt-1">
                Rent, utilities, salaries, logistics
              </span>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col justify-between bg-gradient-to-br from-emerald-500/10 to-teal-500/5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase">
                  Net Profit & Margin
                </span>
                <PieChart className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-400 mt-2 font-mono">
                ₹{summary.netProfit.toLocaleString('en-IN')}
              </div>
              <span className="text-xs font-extrabold text-emerald-300 mt-1">
                {summary.profitMargin}% Net Margin
              </span>
            </div>
          </div>

          {/* Recharts Financial Comparison Chart */}
          {trendData && trendData.length > 0 && (
            <div className="glass-card p-6 rounded-2xl border border-slate-800/80 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                  Revenue vs Expenses vs Net Profit Trend
                </h3>
                <span className="text-xs text-slate-400">
                  {range.toUpperCase()} Comparison Chart
                </span>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="revenue" name="Sales Revenue (₹)" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses" name="Expenses & COGS (₹)" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="profit" name="Net Profit (₹)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Itemized Expenses Table */}
          <div className="glass-card rounded-2xl border border-slate-800 overflow-x-auto">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                Itemized Expenses Ledger
              </h3>
              <span className="text-xs text-slate-400">{expenses.length} entries</span>
            </div>

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
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      No expenses logged for the selected date range.
                    </td>
                  </tr>
                ) : (
                  expenses.map((exp) => (
                    <tr key={exp._id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-4 font-bold text-white">{exp.title}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-slate-800 text-primary-400 border border-slate-700">
                          {exp.category ? exp.category.replace('_', ' ') : 'OTHER'}
                        </span>
                      </td>
                      <td className="p-4 text-slate-300">{exp.notes || '—'}</td>
                      <td className="p-4 text-slate-400">
                        {new Date(exp.expenseDate || exp.createdAt).toLocaleDateString(
                          'en-IN'
                        )}
                      </td>
                      <td className="p-4 font-mono font-extrabold text-white">
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
