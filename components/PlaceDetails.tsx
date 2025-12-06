import React, { useState, useEffect, useRef } from 'react';
import { Place } from '../types';
import { ArrowLeft, MapPin, Clock, Wallet, CheckCircle, Share2, Navigation, Heart, Star, Users } from 'lucide-react'; // Added Users icon for popular times

declare global {
  interface Window {
    google: any;
  }
}

interface PlaceDetailsProps {
  place: Place;
  onBack: () => void;
  onAddToItinerary: (place: Place) => void;
  onSave?: (place: Place) => Promise<void>;
  isSaved?: boolean;
}

const mockReviews = [
  {
    id: 'r1',
    reviewerName: 'Traveler_Alex',
    rating: 5,
    date: '2 days ago',
    comment: 'Absolutely stunning! The atmosphere was incredibly peaceful and the craftsmanship was amazing. A true hidden gem.',
    avatar: 'https://picsum.photos/50/50?random=1'
  },
  {
    id: 'r2',
    reviewerName: 'FoodieExplorer',
    rating: 4,
    date: '1 week ago',
    comment: 'The ramen was fantastic, very authentic. Be prepared for a wait, but it’s worth it. Cash only!',
    avatar: 'https://picsum.photos/50/50?random=2'
  },
  {
    id: 'r3',
    reviewerName: 'ZenSeeker7',
    rating: 5,
    date: '2 weeks ago',
    comment: 'A profoundly serene experience. The limited entry truly preserves its tranquility. Highly recommend for quiet contemplation.',
    avatar: 'https://picsum.photos/50/50?random=3'
  }
];

