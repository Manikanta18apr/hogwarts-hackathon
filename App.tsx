import React, { useState, useEffect } from 'react';
import { ViewState, Place, ItineraryItem } from './types';
import { Home as HomeIcon, Compass, Map as MapIcon, Calendar, User, Mic } from 'lucide-react';

// Components
import Home from './components/Home';
import Discover from './components/Discover';
import PlaceDetails from './components/PlaceDetails';
import Itinerary from './components/Itinerary';
import MapScreen from './components/Map';
import Events from './components/Events';
import Profile from './components/Profile';
import LiveVoiceControl from './components/LiveVoiceControl';
import Onboarding from './components/Onboarding';
import ChatPlanner from './components/ChatPlanner';
import Budget from './components/Budget';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('onboarding');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [itineraryItems, setItineraryItems] = useState<ItineraryItem[]>([]);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialize theme
  useEffect(() => {
    // Check local storage or system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      if (newMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return newMode;
    });
  };

  const handlePlaceSelect = (place: Place) => {
    setSelectedPlace(place);
    setCurrentView('details');
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentView('discover');
  };

  const handleAddToItinerary = (place: Place) => {
    const newItem: ItineraryItem = {
      id: Date.now().toString(),
      time: 'TBD',
      period: 'Afternoon',
      activity: place.title,
      placeId: place.id,
      description: 'Added from discovery',
      image: place.image,
      rating: place.rating
    };
    setItineraryItems(prev => [...prev, newItem]);
    setCurrentView('itinerary');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'onboarding':
        return <Onboarding onStart={() => setCurrentView('home')} />;
      case 'home':
        return <Home onNavigate={setCurrentView} onSearch={handleSearch} />;
      case 'discover':
        return <Discover onSelectPlace={handlePlaceSelect} searchTerm={searchTerm} onSearch={handleSearch} />;
      case 'details':
        return selectedPlace ? (
          <PlaceDetails 
            place={selectedPlace} 
            onBack={() => setCurrentView('discover')} 
            onAddToItinerary={handleAddToItinerary}
          />
        ) : <Discover onSelectPlace={handlePlaceSelect} searchTerm={searchTerm} onSearch={handleSearch} />;
      case 'itinerary':
        return <Itinerary items={itineraryItems} setItems={setItineraryItems} onBack={() => setCurrentView('home')} />;
      case 'planner':
        return <ChatPlanner onBack={() => setCurrentView('home')} />;
      case 'budget':
        return <Budget onBack={() => setCurrentView('home')} />;
      case 'map':
        return <MapScreen />;
      case 'events':
        return <Events />;
      case 'profile':
        return <Profile isDarkMode={isDarkMode} toggleTheme={toggleTheme} />;
      case 'alerts':
         return (
             <div className="flex flex-col items-center justify-center h-screen bg-slate-50 dark:bg-slate-950 p-6 text-center">
                 <div className="bg-rose-100 dark:bg-rose-900/30 p-4 rounded-full text-rose-500 mb-4"><span className="text-3xl">⚠️</span></div>
                 <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Travel Alerts</h2>
                 <p className="text-slate-500 dark:text-slate-400">No major disruptions reported for your tracked locations.</p>
                 <button onClick={() => setCurrentView('home')} className="mt-6 text-indigo-600 dark:text-indigo-400 font-semibold">Go Back</button>
             </div>
         );
      default:
        return <Home onNavigate={setCurrentView} onSearch={handleSearch} />;
    }
  };

  // Views that should NOT show the bottom navigation
  const fullScreenViews: ViewState[] = ['onboarding', 'details', 'planner', 'budget', 'alerts'];
  const showNav = !fullScreenViews.includes(currentView);

  const handleNavClick = (view: ViewState) => {
    if (view === 'discover') {
      setSearchTerm(''); // Clear search when manually navigating to discover
    }
    setCurrentView(view);
  };

  return (
    <div className="max-w-md mx-auto bg-slate-50 dark:bg-slate-950 min-h-screen relative shadow-2xl overflow-hidden font-sans transition-colors duration-300">
      {/* Voice Control Overlay */}
      <LiveVoiceControl 
        isOpen={isVoiceActive} 
        onClose={() => setIsVoiceActive(false)} 
        onNavigate={setCurrentView} 
      />

      {/* Main Content Area */}
      <div className="h-full overflow-y-auto no-scrollbar">
        {renderContent()}
      </div>

      {/* Mic Trigger (Floating) */}
      {!isVoiceActive && showNav && (
          <button 
            onClick={() => setIsVoiceActive(true)}
            className="absolute bottom-24 right-6 w-14 h-14 bg-indigo-600 dark:bg-indigo-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-indigo-700 dark:hover:bg-indigo-600 active:scale-95 transition-all z-40 animate-bounce-subtle"
            aria-label="Start Voice Assistant"
          >
            <Mic size={24} />
          </button>
      )}

      {/* Sticky Bottom Navigation */}
      {showNav && (
        <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 py-4 flex justify-between items-center z-50 rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] transition-colors duration-300">
          <NavButton 
            icon={<HomeIcon size={24} />} 
            label="Home" 
            isActive={currentView === 'home'} 
            onClick={() => handleNavClick('home')} 
          />
          <NavButton 
            icon={<Compass size={24} />} 
            label="Discover" 
            isActive={currentView === 'discover'} 
            onClick={() => handleNavClick('discover')} 
          />
           {/* Center FAB for Itinerary/Map context switch */}
          <div className="relative -top-8">
            <button 
                onClick={() => handleNavClick('itinerary')}
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl transform transition-all duration-300 ${currentView === 'itinerary' ? 'bg-slate-800 dark:bg-slate-700 text-teal-400 scale-110' : 'bg-teal-500 text-white hover:scale-105 hover:bg-teal-400'}`}
            >
                <MapIcon size={26} />
            </button>
          </div>

          <NavButton 
            icon={<Calendar size={24} />} 
            label="Events" 
            isActive={currentView === 'events'} 
            onClick={() => handleNavClick('events')} 
          />
          <NavButton 
            icon={<User size={24} />} 
            label="Profile" 
            isActive={currentView === 'profile'} 
            onClick={() => handleNavClick('profile')} 
          />
        </div>
      )}
    </div>
  );
};

interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const NavButton: React.FC<NavButtonProps> = ({ icon, label, isActive, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center space-y-1 transition-colors duration-200 ${isActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400'}`}
  >
    {icon}
  </button>
);

export default App;