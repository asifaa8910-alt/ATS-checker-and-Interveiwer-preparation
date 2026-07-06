import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Bar, Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  Filler
} from 'chart.js';
import { 
  Loader2, 
  Award, 
  BarChart3, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  Activity,
  Cpu,
  Zap,
  Target,
  ArrowUpRight,
  ShieldCheck,
  BrainCircuit
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Performance = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get('/api/analytics');
      if (res.data.success) {
        setAnalytics(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load performance analytics:', err);
      setError('NEURAL_DATA_PIPELINE_OFFLINE');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-8">
        <div className="relative">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 border-t-2 border-primary rounded-full"
          />
          <BarChart3 className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-sm font-black tracking-[0.5em] text-primary uppercase ml-[0.5em]">AGGREGATING_NEURAL METRICS</p>
          <p className="text-xs text-foreground/50 font-bold uppercase tracking-widest">Optimizing data visualization nodes...</p>
        </div>
      </div>
    );
  }

  const strongAreas = analytics?.skillsPerformance?.filter(item => item.average >= 70) || [];
  const weakAreas = analytics?.skillsPerformance?.filter(item => item.average < 70 && item.count > 0) || [];

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { family: 'Space Grotesk', weight: 'bold', size: 12 },
        bodyFont: { family: 'Inter', size: 11 },
        padding: 12,
        cornerRadius: 12,
        borderColor: 'rgba(59, 130, 246, 0.2)',
        borderWidth: 1
      }
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        grid: { color: 'rgba(255, 255, 255, 0.03)' },
        ticks: { font: { weight: 'bold', size: 9 }, color: 'rgba(255, 255, 255, 0.2)' }
      },
      x: {
        grid: { display: false },
        ticks: { font: { weight: 'black', family: 'Space Grotesk', size: 10 }, color: 'rgba(255, 255, 255, 0.4)' }
      }
    }
  };

  const barChartData = {
    labels: analytics?.monthlyProgress?.map(item => item.month.toUpperCase()) || ['CURRENT'],
    datasets: [{
      data: analytics?.monthlyProgress?.map(item => item.average) || [0],
      backgroundColor: 'rgba(59, 130, 246, 0.3)',
      borderColor: '#3B82F6',
      borderWidth: 2,
      borderRadius: 12,
      hoverBackgroundColor: '#3B82F6'
    }]
  };

  const lineChartData = {
    labels: analytics?.monthlyProgress?.map(item => item.month.toUpperCase()) || ['CURRENT'],
    datasets: [{
      data: analytics?.monthlyProgress?.map(() => analytics.latestATSScore) || [0],
      fill: true,
      backgroundColor: 'rgba(59, 130, 246, 0.05)',
      borderColor: '#3B82F6',
      borderWidth: 3,
      tension: 0.4,
      pointRadius: 6,
      pointBackgroundColor: '#000000',
      pointBorderColor: '#3B82F6',
      pointBorderWidth: 2,
      pointHoverRadius: 8,
      pointHoverBackgroundColor: '#3B82F6'
    }]
  };

  return (
    <div className="space-y-12 animate-fadeIn pb-32 max-w-7xl mx-auto">
      
      {/* Title Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-foreground/5 pb-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-primary/5 border border-primary/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
            <BarChart3 className="h-3.5 w-3.5 text-primary" />
            <span className="text-sm font-black tracking-[0.4em] text-primary uppercase">NEURAL_ANALYTICS_V4.2</span>
          </div>
          <h1 className="text-xl lg:text-[6.5rem] font-sansDisplay font-black tracking-tighter uppercase text-foreground leading-[0.9]">
            PERFORMANCE_ <br />
            <span className="text-primary italic text-glow">METRICS.</span>
          </h1>
        </div>
        <p className="text-foreground/50 text-sm font-black uppercase tracking-[0.2em] max-w-[240px] text-right leading-loose border-l border-foreground/5 pl-8">
          REAL-TIME TELEMETRY OF YOUR COGNITIVE AND TECHNICAL INTERVIEW PERFORMANCE VECTORS.
        </p>
      </header>

      {/* Main Aggregates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { title: 'ATS AUDIT_COUNT', value: analytics?.totalResumes || 0, icon: Target, desc: 'TOTAL_FILES_INDEXED' },
          { title: 'PEAK_ATS_MATCH', value: analytics?.latestATSScore > 0 ? `${analytics.latestATSScore}%` : '00.0', icon: TrendingUp, desc: 'SYSTEM PARITY_INDEX' },
          { title: 'SIM_CYCLES_RUN', value: analytics?.totalInterviews || 0, icon: Cpu, desc: 'GRADED_SESSION_COUNT' },
          { title: 'AVG_SIM_RATING', value: analytics?.averageInterviewScore > 0 ? `${analytics.averageInterviewScore}%` : '00.0', icon: BrainCircuit, desc: 'AGGREGATE_PERFORMANCE' },
        ].map((card, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card p-3 rounded-2xl border-foreground/5 space-y-4 hover:border-primary/20 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-foreground/[0.03] flex items-center justify-center border border-foreground/5 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                <card.icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-black text-foreground/10 uppercase tracking-widest">0{idx + 1}</span>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-black tracking-[0.25em] text-foreground/50 uppercase">{card.title}</p>
              <h3 className="text-lg font-sansDisplay font-black text-foreground tracking-tighter tabular-nums">{card.value}</h3>
              <p className="text-xs font-bold text-foreground/10 uppercase tracking-widest pt-1">{card.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Visualization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-4 rounded-[1.5rem] border-foreground/10 space-y-10 bg-card/40 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-grid opacity-[0.03] pointer-events-none" />
          <div className="flex items-center justify-between relative z-10 border-b border-foreground/5 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_#3B82F6]" />
              <h3 className="text-sm font-black tracking-[0.4em] text-foreground uppercase">MOCK_PROGRESSION_STREAM</h3>
            </div>
            <span className="text-xs font-black text-foreground/20 uppercase tracking-widest">UNIT: PERCENTAGE</span>
          </div>
          <div className="h-80 relative z-10">
            <Bar data={barChartData} options={chartOptions} />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-4 rounded-[1.5rem] border-foreground/10 space-y-10 bg-card/40 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-grid opacity-[0.03] pointer-events-none" />
          <div className="flex items-center justify-between relative z-10 border-b border-foreground/5 pb-6">
            <div className="flex items-center gap-4 text-blue-400">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse shadow-[0_0_10px_#60A5FA]" />
              <h3 className="text-sm font-black tracking-[0.4em] uppercase">ATS_COEFFICIENT_TREND</h3>
            </div>
            <span className="text-xs font-black text-foreground/20 uppercase tracking-widest">UNIT: PARITY_SCORE</span>
          </div>
          <div className="h-80 relative z-10">
            <Line data={lineChartData} options={chartOptions} />
          </div>
        </motion.div>

      </div>

      {/* Strategic Diagnostic Vector Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass p-3 rounded-xl border-foreground/5 space-y-10 bg-emerald-500/[0.01] relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-3 opacity-[0.02] group-hover:opacity-[0.06] transition-opacity duration-1000 group-hover:scale-110">
            <ShieldCheck className="w-24 h-24 text-emerald-500" />
          </div>
          
          <div className="flex items-center gap-4 text-emerald-500 border-b border-emerald-500/10 pb-8 relative z-10">
            <div className="w-12 h-12 rounded-[1.25rem] bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black tracking-[0.4em] uppercase">NEURAL_STRENGTHS</h3>
              <p className="text-xs font-bold text-emerald-500/40 uppercase tracking-widest">RATING_THRESHOLD: &ge;70%</p>
            </div>
          </div>
          
          <div className="space-y-6 relative z-10">
            {strongAreas.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 opacity-20 grayscale">
                <Target className="h-10 w-10" />
                <p className="text-sm font-black tracking-[0.3em] uppercase">WAITING_FOR_DATA_VALIDATION</p>
              </div>
            ) : (
              strongAreas.map((item, idx) => (
                <div key={idx} className="group/item flex items-center justify-between p-4 rounded-xl bg-foreground/[0.02] border border-foreground/5 hover:border-emerald-500/30 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-emerald-500/30 group-hover/item:text-emerald-500 transition-colors uppercase">0{idx+1}</span>
                    <h4 className="text-sm font-black text-foreground/75 uppercase tracking-tighter group-hover/item:text-white transition-colors">{item.category} ROOMS</h4>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-1 bg-foreground/5 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]" style={{ width: `${item.average}%` }} />
                    </div>
                    <span className="text-xs font-sansDisplay font-black text-emerald-400 tabular-nums">{item.average}%_AVG</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass p-3 rounded-xl border-foreground/5 space-y-10 bg-rose-500/[0.01] relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-3 opacity-[0.02] group-hover:opacity-[0.06] transition-opacity duration-1000 group-hover:scale-110">
            <Zap className="w-24 h-24 text-rose-500" />
          </div>
          
          <div className="flex items-center gap-4 text-rose-500 border-b border-rose-500/10 pb-8 relative z-10">
            <div className="w-12 h-12 rounded-[1.25rem] bg-rose-500/10 flex items-center justify-center border border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.1)]">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black tracking-[0.4em] uppercase">SYSTEM_VULNERABILITIES</h3>
              <p className="text-xs font-bold text-rose-500/40 uppercase tracking-widest">RATING_THRESHOLD: &lt;70%</p>
            </div>
          </div>

          <div className="space-y-6 relative z-10">
            {weakAreas.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <CheckCircle className="h-8 w-8 text-emerald-500" />
                </div>
                <p className="text-sm font-black tracking-[0.3em] text-emerald-500 uppercase">NO_VULNERABILITIES_DETECTED</p>
              </div>
            ) : (
              weakAreas.map((item, idx) => (
                <div key={idx} className="group/item flex items-center justify-between p-4 rounded-xl bg-foreground/[0.02] border border-foreground/5 hover:border-rose-500/30 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-rose-500/30 group-hover/item:text-rose-500 transition-colors uppercase">0{idx+1}</span>
                    <h4 className="text-sm font-black text-foreground/75 uppercase tracking-tighter group-hover/item:text-white transition-colors">{item.category} ROOMS</h4>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-1 bg-foreground/5 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 shadow-[0_0_10px_#f43f5e]" style={{ width: `${item.average}%` }} />
                    </div>
                    <span className="text-xs font-sansDisplay font-black text-rose-400 tabular-nums">{item.average}%_AVG</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

      </div>

    </div>
  );
};

export default Performance;
