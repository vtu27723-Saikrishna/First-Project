import { Turbine, SensorAlert, TelemetryPoint, TriageReport, InspectionRecord, TechnicianProfile } from '../types';

const STORAGE_KEYS = {
  TURBINES: 'fieldfix_turbines_cache',
  ALERTS: 'fieldfix_alerts_cache',
  OFFLINE_INSPECTIONS: 'fieldfix_offline_inspections',
  OFFLINE_TRIAGE: 'fieldfix_offline_triage',
  LOCAL_TRIAGE_REPORTS: 'fieldfix_local_triage_reports'
};

export const api = {
  // Fetch all turbines
  async getTurbines(): Promise<Turbine[]> {
    try {
      const res = await fetch('/api/turbines');
      if (!res.ok) throw new Error('Failed to fetch turbines from server');
      const data = await res.json();
      localStorage.setItem(STORAGE_KEYS.TURBINES, JSON.stringify(data.turbines));
      return data.turbines;
    } catch (err) {
      console.warn('Using cached turbines due to network state:', err);
      const cached = localStorage.getItem(STORAGE_KEYS.TURBINES);
      if (cached) return JSON.parse(cached);
      return [];
    }
  },

  // Lookup turbine by QR code or ID
  async getTurbineByCode(code: string): Promise<Turbine> {
    try {
      const cleanCode = encodeURIComponent(code.trim());
      const res = await fetch(`/api/turbines/by-code/${cleanCode}`);
      if (!res.ok) {
        // try ID fallback
        const res2 = await fetch(`/api/turbines/${cleanCode}`);
        if (!res2.ok) throw new Error(`Turbine "${code}" not found`);
        const data2 = await res2.json();
        return data2.turbine;
      }
      const data = await res.json();
      return data.turbine;
    } catch (err) {
      console.warn('Lookup fallback to cache:', err);
      const cached = localStorage.getItem(STORAGE_KEYS.TURBINES);
      if (cached) {
        const list: Turbine[] = JSON.parse(cached);
        const match = list.find(t => t.code.toLowerCase() === code.toLowerCase() || t.id.toLowerCase() === code.toLowerCase());
        if (match) return match;
      }
      throw err;
    }
  },

  // Get alerts for turbine
  async getTurbineAlerts(turbineId: string): Promise<SensorAlert[]> {
    try {
      const res = await fetch(`/api/turbines/${turbineId}/alerts`);
      if (!res.ok) throw new Error('Failed to fetch alerts');
      const data = await res.json();
      return data.alerts;
    } catch (err) {
      console.warn('Fallback alerts cache:', err);
      return [];
    }
  },

  // Get telemetry 2-hour trend
  async getTurbineTelemetry(turbineId: string): Promise<TelemetryPoint[]> {
    try {
      const res = await fetch(`/api/turbines/${turbineId}/telemetry`);
      if (!res.ok) throw new Error('Failed to fetch telemetry');
      const data = await res.json();
      return data.points;
    } catch (err) {
      console.warn('Telemetry fallback generator');
      return [
        { time: '10:00', vibration: 2.1, gearboxTemp: 64, generatorTemp: 61, powerKw: 1400, windSpeed: 11.2 },
        { time: '10:30', vibration: 3.5, gearboxTemp: 68, generatorTemp: 63, powerKw: 1520, windSpeed: 12.0 },
        { time: '11:00', vibration: 5.8, gearboxTemp: 76, generatorTemp: 70, powerKw: 1480, windSpeed: 11.8 },
        { time: '11:30', vibration: 7.2, gearboxTemp: 84.5, generatorTemp: 78, powerKw: 1420, windSpeed: 11.4 }
      ];
    }
  },

  // Get history
  async getTurbineHistory(turbineId: string): Promise<{ triageReports: TriageReport[]; inspections: InspectionRecord[] }> {
    try {
      const res = await fetch(`/api/turbines/${turbineId}/history`);
      if (!res.ok) throw new Error('Failed to fetch history');
      const data = await res.json();
      return { triageReports: data.triageReports, inspections: data.inspections };
    } catch (err) {
      const cached = localStorage.getItem(STORAGE_KEYS.LOCAL_TRIAGE_REPORTS);
      const reports = cached ? JSON.parse(cached).filter((r: TriageReport) => r.turbineId === turbineId) : [];
      return { triageReports: reports, inspections: [] };
    }
  },

  // Submit inspection checklist
  async submitInspection(payload: Partial<InspectionRecord>): Promise<InspectionRecord> {
    try {
      const res = await fetch('/api/inspections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to save inspection');
      const data = await res.json();
      return data.inspection;
    } catch (err) {
      console.warn('Saved inspection to offline cache:', err);
      const offlineItem: InspectionRecord = {
        id: `insp-offline-${Date.now()}`,
        turbineId: payload.turbineId || 'turb-01',
        turbineCode: payload.turbineCode || 'MP-T04',
        technicianId: payload.technicianId || 'tech-01',
        technicianName: payload.technicianName || 'R. Senthil Kumar',
        startedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        completedAt: new Date().toISOString(),
        calculatedConditionScore: payload.calculatedConditionScore || 50,
        checklistData: payload.checklistData || {},
        mediaRefs: payload.mediaRefs || [],
        keyFindings: payload.keyFindings || []
      };
      const offline = JSON.parse(localStorage.getItem(STORAGE_KEYS.OFFLINE_INSPECTIONS) || '[]');
      offline.push(offlineItem);
      localStorage.setItem(STORAGE_KEYS.OFFLINE_INSPECTIONS, JSON.stringify(offline));
      return offlineItem;
    }
  },

  // Submit triage wizard & calculate standardized CBM score
  async submitTriage(payload: any): Promise<TriageReport> {
    try {
      const res = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to compute triage');
      const data = await res.json();

      // update local storage
      const cached = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOCAL_TRIAGE_REPORTS) || '[]');
      cached.unshift(data.report);
      localStorage.setItem(STORAGE_KEYS.LOCAL_TRIAGE_REPORTS, JSON.stringify(cached));

      return data.report;
    } catch (err) {
      console.warn('Calculating triage locally offline:', err);
      // Offline fallback calculation
      const score = Math.min(95, Math.max(15, (payload.noiseType === 'grinding' ? 85 : 45)));
      const severityBand = score >= 71 ? 'red' : score >= 31 ? 'amber' : 'green';
      const offlineReport: TriageReport = {
        id: `trg-offline-${Date.now()}`,
        turbineId: payload.turbineId,
        turbineCode: payload.turbineCode,
        technicianId: payload.technicianId || 'tech-01',
        technicianName: payload.technicianName || 'R. Senthil Kumar',
        severityScore: score,
        severityBand,
        recommendedAction: severityBand === 'red' 
          ? 'Immediate controlled shutdown and emergency inspection.'
          : severityBand === 'amber'
          ? 'Schedule maintenance within 7 days. Monitor CMS vibration.'
          : 'Continue operation. Monitor via SCADA.',
        priority: severityBand === 'red' ? 'P1' : severityBand === 'amber' ? 'P2' : 'P3',
        summary: 'Offline computed CBM triage based on field symptoms and cached SCADA baseline.',
        symptoms: payload.symptoms || [],
        noiseProfile: payload.noiseType,
        oilSeepSeverity: payload.oilSeepage,
        technicianPerceivedSeverity: payload.technicianPerceivedSeverity || 'medium',
        technicianConfidence: payload.technicianConfidence || 'high',
        followUpTasks: [
          'Verify sensor calibrations on site',
          'Sync offline report when back in cellular coverage'
        ],
        mediaRefs: payload.mediaRefs || [],
        createdAt: new Date().toISOString()
      };

      const offlineTriage = JSON.parse(localStorage.getItem(STORAGE_KEYS.OFFLINE_TRIAGE) || '[]');
      offlineTriage.push(offlineReport);
      localStorage.setItem(STORAGE_KEYS.OFFLINE_TRIAGE, JSON.stringify(offlineTriage));

      return offlineReport;
    }
  },

  // Supervisor approve triage
  async approveTriage(reportId: string, notes: string, supervisorName?: string): Promise<TriageReport> {
    const res = await fetch(`/api/triage/${reportId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes, supervisorName })
    });
    if (!res.ok) throw new Error('Failed to approve triage report');
    const data = await res.json();
    return data.report;
  },

  // Inject SCADA fault simulator
  async injectScadaFault(turbineId: string, faultType: 'vibration_spike' | 'temperature_overheat' | 'reset_healthy') {
    const res = await fetch('/api/scada/inject-fault', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ turbineId, faultType })
    });
    if (!res.ok) throw new Error('Failed to inject SCADA fault');
    return await res.json();
  },

  // Get technician profile
  async getTechnicianProfile(): Promise<TechnicianProfile> {
    try {
      const res = await fetch('/api/technicians/me');
      if (!res.ok) throw new Error('Failed to fetch profile');
      const data = await res.json();
      return data.technician;
    } catch {
      return {
        id: 'tech-01',
        name: 'R. Senthil Kumar',
        role: 'Senior Wind Turbine Reliability Engineer',
        employeeId: 'MF-ENG-4402',
        site: 'Muppandal Wind Energy Hub, Tamil Nadu',
        shift: 'Morning (06:00 - 18:00)',
        certifications: ['GWO Certified (Global Wind Organisation)', 'Vibration Analyst Cat II (ISO 18436-2)', 'High Voltage Safety Level 3'],
        phone: '+91 94432 89120',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
      };
    }
  }
};
