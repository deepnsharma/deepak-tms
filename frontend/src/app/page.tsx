"use client";

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Truck, Shield, Package, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'admin' | 'transporter'>('admin');
  const [selectedTransporter, setSelectedTransporter] = useState('TR-001');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      login(selectedRole, selectedRole === 'transporter' ? selectedTransporter : undefined);
    }, 600);
  };

  const transporters = [
    { id: 'TR-001', name: 'Patel Logistics' },
    { id: 'TR-002', name: 'RK Logistics' },
    { id: 'TR-003', name: 'Mahadev Movers' },
    { id: 'TR-004', name: 'Singh Transport' },
    { id: 'TR-005', name: 'Gupta Fleet' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-blue-500/3 to-indigo-500/3 rounded-full blur-3xl" />
        
        {/* Route Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-slate-900/70 backdrop-blur-2xl border border-slate-700/50 rounded-2xl shadow-2xl shadow-blue-500/5 p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Truck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Deepak TMS</h1>
            <p className="text-sm text-slate-400 mt-1">Transport Management System</p>
          </div>

          {/* Role Selector */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Select Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedRole('admin')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300 ${
                  selectedRole === 'admin'
                    ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10'
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                }`}
              >
                <Shield className={`w-6 h-6 ${selectedRole === 'admin' ? 'text-blue-400' : 'text-slate-500'}`} />
                <span className={`text-sm font-medium ${selectedRole === 'admin' ? 'text-blue-300' : 'text-slate-400'}`}>
                  Admin / Logistics
                </span>
              </button>
              <button
                onClick={() => setSelectedRole('transporter')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300 ${
                  selectedRole === 'transporter'
                    ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10'
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                }`}
              >
                <Package className={`w-6 h-6 ${selectedRole === 'transporter' ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span className={`text-sm font-medium ${selectedRole === 'transporter' ? 'text-indigo-300' : 'text-slate-400'}`}>
                  Transporter
                </span>
              </button>
            </div>
          </div>

          {/* Transporter Selection */}
          {selectedRole === 'transporter' && (
            <div className="mb-6 animate-in slide-in-from-top-2 duration-300">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Select Company
              </label>
              <div className="space-y-2">
                {transporters.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTransporter(t.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 text-left ${
                      selectedTransporter === t.id
                        ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-300'
                        : 'border-slate-700/50 bg-slate-800/30 text-slate-400 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                      selectedTransporter === t.id 
                        ? 'bg-indigo-500/20 text-indigo-400' 
                        : 'bg-slate-700/50 text-slate-500'
                    }`}>
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t.name}</p>
                      <p className="text-xs text-slate-500">{t.id}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Sign In as {selectedRole === 'admin' ? 'Admin' : 'Transporter'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-center text-xs text-slate-500 mt-4">
            MVP Prototype • Mock Data Mode
          </p>
        </div>
      </div>
    </div>
  );
}
