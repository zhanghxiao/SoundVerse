export interface Track {
  id: string;
  title: string;
  artist: string;
  albumCover: string;
  duration: string;
  mp3: string;
  lyrics?: Array<{
    name: string;
    time: string;
  }>;
}

export interface Playlist {
  id: string;
  name: string;
  cover: string;
  tracks: Track[];
}

export interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  showLyrics: boolean;
  queue: Track[];
  currentIndex: number;
  repeatMode: 'off' | 'one' | 'all';
  shuffle: boolean;
}

export interface SearchResult {
  id: string;
  name: string;
  singer: string;
  img: string;
  url?: string;
}

export interface DetailedSongResult {
  code: number;
  msg: string;
  img: string;
  name: string;
  author: string;
  id: number;
  market: string;
  mp3: string;
  review: {
    nickname: string;
    avatarurl: string;
    time: number;
    timeStr: string;
    content: string;
  };
  lyric: Array<{
    name: string;
    time: string;
  }>;
}

export interface RankingsState {
  soaring: any[];
  hot: any[];
  newSongs: any[];
  popular: any[];
  loading: boolean;
  error: string | null;
}

export interface SearchState {
  results: SearchResult[];
  currentSongDetail: DetailedSongResult | null;
  loading: boolean;
  error: string | null;
}