import React, { useState } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';
import { UK_FIRE_SERVICES } from '../constants';

const THINCSWheel = () => (
  <svg viewBox="0 0 500 500" className="w-64 h-64 lg:w-[480px] lg:h-[480px] drop-shadow-2xl animate-in fade-in zoom-in duration-1000">
    <circle cx="250" cy="250" r="240" fill="white" stroke="#8c8c8c" strokeWidth="6" />
    <circle cx="250" cy="250" r="55" fill="white" stroke="#8c8c8c" strokeWidth="6" />
    <g fill="none" stroke="#8c8c8c" strokeWidth="6" strokeLinecap="round">
      <path d="M 250 10 Q 230 130 250 195" transform="rotate(30 250 250)" />
      <path d="M 250 10 Q 230 130 250 195" transform="rotate(90 250 250)" />
      <path d="M 250 10 Q 230 130 250 195" transform="rotate(150 250 250)" />
      <path d="M 250 10 Q 230 130 250 195" transform="rotate(210 250 250)" />
      <path d="M 250 10 Q 230 130 250 195" transform="rotate(270 250 250)" />
      <path d="M 250 10 Q 230 130 250 195" transform="rotate(330 250 250)" />
    </g>

    <g transform="translate(250, 92)">
      <image href="https://img.icons8.com/ios/100/8cb523/strategy-board.png" x="-25" y="-45" width="50" height="50" />
      <text y="20" fontSize="12" fontWeight="700" fill="#8cb523" textAnchor="middle" className="font-sans">
        <tspan x="0" dy="0">Effective Decision</tspan>
        <tspan x="0" dy="16">Making & Planning</tspan>
      </text>
    </g>

    <g transform="translate(387, 171)">
      <image href="https://img.icons8.com/ios/100/f59e0b/conference-call.png" x="-25" y="-45" width="50" height="50" />
      <text y="20" fontSize="12" fontWeight="700" fill="#f59e0b" textAnchor="middle" className="font-sans">
        <tspan x="0" dy="0">Interpersonal</tspan>
        <tspan x="0" dy="16">Communication</tspan>
      </text>
    </g>

    <g transform="translate(387, 329)">
      <image href="https://img.icons8.com/ios/100/06b6d4/user-male-circle.png" x="-25" y="-45" width="50" height="50" />
      <text y="20" fontSize="12" fontWeight="700" fill="#06b6d4" textAnchor="middle" className="font-sans">
        <tspan x="0" dy="0">Personal</tspan>
        <tspan x="0" dy="16">Resilience</tspan>
      </text>
    </g>

    <g transform="translate(250, 408)">
      <image href="https://img.icons8.com/ios/100/f43f5e/radar.png" x="-25" y="-45" width="50" height="50" />
      <text y="20" fontSize="12" fontWeight="700" fill="#f43f5e" textAnchor="middle" className="font-sans">
        <tspan x="0" dy="0">Situational</tspan>
        <tspan x="0" dy="16">Awareness</tspan>
      </text>
    </g>

    <g transform="translate(113, 329)">
      <image href="https://img.icons8.com/ios/100/16a34a/user-group-man-man.png" x="-25" y="-45" width="50" height="50" />
      <text y="20" fontSize="12" fontWeight="700" fill="#16a34a" textAnchor="middle" className="font-sans">
        <tspan x="0" dy="0">Teamwork &</tspan>
        <tspan x="0" dy="16">Interoperability</tspan>
      </text>
    </g>

    <g transform="translate(113, 171)">
      <image href="https://img.icons8.com/ios/100/6366f1/collaboration.png" x="-25" y="-45" width="50" height="50" />
      <text y="20" fontSize="12" fontWeight="700" fill="#6366f1" textAnchor="middle" className="font-sans">
        <tspan x="0" dy="0">Assertive, Effective &</tspan>
        <tspan x="0" dy="16">Safe Leadership</tspan>
      </text>
    </g>
  </svg>
);

