import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));

// ----------------------------------------------------
// In-Memory Seed Data for Muppandal Wind Farm
// ----------------------------------------------------
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
  mediaRefs: Array<{
    id: string;
    url: string;
    type: 'photo' | 'audio' | 'video';
    annotation?: string;
    caption: string;
  }>;
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
  mediaRefs: any[];
  keyFindings: string[];
  triageReportId?: string;
}

// Initial Turbines at Muppandal Wind Farm
let turbines: Turbine[] = [
  {
    id: 'turb-01',
    code: 'MP-T04',
    name: 'Muppandal Sector A - Turbine 04',
    model: 'Suzlon S88 (2.1 MW)',
    ratedCapacityKw: 2100,
    location: 'Muppandal Pass, Kanyakumari-Tirunelveli Ridge (8.2612° N, 77.5489° E)',
    substation: 'Aralvaimozhi 230kV Substation',
    installationYear: 2018,
    status: 'derated',
    currentPowerKw: 1420,
    windSpeedMs: 11.4,
    rotorRpm: 14.8,
    gearboxTempC: 84.5,
    generatorTempC: 78.2,
    vibrationRmsMmS: 7.2,
    oilPressureBar: 3.2,
    yawAngleDeg: 284,
    lastInspectionDate: '2026-08-12',
    activeAlertsCount: 3,
    criticalAlertsCount: 1,
  },
  {
    id: 'turb-02',
    code: 'MP-T12',
    name: 'Muppandal Sector B - Turbine 12',
    model: 'Vestas V82 (1.65 MW)',
    ratedCapacityKw: 1650,
    location: 'Perungudi Valley, Sector B (8.2831° N, 77.5612° E)',
    substation: 'Muppandal Grid Substation 1',
    installationYear: 2019,
    status: 'running',
    currentPowerKw: 1580,
    windSpeedMs: 12.8,
    rotorRpm: 16.2,
    gearboxTempC: 64.2,
    generatorTempC: 62.0,
    vibrationRmsMmS: 2.1,
    oilPressureBar: 4.5,
    yawAngleDeg: 280,
    lastInspectionDate: '2026-08-25',
    activeAlertsCount: 0,
    criticalAlertsCount: 0,
  },
  {
    id: 'turb-03',
    code: 'MP-T28',
    name: 'Muppandal Sector C - Turbine 28',
    model: 'Gamesa G58 (850 kW)',
    ratedCapacityKw: 850,
    location: 'Aralvaimozhi Wind Corridor (8.2450° N, 77.5280° E)',
    substation: 'Aralvaimozhi 110kV Substation',
    installationYear: 2016,
    status: 'running',
    currentPowerKw: 620,
    windSpeedMs: 9.6,
    rotorRpm: 21.0,
    gearboxTempC: 76.8,
    generatorTempC: 71.4,
    vibrationRmsMmS: 4.8,
    oilPressureBar: 3.8,
    yawAngleDeg: 290,
    lastInspectionDate: '2026-08-01',
    activeAlertsCount: 2,
    criticalAlertsCount: 0,
  },
  {
    id: 'turb-04',
    code: 'MP-T42',
    name: 'Muppandal Sector D - Turbine 42',
    model: 'Suzlon S97 (2.1 MW)',
    ratedCapacityKw: 2100,
    location: 'Radhapuram Ridge, Sector D (8.3105° N, 77.6102° E)',
    substation: 'Radhapuram 230kV Substation',
    installationYear: 2021,
    status: 'tripped',
    currentPowerKw: 0,
    windSpeedMs: 13.5,
    rotorRpm: 0.0,
    gearboxTempC: 92.4,
    generatorTempC: 86.1,
    vibrationRmsMmS: 11.8,
    oilPressureBar: 1.8,
    yawAngleDeg: 275,
    lastInspectionDate: '2026-07-28',
    activeAlertsCount: 4,
    criticalAlertsCount: 2,
  },
  {
    id: 'turb-05',
    code: 'MP-T18',
    name: 'Muppandal Sector B - Turbine 18',
    model: 'Vestas V90 (2.0 MW)',
    ratedCapacityKw: 2000,
    location: 'Kavalkinaru Heights (8.2710° N, 77.5890° E)',
    substation: 'Muppandal Grid Substation 2',
    installationYear: 2020,
    status: 'running',
    currentPowerKw: 1910,
    windSpeedMs: 13.1,
    rotorRpm: 15.5,
    gearboxTempC: 66.0,
    generatorTempC: 63.8,
    vibrationRmsMmS: 2.4,
    oilPressureBar: 4.6,
    yawAngleDeg: 282,
    lastInspectionDate: '2026-08-19',
    activeAlertsCount: 1,
    criticalAlertsCount: 0,
  },
  {
    id: 'turb-06',
    code: 'MP-T35',
    name: 'Muppandal Sector C - Turbine 35',
    model: 'Enercon E-48 (800 kW)',
    ratedCapacityKw: 800,
    location: 'Panagudi Escarpment (8.3240° N, 77.5920° E)',
    substation: 'Panagudi 110kV Substation',
    installationYear: 2017,
    status: 'running',
    currentPowerKw: 740,
    windSpeedMs: 10.8,
    rotorRpm: 23.4,
    gearboxTempC: 61.5,
    generatorTempC: 68.9,
    vibrationRmsMmS: 3.1,
    oilPressureBar: 4.1,
    yawAngleDeg: 286,
    lastInspectionDate: '2026-08-15',
    activeAlertsCount: 1,
    criticalAlertsCount: 0,
  }
];

