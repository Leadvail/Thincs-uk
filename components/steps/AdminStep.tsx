import React, { useState, useEffect } from 'react';
import { Assessment, CandidateProfile } from '../../types';
import { supabase } from '../../lib/supabase';
import { UK_FIRE_SERVICES } from '../../constants';

interface AdminStepProps {
  assessment: Assessment;
  onUpdate: (data: Partial<Assessment>) => void;
  onNext: () => void;
}

const AdminStep: React.FC<AdminStepProps> = ({ assessment, onUpdate, onNext }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [candidateMode, setCandidateMode] = useState<'search' | 'create' | 'selected'>(
    assessment.candidate_id ? 'selected' : (assessment.candidateProfile?.firstName ? 'create' : 'search')
  );

  const [candidateSearch, setCandidateSearch] = useState('');
  const [candidateResults, setCandidateResults] = useState<any[]>([]);
  const [isSearchingCandidate, setIsSearchingCandidate] = useState(false);
  
  // Local state for candidate profile
  const [candidate, setCandidate] = useState<CandidateProfile>(assessment.candidateProfile || {
    firstName: '',
    lastName: '',
    serviceNumber: '',
    fireService: '',
    commandLevel: null,
    area: '',
    station: '',
    watch: '',
    department: '',
    team: '',
    assessment_coordinator_id: null,
    assessment_coordinator_name: null
  });

  const [coordSearch, setCoordSearch] = useState(candidate.assessment_coordinator_name || '');
  const [coordResults, setCoordResults] = useState<any[]>([]);
  const [isSearchingCoord, setIsSearchingCoord] = useState(false);

  // Removed problematic useEffect that synced candidate to onUpdate on every render

  // Candidate Search Effect
  useEffect(() => {
    const searchCandidates = async () => {
      if (!candidateSearch.trim()) {
        setCandidateResults([]);
        return;
      }
      setIsSearchingCandidate(true);
      const { data } = await supabase
        .from('candidate_profiles')
        .select('*')
        .or(`first_name.ilike.%${candidateSearch}%,last_name.ilike.%${candidateSearch}%,service_number.ilike.%${candidateSearch}%`)
        .limit(5);
      
      if (data) setCandidateResults(data);
      setIsSearchingCandidate(false);
    };
    
    const timeout = setTimeout(searchCandidates, 300);
    return () => clearTimeout(timeout);
  }, [candidateSearch]);

  // Coordinator Search Effect
  useEffect(() => {
    const searchCoordinators = async () => {
      if (!coordSearch.trim() || coordSearch === candidate.assessment_coordinator_name) {
        setCoordResults([]);
        return;
      }
      setIsSearchingCoord(true);
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name')
        .ilike('full_name', `%${coordSearch}%`)
        .limit(5);
      
      if (data) setCoordResults(data);
      setIsSearchingCoord(false);
    };
    
    const timeout = setTimeout(searchCoordinators, 300);
    return () => clearTimeout(timeout);
  }, [coordSearch, candidate.assessment_coordinator_name]);

  const selectCoordinator = (id: string, name: string) => {
    setCandidate({ ...candidate, assessment_coordinator_id: id, assessment_coordinator_name: name });
    setCoordSearch(name);
    setCoordResults([]);
  };

  const selectCandidate = async (selected: any) => {
    // Optionally fetch coordinator name if it exists
    let coordName = '';
    if (selected.assessment_coordinator_id) {
      const { data } = await supabase.from('profiles').select('full_name').eq('id', selected.assessment_coordinator_id).single();
      if (data) coordName = data.full_name;
    }

    const selectedProfile: CandidateProfile = {
      id: selected.id,
      firstName: selected.first_name,
      lastName: selected.last_name,
      serviceNumber: selected.service_number || '',
      fireService: selected.fire_service || '',
      commandLevel: selected.ic_level,
      area: selected.area || '',
      station: selected.station || '',
      watch: selected.watch || '',
      department: selected.department || '',
      team: selected.team || '',
      assessment_coordinator_id: selected.assessment_coordinator_id || null,
      assessment_coordinator_name: coordName || null
    };

    setCandidate(selectedProfile);
    setCandidateMode('selected');
    setCandidateSearch('');
    setCandidateResults([]);
  };

  const resetCandidate = () => {
    setCandidate({
      firstName: '',
      lastName: '',
      serviceNumber: '',
      fireService: '',
      commandLevel: null,
      area: '',
      station: '',
      watch: '',
      department: '',
      team: '',
      assessment_coordinator_id: null,
      assessment_coordinator_name: null
    });
    setCoordSearch('');
    onUpdate({ candidate_id: undefined });
  };

  const handleNext = async () => {
    if (isSubmitting) return;
    
    if (!candidate.firstName || !candidate.lastName || !candidate.fireService || !candidate.commandLevel) {
      alert('Please fill out all required candidate fields (First Name, Last Name, Fire Service, Command Level).');
      return;
    }

    setIsSubmitting(true);

    try {
      let candidateId = assessment.candidate_id || candidate.id;

      if (!candidateId) {
        const payload = {
          first_name: candidate.firstName,
          last_name: candidate.lastName,
          service_number: candidate.serviceNumber,
          fire_service: candidate.fireService,
          ic_level: candidate.commandLevel,
          area: candidate.commandLevel === '1' ? candidate.area : null,
          station: candidate.commandLevel === '1' ? candidate.station : null,
          watch: candidate.commandLevel === '1' ? candidate.watch : null,
          department: candidate.commandLevel === '2' ? candidate.department : null,
          team: candidate.commandLevel === '2' ? candidate.team : null,
          assessment_coordinator_id: candidate.assessment_coordinator_id
        };

        const { data, error } = await supabase
          .from('candidate_profiles')
          .insert(payload)
          .select('id')
          .single();

        if (error) throw error;
        if (data) candidateId = data.id;
      }

      onUpdate({ 
        candidate_id: candidateId,
        icName: `${candidate.firstName} ${candidate.lastName}`,
        candidateProfile: { ...candidate, id: candidateId }
      });

      onNext();
    } catch (err: any) {
      alert(`Failed to save candidate: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h3 className="text-xl font-bold text-slate-800">Assessment Administration</h3>
        <p className="text-slate-500">Record the context of the command assessment.</p>
      </div>

      <div className="space-y-8">
        {/* Event Type & Rater */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100">
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Event Type</label>
            <div className="flex flex-wrap gap-3">
              {['Incident', 'Practical Exercise', 'Simulation', 'Other'].map(type => (
                <button
                  key={type}
                  onClick={() => onUpdate({ eventType: type })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                    assessment.eventType === type 
                      ? 'border-red-500 bg-red-50 text-red-700' 
                      : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Rater Name</label>
            <input 
              type="text"
              value={assessment.raterName}
              onChange={(e) => onUpdate({ raterName: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>
        </div>

        {/* Candidate Profile Details */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <h4 className="font-bold text-slate-800 text-lg">Candidate Details</h4>
            {candidateMode === 'selected' && (
              <button onClick={() => { setCandidateMode('search'); resetCandidate(); }} className="text-xs font-bold text-red-600 hover:text-red-700 uppercase tracking-wide">
                Clear Selection
              </button>
            )}
            {candidateMode === 'create' && (
              <button onClick={() => { setCandidateMode('search'); resetCandidate(); }} className="text-xs font-bold text-slate-500 hover:text-slate-700 uppercase tracking-wide">
                Cancel / Back to Search
              </button>
            )}
          </div>

          {candidateMode === 'search' && (
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-slate-700">Search Existing Candidate</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fa-solid fa-magnifying-glass text-slate-400"></i>
                </div>
                <input 
                  type="text"
                  placeholder="Search by name or service number..."
                  value={candidateSearch}
                  onChange={(e) => setCandidateSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none shadow-sm"
                />
                {isSearchingCandidate && (
                  <div className="absolute right-3 top-3 text-slate-400">
                    <i className="fa-solid fa-spinner fa-spin"></i>
                  </div>
                )}
                {candidateResults.length > 0 && (
                  <div className="absolute z-20 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
                    {candidateResults.map(res => (
                      <div 
                        key={res.id} 
                        onClick={() => selectCandidate(res)}
                        className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b last:border-0 border-slate-100 flex justify-between items-center"
                      >
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{res.first_name} {res.last_name}</p>
                          <p className="text-xs text-slate-500">{res.fire_service} {res.service_number ? `• ID: ${res.service_number}` : ''}</p>
                        </div>
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">Level {res.ic_level}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="relative flex items-center py-4">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink-0 mx-4 text-xs font-bold text-slate-400 uppercase tracking-widest">or</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <button 
                onClick={() => setCandidateMode('create')}
                className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-bold hover:border-slate-400 hover:text-slate-700 transition-colors flex items-center justify-center gap-2 bg-white"
              >
                <i className="fa-solid fa-plus"></i>
                Add New Candidate
              </button>
            </div>
          )}

          {candidateMode === 'selected' && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0 uppercase">
                {candidate.firstName.charAt(0)}{candidate.lastName.charAt(0)}
              </div>
              <div className="flex-grow">
                <h5 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  {candidate.firstName} {candidate.lastName}
                  <span className="bg-emerald-100 text-emerald-700 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-bold">Selected</span>
                </h5>
                <p className="text-sm text-slate-600 mb-2">
                  {candidate.fireService} 
                  {candidate.serviceNumber && <span className="mx-2 text-slate-300">|</span>}
                  {candidate.serviceNumber && <span>ID: {candidate.serviceNumber}</span>}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-1 rounded">Level {candidate.commandLevel}</span>
                  {candidate.area && <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-1 rounded">Area: {candidate.area}</span>}
                  {candidate.station && <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-1 rounded">Station: {candidate.station}</span>}
                  {candidate.department && <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-1 rounded">Dept: {candidate.department}</span>}
                </div>
                {candidate.assessment_coordinator_name && (
                  <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
                    <span className="font-semibold">Coordinator:</span> {candidate.assessment_coordinator_name}
                  </p>
                )}
              </div>
            </div>
          )}

          {candidateMode === 'create' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">First Name <span className="text-red-500">*</span></label>
                  <input 
                    type="text"
                    required
                    value={candidate.firstName}
                    onChange={(e) => setCandidate({ ...candidate, firstName: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Last Name <span className="text-red-500">*</span></label>
                  <input 
                    type="text"
                    required
                    value={candidate.lastName}
                    onChange={(e) => setCandidate({ ...candidate, lastName: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Service Number</label>
                  <input 
                    type="text"
                    value={candidate.serviceNumber}
                    onChange={(e) => setCandidate({ ...candidate, serviceNumber: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Fire Service <span className="text-red-500">*</span></label>
                  <select
                    required
                    value={candidate.fireService}
                    onChange={(e) => setCandidate({ ...candidate, fireService: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white"
                  >
                    <option value="" disabled>Select Fire Service</option>
                    {UK_FIRE_SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Incident Command Level <span className="text-red-500">*</span></label>
                <div className="flex gap-3">
                  {(['1', '2', '3'] as const).map(lvl => (
                    <button
                      key={lvl}
                      onClick={() => setCandidate({ ...candidate, commandLevel: lvl })}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all ${
                        candidate.commandLevel === lvl
                          ? 'bg-slate-800 text-white border-slate-800 shadow-md'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      Level {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Conditional Level Fields */}
              {candidate.commandLevel === '1' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Area</label>
                    <input type="text" value={candidate.area || ''} onChange={e => setCandidate({...candidate, area: e.target.value})} className="w-full px-3 py-1.5 border border-slate-200 rounded text-sm outline-none focus:ring-1 focus:ring-red-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Station</label>
                    <input type="text" value={candidate.station || ''} onChange={e => setCandidate({...candidate, station: e.target.value})} className="w-full px-3 py-1.5 border border-slate-200 rounded text-sm outline-none focus:ring-1 focus:ring-red-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Watch</label>
                    <input type="text" value={candidate.watch || ''} onChange={e => setCandidate({...candidate, watch: e.target.value})} className="w-full px-3 py-1.5 border border-slate-200 rounded text-sm outline-none focus:ring-1 focus:ring-red-500" />
                  </div>
                </div>
              )}

              {candidate.commandLevel === '2' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Department</label>
                    <input type="text" value={candidate.department || ''} onChange={e => setCandidate({...candidate, department: e.target.value})} className="w-full px-3 py-1.5 border border-slate-200 rounded text-sm outline-none focus:ring-1 focus:ring-red-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Team</label>
                    <input type="text" value={candidate.team || ''} onChange={e => setCandidate({...candidate, team: e.target.value})} className="w-full px-3 py-1.5 border border-slate-200 rounded text-sm outline-none focus:ring-1 focus:ring-red-500" />
                  </div>
                </div>
              )}

              {/* Assessment Coordinator */}
              <div className="mt-4 border-t border-slate-200 pt-4">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Assessment Coordinator</label>
                <p className="text-xs text-slate-500 mb-2">This person will be able to view the score outcome in addition to the assessor.</p>
                <div className="relative">
                  <input 
                    type="text"
                    placeholder="Search registered users by name..."
                    value={coordSearch}
                    onChange={(e) => {
                      setCoordSearch(e.target.value);
                      if (candidate.assessment_coordinator_id) {
                        setCandidate({ ...candidate, assessment_coordinator_id: null, assessment_coordinator_name: null });
                      }
                    }}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white"
                  />
                  {isSearchingCoord && (
                    <div className="absolute right-3 top-2 text-slate-400">
                      <i className="fa-solid fa-spinner fa-spin"></i>
                    </div>
                  )}
                  {coordResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
                      {coordResults.map(res => (
                        <div 
                          key={res.id} 
                          onClick={() => selectCoordinator(res.id, res.full_name)}
                          className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-sm font-medium text-slate-700 border-b last:border-0 border-slate-100"
                        >
                          {res.full_name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Incident Description</label>
          <textarea 
            rows={4}
            value={assessment.incidentDescription}
            onChange={(e) => onUpdate({ incidentDescription: e.target.value })}
            placeholder="Describe the nature, scale, and specific details of the incident..."
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
          />
          <p className="text-[11px] text-slate-400 mt-2 italic">Provide context such as complexity, BA status, resources, etc.</p>
        </div>

        <div className="pt-6 border-t flex justify-end">
          <button 
            onClick={handleNext}
            disabled={isSubmitting || candidateMode === 'search'}
            className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Begin Observations'}
            <i className="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminStep;
