// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Types
export interface User {
  id: number;
  username: string;
}

export interface Album {
  id: number;
  name: string;
  mood: string;
  links: string[];
  creator: string;
}

export interface ApiError {
  error: string;
}

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// ============ Authentication API ============

export async function createUser(username: string, password: string): Promise<{ id: number }> {
  return apiCall<{ id: number }>('/auth/createUser', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function loginUser(username: string, password: string): Promise<{ id: number }> {
  return apiCall<{ id: number }>('/auth', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

// ============ Albums/Playlists API ============

export async function createAlbum(
  name: string,
  mood: string,
  links: string[],
  creator: string
): Promise<{ id: number }> {
  return apiCall<{ id: number }>('/albums/create', {
    method: 'POST',
    body: JSON.stringify({ name, mood, links, creator }),
  });
}

export async function getUserAlbums(username: string): Promise<{ albums: Album[] }> {
  return apiCall<{ albums: Album[] }>(`/albums/${encodeURIComponent(username)}`);
}

export async function deleteAlbum(id: number): Promise<void> {
  await apiCall<void>(`/albums/${id}`, {
    method: 'DELETE',
  });
}

export async function addSongsToAlbum(id: number, links: string[]): Promise<void> {
  await apiCall<void>(`/albums/${id}/addsong`, {
    method: 'POST',
    body: JSON.stringify({ links }),
  });
}

export async function removeSongsFromAlbum(id: number, links: string[]): Promise<void> {
  await apiCall<void>(`/albums/${id}/removesong`, {
    method: 'DELETE',
    body: JSON.stringify({ links }),
  });
}