// Initial Sensor Alerts
let sensorAlerts: SensorAlert[] = [
  {
    id: 'alt-101',
    turbineId: 'turb-01',
    alertType: 'vibration',
    severity: 'critical',
    title: 'High Gearbox High-Speed Shaft Vibration',
    description: 'CMS Accelerometer Ch-3 (High-Speed Stage Bearing) detected sustained RMS vibration of 7.2 mm/s exceeding ISO 10816-21 alert threshold of 5.5 mm/s. Peak frequency 384 Hz indicates inner race micro-spalling.',
    value: 7.2,
    unit: 'mm/s RMS',
    threshold: 5.5,
    timestamp: '22 mins ago',
    component: 'Gearbox HSS Bearing'
  },
  {
    id: 'alt-102',
    turbineId: 'turb-01',
    alertType: 'temperature',
    severity: 'major',
    title: 'Gearbox Sump Oil Temperature Near Limit',
    description: 'PT100 probe measured 84.5°C sump temperature under 68% derated power load (nominal normal is <72°C). High thermal gradient suggests friction or lubrication film breakdown.',
    value: 84.5,
    unit: '°C',
    threshold: 80.0,
    timestamp: '48 mins ago',
    component: 'Gearbox Lubrication'
  },
  {
    id: 'alt-103',
    turbineId: 'turb-01',
    alertType: 'power',
    severity: 'minor',
    title: 'Power Output Derate Curve Active',
    description: 'SCADA auto-derated power output to 1420 kW from 2100 kW rated due to drivetrain thermal threshold override.',
    value: 1420,
    unit: 'kW',
    threshold: 2100,
    timestamp: '1 hour ago',
    component: 'Converter Controller'
  },
  {
    id: 'alt-104',
    turbineId: 'turb-04',
    alertType: 'vibration',
    severity: 'critical',
    title: 'Critical Drivetrain Resonance Trip',
    description: 'High axial shock vibration spike reached 11.8 mm/s triggering emergency aerodynamic blade feathering and mechanical brake lockdown.',
    value: 11.8,
    unit: 'mm/s RMS',
    threshold: 8.0,
    timestamp: '35 mins ago',
    component: 'Main Bearing / Gearbox'
  },
  {
    id: 'alt-105',
    turbineId: 'turb-04',
    alertType: 'temperature',
    severity: 'critical',
    title: 'Gearbox Intermediate Shaft Bearing Overheat',
    description: 'Bearing temp reached 92.4°C exceeding safety trip limit of 90°C.',
    value: 92.4,
    unit: '°C',
    threshold: 90.0,
    timestamp: '40 mins ago',
    component: 'Gearbox IMS'
  },
  {
    id: 'alt-106',
    turbineId: 'turb-04',
    alertType: 'hydraulic',
    severity: 'major',
    title: 'Hydraulic Pitch Pressure Drop',
    description: 'Pitch accumulator pressure dropped to 1.8 bar against nominal 4.5 bar charging pressure.',
    value: 1.8,
    unit: 'bar',
    threshold: 3.5,
    timestamp: '1 hour ago',
    component: 'Hydraulic Power Unit'
  },
  {
    id: 'alt-107',
    turbineId: 'turb-03',
    alertType: 'vibration',
    severity: 'minor',
    title: 'Planetary Stage Vibration Rise',
    description: 'CMS detects steady upward trend in 1X planetary mesh frequency over past 48 hours.',
    value: 4.8,
    unit: 'mm/s RMS',
    threshold: 4.5,
    timestamp: '3 hours ago',
    component: 'Planetary Stage'
  },
  {
    id: 'alt-108',
    turbineId: 'turb-03',
    alertType: 'yaw',
    severity: 'minor',
    title: 'Yaw Misalignment Deviation',
    description: 'Anemometer vs nacelle orientation delta of 12° during gust transition.',
    value: 12,
    unit: 'deg',
    threshold: 8,
    timestamp: '5 hours ago',
    component: 'Yaw Drive Motor 2'
  },
  {
    id: 'alt-109',
    turbineId: 'turb-05',
    alertType: 'info',
    severity: 'info',
    title: 'Routine SCADA CMS Baseline Calibrated',
    description: 'Acoustic spectral baseline calibrated successfully for August high-wind season.',
    value: 2.4,
    unit: 'mm/s RMS',
    threshold: 5.0,
    timestamp: '1 day ago',
    component: 'CMS System'
  },
  {
    id: 'alt-110',
    turbineId: 'turb-06',
    alertType: 'temperature',
    severity: 'minor',
    title: 'Generator Slip-Ring Compartment Temp Notice',
    description: 'Slip ring enclosure temp at 68.9°C due to ambient heat.',
    value: 68.9,
    unit: '°C',
    threshold: 65.0,
    timestamp: '2 hours ago',
    component: 'Generator Slip Ring'
  }
];

