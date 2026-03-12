"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import Topbar from '@/components/layout/Topbar';
import { MapPin, Package, Weight, Truck, CarFront, Send } from 'lucide-react';
import { toast } from 'sonner';

interface DeliveryOrder {
  id: string;
  plant: string;
  destination: string;
  material: string;
  weight: string;
  vehicleType: string;
  deliveryDate: string;
  status: string;
}

export default function AvailableDOPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [vehicles, setVehicles] = useState<{ id: string; vehicleNumber: string }[]>([]);
  const [selectedVehicles, setSelectedVehicles] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);

  useEffect(() => {
    if (user?.transporterId) {
      api.getDeliveryOrders().then(data => {
        setOrders(data.filter((o: DeliveryOrder) => o.status === 'Open' || o.status === 'Bidding'));
      });
      api.getVehicles(user.transporterId).then(data => {
        setVehicles(data);
      });
    }
  }, [user]);

  const handleAcceptDO = async (orderId: string) => {
    const vehicleId = selectedVehicles[orderId];
    if (!vehicleId) {
      toast.error('Please select a vehicle to accept this DO');
      return;
    }

    setSubmitting(orderId);
    try {
      await api.acceptDO(orderId, {
        transporterId: user?.transporterId,
        vehicleId,
      });
      toast.success(`Successfully placed vehicle for Delivery Order ${orderId}!`);
      setSelectedVehicles(prev => ({ ...prev, [orderId]: '' }));
      // Refresh orders
      api.getDeliveryOrders().then(data => {
        setOrders(data.filter((o: DeliveryOrder) => o.status === 'Open' || o.status === 'Bidding'));
      });
    } catch {
      toast.error('Failed to submit bid');
    }
    setSubmitting(null);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Topbar title="Available Delivery Orders" />

      <div className="p-6 space-y-6">
        <p className="text-sm text-slate-400">{orders.length} order(s) available for bidding</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-slate-900/50 border border-slate-700/50 rounded-xl overflow-hidden hover:bg-slate-800/40 transition-all group">
              {/* Header */}
              <div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">{order.id}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Delivery by {new Date(order.deliveryDate).toLocaleDateString('en-IN')}
                  </p>
                </div>
                <span
                  className="px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor: order.status === 'Open' ? '#ef444420' : '#f59e0b20',
                    color: order.status === 'Open' ? '#ef4444' : '#f59e0b',
                  }}
                >
                  {order.status}
                </span>
              </div>

              {/* Details */}
              <div className="px-5 py-4 space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span className="text-sm text-white font-medium">{order.plant}</span>
                  <span className="text-slate-500">→</span>
                  <span className="text-sm text-white font-medium">{order.destination}</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-xs text-slate-400">{order.material}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Weight className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-xs text-slate-400">{order.weight}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-xs text-slate-400">{order.vehicleType}</span>
                  </div>
                </div>
              </div>

              {/* Placement Section */}
              <div className="px-5 py-4 border-t border-slate-700/50 bg-slate-800/20">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <CarFront className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <select
                      value={selectedVehicles[order.id] || ''}
                      onChange={(e) => setSelectedVehicles(prev => ({ ...prev, [order.id]: e.target.value }))}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 appearance-none"
                    >
                      <option value="" disabled className="text-slate-500">Select Vehicle from Master...</option>
                      {vehicles.map(v => (
                        <option key={v.id} value={v.id}>{v.vehicleNumber}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => handleAcceptDO(order.id)}
                    disabled={submitting === order.id || !selectedVehicles[order.id]}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 text-white text-sm font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {submitting === order.id ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Accept
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {orders.length === 0 && (
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-12 text-center">
            <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-400">No Available Orders</h3>
            <p className="text-sm text-slate-500 mt-1">Check back later for new delivery orders</p>
          </div>
        )}
      </div>
    </div>
  );
}
