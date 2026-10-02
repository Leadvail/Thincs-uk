import React from 'react';
import { Assessment, CommandSkillName, RatingValue } from '../../types';
import { COMMAND_SKILLS, RATINGS } from '../../constants';

interface ReviewStepProps {
  assessment: Assessment;
  onUpdate: (data: Partial<Assessment>) => void;
  onNext: () => void;
}

const ReviewStep: React.FC<ReviewStepProps> = ({ assessment, onUpdate, onNext }) => {
  const handleRate = (skillName: CommandSkillName, subSkillId: number, value: RatingValue) => {
    const key = `${skillName}-${subSkillId}`;
    onUpdate({ ratings: { ...assessment.ratings, [key]: value } });
  };

  const getSubSkillObservations = (skillName: CommandSkillName, subSkillId: number) => {
    return assessment.observations.filter(o => o.skillName === skillName && o.subSkillId === subSkillId);
  };

  const handleFinalise = () => {
    const allRated = COMMAND_SKILLS.every(s => 
        s.subSkills.every(ss => assessment.ratings[`${s.name}-${ss.id}`])
    );
    
    if (!allRated) {
      if (!confirm('Not all sub-skills have been rated. You can proceed, but the report will be incomplete. Proceed anyway?')) return;
    }

    onUpdate({ 
      status: 'completed',
      finishTime: new Date().toISOString()
    });
    onNext();
  };

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h3 className="text-2xl font-bold text-slate-800">Review & Rating</h3>
          <p className="text-slate-500">Assign a rating for each sub-skill based on recorded performance.</p>
        </div>
        
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-[10px] max-w-sm">
            <h4 className="font-bold text-amber-800 mb-1 uppercase tracking-wider">Rating Scale Ref:</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {RATINGS.map(r => (
                    <div key={r.value} className="flex gap-1">
                        <span className="font-bold min-w-[15px]">{r.value}:</span>
                        <span className="text-slate-600 truncate">{r.label}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>

      <div className="space-y-12">
        {COMMAND_SKILLS.map(skill => (
          <div key={skill.name} className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
            <div className={`p-4 text-white flex items-center justify-between ${
                skill.color === 'blue' ? 'bg-blue-600' :
                skill.color === 'green' ? 'bg-green-600' :
                skill.color === 'amber' ? 'bg-amber-500' :
                skill.color === 'cyan' ? 'bg-cyan-500' :
                skill.color === 'pink' ? 'bg-rose-500' :
                'bg-emerald-800'
            }`}>
              <h4 className="font-bold uppercase tracking-wide">{skill.name}</h4>
              <span className="text-[10px] opacity-75 font-mono">COMMAND SKILL CATEGORY</span>
            </div>

            <div className="divide-y divide-slate-100">
              {skill.subSkills.map(ss => {
                const observations = getSubSkillObservations(skill.name, ss.id);
                const currentRating = assessment.ratings[`${skill.name}-${ss.id}`];

                return (
                  <div key={ss.id} className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="w-full md:w-1/3">
                        <h5 className="text-sm font-bold text-slate-800 mb-1">{ss.id}. {ss.name}</h5>
                        <div className="grid grid-cols-3 gap-1 mt-3">
                          {RATINGS.map(r => (
                            <button
                              key={r.value}
                              onClick={() => handleRate(skill.name, ss.id, r.value as RatingValue)}
                              title={r.description}
                              className={`py-2 px-1 rounded-lg text-xs font-bold border transition-all ${
                                currentRating === r.value 
                                  ? 'bg-slate-900 border-slate-900 text-white' 
                                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                              }`}
                            >
                              {r.value === 'NO' ? 'NO' : r.value}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="w-full md:w-2/3 bg-slate-50 rounded-xl p-4 border border-slate-100 min-h-[100px]">
                        <h6 className="text-[10px] font-bold uppercase text-slate-400 mb-2">Evidence & Context</h6>
                        {observations.length === 0 ? (
                          <div className="text-xs text-slate-300 italic">No observations recorded.</div>
                        ) : (
                          <div className="space-y-3">
                            {observations.map(o => (
                              <div key={o.id} className="text-xs bg-white p-2 rounded-lg border border-slate-100 flex flex-col gap-1.5 shadow-sm">
                                <div className="flex items-center gap-2">
                                  <span className={`font-black shrink-0 px-1.5 py-0.5 rounded text-[9px] ${o.type === 'good' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {o.type === 'good' ? 'GOOD' : 'POOR'}
                                  </span>
                                  <span className="text-[9px] font-bold uppercase text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                    <i className="fa-solid fa-thumbtack mr-1"></i>
                                    {o.activity}
                                  </span>
                                  <span className="text-[9px] text-slate-300 font-mono ml-auto">{o.time}</span>
                                </div>
                                <span className="text-slate-600 italic leading-relaxed">{o.description}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="mt-4">
                            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Sub-Skill Specific Comments</label>
                            <textarea 
                                value={assessment.keyFeedback[`${skill.name}-${ss.id}`] || ''}
                                onChange={(e) => onUpdate({ keyFeedback: { ...assessment.keyFeedback, [`${skill.name}-${ss.id}`]: e.target.value } })}
                                placeholder="Notes for this specific marker..."
                                className="w-full p-2 text-xs border border-slate-200 rounded bg-white outline-none focus:ring-1 focus:ring-red-500"
                                rows={2}
                            />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-8 flex justify-end">
        <button 
          onClick={handleFinalise}
          className="bg-red-600 text-white px-10 py-4 rounded-2xl font-bold shadow-xl transition-all active:scale-95 flex items-center gap-3 hover:bg-red-700"
        >
          Finalise & View Feedback
          <i className="fa-solid fa-flag-checkered"></i>
        </button>
      </div>
    </div>
  );
};

export default ReviewStep;