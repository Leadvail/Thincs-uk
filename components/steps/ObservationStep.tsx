import React, { useState } from 'react';
import { Assessment, Observation, CommandSkillName } from '../../types';
import { COMMAND_SKILLS } from '../../constants';

interface ObservationStepProps {
  assessment: Assessment;
  onUpdate: (data: Partial<Assessment>) => void;
  onNext: () => void;
}

const ObservationStep: React.FC<ObservationStepProps> = ({ assessment, onUpdate, onNext }) => {
  const [selectedSkill, setSelectedSkill] = useState<CommandSkillName | null>(null);
  const [selectedSubSkillId, setSelectedSubSkillId] = useState<number | null>(null);
  const [activity, setActivity] = useState('');
  const [obsText, setObsText] = useState('');
  const [obsType, setObsType] = useState<'good' | 'poor'>('good');

  const handleAddObservation = () => {
    if (!selectedSkill || !selectedSubSkillId || !obsText.trim()) return;

    const newObs: Observation = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      activity: activity.trim() || 'General Scene Activity',
      skillName: selectedSkill,
      subSkillId: selectedSubSkillId,
      type: obsType,
      description: obsText.trim()
    };

    onUpdate({ observations: [...assessment.observations, newObs] });
    
    // Reset form but keep skill/activity if needed
    setObsText('');
  };

  const removeObservation = (id: string) => {
    if (confirm('Are you sure you want to remove this observation?')) {
      onUpdate({ observations: assessment.observations.filter(o => o.id !== id) });
    }
  };

  const skillData = COMMAND_SKILLS.find(s => s.name === selectedSkill);
  const subSkillData = skillData?.subSkills.find(ss => ss.id === selectedSubSkillId);

  const getSkillColorClass = (skillName: CommandSkillName) => {
    const s = COMMAND_SKILLS.find(x => x.name === skillName);
    switch (s?.color) {
      case 'blue': return 'bg-blue-600';
      case 'green': return 'bg-green-600';
      case 'amber': return 'bg-amber-500';
      case 'cyan': return 'bg-cyan-500';
      case 'pink': return 'bg-rose-500';
      case 'emerald': return 'bg-emerald-800';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-[600px]">
      {/* Logger Panel */}
      <div className="w-full lg:w-1/2 p-6 border-b lg:border-b-0 lg:border-r border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-800">Logger</h3>
          <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-500">Live Time Recording</span>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-2">1. Current Activity</label>
            <input 
              type="text"
              placeholder="e.g. Briefing team, 360 size-up..."
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-2">2. Select Command Skill</label>
            <div className="grid grid-cols-2 gap-2">
              {COMMAND_SKILLS.map(skill => (
                <button
                  key={skill.name}
                  onClick={() => {
                    setSelectedSkill(skill.name);
                    setSelectedSubSkillId(null);
                  }}
                  className={`text-[10px] md:text-xs font-bold p-3 rounded-lg text-white transition-all text-left ${getSkillColorClass(skill.name)} ${selectedSkill === skill.name ? 'ring-4 ring-slate-300 scale-95' : 'opacity-80 hover:opacity-100'}`}
                >
                  {skill.name}
                </button>
              ))}
            </div>
          </div>

          {selectedSkill && (
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-2">3. Sub Skill</label>
              <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                {COMMAND_SKILLS.find(s => s.name === selectedSkill)?.subSkills.map(ss => (
                  <button
                    key={ss.id}
                    onClick={() => setSelectedSubSkillId(ss.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium border transition-all ${selectedSubSkillId === ss.id ? 'border-slate-800 bg-slate-800 text-white' : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'}`}
                  >
                    {ss.id}. {ss.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedSubSkillId && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <label className="block text-xs font-bold uppercase text-slate-400 mb-2">4. Record Behavioural Observation</label>
              <div className="flex gap-2 mb-2">
                <button 
                    onClick={() => setObsType('good')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold border flex items-center justify-center gap-2 ${obsType === 'good' ? 'bg-green-100 border-green-500 text-green-700' : 'bg-white border-slate-200 text-slate-400'}`}
                >
                    <i className="fa-solid fa-circle-check"></i> Good Practice
                </button>
                <button 
                    onClick={() => setObsType('poor')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold border flex items-center justify-center gap-2 ${obsType === 'poor' ? 'bg-red-100 border-red-500 text-red-700' : 'bg-white border-slate-200 text-slate-400'}`}
                >
                    <i className="fa-solid fa-circle-xmark"></i> Poor Practice
                </button>
              </div>
              <textarea 
                value={obsText}
                onChange={(e) => setObsText(e.target.value)}
                placeholder="Describe what was actually seen/heard..."
                rows={3}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500 mb-2 text-sm"
              />
              <button 
                onClick={handleAddObservation}
                disabled={!obsText.trim()}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white py-3 rounded-xl font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-plus"></i>
                Save Observation
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Observations Feed */}
      <div className="w-full lg:w-1/2 flex flex-col bg-slate-50">
        <div className="p-4 border-b border-slate-200 bg-white sticky top-0 flex items-center justify-between">
            <h3 className="font-bold text-slate-700">Behavioural Observations ({assessment.observations.length})</h3>
            <button 
                onClick={onNext}
                className="text-xs font-bold bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800"
            >
                Review & Rate <i className="fa-solid fa-chevron-right ml-1"></i>
            </button>
        </div>
        
        <div className="flex-grow p-4 space-y-3 overflow-y-auto max-h-[calc(100vh-350px)]">
          {assessment.observations.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60 italic py-12">
              <i className="fa-solid fa-microphone-lines text-4xl mb-3"></i>
              <p>Waiting for records...</p>
            </div>
          ) : (
            assessment.observations.slice().reverse().map(obs => (
              <div key={obs.id} className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm relative group">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-mono text-slate-400">{obs.time}</span>
                  <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded text-white ${getSkillColorClass(obs.skillName)}`}>
                    {obs.skillName.split(' ')[0]}
                  </span>
                  <span className={`text-[10px] font-bold ${obs.type === 'good' ? 'text-green-600' : 'text-red-600'}`}>
                    {obs.type === 'good' ? 'Good' : 'Poor'}
                  </span>
                </div>
                <div className="text-[10px] font-semibold text-slate-400 uppercase mb-1">{obs.activity}</div>
                <p className="text-sm text-slate-700 leading-tight">{obs.description}</p>
                <div className="mt-2 pt-2 border-t border-slate-50 text-[10px] text-slate-400 italic">
                    Sub skill {obs.subSkillId}: {COMMAND_SKILLS.find(s => s.name === obs.skillName)?.subSkills.find(ss => ss.id === obs.subSkillId)?.name}
                </div>
                <button 
                    onClick={() => removeObservation(obs.id)}
                    className="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <i className="fa-solid fa-trash text-[10px]"></i>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ObservationStep;