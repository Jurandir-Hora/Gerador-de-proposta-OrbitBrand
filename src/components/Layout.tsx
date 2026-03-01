import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Video,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/proposals', icon: FileText, label: 'Propostas' },
    { to: '/templates', icon: FileText, label: 'Templates' },
    { to: '/analytics', icon: BarChart3, label: 'Análises' },
    { to: '/settings', icon: Settings, label: 'Configurações' },
  ];

  const handleLogout = () => {
    logout();
    setSidebarOpen(false);
  };

  const sidebarBase =
    'fixed inset-y-0 left-0 z-40 w-64 bg-black text-white flex flex-col transform transition-transform duration-200 md:static md:translate-x-0';
  const sidebarTranslate = sidebarOpen
    ? 'translate-x-0'
    : '-translate-x-full md:translate-x-0';

  return (
    <div className="h-screen bg-neutral-50 text-neutral-900 font-sans md:flex print:bg-white">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden print:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar / Navegação */}
      <aside className={`${sidebarBase} ${sidebarTranslate} print:hidden`}>
        <div className="p-6 flex items-center space-x-3 border-b border-neutral-800">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white text-black">
            <span className="absolute -left-1 text-[22px] font-serif leading-none">O</span>
            <span className="absolute left-2 text-[22px] font-serif leading-none">B</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold tracking-[0.3em] uppercase">Orbit Brand</p>
            <p className="text-[10px] text-neutral-400 tracking-[0.22em] uppercase">
              Filmmaking · Mobile · Social · Foto · Eventos
            </p>
          </div>
          <button
            type="button"
            className="ml-2 text-neutral-500 hover:text-white md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-neutral-100 text-black font-semibold'
                    : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
                }`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-neutral-800">
          {user && (
            <div className="px-4 pb-3 text-xs text-neutral-400">
              <p className="font-semibold text-white text-sm">{user.name}</p>
              <p className="truncate">{user.email}</p>
            </div>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-2.5 w-full text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-lg text-sm transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <main className="h-full flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-4 md:px-8 print:hidden">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-lg bg-neutral-100 text-neutral-700 hover:bg-neutral-200 md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-neutral-500">
              <Video className="w-4 h-4" />
              <span className="hidden sm:inline">Gerador de Propostas Orbit Brand</span>
              <span className="sm:hidden">Orbit Brand</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center text-[11px] font-semibold text-white">
              OB
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-neutral-900">
                {user?.name || 'Produtor Orbit'}
              </p>
              <p className="text-[11px] text-neutral-500">Filmmaking &amp; Social Media</p>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto bg-neutral-50 p-4 md:p-8 print:p-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
