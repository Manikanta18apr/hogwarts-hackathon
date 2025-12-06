import React, { useState, useEffect } from 'react';
import { ItineraryItem, Place } from '../types';
import { Sparkles, Save, Clock, MapPin, Zap, ArrowLeft, Star, Trash2, Navigation, Map as MapIcon, List, X } from 'lucide-react';
import { generateAIItinerary, optimizeRoute } from '../services/geminiService';
import RouteMapGoogle from './RouteMapGoogle'; // New component import

interface ItineraryProps {
  items: ItineraryItem[];
  setItems: (items: ItineraryItem[]) => void;
  onBack?: () => void;
  tripSelection?: Place[];
  setTripSelection?: React.Dispatch<React.SetStateAction<Place[]>>;
}

const Itinerary: React.FC<ItineraryProps> = ({ 
    items, 
    setItems, 
    onBack, 
    tripSelection = [],
    setTripSelection
}) => {
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState('Kyoto'); 
  const [activeTab, setActiveTab] = useState<'custom' | 'generate'>(tripSelection.length > 0 ? 'custom' : 'generate');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // If selection changes, default to custom view
  useEffect(() => {
    if (tripSelection.length > 0) setActiveTab('custom');
  }, [tripSelection.length]);

  const handleGenerate = async () => {
    setLoading(true);
    const newItinerary = await generateAIItinerary(location, ['Culture', 'Food', 'Nature']);
    // Mocking added rich data for visuals since API returns basic structure
    const richItinerary = newItinerary.map((item, i) => ({
        ...item,
        image: `https://picsum.photos/300/200?random=${i}`,
        rating: 4.5 + (Math.random() * 0.5),
        distance: `${(Math.random() * 5).toFixed(1)} km`
    }));
    setItems(richItinerary);
    setLoading(false);
    setViewMode('list');
  };

  const handleOptimizeRoute = async () => {
      if (tripSelection.length === 0) return;
      setLoading(true);
      const optimizedItems = await optimizeRoute(tripSelection);
      setItems(optimizedItems);
      setLoading(false);
      setViewMode('map'); // Switch to map view after optimization
  };

  const handleRemoveFromTrip = (id: string) => {
      if (setTripSelection) {
          setTripSelection(prev => prev.filter(p => p.id !== id));
      }
  };

  const sections = ['Morning', 'Afternoon', 'Evening'];

  // Check if we have valid coordinates to show the map
  const hasCoordinates = items.some(i => i.coordinates && i.coordinates.lat);

  return (
    <div className="pb-24 pt-8 px-4 min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
             {onBack && (
                <button onClick={onBack} className="mr-3 p-2 bg-white dark:bg-slate-900 rounded-full shadow-sm text-slate-500 dark:text-slate-400">
                    <ArrowLeft size={20} />
                </button>
             )}
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Trip Plan</h2>
        </div>
        
        {/* View Toggle */}
        {items.length > 0 && (
            <div className="flex bg-white dark:bg-slate-900 rounded-lg p-1 border border-slate-200 dark:border-slate-800">
                <button 
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-slate-100 dark:bg-slate-800 text-teal-600 dark:text-teal-400' : 'text-slate-400'}`}
                >
                    <List size={20} />
                </button>
                <button 
                    onClick={() => setViewMode('map')}
                    className={`p-2 rounded-md ${viewMode === 'map' ? 'bg-slate-100 dark:bg-slate-800 text-teal-600 dark:text-teal-400' : 'text-slate-400'}`}
                >
                    <MapIcon size={20} />
                </button>
            </div>
        )}
      </div>

      {/* Mode Toggle */}
      <div className="flex p-1 bg-white dark:bg-slate-900 rounded-xl mb-6 border border-slate-100 dark:border-slate-800">
          <button 
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'custom' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300' : 'text-slate-500 dark:text-slate-400'}`}
          >
              My Selection ({tripSelection.length})
          </button>
          <button 
            onClick={() => setActiveTab('generate')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'generate' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' : 'text-slate-500 dark:text-slate-400'}`}
          >
              Auto-Generate
          </button>
      </div>

      {activeTab === 'generate' ? (
        /* Generator Control */
        <div className="bg-white dark:bg-slate-900 p-2 pl-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 mb-8 flex items-center">
                <input 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="flex-1 bg-transparent text-slate-800 dark:text-white font-medium focus:outline-none py-2 placeholder:text-slate-400 dark:placeholder:text-slate-600"
                    placeholder="Where to?"
                />
                <button 
                    onClick={handleGenerate}
                    disabled={loading}
                    className="bg-indigo-600 text-white p-3 rounded-xl ml-2 disabled:opacity-70 transition-transform active:scale-95"
                >
                    {loading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                        <Sparkles size={20} />
                    )}
                </button>
        </div>
      ) : (
          /* Custom Route Control */
         <div className="mb-8">
            {tripSelection.length === 0 ? (
                <div className="text-center py-8 bg-slate-100 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Select places from 'Discover' to build your route.</p>
                </div>
            ) : (
                <>
                     {items.length === 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {tripSelection.map(place => (
                                <div key={place.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1 rounded-full flex items-center text-sm shadow-sm">
                                    <span className="text-slate-800 dark:text-slate-200 mr-2">{place.title}</span>
                                    <button onClick={() => handleRemoveFromTrip(place.id)} className="text-slate-400 hover:text-rose-500">
                                        <XIcon />
                                    </button>
                                </div>
                            ))}
                        </div>
                     )}
                    
                    <button 
                        onClick={handleOptimizeRoute}
                        disabled={loading}
                        className="w-full bg-teal-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-teal-200 dark:shadow-teal-900/30 hover:bg-teal-700 active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-70"
                    >
                         {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                Calculating Route...
                            </>
                        ) : (
                            <>
                                <Zap className="mr-2" size={20} />
                                Optimize Route with AI
                            </>
                        )}
                    </button>
                </>
            )}
         </div>
      )}

      {/* Map View Visualization */}
      {viewMode === 'map' && hasCoordinates && (
          <RouteMapGoogle items={items} />
      )}

      {/* Timeline List View */}
      {(items.length > 0 && viewMode === 'list') && (
        <div className="space-y-8 relative pl-2 animate-fade-in">
            {/* Vertical Line */}
            <div className="absolute left-6 top-4 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-800 z-0"></div>

            {sections.map((section) => {
            const sectionItems = items.filter(i => i.period === section);
            if (sectionItems.length === 0) return null;
            
            return (
                <div key={section} className="relative z-10">
                <div className="flex items-center mb-5">
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border-4 border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-center text-slate-700 dark:text-slate-300 text-xs font-bold z-10">
                    {section.substring(0,1)}
                    </div>
                    <h3 className="ml-4 text-lg font-bold text-slate-800 dark:text-slate-200 tracking-wide">{section}</h3>
                </div>

                <div className="pl-14 space-y-6">
                    {sectionItems.map((item) => (
                        <div key={item.id} className="relative">
                             {item.travelTime && (
                                <div className="absolute -top-6 left-0 text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full flex items-center">
                                    <Navigation size={10} className="mr-1" />
                                    {item.travelTime}
                                </div>
                            )}

                            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-md transition-shadow">
                                {item.image ? (
                                    <div className="h-32 relative">
                                        <img src={item.image} alt={item.activity} className="w-full h-full object-cover" />
                                        <div className="absolute top-2 right-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-2 py-1 rounded-lg flex items-center shadow-sm">
                                            <Star size={12} className="text-yellow-500 fill-yellow-500 mr-1" />
                                            <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{item.rating?.toFixed(1) || '4.5'}</span>
                                        </div>
                                    </div>
                                ) : null}
                                <div className="p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-md">
                                            <Clock size={12} className="mr-1" />
                                            {item.time}
                                        </div>
                                    </div>
                                    <h4 className="font-bold text-slate-800 dark:text-white text-lg mb-1">{item.activity}</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{item.description}</p>
                                    
                                    {item.mapUrl && (
                                        <a 
                                            href={item.mapUrl}
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="mt-3 flex items-center text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                        >
                                            <MapPin size={16} className="mr-1" />
                                            Get Directions
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                </div>
            );
            })}
        </div>
      )}
    </div>
  );
};

const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
)

export default Itinerary;