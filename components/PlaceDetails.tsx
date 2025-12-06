import React from 'react';
import { Place } from '../types';
import { ArrowLeft, MapPin, Clock, Wallet, CheckCircle, Share2 } from 'lucide-react';

interface PlaceDetailsProps {
  place: Place;
  onBack: () => void;
  onAddToItinerary: (place: Place) => void;
}

const PlaceDetails: React.FC<PlaceDetailsProps> = ({ place, onBack, onAddToItinerary }) => {
  return (
    <div className="bg-white min-h-screen pb-24">
      {/* Hero Image */}
      <div className="relative h-72">
        <img src={place.image} alt={place.title} className="w-full h-full object-cover" />
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start bg-gradient-to-b from-black/50 to-transparent">
          <button onClick={onBack} className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30">
            <ArrowLeft size={24} />
          </button>
           <button className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30">
            <Share2 size={24} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 -mt-8 bg-white rounded-t-3xl relative z-10">
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>
        
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{place.title}</h1>
        
        <div className="flex items-center space-x-4 mb-6 text-sm text-slate-500">
           <div className="flex items-center">
             <StarIcon filled />
             <span className="ml-1 font-semibold text-slate-800">{place.rating}</span>
             <span className="ml-1">({place.reviews} reviews)</span>
           </div>
           <div className="flex items-center">
             <Wallet size={16} className="mr-1" />
             <span>{place.cost}</span>
           </div>
        </div>

        <p className="text-slate-600 leading-relaxed mb-6">
          {place.description}
        </p>

        {/* Hidden Gem Card */}
        {place.hiddenGemReason && (
           <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl mb-6">
             <div className="flex items-start">
               <div className="bg-indigo-100 p-2 rounded-full mr-3 text-indigo-600">
                 <MapPin size={20} />
               </div>
               <div>
                 <h4 className="font-semibold text-indigo-900 text-sm mb-1">Why it's a Hidden Gem</h4>
                 <p className="text-indigo-800 text-sm">{place.hiddenGemReason}</p>
               </div>
             </div>
           </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-50 p-4 rounded-xl">
                <div className="flex items-center text-slate-500 mb-2">
                    <Clock size={16} className="mr-2" />
                    <span className="text-xs font-bold uppercase tracking-wider">Best Time</span>
                </div>
                <p className="font-semibold text-slate-800">{place.bestTime}</p>
            </div>
             <div className="bg-slate-50 p-4 rounded-xl">
                <div className="flex items-center text-slate-500 mb-2">
                    <MapPin size={16} className="mr-2" />
                    <span className="text-xs font-bold uppercase tracking-wider">Location</span>
                </div>
                <p className="font-semibold text-slate-800 text-sm truncate">View on Map</p>
            </div>
        </div>

        <button 
            onClick={() => onAddToItinerary(place)}
            className="w-full bg-teal-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-teal-200 hover:bg-teal-700 active:scale-[0.98] transition-all flex items-center justify-center"
        >
            <CheckCircle className="mr-2" />
            Add to Itinerary
        </button>
      </div>
    </div>
  );
};

const StarIcon = ({ filled }: { filled?: boolean }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="16" height="16" 
        viewBox="0 0 24 24" 
        fill={filled ? "#EAB308" : "none"} 
        stroke={filled ? "#EAB308" : "currentColor"} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
    >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
)

export default PlaceDetails;