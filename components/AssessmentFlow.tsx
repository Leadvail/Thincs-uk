import React, { useState } from 'react';
import { Assessment, Observation, CommandSkillName, RatingValue } from '../types';
import { COMMAND_SKILLS, RATINGS } from '../constants';
import AdminStep from './steps/AdminStep';
import ObservationStep from './steps/ObservationStep';
import ReviewStep from './steps/ReviewStep';
import FeedbackStep from './steps/FeedbackStep';

interface AssessmentFlowProps {
  assessment: Assessment;
  onUpdate: (updated: Assessment) => void;
  onClose: () => void;
}

type Step = 'admin' | 'observe' | 'review' | 'feedback';

const AssessmentFlow: React.FC<AssessmentFlowProps> = ({ assessment, onUpdate, onClose }) => {
  const [step, setStep] = useState<Step>(assessment.status === 'completed' ? 'feedback' : 'admin');

  const steps: { key: Step; label: string; icon: string }[] = [
    { key: 'admin', label: 'Admin', icon: 'fa-id-card' },
    { key: 'observe', label: 'Observe', icon: 'fa-eye' },
    { key: 'review', label: 'Review & Rate', icon: 'fa-star' },
    { key: 'feedback', label: 'Feedback', icon: 'fa-comment-dots' }
  ];

  const handleUpdate = (data: Partial<Assessment>) => {
    onUpdate({ ...assessment, ...data });
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Navigation Header - hidden on print */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-6 sticky top-20 z-40 flex flex-wrap items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-1 md:gap-4 overflow-x-auto no-scrollbar">
          {steps.map((s, idx) => (
            <React.Fragment key={s.key}>
              <button
                onClick={() => setStep(s.key)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                  step === s.key ? 'bg-red-50 text-red-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <i className={`fa-solid ${s.icon}`}></i>
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {idx < steps.length - 1 && <i className="fa-solid fa-chevron-right text-[10px] text-slate-300 mx-1"></i>}
            </React.Fragment>
          ))}
        </div>
        
        <button 
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 px-3 py-2"
        >
          <i className="fa-solid fa-xmark mr-2"></i>
          Exit
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[600px]">
        {step === 'admin' && (
          <AdminStep 
            assessment={assessment} 
            onUpdate={handleUpdate} 
            onNext={() => setStep('observe')} 
          />
        )}
        {step === 'observe' && (
          <ObservationStep 
            assessment={assessment} 
            onUpdate={handleUpdate} 
            onNext={() => setStep('review')} 
          />
        )}
        {step === 'review' && (
          <ReviewStep 
            assessment={assessment} 
            onUpdate={handleUpdate} 
            onNext={() => setStep('feedback')} 
          />
        )}
        {step === 'feedback' && (
          <FeedbackStep 
            assessment={assessment} 
            onUpdate={handleUpdate} 
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
};

export default AssessmentFlow;