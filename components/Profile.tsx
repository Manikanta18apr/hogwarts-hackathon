import React from 'react';
import { User, Settings, Heart, Map, Moon, Sun, ChevronRight, Bell } from 'lucide-react';

interface ProfileProps {
  isDarkMode?: boolean;
  toggleTheme?: () => void;
}

const Profile: React.FC<ProfileProps> = ({ isDarkMode, toggleTheme }) => {
  return (
    <div className="pb-24 pt-10 px-6 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-300">
      <div className="flex items-center space-x-4 mb-8">
        <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden border-4 border-white dark:border-slate-800 shadow-lg">
            <img src="https://picsum.photos/200" alt="User" className="w-full h-full object-cover" />
        </div>
        <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Alex Explorer</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Level 3 Traveler</p>
        </div>
      </div>

      <div className="space-y-2 mb-8">
        <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4">Your Stats</h3>
        <div className="grid grid-cols-2 gap-3">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-center">
                <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">12</div>
                <div className="text-xs text-slate-500 dark:text-slate-500 uppercase tracking-wide">Hidden Gems</div>
            </div>
             <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-center">
                <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">5</div>
                <div className="text-xs text-slate-500 dark:text-slate-500 uppercase tracking-wide">Countries</div>
            </div>
        </div>
      </div>

      {/* Settings Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden mb-8">
        
        {/* Dark Mode Toggle */}
        <div 
          onClick={toggleTheme}
          className="flex items-center justify-between p-4 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
        >
            <div className="flex items-center">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-full text-indigo-600 dark:text-indigo-400 mr-4">
                 {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
              </div>
              <span className="font-medium text-slate-700 dark:text-slate-200">Dark Mode</span>
            </div>
            <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${isDarkMode ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${isDarkMode ? 'translate-x-6' : ''}`}></div>
            </div>
        </div>

        <ProfileMenuItem icon={<Heart size={20} />} label="Saved Places" />
        <ProfileMenuItem icon={<Map size={20} />} label="Past Itineraries" />
        <ProfileMenuItem icon={<Bell size={20} />} label="Notifications" />
        <ProfileMenuItem icon={<Settings size={20} />} label="Settings" last />
      </div>
      
      <div className="mt-6">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Interests</h3>
          <div className="flex flex-wrap gap-2">
              {['Photography', 'Street Food', 'History', 'Hiking'].map(i => (
                  <span key={i} className="px-3 py-1 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-xs font-semibold">{i}</span>
              ))}
          </div>
      </div>
    </div>
  );
};

const ProfileMenuItem = ({ icon, label, last = false }: { icon: any, label: string, last?: boolean }) => (
    <div className={`flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors ${!last ? 'border-b border-slate-50 dark:border-slate-800' : ''}`}>
        <div className="flex items-center">
             <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 mr-4">
                {icon}
             </div>
             <span className="font-medium text-slate-700 dark:text-slate-200">{label}</span>
        </div>
        <ChevronRight size={16} className="text-slate-300 dark:text-slate-600" />
    </div>
);

export default Profile;