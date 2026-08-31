import React, { useState, useEffect } from 'react';
import { Wind, QrCode, Shield, Activity, Wifi, WifiOff, Search, ChevronRight, User, AlertTriangle } from 'lucide-react';
import { TechnicianProfile, Turbine } from '../types';

interface HeaderProps {
  currentTurbine: Turbine | null;
  technician: TechnicianProfile | null;
  onScanQRClick: () => void;
  onSelectTurbine: (code: string) => void;
  onOpenFleet: () => void;
  activeView: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentTurbine,
  technician,
  onScanQRClick,
  onSelectTurbine,
  onOpenFleet,
  activeView
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSelectTurbine(searchQuery.trim().toUpperCase());
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 text-slate-100">
      {/* Top micro bar with Muppandal live SCADA status */}
      <div className="bg-slate-950 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-slate-850">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono">MUPPANDAL CMS LIVE</span>
          </div>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <span className="text-slate-400 hidden sm:inline">
            Sector Wind: <strong className="text-slate-200 font-mono">12.4 m/s SW</strong> • Grid: <strong className="text-slate-200 font-mono">50.02 Hz</strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {isOnline ? (
            <span className="inline-flex items-center gap-1 text-emerald-400">
              <Wifi className="w-3.5 h-3.5" />
              <span>Online SCADA Link</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-amber-400">
              <WifiOff className="w-3.5 h-3.5" />
              <span>Offline (Local CBM Cache)</span>
            </span>
          )}
          <span className="text-slate-500">|</span>
          <div className="flex items-center gap-1.5 text-slate-300">
            <User className="w-3.5 h-3.5 text-cyan-400" />
            <span className="truncate max-w-[140px] font-medium">{technician?.name || 'Engineer'}</span>
            <span className="hidden md:inline text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono border border-slate-700">
              {technician?.employeeId || 'ENG-4402'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={onOpenFleet}>
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-400/20">
            <Wind className="w-6 h-6 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                FieldFix <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-mono uppercase tracking-wider">CBM Edge</span>
              </h1>
            </div>
            <p className="text-xs text-slate-400">Muppandal Wind Farm • Tirunelveli</p>
          </div>
        </div>

        {/* Search & Action Bar */}
        <div className="flex items-center gap-2">
          {/* Quick Turbine Search */}
          <form onSubmit={handleSearchSubmit} className="relative hidden md:block">
            <input
              type="text"
              placeholder="Search code (e.g. MP-T04)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-56 bg-slate-800/80 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono uppercase"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          </form>

          {/* Mobile Search Toggle */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="md:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
            title="Search Turbine"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Fleet Overview Button */}
          <button
            onClick={onOpenFleet}
            className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
              activeView === 'fleet'
                ? 'bg-slate-800 text-emerald-400 border-emerald-500/40 shadow-sm'
                : 'bg-slate-850 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-700'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Fleet Turbines</span>
          </button>

          {/* QR Scan Button (Hero Primary Trigger) */}
          <button
            onClick={onScanQRClick}
            className="px-3.5 py-2 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all transform active:scale-95"
            id="btn-scan-turbine-qr"
          >
            <QrCode className="w-4 h-4" />
            <span>Scan Turbine QR</span>
          </button>
        </div>
      </div>

      {/* Mobile Search Bar Dropdown */}
      {isSearchOpen && (
        <div className="md:hidden px-4 pb-3 pt-1 border-t border-slate-800 bg-slate-900">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Enter Turbine Code (e.g. MP-T04)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono uppercase"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
            <button
              type="submit"
              className="px-3 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg"
            >
              Go
            </button>
          </form>
        </div>
      )}

      {/* Breadcrumb if turbine selected */}
      {currentTurbine && activeView !== 'fleet' && (
        <div className="bg-slate-850 px-4 py-2 text-xs flex items-center justify-between border-t border-slate-800 text-slate-400">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button onClick={onOpenFleet} className="hover:text-emerald-400 font-medium">
              Muppandal Wind Farm
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <span className="font-mono text-emerald-300 font-bold shrink-0">{currentTurbine.code}</span>
            <span className="hidden sm:inline text-slate-500 shrink-0">({currentTurbine.model})</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold uppercase ${
              currentTurbine.status === 'tripped'
                ? 'bg-rose-950 text-rose-300 border border-rose-800/80'
                : currentTurbine.status === 'derated'
                ? 'bg-amber-950 text-amber-300 border border-amber-800/80'
                : 'bg-emerald-950 text-emerald-300 border border-emerald-800/80'
            }`}>
              {currentTurbine.status}
            </span>
            {currentTurbine.criticalAlertsCount > 0 && (
              <span className="flex items-center gap-1 text-rose-400 text-[11px] font-mono">
                <AlertTriangle className="w-3 h-3" />
                {currentTurbine.criticalAlertsCount} Critical
              </span>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
