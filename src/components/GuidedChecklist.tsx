import React, { useState } from 'react';
import { 
  Turbine, 
  SensorAlert, 
  ChecklistItem, 
  ChecklistSection, 
  MediaFile, 
  InspectionRecord 
} from '../types';
import { CHECKLIST_SECTIONS } from '../data/mockData';
import { 
  ClipboardCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Camera, 
  Mic, 
  ArrowRight, 
  ArrowLeft, 
  ShieldAlert, 
  HelpCircle, 
  Sparkles,
  Info,
  Paperclip,
  Stethoscope
} from 'lucide-react';
import { MediaCaptureModal } from './MediaCaptureModal';

interface GuidedChecklistProps {
  turbine: Turbine;
  alerts: SensorAlert[];
  onCompleteChecklist: (data: {
    responses: Record<string, any>;
    media: MediaFile[];
    conditionScore: number;
    keyFindings: string[];
    proceedToTriage: boolean;
  }) => void;
  onCancel: () => void;
}

export const GuidedChecklist: React.FC<GuidedChecklistProps> = ({
  turbine,
  alerts,
  onCompleteChecklist,
  onCancel
}) => {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({
    'chk-01': true,
    'chk-02': true,
    'chk-03': true,
    'chk-04': turbine.vibrationRmsMmS > 5.0 ? 'Moderate Seep (50-200ml)' : 'None (Dry)',
    'chk-05': turbine.gearboxTempC,
    'chk-06': turbine.vibrationRmsMmS > 5.0 ? 'Metallic Grinding (Gear Pitting)' : 'Normal Smooth Operation',
    'chk-07': turbine.gearboxTempC < 80,
    'chk-08': true,
    'chk-09': turbine.generatorTempC,
    'chk-10': true,
    'chk-11': turbine.oilPressureBar,
    'chk-12': true,
    'chk-13': true,
    'chk-14': true,
    'chk-15': true
  });

  const [attachedMedia, setAttachedMedia] = useState<MediaFile[]>([]);
  const [activeMediaModalStep, setActiveMediaModalStep] = useState<{ id: string; title: string } | null>(null);

  const sections = CHECKLIST_SECTIONS;
  const currentSection = sections[currentSectionIndex];

  // Calculate live running Condition Risk Score (0-100)
  const calculateConditionRisk = () => {
    let risk = 10; // baseline healthy
    if (turbine.criticalAlertsCount > 0) risk += 30;
    if (turbine.status === 'tripped') risk += 25;

    // Check responses
    if (responses['chk-04'] && responses['chk-04'] !== 'None (Dry)') {
      risk += responses['chk-04'].includes('Moderate') ? 20 : 35;
    }
    if (responses['chk-05'] && Number(responses['chk-05']) > 80) {
      risk += 20;
    }
    if (responses['chk-06'] && responses['chk-06'] !== 'Normal Smooth Operation') {
      risk += 30;
    }
    if (responses['chk-07'] === false) {
      risk += 15;
    }
    if (responses['chk-10'] === false) {
      risk += 20;
    }
    if (responses['chk-14'] === false) {
      risk += 25;
    }

    return Math.min(100, Math.max(5, risk));
  };

  const currentRiskScore = calculateConditionRisk();

  const handleResponseChange = (itemId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [itemId]: value
    }));
  };

  const handleAddMedia = (media: MediaFile) => {
    setAttachedMedia(prev => [media, ...prev]);
  };

  const generateKeyFindings = (): string[] => {
    const findings: string[] = [];
    if (responses['chk-04'] && responses['chk-04'] !== 'None (Dry)') {
      findings.push(`Gearbox Oil State: ${responses['chk-04']}`);
    }
    if (responses['chk-05'] && Number(responses['chk-05']) > 80) {
      findings.push(`High HSS bearing temperature measured at ${responses['chk-05']}°C`);
    }
    if (responses['chk-06'] && responses['chk-06'] !== 'Normal Smooth Operation') {
      findings.push(`Abnormal acoustic signature: ${responses['chk-06']}`);
    }
    if (responses['chk-07'] === false) {
      findings.push('Inline oil filter differential pressure indicator in yellow/red zone');
    }
    if (responses['chk-10'] === false) {
      findings.push('Thermal discoloration noted on 690V flexible power cables');
    }
    if (responses['chk-14'] === false) {
      findings.push('Rotor blade leading-edge erosion detected');
    }
    if (findings.length === 0) {
      findings.push('All standard drivetrain, hydraulic, and structural checks verified within nominal limits.');
    }
    return findings;
  };

  const handleFinish = (proceedToTriage: boolean) => {
    const findings = generateKeyFindings();
    onCompleteChecklist({
      responses,
      media: attachedMedia,
      conditionScore: currentRiskScore,
      keyFindings: findings,
      proceedToTriage
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* 1. Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-xs">
              {turbine.code}
            </span>
            <span className="text-xs text-slate-400">Condition-Based Guided Inspection</span>
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">
            Field Inspection Checklist
          </h2>
          <p className="text-xs text-slate-400">
            Tailored to active SCADA profile: <strong className="text-slate-200">{alerts.length} sensor alerts flagged</strong>
          </p>
        </div>

        {/* Real-Time Condition Risk Meter */}
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-3">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Live Condition Risk</div>
            <div className="font-mono text-xl font-bold text-slate-100 flex items-baseline gap-1">
              <span className={currentRiskScore >= 70 ? 'text-rose-400' : currentRiskScore >= 35 ? 'text-amber-400' : 'text-emerald-400'}>
                {currentRiskScore}
              </span>
              <span className="text-xs text-slate-500">/ 100</span>
            </div>
          </div>
          <div className={`w-3 h-10 rounded-full ${
            currentRiskScore >= 70 ? 'bg-rose-500' : currentRiskScore >= 35 ? 'bg-amber-500' : 'bg-emerald-500'
          }`} />
        </div>
      </div>

      {/* 2. Section Navigation Steps */}
      <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2">
        {sections.map((sec, idx) => (
          <button
            key={sec.id}
            onClick={() => setCurrentSectionIndex(idx)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 border transition shrink-0 ${
              idx === currentSectionIndex
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/10 font-bold'
                : idx < currentSectionIndex
                ? 'bg-slate-900 text-emerald-400 border-emerald-900/60'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-black/20 flex items-center justify-center text-[10px] font-mono">
              {idx + 1}
            </span>
            <span>{sec.title.split('.')[1]?.trim() || sec.title}</span>
          </button>
        ))}
      </div>

      {/* 3. Active Section Question Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <div className="text-xs text-emerald-400 font-mono font-semibold uppercase">
            Section {currentSectionIndex + 1} of {sections.length}
          </div>
          <h3 className="text-lg font-bold text-white mt-0.5">{currentSection.title}</h3>
          <p className="text-xs text-slate-400">{currentSection.description}</p>
        </div>

        {/* Questions list */}
        <div className="space-y-6">
          {currentSection.items.map((item, qIdx) => {
            const currentVal = responses[item.id];
            const hasMediaAttached = attachedMedia.some(m => m.stepId === item.id);

            return (
              <div key={item.id} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                      Check #{qIdx + 1} • Risk Weight +{item.riskWeight}
                    </span>
                    <h4 className="text-sm font-semibold text-slate-100">{item.question}</h4>
                    {item.guidanceText && (
                      <p className="text-xs text-slate-400 flex items-start gap-1.5 pt-0.5">
                        <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{item.guidanceText}</span>
                      </p>
                    )}
                  </div>

                  {/* Media Capture Button per check */}
                  <button
                    onClick={() => setActiveMediaModalStep({ id: item.id, title: item.question })}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition border ${
                      hasMediaAttached
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                        : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{hasMediaAttached ? 'Evidence Added' : 'Capture Media'}</span>
                  </button>
                </div>

                {/* Input Controls based on type */}
                <div className="pt-2">
                  {item.type === 'boolean' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleResponseChange(item.id, true)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition border ${
                          currentVal === true
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/10'
                            : 'bg-slate-900 text-slate-300 border-slate-750 hover:bg-slate-800'
                        }`}
                      >
                        Yes / Normal (OK)
                      </button>
                      <button
                        onClick={() => handleResponseChange(item.id, false)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition border ${
                          currentVal === false
                            ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/10'
                            : 'bg-slate-900 text-slate-300 border-slate-750 hover:bg-slate-800'
                        }`}
                      >
                        No / Defect Detected
                      </button>
                    </div>
                  )}

                  {item.type === 'numeric' && (
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1 max-w-xs">
                        <input
                          type="number"
                          step="0.1"
                          value={currentVal || ''}
                          onChange={(e) => handleResponseChange(item.id, parseFloat(e.target.value))}
                          placeholder={`Enter ${item.unit}...`}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <span className="absolute right-3 top-2 text-xs font-mono text-slate-400">
                          {item.unit}
                        </span>
                      </div>
                      {item.threshold && (
                        <span className="text-xs text-slate-400">
                          Threshold: <strong className="text-amber-300 font-mono">{item.threshold} {item.unit}</strong>
                        </span>
                      )}
                    </div>
                  )}

                  {item.type === 'select' && item.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {item.options.map(opt => (
                        <button
                          key={opt}
                          onClick={() => handleResponseChange(item.id, opt)}
                          className={`p-2.5 rounded-xl text-xs text-left font-medium transition border ${
                            currentVal === opt
                              ? opt.includes('None') || opt.includes('Normal')
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-600 font-bold'
                                : 'bg-rose-950 text-rose-300 border-rose-600 font-bold'
                              : 'bg-slate-900 text-slate-300 border-slate-750 hover:bg-slate-800'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Navigation Buttons */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              if (currentSectionIndex > 0) {
                setCurrentSectionIndex(currentSectionIndex - 1);
              } else {
                onCancel();
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold flex items-center gap-2 border border-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{currentSectionIndex === 0 ? 'Cancel' : 'Previous Section'}</span>
          </button>

          {currentSectionIndex < sections.length - 1 ? (
            <button
              onClick={() => setCurrentSectionIndex(currentSectionIndex + 1)}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <span>Next Section</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => handleFinish(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-600"
              >
                Save Checklist Only
              </button>
              <button
                onClick={() => handleFinish(true)}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-600/20"
              >
                <Stethoscope className="w-4 h-4" />
                <span>Launch Fault Triage Wizard</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Media Capture Modal */}
      {activeMediaModalStep && (
        <MediaCaptureModal
          isOpen={true}
          onClose={() => setActiveMediaModalStep(null)}
          onSaveMedia={handleAddMedia}
          turbineCode={turbine.code}
          stepId={activeMediaModalStep.id}
          stepTitle={activeMediaModalStep.title}
        />
      )}
    </div>
  );
};
