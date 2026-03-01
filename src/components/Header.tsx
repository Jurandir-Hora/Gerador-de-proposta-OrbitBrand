import React from 'react';
import { Bell, Search, User } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
      <div className="flex items-center w-96 relative">
        <Search className="w-5 h-5 text-gray-400 absolute left-3" />
        <input 
          type="text" 
          placeholder="Search proposals, clients..." 
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <div className="flex items-center space-x-6">
        <button className="relative text-gray-500 hover:text-gray-700">
          <Bell className="w-6 h-6" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="w-5 h-5 text-gray-600" />
          </div>
        </button>
      </div>
    </header>
  );
};
