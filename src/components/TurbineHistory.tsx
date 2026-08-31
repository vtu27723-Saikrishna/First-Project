import React, { useState } from 'react';
import { 
  TriageReport, 
  InspectionRecord, 
  Turbine 
} from '../types';
import { 
  History, 
  Calendar, 
  FileText, 
  User, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowLeft, 
  Volume2, 
  Camera, 
  Search,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface TurbineHistoryProps {
  turbine: Turbine;
  triageReports: TriageReport[];
  inspections: InspectionRecord[];
  onBack: () => void;
  onSelectReport: (report: TriageReport) => void;
}

export const TurbineHistory: React.FC<TurbineHistoryProps> = ({
  turbine,
  triageReports,
  inspections,
  onBack,
  onSelectReport
}) => {
  const [activeTab, setActiveTab] = useState<'triage' | 'inspections'>('triage');
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedReportId(prev => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={onBack}
            className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 mb-2 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to {turbine.code}</span>
          </button>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            CBM History & Inspection Archive
          </h2>
          <p className="text-xs text-slate-400">
            Historical interventions and triage logs for <strong className="text-emerald-300 font-mono">{turbine.code}</strong> ({turbine.model})
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('triage')}
            className={`px-3.5 py-1.5 rounded-lg transition ${
              activeTab === 'triage'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Fault Triage Reports ({triageReports.length})
          </button>
          <button
            onClick={() => setActiveTab('inspections')}
            className={`px-3.5 py-1.5 rounded-lg transition ${
              activeTab === 'inspections'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Guided Checklists ({inspections.length})
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'triage' ? (
        <div className="space-y-4">
          {triageReports.length === 0 ? (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
              <History className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">No triage reports recorded yet</p>
              <p className="text-xs text-slate-500">Run the Fault Triage Wizard to create the first CBM record.</p>
            </div>
          ) : (
            triageReports.map((report) => {
              const isExpanded = expandedReportId === report.id;
              return (
                <div
                  key={report.id}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    report.severityBand === 'red'
                      ? 'bg-slate-900/90 border-rose-800/60 shadow-lg shadow-rose-950/20'
                      : report.severityBand === 'amber'
                      ? 'bg-slate-900/90 border-amber-800/60'
                      : 'bg-slate-900/90 border-slate-800'
                  }`}
                >
                  <div
                    onClick={() => toggleExpand(report.id)}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-850/50 transition"
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase border ${
                          report.priority === 'P1'
                            ? 'bg-rose-950 text-rose-300 border-rose-700'
                            : report.priority === 'P2'
                            ? 'bg-amber-950 text-amber-300 border-amber-700'
                            : 'bg-emerald-950 text-emerald-300 border-emerald-700'
                        }`}>
                          {report.priority} Action
                        </span>
                        <span className="font-mono text-xs text-slate-400">
                          Score: <strong className="text-white">{report.severityScore}/100</strong>
                        </span>
                        <span className="text-xs text-slate-500">•</span>
                        <span className="text-xs text-slate-400 font-mono">
                          {new Date(report.createdAt).toLocaleDateString()} at {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-100">
                        {report.recommendedAction}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-1">
                        {report.summary}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectReport(report);
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700"
                      >
                        View Full Sheet
                      </button>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="p-5 border-t border-slate-800 bg-slate-950/70 space-y-4 text-xs">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="font-bold text-slate-400 uppercase text-[10px]">Findings:</span>
                          <p className="text-slate-200 mt-1">{report.summary}</p>
                        </div>
                        <div>
                          <span className="font-bold text-slate-400 uppercase text-[10px]">Follow-up Tasks:</span>
                          <ul className="list-disc list-inside text-slate-300 mt-1 space-y-0.5">
                            {report.followUpTasks.slice(0, 3).map((t, idx) => (
                              <li key={idx}>{t}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {report.mediaRefs && report.mediaRefs.length > 0 && (
                        <div>
                          <span className="font-bold text-slate-400 uppercase text-[10px]">Attached Media:</span>
                          <div className="flex gap-3 mt-2 overflow-x-auto pb-1">
                            {report.mediaRefs.map((m, idx) => (
                              <div key={idx} className="w-32 shrink-0 rounded-lg overflow-hidden border border-slate-800 bg-slate-900 p-1">
                                {m.type === 'photo' ? (
                                  <img src={m.url} alt={m.caption} className="w-full h-18 object-cover rounded" />
                                ) : (
                                  <div className="h-18 flex items-center justify-center text-cyan-400">
                                    <Volume2 className="w-6 h-6" />
                                  </div>
                                )}
                                <div className="text-[10px] text-slate-300 truncate mt-1">{m.caption}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Checklist History */
        <div className="space-y-4">
          {inspections.length === 0 ? (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
              <FileText className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">No completed checklists found</p>
              <p className="text-xs text-slate-500">Run a Guided Inspection Checklist to save historical audit data.</p>
            </div>
          ) : (
            inspections.map((insp) => (
              <div key={insp.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-400">{insp.turbineCode}</span>
                    <span className="text-slate-400">Audited by {insp.technicianName}</span>
                  </div>
                  <span className="font-mono text-slate-500">{new Date(insp.completedAt).toLocaleString()}</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Key Findings:</h4>
                  <ul className="list-disc list-inside text-xs text-slate-200 mt-1 space-y-1">
                    {insp.keyFindings.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
