import React, { useState } from 'react';
import { Place, SavedPlace } from '../types';
import { Navigation, MapPin, X } from 'lucide-react';

interface MapScreenProps {
  savedPlaces?: SavedPlace[];
  onSelectPlace?: (place: Place) => void;
}

const MapScreen: React.FC<MapScreenProps> = ({ savedPlaces = [], onSelectPlace }) => {
  const [activePlace, setActivePlace] = useState<SavedPlace | null>(null);

  // Normalize coordinates to percentage for this CSS-only map visualization
  // In a real app with Google Maps JS SDK, you would pass lat/lng directly to <Marker />
  const getPosition = (place: SavedPlace, index: number) => {
    // Deterministic pseudo-random position based on ID if real coords aren't map-ready
    // This ensures pins stay in the same place for the demo
    const idNum = place.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const top = (idNum % 70) + 15; // 15% to 85%
    const left = ((idNum * 13) % 80) + 10; // 10% to 90%
    return { top: `${top}%`, left: `${left}%` };
  };

  return (
    <div className="relative h-screen w-full bg-slate-100 dark:bg-slate-900 overflow-hidden transition-colors duration-300">
      {/* Background Map Placeholder (CSS Pattern) */}
      <div 
        className="absolute inset-0 opacity-20 dark:opacity-10 pointer-events-none"
        style={{
            backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)',
            backgroundSize: '20px 20px'
        }}
      ></div>
      
      {/* Abstract Shapes representing map features */}
      <div className="absolute top-1/4 left-0 w-1/2 h-64 bg-slate-200 dark:bg-slate-800 rounded-r-full opacity-50 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-2/3 h-1/2 bg-slate-200 dark:bg-slate-800 rounded-tl-full opacity-50 pointer-events-none"></div>

      {/* Pins for Saved Places */}
      {savedPlaces.map((place, index) => {
        const pos = getPosition(place, index);
        const isActive = activePlace?.id === place.id;

        return (
            <div 
                key={place.id}
                className="absolute flex flex-col items-center group z-10"
                style={{ top: pos.top, left: pos.left, transition: 'all 0.5s ease-out' }}
                onClick={() => setActivePlace(place)}
            >
                <div className={`p-2 rounded-full shadow-lg border-2 border-white dark:border-slate-800 cursor-pointer transform transition-transform ${isActive ? 'scale-125 bg-rose-500 z-20' : 'bg-teal-500 hover:scale-110'}`}>
                    <MapPin size={24} className="text-white" />
                </div>
                {!isActive && (
                    <span className="bg-white/90 dark:bg-slate-800/90 backdrop-blur px-2 py-0.5 rounded-full text-xs font-bold shadow-sm mt-1 text-slate-800 dark:text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {place.title}
                    </span>
                )}
            </div>
        );
      })}

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

      {/* Controls */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between">
          <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-full shadow-lg text-sm font-semibold text-slate-700 dark:text-slate-200">
            Current Area: Historic District
          </div>
      </div>

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
            <button className="flex-1 bg-teal-600 text-white py-3 rounded-xl shadow-lg font-semibold flex items-center justify-center hover:bg-teal-700">
                <Navigation size={18} className="mr-2" />
                Directions
            </button>
        </div>
      )}
    </div>
  );
};

export default MapScreen;