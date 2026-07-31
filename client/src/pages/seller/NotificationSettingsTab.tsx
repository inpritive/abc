import React, { useState, useEffect } from 'react';
import {
  Bell,
  MessageSquare,
  Smartphone,
  CheckCircle,
  Save,
  Clock,
  Send,
  Activity,
  Shield,
} from 'lucide-react';
import { NotificationSetting, NotificationLogItem } from '../../types';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';

export const NotificationSettingsTab: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSetting | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Form toggles
  const [smsOrderPlaced, setSmsOrderPlaced] = useState(true);
  const [smsOrderStatusChanged, setSmsOrderStatusChanged] = useState(true);
  const [smsNewOrderAdmin, setSmsNewOrderAdmin] = useState(true);
  const [smsLowStockAdmin, setSmsLowStockAdmin] = useState(true);

  const [whatsappOrderPlaced, setWhatsappOrderPlaced] = useState(true);
  const [whatsappOrderStatusChanged, setWhatsappOrderStatusChanged] = useState(true);
  const [whatsappNewOrderAdmin, setWhatsappNewOrderAdmin] = useState(true);
  const [whatsappLowStockAdmin, setWhatsappLowStockAdmin] = useState(true);

  const [provider, setProvider] = useState<'TWILIO' | 'GUPSHUP' | 'META' | 'SIMULATED'>('SIMULATED');
  const [senderPhone, setSenderPhone] = useState('+91 98765 43210');
  const [adminPhone, setAdminPhone] = useState('+91 98765 43210');

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('procraft_token');
      const res = await fetch('/api/notifications/settings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const st = data.settings;
        if (st) {
          setSettings(st);
          setSmsOrderPlaced(st.smsOrderPlaced);
          setSmsOrderStatusChanged(st.smsOrderStatusChanged);
          setSmsNewOrderAdmin(st.smsNewOrderAdmin);
          setSmsLowStockAdmin(st.smsLowStockAdmin);

          setWhatsappOrderPlaced(st.whatsappOrderPlaced);
          setWhatsappOrderStatusChanged(st.whatsappOrderStatusChanged);
          setWhatsappNewOrderAdmin(st.whatsappNewOrderAdmin);
          setWhatsappLowStockAdmin(st.whatsappLowStockAdmin);

          setProvider(st.provider || 'SIMULATED');
          setSenderPhone(st.senderPhone || '+91 98765 43210');
          setAdminPhone(st.adminPhone || '+91 98765 43210');
        }
      }
    } catch (err) {
      console.error('Error fetching notification settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg('');
    try {
      const token = localStorage.getItem('procraft_token');
      const res = await fetch('/api/notifications/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          smsOrderPlaced,
          smsOrderStatusChanged,
          smsNewOrderAdmin,
          smsLowStockAdmin,
          whatsappOrderPlaced,
          whatsappOrderStatusChanged,
          whatsappNewOrderAdmin,
          whatsappLowStockAdmin,
          provider,
          senderPhone,
          adminPhone,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
        setSuccessMsg('SMS and WhatsApp Notification Settings updated successfully!');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error('Error saving notification settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-primary-400">
          Automated Alerts & Messaging
        </span>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          SMS & WhatsApp Notification Hub
        </h2>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {isLoading ? (
        <SkeletonLoader count={4} type="line" />
      ) : (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer SMS/WhatsApp Toggles */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800/80 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Smartphone className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                  Customer Notification Toggles
                </h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div>
                    <span className="text-xs font-bold text-white">Order Confirmed SMS</span>
                    <p className="text-[11px] text-slate-400">
                      Send SMS to customer when a new order is placed
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={smsOrderPlaced}
                    onChange={(e) => setSmsOrderPlaced(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 text-primary-500 focus:ring-primary-500"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div>
                    <span className="text-xs font-bold text-white">
                      Order Confirmed WhatsApp
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Send WhatsApp message with order ID & item total
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={whatsappOrderPlaced}
                    onChange={(e) => setWhatsappOrderPlaced(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 text-primary-500 focus:ring-primary-500"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div>
                    <span className="text-xs font-bold text-white">
                      Order Status Update SMS
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Alert customer when order is packed/delivered/cancelled
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={smsOrderStatusChanged}
                    onChange={(e) => setSmsOrderStatusChanged(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 text-primary-500 focus:ring-primary-500"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div>
                    <span className="text-xs font-bold text-white">
                      Order Status WhatsApp
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Real-time WhatsApp tracking alert on status change
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={whatsappOrderStatusChanged}
                    onChange={(e) => setWhatsappOrderStatusChanged(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 text-primary-500 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Admin SMS/WhatsApp Toggles */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800/80 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Shield className="w-5 h-5 text-primary-400" />
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                  Admin & Store Alerts
                </h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div>
                    <span className="text-xs font-bold text-white">
                      New Order Received Alert (SMS)
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Instant SMS to seller phone when customer places order
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={smsNewOrderAdmin}
                    onChange={(e) => setSmsNewOrderAdmin(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 text-primary-500 focus:ring-primary-500"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div>
                    <span className="text-xs font-bold text-white">
                      New Order Received Alert (WhatsApp)
                    </span>
                    <p className="text-[11px] text-slate-400">
                      WhatsApp alert with customer name & order value
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={whatsappNewOrderAdmin}
                    onChange={(e) => setWhatsappNewOrderAdmin(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 text-primary-500 focus:ring-primary-500"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div>
                    <span className="text-xs font-bold text-white">Low Stock Alert (SMS)</span>
                    <p className="text-[11px] text-slate-400">
                      Notify admin when item falls below reorder threshold
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={smsLowStockAdmin}
                    onChange={(e) => setSmsLowStockAdmin(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 text-primary-500 focus:ring-primary-500"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div>
                    <span className="text-xs font-bold text-white">
                      Low Stock Alert (WhatsApp)
                    </span>
                    <p className="text-[11px] text-slate-400">
                      WhatsApp alert with product name & remaining qty
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={whatsappLowStockAdmin}
                    onChange={(e) => setWhatsappLowStockAdmin(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 text-primary-500 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Provider Settings Card */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800/80 space-y-4">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider border-b border-slate-800 pb-3">
              Gateway Provider Configuration
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  Messaging Provider
                </label>
                <select
                  value={provider}
                  onChange={(e: any) => setProvider(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                >
                  <option value="SIMULATED">Simulated Sandbox Mode (Demo / Test)</option>
                  <option value="TWILIO">Twilio Cloud API</option>
                  <option value="GUPSHUP">Gupshup Enterprise Messaging</option>
                  <option value="META">Meta WhatsApp Business API</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  Sender Number / Sender ID
                </label>
                <input
                  type="text"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  Admin Alert Phone Number
                </label>
                <input
                  type="text"
                  value={adminPhone}
                  onChange={(e) => setAdminPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="bg-gradient-to-r from-primary-600 to-amber-600 hover:from-primary-500 hover:to-amber-500 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-lg shadow-primary-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Settings...' : 'Save Notification Settings'}</span>
            </button>
          </div>

          {/* Activity Log Table */}
          <div className="glass-card rounded-2xl border border-slate-800/80 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Recent Message Log</span>
              </h3>
              <span className="text-xs text-slate-400">
                {settings?.notificationLog?.length || 0} alerts logged
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Recipient</th>
                    <th className="py-3 px-4">Channel</th>
                    <th className="py-3 px-4">Message Preview</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {settings?.notificationLog && settings.notificationLog.length > 0 ? (
                    settings.notificationLog.map((log: NotificationLogItem, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-900/50">
                        <td className="py-3 px-4 font-mono text-slate-400">
                          {new Date(log.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-3 px-4 font-bold text-white">{log.recipient}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                              log.channel === 'WHATSAPP'
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                            }`}
                          >
                            {log.channel}
                          </span>
                        </td>
                        <td className="py-3 px-4 max-w-md truncate text-slate-300">
                          {log.message}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-bold uppercase text-slate-400">
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        No notification activity recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