// Initial Triage Reports History
let triageReports: TriageReport[] = [
  {
    id: 'trg-901',
    turbineId: 'turb-01',
    turbineCode: 'MP-T04',
    technicianId: 'tech-01',
    technicianName: 'R. Senthil Kumar',
    severityScore: 82,
    severityBand: 'red',
    recommendedAction: 'Immediate controlled shutdown and emergency inspection. Lock out rotor before climb.',
    priority: 'P1',
    summary: 'Elevated high-speed shaft gearbox vibration (7.2 mm/s RMS) corroborated by abnormal metallic grinding noise and visible oil seal weeping.',
    symptoms: [
      'High metallic grinding noise near HSS bearing',
      'Oil seep along output shaft lip seal',
      'High thermal gradient on housing (+18°C above ambient)',
      'CMS alert confirmed on Channel 3'
    ],
    noiseProfile: 'Continuous metallic grinding with cyclical clicking at 14.8 RPM',
    oilSeepSeverity: 'Moderate weeping (approx. 50ml pooling in nacelle drip tray)',
    technicianPerceivedSeverity: 'high',
    technicianConfidence: 'high',
    followUpTasks: [
      'Perform Lockout-Tagout (LOTO) on 690V breaker',
      'Execute borescope inspection of HSS pinion teeth and bearing cage',
      'Collect 250ml gear oil sample for ferrographic wear particle analysis',
      'Requisition SKF 23024 spherical roller bearing kit from Muppandal central warehouse',
      'Book 50T crane maintenance window with site supervisor'
    ],
    mediaRefs: [
      {
        id: 'med-01',
        url: 'https://images.unsplash.com/photo-1548337138-e87d889cc369?auto=format&fit=crop&w=600&q=80',
        type: 'photo',
        caption: 'HSS Output Shaft Lip Seal Oil Seepage',
        annotation: 'Arrow points to active oil film accumulation around shaft collar'
      }
    ],
    supervisorNotes: 'Supervisor Approved: Maintenance work order WO-2026-MP04 generated. Mobilizing hydraulic torque tool team.',
    supervisorApproved: true,
    createdAt: '2026-08-30T14:30:00Z'
  },
  {
    id: 'trg-902',
    turbineId: 'turb-03',
    turbineCode: 'MP-T28',
    technicianId: 'tech-02',
    technicianName: 'M. Anandaraj',
    severityScore: 48,
    severityBand: 'amber',
    recommendedAction: 'Schedule maintenance within 7 days. Perform gearbox oil replenishment and vibration spectral monitoring.',
    priority: 'P2',
    summary: 'Moderate planetary stage vibration rise. No active structural defect visible, but oil viscosity degraded.',
    symptoms: [
      'Mild cyclical hum during yaw tracking',
      'Oil filter differential pressure indicator in yellow zone',
      'Clean exterior housing, no active pooling'
    ],
    noiseProfile: 'Intermittent hum under heavy 12m/s gusts',
    oilSeepSeverity: 'None / Dry',
    technicianPerceivedSeverity: 'medium',
    technicianConfidence: 'high',
    followUpTasks: [
      'Replace inline 10-micron gearbox oil filter cartridge',
      'Top up with Mobilgear SHC XMP 320 synthetic oil (15 Liters)',
      'Retest CMS accelerometer calibration in 48 hours'
    ],
    mediaRefs: [],
    supervisorNotes: 'Approved for scheduled maintenance during low wind window on Wednesday.',
    supervisorApproved: true,
    createdAt: '2026-08-28T09:15:00Z'
  },
  {
    id: 'trg-903',
    turbineId: 'turb-02',
    turbineCode: 'MP-T12',
    technicianId: 'tech-01',
    technicianName: 'R. Senthil Kumar',
    severityScore: 18,
    severityBand: 'green',
    recommendedAction: 'Continue operation. Monitor via SCADA for next 72 hours. Drivetrain and yaw system within pristine baseline tolerances.',
    priority: 'P3',
    summary: 'Full routine condition audit. Vibration 2.1 mm/s RMS, bearing temperatures optimal at 64°C.',
    symptoms: ['Normal smooth operational sound', 'No leaks', 'Brake pads at 82% thickness'],
    technicianPerceivedSeverity: 'low',
    technicianConfidence: 'high',
    followUpTasks: ['Record standard SCADA CBM stamp in annual logbook'],
    mediaRefs: [],
    supervisorApproved: true,
    createdAt: '2026-08-25T11:00:00Z'
  }
];

