'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { HandsResults } from "@mediapipe/hands";

type DrumPad = {
  id: string;
  label: string;
  /** 0..1, relative to container width */
  x: number;
  /** 0..1, relative to container height */
  y: number;
  /** 0..1, radius relative to the smaller canvas dimension */
  radius: number;
  soundUrl: string;
  color?: string;
};

const defaultPads: DrumPad[] = [
  {
    id: "kick",
    label: "Kick",
    x: 0.2,
    y: 0.8,
    radius: 0.12,
    soundUrl: "/drums/kick.mp3",
    color: "#2563eb",
  },
  {
    id: "snare",
    label: "Snare",
    x: 0.5,
    y: 0.8,
    radius: 0.12,
    soundUrl: "/drums/snare.mp3",
    color: "#7c3aed",
  },
  {
    id: "hihat",
    label: "Hi-Hat",
    x: 0.8,
    y: 0.8,
    radius: 0.1,
    soundUrl: "/drums/hihat.mp3",
    color: "#059669",
  },
  {
    id: "tom1",
    label: "Tom 1",
    x: 0.35,
    y: 0.48,
    radius: 0.1,
    soundUrl: "/drums/tom1.mp3",
    color: "#f59e0b",
  },
  {
    id: "tom2",
    label: "Tom 2",
    x: 0.65,
    y: 0.48,
    radius: 0.1,
    soundUrl: "/drums/tom2.mp3",
    color: "#ec4899",
  },
];

const canvasBg = "rgba(17, 24, 39, 0.45)";

