import React, { useState, useEffect, useRef } from 'react';
import { Place, SavedPlace } from '../types';
import { Navigation, MapPin, X } from 'lucide-react';

// Extend Window interface to include google for Maps API
declare global {
  interface Window {
    google: any;
  }
}

interface MapScreenProps {
  savedPlaces?: SavedPlace[];
  onSelectPlace?: (place: Place) => void;
}

const MapScreen: React.FC<MapScreenProps> = ({ savedPlaces = [], onSelectPlace }) => {
  const [activePlace, setActivePlace] = useState<SavedPlace | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  // FIX: Use 'any' as the type for googleMap to resolve 'Cannot find namespace google' error.
  const googleMap = useRef<any | null>(null);
  // FIX: Use 'any[]' as the type for markersRef to resolve 'Cannot find namespace google' error.
  const markersRef = useRef<any[]>([]);

  // Initialize Google Map
  useEffect(() => {
    const initMap = () => {
      if (mapRef.current && window.google) {
        // Default center if no places are saved
        const defaultCenter = { lat: 34.052235, lng: -118.243683 }; // Los Angeles

        // FIX: Use 'any' as the type for mapOptions to resolve 'Cannot find namespace google' error.
        const mapOptions: any = {
          center: defaultCenter,
          zoom: 10,
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
        };

        googleMap.current = new window.google.maps.Map(mapRef.current, mapOptions);
        renderMarkers();
      }
    };

    // Check if Google Maps API is already loaded, otherwise wait for it
    if (window.google?.maps) {
      initMap();
    } else {
      // Small delay to ensure script has time to potentially load, or if it loads later
      const checkInterval = setInterval(() => {
        if (window.google?.maps) {
          clearInterval(checkInterval);
          initMap();
        }
      }, 100);
      return () => clearInterval(checkInterval);
    }

  }, []); // Run only once on component mount

  // Update markers when savedPlaces changes
  useEffect(() => {
    if (googleMap.current) {
      renderMarkers();
    }
  }, [savedPlaces, googleMap.current]);

  const renderMarkers = () => {
    if (!googleMap.current || !window.google) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    const bounds = new window.google.maps.LatLngBounds();

    savedPlaces.forEach(place => {
      if (!place.coordinates || !place.coordinates.lat || !place.coordinates.lng) {
        console.warn(`Place ${place.title} has invalid coordinates. Skipping marker.`);
        return;
      }

      const position = { lat: place.coordinates.lat, lng: place.coordinates.lng };
      const marker = new window.google.maps.Marker({
        position: position,
        map: googleMap.current,
        title: place.title,
        icon: {
            url: 'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="%230D9488" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M12 1.5l-6 6v10.5l6 6l6-6V7.5l-6-6z"/><circle cx="12" cy="7.5" r="2.5" fill="white"/></svg>',
            scaledSize: new window.google.maps.Size(32, 32), // size of the icon
            anchor: new window.google.maps.Point(16, 32) // point of the icon which will correspond to marker's position
        },
      });

      marker.addListener('click', () => {
        setActivePlace(place);
        googleMap.current?.panTo(position); // Pan to clicked marker
      });

      markersRef.current.push(marker);
      bounds.extend(position);
    });

    if (savedPlaces.length > 0) {
      googleMap.current.fitBounds(bounds);
      if (savedPlaces.length === 1) {
          googleMap.current.setZoom(14); // A bit closer for a single point
      }
    } else {
      googleMap.current.setCenter({ lat: 34.052235, lng: -118.243683 });
      googleMap.current.setZoom(10);
    }
  };

  const handleDirectionsClick = (place: SavedPlace) => {
    if (place.coordinates) {
      const { lat, lng } = place.coordinates;
      // Open Google Maps in a new tab with directions to the place
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden transition-colors duration-300">
      {/* Google Map Container */}
      <div ref={mapRef} className="w-full h-full bg-slate-200 dark:bg-slate-900 flex items-center justify-center text-slate-500 dark:text-slate-400">
        {!window.google && <p>Loading map...</p>}
      </div>
      
      {/* Controls */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between">
          <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-full shadow-lg text-sm font-semibold text-slate-700 dark:text-slate-200">
            {savedPlaces.length > 0 ? 'My Saved Places' : 'Explore Area'}
          </div>
      </div>

      {/* Empty State */}
      {savedPlaces.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur p-6 rounded-3xl text-center shadow-lg mx-6">
                  <MapPin size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                  <h3 className="font-bold text-slate-700 dark:text-slate-200">No places saved yet</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Save places from the Discover tab to see them here.</p>
              </div>
          </div>
      )}

      {/* Active Place Info Window (Bottom Sheet style) */}
      {activePlace && (
          <div className="absolute bottom-24 left-4 right-4 z-30 animate-slide-up">
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 flex items-center">
                  <img src={activePlace.image} className="w-16 h-16 rounded-xl object-cover mr-4" alt={activePlace.title} />
                  <div className="flex-1">
                      <h3 className="font-bold text-slate-900 dark:text-white">{activePlace.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{activePlace.rating} ★ • {activePlace.cost}</p>
                      <button 
                        onClick={() => onSelectPlace && onSelectPlace(activePlace)}
                        className="text-xs bg-teal-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-teal-700"
                      >
                          View Details
                      </button>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setActivePlace(null); }}
                    className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-2"
                  >
                      <X size={18} />
                  </button>
              </div>
          </div>
      )}

      {/* Standard Bottom Controls */}
      {!activePlace && (
        <div className="absolute bottom-24 left-4 right-4 z-20 flex gap-3">
            <button className="flex-1 bg-white dark:bg-slate-800 text-slate-800 dark:text-white py-3 rounded-xl shadow-lg font-semibold flex items-center justify-center">
                <MapPin size={18} className="mr-2 text-teal-600 dark:text-teal-400" />
                Nearby
            </button>
            <button 
                onClick={() => { /* Implement general directions or open a search */ }}
                className="flex-1 bg-teal-600 text-white py-3 rounded-xl shadow-lg font-semibold flex items-center justify-center hover:bg-teal-700"
            >
                <Navigation size={18} className="mr-2" />
                Directions
            </button>
        </div>
      )}

      {activePlace && (
          <div className="absolute bottom-6 left-4 right-4 z-20">
              <button 
                onClick={() => handleDirectionsClick(activePlace)}
                className="w-full bg-teal-600 text-white py-3 rounded-xl shadow-lg font-semibold flex items-center justify-center hover:bg-teal-700"
            >
                <Navigation size={18} className="mr-2" />
                Get Directions to {activePlace.title}
            </button>
          </div>
      )}
    </div>
  );
};

export default MapScreen;