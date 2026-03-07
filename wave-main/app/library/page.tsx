'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { getUserAlbums, deleteAlbum, Album } from '../utils/api';

export default function LibraryPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoadingAlbums, setIsLoadingAlbums] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
      return;
    }

    if (user) {
      loadAlbums();
    }
  }, [user, isAuthenticated, isLoading, router]);

  const loadAlbums = async () => {
    if (!user) return;
    
    setIsLoadingAlbums(true);
    setError(null);
    
    try {
      const response = await getUserAlbums(user.username);
      setAlbums(response.albums || []);
    } catch (err) {
      console.error('Failed to load albums:', err);
      setError('Failed to load your playlists. Please try again.');
    } finally {
      setIsLoadingAlbums(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this playlist?')) return;
    
    setDeletingId(id);
    try {
      await deleteAlbum(id);
      setAlbums(albums.filter(a => a.id !== id));
    } catch (err) {
      console.error('Failed to delete album:', err);
      alert('Failed to delete playlist. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const getMoodColor = (mood: string) => {
    const moodLower = mood.toLowerCase();
    if (moodLower.includes('happy') || moodLower.includes('joy')) return 'from-yellow-400 to-orange-400';
    if (moodLower.includes('sad') || moodLower.includes('down')) return 'from-blue-400 to-indigo-400';
    if (moodLower.includes('angry') || moodLower.includes('mad')) return 'from-red-500 to-orange-500';
    if (moodLower.includes('calm') || moodLower.includes('relax')) return 'from-purple-400 to-pink-400';
    if (moodLower.includes('energy') || moodLower.includes('pump')) return 'from-green-400 to-emerald-500';
    if (moodLower.includes('focus') || moodLower.includes('work')) return 'from-cyan-400 to-blue-400';
    return 'from-gray-400 to-slate-500';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-950 via-cyan-950 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-950 via-cyan-950 to-blue-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-lg">
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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-cyan-400 to-blue-500 shadow-lg">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">My Library</h1>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-cyan-500/20 border border-cyan-400/30 px-4 py-2">
            <div className="h-6 w-6 rounded-full bg-linear-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
              <span className="text-xs font-bold text-white">{user?.username.charAt(0).toUpperCase()}</span>
            </div>
            <span className="text-sm font-medium text-cyan-300">{user?.username}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Your Saved Playlists</h2>
          <p className="text-white/60">
            {albums.length === 0 
              ? 'You haven\'t saved any playlists yet. Create one from the mood selector!'
              : `You have ${albums.length} saved playlist${albums.length === 1 ? '' : 's'}`
            }
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-500/20 border border-red-400/30 rounded-xl text-red-300">
            {error}
            <button onClick={loadAlbums} className="ml-4 underline hover:no-underline">
              Retry
            </button>
          </div>
        )}

        {isLoadingAlbums ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl bg-white/5 p-6 animate-pulse">
                <div className="h-32 bg-white/10 rounded-xl mb-4" />
                <div className="h-6 bg-white/10 rounded mb-2 w-3/4" />
                <div className="h-4 bg-white/10 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : albums.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">🎵</div>
            <h3 className="text-xl font-bold text-white mb-3">No Playlists Yet</h3>
            <p className="text-white/60 mb-6 max-w-md mx-auto">
              Start by selecting a mood on the home page. You can save playlists that match your vibe!
            </p>
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-cyan-500 to-blue-500 text-white font-medium shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all hover:scale-105"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Your First Playlist
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {albums.map((album) => (
              <div
                key={album.id}
                className="group relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-white/20 transition-all hover:scale-[1.02]"
              >
                {/* Album Cover */}
                <div className={`h-32 bg-linear-to-br ${getMoodColor(album.mood)} relative`}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="h-16 w-16 text-white/80" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                    </svg>
                  </div>
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button
                      onClick={() => handleDelete(album.id)}
                      disabled={deletingId === album.id}
                      className="p-2 rounded-full bg-black/40 text-white/80 hover:text-red-400 hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100"
                    >
                      {deletingId === album.id ? (
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Album Info */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-white mb-1 truncate">{album.name}</h3>
                  <p className="text-white/60 text-sm mb-3">
                    {album.links.length} song{album.links.length !== 1 ? 's' : ''} • {album.mood}
                  </p>
                  <button
                    onClick={() => router.push(`/player?albumId=${album.id}&username=${user?.username}&mood=${encodeURIComponent(album.mood)}`)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-medium transition-colors"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                    </svg>
                    Play on Spotify
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

