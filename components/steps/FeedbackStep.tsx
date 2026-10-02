import React from 'react';
import { Assessment, CommandSkillName } from '../../types';
import { COMMAND_SKILLS } from '../../constants';

interface FeedbackStepProps {
  assessment: Assessment;
  onUpdate: (data: Partial<Assessment>) => void;
  onClose: () => void;
}

const FeedbackStep: React.FC<FeedbackStepProps> = ({ assessment, onUpdate, onClose }) => {
  const handleDownloadPDF = async () => {
    const element = document.getElementById('printable-report-area');
    if (!element) return;

    try {
      // Dynamically load to prevent Vite top-level browser crashes
      const html2pdfModule = await import('html2pdf.js');
      const html2pdf = (html2pdfModule.default || html2pdfModule) as any;

      const opt = {
        margin: 10,
        filename: `THINCS_Report_${assessment.icName ? assessment.icName.replace(/\s+/g, '_') : 'Assessment'}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
        pagebreak: { mode: ['css', 'legacy'] }
      };

      html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF.");
    }
  };

  const getSubSkillRating = (skillName: CommandSkillName, ssId: number) => {
    return assessment.ratings[`${skillName}-${ssId}`] || 'NO';
  };

  const getCommandSkillMean = (skillName: CommandSkillName): string | number => {
    const skill = COMMAND_SKILLS.find(s => s.name === skillName);
    if (!skill) return "N/A";

    let sum = 0;
    let count = 0;

    skill.subSkills.forEach(ss => {
      const r = assessment.ratings[`${skill.name}-${ss.id}`];
      if (r && r !== 'NO' && r !== '0') {
        sum += parseInt(r);
        count++;
      }
    });

    return count > 0 ? (sum / count).toFixed(2) : "NO";
  };

  const getGlobalMean = () => {
    let sum = 0;
    let count = 0;
    COMMAND_SKILLS.forEach(skill => {
      const mean = getCommandSkillMean(skill.name);
      if (mean !== "NO" && mean !== "N/A") {
        sum += parseFloat(mean as string);
        count++;
      }
    });
    return count > 0 ? (sum / count).toFixed(2) : "N/A";
  };

  const getObsCount = (type: 'good' | 'poor') => {
    return assessment.observations.filter(o => o.type === type).length;
  };

  const getSkillColorClass = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-600';
      case 'green': return 'bg-green-600';
      case 'amber': return 'bg-amber-500';
      case 'cyan': return 'bg-cyan-500';
      case 'pink': return 'bg-rose-500';
      case 'emerald': return 'bg-emerald-800';
      default: return 'bg-slate-800';
    }
  };

  const getSkillBorderClass = (color: string) => {
    switch (color) {
      case 'blue': return 'border-blue-600';
      case 'green': return 'border-green-600';
      case 'amber': return 'border-amber-500';
      case 'cyan': return 'border-cyan-500';
      case 'pink': return 'border-rose-500';
      case 'emerald': return 'border-emerald-800';
      default: return 'border-slate-800';
    }
  };

  const isMock = assessment.raterRole === 'temporary_rater';

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div id="printable-report-area" className="bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-slate-100 mb-8 printable-area">

        {isMock && (
          <div className="bg-amber-500 text-white text-center py-2 px-4 rounded-xl mb-6 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-lg shadow-amber-200 no-print">
            <i className="fa-solid fa-flask text-lg"></i>
            Developmental Mock Assessment
            <i className="fa-solid fa-flask text-lg"></i>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between border-b-2 border-slate-900 pb-6 mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-red-200">T</div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">THINCS Feedback Pro Forma</h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">UK FRS Behavioral Marker Assessment</p>
            </div>
          </div>
          <div className="text-right flex flex-col items-center sm:items-end">
            <div className={`px-3 py-1 rounded text-[10px] font-black mb-1 uppercase tracking-widest ${isMock ? 'bg-amber-100 text-amber-700' : 'bg-slate-900 text-white'}`}>
              {isMock ? 'Mock Report' : 'Official Record'}
            </div>
            <p className="text-xs text-slate-400 font-mono">Date: {new Date(assessment.startTime).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Admin Context */}
        <section className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-8 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-[0.2em] border-b pb-3 flex items-center gap-2">
              <i className="fa-solid fa-id-card"></i> Personnel
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-slate-50 py-1"><span className="font-bold text-slate-700">Rater:</span> <span className="text-slate-900">{assessment.raterName}</span></div>
              <div className="flex justify-between border-b border-slate-50 py-1"><span className="font-bold text-slate-700">Commander:</span> <span className="text-slate-900">{assessment.icName}</span></div>
              <div className="flex justify-between border-b border-slate-50 py-1"><span className="font-bold text-slate-700">Event Type:</span> <span className="text-slate-900">{assessment.eventType}</span></div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-[0.2em] border-b pb-3 flex items-center gap-2">
              <i className="fa-solid fa-file-lines"></i> Briefing
            </h3>
            <p className="text-sm text-slate-600 italic whitespace-pre-wrap leading-relaxed font-medium">
              {assessment.incidentDescription || "No detailed description provided."}
            </p>
          </div>
        </section>

        {/* Marker Detailed Sheet */}
        <section className="mb-12">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-[0.2em] mb-8 px-1 flex items-center gap-2">
            <i className="fa-solid fa-clipboard-check"></i>
            Behavioural Performance Matrix
          </h3>

          <div className="space-y-16">
            {COMMAND_SKILLS.map(skill => (
              <div key={skill.name} className={`skill-section border-l-[12px] ${getSkillBorderClass(skill.color)} bg-white rounded-r-3xl shadow-md border border-slate-200 overflow-hidden`}>
                <div className={`${getSkillColorClass(skill.color)} p-5 flex justify-between items-center text-white`}>
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                      <i className="fa-solid fa-star text-xs"></i>
                    </span>
                    <span className="font-black uppercase text-sm tracking-widest">{skill.name}</span>
                  </div>
                  <div className="flex items-center gap-4 bg-black/10 px-4 py-2 rounded-xl backdrop-blur-sm">
                    <span className="text-[10px] font-black uppercase tracking-tighter opacity-80">Category Mean:</span>
                    <span className="bg-white text-slate-900 px-3 py-1 rounded-lg text-xs font-black shadow-inner">{getCommandSkillMean(skill.name)}</span>
                  </div>
                </div>

                <div className="p-0 overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-slate-50/80 text-[10px] font-black uppercase text-slate-400 border-b border-slate-100">
                      <tr>
                        <th className="px-8 py-5 w-1/3 tracking-widest">Marker Identification</th>
                        <th className="px-8 py-5 w-1/2 tracking-widest">Observable Feedback</th>
                        <th className="px-8 py-5 text-center w-32 tracking-widest">Rating</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {skill.subSkills.map(ss => (
                        <tr key={ss.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-6 align-top">
                            <span className="font-black text-slate-900 block mb-1">{ss.id}. {ss.name}</span>
                          </td>
                          <td className="px-8 py-6 text-slate-600 leading-relaxed align-top font-medium italic">
                            {assessment.keyFeedback[`${skill.name}-${ss.id}`] || "No specific evidence recorded."}
                          </td>
                          <td className="px-8 py-6 text-center align-top">
                            <div className={`font-black text-slate-900 bg-slate-50 w-12 h-12 flex items-center justify-center rounded-2xl mx-auto border-2 border-slate-100 shadow-inner text-lg`}>
                              {getSubSkillRating(skill.name, ss.id)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Signature & End of Report */}
        <section className="mt-20 pt-10 border-t-2 border-slate-100 grid grid-cols-2 gap-12 print-footer">
          <div>
            <span className="block text-[10px] font-black uppercase text-slate-400 mb-8 tracking-[0.2em]">Rater Authentication</span>
            <div className="border-b-2 border-slate-900 pb-2 mb-2 min-h-[40px]"></div>
            <p className="text-[10px] font-bold text-slate-500 uppercase">{assessment.raterName}</p>
          </div>
          <div>
            <span className="block text-[10px] font-black uppercase text-slate-400 mb-8 tracking-[0.2em]">Commander Acknowledgment</span>
            <div className="border-b-2 border-slate-900 pb-2 mb-2 min-h-[40px]"></div>
            <p className="text-[10px] font-bold text-slate-500 uppercase">{assessment.icName}</p>
          </div>
        </section>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 no-print mt-8">
        <button
          onClick={handleDownloadPDF}
          className="flex-1 bg-red-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-red-700 transition-all flex items-center justify-center gap-3 transform hover:-translate-y-1 active:scale-95 uppercase tracking-widest text-xs"
        >
          <i className="fa-solid fa-file-pdf text-xl"></i>
          Export PDF Report
        </button>
        <button
          onClick={onClose}
          className="flex-1 bg-slate-900 text-white font-black py-5 rounded-2xl hover:bg-slate-800 transition-all shadow-xl uppercase tracking-widest text-xs"
        >
          Close & Finish
        </button>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          /* Force hide the confirmation modal and its backdrop during print */
          .no-print, 
          [role="dialog"], 
          .shadow-overlay { 
            display: none !important; 
            visibility: hidden !important; 
            opacity: 0 !important;
          }
          
          .printable-area { padding: 0 !important; width: 100% !important; max-width: 100% !important; margin: 0 !important; }
          body { background: white !important; margin: 0 !important; padding: 0 !important; }
          header, footer { display: none !important; }
          
          .bg-slate-50 { background-color: #f8fafc !important; -webkit-print-color-adjust: exact; }
          .bg-slate-900 { background-color: #0f172a !important; -webkit-print-color-adjust: exact; }
          .bg-red-600 { background-color: #dc2626 !important; -webkit-print-color-adjust: exact; }
          .bg-blue-600 { background-color: #2563eb !important; -webkit-print-color-adjust: exact; }
          .bg-green-600 { background-color: #16a34a !important; -webkit-print-color-adjust: exact; }
          .bg-amber-500 { background-color: #f59e0b !important; -webkit-print-color-adjust: exact; }
          .bg-cyan-500 { background-color: #06b6d4 !important; -webkit-print-color-adjust: exact; }
          .bg-rose-500 { background-color: #f43f5e !important; -webkit-print-color-adjust: exact; }
          .bg-emerald-800 { background-color: #065f46 !important; -webkit-print-color-adjust: exact; }
          
          .border-blue-600 { border-color: #2563eb !important; -webkit-print-color-adjust: exact; }
          .border-green-600 { border-color: #16a34a !important; -webkit-print-color-adjust: exact; }
          .border-amber-500 { border-color: #f59e0b !important; -webkit-print-color-adjust: exact; }
          .border-cyan-500 { border-color: #06b6d4 !important; -webkit-print-color-adjust: exact; }
          .border-rose-500 { border-color: #f43f5e !important; -webkit-print-color-adjust: exact; }
          .border-emerald-800 { border-color: #065f46 !important; -webkit-print-color-adjust: exact; }

          .text-white { color: white !important; -webkit-print-color-adjust: exact; }
          
          .skill-section { 
            page-break-inside: avoid; 
            margin-bottom: 2rem; 
            border: 1px solid #e2e8f0 !important;
          }
          
          table { width: 100% !important; border-collapse: collapse !important; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          
          .print-footer { 
            page-break-inside: avoid; 
            margin-top: 3rem; 
          }
        }
        @page {
          size: A4;
          margin: 1.5cm;
        }
      ` }} />
    </div>
  );
};

export default FeedbackStep;