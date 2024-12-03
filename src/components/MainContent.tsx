import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Play, Heart, Plus, ChevronRight, Download, Pause, MoreHorizontal } from 'lucide-react';
import { AppDispatch, RootState } from '../store/store';
import { fetchRankings } from '../store/rankingsSlice';
import { setCurrentTrack, setIsPlaying, addToQueue } from '../store/playerSlice';
import { addToFavorites, addToPlaylist } from '../store/playlistSlice';
import { getSongDetails } from '../store/searchSlice';
import { downloadTrack } from '../utils/download';
import { useMediaQuery } from '../hooks/useMediaQuery';
import toast from 'react-hot-toast';
import { Track } from '../types';

interface TabData {
  id: string;
  name: string;
  data: any[];
}

export default function MainContent() {
  const dispatch = useDispatch<AppDispatch>();
  const [activeTab, setActiveTab] = useState('soaring');
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [hoveredTrackId, setHoveredTrackId] = useState<string | null>(null);
  const [showActionsFor, setShowActionsFor] = useState<string | null>(null);
  const [loadingTrack, setLoadingTrack] = useState<string | null>(null);
  
  const isMobile = useMediaQuery('(max-width: 768px)');

  const { soaring, hot, newSongs, popular, loading, error } = useSelector(
    (state: RootState) => state.rankings
  );
  
  const { currentTrack, isPlaying, queue } = useSelector((state: RootState) => state.player);
  const { favorites } = useSelector((state: RootState) => state.playlists);

  const tabs: TabData[] = [
    { id: 'soaring', name: '🔥 Trending', data: soaring },
    { id: 'hot', name: '⭐ Hot', data: hot },
    { id: 'new', name: '🆕 New', data: newSongs },
    { id: 'popular', name: '👑 Popular', data: popular },
  ];

  useEffect(() => {
    dispatch(fetchRankings());
  }, [dispatch]);

  // Handle play/pause
  const handlePlay = async (item: any) => {
    // If clicked track is currently playing, toggle play/pause
    if (currentTrack?.id === item.id) {
      dispatch(setIsPlaying(!isPlaying));
      return;
    }

    // Set loading state
    setLoadingTrack(item.id);
    setPlayingTrackId(item.id);

    try {
      // Get song details including mp3 URL and lyrics
      const songDetails = await dispatch(getSongDetails({ query: item.song, n: 1 })).unwrap();
      
      if (songDetails && songDetails.mp3) {
        // Create track object
        const track: Track = {
          id: item.id,
          title: songDetails.name,
          artist: songDetails.author,
          albumCover: songDetails.img || item.cover,
          duration: songDetails.market || '0:00',
          mp3: songDetails.mp3,
          lyrics: songDetails.lyric
        };
        
        // Set as current track and start playing
        dispatch(setCurrentTrack(track));
        dispatch(setIsPlaying(true));

        // Add remaining songs from current tab to queue
        const currentTabData = tabs.find(tab => tab.id === activeTab)?.data || [];
        const startIndex = currentTabData.findIndex(song => song.id === item.id);
        const remainingSongs = currentTabData.slice(startIndex + 1);
        
        remainingSongs.forEach(song => {
          dispatch(addToQueue({
            id: song.id,
            title: song.song,
            artist: song.singer,
            albumCover: song.cover,
            duration: '0:00',
            mp3: '' // Will be loaded when played
          }));
        });

        toast.success(`Now playing: ${track.title}`);
      } else {
        toast.error('Unable to play this song');
      }
    } catch (err) {
      console.error('Play error:', err);
      toast.error('Failed to get song details');
    } finally {
      setLoadingTrack(null);
      setPlayingTrackId(null);
    }
  };

  // Handle adding to favorites
  const handleAddToFavorites = async (item: any) => {
    try {
      const songDetails = await dispatch(getSongDetails({ query: item.song, n: 1 })).unwrap();
      const track = {
        id: item.id,
        title: songDetails.name || item.song,
        artist: songDetails.author || item.singer,
        albumCover: songDetails.img || item.cover,
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
      console.error('Add to favorites error:', err);
      toast.error('Failed to add to favorites');
    }
  };

  // Handle adding to playlist
  const handleAddToPlaylist = async (item: any) => {
    try {
      const songDetails = await dispatch(getSongDetails({ query: item.song, n: 1 })).unwrap();
      const track = {
        id: item.id,
        title: songDetails.name || item.song,
        artist: songDetails.author || item.singer,
        albumCover: songDetails.img || item.cover,
        duration: songDetails.market || '0:00',
        mp3: songDetails.mp3 || ''
      };
      dispatch(addToPlaylist(track));
      toast.success('Added to playlist');
    } catch (err) {
      console.error('Add to playlist error:', err);
      toast.error('Failed to add to playlist');
    }
  };

  // Render track row
  const renderTrackRow = (item: any, index: number) => {
    const isCurrentTrack = currentTrack?.id === item.id;
    const isHovered = hoveredTrackId === item.id;
    const isInFavorites = favorites.some(track => track.id === item.id);
    const isShowingActions = showActionsFor === item.id;
    const isLoading = loadingTrack === item.id;

    return (
      <div 
        key={item.id}
        className={`group p-4 flex items-center transition-all duration-300 ${
          isCurrentTrack ? 'bg-indigo-900/30' : 'hover:bg-white/5'
        }`}
        onMouseEnter={() => !isMobile && setHoveredTrackId(item.id)}
        onMouseLeave={() => !isMobile && setHoveredTrackId(null)}
      >
        {/* Play Button/Index */}
<div className="w-12 flex-shrink-0">
  {isLoading ? (
    <div className="w-8 h-8 flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
    </div>
  ) : isMobile ? (
    // 移动端始终显示播放按钮
    <button
      onClick={() => handlePlay(item)}
      className={`w-8 h-8 flex items-center justify-center rounded-full ${
        isCurrentTrack ? 'bg-green-500' : 'bg-white/10'
      } text-white hover:bg-green-500 hover:text-black transition-colors`}
    >
      {isCurrentTrack && isPlaying ? (
        <Pause className="h-4 w-4" />
      ) : (
        <Play className="h-4 w-4" />
      )}
    </button>
  ) : (
    // 桌面端保持原有的悬停效果
    isHovered || isCurrentTrack ? (
      <button
        onClick={() => handlePlay(item)}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-green-500 text-black"
      >
        {isCurrentTrack && isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </button>
    ) : (
      <span className="text-gray-400">{index + 1}</span>
    )
  )}
</div>

        {/* Song Info */}
        <div className="flex items-center flex-1 min-w-0 mr-4">
          <div className="relative mr-3 flex-shrink-0">
            <img
              src={item.cover}
              alt={item.song}
              className={`h-12 w-12 rounded-lg object-cover transition-transform duration-300 ${
                isCurrentTrack && isPlaying ? 'animate-spin-slow' : ''
              }`}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://placehold.co/48x48';
              }}
            />
            {isCurrentTrack && isPlaying && (
              <div className="absolute inset-0 bg-black/40 rounded-lg backdrop-blur-sm flex items-center justify-center">
                <div className="w-6 h-6 relative">
                  <div className="absolute inset-0 border-2 border-white rounded-full animate-ping" />
                  <div className="absolute inset-2 bg-white rounded-full" />
                </div>
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className={`font-medium truncate ${isCurrentTrack ? 'text-green-500' : 'text-white'}`}>
              {item.song}
            </h4>
            <p className="text-sm text-gray-400 truncate">{item.singer}</p>
          </div>
        </div>

        {/* Action Buttons */}
        {isMobile ? (
          <div className="flex-shrink-0">
            <button 
              onClick={() => setShowActionsFor(isShowingActions ? null : item.id)}
              className="p-2 rounded-full hover:bg-white/10 text-gray-400"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
            {isShowingActions && (
              <div className="absolute right-4 mt-2 py-2 w-48 bg-zinc-800 rounded-lg shadow-xl z-10">
                <button 
                  onClick={() => {
                    handleAddToFavorites(item);
                    setShowActionsFor(null);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-white/10 flex items-center space-x-2"
                >
                  <Heart className={`h-4 w-4 ${isInFavorites ? 'text-pink-500' : 'text-gray-400'}`} />
                  <span>Add to Favorites</span>
                </button>
                <button 
                  onClick={() => {
                    handleAddToPlaylist(item);
                    setShowActionsFor(null);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-white/10 flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4 text-gray-400" />
                  <span>Add to Playlist</span>
                </button>
                <button 
                  onClick={() => {
                    downloadTrack(item.mp3, item.song, item.singer);
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
          <div className={`flex items-center space-x-2 ${isHovered ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
            <button 
              onClick={() => handleAddToFavorites(item)}
              className={`p-2 rounded-full hover:bg-white/10 transition-colors ${
                isInFavorites ? 'text-pink-500' : 'text-gray-400 hover:text-pink-500'
              }`}
            >
              <Heart className="h-5 w-5" />
            </button>
            <button 
              onClick={() => handleAddToPlaylist(item)}
              className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <Plus className="h-5 w-5" />
            </button>
            <button 
              onClick={() => downloadTrack(item.mp3, item.song, item.singer)}
              className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <Download className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    );
  };

  // Error state
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => dispatch(fetchRankings())}
            className="px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gradient-to-b from-indigo-900 via-purple-900 to-zinc-900 overflow-y-auto">
      <div className="p-4 md:p-6">
        {/* Tabs with animated highlight */}
        <div className="flex space-x-4 mb-8 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 md:px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-black shadow-lg shadow-white/20 scale-110'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Content with loading skeleton */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white/5 h-16 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="bg-white/5 rounded-2xl overflow-hidden border border-white/10 backdrop-blur-sm">
            <div className="divide-y divide-white/10">
              {tabs.find(tab => tab.id === activeTab)?.data.map((item, index) => 
                renderTrackRow(item, index)
              )}
            </div>
          </div>
        )}

        {/* Click outside handler for mobile action menu */}
        {showActionsFor && (
          <div
            className="fixed inset-0 z-0"
            onClick={() => setShowActionsFor(null)}
          />
        )}
      </div>

      {/* Mobile optimization: Add bottom padding to avoid player overlap */}
      <div className="h-40 md:h-0" />
    </div>
  );
}