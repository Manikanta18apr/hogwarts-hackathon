import React, { useState, useEffect } from 'react';
import { Place } from '../types';
import { Filter, Star, MapPin, X, Search, Loader, Heart, Plus, Check, Link, AlertTriangle, Users } from 'lucide-react'; // Added Users icon
import { discoverPlaces } from '../services/geminiService';

interface DiscoverProps {
  onSelectPlace: (place: Place) => void;
  searchTerm?: string;
  onSearch?: (term: string) => void;
  onSavePlace?: (place: Place) => void;
  tripSelection?: Place[];
  onToggleTripSelection?: (place: Place) => void;
  userLocation?: { latitude: number; longitude: number } | null; // Added userLocation prop
}

const mockPlaces: Place[] = [
  {
    id: '1',
    title: 'Secret Pottery Studio',
    image: 'https://picsum.photos/500/300?random=1',
    tags: ['Culture', 'Art'],
    description: 'A tucked-away pottery studio run by a 3rd generation artisan. Experience the calm of clay in a rustic setting.',
    rating: 4.8,
    reviews: 124,
    cost: '$$',
    bestTime: 'Weekdays 10 AM',
    coordinates: { lat: 35.6, lng: 139.7 },
    hiddenGemReason: 'Located behind an old bookstore, invisible from the main street.',
    popularTimes: [
      { hour: 8, crowdPercentage: 10 }, { hour: 9, crowdPercentage: 15 }, { hour: 10, crowdPercentage: 30 },
      { hour: 11, crowdPercentage: 40 }, { hour: 12, crowdPercentage: 55 }, { hour: 13, crowdPercentage: 60 },
      { hour: 14, crowdPercentage: 50 }, { hour: 15, crowdPercentage: 35 }, { hour: 16, crowdPercentage: 25 },
      { hour: 17, crowdPercentage: 20 }, { hour: 18, crowdPercentage: 15 }, { hour: 19, crowdPercentage: 10 },
      { hour: 20, crowdPercentage: 5 }, { hour: 21, crowdPercentage: 5 }, { hour: 22, crowdPercentage: 5 },
    ]
  },
  {
    id: '2',
    title: 'Neon Ramen Bar',
    image: 'https://picsum.photos/500/300?random=2',
    tags: ['Food', 'Nightlife', 'Budget'],
    description: 'Only 8 seats, serving the best spicy miso broth in the district. No signs, just a red lantern.',
    rating: 4.9,
    reviews: 890,
    cost: '$',
    bestTime: 'Late Night',
    coordinates: { lat: 35.61, lng: 139.72 },
    hiddenGemReason: 'Popular with local chefs after their shifts.',
    popularTimes: [
      { hour: 8, crowdPercentage: 5 }, { hour: 9, crowdPercentage: 5 }, { hour: 10, crowdPercentage: 10 },
      { hour: 11, crowdPercentage: 15 }, { hour: 12, crowdPercentage: 30 }, { hour: 13, crowdPercentage: 40 },
      { hour: 14, crowdPercentage: 25 }, { hour: 15, crowdPercentage: 15 }, { hour: 16, crowdPercentage: 20 },
      { hour: 17, crowdPercentage: 40 }, { hour: 18, crowdPercentage: 70 }, { hour: 19, crowdPercentage: 90 },
      { hour: 20, crowdPercentage: 95 }, { hour: 21, crowdPercentage: 80 }, { hour: 22, crowdPercentage: 60 },
    ]
  },
  {
    id: '3',
    title: 'The Silent Garden',
    image: 'https://picsum.photos/500/300?random=3',
    tags: ['Nature', 'Spiritual'],
    description: 'An ancient zen garden that allows only 10 visitors at a time to maintain silence.',
    rating: 4.7,
    reviews: 50,
    cost: 'Free',
    bestTime: 'Early Morning',
    coordinates: { lat: 35.62, lng: 139.71 },
    hiddenGemReason: 'Omitted from most tourist guidebooks to preserve tranquility.',
    popularTimes: [
      { hour: 8, crowdPercentage: 20 }, { hour: 9, crowdPercentage: 25 }, { hour: 10, crowdPercentage: 20 },
      { hour: 11, crowdPercentage: 15 }, { hour: 12, crowdPercentage: 10 }, { hour: 13, crowdPercentage: 10 },
      { hour: 14, crowdPercentage: 10 }, { hour: 15, crowdPercentage: 10 }, { hour: 16, crowdPercentage: 10 },
      { hour: 17, crowdPercentage: 10 }, { hour: 18, crowdPercentage: 5 }, { hour: 19, crowdPercentage: 5 },
      { hour: 20, crowdPercentage: 5 }, { hour: 21, crowdPercentage: 5 }, { hour: 22, crowdPercentage: 5 },
    ]
  },
    {
    id: '4',
    title: 'Rooftop Jazz & Vinyl',
    image: 'https://picsum.photos/500/300?random=4',
    tags: ['Music', 'Nightlife'],
    description: 'High-fidelity audio system and a massive vinyl collection on a breezy rooftop.',
    rating: 4.6,
    reviews: 210,
    cost: '$$$',
    bestTime: 'Sunset',
    coordinates: { lat: 35.63, lng: 139.73 },
    hiddenGemReason: 'Entrance is through a vending machine door.',
    popularTimes: [
      { hour: 8, crowdPercentage: 5 }, { hour: 9, crowdPercentage: 5 }, { hour: 10, crowdPercentage: 5 },
      { hour: 11, crowdPercentage: 5 }, { hour: 12, crowdPercentage: 10 }, { hour: 13, crowdPercentage: 10 },
      { hour: 14, crowdPercentage: 10 }, { hour: 15, crowdPercentage: 15 }, { hour: 16, crowdPercentage: 20 },
      { hour: 17, crowdPercentage: 30 }, { hour: 18, crowdPercentage: 50 }, { hour: 19, crowdPercentage: 70 },
      { hour: 20, crowdPercentage: 85 }, { hour: 21, crowdPercentage: 90 }, { hour: 22, crowdPercentage: 75 },
    ]
  }
];

