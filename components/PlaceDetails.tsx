import React from 'react';
import { Place } from '../types';
import { ArrowLeft, MapPin, Clock, Wallet, CheckCircle, Share2, Navigation } from 'lucide-react';

interface PlaceDetailsProps {
  place: Place;
  onBack: () => void;
  onAddToItinerary: (place: Place) => void;
}

const PlaceDetails: React.FC<PlaceDetailsProps> = ({ place, onBack, onAddToItinerary }) => {
  return (
    <div className="bg-white min-h-screen pb-24">
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
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-white rounded-t-3xl"></div>
      </div>

      {/* Content */}
      <div className="px-6 -mt-4 relative z-10">
        <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-slate-900 leading-tight w-3/4">{place.title}</h1>
            <div className="flex flex-col items-center bg-teal-50 px-3 py-2 rounded-xl">
                 <span className="font-bold text-teal-700 text-lg">{place.rating}</span>
                 <span className="text-[10px] text-teal-600 font-medium uppercase">Rating</span>
            </div>
        </div>
        
        <div className="flex items-center space-x-4 mb-8 text-sm text-slate-500">
           <div className="flex items-center bg-slate-100 px-3 py-1.5 rounded-lg">
             <Wallet size={16} className="mr-1.5 text-slate-600" />
             <span className="font-medium">{place.cost}</span>
           </div>
           <span className="text-slate-300">|</span>
           <span className="font-medium">{place.reviews} Reviews</span>
        </div>

        <p className="text-slate-600 leading-relaxed mb-8 text-base">
          {place.description}
        </p>

        {/* Hidden Gem Card */}
        {place.hiddenGemReason && (
           <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-2xl mb-8 flex items-start shadow-sm">
               <div className="bg-indigo-100 p-2.5 rounded-full mr-4 text-indigo-600 shrink-0">
                 <SparklesIcon />
               </div>
               <div>
                 <h4 className="font-bold text-indigo-900 text-sm mb-1 uppercase tracking-wide">Hidden Gem</h4>
                 <p className="text-indigo-800 text-sm leading-relaxed">{place.hiddenGemReason}</p>
               </div>
           </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <div className="flex items-center text-slate-500 mb-2">
                    <Clock size={16} className="mr-2" />
                    <span className="text-xs font-bold uppercase tracking-wider">Best Time</span>
                </div>
                <p className="font-bold text-slate-800">{place.bestTime}</p>
            </div>
             <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <div className="flex items-center text-slate-500 mb-2">
                    <MapPin size={16} className="mr-2" />
                    <span className="text-xs font-bold uppercase tracking-wider">Distance</span>
                </div>
                <p className="font-bold text-slate-800">2.4 km away</p>
            </div>
        </div>

        <div className="flex gap-3 pb-8">
             <button 
                className="flex-1 bg-white border border-slate-200 text-slate-700 py-4 rounded-2xl font-bold shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center"
            >
                <Navigation className="mr-2" size={20} />
                Directions
            </button>
            <button 
                onClick={() => onAddToItinerary(place)}
                className="flex-[2] bg-teal-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-teal-200 hover:bg-teal-700 active:scale-[0.98] transition-all flex items-center justify-center"
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