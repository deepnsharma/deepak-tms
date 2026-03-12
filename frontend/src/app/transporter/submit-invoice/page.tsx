"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import Topbar from '@/components/layout/Topbar';
import { Receipt, Calendar, FileText, CheckCircle2, ChevronRight, AlertCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Trip {
  id: string;
  doId: string;
  actualQtyUnloaded: number;
  detentionAtSource: number;
  detentionAtDestination: number;
  shortages: number;
  status: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  claimedAmount: number;
  expectedAmount: number;
  status: string;
  rejectionReason?: string;
  tripIds: string[];
}

export default function SubmitInvoicePage() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedTrips, setSelectedTrips] = useState<string[]>([]);
  const [form, setForm] = useState({
    invoiceNumber: '',
    invoiceDate: '',
    claimedAmount: '',
  });

  useEffect(() => {
    if (user?.transporterId) {
      loadData();
    }
  }, [user]);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.getTrips(user?.transporterId, 'POD Done'),
      api.getInvoices(user?.transporterId)
    ]).then(([tripsData, invoicesData]) => {
      // Filter out trips already in an active/submitted invoice (mock simple filter)
      const invoicedTripIds = new Set(invoicesData.filter((i: Invoice) => i.status !== 'Rejected').flatMap((i: Invoice) => i.tripIds));
      setTrips(tripsData.filter((t: Trip) => !invoicedTripIds.has(t.id)));
      setInvoices(invoicesData);
    }).finally(() => setLoading(false));
  };

  const toggleTripSelection = (id: string) => {
    setSelectedTrips(prev => prev.includes(id) ? prev.filter(tId => tId !== id) : [...prev, id]);
  };

  const handleSubmit = async () => {
    if (selectedTrips.length === 0) {
      toast.error('Please select at least one trip.');
      return;
    }
    if (!form.invoiceNumber || !form.invoiceDate || !form.claimedAmount) {
      toast.error('Please fill all invoice details.');
      return;
    }

    try {
      await api.submitInvoice({
        transporterId: user?.transporterId,
        invoiceNumber: form.invoiceNumber,
        invoiceDate: form.invoiceDate,
        claimedAmount: parseFloat(form.claimedAmount),
        tripIds: selectedTrips,
      });
      toast.success('Invoice submitted successfully and pending L1 approval!');
      setForm({ invoiceNumber: '', invoiceDate: '', claimedAmount: '' });
      setSelectedTrips([]);
      loadData();
    } catch {
      toast.error('Failed to submit invoice.');
    }
  };

  const getStatusColor = (status: string) => {
    if (status.includes('Approved')) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    if (status === 'Rejected') return 'text-red-500 bg-red-500/10 border-red-500/20';
    return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Topbar title="Submit & Track Invoices" />
      
      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Col: Create Invoice */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col h-[calc(100vh-140px)]">
            <div className="p-6 border-b border-slate-800 bg-slate-800/50 flex-shrink-0">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-400" />
                Create New Invoice
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Select completed trips and submit your invoice details.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Trip Selection */}
              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs">1</span> 
                  Select Trips (POD Done)
                </h3>
                {trips.length === 0 ? (
                  <div className="p-4 border border-dashed border-slate-700 rounded-xl text-center text-slate-500 text-sm">
                    No available completed trips.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {trips.map(trip => {
                      const isSelected = selectedTrips.includes(trip.id);
                      return (
                        <div 
                          key={trip.id} 
                          onClick={() => toggleTripSelection(trip.id)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center gap-3 ${
                            isSelected 
                              ? 'bg-blue-500/10 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                              : 'bg-slate-800/30 border-slate-700 hover:border-slate-500'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                            isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-500'
                          }`}>
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-200">{trip.id}</p>
                            <p className="text-xs text-slate-400 font-mono mt-0.5">DO: {trip.doId}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-400">Qty: {trip.actualQtyUnloaded}T</p>
                            <p className="text-[10px] text-amber-500/70">
                              {(trip.shortages > 0 || trip.detentionAtSource > 0 || trip.detentionAtDestination > 0) && 'Has deductions/detention'}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Form Details */}
              <div className={selectedTrips.length === 0 ? 'opacity-50 pointer-events-none transition-opacity' : 'transition-opacity'}>
                <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs">2</span> 
                  Invoice Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" /> Transporter Invoice Number *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. INV-2026-001"
                      value={form.invoiceNumber}
                      onChange={(e) => setForm(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" /> Invoice Date *
                    </label>
                    <input
                      type="date"
                      value={form.invoiceDate}
                      onChange={(e) => setForm(prev => ({ ...prev, invoiceDate: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Claimed Amount (₹) *</label>
                    <input
                      type="number"
                      placeholder="e.g. 150000"
                      value={form.claimedAmount}
                      onChange={(e) => setForm(prev => ({ ...prev, claimedAmount: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-800 bg-slate-800/30 flex-shrink-0">
              <button
                onClick={handleSubmit}
                disabled={selectedTrips.length === 0}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] transition-all disabled:opacity-50 disabled:shadow-none"
              >
                Submit Invoice
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Invoice History */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col h-[calc(100vh-140px)]">
          <div className="p-6 border-b border-slate-800 bg-slate-800/50 flex-shrink-0">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Invoice Tracking
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Track multi-level approval status for your submitted invoices.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <p className="text-center text-slate-500 py-8">Loading history...</p>
            ) : invoices.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No past invoices found.</p>
            ) : (
              invoices.map(inv => (
                <div key={inv.id} className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl hover:bg-slate-800/60 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-blue-300">{inv.id}</h4>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">Ref: {inv.invoiceNumber}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded border text-[10px] font-bold uppercase tracking-wider ${getStatusColor(inv.status)}`}>
                      {inv.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="flex grid-cols-2 gap-4 mt-4">
                    <div className="bg-slate-900/50 rounded-lg p-2.5 flex-1">
                      <p className="text-[10px] text-slate-500 uppercase font-semibold">Claimed Amount</p>
                      <p className="text-sm font-bold text-white mt-0.5">₹{inv.claimedAmount.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2.5 flex-1">
                      <p className="text-[10px] text-slate-500 uppercase font-semibold">Expected (System)</p>
                      <p className="text-sm font-bold text-slate-300 mt-0.5">₹{inv.expectedAmount.toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  {inv.status === 'Rejected' && inv.rejectionReason && (
                    <div className="mt-3 p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg flex gap-2">
                      <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-red-400">Rejection Reason</p>
                        <p className="text-xs text-red-300/80 mt-0.5">{inv.rejectionReason}</p>
                      </div>
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(inv.invoiceDate).toLocaleDateString('en-IN')}
                    </span>
                    <span>{inv.tripIds.length} Trip(s) Attached</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
