'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { getMoodColor } from '../utils/moodColors';

function PreferencesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mood = searchParams.get('mood') || 'Unknown';

  // Log parameters
  console.log('Preferences Page - Parameters:', { mood });

  const colors = getMoodColor(mood);

  const handleSelection = (type: 'artists' | 'presets') => {
    console.log('User selected:', type, 'with mood:', mood);

    if (type === 'artists') {
      router.push(`/artists?mood=${encodeURIComponent(mood)}`);
    } else {
      router.push(`/loading-music?mood=${encodeURIComponent(mood)}&type=${type}`);
    }
  };

  return (
    <div className={`min-h-screen ${colors.bg}`}>
      {/* Header */}
      <header className="border-b border-white/30 bg-white/60 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-800"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Back</span>
          </button>
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br ${colors.accent} shadow-md`}>
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Wave</h1>
          </div>
          <div className="w-20"></div>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-80px)] max-w-4xl flex-col items-center justify-center px-6 py-12">
        <div className="w-full text-center">
          <div className="mb-8">
            <span className={`inline-block rounded-full border-2 ${colors.border} ${colors.cardBg} px-6 py-2 text-lg font-semibold ${colors.text} shadow-md backdrop-blur-sm`}>
              {mood}
            </span>
          </div>

          <h2 className="mb-4 text-4xl font-bold text-gray-800">
            What would you like?
          </h2>
          <p className="mb-12 text-lg text-gray-600">
            Choose how we curate your playlist
          </p>

          <div className="grid gap-6 sm:grid-cols-2">
            {/* Specific Artists Option */}
            <button
              onClick={() => handleSelection('artists')}
              className="group relative overflow-hidden rounded-3xl border-2 border-gray-200/50 bg-white/80 p-8 text-left shadow-xl backdrop-blur-sm transition-all hover:scale-105 hover:border-cyan-400 hover:shadow-2xl"
            >
              {/* Gradient Overlay */}
              <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-cyan-100/30 via-sky-100/30 to-blue-100/30 opacity-0 transition-opacity group-hover:opacity-100" />

              <div className="relative">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-linear-to-br from-cyan-400 to-blue-500 shadow-md">
                  <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="mb-3 text-2xl font-bold text-gray-800">Specific Artists</h3>
                <p className="mb-4 text-gray-600">
                  Choose your favorite artists for a personalized playlist
                </p>
                <div className="flex items-center gap-2 text-sm font-medium text-cyan-600">
                  <span>Choose artists</span>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>

            {/* Preset Playlists Option */}
            <button
              onClick={() => handleSelection('presets')}
              className="group relative overflow-hidden rounded-3xl border-2 border-gray-200/50 bg-white/80 p-8 text-left shadow-xl backdrop-blur-sm transition-all hover:scale-105 hover:border-blue-400 hover:shadow-2xl"
            >
              {/* Gradient Overlay */}
              <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-blue-100/30 via-cyan-100/30 to-sky-100/30 opacity-0 transition-opacity group-hover:opacity-100" />

              <div className="relative">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-linear-to-br from-blue-400 to-cyan-500 shadow-md">
                  <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="mb-3 text-2xl font-bold text-gray-800">Preset Playlists</h3>
                <p className="mb-4 text-gray-600">
                  Curated collections that match your mood perfectly
                </p>
                <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
                  <span>Get started</span>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function PreferencesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-linear-to-br from-cyan-50 via-sky-50 to-blue-50" />}>
      <PreferencesContent />
    </Suspense>
  );
}