const Discover: React.FC<DiscoverProps> = ({ 
  onSelectPlace, 
  searchTerm = '', 
  onSearch, 
  onSavePlace,
  tripSelection = [],
  onToggleTripSelection,
  userLocation, // Added userLocation prop
}) => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [results, setResults] = useState<Place[]>(mockPlaces);
  const [groundingSources, setGroundingSources] = useState<any[]>([]); // New state for grounding sources
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null); // New state for API errors

  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    const fetchPlaces = async () => {
      if (!localSearchTerm || localSearchTerm.trim() === '') {
        setResults(mockPlaces);
        setGroundingSources([]);
        setApiError(null); // Clear error when no search term
        return;
      }

      setIsLoading(true);
      setApiError(null); // Clear previous errors on new search
      try {
        const { places, groundingSources: newGroundingSources, errorMessage } = await discoverPlaces(localSearchTerm, userLocation);
        if (errorMessage) {
          setApiError(errorMessage);
          setResults([]); // Clear results on error
        } else {
          setResults(places);
          setGroundingSources(newGroundingSources);
        }
      } catch (error) {
        console.error("Failed to fetch places:", error);
        setApiError("An unexpected client-side error occurred.");
        setResults([]);
        setGroundingSources([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaces();
  }, [localSearchTerm, userLocation]); // Rerun when localSearchTerm or userLocation changes

  const filters = ['All', 'Food', 'Culture', 'Nature', 'Nightlife', 'Hidden Gems'];

  const filteredResults = activeFilter === 'All'
    ? results
    : results.filter(place => 
        place.tags.some(tag => tag === activeFilter) || 
        (activeFilter === 'Hidden Gems' && place.hiddenGemReason)
      );

  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    return `${hour % 12} ${hour < 12 ? 'AM' : 'PM'}`;
  };

  return (
    <div className="pb-24 pt-8 px-4 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-300">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Discover</h2>
        <button className="p-2 bg-white dark:bg-slate-900 rounded-full shadow-sm text-slate-500 dark:text-slate-400">
          <Filter size={20} />
        </button>
      </div>

      {/* Search Input */}
      <div className="relative shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl mb-6">
        <input
          type="text"
          value={localSearchTerm}
          onChange={(e) => setLocalSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch && onSearch(localSearchTerm)}
          placeholder="Search places or activities"
          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium transition-colors"
        />
        <Search className="absolute left-4 top-4 text-slate-400 dark:text-slate-500" size={20} />
      </div>

      {/* API Error Message */}
      {apiError && (
        <div className="bg-rose-100 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 p-4 rounded-xl flex items-start mb-6 text-sm">
          <AlertTriangle size={20} className="mr-3 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold mb-1">Error fetching data:</p>
            <p className="leading-relaxed">{apiError}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex space-x-3 overflow-x-auto no-scrollbar mb-6">
        {filters.map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap ${
              activeFilter === filter
                ? 'bg-teal-600 text-white shadow-md shadow-teal-200 dark:shadow-teal-900/30'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-10 text-teal-600 dark:text-teal-400">
          <Loader className="animate-spin mr-2" size={24} /> Loading amazing places...
        </div>
      )}

      {!isLoading && filteredResults.length === 0 && !apiError && ( // Only show "No places found" if no API error
        <div className="text-center py-10 text-slate-500 dark:text-slate-400">
          No places found for your search/filters.
        </div>
      )}

      {/* Grounding Sources */}
      {groundingSources.length > 0 && (
        <div className="mb-6 bg-slate-100 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center">
            <Link size={16} className="mr-2 text-teal-600 dark:text-teal-400" />
            Sources
          </h3>
          <div className="space-y-2">
            {groundingSources.map((source, index) => {
              if (source.web?.uri) {
                return (
                  <a key={`web-${index}`} href={source.web.uri} target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 dark:text-blue-400 hover:underline">
                    {source.web.title || source.web.uri}
                  </a>
                );
              }
              if (source.maps?.uri) {
                return (
                  <a key={`maps-${index}`} href={source.maps.uri} target="_blank" rel="noopener noreferrer" className="block text-sm text-green-600 dark:text-green-400 hover:underline">
                    {source.maps.title || source.maps.uri}
                  </a>
                );
              }
              return null;
            })}
          </div>
        </div>
      )}

      {/* Place Cards */}
      <div className="space-y-4">
        {filteredResults.map(place => {
          const isSelectedForTrip = tripSelection.some(p => p.id === place.id);
          return (
            <div
              key={place.id}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden"
            >
              <div className="relative h-48 cursor-pointer" onClick={() => onSelectPlace(place)}>
                <img src={place.image} alt={place.title} className="w-full h-full object-cover" />
                <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-2 py-1 rounded-lg flex items-center shadow-sm">
                  <Star size={12} className="text-yellow-500 fill-yellow-500 mr-1" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{place.rating.toFixed(1)}</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-xl text-slate-800 dark:text-white mb-1">{place.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">{place.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {place.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-xs font-semibold">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Popular Times Section */}
                {place.popularTimes && place.popularTimes.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <h4 className="font-bold text-slate-800 dark:text-white text-sm mb-3 flex items-center">
                      <Users size={16} className="mr-2 text-teal-600 dark:text-teal-400" />
                      Popular Times Today
                    </h4>
                    <div className="grid grid-cols-1 gap-y-1.5 text-xs">
                      {place.popularTimes.map((time, idx) => (
                        <div key={idx} className="flex items-center">
                          <span className="w-12 shrink-0 text-slate-500 dark:text-slate-400 font-medium">{formatHour(time.hour)}</span>
                          <div className="relative flex-1 h-4 bg-slate-100 dark:bg-slate-800 rounded-full ml-2 overflow-hidden">
                            <div 
                              className="absolute h-full rounded-full transition-all duration-300"
                              style={{ 
                                width: `${time.crowdPercentage}%`, 
                                background: `linear-gradient(to right, ${time.crowdPercentage < 30 ? '#A7F3D0' : time.crowdPercentage < 60 ? '#34D399' : '#0D9488'} 0%, ${time.crowdPercentage < 30 ? '#A7F3D0' : time.crowdPercentage < 60 ? '#34D399' : '#0D9488'} 100%)`
                              }}
                            ></div>
                            <span className="absolute inset-0 flex items-center justify-center font-semibold text-slate-700 dark:text-slate-200" style={{ color: time.crowdPercentage > 50 ? 'white' : undefined }}>
                              {time.crowdPercentage}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-2 px-2">
                        <span>Less Crowded</span>
                        <span>More Crowded</span>
                    </div>
                  </div>
                )}


                <div className="flex justify-between items-center mt-4"> {/* Added mt-4 for spacing */}
                  <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                    <MapPin size={16} className="mr-1.5 text-slate-400 dark:text-slate-500" />
                    <span>{place.cost} • {place.bestTime}</span>
                  </div>
                  <div className="flex gap-2">
                    {onSavePlace && (
                        <button 
                            onClick={() => onSavePlace(place)}
                            className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                            title="Save Place"
                        >
                            <Heart size={18} />
                        </button>
                    )}
                    {onToggleTripSelection && (
                        <button 
                            onClick={() => onToggleTripSelection(place)}
                            className={`p-2 rounded-full transition-colors ${
                                isSelectedForTrip 
                                ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400' 
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                            title={isSelectedForTrip ? "Remove from Trip" : "Add to Trip"}
                        >
                            {isSelectedForTrip ? <Check size={18} /> : <Plus size={18} />}
                        </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Discover;