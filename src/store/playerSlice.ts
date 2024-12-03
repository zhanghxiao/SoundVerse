import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PlayerState, Track } from '../types';

const initialState: PlayerState = {
  currentTrack: null,
  isPlaying: false,
  volume: 1,
  currentTime: 0,
  duration: 0,
  showLyrics: false,
  queue: [],
  currentIndex: -1,
  repeatMode: 'off', // 'off' | 'one' | 'all'
  shuffle: false,
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setCurrentTrack: (state, action: PayloadAction<Track>) => {
      state.currentTrack = action.payload;
      state.isPlaying = true;
    },
    setIsPlaying: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
    },
    setVolume: (state, action: PayloadAction<number>) => {
      state.volume = action.payload;
    },
    setCurrentTime: (state, action: PayloadAction<number>) => {
      state.currentTime = action.payload;
    },
    setDuration: (state, action: PayloadAction<number>) => {
      state.duration = action.payload;
    },
    toggleLyrics: (state) => {
      state.showLyrics = !state.showLyrics;
    },
    addToQueue: (state, action: PayloadAction<Track>) => {
      state.queue.push(action.payload);
    },
    removeFromQueue: (state, action: PayloadAction<number>) => {
      state.queue.splice(action.payload, 1);
    },
    clearQueue: (state) => {
      state.queue = [];
      state.currentIndex = -1;
    },
    playNext: (state) => {
      if (state.repeatMode === 'one') {
        // Replay current track
        return;
      }
      
      if (state.shuffle) {
        const remainingTracks = state.queue.length - (state.currentIndex + 1);
        if (remainingTracks > 0) {
          const nextIndex = Math.floor(Math.random() * remainingTracks) + state.currentIndex + 1;
          state.currentIndex = nextIndex;
          state.currentTrack = state.queue[nextIndex];
        } else if (state.repeatMode === 'all') {
          state.currentIndex = 0;
          state.currentTrack = state.queue[0];
        }
      } else {
        if (state.currentIndex < state.queue.length - 1) {
          state.currentIndex++;
          state.currentTrack = state.queue[state.currentIndex];
        } else if (state.repeatMode === 'all') {
          state.currentIndex = 0;
          state.currentTrack = state.queue[0];
        }
      }
    },
    playPrevious: (state) => {
      if (state.currentIndex > 0) {
        state.currentIndex--;
        state.currentTrack = state.queue[state.currentIndex];
      } else if (state.repeatMode === 'all') {
        state.currentIndex = state.queue.length - 1;
        state.currentTrack = state.queue[state.currentIndex];
      }
    },
    setRepeatMode: (state) => {
      if (state.repeatMode === 'off') state.repeatMode = 'one';
      else if (state.repeatMode === 'one') state.repeatMode = 'all';
      else state.repeatMode = 'off';
    },
    toggleShuffle: (state) => {
      state.shuffle = !state.shuffle;
    },
  },
});

export const {
  setCurrentTrack,
  setIsPlaying,
  setVolume,
  setCurrentTime,
  setDuration,
  toggleLyrics,
  addToQueue,
  removeFromQueue,
  clearQueue,
  playNext,
  playPrevious,
  setRepeatMode,
  toggleShuffle,
} = playerSlice.actions;

export default playerSlice.reducer;