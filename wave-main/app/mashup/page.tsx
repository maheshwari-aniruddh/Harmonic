'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

// Sample song library with Spotify links
const songLibrary = [
  { id: 1, title: 'Blinding Lights', artist: 'The Weeknd', bpm: 171, key: 'F minor', cover: 'from-red-500 to-orange-500', genre: 'Synth-pop', spotifyLink: 'spotify:track:0VjIjW4GlUZAMYd2vXMi3b' },
  { id: 2, title: 'Shape of You', artist: 'Ed Sheeran', bpm: 96, key: 'C# minor', cover: 'from-green-500 to-teal-500', genre: 'Pop', spotifyLink: 'spotify:track:7qiZfU4dY1lWllzX7mPBI9' },
  { id: 3, title: 'Uptown Funk', artist: 'Bruno Mars', bpm: 115, key: 'D minor', cover: 'from-pink-500 to-purple-500', genre: 'Funk', spotifyLink: 'spotify:track:32OlwWuMpZ6b0aN2RZOeMS' },
  { id: 4, title: 'Levitating', artist: 'Dua Lipa', bpm: 103, key: 'B minor', cover: 'from-violet-500 to-fuchsia-500', genre: 'Disco-pop', spotifyLink: 'spotify:track:39LLxExYz6ewLAcYrzQQyP' },
  { id: 5, title: 'Bad Guy', artist: 'Billie Eilish', bpm: 135, key: 'G minor', cover: 'from-lime-500 to-green-600', genre: 'Electropop', spotifyLink: 'spotify:track:2Fxmhks0bxGSBdJ92vM42m' },
  { id: 6, title: 'Don\'t Start Now', artist: 'Dua Lipa', bpm: 124, key: 'B minor', cover: 'from-amber-500 to-orange-600', genre: 'Nu-disco', spotifyLink: 'spotify:track:6WrI0LAC5M1Rw2MnX2ZvEg' },
  { id: 7, title: 'Watermelon Sugar', artist: 'Harry Styles', bpm: 95, key: 'D major', cover: 'from-rose-500 to-pink-600', genre: 'Pop rock', spotifyLink: 'spotify:track:6UelLqGlWMcVH1E5c4H7lY' },
  { id: 8, title: 'Save Your Tears', artist: 'The Weeknd', bpm: 118, key: 'C major', cover: 'from-blue-500 to-indigo-600', genre: 'Synth-pop', spotifyLink: 'spotify:track:5QO79kh1waicV47BqGRL3g' },
  { id: 9, title: 'Peaches', artist: 'Justin Bieber', bpm: 90, key: 'C major', cover: 'from-yellow-500 to-amber-600', genre: 'R&B', spotifyLink: 'spotify:track:4iJyoBOLtHqaGxP12qzhQI' },
  { id: 10, title: 'Industry Baby', artist: 'Lil Nas X', bpm: 150, key: 'F major', cover: 'from-cyan-500 to-blue-600', genre: 'Hip-hop', spotifyLink: 'spotify:track:27NovPIUIRrOZoCHxABJwK' },
  { id: 11, title: 'Heat Waves', artist: 'Glass Animals', bpm: 81, key: 'B major', cover: 'from-orange-500 to-red-600', genre: 'Indie pop', spotifyLink: 'spotify:track:02MWAaffLxlfxAUY7c5dvx' },
  { id: 12, title: 'Stay', artist: 'The Kid LAROI', bpm: 170, key: 'C major', cover: 'from-purple-500 to-violet-600', genre: 'Pop', spotifyLink: 'spotify:track:5PjdY0CKGZdEuoNab3yDmX' },
];

interface Song {
  id: number;
  title: string;
  artist: string;
  bpm: number;
  key: string;
  cover: string;
  genre: string;
  spotifyLink: string;
}

type MashupStage = 'select' | 'processing' | 'ready';

