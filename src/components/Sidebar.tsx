import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  PlusSquare,
  BarChart3,
  Settings,
  Aperture,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();

  const links = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/templates', icon: PlusSquare, label: 'Criar Proposta' },
    { to: '/proposals', icon: FileText, label: 'Minhas Propostas' },
    { to: '/analytics', icon: BarChart3, label: 'Análises' },
    ...(user?.role === 'master' ? [{ to: '/settings', icon: Settings, label: 'Configurações' }] : []),
  ];

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col h-screen">
      <div className="p-6 flex items-center space-x-3">
        <Aperture className="w-8 h-8 text-indigo-400" />
        <span className="text-xl font-bold tracking-wider uppercase">Orbit Brand</span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive
                ? 'bg-indigo-600 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <link.icon className="w-5 h-5" />
            <span className="font-medium">{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-neutral-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm ${user?.role === 'master' ? 'bg-gradient-to-tr from-yellow-500 to-orange-600' : 'bg-neutral-800'
              }`}>
              {user?.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-bold text-white truncate">{user?.name}</div>
              <div className="text-[10px] text-neutral-400 uppercase tracking-widest">{user?.role}</div>
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg bg-neutral-800 hover:bg-red-950/30 hover:text-red-400 text-neutral-400 transition-all text-xs font-semibold border border-transparent hover:border-red-900/50"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );
};
