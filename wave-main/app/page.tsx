'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';

// Dummy data for playlists
const forYouPlaylists = [
  { id: 1, name: 'Chill Vibes', description: 'Relax and unwind', color: 'from-blue-400 to-cyan-300', type: 'playlist' },
  { id: 2, name: 'Focus Mode', description: 'Deep work sessions', color: 'from-purple-400 to-pink-300', type: 'playlist' },
  { id: 3, name: 'Sleep Time', description: 'Peaceful sleep sounds', color: 'from-indigo-400 to-blue-300', type: 'playlist' },
  { id: 4, name: 'Workout Energy', description: 'Get pumped up', color: 'from-orange-400 to-red-300', type: 'playlist' },
];

const popularPlaylists = [
  { id: 5, name: 'Hot Now', description: 'Trending hits', color: 'from-red-400 to-pink-400' },
  { id: 6, name: 'Lo-Fi Beats', description: 'Study and chill', color: 'from-teal-400 to-green-300' },
  { id: 7, name: 'Retro Vibes', description: '80s and 90s classics', color: 'from-yellow-400 to-orange-300' },
  { id: 8, name: 'Indie Discovery', description: 'Fresh indie tracks', color: 'from-emerald-400 to-teal-300' },
];

const moods = [
  { emoji: '😊', label: 'Happy', value: 'happy' },
  { emoji: '😔', label: 'Sad', value: 'sad' },
  { emoji: '😠', label: 'Angry', value: 'angry' },
  { emoji: '😤', label: 'Motivated', value: 'motivated' },
  { emoji: '😌', label: 'Calm', value: 'calm' },
];

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [moodText, setMoodText] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleMoodSelection = (mood: string) => {
    console.log('Home Page - Mood selected via emoji:', mood);
    setSelectedMood(mood);
    router.push(`/preferences?mood=${encodeURIComponent(mood)}`);
  };

  const handleMoodSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (moodText.trim()) {
      console.log('Home Page - Mood submitted via text:', moodText);
      router.push(`/preferences?mood=${encodeURIComponent(moodText)}`);
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-linear-to-r from-blue-950 via-cyan-950 to-blue-900' : 'bg-linear-to-r from-cyan-200 via-sky-300 to-blue-300'}`}>
      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} isDarkMode={isDarkMode} />

      {/* Header */}
      <header className={`border-b ${isDarkMode ? 'border-white/10 bg-black/20' : 'border-gray-200 bg-white/60'} backdrop-blur-lg`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-cyan-400 to-blue-500">
              <span className="text-2xl">🎧</span>
            </div>
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Wave</h1>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Dark/Light Mode Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-colors ${isDarkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
            >
              {isDarkMode ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Auth Buttons / User Info */}
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push('/library')}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-colors ${isDarkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span className="text-sm font-medium">My Library</span>
                </button>
                <div className={`flex items-center gap-2 rounded-full px-4 py-2 ${isDarkMode ? 'bg-cyan-500/20 border border-cyan-400/30' : 'bg-cyan-100 border border-cyan-200'}`}>
                  <div className="h-6 w-6 rounded-full bg-linear-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{user?.username.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-cyan-300' : 'text-cyan-700'}`}>{user?.username}</span>
                </div>
                <button
                  onClick={logout}
                  className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm transition-colors ${isDarkMode ? 'text-white/60 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200'}`}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-2 rounded-xl bg-linear-to-r from-cyan-500 to-blue-500 px-5 py-2 text-white font-medium shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all hover:scale-105"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12">
        {/* Mood Selector Section */}
        <div className={`mb-12 rounded-3xl p-8 backdrop-blur-xl ${isDarkMode ? 'bg-white/10' : 'bg-white/80'}`}>
          <h2 className={`mb-6 text-center text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            How are you feeling?
          </h2>

          <form onSubmit={handleMoodSubmit} className="mb-6">
            <input
              type="text"
              placeholder="Type your mood here and press Enter..."
              value={moodText}
              onChange={(e) => setMoodText(e.target.value)}
              className={`w-full rounded-2xl border-2 px-6 py-4 text-lg backdrop-blur-sm transition-all focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 ${isDarkMode ? 'border-white/20 bg-white/5 text-white placeholder-white/50' : 'border-gray-200 bg-white text-gray-800 placeholder-gray-400'}`}
            />
          </form>

          <div className="flex items-center justify-center gap-4">
            {moods.map((mood) => (
              <button
                key={mood.value}
                onClick={() => handleMoodSelection(mood.label)}
                className={`flex h-16 w-16 items-center justify-center rounded-full text-4xl transition-all hover:scale-110 ${isDarkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'}`}
                title={mood.label}
              >
                {mood.emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <section className="mb-10">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Features</h3>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${isDarkMode ? 'bg-gradient-to-r from-violet-500/30 to-fuchsia-500/30 text-violet-300 border border-violet-400/30' : 'bg-violet-100 text-violet-700 border border-violet-200'}`}>
                ✨ Interactive
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* DJ Mashup Card */}
            <button
              onClick={() => router.push('/mashup')}
              className={`group relative overflow-hidden rounded-2xl p-6 text-left transition-transform hover:scale-[1.02] ${isDarkMode ? '' : 'shadow-lg shadow-violet-500/20'}`}
            >
              <div className={`absolute inset-0 ${isDarkMode ? 'bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600' : 'bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500'} opacity-90 transition-opacity group-hover:opacity-100`} />
              {/* Animated background elements */}
              <div className="absolute inset-0 overflow-hidden">
                <div className={`absolute -top-4 -right-4 h-24 w-24 rounded-full ${isDarkMode ? 'bg-white/20' : 'bg-white/30'} blur-xl group-hover:scale-150 transition-transform duration-500`} />
                <div className={`absolute -bottom-4 -left-4 h-32 w-32 rounded-full ${isDarkMode ? 'bg-white/10' : 'bg-white/20'} blur-xl group-hover:scale-150 transition-transform duration-500`} />
              </div>
              <div className="relative flex items-start gap-4">
                <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${isDarkMode ? 'bg-white/20' : 'bg-white/40'} backdrop-blur-sm shadow-inner`}>
                  <span className="text-4xl drop-shadow-md">🎧</span>
                </div>
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <h4 className="text-xl font-bold text-white drop-shadow-sm">DJ Mashup Studio</h4>
                    <span className={`rounded-full ${isDarkMode ? 'bg-white/20' : 'bg-white/40'} px-2 py-0.5 text-xs font-medium text-white shadow-sm`}>AI</span>
                  </div>
                  <p className={`mb-3 text-sm ${isDarkMode ? 'text-white/80' : 'text-white/90'}`}>Select 2-3 songs and let AI blend them into one seamless mashup with matching BPM and smooth transitions.</p>
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-1 text-xs ${isDarkMode ? 'text-white/70' : 'text-white/80'}`}>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>AI-Powered</span>
                    </div>
                    <div className={`flex items-center gap-1 text-xs ${isDarkMode ? 'text-white/70' : 'text-white/80'}`}>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                      <span>12 Songs Available</span>
                    </div>
                  </div>
                </div>
                <svg className={`h-6 w-6 ${isDarkMode ? 'text-white/50' : 'text-white/60'} group-hover:text-white transition-colors`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* Playground Card */}
            <button
              onClick={() => router.push('/playground')}
              className={`group relative overflow-hidden rounded-2xl p-6 text-left transition-transform hover:scale-[1.02] ${isDarkMode ? '' : 'shadow-lg shadow-emerald-500/20'}`}
            >
              <div className={`absolute inset-0 ${isDarkMode ? 'bg-gradient-to-br from-emerald-600 via-cyan-600 to-blue-600' : 'bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500'} opacity-90 transition-opacity group-hover:opacity-100`} />
              {/* Animated background elements */}
              <div className="absolute inset-0 overflow-hidden">
                <div className={`absolute -top-4 -right-4 h-24 w-24 rounded-full ${isDarkMode ? 'bg-white/20' : 'bg-white/30'} blur-xl group-hover:scale-150 transition-transform duration-500`} />
                <div className={`absolute -bottom-4 -left-4 h-32 w-32 rounded-full ${isDarkMode ? 'bg-white/10' : 'bg-white/20'} blur-xl group-hover:scale-150 transition-transform duration-500`} />
              </div>
              <div className="relative flex items-start gap-4">
                <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${isDarkMode ? 'bg-white/20' : 'bg-white/40'} backdrop-blur-sm shadow-inner`}>
                  <span className="text-4xl drop-shadow-md">🎹</span>
                </div>
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <h4 className="text-xl font-bold text-white drop-shadow-sm">Music Playground</h4>
                    <span className={`rounded-full ${isDarkMode ? 'bg-white/20' : 'bg-white/40'} px-2 py-0.5 text-xs font-medium text-white shadow-sm`}>NEW</span>
                  </div>
                  <p className={`mb-3 text-sm ${isDarkMode ? 'text-white/80' : 'text-white/90'}`}>Play virtual instruments with your hands! Use your webcam to control piano, drums, and more with gesture tracking.</p>
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-1 text-xs ${isDarkMode ? 'text-white/70' : 'text-white/80'}`}>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>Hand Tracking</span>
                    </div>
                    <div className={`flex items-center gap-1 text-xs ${isDarkMode ? 'text-white/70' : 'text-white/80'}`}>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                      <span>4 Instruments</span>
                    </div>
                  </div>
                </div>
                <svg className={`h-6 w-6 ${isDarkMode ? 'text-white/50' : 'text-white/60'} group-hover:text-white transition-colors`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* Finger Drums Card */}
            <button
              onClick={() => router.push('/drums')}
              className={`group relative overflow-hidden rounded-2xl p-6 text-left transition-transform hover:scale-[1.02] ${isDarkMode ? '' : 'shadow-lg shadow-orange-500/20'}`}
            >
              <div className={`absolute inset-0 ${isDarkMode ? 'bg-gradient-to-br from-orange-600 via-red-600 to-pink-600' : 'bg-gradient-to-br from-orange-500 via-red-500 to-pink-500'} opacity-90 transition-opacity group-hover:opacity-100`} />
              {/* Animated background elements */}
              <div className="absolute inset-0 overflow-hidden">
                <div className={`absolute -top-4 -right-4 h-24 w-24 rounded-full ${isDarkMode ? 'bg-white/20' : 'bg-white/30'} blur-xl group-hover:scale-150 transition-transform duration-500`} />
                <div className={`absolute -bottom-4 -left-4 h-32 w-32 rounded-full ${isDarkMode ? 'bg-white/10' : 'bg-white/20'} blur-xl group-hover:scale-150 transition-transform duration-500`} />
              </div>
              <div className="relative flex items-start gap-4">
                <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${isDarkMode ? 'bg-white/20' : 'bg-white/40'} backdrop-blur-sm shadow-inner`}>
                  <span className="text-4xl drop-shadow-md">🥁</span>
                </div>
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <h4 className="text-xl font-bold text-white drop-shadow-sm">Finger Drums</h4>
                    <span className={`rounded-full ${isDarkMode ? 'bg-white/20' : 'bg-white/40'} px-2 py-0.5 text-xs font-medium text-white shadow-sm`}>LIVE</span>
                  </div>
                  <p className={`mb-3 text-sm ${isDarkMode ? 'text-white/80' : 'text-white/90'}`}>Play drums with your fingers using hand tracking! Touch virtual drum pads in the air to make beats.</p>
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-1 text-xs ${isDarkMode ? 'text-white/70' : 'text-white/80'}`}>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>Webcam Required</span>
                    </div>
                    <div className={`flex items-center gap-1 text-xs ${isDarkMode ? 'text-white/70' : 'text-white/80'}`}>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                      </svg>
                      <span>Hand Tracking</span>
                    </div>
                  </div>
                </div>
                <svg className={`h-6 w-6 ${isDarkMode ? 'text-white/50' : 'text-white/60'} group-hover:text-white transition-colors`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>
        </section>

        {/* For You Section */}
        <section className="mb-10">
          <div className="mb-6 flex items-center justify-between">
            <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>For You</h3>
            <button className={`flex items-center gap-2 transition-colors ${isDarkMode ? 'text-white/70 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}>
              <span>See all</span>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {forYouPlaylists.map((playlist) => (
              <button
                key={playlist.id}
                onClick={() => router.push(`/player?mood=${encodeURIComponent(playlist.name)}&type=presets`)}
                className="group relative overflow-hidden rounded-2xl p-6 text-left transition-transform hover:scale-105"
              >
                <div className={`absolute inset-0 bg-linear-to-br ${playlist.color} opacity-90 transition-opacity group-hover:opacity-100`} />
                <div className="relative">
                  <h4 className="mb-2 text-xl font-bold text-white">{playlist.name}</h4>
                  <p className="text-sm text-white/80">{playlist.description}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Popular Section */}
        <section className="mb-10">
          <div className="mb-6 flex items-center justify-between">
            <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Popular</h3>
            <button className={`flex items-center gap-2 transition-colors ${isDarkMode ? 'text-white/70 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}>
              <span>See all</span>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {popularPlaylists.map((playlist) => (
              <button
                key={playlist.id}
                onClick={() => router.push(`/player?mood=${encodeURIComponent(playlist.name)}&type=presets`)}
                className="group relative overflow-hidden rounded-2xl p-6 text-left transition-transform hover:scale-105"
              >
                <div className={`absolute inset-0 bg-linear-to-br ${playlist.color} opacity-90 transition-opacity group-hover:opacity-100`} />
                <div className="relative">
                  <h4 className="mb-2 text-xl font-bold text-white">{playlist.name}</h4>
                  <p className="text-sm text-white/80">{playlist.description}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Community Mood Mashups */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Community Mood Mashups</h3>
            <button className={`flex items-center gap-2 transition-colors ${isDarkMode ? 'text-white/70 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}>
              <span>Explore</span>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div className={`rounded-3xl p-8 backdrop-blur-xl ${isDarkMode ? 'bg-linear-to-r from-cyan-500/20 to-blue-500/20' : 'bg-linear-to-r from-cyan-100 to-blue-100'}`}>
            <p className={`text-center text-lg ${isDarkMode ? 'text-white/80' : 'text-gray-700'}`}>
              Discover playlists created by the community based on unique mood combinations
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <span className={`rounded-full px-4 py-2 text-sm ${isDarkMode ? 'bg-white/10 text-white' : 'bg-white text-gray-800'}`}>Happy + Energetic</span>
              <span className={`rounded-full px-4 py-2 text-sm ${isDarkMode ? 'bg-white/10 text-white' : 'bg-white text-gray-800'}`}>Calm + Focus</span>
              <span className={`rounded-full px-4 py-2 text-sm ${isDarkMode ? 'bg-white/10 text-white' : 'bg-white text-gray-800'}`}>Sad + Reflective</span>
              <span className={`rounded-full px-4 py-2 text-sm ${isDarkMode ? 'bg-white/10 text-white' : 'bg-white text-gray-800'}`}>Motivated + Workout</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}