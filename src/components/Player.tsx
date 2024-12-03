import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  PlayIcon, PauseIcon, SkipBackIcon, SkipForwardIcon, 
  VolumeIcon, RepeatIcon, ShuffleIcon,
  HeartIcon, VolumeXIcon, Volume2Icon, Maximize2Icon,
  ChevronUpIcon, Repeat1Icon
} from 'lucide-react';
import { RootState } from '../store/store';
import { 
  setIsPlaying, setCurrentTime, setDuration, 
  toggleShuffle, setRepeatMode, playNext, playPrevious,
  setVolume
} from '../store/playerSlice';
import { addToFavorites, removeFromFavorites } from '../store/playlistSlice';
import { useMediaQuery } from '../hooks/useMediaQuery';
import PlayerDetail from './PlayerDetail';

export default function Player() {
  const dispatch = useDispatch();
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const { 
    currentTrack, isPlaying, currentTime, volume, 
    repeatMode, shuffle
  } = useSelector((state: RootState) => state.player);
  const { favorites } = useSelector((state: RootState) => state.playlists);

  const [showVolume, setShowVolume] = useState(false);
  const [showPlayerDetail, setShowPlayerDetail] = useState(false);
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => {
          dispatch(setIsPlaying(false));
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handleTimeUpdate = () => {
    if (audioRef.current && !isDraggingProgress) {
      dispatch(setCurrentTime(audioRef.current.currentTime));
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      dispatch(setDuration(audioRef.current.duration));
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !progressRef.current) return;
    
    const bounds = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - bounds.left) / bounds.width;
    const time = percent * audioRef.current.duration;
    
    dispatch(setCurrentTime(time));
    audioRef.current.currentTime = time;
  };

  const handleProgressDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingProgress || !audioRef.current || !progressRef.current) return;
    
    const bounds = progressRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - bounds.left) / bounds.width));
    const time = percent * audioRef.current.duration;
    
    dispatch(setCurrentTime(time));
  };

  const handleProgressMouseUp = () => {
    if (isDraggingProgress && audioRef.current) {
      audioRef.current.currentTime = currentTime;
      setIsDraggingProgress(false);
    }
  };

  useEffect(() => {
    const handleMouseUp = () => handleProgressMouseUp();
    const handleMouseMove = (e: MouseEvent) => handleProgressDrag(e as any);

    if (isDraggingProgress) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingProgress]);

  const handlePlayPause = () => {
    dispatch(setIsPlaying(!isPlaying));
  };

  const handlePrevious = () => {
    dispatch(playPrevious());
  };

  const handleNext = () => {
    dispatch(playNext());
  };

  const handleRepeat = () => {
    dispatch(setRepeatMode());
  };

  const handleShuffle = () => {
    dispatch(toggleShuffle());
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentTrack) return;
    
    const isInFavorites = favorites.some(track => track.id === currentTrack.id);
    if (isInFavorites) {
      dispatch(removeFromFavorites(currentTrack.id));
    } else {
      dispatch(addToFavorites(currentTrack));
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!currentTrack) return null;

  const isInFavorites = favorites.some(track => track.id === currentTrack.id);
  const progress = audioRef.current ? (currentTime / audioRef.current.duration) * 100 : 0;

  const renderRepeatIcon = () => {
    switch (repeatMode) {
      case 'off':
        return <RepeatIcon className="h-5 w-5" />;
      case 'one':
        return <Repeat1Icon className="h-5 w-5" />;
      case 'all':
        return (
          <div className="relative">
            <RepeatIcon className="h-5 w-5" />
            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
          </div>
        );
    }
  };

  return (
    <>
      {showPlayerDetail && (
        <PlayerDetail 
          onClose={() => setShowPlayerDetail(false)}
          audioRef={audioRef}
        />
      )}
      
      
    <div className={`fixed left-0 right-0 bg-zinc-900 border-t border-zinc-800 z-50 transition-all duration-300 z-60 ${
      isMobile ? 'bottom-20' : 'bottom-0'
    }`}>
        <audio
          ref={audioRef}
          src={currentTrack.mp3}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleNext}
          loop={repeatMode === 'one'}
        />

        {/* Progress bar */}
        <div
          ref={progressRef}
          className="h-1 bg-gray-600 rounded-full cursor-pointer mb-4 relative"
          onClick={handleProgressClick}
          onMouseDown={(e) => {
            setIsDraggingProgress(true);
            handleProgressDrag(e);
          }}
        >
          <div
            className="h-full bg-white rounded-full relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full -right-1.5" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          {/* Track info with vinyl animation */}
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <div 
              className={`relative group cursor-pointer`}
              onClick={() => setShowPlayerDetail(true)}
            >
              <div className="absolute inset-0 rounded-full border-2 border-gray-700 group-hover:border-white/20 transition-colors" />
              <div className={`relative ${isPlaying ? 'animate-spin-slow' : ''}`}>
                <img
                  src={currentTrack.albumCover}
                  alt={currentTrack.title}
                  className="h-12 w-12 rounded-full"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://placehold.co/400x400';
                  }}
                />
                <div className="absolute inset-0 rounded-full border border-white/10" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gray-700" />
              </div>
            </div>
            <div className="min-w-0">
              <h4 className="text-sm text-white truncate">{currentTrack.title}</h4>
              <p className="text-xs text-gray-400 truncate">{currentTrack.artist}</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-4">
            {!isMobile && (
              <>
                <button 
                  onClick={handleShuffle}
                  className={`${shuffle ? 'text-green-500' : 'text-gray-400'} hover:text-white`}
                >
                  <ShuffleIcon className="h-5 w-5" />
                </button>
              </>
            )}
            
            <button 
              onClick={handlePrevious}
              className="text-gray-400 hover:text-white"
            >
              <SkipBackIcon className="h-5 w-5" />
            </button>
            
            <button 
              onClick={handlePlayPause}
              className="bg-white rounded-full p-2 hover:scale-105 transition"
            >
              {isPlaying ? (
                <PauseIcon className="h-5 w-5 text-black" />
              ) : (
                <PlayIcon className="h-5 w-5 text-black" />
              )}
            </button>

            <button 
              onClick={handleNext}
              className="text-gray-400 hover:text-white"
            >
              <SkipForwardIcon className="h-5 w-5" />
            </button>
            
            {!isMobile && (
              <button 
                onClick={handleRepeat}
                className={`${repeatMode !== 'off' ? 'text-green-500' : 'text-gray-400'} hover:text-white`}
              >
                {renderRepeatIcon()}
              </button>
            )}
          </div>

          {/* Additional controls */}
          <div className="flex items-center space-x-4 flex-1 justify-end">
            <button
              onClick={toggleFavorite}
              className={`${isInFavorites ? 'text-pink-500' : 'text-gray-400'} hover:scale-110 transition`}
            >
              <HeartIcon className="h-5 w-5" />
            </button>
            
            {!isMobile && (
              <>
                <div className="relative">
                  <button
                    onClick={() => setShowVolume(!showVolume)}
                    className="text-gray-400 hover:text-white"
                  >
                    {volume === 0 ? (
                      <VolumeXIcon className="h-5 w-5" />
                    ) : volume < 0.5 ? (
                      <VolumeIcon className="h-5 w-5" />
                    ) : (
                      <Volume2Icon className="h-5 w-5" />
                    )}
                  </button>
                  
                  {showVolume && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-zinc-800 p-2 rounded-lg">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={(e) => dispatch(setVolume(parseFloat(e.target.value)))}
                        className="w-24 accent-white"
                      />
                    </div>
                  )}
                </div>

                <div className="text-sm text-gray-400">
                  {formatTime(currentTime)} / {formatTime(audioRef.current?.duration || 0)}
                </div>

                <button
                  onClick={() => setShowPlayerDetail(true)}
                  className="text-gray-400 hover:text-white"
                >
                  <Maximize2Icon className="h-5 w-5" />
                </button>
              </>
            )}
            {isMobile && (
              <button
                onClick={() => setShowPlayerDetail(true)}
                className="text-gray-400 hover:text-white"
              >
                <ChevronUpIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
