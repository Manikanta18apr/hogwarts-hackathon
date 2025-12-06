import React, { useState } from 'react';
import { ItineraryItem } from '../types';
import { Sparkles, Save, Clock, MapPin, Zap, ArrowLeft, Star } from 'lucide-react';
import { generateAIItinerary } from '../services/geminiService';

interface ItineraryProps {
  items: ItineraryItem[];
  setItems: (items: ItineraryItem[]) => void;
  onBack?: () => void;
}

const Itinerary: React.FC<ItineraryProps> = ({ items, setItems, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState('Kyoto'); 

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
  };

  const sections = ['Morning', 'Afternoon', 'Evening'];

  return (
    <div className="pb-24 pt-8 px-4 min-h-screen bg-slate-50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
             {onBack && (
                <button onClick={onBack} className="mr-3 p-2 bg-white rounded-full shadow-sm text-slate-500">
                    <ArrowLeft size={20} />
                </button>
             )}
            <h2 className="text-2xl font-bold text-slate-900">Day 1 Plan</h2>
        </div>
        <button className="flex items-center text-sm font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 transition-colors">
          <Zap size={16} className="mr-1.5" />
          Optimize
        </button>
      </div>

      {/* Generator Control */}
      <div className="bg-white p-2 pl-4 rounded-2xl shadow-sm border border-slate-100 mb-8 flex items-center">
            <input 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="flex-1 bg-transparent text-slate-800 font-medium focus:outline-none py-2"
                placeholder="Where to?"
            />
            <button 
                onClick={handleGenerate}
                disabled={loading}
                className="bg-slate-900 text-white p-3 rounded-xl ml-2 disabled:opacity-70 transition-transform active:scale-95"
            >
                {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                    <Sparkles size={20} />
                )}
            </button>
      </div>

      {/* Timeline */}
      <div className="space-y-8 relative pl-2">
        {/* Vertical Line */}
        <div className="absolute left-6 top-4 bottom-0 w-0.5 bg-slate-200 z-0"></div>

        {sections.map((section) => {
          const sectionItems = items.filter(i => i.period === section);
          
          return (
            <div key={section} className="relative z-10">
              <div className="flex items-center mb-5">
                <div className="w-10 h-10 rounded-full bg-white border-4 border-slate-100 shadow-sm flex items-center justify-center text-slate-700 text-xs font-bold z-10">
                  {section.substring(0,1)}
                </div>
                <h3 className="ml-4 text-lg font-bold text-slate-800 tracking-wide">{section}</h3>
              </div>

              <div className="pl-14 space-y-6">
                {sectionItems.length === 0 ? (
                    <div className="py-6 border-2 border-dashed border-slate-200 rounded-2xl text-center text-slate-400 text-sm font-medium">
                        No activities planned
                    </div>
                ) : (
                    sectionItems.map((item) => (
                    <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="h-32 relative">
                            <img src={item.image || `https://picsum.photos/300/200?random=${item.id}`} alt={item.activity} className="w-full h-full object-cover" />
                            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg flex items-center shadow-sm">
                                <Star size={12} className="text-yellow-500 fill-yellow-500 mr-1" />
                                <span className="text-xs font-bold text-slate-800">{item.rating?.toFixed(1) || '4.5'}</span>
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                                    <Clock size={12} className="mr-1" />
                                    {item.time}
                                </div>
                                {item.distance && (
                                    <span className="text-xs text-slate-400 font-medium">{item.distance} away</span>
                                )}
                            </div>
                            <h4 className="font-bold text-slate-800 text-lg mb-1">{item.activity}</h4>
                            <p className="text-sm text-slate-500 line-clamp-2">{item.description}</p>
                            
                            {item.mapUrl && (
                                <a 
                                    href={item.mapUrl}
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="mt-3 flex items-center text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
                                >
                                    <MapPin size={16} className="mr-1" />
                                    Get Directions
                                </a>
                            )}
                        </div>
                    </div>
                    ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Itinerary;