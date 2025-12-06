import React from 'react';
import { User, Settings, Heart, Map } from 'lucide-react';

const Profile: React.FC = () => {
  return (
    <div className="pb-24 pt-10 px-6">
      <div className="flex items-center space-x-4 mb-8">
        <div className="w-20 h-20 rounded-full bg-slate-200 overflow-hidden border-4 border-white shadow-lg">
            <img src="https://picsum.photos/200" alt="User" className="w-full h-full object-cover" />
        </div>
        <div>
            <h2 className="text-2xl font-bold text-slate-900">Alex Explorer</h2>
            <p className="text-slate-500 text-sm">Level 3 Traveler</p>
        </div>
      </div>

      <div className="space-y-2 mb-8">
        <h3 className="font-bold text-slate-800 mb-4">Your Stats</h3>
        <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-center">
                <div className="text-2xl font-bold text-teal-600">12</div>
                <div className="text-xs text-slate-500 uppercase tracking-wide">Hidden Gems</div>
            </div>
             <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-center">
                <div className="text-2xl font-bold text-teal-600">5</div>
                <div className="text-xs text-slate-500 uppercase tracking-wide">Countries</div>
            </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex items-center p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer">
            <Heart size={20} className="text-slate-400 mr-4" />
            <span className="font-medium text-slate-700">Saved Places</span>
        </div>
        <div className="flex items-center p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer">
            <Map size={20} className="text-slate-400 mr-4" />
            <span className="font-medium text-slate-700">Past Itineraries</span>
        </div>
         <div className="flex items-center p-4 hover:bg-slate-50 cursor-pointer">
            <Settings size={20} className="text-slate-400 mr-4" />
            <span className="font-medium text-slate-700">Settings</span>
        </div>
      </div>
      
      <div className="mt-6">
          <h3 className="font-bold text-slate-800 mb-2">Interests</h3>
          <div className="flex flex-wrap gap-2">
              {['Photography', 'Street Food', 'History', 'Hiking'].map(i => (
                  <span key={i} className="px-3 py-1 bg-slate-200 text-slate-600 rounded-full text-xs font-semibold">{i}</span>
              ))}
          </div>
      </div>
    </div>
  );
};

export default Profile;