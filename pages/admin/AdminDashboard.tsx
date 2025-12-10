import React, { useState } from 'react';
import { Layout } from '../../components/Layout';
import { Button } from '../../components/Button';
import { useSystem } from '../../context/SystemContext';
import { Service, Counter, User, UserRole, TokenStatus, Token } from '../../types';
import { Trash2, Plus, Shield, Settings, Users, Monitor, Edit2, Search, History, Filter, ArrowUp, ArrowDown, ArrowUpDown, Calendar, Hash, Phone, User as UserIcon, Check } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { 
    services, counters, users, tokens,
    addService, updateService, deleteService,
    addCounter, updateCounter, deleteCounter,
    addUser, deleteUser 
  } = useSystem();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'SERVICES' | 'COUNTERS' | 'USERS' | 'HISTORY'>('SERVICES');

  // Form States
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [newService, setNewService] = useState({ code: '', name: '', description: '', estimatedTimeMinutes: 5 });

  const [showCounterForm, setShowCounterForm] = useState(false);
  const [editingCounterId, setEditingCounterId] = useState<string | null>(null);
  const [counterFormState, setCounterFormState] = useState({ name: '', assignedServiceIds: [] as string[] });

  const [showUserForm, setShowUserForm] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: UserRole.OPERATOR });

  // History Filter & Sort States
  const [filterTicket, setFilterTicket] = useState('');
  const [filterName, setFilterName] = useState('');
  const [filterPhone, setFilterPhone] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  
  const [filterService, setFilterService] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterCounter, setFilterCounter] = useState('ALL');
  
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ 
    key: 'createdAt', 
    direction: 'desc' 
  });

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  // Handlers
  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (newService.estimatedTimeMinutes < 1) {
      alert("Estimated time must be at least 1 minute.");
      return;
    }

    const duplicateCode = services.find(s => s.code === newService.code && s.id !== editingServiceId);
    if (duplicateCode) {
      alert(`Service code '${newService.code}' already exists. Please use a unique code.`);
      return;
    }

    if (editingServiceId) {
      const original = services.find(s => s.id === editingServiceId);
      if (original) {
        updateService({
          ...original,
          ...newService
        });
      }
    } else {
      addService(newService);
    }
    setNewService({ code: '', name: '', description: '', estimatedTimeMinutes: 5 });
    setEditingServiceId(null);
    setShowServiceForm(false);
  };

  const handleEditService = (service: Service) => {
    setNewService({
      code: service.code,
      name: service.name,
      description: service.description,
      estimatedTimeMinutes: service.estimatedTimeMinutes
    });
    setEditingServiceId(service.id);
    setShowServiceForm(true);
  };

  const handleDeleteService = (id: string) => {
    if (window.confirm('Are you sure you want to delete this service? This may affect existing tokens.')) {
      deleteService(id);
    }
  };

  const handleSaveCounter = (e: React.FormEvent) => {
    e.preventDefault();

    if (counterFormState.assignedServiceIds.length === 0) {
      if (!window.confirm("This counter has no services assigned. It won't be able to serve any customers. Continue?")) {
        return;
      }
    }

    if (editingCounterId) {
      const original = counters.find(c => c.id === editingCounterId);
      if (original) {
        updateCounter({
          ...original,
          name: counterFormState.name,
          assignedServiceIds: counterFormState.assignedServiceIds
        });
      }
    } else {
      addCounter({ ...counterFormState, status: 'CLOSED' });
    }
    setCounterFormState({ name: '', assignedServiceIds: [] });
    setEditingCounterId(null);
    setShowCounterForm(false);
  };

  const handleEditCounter = (counter: Counter) => {
    setCounterFormState({
      name: counter.name,
      assignedServiceIds: counter.assignedServiceIds
    });
    setEditingCounterId(counter.id);
    setShowCounterForm(true);
  };

  const handleDeleteCounter = (id: string) => {
    if (window.confirm('Are you sure you want to delete this counter?')) {
      deleteCounter(id);
    }
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    addUser(newUser);
    setNewUser({ name: '', email: '', role: UserRole.OPERATOR });
    setShowUserForm(false);
  };

  const toggleServiceAssignment = (serviceId: string) => {
    setCounterFormState(prev => {
      const exists = prev.assignedServiceIds.includes(serviceId);
      return {
        ...prev,
        assignedServiceIds: exists 
          ? prev.assignedServiceIds.filter(id => id !== serviceId)
          : [...prev.assignedServiceIds, serviceId]
      };
    });
  };

  // Sort Handler
  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortConfig.key !== column) return <ArrowUpDown className="w-3 h-3 text-gray-300 ml-1" />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="w-3 h-3 text-brand-600 ml-1" />
      : <ArrowDown className="w-3 h-3 text-brand-600 ml-1" />;
  };

  // Filter & Sort Tokens Logic
  const filteredAndSortedTokens = tokens
    .filter(token => {
      const matchesTicket = token.ticketNumber.toLowerCase().includes(filterTicket.toLowerCase());
      const matchesName = (token.customerName || '').toLowerCase().includes(filterName.toLowerCase());
      const matchesPhone = (token.customerPhone || '').toLowerCase().includes(filterPhone.toLowerCase());
      
      // Date Range Filtering (Local Time YYYY-MM-DD comparison)
      const d = new Date(token.createdAt);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const tokenDateStr = `${year}-${month}-${day}`;
      
      let matchesDate = true;
      if (filterStartDate && tokenDateStr < filterStartDate) matchesDate = false;
      if (filterEndDate && tokenDateStr > filterEndDate) matchesDate = false;
      
      const matchesService = filterService === 'ALL' || token.serviceId === filterService;
      const matchesStatus = filterStatus === 'ALL' || token.status === filterStatus;
      const matchesCounter = filterCounter === 'ALL' || token.counterId === filterCounter;
      
      return matchesTicket && matchesName && matchesPhone && matchesDate && matchesService && matchesStatus && matchesCounter;
    })
    .sort((a, b) => {
      const direction = sortConfig.direction === 'asc' ? 1 : -1;
      
      switch (sortConfig.key) {
        case 'ticketNumber':
          return a.ticketNumber.localeCompare(b.ticketNumber) * direction;
        case 'customerName':
          return (a.customerName || '').localeCompare(b.customerName || '') * direction;
        case 'serviceName': {
          const sA = services.find(s => s.id === a.serviceId)?.name || '';
          const sB = services.find(s => s.id === b.serviceId)?.name || '';
          return sA.localeCompare(sB) * direction;
        }
        case 'counterName': {
          const cA = counters.find(c => c.id === a.counterId)?.name || '';
          const cB = counters.find(c => c.id === b.counterId)?.name || '';
          if (!cA && !cB) return 0;
          if (!cA) return 1 * direction;
          if (!cB) return -1 * direction;
          return cA.localeCompare(cB) * direction;
        }
        case 'status':
          return a.status.localeCompare(b.status) * direction;
        case 'createdAt':
          return (a.createdAt - b.createdAt) * direction;
        case 'waitTime': {
          const getWait = (t: Token) => {
             if (t.calledAt) return t.calledAt - t.createdAt;
             if (t.status === TokenStatus.WAITING) return Date.now() - t.createdAt;
             return -1; 
          };
          return (getWait(a) - getWait(b)) * direction;
        }
        default:
          return 0;
      }
    });

  // Login Screen
  if (!currentUser) {
    return (
      <Layout>
        <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-xl shadow-lg">
          <div className="flex justify-center mb-6 text-brand-600">
            <Shield className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-center">Admin Access</h2>
          <p className="text-center text-gray-500 mb-8">Select an admin account to proceed.</p>
          <div className="space-y-4">
            {users.filter(u => u.role === UserRole.ADMIN).map(u => (
              <button
                key={u.id}
                onClick={() => handleLogin(u)}
                className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-brand-500 hover:bg-brand-50"
              >
                <div>
                  <div className="font-medium text-gray-900">{u.name}</div>
                  <div className="text-sm text-gray-500">{u.email}</div>
                </div>
                <div className="bg-brand-100 text-brand-700 px-2 py-1 rounded text-xs font-bold">
                  ADMIN
                </div>
              </button>
            ))}
            {users.filter(u => u.role === UserRole.ADMIN).length === 0 && (
              <div className="text-center text-red-500">
                No Admin users found. Please reset system data.
              </div>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-8 flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
             <Settings className="w-6 h-6 text-gray-500" />
             System Administration
           </h1>
           <p className="text-gray-500">Logged in as {currentUser.name}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setCurrentUser(null)}>Logout</Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[600px]">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('SERVICES')}
            className={`flex-1 min-w-[120px] py-4 text-sm font-medium text-center border-b-2 transition-colors ${
              activeTab === 'SERVICES' ? 'border-brand-600 text-brand-600 bg-brand-50' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Services ({services.length})
          </button>
          <button
            onClick={() => setActiveTab('COUNTERS')}
            className={`flex-1 min-w-[120px] py-4 text-sm font-medium text-center border-b-2 transition-colors ${
              activeTab === 'COUNTERS' ? 'border-brand-600 text-brand-600 bg-brand-50' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Counters ({counters.length})
          </button>
          <button
            onClick={() => setActiveTab('USERS')}
            className={`flex-1 min-w-[120px] py-4 text-sm font-medium text-center border-b-2 transition-colors ${
              activeTab === 'USERS' ? 'border-brand-600 text-brand-600 bg-brand-50' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`flex-1 min-w-[120px] py-4 text-sm font-medium text-center border-b-2 transition-colors ${
              activeTab === 'HISTORY' ? 'border-brand-600 text-brand-600 bg-brand-50' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Token History
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          
          {/* Services Tab */}
          {activeTab === 'SERVICES' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Service Configurations</h3>
                <Button onClick={() => {
                  setEditingServiceId(null);
                  setNewService({ code: '', name: '', description: '', estimatedTimeMinutes: 5 });
                  setShowServiceForm(true);
                }} size="sm"><Plus className="w-4 h-4 mr-1" /> Add Service</Button>
              </div>
              
              {showServiceForm && (
                <div className="mb-8 bg-gray-50 p-6 rounded-xl border border-gray-200">
                   <h4 className="font-bold mb-4">{editingServiceId ? 'Edit Service' : 'New Service'}</h4>
                   <form onSubmit={handleSaveService} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input 
                        placeholder="Service Name" 
                        required 
                        className="p-2 border rounded"
                        value={newService.name}
                        onChange={e => setNewService({...newService, name: e.target.value})}
                      />
                      <input 
                        placeholder="Code (e.g. D, W, A)" 
                        required 
                        maxLength={2}
                        className="p-2 border rounded uppercase"
                        value={newService.code}
                        onChange={e => setNewService({...newService, code: e.target.value.toUpperCase()})}
                      />
                      <input 
                        placeholder="Est. Time (minutes)" 
                        required 
                        type="number"
                        min="1"
                        className="p-2 border rounded"
                        value={newService.estimatedTimeMinutes}
                        onChange={e => setNewService({...newService, estimatedTimeMinutes: parseInt(e.target.value)})}
                      />
                      <input 
                        placeholder="Description" 
                        className="p-2 border rounded"
                        value={newService.description}
                        onChange={e => setNewService({...newService, description: e.target.value})}
                      />
                      <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                        <Button type="button" variant="secondary" onClick={() => {
                          setShowServiceForm(false);
                          setEditingServiceId(null);
                        }}>Cancel</Button>
                        <Button type="submit">{editingServiceId ? 'Update Service' : 'Save Service'}</Button>
                      </div>
                   </form>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Est. Time</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {services.map(s => (
                      <tr key={s.id}>
                        <td className="px-6 py-4 whitespace-nowrap font-mono font-bold text-brand-600">{s.code}</td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">{s.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{s.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{s.estimatedTimeMinutes} mins</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleEditService(s)} className="text-gray-400 hover:text-brand-600"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => handleDeleteService(s.id)} className="text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Counters Tab */}
          {activeTab === 'COUNTERS' && (
            <div>
               <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Counter Management</h3>
                <Button onClick={() => {
                  setEditingCounterId(null);
                  setCounterFormState({ name: '', assignedServiceIds: [] });
                  setShowCounterForm(true);
                }} size="sm"><Plus className="w-4 h-4 mr-1" /> Add Counter</Button>
              </div>

              {showCounterForm && (
                <div className="mb-8 bg-gray-50 p-6 rounded-xl border border-gray-200">
                   <h4 className="font-bold mb-4">{editingCounterId ? 'Edit Counter' : 'New Counter'}</h4>
                   <form onSubmit={handleSaveCounter} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Counter Name</label>
                        <input 
                          placeholder="e.g. Counter 4" 
                          required 
                          className="w-full p-2 border rounded"
                          value={counterFormState.name}
                          onChange={e => setCounterFormState({...counterFormState, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                           <label className="block text-sm font-medium text-gray-700">Assigned Services</label>
                           <div className="space-x-2 text-xs">
                             <button type="button" className="text-brand-600 hover:underline" onClick={() => setCounterFormState(prev => ({ ...prev, assignedServiceIds: services.map(s => s.id) }))}>Select All</button>
                             <span className="text-gray-300">|</span>
                             <button type="button" className="text-gray-500 hover:underline" onClick={() => setCounterFormState(prev => ({ ...prev, assignedServiceIds: [] }))}>Clear</button>
                           </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                           {services.map(s => {
                             const isSelected = counterFormState.assignedServiceIds.includes(s.id);
                             return (
                             <button
                               type="button"
                               key={s.id}
                               onClick={() => toggleServiceAssignment(s.id)}
                               className={`p-2 rounded text-sm border text-left flex items-start gap-2 transition-all ${
                                 isSelected
                                 ? 'bg-brand-50 border-brand-500 text-brand-700 ring-1 ring-brand-500' 
                                 : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                               }`}
                             >
                               <div className={`mt-0.5 w-4 h-4 flex-shrink-0 border rounded flex items-center justify-center ${isSelected ? 'bg-brand-500 border-brand-500 text-white' : 'border-gray-400'}`}>
                                 {isSelected && <Check size={12} />}
                               </div>
                               <div>
                                  <div className="font-bold">{s.code}</div>
                                  <div className="text-xs truncate max-w-[100px]">{s.name}</div>
                               </div>
                             </button>
                           )})}
                        </div>
                        {counterFormState.assignedServiceIds.length === 0 && (
                          <p className="text-xs text-red-500 mt-2">Warning: A counter must have at least one service assigned to serve customers.</p>
                        )}
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <Button type="button" variant="secondary" onClick={() => {
                          setShowCounterForm(false);
                          setEditingCounterId(null);
                        }}>Cancel</Button>
                        <Button type="submit">{editingCounterId ? 'Update Counter' : 'Create Counter'}</Button>
                      </div>
                   </form>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {counters.map(c => {
                   const assignedOperator = users.find(u => u.counterId === c.id);
                   return (
                  <div key={c.id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm flex flex-col h-full">
                     <div className="flex justify-between items-start mb-2">
                       <div>
                         <h4 className="font-bold text-gray-900">{c.name}</h4>
                         <span className={`text-xs px-2 py-0.5 rounded-full ${
                           c.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                         }`}>{c.status}</span>
                       </div>
                       <div className="flex gap-2">
                         <button onClick={() => handleEditCounter(c)} className="text-gray-400 hover:text-brand-600"><Edit2 className="w-4 h-4" /></button>
                         <button onClick={() => handleDeleteCounter(c.id)} className="text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                       </div>
                     </div>
                     
                     <div className="mt-2 mb-4">
                       <div className="text-xs text-gray-500 uppercase mb-1 flex items-center gap-1">
                         <Users className="w-3 h-3" /> Operator
                       </div>
                       <div className="text-sm font-medium text-gray-800">
                         {assignedOperator ? assignedOperator.name : <span className="text-gray-400 italic">Unassigned</span>}
                       </div>
                     </div>

                     <div className="mt-auto pt-4 border-t border-gray-100">
                       <p className="text-xs text-gray-500 uppercase mb-1">Services ({c.assignedServiceIds.length})</p>
                       <div className="flex flex-wrap gap-1">
                         {c.assignedServiceIds.map(sid => {
                           const s = services.find(srv => srv.id === sid);
                           return s ? (
                             <span key={sid} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded border border-gray-200">
                               {s.code}
                             </span>
                           ) : null;
                         })}
                         {c.assignedServiceIds.length === 0 && <span className="text-xs text-red-400 italic">No services</span>}
                       </div>
                     </div>
                  </div>
                )})}
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'USERS' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">User Access Control</h3>
                <Button onClick={() => setShowUserForm(true)} size="sm"><Plus className="w-4 h-4 mr-1" /> Add User</Button>
              </div>

              {showUserForm && (
                <div className="mb-8 bg-gray-50 p-6 rounded-xl border border-gray-200">
                   <h4 className="font-bold mb-4">New User</h4>
                   <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input 
                        placeholder="Full Name" 
                        required 
                        className="p-2 border rounded"
                        value={newUser.name}
                        onChange={e => setNewUser({...newUser, name: e.target.value})}
                      />
                      <input 
                        placeholder="Email Address" 
                        required 
                        type="email"
                        className="p-2 border rounded"
                        value={newUser.email}
                        onChange={e => setNewUser({...newUser, email: e.target.value})}
                      />
                      <select 
                        className="p-2 border rounded"
                        value={newUser.role}
                        onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})}
                      >
                         <option value={UserRole.OPERATOR}>Operator</option>
                         <option value={UserRole.ADMIN}>Admin</option>
                         <option value={UserRole.KIOSK}>Kiosk</option>
                      </select>
                      <div className="md:col-span-3 flex justify-end gap-2 mt-2">
                        <Button type="button" variant="secondary" onClick={() => setShowUserForm(false)}>Cancel</Button>
                        <Button type="submit">Create User</Button>
                      </div>
                   </form>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map(u => (
                      <tr key={u.id}>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{u.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            u.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-800' : 
                            u.role === UserRole.OPERATOR ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                           {u.counterId ? counters.find(c => c.id === u.counterId)?.name : '-'}
                         </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button onClick={() => deleteUser(u.id)} className="text-red-600 hover:text-red-900 ml-4"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Token History Tab */}
          {activeTab === 'HISTORY' && (
            <div>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h3 className="text-lg font-bold">Token History</h3>
              </div>
              
              {/* Filters */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                   
                   {/* Ticket Filter */}
                   <div className="relative">
                     <Hash className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                     <input 
                       type="text"
                       placeholder="Ticket #"
                       className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
                       value={filterTicket}
                       onChange={(e) => setFilterTicket(e.target.value)}
                     />
                   </div>

                   {/* Name Filter */}
                   <div className="relative">
                     <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                     <input 
                       type="text"
                       placeholder="Customer Name"
                       className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
                       value={filterName}
                       onChange={(e) => setFilterName(e.target.value)}
                     />
                   </div>

                   {/* Phone Filter */}
                   <div className="relative">
                     <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                     <input 
                       type="text"
                       placeholder="Phone"
                       className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
                       value={filterPhone}
                       onChange={(e) => setFilterPhone(e.target.value)}
                     />
                   </div>

                   {/* Status */}
                   <select 
                     className="w-full px-3 py-2 border rounded-lg text-sm"
                     value={filterStatus}
                     onChange={(e) => setFilterStatus(e.target.value)}
                   >
                     <option value="ALL">All Statuses</option>
                     {Object.values(TokenStatus).map(s => <option key={s} value={s}>{s}</option>)}
                   </select>
                   
                   {/* Date Range Start */}
                   <div className="relative">
                     <span className="absolute left-3 -top-2 text-xs font-bold text-gray-500 bg-gray-50 px-1">From</span>
                     <div className="relative">
                        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input 
                          type="date"
                          className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
                          value={filterStartDate}
                          onChange={(e) => setFilterStartDate(e.target.value)}
                        />
                     </div>
                   </div>

                   {/* Date Range End */}
                   <div className="relative">
                     <span className="absolute left-3 -top-2 text-xs font-bold text-gray-500 bg-gray-50 px-1">To</span>
                     <div className="relative">
                        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input 
                          type="date"
                          className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
                          value={filterEndDate}
                          onChange={(e) => setFilterEndDate(e.target.value)}
                        />
                     </div>
                   </div>

                   {/* Service */}
                   <select 
                     className="w-full px-3 py-2 border rounded-lg text-sm"
                     value={filterService}
                     onChange={(e) => setFilterService(e.target.value)}
                   >
                     <option value="ALL">All Services</option>
                     {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                   </select>

                   {/* Counter */}
                   <select 
                     className="w-full px-3 py-2 border rounded-lg text-sm"
                     value={filterCounter}
                     onChange={(e) => setFilterCounter(e.target.value)}
                   >
                     <option value="ALL">All Counters</option>
                     {counters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                   </select>
                </div>
                <div className="flex justify-between items-center mt-4 text-xs text-gray-500 px-1 pt-2 border-t border-gray-100">
                   <span>Found {filteredAndSortedTokens.length} tokens</span>
                   <button 
                     className="text-brand-600 hover:text-brand-800 font-medium flex items-center gap-1"
                     onClick={() => {
                        setFilterTicket('');
                        setFilterName('');
                        setFilterPhone('');
                        setFilterStartDate('');
                        setFilterEndDate('');
                        setFilterService('ALL');
                        setFilterStatus('ALL');
                        setFilterCounter('ALL');
                        setSortConfig({ key: 'createdAt', direction: 'desc' });
                     }}
                   >
                     <Filter className="w-3 h-3" /> Clear Filters
                   </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {[
                        { key: 'ticketNumber', label: 'Ticket' },
                        { key: 'customerName', label: 'Customer' },
                        { key: 'serviceName', label: 'Service' },
                        { key: 'counterName', label: 'Counter' },
                        { key: 'status', label: 'Status' },
                        { key: 'createdAt', label: 'Created' },
                        { key: 'waitTime', label: 'Wait Time' }
                      ].map(col => (
                        <th 
                          key={col.key}
                          onClick={() => handleSort(col.key)}
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none group"
                        >
                          <div className="flex items-center">
                            {col.label}
                            <SortIcon column={col.key} />
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAndSortedTokens.length === 0 ? (
                       <tr>
                         <td colSpan={7} className="px-4 py-8 text-center text-gray-400">No tokens found matching filters</td>
                       </tr>
                    ) : (
                      filteredAndSortedTokens.map(t => {
                        const service = services.find(s => s.id === t.serviceId);
                        const counter = counters.find(c => c.id === t.counterId);
                        
                        // Calculate wait time (called - created) or (now - created if waiting)
                        let waitDuration = '-';
                        if (t.calledAt) {
                           const mins = Math.floor((t.calledAt - t.createdAt) / 60000);
                           waitDuration = `${mins}m`;
                        } else if (t.status === TokenStatus.WAITING) {
                           const mins = Math.floor((Date.now() - t.createdAt) / 60000);
                           waitDuration = `${mins}m (ongoing)`;
                        }

                        return (
                          <tr key={t.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap font-bold text-gray-900">{t.ticketNumber}</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                               <div className="text-sm text-gray-900">{t.customerName}</div>
                               <div className="text-xs text-gray-500">{t.customerPhone}</div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{service?.name || t.serviceId}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{counter?.name || '-'}</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                t.status === TokenStatus.COMPLETED ? 'bg-green-100 text-green-800' :
                                t.status === TokenStatus.SERVING ? 'bg-blue-100 text-blue-800' :
                                t.status === TokenStatus.WAITING ? 'bg-yellow-100 text-yellow-800' :
                                t.status === TokenStatus.CANCELLED || t.status === TokenStatus.SKIPPED ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {t.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                               {new Date(t.createdAt).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                               {waitDuration}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};