import React, { useState, useEffect } from 'react';
import { Profile } from '../types';
import { supabase } from '../lib/supabase';

const MASTER_ADMIN_EMAIL = 'andrew.vaillant@london-fire.gov.uk';

const AdminPanel: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [qualFilter, setQualFilter] = useState<'all' | 'qualified' | 'unqualified'>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  const formatErrorMessage = (err: any): string => {
    if (!err) return 'Unknown error occurred.';
    if (typeof err === 'string') return err;
    if (err.message) return err.message;
    try {
      return JSON.stringify(err, Object.getOwnPropertyNames(err), 2);
    } catch (e) {
      return String(err);
    }
  };

  const fetchProfiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      if (data) setProfiles(data);
    } catch (err: any) {
      console.error('Admin Fetch Error:', err);
      setError(formatErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const restoreMasterAdmin = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const { error: rpcError } = await supabase.rpc('master_self_promote');
      if (rpcError) throw rpcError;
      await fetchProfiles();
      alert('SUCCESS: Admin rights restored.');
    } catch (err: any) {
      alert(`RECOVERY FAILED: ${formatErrorMessage(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (id: string, newRole: 'temporary_rater' | 'rater' | 'admin') => {
    const target = profiles.find(p => p.id === id);
    if (!target) return;

    const autoQual = newRole === 'rater' && !target.thincs_rater_qual;
    const confirmMsg = autoQual
      ? `Promote ${target.full_name} to RATER?\n\nHas this individual passed the THINCS Rater course? Clicking OK will verify their THINCS Rater Qualification.`
      : `Change role for ${target.full_name} to ${newRole.toUpperCase()}?`;

    if (!confirm(confirmMsg)) return;

    setActionLoading(id);
    try {
      const updateData: any = { role: newRole };
      if (autoQual) updateData.thincs_rater_qual = true;

      const { error: roleError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', id);

      if (roleError) throw roleError;

      setProfiles(prev => prev.map(p => p.id === id ? { ...p, ...updateData } : p));
      if (selectedProfile?.id === id) setSelectedProfile({ ...selectedProfile, ...updateData });
    } catch (err: any) {
      alert(`ACTION BLOCKED: ${formatErrorMessage(err)}`);
    } finally {
      setActionLoading(null);
    }
  };

  const toggleThincsQual = async (id: string, currentState: boolean) => {
    setActionLoading(id);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ thincs_rater_qual: !currentState })
        .eq('id', id);

      if (error) throw error;
      setProfiles(prev => prev.map(p => p.id === id ? { ...p, thincs_rater_qual: !currentState } : p));
      if (selectedProfile?.id === id) setSelectedProfile({ ...selectedProfile, thincs_rater_qual: !currentState });
    } catch (err: any) {
      alert(`Qual Update Failed: ${formatErrorMessage(err)}`);
    } finally {
      setActionLoading(null);
    }
  };

  const updateStatus = async (id: string, status: 'approved' | 'rejected' | 'pending') => {
    setActionLoading(id);
    try {
      const updateData: Partial<Profile> = { status, role: 'temporary_rater' };
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', id);

      if (updateError) throw updateError;
      setProfiles(prev => prev.map(p => p.id === id ? { ...p, ...updateData } as Profile : p));
    } catch (err: any) {
      alert(`Status Error: ${formatErrorMessage(err)}`);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredProfiles = profiles.filter(p => {
    let matchesStatus = true;
    if (statusFilter === 'pending') matchesStatus = p.status === 'pending';
    if (statusFilter === 'approved') matchesStatus = p.status === 'approved';

    let matchesQual = true;
    if (qualFilter === 'qualified') matchesQual = !!p.thincs_rater_qual;
    if (qualFilter === 'unqualified') matchesQual = !p.thincs_rater_qual;

    let matchesService = true;
    if (serviceFilter !== 'all') {
      matchesService = p.fire_service === serviceFilter;
    }

    return matchesStatus && matchesQual && matchesService;
  });

  const uniqueServices = Array.from(new Set(profiles.map(p => p.fire_service).filter(Boolean))) as string[];

  const isMasterUser = currentUser?.email?.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase();
  const myProfileInDb = profiles.find(p => p.id === currentUser?.id);
  const dbRoleIsAdmin = myProfileInDb?.role === 'admin';
  const isDemotedMaster = isMasterUser && !dbRoleIsAdmin;

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-slate-900 text-white';
      case 'rater': return 'bg-red-600 text-white';
      case 'temporary_rater': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  const formatRoleName = (role: string) => {
    return role.replace('_', ' ').toUpperCase();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Service Personnel</h2>
          <p className="text-slate-500 font-medium italic">Administrative Vetting & Qualification Management</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button onClick={fetchProfiles} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-red-600 transition-all" title="Refresh">
            <i className={`fa-solid fa-sync ${loading ? 'animate-spin' : ''}`}></i>
          </button>

          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none cursor-pointer hover:border-slate-300"
          >
            <option value="all">All Services</option>
            {uniqueServices.map(service => (
              <option key={service} value={service}>{service}</option>
            ))}
          </select>

          <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
            <button onClick={() => setStatusFilter('all')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === 'all' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
              All Status
            </button>
            <button onClick={() => setStatusFilter('pending')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === 'pending' ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
              Pending
            </button>
            <button onClick={() => setStatusFilter('approved')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === 'approved' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
              Approved
            </button>
          </div>

          <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
            <button onClick={() => setQualFilter('all')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${qualFilter === 'all' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
              All Quals
            </button>
            <button onClick={() => setQualFilter('qualified')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${qualFilter === 'qualified' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
              Verified
            </button>
            <button onClick={() => setQualFilter('unqualified')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${qualFilter === 'unqualified' ? 'bg-slate-400 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
              Unverified
            </button>
          </div>
        </div>
      </div>

      {isDemotedMaster && (
        <div className="mb-8 p-8 bg-slate-900 border-2 border-red-600/30 rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
          <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-xl shadow-red-900/40">
            <i className="fa-solid fa-bolt-lightning"></i>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl font-black text-white uppercase tracking-tight">Privilege Sync Required</h3>
            <p className="text-slate-400 text-sm">Your account needs database authority to manage other users.</p>
          </div>
          <button onClick={restoreMasterAdmin} className="bg-white text-slate-900 px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">
            Sync My Admin Access
          </button>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-bold">
          Error: {error}
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 overflow-hidden min-h-[500px] relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                <th className="px-10 py-8">Identity</th>
                <th className="px-10 py-8">Status</th>
                <th className="px-10 py-8">Roster Role</th>
                <th className="px-10 py-8">THINCS Certified</th>
                <th className="px-10 py-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProfiles.map((profile) => (
                <tr key={profile.id} className="hover:bg-slate-50/80 transition-all group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${profile.role === 'admin' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        {profile.full_name?.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">{profile.full_name}</span>
                        <span className="text-[10px] text-slate-400 font-mono italic">{profile.fire_service || 'Service not declared'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <span className={`inline-flex px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getStatusBadge(profile.status || 'pending')}`}>
                      {profile.status || 'PENDING'}
                    </span>
                  </td>
                  <td className="px-10 py-6">
                    <span className={`inline-flex px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getRoleBadge(profile.role)}`}>
                      {formatRoleName(profile.role)}
                    </span>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-3">
                      <i className={`fa-solid fa-certificate ${profile.thincs_rater_qual ? 'text-emerald-500' : 'text-slate-200'}`}></i>
                      <span className={`text-[10px] font-black uppercase ${profile.thincs_rater_qual ? 'text-emerald-600' : 'text-slate-300'}`}>
                        {profile.thincs_rater_qual ? 'Verified Rater' : 'Unverified'}
                      </span>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => setSelectedProfile(profile)} className="w-10 h-10 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-900 hover:text-white flex items-center justify-center transition-all">
                        <i className="fa-solid fa-address-card"></i>
                      </button>

                      {actionLoading === profile.id ? (
                        <div className="w-10 h-10 flex items-center justify-center"><i className="fa-solid fa-spinner animate-spin text-red-600"></i></div>
                      ) : (
                        <>
                          {profile.status === 'pending' && (
                            <button onClick={() => updateStatus(profile.id, 'approved')} title="Approve Access" className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-all">
                              <i className="fa-solid fa-check"></i>
                            </button>
                          )}
                          {profile.status === 'approved' && (
                            <button onClick={() => updateStatus(profile.id, 'pending')} title="Revert to Pending" className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-600 hover:text-white flex items-center justify-center transition-all">
                              <i className="fa-solid fa-clock-rotate-left"></i>
                            </button>
                          )}
                          {profile.role === 'temporary_rater' && profile.status === 'approved' && (
                            <button onClick={() => updateRole(profile.id, 'rater')} title="Promote to Rater" className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white flex items-center justify-center transition-all">
                              <i className="fa-solid fa-graduation-cap"></i>
                            </button>
                          )}
                          <button onClick={() => updateRole(profile.id, profile.role === 'admin' ? 'rater' : 'admin')} title="Toggle Admin" className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${profile.role === 'admin' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                            <i className="fa-solid fa-user-shield"></i>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedProfile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedProfile(null)}></div>
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 p-10 text-white">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center text-3xl font-black">
                  {selectedProfile.full_name?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tight">{selectedProfile.full_name}</h3>
                  <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">{formatRoleName(selectedProfile.role)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <span className="block text-[8px] uppercase font-bold text-slate-500 mb-1">Fire Service</span>
                  <span className="font-bold text-xs truncate">{selectedProfile.fire_service || 'Not Provided'}</span>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <span className="block text-[8px] uppercase font-bold text-slate-500 mb-1">Payroll ID</span>
                  <span className="font-bold text-xs">{selectedProfile.employee_id || 'Not Provided'}</span>
                </div>
              </div>
            </div>

            <div className="p-10 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <section>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-award"></i> Verification Status
                </h4>
                <button
                  onClick={() => toggleThincsQual(selectedProfile.id, selectedProfile.thincs_rater_qual || false)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${selectedProfile.thincs_rater_qual ? 'bg-emerald-50 border-emerald-100 text-emerald-700 font-bold' : 'bg-slate-50 border-slate-100 text-slate-400 italic'}`}
                >
                  <span className="text-sm">THINCS Rater Qualification</span>
                  <i className={`fa-solid ${selectedProfile.thincs_rater_qual ? 'fa-circle-check' : 'fa-circle-xmark'} text-xl`}></i>
                </button>
              </section>

              <section>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Additional Records</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProfile.additional_quals?.map((q, i) => (
                    <span key={i} className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-[10px] font-bold border border-slate-200">
                      {q}
                    </span>
                  ))}
                  {(!selectedProfile.additional_quals || selectedProfile.additional_quals.length === 0) && (
                    <p className="text-xs text-slate-400 italic">No additional records provided by user.</p>
                  )}
                </div>
              </section>

              <button onClick={() => setSelectedProfile(null)} className="w-full bg-slate-900 text-white font-black py-4 rounded-xl shadow-xl hover:bg-red-600 transition-all">
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;