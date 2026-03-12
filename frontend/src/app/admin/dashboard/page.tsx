"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Topbar from '@/components/layout/Topbar';
import { Package, Clock, Gavel, CheckCircle, TrendingUp, Truck, Users } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Stats {
  ongoingTrips: number;
  completedTrips: number;
  openDOs: number;
  openInvoices: number;
  topTransporters: { name: string; completedOrders: number }[];
}

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

const statusColors: Record<string, string> = {
  Open: '#ef4444',
  Bidding: '#f59e0b',
  Assigned: '#22c55e',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);

  useEffect(() => {
    api.getStats().then(setStats);
    api.getDeliveryOrders().then(setOrders);
  }, []);

  const pieData = stats ? [
    { name: 'Ongoing', value: stats.ongoingTrips, color: '#3b82f6' },
    { name: 'Completed', value: stats.completedTrips, color: '#22c55e' },
    { name: 'Open DOs', value: stats.openDOs, color: '#ef4444' },
  ] : [];

  const barData = stats?.topTransporters || [];

  const kpiCards = stats ? [
    { label: 'Ongoing Trips', value: stats.ongoingTrips, icon: Truck, gradient: 'from-blue-500 to-blue-600', bgGlow: 'shadow-blue-500/20' },
    { label: 'Completed Trips', value: stats.completedTrips, icon: CheckCircle, gradient: 'from-emerald-500 to-green-600', bgGlow: 'shadow-emerald-500/20' },
    { label: 'Open DOs', value: stats.openDOs, icon: Clock, gradient: 'from-amber-500 to-orange-500', bgGlow: 'shadow-amber-500/20' },
    { label: 'Open Invoices (₹)', value: stats.openInvoices.toLocaleString('en-IN'), icon: Gavel, gradient: 'from-purple-500 to-violet-600', bgGlow: 'shadow-purple-500/20' },
  ] : [];

  return (
    <div className="min-h-screen bg-slate-950">
      <Topbar title="Admin Dashboard" />
      
      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div
                key={i}
                className={`relative overflow-hidden rounded-xl bg-slate-900/50 border border-slate-700/50 p-5 shadow-lg ${card.bgGlow} hover:shadow-xl transition-all duration-300 group`}
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

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* DO Status Distribution */}
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-blue-500 to-indigo-500" />
              DO Status Distribution
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                  />
                  <Legend
                    formatter={(value) => <span style={{ color: '#94a3b8', fontSize: '13px' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Transporters */}
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-emerald-500 to-green-500" />
              Top Transporters
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                  <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                  <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={11} width={110} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                  />
                  <Bar dataKey="completedOrders" fill="url(#barGradient)" radius={[0, 6, 6, 0]} barSize={20} />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Quick Stats Row Removed for Mock API simplicity */}

        {/* Recent Delivery Orders Table */}
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700/50">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-amber-500 to-orange-500" />
              Recent Delivery Orders
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">DO Number</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Route</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Material</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Weight</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-blue-400">{order.id}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{order.plant} → {order.destination}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{order.material}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{order.weight}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{order.vehicleType}</td>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
