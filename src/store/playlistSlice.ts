import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Track } from '../types';
import toast from 'react-hot-toast';

interface PlaylistState {
  currentPlaylist: Track[];
  featuredPlaylists: {
    id: string;
    name: string;
    cover: string;
  }[];
  favorites: Track[];
  playlists: {
    id: string;
    name: string;
    tracks: Track[];
  }[];
}

// Load initial state from localStorage
const loadState = () => {
  try {
    const serializedState = localStorage.getItem('playlistState');
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return undefined;
  }
};

const initialState: PlaylistState = loadState() || {
  currentPlaylist: [],
  featuredPlaylists: [
    {
      id: 'hot',
      name: 'Hot Tracks',
      cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17'
    },
    {
      id: 'soaring',
      name: 'Soaring Hits',
      cover: 'https://images.unsplash.com/photo-1616356607338-fd87169ecf1a'
    },
    {
      id: 'new',
      name: 'New Releases',
      cover: 'https://images.unsplash.com/photo-1615247001958-f4bc92fa6a4a'
    },
    {
      id: 'popular',
      name: 'Popular Now',
      cover: 'https://images.unsplash.com/photo-1616356607338-fd87169ecf1a'
    }
  ],
  favorites: [],
  playlists: [],
};

const playlistSlice = createSlice({
  name: 'playlist',
  initialState,
  reducers: {
    setCurrentPlaylist: (state, action: PayloadAction<Track[]>) => {
      state.currentPlaylist = action.payload;
      saveState(state);
    },
    addToPlaylist: (state, action: PayloadAction<Track>) => {
      if (!state.currentPlaylist.some(track => track.id === action.payload.id)) {
        state.currentPlaylist.push(action.payload);
        saveState(state);
        toast.success('Added to playlist');
      } else {
        toast.error('Track already in playlist');
      }
    },
    removeFromPlaylist: (state, action: PayloadAction<string>) => {
      state.currentPlaylist = state.currentPlaylist.filter(
        track => track.id !== action.payload
      );
      saveState(state);
      toast.success('Removed from playlist');
    },
    addToFavorites: (state, action: PayloadAction<Track>) => {
      if (!state.favorites.some(track => track.id === action.payload.id)) {
        state.favorites.push(action.payload);
        saveState(state);
        toast.success('Added to favorites');
      } else {
        toast.error('Track already in favorites');
      }
    },
    removeFromFavorites: (state, action: PayloadAction<string>) => {
      state.favorites = state.favorites.filter(
        track => track.id !== action.payload
      );
      saveState(state);
      toast.success('Removed from favorites');
    },
    createPlaylist: (state, action: PayloadAction<{ name: string }>) => {
      state.playlists.push({
        id: Date.now().toString(),
        name: action.payload.name,
        tracks: [],
      });
      saveState(state);
      toast.success('Playlist created');
    },
    addToCustomPlaylist: (state, action: PayloadAction<{ playlistId: string; track: Track }>) => {
      const playlist = state.playlists.find(p => p.id === action.payload.playlistId);
      if (playlist && !playlist.tracks.some(track => track.id === action.payload.track.id)) {
        playlist.tracks.push(action.payload.track);
        saveState(state);
        toast.success('Added to playlist');
      } else if (playlist) {
        toast.error('Track already in playlist');
      }
    },
    removeFromCustomPlaylist: (state, action: PayloadAction<{ playlistId: string; trackId: string }>) => {
      const playlist = state.playlists.find(p => p.id === action.payload.playlistId);
      if (playlist) {
        playlist.tracks = playlist.tracks.filter(track => track.id !== action.payload.trackId);
        saveState(state);
        toast.success('Removed from playlist');
      }
    },
  }
});

// Save state to localStorage
const saveState = (state: PlaylistState) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('playlistState', serializedState);
  } catch (err) {
    // Ignore write errors
  }
};

export const {
  setCurrentPlaylist,
  addToPlaylist,
  removeFromPlaylist,
  addToFavorites,
  removeFromFavorites,
  createPlaylist,
  addToCustomPlaylist,
  removeFromCustomPlaylist,
} = playlistSlice.actions;

export default playlistSlice.reducer;