import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  Package,
  ArrowRight,
  Plus,
  Zap,
  CheckCircle,
  BarChart3,
  Flame,
} from 'lucide-react';
import { AnimatedCounter } from '../../components/common/AnimatedCounter';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { DashboardData } from '../../types';
import { useSocket } from '../../context/SocketContext';

interface DashboardOverviewProps {
  onNavigateTab: (tab: string) => void;
  onOpenProductModal: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onNavigateTab,
  onOpenProductModal,
}) => {
  const { onOrderCreated, onOrderUpdated, onStockUpdated } = useSocket();

  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('procraft_token');
      const res = await fetch('/api/analytics/dashboard', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const json = await res.json();
        setData(json.data || json);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Real-time socket listeners to refresh analytics when orders/stocks update!
  useEffect(() => {
    const unsubOrder = onOrderCreated(() => fetchAnalytics());
    const unsubOrderUp = onOrderUpdated(() => fetchAnalytics());
    const unsubStock = onStockUpdated(() => fetchAnalytics());
    return () => {
      unsubOrder();
      unsubOrderUp();
      unsubStock();
    };
  }, [onOrderCreated, onOrderUpdated, onStockUpdated]);

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <SkeletonLoader count={2} type="card" />
        <SkeletonLoader count={1} type="table" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary-400">
            Real-Time ERP Overview
          </span>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Shop Performance & Key Financials
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenProductModal}
            className="bg-gradient-to-r from-primary-600 to-amber-600 hover:from-primary-500 hover:to-amber-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-primary-600/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Inventory Item</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">
              Total Revenue
            </span>
            <div className="p-2 rounded-xl bg-primary-500/10 text-primary-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">
            <AnimatedCounter value={data.totalRevenue} prefix="₹" />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Today's Sales: ₹{data.todaySales.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Net Profit Card */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">
              Net Profit (After Expenses)
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-400">
            <AnimatedCounter value={data.netProfit} prefix="₹" />
          </div>
          <div className="text-xs text-slate-400">
            COGS: ₹{data.totalCostOfGoods.toLocaleString('en-IN')} | Expenses: ₹
            {data.totalExpenses.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Total Orders */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">
              Total Orders
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">
            <AnimatedCounter value={data.todayOrdersCount} />
          </div>
          <button
            onClick={() => onNavigateTab('orders')}
            className="text-xs text-primary-400 hover:underline font-bold flex items-center gap-1"
          >
            <span>Manage Fulfillment</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Low Stock Alerts */}
        <div
          onClick={() => onNavigateTab('inventory')}
          className="glass-card p-5 rounded-2xl border border-slate-800/80 hover:border-amber-500/50 cursor-pointer transition-all space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">
              Stock Warnings
            </span>
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">
            <AnimatedCounter value={data.lowStockCount + data.outOfStockCount} />
          </div>
          <div className="text-xs font-bold text-amber-400 flex items-center gap-1">
            <span>
              {data.outOfStockCount} out of stock, {data.lowStockCount} low
            </span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Main split: Low stock items & Top sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Low Stock Warning Card */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-white">
                Low-Stock Inventory Alerts
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('inventory')}
              className="text-xs text-primary-400 hover:underline font-bold"
            >
              View Full Inventory
            </button>
          </div>

          {data.lowStockItems.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="text-xs font-bold text-slate-300">
                All products have healthy stock levels!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.lowStockItems.slice(0, 5).map((item) => (
                <div
                  key={item._id}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-10 h-10 rounded-lg object-cover bg-slate-900"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-100">
                        {item.name}
                      </h4>
                      <span className="text-[10px] uppercase text-primary-400 font-semibold">
                        {item.brand} • {item.category}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold ${
                        item.stockQuantity === 0
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {item.stockQuantity === 0
                        ? '0 - Out of Stock'
                        : `${item.stockQuantity} left`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Selling Items Card */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-white">
                Best Selling Hardware & Paints
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('reports')}
              className="text-xs text-primary-400 hover:underline font-bold"
            >
              Sales Valuation Report
            </button>
          </div>

          {data.topSellingItems.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <p className="text-xs font-bold text-slate-400">
                No orders recorded yet. Demo seed orders will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.topSellingItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary-500/20 text-primary-400 font-bold text-xs flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-100">
                      {item.name}
                    </span>
                  </div>
                  <div className="text-right text-xs">
                    <span className="font-extrabold text-white">
                      {item.quantity} sold
                    </span>
                    <span className="block text-[10px] text-primary-400 font-semibold">
                      ₹{item.revenue.toLocaleString('en-IN')} revenue
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
