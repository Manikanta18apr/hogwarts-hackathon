import React, { useState } from 'react';
import { ItineraryItem } from '../types';
import { Sparkles, Save, Clock, GripVertical } from 'lucide-react';
import { generateAIItinerary } from '../services/geminiService';

interface ItineraryProps {
  items: ItineraryItem[];
  setItems: (items: ItineraryItem[]) => void;
}

const Itinerary: React.FC<ItineraryProps> = ({ items, setItems }) => {
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState('Kyoto'); // Default for demo

  const handleGenerate = async () => {
    setLoading(true);
    const newItinerary = await generateAIItinerary(location, ['Culture', 'Food', 'Nature']);
    setItems(newItinerary);
    setLoading(false);
  };

  const sections = ['Morning', 'Afternoon', 'Evening'];

  return (
    <div className="pb-24 pt-4 px-4 min-h-screen bg-slate-50">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Your Trip</h2>
        <button className="flex items-center text-sm font-semibold text-teal-600 bg-teal-50 px-3 py-1.5 rounded-lg hover:bg-teal-100">
          <Save size={16} className="mr-1" />
          Save
        </button>
      </div>

      {/* Generator Control */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 mb-8">
        <h3 className="font-semibold text-slate-700 mb-3">AI Planner</h3>
        <div className="flex gap-2">
            <input 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-teal-500"
                placeholder="Where are you going?"
            />
            <button 
                onClick={handleGenerate}
                disabled={loading}
                className="bg-teal-600 text-white px-4 py-2 rounded-xl flex items-center justify-center disabled:opacity-50"
            >
                {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                    <Sparkles size={18} />
                )}
            </button>
        </div>
        <p className="text-xs text-slate-400 mt-2">Tap stars to auto-generate a plan based on your interests.</p>
      </div>

      {/* Timeline */}
      <div className="space-y-8 relative">
        {/* Vertical Line */}
        <div className="absolute left-4 top-4 bottom-0 w-0.5 bg-slate-200 z-0"></div>

        {sections.map((section) => {
          const sectionItems = items.filter(i => i.period === section);
          
          return (
            <div key={section} className="relative z-10">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full bg-teal-100 border-4 border-white shadow-sm flex items-center justify-center text-teal-700 text-xs font-bold z-10">
                  {section.substring(0,1)}
                </div>
                <h3 className="ml-3 text-lg font-bold text-slate-700">{section}</h3>
              </div>

              <div className="pl-12 space-y-4">
                {sectionItems.length === 0 ? (
                    <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-sm">
                        Nothing scheduled
                    </div>
                ) : (
                    sectionItems.map((item) => (
                    <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex gap-3 group">
                        <div className="text-slate-300 mt-1 cursor-grab">
                            <GripVertical size={16} />
                        </div>
                        <div>
                            <div className="flex items-center text-xs text-teal-600 font-bold mb-1">
                                <Clock size={12} className="mr-1" />
                                {item.time}
                            </div>
                            <h4 className="font-semibold text-slate-800">{item.activity}</h4>
                            <p className="text-xs text-slate-500 mt-1">{item.description}</p>
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