const Login: React.FC<{ onLogin: (user: User) => void }> = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const [fireService, setFireService] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [commandLevel, setCommandLevel] = useState<'1' | '2' | '3' | null>(null);
  const [additionalQuals, setAdditionalQuals] = useState<string[]>([]);
  const [newQual, setNewQual] = useState('');

  const [showLogin, setShowLogin] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [showTrainingRequest, setShowTrainingRequest] = useState(false);
  const [trFullName, setTrFullName] = useState('');
  const [trRank, setTrRank] = useState('');
  const [trDepartment, setTrDepartment] = useState('');
  const [trFireService, setTrFireService] = useState('');
  const [trEmail, setTrEmail] = useState('');
  const [trCommandLevel, setTrCommandLevel] = useState<'1' | '2' | '3' | null>(null);
  const [trAuthorized, setTrAuthorized] = useState(false);
  const [trLoading, setTrLoading] = useState(false);
  const [trError, setTrError] = useState<string | null>(null);
  const [trSuccess, setTrSuccess] = useState<string | null>(null);

  const handleAddQual = () => {
    if (newQual.trim()) {
      setAdditionalQuals([...additionalQuals, newQual.trim()]);
      setNewQual('');
    }
  };

  const handleRemoveQual = (index: number) => {
    setAdditionalQuals(additionalQuals.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (isRegistering) {
        if (!fullName.trim() || !fireService.trim() || !email.trim() || !password.trim()) {
          throw new Error("Please complete all mandatory fields (Name, Service, Email, Password).");
        }
        if (!commandLevel) throw new Error("Please select your Incident Command Level.");

        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              fire_service: fireService,
              employee_id: employeeId,
              command_level: commandLevel,
              additional_quals: additionalQuals
            }
          }
        });
        if (signUpError) throw signUpError;

        setSuccessMsg('Account request submitted. Awaiting administrative approval.');
        setTimeout(() => {
          setIsRegistering(false);
          setSuccessMsg(null);
          setShowLogin(false);
        }, 4000);
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTrainingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrError(null);
    setTrSuccess(null);
    setTrLoading(true);

    try {
      if (!trFullName || !trRank || !trDepartment || !trFireService || !trEmail || !trCommandLevel) {
        throw new Error("Please complete all mandatory fields.");
      }
      if (!trAuthorized) {
        throw new Error("You must confirm that you are authorised to request training for your organisation.");
      }

      const { error } = await supabase.from('rater_training_requests').insert({
        full_name: trFullName,
        rank: trRank,
        department: trDepartment,
        fire_service: trFireService,
        email: trEmail,
        ic_level: trCommandLevel,
        is_authorized: trAuthorized
      });

      if (error) throw error;
      
      // Submit to Netlify Forms to trigger email routing
      const formData = new URLSearchParams();
      formData.append('form-name', 'training-requests');
      formData.append('full_name', trFullName);
      formData.append('rank', trRank);
      formData.append('department', trDepartment);
      formData.append('fire_service', trFireService);
      formData.append('email', trEmail);
      formData.append('ic_level', trCommandLevel);

      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      });
      
      setTrSuccess('Registration of interest submitted successfully. Our team will contact you shortly.');
      setTimeout(() => {
        setShowTrainingRequest(false);
        setTrSuccess(null);
        // Reset form
        setTrFullName('');
        setTrRank('');
        setTrDepartment('');
        setTrFireService('');
        setTrEmail('');
        setTrCommandLevel(null);
        setTrAuthorized(false);
      }, 4000);
    } catch (err: any) {
      setTrError(err.message);
    } finally {
      setTrLoading(false);
    }
  };

  const commandSkills = [
    { name: 'Leadership', icon: 'fa-shield-halved', color: 'text-indigo-600' },
    { name: 'Decision Making', icon: 'fa-brain', color: 'text-lime-600' },
    { name: 'Communication', icon: 'fa-comments', color: 'text-amber-500' },
    { name: 'Resilience', icon: 'fa-heart-pulse', color: 'text-cyan-500' },
    { name: 'Awareness', icon: 'fa-eye', color: 'text-rose-500' },
    { name: 'Teamwork', icon: 'fa-people-group', color: 'text-emerald-600' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="bg-white border-b px-6 h-16 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center text-white font-bold">T</div>
          <span className="font-bold text-slate-900 uppercase tracking-tight">THINCS Portal</span>
        </div>
        <button onClick={() => { setShowLogin(true); setIsRegistering(false); setShowTrainingRequest(false); }} className="text-sm font-bold text-red-600 hover:text-red-700">
          Rater Login
        </button>
      </nav>

      <section className="relative overflow-hidden bg-white py-16 lg:py-24 border-b border-slate-200">
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            <div className="max-w-2xl flex-1 text-center lg:text-left">
              <h1 className="text-4xl lg:text-6xl font-black text-slate-900 leading-tight mb-6">
                Development and Assessment in <span className="text-red-600">Non-Technical</span> Command Skills
              </h1>
              <p className="text-lg lg:text-xl text-slate-600 mb-10 leading-relaxed">
                THINCS is a professional behavioural marker system designed specifically for the UK Fire and Rescue Service.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button onClick={() => { setShowLogin(true); setIsRegistering(false); setShowTrainingRequest(false); }} className="bg-red-600 hover:bg-red-700 text-white px-10 py-5 rounded-xl font-bold text-lg shadow-xl shadow-red-200 flex items-center justify-center gap-3">
                  <i className="fa-solid fa-lock"></i>
                  Secure Login
                </button>
                <button onClick={() => { setShowLogin(true); setIsRegistering(true); setShowTrainingRequest(false); }} className="bg-slate-900 hover:bg-slate-800 text-white px-10 py-5 rounded-xl font-bold text-lg shadow-xl shadow-slate-200 flex items-center justify-center gap-3">
                  <i className="fa-solid fa-user-plus"></i>
                  Request Access
                </button>
              </div>
              <div className="mt-4 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                 <button onClick={() => { setShowTrainingRequest(true); setShowLogin(false); }} className="bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 px-8 py-4 rounded-xl font-bold text-base shadow-sm flex items-center justify-center gap-3 transition-colors">
                    <i className="fa-solid fa-graduation-cap"></i>
                    Request THINCS Rater Training
                 </button>
              </div>
            </div>
            <div className="flex-shrink-0"><THINCSWheel /></div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-red-600 mb-4">The Framework</h2>
              <h3 className="text-3xl font-bold text-slate-900 mb-6">Professional Standards in Incident Command</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">The THINCS system provides a robust framework for assessing high-performance Incident Command behaviours.</p>
              <div className="grid grid-cols-2 gap-6 mt-10">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100"><div className="text-2xl font-bold text-slate-900 mb-1">6</div><div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Core Skills</div></div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100"><div className="text-2xl font-bold text-slate-900 mb-1">20+</div><div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sub-markers</div></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {commandSkills.map((skill) => (
                <div key={skill.name} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-4">
                  <i className={`fa-solid ${skill.icon} text-2xl ${skill.color}`}></i>
                  <span className="font-bold text-slate-800 text-sm">{skill.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {showLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowLogin(false)}></div>
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-red-600 p-8 text-center text-white">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-red-600 text-3xl font-bold mx-auto mb-4 shadow-lg">T</div>
              <h2 className="text-2xl font-bold uppercase tracking-tight">{isRegistering ? 'Request Rater Access' : 'Secure Rater Login'}</h2>
              <p className="text-red-100 mt-2 opacity-80 text-sm">{isRegistering ? 'Provide your service professional details below' : 'Enter your credentials to proceed'}</p>
            </div>
            <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  {isRegistering && (
                    <>
                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Full Name <span className="text-red-500">*</span></label>
                        <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500" placeholder="e.g. SM John Smith" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Fire Service <span className="text-red-500">*</span></label>
                          <select required value={fireService} onChange={(e) => setFireService(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500 bg-white">
                            <option value="" disabled>Select your Fire Service</option>
                            {UK_FIRE_SERVICES.map(service => (
                              <option key={service} value={service}>{service}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Payroll / ID <span className="text-[9px] font-bold opacity-60 lowercase">(optional)</span></label>
                          <input type="text" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500" placeholder="e.g. 12345" />
                        </div>
                      </div>
                    </>
                  )}
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Service Email <span className="text-red-500">*</span></label>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500" placeholder="name@fire-service.gov.uk" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Password <span className="text-red-500">*</span></label>
                    <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500" placeholder="••••••••" />
                  </div>
                </div>

                {isRegistering && (
                  <>
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Incident Command Level <span className="text-red-500">*</span></label>
                      <div className="flex gap-2">
                        {['1', '2', '3'].map(lvl => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => setCommandLevel(lvl as any)}
                            className={`flex-1 py-3 rounded-xl font-bold border transition-all text-xs ${commandLevel === lvl ? 'bg-slate-900 border-slate-900 text-white shadow-md' : 'bg-white border-slate-200 text-slate-400'}`}
                          >
                            Level {lvl}
                          </button>
                        ))}
                      </div>

                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Other Assessment/Assurance Qualifications</label>
                        <div className="flex gap-2 mb-2">
                          <input type="text" value={newQual} onChange={(e) => setNewQual(e.target.value)} className="flex-grow px-3 py-2 rounded-lg border border-slate-200 outline-none text-xs" placeholder="e.g. L3 Education & Training" />
                          <button type="button" onClick={handleAddQual} className="bg-slate-800 text-white px-4 rounded-lg font-bold text-xs uppercase">Add</button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {additionalQuals.map((q, i) => (
                            <span key={i} className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-2">
                              {q}
                              <i className="fa-solid fa-xmark cursor-pointer hover:text-red-600" onClick={() => handleRemoveQual(i)}></i>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {error && <p className="text-xs font-black text-red-600 bg-red-50 p-4 rounded-xl border border-red-100">{error}</p>}
                {successMsg && <p className="text-xs font-black text-emerald-600 bg-emerald-50 p-4 rounded-xl border border-emerald-100">{successMsg}</p>}

                <button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-red-200 disabled:opacity-50 transition-all uppercase tracking-widest text-sm">
                  {loading ? 'Processing Registry...' : (isRegistering ? 'Submit Access Request' : 'Sign In')}
                </button>
              </form>
              <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <button onClick={() => { setIsRegistering(!isRegistering); setError(null); setSuccessMsg(null); }} className="text-[10px] font-black text-slate-400 hover:text-red-600 uppercase tracking-[0.2em] transition-colors">
                  {isRegistering ? 'Already registered? Secure Login' : 'New Rater? Access Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showTrainingRequest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowTrainingRequest(false)}></div>
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 p-8 text-center text-white flex-shrink-0 relative">
              <button onClick={() => setShowTrainingRequest(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                <i className="fa-solid fa-xmark"></i>
              </button>
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-900 text-3xl font-bold mx-auto mb-4 shadow-lg">
                <i className="fa-solid fa-graduation-cap"></i>
              </div>
              <h2 className="text-2xl font-bold uppercase tracking-tight">Request THINCS Rater Training</h2>
              <p className="text-slate-300 mt-2 opacity-90 text-sm max-w-xl mx-auto">
                The THINCS Rater Course is a 3-day, in-person program designed to equip staff with the skills to effectively use the THINCS behavioural marker system.
              </p>
            </div>
            
            <div className="p-8 overflow-y-auto custom-scrollbar flex-grow bg-slate-50">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8 text-sm text-slate-600 leading-relaxed">
                <h3 className="font-bold text-slate-800 mb-2">Training Information</h3>
                <p className="mb-2">Training is delivered by qualified THINCS Rater Trainers. There is no direct cost to the Fire and Rescue Service for the training delivery; the only requirement is to cover the trainer's expenses (accommodation, subsistence, and travel).</p>
                <p>Once you submit your registration of interest, a member of our team will contact you to discuss arrangements.</p>
              </div>

              <form onSubmit={handleTrainingSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Full Name <span className="text-red-500">*</span></label>
                    <input type="text" required value={trFullName} onChange={(e) => setTrFullName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900 bg-white" placeholder="e.g. Jane Doe" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Rank / Role <span className="text-red-500">*</span></label>
                    <input type="text" required value={trRank} onChange={(e) => setTrRank(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900 bg-white" placeholder="e.g. Station Manager" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Department <span className="text-red-500">*</span></label>
                    <input type="text" required value={trDepartment} onChange={(e) => setTrDepartment(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900 bg-white" placeholder="e.g. Training & Development" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Fire Service <span className="text-red-500">*</span></label>
                    <select required value={trFireService} onChange={(e) => setTrFireService(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900 bg-white">
                      <option value="" disabled>Select Fire Service</option>
                      {UK_FIRE_SERVICES.map(service => (
                        <option key={service} value={service}>{service}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Email Address <span className="text-red-500">*</span></label>
                  <input type="email" required value={trEmail} onChange={(e) => setTrEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900 bg-white" placeholder="name@fire-service.gov.uk" />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Incident Command Level <span className="text-red-500">*</span></label>
                  <div className="flex gap-3">
                    {['1', '2', '3'].map(lvl => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setTrCommandLevel(lvl as any)}
                        className={`flex-1 py-3 rounded-xl font-bold border transition-all text-sm ${trCommandLevel === lvl ? 'bg-slate-900 border-slate-900 text-white shadow-md' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
                      >
                        Level {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-4">
                  <div className="pt-1">
                    <input 
                      type="checkbox" 
                      required 
                      id="authConfirm"
                      checked={trAuthorized} 
                      onChange={(e) => setTrAuthorized(e.target.checked)} 
                      className="w-5 h-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                    />
                  </div>
                  <label htmlFor="authConfirm" className="text-sm font-semibold text-slate-800 cursor-pointer select-none">
                    I confirm that I hold a position within my organisation with the authority to request and authorise the training of staff.
                  </label>
                </div>

                {trError && <p className="text-xs font-black text-red-600 bg-red-50 p-4 rounded-xl border border-red-100">{trError}</p>}
                {trSuccess && <p className="text-xs font-black text-emerald-600 bg-emerald-50 p-4 rounded-xl border border-emerald-100">{trSuccess}</p>}

                <div className="pt-4 border-t border-slate-200">
                  <button type="submit" disabled={trLoading} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 rounded-2xl shadow-xl shadow-slate-200 disabled:opacity-50 transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-2">
                    {trLoading ? (
                      <><i className="fa-solid fa-spinner fa-spin"></i> Submitting Request...</>
                    ) : (
                      <><i className="fa-solid fa-paper-plane"></i> Submit Registration of Interest</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;