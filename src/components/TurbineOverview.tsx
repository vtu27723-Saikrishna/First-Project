import React, { useState } from 'react';
import { 
  Turbine, 
  SensorAlert, 
  TelemetryPoint 
} from '../types';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Gauge, 
  Zap, 
  Wind, 
  Activity, 
  Flame, 
  ShieldAlert, 
  ClipboardCheck, 
  Stethoscope, 
  History, 
  Sliders, 
  ChevronRight, 
  MapPin, 
  Cpu, 
  TrendingUp, 
  Radio,
  RotateCw
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine,
  LineChart,
  Line
} from 'recharts';

interface TurbineOverviewProps {
  turbine: Turbine;
  alerts: SensorAlert[];
  telemetry: TelemetryPoint[];
  onStartChecklist: () => void;
  onStartTriage: () => void;
  onViewHistory: () => void;
  onInjectFault: (faultType: 'vibration_spike' | 'temperature_overheat' | 'reset_healthy') => void;
  isLoading?: boolean;
}

export const TurbineOverview: React.FC<TurbineOverviewProps> = ({
  turbine,
  alerts,
  telemetry,
  onStartChecklist,
  onStartTriage,
  onViewHistory,
  onInjectFault,
  isLoading
}) => {
  const [activeChartMetric, setActiveChartMetric] = useState<'vibration' | 'temperature' | 'power'>('vibration');

  const criticalAlerts = alerts.filter(a => a.severity === 'critical');
  const majorAlerts = alerts.filter(a => a.severity === 'major');
  const minorAlerts = alerts.filter(a => a.severity === 'minor' || a.severity === 'info');

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* 1. Hero Card: Turbine Identification & Quick Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl relative overflow-hidden">
        {/* Subtle background ambient gradient */}
        <div className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-10 ${
          turbine.status === 'tripped'
            ? 'bg-rose-500'
            : turbine.status === 'derated'
            ? 'bg-amber-500'
            : 'bg-emerald-500'
        }`} />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          {/* Turbine Info */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-sm rounded-lg">
                {turbine.code}
              </span>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold uppercase flex items-center gap-1.5 border ${
                turbine.status === 'tripped'
                  ? 'bg-rose-950/80 text-rose-300 border-rose-700/80'
                  : turbine.status === 'derated'
                  ? 'bg-amber-950/80 text-amber-300 border-amber-700/80'
                  : 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  turbine.status === 'tripped' ? 'bg-rose-400 animate-ping' : turbine.status === 'derated' ? 'bg-amber-400' : 'bg-emerald-400'
                }`} />
                {turbine.status}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Installed {turbine.installationYear} • {turbine.ratedCapacityKw} kW Rated
              </span>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
                {turbine.name}
              </h2>
              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-400 mt-1">
                <span className="flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  Model: <strong className="text-slate-200">{turbine.model}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  {turbine.location}
                </span>
              </div>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
            <button
              onClick={onStartChecklist}
              className="flex-1 sm:flex-none px-4 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition transform active:scale-95"
              id="btn-start-checklist"
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Start Guided Checklist</span>
            </button>

            <button
              onClick={onStartTriage}
              className="flex-1 sm:flex-none px-4 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-600/20 flex items-center justify-center gap-2 transition transform active:scale-95"
              id="btn-run-triage"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Run Fault Triage</span>
            </button>

            <button
              onClick={onViewHistory}
              className="px-3.5 py-3 bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition"
              title="View History & Reports"
            >
              <History className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">History</span>
            </button>
          </div>
        </div>

        {/* Fault Simulator bar for testing edge cases */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-slate-300">SCADA Fault Injector:</span>
            <span className="text-[11px] text-slate-500">Test live condition triage responses</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onInjectFault('vibration_spike')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-rose-950 text-rose-300 hover:border-rose-700 border border-slate-700 rounded-lg text-[11px] font-mono transition"
            >
              + Spike Vibration (8.6 mm/s)
            </button>
            <button
              onClick={() => onInjectFault('temperature_overheat')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-amber-950 text-amber-300 hover:border-amber-700 border border-slate-700 rounded-lg text-[11px] font-mono transition"
            >
              + Overheat Bearings (89°C)
            </button>
            <button
              onClick={() => onInjectFault('reset_healthy')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-emerald-950 text-emerald-300 hover:border-emerald-700 border border-slate-700 rounded-lg text-[11px] font-mono transition flex items-center gap-1"
            >
              <RotateCw className="w-3 h-3" />
              Reset Healthy
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Live SCADA Telemetry Gauges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Vibration */}
        <div className={`p-4 rounded-xl border transition-all ${
          turbine.vibrationRmsMmS >= 5.5
            ? 'bg-rose-950/30 border-rose-700/60 text-rose-200'
            : turbine.vibrationRmsMmS >= 4.0
            ? 'bg-amber-950/30 border-amber-700/60 text-amber-200'
            : 'bg-slate-900 border-slate-800 text-slate-200'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold">CMS Vibration</span>
            <Activity className={`w-3.5 h-3.5 ${turbine.vibrationRmsMmS >= 5.5 ? 'text-rose-400' : 'text-emerald-400'}`} />
          </div>
          <div className="font-mono text-xl font-bold tracking-tight">
            {turbine.vibrationRmsMmS} <span className="text-xs font-normal text-slate-400">mm/s</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
            <span>ISO Limit: 5.5</span>
            {turbine.vibrationRmsMmS >= 5.5 && <span className="text-rose-400 font-bold">ALARM</span>}
          </div>
        </div>

        {/* Gearbox Temp */}
        <div className={`p-4 rounded-xl border transition-all ${
          turbine.gearboxTempC >= 80
            ? 'bg-rose-950/30 border-rose-700/60 text-rose-200'
            : turbine.gearboxTempC >= 75
            ? 'bg-amber-950/30 border-amber-700/60 text-amber-200'
            : 'bg-slate-900 border-slate-800 text-slate-200'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold">Gearbox Sump</span>
            <Flame className={`w-3.5 h-3.5 ${turbine.gearboxTempC >= 80 ? 'text-rose-400' : 'text-amber-400'}`} />
          </div>
          <div className="font-mono text-xl font-bold tracking-tight">
            {turbine.gearboxTempC}° <span className="text-xs font-normal text-slate-400">C</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Max: 80°C</span>
            {turbine.gearboxTempC >= 80 && <span className="text-rose-400 font-bold">HOT</span>}
          </div>
        </div>

        {/* Generator Temp */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold">Generator DE</span>
            <Flame className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="font-mono text-xl font-bold tracking-tight">
            {turbine.generatorTempC}° <span className="text-xs font-normal text-slate-400">C</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Nominal limit 75°C
          </div>
        </div>

        {/* Power Output */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold">Power Output</span>
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
          </div>
          <div className="font-mono text-xl font-bold tracking-tight">
            {turbine.currentPowerKw} <span className="text-xs font-normal text-slate-400">kW</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {Math.round((turbine.currentPowerKw / turbine.ratedCapacityKw) * 100)}% of {turbine.ratedCapacityKw}kW
          </div>
        </div>

        {/* Wind Speed */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold">Wind Speed</span>
            <Wind className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="font-mono text-xl font-bold tracking-tight">
            {turbine.windSpeedMs} <span className="text-xs font-normal text-slate-400">m/s</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Rotor: {turbine.rotorRpm} RPM
          </div>
        </div>

        {/* Hydraulic Pressure */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold">HPU Pressure</span>
            <Gauge className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="font-mono text-xl font-bold tracking-tight">
            {turbine.oilPressureBar} <span className="text-xs font-normal text-slate-400">bar</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Yaw: {turbine.yawAngleDeg}° SW
          </div>
        </div>
      </div>

      {/* 3. Real-Time SCADA Alerts List & Telemetry Trend Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Real-Time Sensor Alerts Feed (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <h3 className="font-bold text-sm text-white">Live SCADA Sensor Alerts</h3>
            </div>
            <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-slate-800 text-slate-300">
              {alerts.length} Active
            </span>
          </div>

          {alerts.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="text-xs text-slate-300 font-semibold">No Active Sensor Alerts</p>
              <p className="text-[11px] text-slate-500">Drivetrain telemetry is running within standard baseline thresholds.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3.5 rounded-xl border text-xs space-y-2 transition-all ${
                    alert.severity === 'critical'
                      ? 'bg-rose-950/40 border-rose-700/60 shadow-lg shadow-rose-950/20'
                      : alert.severity === 'major'
                      ? 'bg-amber-950/40 border-amber-700/60'
                      : 'bg-slate-850 border-slate-750'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wide border ${
                        alert.severity === 'critical'
                          ? 'bg-rose-900/80 text-rose-200 border-rose-600'
                          : alert.severity === 'major'
                          ? 'bg-amber-900/80 text-amber-200 border-amber-600'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {alert.severity}
                      </span>
                      <span className="font-semibold text-slate-200 truncate max-w-[200px]">{alert.component}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {alert.timestamp}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-100 text-xs">{alert.title}</h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{alert.description}</p>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/60 font-mono text-slate-400">
                    <span>Reading: <strong className="text-slate-200">{alert.value} {alert.unit}</strong></span>
                    <span>Threshold: <strong className="text-amber-300">{alert.threshold} {alert.unit}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: 2-Hour High-Resolution Telemetry Chart (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                2-Hour CMS Trend Telemetry
              </h3>
              <p className="text-xs text-slate-400">High-frequency sensor trend before triage</p>
            </div>

            {/* Metric Switcher */}
            <div className="flex bg-slate-800 p-1 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setActiveChartMetric('vibration')}
                className={`px-2.5 py-1 rounded-md transition ${
                  activeChartMetric === 'vibration'
                    ? 'bg-rose-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Vibration (mm/s)
              </button>
              <button
                onClick={() => setActiveChartMetric('temperature')}
                className={`px-2.5 py-1 rounded-md transition ${
                  activeChartMetric === 'temperature'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Temps (°C)
              </button>
              <button
                onClick={() => setActiveChartMetric('power')}
                className={`px-2.5 py-1 rounded-md transition ${
                  activeChartMetric === 'power'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Power (kW)
              </button>
            </div>
          </div>

          {/* Chart Display */}
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              {activeChartMetric === 'vibration' ? (
                <AreaChart data={telemetry} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="vibGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 'dataMax + 2']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                    labelStyle={{ color: '#cbd5e1', fontWeight: 'bold' }}
                  />
                  <ReferenceLine y={5.5} stroke="#fb7185" strokeDasharray="4 4" label={{ value: 'ISO 10816 Limit (5.5)', fill: '#fb7185', fontSize: 10 }} />
                  <Area type="monotone" dataKey="vibration" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#vibGradient)" name="Vibration (mm/s RMS)" />
                </AreaChart>
              ) : activeChartMetric === 'temperature' ? (
                <LineChart data={telemetry} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} domain={[40, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                  />
                  <ReferenceLine y={80} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Gearbox Alarm (80°C)', fill: '#f59e0b', fontSize: 10 }} />
                  <Line type="monotone" dataKey="gearboxTemp" stroke="#f59e0b" strokeWidth={2.5} name="Gearbox Temp (°C)" />
                  <Line type="monotone" dataKey="generatorTemp" stroke="#38bdf8" strokeWidth={2} name="Generator Temp (°C)" />
                </LineChart>
              ) : (
                <AreaChart data={telemetry} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="powerGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="powerKw" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#powerGradient)" name="Power (kW)" />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
            <span>Last SCADA Telemetry Packet: <strong className="text-slate-200">30 seconds ago</strong></span>
            <span className="text-emerald-400 font-mono font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Sampling: 100 Hz CMS
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
