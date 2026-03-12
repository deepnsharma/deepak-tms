"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Topbar from '@/components/layout/Topbar';
import { Gavel, Trophy, ArrowDown, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface DeliveryOrder {
  id: string;
  plant: string;
  destination: string;
  material: string;
  weight: string;
  vehicleType: string;
  status: string;
}

interface Bid {
  id: string;
  doId: string;
  transporterId: string;
  transporter: string;
  price: number;
  timestamp: string;
  status: string;
}

export default function BiddingPage() {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [selectedDO, setSelectedDO] = useState<string | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [assigning, setAssigning] = useState<string | null>(null);

  useEffect(() => {
    api.getDeliveryOrders().then(data => {
      const biddingOrders = data.filter((o: DeliveryOrder) => o.status === 'Bidding');
      setOrders(biddingOrders);
      if (biddingOrders.length > 0 && !selectedDO) {
        setSelectedDO(biddingOrders[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedDO) {
      api.getBids(selectedDO).then(setBids);
    }
  }, [selectedDO]);

  const handleAssign = async (bid: Bid) => {
    setAssigning(bid.id);
    try {
      await api.assignTransporter({
        doId: bid.doId,
        transporterId: bid.transporterId,
        price: bid.price,
      });
      toast.success(`Assigned ${bid.transporter} to ${bid.doId} at ₹${bid.price.toLocaleString('en-IN')}`);
      // Refresh
      const data = await api.getDeliveryOrders();
      setOrders(data.filter((o: DeliveryOrder) => o.status === 'Bidding'));
      if (selectedDO) {
        api.getBids(selectedDO).then(setBids);
      }
    } catch {
      toast.error('Failed to assign transporter');
    }
    setAssigning(null);
  };

  const handleAssignLowest = () => {
    if (bids.length > 0) {
      handleAssign(bids[0]);
    }
  };

  const selectedOrder = orders.find(o => o.id === selectedDO);

  return (
    <div className="min-h-screen bg-slate-950">
      <Topbar title="Bidding Queue" />
      
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* DO Selection Sidebar */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider px-1">Active Bidding Orders</h3>
            {orders.length === 0 ? (
              <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-8 text-center">
                <Gavel className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-500">No orders in bidding</p>
              </div>
            ) : (
              orders.map(order => (
                <button
                  key={order.id}
                  onClick={() => setSelectedDO(order.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                    selectedDO === order.id
                      ? 'bg-blue-500/10 border-blue-500/30 shadow-lg shadow-blue-500/5'
                      : 'bg-slate-900/50 border-slate-700/50 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-bold ${selectedDO === order.id ? 'text-blue-400' : 'text-white'}`}>
                      {order.id}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-400">
                      Bidding
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{order.plant} → {order.destination}</p>
                  <p className="text-xs text-slate-500 mt-1">{order.material} • {order.weight}</p>
                </button>
              ))
            )}
          </div>

          {/* Bid Queue */}
          <div className="lg:col-span-2">
            {selectedOrder ? (
              <div className="space-y-4">
                {/* DO Details Card */}
                <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">{selectedOrder.id}</h3>
                      <p className="text-sm text-slate-400 mt-1">
                        {selectedOrder.plant} → {selectedOrder.destination}
                      </p>
                    </div>
                    <button
                      onClick={handleAssignLowest}
                      disabled={bids.length === 0}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white text-sm font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all disabled:opacity-50"
                    >
                      <Trophy className="w-4 h-4" />
                      Select Lowest Bidder
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <p className="text-xs text-slate-500">Material</p>
                      <p className="text-sm font-medium text-white">{selectedOrder.material}</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <p className="text-xs text-slate-500">Weight</p>
                      <p className="text-sm font-medium text-white">{selectedOrder.weight}</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <p className="text-xs text-slate-500">Vehicle Required</p>
                      <p className="text-sm font-medium text-white">{selectedOrder.vehicleType}</p>
                    </div>
                  </div>
                </div>

                {/* Bid List */}
                <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                      <ArrowDown className="w-4 h-4 text-emerald-400" />
                      Bids (Lowest to Highest)
                    </h4>
                    <span className="text-xs text-slate-500">{bids.length} bid(s)</span>
                  </div>
                  
                  {bids.length === 0 ? (
                    <div className="px-6 py-12 text-center text-slate-500">
                      No bids received yet.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-800/50">
                      {bids.map((bid, index) => (
                        <div
                          key={bid.id}
                          className={`px-6 py-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors ${
                            index === 0 ? 'bg-emerald-500/5' : ''
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              index === 0
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-slate-700/50 text-slate-400'
                            }`}>
                              #{index + 1}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{bid.transporter}</p>
                              <p className="text-xs text-slate-500">
                                {new Date(bid.timestamp).toLocaleString('en-IN')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className={`text-lg font-bold ${index === 0 ? 'text-emerald-400' : 'text-white'}`}>
                                ₹{bid.price.toLocaleString('en-IN')}
                              </p>
                              {index === 0 && (
                                <span className="text-[10px] text-emerald-500 font-semibold uppercase">Lowest</span>
                              )}
                            </div>
                            <button
                              onClick={() => handleAssign(bid)}
                              disabled={assigning === bid.id}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 text-xs font-medium transition-all disabled:opacity-50"
                            >
                              {assigning === bid.id ? (
                                <div className="w-3.5 h-3.5 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              )}
                              Assign
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-12 text-center">
                <Gavel className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-400">Select a Delivery Order</h3>
                <p className="text-sm text-slate-500 mt-1">Choose a DO from the left panel to view its bids</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
