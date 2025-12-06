import React, { useState, useEffect } from 'react';
import { Place } from '../types';
import { Filter, Star, MapPin, X, Search, Loader } from 'lucide-react';
import { discoverPlaces } from '../services/geminiService';

interface DiscoverProps {
  onSelectPlace: (place: Place) => void;
  searchTerm?: string;
  onSearch?: (term: string) => void;
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
    hiddenGemReason: 'Located behind an old bookstore, invisible from the main street.'
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
    hiddenGemReason: 'Popular with local chefs after their shifts.'
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
    hiddenGemReason: 'Omitted from most tourist guidebooks to preserve tranquility.'
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
    hiddenGemReason: 'Entrance is through a vending machine door.'
  }
];

const Discover: React.FC<DiscoverProps> = ({ onSelectPlace, searchTerm = '', onSearch }) => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [results, setResults] = useState<Place[]>(mockPlaces);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    const fetchPlaces = async () => {
      if (!searchTerm || searchTerm.trim() === '') {
        setResults(mockPlaces);
        return;
      }

      setIsLoading(true);
      try {
        const aiResults = await discoverPlaces(searchTerm);
        if (aiResults && aiResults.length > 0) {
          setResults(aiResults);
        } else {
          setResults([]); 
        }
      } catch (error) {
        console.error("Search failed", error);
        setResults(mockPlaces);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
        fetchPlaces();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  const filters = ['All', 'Distance', 'Budget', 'Popular', 'Hidden'];

  const filteredPlaces = results.filter(place => {
    let matchesFilter = true;
    if (activeFilter === 'Popular') matchesFilter = place.rating >= 4.8;
    if (activeFilter === 'Budget') matchesFilter = place.cost === '$' || place.cost === 'Free';
    if (activeFilter === 'Hidden') matchesFilter = !!place.hiddenGemReason;
    return matchesFilter;
  });

  const handleSearchSubmit = () => {
      if (onSearch) {
          onSearch(localSearchTerm);
      }
  };

  return (
    <div className="pb-24 pt-4 px-4 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-300">
      {/* Search Header */}
      <div className="flex space-x-3 mb-6">
        <div className="flex-1 relative">
            <input 
                type="text" 
                value={localSearchTerm}
                onChange={(e) => setLocalSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                placeholder="Search places..."
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
            <button 
                onClick={handleSearchSubmit}
                className="absolute left-3 top-3.5 text-slate-400 dark:text-slate-500 hover:text-teal-600 dark:hover:text-teal-400"
            >
                <Search size={18} />
            </button>
            {localSearchTerm && (
                <button 
                    onClick={() => {
                        setLocalSearchTerm('');
                        if (onSearch) onSearch('');
                    }}
                    className="absolute right-3 top-3.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                >
                    <X size={18} />
                </button>
            )}
        </div>
        <button className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
          <Filter size={20} />
        </button>
      </div>

      {/* Filters (Horizontal Scroll) */}
      <div className="flex space-x-3 overflow-x-auto no-scrollbar mb-6 pb-2">
        {filters.map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeFilter === filter
                ? 'bg-teal-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
              <Loader className="animate-spin text-teal-600 dark:text-teal-400 mb-4" size={32} />
              <p className="text-slate-500 dark:text-slate-400 font-medium">Finding the best spots for you...</p>
          </div>
      )}

      {/* Cards List */}
      {!isLoading && (
        <div className="space-y-6">
            {filteredPlaces.length > 0 ? (
                filteredPlaces.map((place) => (
                <div 
                    key={place.id}
                    onClick={() => onSelectPlace(place)}
                    className="bg-white dark:bg-slate-900 rounded-3xl shadow-md overflow-hidden cursor-pointer active:scale-95 transition-all border border-slate-100 dark:border-slate-800"
                >
                    <div className="h-48 relative">
                    <img src={place.image} alt={place.title} className="w-full h-full object-cover" />
                    <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center shadow-sm">
                        <Star size={14} className="text-yellow-500 fill-yellow-500 mr-1" />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{place.rating}</span>
                    </div>
                    </div>
                    <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{place.title}</h3>
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{place.cost}</span>
                    </div>
                    <div className="flex items-center text-slate-400 dark:text-slate-500 mb-3 text-sm">
                        <MapPin size={14} className="mr-1" />
                        <span>{place.coordinates ? 'Nearby' : 'Location TBD'}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                        {place.tags && place.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs rounded-md">
                            {tag}
                        </span>
                        ))}
                    </div>
                    <button className="w-full py-2 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 font-semibold rounded-xl text-sm hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors">
                        View Details
                    </button>
                    </div>
                </div>
                ))
            ) : (
                <div className="text-center py-10">
                    <div className="bg-slate-100 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 dark:text-slate-500">
                        <Search size={32} />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">No places found matching "{searchTerm}".</p>
                    <button 
                        onClick={() => { 
                            setActiveFilter('All'); 
                            setLocalSearchTerm(''); 
                            if(onSearch) onSearch(''); 
                        }} 
                        className="mt-4 text-teal-600 dark:text-teal-400 font-bold text-sm hover:underline"
                    >
                        Clear Search & Filters
                    </button>
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default Discover;