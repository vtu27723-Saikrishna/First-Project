export interface SensorAlert {
  id: string;
  turbineId: string;
  alertType: 'vibration' | 'temperature' | 'power' | 'hydraulic' | 'yaw' | 'electrical' | 'info';
  severity: 'critical' | 'major' | 'minor' | 'info';
  title: string;
  description: string;
  value: number;
  unit: string;
  threshold: number;
  timestamp: string;
  component: string;
}

export interface Turbine {
  id: string;
  code: string;
  name: string;
  model: string;
  ratedCapacityKw: number;
  location: string;
  substation: string;
  installationYear: number;
  status: 'running' | 'derated' | 'tripped' | 'maintenance' | 'offline';
  currentPowerKw: number;
  windSpeedMs: number;
  rotorRpm: number;
  gearboxTempC: number;
  generatorTempC: number;
  vibrationRmsMmS: number;
  oilPressureBar: number;
  yawAngleDeg: number;
  lastInspectionDate: string;
  activeAlertsCount: number;
  criticalAlertsCount: number;
}

export interface TelemetryPoint {
  time: string;
  vibration: number;
  gearboxTemp: number;
  generatorTemp: number;
  powerKw: number;
  windSpeed: number;
}

export interface MediaFile {
  id: string;
  url: string;
  type: 'photo' | 'audio' | 'video';
  caption: string;
  annotation?: string;
  timestamp?: string;
  stepId?: string;
}

export interface ChecklistItem {
  id: string;
  question: string;
  category: 'visual' | 'gearbox' | 'electrical' | 'hydraulic' | 'blades';
  type: 'boolean' | 'numeric' | 'select' | 'multiselect';
  unit?: string;
  options?: string[];
  requiresMediaIf?: 'yes' | 'no' | 'above_threshold';
  threshold?: number;
  riskWeight: number;
  guidanceText?: string;
}

export interface ChecklistSection {
  id: string;
  title: string;
  description: string;
  iconName: string;
  items: ChecklistItem[];
}

export interface TriageInput {
  turbineId: string;
  turbineCode: string;
  technicianId: string;
  technicianName: string;
  checklistResponses: Record<string, any>;
  noiseType: string;
  oilSeepage: string;
  manualTempC?: number;
  manualVibrationMmS?: number;
  technicianPerceivedSeverity: 'low' | 'medium' | 'high';
  technicianConfidence: 'low' | 'medium' | 'high';
  symptoms: string[];
  mediaRefs: MediaFile[];
  notes?: string;
}

export interface TriageReport {
  id: string;
  turbineId: string;
  turbineCode: string;
  technicianId: string;
  technicianName: string;
  inspectionId?: string;
  severityScore: number; // 0-100
  severityBand: 'green' | 'amber' | 'red';
  recommendedAction: string;
  priority: 'P1' | 'P2' | 'P3';
  summary: string;
  symptoms: string[];
  noiseProfile?: string;
  oilSeepSeverity?: string;
  technicianPerceivedSeverity: 'low' | 'medium' | 'high';
  technicianConfidence: 'low' | 'medium' | 'high';
  followUpTasks: string[];
  mediaRefs: MediaFile[];
  supervisorNotes?: string;
  supervisorApproved?: boolean;
  createdAt: string;
}

export interface InspectionRecord {
  id: string;
  turbineId: string;
  turbineCode: string;
  technicianId: string;
  technicianName: string;
  startedAt: string;
  completedAt: string;
  calculatedConditionScore: number;
  checklistData: Record<string, any>;
  mediaRefs: MediaFile[];
  keyFindings: string[];
  triageReportId?: string;
}

export interface TechnicianProfile {
  id: string;
  name: string;
  role: string;
  employeeId: string;
  site: string;
  shift: string;
  certifications: string[];
  phone: string;
  avatarUrl: string;
}
