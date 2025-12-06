import React, { useState, useEffect } from 'react';
import { Place } from '../types';
import { Filter, Star, MapPin, X, Search, Loader, Heart, Plus, Check, Link } from 'lucide-react'; // Added Link icon
import { discoverPlaces } from '../services/geminiService';

interface DiscoverProps {
  onSelectPlace: (place: Place) => void;
  searchTerm?: string;
  onSearch?: (term: string) => void;
  onSavePlace?: (place: Place) => void;
  tripSelection?: Place[];
  onToggleTripSelection?: (place: Place) => void;
  userLocation?: { latitude: number; longitude: number } | null; // New prop for user's location
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

  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    const fetchPlaces = async () => {
      if (!localSearchTerm || localSearchTerm.trim() === '') {
        setResults(mockPlaces);
        setGroundingSources([]);
        return;
      }

      setIsLoading(true);
      try {
        const { places, groundingSources: newGroundingSources } = await discoverPlaces(localSearchTerm, userLocation);
        setResults(places);
        setGroundingSources(newGroundingSources);
      } catch (error) {
        console.error("Failed to fetch places:", error);
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

      {!isLoading && filteredResults.length === 0 && (
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
                <div className="flex justify-between items-center">
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