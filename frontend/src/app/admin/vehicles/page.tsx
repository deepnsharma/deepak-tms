"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Topbar from '@/components/layout/Topbar';
import { CarFront, Shield, FileText } from 'lucide-react';

interface Vehicle {
  id: string;
  vehicleNumber: string;
  type: string;
  capacity: string;
  ownerName: string;
  transporterId: string;
  insuranceExpiry: string;
  status: string;
}

const typeIcons: Record<string, string> = {
  Truck: '🚛',
  Tanker: '🛢️',
  Trailer: '🚜',
};

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    api.getVehicles().then(setVehicles);
  }, []);

  const isExpiringSoon = (date: string) => {
    const diff = new Date(date).getTime() - Date.now();
    return diff < 90 * 24 * 60 * 60 * 1000; // 90 days
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Topbar title="All Vehicles" />
      
      <div className="p-6">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {['Truck', 'Tanker', 'Trailer'].map(type => {
            const count = vehicles.filter(v => v.type === type).length;
            return (
              <div key={type} className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 flex items-center gap-3">
                <span className="text-2xl">{typeIcons[type]}</span>
                <div>
                  <p className="text-2xl font-bold text-white">{count}</p>
                  <p className="text-xs text-slate-400">{type}s</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Table */}
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50 bg-slate-800/30">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Vehicle No</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Capacity</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Owner</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Insurance Expiry</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => (
                  <tr key={v.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <CarFront className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-semibold text-white">{v.vehicleNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-sm text-slate-300">
                        <span>{typeIcons[v.type]}</span> {v.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">{v.capacity}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{v.ownerName}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <Shield className={`w-3.5 h-3.5 ${isExpiringSoon(v.insuranceExpiry) ? 'text-amber-400' : 'text-emerald-400'}`} />
                        <span className={`text-sm ${isExpiringSoon(v.insuranceExpiry) ? 'text-amber-400' : 'text-slate-300'}`}>
                          {new Date(v.insuranceExpiry).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400">
                        {v.status}
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
