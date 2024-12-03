import { configureStore } from '@reduxjs/toolkit';
import playerReducer from './playerSlice';
import searchReducer from './searchSlice';
import rankingsReducer from './rankingsSlice';
import playlistReducer from './playlistSlice';

export const store = configureStore({
  reducer: {
    player: playerReducer,
    search: searchReducer,
    rankings: rankingsReducer,
    playlists: playlistReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;