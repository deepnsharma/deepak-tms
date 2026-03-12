"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

type Role = 'admin' | 'transporter' | null;

interface User {
  name: string;
  role: Role;
  transporterId?: string;
  transporterName?: string;
}

interface AuthContextType {
  user: User | null;
  login: (role: Role, transporterId?: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('tms_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const login = (role: Role, transporterId?: string) => {
    const transporterMap: Record<string, string> = {
      'TR-001': 'Patel Logistics',
      'TR-002': 'RK Logistics',
      'TR-003': 'Mahadev Movers',
      'TR-004': 'Singh Transport',
      'TR-005': 'Gupta Fleet',
    };

    const newUser: User = {
      name: role === 'admin' ? 'Admin User' : transporterMap[transporterId || 'TR-001'] || 'Transporter',
      role,
      transporterId: role === 'transporter' ? (transporterId || 'TR-001') : undefined,
      transporterName: role === 'transporter' ? transporterMap[transporterId || 'TR-001'] : undefined,
    };
    
    setUser(newUser);
    localStorage.setItem('tms_user', JSON.stringify(newUser));
    router.push(role === 'admin' ? '/admin/dashboard' : '/transporter/dashboard');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('tms_user');
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
