import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  PlusSquare, 
  BarChart3, 
  Settings,
  Aperture
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const links = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/templates', icon: PlusSquare, label: 'New Proposal' },
    { to: '/proposals', icon: FileText, label: 'My Proposals' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/settings', icon: Settings, label: 'Settings' },
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
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
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

      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
            OB
          </div>
          <div>
            <div className="text-sm font-medium text-white">Orbit Brand Admin</div>
            <div className="text-xs text-gray-400">Pro Plan</div>
          </div>
        </div>
      </div>
    </div>
  );
};
