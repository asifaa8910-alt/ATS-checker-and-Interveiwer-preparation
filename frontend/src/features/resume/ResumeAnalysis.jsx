import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Upload, 
  Loader2, 
  CheckCircle, 
  AlertTriangle, 
  Sparkles, 
  Trash2, 
  Award,
  AlertCircle,
  FileSpreadsheet,
  Globe,
  ArrowRight,
  ShieldCheck,
  Zap,
  Target,
  Search,
  Cpu,
  Terminal,
  Layers,
  ArrowUpRight,
  Activity,
  Fingerprint
} from 'lucide-react';

const ResumeAnalysis = () => {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [error, setError] = useState('');
  const [uploadProgressMsg, setUploadProgressMsg] = useState('');

  const fetchHistory = async () => {
    try {
      const res = await axios.get('/api/resume/history');
      if (res.data.success) {
        setHistory(res.data.data);
        if (res.data.data.length > 0 && !currentAnalysis) {
          setCurrentAnalysis(res.data.data[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching resume history:', err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setError('');
    if (!selectedFile) return;

    const allowedExtensions = ['pdf', 'docx'];
    const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension)) {
      setError('INVALID_TYPE: PDF_OR_DOCX_REQUIRED');
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('OVERSIZE: 5MB_THRESHOLD_EXCEEDED');
      return;
    }
    setFile(selectedFile);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('IDENTITY_DOCUMENT_MISSING');
      return;
    }

    setLoading(true);
    setError('');
    
    const stages = [
      'INITIALIZING_EXTRACTION...',
      'AUDITING_SYNTAX_METRICS...',
      'PARSING_WORK_HISTORY...',
      'CALCULATING_ATS_COEFFICIENTS...',
      'MAPPING_JD_SIMILARITY...',
      'GENERATING_AI_INSIGHTS...'
    ];
    
    let stageIndex = 0;
    setUploadProgressMsg(stages[0]);
    const timer = setInterval(() => {
      if (stageIndex < stages.length - 1) {
        stageIndex++;
        setUploadProgressMsg(stages[stageIndex]);
      }
    }, 1500);

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobDescription', jobDescription);

    try {
      const res = await axios.post('/api/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setCurrentAnalysis(res.data.data);
        setFile(null);
        setJobDescription('');
        await fetchHistory();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'SCAN_INTERRUPTED_BY_SYSTEM');
    } finally {
      clearInterval(timer);
      setLoading(false);
      setUploadProgressMsg('');
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('TERMINATE_ANALYSIS_LOG?')) return;
    try {
      const res = await axios.delete(`/api/resume/${id}`);
      if (res.data.success) {
        setHistory(prev => prev.filter(item => item._id !== id));
        if (currentAnalysis?._id === id) setCurrentAnalysis(null);
      }
    } catch (err) {
      setError('DELETION_FAILURE');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-32">
      
      {/* Title Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-foreground/5 pb-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-primary/5 border border-primary/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
            <Target className="h-3.5 w-3.5 text-primary" />
            <span className="text-sm font-black tracking-[0.4em] text-primary uppercase">ATS INVERSION ENGINE LIVE</span>
          </div>
          <h1 className="text-xl lg:text-[6rem] font-sansDisplay font-black tracking-tighter uppercase text-foreground leading-[0.9]">
            RESUME_ <br />
            <span className="text-primary italic text-glow">OPTIMIZER.</span>
          </h1>
        </div>
        <p className="text-foreground/50 text-sm font-black uppercase tracking-[0.2em] max-w-[240px] text-right leading-loose border-l border-foreground/5 pl-8">
          REVERSE-ENGINEER RECRUITER FILTERS WITH STRATEGIC KEYWORD MAPPING AND STRUCTURAL AUDITING PROTOCOLS.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column: Command Input & Logs (Spans 4) */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Upload Console */}
          <div className="glass-card p-4 rounded-[1.5rem] border-foreground/10 space-y-4 bg-card/60 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Upload className="w-24 h-24 text-white" />
            </div>
            
            <div className="flex items-center gap-3 relative z-10">
              <Activity className="h-4 w-4 text-primary animate-pulse" />
              <h3 className="text-sm font-black tracking-[0.3em] text-foreground uppercase">COMMAND UPLOAD</h3>
            </div>
            
            <form onSubmit={handleUpload} className="space-y-5 relative z-10">
              <div className="relative group">
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  disabled={loading}
                />
                <div className={`p-4 rounded-2xl border-2 border-dashed transition-all duration-700 flex flex-col items-center text-center gap-4 ${file ? 'border-primary/50 bg-primary/10 shadow-[0_0_40px_rgba(59,130,246,0.1)]' : 'border-foreground/5 bg-foreground/[0.02] hover:border-foreground/20'}`}>
                  <div className={`w-16 h-16 rounded-[1.25rem] glass flex items-center justify-center border-foreground/10 transition-all duration-700 ${file ? 'bg-primary text-foreground shadow-[0_0_20px_#3B82F6]' : 'text-foreground/20'}`}>
                    {file ? <ShieldCheck className="h-8 w-8" /> : <FileText className="h-8 w-8" />}
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-black tracking-[0.2em] text-foreground uppercase">{file ? 'FILE_LOCKED_FOR_SCAN' : 'READY FOR DATA INPUT'}</p>
                    <p className="text-xs font-bold text-foreground/20 uppercase tracking-[0.1em]">{file ? file.name.toUpperCase() : 'PDF_OR_DOCX_UP_TO_5MB'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 group">
                <div className="flex justify-between items-center px-2">
                  <label className="text-sm font-black tracking-[0.25em] text-foreground/50 uppercase group-focus-within:text-primary transition-colors">TARGET JOB INDEX</label>
                  <Fingerprint className="h-4 w-4 text-foreground/5 group-focus-within:text-primary transition-colors" />
                </div>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={6}
                  placeholder="EXECUTE_JD_INPUT..."
                  className="w-full bg-foreground/[0.03] border border-foreground/10 rounded-xl p-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-white/5 text-foreground uppercase tracking-wider leading-relaxed custom-scrollbar"
                />
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 rounded-2xl bg-rose-500/[0.03] border border-rose-500/20 flex items-center gap-4"
                >
                  <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
                  <span className="text-sm font-black tracking-[0.15em] text-rose-500 uppercase">{error}</span>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading || !file}
                className="w-full btn-primary py-2.5 rounded-xl text-xs font-black tracking-[0.4em] flex items-center justify-center gap-4 group uppercase"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5" />
                    EXECUTING_DEEP_SCAN...
                  </>
                ) : (
                  <>
                    INITIALIZE AUDIT CYCLE
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <AnimatePresence>
              {loading && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="pt-6 border-t border-foreground/5 space-y-5"
                >
                  <div className="flex items-center justify-between text-sm font-black tracking-[0.3em] text-primary">
                    <span className="animate-pulse">PROCESSING_NODE_STREAM</span>
                    <span className="font-sansDisplay">{(Math.random() * 20 + 75).toFixed(2)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-foreground/5 rounded-full overflow-hidden p-[1px]">
                    <motion.div 
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      className="w-1/2 h-full bg-primary shadow-[0_0_20px_#3B82F6]"
                    />
                  </div>
                  <div className="flex gap-2 items-center justify-center">
                    <Terminal className="h-3 w-3 text-foreground/20" />
                    <p className="text-xs font-black text-foreground/60 uppercase tracking-widest">{uploadProgressMsg}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* History Terminal */}
          <div className="glass p-4 rounded-[1.5rem] border-foreground/5 flex flex-col bg-card/40 h-[520px] relative overflow-hidden">
            <div className="absolute inset-0 bg-grid opacity-[0.03] pointer-events-none"></div>
            
            <div className="flex items-center justify-between mb-8 border-b border-foreground/5 pb-6 relative z-10">
              <div className="flex items-center gap-3">
                <Terminal className="h-5 w-5 text-foreground/20" />
                <h3 className="text-sm font-black tracking-[0.4em] text-foreground uppercase">CYCLE LOGS</h3>
              </div>
              <span className="text-xs font-black text-foreground/10 uppercase tracking-widest">{history.length}_AUDITS</span>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-3 relative z-10">
              {history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-10 grayscale text-center space-y-6">
                  <Search className="h-14 w-14" />
                  <p className="text-sm font-black tracking-[0.4em] uppercase leading-loose">SYSTEM_HISTORY_NULL<br/>WAITING_FOR_INDEXING</p>
                </div>
              ) : (
                history.map((item, idx) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => setCurrentAnalysis(item)}
                    className={`group p-3 rounded-xl border transition-all duration-500 cursor-pointer flex items-center justify-between gap-3 relative overflow-hidden ${
                      currentAnalysis?._id === item._id 
                        ? 'bg-primary/10 border-primary/40 shadow-[0_0_30px_rgba(59,130,246,0.15)]' 
                        : 'bg-foreground/[0.01] border-foreground/5 hover:border-foreground/20 hover:bg-foreground/[0.03]'
                    }`}
                  >
                    <div className="min-w-0 flex-1 space-y-1.5 relative z-10">
                      <p className="text-sm font-black text-foreground uppercase truncate tracking-tight">{item.fileName.toUpperCase()}</p>
                      <div className="flex items-center gap-3 text-xs font-black text-foreground/20 uppercase tracking-[0.1em]">
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        <span className="text-primary/30">//</span>
                        <span>{new Date(item.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 relative z-10">
                      <div className={`px-3 py-1.5 rounded-xl font-sansDisplay font-black text-xs ${item.atsScore > 80 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-primary/10 text-primary border border-primary/20'}`}>
                        {item.atsScore}%
                      </div>
                      <button
                        onClick={(e) => handleDelete(item._id, e)}
                        className="p-2.5 rounded-2xl bg-foreground/5 text-foreground/20 hover:text-rose-500 hover:bg-rose-500/10 transition-all duration-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
            
            <button className="mt-8 w-full py-2.5 rounded-2xl bg-foreground/[0.03] border border-foreground/5 text-xs font-black tracking-[0.4em] text-foreground/20 uppercase hover:bg-foreground/10 hover:text-white transition-all relative z-10">
              ARCHIVE LOCAL LOGS
            </button>
          </div>
        </div>

        {/* Right Column: Analysis Detail (Spans 8) */}
        <div className="lg:col-span-8 space-y-5">
          <AnimatePresence mode="wait">
            {!currentAnalysis ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="h-full min-h-[450px] glass-card rounded-xl border-foreground/5 border-dashed flex flex-col items-center justify-center text-center p-10 space-y-5"
              >
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl glass flex items-center justify-center border-foreground/10 text-foreground/10">
                    <FileText className="h-12 w-12" />
                  </div>
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-[-20px] border border-foreground/5 rounded-full border-dashed"
                  />
                  <motion.div 
                    animate={{ rotate: -360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-[-40px] border border-foreground/5 rounded-full border-dotted"
                  />
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-sansDisplay font-black text-foreground uppercase tracking-tighter">WAITING FOR TELEMETRY</h3>
                  <p className="text-foreground/20 text-xs font-bold uppercase tracking-[0.3em] max-w-sm mx-auto leading-loose">
                    EXECUTE UPLOAD_COMMAND TO INITIALIZE <br/>STRATEGIC NEURAL AUDIT PROTOCOLS.
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="analysis"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Score Hero Section */}
                <div className="glass-card p-3 rounded-xl border-foreground/10 relative overflow-hidden bg-gradient-to-br from-card to-background group">
                  <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[150px] rounded-full -mr-40 -mt-40 group-hover:bg-primary/10 transition-colors duration-1000"></div>
                  
                  <div className="relative z-10 grid grid-cols-1 xl:grid-cols-12 gap-8 items-center">
                    <div className="xl:col-span-5 flex flex-col items-center text-center space-y-4">
                      <div className="relative flex items-center justify-center h-40 w-40">
                        <svg className="w-full h-full transform -rotate-90 filter drop-shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                          <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-foreground/[0.03]" />
                          <motion.circle 
                            cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" 
                            strokeDasharray={439.82}
                            initial={{ strokeDashoffset: 640.88 }}
                            animate={{ strokeDashoffset: 640.88 - (640.88 * currentAnalysis.atsScore) / 100 }}
                            transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1] }}
                            className="text-primary" 
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-4xl font-sansDisplay font-black text-foreground tracking-tighter tabular-nums">{currentAnalysis.atsScore}%</span>
                          <span className="text-sm font-black text-primary tracking-[0.5em] uppercase mt-[-2px] ml-[0.5em]">SYSTEM PARITY</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-2xl bg-foreground/[0.03] border border-foreground/10 shadow-xl">
                          <Award className="h-5 w-5 text-primary" />
                          <span className="text-sm font-black text-foreground uppercase tracking-[0.2em]">{currentAnalysis.atsScore > 85 ? 'ELITE TIER CANDIDATE' : 'STANDARD PROFESSIONAL'}</span>
                        </div>
                        <p className="text-xs font-bold text-foreground/20 uppercase tracking-[0.2em]">CALCULATED BY GPT-4O-MINI</p>
                      </div>
                    </div>

                    <div className="xl:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { label: 'FORMATTING SYNTAX', score: currentAnalysis.analysis?.formattingScore || 0, max: 10, icon: Layers },
                        { label: 'SKILLS DENSITY', score: currentAnalysis.analysis?.skillsScore || 0, max: 20, icon: Cpu },
                        { label: 'EXPERIENCE WEIGHT', score: currentAnalysis.analysis?.experienceScore || 0, max: 20, icon: Activity },
                        { label: 'PROJECT COEFFICIENT', score: currentAnalysis.analysis?.projectsScore || 0, max: 15, icon: Target },
                        { label: 'ACADEMIC PARITY', score: currentAnalysis.analysis?.educationScore || 0, max: 10, icon: Award },
                        { label: 'KEYWORD MAPPING', score: currentAnalysis.analysis?.keywordsScore || 0, max: 15, icon: Search },
                      ].map((bar, idx) => (
                        <div key={idx} className="space-y-4 p-4 rounded-xl bg-white/[0.015] border border-foreground/5 hover:border-primary/30 hover:bg-foreground/[0.03] transition-all duration-500 group/bar">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <bar.icon className="h-3.5 w-3.5 text-foreground/20 group-hover/bar:text-primary transition-colors" />
                              <span className="text-xs font-black tracking-widest text-foreground/60 uppercase group-hover/bar:text-foreground/70 transition-colors">{bar.label}</span>
                            </div>
                            <span className="text-sm font-black text-foreground/80 tabular-nums">{bar.score} <span className="text-foreground/20">/</span> {bar.max}</span>
                          </div>
                          <div className="h-1 w-full bg-foreground/5 rounded-full overflow-hidden relative">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(bar.score / bar.max) * 100}%` }}
                              transition={{ duration: 1.8, delay: idx * 0.1 + 0.8 }}
                              className="h-full bg-primary/70 shadow-[0_0_15px_rgba(59,130,246,0.5)] group-hover/bar:bg-primary transition-colors"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recruiter Intelligence Summary */}
                <div className="glass p-3 rounded-[1.5rem] border-foreground/5 space-y-4 relative overflow-hidden bg-foreground/[0.01] shadow-2xl">
                  <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-primary to-transparent opacity-40"></div>
                  <div className="flex items-center gap-4 opacity-40">
                    <Activity className="h-4 w-4" />
                    <h3 className="text-sm font-black tracking-[0.5em] text-foreground uppercase">RECRUITER EXECUTIVE SUMMARY</h3>
                  </div>
                  <p className="text-lg font-medium leading-[1.6] text-foreground/90 font-sansDisplay tracking-tight uppercase max-w-4xl italic">
                    "{currentAnalysis.analysis?.summary}"
                  </p>
                </div>

                {/* Tactical Vectors: Strengths vs Fixes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="glass p-3 rounded-[1.5rem] border-foreground/5 space-y-5 bg-emerald-500/[0.01] relative overflow-hidden group/vector">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.02] group-hover/vector:opacity-[0.08] transition-opacity duration-1000 group-hover/vector:scale-110">
                      <CheckCircle className="w-24 h-24 text-emerald-500" />
                    </div>
                    <div className="flex items-center gap-4 text-emerald-500">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                        <CheckCircle className="h-5 w-5" />
                      </div>
                      <h3 className="text-sm font-black tracking-[0.4em] uppercase">POSITIVE_VECTORS</h3>
                    </div>
                    <div className="space-y-6">
                      {currentAnalysis.analysis?.positives?.map((item, idx) => (
                        <motion.div 
                          key={idx} 
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex gap-3 items-start group/li"
                        >
                          <span className="text-emerald-500/40 font-black text-xs mt-1 transition-colors group-hover/li:text-emerald-400">0{idx+1}</span>
                          <span className="text-sm font-semibold text-foreground/60 group-hover/vector:text-foreground/80 transition-colors uppercase tracking-tight leading-relaxed">{item}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="glass p-3 rounded-[1.5rem] border-foreground/5 space-y-5 bg-rose-500/[0.01] relative overflow-hidden group/vector">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.02] group-hover/vector:opacity-[0.08] transition-opacity duration-1000 group-hover/vector:scale-110">
                      <AlertTriangle className="w-24 h-24 text-rose-500" />
                    </div>
                    <div className="flex items-center gap-4 text-rose-500">
                      <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                      <h3 className="text-sm font-black tracking-[0.4em] uppercase">CRITICAL_PATCHES</h3>
                    </div>
                    <div className="space-y-6">
                      {currentAnalysis.analysis?.negatives?.map((item, idx) => (
                        <motion.div 
                          key={idx} 
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex gap-3 items-start group/li"
                        >
                          <span className="text-rose-500/40 font-black text-xs mt-1 transition-colors group-hover/li:text-rose-400">0{idx+1}</span>
                          <span className="text-sm font-semibold text-foreground/60 group-hover/vector:text-foreground/80 transition-colors uppercase tracking-tight leading-relaxed">{item}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Skill Matrix Breakdown */}
                <div className="glass-card p-3 rounded-xl border-foreground/10 space-y-6 relative overflow-hidden">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-grid opacity-[0.02] pointer-events-none"></div>
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-foreground/5 pb-10 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-[1.25rem] bg-foreground/[0.03] flex items-center justify-center border border-foreground/10 shadow-inner">
                        <Layers className="h-7 w-7 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-black tracking-[0.5em] text-foreground uppercase">NEURAL_SKILL_MATRIX</h3>
                        <p className="text-xs font-bold text-foreground/20 uppercase tracking-widest">SYNCHRONIZING_WITH_MARKET_STANDARDS</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="px-4 py-2 rounded-xl glass border-foreground/5 text-xs font-black text-foreground/60 uppercase tracking-widest">MODE: COMPETITIVE</div>
                      <div className="px-4 py-2 rounded-xl glass border-foreground/5 text-xs font-black text-foreground/60 uppercase tracking-widest">REGION: GLOBAL</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <h4 className="text-sm font-black tracking-[0.3em] text-emerald-500 uppercase">IDENTIFIED_STRENGTHS</h4>
                        </div>
                        <span className="text-sm font-black text-foreground/20 tabular-nums">({currentAnalysis.analysis?.keywordMatches?.length || 0})</span>
                      </div>
                      <div className="flex flex-wrap gap-4">
                        {currentAnalysis.analysis?.keywordMatches?.map((skill, idx) => (
                          <motion.span 
                            key={idx} 
                            whileHover={{ scale: 1.05, backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
                            className="px-5 py-3 rounded-2xl bg-emerald-500/[0.03] border border-emerald-500/10 text-foreground/80 text-sm font-black uppercase tracking-[0.15em] transition-all cursor-default shadow-sm"
                          >
                            {skill}
                          </motion.span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          <h4 className="text-sm font-black tracking-[0.3em] text-amber-500 uppercase">INDEX_GAPS_DETECTED</h4>
                        </div>
                        <span className="text-sm font-black text-foreground/20 tabular-nums">({currentAnalysis.analysis?.keywordGaps?.length || 0})</span>
                      </div>
                      <div className="flex flex-wrap gap-4">
                        {currentAnalysis.analysis?.keywordGaps?.map((skill, idx) => (
                          <motion.span 
                            key={idx} 
                            whileHover={{ scale: 1.05, backgroundColor: 'rgba(245, 158, 11, 0.1)' }}
                            className="px-5 py-3 rounded-2xl bg-amber-500/[0.03] border border-amber-500/10 text-foreground/80 text-sm font-black uppercase tracking-[0.15em] transition-all cursor-default shadow-sm"
                          >
                            {skill}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Optimization Suggestions */}
                <div className="glass p-3 rounded-xl border-foreground/5 space-y-6 bg-primary/[0.01] shadow-2xl relative overflow-hidden">
                  <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] bg-primary/5 blur-[100px] rounded-full"></div>
                  
                  <div className="flex items-center gap-3 text-primary relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-black tracking-[0.5em] uppercase font-sansDisplay tracking-tight">AI_REWRITE_SUGGESTIONS</h3>
                      <p className="text-xs font-bold text-foreground/20 uppercase tracking-widest">AUTONOMOUS_CONTENT_OPTIMIZATION</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 relative z-10">
                    {currentAnalysis.analysis?.suggestions?.map((item, idx) => (
                      <motion.div 
                        key={idx} 
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-4 rounded-2xl bg-foreground/[0.02] border border-foreground/5 hover:border-primary/40 hover:bg-white/[0.04] transition-all duration-700 flex gap-4 group/item"
                      >
                        <div className="w-16 h-16 rounded-[1.5rem] bg-foreground/[0.03] border border-foreground/10 flex items-center justify-center font-sansDisplay font-black text-lg text-foreground/20 shrink-0 group-hover/item:text-primary group-hover/item:border-primary/20 transition-all duration-500">
                          0{idx + 1}
                        </div>
                        <p className="text-lg font-medium leading-relaxed text-foreground/70 group-hover/item:text-white transition-colors uppercase tracking-tight font-sansDisplay">
                          {item}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default ResumeAnalysis;
