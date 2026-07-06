import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  Video,
  BarChart3,
  User,
  Settings,
  ShieldCheck,
  Cpu,
  Terminal,
  Activity,
  Fingerprint
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();

  const navItems = user && user.role === 'admin'
    ? [
        { to: '/admin', label: 'ROOT ACCESS', icon: ShieldCheck },
      ]
    : [
        { to: '/dashboard', label: 'OVERVIEW', icon: LayoutDashboard },
        { to: '/resume', label: 'ATS AUDIT', icon: FileText },
        { to: '/interview', label: 'QUANTUM MOCK', icon: Video },
        { to: '/performance', label: 'NEURAL METRICS', icon: BarChart3 },
        { to: '/profile', label: 'IDENTITY', icon: Fingerprint },
        { to: '/settings', label: 'SYSTEM CONFIG', icon: Settings },
      ];

  return (
    <aside className="sticky top-28 h-[calc(100vh-10rem)] w-20 md:w-64 z-30 transition-all duration-500 shrink-0">
      <div className="h-full glass rounded-[1.5rem] p-3 md:p-3 flex flex-col gap-4 border-foreground/5 backdrop-blur-[40px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] relative overflow-hidden bg-card/40">
        {/* Decorative Internal Glow */}
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-primary/5 blur-[80px] rounded-full pointer-events-none" />

        <div className="px-4 py-2.5 hidden md:flex items-center gap-2 border-b border-foreground/5 mb-2">
          <Activity className="h-3 w-3 text-primary animate-pulse" />
          <span className="text-xs font-black tracking-[0.4em] text-foreground/50 uppercase">NAV TERMINAL</span>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-4 p-4 md:px-6 md:py-2.5 rounded-xl text-sm font-black tracking-[0.15em] transition-all duration-300 group relative ${
                    isActive
                      ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_30px_rgba(59,130,246,0.1)]'
                      : 'text-foreground/60 hover:bg-foreground/5 hover:text-foreground border border-transparent'
                  }`
                }
              >
                <Icon className="h-5 w-5 flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3" />
                <span className="hidden md:block uppercase">{item.label}</span>
                
                <NavLink to={item.to}>
                  {({ isActive }) => isActive && (
                    <motion.div 
                      layoutId="activeIndicator"
                      className="absolute left-2 w-1 h-4 bg-primary rounded-full hidden md:block"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </NavLink>
              </NavLink>
            );
          })}
        </div>

        {user && (
          <div className="mt-auto pt-4 border-t border-foreground/5">
            <div className="p-2 md:p-3 bg-foreground/[0.03] rounded-xl border border-foreground/5 group cursor-pointer hover:border-primary/20 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-[1.25rem] glass flex items-center justify-center border-foreground/10 overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                  <img src={`https://i.pravatar.cc/150?u=${user.email}`} alt="Avatar" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="hidden md:block flex-1 min-w-0">
                  <p className="text-sm font-black tracking-[0.2em] text-primary uppercase mb-0.5 truncate">ACTIVE IDENTITY</p>
                  <p className="text-xs font-bold text-foreground truncate tracking-wider">{user.name.toUpperCase()}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
