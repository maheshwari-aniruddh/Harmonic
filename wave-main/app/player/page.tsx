'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { getMoodColor } from '../utils/moodColors';
import { useAuth } from '../context/AuthContext';
import { createAlbum, getUserAlbums, addSongsToAlbum, removeSongsFromAlbum, Album } from '../utils/api';
import { SpotifyPlayer, SpotifyTrackItem } from '../components/SpotifyPlayer';
import { 
  getPlaylistForMood,
  getTrackInfo,
  isValidSpotifyLink, 
  normalizeSpotifyLink,
  extractSpotifyTrackId,
  TrackInfo,
} from '../utils/spotify';

interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  spotifyLink: string;
  duration?: string;
}

function PlayerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  
  const mood = searchParams.get('mood') || 'Chill';
  const albumId = searchParams.get('albumId');
  const type = searchParams.get('type'); // 'presets' or 'artists'

  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [playlistName, setPlaylistName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showAddTrack, setShowAddTrack] = useState(false);
  const [newTrackUrl, setNewTrackUrl] = useState('');
  const [newTrackName, setNewTrackName] = useState('');
  const [newTrackArtist, setNewTrackArtist] = useState('');
  const [addTrackError, setAddTrackError] = useState<string | null>(null);
  const [currentAlbumId, setCurrentAlbumId] = useState<number | null>(albumId ? parseInt(albumId) : null);
  const [userPlaylists, setUserPlaylists] = useState<Album[]>([]);
  const [showPlaylistSelector, setShowPlaylistSelector] = useState(false);

  const colors = getMoodColor(mood);

  // Convert TrackInfo to SpotifyTrack
  const trackInfoToSpotifyTrack = (info: TrackInfo): SpotifyTrack => ({
    id: info.id,
    name: info.name,
    artist: info.artist,
    spotifyLink: `spotify:track:${info.id}`,
    duration: info.duration,
  });

  // Get track info from a link
  const linkToSpotifyTrack = (link: string): SpotifyTrack => {
    const info = getTrackInfo(link);
    return {
      id: info.id,
      name: info.name,
      artist: info.artist,
      spotifyLink: normalizeSpotifyLink(link) || link,
      duration: info.duration,
    };
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      // If we have an albumId, load from backend
      if (albumId && user) {
        try {
          const response = await getUserAlbums(user.username);
          const albums = response.albums || [];
          const album = albums.find(a => a.id === parseInt(albumId));
          
          if (album) {
            setPlaylistName(album.name);
            setCurrentAlbumId(album.id);
            
            // Convert links to track objects with real names
            const loadedTracks: SpotifyTrack[] = album.links.map(link => linkToSpotifyTrack(link));
            setTracks(loadedTracks);
          } else {
            // Album not found, use sample tracks
            loadMoodBasedTracks();
          }
        } catch (error) {
          console.error('Failed to load album:', error);
          loadMoodBasedTracks();
        }
      } else {
        // Use sample tracks based on mood
        loadMoodBasedTracks();
      }
      
      // Also load user's playlists for the mood selector
      if (user && isAuthenticated) {
        try {
          const response = await getUserAlbums(user.username);
          const matchingPlaylists = (response.albums || []).filter(
            a => a.mood.toLowerCase() === mood.toLowerCase()
          );
          setUserPlaylists(matchingPlaylists);
        } catch (error) {
          console.error('Failed to load user playlists:', error);
        }
      }
      
      setIsLoading(false);
    };

    const loadMoodBasedTracks = () => {
      const playlist = getPlaylistForMood(mood);
      setPlaylistName(playlist.name);
      setTracks(playlist.tracks.map(trackInfoToSpotifyTrack));
    };

    loadData();
  }, [albumId, user, mood, isAuthenticated]);

  const handleNext = () => {
    if (currentTrackIndex < tracks.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1);
    }
  };

  const handleSavePlaylist = async () => {
    if (!isAuthenticated || !user) {
      alert('Please sign in to save playlists');
      return;
    }

    if (tracks.length === 0) {
      setSaveError('No tracks to save');
      return;
    }

    const links = tracks.map(t => t.spotifyLink);

    setIsSaving(true);
    setSaveError(null);

    try {
      const response = await createAlbum(
        playlistName || `${mood} Playlist`,
        mood,
        links,
        user.username
      );
      setCurrentAlbumId(response.id);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save playlist:', error);
      setSaveError('Failed to save playlist. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTrack = async () => {
    setAddTrackError(null);
    
    if (!newTrackUrl.trim()) {
      setAddTrackError('Please enter a Spotify link');
      return;
    }

    if (!isValidSpotifyLink(newTrackUrl)) {
      setAddTrackError('Invalid Spotify link. Use format: https://open.spotify.com/track/...');
      return;
    }

    const normalizedLink = normalizeSpotifyLink(newTrackUrl);
    if (!normalizedLink) {
      setAddTrackError('Could not parse Spotify link');
      return;
    }

    const trackId = extractSpotifyTrackId(newTrackUrl);
    
    // Check if track already exists
    if (tracks.some(t => t.id === trackId)) {
      setAddTrackError('This track is already in the playlist');
      return;
    }

    // Get track info from our database or use provided info
    const trackInfo = getTrackInfo(newTrackUrl);
    const newTrack: SpotifyTrack = {
      id: trackId || `track-${Date.now()}`,
      name: newTrackName.trim() || trackInfo.name,
      artist: newTrackArtist.trim() || trackInfo.artist,
      spotifyLink: normalizedLink,
    };

    // If we have a saved album, add to backend
    if (currentAlbumId && isAuthenticated) {
      try {
        await addSongsToAlbum(currentAlbumId, [normalizedLink]);
      } catch (error) {
        console.error('Failed to add track to backend:', error);
        // Still add locally even if backend fails
      }
    }

    setTracks([...tracks, newTrack]);
    setNewTrackUrl('');
    setNewTrackName('');
    setNewTrackArtist('');
    setShowAddTrack(false);
  };

  const handleRemoveTrack = async (index: number) => {
    const trackToRemove = tracks[index];
    
    // If we have a saved album, remove from backend
    if (currentAlbumId && isAuthenticated) {
      try {
        await removeSongsFromAlbum(currentAlbumId, [trackToRemove.spotifyLink]);
      } catch (error) {
        console.error('Failed to remove track from backend:', error);
      }
    }

    const newTracks = tracks.filter((_, i) => i !== index);
    setTracks(newTracks);
    
    // Adjust current track index if needed
    if (currentTrackIndex >= newTracks.length) {
      setCurrentTrackIndex(Math.max(0, newTracks.length - 1));
    }
  };

  const handleLoadPlaylist = async (playlist: Album) => {
    setPlaylistName(playlist.name);
    setCurrentAlbumId(playlist.id);
    setTracks(playlist.links.map(link => linkToSpotifyTrack(link)));
    setCurrentTrackIndex(0);
    setShowPlaylistSelector(false);
  };

  const currentTrack = tracks[currentTrackIndex];

  if (isLoading) {
    return (
      <div className={`min-h-screen ${colors.bg} flex items-center justify-center`}>
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-gray-400/30 border-t-gray-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading playlist...</p>
        </div>
      </div>
    );
  }

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
            <span>Home</span>
          </button>
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br ${colors.accent} shadow-md`}>
              <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Moodify</h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Load from Library Button */}
            {isAuthenticated && userPlaylists.length > 0 && (
              <button
                onClick={() => setShowPlaylistSelector(true)}
                className="flex items-center gap-2 rounded-full px-4 py-2 font-medium bg-white/80 text-gray-700 hover:bg-white shadow-md transition-all"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                My Playlists
              </button>
            )}
            
            {/* Save Button */}
            {isAuthenticated && !currentAlbumId && (
              <button
                onClick={handleSavePlaylist}
                disabled={isSaving || tracks.length === 0}
                className={`flex items-center gap-2 rounded-full px-4 py-2 font-medium transition-all ${
                  saveSuccess
                    ? 'bg-green-500 text-white'
                    : 'bg-white/80 text-gray-700 hover:bg-white shadow-md'
                } disabled:opacity-50`}
              >
                {isSaving ? (
                  <>
                    <div className="h-4 w-4 border-2 border-gray-400 border-t-gray-700 rounded-full animate-spin" />
                    Saving...
                  </>
                ) : saveSuccess ? (
                  <>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Saved!
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Save
                  </>
                )}
              </button>
            )}
            
            <div className={`flex items-center gap-2 rounded-full border-2 ${colors.border} ${colors.cardBg} px-4 py-2 shadow-md backdrop-blur-sm`}>
              <span className="text-xl">🎵</span>
              <span className={`text-sm font-medium ${colors.text}`}>{mood}</span>
            </div>
          </div>
        </div>
      </header>
      
      {saveError && (
        <div className="mx-auto max-w-7xl px-6 pt-4">
          <div className="p-3 bg-red-100 border border-red-300 rounded-xl text-red-700 text-sm">
            {saveError}
          </div>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Playlist Header */}
        <div className="mb-8 text-center">
          <h2 className={`text-3xl font-bold ${colors.text} mb-2`}>{playlistName}</h2>
          <p className="text-gray-600">
            {tracks.length} track{tracks.length !== 1 ? 's' : ''} • Powered by Spotify
          </p>
          {currentAlbumId && (
            <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
              ✓ Saved to your library
            </span>
          )}
        </div>

        {tracks.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">🎵</div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">No Tracks Yet</h3>
            <p className="text-gray-600 mb-6">Add some Spotify tracks to get started!</p>
            <button
              onClick={() => setShowAddTrack(true)}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r ${colors.accent} text-white font-medium shadow-lg hover:scale-105 transition-all`}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Your First Track
            </button>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
            {/* Main Player */}
            <div>
              {currentTrack && (
                <SpotifyPlayer
                  trackLink={currentTrack.spotifyLink}
                  trackName={currentTrack.name}
                  artistName={currentTrack.artist}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                  hasNext={currentTrackIndex < tracks.length - 1}
                  hasPrevious={currentTrackIndex > 0}
                  accentColor={colors.accent}
                />
              )}
              
              {/* Track Counter */}
              <div className="mt-4 text-center text-gray-600">
                Track {currentTrackIndex + 1} of {tracks.length}
              </div>
            </div>

            {/* Playlist Sidebar */}
            <div className={`rounded-3xl p-6 shadow-xl backdrop-blur-xl ${colors.cardBg}`}>
              <div className="mb-4 flex items-center justify-between">
                <h3 className={`text-xl font-bold ${colors.text}`}>Playlist</h3>
                <button
                  onClick={() => setShowAddTrack(true)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-xl bg-linear-to-r ${colors.accent} text-white text-sm font-medium hover:scale-105 transition-all`}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add
                </button>
              </div>

              <div className="max-h-[500px] space-y-2 overflow-y-auto">
                {tracks.map((track, index) => (
                  <SpotifyTrackItem
                    key={track.id}
                    trackLink={track.spotifyLink}
                    trackName={track.name}
                    artistName={track.artist}
                    duration={track.duration}
                    isActive={index === currentTrackIndex}
                    onClick={() => setCurrentTrackIndex(index)}
                    onRemove={() => handleRemoveTrack(index)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Playlist Selector Modal */}
      {showPlaylistSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowPlaylistSelector(false)}
          />
          <div className="relative w-full max-w-md mx-4 rounded-3xl p-8 shadow-2xl bg-white max-h-[80vh] overflow-hidden flex flex-col">
            <button
              onClick={() => setShowPlaylistSelector(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-400"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center mb-6">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-linear-to-br ${colors.accent} flex items-center justify-center`}>
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Your {mood} Playlists</h2>
              <p className="text-gray-500 mt-1">Select a playlist to load</p>
            </div>

            <div className="overflow-y-auto flex-1 space-y-3">
              {userPlaylists.map((playlist) => (
                <button
                  key={playlist.id}
                  onClick={() => handleLoadPlaylist(playlist)}
                  className={`w-full p-4 rounded-xl border-2 border-gray-100 hover:border-gray-200 bg-gray-50 hover:bg-gray-100 transition-all text-left group ${
                    currentAlbumId === playlist.id ? 'ring-2 ring-green-500 border-green-500' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg bg-linear-to-br ${colors.accent} flex items-center justify-center flex-shrink-0`}>
                      <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-800 truncate">{playlist.name}</h4>
                      <p className="text-sm text-gray-500">
                        {playlist.links.length} track{playlist.links.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    {currentAlbumId === playlist.id && (
                      <svg className="h-5 w-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    <svg className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Track Modal */}
      {showAddTrack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAddTrack(false)}
          />
          <div className="relative w-full max-w-md mx-4 rounded-3xl p-8 shadow-2xl bg-white">
            <button
              onClick={() => setShowAddTrack(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-400"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500 flex items-center justify-center">
                <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Add Spotify Track</h2>
              <p className="text-gray-500 mt-1">Paste a Spotify track link</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Spotify Link *
                </label>
                <input
                  type="text"
                  value={newTrackUrl}
                  onChange={(e) => setNewTrackUrl(e.target.value)}
                  placeholder="https://open.spotify.com/track/..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Track Name (optional - we&apos;ll try to auto-detect)
                </label>
                <input
                  type="text"
                  value={newTrackName}
                  onChange={(e) => setNewTrackName(e.target.value)}
                  placeholder="Enter track name"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Artist Name (optional - we&apos;ll try to auto-detect)
                </label>
                <input
                  type="text"
                  value={newTrackArtist}
                  onChange={(e) => setNewTrackArtist(e.target.value)}
                  placeholder="Enter artist name"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                />
              </div>

              {addTrackError && (
                <div className="p-3 bg-red-100 border border-red-300 rounded-xl text-red-700 text-sm">
                  {addTrackError}
                </div>
              )}

              <button
                onClick={handleAddTrack}
                className="w-full py-4 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-lg transition-colors"
              >
                Add Track
              </button>
            </div>

            <p className="mt-4 text-center text-gray-400 text-xs">
              Copy a track link from Spotify app or web player
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PlayerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-linear-to-br from-gray-50 via-slate-50 to-gray-100" />}>
      <PlayerContent />
    </Suspense>
  );
}
