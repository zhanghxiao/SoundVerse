import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { RankingsState } from '../types';

const BASE_URL = 'https://mistpe-msc.hf.space';

export const fetchRankings = createAsyncThunk(
  'rankings/fetchRankings',
  async () => {
    try {
      const [soaring, hot, newSongs, popular] = await Promise.all([
        axios.get(`${BASE_URL}/fetch_music_soaring`),
        axios.get(`${BASE_URL}/fetch_music_hot`),
        axios.get(`${BASE_URL}/fetch_music_newSongs`),
        axios.get(`${BASE_URL}/fetch_music_popular`),
      ]);

      return {
        soaring: soaring.data.data,
        hot: hot.data.data,
        newSongs: newSongs.data.data,
        popular: popular.data.data,
      };
    } catch (error) {
      console.error('Error fetching rankings:', error);
      throw error;
    }
  }
);

const initialState: RankingsState = {
  soaring: [],
  hot: [],
  newSongs: [],
  popular: [],
  loading: false,
  error: null,
};

const rankingsSlice = createSlice({
  name: 'rankings',
  initialState,
  reducers: {
    clearRankings: (state) => {
      state.soaring = [];
      state.hot = [];
      state.newSongs = [];
      state.popular = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRankings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRankings.fulfilled, (state, action) => {
        state.loading = false;
        state.soaring = action.payload.soaring;
        state.hot = action.payload.hot;
        state.newSongs = action.payload.newSongs;
        state.popular = action.payload.popular;
      })
      .addCase(fetchRankings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch rankings';
      });
  },
});

export const { clearRankings } = rankingsSlice.actions;
export default rankingsSlice.reducer;