let inspections: InspectionRecord[] = [];

// ----------------------------------------------------
// API Endpoints
// ----------------------------------------------------

// 1. Get all Turbines
app.get('/api/turbines', (req, res) => {
  res.json({ success: true, count: turbines.length, turbines });
});

// 2. Get Single Turbine by ID
app.get('/api/turbines/:id', (req, res) => {
  const turbine = turbines.find(t => t.id === req.params.id || t.code.toLowerCase() === req.params.id.toLowerCase());
  if (!turbine) {
    return res.status(404).json({ success: false, error: 'Turbine not found' });
  }
  res.json({ success: true, turbine });
});

// 3. Lookup Turbine by QR Code (e.g. "MP-T04", "https://fieldfix.app/turbine/MP-T04")
app.get('/api/turbines/by-code/:code', (req, res) => {
  let code = req.params.code.trim();
  if (code.includes('/')) {
    const parts = code.split('/');
    code = parts[parts.length - 1];
  }
  const turbine = turbines.find(t => t.code.toLowerCase() === code.toLowerCase() || t.id.toLowerCase() === code.toLowerCase());
  if (!turbine) {
    return res.status(404).json({ success: false, error: `Turbine with code "${code}" not found` });
  }
  res.json({ success: true, turbine });
});

// 4. Get Real-Time Sensor Alerts for Turbine
app.get('/api/turbines/:id/alerts', (req, res) => {
  const turbineId = req.params.id;
  const turbine = turbines.find(t => t.id === turbineId || t.code.toLowerCase() === turbineId.toLowerCase());
  if (!turbine) {
    return res.status(404).json({ success: false, error: 'Turbine not found' });
  }
  const alerts = sensorAlerts.filter(a => a.turbineId === turbine.id);
  res.json({ success: true, turbineId: turbine.id, alerts });
});

