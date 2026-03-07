'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { getMoodColor } from '../utils/moodColors';

function ArtistsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mood = searchParams.get('mood') || 'Unknown';

  const [artists, setArtists] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');

  const colors = getMoodColor(mood);

  // Log parameters
  console.log('Artists Page - Parameters:', {
    mood,
    artists,
  });

  const handleAddArtist = () => {
    if (currentInput.trim() && !artists.includes(currentInput.trim())) {
      const newArtists = [...artists, currentInput.trim()];
      setArtists(newArtists);
      setCurrentInput('');
      console.log('Artist added:', currentInput.trim());
      console.log('Current artists list:', newArtists);
    }
  };

  const handleRemoveArtist = (artistToRemove: string) => {
    const newArtists = artists.filter((artist) => artist !== artistToRemove);
    setArtists(newArtists);
    console.log('Artist removed:', artistToRemove);
    console.log('Current artists list:', newArtists);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddArtist();
    }
  };

  const handleNext = () => {
    console.log('Navigating to loading page with:', {
      mood,
      type: 'artists',
      artists,
    });

    const artistsParam = artists.join(',');
    router.push(`/loading-music?mood=${encodeURIComponent(mood)}&type=artists&artists=${encodeURIComponent(artistsParam)}`);
  };

  return (
    <div className={`min-h-screen ${colors.bg}`}>
      {/* Header */}
      <header className="border-b border-white/30 bg-white/60 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <button
            onClick={() => router.push(`/preferences?mood=${encodeURIComponent(mood)}`)}
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
            <h1 className="text-2xl font-bold text-gray-800">Moodify</h1>
          </div>
          <div className="w-20"></div>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-80px)] max-w-4xl flex-col items-center justify-center px-6 py-12">
        <div className="w-full">
          <div className="mb-8 text-center">
            <span className={`inline-block rounded-full border-2 ${colors.border} ${colors.cardBg} px-6 py-2 text-lg font-semibold ${colors.text} shadow-md backdrop-blur-sm`}>
              {mood}
            </span>
          </div>

          <h2 className="mb-4 text-center text-4xl font-bold text-gray-800">
            Choose Your Artists
          </h2>
          <p className="mb-12 text-center text-lg text-gray-600">
            Add your favorite artists to create a personalized playlist
          </p>

          {/* Artist Input */}
          <div className="relative mb-8 overflow-hidden rounded-3xl bg-white/80 p-6 shadow-xl backdrop-blur-sm">
            {/* Gradient Overlay */}
            <div className={`pointer-events-none absolute inset-0 bg-linear-to-br ${colors.overlay} opacity-60`} />

            <div className="relative">
              <div className="mb-4 flex gap-3">
                <div className="relative flex-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Type artist name..."
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full rounded-xl border-2 border-gray-200/50 bg-white/70 py-3 pl-12 pr-4 text-gray-800 placeholder-gray-400 shadow-sm backdrop-blur-sm transition-all focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200/50"
                  />
                </div>
                <button
                  onClick={handleAddArtist}
                  className={`flex items-center gap-2 rounded-xl bg-linear-to-r ${colors.accent} px-6 py-3 font-medium text-white shadow-md transition-all hover:scale-105 hover:shadow-lg`}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add
                </button>
              </div>

              {/* Artists List */}
              {artists.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium uppercase tracking-wide text-gray-500">
                    Your Artists ({artists.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {artists.map((artist, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 rounded-full border-2 border-gray-200/50 bg-white/80 px-4 py-2 shadow-sm backdrop-blur-sm"
                      >
                        <span className="text-gray-800">{artist}</span>
                        <button
                          onClick={() => handleRemoveArtist(artist)}
                          className="text-gray-400 transition-colors hover:text-red-500"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {artists.length === 0 && (
                <div className="rounded-xl border-2 border-dashed border-gray-200/50 bg-white/50 p-8 text-center backdrop-blur-sm">
                  <svg className="mx-auto mb-3 h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-gray-500">No artists added yet. Start typing to add your favorites!</p>
                </div>
              )}
            </div>
          </div>

          {/* Next Button */}
          <div className="flex justify-center">
            <button
              onClick={handleNext}
              disabled={artists.length === 0}
              className={`flex items-center gap-2 rounded-xl bg-linear-to-r ${colors.accent} px-8 py-4 text-lg font-medium text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-lg`}
            >
              {artists.length === 0 ? (
                <>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>Add at least one artist</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ArtistsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-purple-50" />}>
      <ArtistsContent />
    </Suspense>
  );
}
