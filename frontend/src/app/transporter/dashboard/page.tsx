"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import Topbar from '@/components/layout/Topbar';
import { Truck, PackageCheck, PackageOpen, Receipt, Bell } from 'lucide-react';

interface DeliveryOrder {
  id: string;
  plant: string;
  destination: string;
  material: string;
  weight: string;
  vehicleType: string;
  deliveryDate: string;
  status: string;
  assignedTo?: string;
  assignedPrice?: number;
}

interface Notification {
  type: string;
  message: string;
  order?: DeliveryOrder;
  timestamp: string;
}

const statusColors: Record<string, string> = {
  Open: '#ef4444',
  Bidding: '#f59e0b',
  Assigned: '#22c55e',
};

export default function TransporterDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user?.transporterId) return;

    api.getDeliveryOrders().then(setOrders);
    api.getStats(user.transporterId).then(setStats);

    // SSE for notifications
    const eventSource = new EventSource('http://localhost:5000/api/notifications/stream');
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'new_do') {
        setNotifications(prev => [data, ...prev].slice(0, 5));
      }
    };

    return () => eventSource.close();
  }, [user]);

  const availableOrders = orders.filter(o => o.status === 'Open' || o.status === 'Bidding');
  const acceptedOrders = orders.filter(o => o.status === 'Assigned' && o.assignedTo === user?.transporterId);

  const cards = [
    { label: 'Ongoing Trips', value: stats?.ongoingTrips || 0, icon: Truck, gradient: 'from-blue-500 to-blue-600' },
    { label: 'Completed Trips', value: stats?.completedTrips || 0, icon: PackageCheck, gradient: 'from-emerald-500 to-green-600' },
    { label: 'Pending Acceptance', value: stats?.pendingAcceptance || 0, icon: PackageOpen, gradient: 'from-purple-500 to-violet-600' },
    { label: 'Open Invoices (₹)', value: stats?.openInvoices?.toLocaleString('en-IN') || 0, icon: Receipt, gradient: 'from-amber-500 to-orange-500' },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      <Topbar title="Transporter Dashboard" />

      <div className="p-6 space-y-6">
        {/* Notification Banner */}
        {notifications.length > 0 && (
          <div className="bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-blue-500/20 rounded-xl p-4 animate-in slide-in-from-top-2 duration-500">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Bell className="w-5 h-5 text-blue-400 animate-bounce" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-blue-300">New Delivery Order Available!</h3>
                <p className="text-sm text-blue-200/70 mt-0.5">{notifications[0].message}</p>
                <p className="text-xs text-blue-400/50 mt-1">{new Date(notifications[0].timestamp).toLocaleString('en-IN')}</p>
              </div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse mt-2" />
            </div>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div
                key={i}
                className="relative overflow-hidden rounded-xl bg-slate-900/50 border border-slate-700/50 p-5 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-400">{card.label}</p>
                    <p className="text-3xl font-bold text-white mt-1">{card.value}</p>
                  </div>
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradient} opacity-60`} />
              </div>
            );
          })}
        </div>

        {/* Recent Accepted Orders */}
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700/50">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-emerald-500 to-green-500" />
              Recent Accepted Orders
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">DO Number</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Route</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Material</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Weight</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {acceptedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                      No accepted orders yet.
                    </td>
                  </tr>
                ) : (
                  acceptedOrders.map(order => (
                    <tr key={order.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-blue-400">{order.id}</td>
                      <td className="px-6 py-4 text-sm text-slate-300">{order.plant} → {order.destination}</td>
                      <td className="px-6 py-4 text-sm text-slate-300">{order.material}</td>
                      <td className="px-6 py-4 text-sm text-slate-300">{order.weight}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-emerald-400">₹{order.assignedPrice?.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400">
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
