import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, Sparkles, ArrowRight, ChevronRight, Mic, MicOff, 
  ChevronDown, ChevronUp, Loader2, CheckCircle, AlertCircle, 
  Clock, ShieldAlert, Award, FileText, BarChart3, HelpCircle, 
  TrendingUp, Download, Play, RefreshCw, Layers, CheckSquare, XCircle,
  Terminal, Cpu, Zap, Activity, BrainCircuit, Target, ArrowUpRight,
  Fingerprint
} from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip as ChartTooltip, 
  Legend 
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend
);

const InterviewSimulator = () => {
  const [stage, setStage] = useState('setup');
  const [loading, setLoading] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [candidateName, setCandidateName] = useState('');
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [experienceLevel, setExperienceLevel] = useState('Fresher (0-1 Years)');
  const [type, setType] = useState('technical');
  const [difficulty, setDifficulty] = useState('medium');
  const [programmingLanguage, setProgrammingLanguage] = useState('JavaScript');
  const [durationLimit, setDurationLimit] = useState(20);
  const [jobDescription, setJobDescription] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answerText, setAnswerText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [speechError, setSpeechError] = useState('');
  const [liveFeedback, setLiveFeedback] = useState({});
  const [gradingQuestionId, setGradingQuestionId] = useState(null);
  const [nextQuestionPayload, setNextQuestionPayload] = useState(null);
  const [isLastQuestion, setIsLastQuestion] = useState(false);
  const [report, setReport] = useState(null);
  const [reportError, setReportError] = useState('');
  const [expandedRecCard, setExpandedRecCard] = useState('topics');
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';
      rec.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) transcript += event.results[i][0].transcript;
        }
        if (transcript) setAnswerText(prev => prev + (prev ? ' ' : '') + transcript);
      };
      rec.onerror = (e) => {
        console.error('Speech recognition error:', e);
        setSpeechError('MICROPHONE_FAILURE: PERMISSION_DENIED');
        setIsRecording(false);
      };
      rec.onend = () => setIsRecording(false);
      recognitionRef.current = rec;
    }
  }, []);

  useEffect(() => {
    if (stage === 'active' && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleFinishInterview();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [stage, timeRemaining]);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('SYSTEM_LIMITATION: VOICE_INPUT_UNSUPPORTED');
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setSpeechError('');
      setIsRecording(true);
      try { recognitionRef.current.start(); } catch (err) { console.error(err); }
    }
  };

  const handleStartInterview = async (e) => {
    e.preventDefault();
    if (!candidateName.trim()) {
      alert('IDENTITY_INDEX_REQUIRED');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('/api/interview/start', {
        candidateName, type, targetRole, difficulty, experienceLevel,
        programmingLanguage, durationLimit: Number(durationLimit), jobDescription
      });
      if (res.data.success) {
        setActiveSession(res.data.data);
        setQuestions(res.data.data.questions);
        setCurrentQuestionIndex(0);
        setAnswerText('');
        setLiveFeedback({});
        setNextQuestionPayload(null);
        setIsLastQuestion(false);
        setStartTime(Date.now());
        setTimeRemaining(Number(durationLimit) * 60);
        setStage('active');
      }
    } catch (err) {
      console.error(err);
      alert('SIMULATOR_INITIALIZATION_FAILURE');
    } finally {
      setLoading(false);
    }
  };

  const handleGradeCurrentAnswer = async (skippedText = null) => {
    const isSkip = skippedText !== null;
    const responsePayload = isSkip ? 'Skipped' : answerText;
    if (!isSkip && !responsePayload.trim()) {
      alert('RESPONSE_BUFFER_EMPTY');
      return;
    }
    const currentQuestion = questions[currentQuestionIndex];
    setGradingQuestionId(currentQuestion._id);
    try {
      const res = await axios.post('/api/interview/grade-answer', {
        interviewId: activeSession._id,
        questionId: currentQuestion._id,
        answerText: responsePayload
      });
      if (res.data.success) {
        setLiveFeedback(prev => ({ ...prev, [currentQuestion._id]: res.data.data }));
        setNextQuestionPayload(res.data.nextQuestion);
        setIsLastQuestion(res.data.isLastQuestion);
      }
    } catch (err) {
      console.error(err);
      alert('EVALUATION_STREAM_ERROR');
    } finally {
      setGradingQuestionId(null);
    }
  };

  const handleProceedToNext = () => {
    if (nextQuestionPayload) {
      setQuestions(prev => [...prev, nextQuestionPayload]);
      setCurrentQuestionIndex(prev => prev + 1);
      setAnswerText('');
      setNextQuestionPayload(null);
    }
  };

  const handleFinishInterview = async () => {
    setStage('loading_grade');
    const totalDurationSeconds = Math.round((Date.now() - startTime) / 1000);
    try {
      const res = await axios.post('/api/interview/finish', {
        interviewId: activeSession._id,
        duration: totalDurationSeconds
      });
      if (res.data.success) {
        setReport(res.data.data);
        setStage('results');
      }
    } catch (err) {
      console.error(err);
      setReportError(err.response?.data?.message || 'COMPILATION_ERROR: REPORT_GENERATION_FAILED');
      setStage('results');
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  const getHiringBadgeColor = (rec) => {
    switch (rec) {
      case 'Excellent': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Good': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'Average': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default: return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-32 max-w-7xl mx-auto">
      
      {/* Title Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-foreground/5 pb-12 print:hidden">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-primary/5 border border-primary/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
            <Zap className="h-3.5 w-3.5 text-primary" />
            <span className="text-sm font-black tracking-[0.4em] text-primary uppercase">QUANTUM_SIMULATOR_LIVE</span>
          </div>
          <h1 className="text-xl lg:text-[6rem] font-sansDisplay font-black tracking-tighter uppercase text-foreground leading-[0.9]">
            AI_ <br />
            <span className="text-primary italic text-glow">INTERVIEW.</span>
          </h1>
        </div>
        <div className="text-right flex flex-col items-end gap-3">
          <p className="text-foreground/50 text-sm font-black uppercase tracking-[0.2em] max-w-[200px] leading-loose">
            HIGH-FIDELITY BEHAVIORAL AND TECHNICAL SIMULATION PROTOCOLS.
          </p>
          {stage === 'active' && (
            <div className="px-5 py-2.5 rounded-2xl glass border-primary/30 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_#3B82F6]" />
              <span className="text-xs font-black tracking-widest text-foreground uppercase tabular-nums">{formatTime(timeRemaining)}_REMAINING</span>
            </div>
          )}
        </div>
      </header>

      {/* SETUP PHASE */}
      {stage === 'setup' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-3 rounded-xl border-foreground/10 bg-card/60 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Cpu className="w-48 h-[350px]8 text-white" />
          </div>
          
          <div className="space-y-6 relative z-10">
            <div className="space-y-3">
              <h2 className="text-xl font-sansDisplay font-black text-foreground uppercase tracking-tight">System_Configuration</h2>
              <p className="text-foreground/60 text-sm font-medium uppercase tracking-widest">Calibrate adaptive parameters for high-stakes evaluation.</p>
            </div>

            <form onSubmit={handleStartInterview} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-4 group">
                  <label className="text-sm font-black tracking-[0.25em] text-foreground/50 uppercase ml-2 group-focus-within:text-primary transition-colors">CANDIDATE_NAME</label>
                  <input
                    type="text" required value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    placeholder="EX. JANE DOE"
                    className="w-full bg-foreground/[0.03] border border-foreground/10 rounded-xl py-2.5 px-6 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-white/5 text-foreground uppercase tracking-wider"
                  />
                </div>

                <div className="space-y-4 group">
                  <label className="text-sm font-black tracking-[0.25em] text-foreground/50 uppercase ml-2 group-focus-within:text-primary transition-colors">TARGET_ROLE</label>
                  <input
                    type="text" required value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="EX. NODE_ENGINEER"
                    className="w-full bg-foreground/[0.03] border border-foreground/10 rounded-xl py-2.5 px-6 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-white/5 text-foreground uppercase tracking-wider"
                  />
                </div>

                <div className="space-y-4 group">
                  <label className="text-sm font-black tracking-[0.25em] text-foreground/50 uppercase ml-2 group-focus-within:text-primary transition-colors">EXPERIENCE_LEVEL</label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="w-full bg-foreground/[0.03] border border-foreground/10 rounded-xl py-2.5 px-6 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all text-foreground uppercase appearance-none cursor-pointer"
                  >
                    {['Fresher (0-1 Years)', 'Junior (1-3 Years)', 'Mid Level (3-5 Years)', 'Senior (5+ Years)'].map(el => (
                      <option key={el} value={el} className="bg-black">{el.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-4 group">
                  <label className="text-sm font-black tracking-[0.25em] text-foreground/50 uppercase ml-2 group-focus-within:text-primary transition-colors">INTERVIEW_MODE</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-foreground/[0.03] border border-foreground/10 rounded-xl py-2.5 px-6 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all text-foreground uppercase appearance-none cursor-pointer"
                  >
                    {['HR', 'Technical', 'Behavioral', 'Coding', 'Mixed'].map(t => (
                      <option key={t} value={t.toLowerCase()} className="bg-black">{t.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-4 group">
                  <label className="text-sm font-black tracking-[0.25em] text-foreground/50 uppercase ml-2 group-focus-within:text-primary transition-colors">STRESS_LEVEL</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full bg-foreground/[0.03] border border-foreground/10 rounded-xl py-2.5 px-6 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all text-foreground uppercase appearance-none cursor-pointer"
                  >
                    {['easy', 'medium', 'hard'].map(d => (
                      <option key={d} value={d} className="bg-black">{d.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-4 group">
                  <label className="text-sm font-black tracking-[0.25em] text-foreground/50 uppercase ml-2 group-focus-within:text-primary transition-colors">CYCLE_DURATION</label>
                  <select
                    value={durationLimit}
                    onChange={(e) => setDurationLimit(e.target.value)}
                    className="w-full bg-foreground/[0.03] border border-foreground/10 rounded-xl py-2.5 px-6 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all text-foreground uppercase appearance-none cursor-pointer"
                  >
                    {[10, 20, 30, 45].map(time => (
                      <option key={time} value={time} className="bg-black">{time} MINUTES</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4 group">
                <label className="text-sm font-black tracking-[0.25em] text-foreground/50 uppercase ml-2 group-focus-within:text-primary transition-colors">SYSTEM_CONTEXT: JOB_DESCRIPTION</label>
                <textarea
                  rows={4} value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="ALIGN_FOLLOW_UPS_WITH_ROLE_CONTEXT..."
                  className="w-full bg-foreground/[0.03] border border-foreground/10 rounded-2xl p-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-white/5 text-foreground uppercase tracking-wider leading-relaxed custom-scrollbar"
                />
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full btn-primary py-7 rounded-2xl text-xs font-black tracking-[0.5em] flex items-center justify-center gap-4 group uppercase"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-6 w-6" />
                    INITIALIZING_NEURAL_ROOM...
                  </>
                ) : (
                  <>
                    INITIALIZE_SIMULATION_ROOM
                    <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      )}

      {/* ACTIVE INTERVIEW ROOM */}
      {stage === 'active' && activeSession && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          
          {/* Main Simulator Panel (Spans 8) */}
          <div className="lg:col-span-8 space-y-5">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-4 rounded-[1.5rem] border-foreground/10 bg-card/60 relative overflow-hidden space-y-5"
            >
              <div className="flex justify-between items-center border-b border-foreground/5 pb-8 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Terminal className="h-[380px] w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-black tracking-[0.3em] text-foreground uppercase">ACTIVE_SESSION_LOG</p>
                    <p className="text-xs font-bold text-foreground/50 uppercase tracking-widest uppercase">MODE: {type} // STRESS: {difficulty}</p>
                  </div>
                </div>
                <div className="px-4 py-2 rounded-xl glass border-foreground/5 text-sm font-black text-foreground/60 uppercase tracking-widest">
                  PHASE: {currentQuestionIndex + 1}_OF_ADAPTIVE
                </div>
              </div>

              <div className="space-y-6 relative z-10">
                <div className="p-3 rounded-xl bg-foreground/[0.02] border border-foreground/10 flex gap-4 items-start group">
                  <div className="w-12 h-12 rounded-[1.25rem] bg-foreground/5 flex items-center justify-center font-sansDisplay font-black text-xl text-primary border border-foreground/5 shrink-0 transition-all group-hover:bg-primary group-hover:text-white">Q</div>
                  <div className="space-y-2 flex-1">
                    <p className="text-xs font-black tracking-[0.2em] text-foreground/20 uppercase">INCOMING_AI_PROMPT</p>
                    <p className="text-xl font-medium leading-relaxed text-foreground font-sansDisplay uppercase tracking-tight">
                      {questions[currentQuestionIndex]?.questionText}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 group">
                  <div className="flex justify-between items-center px-4">
                    <label className="text-sm font-black tracking-[0.2em] text-foreground/50 uppercase group-focus-within:text-primary transition-colors">CANDIDATE_RESPONSE_BUFFER</label>
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${isRecording ? 'bg-rose-500 animate-pulse' : 'bg-foreground/10'}`} />
                      <span className="text-xs font-black text-foreground/20 uppercase tracking-widest">{isRecording ? 'RECORDING_ACTIVE' : 'BUFFER_IDLE'}</span>
                    </div>
                  </div>
                  <textarea
                    rows={8} value={answerText}
                    disabled={!!liveFeedback[questions[currentQuestionIndex]?._id]}
                    onChange={(e) => setAnswerText(e.target.value)}
                    placeholder="INITIALIZE_RESPONSE_INPUT..."
                    className="w-full bg-foreground/[0.03] border border-foreground/10 rounded-2xl p-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all text-foreground uppercase tracking-wider leading-relaxed custom-scrollbar disabled:opacity-40"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6">
                  <div className="flex items-center gap-4">
                    {!liveFeedback[questions[currentQuestionIndex]?._id] && (
                      <motion.button
                        whileHover={{ scale: 1.05 }} whileActive={{ scale: 0.95 }}
                        onClick={toggleRecording}
                        className={`px-6 py-2.5 rounded-2xl flex items-center gap-3 text-sm font-black tracking-widest uppercase transition-all ${isRecording ? 'bg-rose-500 text-foreground shadow-[0_0_25px_rgba(244,63,94,0.4)]' : 'bg-foreground/5 border border-foreground/10 text-foreground/70 hover:bg-foreground/10'}`}
                      >
                        {isRecording ? <MicOff className="h-[350px] w-4" /> : <Mic className="h-[350px] w-4 text-primary" />}
                        {isRecording ? 'TERM_STREAM' : 'INIT_VOICE'}
                      </motion.button>
                    )}
                    {speechError && <span className="text-xs font-black text-rose-500 uppercase tracking-widest">{speechError}</span>}
                  </div>

                  <div className="flex items-center gap-4">
                    {!liveFeedback[questions[currentQuestionIndex]?._id] ? (
                      <>
                        <button
                          onClick={() => handleGradeCurrentAnswer('Skipped')}
                          className="px-6 py-2.5 text-sm font-black tracking-widest text-foreground/20 uppercase hover:text-white transition-colors"
                        >
                          SKIP_PROMPT
                        </button>
                        <button
                          onClick={() => handleGradeCurrentAnswer()}
                          disabled={gradingQuestionId === questions[currentQuestionIndex]?._id || !answerText.trim()}
                          className="btn-primary px-6 py-2.5 rounded-2xl text-sm font-black tracking-widest flex items-center gap-3 uppercase disabled:opacity-20"
                        >
                          {gradingQuestionId === questions[currentQuestionIndex]?._id ? <Loader2 className="animate-spin h-[350px] w-4" /> : <Activity className="h-[350px] w-4" />}
                          EXECUTE_EVAL
                        </button>
                      </>
                    ) : (
                      <>
                        {nextQuestionPayload && (
                          <button
                            onClick={handleProceedToNext}
                            className="btn-primary px-6 py-2.5 rounded-2xl text-sm font-black tracking-widest flex items-center gap-3 uppercase shadow-[0_0_30px_rgba(59,130,246,0.3)]"
                          >
                            NEXT_PROMPT
                            <ChevronRight className="h-[350px] w-4" />
                          </button>
                        )}
                        {isLastQuestion && (
                          <button
                            onClick={handleFinishInterview}
                            className="px-12 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-sm font-black tracking-widest uppercase transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                          >
                            COMPILE_FINAL_REPORT
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Live Analytics (Spans 4) */}
          <div className="lg:col-span-4">
            <AnimatePresence mode="wait">
              {(() => {
                const currentQ = questions[currentQuestionIndex];
                const feedbackItem = liveFeedback[currentQ?._id];
                if (!feedbackItem) {
                  return (
                    <motion.div 
                      key="waiting" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                      className="glass p-4 rounded-[1.5rem] border-foreground/5 flex flex-col items-center justify-center text-center space-y-4 bg-foreground/[0.02] h-[600px]"
                    >
                      <div className="relative">
                        <HelpCircle className="h-16 w-16 text-foreground/5" />
                        <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 4, repeat: Infinity }} className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                      </div>
                      <div className="space-y-3 text-center">
                        <h4 className="text-xl font-sansDisplay font-black text-foreground uppercase tracking-tight">WAITING_FOR_INPUT</h4>
                        <p className="text-sm font-bold text-foreground/20 uppercase tracking-[0.2em] max-w-[200px] mx-auto leading-relaxed text-center">PROVIDE RESPONSE TO INITIALIZE REAL-TIME DIAGNOSTIC STREAM.</p>
                      </div>
                    </motion.div>
                  );
                }
                return (
                  <motion.div 
                    key="feedback" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="glass p-4 rounded-[1.5rem] border-foreground/5 space-y-5 bg-card/40 shadow-2xl max-h-[85vh] overflow-y-auto custom-scrollbar relative"
                  >
                    <div className="absolute top-0 left-0 w-full h-full bg-grid opacity-[0.03] pointer-events-none" />
                    <header className="space-y-2 border-b border-foreground/5 pb-8 relative z-10">
                      <div className="flex items-center gap-3">
                        <BrainCircuit className="h-[380px] w-5 text-primary" />
                        <h3 className="text-sm font-black tracking-[0.4em] text-foreground uppercase">NEURAL_DIAGNOSTICS</h3>
                      </div>
                      <p className="text-xs font-bold text-foreground/20 uppercase tracking-widest">CALCULATED_NODE_PERFORMANCE_METRICS</p>
                    </header>
                    <div className="grid grid-cols-2 gap-4 relative z-10">
                      {[
                        { label: 'OVERALL', val: feedbackItem.score },
                        { label: 'ACCURACY', val: feedbackItem.accuracyScore },
                        { label: 'CONFIDENCE', val: feedbackItem.confidenceScore },
                        { label: 'TECHNICAL', val: feedbackItem.technicalDepthScore },
                        { label: 'SYNTAX', val: feedbackItem.grammarScore },
                        { label: 'RELEVANCE', val: feedbackItem.relevanceScore }
                      ].map((m, i) => (
                        <div key={i} className="p-3 rounded-2xl bg-foreground/[0.02] border border-foreground/5 text-center space-y-2 hover:border-primary/30 transition-all">
                          <span className="text-xs text-foreground/50 font-black uppercase tracking-widest">{m.label}</span>
                          <h4 className="text-lg font-sansDisplay font-black text-foreground tabular-nums">{m.val}%</h4>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-4 relative z-10">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-emerald-500 px-2">
                          <CheckCircle className="h-[350px] w-4" />
                          <h4 className="text-sm font-black uppercase tracking-widest">IDENTIFIED_STRENGTHS</h4>
                        </div>
                        <div className="space-y-3">
                          {feedbackItem.strengths?.map((s, idx) => (
                            <div key={idx} className="p-4 rounded-xl bg-emerald-500/[0.03] border border-emerald-500/10 text-sm font-medium text-foreground/70 uppercase tracking-tight leading-relaxed">{s}</div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-rose-500 px-2">
                          <AlertCircle className="h-[350px] w-4" />
                          <h4 className="text-sm font-black uppercase tracking-widest">CRITICAL_GAPS</h4>
                        </div>
                        <div className="space-y-3">
                          {feedbackItem.weaknesses?.map((w, idx) => (
                            <div key={idx} className="p-4 rounded-xl bg-rose-500/[0.03] border border-rose-500/10 text-sm font-medium text-foreground/70 uppercase tracking-tight leading-relaxed">{w}</div>
                          ))}
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-primary/[0.02] border border-primary/20 space-y-4">
                        <div className="flex items-center gap-3 text-primary">
                          <Sparkles className="h-[350px] w-4" />
                          <h4 className="text-sm font-black uppercase tracking-widest text-glow">OPTIMIZED_EXEMPLAR</h4>
                        </div>
                        <p className="text-sm leading-[1.8] text-foreground/75 italic font-medium uppercase tracking-tight border-l border-primary/20 pl-4">{feedbackItem.sampleAnswer}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })()}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* LOADING GRADER SCREEN */}
      {stage === 'loading_grade' && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="p-12 glass-card rounded-xl border-foreground/5 border-dashed text-center space-y-5 max-w-4xl mx-auto"
        >
          <div className="relative flex items-center justify-center mx-auto">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="w-24 h-24 border-t-2 border-primary rounded-full" />
            <BrainCircuit className="absolute h-10 w-10 text-primary animate-pulse shadow-2xl" />
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-sansDisplay font-black text-foreground uppercase tracking-tighter animate-pulse text-center">AGGREGATING_PERFORMANCE_METRICS</h3>
            <p className="text-primary text-sm font-black uppercase tracking-[0.4em] ml-[0.4em] text-center">COMPILING_SCORE_GRAPHS_AND_NEURAL_RECS...</p>
          </div>
        </motion.div>
      )}

      {/* FINAL REPORT RESULTS */}
      {stage === 'results' && report && (
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="glass-card p-3 rounded-xl border-foreground/10 relative overflow-hidden bg-gradient-to-br from-card to-background group">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[180px] rounded-full -mr-60 -mt-60 group-hover:bg-primary/10 transition-all duration-1000"></div>
            <div className="relative z-10 grid grid-cols-1 xl:grid-cols-12 gap-8 items-center">
              <div className="xl:col-span-4 flex flex-col items-center space-y-4">
                <div className="relative flex items-center justify-center h-[350px]0 w-40">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="112" cy="112" r="100" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-foreground/[0.03]" />
                    <motion.circle 
                      cx="112" cy="112" r="100" stroke="currentColor" strokeWidth="10" fill="transparent" 
                      strokeDasharray={628.3} initial={{ strokeDashoffset: 628.3 }}
                      animate={{ strokeDashoffset: 628.3 - (628.3 * report.overallScore) / 100 }}
                      transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1] }}
                      className="text-primary" strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-7xl font-sansDisplay font-black text-foreground tracking-tighter tabular-nums">{report.overallScore}%</span>
                    <span className="text-sm font-black text-primary tracking-[0.5em] uppercase mt-[-4px] ml-[0.5em]">FINAL_INDEX</span>
                  </div>
                </div>
                <div className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest border ${getHiringBadgeColor(report.hiringRecommendation)}`}>
                  REC: {report.hiringRecommendation}
                </div>
              </div>
              <div className="xl:col-span-8 space-y-5">
                <div className="flex flex-col xl:flex-row items-center justify-between gap-3 border-b border-foreground/5 pb-8">
                  <h3 className="text-xl font-sansDisplay font-black text-foreground uppercase tracking-tight">EXECUTIVE DIAGNOSTIC REPORT</h3>
                  <button onClick={() => window.print()} className="btn-secondary px-6 py-2.5 rounded-2xl flex items-center gap-3 text-sm font-black tracking-widest uppercase">
                    <Download className="h-[350px] w-4" /> EXPORT_CERTIFICATE_PDF
                  </button>
                </div>
                <p className="text-lg font-medium leading-relaxed text-foreground/80 font-sansDisplay uppercase tracking-tight italic">
                  "{report.overallFeedback}"
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-center">
            <div className="glass-card p-3 rounded-[1.5rem] border-foreground/10 space-y-5 text-center">
              <div className="flex items-center gap-4 text-foreground/60 justify-center">
                <BarChart3 className="h-[380px] w-5" />
                <h4 className="text-sm font-black tracking-[0.4em] uppercase">RECRUITMENT_NODE_RADAR</h4>
              </div>
              <div className="h-80 relative">
                <Bar 
                  data={{
                    labels: ['TECH', 'COMM', 'CONF', 'LOGIC', 'BEHAVIOR', 'SYNTAX'],
                    datasets: [{
                      data: [report.technicalScore, report.communicationScore, report.confidenceScore, report.problemSolvingScore, report.behaviorScore, report.grammarScore],
                      backgroundColor: 'rgba(59, 130, 246, 0.4)',
                      borderColor: '#3B82F6', borderWidth: 2, borderRadius: 12, barPercentage: 0.6
                    }]
                  }} 
                  options={{
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      y: { min: 0, max: 100, ticks: { font: { weight: 'bold', family: 'Inter', size: 9 }, color: 'rgba(255,255,255,0.2)' }, grid: { color: 'rgba(255,255,255,0.03)' } },
                      x: { ticks: { font: { weight: 'black', family: 'Space Grotesk', size: 10 }, color: 'rgba(255,255,255,0.4)' }, grid: { display: false } }
                    }
                  }}
                />
              </div>
            </div>

            <div className="glass-card p-3 rounded-[1.5rem] border-foreground/10 flex flex-col text-center">
              <div className="flex items-center justify-between border-b border-foreground/5 pb-8 mb-8 text-center">
                <div className="flex items-center gap-4">
                  <Sparkles className="h-[380px] w-5 text-primary" />
                  <h4 className="text-sm font-black tracking-[0.4em] text-foreground uppercase text-center">NEURAL_SUGGESTIONS</h4>
                </div>
                <div className="flex gap-2">
                  {['topics', 'dsa', 'projects'].map(tab => (
                    <button key={tab} onClick={() => setExpandedRecCard(tab)} className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${expandedRecCard === tab ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-foreground/5 text-foreground/50 border border-foreground/5'}`}>
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-3">
                {(report[`recommendation${expandedRecCard.charAt(0).toUpperCase() + expandedRecCard.slice(1)}`] || []).map((t, idx) => (
                  <motion.div key={idx} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} className="flex gap-4 items-start p-3 rounded-2xl bg-foreground/[0.02] border border-foreground/5 group hover:border-primary/20 transition-all">
                    <span className="text-primary font-black mt-0.5">{`>>`}</span>
                    <span className="text-sm font-semibold text-foreground/70 group-hover:text-white uppercase tracking-tight leading-relaxed text-left">{t}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 text-foreground/50 px-6">
              <Terminal className="h-[380px] w-5" />
              <h4 className="text-sm font-black tracking-[0.4em] uppercase text-center">FULL_CYCLE_GRADED_LOGS</h4>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {report.results?.map((resItem, idx) => (
                <div key={idx} className="glass p-3 rounded-[1.5rem] border-foreground/5 space-y-5 bg-foreground/[0.01] hover:bg-foreground/[0.02] transition-all duration-500">
                  <div className="flex justify-between items-center border-b border-foreground/5 pb-8 relative z-10">
                    <span className="text-sm font-black tracking-[0.3em] text-foreground/50 uppercase">PROMPT_SEQUENCE_{idx + 1}</span>
                    <div className="px-5 py-2 rounded-xl glass border-primary/20 text-primary text-sm font-black tabular-nums tracking-widest">SCORE: {resItem.score}%</div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative z-10">
                    <div className="space-y-4">
                      <p className="text-xs font-black tracking-widest text-foreground/20 uppercase">SYSTEM_PROMPT</p>
                      <p className="text-lg font-medium text-foreground font-sansDisplay uppercase tracking-tight leading-relaxed">{resItem.question?.questionText}</p>
                    </div>
                    <div className="space-y-4">
                      <p className="text-xs font-black tracking-widest text-foreground/20 uppercase">CANDIDATE_OUTPUT</p>
                      <p className="text-sm font-semibold text-foreground/60 italic leading-[1.8] uppercase tracking-tighter border-l border-foreground/10 pl-6">{resItem.answer?.answerText}</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-primary/[0.02] border border-primary/10 flex gap-3 items-start relative z-10">
                    <Sparkles className="h-6 w-6 text-primary shrink-0 mt-1" />
                    <div className="space-y-3">
                      <p className="text-xs font-black tracking-widest text-primary uppercase">AI_CRITIQUE_STREAM</p>
                      <p className="text-base font-medium text-foreground/75 leading-relaxed uppercase tracking-tight text-left">{resItem.feedback}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center pt-10 text-center">
            <button onClick={() => setStage('setup')} className="btn-primary py-2.5 px-8 rounded-2xl text-xs font-black tracking-[0.5em] uppercase flex items-center gap-4 group shadow-[0_0_50px_rgba(59,130,246,0.3)] mx-auto">
              <RefreshCw className="h-[380px] w-5 group-hover:rotate-180 transition-transform duration-700" />
              INIT_NEW_SESSION_CYCLE
            </button>
          </div>
        </motion.div>
      )}

    </div>
  );
};

export default InterviewSimulator;
