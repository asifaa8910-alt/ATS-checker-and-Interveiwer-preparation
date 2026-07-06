import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';
import { Settings as SettingsIcon, Loader2, Sparkles, Volume2, ShieldAlert, CheckCircle, Activity, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const [dbSettings, setDbSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchSettings = async () => {
    try {
      const res = await axios.get('/api/settings');
      if (res.data.success) {
        setDbSettings(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSettingField = async (field, value) => {
    setSaving(true);
    setMsg('');
    try {
      const res = await axios.put('/api/settings', {
        ...dbSettings,
        [field]: value,
      });
      if (res.data.success) {
        setDbSettings(res.data.data);
        setMsg('SETTINGS SYNCHRONIZED');
        setTimeout(() => setMsg(''), 2000);
      }
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleThemeChange = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    toggleTheme(); // Update context & html tag class
    updateSettingField('theme', nextTheme);
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs font-black tracking-[0.4em] text-foreground/30 uppercase">INITIALIZING VISUAL PARAMS...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 max-w-4xl mx-auto animate-fadeIn relative pb-12">
      {/* Decorative Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[300px] h-[300px] bg-primary/5 blur-[80px] rounded-full pointer-events-none -z-10" />

      {/* Title */}
      <div className="flex items-center justify-between border-b border-foreground/5 pb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 glass flex items-center justify-center rounded-2xl border-foreground/5 bg-primary/10 text-primary">
            <SettingsIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-sansDisplay text-xl font-black tracking-tight text-foreground uppercase">SYSTEM CONFIG</h1>
            <p className="text-xs font-black tracking-widest text-foreground/30 uppercase mt-1">Configure preference modules and interview variables</p>
          </div>
        </div>
      </div>

      {msg && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-2xl text-xs font-black tracking-widest uppercase flex items-center gap-2"
        >
          <CheckCircle className="h-4.5 w-4.5" /> {msg}
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2 space-y-6">
          {/* Settings Group */}
          <div className="glass rounded-2xl border-foreground/5 overflow-hidden divide-y divide-foreground/5 bg-foreground/[0.01]">
            
            {/* Theme Selector */}
            <div className="p-3 flex items-center justify-between gap-4 hover:bg-foreground/[0.01] transition-colors">
              <div className="space-y-1.5">
                <span className="text-xs font-black tracking-[0.2em] text-primary uppercase block">VISUAL ENGINE</span>
                <h3 className="font-sansDisplay font-bold text-base text-foreground">Interface Theme</h3>
                <p className="text-xs text-foreground/50 leading-relaxed max-w-sm">Adjust display parameters between absolute black dark mode and parchment light mode.</p>
              </div>
              <button 
                onClick={handleThemeChange}
                className="btn-secondary py-3 px-6 text-xs font-black tracking-widest uppercase shrink-0"
              >
                SWITCH TO {theme === 'dark' ? 'LIGHT' : 'DARK'}
              </button>
            </div>

            {/* Speech Recognition */}
            <div className="p-3 flex items-center justify-between gap-4 hover:bg-foreground/[0.01] transition-colors">
              <div className="space-y-1.5">
                <span className="text-xs font-black tracking-[0.2em] text-primary uppercase block">AUDIO MODULE</span>
                <h3 className="font-sansDisplay font-bold text-base text-foreground">Speech Inputs</h3>
                <p className="text-xs text-foreground/50 leading-relaxed max-w-sm">Enable vocal recognition and audio analysis layers in interactive simulation rooms.</p>
              </div>
              <button 
                onClick={() => updateSettingField('speechEnabled', !dbSettings?.speechEnabled)}
                className={`py-3 px-6 text-xs font-black tracking-widest uppercase rounded-full border transition-all duration-300 shrink-0 ${
                  dbSettings?.speechEnabled
                    ? 'bg-primary text-white border-primary shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:brightness-110'
                    : 'bg-foreground/5 text-foreground border-foreground/10 hover:bg-foreground/10'
                }`}
              >
                {dbSettings?.speechEnabled ? 'ACTIVE' : 'DEACTIVATED'}
              </button>
            </div>

            {/* Simulator Difficulty */}
            <div className="p-3 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-foreground/[0.01] transition-colors">
              <div className="space-y-1.5">
                <span className="text-xs font-black tracking-[0.2em] text-primary uppercase block">SIMULATOR LEVEL</span>
                <h3 className="font-sansDisplay font-bold text-base text-foreground">Difficulty Preference</h3>
                <p className="text-xs text-foreground/50 leading-relaxed max-w-sm">Calibrate core questioning depth and response timeframe tolerances.</p>
              </div>
              
              <div className="flex gap-2 bg-foreground/5 border border-foreground/5 p-1 rounded-full shrink-0">
                {['easy', 'medium', 'hard'].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => updateSettingField('difficultyPref', diff)}
                    className={`px-5 py-2.5 rounded-full text-xs font-black tracking-widest uppercase transition-all duration-300 ${
                      dbSettings?.difficultyPref === diff
                        ? 'bg-primary text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                        : 'text-foreground/40 hover:text-foreground hover:bg-foreground/5'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Diagnostic Sidebar */}
        <div className="space-y-6">
          <div className="glass p-3 rounded-2xl border-foreground/5 bg-foreground/[0.01] space-y-6">
            <div className="flex items-center gap-2 border-b border-foreground/5 pb-4">
              <Cpu className="h-4 w-4 text-foreground/30" />
              <h3 className="text-xs font-black tracking-[0.25em] text-foreground/30 uppercase">AI ENGINE INFO</h3>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-foreground/[0.02] rounded-2xl border border-foreground/5 flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-foreground/20 tracking-widest block uppercase">ACTIVE LLM</span>
                  <span className="text-xs font-bold text-foreground">Gemini 1.5 Flash</span>
                </div>
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              </div>

              <div className="p-4 bg-foreground/[0.02] rounded-2xl border border-foreground/5 flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-foreground/20 tracking-widest block uppercase">SYSTEM LATENCY</span>
                  <span className="text-xs font-bold text-emerald-500">38ms // Nominal</span>
                </div>
                <Activity className="h-5 w-5 text-emerald-500/50" />
              </div>
            </div>
            
            <p className="text-sm font-bold text-foreground/10 uppercase tracking-widest leading-relaxed text-center">
              SECURE TLS TUNNEL // STABLE STATE
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
