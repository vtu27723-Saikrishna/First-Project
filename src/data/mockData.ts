import { ChecklistSection } from '../types';

export const CHECKLIST_SECTIONS: ChecklistSection[] = [
  {
    id: 'sec-tower-visual',
    title: '1. Tower Base & Safety Access',
    description: 'Foundation integrity, ladder safety line, LOTO locks, and ground cables',
    iconName: 'ShieldAlert',
    items: [
      {
        id: 'chk-01',
        category: 'visual',
        question: 'Are tower foundation anchor bolts secure with no cracks or settlement?',
        type: 'boolean',
        riskWeight: 15,
        guidanceText: 'Check base flange nuts for corrosion, loose torque indicators, or concrete spalling.'
      },
      {
        id: 'chk-02',
        category: 'visual',
        question: 'Is the climb fall-arrest safety cable & ladder rung inspection tag valid?',
        type: 'boolean',
        riskWeight: 20,
        guidanceText: 'Ensure EN 353-1 fall arrest runner is engaged before climbing.'
      },
      {
        id: 'chk-03',
        category: 'visual',
        question: 'Is lightning protection ground copper braid firmly connected at the base?',
        type: 'boolean',
        riskWeight: 10,
        guidanceText: 'Required to prevent lightning surge damage during southwest monsoon thunderstorms.'
      }
    ]
  },
  {
    id: 'sec-gearbox-drivetrain',
    title: '2. Gearbox & Main Drivetrain',
    description: 'Vibration, oil leakage, acoustic noise, high-speed shaft bearing health',
    iconName: 'Cog',
    items: [
      {
        id: 'chk-04',
        category: 'gearbox',
        question: 'Is there visible oil leakage or weeping on gearbox housing or seals?',
        type: 'select',
        options: ['None (Dry)', 'Minor Weeping (<20ml)', 'Moderate Seep (50-200ml)', 'Active Leak / Pooling (>200ml)'],
        requiresMediaIf: 'yes',
        riskWeight: 25,
        guidanceText: 'Inspect High-Speed Shaft (HSS) lip seal, intermediate bearing caps, and sump drain plug.'
      },
      {
        id: 'chk-05',
        category: 'gearbox',
        question: 'Record manual laser IR temperature on Gearbox HSS Bearing Housing (°C):',
        type: 'numeric',
        unit: '°C',
        threshold: 80,
        riskWeight: 20,
        guidanceText: 'Normal operating range is 55°C - 75°C under Muppandal ambient 34°C.'
      },
      {
        id: 'chk-06',
        category: 'gearbox',
        question: 'Are abnormal acoustic signatures audible during slow rotation or operation?',
        type: 'select',
        options: ['Normal Smooth Operation', 'High-Pitch Squeal (Bearing Slip)', 'Metallic Grinding (Gear Pitting)', 'Cyclical Knocking (Tooth Damage)'],
        requiresMediaIf: 'yes',
        riskWeight: 30,
        guidanceText: 'Capture a 10-second audio recording using the in-app acoustic recorder for spectral verification.'
      },
      {
        id: 'chk-07',
        category: 'gearbox',
        question: 'Is the inline oil filter differential pressure indicator in the GREEN zone?',
        type: 'boolean',
        riskWeight: 15,
        guidanceText: 'A yellow or red indicator signifies clogged filter mesh or metal particle debris.'
      }
    ]
  },
  {
    id: 'sec-generator-electrical',
    title: '3. Generator, Slip Ring & Power Converter',
    description: 'Brush wear, slip ring patina, thermal signatures, converter cable terminals',
    iconName: 'Zap',
    items: [
      {
        id: 'chk-08',
        category: 'electrical',
        question: 'Are generator carbon brushes within allowable wear length (>25mm)?',
        type: 'boolean',
        riskWeight: 15,
        guidanceText: 'Check slip-ring bronze surface for scoring, black carbon buildup, or sparking.'
      },
      {
        id: 'chk-09',
        category: 'electrical',
        question: 'Record manual temperature on Generator Drive-End (DE) Bearing (°C):',
        type: 'numeric',
        unit: '°C',
        threshold: 75,
        riskWeight: 15,
        guidanceText: 'Alarm triggers above 75°C. Check auto-greaser cartridge levels.'
      },
      {
        id: 'chk-10',
        category: 'electrical',
        question: 'Is there any sign of overheating or discoloration on 690V flexible power cables?',
        type: 'boolean',
        requiresMediaIf: 'no',
        riskWeight: 20,
        guidanceText: 'Inspect cable droop loop for twisting damage caused by yaw turns.'
      }
    ]
  },
  {
    id: 'sec-hydraulic-yaw',
    title: '4. Hydraulic Pitch, Yaw Drive & Brakes',
    description: 'Hydraulic accumulator pressure, brake disc pad thickness, yaw gear teeth',
    iconName: 'Gauge',
    items: [
      {
        id: 'chk-11',
        category: 'hydraulic',
        question: 'Record Hydraulic Power Unit (HPU) system pressure (bar):',
        type: 'numeric',
        unit: 'bar',
        threshold: 4.0,
        riskWeight: 20,
        guidanceText: 'Normal charge pressure: 4.5 - 5.2 bar. Low pressure prevents emergency blade pitch.'
      },
      {
        id: 'chk-12',
        category: 'hydraulic',
        question: 'Are high-speed shaft mechanical aerodynamic brake pads >8mm thick?',
        type: 'boolean',
        riskWeight: 20,
        guidanceText: 'Check caliper pistons for brake fluid leaks or uneven wear.'
      },
      {
        id: 'chk-13',
        category: 'hydraulic',
        question: 'Are yaw bull gear teeth properly greased with no stripped or cracked teeth?',
        type: 'boolean',
        riskWeight: 15,
        guidanceText: 'Verify auto-lubricator pinion engages smoothly across 360° ring.'
      }
    ]
  },
  {
    id: 'sec-blades-hub',
    title: '5. Rotor Blades, Aerodynamic Hub & Tip Condition',
    description: 'Leading edge erosion, vortex generators, tip pitch bearings, lightning receptors',
    iconName: 'Wind',
    items: [
      {
        id: 'chk-14',
        category: 'blades',
        question: 'Are blade leading edges free of severe erosion, cracks, or debonding?',
        type: 'boolean',
        requiresMediaIf: 'no',
        riskWeight: 25,
        guidanceText: 'High wind velocity in Muppandal ridge causes leading-edge sand erosion.'
      },
      {
        id: 'chk-15',
        category: 'blades',
        question: 'Are lightning copper receptor studs intact and free from burn flashovers?',
        type: 'boolean',
        riskWeight: 15,
        guidanceText: 'Essential for monsoon electrical storm resilience.'
      }
    ]
  }
];

export const MUPPANDAL_FARM_FACTS = {
  name: 'Muppandal Wind Farm (முப்பந்தல் காற்றாலை)',
  capacity: '1,500 MW Operational Capacity',
  location: 'Tirunelveli - Kanyakumari Ridge, Tamil Nadu, India',
  windRegime: 'High Wind Corridor (Class I/II), Southwest Monsoon Winds',
  avgDowntimeCostPerHour: '₹50,000 / hour',
  avoidedDowntimeMetric: '₹34,80,000 saved this season via CBM triage'
};