function FingerDrums({
  pads = defaultPads,
  className = "",
  showVideo = true,
  isStarted = false,
  onError,
}: {
  pads?: DrumPad[];
  className?: string;
  showVideo?: boolean;
  isStarted?: boolean;
  onError?: (error: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hitStateRef = useRef<Set<string>>(new Set());
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioBuffersRef = useRef<Record<string, AudioBuffer | null>>({});
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [fingerPositions, setFingerPositions] = useState<
    { x: number; y: number }[]
  >([]);

  const padList = useMemo<DrumPad[]>(() => pads, [pads]);

  const playPadSound = (padId: string) => {
    const ctx = audioCtxRef.current;
    const buffer = audioBuffersRef.current[padId];
    if (!ctx || !buffer) return;
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start();
  };

  useEffect(() => {
    if (!isStarted) return;
    
    let cleanup: (() => void) | undefined;

    const start = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!video || !canvas || !container) return;
      let ro: ResizeObserver | undefined;

      // Prepare Web Audio buffers to avoid play/load interruptions
      const AudioCtx =
        (window as any).AudioContext ||
        (window as any).webkitAudioContext ||
        undefined;
      if (!AudioCtx) {
        const errorMsg = "Web Audio is not available in this browser.";
        setError(errorMsg);
        onError?.(errorMsg);
        return;
      }
      // Close any prior context if a rerender re-enters
      audioCtxRef.current?.close().catch(() => {});
      audioCtxRef.current = new AudioCtx();
      try {
        await Promise.all(
          padList.map(async (pad) => {
            const res = await fetch(pad.soundUrl);
            if (!res.ok) {
              throw new Error(
                `Sound file not found for ${pad.label} at ${pad.soundUrl} (status ${res.status})`
              );
            }
            const arr = await res.arrayBuffer();
            try {
              const buffer = await audioCtxRef.current!.decodeAudioData(arr);
              audioBuffersRef.current[pad.id] = buffer;
            } catch (decodeErr) {
              throw new Error(
                `Unable to decode audio for ${pad.label}. Make sure the file is a supported format and not empty.`
              );
            }
          })
        );
      } catch (err) {
        console.error(err);
        const errorMsg =
          err instanceof Error ? err.message : "Unable to load drum sounds.";
        setError(errorMsg);
        onError?.(errorMsg);
        return;
      }

      // Resize to container width while keeping 4:3 aspect
      const resize = () => {
        const width = container.clientWidth || 800;
        const height = Math.round((width * 3) / 4);
        canvas.width = width;
        canvas.height = height;
        video.width = width;
        video.height = height;
      };
      resize();
      ro = new ResizeObserver(resize);
      ro.observe(container);

      if (!navigator.mediaDevices?.getUserMedia) {
        const errorMsg = "Camera access is not available in this browser.";
        setError(errorMsg);
        onError?.(errorMsg);
        ro?.disconnect();
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
        });
        video.srcObject = stream;
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch((err: unknown) => {
            console.warn("Video play interrupted, retrying once", err);
            // Retry shortly; avoids 'play() request was interrupted by a new load request'
            setTimeout(() => {
              video.play().catch(() => {});
            }, 50);
          });
        }
      } catch (err) {
        console.error(err);
        const errorMsg = "Camera permission was denied or unavailable.";
        setError(errorMsg);
        onError?.(errorMsg);
        ro?.disconnect();
        return;
      }

      const { Hands } = await import("@mediapipe/hands");
      const { Camera } = await import("@mediapipe/camera_utils");

      const hands = new Hands({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });

      hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        selfieMode: true,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.6,
      });

      hands.onResults((results: HandsResults) => {
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const { width, height } = canvas;
        ctx.save();
        ctx.clearRect(0, 0, width, height);

        // darken and draw pads
        ctx.fillStyle = canvasBg;
        ctx.fillRect(0, 0, width, height);

        const minDim = Math.min(width, height);
        padList.forEach((pad) => {
          const padX = pad.x * width;
          const padY = pad.y * height;
          const radiusPx = pad.radius * minDim;
          ctx.beginPath();
          ctx.arc(padX, padY, radiusPx, 0, Math.PI * 2);
          ctx.fillStyle = `${pad.color ?? "#22d3ee"}33`;
          ctx.fill();
          ctx.lineWidth = 3;
          ctx.strokeStyle = pad.color ?? "#22d3ee";
          ctx.stroke();
          ctx.fillStyle = "#fff";
          ctx.font = "600 14px 'Inter', system-ui, -apple-system, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(pad.label, padX, padY + 5);
        });

        const handsFound = results.multiHandLandmarks ?? [];
        if (handsFound.length) {
          const fingertipPoints = handsFound.map((hand) => {
            const tip = hand[8]; // index finger tip
            return { x: tip.x * width, y: tip.y * height };
          });
          setFingerPositions(fingertipPoints);

          fingertipPoints.forEach(({ x, y }) => {
            ctx.beginPath();
            ctx.arc(x, y, 10, 0, Math.PI * 2);
            ctx.fillStyle = "#f97316";
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#fff";
            ctx.stroke();
          });

          const hits = new Set<string>();
          padList.forEach((pad) => {
            const padX = pad.x * width;
            const padY = pad.y * height;
            const radiusPx = pad.radius * minDim;
            const insideAnyFinger = fingertipPoints.some(({ x, y }) => {
              const dx = x - padX;
              const dy = y - padY;
              return Math.sqrt(dx * dx + dy * dy) <= radiusPx;
            });
            if (insideAnyFinger) {
              hits.add(pad.id);
              if (!hitStateRef.current.has(pad.id)) {
                playPadSound(pad.id);
              }
            }
          });
          hitStateRef.current = hits;
        } else {
          hitStateRef.current.clear();
          setFingerPositions([]);
        }

        ctx.restore();
      });

      const camera = new Camera(video, {
        onFrame: async () => {
          await hands.send({ image: video });
        },
        width: 960,
        height: 720,
      });

      camera.start();
      setReady(true);

      cleanup = () => {
        ro?.disconnect();
        camera.stop();
        hands.close();
        const tracks = (video.srcObject as MediaStream | null)?.getTracks() ?? [];
        tracks.forEach((t) => t.stop());
        audioCtxRef.current?.close();
        audioCtxRef.current = null;
        audioBuffersRef.current = {};
      };
    };

    start();

    return () => {
      cleanup?.();
    };
  }, [padList, isStarted, onError]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "960px",
        aspectRatio: "4 / 3",
        overflow: "hidden",
        borderRadius: "16px",
        background: "#000",
        boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
        margin: "0 auto",
      }}
    >
      {showVideo && (
        <video
          ref={videoRef}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: "scaleX(-1)",
          }}
          playsInline
          muted
        />
      )}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      />

      {!ready && !error && isStarted && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.6)",
            color: "white",
            fontSize: "14px",
          }}
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-3"></div>
            <p>Loading hand tracking...</p>
          </div>
        </div>
      )}
      
      {!isStarted && !error && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.8)",
            color: "white",
            fontSize: "14px",
          }}
        >
          <div className="text-center">
            <div className="text-6xl mb-4">📷</div>
            <p className="text-white/60">Click &quot;Start Camera&quot; to begin</p>
          </div>
        </div>
      )}

      {error && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "12px",
            textAlign: "center",
            background: "rgba(0,0,0,0.6)",
            color: "#fecdd3",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}

      {fingerPositions.length > 0 && (
        <div
          style={{
            position: "absolute",
            bottom: "12px",
            left: "12px",
            background: "rgba(0,0,0,0.6)",
            color: "white",
            fontSize: "12px",
            padding: "6px 10px",
            borderRadius: "8px",
          }}
        >
          Fingers:{" "}
          {fingerPositions
            .map(
              (p, idx) => `#${idx + 1}: ${Math.round(p.x)} x ${Math.round(p.y)}`
            )
            .join(" | ")}
        </div>
      )}
    </div>
  );
}

