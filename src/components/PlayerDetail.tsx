import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  X, Volume2, VolumeX, Repeat, Shuffle, 
  Play, Pause, SkipBack, SkipForward,
  Heart, Plus, ChevronDown, Volume1,
  Download, Repeat1
} from 'lucide-react';
import { RootState } from '../store/store';
import { AppDispatch } from '../store/store';
import { 
  setVolume, setRepeatMode, toggleShuffle,
  setIsPlaying, playNext, playPrevious,
  setCurrentTime
} from '../store/playerSlice';
import { addToPlaylist, addToFavorites, removeFromFavorites } from '../store/playlistSlice';
import { downloadTrack } from '../utils/download';
import toast from 'react-hot-toast';

interface PlayerDetailProps {
  onClose: () => void;
  audioRef: React.RefObject<HTMLAudioElement>;
}

interface LyricLine {
  name: string;
  time: string;
}

export default function PlayerDetail({ onClose, audioRef }: PlayerDetailProps) {
  const dispatch = useDispatch();
  const [showVolume, setShowVolume] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [scrollTimeout, setScrollTimeout] = useState<NodeJS.Timeout | null>(null);

  const { 
    currentTrack, 
    isPlaying, 
    volume, 
    currentTime,
    repeatMode,
    shuffle 
  } = useSelector((state: RootState) => state.player);
  const { favorites } = useSelector((state: RootState) => state.playlists);

  const isInFavorites = favorites.some(track => track.id === currentTrack?.id);
  const lyrics = currentTrack?.lyrics || [];

  useEffect(() => {
    if (!isUserScrolling && lyricsContainerRef.current) {
      const currentLine = document.getElementById(`lyric-${currentLyricIndex}`);
      if (currentLine) {
        currentLine.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  }, [currentLyricIndex, isUserScrolling]);

  useEffect(() => {
    if (!isUserScrolling && lyrics.length > 0) {
      const getCurrentLyricIndex = () => {
        for (let i = lyrics.length - 1; i >= 0; i--) {
          const timeInSeconds = parseTimeString(lyrics[i].time);
          if (currentTime >= timeInSeconds) {
            return i;
          }
        }
        return 0;
      };

      setCurrentLyricIndex(getCurrentLyricIndex());
    }
  }, [currentTime, lyrics, isUserScrolling]);

  const parseTimeString = (timeStr: string): number => {
    const [minutes, seconds] = timeStr.split(':').map(Number);
    return minutes * 60 + seconds;
  };

  const handleLyricsScroll = () => {
    if (!isUserScrolling) {
      setIsUserScrolling(true);
    }

    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }

    const timeout = setTimeout(() => {
      setIsUserScrolling(false);
    }, 2000);

    setScrollTimeout(timeout);
  };

  const handlePlayPause = () => {
    dispatch(setIsPlaying(!isPlaying));
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

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    dispatch(setVolume(newVolume));
  };

  const handleRepeat = () => {
    dispatch(setRepeatMode());
  };

  const handleShuffle = () => {
    dispatch(toggleShuffle());
    toast.success(shuffle ? 'Shuffle off' : 'Shuffle on');
  };

  const toggleFavorite = () => {
    if (!currentTrack) return;
    
    if (isInFavorites) {
      dispatch(removeFromFavorites(currentTrack.id));
      toast.success('Removed from favorites');
    } else {
      dispatch(addToFavorites(currentTrack));
      toast.success('Added to favorites');
    }
  };

  const handleAddToPlaylist = () => {
    if (!currentTrack) return;
    dispatch(addToPlaylist(currentTrack));
  };

  const handleDownload = async () => {
    if (!currentTrack?.mp3) return;
    await downloadTrack(currentTrack.mp3, currentTrack.title, currentTrack.artist);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!currentTrack) return null;

  const progress = audioRef.current ? (currentTime / audioRef.current.duration) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white"
          >
            <ChevronDown className="h-6 w-6" />
          </button>
          <div className="text-center">
            <h2 className="text-white font-semibold">Now Playing</h2>
            <p className="text-gray-400 text-sm">From: {currentTrack.album || 'Unknown Album'}</p>
          </div>
          <div className="w-10" /> {/* Spacer for alignment */}
        </div>

        {/* Album Art as Vinyl */}
<div className="relative aspect-square mb-8 group w-64 mx-auto">  {/* Changed to w-64 (16rem / 256px) */}
  <div className={`absolute inset-0 rounded-full bg-black shadow-xl transition-transform duration-1000 ${isPlaying ? 'animate-spin-slow' : ''}`}>
    {/* Vinyl grooves */}
    <div className="absolute inset-4 rounded-full border-2 border-gray-800"></div>
    <div className="absolute inset-8 rounded-full border border-gray-800"></div>
    <div className="absolute inset-12 rounded-full border border-gray-800"></div>
    <div className="absolute inset-16 rounded-full border border-gray-800"></div>
    {/* Center hole */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gray-900 border-2 border-gray-800"></div>
  </div>
  {/* Album cover overlay */}
  <div className={`absolute inset-[15%] rounded-full overflow-hidden transition-transform duration-1000 ${isPlaying ? 'animate-spin-slow' : ''}`}>
    <img
      src={currentTrack.albumCover}
      alt={currentTrack.title}
      className="w-full h-full object-cover"
    />
  </div>
</div>

        {/* Track Info */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-white mb-2">{currentTrack.title}</h1>
          <p className="text-gray-400">{currentTrack.artist}</p>
        </div>

        {/* Lyrics Display */}
        <div 
          ref={lyricsContainerRef}
          className="h-24 overflow-y-auto mb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
          onScroll={handleLyricsScroll}
        >
          <div className="space-y-2 px-4">
            {lyrics.map((line: LyricLine, index: number) => (
              <div
                key={index}
                id={`lyric-${index}`}
                className={`text-center transition-all duration-300 ${
                  index === currentLyricIndex
                    ? 'text-white text-lg font-medium'
                    : 'text-gray-400 text-base'
                }`}
              >
                {line.name}
              </div>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div
            ref={progressRef}
            className="h-1 bg-gray-600 rounded-full cursor-pointer relative group"
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
              <div className="opacity-0 group-hover:opacity-100 absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full -right-1.5 transition-opacity" />
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(audioRef.current?.duration || 0)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-6 mb-8">
          <button
            onClick={handleShuffle}
            className={`p-2 rounded-full ${shuffle ? 'text-green-500' : 'text-gray-400 hover:text-white'}`}
          >
            <Shuffle className="h-5 w-5" />
          </button>
          
          <button
            onClick={() => dispatch(playPrevious())}
            className="p-2 text-gray-400 hover:text-white"
          >
            <SkipBack className="h-8 w-8" />
          </button>

          <button
            onClick={handlePlayPause}
            className="p-4 bg-white rounded-full hover:scale-105 transition"
          >
            {isPlaying ? (
              <Pause className="h-8 w-8 text-black" />
            ) : (
              <Play className="h-8 w-8 text-black" />
            )}
          </button>

          <button
            onClick={() => dispatch(playNext())}
            className="p-2 text-gray-400 hover:text-white"
          >
            <SkipForward className="h-8 w-8" />
          </button>

          <button
            onClick={handleRepeat}
            className={`p-2 rounded-full ${
              repeatMode !== 'off' ? 'text-green-500' : 'text-gray-400 hover:text-white'
            }`}
          >
            {repeatMode === 'one' ? <Repeat1 className="h-5 w-5" /> : <Repeat className="h-5 w-5" />}
          </button>
        </div>

        {/* Additional Controls */}
        <div className="flex items-center justify-center space-x-6">
          <button
            onClick={toggleFavorite}
            className={`p-2 rounded-full ${
              isInFavorites ? 'text-pink-500' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Heart className="h-5 w-5" />
          </button>

          <button
            onClick={handleAddToPlaylist}
            className="p-2 rounded-full text-gray-400 hover:text-white"
          >
            <Plus className="h-5 w-5" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowVolume(!showVolume)}
              className="p-2 rounded-full text-gray-400 hover:text-white"
            >
              {volume === 0 ? (
                <VolumeX className="h-5 w-5" />
              ) : volume < 0.5 ? (
                <Volume1 className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
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
                  onChange={handleVolumeChange}
                  className="w-24 accent-white"
                />
              </div>
            )}
          </div>

          <button
            onClick={handleDownload}
            className="p-2 rounded-full text-gray-400 hover:text-white"
          >
            <Download className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
