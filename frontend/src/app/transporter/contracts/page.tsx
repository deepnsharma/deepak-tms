"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import Topbar from '@/components/layout/Topbar';
import { FileText } from 'lucide-react';

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

export default function TransporterContracts() {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.transporterId) {
      api.getContracts(user.transporterId)
        .then(setContracts)
        .finally(() => setLoading(false));
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-950">
      <Topbar title="My Contracts" />
      
      <div className="p-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                Active Contracts
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Read-only view of your assigned contract lines from SAP.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/50 border-b border-slate-800 text-slate-400 text-sm">
                  <th className="p-4 font-semibold uppercase tracking-wider">Contract ID</th>
                  <th className="p-4 font-semibold uppercase tracking-wider">Company</th>
                  <th className="p-4 font-semibold uppercase tracking-wider">Route</th>
                  <th className="p-4 font-semibold uppercase tracking-wider">Product</th>
                  <th className="p-4 font-semibold uppercase tracking-wider">Vehicle Type</th>
                  <th className="p-4 font-semibold uppercase tracking-wider">Rate</th>
                  <th className="p-4 font-semibold uppercase tracking-wider">Validity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">Loading contracts...</td>
                  </tr>
                ) : contracts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">No active contracts found.</td>
                  </tr>
                ) : (
                  contracts.map((contract) => (
                    <tr key={contract.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 text-sm font-medium text-blue-400">{contract.id}</td>
                      <td className="p-4 text-sm text-slate-200">{contract.company}</td>
                      <td className="p-4 text-sm text-slate-300">
                        {contract.origin} → {contract.destination}
                        <div className="text-xs text-slate-500 mt-1">{contract.route}</div>
                      </td>
                      <td className="p-4 text-sm text-slate-300">{contract.product}</td>
                      <td className="p-4 text-sm text-slate-300">
                        <span className="px-2 py-1 bg-slate-800 rounded-md text-xs border border-slate-700">
                          {contract.vehicleType}
                        </span>
                      </td>
                      <td className="p-4 text-sm font-semibold text-emerald-400">
                        ₹{contract.rate.toLocaleString('en-IN')}
                        <span className="text-xs text-slate-500 font-normal ml-1">/{contract.rateType}</span>
                      </td>
                      <td className="p-4 text-sm text-slate-400">
                        {contract.validFrom} <br/>to {contract.validTo}
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
