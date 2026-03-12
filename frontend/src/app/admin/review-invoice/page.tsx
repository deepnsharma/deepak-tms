"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Topbar from '@/components/layout/Topbar';
import { Receipt, AlertTriangle, CheckCircle, XCircle, ChevronRight, Calculator, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface Invoice {
  id: string;
  transporterId: string;
  invoiceNumber: string;
  invoiceDate: string;
  claimedAmount: number;
  expectedAmount: number;
  status: string;
  rejectionReason?: string;
  tripIds: string[];
}

const statusLevels = ['Submitted', 'L1_Approved', 'L2_Approved', 'L3_Approved', 'Rejected'];

export default function ReviewInvoicePage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = () => {
    setLoading(true);
    api.getInvoices().then(setInvoices).finally(() => setLoading(false));
  };

  const getNextLevel = (current: string) => {
    const idx = statusLevels.indexOf(current);
    if (idx >= 0 && idx < 3) return statusLevels[idx + 1];
    return current;
  };

  const handleApprove = async () => {
    if (!selectedInvoice) return;
    const nextStatus = getNextLevel(selectedInvoice.status);
    
    try {
      await api.reviewInvoice(selectedInvoice.id, { status: nextStatus });
      toast.success(`Invoice ${selectedInvoice.id} advanced to ${nextStatus.replace('_', ' ')}`);
      setSelectedInvoice(null);
      loadInvoices();
    } catch {
      toast.error('Failed to approve invoice');
    }
  };

  const handleReject = async () => {
    if (!selectedInvoice || !rejectReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      await api.reviewInvoice(selectedInvoice.id, { 
        status: 'Rejected', 
        rejectionReason: rejectReason 
      });
      toast.success('Invoice rejected and sent back to transporter');
      setRejectMode(false);
      setRejectReason('');
      setSelectedInvoice(null);
      loadInvoices();
    } catch {
      toast.error('Failed to reject invoice');
    }
  };

  const pendingInvoices = invoices.filter(inv => !['L3_Approved', 'Rejected'].includes(inv.status));
  const completedInvoices = invoices.filter(inv => ['L3_Approved', 'Rejected'].includes(inv.status));

  return (
    <div className="min-h-screen bg-slate-950">
      <Topbar title="Review Invoices (L1/L2/L3)" />
      
      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Col: Pending Invoices List */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col h-[calc(100vh-140px)]">
          <div className="p-6 border-b border-slate-800 bg-slate-800/50 flex-shrink-0 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-indigo-400" />
                Pending Approvals
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Invoices requiring L1, L2, or L3 validation.
              </p>
            </div>
            <div className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-lg text-xs font-bold border border-indigo-500/20">
              {pendingInvoices.length} Pending
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <p className="text-center text-slate-500 py-8">Loading invoices...</p>
            ) : pendingInvoices.length === 0 ? (
              <div className="py-12 text-center">
                <CheckCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">All caught up! No invoices pending review.</p>
              </div>
            ) : (
              pendingInvoices.map(inv => {
                const isDiscrepancy = inv.claimedAmount !== inv.expectedAmount;
                const isSelected = selectedInvoice?.id === inv.id;
                
                return (
                  <div 
                    key={inv.id} 
                    onClick={() => { setSelectedInvoice(inv); setRejectMode(false); }}
                    className={`p-4 border rounded-xl cursor-pointer transition-all ${
                      isSelected ? 'bg-indigo-500/10 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.1)]' : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-200">{inv.id}</h4>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">Transporter: {inv.transporterId}</p>
                      </div>
                      <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider">
                        Awaiting {getNextLevel(inv.status).split('_')[0]}
                      </span>
                    </div>

                    <div className="mt-4 flex gap-4">
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-semibold">Claimed</p>
                        <p className={`text-sm font-bold mt-0.5 ${isDiscrepancy ? 'text-red-400' : 'text-emerald-400'}`}>
                          ₹{inv.claimedAmount.toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-semibold">System Expected</p>
                        <p className="text-sm font-bold text-slate-300 mt-0.5">
                          ₹{inv.expectedAmount.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>

                    {isDiscrepancy && (
                      <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-red-400 bg-red-500/10 py-1.5 px-2.5 rounded border border-red-500/20">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Amount Discrepancy Detected
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Col: Invoice Review Action Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col h-[calc(100vh-140px)]">
          {!selectedInvoice ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 text-center bg-slate-800/10">
              <FileText className="w-16 h-16 mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-slate-400">Select an Invoice to Review</h3>
              <p className="text-sm mt-2 max-w-sm">Click on any pending invoice from the list to view its details, analyze expected calculations, and take action.</p>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-slate-800 bg-slate-800/50 flex-shrink-0">
                <div className="flex items-center gap-3 text-sm text-slate-400 mb-2">
                  <span>{selectedInvoice.status.replace('_', ' ')}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                  <span className="text-indigo-400 font-bold tracking-wider uppercase">Evaluating for {getNextLevel(selectedInvoice.status).replace('_', ' ')}</span>
                </div>
                <h2 className="text-2xl font-bold text-white">{selectedInvoice.id}</h2>
                <p className="text-slate-400 mt-1">Ref: {selectedInvoice.invoiceNumber} | Date: {new Date(selectedInvoice.invoiceDate).toLocaleDateString('en-IN')}</p>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Amount Comparison */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 relative overflow-hidden">
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Transporter Claimed</p>
                    <p className="text-3xl font-bold text-white">₹{selectedInvoice.claimedAmount.toLocaleString('en-IN')}</p>
                    <div className="absolute right-0 bottom-0 top-0 w-1 bg-blue-500 opacity-50"></div>
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 relative overflow-hidden">
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1 flex items-center gap-1.5"><Calculator className="w-3.5 h-3.5" /> System Expected</p>
                    <p className="text-3xl font-bold text-slate-200">₹{selectedInvoice.expectedAmount.toLocaleString('en-IN')}</p>
                    <div className="absolute right-0 bottom-0 top-0 w-1 bg-emerald-500 opacity-50"></div>
                  </div>
                </div>

                {selectedInvoice.claimedAmount !== selectedInvoice.expectedAmount && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-red-400">Discrepancy Alert</h4>
                      <p className="text-sm text-red-300/80 mt-1">
                        The claimed amount differs from the system calculated amount by ₹{Math.abs(selectedInvoice.claimedAmount - selectedInvoice.expectedAmount).toLocaleString('en-IN')}. Please verify detentions or manual additions before approving.
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-semibold text-slate-300 mb-3">Attached Trips ({selectedInvoice.tripIds.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedInvoice.tripIds.map(tid => (
                      <span key={tid} className="px-3 py-1.5 bg-slate-800 rounded-lg text-xs font-mono text-slate-300 border border-slate-700">
                        {tid}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Reject Reason Form */}
                {rejectMode && (
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 animate-in slide-in-from-top-2">
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Reason for Rejection *</label>
                    <textarea
                      placeholder="Explain the discrepancy to the transporter..."
                      value={rejectReason}
                      onChange={e => setRejectReason(e.target.value)}
                      className="w-full h-24 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 resize-none"
                    />
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-slate-800 bg-slate-800/30 flex-shrink-0 flex gap-3">
                {rejectMode ? (
                  <>
                    <button
                      onClick={() => setRejectMode(false)}
                      className="flex-1 py-3 rounded-lg bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 transition-all border border-slate-700"
                    >
                      Cancel Rejection
                    </button>
                    <button
                      onClick={handleReject}
                      className="flex-1 py-3 rounded-lg bg-red-600 text-white font-bold hover:bg-red-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
                    >
                      <XCircle className="w-4 h-4" /> Confirm Return
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setRejectMode(true)}
                      className="flex-1 py-3 rounded-lg bg-slate-800 text-red-400 font-semibold hover:bg-red-500/10 hover:border-red-500/30 border border-slate-700 transition-all flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" /> Reject & Return
                    </button>
                    <button
                      onClick={handleApprove}
                      className="flex-1 py-3 rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" /> Approve to {getNextLevel(selectedInvoice.status).split('_')[0]}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
