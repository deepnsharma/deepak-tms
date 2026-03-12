"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Topbar from '@/components/layout/Topbar';
import { FileText, Search } from 'lucide-react';

interface Contract {
  id: string;
  transporterId: string;
  company: string;
  product: string;
  origin: string;
  destination: string;
  vehicleType: string;
  route: string;
  rate: number;
  rateType: string;
  validFrom: string;
  validTo: string;
}

export default function AdminContracts() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    api.getContracts()
      .then(setContracts)
      .finally(() => setLoading(false));
  }, []);

  const filteredContracts = contracts.filter(c => 
    c.transporterId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950">
      <Topbar title="All Contracts (Master)" />
      
      <div className="p-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-800/50">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                Contracts Master
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Read-only view of all synced SAP contracts.
              </p>
            </div>
            
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search Transporter ID or Contract..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/50 border-b border-slate-800 text-slate-400 text-sm">
                  <th className="p-4 font-semibold uppercase tracking-wider">Contract ID</th>
                  <th className="p-4 font-semibold uppercase tracking-wider">Transporter</th>
                  <th className="p-4 font-semibold uppercase tracking-wider">Company</th>
                  <th className="p-4 font-semibold uppercase tracking-wider">Route</th>
                  <th className="p-4 font-semibold uppercase tracking-wider">Product / Vehicle</th>
                  <th className="p-4 font-semibold uppercase tracking-wider">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">Loading contracts...</td>
                  </tr>
                ) : filteredContracts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">No contracts found.</td>
                  </tr>
                ) : (
                  filteredContracts.map((contract) => (
                    <tr key={contract.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 text-sm font-medium text-indigo-400">{contract.id}</td>
                      <td className="p-4 text-sm font-semibold text-slate-200">{contract.transporterId}</td>
                      <td className="p-4 text-sm text-slate-300">{contract.company}</td>
                      <td className="p-4 text-sm text-slate-300">
                        {contract.origin} → {contract.destination}
                        <div className="text-xs text-slate-500 mt-1">{contract.route}</div>
                      </td>
                      <td className="p-4 text-sm text-slate-300">
                        {contract.product}
                        <div className="mt-1">
                          <span className="px-2 py-0.5 bg-slate-800 rounded text-[10px] text-slate-400 border border-slate-700">
                            {contract.vehicleType}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-sm font-semibold text-emerald-400">
                        ₹{contract.rate.toLocaleString('en-IN')}
                        <span className="text-xs text-slate-500 font-normal ml-1">/{contract.rateType}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
