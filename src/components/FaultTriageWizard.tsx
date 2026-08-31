import React, { useState } from 'react';
import { 
  Turbine, 
  SensorAlert, 
  TelemetryPoint, 
  MediaFile, 
  TriageInput, 
  TriageReport 
} from '../types';
import { 
  Stethoscope, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Camera, 
  Mic, 
  ShieldCheck, 
  Clock, 
  Flame, 
  Zap, 
  ArrowRight, 
  ArrowLeft, 
  Sliders, 
  Sparkles,
  Volume2,
  FileText,
  Radio,
  Paperclip
} from 'lucide-react';
import { MediaCaptureModal } from './MediaCaptureModal';

interface FaultTriageWizardProps {
  turbine: Turbine;
  alerts: SensorAlert[];
  telemetry: TelemetryPoint[];
  initialChecklistResponses?: Record<string, any>;
  initialMedia?: MediaFile[];
  onSubmitTriage: (input: TriageInput) => Promise<TriageReport>;
  onCancel: () => void;
}

export const FaultTriageWizard: React.FC<FaultTriageWizardProps> = ({
  turbine,
  alerts,
  telemetry,
  initialChecklistResponses = {},
  initialMedia = [],
  onSubmitTriage,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Wizard state inputs
  const [noiseType, setNoiseType] = useState<string>(
    initialChecklistResponses['chk-06']?.includes('Grinding')
      ? 'grinding'
      : initialChecklistResponses['chk-06']?.includes('Squeal')
      ? 'squealing'
      : 'none'
  );

  const [oilSeepage, setOilSeepage] = useState<string>(
    initialChecklistResponses['chk-04']?.includes('Moderate')
      ? 'moderate'
      : initialChecklistResponses['chk-04']?.includes('Active')
      ? 'heavy'
      : initialChecklistResponses['chk-04']?.includes('Minor')
      ? 'minor'
      : 'none'
  );

  const [tactileVibration, setTactileVibration] = useState<string>(
    turbine.vibrationRmsMmS >= 7.0 ? 'severe_shudder' : turbine.vibrationRmsMmS >= 4.5 ? 'moderate_hum' : 'smooth'
  );

  const [manualTempC, setManualTempC] = useState<number>(
    initialChecklistResponses['chk-05'] || turbine.gearboxTempC
  );

  const [isSafeToAccess, setIsSafeToAccess] = useState<boolean>(true);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([
    ...(turbine.vibrationRmsMmS >= 5.5 ? ['CMS Channel 3 Vibration Threshold Exceeded'] : []),
    ...(turbine.gearboxTempC >= 80 ? ['Gearbox Sump High Thermal Elevation'] : []),
    ...(turbine.status === 'derated' ? ['Automatic SCADA Power Derating Active'] : [])
  ]);

  const [mediaList, setMediaList] = useState<MediaFile[]>(initialMedia);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  const [perceivedSeverity, setPerceivedSeverity] = useState<'low' | 'medium' | 'high'>(
    turbine.criticalAlertsCount > 0 ? 'high' : turbine.activeAlertsCount > 0 ? 'medium' : 'low'
  );
  const [confidence, setConfidence] = useState<'low' | 'medium' | 'high'>('high');
  const [fieldNotes, setFieldNotes] = useState<string>('');

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom]
    );
  };

  const handleAddMedia = (media: MediaFile) => {
    setMediaList(prev => [media, ...prev]);
  };

  // Preview Score Calculation
  const calculatePreviewScore = () => {
    let score = 10;
    if (alerts.some(a => a.severity === 'critical')) score += 35;
    if (alerts.some(a => a.severity === 'major')) score += 20;
    if (turbine.status === 'tripped') score += 25;
    if (noiseType === 'grinding' || noiseType === 'knocking') score += 25;
    else if (noiseType === 'squealing') score += 15;
    if (oilSeepage === 'heavy' || oilSeepage === 'moderate') score += 20;
    if (manualTempC > 80) score += 15;
    if (perceivedSeverity === 'high') score += 15;
    return Math.min(100, Math.max(10, score));
  };

  const previewScore = calculatePreviewScore();
  const previewBand = previewScore >= 71 ? 'red' : previewScore >= 31 ? 'amber' : 'green';

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload: TriageInput = {
        turbineId: turbine.id,
        turbineCode: turbine.code,
        technicianId: 'tech-01',
        technicianName: 'R. Senthil Kumar',
        checklistResponses: initialChecklistResponses,
        noiseType,
        oilSeepage,
        manualTempC,
        manualVibrationMmS: turbine.vibrationRmsMmS,
        technicianPerceivedSeverity: perceivedSeverity,
        technicianConfidence: confidence,
        symptoms: selectedSymptoms,
        mediaRefs: mediaList,
        notes: fieldNotes
      };
      await onSubmitTriage(payload);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Wizard Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono font-bold text-xs">
              {turbine.code}
            </span>
            <span className="text-xs text-slate-400">Standardized CBM Fault Triage Wizard</span>
          </div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2 mt-0.5">
            <Stethoscope className="w-5 h-5 text-cyan-400" />
            Field Fault Triage & Diagnostic Scoring
          </h2>
        </div>

        {/* Live Severity Gauge Meter */}
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-3">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Projected Severity</div>
            <div className="font-mono text-lg font-bold flex items-baseline gap-1">
              <span className={previewBand === 'red' ? 'text-rose-400' : previewBand === 'amber' ? 'text-amber-400' : 'text-emerald-400'}>
                {previewScore}
              </span>
              <span className="text-xs text-slate-500">/ 100</span>
              <span className={`text-[10px] uppercase font-bold ml-1 px-1.5 py-0.5 rounded ${
                previewBand === 'red' ? 'bg-rose-950 text-rose-300' : previewBand === 'amber' ? 'bg-amber-950 text-amber-300' : 'bg-emerald-950 text-emerald-300'
              }`}>
                {previewBand}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-4 gap-2 text-xs font-semibold">
        {[
          { num: 1, title: '1. Auto Ingest' },
          { num: 2, title: '2. Field Symptoms' },
          { num: 3, title: '3. Media Evidence' },
          { num: 4, title: '4. Severity & Confidence' }
        ].map(step => (
          <button
            key={step.num}
            onClick={() => setCurrentStep(step.num)}
            className={`py-2.5 px-3 rounded-xl border text-left transition flex items-center gap-2 ${
              currentStep === step.num
                ? 'bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-600/20 font-bold'
                : currentStep > step.num
                ? 'bg-slate-900 text-emerald-400 border-emerald-900/60'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-black/20 flex items-center justify-center text-[10px] font-mono shrink-0">
              {step.num}
            </span>
            <span className="truncate">{step.title.split('.')[1]}</span>
          </button>
        ))}
      </div>

      {/* Step 1: Auto SCADA Data Ingest */}
      {currentStep === 1 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5 animate-in fade-in duration-200">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              Step 1: Automatic SCADA & CMS Telemetry Ingest
            </h3>
            <p className="text-xs text-slate-400">
              The triage engine has ingested live drivetrain data for {turbine.code} from the Muppandal CMS network.
            </p>
          </div>

          {/* Telemetry Snapshot Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Vibration (RMS)</span>
                <Activity className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <div className="font-mono text-xl font-bold text-white">
                {turbine.vibrationRmsMmS} <span className="text-xs text-slate-400">mm/s</span>
              </div>
              <p className="text-[11px] text-rose-400">
                {turbine.vibrationRmsMmS >= 5.5 ? 'Exceeds ISO 10816-21 limit (5.5 mm/s)' : 'Within normal limits'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Gearbox Sump Temp</span>
                <Flame className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="font-mono text-xl font-bold text-white">
                {turbine.gearboxTempC}° <span className="text-xs text-slate-400">C</span>
              </div>
              <p className="text-[11px] text-amber-400">
                {turbine.gearboxTempC >= 80 ? 'Elevated thermal gradient (+18°C)' : 'Normal operating temperature'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Active Power & Derate</span>
                <Zap className="w-3.5 h-3.5 text-yellow-400" />
              </div>
              <div className="font-mono text-xl font-bold text-white">
                {turbine.currentPowerKw} <span className="text-xs text-slate-400">kW</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Status: <strong className="text-slate-200 uppercase font-mono">{turbine.status}</strong>
              </p>
            </div>
          </div>

          {/* Active Sensor Alerts list */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Correlated Active Alerts ({alerts.length}):
            </h4>
            {alerts.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-950 text-xs text-slate-400 text-center">
                No active critical alerts. Routine baseline triage mode.
              </div>
            ) : (
              <div className="space-y-2">
                {alerts.map(a => (
                  <div key={a.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        a.severity === 'critical' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}>
                        {a.severity}
                      </span>
                      <div>
                        <div className="font-bold text-slate-200">{a.title}</div>
                        <div className="text-[11px] text-slate-400">{a.component} • Reading: {a.value} {a.unit}</div>
                      </div>
                    </div>
                    <span className="text-xs text-slate-500 font-mono shrink-0">{a.timestamp}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Field Symptoms Input */}
      {currentStep === 2 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Step 2: Field Observations & Mechanical Symptoms
            </h3>
            <p className="text-xs text-slate-400">
              Record physical symptoms verified at the nacelle / tower base.
            </p>
          </div>

          <div className="space-y-5">
            {/* Acoustic Signature */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-200">
                1. Acoustic Noise Profile (Drivetrain / Bearings):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'none', label: 'None / Normal Smooth Operation', risk: 'Low Risk' },
                  { id: 'hum', label: 'Mild Cyclical Hum (Yaw / Pitch)', risk: 'Moderate' },
                  { id: 'squealing', label: 'High-Pitch Squeal (Bearing Slip)', risk: 'Elevated (+15)' },
                  { id: 'grinding', label: 'Metallic Grinding (Gear / Roller Pitting)', risk: 'Critical (+25)' },
                  { id: 'knocking', label: 'Cyclical Knocking (Broken Tooth / Cage)', risk: 'Critical (+25)' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setNoiseType(opt.id)}
                    className={`p-3 rounded-xl text-left border transition ${
                      noiseType === opt.id
                        ? opt.id === 'none'
                          ? 'bg-emerald-950 border-emerald-600 text-emerald-200 font-bold'
                          : 'bg-rose-950 border-rose-600 text-rose-200 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{opt.label}</span>
                      <span className="text-[10px] opacity-75">{opt.risk}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Oil Seepage Severity */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-200">
                2. Drivetrain Lubrication & Oil Leak State:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {[
                  { id: 'none', label: 'None (Dry)' },
                  { id: 'minor', label: 'Minor Weep (<20ml)' },
                  { id: 'moderate', label: 'Moderate (50-200ml)' },
                  { id: 'heavy', label: 'Heavy Pooling (>200ml)' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setOilSeepage(opt.id)}
                    className={`p-3 rounded-xl text-center border transition ${
                      oilSeepage === opt.id
                        ? opt.id === 'none'
                          ? 'bg-emerald-950 border-emerald-600 text-emerald-200 font-bold'
                          : 'bg-rose-950 border-rose-600 text-rose-200 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-850'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Laser IR Temp */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-200">
                3. Physical Spot Readings:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                  <span className="text-xs text-slate-400">Manual IR Gun Temp on Bearing Housing (°C):</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={manualTempC}
                      onChange={(e) => setManualTempC(parseFloat(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-white"
                    />
                    <span className="text-xs font-mono text-slate-400">°C</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                  <span className="text-xs text-slate-400">Tactile Nacelle Bedplate Vibration:</span>
                  <select
                    value={tactileVibration}
                    onChange={(e) => setTactileVibration(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  >
                    <option value="smooth">Smooth (Normal)</option>
                    <option value="moderate_hum">Noticeable High Frequency Hum</option>
                    <option value="severe_shudder">Severe Drivetrain Pulsing Shudder</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Quick Multi-Symptom Chips */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-200">
                4. Select additional corroborated fault indicators:
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  'Burning lubrication smell in nacelle',
                  'Metal flake glitter visible on oil dipstick',
                  'Thermal heat discoloration on HSS coupling',
                  'High yaw brake caliper wear (>70%)',
                  'Rotor blade tip aerodynamic whistle',
                  'Emergency brake disc surface scoring'
                ].map(sym => {
                  const active = selectedSymptoms.includes(sym);
                  return (
                    <button
                      key={sym}
                      onClick={() => toggleSymptom(sym)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                        active
                          ? 'bg-rose-950 text-rose-300 border-rose-600 font-semibold'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {active ? '✓ ' : '+ '} {sym}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Media Evidence Confirmation */}
      {currentStep === 3 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5 animate-in fade-in duration-200">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-400" />
                Step 3: Media Capture & Annotated Evidence
              </h3>
              <p className="text-xs text-slate-400">
                Attach photos with arrows/annotations and acoustic audio snippets for supervisor sign-off.
              </p>
            </div>
            <button
              onClick={() => setIsMediaModalOpen(true)}
              className="px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
            >
              <Camera className="w-4 h-4" />
              <span>Capture New Evidence</span>
            </button>
          </div>

          {/* Media list grid */}
          {mediaList.length === 0 ? (
            <div className="py-12 text-center bg-slate-950 rounded-xl border border-dashed border-slate-800 space-y-3">
              <Camera className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-xs text-slate-400">No media attached to this triage session yet.</p>
              <button
                onClick={() => setIsMediaModalOpen(true)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700"
              >
                Snap Photo or Record Audio
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mediaList.map((m, idx) => (
                <div key={m.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2 overflow-hidden">
                  {m.type === 'photo' ? (
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-750">
                      <img src={m.url} alt={m.caption} className="w-full h-full object-cover" />
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-slate-950/80 rounded text-[10px] font-mono text-emerald-400">
                        PHOTO #{idx + 1}
                      </span>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-900 rounded-lg flex items-center justify-between border border-slate-750">
                      <div className="flex items-center gap-2 text-cyan-400">
                        <Volume2 className="w-6 h-6" />
                        <div>
                          <div className="text-xs font-bold text-white">Audio Recording</div>
                          <div className="text-[10px] text-slate-400">{m.caption}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const a = new Audio(m.url);
                          a.play();
                        }}
                        className="px-3 py-1 bg-cyan-600 text-white rounded text-xs font-bold"
                      >
                        Play
                      </button>
                    </div>
                  )}
                  <div>
                    <h5 className="text-xs font-bold text-white truncate">{m.caption}</h5>
                    {m.annotation && <p className="text-[11px] text-emerald-300 font-mono">{m.annotation}</p>}
                    <span className="text-[10px] text-slate-500 font-mono">Captured: {m.timestamp || 'Just now'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 4: Engineer Severity & Confidence */}
      {currentStep === 4 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Step 4: Engineer Judgment & Confidence Rating
            </h3>
            <p className="text-xs text-slate-400">
              Provide your professional engineering assessment before generating official CBM recommendations.
            </p>
          </div>

          <div className="space-y-5">
            {/* Perceived Severity */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-200">
                1. How serious do you believe this issue is based on physical nacelle inspection?
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'low', label: 'Low', desc: 'Routine wear, can run safely', color: 'emerald' },
                  { id: 'medium', label: 'Medium', desc: 'Degradation underway, plan repair', color: 'amber' },
                  { id: 'high', label: 'High', desc: 'Imminent catastrophic failure danger', color: 'rose' }
                ].map(sev => (
                  <button
                    key={sev.id}
                    onClick={() => setPerceivedSeverity(sev.id as any)}
                    className={`p-3.5 rounded-xl border text-left transition ${
                      perceivedSeverity === sev.id
                        ? sev.id === 'high'
                          ? 'bg-rose-950 border-rose-500 text-white font-bold'
                          : sev.id === 'medium'
                          ? 'bg-amber-950 border-amber-500 text-white font-bold'
                          : 'bg-emerald-950 border-emerald-500 text-white font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-850'
                    }`}
                  >
                    <div className="text-sm font-bold">{sev.label} Severity</div>
                    <div className="text-[11px] opacity-75 mt-0.5">{sev.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Confidence Level */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-200">
                2. Your confidence level in this diagnostic finding:
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['low', 'medium', 'high'].map(conf => (
                  <button
                    key={conf}
                    onClick={() => setConfidence(conf as any)}
                    className={`py-2.5 rounded-xl border text-xs capitalize font-bold transition ${
                      confidence === conf
                        ? 'bg-slate-800 text-cyan-400 border-cyan-500 shadow-sm'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {conf} Confidence
                  </button>
                ))}
              </div>
            </div>

            {/* Freeform Engineer Notes */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-200">
                3. Additional Field Notes for Muppandal Site Supervisor:
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Recommend SKF high-speed shaft bearing swap during Wednesday low-wind window (<5 m/s). 50T crane required."
                value={fieldNotes}
                onChange={(e) => setFieldNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Bottom Step Control Buttons */}
      <div className="pt-2 flex items-center justify-between gap-3">
        <button
          onClick={() => {
            if (currentStep > 1) {
              setCurrentStep(currentStep - 1);
            } else {
              onCancel();
            }
          }}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold flex items-center gap-2 border border-slate-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{currentStep === 1 ? 'Exit Triage' : 'Previous Step'}</span>
        </button>

        {currentStep < 4 ? (
          <button
            onClick={() => setCurrentStep(currentStep + 1)}
            className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-600/20"
          >
            <span>Proceed to Step {currentStep + 1}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition transform active:scale-95 disabled:opacity-50"
            id="btn-compute-cbm-action"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isSubmitting ? 'Computing Triage...' : 'Generate Action Recommendation'}</span>
          </button>
        )}
      </div>

      {/* Media Capture Modal */}
      <MediaCaptureModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSaveMedia={handleAddMedia}
        turbineCode={turbine.code}
      />
    </div>
  );
};
