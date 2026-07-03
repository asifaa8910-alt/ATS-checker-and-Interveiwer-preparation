import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  Video,
  BarChart3,
  User,
  Settings,
  ShieldCheck,
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();

  const navItems = user && user.role === 'admin'
    ? [
        { to: '/admin', label: 'Admin Panel', icon: ShieldCheck },
      ]
    : [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/resume', label: 'Resume Analyzer', icon: FileText },
        { to: '/interview', label: 'Mock Interview', icon: Video },
        { to: '/performance', label: 'Analytics', icon: BarChart3 },
        { to: '/profile', label: 'Profile', icon: User },
        { to: '/settings', label: 'Settings', icon: Settings },
      ];

  return (
    <aside className="w-64 border-r border-secondary-foreground/10 bg-secondary text-secondary-foreground flex flex-col h-[calc(100vh-4rem)] sticky top-16 transition-colors duration-200">
      <div className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-[1.02]'
                    : 'text-slate-400 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {user && (
        <div className="p-4 border-t border-secondary-foreground/10 bg-black/20">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate text-slate-200">{user.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
