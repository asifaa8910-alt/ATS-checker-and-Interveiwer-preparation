import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { AlertCircle, Lock, Mail, User, Loader2, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import ThemeToggle from '../../components/ThemeToggle';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  const { register, isAuthenticated, error, loading, setError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setError(null);
  }, [setError]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!name || !email || !password || !confirmPassword) {
      setFormError('Complete profile indexing required.');
      return;
    }
    if (password.length < 6) {
      setFormError('Passphrase entropy insufficient.');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Passphrase mismatch detected.');
      return;
    }

    const res = await register(name, email, password);
    if (res && res.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-black grid grid-cols-1 lg:grid-cols-2 selection:bg-primary/30 font-sans overflow-hidden">
      
      {/* Visual Column */}
      <div className="hidden lg:flex flex-col justify-between p-10 relative overflow-hidden border-r border-foreground/5 bg-background">
        <div className="absolute inset-0 bg-grid opacity-20"></div>
        
        <motion.div 
          animate={{ 
            scale: [1, 1.15, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute -bottom-20 -right-20 w-[600px] h-[600px] bg-blue-600/10 blur-[130px] rounded-full"
        />
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-[0_0_25px_rgba(59,130,246,0.5)]">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <span className="font-sansDisplay font-black text-lg tracking-tighter uppercase text-white">INTERVIEW_AI</span>
        </div>

        <div className="relative z-10 space-y-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-7xl lg:text-[7rem] font-sansDisplay font-black leading-[0.85] tracking-tighter uppercase mb-8 text-white">
              Join the <br />
              <span className="text-primary text-glow italic">Machine.</span>
            </h1>
            <p className="text-muted-foreground text-xl font-medium leading-relaxed max-w-md">
              Initialize your candidate profile to begin the strategic optimization of your career trajectory.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <p className="text-sm font-black tracking-widest text-foreground/60 uppercase">ACTIVE_MODELS</p>
              <p className="text-lg font-sansDisplay font-bold text-foreground tracking-tight">GPT_4o_MINI</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-black tracking-widest text-foreground/60 uppercase">LATENCY_RATE</p>
              <p className="text-lg font-sansDisplay font-bold text-foreground tracking-tight">142_MS</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex justify-between items-center text-xs font-black tracking-[0.3em] text-foreground/20 uppercase">
          <span>SECURE_ENROLLMENT_V4.2.0</span>
          <span>LOCATION_NODE: GLOBAL_CDN</span>
        </div>
      </div>

      {/* Form Column */}
      <div className="flex flex-col justify-center px-8 sm:px-24 lg:px-40 relative bg-black overflow-y-auto py-20">
        <div className="absolute top-4 right-10 z-20 scale-125 opacity-50 hover:opacity-100 transition-opacity">
          <ThemeToggle />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-md w-full mx-auto space-y-10"
        >
          <header className="space-y-4">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-foreground/5 border border-foreground/5 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
              <span className="text-sm font-black tracking-[0.2em] text-primary uppercase">CANDIDATE_INITIALIZATION</span>
            </div>
            <h2 className="text-xl font-sansDisplay font-black tracking-tight uppercase text-white">ENROLL NOW</h2>
            <p className="text-muted-foreground text-base font-medium">Create your neural profile and start training.</p>
          </header>

          {(formError || error) && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-4 p-3 text-sm font-black tracking-widest text-rose-500 bg-rose-500/[0.03] rounded-2xl border border-rose-500/20 uppercase"
            >
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{formError || error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 group">
              <label className="text-sm font-black tracking-[0.2em] text-foreground/50 uppercase ml-2 group-focus-within:text-primary transition-colors">FULL_NAME</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-5 flex items-center text-foreground/20 group-focus-within:text-primary transition-colors">
                  <User className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="EX. JOHN DOE"
                  className="w-full bg-foreground/[0.03] border border-foreground/10 rounded-[1.5rem] py-2.5 pl-14 pr-6 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-white/5 text-foreground uppercase"
                />
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="text-sm font-black tracking-[0.2em] text-foreground/50 uppercase ml-2 group-focus-within:text-primary transition-colors">IDENTITY EMAIL</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-5 flex items-center text-foreground/20 group-focus-within:text-primary transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="NAME@DOMAIN.COM"
                  className="w-full bg-foreground/[0.03] border border-foreground/10 rounded-[1.5rem] py-2.5 pl-14 pr-6 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-white/5 text-foreground uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 group">
                <label className="text-sm font-black tracking-[0.2em] text-foreground/50 uppercase ml-2 group-focus-within:text-primary transition-colors">ACCESS_KEY</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-5 flex items-center text-foreground/20 group-focus-within:text-primary transition-colors">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-foreground/[0.03] border border-foreground/10 rounded-[1.5rem] py-2.5 pl-14 pr-6 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-white/5 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2 group">
                <label className="text-sm font-black tracking-[0.2em] text-foreground/50 uppercase ml-2 group-focus-within:text-primary transition-colors">CONFIRM_KEY</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-5 flex items-center text-foreground/20 group-focus-within:text-primary transition-colors">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-foreground/[0.03] border border-foreground/10 rounded-[1.5rem] py-2.5 pl-14 pr-6 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-white/5 text-white"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-2 rounded-[1.5rem] text-sm font-black tracking-[0.3em] flex items-center justify-center gap-3 group uppercase"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  INITIALIZING_PROFILE...
                </>
              ) : (
                <>
                  INITIALIZE_ENROLLMENT
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          <footer className="pt-8 border-t border-foreground/5">
            <p className="text-xs font-bold text-foreground/60 uppercase tracking-widest text-center">
              ALREADY_ENROLLED?{' '}
              <Link to="/login" className="text-primary font-black ml-2 hover:text-white transition-colors underline-offset-4 hover:underline">SIGN_IN</Link>
            </p>
          </footer>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
