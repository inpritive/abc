import React from 'react';
import {
  AlertTriangle,
  LayoutDashboard,
  LogOut,
  ArrowLeft,
  Bell,
  Wrench,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SellerHeaderProps {
  lowStockCount: number;
  onNavigate: (view: string) => void;
  onAlertClick: () => void;
}

export const SellerHeader: React.FC<SellerHeaderProps> = ({
  lowStockCount,
  onNavigate,
  onAlertClick,
}) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
          <Wrench className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-lg font-extrabold text-white tracking-tight">
            ProCraft ERP — Seller Dashboard
          </h1>
          <span className="text-[11px] text-slate-400 font-semibold">
            Real-Time Inventory & Retail Management
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Low-stock alert badge button */}
        <button
          onClick={onAlertClick}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
            lowStockCount > 0
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30 animate-pulse'
              : 'bg-slate-900 text-slate-400 border border-slate-800'
          }`}
          title="Click to view low-stock items"
        >
          <Bell className="w-4 h-4" />
          <span>{lowStockCount} Low Stock Alert{lowStockCount !== 1 ? 's' : ''}</span>
        </button>

        {/* Switch to Customer Marketplace View */}
        <button
          onClick={() => onNavigate('home')}
          className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Customer Storefront</span>
        </button>

        {/* User Badge */}
        {user && (
          <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
            <div className="text-right hidden sm:block">
              <span className="block text-xs font-bold text-slate-200">
                {user.name}
              </span>
              <span className="block text-[10px] text-primary-400 uppercase font-semibold">
                Shop Admin
              </span>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-900 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