// 5. Get Telemetry Historical Trend Stream for Turbine (2-hour simulated high-resolution trend)
app.get('/api/turbines/:id/telemetry', (req, res) => {
  const turbineId = req.params.id;
  const turbine = turbines.find(t => t.id === turbineId || t.code.toLowerCase() === turbineId.toLowerCase());
  if (!turbine) {
    return res.status(404).json({ success: false, error: 'Turbine not found' });
  }

  // Generate 12 data points representing last 2 hours (10 min intervals)
  const now = Date.now();
  const points = [];
  const baseVib = turbine.vibrationRmsMmS;
  const baseTemp = turbine.gearboxTempC;
  const basePower = turbine.currentPowerKw;

  for (let i = 11; i >= 0; i--) {
    const timeStr = new Date(now - i * 10 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const factor = (12 - i) / 12;
    // trend upwards if derated or tripped
    const vibNoise = (Math.random() - 0.5) * 0.4;
    const tempNoise = (Math.random() - 0.5) * 0.8;
    const powerNoise = (Math.random() - 0.5) * 40;

    points.push({
      time: timeStr,
      vibration: Number(Math.max(0.5, (baseVib * (0.7 + 0.3 * factor) + vibNoise)).toFixed(2)),
      gearboxTemp: Number(Math.max(30, (baseTemp * (0.85 + 0.15 * factor) + tempNoise)).toFixed(1)),
      generatorTemp: Number(Math.max(30, (turbine.generatorTempC * (0.9 + 0.1 * factor) + tempNoise)).toFixed(1)),
      powerKw: Number(Math.max(0, (basePower + powerNoise)).toFixed(0)),
      windSpeed: Number((turbine.windSpeedMs + (Math.random() - 0.5) * 1.5).toFixed(1))
    });
  }

  res.json({ success: true, turbineId: turbine.id, points });
});

// 6. Get History of Inspections and Triage Reports
app.get('/api/turbines/:id/history', (req, res) => {
  const turbineId = req.params.id;
  const turbine = turbines.find(t => t.id === turbineId || t.code.toLowerCase() === turbineId.toLowerCase());
  if (!turbine) {
    return res.status(404).json({ success: false, error: 'Turbine not found' });
  }

  const reports = triageReports.filter(r => r.turbineId === turbine.id);
  const insps = inspections.filter(i => i.turbineId === turbine.id);

  res.json({
    success: true,
    turbineId: turbine.id,
    triageReports: reports,
    inspections: insps
  });
});

// 7. Post New Inspection Checklist
app.post('/api/inspections', (req, res) => {
  const { turbineId, technicianId, technicianName, checklistData, mediaRefs, keyFindings, calculatedConditionScore } = req.body;
  
  const turbine = turbines.find(t => t.id === turbineId || t.code === turbineId);
  if (!turbine) {
    return res.status(404).json({ success: false, error: 'Turbine not found' });
  }

  const newInspection: InspectionRecord = {
    id: `insp-${Date.now()}`,
    turbineId: turbine.id,
    turbineCode: turbine.code,
    technicianId: technicianId || 'tech-01',
    technicianName: technicianName || 'R. Senthil Kumar',
    startedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    completedAt: new Date().toISOString(),
    calculatedConditionScore: calculatedConditionScore || 50,
    checklistData: checklistData || {},
    mediaRefs: mediaRefs || [],
    keyFindings: keyFindings || []
  };

  inspections.unshift(newInspection);
  turbine.lastInspectionDate = new Date().toISOString().split('T')[0];

  res.status(201).json({ success: true, inspection: newInspection });
});

// 8. Post New Fault Triage & Compute Standardized CBM Recommendation
app.post('/api/triage', (req, res) => {
  const {
    turbineId,
    technicianId,
    technicianName,
    checklistResponses,
    noiseType,
    oilSeepage,
    technicianPerceivedSeverity,
    technicianConfidence,
    symptoms,
    mediaRefs,
    manualTempC,
    manualVibrationMmS
  } = req.body;

  const turbine = turbines.find(t => t.id === turbineId || t.code === turbineId);
  if (!turbine) {
    return res.status(404).json({ success: false, error: 'Turbine not found' });
  }

  const turbineAlerts = sensorAlerts.filter(a => a.turbineId === turbine.id);
  const criticalAlerts = turbineAlerts.filter(a => a.severity === 'critical');
  const majorAlerts = turbineAlerts.filter(a => a.severity === 'major');

  // Compute Standardized Severity Score (0-100) using Plan Heuristics:
  let score = 0;

  // 1. Real-time SCADA/CMS Alerts Weight
  if (criticalAlerts.length > 0) {
    score += 40 * Math.min(criticalAlerts.length, 2);
  }
  if (majorAlerts.length > 0) {
    score += 20 * Math.min(majorAlerts.length, 2);
  }
  if (turbine.status === 'tripped') {
    score += 25;
  } else if (turbine.status === 'derated') {
    score += 15;
  }

  // 2. Physical Checklist & Field Observations
  if (noiseType === 'grinding' || noiseType === 'knocking') {
    score += 25;
  } else if (noiseType === 'squealing' || noiseType === 'rattling') {
    score += 15;
  }

  if (oilSeepage === 'heavy' || oilSeepage === 'pooling') {
    score += 25;
  } else if (oilSeepage === 'moderate' || oilSeepage === 'weeping') {
    score += 15;
  }

  if (manualTempC && Number(manualTempC) > 85) {
    score += 20;
  }
  if (manualVibrationMmS && Number(manualVibrationMmS) > 6.0) {
    score += 20;
  }

  // 3. Technician Perceived Severity & Confidence
  if (technicianPerceivedSeverity === 'high') {
    score += 15;
  } else if (technicianPerceivedSeverity === 'medium') {
    score += 8;
  }

  // Normalize score between 5 and 100
  const finalScore = Math.min(100, Math.max(8, Math.round(score)));

  // Map to Severity Band
  let severityBand: 'green' | 'amber' | 'red' = 'green';
  let recommendedAction = '';
  let priority: 'P1' | 'P2' | 'P3' = 'P3';
  const followUpTasks: string[] = [];

  if (finalScore >= 71 || criticalAlerts.length > 0 || turbine.status === 'tripped') {
    severityBand = 'red';
    priority = 'P1';
    recommendedAction = 'Immediate controlled shutdown and emergency inspection. Lock out rotor and drivetrain before nacelle access.';
    followUpTasks.push(
      'Enforce Lockout-Tagout (LOTO) on 690V breaker and pitch lock pins',
      'Perform detailed borescope inspection of gearbox high/intermediate gears',
      'Collect 250ml lubricating oil sample for spectrometric analysis',
      'Notify Muppandal Wind Farm Central Dispatch (04652-284900)',
      'Draft Emergency Work Order for replacement bearing / seal assembly'
    );
  } else if (finalScore >= 31 || majorAlerts.length > 0) {
    severityBand = 'amber';
    priority = 'P2';
    recommendedAction = 'Schedule maintenance within 7 days. Increase SCADA CMS monitoring frequency to 10-minute intervals.';
    followUpTasks.push(
      'Inspect gearbox oil filtration unit and differential pressure switch',
      'Check bearing grease auto-lubricator cartridges in yaw and generator',
      'Conduct handheld acoustic vibration spectral sweep',
      'Schedule low-wind maintenance slot (preferred: <6 m/s morning window)'
    );
  } else {
    severityBand = 'green';
    priority = 'P3';
    recommendedAction = 'Continue operation. Monitor via SCADA for next 72 hours. All drivetrain and electrical parameters within safe margins.';
    followUpTasks.push(
      'Log routine condition verification in Muppandal CBM Registry',
      'Retain baseline acoustic sample for machine learning trend baseline'
    );
  }

  // Generate structured summary string
  const summaryTriggers: string[] = [];
  if (criticalAlerts.length > 0) summaryTriggers.push(`Active critical alert: ${criticalAlerts[0].title}`);
  if (noiseType && noiseType !== 'none') summaryTriggers.push(`Observed abnormal ${noiseType} acoustic signature`);
  if (oilSeepage && oilSeepage !== 'none') summaryTriggers.push(`Detected ${oilSeepage} oil seepage on drivetrain`);
  if (summaryTriggers.length === 0) summaryTriggers.push('Routine healthy condition confirmed with nominal thermal and vibration baseline');

  const summary = summaryTriggers.join('; ') + '.';

  const newReport: TriageReport = {
    id: `trg-${Date.now()}`,
    turbineId: turbine.id,
    turbineCode: turbine.code,
    technicianId: technicianId || 'tech-01',
    technicianName: technicianName || 'R. Senthil Kumar',
    severityScore: finalScore,
    severityBand,
    recommendedAction,
    priority,
    summary,
    symptoms: symptoms || [],
    noiseProfile: noiseType ? `Acoustic profile: ${noiseType}` : undefined,
    oilSeepSeverity: oilSeepage ? `Oil state: ${oilSeepage}` : undefined,
    technicianPerceivedSeverity: technicianPerceivedSeverity || 'medium',
    technicianConfidence: technicianConfidence || 'high',
    followUpTasks,
    mediaRefs: mediaRefs || [],
    supervisorApproved: false,
    createdAt: new Date().toISOString()
  };

  triageReports.unshift(newReport);

  // Update turbine status if P1
  if (priority === 'P1' && turbine.status === 'running') {
    turbine.status = 'derated';
  }

  res.status(201).json({ success: true, report: newReport });
});

// 9. Supervisor Approval of Triage Report & Work Order Creation
app.post('/api/triage/:id/approve', (req, res) => {
  const { notes, supervisorName } = req.body;
  const report = triageReports.find(r => r.id === req.params.id);
  if (!report) {
    return res.status(404).json({ success: false, error: 'Report not found' });
  }

  report.supervisorApproved = true;
  report.supervisorNotes = `Approved by ${supervisorName || 'S. Sundaram (Sr. Site Manager)'}: ${notes || 'Work order dispatched to field team.'}`;

  res.json({ success: true, report });
});

// 10. Inject Simulated SCADA Fault (For Testing & Live Demonstrations)
app.post('/api/scada/inject-fault', (req, res) => {
  const { turbineId, faultType } = req.body;
  const turbine = turbines.find(t => t.id === turbineId || t.code === turbineId);
  if (!turbine) {
    return res.status(404).json({ success: false, error: 'Turbine not found' });
  }

  if (faultType === 'vibration_spike') {
    turbine.vibrationRmsMmS = 8.6;
    turbine.status = 'derated';
    turbine.currentPowerKw = Math.round(turbine.ratedCapacityKw * 0.55);
    turbine.criticalAlertsCount += 1;
    turbine.activeAlertsCount += 1;

    const newAlert: SensorAlert = {
      id: `alt-${Date.now()}`,
      turbineId: turbine.id,
      alertType: 'vibration',
      severity: 'critical',
      title: 'High-Frequency Gearbox Mesh Vibration Anomaly',
      description: 'CMS Accelerometer Ch-2 registered sudden 8.6 mm/s surge. Drivetrain harmonic peak detected at 1.2 kHz.',
      value: 8.6,
      unit: 'mm/s RMS',
      threshold: 5.5,
      timestamp: 'Just now',
      component: 'Gearbox Intermediate Stage'
    };
    sensorAlerts.unshift(newAlert);
  } else if (faultType === 'temperature_overheat') {
    turbine.gearboxTempC = 89.2;
    turbine.activeAlertsCount += 1;
    const newAlert: SensorAlert = {
      id: `alt-${Date.now()}`,
      turbineId: turbine.id,
      alertType: 'temperature',
      severity: 'major',
      title: 'Main Bearing Thermal Runaway Warning',
      description: 'Main bearing temp climbed rapidly to 89.2°C under steady 12 m/s wind.',
      value: 89.2,
      unit: '°C',
      threshold: 80.0,
      timestamp: 'Just now',
      component: 'Main Bearing Assembly'
    };
    sensorAlerts.unshift(newAlert);
  } else if (faultType === 'reset_healthy') {
    turbine.vibrationRmsMmS = 2.3;
    turbine.gearboxTempC = 64.0;
    turbine.generatorTempC = 61.5;
    turbine.status = 'running';
    turbine.currentPowerKw = Math.round(turbine.ratedCapacityKw * 0.92);
    turbine.activeAlertsCount = 0;
    turbine.criticalAlertsCount = 0;
    // clear critical alerts for this turbine
    sensorAlerts = sensorAlerts.filter(a => a.turbineId !== turbine.id || a.severity === 'info');
  }

  res.json({ success: true, turbine, activeAlerts: sensorAlerts.filter(a => a.turbineId === turbine.id) });
});

// 11. Current User / Engineer Profile
app.get('/api/technicians/me', (req, res) => {
  res.json({
    success: true,
    technician: {
      id: 'tech-01',
      name: 'R. Senthil Kumar',
      role: 'Senior Wind Turbine Reliability Engineer',
      employeeId: 'MF-ENG-4402',
      site: 'Muppandal Wind Energy Hub, Tamil Nadu',
      shift: 'Morning (06:00 - 18:00)',
      certifications: ['GWO Certified (Global Wind Organisation)', 'Vibration Analyst Cat II (ISO 18436-2)', 'High Voltage Safety Level 3'],
      phone: '+91 94432 89120',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
    }
  });
});

// ----------------------------------------------------
// Production / Vite Middleware Boot
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FieldFix Engineer Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
