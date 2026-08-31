import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import { 
  Turbine, 
  SensorAlert, 
  TelemetryPoint, 
  TriageReport, 
  InspectionRecord, 
  TechnicianProfile,
  TriageInput,
  MediaFile
} from './types';
import { Header } from './components/Header';
import { QRScannerModal } from './components/QRScannerModal';
import { TurbineOverview } from './components/TurbineOverview';
import { GuidedChecklist } from './components/GuidedChecklist';
import { FaultTriageWizard } from './components/FaultTriageWizard';
import { ActionRecommendationView } from './components/ActionRecommendationView';
import { TurbineHistory } from './components/TurbineHistory';
import { FleetDashboard } from './components/FleetDashboard';
import { SupervisorReviewModal } from './components/SupervisorReviewModal';
import { AlertCircle, CheckCircle2, Wind } from 'lucide-react';

export default function App() {
  // Navigation & View State
  const [activeView, setActiveView] = useState<'fleet' | 'overview' | 'checklist' | 'triage' | 'recommendation' | 'history'>('overview');
  
  // Data States
  const [turbines, setTurbines] = useState<Turbine[]>([]);
  const [currentTurbine, setCurrentTurbine] = useState<Turbine | null>(null);
  const [currentAlerts, setCurrentAlerts] = useState<SensorAlert[]>([]);
  const [currentTelemetry, setCurrentTelemetry] = useState<TelemetryPoint[]>([]);
  const [triageHistory, setTriageHistory] = useState<TriageReport[]>([]);
  const [inspectionsHistory, setInspectionsHistory] = useState<InspectionRecord[]>([]);
  const [latestReport, setLatestReport] = useState<TriageReport | null>(null);
  const [technician, setTechnician] = useState<TechnicianProfile | null>(null);
  
  // Intermediary Checklist to Triage passing state
  const [lastChecklistResponses, setLastChecklistResponses] = useState<Record<string, any>>({});
  const [lastChecklistMedia, setLastChecklistMedia] = useState<MediaFile[]>([]);

  // Modals & UI states
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isSupervisorModalOpen, setIsSupervisorModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'alert' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'alert' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Initial Load
  useEffect(() => {
    async function initData() {
      setIsLoading(true);
      try {
        const [turbList, tech] = await Promise.all([
          api.getTurbines(),
          api.getTechnicianProfile()
        ]);
        setTurbines(turbList);
        setTechnician(tech);

        // Default to MP-T04 (Sector A turbine with active alert)
        const initialTurbine = turbList.find(t => t.code === 'MP-T04') || turbList[0];
        if (initialTurbine) {
          await loadTurbineDetails(initialTurbine.code);
        }
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    initData();
  }, []);

  // Load specific turbine data by Code
  const loadTurbineDetails = async (turbineCode: string) => {
    setIsLoading(true);
    try {
      const turbine = await api.getTurbineByCode(turbineCode);
      setCurrentTurbine(turbine);

      const [alerts, telemetry, history] = await Promise.all([
        api.getTurbineAlerts(turbine.id),
        api.getTurbineTelemetry(turbine.id),
        api.getTurbineHistory(turbine.id)
      ]);

      setCurrentAlerts(alerts);
      setCurrentTelemetry(telemetry);
      setTriageHistory(history.triageReports || []);
      setInspectionsHistory(history.inspections || []);

      setActiveView('overview');
      showToast(`Loaded ${turbine.code} (${turbine.model})`, 'info');
    } catch (err: any) {
      console.error('Turbine load error:', err);
      showToast(err.message || `Turbine ${turbineCode} not found`, 'alert');
    } finally {
      setIsLoading(false);
    }
  };

  // QR Scan Success Handler
  const handleQRScanSuccess = (turbineCode: string) => {
    loadTurbineDetails(turbineCode);
  };

  // SCADA Fault Injection Simulation
  const handleInjectFault = async (faultType: 'vibration_spike' | 'temperature_overheat' | 'reset_healthy') => {
    if (!currentTurbine) return;
    try {
      const res = await api.injectScadaFault(currentTurbine.id, faultType);
      setCurrentTurbine(res.turbine);
      setCurrentAlerts(res.activeAlerts || []);
      // refresh telemetry
      const points = await api.getTurbineTelemetry(currentTurbine.id);
      setCurrentTelemetry(points);
      
      if (faultType === 'vibration_spike') {
        showToast(`CMS Alert: Vibration surged to 8.6 mm/s on ${currentTurbine.code}!`, 'alert');
      } else if (faultType === 'temperature_overheat') {
        showToast(`CMS Alert: Bearing temperature spiked to 89.2°C on ${currentTurbine.code}!`, 'alert');
      } else {
        showToast(`${currentTurbine.code} reset to nominal healthy baseline.`, 'success');
      }
    } catch (err) {
      console.error('Inject error:', err);
    }
  };

  // Checklist Completion
  const handleCompleteChecklist = async (data: {
    responses: Record<string, any>;
    media: MediaFile[];
    conditionScore: number;
    keyFindings: string[];
    proceedToTriage: boolean;
  }) => {
    if (!currentTurbine) return;
    try {
      const savedInsp = await api.submitInspection({
        turbineId: currentTurbine.id,
        turbineCode: currentTurbine.code,
        technicianId: technician?.id || 'tech-01',
        technicianName: technician?.name || 'R. Senthil Kumar',
        calculatedConditionScore: data.conditionScore,
        checklistData: data.responses,
        mediaRefs: data.media,
        keyFindings: data.keyFindings
      });

      setInspectionsHistory(prev => [savedInsp, ...prev]);
      setLastChecklistResponses(data.responses);
      setLastChecklistMedia(data.media);

      if (data.proceedToTriage) {
        setActiveView('triage');
        showToast('Checklist saved. Launching Fault Triage Wizard...', 'info');
      } else {
        setActiveView('overview');
        showToast('Inspection checklist submitted and saved to history.', 'success');
      }
    } catch (err) {
      console.error('Checklist submit error:', err);
    }
  };

  // Triage Wizard Submit
  const handleSubmitTriage = async (input: TriageInput): Promise<TriageReport> => {
    const report = await api.submitTriage(input);
    setLatestReport(report);
    setTriageHistory(prev => [report, ...prev]);
    setActiveView('recommendation');
    showToast(`Generated ${report.priority} Action Recommendation (Score: ${report.severityScore}/100)`, 'success');
    return report;
  };

  // Supervisor Approval
  const handleSupervisorApprove = async (notes: string, supervisorName: string) => {
    if (!latestReport) return;
    try {
      const updated = await api.approveTriage(latestReport.id, notes, supervisorName);
      setLatestReport(updated);
      setTriageHistory(prev => prev.map(r => r.id === updated.id ? updated : r));
      showToast('Work order approved and dispatched successfully.', 'success');
    } catch (err) {
      console.error('Approve error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div className={`px-4 py-3 rounded-xl shadow-2xl border flex items-center gap-2.5 text-xs font-semibold backdrop-blur-md ${
            toastMessage.type === 'alert'
              ? 'bg-rose-950/90 border-rose-700 text-rose-200 shadow-rose-950/50'
              : toastMessage.type === 'info'
              ? 'bg-cyan-950/90 border-cyan-700 text-cyan-200 shadow-cyan-950/50'
              : 'bg-emerald-950/90 border-emerald-700 text-emerald-200 shadow-emerald-950/50'
          }`}>
            {toastMessage.type === 'alert' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Global Navigation Header */}
      <Header
        currentTurbine={currentTurbine}
        technician={technician}
        onScanQRClick={() => setIsQRScannerOpen(true)}
        onSelectTurbine={loadTurbineDetails}
        onOpenFleet={() => setActiveView('fleet')}
        activeView={activeView}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {/* Loading Spinner */}
        {isLoading && !currentTurbine ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-400 font-mono">Syncing with Muppandal CMS SCADA Stream...</p>
          </div>
        ) : (
          <>
            {/* View 1: Fleet Dashboard */}
            {activeView === 'fleet' && (
              <FleetDashboard
                turbines={turbines}
                onSelectTurbine={(code) => loadTurbineDetails(code)}
                onScanQRClick={() => setIsQRScannerOpen(true)}
              />
            )}

            {/* View 2: Turbine Overview & Live Telemetry */}
            {activeView === 'overview' && currentTurbine && (
              <TurbineOverview
                turbine={currentTurbine}
                alerts={currentAlerts}
                telemetry={currentTelemetry}
                onStartChecklist={() => setActiveView('checklist')}
                onStartTriage={() => setActiveView('triage')}
                onViewHistory={() => setActiveView('history')}
                onInjectFault={handleInjectFault}
                isLoading={isLoading}
              />
            )}

            {/* View 3: Dynamic Condition-Based Guided Checklist */}
            {activeView === 'checklist' && currentTurbine && (
              <GuidedChecklist
                turbine={currentTurbine}
                alerts={currentAlerts}
                onCompleteChecklist={handleCompleteChecklist}
                onCancel={() => setActiveView('overview')}
              />
            )}

            {/* View 4: 4-Step Fault Triage Wizard */}
            {activeView === 'triage' && currentTurbine && (
              <FaultTriageWizard
                turbine={currentTurbine}
                alerts={currentAlerts}
                telemetry={currentTelemetry}
                initialChecklistResponses={lastChecklistResponses}
                initialMedia={lastChecklistMedia}
                onSubmitTriage={handleSubmitTriage}
                onCancel={() => setActiveView('overview')}
              />
            )}

            {/* View 5: Standardized Action Recommendation Output */}
            {activeView === 'recommendation' && latestReport && currentTurbine && (
              <ActionRecommendationView
                report={latestReport}
                turbine={currentTurbine}
                technician={technician}
                onBackToOverview={() => setActiveView('overview')}
                onOpenSupervisorReview={() => setIsSupervisorModalOpen(true)}
              />
            )}

            {/* View 6: Turbine CBM History Archive */}
            {activeView === 'history' && currentTurbine && (
              <TurbineHistory
                turbine={currentTurbine}
                triageReports={triageHistory}
                inspections={inspectionsHistory}
                onBack={() => setActiveView('overview')}
                onSelectReport={(report) => {
                  setLatestReport(report);
                  setActiveView('recommendation');
                }}
              />
            )}
          </>
        )}
      </main>

      {/* QR Code Camera / Preset Scanner Modal */}
      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onScanSuccess={handleQRScanSuccess}
      />

      {/* Supervisor Approval Sign-Off Modal */}
      {latestReport && (
        <SupervisorReviewModal
          isOpen={isSupervisorModalOpen}
          onClose={() => setIsSupervisorModalOpen(false)}
          report={latestReport}
          onApprove={handleSupervisorApprove}
        />
      )}
    </div>
  );
}
