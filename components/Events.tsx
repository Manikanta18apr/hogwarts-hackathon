import React from 'react';
import { EventItem } from '../types';
import { Calendar, Users, Share2 } from 'lucide-react';

const mockEvents: EventItem[] = [
  {
    id: '1',
    title: 'Street Food Night Market',
    date: 'Tonight, 7 PM',
    location: 'Old Town Square',
    image: 'https://picsum.photos/500/300?random=10',
    category: 'Food'
  },
  {
    id: '2',
    title: 'Jazz in the Park',
    date: 'Tomorrow, 5 PM',
    location: 'Central Gardens',
    image: 'https://picsum.photos/500/300?random=11',
    category: 'Music'
  },
  {
    id: '3',
    title: 'Pottery Workshop',
    date: 'Sat, 10 AM',
    location: 'The Clay House',
    image: 'https://picsum.photos/500/300?random=12',
    category: 'Workshop'
  }
];

const Events: React.FC = () => {
  return (
    <div className="pb-24 pt-4 px-4">
       <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Happening Now</h2>
        <span className="text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">3 Nearby</span>
      </div>

      <div className="space-y-4">
        {mockEvents.map(event => (
            <div key={event.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                <div className="h-40 relative">
                    <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg">
                        <span className="text-xs font-bold uppercase text-slate-800">{event.category}</span>
                    </div>
                </div>
                <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                             <h3 className="font-bold text-lg text-slate-800">{event.title}</h3>
                             <div className="flex items-center text-slate-500 text-sm mt-1">
                                <Calendar size={14} className="mr-1.5" />
                                {event.date}
                             </div>
                        </div>
                    </div>
                    
                    <div className="mt-4 flex gap-2">
                        <button className="flex-1 bg-teal-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-teal-700">
                            Book / Join
                        </button>
                        <button className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">
                            <Share2 size={18} />
                        </button>
                    </div>
                </div>
            </div>
        ))}
      </div>

      <div className="mt-8 bg-indigo-50 p-6 rounded-3xl text-center">
        <Users size={32} className="mx-auto text-indigo-500 mb-2" />
        <h3 className="font-bold text-indigo-900">Meet Locals</h3>
        <p className="text-sm text-indigo-700 mt-1 mb-4">Connect with travelers and locals nearby.</p>
        <button className="text-sm font-bold text-indigo-600 bg-white py-2 px-6 rounded-full shadow-sm">
            Join Community
        </button>
      </div>
    </div>
  );
};

export default Events;