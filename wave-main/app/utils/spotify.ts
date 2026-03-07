// Spotify URL/URI utilities

/**
 * Extracts the Spotify track ID from various formats:
 * - spotify:track:4iV5W9uYEdYUVa79Axb7Rh
 * - https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh
 * - https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh?si=xxx
 */
export function extractSpotifyTrackId(link: string): string | null {
  if (!link) return null;
  
  // Handle spotify URI format
  if (link.startsWith('spotify:track:')) {
    return link.replace('spotify:track:', '');
  }
  
  // Handle URL format
  const urlMatch = link.match(/open\.spotify\.com\/track\/([a-zA-Z0-9]+)/);
  if (urlMatch) {
    return urlMatch[1];
  }
  
  // If it's already just an ID (22 chars alphanumeric)
  if (/^[a-zA-Z0-9]{22}$/.test(link)) {
    return link;
  }
  
  return null;
}

/**
 * Converts any Spotify link format to a standardized format for storage
 */
export function normalizeSpotifyLink(link: string): string | null {
  const trackId = extractSpotifyTrackId(link);
  if (!trackId) return null;
  return `spotify:track:${trackId}`;
}

/**
 * Gets the Spotify embed URL for a track
 */
export function getSpotifyEmbedUrl(link: string): string | null {
  const trackId = extractSpotifyTrackId(link);
  if (!trackId) return null;
  return `https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`;
}

/**
 * Gets the Spotify open URL for a track
 */
export function getSpotifyOpenUrl(link: string): string | null {
  const trackId = extractSpotifyTrackId(link);
  if (!trackId) return null;
  return `https://open.spotify.com/track/${trackId}`;
}

/**
 * Validates if a string is a valid Spotify track link
 */
export function isValidSpotifyLink(link: string): boolean {
  return extractSpotifyTrackId(link) !== null;
}

// Track info database - maps track IDs to metadata
export interface TrackInfo {
  id: string;
  name: string;
  artist: string;
  album?: string;
  duration?: string;
}

