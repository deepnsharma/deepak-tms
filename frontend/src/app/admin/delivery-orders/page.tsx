"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Topbar from '@/components/layout/Topbar';
import { Send, Search, Filter } from 'lucide-react';
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
  assignedTo?: string;
  assignedPrice?: number;
}

const statusColors: Record<string, string> = {
  Open: '#ef4444',
  Bidding: '#f59e0b',
  Assigned: '#22c55e',
};

export default function DeliveryOrdersPage() {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sending, setSending] = useState<string | null>(null);

  useEffect(() => {
    api.getDeliveryOrders().then(setOrders);
  }, []);

  const handleBroadcast = async (order: DeliveryOrder) => {
    setSending(order.id);
    try {
      await api.broadcastDO(order as unknown as Record<string, unknown>);
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'Bidding' } : o));
      toast.success(`DO ${order.id} sent to all transporters!`);
    } catch {
      toast.error('Failed to broadcast');
    }
    setSending(null);
  };

  const filtered = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          o.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          o.material.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-950">
      <Topbar title="Delivery Orders" />
      
      <div className="p-6 space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by DO number, destination, or material..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            {['all', 'Open', 'Bidding', 'Assigned'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === status
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-700/50'
                }`}
              >
                {status === 'all' ? 'All' : status}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
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
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
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
                    <td className="px-6 py-4">
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: `${statusColors[order.status]}20`,
                          color: statusColors[order.status],
                        }}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {order.status === 'Open' && (
                        <button
                          onClick={() => handleBroadcast(order)}
                          disabled={sending === order.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 text-xs font-medium transition-all disabled:opacity-50"
                        >
                          {sending === order.id ? (
                            <div className="w-3.5 h-3.5 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                          ) : (
                            <Send className="w-3.5 h-3.5" />
                          )}
                          Send to Transporters
                        </button>
                      )}
                      {order.status === 'Assigned' && (
                        <span className="text-xs text-emerald-400 font-medium">
                          ₹{order.assignedPrice?.toLocaleString('en-IN')}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="px-6 py-12 text-center text-slate-500">
              No delivery orders found matching your criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
