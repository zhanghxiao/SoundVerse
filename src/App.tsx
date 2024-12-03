import { Provider } from 'react-redux';
import { store } from './store/store';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useMediaQuery } from './hooks/useMediaQuery';
import './index.css';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import Player from './components/Player';
import Search from './components/Search';
import MobileNav from './components/MobileNav';
import PlaylistView from './components/PlaylistView';

function App() {
  const [showSearch, setShowSearch] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Function to handle navigation
  const handleNavigation = (view: 'home' | 'search' | 'playlist') => {
    switch (view) {
      case 'home':
        setShowSearch(false);
        setShowPlaylist(false);
        break;
      case 'search':
        setShowSearch(true);
        setShowPlaylist(false);
        break;
      case 'playlist':
        setShowSearch(false);
        setShowPlaylist(true);
        break;
    }
  };

  return (
    <Provider store={store}>
      <div className="h-screen flex flex-col bg-black">
        <div className="flex-1 flex overflow-hidden">
          {!isMobile && (
            <Sidebar 
              onSearchClick={() => handleNavigation('search')}
              onHomeClick={() => handleNavigation('home')}
              onPlaylistClick={() => handleNavigation('playlist')}
            />
          )}
          {showSearch ? (
            <Search onClose={() => handleNavigation('home')} />
          ) : showPlaylist ? (
            <PlaylistView onClose={() => handleNavigation('home')} />
          ) : (
            <MainContent />
          )}
        </div>
        <Player />
        {isMobile && (
          <MobileNav 
            onSearchClick={() => handleNavigation('search')}
            onHomeClick={() => handleNavigation('home')}
            onPlaylistClick={() => handleNavigation('playlist')}
          />
        )}
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 2000,
            style: {
              background: '#333',
              color: '#fff',
            },
          }}
        />
      </div>
    </Provider>
  );
}

export default App;