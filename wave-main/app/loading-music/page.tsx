'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { getMoodColor } from '../utils/moodColors';

const loadingMessages = [
  'Shuffling tracks...',
  'Remixing your vibe...',
  'Finding the perfect beat...',
  'Curating your playlist...',
  'Analyzing your mood...',
  'Mixing it up...',
];

function LoadingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mood = searchParams.get('mood') || 'Unknown';
  const type = searchParams.get('type') || 'presets';
  const artists = searchParams.get('artists') || '';

  const [currentMessage, setCurrentMessage] = useState(0);
  const [progress, setProgress] = useState(0);
  const colors = getMoodColor(mood);

  // Log all parameters to console
  useEffect(() => {
    console.log('Loading Page - Parameters:', {
      mood,
      type,
      artists: artists ? artists.split(',') : [],
    });
  }, [mood, type, artists]);

  useEffect(() => {
    // Cycle through loading messages
    const messageInterval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % loadingMessages.length);
    }, 600);

    return () => {
      clearInterval(messageInterval);
    };
  }, []);

  // Progress bar animation
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(progressInterval);
  }, []);

  // Navigate to player page after loading
  useEffect(() => {
    const redirectTimer = setTimeout(() => {
      // Build the player URL with all parameters
      const params = new URLSearchParams();
      params.set('mood', mood);
      if (type) params.set('type', type);
      if (artists) params.set('artists', artists);
      
      router.push(`/player?${params.toString()}`);
    }, 2500); // 2.5 seconds loading time

    return () => clearTimeout(redirectTimer);
  }, [router, mood, type, artists]);

  return (
    <div className={`flex min-h-screen flex-col items-center justify-center ${colors.bg} px-6`}>
      <div className="text-center">
        {/* Logo */}
        <div className="mb-12 flex justify-center">
          <div className={`flex h-24 w-24 items-center justify-center rounded-2xl bg-linear-to-br ${colors.accent} shadow-lg`}>
            <svg className="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
        </div>

        {/* Loading Animation */}
        <div className="mb-8 flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-3 w-3 rounded-full ${colors.primary}`}
              style={{
                animation: `bounce 1.4s infinite ease-in-out`,
                animationDelay: `${i * 0.16}s`,
              }}
            />
          ))}
        </div>

        {/* Loading Message */}
        <h2 className="mb-4 text-3xl font-bold text-gray-800">
          {loadingMessages[currentMessage]}
        </h2>

        <p className="text-lg text-gray-600 mb-8">
          Creating the perfect playlist for your <span className="font-semibold">{mood}</span> mood
        </p>

        {/* Progress Bar */}
        <div className="w-64 mx-auto">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-linear-to-r ${colors.accent} transition-all duration-100 ease-out rounded-full`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">{Math.min(progress, 100)}%</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

export default function LoadingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-purple-50" />}>
      <LoadingContent />
    </Suspense>
  );
}
