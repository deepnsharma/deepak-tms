"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import Topbar from '@/components/layout/Topbar';
import { Plus, Trash2, X, Users, IdCard } from 'lucide-react';
import { toast } from 'sonner';

interface Driver {
  id: string;
  name: string;
  mobile: string;
  licenseNumber: string;
  aadhaar: string;
  licenseExpiry: string;
  assignedVehicle: string;
  transporterId: string;
  status: string;
}

export default function MyDriversPage() {
  const { user } = useAuth();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    aadhaar: '',
    licenseNumber: '',
    licenseExpiry: '',
    assignedVehicle: '',
  });

  useEffect(() => {
    if (user?.transporterId) {
      api.getDrivers(user.transporterId).then(setDrivers);
    }
  }, [user]);

  const handleAdd = async () => {
    if (!form.name || !form.mobile || !form.licenseNumber) {
      toast.error('Please fill required fields');
      return;
    }
    try {
      await api.addDriver({ ...form, transporterId: user?.transporterId });
      toast.success('Driver added successfully!');
      setShowModal(false);
      setForm({ name: '', mobile: '', aadhaar: '', licenseNumber: '', licenseExpiry: '', assignedVehicle: '' });
      if (user?.transporterId) api.getDrivers(user.transporterId).then(setDrivers);
    } catch {
      toast.error('Failed to add driver');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteDriver(id);
      setDrivers(prev => prev.filter(d => d.id !== id));
      toast.success('Driver removed');
    } catch {
      toast.error('Failed to remove driver');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Topbar title="My Drivers" />

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">{drivers.length} driver(s) registered</p>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Driver
          </button>
        </div>

        {/* Table */}
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50 bg-slate-800/30">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Driver Name</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Mobile</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Aadhaar No</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">License No</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">License Expiry</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Vehicle</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {drivers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                      <p className="text-sm text-slate-500">No drivers registered yet</p>
                    </td>
                  </tr>
                ) : (
                  drivers.map(d => (
                    <tr key={d.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
                            <span className="text-xs font-bold text-blue-400">{d.name.charAt(0)}</span>
                          </div>
                          <span className="text-sm font-medium text-white">{d.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">{d.mobile}</td>
                      <td className="px-6 py-4 text-sm text-slate-300 font-mono text-xs">{d.aadhaar}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <IdCard className="w-3.5 h-3.5 text-slate-500" />
                          <span className="text-sm text-slate-300 font-mono text-xs">{d.licenseNumber}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {new Date(d.licenseExpiry).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-blue-400">{d.assignedVehicle}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400">
                          {d.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDelete(d.id)}
                          className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Driver Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white">Add New Driver</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Driver Name *</label>
                <input
                  type="text"
                  placeholder="Full name"
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Mobile Number *</label>
                  <input
                    type="text"
                    placeholder="+91 XXXXX XXXXX"
                    value={form.mobile}
                    onChange={(e) => setForm(prev => ({ ...prev, mobile: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Aadhaar No *</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012"
                    value={form.aadhaar}
                    onChange={(e) => setForm(prev => ({ ...prev, aadhaar: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">License No *</label>
                  <input
                    type="text"
                    placeholder="GJ01-XXXX-XXXXXX"
                    value={form.licenseNumber}
                    onChange={(e) => setForm(prev => ({ ...prev, licenseNumber: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">License Expiry</label>
                  <input
                    type="date"
                    value={form.licenseExpiry}
                    onChange={(e) => setForm(prev => ({ ...prev, licenseExpiry: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Assigned Vehicle</label>
                <input
                  type="text"
                  placeholder="Vehicle number"
                  value={form.assignedVehicle}
                  onChange={(e) => setForm(prev => ({ ...prev, assignedVehicle: e.target.value }))}
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
                Add Driver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
