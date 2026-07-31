import React from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  BarChart3,
  Users,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';

interface SellerSidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  lowStockCount: number;
}

export const SellerSidebar: React.FC<SellerSidebarProps> = ({
  currentTab,
  onTabChange,
  lowStockCount,
}) => {
  const tabs = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    {
      id: 'inventory',
      label: 'Inventory & Stock',
      icon: Package,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
    },
    { id: 'orders', label: 'Orders & Fulfillment', icon: ShoppingBag },
    { id: 'reports', label: 'Sales & Valuation', icon: BarChart3 },
    { id: 'crm', label: 'Customer CRM', icon: Users },
    { id: 'expenses', label: 'Profit & Expenses', icon: DollarSign },
  ];

  return (
    <aside className="w-64 shrink-0 bg-slate-950 border-r border-slate-800/80 p-4 flex flex-col justify-between min-h-[calc(100vh-73px)]">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Admin Management
        </div>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-primary-600 to-amber-600 text-white shadow-lg shadow-primary-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </div>
              {tab.badge !== undefined && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs space-y-1.5">
        <div className="font-bold text-slate-300 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Real-Time Sync Active</span>
        </div>
        <p className="text-[11px] text-slate-400">
          Stock and order updates broadcast instantly to customer tabs via Socket.IO.
        </p>
      </div>
    </aside>
  );
};
