// PlaylistView.tsx
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { X, Play, Heart, Trash, Pause, MoreHorizontal, Plus } from 'lucide-react';
import { RootState, AppDispatch } from '../store/store';
import { setCurrentTrack, setIsPlaying, addToQueue } from '../store/playerSlice';
import { removeFromPlaylist, removeFromFavorites } from '../store/playlistSlice';
import { Track } from '../types';
import { useMediaQuery } from '../hooks/useMediaQuery';
import toast from 'react-hot-toast';

interface PlaylistViewProps {
  onClose: () => void;
}

export default function PlaylistView({ onClose }: PlaylistViewProps) {
  const [activeTab, setActiveTab] = useState<'playlist' | 'favorites'>('playlist');
  const [loadingTrackId, setLoadingTrackId] = useState<string | null>(null);
  const [showActionsFor, setShowActionsFor] = useState<string | null>(null);
  
  const dispatch = useDispatch<AppDispatch>();
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const { currentPlaylist } = useSelector((state: RootState) => state.playlists);
  const { favorites } = useSelector((state: RootState) => state.playlists);
  const { currentTrack, isPlaying } = useSelector((state: RootState) => state.player);

  // Handle closing actions menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowActionsFor(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handlePlay = async (track: Track) => {
    if (currentTrack?.id === track.id) {
      dispatch(setIsPlaying(!isPlaying));
      return;
    }

    setLoadingTrackId(track.id);
    try {
      dispatch(setCurrentTrack(track));
      dispatch(setIsPlaying(true));

      // Add remaining tracks to queue
      const currentList = activeTab === 'playlist' ? currentPlaylist : favorites;
      const startIndex = currentList.findIndex(t => t.id === track.id);
      const remainingTracks = currentList.slice(startIndex + 1);
      remainingTracks.forEach(track => dispatch(addToQueue(track)));

      toast.success(`Now playing: ${track.title}`);
    } catch (err) {
      toast.error('Failed to play track');
    } finally {
      setLoadingTrackId(null);
    }
  };

  const handleRemove = (track: Track) => {
    try {
      if (activeTab === 'playlist') {
        dispatch(removeFromPlaylist(track.id));
        toast.success('Removed from playlist');
      } else {
        dispatch(removeFromFavorites(track.id));
        toast.success('Removed from favorites');
      }
    } catch (err) {
      toast.error('Failed to remove track');
    }
  };

  const renderTrack = (track: Track) => {
    const isCurrentTrack = currentTrack?.id === track.id;
    const isLoading = loadingTrackId === track.id;

    return (
      <div
        key={track.id}
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
              onClick={() => handlePlay(track)}
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

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-4">
            <img
              src={track.albumCover || 'https://placehold.co/48x48'}
              alt={track.title}
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
                {track.title}
              </h3>
              <p className="text-sm text-gray-400 truncate">{track.artist}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        {isMobile ? (
          <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowActionsFor(showActionsFor === track.id ? null : track.id)}
              className="p-2 rounded-full hover:bg-white/10 text-gray-400"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
            {showActionsFor === track.id && (
              <div className="absolute right-4 mt-2 py-2 w-48 bg-zinc-800 rounded-lg shadow-xl z-10">
                <button
                  onClick={() => {
                    handleRemove(track);
                    setShowActionsFor(null);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-white/10 flex items-center space-x-2 text-red-400"
                >
                  <Trash className="h-4 w-4" />
                  <span>Remove</span>
                </button>
                {activeTab === 'favorites' && (
                  <button
                    onClick={() => {
                      dispatch(addToQueue(track));
                      setShowActionsFor(null);
                      toast.success('Added to queue');
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-white/10 flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4 text-gray-400" />
                    <span>Add to Queue</span>
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => handleRemove(track)}
              className="p-2 rounded-full hover:bg-white/10 text-red-400 hover:text-red-300"
            >
              <Trash className="h-5 w-5" />
            </button>
            {activeTab === 'favorites' && (
              <button
                onClick={() => {
                  dispatch(addToQueue(track));
                  toast.success('Added to queue');
                }}
                className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white"
              >
                <Plus className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 bg-gradient-to-b from-indigo-900 via-purple-900 to-zinc-900 overflow-y-auto z-50">
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('playlist')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeTab === 'playlist'
                  ? 'bg-white text-black shadow-lg shadow-white/20 scale-110'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Playlist
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeTab === 'favorites'
                  ? 'bg-white text-black shadow-lg shadow-white/20 scale-110'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Favorites
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-2">
          {(activeTab === 'playlist' ? currentPlaylist : favorites).length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">
                {activeTab === 'playlist' 
                  ? 'Your playlist is empty'
                  : 'No favorite songs yet'}
              </p>
            </div>
          ) : (
            (activeTab === 'playlist' ? currentPlaylist : favorites).map(track => 
              renderTrack(track)
            )
          )}
        </div>
      </div>

      {/* Mobile optimization: Add bottom padding to avoid player overlap */}
      <div className="h-40 md:h-20" />
    </div>
  );
}