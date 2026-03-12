"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Topbar from '@/components/layout/Topbar';
import { Truck, Phone, Mail, MapPin } from 'lucide-react';

interface Transporter {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  vehicleCount: number;
  status: string;
}

export default function TransportersPage() {
  const [transporters, setTransporters] = useState<Transporter[]>([]);

  useEffect(() => {
    api.getTransporters().then(setTransporters);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950">
      <Topbar title="Transporters" />
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {transporters.map((t) => (
            <div key={t.id} className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-5 hover:bg-slate-800/40 transition-all group">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Truck className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white truncate">{t.name}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 capitalize">
                      {t.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{t.id}</p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t.email}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t.address}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between">
                <span className="text-xs text-slate-500">Contact Person</span>
                <span className="text-xs font-medium text-slate-300">{t.contact}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-slate-500">Vehicles</span>
                <span className="text-xs font-bold text-blue-400">{t.vehicleCount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
