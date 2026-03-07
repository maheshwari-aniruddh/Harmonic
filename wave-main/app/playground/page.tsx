'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

type InstrumentType = 'piano' | 'drums' | 'xylophone' | 'pads';

interface AudioContextType {
  context: AudioContext | null;
  gainNode: GainNode | null;
}

// Piano notes frequencies
const pianoNotes: { [key: string]: number } = {
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23,
  G4: 392.00, A4: 440.00, B4: 493.88, C5: 523.25,
};

// Drum sounds (we'll use oscillators to simulate)
const drumSounds = ['Kick', 'Snare', 'Hi-Hat', 'Tom', 'Crash', 'Clap', 'Rim', 'Cowbell'];

// Xylophone notes
const xylophoneNotes = ['C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B5', 'C6'];

// Pad colors and names
const padData = [
  { name: 'Bass', color: 'from-red-500 to-orange-500' },
  { name: 'Lead', color: 'from-blue-500 to-purple-500' },
  { name: 'Chord', color: 'from-green-500 to-teal-500' },
  { name: 'FX', color: 'from-pink-500 to-rose-500' },
  { name: 'Vocal', color: 'from-yellow-500 to-amber-500' },
  { name: 'Synth', color: 'from-indigo-500 to-violet-500' },
  { name: 'Perc', color: 'from-cyan-500 to-blue-500' },
  { name: 'Ambient', color: 'from-emerald-500 to-lime-500' },
];

