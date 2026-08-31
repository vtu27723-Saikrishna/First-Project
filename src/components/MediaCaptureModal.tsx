import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Mic, 
  Square, 
  Play, 
  Pause, 
  RotateCcw, 
  Check, 
  X, 
  Edit3, 
  ArrowUpRight, 
  Circle, 
  Square as RectIcon, 
  Trash2, 
  Upload, 
  Sparkles,
  Volume2
} from 'lucide-react';
import { MediaFile } from '../types';

interface MediaCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveMedia: (media: MediaFile) => void;
  turbineCode: string;
  stepId?: string;
  stepTitle?: string;
  mode?: 'photo' | 'audio' | 'both';
}

export const MediaCaptureModal: React.FC<MediaCaptureModalProps> = ({
  isOpen,
  onClose,
  onSaveMedia,
  turbineCode,
  stepId,
  stepTitle,
  mode = 'both'
}) => {
  const [activeType, setActiveType] = useState<'photo' | 'audio'>(mode === 'audio' ? 'audio' : 'photo');
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [annotationText, setAnnotationText] = useState('');
  
  // Annotation Canvas states
  const [drawTool, setDrawTool] = useState<'pen' | 'arrow' | 'rect' | 'circle'>('arrow');
  const [drawColor, setDrawColor] = useState<'#f43f5e' | '#eab308' | '#06b6d4' | '#10b981'>('#f43f5e');
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Audio Recording states
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const timerIntervalRef = useRef<any>(null);

  // Sample turbine default images for rapid demo
  const sampleStockPhotos = [
    { title: 'Gearbox Lip Seal Leak', url: 'https://images.unsplash.com/photo-1548337138-e87d889cc369?auto=format&fit=crop&w=700&q=80' },
    { title: 'High-Speed Shaft Coupling', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=700&q=80' },
    { title: 'Blade Leading Edge Crack', url: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=700&q=80' }
  ];

  // Start Video Stream
  useEffect(() => {
    if (isOpen && activeType === 'photo' && !capturedPhotoUrl) {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
          .then(stream => {
            streamRef.current = stream;
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
              videoRef.current.play();
            }
          })
          .catch(err => {
            console.warn('Webcam stream unavailable:', err);
          });
      }
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
  }, [isOpen, activeType, capturedPhotoUrl]);

  // Load photo onto drawing canvas
  useEffect(() => {
    if (capturedPhotoUrl && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = capturedPhotoUrl;
      img.onload = () => {
        canvas.width = 640;
        canvas.height = 480;
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
      };
    }
  }, [capturedPhotoUrl]);

  if (!isOpen) return null;

  // Capture Snapshot from video stream
  const handleSnapPhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const offscreen = document.createElement('canvas');
      offscreen.width = 640;
      offscreen.height = 480;
      const ctx = offscreen.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, offscreen.width, offscreen.height);
        const dataUrl = offscreen.toDataURL('image/jpeg', 0.85);
        setCapturedPhotoUrl(dataUrl);
      }
    } else {
      setCapturedPhotoUrl(sampleStockPhotos[0].url);
    }
  };

  // Upload file from disk
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCapturedPhotoUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Canvas Drawing Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    setIsDrawing(true);
    setStartPos({ x, y });

    const ctx = canvas.getContext('2d');
    if (ctx && drawTool === 'pen') {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.strokeStyle = drawColor;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPos || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    const ctx = canvas.getContext('2d');
    if (ctx && drawTool === 'pen') {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPos || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const endX = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const endY = ((e.clientY - rect.top) / rect.height) * canvas.height;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.strokeStyle = drawColor;
      ctx.fillStyle = drawColor;
      ctx.lineWidth = 4;

      if (drawTool === 'arrow') {
        // Draw arrow line
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Draw arrowhead
        const angle = Math.atan2(endY - startPos.y, endX - startPos.x);
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(endX - 15 * Math.cos(angle - Math.PI / 6), endY - 15 * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(endX - 15 * Math.cos(angle + Math.PI / 6), endY - 15 * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();
      } else if (drawTool === 'rect') {
        ctx.strokeRect(startPos.x, startPos.y, endX - startPos.x, endY - startPos.y);
      } else if (drawTool === 'circle') {
        const radius = Math.sqrt(Math.pow(endX - startPos.x, 2) + Math.pow(endY - startPos.y, 2));
        ctx.beginPath();
        ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      }
    }

    setIsDrawing(false);
    setStartPos(null);
  };

  // Audio Recording Handlers
  const handleStartAudioRecord = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioBlobUrl(url);
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start();
      setIsRecordingAudio(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone permission or support issue:', err);
      // Generate synthetic sound file for demo
      setIsRecordingAudio(true);
      setTimeout(() => {
        setIsRecordingAudio(false);
        setAudioBlobUrl('mock-bearing-acoustic-sample.mp3');
      }, 4000);
    }
  };

  const handleStopAudioRecord = () => {
    if (mediaRecorderRef.current && isRecordingAudio) {
      mediaRecorderRef.current.stop();
      setIsRecordingAudio(false);
      clearInterval(timerIntervalRef.current);
    }
  };

  const handleFinalSave = () => {
    if (activeType === 'photo') {
      let finalUrl = capturedPhotoUrl || sampleStockPhotos[0].url;
      if (canvasRef.current) {
        finalUrl = canvasRef.current.toDataURL('image/jpeg', 0.85);
      }
      onSaveMedia({
        id: `med-${Date.now()}`,
        url: finalUrl,
        type: 'photo',
        caption: caption || `${turbineCode} Field Photo Evidence`,
        annotation: annotationText || `Annotated with ${drawTool} mark on drivetrain component`,
        timestamp: new Date().toLocaleTimeString(),
        stepId
      });
    } else {
      onSaveMedia({
        id: `aud-${Date.now()}`,
        url: audioBlobUrl || 'mock-bearing-noise.mp3',
        type: 'audio',
        caption: caption || `${turbineCode} Bearing Acoustic Noise Sample (${recordingSeconds}s)`,
        annotation: annotationText || 'Acoustic sample captured for CMS spectral validation',
        timestamp: new Date().toLocaleTimeString(),
        stepId
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Camera className="w-5 h-5 text-emerald-400" />
              Media Capture & Field Evidence
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Turbine: <strong className="text-emerald-300">{turbineCode}</strong> {stepTitle ? `• Step: ${stepTitle}` : ''}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="grid grid-cols-2 border-b border-slate-800 bg-slate-950/40 p-1.5 text-xs font-semibold">
          <button
            onClick={() => setActiveType('photo')}
            className={`py-2 rounded-lg flex items-center justify-center gap-2 transition ${
              activeType === 'photo' ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Photo / Damage Annotation</span>
          </button>
          <button
            onClick={() => setActiveType('audio')}
            className={`py-2 rounded-lg flex items-center justify-center gap-2 transition ${
              activeType === 'audio' ? 'bg-slate-800 text-cyan-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>Acoustic Noise Recorder</span>
          </button>
        </div>

        {/* Main Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {activeType === 'photo' ? (
            <div className="space-y-4">
              {!capturedPhotoUrl ? (
                /* Live Camera Preview */
                <div className="space-y-3">
                  <div className="relative w-full aspect-video rounded-xl bg-slate-950 border-2 border-slate-800 overflow-hidden flex items-center justify-center">
                    <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-3">
                      <button
                        onClick={handleSnapPhoto}
                        className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Snap Photo</span>
                      </button>
                    </div>
                  </div>

                  {/* Stock sample images */}
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                    <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      Or select a sample field defect photo:
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {sampleStockPhotos.map((photo, i) => (
                        <button
                          key={i}
                          onClick={() => setCapturedPhotoUrl(photo.url)}
                          className="group relative rounded-lg overflow-hidden border border-slate-700 hover:border-emerald-400 transition aspect-video"
                        >
                          <img src={photo.url} alt={photo.title} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-slate-950/60 group-hover:bg-slate-950/20 p-1 flex items-end">
                            <span className="text-[10px] text-white font-medium truncate">{photo.title}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* File Upload option */}
                  <div className="flex items-center justify-center">
                    <label className="cursor-pointer text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1.5 underline">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload image from device</span>
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>
                </div>
              ) : (
                /* Annotation Canvas Area */
                <div className="space-y-3">
                  {/* Annotation Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setDrawTool('arrow')}
                        className={`p-1.5 rounded-lg border ${drawTool === 'arrow' ? 'bg-slate-800 border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400'}`}
                        title="Draw Arrow"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDrawTool('rect')}
                        className={`p-1.5 rounded-lg border ${drawTool === 'rect' ? 'bg-slate-800 border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400'}`}
                        title="Draw Rectangle"
                      >
                        <RectIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDrawTool('circle')}
                        className={`p-1.5 rounded-lg border ${drawTool === 'circle' ? 'bg-slate-800 border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400'}`}
                        title="Draw Circle"
                      >
                        <Circle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDrawTool('pen')}
                        className={`p-1.5 rounded-lg border ${drawTool === 'pen' ? 'bg-slate-800 border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400'}`}
                        title="Freehand Pen"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Color Picker */}
                    <div className="flex items-center gap-1.5">
                      {[
                        { color: '#f43f5e', name: 'Red Alert' },
                        { color: '#eab308', name: 'Yellow Warning' },
                        { color: '#06b6d4', name: 'Cyan Info' },
                        { color: '#10b981', name: 'Green OK' }
                      ].map(c => (
                        <button
                          key={c.color}
                          onClick={() => setDrawColor(c.color as any)}
                          className={`w-5 h-5 rounded-full transition transform ${drawColor === c.color ? 'scale-125 ring-2 ring-white ring-offset-1 ring-offset-slate-900' : 'opacity-70 hover:opacity-100'}`}
                          style={{ backgroundColor: c.color }}
                          title={c.name}
                        />
                      ))}
                    </div>

                    <button
                      onClick={() => setCapturedPhotoUrl(null)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 text-[11px] flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Retake
                    </button>
                  </div>

                  {/* Interactive Drawing Canvas */}
                  <div className="relative w-full aspect-video rounded-xl bg-slate-950 border border-slate-700 overflow-hidden cursor-crosshair">
                    <canvas
                      ref={canvasRef}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 text-center">
                    Click and drag across the image to draw arrows or boxes over defect locations.
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Audio Recorder View */
            <div className="space-y-5 text-center py-4">
              <div className="w-24 h-24 mx-auto rounded-full bg-slate-950 border-4 border-slate-800 flex items-center justify-center relative">
                {isRecordingAudio ? (
                  <div className="relative flex items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-16 w-16 rounded-full bg-rose-400 opacity-60"></span>
                    <Square className="w-8 h-8 text-rose-500 relative cursor-pointer" onClick={handleStopAudioRecord} />
                  </div>
                ) : audioBlobUrl ? (
                  <Volume2 className="w-10 h-10 text-emerald-400" />
                ) : (
                  <Mic className="w-10 h-10 text-cyan-400" />
                )}
              </div>

              <div>
                <div className="text-sm font-bold text-white">
                  {isRecordingAudio
                    ? `Recording Audio (${recordingSeconds}s)...`
                    : audioBlobUrl
                    ? 'Acoustic Sample Captured'
                    : 'Record Bearing / Gearbox Noise'}
                </div>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                  Hold microphone close to nacelle drivetrain housing to capture acoustic vibration frequency.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-3">
                {!isRecordingAudio && !audioBlobUrl && (
                  <button
                    onClick={handleStartAudioRecord}
                    className="px-5 py-2.5 bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-rose-500/20"
                  >
                    <Mic className="w-4 h-4" />
                    <span>Start 10s Recording</span>
                  </button>
                )}

                {isRecordingAudio && (
                  <button
                    onClick={handleStopAudioRecord}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-750 text-white font-bold rounded-xl text-xs flex items-center gap-2 border border-slate-600"
                  >
                    <Square className="w-4 h-4 text-rose-400" />
                    <span>Stop Recording</span>
                  </button>
                )}

                {audioBlobUrl && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const audio = new Audio(audioBlobUrl);
                        audio.play();
                      }}
                      className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5"
                    >
                      <Play className="w-4 h-4" />
                      <span>Play Sample</span>
                    </button>
                    <button
                      onClick={() => setAudioBlobUrl(null)}
                      className="px-3 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl hover:bg-slate-700"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Caption & Annotation Notes Input */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="text-xs font-semibold text-slate-300">Observation Caption & Notes:</label>
            <input
              type="text"
              placeholder="e.g. Oil seal seepage near High-Speed Shaft lip collar"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleFinalSave}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
          >
            <Check className="w-4 h-4" />
            <span>Attach Evidence to Record</span>
          </button>
        </div>
      </div>
    </div>
  );
};
