import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ShieldCheck, Users, FileText, Video, Activity, Settings, 
  Search, Trash2, ShieldAlert, CheckCircle, AlertTriangle, 
  Loader2, RefreshCw, Plus, Key, Ban, Unlock, Download, ExternalLink,
  Layers, Database, Cpu, HardDrive, Fingerprint
} from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // States for lists
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [logs, setLogs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [resources, setResources] = useState([]);

  // Query / Filter states
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [logType, setLogType] = useState('activity');
  const [logActionFilter, setLogActionFilter] = useState('');

  // Modals / Edit states
  const [editingUser, setEditingUser] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('student');
  const [editStatus, setEditStatus] = useState('active');
  const [editPassword, setEditPassword] = useState('');

  // User creation states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createRole, setCreateRole] = useState('student');
  const [createStatus, setCreateStatus] = useState('active');
  const [createPassword, setCreatePassword] = useState('');

  // System Config states
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [llmModel, setLlmModel] = useState('gemini-2.5-flash');
  const [maxResumes, setMaxResumes] = useState(5);
  const [maxInterviews, setMaxInterviews] = useState(3);
  
  // Creation States (Companies & Resources)
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyIndustry, setNewCompanyIndustry] = useState('');
  const [newCompanyWebsite, setNewCompanyWebsite] = useState('');
  const [newCompanyDesc, setNewCompanyDesc] = useState('');

  const [newResourceTitle, setNewResourceTitle] = useState('');
  const [newResourceCategory, setNewResourceCategory] = useState('DSA');
  const [newResourceDesc, setNewResourceDesc] = useState('');
  const [newResourceLink, setNewResourceLink] = useState('');

  // Fetch functions
  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/admin/stats');
      if (res.data.success) setStats(res.data.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch platform statistics.');
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`/api/admin/users?search=${userSearch}&role=${userRoleFilter}&status=${userStatusFilter}`);
      if (res.data.success) setUsers(res.data.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load user registry.');
    }
  };

  const fetchResumes = async () => {
    try {
      const res = await axios.get('/api/admin/resumes');
      if (res.data.success) setResumes(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchInterviews = async () => {
    try {
      const res = await axios.get('/api/admin/interviews');
      if (res.data.success) setInterviews(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await axios.get(`/api/admin/logs?type=${logType}&action=${logActionFilter}`);
      if (res.data.success) setLogs(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await axios.get('/api/admin/companies');
      if (res.data.success) setCompanies(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchResources = async () => {
    try {
      const res = await axios.get('/api/admin/learning');
      if (res.data.success) setResources(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    
    if (activeTab === 'overview') await fetchStats();
    else if (activeTab === 'users') await fetchUsers();
    else if (activeTab === 'resumes') await fetchResumes();
    else if (activeTab === 'interviews') await fetchInterviews();
    else if (activeTab === 'logs') await fetchLogs();
    else if (activeTab === 'content') {
      await fetchCompanies();
      await fetchResources();
    }
    setLoading(false);
  };

  useEffect(() => {
    handleRefresh();
  }, [activeTab, userRoleFilter, userStatusFilter, logType]);

  // Actions
  const handleEditUserClick = (user) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditStatus(user.status);
    setEditPassword('');
  };

  const handleUpdateUserSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { name: editName, email: editEmail, role: editRole, status: editStatus };
      if (editPassword) payload.password = editPassword;

      const res = await axios.put(`/api/admin/users/${editingUser._id}`, payload);
      if (res.data.success) {
        setMessage('USER_PROFILE_UPDATED');
        setEditingUser(null);
        fetchUsers();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating user configuration.');
    }
  };

  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    if (!createName.trim() || !createEmail.trim() || !createPassword.trim()) {
      setError('All parameters are required.');
      return;
    }
    try {
      const res = await axios.post('/api/admin/users', {
        name: createName,
        email: createEmail,
        password: createPassword,
        role: createRole,
        status: createStatus
      });
      if (res.data.success) {
        setMessage('USER_ACCOUNT_CREATED');
        setCreateName('');
        setCreateEmail('');
        setCreatePassword('');
        setCreateRole('student');
        setCreateStatus('active');
        setShowCreateModal(false);
        fetchUsers();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating user account.');
    }
  };

  const handlePruneLogs = async (type) => {
    if (!window.confirm(`Are you absolutely sure you want to permanently prune all ${type} logs?`)) return;
    try {
      setLoading(true);
      const res = await axios.post('/api/admin/logs/prune', { type });
      if (res.data.success) {
        setMessage(res.data.message.toUpperCase());
        if (activeTab === 'logs') {
          fetchLogs();
        }
      }
    } catch (err) {
      setError('Failed to prune logs.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = (e) => {
    e.preventDefault();
    setMessage('SYSTEM CONFIGURATIONS_STABILIZED');
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this user account?')) return;
    try {
      const res = await axios.delete(`/api/admin/users/${id}`);
      if (res.data.success) {
        setMessage('USER_REGISTRY_RECORD_DELETED');
        fetchUsers();
      }
    } catch (err) {
      setError('Failed to delete user.');
    }
  };

  const handleDeleteResume = async (id) => {
    if (!window.confirm('Delete this resume from platforms?')) return;
    try {
      const res = await axios.delete(`/api/admin/resumes/${id}`);
      if (res.data.success) {
        setMessage('RESUME_RECORD_PRUNED');
        fetchResumes();
      }
    } catch (err) {
      setError('Failed to delete resume.');
    }
  };

  const handleDeleteInterview = async (id) => {
    if (!window.confirm('Delete this mock interview simulation session?')) return;
    try {
      const res = await axios.delete(`/api/admin/interviews/${id}`);
      if (res.data.success) {
        setMessage('SIMULATION_RECORD_PRUNED');
        fetchInterviews();
      }
    } catch (err) {
      setError('Failed to delete interview.');
    }
  };

  const handleCreateCompanySubmit = async (e) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;
    try {
      const res = await axios.post('/api/admin/companies', {
        name: newCompanyName,
        industry: newCompanyIndustry,
        website: newCompanyWebsite,
        description: newCompanyDesc
      });
      if (res.data.success) {
        setMessage('COMPANY_LISTING_ADDED');
        setNewCompanyName('');
        setNewCompanyIndustry('');
        setNewCompanyWebsite('');
        setNewCompanyDesc('');
        fetchCompanies();
      }
    } catch (err) {
      setError('Failed to add company.');
    }
  };

  const handleDeleteCompany = async (id) => {
    if (!window.confirm('Remove target company listing?')) return;
    try {
      const res = await axios.delete(`/api/admin/companies/${id}`);
      if (res.data.success) {
        setMessage('COMPANY_RECORD_DELETED');
        fetchCompanies();
      }
    } catch (err) {
      setError('Failed to delete company.');
    }
  };

  const handleCreateResourceSubmit = async (e) => {
    e.preventDefault();
    if (!newResourceTitle.trim()) return;
    try {
      const res = await axios.post('/api/admin/learning', {
        title: newResourceTitle,
        category: newResourceCategory,
        description: newResourceDesc,
        link: newResourceLink
      });
      if (res.data.success) {
        setMessage('LEARNING_RESOURCE_CREATED');
        setNewResourceTitle('');
        setNewResourceDesc('');
        setNewResourceLink('');
        fetchResources();
      }
    } catch (err) {
      setError('Failed to add resource.');
    }
  };

  const handleDeleteResource = async (id) => {
    if (!window.confirm('Remove this learning resource?')) return;
    try {
      const res = await axios.delete(`/api/admin/learning/${id}`);
      if (res.data.success) {
        setMessage('LEARNING_RESOURCE_REMOVED');
        fetchResources();
      }
    } catch (err) {
      setError('Failed to remove resource.');
    }
  };

  const exportLogsToCSV = () => {
    if (logs.length === 0) return;
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Date,User,Role,IP Address,Action,Status\n";
    logs.forEach(log => {
      const userEmail = log.user?.email || 'N/A';
      csvContent += `${log.createdAt},${userEmail},${log.role},${log.ipAddress},"${log.action.replace(/"/g, '""')}",${log.status || 'success'}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `platform_${logType}_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-12 max-w-7xl mx-auto text-foreground pb-12 relative animate-fadeIn">
      {/* Background Decorative Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-rose-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[350px] h-[350px] bg-primary/5 blur-[100px] rounded-full pointer-events-none -z-10" />
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-8 border-b border-foreground/5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 glass flex items-center justify-center rounded-[1.25rem] border-foreground/5 bg-rose-500/10 text-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.15)]">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <div>
            <h1 className="font-sansDisplay text-xl font-black tracking-tight uppercase">ROOT ACCESS</h1>
            <p className="text-sm font-black tracking-widest text-foreground/50 uppercase mt-1">Manage platform components, audit logs, and system performance configurations</p>
          </div>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="btn-secondary py-3 px-6 text-sm font-black tracking-widest uppercase flex items-center gap-2 shrink-0"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          REFRESH_STREAM
        </button>
      </div>

      {/* Notifications/Errors */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 border border-rose-500/20 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center gap-2.5 text-sm font-black tracking-widest uppercase"
        >
          <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
          SYSTEM_ALERT // {error.toUpperCase()}
        </motion.div>
      )}
      {message && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center gap-2.5 text-sm font-black tracking-widest uppercase"
        >
          <CheckCircle className="h-4.5 w-4.5 shrink-0" />
          TRANSMISSION_SUCCESS // {message}
        </motion.div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-foreground/5 pb-4 overflow-x-auto select-none custom-scrollbar">
        {[
          { id: 'overview', label: 'PLATFORM_STATUS', icon: Layers },
          { id: 'users', label: 'USER_DIRECTORY', icon: Users },
          { id: 'resumes', label: 'RESUME_SCANNER', icon: FileText },
          { id: 'interviews', label: 'INTERVIEWS_LOG', icon: Video },
          { id: 'logs', label: 'SYSTEM_LOGS', icon: Activity },
          { id: 'content', label: 'CONTENT_CONTROL', icon: Settings },
          { id: 'config', label: 'SYSTEM CONFIG', icon: ShieldAlert }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 rounded-full text-sm font-black tracking-widest uppercase transition-all duration-300 flex items-center gap-2 shrink-0 ${
                isActive 
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.1)]' 
                  : 'bg-foreground/5 text-foreground/60 border border-transparent hover:bg-foreground/10 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TABS CONTAINER */}
      <div className="space-y-6">

        {/* 1. OVERVIEW / SYSTEM STATUS */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-8 animate-fadeIn">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total User Profiles', value: stats.totalUsers, color: 'text-white border-foreground/5' },
                { label: 'Active Status Sessions', value: stats.activeUsers, color: 'text-emerald-400 border-emerald-500/10 bg-emerald-500/[0.01]' },
                { label: 'Scanned Resumes', value: stats.totalResumes, color: 'text-primary border-primary/10 bg-primary/[0.01]' },
                { label: 'Mock Simulations Done', value: stats.totalInterviews, color: 'text-amber-400 border-amber-500/10 bg-amber-500/[0.01]' },
              ].map((stat, idx) => (
                <div key={idx} className={`p-4 border rounded-xl glass-card flex flex-col justify-between h-36 ${stat.color}`}>
                  <span className="text-xs font-black tracking-widest text-foreground/50 uppercase">{stat.label}</span>
                  <h3 className="text-lg font-sansDisplay font-black tracking-tight">{stat.value}</h3>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {/* Health Panel */}
              <div className="p-3 glass rounded-2xl border-foreground/5 bg-card/40 space-y-6">
                <h3 className="font-sansDisplay font-bold text-sm tracking-widest text-foreground/50 uppercase flex items-center gap-2 border-b border-foreground/5 pb-4">
                  <Database className="h-5 w-5 text-primary" /> Server Resource Monitor
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'Simulated CPU Usage', value: stats.systemHealth.cpuUsage, icon: Cpu },
                    { label: 'Simulated Memory Usage', value: stats.systemHealth.memoryUsage, icon: HardDrive },
                  ].map((res, i) => {
                    const Icon = res.icon;
                    return (
                      <div key={i} className="flex justify-between items-center p-4 bg-foreground/[0.02] rounded-2xl border border-foreground/5">
                        <span className="flex items-center gap-2 text-sm font-black tracking-widest uppercase text-foreground/70"><Icon className="h-4.5 w-4.5 text-foreground/20" /> {res.label}</span>
                        <span className="text-xs font-black text-primary font-sansDisplay">{res.value}</span>
                      </div>
                    );
                  })}
                  
                  <div className="flex justify-between items-center p-4 bg-foreground/[0.02] rounded-2xl border border-foreground/5 text-sm font-black tracking-widest uppercase">
                    <span className="text-foreground/70">MongoDB Database status</span>
                    <span className="text-emerald-400 font-black">{stats.systemHealth.dbStatus.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-foreground/[0.02] rounded-2xl border border-foreground/5 text-sm font-black tracking-widest uppercase">
                    <span className="text-foreground/70">Docker Containers status</span>
                    <span className="text-primary font-black">{stats.systemHealth.dockerStatus.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              {/* AI Cost Panel */}
              <div className="p-3 glass rounded-2xl border-foreground/5 bg-card/40 space-y-6">
                <h3 className="font-sansDisplay font-bold text-sm tracking-widest text-foreground/50 uppercase flex items-center gap-2 border-b border-foreground/5 pb-4">
                  <ShieldAlert className="h-5 w-5 text-rose-500" /> AI API Audit Control
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-foreground/[0.02] rounded-2xl border border-foreground/5 text-sm font-black tracking-widest uppercase">
                    <span className="text-foreground/70">API Tokens Consumed</span>
                    <span className="text-xs font-black text-foreground font-sansDisplay">{stats.aiUsage.tokensUsed} TOKENS</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-foreground/[0.02] rounded-2xl border border-foreground/5 text-sm font-black tracking-widest uppercase">
                    <span className="text-foreground/70">Average API Response Latency</span>
                    <span className="text-xs font-black text-foreground font-sansDisplay">{stats.aiUsage.responseTime}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-foreground/[0.02] rounded-2xl border border-foreground/5 text-sm font-black tracking-widest uppercase">
                    <span className="text-foreground/70">Failed Requests / Penalisations</span>
                    <span className="text-rose-400 font-black">{stats.aiUsage.failedRequests} FAILS</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-foreground/[0.02] rounded-2xl border border-foreground/5 text-sm font-black tracking-widest uppercase">
                    <span className="text-foreground/70">Accumulated LLM cost estimation</span>
                    <span className="text-emerald-400 font-black font-sansDisplay">{stats.aiUsage.totalCosts}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. USER DIRECTORY */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xs font-black tracking-[0.3em] uppercase text-foreground/50">MODULE_USER_CONTROL</h2>
                <p className="text-sm font-medium text-foreground/60 uppercase mt-0.5">Manage user configurations, roles, account status, and create new users.</p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary py-3 px-6 text-sm font-black tracking-widest uppercase flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4" /> CREATE_USER
              </button>
            </div>

            {/* Search Filters Row */}
            <div className="flex flex-col sm:flex-row gap-4 p-3 rounded-xl glass border-foreground/5 bg-card/40 text-sm font-black tracking-widest uppercase">
              <div className="flex-1 relative flex items-center">
                <Search className="h-4.5 w-4.5 text-foreground/20 absolute left-4" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="SEARCH_USER_IDENTIFIER..."
                  className="w-full pl-12 pr-4 py-3 bg-foreground/5 border border-foreground/5 rounded-full text-foreground placeholder:text-white/10 focus:outline-none focus:border-primary/20 focus:ring-0 text-sm font-black tracking-widest uppercase"
                />
              </div>
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="px-5 py-3 rounded-full bg-foreground/5 border border-foreground/5 text-foreground/75 focus:outline-none font-black tracking-widest"
              >
                <option className="bg-black text-foreground/80" value="all">ALL_ROLES</option>
                <option className="bg-black text-foreground/80" value="student">STUDENT</option>
                <option className="bg-black text-foreground/80" value="admin">ADMIN</option>
                <option className="bg-black text-foreground/80" value="user">USER_LEGACY</option>
              </select>
              <select
                value={userStatusFilter}
                onChange={(e) => setUserStatusFilter(e.target.value)}
                className="px-5 py-3 rounded-full bg-foreground/5 border border-foreground/5 text-foreground/75 focus:outline-none font-black tracking-widest"
              >
                <option className="bg-black text-foreground/80" value="all">ALL_STATUSES</option>
                <option className="bg-black text-foreground/80" value="active">ACTIVE</option>
                <option className="bg-black text-foreground/80" value="suspended">SUSPENDED</option>
              </select>
              <button
                onClick={fetchUsers}
                className="btn-secondary py-3 px-8 text-sm font-black tracking-widest uppercase shrink-0"
              >
                APPLY_FILTERS
              </button>
            </div>

            {/* User List Table */}
            <div className="glass rounded-2xl border-foreground/5 bg-black/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm font-black tracking-widest uppercase">
                  <thead>
                    <tr className="bg-foreground/[0.02] border-b border-foreground/5 text-foreground/50 text-xs">
                      <th className="p-4">Profile Info</th>
                      <th className="p-4">Email Address</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Account Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-foreground/75 font-semibold lowercase">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-foreground/20 uppercase tracking-widest">No registered users matched your constraints.</td>
                      </tr>
                    ) : users.map(user => (
                      <tr key={user._id} className="hover:bg-foreground/[0.01] transition-colors">
                        <td className="p-4 font-bold text-foreground capitalize">{user.name}</td>
                        <td className="p-4 select-all">{user.email}</td>
                        <td className="p-4"><span className="px-3 py-1 bg-foreground/5 border border-foreground/5 rounded-md text-xs font-black uppercase text-foreground/70">{user.role}</span></td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                            user.status === 'suspended' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/10' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'
                          }`}>
                            {user.status || 'active'}
                          </span>
                        </td>
                        <td className="p-4 text-right flex items-center justify-end gap-3">
                          <button
                            onClick={() => handleEditUserClick(user)}
                            className="px-4 py-2 bg-foreground/5 hover:bg-foreground/10 text-white border border-foreground/10 rounded-xl transition text-xs font-black uppercase"
                          >
                            MODIFY_CONFIG
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="p-2.5 text-foreground/50 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition border border-transparent hover:border-rose-500/10"
                            title="Delete User"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 3. RESUME DIRECTORY */}
        {activeTab === 'resumes' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="glass rounded-2xl border-foreground/5 bg-black/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm font-black tracking-widest uppercase">
                  <thead>
                    <tr className="bg-foreground/[0.02] border-b border-foreground/5 text-foreground/50 text-xs">
                      <th className="p-4">Uploader Identity</th>
                      <th className="p-4">Resume File Name</th>
                      <th className="p-4">Extracted ATS Score</th>
                      <th className="p-4">Uploaded at</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-foreground/75 font-semibold">
                    {resumes.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-foreground/20 uppercase tracking-widest">No uploaded resume assets found.</td>
                      </tr>
                    ) : resumes.map(res => (
                      <tr key={res._id} className="hover:bg-foreground/[0.01] transition-colors">
                        <td className="p-4 font-bold text-foreground capitalize">{res.user?.name || 'Deleted User'} ({res.user?.email || 'N/A'})</td>
                        <td className="p-4 lowercase font-normal"><span className="flex items-center gap-2"><FileText className="h-4.5 w-4.5 text-primary shrink-0" /> {res.fileName}</span></td>
                        <td className="p-4"><span className="px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary font-sansDisplay font-black rounded-xl">{res.atsScore}%</span></td>
                        <td className="p-4 text-foreground/60">{new Date(res.createdAt).toLocaleDateString()}</td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleDeleteResume(res._id)}
                            className="p-2.5 text-foreground/50 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition border border-transparent hover:border-rose-500/10"
                            title="Delete Resume"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 4. INTERVIEWS DIRECTORY */}
        {activeTab === 'interviews' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="glass rounded-2xl border-foreground/5 bg-black/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm font-black tracking-widest uppercase">
                  <thead>
                    <tr className="bg-foreground/[0.02] border-b border-foreground/5 text-foreground/50 text-xs">
                      <th className="p-4">Candidate</th>
                      <th className="p-4">Category Room</th>
                      <th className="p-4">Target Job Role</th>
                      <th className="p-4">Mock Score</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-foreground/75 font-semibold">
                    {interviews.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-4 text-center text-foreground/20 uppercase tracking-widest">No interview sessions simulated yet.</td>
                      </tr>
                    ) : interviews.map(int => (
                      <tr key={int._id} className="hover:bg-foreground/[0.01] transition-colors">
                        <td className="p-4 font-bold text-foreground capitalize">{int.candidateName} ({int.user?.email || 'N/A'})</td>
                        <td className="p-4 text-primary font-bold">{int.type}</td>
                        <td className="p-4">{int.targetRole}</td>
                        <td className="p-4"><span className="px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary font-sansDisplay font-black rounded-xl">{int.overallScore || 0}%</span></td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                            int.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' : 'bg-amber-500/10 text-amber-400 border border-amber-500/10'
                          }`}>
                            {int.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleDeleteInterview(int._id)}
                            className="p-2.5 text-foreground/50 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition border border-transparent hover:border-rose-500/10"
                            title="Delete Session"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 5. SYSTEM LOGS */}
        {activeTab === 'logs' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Type selector */}
            <div className="flex flex-col sm:flex-row gap-4 p-3 rounded-xl glass border-foreground/5 bg-card/40 items-center justify-between text-sm font-black tracking-widest uppercase">
              <div className="flex gap-2">
                <button
                  onClick={() => setLogType('activity')}
                  className={`px-5 py-3 rounded-full text-xs font-black tracking-widest uppercase transition-all duration-300 border ${
                    logType === 'activity' ? 'bg-primary text-white border-primary shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-foreground/5 text-foreground/60 border-foreground/10 hover:bg-foreground/10 hover:text-white'
                  }`}
                >
                  USER_ACTIVITY_LOGS
                </button>
                <button
                  onClick={() => setLogType('audit')}
                  className={`px-5 py-3 rounded-full text-xs font-black tracking-widest uppercase transition-all duration-300 border ${
                    logType === 'audit' ? 'bg-primary text-white border-primary shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-foreground/5 text-foreground/60 border-foreground/10 hover:bg-foreground/10 hover:text-white'
                  }`}
                >
                  ADMIN_AUDIT_LOGS
                </button>
              </div>

              <button
                onClick={exportLogsToCSV}
                className="btn-secondary py-3 px-6 text-sm font-black tracking-widest uppercase flex items-center gap-2"
              >
                <Download className="h-4.5 w-4.5" /> EXPORT_CSV_LOGS
              </button>
            </div>

            {/* Logs Table */}
            <div className="glass rounded-2xl border-foreground/5 bg-black/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm font-black tracking-widest uppercase">
                  <thead>
                    <tr className="bg-foreground/[0.02] border-b border-foreground/5 text-foreground/50 text-xs">
                      <th className="p-4">Timestamp</th>
                      <th className="p-4">User / Operator</th>
                      <th className="p-4">IP Address</th>
                      <th className="p-4">Action & Details</th>
                      {logType === 'activity' && <th className="p-4">Client Info</th>}
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-foreground/75 font-semibold lowercase">
                    {logs.length === 0 ? (
                      <tr>
                        <td colSpan={logType === 'activity' ? 6 : 5} className="p-4 text-center text-foreground/20 uppercase tracking-widest">No logs registered under this category.</td>
                      </tr>
                    ) : logs.map(log => (
                      <tr key={log._id} className="hover:bg-foreground/[0.01] transition-colors">
                        <td className="p-4 text-foreground/60">{new Date(log.createdAt).toLocaleString()}</td>
                        <td className="p-4 font-bold text-white">{log.user?.email || log.name || 'Guest'}</td>
                        <td className="p-4 select-all">{log.ipAddress || '127.0.0.1'}</td>
                        <td className="p-4 font-bold text-foreground capitalize">{log.action}: <span className="font-normal text-foreground/60 lowercase">{log.details}</span></td>
                        {logType === 'activity' && (
                          <td className="p-4 text-foreground/60">{log.device || 'Desktop'} / {log.browser || 'Chrome'}</td>
                        )}
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                            log.status === 'failed' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/10' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'
                          }`}>
                            {log.status || 'success'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 6. CONTENT CONTROL MANAGER */}
        {activeTab === 'content' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 animate-fadeIn text-xs font-semibold">
            
            {/* Companies Panel */}
            <div className="p-3 glass rounded-2xl border-foreground/5 bg-card/40 space-y-6">
              <div>
                <h3 className="font-sansDisplay font-bold text-sm tracking-widest text-foreground/50 uppercase flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary" /> Target Companies CRUD
                </h3>
                <p className="text-sm font-medium text-foreground/60 uppercase mt-0.5">Manage details of target companies for student preparation roadmaps.</p>
              </div>

              {/* Add form */}
              <form onSubmit={handleCreateCompanySubmit} className="space-y-4 p-4 bg-foreground/[0.01] rounded-2xl border border-foreground/5 text-sm font-black tracking-widest uppercase">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    required
                    value={newCompanyName}
                    onChange={(e) => setNewCompanyName(e.target.value)}
                    placeholder="COMPANY NAME (E.G. GOOGLE)"
                    className="p-3 bg-foreground/5 border border-foreground/5 rounded-full text-foreground placeholder:text-white/10 focus:outline-none focus:border-primary/20 text-sm"
                  />
                  <input
                    type="text"
                    value={newCompanyIndustry}
                    onChange={(e) => setNewCompanyIndustry(e.target.value)}
                    placeholder="INDUSTRY (E.G. TECH)"
                    className="p-3 bg-foreground/5 border border-foreground/5 rounded-full text-foreground placeholder:text-white/10 focus:outline-none focus:border-primary/20 text-sm"
                  />
                </div>
                <input
                  type="text"
                  value={newCompanyWebsite}
                  onChange={(e) => setNewCompanyWebsite(e.target.value)}
                  placeholder="WEBSITE URL (E.G. WWW.GOOGLE.COM)"
                  className="w-full p-3 bg-foreground/5 border border-foreground/5 rounded-full text-foreground placeholder:text-white/10 focus:outline-none focus:border-primary/20 text-sm"
                />
                <button
                  type="submit"
                  className="btn-primary w-full py-3 text-sm font-black tracking-widest uppercase"
                >
                  CREATE_COMPANY_LISTING
                </button>
              </form>

              {/* Company List */}
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 text-sm font-black tracking-widest uppercase">
                {companies.map(c => (
                  <div key={c._id} className="p-4 border border-foreground/5 rounded-2xl flex items-center justify-between bg-foreground/[0.02] hover:border-foreground/10 transition-colors">
                    <div>
                      <h4 className="font-bold flex items-center gap-2 text-foreground capitalize">{c.name} <span className="text-xs text-foreground/50">({c.industry})</span></h4>
                      <p className="text-xs text-primary hover:underline cursor-pointer lowercase">{c.website}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteCompany(c._id)}
                      className="p-2 text-foreground/50 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition border border-transparent hover:border-rose-500/10"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Learning Resources Panel */}
            <div className="p-3 glass rounded-2xl border-foreground/5 bg-card/40 space-y-6">
              <div>
                <h3 className="font-sansDisplay font-bold text-sm tracking-widest text-foreground/50 uppercase flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary" /> Learning Curriculum CRUD
                </h3>
                <p className="text-sm font-medium text-foreground/60 uppercase mt-0.5">Manage learning curriculum catalogs (DSA, System Design, DevOps).</p>
              </div>

              {/* Add form */}
              <form onSubmit={handleCreateResourceSubmit} className="space-y-4 p-4 bg-foreground/[0.01] rounded-2xl border border-foreground/5 text-sm font-black tracking-widest uppercase">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    required
                    value={newResourceTitle}
                    onChange={(e) => setNewResourceTitle(e.target.value)}
                    placeholder="RESOURCE TITLE..."
                    className="p-3 bg-foreground/5 border border-foreground/5 rounded-full text-foreground placeholder:text-white/10 focus:outline-none focus:border-primary/20 text-sm"
                  />
                  <select
                    value={newResourceCategory}
                    onChange={(e) => setNewResourceCategory(e.target.value)}
                    className="p-3 bg-foreground/5 border border-foreground/5 rounded-full text-white focus:outline-none font-black tracking-widest text-sm"
                  >
                    <option className="bg-black text-white" value="DSA">DSA Practice</option>
                    <option className="bg-black text-white" value="DevOps">DevOps Roadmap</option>
                    <option className="bg-black text-white" value="System Design">System Design Guides</option>
                    <option className="bg-black text-white" value="General">General Prep</option>
                  </select>
                </div>
                <input
                  type="text"
                  value={newResourceLink}
                  onChange={(e) => setNewResourceLink(e.target.value)}
                  placeholder="URL LINK (E.G. CODEFORCES.COM)"
                  className="w-full p-3 bg-foreground/5 border border-foreground/5 rounded-full text-foreground placeholder:text-white/10 focus:outline-none focus:border-primary/20 text-sm"
                />
                <button
                  type="submit"
                  className="btn-primary w-full py-3 text-sm font-black tracking-widest uppercase"
                >
                  CREATE_RESOURCE_ITEM
                </button>
              </form>

              {/* Resource List */}
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 text-sm font-black tracking-widest uppercase">
                {resources.map(r => (
                  <div key={r._id} className="p-4 border border-foreground/5 rounded-2xl flex items-center justify-between bg-foreground/[0.02] hover:border-foreground/10 transition-colors">
                    <div>
                      <h4 className="font-bold text-foreground capitalize">{r.title}</h4>
                      <span className="text-xs font-black px-2 py-0.5 bg-foreground/5 rounded border border-foreground/5 text-foreground/60 block mt-1.5 w-fit">{r.category}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteResource(r._id)}
                      className="p-2 text-foreground/50 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition border border-transparent hover:border-rose-500/10"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 7. SYSTEM CONFIGURATION */}
        {activeTab === 'config' && (
          <div className="space-y-8 animate-fadeIn text-sm font-black tracking-widest uppercase">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              
              {/* Platform Settings */}
              <form onSubmit={handleSaveConfig} className="p-3 glass rounded-2xl border-foreground/5 bg-card/40 space-y-6">
                <div>
                  <h3 className="font-sansDisplay font-bold text-sm tracking-widest text-foreground/50 uppercase flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" /> Platform Configurations
                  </h3>
                  <p className="text-xs font-medium text-foreground/60 uppercase mt-0.5">Manage simulated global variables and interface options.</p>
                </div>

                <div className="space-y-6">
                  <div className="flex justify-between items-center p-4 bg-foreground/[0.02] rounded-2xl border border-foreground/5">
                    <div>
                      <h4 className="font-bold text-white">Maintenance Mode</h4>
                      <p className="text-xs text-foreground/50 mt-0.5">Put the application into simulated maintenance mode.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={maintenanceMode}
                        onChange={(e) => setMaintenanceMode(e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-10 h-6 bg-foreground/5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white/40 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-500 peer-checked:after:bg-white peer-checked:after:opacity-100"></div>
                    </label>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground/50 uppercase">Active AI model endpoint</label>
                    <select
                      value={llmModel}
                      onChange={(e) => setLlmModel(e.target.value)}
                      className="w-full p-3 bg-foreground/5 border border-foreground/5 rounded-full text-white focus:outline-none font-black tracking-widest text-sm"
                    >
                      <option className="bg-black" value="gemini-2.5-flash">gemini-2.5-flash</option>
                      <option className="bg-black" value="gemini-1.5-pro">gemini-1.5-pro</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-foreground/50 uppercase font-sansDisplay">Max Resumes / User</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={maxResumes}
                        onChange={(e) => setMaxResumes(parseInt(e.target.value) || 0)}
                        className="w-full p-3 bg-foreground/5 border border-foreground/5 rounded-full text-white focus:outline-none font-black tracking-widest font-sansDisplay text-center"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-foreground/50 uppercase font-sansDisplay">Max Interviews / User</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={maxInterviews}
                        onChange={(e) => setMaxInterviews(parseInt(e.target.value) || 0)}
                        className="w-full p-3 bg-foreground/5 border border-foreground/5 rounded-full text-white focus:outline-none font-black tracking-widest font-sansDisplay text-center"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full py-2.5 text-sm font-black tracking-widest uppercase"
                >
                  SAVE_PLATFORM_SETTINGS
                </button>
              </form>

              {/* Maintenance Tools */}
              <div className="p-3 glass rounded-2xl border-foreground/5 bg-card/40 space-y-6">
                <div>
                  <h3 className="font-sansDisplay font-bold text-sm tracking-widest text-rose-500 uppercase flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5" /> Administrative System Tools
                  </h3>
                  <p className="text-xs font-medium text-foreground/60 uppercase mt-0.5">Perform database maintenance and clean metadata tables.</p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 border border-rose-500/10 bg-rose-500/[0.02] rounded-2xl space-y-4">
                    <h4 className="font-bold text-rose-400 flex items-center gap-1.5">
                      <AlertTriangle className="h-4.5 w-4.5" /> Danger Zone: Prune Activity Logs
                    </h4>
                    <p className="text-xs text-foreground/60 leading-relaxed normal-case">
                      This action will delete all recorded student actions from the system database. This action is irreversible.
                    </p>
                    <button
                      onClick={() => handlePruneLogs('activity')}
                      className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full transition text-xs font-black uppercase tracking-widest shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                    >
                      PRUNE_USER_ACTIVITY_LOGS
                    </button>
                  </div>

                  <div className="p-4 border border-rose-500/10 bg-rose-500/[0.02] rounded-2xl space-y-4">
                    <h4 className="font-bold text-rose-400 flex items-center gap-1.5">
                      <AlertTriangle className="h-4.5 w-4.5" /> Danger Zone: Prune Audit Logs
                    </h4>
                    <p className="text-xs text-foreground/60 leading-relaxed normal-case">
                      This action will delete all recorded admin operations from the system database. This action is irreversible.
                    </p>
                    <button
                      onClick={() => handlePruneLogs('audit')}
                      className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full transition text-xs font-black uppercase tracking-widest shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                    >
                      PRUNE_ADMIN_AUDIT_LOGS
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* EDIT USER CONFIG DIALOG */}
      {editingUser && (
        <div className="fixed inset-0 bg-card/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass w-full max-w-md border border-foreground/10 rounded-[1.5rem] shadow-2xl p-3 space-y-6 bg-black/90 animate-fadeIn text-sm font-black tracking-widest uppercase">
            <div className="pb-4 border-b border-foreground/5 flex justify-between items-center">
              <h4 className="font-sansDisplay font-bold text-sm uppercase text-white">MODIFY_ACCOUNT_DETAILS</h4>
              <button 
                onClick={() => setEditingUser(null)} 
                className="text-xs font-black text-foreground/60 hover:text-white"
              >
                CLOSE_X
              </button>
            </div>
            
            <form onSubmit={handleUpdateUserSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground/50 uppercase">Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-3 bg-foreground/5 border border-foreground/5 rounded-full text-white focus:outline-none font-black text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground/50 uppercase">Email Address</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full p-3 bg-foreground/5 border border-foreground/5 rounded-full text-white focus:outline-none font-black text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground/50 uppercase">Platform Role</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full p-3 bg-foreground/5 border border-foreground/5 rounded-full text-white focus:outline-none font-black text-sm"
                  >
                    <option className="bg-black" value="student">STUDENT</option>
                    <option className="bg-black" value="admin">ADMIN</option>
                    <option className="bg-black" value="user">USER_LEGACY</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground/50 uppercase">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full p-3 bg-foreground/5 border border-foreground/5 rounded-full text-white focus:outline-none font-black text-sm"
                  >
                    <option className="bg-black" value="active">ACTIVE</option>
                    <option className="bg-black" value="suspended">SUSPENDED</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground/50 uppercase">Force Reset Password (Optional)</label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="NEW SECURE KEY STRING..."
                  className="w-full p-3 bg-foreground/5 border border-foreground/5 rounded-full text-white focus:outline-none font-black text-sm"
                />
              </div>

              <button
                type="submit"
                className="btn-primary w-full py-2 text-sm font-black tracking-widest uppercase mt-4"
              >
                SAVE_CONFIGURATIONS
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE USER DIALOG */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-card/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass w-full max-w-md border border-foreground/10 rounded-[1.5rem] shadow-2xl p-3 space-y-6 bg-black/90 animate-fadeIn text-sm font-black tracking-widest uppercase">
            <div className="pb-4 border-b border-foreground/5 flex justify-between items-center">
              <h4 className="font-sansDisplay font-bold text-sm uppercase text-white">CREATE_NEW_USER_ACCOUNT</h4>
              <button 
                onClick={() => setShowCreateModal(false)} 
                className="text-xs font-black text-foreground/60 hover:text-white"
              >
                CLOSE_X
              </button>
            </div>
            
            <form onSubmit={handleCreateUserSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground/50 uppercase">Name</label>
                <input
                  type="text"
                  required
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="ENTER FULL NAME"
                  className="w-full p-3 bg-foreground/5 border border-foreground/5 rounded-full text-white focus:outline-none font-black text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground/50 uppercase">Email Address</label>
                <input
                  type="email"
                  required
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  placeholder="ENTER EMAIL ADDRESS"
                  className="w-full p-3 bg-foreground/5 border border-foreground/5 rounded-full text-white focus:outline-none font-black text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground/50 uppercase">Password</label>
                <input
                  type="password"
                  required
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  placeholder="ENTER SECURE PASSWORD"
                  className="w-full p-3 bg-foreground/5 border border-foreground/5 rounded-full text-white focus:outline-none font-black text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground/50 uppercase">Platform Role</label>
                  <select
                    value={createRole}
                    onChange={(e) => setCreateRole(e.target.value)}
                    className="w-full p-3 bg-foreground/5 border border-foreground/5 rounded-full text-white focus:outline-none font-black text-sm"
                  >
                    <option className="bg-black" value="student">STUDENT</option>
                    <option className="bg-black" value="admin">ADMIN</option>
                    <option className="bg-black" value="user">USER_LEGACY</option>
                    <option className="bg-black" value="mentor">MENTOR</option>
                    <option className="bg-black" value="recruiter">RECRUITER</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground/50 uppercase">Status</label>
                  <select
                    value={createStatus}
                    onChange={(e) => setCreateStatus(e.target.value)}
                    className="w-full p-3 bg-foreground/5 border border-foreground/5 rounded-full text-white focus:outline-none font-black text-sm"
                  >
                    <option className="bg-black" value="active">ACTIVE</option>
                    <option className="bg-black" value="suspended">SUSPENDED</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary w-full py-2 text-sm font-black tracking-widest uppercase mt-4"
              >
                CREATE_ACCOUNT
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
