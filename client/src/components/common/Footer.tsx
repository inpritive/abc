import React from 'react';
import { Wrench, Mail, Phone, MapPin, Shield, Truck, RefreshCw } from 'lucide-react';

interface FooterProps {
  onNavigate?: (view: string, param?: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 text-slate-400">
      {/* Features bar */}
      <div className="border-b border-slate-800/60 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/40 border border-slate-800/40">
            <div className="p-3 rounded-lg bg-primary-500/10 text-primary-400">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-200">Express Delivery & COD</h4>
              <p className="text-xs text-slate-400">Cash on Delivery or Instant Online Payment</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/40 border border-slate-800/40">
            <div className="p-3 rounded-lg bg-primary-500/10 text-primary-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-200">100% Genuine Hardware</h4>
              <p className="text-xs text-slate-400">Asian Paints, Bosch, Stanley, Legrand & 3M</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/40 border border-slate-800/40">
            <div className="p-3 rounded-lg bg-primary-500/10 text-primary-400">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-200">Real-Time Stock Sync</h4>
              <p className="text-xs text-slate-400">Live inventory tracking powered by Socket.IO</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary-500 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">ProCraft</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your trusted partner for architectural hardware, luxury paints, industrial power tools, electrical wiring, and safety equipment.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4">
            Categories
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button
                onClick={() => onNavigate?.('shop', { category: 'paint' })}
                className="hover:text-primary-400 transition-colors text-left"
              >
                Paint & Wood Care
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate?.('shop', { category: 'tools' })}
                className="hover:text-primary-400 transition-colors text-left"
              >
                Power & Hand Tools
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate?.('shop', { category: 'hardware' })}
                className="hover:text-primary-400 transition-colors text-left"
              >
                Hardware & Fasteners
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate?.('shop', { category: 'electrical' })}
                className="hover:text-primary-400 transition-colors text-left"
              >
                Electrical & Wiring
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate?.('shop', { category: 'plumbing' })}
                className="hover:text-primary-400 transition-colors text-left"
              >
                Plumbing & Pipes
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate?.('shop', { category: 'safety' })}
                className="hover:text-primary-400 transition-colors text-left"
              >
                Safety & Workwear
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4">
            Customer Care
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button
                onClick={() => onNavigate?.('my-orders')}
                className="hover:text-primary-400 transition-colors text-left"
              >
                Order History & Tracking
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate?.('shop')}
                className="hover:text-primary-400 transition-colors text-left"
              >
                Shipping & Returns
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate?.('shop')}
                className="hover:text-primary-400 transition-colors text-left"
              >
                Bulk Order Queries
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate?.('shop', { category: 'paint' })}
                className="hover:text-primary-400 transition-colors text-left"
              >
                Color Matching Studio
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4">
            Showroom Location
          </h4>
          <ul className="space-y-2.5 text-xs text-slate-400">
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
              <span>ProCraft Hardware & Paint Studio, MG Road, Indiranagar, Bangalore - 560038</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary-500 shrink-0" />
              <span>+91 98765 43210</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary-500 shrink-0" />
              <span>support@procraft.com</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} ProCraft Hardware & Paint Studio. All rights reserved. Built with React, Vite, Node.js, MongoDB & Socket.IO.
      </div>
    </footer>
  );
};