export default function MashupPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [selectedSongs, setSelectedSongs] = useState<Song[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stage, setStage] = useState<MashupStage>('select');
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [mashupName, setMashupName] = useState('');
  const [mashupId, setMashupId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const filteredSongs = songLibrary.filter(
    (song) =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSongSelection = (song: Song) => {
    if (selectedSongs.find((s) => s.id === song.id)) {
      setSelectedSongs(selectedSongs.filter((s) => s.id !== song.id));
    } else if (selectedSongs.length < 3) {
      setSelectedSongs([...selectedSongs, song]);
    }
  };

  const processingSteps = [
    'Analyzing audio signatures...',
    'Matching BPM and keys...',
    'Identifying hook sections...',
    'Blending vocals and instrumentals...',
    'Applying AI transitions...',
    'Mastering final mix...',
    'Finalizing your mashup...',
  ];

  const startMashupCreation = async () => {
    if (selectedSongs.length < 2) {
      setError('Please select at least 2 songs');
      return;
    }

    if (!isAuthenticated || !user) {
      setError('Please sign in to create a mashup');
      return;
    }

    setStage('processing');
    setProcessingProgress(0);
    setError('');

    // Generate mashup name
    const artistNames = selectedSongs.map(s => s.artist.split(' ')[0]).join(' × ');
    const generatedName = `${artistNames} Mashup`;
    setMashupName(generatedName);

    let stepIndex = 0;
    const totalSteps = processingSteps.length;

    const interval = setInterval(() => {
      stepIndex++;
      const progress = Math.min((stepIndex / totalSteps) * 100, 100);
      setProcessingProgress(progress);
      setProcessingStep(processingSteps[Math.min(stepIndex - 1, processingSteps.length - 1)]);

      if (stepIndex >= totalSteps) {
        clearInterval(interval);
      }
    }, 800);

    // Call backend to create mashup
    try {
      const response = await fetch('http://localhost:8080/mashups/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: generatedName,
          creator: user.username,
          songs: selectedSongs.map(s => s.spotifyLink),
          isPublic: true, // Default to public for sharing
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create mashup');
      }

      const data = await response.json();
      setMashupId(data.id);
      console.log('Mashup created with ID:', data.id);

      // Wait for processing animation to complete
      setTimeout(() => {
        setStage('ready');
      }, 500);
    } catch (err) {
      console.error('Error creating mashup:', err);
      setError(err instanceof Error ? err.message : 'Failed to create mashup');
      clearInterval(interval);
      setStage('select');
    }
  };

  const resetMashup = () => {
    setSelectedSongs([]);
    setStage('select');
    setProcessingProgress(0);
    setIsPlaying(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950 to-slate-900">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-fuchsia-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/30">
              <span className="text-xl">🎧</span>
            </div>
            <h1 className="text-2xl font-bold text-white">DJ Mashup Studio</h1>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 border border-violet-400/30 px-4 py-2">
            <span className="text-sm font-medium text-violet-200">
              {selectedSongs.length}/3 songs selected
            </span>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-6 py-8">
        {/* Authentication Warning */}
        {!isAuthenticated && (
          <div className="mb-6 rounded-2xl bg-violet-500/20 border border-violet-400/30 p-4">
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 text-violet-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm font-medium text-violet-200">
                Please sign in to create and save mashups
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-2xl bg-red-500/20 border border-red-400/30 p-4">
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium text-red-200">{error}</p>
            </div>
          </div>
        )}

        {/* Song Selection Stage */}
        {stage === 'select' && (
          <>
            {/* Selected Songs Display */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white mb-4">Your Selection</h2>
              <div className="grid grid-cols-3 gap-4">
                {[0, 1, 2].map((index) => (
                  <div
                    key={index}
                    className={`relative h-40 rounded-2xl border-2 border-dashed transition-all ${
                      selectedSongs[index]
                        ? 'border-transparent'
                        : 'border-white/20 bg-white/5'
                    }`}
                  >
                    {selectedSongs[index] ? (
                      <div className={`h-full rounded-2xl bg-gradient-to-br ${selectedSongs[index].cover} p-4 relative overflow-hidden`}>
                        <button
                          onClick={() => toggleSongSelection(selectedSongs[index])}
                          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        <div className="absolute bottom-4 left-4 right-4">
                          <p className="font-bold text-white text-lg truncate">{selectedSongs[index].title}</p>
                          <p className="text-white/80 text-sm truncate">{selectedSongs[index].artist}</p>
                          <div className="flex gap-2 mt-2">
                            <span className="text-xs bg-black/30 px-2 py-1 rounded-full text-white/90">{selectedSongs[index].bpm} BPM</span>
                            <span className="text-xs bg-black/30 px-2 py-1 rounded-full text-white/90">{selectedSongs[index].key}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-white/40">
                        <svg className="h-10 w-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="text-sm">Song {index + 1}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Create Mashup Button */}
              <div className="mt-6 flex justify-center">
                <button
                  onClick={startMashupCreation}
                  disabled={selectedSongs.length < 2 || !isAuthenticated}
                  className={`group relative px-8 py-4 rounded-2xl font-bold text-lg transition-all ${
                    selectedSongs.length >= 2 && isAuthenticated
                      ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-105'
                      : 'bg-white/10 text-white/40 cursor-not-allowed'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    {!isAuthenticated ? 'Sign in required' : selectedSongs.length < 2 ? 'Select at least 2 songs' : 'Create AI Mashup ✨'}
                  </span>
                </button>
              </div>
            </div>

            {/* Song Library */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Song Library</h2>
                <div className="relative">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search songs, artists, genres..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-80 rounded-xl bg-white/10 border border-white/10 pl-12 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-violet-400/50 focus:ring-2 focus:ring-violet-400/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredSongs.map((song) => {
                  const isSelected = selectedSongs.find((s) => s.id === song.id);
                  const canSelect = selectedSongs.length < 3 || isSelected;
                  
                  return (
                    <button
                      key={song.id}
                      onClick={() => canSelect && toggleSongSelection(song)}
                      disabled={!canSelect}
                      className={`group relative overflow-hidden rounded-2xl p-4 text-left transition-all ${
                        isSelected
                          ? 'ring-2 ring-violet-400 ring-offset-2 ring-offset-slate-900'
                          : canSelect
                          ? 'hover:scale-105'
                          : 'opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${song.cover} opacity-90`} />
                      <div className="relative">
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 h-7 w-7 rounded-full bg-violet-500 flex items-center justify-center shadow-lg">
                            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                        <div className="h-20 flex items-center justify-center mb-3">
                          <span className="text-5xl group-hover:scale-110 transition-transform">🎵</span>
                        </div>
                        <h4 className="font-bold text-white truncate">{song.title}</h4>
                        <p className="text-sm text-white/80 truncate">{song.artist}</p>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          <span className="text-xs bg-black/30 px-2 py-1 rounded-full text-white/90">{song.genre}</span>
                          <span className="text-xs bg-black/30 px-2 py-1 rounded-full text-white/90">{song.bpm} BPM</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Processing Stage */}
        {stage === 'processing' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-full max-w-lg">
              {/* Animated Vinyl Records */}
              <div className="relative h-64 mb-8">
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  {selectedSongs.map((song, index) => (
                    <div
                      key={song.id}
                      className="absolute"
                      style={{
                        transform: `rotate(${index * (360 / selectedSongs.length)}deg) translateX(${60 + index * 20}px)`,
                        animation: 'spin 3s linear infinite',
                        animationDelay: `${index * 0.3}s`,
                      }}
                    >
                      <div className={`w-28 h-28 rounded-full bg-gradient-to-br ${song.cover} flex items-center justify-center shadow-2xl`}>
                        <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full bg-white/50" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Creating Your Mashup</h2>
                <p className="text-violet-300">{processingStep}</p>
              </div>

              <div className="relative h-3 bg-white/10 rounded-full overflow-hidden mb-4">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-500"
                  style={{ width: `${processingProgress}%` }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              </div>

              <p className="text-center text-white/60">{Math.round(processingProgress)}% complete</p>
            </div>
          </div>
        )}

        {/* Ready Stage */}
        {stage === 'ready' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-full max-w-2xl">
              {/* Success Animation */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 mb-6 animate-bounce">
                  <span className="text-5xl">🎉</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Mashup Ready!</h2>
                <p className="text-white/60">Your AI-powered mashup has been created</p>
              </div>

              {/* Mashup Player Card */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600/50 to-fuchsia-600/50 backdrop-blur-xl border border-white/20 p-8 mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10" />
                
                <div className="relative">
                  {/* Combined Album Art */}
                  <div className="flex justify-center gap-[-20px] mb-6">
                    {selectedSongs.map((song, index) => (
                      <div
                        key={song.id}
                        className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${song.cover} flex items-center justify-center shadow-xl border-4 border-slate-900`}
                        style={{ marginLeft: index > 0 ? '-20px' : '0', zIndex: selectedSongs.length - index }}
                      >
                        <span className="text-3xl">🎵</span>
                      </div>
                    ))}
                  </div>

                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-white mb-2">{mashupName}</h3>
                    <p className="text-white/60">
                      Featuring: {selectedSongs.map(s => s.artist).join(', ')}
                    </p>
                  </div>

                  {/* Waveform Visualization */}
                  <div className="flex items-end justify-center gap-1 h-16 mb-6">
                    {Array.from({ length: 40 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 rounded-full bg-gradient-to-t from-violet-400 to-fuchsia-400 transition-all ${isPlaying ? 'animate-pulse' : ''}`}
                        style={{
                          height: `${Math.random() * 100}%`,
                          animationDelay: `${i * 0.05}s`,
                          opacity: isPlaying ? 1 : 0.5,
                        }}
                      />
                    ))}
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full w-1/3 bg-gradient-to-r from-violet-400 to-fuchsia-400 rounded-full" />
                    </div>
                    <div className="flex justify-between text-sm text-white/60 mt-2">
                      <span>1:23</span>
                      <span>4:15</span>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-center gap-6">
                    <button className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
                      </svg>
                    </button>

                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="h-20 w-20 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/50 hover:scale-105 transition-transform"
                    >
                      {isPlaying ? (
                        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                        </svg>
                      ) : (
                        <svg className="h-8 w-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </button>

                    <button className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={resetMashup}
                  className="px-6 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors flex items-center gap-2"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Another
                </button>
                <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-medium hover:shadow-lg hover:shadow-violet-500/30 transition-all flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Save to Library
                </button>
                <button className="px-6 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Share
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
      `}</style>
    </div>
  );
}

