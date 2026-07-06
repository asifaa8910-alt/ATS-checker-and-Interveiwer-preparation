import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Video, 
  ChevronRight, 
  Sparkles, 
  Award, 
  Activity, 
  TrendingUp,
  Loader2,
  AlertCircle,
  ShieldCheck,
  Zap,
  Cpu,
  Target,
  Layers,
  ArrowUpRight,
  Terminal,
  BrainCircuit,
  Fingerprint
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardStats = async () => {
    try {
      const res = await axios.get('/api/analytics');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard statistics:', err);
      setError('System analytics node offline.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-8">
        <div className="relative flex items-center justify-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="w-24 h-24 border-t-2 border-primary border-dashed rounded-full"
          />
          <Cpu className="absolute h-8 w-8 text-primary animate-pulse shadow-primary/50 shadow-2xl" />
        </div>
        <div className="text-center space-y-3">
          <p className="text-xs font-black tracking-[0.5em] text-primary uppercase ml-[0.5em]">SYNCHRONIZING NEURAL NODES</p>
          <p className="text-xs text-foreground/30 font-bold uppercase tracking-widest">Latency optimization in progress...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'ATS AUDIT INDEX',
      value: stats?.latestATSScore > 0 ? `${stats.latestATSScore}%` : '00.0',
      description: 'SCAN COEFFICIENT',
      icon: Target,
      color: 'text-blue-400',
      action: () => navigate('/resume')
    },
    {
      title: 'SIMULATION CYCLES',
      value: stats?.totalInterviews > 0 ? `${stats.totalInterviews.toString().padStart(2, '0')}` : '00',
      description: 'SESSIONS LOGGED',
      icon: Video,
      color: 'text-indigo-400',
      action: () => navigate('/interview')
    },
    {
      title: 'NEURAL CONFIDENCE',
      value: stats?.averageInterviewScore > 0 ? `${stats.averageInterviewScore}%` : '00.0',
      description: 'PERFORMANCE METRIC',
      icon: BrainCircuit,
      color: 'text-cyan-400',
      action: () => navigate('/performance')
    },
    {
      title: 'ELITE THRESHOLD',
      value: stats?.bestInterviewScore > 0 ? `${stats.bestInterviewScore}%` : '00.0',
      description: 'PEAK PERFORMANCE',
      icon: TrendingUp,
      color: 'text-primary',
      action: () => navigate('/performance')
    }
  ];

  return (
    <div className="space-y-12 animate-fadeIn pb-32">
      
      {/* Executive Welcome Header */}
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-3 border-b border-foreground/5 pb-12">
        <div className="space-y-5">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-primary/5 border border-primary/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]"
          >
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-black tracking-[0.3em] text-primary uppercase">EXECUTIVE DASHBOARD LIVE V4.2</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl lg:text-lg font-sansDisplay font-black tracking-tighter uppercase text-foreground leading-[0.85]"
          >
            WELCOME, <br />
            <span className="text-primary italic text-glow">{user?.name.toUpperCase()}</span>
          </motion.h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block border-r border-foreground/5 pr-8">
            <p className="text-xs font-black tracking-[0.2em] text-foreground/50 uppercase mb-1">SYSTEM RELIABILITY</p>
            <p className="text-sm font-bold text-foreground uppercase tracking-widest">99.98% OPERATIONAL</p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileActive={{ scale: 0.95 }}
            onClick={() => navigate('/interview')}
            className="btn-primary py-2 px-6 text-xs font-black tracking-[0.2em] uppercase flex items-center gap-4 rounded-2xl"
          >
            INIT NEW TRAINING CYCLE
            <ArrowUpRight className="h-5 w-5" />
          </motion.button>
        </div>
      </header>

      {/* Main Grid: Bento-style with Masonry Logic */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column: Core Stats (Spans 8) */}
        <div className="lg:col-span-8 space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {statCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 + 0.3 }}
                  whileHover={{ y: -6, borderColor: 'rgba(59, 130, 246, 0.4)' }}
                  onClick={card.action}
                  className="glass-card p-4 rounded-2xl flex flex-col justify-between h-40 cursor-pointer relative overflow-hidden group"
                >
                  <div className="absolute -right-6 -bottom-6 opacity-[0.02] group-hover:opacity-[0.06] transition-opacity group-hover:scale-110 duration-700">
                    <Icon className="w-48 h-48 text-foreground" />
                  </div>
                  
                  <div className="flex items-start justify-between relative z-10">
                    <div className="w-14 h-14 rounded-2xl glass flex items-center justify-center border-foreground/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                      <Icon className="h-7 w-7" />
                    </div>
                    <div className="text-xs font-black text-foreground/40 tracking-widest uppercase">0{idx + 1}</div>
                  </div>
                  
                  <div className="relative z-10">
                    <p className="text-xs font-black tracking-[0.25em] text-foreground/60 uppercase mb-2">{card.title}</p>
                    <h3 className="text-xl font-sansDisplay font-black text-foreground tracking-tighter mb-3 leading-none">{card.value}</h3>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-1 bg-foreground/10 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: '70%' }}
                          transition={{ duration: 1.5, delay: idx * 0.2 + 0.5 }}
                          className="h-full bg-primary shadow-[0_0_10px_#3B82F6]"
                        />
                      </div>
                      <p className="text-sm font-bold text-foreground/55 uppercase tracking-[0.2em]">{card.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Featured Action: Simulation Launch */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="glass-card p-3 rounded-[1.5rem] relative overflow-hidden group border-foreground/10 bg-gradient-to-br from-card to-background"
          >
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full -mr-40 -mt-40 group-hover:bg-primary/10 transition-colors duration-700"></div>
            <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-3">
              <div className="space-y-6 max-w-xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[1.25rem] glass flex items-center justify-center border-primary/30 shadow-[0_0_20px_rgba(59,130,246,0.15)] group-hover:scale-110 transition-transform">
                    <Zap className="h-6 w-6 text-primary fill-primary/20" />
                  </div>
                  <h2 className="text-xl font-sansDisplay font-black text-foreground tracking-tight uppercase">ENGAGE QUANTUM ROOMS</h2>
                </div>
                <p className="text-foreground/60 text-base font-medium leading-relaxed uppercase tracking-tight">
                  Simulate high-stakes technical environments with real-time biometric sentiment mapping. Calibrate your performance before the elite recruiters scan.
                </p>
                <div className="flex flex-wrap gap-4">
                  {['NODE JS V21', 'SYSTEM ARCHITECTURE', 'BEHAVIORAL MODELING', 'EXECUTIVE STRATEGY'].map(tag => (
                    <span key={tag} className="text-sm font-black tracking-widest px-4 py-2 rounded-xl bg-foreground/5 border border-foreground/15 text-foreground/60 uppercase hover:text-primary hover:border-primary/30 transition-all cursor-default">{tag}</span>
                  ))}
                </div>
              </div>
              <button 
                onClick={() => navigate('/interview')}
                className="btn-primary px-8 py-2.5 text-xs font-black tracking-[0.3em] uppercase group whitespace-nowrap rounded-xl"
              >
                INITIALIZE SIM
              </button>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Terminal & Status (Spans 4) */}
        <div className="lg:col-span-4 space-y-10">
          {/* Neural status card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="glass p-4 rounded-[1.5rem] border-foreground/5 space-y-10 bg-foreground/[0.01] relative"
          >
            <div className="flex items-center justify-between border-b border-foreground/5 pb-6">
              <div className="flex items-center gap-3">
                <BrainCircuit className="h-5 w-5 text-primary" />
                <h3 className="text-xs font-black tracking-[0.4em] text-foreground uppercase">NEURAL DIAGNOSTIC</h3>
              </div>
              <div className="px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-500 text-xs font-black uppercase">LIVE SCAN</div>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm font-black tracking-widest">
                  <span className="text-foreground/60 uppercase">PRIMARY STRENGTH VECTOR</span>
                  <span className="text-emerald-400 uppercase font-sansDisplay tracking-tight text-sm">{stats?.strongestTopic || 'NONE'}</span>
                </div>
                <div className="w-full h-2 bg-foreground/5 rounded-full overflow-hidden p-[1px]">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: stats?.strongestTopic ? '88%' : '0%' }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm font-black tracking-widest">
                  <span className="text-foreground/60 uppercase">CORE VULNERABILITY</span>
                  <span className="text-rose-400 uppercase font-sansDisplay tracking-tight text-sm">{stats?.weakestTopic || 'NONE'}</span>
                </div>
                <div className="w-full h-2 bg-foreground/5 rounded-full overflow-hidden p-[1px]">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: stats?.weakestTopic ? '42%' : '0%' }}
                    className="h-full bg-gradient-to-r from-rose-500 to-orange-400 rounded-full shadow-[0_0_15px_rgba(244,63,94,0.4)]"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 grid grid-cols-3 gap-3">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className={`h-1.5 rounded-full ${i < 6 ? 'bg-primary/40' : 'bg-foreground/10'}`}></div>
                  <span className="text-xs font-bold text-foreground/20 uppercase block text-center">NODE {i+1}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Activity Feed Terminal */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="glass p-4 rounded-[1.5rem] border-foreground/5 flex flex-col h-[580px] bg-foreground/[0.01] relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-full bg-grid opacity-[0.03] pointer-events-none"></div>
            
            <div className="flex items-center justify-between mb-8 border-b border-foreground/5 pb-6 relative z-10">
              <div className="flex items-center gap-3">
                <Terminal className="h-5 w-5 text-foreground/30" />
                <h3 className="text-xs font-black tracking-[0.4em] text-foreground uppercase">CYCLE LOGS</h3>
              </div>
              <Fingerprint className="h-5 w-5 text-foreground/10" />
            </div>

            <div className="flex-1 space-y-8 overflow-y-auto custom-scrollbar pr-3 relative z-10">
              {stats?.recentActivity?.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-20 grayscale">
                  <Layers className="h-12 w-12 animate-pulse text-foreground" />
                  <p className="text-xs font-black tracking-[0.4em] uppercase leading-relaxed text-foreground">LISTENING FOR NEURAL STREAM...</p>
                </div>
              ) : (
                stats?.recentActivity?.map((act, idx) => (
                  <motion.div 
                    key={idx} 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 + 1 }}
                    className="flex gap-3 group cursor-default"
                  >
                    <div className="w-10 h-10 rounded-xl glass flex items-center justify-center shrink-0 border-foreground/5 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                      {act.type === 'resume_scan' ? <FileText className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                    </div>
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-4">
                        <h4 className="text-sm font-black text-foreground uppercase truncate tracking-tight">{act.title}</h4>
                        <span className="text-sm font-black text-foreground/50 uppercase whitespace-nowrap font-sansDisplay">{new Date(act.date).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs font-medium text-foreground/60 leading-relaxed uppercase tracking-tighter truncate">{act.meta}</p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            <button className="mt-10 w-full py-2 rounded-[1.5rem] bg-foreground/[0.03] border border-foreground/5 text-xs font-black tracking-[0.3em] text-foreground/30 uppercase hover:bg-foreground/10 hover:text-foreground transition-all duration-300 relative z-10">
              EXPORT DATA STREAM
            </button>
          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
