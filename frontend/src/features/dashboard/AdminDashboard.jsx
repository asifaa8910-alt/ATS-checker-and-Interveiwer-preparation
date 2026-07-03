import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ShieldCheck, Users, FileText, Video, Activity, Settings, 
  Search, Trash2, ShieldAlert, CheckCircle, AlertTriangle, 
  Loader2, RefreshCw, Plus, Key, Ban, Unlock, Download, ExternalLink,
  Layers, Database, Cpu, HardDrive
} from 'lucide-react';

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
        setMessage('User updated successfully.');
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
      setError('Please fill in all fields.');
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
        setMessage('User created successfully.');
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
        setMessage(res.data.message);
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
    setMessage('System configurations updated successfully.');
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this user account?')) return;
    try {
      const res = await axios.delete(`/api/admin/users/${id}`);
      if (res.data.success) {
        setMessage('User deleted successfully.');
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
        setMessage('Resume deleted successfully.');
        fetchResumes();
      }
    } catch (err) {
      setError('Failed to delete resume.');
    }
  };

  const handleDeleteInterview = async (id) => {
    if (!window.confirm('Remove this interview from logs?')) return;
    try {
      const res = await axios.delete(`/api/admin/interviews/${id}`);
      if (res.data.success) {
        setMessage('Interview logs deleted successfully.');
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
        setMessage('Company added successfully.');
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
    if (!window.confirm('Delete this company?')) return;
    try {
      const res = await axios.delete(`/api/admin/companies/${id}`);
      if (res.data.success) {
        setMessage('Company removed.');
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
        setMessage('Resource added.');
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
        setMessage('Resource deleted.');
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
    <div className="space-y-6 max-w-7xl mx-auto text-foreground">
      
      {/* Title */}
      <div className="flex justify-between items-center pb-4 border-b">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-lg">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Admin Control Panel</h1>
            <p className="text-sm text-muted-foreground">Manage platform components, audit logs, and system performance configurations.</p>
          </div>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="p-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground border border-border transition flex items-center gap-1.5 text-xs font-semibold"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Notifications/Errors */}
      {error && (
        <div className="p-4 border border-destructive/20 bg-destructive/10 text-destructive rounded-xl flex items-center gap-2.5 text-xs font-semibold">
          <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
          {error}
        </div>
      )}
      {message && (
        <div className="p-4 border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center gap-2.5 text-xs font-semibold animate-fadeIn">
          <CheckCircle className="h-4.5 w-4.5 shrink-0" />
          {message}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex border-b text-xs font-bold gap-1 overflow-x-auto select-none">
        {[
          { id: 'overview', label: 'Platform Status', icon: Layers },
          { id: 'users', label: 'User Directory', icon: Users },
          { id: 'resumes', label: 'Resume Scanner', icon: FileText },
          { id: 'interviews', label: 'Interviews Log', icon: Video },
          { id: 'logs', label: 'System Logs', icon: Activity },
          { id: 'content', label: 'Content Control', icon: Settings },
          { id: 'config', label: 'System Config', icon: ShieldAlert }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 border-b-2 flex items-center gap-2 transition shrink-0 ${
                activeTab === tab.id 
                  ? 'border-primary text-primary font-black' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
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
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="p-5 border rounded-2xl bg-card space-y-1">
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Total User Profiles</span>
                <h3 className="text-3xl font-black">{stats.totalUsers}</h3>
              </div>
              <div className="p-5 border rounded-2xl bg-card space-y-1">
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Active Status Sessions</span>
                <h3 className="text-3xl font-black text-emerald-500">{stats.activeUsers}</h3>
              </div>
              <div className="p-5 border rounded-2xl bg-card space-y-1">
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Scanned Resumes</span>
                <h3 className="text-3xl font-black text-indigo-500">{stats.totalResumes}</h3>
              </div>
              <div className="p-5 border rounded-2xl bg-card space-y-1">
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Mock Simulations Done</span>
                <h3 className="text-3xl font-black text-amber-500">{stats.totalInterviews}</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Health Panel */}
              <div className="p-6 border rounded-2xl bg-card space-y-4">
                <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                  <Database className="h-4.5 w-4.5 text-primary" /> Server Resource Monitor
                </h3>
                <div className="space-y-4 text-xs font-semibold">
                  <div className="flex justify-between items-center p-3 bg-muted/40 rounded-xl border border-border">
                    <span className="flex items-center gap-1.5"><Cpu className="h-4 w-4 text-muted-foreground" /> Simulated CPU Usage</span>
                    <span className="font-black text-primary">{stats.systemHealth.cpuUsage}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/40 rounded-xl border border-border">
                    <span className="flex items-center gap-1.5"><HardDrive className="h-4 w-4 text-muted-foreground" /> Simulated Memory Usage</span>
                    <span className="font-black text-primary">{stats.systemHealth.memoryUsage}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/40 rounded-xl border border-border">
                    <span>MongoDB Database status</span>
                    <span className="text-emerald-500 font-extrabold capitalize">{stats.systemHealth.dbStatus}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/40 rounded-xl border border-border">
                    <span>Docker Containers status</span>
                    <span className="text-primary font-extrabold">{stats.systemHealth.dockerStatus}</span>
                  </div>
                </div>
              </div>

              {/* AI Cost Panel */}
              <div className="p-6 border border-border rounded-2xl bg-card space-y-4">
                <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                  <ShieldAlert className="h-4.5 w-4.5 text-amber-500" /> AI API Audit Control
                </h3>
                <div className="space-y-4 text-xs font-semibold">
                  <div className="flex justify-between items-center p-3 bg-muted/40 rounded-xl border border-border">
                    <span>API Tokens Consumed</span>
                    <span className="font-black">{stats.aiUsage.tokensUsed} tokens</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/40 rounded-xl border border-border">
                    <span>Average API Response Latency</span>
                    <span className="font-black">{stats.aiUsage.responseTime}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/40 rounded-xl border border-border">
                    <span>Failed Requests / Penalisations</span>
                    <span className="text-rose-500 font-black">{stats.aiUsage.failedRequests} fails</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/40 rounded-xl border border-border">
                    <span>Accumulated LLM cost estimation</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-black">{stats.aiUsage.totalCosts}</span>
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
                <h2 className="text-lg font-bold tracking-tight">User Directory</h2>
                <p className="text-xs text-muted-foreground">Manage user configurations, roles, account status, and create new users.</p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition flex items-center gap-1.5 text-xs font-bold"
              >
                <Plus className="h-4 w-4" /> Create User
              </button>
            </div>

            {/* Search Filters Row */}
            <div className="flex flex-col sm:flex-row gap-4 p-4 border rounded-xl bg-card shadow-sm text-xs font-semibold">
              <div className="flex-1 relative flex items-center">
                <Search className="h-4 w-4 text-muted-foreground absolute left-3" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search user email or profile name..."
                  className="w-full pl-9 pr-4 py-2 bg-background border rounded-lg focus:outline-none"
                />
              </div>
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="p-2 border rounded-lg bg-background"
              >
                <option value="all">All Roles</option>
                <option value="student">Student</option>
                <option value="admin">Admin</option>
                <option value="user">User Legacy</option>
              </select>
              <select
                value={userStatusFilter}
                onChange={(e) => setUserStatusFilter(e.target.value)}
                className="p-2 border rounded-lg bg-background"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
              <button
                onClick={fetchUsers}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/95 transition"
              >
                Apply Filters
              </button>
            </div>

            {/* User List Table */}
            <div className="border rounded-2xl bg-card overflow-hidden shadow-sm text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b border-border uppercase font-bold text-muted-foreground">
                    <th className="p-4">Profile Info</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Account Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-muted-foreground font-semibold">No registered users matched your constraints.</td>
                    </tr>
                  ) : users.map(user => (
                    <tr key={user._id} className="border-b border-border last:border-0 hover:bg-muted/30 font-semibold text-foreground/90">
                      <td className="p-4 font-bold">{user.name}</td>
                      <td className="p-4">{user.email}</td>
                      <td className="p-4"><span className="px-2 py-0.5 border border-border rounded uppercase text-[10px]">{user.role}</span></td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          user.status === 'suspended' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                        }`}>
                          {user.status || 'active'}
                        </span>
                      </td>
                      <td className="p-4 text-right flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleEditUserClick(user)}
                          className="px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-lg transition"
                        >
                          Modify Config
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition"
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. RESUME DIRECTORY */}
        {activeTab === 'resumes' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border border-border rounded-2xl bg-card overflow-hidden shadow-sm text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b border-border uppercase font-bold text-muted-foreground">
                    <th className="p-4">Uploader</th>
                    <th className="p-4">Resume File Name</th>
                    <th className="p-4">Extracted ATS Score</th>
                    <th className="p-4">Uploaded at</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {resumes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-muted-foreground font-semibold">No uploaded resume assets found.</td>
                    </tr>
                  ) : resumes.map(res => (
                    <tr key={res._id} className="border-b border-border last:border-0 hover:bg-muted/30 font-semibold">
                      <td className="p-4 font-bold">{res.user?.name || 'Deleted User'} ({res.user?.email || 'N/A'})</td>
                      <td className="p-4 flex items-center gap-1.5"><FileText className="h-4 w-4 text-primary shrink-0" /> {res.fileName}</td>
                      <td className="p-4"><span className="px-2 py-0.5 bg-muted border border-border rounded-lg font-black">{res.atsScore}%</span></td>
                      <td className="p-4">{new Date(res.createdAt).toLocaleDateString()}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteResume(res._id)}
                          className="p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition"
                          title="Delete Resume"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. INTERVIEWS DIRECTORY */}
        {activeTab === 'interviews' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border border-border rounded-2xl bg-card overflow-hidden shadow-sm text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b border-border uppercase font-bold text-muted-foreground">
                    <th className="p-4">Candidate</th>
                    <th className="p-4">Category Room</th>
                    <th className="p-4">Target Job Role</th>
                    <th className="p-4">Mock Score</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {interviews.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-muted-foreground font-semibold">No interview sessions simulated yet.</td>
                    </tr>
                  ) : interviews.map(int => (
                    <tr key={int._id} className="border-b border-border last:border-0 hover:bg-muted/30 font-semibold">
                      <td className="p-4 font-bold">{int.candidateName} ({int.user?.email || 'N/A'})</td>
                      <td className="p-4 uppercase font-bold">{int.type}</td>
                      <td className="p-4">{int.targetRole}</td>
                      <td className="p-4"><span className="px-2.5 py-0.5 bg-muted border border-border rounded-lg font-black">{int.overallScore || 0}%</span></td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          int.status === 'completed' ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/10' : 'bg-amber-500/15 text-amber-500 border border-amber-500/10'
                        }`}>
                          {int.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteInterview(int._id)}
                          className="p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition"
                          title="Delete Session"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. SYSTEM LOGS */}
        {activeTab === 'logs' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Type selector */}
            <div className="flex gap-4 p-4 border border-border bg-card items-center justify-between text-xs font-semibold">
              <div className="flex gap-2">
                <button
                  onClick={() => setLogType('activity')}
                  className={`px-3 py-1.5 rounded-lg border uppercase ${
                    logType === 'activity' ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted hover:bg-muted/80 text-foreground border-border'
                  }`}
                >
                  Activity Logs (User Actions)
                </button>
                <button
                  onClick={() => setLogType('audit')}
                  className={`px-3 py-1.5 rounded-lg border uppercase ${
                    logType === 'audit' ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted hover:bg-muted/80 text-foreground border-border'
                  }`}
                >
                  Audit Logs (Admin Operations)
                </button>
              </div>

              <button
                onClick={exportLogsToCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
              >
                <Download className="h-4 w-4" /> Export CSV logs
              </button>
            </div>

            {/* Logs Table */}
            <div className="border border-border rounded-2xl bg-card overflow-hidden shadow-sm text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b border-border uppercase font-bold text-muted-foreground">
                    <th className="p-4">Timestamp</th>
                    <th className="p-4">User</th>
                    <th className="p-4">IP Address</th>
                    <th className="p-4">Action</th>
                    {logType === 'activity' && <th className="p-4">Client Info</th>}
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={logType === 'activity' ? 6 : 5} className="p-6 text-center text-muted-foreground font-semibold">No logs registered under this category.</td>
                    </tr>
                  ) : logs.map(log => (
                    <tr key={log._id} className="border-b border-border last:border-0 hover:bg-muted/30 font-semibold text-foreground/85">
                      <td className="p-4 font-normal text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</td>
                      <td className="p-4 font-bold">{log.user?.email || log.name || 'Guest'}</td>
                      <td className="p-4">{log.ipAddress || '127.0.0.1'}</td>
                      <td className="p-4 font-extrabold">{log.action}: <span className="font-normal text-muted-foreground">{log.details}</span></td>
                      {logType === 'activity' && (
                        <td className="p-4 text-muted-foreground">{log.device || 'Desktop'} / {log.browser || 'Chrome'}</td>
                      )}
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          log.status === 'failed' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/15' : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/15'
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
        )}

        {/* 6. CONTENT CONTROL MANAGER */}
        {activeTab === 'content' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
            
            {/* Companies Panel */}
            <div className="p-6 border border-border bg-card space-y-6">
              <div>
                <h3 className="font-bold text-base tracking-tight flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary animate-pulse" /> Company Listings CRUD
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">Manage details of target companies for student preparation roadmaps.</p>
              </div>

              {/* Add form */}
              <form onSubmit={handleCreateCompanySubmit} className="space-y-3 p-4 bg-muted/20 rounded-xl border border-border text-xs font-semibold">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    value={newCompanyName}
                    onChange={(e) => setNewCompanyName(e.target.value)}
                    placeholder="Company Name (e.g. Google)"
                    className="p-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <input
                    type="text"
                    value={newCompanyIndustry}
                    onChange={(e) => setNewCompanyIndustry(e.target.value)}
                    placeholder="Industry (e.g. Technology)"
                    className="p-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <input
                  type="text"
                  value={newCompanyWebsite}
                  onChange={(e) => setNewCompanyWebsite(e.target.value)}
                  placeholder="Website URL (e.g. www.google.com)"
                  className="w-full p-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-primary text-primary-foreground hover:bg-primary/95 rounded-lg transition font-bold"
                >
                  Create Company listing
                </button>
              </form>

              {/* Company List */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 text-xs">
                {companies.map(c => (
                  <div key={c._id} className="p-3 border border-border rounded-xl flex items-center justify-between bg-card font-semibold">
                    <div>
                      <h4 className="font-bold flex items-center gap-1">{c.name} <span className="text-[10px] text-muted-foreground">({c.industry})</span></h4>
                      <p className="text-[10px] text-primary hover:underline cursor-pointer flex items-center gap-0.5">{c.website}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteCompany(c._id)}
                      className="p-1 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Learning Resources Panel */}
            <div className="p-6 border border-border bg-card space-y-6">
              <div>
                <h3 className="font-bold text-base tracking-tight flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary animate-pulse" /> Learning Resources CRUD
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">Manage learning curriculum catalogs (DSA, System Design, DevOps).</p>
              </div>

              {/* Add form */}
              <form onSubmit={handleCreateResourceSubmit} className="space-y-3 p-4 bg-muted/20 rounded-xl border border-border text-xs font-semibold">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    value={newResourceTitle}
                    onChange={(e) => setNewResourceTitle(e.target.value)}
                    placeholder="Resource Title (e.g. Master Binary Trees)"
                    className="p-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <select
                    value={newResourceCategory}
                    onChange={(e) => setNewResourceCategory(e.target.value)}
                    className="p-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="DSA">DSA Practice</option>
                    <option value="DevOps">DevOps Roadmap</option>
                    <option value="System Design">System Design Guides</option>
                    <option value="General">General Prep</option>
                  </select>
                </div>
                <input
                  type="text"
                  value={newResourceLink}
                  onChange={(e) => setNewResourceLink(e.target.value)}
                  placeholder="URL link details (e.g. codeforces.com)"
                  className="w-full p-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-primary text-primary-foreground hover:bg-primary/95 rounded-lg transition font-bold"
                >
                  Create Resource item
                </button>
              </form>

              {/* Resource List */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 text-xs">
                {resources.map(r => (
                  <div key={r._id} className="p-3 border border-border rounded-xl flex items-center justify-between bg-card font-semibold">
                    <div>
                      <h4 className="font-bold">{r.title}</h4>
                      <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 bg-muted rounded border border-border">{r.category}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteResource(r._id)}
                      className="p-1 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 7. SYSTEM CONFIGURATION */}
        {activeTab === 'config' && (
          <div className="space-y-8 animate-fadeIn text-xs font-semibold">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Platform Settings */}
              <form onSubmit={handleSaveConfig} className="p-6 border border-border bg-card rounded-2xl space-y-6">
                <div>
                  <h3 className="font-bold text-base tracking-tight flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" /> Platform Configurations
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Manage simulated global variables and interface options.</p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted/40 rounded-xl border border-border">
                    <div>
                      <h4 className="font-bold">Maintenance Mode</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Put the application into simulated maintenance mode.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={maintenanceMode}
                        onChange={(e) => setMaintenanceMode(e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Active AI model endpoint</label>
                    <select
                      value={llmModel}
                      onChange={(e) => setLlmModel(e.target.value)}
                      className="w-full p-2.5 border bg-background rounded-xl focus:outline-none uppercase"
                    >
                      <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                      <option value="gemini-1.5-pro">gemini-1.5-pro</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Max Resumes / User</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={maxResumes}
                        onChange={(e) => setMaxResumes(parseInt(e.target.value) || 0)}
                        className="w-full p-2.5 border bg-background rounded-xl focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Max Interviews / User</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={maxInterviews}
                        onChange={(e) => setMaxInterviews(parseInt(e.target.value) || 0)}
                        className="w-full p-2.5 border bg-background rounded-xl focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl text-sm hover:bg-primary/95 transition shadow-lg"
                >
                  Save Platform Settings
                </button>
              </form>

              {/* Maintenance Tools */}
              <div className="p-6 border border-border bg-card rounded-2xl space-y-6">
                <div>
                  <h3 className="font-bold text-base tracking-tight flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-rose-500" /> Administrative System Tools
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Perform database maintenance and clean metadata tables.</p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 border border-rose-500/15 bg-rose-500/5 rounded-xl space-y-3">
                    <h4 className="font-bold text-rose-500 flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4" /> Danger Zone: Prune Activity Logs
                    </h4>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      This action will delete all recorded student actions from the system database. This action is irreversible.
                    </p>
                    <button
                      onClick={() => handlePruneLogs('activity')}
                      className="px-3.5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition text-xs font-bold"
                    >
                      Prune User Activity Logs
                    </button>
                  </div>

                  <div className="p-4 border border-rose-500/15 bg-rose-500/5 rounded-xl space-y-3">
                    <h4 className="font-bold text-rose-500 flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4" /> Danger Zone: Prune Audit Logs
                    </h4>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      This action will delete all recorded admin operations from the system database. This action is irreversible.
                    </p>
                    <button
                      onClick={() => handlePruneLogs('audit')}
                      className="px-3.5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition text-xs font-bold"
                    >
                      Prune Admin Audit Logs
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md border rounded-2xl shadow-2xl p-6 space-y-4 animate-fadeIn">
            <div className="pb-3 border-b flex justify-between items-center">
              <h4 className="font-black text-sm uppercase">Modify Account Details</h4>
              <button 
                onClick={() => setEditingUser(null)} 
                className="text-xs font-bold text-muted-foreground hover:underline"
              >
                Close
              </button>
            </div>
            
            <form onSubmit={handleUpdateUserSubmit} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2.5 border bg-background rounded-xl focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Email</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full p-2.5 border bg-background rounded-xl focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Platform Role</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full p-2.5 border bg-background rounded-xl focus:outline-none uppercase"
                  >
                    <option value="student">Student</option>
                    <option value="admin">Admin</option>
                    <option value="user">User Legacy</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full p-2.5 border bg-background rounded-xl focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Force Reset Password (Optional)</label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Type new secure key string..."
                  className="w-full p-2.5 border bg-background rounded-xl focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl text-sm hover:bg-primary/95 transition shadow-lg"
              >
                Save configurations
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE USER DIALOG */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md border rounded-2xl shadow-2xl p-6 space-y-4 animate-fadeIn">
            <div className="pb-3 border-b flex justify-between items-center">
              <h4 className="font-black text-sm uppercase">Create New User Account</h4>
              <button 
                onClick={() => setShowCreateModal(false)} 
                className="text-xs font-bold text-muted-foreground hover:underline"
              >
                Close
              </button>
            </div>
            
            <form onSubmit={handleCreateUserSubmit} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Name</label>
                <input
                  type="text"
                  required
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full p-2.5 border bg-background rounded-xl focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Email</label>
                <input
                  type="email"
                  required
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full p-2.5 border bg-background rounded-xl focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Password</label>
                <input
                  type="password"
                  required
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  placeholder="Enter secure password"
                  className="w-full p-2.5 border bg-background rounded-xl focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Platform Role</label>
                  <select
                    value={createRole}
                    onChange={(e) => setCreateRole(e.target.value)}
                    className="w-full p-2.5 border bg-background rounded-xl focus:outline-none uppercase"
                  >
                    <option value="student">Student</option>
                    <option value="admin">Admin</option>
                    <option value="user">User Legacy</option>
                    <option value="mentor">Mentor</option>
                    <option value="recruiter">Recruiter</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Status</label>
                  <select
                    value={createStatus}
                    onChange={(e) => setCreateStatus(e.target.value)}
                    className="w-full p-2.5 border bg-background rounded-xl focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl text-sm hover:bg-primary/95 transition shadow-lg"
              >
                Create Account
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