export default function DrumsPage() {
  const router = useRouter();
  const [isStarted, setIsStarted] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);

  const handleStartCamera = async () => {
    setCameraError(null);
    setIsRequesting(true);
    
    // First, check if getUserMedia is available
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera access is not available in this browser.");
      setIsRequesting(false);
      return;
    }
    
    try {
      // Request camera permission from Chrome/browser
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      
      // Permission granted! Stop the test stream and start the actual component
      stream.getTracks().forEach(track => track.stop());
      setIsStarted(true);
    } catch (err: unknown) {
      console.error("Camera permission error:", err);
      
      // Handle different error types
      const error = err as Error & { name?: string };
      if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
        setCameraError("No camera found. Please connect a camera and try again.");
      } else if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        setCameraError("Camera permission was denied. Please allow camera access in your browser settings and try again.");
      } else if (error.name === "NotReadableError" || error.name === "TrackStartError") {
        setCameraError("Camera is in use by another application. Please close other apps using the camera and try again.");
      } else if (error.name === "OverconstrainedError") {
        setCameraError("Camera doesn't support the required settings. Trying with default settings...");
        // Try again with no constraints
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          stream.getTracks().forEach(track => track.stop());
          setIsStarted(true);
          setCameraError(null);
        } catch {
          setCameraError("Could not access camera. Please check your camera connection.");
        }
      } else {
        setCameraError(`Camera error: ${error.message || "Unknown error occurred"}`);
      }
    } finally {
      setIsRequesting(false);
    }
  };

  const handleError = (error: string) => {
    setCameraError(error);
    setIsStarted(false);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-950 to-slate-900">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30">
              <span className="text-xl">🥁</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Finger Drums</h1>
          </div>
          <div className={`flex items-center gap-2 rounded-full px-4 py-2 border ${
            isStarted 
              ? 'bg-linear-to-r from-green-500/20 to-emerald-500/20 border-green-400/30' 
              : 'bg-linear-to-r from-gray-500/20 to-slate-500/20 border-gray-400/30'
          }`}>
            <span className="flex h-2 w-2 relative">
              {isStarted && <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isStarted ? 'bg-green-500' : 'bg-gray-500'}`}></span>
            </span>
            <span className={`text-sm font-medium ${isStarted ? 'text-green-200' : 'text-gray-400'}`}>
              {isStarted ? 'Camera Active' : 'Camera Off'}
            </span>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-6 py-8">
        {/* Instructions */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">Play Drums with Your Hands!</h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Use your index finger to hit the drum pads. Move your finger into a pad circle to trigger the sound.
            Make sure your hand is visible in the camera.
          </p>
        </div>

        {/* Camera Permission Request */}
        {!isStarted && (
          <div className="mb-8">
            <div className="max-w-2xl mx-auto bg-linear-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/20 rounded-3xl p-10 text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <span className="text-5xl">📷</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Camera Access Required</h3>
              <p className="text-white/70 mb-8 max-w-md mx-auto">
                To play finger drums, we need access to your camera to track your hand movements. 
                Your video stays on your device and is never recorded or sent anywhere.
              </p>
              
              {cameraError && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-400/30 rounded-xl text-red-300 text-sm max-w-md mx-auto">
                  <div className="flex items-center gap-2 justify-center">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {cameraError}
                  </div>
                </div>
              )}
              
              <button
                onClick={handleStartCamera}
                disabled={isRequesting}
                className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-linear-to-r from-purple-500 to-pink-500 text-white font-bold text-xl shadow-xl shadow-purple-500/40 hover:shadow-purple-500/60 hover:scale-105 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isRequesting ? (
                  <>
                    <div className="h-7 w-7 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    Requesting Permission...
                  </>
                ) : (
                  <>
                    <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Start Camera & Play
                  </>
                )}
              </button>
              
              <p className="mt-6 text-white/40 text-sm">
                Your browser will ask you to allow camera access
              </p>

              {/* Drum Kit Preview */}
              <div className="mt-10 pt-8 border-t border-white/10">
                <p className="text-white/50 text-sm mb-4">Drum pads you&apos;ll be able to play:</p>
                <div className="flex justify-center gap-3 flex-wrap">
                  {defaultPads.map((pad) => (
                    <div
                      key={pad.id}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10"
                    >
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: pad.color }}
                      />
                      <span className="text-white/70 text-sm font-medium">{pad.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Show drum kit legend and component only when started */}
        {isStarted && (
          <>
            {/* Drum Kit Legend */}
            <div className="mb-8 flex justify-center gap-4 flex-wrap">
              {defaultPads.map((pad) => (
                <div
                  key={pad.id}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10"
                >
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: pad.color }}
                  />
                  <span className="text-white/80 text-sm font-medium">{pad.label}</span>
                </div>
              ))}
            </div>

            {/* Finger Drums Component */}
            <FingerDrums isStarted={isStarted} onError={handleError} />
          </>
        )}

        {/* Tips */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-2xl mb-3">💡</div>
            <h3 className="text-white font-semibold mb-2">Good Lighting</h3>
            <p className="text-white/60 text-sm">Make sure you have good lighting for better hand detection accuracy.</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-2xl mb-3">👆</div>
            <h3 className="text-white font-semibold mb-2">Index Finger</h3>
            <p className="text-white/60 text-sm">Point with your index finger - that&apos;s the finger we track for hitting pads.</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-2xl mb-3">🎯</div>
            <h3 className="text-white font-semibold mb-2">Hit the Circles</h3>
            <p className="text-white/60 text-sm">Move your finger into the colored circles to trigger drum sounds.</p>
          </div>
        </div>
      </main>
    </div>
  );
}