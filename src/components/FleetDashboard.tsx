import React, { useState } from 'react';
import { Turbine } from '../types';
import { MUPPANDAL_FARM_FACTS } from '../data/mockData';
import { 
  Wind, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  Search, 
  QrCode, 
  Gauge, 
  Zap, 
  TrendingUp, 
  ShieldAlert, 
  ChevronRight,
  Sparkles,
  DollarSign
} from 'lucide-react';

interface FleetDashboardProps {
  turbines: Turbine[];
  onSelectTurbine: (turbineCode: string) => void;
  onScanQRClick: () => void;
}

export const FleetDashboard: React.FC<FleetDashboardProps> = ({
  turbines,
  onSelectTurbine,
  onScanQRClick
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const totalCapacity = turbines.reduce((acc, t) => acc + t.ratedCapacityKw, 0);
  const currentGeneration = turbines.reduce((acc, t) => acc + t.currentPowerKw, 0);
  const criticalCount = turbines.reduce((acc, t) => acc + t.criticalAlertsCount, 0);
  const trippedCount = turbines.filter(t => t.status === 'tripped').length;
  const deratedCount = turbines.filter(t => t.status === 'derated').length;

  const filteredTurbines = turbines.filter(t => {
    const matchesStatus =
      filterStatus === 'all'
        ? true
        : filterStatus === 'critical'
        ? t.criticalAlertsCount > 0 || t.status === 'tripped'
        : filterStatus === 'derated'
        ? t.status === 'derated'
        : filterStatus === 'running'
        ? t.status === 'running'
        : true;

    const matchesSearch =
      t.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.model.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* 1. Muppandal Wind Farm Fleet Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>TIRUNELVELI SECTOR SCADA ONLINE</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Muppandal Wind Farm Fleet Monitor
            </h2>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Real-time Condition-Based Maintenance (CBM) telemetry across Muppandal Pass, Perungudi Valley, and Aralvaimozhi Ridge.
            </p>
          </div>

          {/* Quick Scan Primary CTA */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onScanQRClick}
              className="px-5 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-xl shadow-emerald-500/20 flex items-center gap-2.5 transition transform active:scale-95"
            >
              <QrCode className="w-5 h-5" />
              <span>Scan Turbine QR Tag</span>
            </button>
          </div>
        </div>

        {/* CBM Impact Banner */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Fleet Power</div>
            <div className="font-mono text-base font-bold text-white mt-0.5">
              {(currentGeneration / 1000).toFixed(1)} <span className="text-xs text-slate-400">/ {(totalCapacity / 1000).toFixed(1)} MW</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Avoided Downtime Savings</div>
            <div className="font-mono text-base font-bold text-emerald-400 mt-0.5">
              ₹34.8 Lakhs <span className="text-[10px] text-slate-500 font-sans">(CBM vs Calendar)</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Active Critical Alerts</div>
            <div className="font-mono text-base font-bold text-rose-400 mt-0.5 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>{criticalCount} Critical</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Downtime Cost Rate</div>
            <div className="font-mono text-base font-bold text-amber-300 mt-0.5">
              ₹50,000 / hr <span className="text-[10px] text-slate-500 font-sans">(Tirunelveli grid)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status Pills */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-semibold overflow-x-auto">
          {[
            { id: 'all', label: `All Turbines (${turbines.length})` },
            { id: 'critical', label: `Critical / Tripped (${criticalCount + trippedCount})` },
            { id: 'derated', label: `Derated (${deratedCount})` },
            { id: 'running', label: `Healthy Running` }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                filterStatus === f.id
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <input
            type="text"
            placeholder="Search code or model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase font-mono"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* 3. Turbines Fleet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTurbines.map(turbine => {
          const isCritical = turbine.criticalAlertsCount > 0 || turbine.status === 'tripped';
          const isDerated = turbine.status === 'derated';

          return (
            <div
              key={turbine.id}
              onClick={() => onSelectTurbine(turbine.code)}
              className={`rounded-2xl border p-5 shadow-xl transition-all cursor-pointer group hover:scale-[1.01] ${
                isCritical
                  ? 'bg-slate-900/90 border-rose-800/80 hover:border-rose-500 shadow-rose-950/20'
                  : isDerated
                  ? 'bg-slate-900/90 border-amber-800/80 hover:border-amber-500'
                  : 'bg-slate-900/90 border-slate-800 hover:border-emerald-500'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-emerald-400 group-hover:text-emerald-300">
                      {turbine.code}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                      turbine.status === 'tripped'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : turbine.status === 'derated'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}>
                      {turbine.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm mt-1">{turbine.name}</h4>
                  <p className="text-xs text-slate-400">{turbine.model}</p>
                </div>

                <div className="p-2 rounded-xl bg-slate-800/80 text-slate-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>

              {/* Live Telemetry Matrix */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-800 text-xs font-mono">
                <div className="p-2 bg-slate-950 rounded-lg">
                  <div className="text-[10px] text-slate-500 font-sans">CMS Vibration</div>
                  <div className={`font-bold ${turbine.vibrationRmsMmS >= 5.5 ? 'text-rose-400' : 'text-slate-200'}`}>
                    {turbine.vibrationRmsMmS} <span className="text-[9px] font-normal">mm/s</span>
                  </div>
                </div>

                <div className="p-2 bg-slate-950 rounded-lg">
                  <div className="text-[10px] text-slate-500 font-sans">Gearbox Sump</div>
                  <div className={`font-bold ${turbine.gearboxTempC >= 80 ? 'text-amber-400' : 'text-slate-200'}`}>
                    {turbine.gearboxTempC}° <span className="text-[9px] font-normal">C</span>
                  </div>
                </div>

                <div className="p-2 bg-slate-950 rounded-lg">
                  <div className="text-[10px] text-slate-500 font-sans">Power Load</div>
                  <div className="font-bold text-slate-200">
                    {turbine.currentPowerKw} <span className="text-[9px] font-normal">kW</span>
                  </div>
                </div>
              </div>

              {/* Bottom Alert Status */}
              <div className="mt-4 flex items-center justify-between text-xs pt-2">
                <span className="text-slate-400 text-[11px]">
                  Last Audited: <strong className="text-slate-300">{turbine.lastInspectionDate}</strong>
                </span>

                {turbine.criticalAlertsCount > 0 ? (
                  <span className="flex items-center gap-1 text-rose-400 font-bold text-[11px] font-mono">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {turbine.criticalAlertsCount} Critical Alert
                  </span>
                ) : turbine.activeAlertsCount > 0 ? (
                  <span className="text-amber-400 font-mono text-[11px]">
                    {turbine.activeAlertsCount} Alerts
                  </span>
                ) : (
                  <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Optimal
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
