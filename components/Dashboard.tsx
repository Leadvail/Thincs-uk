import React, { useState } from 'react';
import { Assessment } from '../types';

interface DashboardProps {
  assessments: Assessment[];
  onStart: () => void;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ assessments, onStart, onView, onDelete }) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const confirmDelete = () => {
    if (deletingId) {
      onDelete(deletingId);
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Assessments</h2>
          <p className="text-slate-500">Manage and review behavioral marker evaluations</p>
        </div>
        <button 
          onClick={onStart}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
        >
          <i className="fa-solid fa-plus"></i>
          Start New Assessment
        </button>
      </div>

      <div className="grid gap-4">
        {assessments.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 text-2xl">
              <i className="fa-solid fa-clipboard-list"></i>
            </div>
            <h3 className="text-lg font-semibold text-slate-700">No assessments found</h3>
            <p className="text-slate-500 mt-1">Start your first observation to populate this list</p>
          </div>
        ) : (
          assessments.sort((a,b) => b.id.localeCompare(a.id)).map((assessment) => (
            <div 
              key={assessment.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 flex flex-col md:flex-row md:items-center gap-4 hover:border-red-200 transition-colors group"
            >
              <div className="flex-grow">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${assessment.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    {assessment.status}
                  </span>
                  {assessment.raterRole === 'temporary_rater' && (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                      <i className="fa-solid fa-flask mr-1"></i> Mock Assessment
                    </span>
                  )}
                  <span className="text-xs text-slate-400">#{assessment.id.slice(-5)}</span>
                </div>
                <h4 className="text-lg font-bold text-slate-800">
                  {assessment.icName || 'Unnamed Incident Commander'}
                </h4>
                <p className="text-sm text-slate-500 line-clamp-1">{assessment.eventType || 'No event type'} - {assessment.incidentDescription || 'No description'}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                  <span><i className="fa-solid fa-calendar-days mr-1"></i> {new Date(assessment.startTime).toLocaleDateString()}</span>
                  <span><i className="fa-solid fa-user mr-1"></i> Rater: {assessment.raterName}</span>
                  <span><i className="fa-solid fa-eye mr-1"></i> {assessment.observations.length} Observations</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => onView(assessment.id)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-colors flex-grow md:flex-grow-0"
                >
                  {assessment.status === 'completed' ? 'View Report' : 'Resume'}
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeletingId(assessment.id);
                  }}
                  className="p-3 text-slate-300 hover:text-red-600 transition-colors bg-transparent border-none cursor-pointer"
                  title="Delete Assessment"
                >
                  <i className="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setDeletingId(null)}></div>
          <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-6">
                <i className="fa-solid fa-triangle-exclamation"></i>
              </div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">Confirm Deletion</h3>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                This will permanently remove the assessment record. This action cannot be undone.
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={confirmDelete}
                  className="w-full bg-red-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-100 hover:bg-red-700 transition-all uppercase tracking-widest text-xs"
                >
                  Confirm Delete
                </button>
                <button 
                  onClick={() => setDeletingId(null)}
                  className="w-full bg-slate-100 text-slate-600 font-bold py-4 rounded-xl hover:bg-slate-200 transition-all uppercase tracking-widest text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;