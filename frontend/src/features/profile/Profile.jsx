import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { 
  User, Mail, Phone, BookOpen, Compass, Globe, 
  Linkedin, Github, Edit3, Save, Plus, Trash2, Loader2, CheckCircle,
  Fingerprint, ShieldCheck, Briefcase, Cpu, Code2, Link as LinkIcon,
  ArrowRight, XCircle, Activity, Target, Layers
} from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [msg, setMsg] = useState('');

  const [phone, setPhone] = useState('');
  const [college, setCollege] = useState('');
  const [university, setUniversity] = useState('');
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState([]);
  const [projects, setProjects] = useState([]);
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [portfolio, setPortfolio] = useState('');

  const fetchProfile = async () => {
    try {
      const res = await axios.get('/api/profile');
      if (res.data.success) {
        const data = res.data.data;
        setProfile(data);
        setPhone(data.phone || '');
        setCollege(data.college || '');
        setUniversity(data.university || '');
        setSkills(data.skills?.join(', ') || '');
        setExperience(data.experience || []);
        setProjects(data.projects || []);
        setLinkedin(data.linkedin || '');
        setGithub(data.github || '');
        setPortfolio(data.portfolio || '');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleAddExperience = () => {
    setExperience([...experience, { company: '', role: '', startDate: '', endDate: '', description: '' }]);
  };

  const handleRemoveExperience = (idx) => {
    setExperience(experience.filter((_, i) => i !== idx));
  };

  const handleExperienceChange = (idx, field, value) => {
    const updated = experience.map((item, i) => {
      if (i === idx) return { ...item, [field]: value };
      return item;
    });
    setExperience(updated);
  };

  const handleAddProject = () => {
    setProjects([...projects, { title: '', description: '', link: '' }]);
  };

  const handleRemoveProject = (idx) => {
    setProjects(projects.filter((_, i) => i !== idx));
  };

  const handleProjectChange = (idx, field, value) => {
    const updated = projects.map((item, i) => {
      if (i === idx) return { ...item, [field]: value };
      return item;
    });
    setProjects(updated);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      const res = await axios.put('/api/profile', {
        phone, college, university, skills, experience, projects,
        linkedin, github, portfolio,
      });
      if (res.data.success) {
        setProfile(res.data.data);
        setEditMode(false);
        setMsg('PROFILE_UPDATE_COMPLETE');
        setTimeout(() => setMsg(''), 3000);
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert('UPDATE_FAILURE: SYSTEM_REJECTED_CHANGES');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-8">
        <div className="relative">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 border-t-2 border-primary rounded-full"
          />
          <Fingerprint className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-sm font-black tracking-[0.5em] text-primary uppercase ml-[0.5em]">INDEXING_IDENTITY_CREDENTIALS</p>
          <p className="text-xs text-foreground/50 font-bold uppercase tracking-widest">Retrieving candidate neural profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-fadeIn pb-32">
      
      {/* Title Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-foreground/5 pb-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-primary/5 border border-primary/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
            <Fingerprint className="h-3.5 w-3.5 text-primary" />
            <span className="text-sm font-black tracking-[0.4em] text-primary uppercase">IDENTITY_MANAGEMENT_V4.2</span>
          </div>
          <h1 className="text-xl lg:text-7xl font-sansDisplay font-black tracking-tighter uppercase text-foreground leading-[0.9]">
            CANDIDATE_ <br />
            <span className="text-primary italic text-glow">PROFILE.</span>
          </h1>
        </div>
        {!editMode && (
          <motion.button
            whileHover={{ scale: 1.05 }} whileActive={{ scale: 0.95 }}
            onClick={() => setEditMode(true)}
            className="btn-primary py-2.5 px-6 text-xs font-black tracking-widest uppercase flex items-center gap-3 rounded-2xl"
          >
            <Edit3 className="h-4 w-4" /> EDIT_CREDENTIALS
          </motion.button>
        )}
      </header>

      {msg && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-emerald-500/[0.03] border border-emerald-500/20 text-emerald-500 rounded-2xl text-sm font-black tracking-[0.2em] flex items-center gap-3 uppercase shadow-[0_0_30px_rgba(16,185,129,0.1)]"
        >
          <CheckCircle className="h-4 w-4" /> {msg}
        </motion.div>
      )}

      {/* Main card */}
      {!editMode ? (
        <div className="space-y-10">
          {/* Identity Card */}
          <div className="glass-card rounded-xl border-foreground/10 overflow-hidden bg-card/60 shadow-2xl relative">
            <div className="h-40 bg-gradient-to-r from-primary/20 via-[#0A0A0A] to-transparent relative">
              <div className="absolute inset-0 bg-grid opacity-20" />
              <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black to-transparent" />
            </div>
            <div className="px-12 pb-12 relative">
              <div className="absolute -top-16 left-12">
                <div className="h-24 w-24 rounded-2xl border-4 border-black bg-card flex items-center justify-center overflow-hidden shadow-2xl group cursor-pointer hover:border-primary/50 transition-all duration-500 relative">
                  <img src={`https://i.pravatar.cc/300?u=${user?.email}`} alt="User" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute inset-0 flex items-center justify-center bg-card/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="pt-24 space-y-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
                  <div className="space-y-2">
                    <h2 className="text-xl font-sansDisplay font-black text-foreground uppercase tracking-tighter tabular-nums">{user?.name}</h2>
                    <div className="flex items-center gap-3 text-primary">
                      <Cpu className="h-4 w-4" />
                      <p className="text-sm font-black uppercase tracking-[0.3em]">{profile?.university || 'UNASSIGNED'} // CANDIDATE_NODE</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    {profile?.linkedin && (
                      <a href={profile.linkedin} target="_blank" rel="noreferrer" className="w-12 h-12 glass rounded-2xl flex items-center justify-center border-foreground/10 hover:border-primary/50 hover:bg-primary/10 transition-all text-foreground/60 hover:text-primary">
                        <Linkedin className="h-5 w-5" />
                      </a>
                    )}
                    {profile?.github && (
                      <a href={profile.github} target="_blank" rel="noreferrer" className="w-12 h-12 glass rounded-2xl flex items-center justify-center border-foreground/10 hover:border-primary/50 hover:bg-primary/10 transition-all text-foreground/60 hover:text-white">
                        <Github className="h-5 w-5" />
                      </a>
                    )}
                    {profile?.portfolio && (
                      <a href={profile.portfolio} target="_blank" rel="noreferrer" className="w-12 h-12 glass rounded-2xl flex items-center justify-center border-foreground/10 hover:border-primary/50 hover:bg-primary/10 transition-all text-foreground/60 hover:text-white">
                        <Globe className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-10 border-t border-foreground/5">
                  <div className="flex items-center gap-3 group">
                    <div className="w-12 h-12 rounded-2xl glass flex items-center justify-center border-foreground/5 text-foreground/20 group-hover:text-primary group-hover:border-primary/20 transition-all">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black tracking-[0.2em] text-foreground/50 uppercase mb-1">IDENTITY_ENDPOINT</p>
                      <p className="text-sm font-bold text-foreground uppercase tracking-wider tabular-nums">{user?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 group">
                    <div className="w-12 h-12 rounded-2xl glass flex items-center justify-center border-foreground/5 text-foreground/20 group-hover:text-primary group-hover:border-primary/20 transition-all">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black tracking-[0.2em] text-foreground/50 uppercase mb-1">VOICE_NODE</p>
                      <p className="text-sm font-bold text-foreground uppercase tracking-wider tabular-nums">{profile?.phone || 'NULL_BUFFER'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 group">
                    <div className="w-12 h-12 rounded-2xl glass flex items-center justify-center border-foreground/5 text-foreground/20 group-hover:text-primary group-hover:border-primary/20 transition-all">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black tracking-[0.2em] text-foreground/50 uppercase mb-1">INSTITUTION_ID</p>
                      <p className="text-sm font-bold text-foreground uppercase tracking-wider">{profile?.college || 'NULL_BUFFER'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 group">
                    <div className="w-12 h-12 rounded-2xl glass flex items-center justify-center border-foreground/5 text-foreground/20 group-hover:text-primary group-hover:border-primary/20 transition-all">
                      <Compass className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black tracking-[0.2em] text-foreground/50 uppercase mb-1">SYSTEM_DOMAIN</p>
                      <p className="text-sm font-bold text-foreground uppercase tracking-wider">{profile?.university || 'NULL_BUFFER'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tactical Sections Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Left: Skills & Experience (Spans 7) */}
            <div className="lg:col-span-7 space-y-10">
              <div className="glass-card p-4 rounded-[1.5rem] border-foreground/5 space-y-8 bg-foreground/[0.01]">
                <div className="flex items-center gap-4 text-primary border-b border-foreground/5 pb-6">
                  <Code2 className="h-5 w-5" />
                  <h3 className="text-sm font-black tracking-[0.4em] uppercase">NEURAL_SKILL_INDEX</h3>
                </div>
                {profile?.skills?.length === 0 ? (
                  <p className="text-xs font-bold text-foreground/20 uppercase tracking-widest py-2.5">NO_INDEXED_SKILLS</p>
                ) : (
                  <div className="flex flex-wrap gap-4">
                    {profile?.skills?.map((skill, idx) => (
                      <span key={idx} className="px-5 py-3 rounded-2xl bg-foreground/[0.03] border border-foreground/10 text-foreground/75 text-sm font-black uppercase tracking-[0.15em] hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all cursor-default">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="glass-card p-4 rounded-[1.5rem] border-foreground/5 space-y-8 bg-foreground/[0.01]">
                <div className="flex items-center gap-4 text-foreground/60 border-b border-foreground/5 pb-6">
                  <Briefcase className="h-5 w-5" />
                  <h3 className="text-sm font-black tracking-[0.4em] uppercase">SYSTEM_WORK_HISTORY</h3>
                </div>
                {profile?.experience?.length === 0 ? (
                  <p className="text-xs font-bold text-foreground/20 uppercase tracking-widest py-2.5 text-center">NO_WORK_CYCLES_LOGGED</p>
                ) : (
                  <div className="space-y-10">
                    {profile?.experience?.map((exp, idx) => (
                      <div key={idx} className="relative pl-10 group">
                        <div className="absolute left-0 top-0 w-1 h-full bg-foreground/5 rounded-full overflow-hidden">
                          <div className="h-20 w-full bg-primary/40 rounded-full" />
                        </div>
                        <div className="absolute left-[-4px] top-1 w-3 h-3 rounded-full bg-primary shadow-[0_0_10px_#3B82F6]" />
                        <div className="space-y-3">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                            <h4 className="text-lg font-sansDisplay font-black text-foreground uppercase tracking-tight group-hover:text-primary transition-colors">{exp.role} @ {exp.company}</h4>
                            <span className="text-xs font-black text-foreground/20 uppercase tracking-widest tabular-nums">{exp.startDate} // {exp.endDate}</span>
                          </div>
                          <p className="text-sm font-medium text-foreground/60 leading-relaxed uppercase tracking-tight">{exp.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Projects (Spans 5) */}
            <div className="lg:col-span-5">
              <div className="glass-card p-4 rounded-[1.5rem] border-foreground/5 space-y-8 bg-card/40 h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-5">
                  <Layers className="w-24 h-24 text-white" />
                </div>
                <div className="flex items-center gap-4 text-foreground/60 border-b border-foreground/5 pb-6 relative z-10">
                  <Cpu className="h-5 w-5" />
                  <h3 className="text-sm font-black tracking-[0.4em] uppercase">PROJECT_MODULES</h3>
                </div>
                {profile?.projects?.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-10 grayscale py-20 relative z-10">
                    <Target className="h-12 w-12" />
                    <p className="text-sm font-black tracking-[0.4em] uppercase mt-6">NO_ACTIVE_MODULES</p>
                  </div>
                ) : (
                  <div className="space-y-6 relative z-10">
                    {profile?.projects?.map((proj, idx) => (
                      <motion.div 
                        key={idx} 
                        whileHover={{ x: 4, borderColor: 'rgba(59, 130, 246, 0.3)' }}
                        className="p-3 rounded-xl bg-foreground/[0.02] border border-foreground/5 space-y-5 transition-all duration-300 group/proj"
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="text-lg font-sansDisplay font-black text-foreground uppercase tracking-tight group-hover/proj:text-primary transition-colors">{proj.title}</h4>
                          {proj.link && (
                            <a href={proj.link} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl glass flex items-center justify-center border-foreground/5 text-foreground/20 hover:text-primary hover:border-primary/20 transition-all">
                              <LinkIcon className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                        <p className="text-xs font-medium text-foreground/60 leading-relaxed uppercase tracking-tighter">{proj.description}</p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Edit Mode Forms */
        <motion.form 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSave} className="space-y-10"
        >
          <div className="glass-card p-3 rounded-xl border-foreground/10 space-y-12 bg-card/60">
            <div className="flex items-center gap-4 text-primary border-b border-foreground/5 pb-8">
              <ShieldCheck className="h-6 w-6" />
              <h3 className="text-xs font-black tracking-[0.5em] uppercase">SYSTEM_BUFFER_INPUT</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3 group">
                <label className="text-sm font-black tracking-[0.25em] text-foreground/50 uppercase ml-2 group-focus-within:text-primary transition-colors">VOICE_ENDPOINT_NODE</label>
                <input
                  type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
                  placeholder="EX. +1_555_019_2834"
                  className="w-full bg-foreground/[0.03] border border-foreground/10 rounded-xl py-2.5 px-6 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all text-foreground uppercase"
                />
              </div>
              <div className="space-y-3 group">
                <label className="text-sm font-black tracking-[0.25em] text-foreground/50 uppercase ml-2 group-focus-within:text-primary transition-colors">ACADEMIC_COLLEGE</label>
                <input
                  type="text" value={college} onChange={(e) => setCollege(e.target.value)}
                  placeholder="EX. MIT_SCHOOL_OF_ENG"
                  className="w-full bg-foreground/[0.03] border border-foreground/10 rounded-xl py-2.5 px-6 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all text-foreground uppercase"
                />
              </div>
              <div className="space-y-3 group">
                <label className="text-sm font-black tracking-[0.25em] text-foreground/50 uppercase ml-2 group-focus-within:text-primary transition-colors">UNIVERSITY_DOMAIN</label>
                <input
                  type="text" value={university} onChange={(e) => setUniversity(e.target.value)}
                  placeholder="EX. HARVARD_UNIVERSITY"
                  className="w-full bg-foreground/[0.03] border border-foreground/10 rounded-xl py-2.5 px-6 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all text-foreground uppercase"
                />
              </div>
              <div className="space-y-3 group">
                <label className="text-sm font-black tracking-[0.25em] text-foreground/50 uppercase ml-2 group-focus-within:text-primary transition-colors">NEURAL_SKILLS_VECTOR</label>
                <input
                  type="text" value={skills} onChange={(e) => setSkills(e.target.value)}
                  placeholder="REACT, NODE_JS, PYTHON, AWS"
                  className="w-full bg-foreground/[0.03] border border-foreground/10 rounded-xl py-2.5 px-6 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all text-foreground uppercase"
                />
              </div>
            </div>
          </div>

          <div className="glass-card p-3 rounded-xl border-foreground/10 space-y-12 bg-card/60">
            <div className="flex items-center gap-4 text-foreground/50 border-b border-foreground/5 pb-8">
              <Globe className="h-6 w-6" />
              <h3 className="text-xs font-black tracking-[0.5em] uppercase">SOCIAL_NODE_LINKS</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {['LINKEDIN', 'GITHUB', 'PORTFOLIO'].map((key) => (
                <div key={key} className="space-y-3 group">
                  <label className="text-sm font-black tracking-[0.25em] text-foreground/50 uppercase ml-2 group-focus-within:text-primary transition-colors">{key}_URI</label>
                  <input
                    type="text" 
                    value={key === 'LINKEDIN' ? linkedin : key === 'GITHUB' ? github : portfolio} 
                    onChange={(e) => {
                      if (key === 'LINKEDIN') setLinkedin(e.target.value);
                      else if (key === 'GITHUB') setGithub(e.target.value);
                      else setPortfolio(e.target.value);
                    }}
                    placeholder={`HTTPS://${key.toLowerCase()}.COM/...`}
                    className="w-full bg-foreground/[0.03] border border-foreground/10 rounded-[1.5rem] py-2.5 px-6 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all text-white"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-10">
            <motion.button
              whileHover={{ scale: 1.05 }} whileActive={{ scale: 0.95 }}
              type="submit" disabled={saving}
              className="btn-primary py-2.5 px-8 rounded-xl text-xs font-black tracking-[0.4em] flex items-center gap-4 group uppercase disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-6 w-6 animate-spin" /> : <Save className="h-6 w-6" />}
              SAVE_IDENTITY_PATCH
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }} whileActive={{ scale: 0.95 }}
              type="button"
              onClick={() => { setEditMode(false); fetchProfile(); }}
              className="bg-foreground/5 border border-foreground/10 text-foreground/60 py-2.5 px-8 rounded-xl text-xs font-black tracking-[0.4em] uppercase hover:bg-foreground/10 hover:text-white transition-all"
            >
              ABORT_CHANGES
            </motion.button>
          </div>
        </motion.form>
      )}

    </div>
  );
};

export default Profile;