const PlaceDetails: React.FC<PlaceDetailsProps> = ({ place, onBack, onAddToItinerary, onSave, isSaved = false }) => {
  const [saving, setSaving] = useState(false);
  const [savedLocal, setSavedLocal] = useState(isSaved);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any | null>(null);
  const markerRef = useRef<any | null>(null);
  const [mapLoading, setMapLoading] = useState(true);

  useEffect(() => {
    // Only attempt to load map if coordinates are valid
    if (!place.coordinates || !place.coordinates.lat || !place.coordinates.lng) {
      setMapLoading(false); // Indicate map is not available without valid coordinates
      return;
    }

    const loadMap = () => {
      if (mapRef.current && window.google?.maps) {
        setMapLoading(false);
        const { lat, lng } = place.coordinates;
        const center = { lat, lng };

        const mapOptions: any = { // Use 'any' for google.maps types
          center: center,
          zoom: 14, // Zoom level, adjust as needed
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
          zoomControl: true,
          scaleControl: false,
        };

        mapInstanceRef.current = new window.google.maps.Map(mapRef.current, mapOptions);

        // Add marker
        markerRef.current = new window.google.maps.Marker({
          position: center,
          map: mapInstanceRef.current,
          title: place.title,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="%230D9488" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M12 1.5l-6 6v10.5l6 6l6-6V7.5l-6-6z"/><circle cx="12" cy="7.5" r="2.5" fill="white"/></svg>',
            scaledSize: new window.google.maps.Size(32, 32),
            anchor: new window.google.maps.Point(16, 32)
          },
        });
      } else {
        // If API not loaded yet, retry
        const timer = setTimeout(loadMap, 200);
        return () => clearTimeout(timer);
      }
    };

    setMapLoading(true);
    // Initial check for Google Maps API, then start the loading process
    if (window.google?.maps) {
      loadMap();
    } else {
      const scriptCheckInterval = setInterval(() => {
        if (window.google?.maps) {
          clearInterval(scriptCheckInterval);
          loadMap();
        }
      }, 100);
      return () => clearInterval(scriptCheckInterval);
    }

    // Cleanup function
    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      // Google Maps JS API typically handles map instance cleanup if parent element is removed.
      // Explicitly setting to null might help, but not always strictly necessary.
      mapInstanceRef.current = null;
    };
  }, [place.coordinates]); // Re-run effect if place coordinates change

  const handleSave = async () => {
    if (!onSave) return;
    setSaving(true);
    try {
        await onSave(place);
        setSavedLocal(true);
    } catch (e) {
        console.error(e);
    } finally {
        setSaving(false);
    }
  };

  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    return `${hour % 12} ${hour < 12 ? 'AM' : 'PM'}`;
  };

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen pb-24 transition-colors duration-300">
      {/* Hero Image */}
      <div className="relative h-80">
        <img src={place.image} alt={place.title} className="w-full h-full object-cover" />
        <div className="absolute top-0 left-0 right-0 p-6 pt-12 flex justify-between items-start bg-gradient-to-b from-black/60 to-transparent">
          <button onClick={onBack} className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors">
            <ArrowLeft size={24} />
          </button>
           <button className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors">
            <Share2 size={24} />
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-white dark:bg-slate-950 rounded-t-3xl transition-colors duration-300"></div>
      </div>

      {/* Content */}
      <div className="px-6 -mt-4 relative z-10">
        <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white leading-tight w-3/4">{place.title}</h1>
            <div className="flex flex-col items-center bg-teal-50 dark:bg-teal-900/30 px-3 py-2 rounded-xl">
                 <span className="font-bold text-teal-700 dark:text-teal-300 text-lg">{place.rating}</span>
                 <span className="text-[10px] text-teal-600 dark:text-teal-400 font-medium uppercase">Rating</span>
            </div>
        </div>
        
        <div className="flex items-center space-x-4 mb-8 text-sm text-slate-500 dark:text-slate-400">
           <div className="flex items-center bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-lg">
             <Wallet size={16} className="mr-1.5 text-slate-600 dark:text-slate-400" />
             <span className="font-medium">{place.cost}</span>
           </div>
           <span className="text-slate-300 dark:text-slate-600">|</span>
           <span className="font-medium">{place.reviews} Reviews</span>
        </div>

        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-8 text-base">
          {place.description}
        </p>

        {/* Hidden Gem Card */}
        {place.hiddenGemReason && (
           <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 p-5 rounded-2xl mb-8 flex items-start shadow-sm">
               <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2.5 rounded-full mr-4 text-indigo-600 dark:text-indigo-400 shrink-0">
                 <SparklesIcon />
               </div>
               <div>
                 <h4 className="font-bold text-indigo-900 dark:text-indigo-200 text-sm mb-1 uppercase tracking-wide">Hidden Gem</h4>
                 <p className="text-indigo-800 dark:text-indigo-300 text-sm leading-relaxed">{place.hiddenGemReason}</p>
               </div>
           </div>
        )}

        {/* Location Map Section */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 mb-8">
            <h3 className="font-bold text-slate-900 dark:text-white text-xl mb-4 flex items-center">
                <MapPin size={20} className="mr-2 text-teal-600 dark:text-teal-400" />
                Location
            </h3>
            <div ref={mapRef} className="w-full h-64 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                {mapLoading ? 'Loading map...' : (!place.coordinates || (!place.coordinates.lat && !place.coordinates.lng)) ? 'Coordinates not available for this place.' : 'Map failed to load.'}
            </div>
        </div>

        {/* Popular Times Section */}
        {place.popularTimes && place.popularTimes.length > 0 && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 mb-8">
            <h3 className="font-bold text-slate-900 dark:text-white text-xl mb-4 flex items-center">
              <Users size={20} className="mr-2 text-teal-600 dark:text-teal-400" />
              Popular Times
            </h3>
            <div className="grid grid-cols-1 gap-y-2">
              {place.popularTimes.map((time, index) => (
                <div key={index} className="flex items-center text-sm">
                  <span className="w-14 shrink-0 text-slate-500 dark:text-slate-400">{formatHour(time.hour)}</span>
                  <div className="relative flex-1 h-6 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden ml-3">
                    <div 
                      className="absolute h-full rounded-full transition-all duration-300"
                      style={{ 
                        width: `${time.crowdPercentage}%`, 
                        background: `linear-gradient(to right, ${time.crowdPercentage < 30 ? '#A7F3D0' : time.crowdPercentage < 60 ? '#34D399' : '#0D9488'} 0%, ${time.crowdPercentage < 30 ? '#A7F3D0' : time.crowdPercentage < 60 ? '#34D399' : '#0D9488'} 100%)`
                      }}
                    ></div>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-slate-700 dark:text-slate-200" style={{ color: time.crowdPercentage > 50 ? 'white' : undefined }}>
                        {time.crowdPercentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-3 px-2">
                <span>Less Crowded</span>
                <span>More Crowded</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center text-slate-500 dark:text-slate-400 mb-2">
                    <Clock size={16} className="mr-2" />
                    <span className="text-xs font-bold uppercase tracking-wider">Best Time</span>
                </div>
                <p className="font-bold text-slate-800 dark:text-slate-200">{place.bestTime}</p>
            </div>
             <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center text-slate-500 dark:text-slate-400 mb-2">
                    <MapPin size={16} className="mr-2" />
                    <span className="text-xs font-bold uppercase tracking-wider">Distance</span>
                </div>
                <p className="font-bold text-slate-800 dark:text-slate-200">2.4 km away</p>
            </div>
        </div>

        {/* User Reviews Section */}
        <div className="mb-8">
          <h3 className="font-bold text-slate-900 dark:text-white text-xl mb-4">User Reviews ({place.reviews})</h3>
          {mockReviews.map(review => (
            <div key={review.id} className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 mb-4 shadow-sm">
              <div className="flex items-center mb-2">
                <img src={review.avatar} alt={review.reviewerName} className="w-10 h-10 rounded-full mr-3 object-cover" />
                <div>
                  <h4 className="font-semibold text-slate-800 dark:text-white">{review.reviewerName}</h4>
                  <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        size={14} 
                        className={`mr-0.5 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-300 dark:text-slate-700'}`} 
                      />
                    ))}
                    <span className="ml-1 text-xs">{review.date}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">"{review.comment}"</p>
            </div>
          ))}
          <button className="w-full py-3 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 font-semibold rounded-2xl text-sm hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors">
            View All Reviews
          </button>
        </div>


        <div className="flex gap-3 pb-8">
             <button 
                onClick={handleSave}
                disabled={savedLocal || saving}
                className={`flex-1 border text-slate-700 dark:text-slate-200 py-4 rounded-2xl font-bold shadow-sm transition-all flex items-center justify-center ${savedLocal ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:bg-slate-50'}`}
            >
                <Heart className={`mr-2 ${savedLocal ? 'fill-green-600 text-green-600' : ''}`} size={20} />
                {saving ? 'Saving...' : savedLocal ? 'Saved' : 'Save'}
            </button>
            <button 
                onClick={() => onAddToItinerary(place)}
                className="flex-[2] bg-teal-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-teal-200 dark:shadow-teal-900/30 hover:bg-teal-700 active:scale-[0.98] transition-all flex items-center justify-center"
            >
                <CheckCircle className="mr-2" size={20} />
                Add to Trip
            </button>
        </div>
      </div>
    </div>
  );
};

const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
)

export default PlaceDetails;