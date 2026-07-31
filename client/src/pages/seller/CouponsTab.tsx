import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Calendar, Users, Percent, DollarSign, CheckCircle } from 'lucide-react';
import { Coupon } from '../../types';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { Modal } from '../../components/common/Modal';

export const CouponsTab: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'FIXED' | 'PERCENTAGE'>('FIXED');
  const [discountValue, setDiscountValue] = useState(100);
  const [minOrderValue, setMinOrderValue] = useState(500);
  const [usageLimitTotal, setUsageLimitTotal] = useState(100);
  const [usageLimitPerCustomer, setUsageLimitPerCustomer] = useState(1);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0]
  );
  const [applicableCategories, setApplicableCategories] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchCoupons = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('procraft_token');
      const res = await fetch('/api/coupons', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.coupons || []);
      }
    } catch (err) {
      console.error('Error fetching coupons:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || discountValue <= 0 || !endDate) {
      setErrorMsg('Code, valid discount value, and end date are required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const token = localStorage.getItem('procraft_token');
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: code.toUpperCase().trim(),
          discountType,
          discountValue: Number(discountValue),
          minOrderValue: Number(minOrderValue),
          usageLimitTotal: Number(usageLimitTotal),
          usageLimitPerCustomer: Number(usageLimitPerCustomer),
          endDate,
          applicableCategories: applicableCategories === 'all' ? ['all'] : [applicableCategories],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to create coupon');
      }

      setCoupons((prev) => [data.coupon, ...prev]);
      setIsModalOpen(false);
      setCode('');
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    try {
      const token = localStorage.getItem('procraft_token');
      const res = await fetch(`/api/coupons/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setCoupons((prev) => prev.filter((c) => c._id !== id));
      }
    } catch (err) {
      console.error('Error deleting coupon:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary-400">
            Promotions & Loyalty
          </span>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Discount & Coupon System
          </h2>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-primary-600 to-amber-600 hover:from-primary-500 hover:to-amber-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-primary-600/20 flex items-center gap-1.5 transition-all self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Coupon Code</span>
        </button>
      </div>

      {isLoading ? (
        <SkeletonLoader count={4} type="card" />
      ) : coupons.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-2xl border border-slate-800">
          <Tag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-300">No Coupon Codes Yet</h3>
          <p className="text-xs text-slate-500 mt-1">
            Create promotional coupon codes for your customers to use at checkout.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((coupon) => {
            const isExpired = new Date() > new Date(coupon.endDate);
            const isLimitReached = coupon.usedCount >= coupon.usageLimitTotal;
            const statusLabel = isExpired
              ? 'Expired'
              : isLimitReached
              ? 'Limit Reached'
              : 'Active';
            const statusColor =
              statusLabel === 'Active'
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'bg-red-500/20 text-red-400 border-red-500/30';

            return (
              <div
                key={coupon._id}
                className="glass-card p-5 rounded-2xl border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-mono font-extrabold text-amber-400 tracking-wider">
                      {coupon.code}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${statusColor}`}
                    >
                      {statusLabel}
                    </span>
                  </div>

                  <div className="text-2xl font-black text-white">
                    {coupon.discountType === 'PERCENTAGE'
                      ? `${coupon.discountValue}% OFF`
                      : `₹${coupon.discountValue} FLAT OFF`}
                  </div>

                  <div className="space-y-1 mt-3 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-primary-400" />
                      <span>Valid until: {new Date(coupon.endDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Min Order: ₹{coupon.minOrderValue}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-amber-400" />
                      <span>
                        Redeemed: {coupon.usedCount} / {coupon.usageLimitTotal} uses
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    Category: <strong className="text-slate-300 uppercase">{coupon.applicableCategories.join(', ')}</strong>
                  </span>

                  <button
                    onClick={() => handleDeleteCoupon(coupon._id)}
                    className="text-red-400 hover:text-red-300 transition-colors p-1"
                    title="Delete Coupon"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Coupon Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Promotional Coupon Code"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateCoupon} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">
              Coupon Code (e.g. DIWALI500, PAINT10)
            </label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="FLAT500"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono uppercase focus:outline-none focus:border-primary-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                Discount Type
              </label>
              <select
                value={discountType}
                onChange={(e: any) => setDiscountType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
              >
                <option value="FIXED">Flat Amount (₹)</option>
                <option value="PERCENTAGE">Percentage (%)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                Discount Value
              </label>
              <input
                type="number"
                required
                min={1}
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                Min Order Value (₹)
              </label>
              <input
                type="number"
                min={0}
                value={minOrderValue}
                onChange={(e) => setMinOrderValue(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                Expiry Date
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                Total Redemptions Limit
              </label>
              <input
                type="number"
                min={1}
                value={usageLimitTotal}
                onChange={(e) => setUsageLimitTotal(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                Applicable Category
              </label>
              <select
                value={applicableCategories}
                onChange={(e) => setApplicableCategories(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
              >
                <option value="all">All Store Products</option>
                <option value="paint">Paint & Wood Care Only</option>
                <option value="tools">Power & Hand Tools Only</option>
                <option value="hardware">Hardware & Fasteners Only</option>
                <option value="electrical">Electrical & Wiring Only</option>
                <option value="plumbing">Plumbing & Pipes Only</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-600 to-amber-600 hover:from-primary-500 hover:to-amber-500 text-white font-bold text-xs shadow-lg shadow-primary-600/30 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 mt-4"
          >
            {isSubmitting ? 'Creating Coupon...' : 'Save & Publish Coupon Code'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
