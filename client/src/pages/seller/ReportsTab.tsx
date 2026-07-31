import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  DollarSign,
  Package,
  TrendingUp,
  AlertTriangle,
  PieChart,
} from 'lucide-react';
import { StockReportItem } from '../../types';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';

export const ReportsTab: React.FC = () => {
  const [reportItems, setReportItems] = useState<StockReportItem[]>([]);
  const [totals, setTotals] = useState({ cost: 0, retail: 0, profit: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const token = localStorage.getItem('procraft_token');
        const res = await fetch('/api/analytics/stock-report', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.report) {
            setReportItems(data.report.items || []);
            setTotals({
              cost: data.report.totalStockValue || 0,
              retail: data.report.totalRetailValue || 0,
              profit: data.report.potentialProfit || 0,
            });
          }
        }
      } catch (err) {
        console.error('Error fetching stock report:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReport();
  }, []);

  if (isLoading) {
    return <SkeletonLoader count={6} type="table" />;
  }

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-primary-400">
          Financial & Stock Intelligence
        </span>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          Inventory Valuation & Potential Margin Report
        </h2>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase">
            Total Stock Cost Valuation
          </span>
          <div className="text-3xl font-extrabold text-white">
            ₹{totals.cost.toLocaleString('en-IN')}
          </div>
          <span className="text-xs text-slate-400 block">
            Capital invested in physical inventory
          </span>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase">
            Total Retail Valuation
          </span>
          <div className="text-3xl font-extrabold text-primary-400">
            ₹{totals.retail.toLocaleString('en-IN')}
          </div>
          <span className="text-xs text-slate-400 block">
            Projected revenue at current selling prices
          </span>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase">
            Projected Gross Margin
          </span>
          <div className="text-3xl font-extrabold text-emerald-400">
            ₹{totals.profit.toLocaleString('en-IN')}
          </div>
          <span className="text-xs text-emerald-500 font-bold block">
            {totals.cost > 0
              ? `${Math.round((totals.profit / totals.cost) * 100)}% return on inventory`
              : '0%'}
          </span>
        </div>
      </div>

      {/* Stock Report Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase tracking-wider font-bold">
            <tr>
              <th className="p-4">Product Name & Brand</th>
              <th className="p-4">Category</th>
              <th className="p-4">In Stock</th>
              <th className="p-4">Cost Value</th>
              <th className="p-4">Retail Value</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {reportItems.map((item) => (
              <tr key={item._id} className="hover:bg-slate-900/40 transition-colors">
                <td className="p-4 font-bold text-white">
                  {item.name}{' '}
                  <span className="text-[10px] text-primary-400 block uppercase">
                    {item.brand}
                  </span>
                </td>
                <td className="p-4 uppercase text-slate-300 font-semibold">
                  {item.category}
                </td>
                <td className="p-4 font-extrabold text-slate-200">
                  {item.stockQuantity} {item.unit}
                </td>
                <td className="p-4 font-bold text-slate-300">
                  ₹{item.stockValue.toLocaleString('en-IN')}
                </td>
                <td className="p-4 font-extrabold text-white">
                  ₹{item.retailValue.toLocaleString('en-IN')}
                </td>
                <td className="p-4">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                      item.status === 'OUT_OF_STOCK'
                        ? 'bg-red-500/20 text-red-400'
                        : item.status === 'LOW_STOCK'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    {item.status.replace('_', ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
