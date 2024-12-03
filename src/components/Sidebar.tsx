// Sidebar.tsx
import { 
  Home, Search, Library, Plus, Heart, 
  Headphones, Globe2, ListMusic, Music2
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { useState } from 'react';

interface SidebarProps {
  onSearchClick: () => void;
  onHomeClick: () => void;
  onPlaylistClick: () => void;
}

export default function Sidebar({ 
  onSearchClick, 
  onHomeClick, 
  onPlaylistClick 
}: SidebarProps) {
  const [activeNav, setActiveNav] = useState<'home' | 'search' | 'library'>('home');
  const { featuredPlaylists } = useSelector((state: RootState) => state.playlists);
  const { favorites } = useSelector((state: RootState) => state.playlists);

  const handleNavClick = (
    nav: 'home' | 'search' | 'library', 
    handler: () => void
  ) => {
    setActiveNav(nav);
    handler();
  };

  return (
    <div className="w-72 bg-black/95 backdrop-blur-xl border-r border-white/10 flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <div className="text-white flex items-center space-x-3">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-xl shadow-lg">
            <Headphones className="h-7 w-7 text-white" />
          </div>
          <span className="font-bold text-2xl tracking-tight">
            SoundVerse
          </span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="px-3">
        <ul className="space-y-1.5">
          <li>
            <button 
              onClick={() => handleNavClick('home', onHomeClick)}
              className={`w-full flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeNav === 'home'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Globe2 className="h-5 w-5" />
              <span className="font-medium">Discover</span>
            </button>
          </li>
          <li>
            <button 
              onClick={() => handleNavClick('search', onSearchClick)}
              className={`w-full flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeNav === 'search'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Search className="h-5 w-5" />
              <span className="font-medium">Search</span>
            </button>
          </li>
          <li>
            <button 
              onClick={() => handleNavClick('library', onPlaylistClick)}
              className={`w-full flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeNav === 'library'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Library className="h-5 w-5" />
              <span className="font-medium">Library</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* Playlist Controls */}
      <div className="mt-8 px-3">
        <div className="px-4 mb-4">
          <h2 className="text-gray-400 text-sm font-medium uppercase tracking-wider">
            Library
          </h2>
        </div>
        <ul className="space-y-1.5">
          <li>
            <button 
              onClick={onPlaylistClick}
              className="w-full flex items-center space-x-4 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
            >
              <Plus className="h-5 w-5" />
              <span className="font-medium">Create Playlist</span>
            </button>
          </li>
          <li>
            <button 
              onClick={onPlaylistClick}
              className="w-full flex items-center justify-between px-4 py-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
            >
              <div className="flex items-center space-x-4">
                <Heart className="h-5 w-5 text-pink-500" />
                <span className="font-medium">Liked Songs</span>
              </div>
              <span className="text-sm bg-white/10 px-2 py-1 rounded-md">
                {favorites.length}
              </span>
            </button>
          </li>
        </ul>
      </div>

      {/* Divider */}
      <div className="mt-6 mx-3 border-t border-white/10" />

      {/* Playlists */}
      <div className="mt-6 px-3 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-white/10">
        <div className="px-4 mb-4">
          <h2 className="text-gray-400 text-sm font-medium uppercase tracking-wider">
            Your Playlists
          </h2>
        </div>
        <ul className="space-y-1.5">
          {featuredPlaylists.map((playlist) => (
            <li key={playlist.id}>
              <button 
                onClick={onPlaylistClick}
                className="w-full flex items-center space-x-4 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
              >
                <Music2 className="h-5 w-5" />
                <span className="font-medium truncate">{playlist.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}