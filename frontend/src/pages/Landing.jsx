import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ChevronRight, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Cpu, 
  Target,
  BarChart3,
  Video,
  Layers,
  ArrowUpRight
} from 'lucide-react';

const Landing = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="min-h-screen bg-black text-foreground selection:bg-primary/30 font-sans bg-grid">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 px-6 py-2.5">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto glass rounded-full px-6 py-3 flex items-center justify-between border border-foreground/10"
        >
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.4)]">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="font-sansDisplay font-bold text-lg tracking-tighter">INTERVIEW_AI</span>
          </div>
          
          <div className="hidden md:flex items-center gap-4 text-xs font-bold tracking-widest uppercase text-muted-foreground">
            <a href="#features" className="hover:text-primary hover:text-glow transition-all">01_FEATURES</a>
            <a href="#solutions" className="hover:text-primary hover:text-glow transition-all">02_SOLUTIONS</a>
            <a href="#pricing" className="hover:text-primary hover:text-glow transition-all">03_PRICING</a>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="text-xs font-bold tracking-widest uppercase hover:text-primary transition-colors">LOGIN</Link>
            <Link to="/register" className="btn-primary py-2.5 px-6 text-xs font-bold tracking-widest uppercase">GET_STARTED</Link>
          </div>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-44 pb-32 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full opacity-50"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-400/5 blur-[150px] rounded-full opacity-30"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center text-center"
          >
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-foreground/5 border border-foreground/10 mb-10"
            >
              <div className="flex gap-1">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-1 h-3 bg-primary/40 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
              <span className="text-sm font-black tracking-[0.3em] uppercase text-primary">SYSTEM_READY_V4.0</span>
            </motion.div>

            <motion.h1 
              variants={itemVariants}
              className="text-lg md:text-8xl lg:text-[10rem] font-sansDisplay font-black leading-[0.9] mb-10 tracking-[-0.06em]"
            >
              TRAIN WITH <br />
              <span className="text-primary text-glow italic">THE_MACHINE.</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="max-w-2xl text-lg md:text-xl text-muted-foreground mb-16 leading-relaxed font-medium"
            >
              Strategic career intelligence for elite candidates. Reverse-engineer interview cycles with low-latency AI feedback and predictive ATS optimization.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center gap-3"
            >
              <Link to="/register" className="btn-primary text-base px-12 py-2 flex items-center gap-3 group">
                INITIALIZE_ENROLLMENT
                <ArrowUpRight className="h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
              <Link to="/demo" className="btn-secondary text-base px-12 py-2">
                VIEW_SIMULATION
              </Link>
            </motion.div>
          </motion.div>

          {/* Stats Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 1 }}
            className="mt-32 grid grid-cols-2 md:grid-cols-4 gap-1 border-y border-foreground/5"
          >
            {[
              { label: 'SIMULATIONS_RUN', value: '142K+' },
              { label: 'RESUMES_AUDITED', value: '89K+' },
              { label: 'AVG_SCORE_INC', value: '42%' },
              { label: 'SUCCESS_RATE', value: '96.4%' },
            ].map((stat, idx) => (
              <div key={idx} className="py-10 px-8 text-center md:text-left border-x border-foreground/5 bg-foreground/[0.01]">
                <p className="text-sm font-black tracking-widest text-muted-foreground uppercase mb-2">{stat.label}</p>
                <h4 className="text-xl font-sansDisplay font-bold text-foreground tracking-tighter">{stat.value}</h4>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <FeatureCard 
              icon={<Target className="h-6 w-6" />}
              title="ATS_INVERSION"
              desc="Proprietary algorithm that maps your resume against 500+ corporate ATS logic gates."
              index={1}
            />
            <FeatureCard 
              icon={<Video className="h-6 w-6" />}
              title="QUANTUM MOCK"
              desc="Simulated rooms with dynamic stress testing and real-time behavioral sentiment mapping."
              index={2}
            />
            <FeatureCard 
              icon={<BarChart3 className="h-6 w-6" />}
              title="NEURAL_ANALYTICS"
              desc="Get granular data on vocal clarity, confidence metrics, and technical keyword density."
              index={3}
            />
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 blur-[120px] rounded-full"></div>
        <div className="max-w-4xl mx-auto glass p-16 rounded-[1.5rem] text-center border-foreground/10 relative z-10">
          <h2 className="text-lg md:text-lg font-sansDisplay font-black mb-8 tracking-tight uppercase">Ready for the Next Cycle?</h2>
          <p className="text-muted-foreground text-lg mb-12 max-w-xl mx-auto">
            Secure your advantage before the next application window opens. Join 50,000+ engineers training for the top tier.
          </p>
          <Link to="/register" className="btn-primary text-lg px-8 py-2 uppercase font-bold tracking-widest">JOIN_THE_MACHINE</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-foreground/5 bg-[#050505]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/20 border border-primary/20 rounded-lg flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <span className="font-sansDisplay font-bold text-xl tracking-tighter">INTERVIEW_AI</span>
          </div>
          
          <div className="flex gap-3 text-sm font-black tracking-[0.2em] text-muted-foreground uppercase">
            <a href="#" className="hover:text-white transition-colors">TERMINAL_STATUS:ONLINE</a>
            <a href="#" className="hover:text-white transition-colors">PRIVACY_PROTOCOL</a>
            <a href="#" className="hover:text-white transition-colors">SYSTEM_TERMS</a>
          </div>

          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest opacity-40">
            © 2026 INTERVIEW_AI_CORP // DATA_SECURED
          </p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc, index }) => (
  <motion.div 
    whileHover={{ y: -8, borderColor: 'rgba(59, 130, 246, 0.3)' }}
    className="glass-card p-4 rounded-2xl relative group"
  >
    <div className="absolute top-4 right-8 text-sm font-black text-foreground/10 group-hover:text-primary/20 transition-colors">0{index}</div>
    <div className="w-14 h-14 bg-foreground/5 rounded-2xl flex items-center justify-center mb-8 border border-foreground/5 group-hover:bg-primary group-hover:text-white transition-all duration-500">
      {icon}
    </div>
    <h3 className="text-xl font-sansDisplay font-bold mb-4 tracking-tight uppercase group-hover:text-primary transition-colors">{title}</h3>
    <p className="text-muted-foreground text-sm leading-relaxed font-medium group-hover:text-white transition-colors duration-300">
      {desc}
    </p>
  </motion.div>
);

export default Landing;
