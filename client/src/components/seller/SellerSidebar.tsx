import React from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  BarChart3,
  Users,
  DollarSign,
  Tag,
  Truck,
  WifiOff,
  Bell,
} from 'lucide-react';

interface SellerSidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  lowStockCount: number;
  pendingSyncCount?: number;
}

export const SellerSidebar: React.FC<SellerSidebarProps> = ({
  currentTab,
  onTabChange,
  lowStockCount,
  pendingSyncCount = 0,
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
    { id: 'coupons', label: 'Discounts & Coupons', icon: Tag },
    { id: 'suppliers', label: 'Suppliers & POs', icon: Truck },
    {
      id: 'offline',
      label: 'Offline POS Billing',
      icon: WifiOff,
      badge: pendingSyncCount > 0 ? pendingSyncCount : undefined,
      badgeColor: 'bg-amber-500 text-slate-950',
    },
    { id: 'settings', label: 'Notification Settings', icon: Bell },
  ];

  return (
    <aside className="w-64 shrink-0 bg-slate-950 border-r border-slate-800/80 p-4 flex flex-col justify-between min-h-[calc(100vh-73px)]">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Admin Management
        </div>
        {tabs.map((tab: any) => {
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
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    tab.badgeColor ||
                    (isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30')
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 mt-4">
        <div className="text-[11px] font-bold text-slate-300">Enterprise ERP & POS</div>
        <div className="text-[10px] text-slate-500 mt-0.5">
          Real-time Socket.IO + AI OCR + Offline Billing enabled
        </div>
      </div>
    </aside>
  );
};
