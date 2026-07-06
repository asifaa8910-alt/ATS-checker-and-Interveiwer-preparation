import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, LogOut, Terminal, Bell, Activity, Search } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="h-20 px-8 flex items-center justify-between sticky top-0 z-40 bg-background/80 backdrop-blur-[24px] border-b border-foreground/5 selection:bg-primary/30">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.4)] group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-black text-lg tracking-tighter uppercase text-foreground group-hover:text-glow transition-all">INTERVIEW AI</span>
            <span className="text-sm font-black tracking-[0.4em] text-primary mt-[-4px]">EXECUTIVE SUITE V4</span>
          </div>
        </div>

        {/* Global Search Interface */}
        <div className="hidden xl:flex items-center gap-4 px-5 py-2.5 rounded-2xl glass border-foreground/5 w-96 group focus-within:border-primary/30 transition-all">
          <Search className="h-4 w-4 text-foreground/20 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="EXECUTE SYSTEM SEARCH..." 
            className="bg-transparent border-none text-xs font-black tracking-widest text-foreground placeholder:text-foreground/20 focus:ring-0 w-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-4 pr-8 border-r border-foreground/5">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></div>
              <span className="text-sm font-black tracking-widest text-emerald-500 uppercase">ENGINE READY</span>
            </div>
            <span className="text-sm font-bold text-foreground/30 tracking-tighter">NODE: US_EAST_1</span>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 text-blue-400">
              <Activity className="h-3 w-3" />
              <span className="text-sm font-black tracking-widest uppercase">LATENCY: 38MS</span>
            </div>
            <span className="text-sm font-bold text-foreground/30 tracking-tighter">Q COMPUTE ACTIVE</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-3 rounded-2xl hover:bg-foreground/5 text-foreground/30 hover:text-foreground transition-all relative group">
            <Bell className="h-5 w-5 group-hover:scale-110 transition-transform" />
            <span className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full border-2 border-background"></span>
          </button>
          <div className="ml-2 scale-110 opacity-40 hover:opacity-100 transition-opacity">
            <ThemeToggle />
          </div>
        </div>

        {user && (
          <button
            onClick={logout}
            className="group flex items-center gap-4 pl-8 border-l border-foreground/5 py-2"
          >
            <div className="flex flex-col text-right">
              <span className="text-xs font-black tracking-widest text-foreground uppercase group-hover:text-primary transition-colors">{user.name.split(' ')[0]}</span>
              <span className="text-sm font-bold text-foreground/30 tracking-tighter uppercase">{user.role} ACCESS</span>
            </div>
            <div className="p-3 rounded-2xl bg-rose-500/5 border border-rose-500/10 text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-all duration-300">
              <LogOut className="h-5 w-5" />
            </div>
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
