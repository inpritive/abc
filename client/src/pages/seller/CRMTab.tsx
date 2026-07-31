import React, { useState, useEffect } from 'react';
import { Users, Phone, Mail, ShoppingBag, DollarSign } from 'lucide-react';
import { CRMCustomer } from '../../types';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';

export const CRMTab: React.FC = () => {
  const [customers, setCustomers] = useState<CRMCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCRM = async () => {
      try {
        const token = localStorage.getItem('procraft_token');
        const res = await fetch('/api/analytics/customers', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setCustomers(data.customers);
        }
      } catch (err) {
        console.error('Error fetching CRM:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCRM();
  }, []);

  if (isLoading) {
    return <SkeletonLoader count={6} type="table" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-primary-400">
          Client Relationship Management
        </span>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          Registered Customers & Lifetime Value ({customers.length})
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.map((cust) => (
          <div
            key={cust._id}
            className="glass-card p-5 rounded-2xl border border-slate-800/80 space-y-4"
          >
            <div className="flex items-center gap-4 border-b border-slate-800 pb-3">
              <div className="w-12 h-12 rounded-2xl bg-primary-500/10 text-primary-400 font-extrabold text-lg flex items-center justify-center">
                {cust.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">{cust.name}</h3>
                <span className="text-xs text-slate-400 block">{cust.email}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-primary-500" />
                <span>{cust.phone}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                {cust.address}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block">Orders Placed</span>
                <span className="font-extrabold text-white text-sm">
                  {cust.totalOrders} order{cust.totalOrders !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block">Lifetime Spend</span>
                <span className="font-extrabold text-primary-400 text-sm">
                  ₹{cust.totalSpend.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
