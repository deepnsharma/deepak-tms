"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import Topbar from '@/components/layout/Topbar';
import { PackageCheck } from 'lucide-react';

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

export default function AcceptedDOPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);

  useEffect(() => {
    if (user?.transporterId) {
      api.getDeliveryOrders().then(data => {
        setOrders(data.filter((o: DeliveryOrder) => o.assignedTo === user?.transporterId));
      });
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-950">
      <Topbar title="Accepted Delivery Orders" />

      <div className="p-6 space-y-6">
        <p className="text-sm text-slate-400">{orders.length} accepted order(s)</p>

        <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50 bg-slate-800/30">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">DO Number</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Plant</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Destination</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Material</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Weight</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Vehicle Type</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Delivery Date</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Agreed Price</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center">
                      <PackageCheck className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                      <p className="text-sm text-slate-500">No accepted orders yet</p>
                    </td>
                  </tr>
                ) : (
                  orders.map(order => (
                    <tr key={order.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-blue-400">{order.id}</td>
                      <td className="px-6 py-4 text-sm text-slate-300">{order.plant}</td>
                      <td className="px-6 py-4 text-sm text-slate-300">{order.destination}</td>
                      <td className="px-6 py-4 text-sm text-slate-300">{order.material}</td>
                      <td className="px-6 py-4 text-sm text-slate-300">{order.weight}</td>
                      <td className="px-6 py-4 text-sm text-slate-300">{order.vehicleType}</td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {new Date(order.deliveryDate).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-emerald-400">
                        ₹{order.assignedPrice?.toLocaleString('en-IN')}
                      </td>
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
