"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import Topbar from '@/components/layout/Topbar';
import { Plus, Trash2, X, CarFront, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface Vehicle {
  id: string;
  vehicleNumber: string;
  type: string;
  capacity: string;
  transporterId: string;
  rc: string;
  insuranceDetails: string;
  insuranceExpiry: string;
  status: string;
}

const typeIcons: Record<string, string> = {
  Truck: '🚛',
  Tanker: '🛢️',
  Trailer: '🚜',
};

export default function MyVehiclesPage() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    vehicleNumber: '',
    type: 'Truck',
    capacity: '',
    rc: '',
    insuranceDetails: '',
    insuranceExpiry: '',
  });

  useEffect(() => {
    if (user?.transporterId) {
      api.getVehicles(user.transporterId).then(setVehicles);
    }
  }, [user]);

  const handleAdd = async () => {
    if (!form.vehicleNumber || !form.capacity) {
      toast.error('Please fill required fields');
      return;
    }
    try {
      await api.addVehicle({
        ...form,
        transporterId: user?.transporterId,
        ownerName: user?.transporterName,
      });
      toast.success('Vehicle added successfully!');
      setShowModal(false);
      setForm({ vehicleNumber: '', type: 'Truck', capacity: '', rc: '', insuranceDetails: '', insuranceExpiry: '' });
      if (user?.transporterId) api.getVehicles(user.transporterId).then(setVehicles);
    } catch {
      toast.error('Failed to add vehicle');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteVehicle(id);
      setVehicles(prev => prev.filter(v => v.id !== id));
      toast.success('Vehicle removed');
    } catch {
      toast.error('Failed to remove vehicle');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Topbar title="My Vehicles" />

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">{vehicles.length} vehicle(s) registered</p>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Vehicle
          </button>
        </div>

        {/* Vehicle Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((v) => (
            <div key={v.id} className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-5 hover:bg-slate-800/40 transition-all group relative">
              <button
                onClick={() => handleDelete(v.id)}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-slate-800/80 flex items-center justify-center text-2xl">
                  {typeIcons[v.type] || '🚛'}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{v.vehicleNumber}</h3>
                  <p className="text-xs text-slate-500">{v.type}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Capacity</span>
                  <span className="text-xs font-medium text-white">{v.capacity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">RC Number</span>
                  <span className="text-xs font-medium text-slate-300">{v.rc}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Insurance
                  </span>
                  <span className="text-xs font-medium text-slate-300">
                    {new Date(v.insuranceExpiry).toLocaleDateString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400">
                  {v.status}
                </span>
                <span className="text-[10px] text-slate-500">{v.id}</span>
              </div>
            </div>
          ))}
        </div>

        {vehicles.length === 0 && (
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-12 text-center">
            <CarFront className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-400">No Vehicles Registered</h3>
            <p className="text-sm text-slate-500 mt-1">Add your first vehicle to get started</p>
          </div>
        )}
      </div>

      {/* Add Vehicle Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white">Add New Vehicle</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Vehicle Number *</label>
                <input
                  type="text"
                  placeholder="e.g. GJ01AB1234"
                  value={form.vehicleNumber}
                  onChange={(e) => setForm(prev => ({ ...prev, vehicleNumber: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="Truck">Truck</option>
                    <option value="Tanker">Tanker</option>
                    <option value="Trailer">Trailer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Capacity *</label>
                  <input
                    type="text"
                    placeholder="e.g. 25 Ton"
                    value={form.capacity}
                    onChange={(e) => setForm(prev => ({ ...prev, capacity: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Insurance Expiry</label>
                <input
                  type="date"
                  value={form.insuranceExpiry}
                  onChange={(e) => setForm(prev => ({ ...prev, insuranceExpiry: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">RC Number *</label>
                <input
                  type="text"
                  placeholder="e.g. RC12345678"
                  value={form.rc}
                  onChange={(e) => setForm(prev => ({ ...prev, rc: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-700 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all"
              >
                Add Vehicle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
