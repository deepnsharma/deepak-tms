"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import Topbar from '@/components/layout/Topbar';
import { ClipboardList, Calendar, Upload, FileCheck, X } from 'lucide-react';
import { toast } from 'sonner';

interface Trip {
  id: string;
  doId: string;
  transporterId: string;
  status: string;
  billedQty?: number;
}

export default function CreatePODPage() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  const [form, setForm] = useState({
    actualReportingDate: '',
    dateOfReachingDestination: '',
    dateOfUnloading: '',
    actualQtyUnloaded: '',
    lrAttachmentUrl: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.transporterId) {
      loadTrips();
    }
  }, [user]);

  const loadTrips = () => {
    setLoading(true);
    api.getTrips(user?.transporterId, 'Ongoing')
      .then(setTrips)
      .finally(() => setLoading(false));
  };

  const handleSubmitPOD = async () => {
    if (!form.actualReportingDate || !form.dateOfUnloading || !form.actualQtyUnloaded) {
      toast.error('Please fill all required Date and Quantity fields.');
      return;
    }
    setSubmitting(true);
    try {
      await api.submitPod(selectedTrip!.id, {
        actualReportingDate: form.actualReportingDate,
        dateOfReachingDestination: form.dateOfReachingDestination || form.dateOfUnloading, 
        dateOfUnloading: form.dateOfUnloading,
        actualQtyUnloaded: parseFloat(form.actualQtyUnloaded),
        lrAttachmentUrl: form.lrAttachmentUrl || 'mock_lr.pdf',
      });
      toast.success('POD submitted and detention/shortages auto-calculated.');
      setSelectedTrip(null);
      setForm({ actualReportingDate: '', dateOfReachingDestination: '', dateOfUnloading: '', actualQtyUnloaded: '', lrAttachmentUrl: '' });
      loadTrips();
    } catch {
      toast.error('Failed to submit POD.');
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Topbar title="Create POD (Proof of Delivery)" />
      
      <div className="p-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-emerald-400" />
                Ongoing Trips Awaiting POD
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Select a completed trip to upload LR and system will auto-calculate detentions or shortages.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/50 border-b border-slate-800 text-slate-400 text-sm">
                  <th className="p-4 font-semibold uppercase tracking-wider">Trip ID</th>
                  <th className="p-4 font-semibold uppercase tracking-wider">DO Reference</th>
                  <th className="p-4 font-semibold uppercase tracking-wider">Billed Qty</th>
                  <th className="p-4 font-semibold uppercase tracking-wider">Status</th>
                  <th className="p-4 font-semibold uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">Loading trips...</td>
                  </tr>
                ) : trips.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">No ongoing trips require POD.</td>
                  </tr>
                ) : (
                  trips.map((trip) => (
                    <tr key={trip.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 text-sm font-medium text-blue-400">{trip.id}</td>
                      <td className="p-4 text-sm text-slate-300 font-mono">{trip.doId}</td>
                      <td className="p-4 text-sm text-slate-300">{trip.billedQty} Ton</td>
                      <td className="p-4 text-sm">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-500">
                          {trip.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedTrip(trip)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 transition-all flex items-center gap-2 ml-auto"
                        >
                          <FileCheck className="w-4 h-4" />
                          Submit POD
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

      {/* POD Modal */}
      {selectedTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg mx-4 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-800/50 flex-shrink-0">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                Submit POD - {selectedTrip.id}
              </h3>
              <button onClick={() => setSelectedTrip(null)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="px-6 py-4 space-y-4 overflow-y-auto">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-sm text-blue-300">
                Detention and Shortage penalties will be auto-calculated upon submission based on your contract rules.
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Actual Reporting Date *
                  </label>
                  <input
                    type="date"
                    value={form.actualReportingDate}
                    onChange={(e) => setForm(prev => ({ ...prev, actualReportingDate: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Date of Unloading *
                  </label>
                  <input
                    type="date"
                    value={form.dateOfUnloading}
                    onChange={(e) => setForm(prev => ({ ...prev, dateOfUnloading: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Actual Qty Unloaded (Tons) *</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    placeholder={`e.g. ${selectedTrip.billedQty || '25'}`}
                    value={form.actualQtyUnloaded}
                    onChange={(e) => setForm(prev => ({ ...prev, actualQtyUnloaded: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">TONS</div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" /> LR Attachment (URL/Filename)
                </label>
                <input
                  type="text"
                  placeholder="mock_lr_scan.pdf"
                  value={form.lrAttachmentUrl}
                  onChange={(e) => setForm(prev => ({ ...prev, lrAttachmentUrl: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-700 flex items-center justify-end gap-3 bg-slate-800/30 flex-shrink-0">
              <button
                onClick={() => setSelectedTrip(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitPOD}
                disabled={submitting}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold shadow-lg shadow-emerald-500/20 hover:bg-emerald-500 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Confirm Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
