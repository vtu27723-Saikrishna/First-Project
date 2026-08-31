import React, { useState } from 'react';
import { 
  TriageReport, 
  Turbine, 
  TechnicianProfile 
} from '../types';
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  FileText, 
  Printer, 
  Share2, 
  CheckSquare, 
  UserCheck, 
  ArrowLeft, 
  Sparkles, 
  Volume2,
  Wrench,
  Download
} from 'lucide-react';

interface ActionRecommendationViewProps {
  report: TriageReport;
  turbine: Turbine;
  technician: TechnicianProfile | null;
  onBackToOverview: () => void;
  onOpenSupervisorReview: () => void;
}

export const ActionRecommendationView: React.FC<ActionRecommendationViewProps> = ({
  report,
  turbine,
  technician,
  onBackToOverview,
  onOpenSupervisorReview
}) => {
  const [completedTasks, setCompletedTasks] = useState<Record<number, boolean>>({});

  const toggleTask = (idx: number) => {
    setCompletedTasks(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onBackToOverview}
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Turbine Overview</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-600 transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print Field Sheet</span>
          </button>

          {!report.supervisorApproved ? (
            <button
              onClick={onOpenSupervisorReview}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition"
            >
              <UserCheck className="w-4 h-4" />
              <span>Supervisor Sign-off</span>
            </button>
          ) : (
            <span className="px-3 py-1.5 bg-emerald-950 text-emerald-300 border border-emerald-700 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Supervisor Approved</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Standardized Action Recommendation Card */}
      <div className={`rounded-2xl border p-6 md:p-8 shadow-2xl space-y-6 relative overflow-hidden ${
        report.severityBand === 'red'
          ? 'bg-gradient-to-b from-rose-950/70 to-slate-900 border-rose-600 shadow-rose-950/40'
          : report.severityBand === 'amber'
          ? 'bg-gradient-to-b from-amber-950/70 to-slate-900 border-amber-600 shadow-amber-950/40'
          : 'bg-gradient-to-b from-emerald-950/70 to-slate-900 border-emerald-600 shadow-emerald-950/40'
      }`}>
        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-slate-900/80 border border-slate-700 font-mono font-bold text-xs text-white">
                {report.turbineCode}
              </span>
              <span className="text-xs text-slate-300 font-medium">Muppandal Wind Energy Hub</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Action Recommendation
            </h2>
          </div>

          {/* Priority & Score Pill */}
          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-xl font-mono text-center border shadow-lg ${
              report.priority === 'P1'
                ? 'bg-rose-600 text-white border-rose-400'
                : report.priority === 'P2'
                ? 'bg-amber-600 text-white border-amber-400'
                : 'bg-emerald-600 text-slate-950 border-emerald-400'
            }`}>
              <div className="text-[10px] font-bold uppercase tracking-wider">Priority Level</div>
              <div className="text-xl font-black">{report.priority}</div>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-center font-mono">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Severity Score</div>
              <div className="text-xl font-bold text-white">
                {report.severityScore} <span className="text-xs text-slate-500">/ 100</span>
              </div>
            </div>
          </div>
        </div>

        {/* The Concrete Action Statement */}
        <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5 text-emerald-400" />
            Standardized Directive:
          </div>
          <p className="text-base md:text-lg font-bold text-white leading-relaxed">
            "{report.recommendedAction}"
          </p>
        </div>

        {/* Triage Summary & Root Cause Diagnostic */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
              Summary Findings & Diagnostic Hypothesis:
            </span>
            <p className="text-slate-200 leading-relaxed font-sans">{report.summary}</p>
            {report.noiseProfile && (
              <div className="text-amber-300 font-mono text-[11px] pt-1">
                • {report.noiseProfile}
              </div>
            )}
            {report.oilSeepSeverity && (
              <div className="text-amber-300 font-mono text-[11px]">
                • {report.oilSeepSeverity}
              </div>
            )}
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 font-mono">
            <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px] font-sans">
              Metadata & Engineer Verification:
            </span>
            <div className="text-slate-300 space-y-1 text-[11px]">
              <div>Technician: <strong className="text-slate-100">{report.technicianName}</strong></div>
              <div>Perceived Severity: <strong className="text-slate-100 capitalize">{report.technicianPerceivedSeverity}</strong></div>
              <div>Diagnostic Confidence: <strong className="text-slate-100 capitalize">{report.technicianConfidence}</strong></div>
              <div>Timestamp: <strong className="text-slate-100">{new Date(report.createdAt).toLocaleString()}</strong></div>
            </div>
          </div>
        </div>

        {/* Follow-up Work Order Task Checklist */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-400" />
              Follow-up Maintenance Tasks ({report.followUpTasks.length}):
            </h4>
            <span className="text-xs text-slate-400 font-mono">
              {Object.values(completedTasks).filter(Boolean).length} / {report.followUpTasks.length} Completed
            </span>
          </div>

          <div className="space-y-2">
            {report.followUpTasks.map((task, idx) => {
              const isDone = !!completedTasks[idx];
              return (
                <div
                  key={idx}
                  onClick={() => toggleTask(idx)}
                  className={`p-3.5 rounded-xl border text-xs flex items-center gap-3 cursor-pointer transition ${
                    isDone
                      ? 'bg-emerald-950/40 border-emerald-600 text-emerald-200'
                      : 'bg-slate-950/70 border-slate-800 text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isDone}
                    onChange={() => {}}
                    className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 border-slate-700 bg-slate-900"
                  />
                  <span className={`flex-1 font-medium ${isDone ? 'line-through opacity-75' : ''}`}>
                    {task}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Attached Evidence Media */}
        {report.mediaRefs && report.mediaRefs.length > 0 && (
          <div className="space-y-3 pt-3 border-t border-slate-800/80">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Attached Field Photo / Audio Evidence ({report.mediaRefs.length}):
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {report.mediaRefs.map((m, idx) => (
                <div key={m.id || idx} className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1.5">
                  {m.type === 'photo' ? (
                    <div className="aspect-video rounded-lg overflow-hidden border border-slate-750">
                      <img src={m.url} alt={m.caption} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-900 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2 text-cyan-400">
                        <Volume2 className="w-5 h-5" />
                        <span className="text-xs font-bold text-white">Audio Snippet</span>
                      </div>
                      <button
                        onClick={() => new Audio(m.url).play()}
                        className="px-2.5 py-1 bg-cyan-600 text-white rounded text-xs font-bold"
                      >
                        Play
                      </button>
                    </div>
                  )}
                  <div className="text-xs font-bold text-white">{m.caption}</div>
                  {m.annotation && <div className="text-[11px] text-emerald-400 font-mono">{m.annotation}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Supervisor Approval Note Banner */}
        {report.supervisorNotes && (
          <div className="p-4 rounded-xl bg-slate-950/90 border border-emerald-700/80 space-y-1 text-xs">
            <div className="font-bold text-emerald-400 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4" />
              Supervisor Status:
            </div>
            <p className="text-slate-200 leading-relaxed font-mono">{report.supervisorNotes}</p>
          </div>
        )}
      </div>
    </div>
  );
};
