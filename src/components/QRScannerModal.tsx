import React, { useState, useEffect, useRef } from 'react';
import { QrCode, Camera, Upload, X, CheckCircle2, AlertCircle, RefreshCw, Zap, Shield, Sparkles } from 'lucide-react';
import QRCode from 'qrcode';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (turbineCode: string) => void;
}

const PRESET_TURBINES = [
  { code: 'MP-T04', name: 'MP-T04 (Suzlon 2.1MW)', tag: 'Critical Alert', badgeColor: 'bg-rose-950 text-rose-300 border-rose-800' },
  { code: 'MP-T42', name: 'MP-T42 (Suzlon S97)', tag: 'Tripped / High Vib', badgeColor: 'bg-rose-950 text-rose-300 border-rose-800' },
  { code: 'MP-T28', name: 'MP-T28 (Gamesa 850kW)', tag: 'Minor Yaw Alert', badgeColor: 'bg-amber-950 text-amber-300 border-amber-800' },
  { code: 'MP-T12', name: 'MP-T12 (Vestas V82)', tag: 'Healthy Baseline', badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-800' }
];

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'presets' | 'generate'>('camera');
  const [manualCode, setManualCode] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [generatedQRUrl, setGeneratedQRUrl] = useState<string>('');
  const [selectedGenCode, setSelectedGenCode] = useState('MP-T04');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Generate QR code data URL
  useEffect(() => {
    QRCode.toDataURL(`https://fieldfix.app/turbine/${selectedGenCode}`, {
      width: 260,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    })
      .then(url => setGeneratedQRUrl(url))
      .catch(err => console.error(err));
  }, [selectedGenCode]);

  // Start Camera Stream
  const startCamera = async () => {
    setCameraError(null);
    setIsScanning(true);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } else {
        setCameraError('Camera API not accessible in this environment. Please use quick QR tags or manual code.');
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError('Camera permission not granted or device camera unavailable. Use preset turbine tags below to test instantly.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScanSuccess(manualCode.trim().toUpperCase());
      onClose();
    }
  };

  const handleSelectPreset = (code: string) => {
    onScanSuccess(code);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Turbine QR Code Scanner</h3>
              <p className="text-xs text-slate-400">Scan tower base QR or select Muppandal asset</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="grid grid-cols-3 border-b border-slate-800 bg-slate-950/30 p-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('camera')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
              activeTab === 'camera'
                ? 'bg-slate-800 text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Camera Scanner</span>
          </button>
          <button
            onClick={() => setActiveTab('presets')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
              activeTab === 'presets'
                ? 'bg-slate-800 text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Quick QR Badges</span>
          </button>
          <button
            onClick={() => setActiveTab('generate')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
              activeTab === 'generate'
                ? 'bg-slate-800 text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Tower Tag View</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {activeTab === 'camera' && (
            <div className="space-y-4">
              {/* Camera Stream Viewfinder */}
              <div className="relative w-full aspect-square max-h-64 rounded-xl overflow-hidden bg-slate-950 border-2 border-slate-800 flex items-center justify-center">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />

                {/* Viewfinder Target Reticle */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
                  <div className="relative w-44 h-44 border-2 border-emerald-400/80 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.3)] flex flex-col justify-between p-2">
                    <div className="flex justify-between">
                      <div className="w-4 h-4 border-t-2 border-l-2 border-emerald-400 -mt-1 -ml-1"></div>
                      <div className="w-4 h-4 border-t-2 border-r-2 border-emerald-400 -mt-1 -mr-1"></div>
                    </div>
                    {/* Animated scanning laser line */}
                    <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse shadow-sm shadow-emerald-400"></div>
                    <div className="flex justify-between">
                      <div className="w-4 h-4 border-b-2 border-l-2 border-emerald-400 -mb-1 -ml-1"></div>
                      <div className="w-4 h-4 border-b-2 border-r-2 border-emerald-400 -mb-1 -mr-1"></div>
                    </div>
                  </div>
                </div>

                {cameraError && (
                  <div className="absolute inset-0 bg-slate-950/90 p-4 flex flex-col items-center justify-center text-center space-y-3">
                    <AlertCircle className="w-8 h-8 text-amber-400" />
                    <p className="text-xs text-slate-300 max-w-xs">{cameraError}</p>
                    <button
                      onClick={() => setActiveTab('presets')}
                      className="px-3 py-1.5 bg-emerald-500 text-slate-950 text-xs font-bold rounded-lg"
                    >
                      Click a Preset QR Code
                    </button>
                  </div>
                )}
              </div>

              {/* Instant Test Triggers */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Simulate Camera Scanning Turbines:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_TURBINES.map(t => (
                    <button
                      key={t.code}
                      onClick={() => handleSelectPreset(t.code)}
                      className="text-left p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 hover:border-emerald-500/50 border border-slate-700/60 transition group"
                    >
                      <div className="font-mono font-bold text-xs text-slate-200 group-hover:text-emerald-300">{t.code}</div>
                      <div className="text-[10px] text-slate-400 truncate">{t.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'presets' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Click any of the Muppandal Wind Farm turbine badges below to simulate scanning its physical QR tag:
              </p>
              <div className="space-y-2.5">
                {PRESET_TURBINES.map(t => (
                  <button
                    key={t.code}
                    onClick={() => handleSelectPreset(t.code)}
                    className="w-full text-left p-3.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/60 transition flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-800 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition">
                        <QrCode className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-mono font-bold text-sm text-white group-hover:text-emerald-300">{t.code}</div>
                        <div className="text-xs text-slate-400">{t.name}</div>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold border ${t.badgeColor}`}>
                      {t.tag}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'generate' && (
            <div className="space-y-4 text-center">
              <p className="text-xs text-slate-400">
                Physical CBM QR Tag affixed to turbine tower access door at Muppandal:
              </p>

              <div className="flex justify-center gap-2">
                {PRESET_TURBINES.map(t => (
                  <button
                    key={t.code}
                    onClick={() => setSelectedGenCode(t.code)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition ${
                      selectedGenCode === t.code
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {t.code}
                  </button>
                ))}
              </div>

              {generatedQRUrl && (
                <div className="inline-block p-4 bg-white rounded-2xl shadow-xl border-4 border-slate-800">
                  <img src={generatedQRUrl} alt={`QR for ${selectedGenCode}`} className="w-48 h-48 mx-auto" />
                  <div className="mt-2 text-slate-950 font-mono font-black text-sm tracking-wider">
                    {selectedGenCode}
                  </div>
                  <div className="text-[10px] text-slate-600 font-sans">
                    MUPPANDAL WIND ENERGY HUB
                  </div>
                </div>
              )}

              <div>
                <button
                  onClick={() => handleSelectPreset(selectedGenCode)}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Inspect This Turbine ({selectedGenCode})</span>
                </button>
              </div>
            </div>
          )}

          {/* Manual Input Fallback */}
          <div className="pt-2 border-t border-slate-800">
            <form onSubmit={handleManualSubmit} className="space-y-2">
              <label className="text-xs font-semibold text-slate-400">Or enter Turbine ID manually if QR is damaged:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. MP-T04 or MP-T12"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono uppercase"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs rounded-xl border border-slate-600 transition"
                >
                  Open
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
