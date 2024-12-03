import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { SearchState, SearchResult, DetailedSongResult } from '../types';

export const searchMusic = createAsyncThunk(
  'search/searchMusic',
  async (query: string) => {
    const response = await axios.get(`https://api.lolimi.cn/API/wydg/?msg=${query}`);
    if (response.data.code !== 200) {
      throw new Error(response.data.msg || 'Search failed');
    }
    return response.data.data as SearchResult[];
  }
);

export const getSongDetails = createAsyncThunk(
  'search/getSongDetails',
  async ({ query, n }: { query: string; n: number }) => {
    const response = await axios.get(`https://api.lolimi.cn/API/wydg/?msg=${query}&n=${n}`);
    if (response.data.code !== 200) {
      throw new Error(response.data.msg || 'Failed to get song details');
    }
    return response.data as DetailedSongResult;
  }
);

const initialState: SearchState = {
  results: [],
  currentSongDetail: null,
  loading: false,
  error: null,
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    clearResults: (state) => {
      state.results = [];
      state.currentSongDetail = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchMusic.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchMusic.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload;
      })
      .addCase(searchMusic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to search music';
      })
      .addCase(getSongDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSongDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSongDetail = action.payload;
      })
      .addCase(getSongDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to get song details';
      });
  },
});

export const { clearResults } = searchSlice.actions;
export default searchSlice.reducer;