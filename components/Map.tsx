import React from 'react';
import { Place } from '../types';
import { Navigation, MapPin } from 'lucide-react';

const MapScreen: React.FC = () => {
  // Simulated map pins
  const pins = [
    { id: 1, top: '30%', left: '40%', color: 'bg-teal-500', type: 'Gem' },
    { id: 2, top: '50%', left: '60%', color: 'bg-teal-500', type: 'Gem' },
    { id: 3, top: '20%', left: '70%', color: 'bg-orange-500', type: 'Event' },
    { id: 4, top: '65%', left: '30%', color: 'bg-purple-500', type: 'Activity' },
  ];

  return (
    <div className="relative h-screen w-full bg-slate-100 overflow-hidden">
      {/* Background Map Placeholder (CSS Pattern) */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
            backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
            backgroundSize: '20px 20px'
        }}
      ></div>
      
      {/* Abstract Shapes representing map features */}
      <div className="absolute top-1/4 left-0 w-1/2 h-64 bg-slate-200 rounded-r-full opacity-50"></div>
      <div className="absolute bottom-0 right-0 w-2/3 h-1/2 bg-slate-200 rounded-tl-full opacity-50"></div>

      {/* Pins */}
      {pins.map((pin) => (
        <div 
            key={pin.id}
            className="absolute flex flex-col items-center animate-bounce"
            style={{ top: pin.top, left: pin.left, animationDuration: `${2 + pin.id * 0.5}s` }}
        >
            <div className={`p-2 rounded-full shadow-lg ${pin.color} border-2 border-white cursor-pointer hover:scale-125 transition-transform`}>
                <MapPin size={24} className="text-white" />
            </div>
            <span className="bg-white/80 backdrop-blur px-2 py-0.5 rounded-full text-xs font-bold shadow-sm mt-1">{pin.type}</span>
        </div>
      ))}

      {/* Controls */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between">
          <div className="bg-white px-4 py-2 rounded-full shadow-lg text-sm font-semibold text-slate-700">
            Current Area: Historic District
          </div>
      </div>

      <div className="absolute bottom-24 left-4 right-4 z-20 flex gap-3">
        <button className="flex-1 bg-white text-slate-800 py-3 rounded-xl shadow-lg font-semibold flex items-center justify-center">
            <MapPin size={18} className="mr-2 text-teal-600" />
            Nearby
        </button>
        <button className="flex-1 bg-teal-600 text-white py-3 rounded-xl shadow-lg font-semibold flex items-center justify-center">
            <Navigation size={18} className="mr-2" />
            Directions
        </button>
      </div>
    </div>
  );
};

export default MapScreen;