import React from 'react';
import { ChevronRight, Globe } from 'lucide-react';

interface OnboardingProps {
  onStart: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onStart }) => {
  return (
    <div className="relative h-screen w-full bg-slate-900 overflow-hidden flex flex-col justify-end">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
          alt="Travel Background" 
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-8 pb-16 flex flex-col items-start animate-slide-up">
        <div className="bg-teal-600/20 backdrop-blur-md p-3 rounded-2xl mb-6 border border-teal-500/30">
            <Globe className="text-teal-400" size={32} />
        </div>
        
        <h1 className="text-5xl font-bold text-white mb-2 tracking-tight">
          Explore <br />
          <span className="text-teal-400">The World.</span>
        </h1>
        
        <p className="text-slate-300 text-lg mb-8 max-w-xs leading-relaxed">
          Your Smart AI Travel Planner. Discover hidden gems and plan perfect trips in seconds.
        </p>

        <button 
          onClick={onStart}
          className="group w-full bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold py-4 px-6 rounded-2xl flex items-center justify-between transition-all shadow-[0_0_20px_rgba(20,184,166,0.3)]"
        >
          <span>Start Your Journey</span>
          <ChevronRight className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default Onboarding;