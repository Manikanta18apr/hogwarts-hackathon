import React, { useState } from 'react';
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

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [itineraryItems, setItineraryItems] = useState<ItineraryItem[]>([]);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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
      description: 'Added from discovery'
    };
    setItineraryItems(prev => [...prev, newItem]);
    setCurrentView('itinerary');
  };

  const renderContent = () => {
    switch (currentView) {
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
        return <Itinerary items={itineraryItems} setItems={setItineraryItems} />;
      case 'map':
        return <MapScreen />;
      case 'events':
        return <Events />;
      case 'profile':
        return <Profile />;
      default:
        return <Home onNavigate={setCurrentView} onSearch={handleSearch} />;
    }
  };

  // Do not show bottom nav on details page
  const showNav = currentView !== 'details';

  const handleNavClick = (view: ViewState) => {
    if (view === 'discover') {
      setSearchTerm(''); // Clear search when manually navigating to discover
    }
    setCurrentView(view);
  };

  return (
    <div className="max-w-md mx-auto bg-slate-50 min-h-screen relative shadow-2xl overflow-hidden">
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
            className="absolute bottom-24 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-indigo-700 active:scale-95 transition-all z-40 animate-bounce-subtle"
            aria-label="Start Voice Assistant"
          >
            <Mic size={24} />
          </button>
      )}

      {/* Sticky Bottom Navigation */}
      {showNav && (
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center z-50 rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
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
           {/* Center FAB for Itinerary */}
          <div className="relative -top-6">
            <button 
                onClick={() => handleNavClick('itinerary')}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transform transition-transform ${currentView === 'itinerary' ? 'bg-slate-800 text-teal-400 scale-110' : 'bg-teal-600 text-white hover:scale-105'}`}
            >
                <MapIcon size={24} />
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
    className={`flex flex-col items-center justify-center space-y-1 ${isActive ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600'}`}
  >
    {icon}
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

export default App;