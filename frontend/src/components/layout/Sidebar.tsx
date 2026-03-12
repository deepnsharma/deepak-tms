"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  LayoutDashboard,
  Package,
  Gavel,
  Truck,
  CarFront,
  Users,
  PackageOpen,
  PackageCheck,
  LogOut,
  ChevronLeft,
  ChevronRight,
  FileText,
  ClipboardList,
  Receipt
} from 'lucide-react';
import { useState } from 'react';

const adminNav = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/contracts', label: 'Contracts', icon: FileText },
  { href: '/admin/delivery-orders', label: 'Delivery Orders', icon: Package },
  { href: '/admin/bidding', label: 'Bidding Queue', icon: Gavel },
  { href: '/admin/review-invoice', label: 'Review Invoices', icon: Receipt },
  { href: '/admin/transporters', label: 'Transporters', icon: Truck },
  { href: '/admin/vehicles', label: 'Vehicles', icon: CarFront },
];

const transporterNav = [
  { href: '/transporter/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transporter/contracts', label: 'Contracts', icon: FileText },
  { href: '/transporter/vehicles', label: 'My Vehicles', icon: CarFront },
  { href: '/transporter/drivers', label: 'My Drivers', icon: Users },
  { href: '/transporter/available-do', label: 'Available DO', icon: PackageOpen },
  { href: '/transporter/create-pod', label: 'Create POD', icon: ClipboardList },
  { href: '/transporter/submit-invoice', label: 'Submit Invoice', icon: Receipt },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;

  const navItems = user.role === 'admin' ? adminNav : transporterNav;

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen transition-all duration-300 ${
        collapsed ? 'w-[72px]' : 'w-64'
      } bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 flex flex-col`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-700/50">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
          <Truck className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-lg font-bold text-white tracking-tight">Deepak TMS</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">
              {user.role === 'admin' ? 'Admin Portal' : 'Transporter Portal'}
            </p>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-blue-400 border border-blue-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="px-3 py-4 border-t border-slate-700/50 space-y-2">
        {!collapsed && (
          <div className="px-3 py-2">
            <p className="text-sm font-medium text-white truncate">{user.name}</p>
            <p className="text-xs text-slate-400 capitalize">{user.role}</p>
          </div>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all w-full"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  );
}
