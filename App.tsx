import React, { useState, useEffect, useCallback } from 'react';
import { User, Assessment } from './types';
import Header from './components/Header';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AssessmentFlow from './components/AssessmentFlow';
import AdminPanel from './components/AdminPanel';
import ProfileSettings from './components/ProfileSettings';
import { supabase } from './lib/supabase';

const ADMIN_EMAIL = 'andrew.vaillant@london-fire.gov.uk';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profileStatus, setProfileStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [activeAssessmentId, setActiveAssessmentId] = useState<string | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isProfileMode, setIsProfileMode] = useState(false);
  const [loading, setLoading] = useState(true);

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

  const fetchProfile = useCallback(async (userId: string, email?: string) => {
    try {
      const isHardcodedAdmin = email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!data && !error) {
        // Fallback to auth metadata if profile row doesn't exist yet
        const { data: { user } } = await supabase.auth.getUser();
        const metadata = user?.user_metadata || {};

        const newProfile = {
          id: userId,
          email: email || null,
          full_name: metadata.full_name || email?.split('@')[0] || 'User',
          fire_service: metadata.fire_service || null,
          employee_id: metadata.employee_id || null,
          command_level: metadata.command_level || null,
          assessor_qual: metadata.assessor_qual || false,
          iqa_qual: metadata.iqa_qual || false,
          additional_quals: metadata.additional_quals || [],
          role: isHardcodedAdmin ? 'admin' : 'temporary_rater',
          status: isHardcodedAdmin ? 'approved' : 'pending'
        };

        try {
          const { data: insertedData, error: insertError } = await supabase
            .from('profiles')
            .upsert(newProfile)
            .select()
            .maybeSingle();

          if (!insertError && insertedData) {
            data = insertedData;
          } else {
            // If upsert fails (RLS), use the local profile object
            data = newProfile as any;
          }
        } catch (e) {
          data = newProfile as any;
        }
      }

      const role = isHardcodedAdmin ? 'admin' : (data?.role || 'temporary_rater');
      const status = isHardcodedAdmin ? 'approved' : (data?.status || 'pending');

      setProfileStatus(status as any);
      setCurrentUser({
        id: userId,
        name: data?.full_name || email?.split('@')[0] || 'User',
        role: role as any,
        email: email
      });
    } catch (err: any) {
      console.error('Profile fetch error:', err);
      const isHardcodedAdmin = email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
      setProfileStatus(isHardcodedAdmin ? 'approved' : 'pending');
      setCurrentUser({
        id: userId,
        name: email?.split('@')[0] || 'User',
        role: isHardcodedAdmin ? 'admin' : 'temporary_rater',
        email: email
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email);
      } else {
        setCurrentUser(null);
        setProfileStatus(null);
        setIsAdminMode(false);
        setIsProfileMode(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  useEffect(() => {
    if (session?.user && profileStatus === 'approved') {
      fetchAssessments();
    }
  }, [session, profileStatus]);

  const fetchAssessments = async () => {
    try {
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const mappedAssessments: Assessment[] = data.map(item => ({
          ...item.data,
          id: item.assessment_id
        }));
        setAssessments(mappedAssessments);
      }
    } catch (error) {
      console.error('Error fetching assessments:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const syncAssessmentToSupabase = async (assessment: Assessment) => {
    if (!session?.user || profileStatus !== 'approved') return;
    try {
      const { error } = await supabase
        .from('assessments')
        .upsert({
          assessment_id: assessment.id,
          user_id: session.user.id,
          rater_name: assessment.raterName,
          ic_name: assessment.icName,
          candidate_id: assessment.candidate_id || null,
          event_type: assessment.eventType,
          status: assessment.status,
          data: assessment
        }, { onConflict: 'assessment_id' });

      if (error) {
        console.error('Sync failed with error:', error);
      }
    } catch (error) {
      console.warn('Sync failed:', error);
    }
  };

  const startNewAssessment = async () => {
    if (!currentUser) return;
    const newAssessment: Assessment = {
      id: Date.now().toString(),
      eventType: '',
      raterName: currentUser.name || '',
      raterRole: currentUser.role,
      icName: '',
      incidentDescription: '',
      startTime: new Date().toISOString(),
      observations: [],
      ratings: {},
      keyFeedback: {},
      status: 'ongoing'
    };

    setAssessments([newAssessment, ...assessments]);
    setActiveAssessmentId(newAssessment.id);
    await syncAssessmentToSupabase(newAssessment);
  };

  const updateAssessment = (updated: Assessment) => {
    setAssessments(assessments.map(a => a.id === updated.id ? updated : a));
    syncAssessmentToSupabase(updated);
  };

  const deleteAssessment = async (id: string) => {
    if (!id) return;
    const previousAssessments = [...assessments];

    // Optimistically update UI
    setAssessments(assessments.filter(a => a.id !== id));

    try {
      const { error } = await supabase
        .from('assessments')
        .delete()
        .eq('assessment_id', id);

      if (error) throw error;

      if (activeAssessmentId === id) {
        setActiveAssessmentId(null);
      }
    } catch (err: any) {
      console.error('Delete failed:', err);
      // Rollback UI
      setAssessments(previousAssessments);
      alert(`Delete Error: ${formatErrorMessage(err)}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Initialising THINCS...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Login onLogin={() => { }} />;
  }

  if (!currentUser || profileStatus === 'pending') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
          <div className="bg-amber-500 p-8 text-white text-center">
            <i className="fa-solid fa-clock-rotate-left text-4xl mb-4"></i>
            <h2 className="text-2xl font-bold uppercase tracking-tight">Account Pending</h2>
          </div>
          <div className="p-8 text-center">
            <p className="text-slate-600 mb-6 leading-relaxed">
              Your account has been created successfully, but requires <strong>administrative approval</strong> before you can access the THINCS portal.
            </p>
            <div className="bg-slate-50 p-4 rounded-xl mb-8 border border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
              <p className="text-sm font-bold text-amber-600">Awaiting Service Admin Confirmation</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm font-bold text-slate-400 hover:text-red-600 uppercase tracking-widest transition-colors"
            >
              Log Out and Check Later
            </button>
          </div>
        </div>
      </div>
    );
  }

  const activeAssessment = assessments.find(a => a.id === activeAssessmentId);

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        user={currentUser}
        onLogout={handleLogout}
        onHome={() => {
          setActiveAssessmentId(null);
          setIsAdminMode(false);
          setIsProfileMode(false);
        }}
        onAdminToggle={() => {
          setIsAdminMode(!isAdminMode);
          setIsProfileMode(false);
          setActiveAssessmentId(null);
        }}
        onProfileToggle={() => {
          setIsProfileMode(!isProfileMode);
          setIsAdminMode(false);
          setActiveAssessmentId(null);
        }}
        isAdminMode={isAdminMode}
        isProfileMode={isProfileMode}
        activeAssessmentName={activeAssessment?.icName}
      />

      <main className="flex-grow container mx-auto px-4 py-8">
        {isAdminMode ? (
          <AdminPanel />
        ) : isProfileMode ? (
          <ProfileSettings
            userId={currentUser.id}
            onClose={() => setIsProfileMode(false)}
            onSaveSuccess={() => fetchProfile(currentUser.id, currentUser.email)}
          />
        ) : activeAssessmentId && activeAssessment ? (
          <AssessmentFlow
            assessment={activeAssessment}
            onUpdate={updateAssessment}
            onClose={() => setActiveAssessmentId(null)}
          />
        ) : (
          <Dashboard
            assessments={assessments}
            onStart={startNewAssessment}
            onView={(id) => setActiveAssessmentId(id)}
            onDelete={deleteAssessment}
          />
        )}
      </main>

      <footer className="bg-white border-t py-6 text-center text-slate-500 text-sm no-print">
        <p>&copy; {new Date().getFullYear()} Cardiff University - UK FRS THINCS Behavioural Marker System</p>
      </footer>
    </div>
  );
};

export default App;