export default function PlaygroundPage() {
  const router = useRouter();
  const [selectedInstrument, setSelectedInstrument] = useState<InstrumentType>('piano');
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [isHandTrackingEnabled, setIsHandTrackingEnabled] = useState(false);
  const [handPosition, setHandPosition] = useState<{ x: number; y: number } | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.5);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContextType>({ context: null, gainNode: null });
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize audio context
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const context = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const gainNode = context.createGain();
      gainNode.connect(context.destination);
      gainNode.gain.value = volume;
      audioContextRef.current = { context, gainNode };
    }
    
    return () => {
      if (audioContextRef.current.context) {
        audioContextRef.current.context.close();
      }
    };
  }, []);

  // Update volume
  useEffect(() => {
    if (audioContextRef.current.gainNode) {
      audioContextRef.current.gainNode.gain.value = volume;
    }
  }, [volume]);

  // Play a note
  const playNote = useCallback((frequency: number, duration: number = 0.3, type: OscillatorType = 'sine') => {
    const { context, gainNode } = audioContextRef.current;
    if (!context || !gainNode) return;

    const oscillator = context.createOscillator();
    const noteGain = context.createGain();
    
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    
    noteGain.gain.setValueAtTime(0.3, context.currentTime);
    noteGain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + duration);
    
    oscillator.connect(noteGain);
    noteGain.connect(gainNode);
    
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + duration);
  }, []);

  // Play drum sound
  const playDrum = useCallback((drumIndex: number) => {
    const { context, gainNode } = audioContextRef.current;
    if (!context || !gainNode) return;

    const oscillator = context.createOscillator();
    const noteGain = context.createGain();
    
    // Different sounds for different drums
    const drumConfigs = [
      { freq: 60, duration: 0.2, type: 'sine' as OscillatorType },   // Kick
      { freq: 200, duration: 0.1, type: 'triangle' as OscillatorType }, // Snare
      { freq: 800, duration: 0.05, type: 'square' as OscillatorType },  // Hi-Hat
      { freq: 150, duration: 0.15, type: 'sine' as OscillatorType },  // Tom
      { freq: 400, duration: 0.3, type: 'sawtooth' as OscillatorType }, // Crash
      { freq: 300, duration: 0.1, type: 'square' as OscillatorType },   // Clap
      { freq: 500, duration: 0.05, type: 'triangle' as OscillatorType }, // Rim
      { freq: 700, duration: 0.2, type: 'square' as OscillatorType },   // Cowbell
    ];
    
    const config = drumConfigs[drumIndex];
    oscillator.type = config.type;
    oscillator.frequency.value = config.freq;
    
    noteGain.gain.setValueAtTime(0.5, context.currentTime);
    noteGain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + config.duration);
    
    oscillator.connect(noteGain);
    noteGain.connect(gainNode);
    
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + config.duration);
  }, []);

  // Handle key press
  const handleKeyPress = useCallback((key: string, index: number) => {
    setActiveKeys(prev => new Set(prev).add(key));
    
    if (selectedInstrument === 'piano') {
      const noteFreq = pianoNotes[Object.keys(pianoNotes)[index]];
      if (noteFreq) playNote(noteFreq, 0.5, 'sine');
    } else if (selectedInstrument === 'drums') {
      playDrum(index);
    } else if (selectedInstrument === 'xylophone') {
      const freq = 523.25 * Math.pow(2, index / 12);
      playNote(freq, 0.8, 'triangle');
    } else if (selectedInstrument === 'pads') {
      const baseFreq = 130.81 * Math.pow(2, index / 4);
      playNote(baseFreq, 1.5, 'sawtooth');
    }
    
    setTimeout(() => {
      setActiveKeys(prev => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }, 200);
  }, [selectedInstrument, playNote, playDrum]);

  // Start hand tracking
  const startHandTracking = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 640, height: 480 } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsHandTrackingEnabled(true);
        setCameraError(null);
        
        // Start simple motion detection
        startMotionDetection();
      }
    } catch (error) {
      console.error('Camera error:', error);
      setCameraError('Could not access camera. Please allow camera permissions.');
    }
  };

  // Stop hand tracking
  const stopHandTracking = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsHandTrackingEnabled(false);
    setHandPosition(null);
  };

  // Simple motion detection (simulates hand tracking)
  const startMotionDetection = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let previousFrame: ImageData | null = null;

    const detectMotion = () => {
      if (!video.paused && !video.ended) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const currentFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        if (previousFrame) {
          // Find the area with most motion (simulating hand detection)
          let maxMotionX = 0;
          let maxMotionY = 0;
          let maxMotion = 0;
          
          for (let y = 0; y < canvas.height; y += 20) {
            for (let x = 0; x < canvas.width; x += 20) {
              const i = (y * canvas.width + x) * 4;
              const diff = Math.abs(currentFrame.data[i] - previousFrame.data[i]) +
                          Math.abs(currentFrame.data[i + 1] - previousFrame.data[i + 1]) +
                          Math.abs(currentFrame.data[i + 2] - previousFrame.data[i + 2]);
              
              if (diff > maxMotion && diff > 50) {
                maxMotion = diff;
                maxMotionX = x;
                maxMotionY = y;
              }
            }
          }
          
          if (maxMotion > 50) {
            // Mirror the x position since webcam is mirrored
            setHandPosition({ 
              x: (1 - maxMotionX / canvas.width) * 100, 
              y: (maxMotionY / canvas.height) * 100 
            });
          }
        }
        
        previousFrame = currentFrame;
      }
      
      animationFrameRef.current = requestAnimationFrame(detectMotion);
    };
    
    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      detectMotion();
    };
  };

  // Check if hand is over a key
  useEffect(() => {
    if (!handPosition || !isHandTrackingEnabled) return;
    
    const keyCount = selectedInstrument === 'piano' ? 8 : 8;
    const keyWidth = 100 / keyCount;
    const keyIndex = Math.floor(handPosition.x / keyWidth);
    
    if (keyIndex >= 0 && keyIndex < keyCount && handPosition.y > 50) {
      const keyId = `key-${keyIndex}`;
      if (!activeKeys.has(keyId)) {
        handleKeyPress(keyId, keyIndex);
      }
    }
  }, [handPosition, isHandTrackingEnabled, selectedInstrument, activeKeys, handleKeyPress]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopHandTracking();
    };
  }, []);

  const instruments: { type: InstrumentType; name: string; icon: string }[] = [
    { type: 'piano', name: 'Piano', icon: '🎹' },
    { type: 'drums', name: 'Drums', icon: '🥁' },
    { type: 'xylophone', name: 'Xylophone', icon: '🎵' },
    { type: 'pads', name: 'Beat Pads', icon: '🎛️' },
  ];

  const renderPiano = () => (
    <div className="flex gap-1 justify-center">
      {Object.keys(pianoNotes).map((note, index) => {
        const isActive = activeKeys.has(`key-${index}`);
        const isBlackKey = note.includes('#');
        return (
          <button
            key={note}
            onClick={() => handleKeyPress(`key-${index}`, index)}
            className={`relative transition-all duration-100 ${
              isBlackKey
                ? `w-10 h-32 -mx-3 z-10 rounded-b-lg ${isActive ? 'bg-gray-600' : 'bg-gray-900'}`
                : `w-16 h-48 rounded-b-xl ${isActive ? 'bg-cyan-200' : 'bg-white'}`
            } ${isActive ? 'translate-y-1 shadow-inner' : 'shadow-lg'}`}
          >
            <span className={`absolute bottom-3 left-1/2 -translate-x-1/2 text-sm font-medium ${isBlackKey ? 'text-white' : 'text-gray-600'}`}>
              {note}
            </span>
          </button>
        );
      })}
    </div>
  );

  const renderDrums = () => (
    <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
      {drumSounds.map((drum, index) => {
        const isActive = activeKeys.has(`key-${index}`);
        const colors = [
          'from-red-500 to-red-600',
          'from-orange-500 to-orange-600',
          'from-yellow-500 to-yellow-600',
          'from-green-500 to-green-600',
          'from-blue-500 to-blue-600',
          'from-indigo-500 to-indigo-600',
          'from-purple-500 to-purple-600',
          'from-pink-500 to-pink-600',
        ];
        return (
          <button
            key={drum}
            onClick={() => handleKeyPress(`key-${index}`, index)}
            className={`aspect-square rounded-full bg-gradient-to-br ${colors[index]} flex items-center justify-center text-white font-bold text-lg shadow-lg transition-all ${
              isActive ? 'scale-90 shadow-inner brightness-75' : 'hover:scale-105'
            }`}
          >
            {drum}
          </button>
        );
      })}
    </div>
  );

  const renderXylophone = () => (
    <div className="flex gap-2 justify-center items-end">
      {xylophoneNotes.map((note, index) => {
        const isActive = activeKeys.has(`key-${index}`);
        const height = 200 - index * 15;
        const colors = [
          'from-red-400 to-red-500',
          'from-orange-400 to-orange-500',
          'from-yellow-400 to-yellow-500',
          'from-green-400 to-green-500',
          'from-cyan-400 to-cyan-500',
          'from-blue-400 to-blue-500',
          'from-indigo-400 to-indigo-500',
          'from-purple-400 to-purple-500',
        ];
        return (
          <button
            key={note}
            onClick={() => handleKeyPress(`key-${index}`, index)}
            style={{ height: `${height}px` }}
            className={`w-14 rounded-lg bg-gradient-to-b ${colors[index]} flex items-end justify-center pb-3 text-white font-bold shadow-lg transition-all ${
              isActive ? 'scale-95 brightness-125' : 'hover:brightness-110'
            }`}
          >
            {note}
          </button>
        );
      })}
    </div>
  );

  const renderPads = () => (
    <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
      {padData.map((pad, index) => {
        const isActive = activeKeys.has(`key-${index}`);
        return (
          <button
            key={pad.name}
            onClick={() => handleKeyPress(`key-${index}`, index)}
            className={`aspect-square rounded-2xl bg-gradient-to-br ${pad.color} flex items-center justify-center text-white font-bold text-lg shadow-lg transition-all ${
              isActive ? 'scale-95 ring-4 ring-white/50' : 'hover:scale-105'
            }`}
          >
            <div className="text-center">
              <div className="text-3xl mb-1">🎵</div>
              <div>{pad.name}</div>
            </div>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <header className="relative border-b border-white/10 bg-black/30 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-white/70 transition-colors hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/30">
              <span className="text-xl">🎹</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Music Playground</h1>
          </div>
          <div className="flex items-center gap-4">
            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6v12m0-12l-4 4H4v4h4l4 4" />
              </svg>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-20 accent-emerald-500"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-6 py-8">
        {/* Instrument Selector */}
        <div className="mb-8">
          <div className="flex justify-center gap-4">
            {instruments.map((instrument) => (
              <button
                key={instrument.type}
                onClick={() => setSelectedInstrument(instrument.type)}
                className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all ${
                  selectedInstrument === instrument.type
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/30 scale-105'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                }`}
              >
                <span className="text-2xl">{instrument.icon}</span>
                <span className="font-medium">{instrument.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Hand Tracking Toggle */}
        <div className="mb-8 flex justify-center">
          <button
            onClick={isHandTrackingEnabled ? stopHandTracking : startHandTracking}
            className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all ${
              isHandTrackingEnabled
                ? 'bg-red-500/20 text-red-300 border border-red-400/30 hover:bg-red-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 hover:bg-emerald-500/30'
            }`}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>{isHandTrackingEnabled ? 'Disable Hand Tracking' : 'Enable Hand Tracking'}</span>
            {isHandTrackingEnabled && (
              <span className="flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            )}
          </button>
        </div>

        {cameraError && (
          <div className="mb-8 text-center text-red-400 bg-red-500/10 border border-red-400/30 rounded-xl p-4">
            {cameraError}
          </div>
        )}

        {/* Camera Preview (when hand tracking is enabled) */}
        {isHandTrackingEnabled && (
          <div className="mb-8 flex justify-center">
            <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-400/30 shadow-lg shadow-emerald-500/20">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-80 h-60 object-cover transform scale-x-[-1]"
              />
              <canvas ref={canvasRef} className="hidden" />
              {handPosition && (
                <div
                  className="absolute w-8 h-8 rounded-full bg-emerald-400/80 border-4 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-75"
                  style={{ left: `${handPosition.x}%`, top: `${handPosition.y}%` }}
                />
              )}
              <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                Move your hand to play!
              </div>
            </div>
          </div>
        )}

        {/* Instrument Display */}
        <div className="relative rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-8 shadow-2xl">
          {/* Hand position indicator overlay */}
          {isHandTrackingEnabled && handPosition && (
            <div
              className="absolute w-6 h-6 rounded-full bg-emerald-400/50 border-2 border-emerald-400 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20 transition-all duration-75"
              style={{ left: `${handPosition.x}%`, top: `${Math.max(20, handPosition.y)}%` }}
            >
              <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-50" />
            </div>
          )}

          {selectedInstrument === 'piano' && renderPiano()}
          {selectedInstrument === 'drums' && renderDrums()}
          {selectedInstrument === 'xylophone' && renderXylophone()}
          {selectedInstrument === 'pads' && renderPads()}
        </div>

        {/* Instructions */}
        <div className="mt-8 text-center">
          <p className="text-white/60 text-sm">
            {isHandTrackingEnabled 
              ? '👋 Move your hand over the instrument to play! Lower your hand to trigger sounds.'
              : '🖱️ Click or tap the keys to play, or enable hand tracking for gesture control.'}
          </p>
        </div>

        {/* Keyboard shortcuts hint */}
        <div className="mt-4 flex justify-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-white/40 text-xs">
            <span className="px-2 py-1 rounded bg-white/10">Click</span>
            <span>or</span>
            <span className="px-2 py-1 rounded bg-white/10">Tap</span>
            <span>to play</span>
          </div>
          <div className="flex items-center gap-2 text-white/40 text-xs">
            <span className="px-2 py-1 rounded bg-white/10">📷</span>
            <span>Enable camera for hand tracking</span>
          </div>
        </div>
      </main>
    </div>
  );
}


