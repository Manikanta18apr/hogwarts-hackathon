import React, { useState } from 'react';
import { Search, MapPin, Sparkles, Wallet, Bell, Navigation, Mic } from 'lucide-react';
import { ViewState } from '../types';
import VoiceSearchOverlay from './VoiceSearchOverlay'; // Import new VoiceSearchOverlay

interface HomeProps {
  onNavigate: (view: ViewState) => void;
  onSearch: (term: string) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate, onSearch }) => {
  const [searchText, setSearchText] = useState('');
  const [isVoiceSearchActive, setIsVoiceSearchActive] = useState(false); // New state for voice search

  const quickAccess = [
    { 
      title: 'Itinerary AI', 
      subtitle: 'Plan your trip', 
      icon: <Sparkles size={24} />, 
      color: 'bg-indigo-600 text-white', 
      view: 'planner' 
    },
    { 
      title: 'Budget', 
      subtitle: 'Cost calculator', 
      icon: <Wallet size={24} />, 
      color: 'bg-teal-600 text-white', 
      view: 'budget' 
    },
    { 
      title: 'Nearby', 
      subtitle: 'Find places', 
      icon: <MapPin size={24} />, 
      color: 'bg-orange-500 text-white', 
      view: 'discover' 
    },
    { 
      title: 'Alerts', 
      subtitle: 'Travel updates', 
      icon: <Bell size={24} />, 
      color: 'bg-rose-500 text-white', 
      view: 'alerts' 
    },
  ];

  const handleVoiceSearchComplete = (transcript: string) => {
    setSearchText(transcript);
    setIsVoiceSearchActive(false);
    if (transcript.trim()) {
      onSearch(transcript);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 transition-colors duration-300">
      {/* Header */}
      <div className="p-6 pt-12 pb-4">
        <div className="flex justify-between items-center mb-6">
            <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Good Morning,</p>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Alex Explorer</h1>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm">
                <img src="https://picsum.photos/200" alt="Profile" className="w-full h-full object-cover" />
            </div>
        </div>

        {/* Search */}
        <div className="relative shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl">
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch(searchText)}
            placeholder="Where do you want to go?"
            className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium transition-colors"
          />
          <Search className="absolute left-4 top-4 text-slate-400 dark:text-slate-500" size={20} />
          <button 
            onClick={() => setIsVoiceSearchActive(true)}
            className="absolute right-4 top-4 text-slate-400 dark:text-slate-500 hover:text-teal-600 dark:hover:text-teal-400"
            aria-label="Search by voice"
          >
            <Mic size={20} />
          </button>
        </div>
      </div>

      {/* Quick Access Grid */}
      <div className="px-6 mb-8">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Quick Access</h2>
        <div className="grid grid-cols-2 gap-4">
            {quickAccess.map((item) => (
                <button 
                    key={item.title}
                    onClick={() => onNavigate(item.view as ViewState)}
                    className="bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-start hover:shadow-md transition-all active:scale-95 duration-200"
                >
                    <div className={`p-3 rounded-2xl mb-3 ${item.color} shadow-lg shadow-opacity-20`}>
                        {item.icon}
                    </div>
                    <span className="font-bold text-slate-800 dark:text-slate-100">{item.title}</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{item.subtitle}</span>
                </button>
            ))}
        </div>
      </div>

      {/* Featured Section */}
      <div className="px-6 flex-1">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Popular Destinations</h2>
            <button className="text-teal-600 dark:text-teal-400 text-sm font-semibold">View All</button>
        </div>
        
        <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="min-w-[260px] h-64 rounded-3xl relative overflow-hidden group cursor-pointer shadow-lg" onClick={() => onNavigate('discover')}>
                    <img 
                        src={`https://picsum.photos/400/500?random=${i+10}`} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        alt="Destination" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-5">
                        <h3 className="text-white font-bold text-xl">Kyoto, Japan</h3>
                        <div className="flex items-center text-white/80 text-sm mt-1">
                            <Navigation size={14} className="mr-1" />
                            <span>12 Days Trip</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* Voice Search Overlay */}
      <VoiceSearchOverlay 
        isOpen={isVoiceSearchActive} 
        onClose={() => setIsVoiceSearchActive(false)} 
        onTranscript={handleVoiceSearchComplete} 
      />
    </div>
  );
};

export default Home;