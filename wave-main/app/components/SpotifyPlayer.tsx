'use client';

import { useState } from 'react';
import { getSpotifyEmbedUrl, getSpotifyOpenUrl, extractSpotifyTrackId } from '../utils/spotify';

interface SpotifyPlayerProps {
  trackLink: string;
  trackName?: string;
  artistName?: string;
  duration?: string;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
  accentColor?: string;
}

export function SpotifyPlayer({
  trackLink,
  trackName,
  artistName,
  duration,
  onNext,
  onPrevious,
  hasNext = false,
  hasPrevious = false,
  accentColor = 'from-cyan-400 to-blue-500',
}: SpotifyPlayerProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const embedUrl = getSpotifyEmbedUrl(trackLink);
  const openUrl = getSpotifyOpenUrl(trackLink);
  const trackId = extractSpotifyTrackId(trackLink);

  if (!embedUrl || !trackId) {
    return (
      <div className="rounded-2xl bg-gray-100 p-8 text-center">
        <p className="text-gray-500">Invalid Spotify track link</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Main Player */}
      <div className="rounded-2xl bg-white shadow-xl overflow-hidden">
        {/* Track Info Header */}
        <div className={`bg-linear-to-r ${accentColor} p-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
                <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
              </div>
              <div className="text-white">
                <h3 className="font-bold truncate max-w-[200px]">{trackName || 'Spotify Track'}</h3>
                <div className="flex items-center gap-2">
                  {artistName && <p className="text-sm text-white/80 truncate max-w-[150px]">{artistName}</p>}
                  {duration && (
                    <>
                      <span className="text-white/50">•</span>
                      <span className="text-sm text-white/70">{duration}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white"
              >
                <svg className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openUrl && (
                <a
                  href={openUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white"
                  title="Open in Spotify"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Spotify Embed */}
        {isExpanded && (
          <div className="w-full">
            <iframe
              src={embedUrl}
              width="100%"
              height="152"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="w-full"
            />
          </div>
        )}

        {/* Navigation Controls */}
        <div className="p-4 bg-gray-50 flex items-center justify-center gap-4">
          <button
            onClick={onPrevious}
            disabled={!hasPrevious}
            className="p-3 rounded-full bg-white shadow-md hover:shadow-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg className="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className={`w-14 h-14 rounded-full bg-linear-to-br ${accentColor} flex items-center justify-center shadow-lg`}>
            <svg className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
          </div>
          
          <button
            onClick={onNext}
            disabled={!hasNext}
            className="p-3 rounded-full bg-white shadow-md hover:shadow-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg className="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// Compact version for lists
interface SpotifyTrackItemProps {
  trackLink: string;
  trackName: string;
  artistName: string;
  duration?: string;
  isActive?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
}

export function SpotifyTrackItem({
  trackLink,
  trackName,
  artistName,
  duration,
  isActive = false,
  onClick,
  onRemove,
}: SpotifyTrackItemProps) {
  const openUrl = getSpotifyOpenUrl(trackLink);

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer ${
        isActive ? 'bg-gray-200 shadow-md' : 'bg-white hover:bg-gray-100'
      }`}
      onClick={onClick}
    >
      <div className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center ${
        isActive ? 'bg-green-500' : 'bg-gray-200'
      }`}>
        {isActive ? (
          <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        ) : (
          <svg className="h-5 w-5 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-800 truncate">{trackName}</p>
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-500 truncate">{artistName}</p>
          {duration && (
            <>
              <span className="text-gray-300">•</span>
              <span className="text-sm text-gray-400">{duration}</span>
            </>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {openUrl && (
          <a
            href={openUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-2 rounded-full hover:bg-gray-200 text-gray-400 hover:text-green-500 transition-colors"
            title="Open in Spotify"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="p-2 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors"
            title="Remove track"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
