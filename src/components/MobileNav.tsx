// MobileNav.tsx
import { 
  Home, Search, Library, Playing, 
  Music2, BarChart2, ListMusic 
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { useEffect, useState } from 'react';

interface MobileNavProps {
  onSearchClick: () => void;
  onHomeClick: () => void;
  onPlaylistClick: () => void;
}

export default function MobileNav({ 
  onSearchClick, 
  onHomeClick, 
  onPlaylistClick 
}: MobileNavProps) {
  const [activeNav, setActiveNav] = useState<'home' | 'search' | 'library'>('home');
  const { currentTrack } = useSelector((state: RootState) => state.player);

  useEffect(() => {
    // Add a class to body when there's a current track to adjust bottom padding
    if (currentTrack) {
      document.body.classList.add('has-player');
    } else {
      document.body.classList.remove('has-player');
    }
  }, [currentTrack]);

  const handleNavClick = (
    nav: 'home' | 'search' | 'library', 
    handler: () => void
  ) => {
    setActiveNav(nav);
    handler();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 to-black/90 backdrop-blur-lg border-t border-white/10">
      <nav className="max-w-lg mx-auto px-4 py-2">
        <ul className="flex items-center justify-around">
          <li>
            <button 
              onClick={() => handleNavClick('home', onHomeClick)}
              className="flex flex-col items-center p-2 group"
            >
              <div className={`p-2 rounded-full transition-colors ${
                activeNav === 'home' 
                  ? 'bg-white text-black' 
                  : 'text-gray-400 group-hover:text-white'
              }`}>
                <Home className="h-5 w-5" />
              </div>
              <span className={`text-xs mt-1 transition-colors ${
                activeNav === 'home' 
                  ? 'text-white' 
                  : 'text-gray-400 group-hover:text-white'
              }`}>
                Home
              </span>
            </button>
          </li>

          <li>
            <button 
              onClick={() => handleNavClick('search', onSearchClick)}
              className="flex flex-col items-center p-2 group"
            >
              <div className={`p-2 rounded-full transition-colors ${
                activeNav === 'search' 
                  ? 'bg-white text-black' 
                  : 'text-gray-400 group-hover:text-white'
              }`}>
                <Search className="h-5 w-5" />
              </div>
              <span className={`text-xs mt-1 transition-colors ${
                activeNav === 'search' 
                  ? 'text-white' 
                  : 'text-gray-400 group-hover:text-white'
              }`}>
                Search
              </span>
            </button>
          </li>

          <li>
            <button
              onClick={() => handleNavClick('library', onPlaylistClick)}
              className="flex flex-col items-center p-2 group"
            >
              <div className={`p-2 rounded-full transition-colors ${
                activeNav === 'library' 
                  ? 'bg-white text-black' 
                  : 'text-gray-400 group-hover:text-white'
              }`}>
                <Library className="h-5 w-5" />
              </div>
              <span className={`text-xs mt-1 transition-colors ${
                activeNav === 'library' 
                  ? 'text-white' 
                  : 'text-gray-400 group-hover:text-white'
              }`}>
                Library
              </span>
            </button>
          </li>
        </ul>
      </nav>

      {/* Dynamic bottom spacing for player */}
    </div>
  );
}