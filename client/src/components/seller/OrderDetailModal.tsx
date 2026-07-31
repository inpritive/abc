import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Order } from '../../types';
import {
  MapPin,
  Phone,
  Mail,
  User as UserIcon,
  CheckCircle,
  Truck,
  Clock,
  XCircle,
} from 'lucide-react';

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onStatusUpdated: (updatedOrder: Order) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  isOpen,
  onClose,
  order,
  onStatusUpdated,
}) => {
  const [orderStatus, setOrderStatus] = useState(order?.orderStatus || 'PENDING');
  const [paymentStatus, setPaymentStatus] = useState(order?.paymentStatus || 'PENDING');
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!order) return null;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setErrorMsg('');

    try {
      const token = localStorage.getItem('procraft_token');
      const res = await fetch(`/api/orders/${order._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderStatus, paymentStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update order status');
      }

      onStatusUpdated(data.order);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Order Details — #${order.orderNumber}`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Customer Contact & Address Card */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5 text-primary-500" /> Customer Information
            </h4>
            <p className="text-sm font-bold text-white">{order.customerName}</p>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <Phone className="w-3 h-3 text-slate-500" /> {order.customerPhone}
            </p>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <Mail className="w-3 h-3 text-slate-500" /> {order.customerEmail}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary-500" /> Delivery Address
            </h4>
            <p className="text-xs text-slate-200 leading-relaxed">{order.shippingAddress}</p>
            <div className="pt-1 flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                Method: {order.paymentMethod}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  order.paymentStatus === 'PAID'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                }`}
              >
                Payment: {order.paymentStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Ordered Items Table */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Ordered Hardware & Paint Items ({order.items.length})
          </h4>
          <div className="border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-950/60 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-bold text-slate-100">{item.productName}</p>
                  <span className="text-slate-400 text-[11px]">
                    {item.quantity} {item.unit} × ₹{item.price.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="font-extrabold text-white">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </div>
              </div>
            ))}
            <div className="p-3 bg-slate-900/80 flex items-center justify-between font-extrabold text-sm text-white">
              <span>Total Order Amount</span>
              <span className="text-primary-400">
                ₹{order.totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Status Update Form */}
        <form onSubmit={handleUpdate} className="space-y-4 pt-4 border-t border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Fulfillment Status (Live Sync)
              </label>
              <select
                value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-semibold"
              >
                <option value="PENDING">Pending Approval</option>
                <option value="PROCESSING">Processing / Packaging</option>
                <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                <option value="DELIVERED">Completed & Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Payment Status
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-semibold"
              >
                <option value="PENDING">Pending Payment</option>
                <option value="PAID">Paid / Settled</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold shadow-lg shadow-primary-600/30"
            >
              {isUpdating ? 'Broadcasting Status...' : 'Save & Notify Customer'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
