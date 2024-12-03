// Search.tsx
import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SearchIcon, X, Play, Heart, Plus, Download, Pause, MoreHorizontal } from 'lucide-react';
import { AppDispatch, RootState } from '../store/store';
import { searchMusic, getSongDetails } from '../store/searchSlice';
import { setCurrentTrack, setIsPlaying } from '../store/playerSlice';
import { addToFavorites, addToPlaylist } from '../store/playlistSlice';
import { downloadTrack } from '../utils/download';
import type { Track, SearchResult } from '../types';
import { toast } from 'react-hot-toast';
import { useMediaQuery } from '../hooks/useMediaQuery';

interface SearchProps {
  onClose: () => void;
}

export default function Search({ onClose }: SearchProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [query, setQuery] = useState('');
  const [loadingTrackId, setLoadingTrackId] = useState<string | null>(null);
  const [showActionsFor, setShowActionsFor] = useState<string | null>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const { results, loading, error } = useSelector((state: RootState) => state.search);
  const { currentTrack, isPlaying } = useSelector((state: RootState) => state.player);
  const { favorites } = useSelector((state: RootState) => state.playlists);

  const handleSearch = async () => {
    if (query.trim()) {
      try {
        await dispatch(searchMusic(query)).unwrap();
      } catch (err) {
        toast.error('Search failed');
      }
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handlePlaySong = async (result: SearchResult) => {
    if (currentTrack?.id === result.id) {
      dispatch(setIsPlaying(!isPlaying));
      return;
    }

    setLoadingTrackId(result.id);
    try {
      const songDetails = await dispatch(getSongDetails({ query: result.name, n: 1 })).unwrap();
      
      if (songDetails && songDetails.mp3) {
        const track: Track = {
          id: result.id,
          title: songDetails.name,
          artist: songDetails.author,
          albumCover: songDetails.img,
          duration: songDetails.market,
          mp3: songDetails.mp3,
          lyrics: songDetails.lyric
        };
        
        dispatch(setCurrentTrack(track));
        dispatch(setIsPlaying(true));
        toast.success(`Now playing: ${track.title}`);
      } else {
        toast.error('Unable to play this song');
      }
    } catch (err) {
      toast.error('Failed to get song details');
    } finally {
      setLoadingTrackId(null);
    }
  };
  const handleAddToFavorites = async (result: SearchResult) => {
    try {
      const songDetails = await dispatch(getSongDetails({ query: result.name, n: 1 })).unwrap();
      const track: Track = {
        id: result.id,
        title: songDetails.name || result.name,
        artist: songDetails.author || result.singer,
        albumCover: songDetails.img || result.img,
        duration: songDetails.market || '0:00',
        mp3: songDetails.mp3 || ''
      };
      
      const isInFavorites = favorites.some(fav => fav.id === track.id);
      if (!isInFavorites) {
        dispatch(addToFavorites(track));
        toast.success('Added to favorites');
      } else {
        toast.error('Already in favorites');
      }
    } catch (err) {
      toast.error('Failed to add to favorites');
    }
  };
  
  const handleAddToPlaylist = async (result: SearchResult) => {
    try {
      const songDetails = await dispatch(getSongDetails({ query: result.name, n: 1 })).unwrap();
      const track: Track = {
        id: result.id,
        title: songDetails.name || result.name,
        artist: songDetails.author || result.singer,
        albumCover: songDetails.img || result.img,
        duration: songDetails.market || '0:00',
        mp3: songDetails.mp3 || ''
      };
      dispatch(addToPlaylist(track));
      toast.success('Added to playlist');
    } catch (err) {
      toast.error('Failed to add to playlist');
    }
  };
  
  const handleDownload = async (result: SearchResult) => {
    try {
      const songDetails = await dispatch(getSongDetails({ query: result.name, n: 1 })).unwrap();
      if (songDetails && songDetails.mp3) {
        await downloadTrack(songDetails.mp3, result.name, result.singer);
      } else {
        toast.error('Download URL not available');
      }
    } catch (err) {
      toast.error('Failed to download song');
    }
  };
  const renderSearchResult = (result: SearchResult) => {
    const isCurrentTrack = currentTrack?.id === result.id;
    const isInFavorites = favorites.some(track => track.id === result.id);
    const isLoading = loadingTrackId === result.id;

    return (
      <div
        key={result.id}
        className={`group p-4 flex items-center space-x-4 ${
          isCurrentTrack ? 'bg-indigo-900/30' : 'hover:bg-white/5'
        } transition-all duration-300 rounded-lg`}
      >
        {/* Play Button */}
        <div className="flex-shrink-0">
          {isLoading ? (
            <div className="w-12 h-12 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <button
              onClick={() => handlePlaySong(result)}
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isCurrentTrack ? 'bg-green-500 text-black' : 'bg-white/10 text-white'
              } hover:bg-green-500 hover:text-black transition-colors`}
            >
              {isCurrentTrack && isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6" />
              )}
            </button>
          )}
        </div>

        {/* Song Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-4">
            <img
              src={result.img || 'https://placehold.co/48x48'}
              alt={result.name}
              className={`w-12 h-12 rounded-lg object-cover ${
                isCurrentTrack && isPlaying ? 'animate-spin-slow' : ''
              }`}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://placehold.co/48x48';
              }}
            />
            <div className="min-w-0">
              <h3 className={`font-medium truncate ${
                isCurrentTrack ? 'text-green-500' : 'text-white'
              }`}>
                {result.name}
              </h3>
              <p className="text-sm text-gray-400 truncate">{result.singer}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        {isMobile ? (
          <div className="flex-shrink-0">
            <button 
              onClick={() => setShowActionsFor(showActionsFor === result.id ? null : result.id)}
              className="p-2 rounded-full hover:bg-white/10 text-gray-400"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
            {showActionsFor === result.id && (
              <div className="absolute right-4 mt-2 py-2 w-48 bg-zinc-800 rounded-lg shadow-xl z-10">
                <button 
                  onClick={() => {
                    handleAddToFavorites(result);
                    setShowActionsFor(null);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-white/10 flex items-center space-x-2"
                >
                  <Heart className={`h-4 w-4 ${isInFavorites ? 'text-pink-500' : 'text-gray-400'}`} />
                  <span>Add to Favorites</span>
                </button>
                <button 
                  onClick={() => {
                    handleAddToPlaylist(result);
                    setShowActionsFor(null);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-white/10 flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4 text-gray-400" />
                  <span>Add to Playlist</span>
                </button>
                <button 
                  onClick={() => {
                    handleDownload(result);
                    setShowActionsFor(null);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-white/10 flex items-center space-x-2"
                >
                  <Download className="h-4 w-4 text-gray-400" />
                  <span>Download</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => handleAddToFavorites(result)}
              className={`p-2 rounded-full hover:bg-white/10 ${
                isInFavorites ? 'text-pink-500' : 'text-gray-400 hover:text-pink-500'
              }`}
            >
              <Heart className="h-5 w-5" />
            </button>
            <button 
              onClick={() => handleAddToPlaylist(result)}
              className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white"
            >
              <Plus className="h-5 w-5" />
            </button>
            <button 
              onClick={() => handleDownload(result)}
              className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white"
            >
              <Download className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 bg-gradient-to-b from-indigo-900 via-purple-900 to-zinc-900 overflow-y-auto">
      <div className="p-4 md:p-6">
        {/* Search Header */}
        <div className="flex items-center space-x-4 mb-8">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="search"
              value={query}
              onChange={handleSearchChange}
              onKeyPress={handleKeyPress}
              placeholder="Search for songs, artists, or albums"
              className="w-full pl-12 pr-16 py-3 bg-white/10 border border-white/10 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20"
            />
            {/* 添加搜索按钮 */}
            <button
              onClick={handleSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <SearchIcon className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>

        {/* Search Results */}
        <div className="space-y-2">
          {loading ? (
            // Loading skeletons
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white/5 h-20 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : error ? (
            // Error state
            <div className="text-center py-8">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-white/10 rounded-full text-white hover:bg-white/20"
              >
                Try Again
              </button>
            </div>
          ) : results.length > 0 ? (
            // Results list
            <div className="space-y-2">
              {results.map(result => renderSearchResult(result))}
            </div>
          ) : query ? (
            // No results
            <div className="text-center py-8">
              <p className="text-gray-400">No results found for "{query}"</p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Mobile optimization: Add bottom padding to avoid player overlap */}
      <div className="h-40 md:h-0" />
    </div>
  );
}