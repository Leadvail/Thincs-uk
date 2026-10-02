import React, { useState, useEffect } from 'react';
import { Profile } from '../types';
import { supabase } from '../lib/supabase';
import { UK_FIRE_SERVICES } from '../constants';

interface ProfileSettingsProps {
  userId: string;
  onClose: () => void;
  onSaveSuccess?: () => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ userId, onClose, onSaveSuccess }) => {
  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newQual, setNewQual] = useState('');

  const formatErrorMessage = (err: any): string => {
    if (!err) return 'Unknown error occurred.';
    if (typeof err === 'string') return err;
    if (err.message) {
      let msg = err.message;
      if (err.details) msg += ` (Details: ${err.details})`;
      if (err.hint) msg += ` (Hint: ${err.hint})`;
      return msg;
    }
    try {
      return JSON.stringify(err, Object.getOwnPropertyNames(err), 2);
    } catch (e) {
      return String(err);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
        
        if (error) throw error;
        if (data) setProfile(data);
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  const handleAddQual = () => {
    if (!newQual.trim()) return;
    const current = profile.additional_quals || [];
    setProfile({ ...profile, additional_quals: [...current, newQual.trim()] });
    setNewQual('');
  };

  const handleRemoveQual = (index: number) => {
    const current = profile.additional_quals || [];
    setProfile({ ...profile, additional_quals: current.filter((_, i) => i !== index) });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving || !userId) return;
    
    setSaving(true);
    try {
      // Create a clean payload that excludes internal system fields (role, status, id) 
      // to avoid triggering RLS checks on restricted columns.
      const payload = {
        full_name: profile.full_name || 'User',
        fire_service: profile.fire_service || null,
        employee_id: profile.employee_id || null,
        command_level: profile.command_level || null,
        assessor_qual: !!profile.assessor_qual,
        iqa_qual: !!profile.iqa_qual,
        additional_quals: profile.additional_quals || []
      };

      // Using .update() instead of .upsert() is more specific for modifying 
      // an existing record and is less likely to violate 'INSERT' RLS policies.
      const { error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', userId);

      if (error) throw error;
      
      alert('Professional profile updated successfully.');
      if (onSaveSuccess) {
        await onSaveSuccess();
      }
      onClose();
    } catch (err: any) {
      console.error('Detailed Profile Save Error:', err);
      alert(`Save failed: ${formatErrorMessage(err)}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="p-12 text-center">
      <div className="animate-spin h-10 w-10 border-b-2 border-red-600 mx-auto mb-4"></div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Records...</p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-6 md:p-12">
      <div className="mb-10 text-center md:text-left">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">My Professional Profile</h2>
        <p className="text-slate-500 font-medium italic">Maintain your service records and qualifications</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-full">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
            <input 
              type="text"
              required
              value={profile.full_name || ''}
              onChange={e => setProfile({...profile, full_name: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Fire & Rescue Service</label>
            <select
              value={profile.fire_service || ''}
              onChange={e => setProfile({...profile, fire_service: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500 bg-white"
            >
              <option value="" disabled>Select your Fire & Rescue Service</option>
              {UK_FIRE_SERVICES.map(service => (
                <option key={service} value={service}>{service}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Employee / Payroll ID</label>
            <input 
              type="text"
              placeholder="e.g. 123456"
              value={profile.employee_id || ''}
              onChange={e => setProfile({...profile, employee_id: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Incident Command Level</label>
          <div className="flex gap-4">
            {['1', '2', '3'].map(lvl => (
              <button
                key={lvl}
                type="button"
                onClick={() => setProfile({...profile, command_level: lvl as any})}
                className={`flex-1 py-4 rounded-xl font-bold border transition-all ${
                  profile.command_level === lvl 
                    ? 'bg-slate-900 border-slate-900 text-white shadow-lg' 
                    : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                }`}
              >
                Level {lvl}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Service Verification</label>
          <div className={`flex items-center gap-4 p-5 rounded-2xl border transition-all ${profile.thincs_rater_qual ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-200 opacity-50 grayscale'}`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${profile.thincs_rater_qual ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-500'}`}>
              <i className="fa-solid fa-certificate"></i>
            </div>
            <div className="flex-grow">
              <span className="block font-black text-slate-800 text-sm uppercase tracking-tight">THINCS Rater Qualification</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                {profile.thincs_rater_qual ? 'Certified and Verified' : 'Locked - Awaiting Admin Verification'}
              </span>
            </div>
            {profile.thincs_rater_qual && <i className="fa-solid fa-circle-check text-emerald-600 text-2xl"></i>}
          </div>
          <p className="text-[10px] text-slate-400 font-medium italic">The THINCS Rater Qualification status is managed by Service Administrators upon completion of the official Rater course.</p>
        </div>

        <div className="space-y-4">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Additional Assessment Qualifications</label>
          <div className="flex gap-2 mb-4">
            <input 
              type="text"
              placeholder="e.g. NVQ A1 Assessor"
              value={newQual}
              onChange={e => setNewQual(e.target.value)}
              className="flex-grow px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500 text-sm"
            />
            <button 
              type="button"
              onClick={handleAddQual}
              className="bg-slate-900 text-white px-6 rounded-xl font-bold text-xs uppercase hover:bg-red-600 transition-all"
            >
              Add
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {(profile.additional_quals || []).map((q, idx) => (
              <div key={idx} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-200 shadow-sm">
                {q}
                <button 
                  type="button" 
                  onClick={() => handleRemoveQual(idx)}
                  className="text-slate-400 hover:text-red-600"
                >
                  <i className="fa-solid fa-circle-xmark"></i>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Core Qualifications</label>
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer hover:bg-white transition-all">
              <input 
                type="checkbox"
                checked={profile.assessor_qual || false}
                onChange={e => setProfile({...profile, assessor_qual: e.target.checked})}
                className="w-5 h-5 rounded border-slate-300 text-red-600 focus:ring-red-500"
              />
              <div className="flex-grow">
                <span className="block font-bold text-slate-800 text-sm">Assessor Qualification</span>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Internal Operational Assessor</span>
              </div>
            </label>

            <label className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer hover:bg-white transition-all">
              <input 
                type="checkbox"
                checked={profile.iqa_qual || false}
                onChange={e => setProfile({...profile, iqa_qual: e.target.checked})}
                className="w-5 h-5 rounded border-slate-300 text-red-600 focus:ring-red-500"
              />
              <div className="flex-grow">
                <span className="block font-bold text-slate-800 text-sm">IQA Qualification</span>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Internal Quality Assurance</span>
              </div>
            </label>
          </div>
        </div>

        <div className="pt-6 flex flex-col md:flex-row gap-4">
          <button 
            type="submit"
            disabled={saving}
            className="flex-1 bg-red-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-red-200 hover:bg-red-700 transition-all disabled:opacity-50"
          >
            {saving ? 'Updating Roster...' : 'Save Professional Records'}
          </button>
          <button 
            type="button"
            onClick={onClose}
            className="flex-1 bg-slate-100 text-slate-700 font-bold py-4 rounded-2xl border border-slate-200 hover:bg-slate-200 transition-all"
          >
            Return to Dashboard
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;