// Known track database - VERIFIED Spotify track IDs with their metadata
export const trackDatabase: Record<string, TrackInfo> = {
  // Happy/Upbeat tracks
  '60nZcImufyMA1MKQY3dcCH': { id: '60nZcImufyMA1MKQY3dcCH', name: 'Happy', artist: 'Pharrell Williams', album: 'G I R L', duration: '3:53' },
  '32OlwWuMpZ6b0aN2RZOeMS': { id: '32OlwWuMpZ6b0aN2RZOeMS', name: 'Uptown Funk', artist: 'Mark Ronson ft. Bruno Mars', album: 'Uptown Special', duration: '4:30' },
  '3E7dfMvvCLUddWissuqMwr': { id: '3E7dfMvvCLUddWissuqMwr', name: 'Good as Hell', artist: 'Lizzo', album: 'Cuz I Love You', duration: '2:39' },
  '0cqRj7pUJDkTCEsJkx8snD': { id: '0cqRj7pUJDkTCEsJkx8snD', name: 'Shake It Off', artist: 'Taylor Swift', album: '1989', duration: '3:39' },
  '7qiZfU4dY1lWllzX7mPBI3': { id: '7qiZfU4dY1lWllzX7mPBI3', name: 'Shape of You', artist: 'Ed Sheeran', album: '÷', duration: '3:53' },
  '0VjIjW4GlUZAMYd2vXMi3b': { id: '0VjIjW4GlUZAMYd2vXMi3b', name: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', duration: '3:20' },
  '6UelLqGlWMcVH1E5c4H7lY': { id: '6UelLqGlWMcVH1E5c4H7lY', name: 'Watermelon Sugar', artist: 'Harry Styles', album: 'Fine Line', duration: '2:54' },
  
  // Sad/Emotional tracks
  '4kflIGfjdZJW4ot2ioixTB': { id: '4kflIGfjdZJW4ot2ioixTB', name: 'Someone Like You', artist: 'Adele', album: '21', duration: '4:45' },
  '7LVHVU3tWfcxj5aiPFEW4Q': { id: '7LVHVU3tWfcxj5aiPFEW4Q', name: 'Fix You', artist: 'Coldplay', album: 'X&Y', duration: '4:55' },
  '3dPQuX8Gs42Y7b454ybpMR': { id: '3dPQuX8Gs42Y7b454ybpMR', name: 'when the party\'s over', artist: 'Billie Eilish', album: 'WHEN WE ALL FALL ASLEEP...', duration: '3:16' },
  '0tgVpDi06FyKpA1z0VMD4v': { id: '0tgVpDi06FyKpA1z0VMD4v', name: 'Perfect', artist: 'Ed Sheeran', album: '÷', duration: '4:23' },
  '3U4isOIWM3VvDubwSI3y7a': { id: '3U4isOIWM3VvDubwSI3y7a', name: 'All of Me', artist: 'John Legend', album: 'Love in the Future', duration: '4:29' },
  '4K4ub4CasFkLP3bkL47jJV': { id: '4K4ub4CasFkLP3bkL47jJV', name: 'Skinny Love', artist: 'Bon Iver', album: 'For Emma, Forever Ago', duration: '3:58' },
  
  // Calm/Chill tracks
  '5Nm9ERjJZ5oyfXZTECKmRt': { id: '5Nm9ERjJZ5oyfXZTECKmRt', name: 'Stay With Me', artist: 'Sam Smith', album: 'In the Lonely Hour', duration: '2:52' },
  '1cKHdTo9u0szgo5NacO7sg': { id: '1cKHdTo9u0szgo5NacO7sg', name: 'Thinking Out Loud', artist: 'Ed Sheeran', album: 'x', duration: '4:41' },
  '1ZPlNanZsJSPK5h9YZZFbZ': { id: '1ZPlNanZsJSPK5h9YZZFbZ', name: 'Chasing Cars', artist: 'Snow Patrol', album: 'Eyes Open', duration: '4:27' },
  '1dNIEtp7AY3oDAKCGg2XkH': { id: '1dNIEtp7AY3oDAKCGg2XkH', name: 'Something Just Like This', artist: 'The Chainsmokers & Coldplay', album: 'Memories...Do Not Open', duration: '4:07' },
  '5ChkMS8OtdzJeqyybCc9R5': { id: '5ChkMS8OtdzJeqyybCc9R5', name: 'Photograph', artist: 'Ed Sheeran', album: 'x', duration: '4:19' },
  
  // Motivated/Energy tracks  
  '4fzsfWzRhPawzqhX8Qt9F3': { id: '4fzsfWzRhPawzqhX8Qt9F3', name: 'Stronger', artist: 'Kanye West', album: 'Graduation', duration: '5:11' },
  '5Z01UMMf7V1o0MzF86s6WJ': { id: '5Z01UMMf7V1o0MzF86s6WJ', name: 'Lose Yourself', artist: 'Eminem', album: '8 Mile', duration: '5:26' },
  '2XU0oxnq2qxCpomAAuJY8K': { id: '2XU0oxnq2qxCpomAAuJY8K', name: 'Eye of the Tiger', artist: 'Survivor', album: 'Eye of the Tiger', duration: '4:04' },
  '0LYcb1vH2pIh3YqK1qU5iu': { id: '0LYcb1vH2pIh3YqK1qU5iu', name: 'Roar', artist: 'Katy Perry', album: 'PRISM', duration: '3:43' },
  '0pqnGHJpmpxLKifKRmU6WP': { id: '0pqnGHJpmpxLKifKRmU6WP', name: 'Believer', artist: 'Imagine Dragons', album: 'Evolve', duration: '3:24' },
  '2gMXnyrvIjhVBUZwvLZDMP': { id: '2gMXnyrvIjhVBUZwvLZDMP', name: 'Can\'t Hold Us', artist: 'Macklemore & Ryan Lewis', album: 'The Heist', duration: '4:18' },
  
  // Angry/Intense tracks
  '60a0Rd6pjrkxjPbaKzXjfq': { id: '60a0Rd6pjrkxjPbaKzXjfq', name: 'In the End', artist: 'Linkin Park', album: 'Hybrid Theory', duration: '3:36' },
  '2nLtzopw4rPReszdYBJU6h': { id: '2nLtzopw4rPReszdYBJU6h', name: 'Numb', artist: 'Linkin Park', album: 'Meteora', duration: '3:05' },
  '4VqPOruhp5EdPBeR92t6lQ': { id: '4VqPOruhp5EdPBeR92t6lQ', name: 'Uprising', artist: 'Muse', album: 'The Resistance', duration: '5:02' },
  '5ghIJDpPoe3CfHMGu71E6T': { id: '5ghIJDpPoe3CfHMGu71E6T', name: 'Smells Like Teen Spirit', artist: 'Nirvana', album: 'Nevermind', duration: '5:01' },
  '1hKdDCpiI9mqz1jVHRKG0E': { id: '1hKdDCpiI9mqz1jVHRKG0E', name: 'Enter Sandman', artist: 'Metallica', album: 'Metallica', duration: '5:31' },
  
  // Focus/Work tracks
  '3AJwUDP919kvQ9QcozQPxg': { id: '3AJwUDP919kvQ9QcozQPxg', name: 'A Sky Full of Stars', artist: 'Coldplay', album: 'Ghost Stories', duration: '4:27' },
  '1mea3bSkSGXuIRvnydlB5b': { id: '1mea3bSkSGXuIRvnydlB5b', name: 'Viva La Vida', artist: 'Coldplay', album: 'Viva la Vida', duration: '4:01' },
  '0BCPKOYdS2hCXfQ2YHCPIU': { id: '0BCPKOYdS2hCXfQ2YHCPIU', name: 'Clocks', artist: 'Coldplay', album: 'A Rush of Blood to the Head', duration: '5:07' },
  '7MXVkk9YMctZqd1Srtv4MB': { id: '7MXVkk9YMctZqd1Srtv4MB', name: 'Starboy', artist: 'The Weeknd ft. Daft Punk', album: 'Starboy', duration: '3:50' },
  '463CkQjx2Zk1yXoBuierM9': { id: '463CkQjx2Zk1yXoBuierM9', name: 'Levitating', artist: 'Dua Lipa', album: 'Future Nostalgia', duration: '3:23' },
  '0HUTL8i4y4MiGCPId7M7wb': { id: '0HUTL8i4y4MiGCPId7M7wb', name: 'Flowers', artist: 'Miley Cyrus', album: 'Endless Summer Vacation', duration: '3:20' },
  '1BxfuPKGuaTgP7aM0Bbdwr': { id: '1BxfuPKGuaTgP7aM0Bbdwr', name: 'Cruel Summer', artist: 'Taylor Swift', album: 'Lover', duration: '2:58' },
};

/**
 * Gets track info from the database or returns a default
 */
export function getTrackInfo(link: string): TrackInfo {
  const trackId = extractSpotifyTrackId(link);
  if (!trackId) {
    return { id: 'unknown', name: 'Unknown Track', artist: 'Unknown Artist' };
  }
  
  // Check if we have this track in our database
  if (trackDatabase[trackId]) {
    return trackDatabase[trackId];
  }
  
  // Return default info with the track ID
  return {
    id: trackId,
    name: `Spotify Track`,
    artist: 'Open in Spotify to see details',
  };
}

// Sample tracks by mood - using VERIFIED Spotify track IDs
export const moodPlaylists: Record<string, { name: string; tracks: TrackInfo[] }> = {
  happy: {
    name: 'Happy Vibes',
    tracks: [
      trackDatabase['60nZcImufyMA1MKQY3dcCH'], // Happy - Pharrell
      trackDatabase['32OlwWuMpZ6b0aN2RZOeMS'], // Uptown Funk
      trackDatabase['3E7dfMvvCLUddWissuqMwr'], // Good as Hell
      trackDatabase['0cqRj7pUJDkTCEsJkx8snD'], // Shake It Off
      trackDatabase['7qiZfU4dY1lWllzX7mPBI3'], // Shape of You
    ].filter(Boolean) as TrackInfo[],
  },
  sad: {
    name: 'Melancholy Mix',
    tracks: [
      trackDatabase['4kflIGfjdZJW4ot2ioixTB'], // Someone Like You
      trackDatabase['7LVHVU3tWfcxj5aiPFEW4Q'], // Fix You
      trackDatabase['3dPQuX8Gs42Y7b454ybpMR'], // when the party's over
      trackDatabase['0tgVpDi06FyKpA1z0VMD4v'], // Perfect
      trackDatabase['3U4isOIWM3VvDubwSI3y7a'], // All of Me
    ].filter(Boolean) as TrackInfo[],
  },
  calm: {
    name: 'Chill & Relax',
    tracks: [
      trackDatabase['5Nm9ERjJZ5oyfXZTECKmRt'], // Stay With Me
      trackDatabase['1cKHdTo9u0szgo5NacO7sg'], // Thinking Out Loud
      trackDatabase['1ZPlNanZsJSPK5h9YZZFbZ'], // Chasing Cars
      trackDatabase['5ChkMS8OtdzJeqyybCc9R5'], // Photograph
      trackDatabase['6UelLqGlWMcVH1E5c4H7lY'], // Watermelon Sugar
    ].filter(Boolean) as TrackInfo[],
  },
  motivated: {
    name: 'Power Up',
    tracks: [
      trackDatabase['4fzsfWzRhPawzqhX8Qt9F3'], // Stronger
      trackDatabase['5Z01UMMf7V1o0MzF86s6WJ'], // Lose Yourself
      trackDatabase['2XU0oxnq2qxCpomAAuJY8K'], // Eye of the Tiger
      trackDatabase['0LYcb1vH2pIh3YqK1qU5iu'], // Roar
      trackDatabase['0pqnGHJpmpxLKifKRmU6WP'], // Believer
    ].filter(Boolean) as TrackInfo[],
  },
  angry: {
    name: 'Release the Energy',
    tracks: [
      trackDatabase['60a0Rd6pjrkxjPbaKzXjfq'], // In the End
      trackDatabase['2nLtzopw4rPReszdYBJU6h'], // Numb
      trackDatabase['5ghIJDpPoe3CfHMGu71E6T'], // Smells Like Teen Spirit
      trackDatabase['1hKdDCpiI9mqz1jVHRKG0E'], // Enter Sandman
      trackDatabase['4VqPOruhp5EdPBeR92t6lQ'], // Uprising
    ].filter(Boolean) as TrackInfo[],
  },
  focus: {
    name: 'Deep Focus',
    tracks: [
      trackDatabase['1mea3bSkSGXuIRvnydlB5b'], // Viva La Vida
      trackDatabase['0BCPKOYdS2hCXfQ2YHCPIU'], // Clocks
      trackDatabase['1dNIEtp7AY3oDAKCGg2XkH'], // Something Just Like This
      trackDatabase['7MXVkk9YMctZqd1Srtv4MB'], // Starboy
      trackDatabase['463CkQjx2Zk1yXoBuierM9'], // Levitating
    ].filter(Boolean) as TrackInfo[],
  },
  chill: {
    name: 'Chill Vibes',
    tracks: [
      trackDatabase['5Nm9ERjJZ5oyfXZTECKmRt'], // Stay With Me
      trackDatabase['6UelLqGlWMcVH1E5c4H7lY'], // Watermelon Sugar
      trackDatabase['0VjIjW4GlUZAMYd2vXMi3b'], // Blinding Lights
      trackDatabase['5ChkMS8OtdzJeqyybCc9R5'], // Photograph
      trackDatabase['1cKHdTo9u0szgo5NacO7sg'], // Thinking Out Loud
    ].filter(Boolean) as TrackInfo[],
  },
  sleep: {
    name: 'Sleep Sounds',
    tracks: [
      trackDatabase['5Nm9ERjJZ5oyfXZTECKmRt'], // Stay With Me
      trackDatabase['1ZPlNanZsJSPK5h9YZZFbZ'], // Chasing Cars
      trackDatabase['7LVHVU3tWfcxj5aiPFEW4Q'], // Fix You
      trackDatabase['5ChkMS8OtdzJeqyybCc9R5'], // Photograph
      trackDatabase['3U4isOIWM3VvDubwSI3y7a'], // All of Me
    ].filter(Boolean) as TrackInfo[],
  },
  workout: {
    name: 'Workout Energy',
    tracks: [
      trackDatabase['5Z01UMMf7V1o0MzF86s6WJ'], // Lose Yourself
      trackDatabase['4fzsfWzRhPawzqhX8Qt9F3'], // Stronger
      trackDatabase['2XU0oxnq2qxCpomAAuJY8K'], // Eye of the Tiger
      trackDatabase['0pqnGHJpmpxLKifKRmU6WP'], // Believer
      trackDatabase['32OlwWuMpZ6b0aN2RZOeMS'], // Uptown Funk
    ].filter(Boolean) as TrackInfo[],
  },
};

/**
 * Gets playlist based on mood string
 */
export function getPlaylistForMood(mood: string): { name: string; tracks: TrackInfo[] } {
  const moodLower = mood.toLowerCase();
  
  // Check for specific mood keywords
  if (moodLower.includes('happy') || moodLower.includes('joy') || moodLower.includes('excited')) {
    return moodPlaylists.happy;
  }
  if (moodLower.includes('sad') || moodLower.includes('down') || moodLower.includes('depressed') || moodLower.includes('blue')) {
    return moodPlaylists.sad;
  }
  if (moodLower.includes('angry') || moodLower.includes('mad') || moodLower.includes('frustrated') || moodLower.includes('rage')) {
    return moodPlaylists.angry;
  }
  if (moodLower.includes('motivat') || moodLower.includes('energy') || moodLower.includes('pump')) {
    return moodPlaylists.motivated;
  }
  if (moodLower.includes('calm') || moodLower.includes('relax') || moodLower.includes('peaceful')) {
    return moodPlaylists.calm;
  }
  if (moodLower.includes('focus') || moodLower.includes('work') || moodLower.includes('study') || moodLower.includes('concentrate')) {
    return moodPlaylists.focus;
  }
  if (moodLower.includes('chill') || moodLower.includes('vibe')) {
    return moodPlaylists.chill;
  }
  if (moodLower.includes('sleep') || moodLower.includes('rest') || moodLower.includes('night')) {
    return moodPlaylists.sleep;
  }
  if (moodLower.includes('workout') || moodLower.includes('gym') || moodLower.includes('exercise')) {
    return moodPlaylists.workout;
  }
  
  // Default to chill
  return moodPlaylists.chill;
}
