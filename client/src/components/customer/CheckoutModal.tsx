import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import {
  CreditCard,
  Truck,
  CheckCircle,
  MapPin,
  Lock,
  Phone,
  User as UserIcon,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: any) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
}) => {
  const { items, subtotal, tax, shipping, total, clearCart } = useCart();
  const { user } = useAuth();

  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [shippingAddress, setShippingAddress] = useState(
    user?.address || '42, MG Road, Indiranagar, Bangalore - 560038'
  );
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'ONLINE'>('COD');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 9012');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerEmail || !customerPhone || !shippingAddress) {
      setErrorMsg('Please fill in all shipping details.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        paymentMethod,
        items: items.map((item) => ({
          product: item.product._id,
          productName: item.product.name,
          price: item.product.price,
          costPrice: item.product.costPrice,
          quantity: item.quantity,
          unit: item.product.unit,
        })),
      };

      const token = localStorage.getItem('procraft_token');
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to place order');
      }

      triggerCelebration();
      clearCart();
      onOrderSuccess(data.order);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Complete Your Order" maxWidth="max-w-2xl">
      <form onSubmit={handlePlaceOrder} className="space-y-6">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Customer & Shipping Details */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-primary-500" />
            Shipping Details
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
                />
                <UserIcon className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
                />
                <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="email@example.com"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">
              Delivery Address
            </label>
            <textarea
              required
              rows={2}
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="Street address, locality, city, pin code"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
            />
          </div>
        </div>

        {/* Payment Method */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-primary-500" />
            Payment Option
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <div
              onClick={() => setPaymentMethod('COD')}
              className={`p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${
                paymentMethod === 'COD'
                  ? 'bg-primary-500/10 border-primary-500 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Truck className="w-5 h-5 text-primary-500" />
              <div>
                <span className="block text-xs font-bold">Cash on Delivery</span>
                <span className="text-[10px] text-slate-400">Pay when delivered</span>
              </div>
            </div>

            <div
              onClick={() => setPaymentMethod('ONLINE')}
              className={`p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${
                paymentMethod === 'ONLINE'
                  ? 'bg-primary-500/10 border-primary-500 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <CreditCard className="w-5 h-5 text-primary-500" />
              <div>
                <span className="block text-xs font-bold">Online Payment</span>
                <span className="text-[10px] text-slate-400">Cards / UPI / NetBanking</span>
              </div>
            </div>
          </div>

          {paymentMethod === 'ONLINE' && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Simulated Secure Card Payment</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Demo Sandbox Mode
                </span>
              </div>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
              />
            </div>
          )}
        </div>

        {/* Order Summary Footer */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Subtotal ({items.length} items)</span>
            <span>₹{subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>Estimated GST (18%)</span>
            <span>₹{tax.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>Shipping</span>
            <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
          </div>
          <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm font-extrabold text-white">
            <span>Total Payable</span>
            <span className="text-primary-400 text-base">
              ₹{total.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-amber-600 hover:from-primary-500 hover:to-amber-500 text-white font-extrabold text-sm shadow-xl shadow-primary-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {isSubmitting ? (
            <span className="animate-pulse">Processing Real-Time Order...</span>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              Place Order Now — ₹{total.toLocaleString('en-IN')}
            </>
          )}
        </button>
      </form>
    </Modal>
  );
};
