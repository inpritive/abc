import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  User as UserIcon,
  Phone,
  Mail,
  MapPin,
  Shield,
  ShoppingBag,
  LogOut,
  ArrowRight,
} from 'lucide-react';

interface ProfilePageProps {
  onNavigate: (view: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [isSaved, setIsSaved] = useState(false);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Please Sign In</h2>
        <button
          onClick={() => onNavigate('login')}
          className="px-6 py-3 rounded-xl bg-primary-600 text-white font-bold text-sm"
        >
          Sign In / Demo Login
        </button>
      </div>
    );
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary-400">
            Account Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Customer Profile & Preferences
          </h1>
        </div>
        <button
          onClick={logout}
          className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1.5"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Profile Card */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800/80 text-center space-y-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-600 to-amber-600 text-white font-extrabold text-2xl flex items-center justify-center mx-auto shadow-lg shadow-primary-600/30">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white">{user.name}</h3>
            <p className="text-xs text-slate-400">{user.email}</p>
            <span className="inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-primary-500/20 text-primary-400 border border-primary-500/40">
              Role: {user.role}
            </span>
          </div>

          <div className="pt-4 border-t border-slate-800/80 space-y-2 text-left text-xs">
            <button
              onClick={() => onNavigate('my-orders')}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-primary-500" />
                <span>My Order History</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Edit Form */}
        <div className="md:col-span-2 glass-card p-6 rounded-2xl border border-slate-800 space-y-6">
          <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
            Personal & Shipping Settings
          </h3>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            {isSaved && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-semibold">
                Profile updated successfully!
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white"
                />
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Email Address (Disabled)
                </label>
                <div className="relative">
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full bg-slate-900/60 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-xs text-slate-400 cursor-not-allowed"
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white"
                  />
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">
                Default Delivery Address
              </label>
              <div className="relative">
                <textarea
                  rows={3}
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-xs text-white"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs shadow-lg shadow-primary-600/30 transition-all"
              >
                Save Preferences
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
