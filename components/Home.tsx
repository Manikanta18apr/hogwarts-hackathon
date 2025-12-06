import React, { useState, useRef } from 'react';
import { Search, MapPin, Coffee, Mountain, Tent, Moon, Church, Utensils, Camera, Mic } from 'lucide-react';
import { ViewState } from '../types';
import ImageAnalyzer from './ImageAnalyzer';
import { transcribeAudio } from '../services/geminiService';

interface HomeProps {
  onNavigate: (view: ViewState) => void;
  onSearch: (term: string) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate, onSearch }) => {
  const [showAnalyzer, setShowAnalyzer] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const categories = [
    { name: 'Food', icon: <Utensils size={20} />, color: 'bg-orange-100 text-orange-600' },
    { name: 'Adventure', icon: <Mountain size={20} />, color: 'bg-red-100 text-red-600' },
    { name: 'Culture', icon: <Church size={20} />, color: 'bg-purple-100 text-purple-600' },
    { name: 'Nature', icon: <Tent size={20} />, color: 'bg-green-100 text-green-600' },
    { name: 'Spiritual', icon: <Moon size={20} />, color: 'bg-indigo-100 text-indigo-600' },
    { name: 'Nightlife', icon: <Coffee size={20} />, color: 'bg-blue-100 text-blue-600' },
  ];

  const handleMicClick = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      setIsProcessingVoice(true);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = async () => {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = async () => {
            const base64data = reader.result as string;
            // Use Gemini 2.5 Flash for transcription
            const text = await transcribeAudio(base64data, 'audio/webm');
            if (text) {
                setSearchText(text);
                // Auto-submit search if voice is used
                onSearch(text); 
            }
            setIsProcessingVoice(false);
          };
          
          // Cleanup
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Microphone access denied:", err);
        setIsProcessingVoice(false);
      }
    }
  };

  return (
    <div className="flex flex-col space-y-6 pb-24 relative">
      {/* Image Analyzer Modal */}
      {showAnalyzer && <ImageAnalyzer onClose={() => setShowAnalyzer(false)} />}

      {/* Top Section */}
      <div className="bg-teal-600 p-6 rounded-b-3xl shadow-lg pb-10">
        <h1 className="text-white text-2xl font-bold mb-4">Where to today?</h1>
        <div className="relative">
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder={isRecording ? "Listening..." : isProcessingVoice ? "Processing..." : "Search locations..."}
            className={`w-full pl-10 pr-28 py-3 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-300 transition-all ${isRecording ? 'bg-red-50 text-red-600 placeholder:text-red-400' : 'bg-white'}`}
            onKeyDown={(e) => e.key === 'Enter' && onSearch(searchText)}
            disabled={isRecording || isProcessingVoice}
          />
          <button 
            onClick={() => onSearch(searchText)}
            className="absolute left-3 top-3.5 text-gray-400 hover:text-teal-600 transition-colors"
          >
             <Search size={20} className={isRecording ? 'text-red-400 animate-pulse' : ''} />
          </button>
          
          <div className="absolute right-2 top-2 flex space-x-1">
             {/* Mic Button */}
             <button 
                onClick={handleMicClick}
                className={`p-1.5 rounded-lg transition-all ${
                    isRecording 
                    ? 'bg-red-500 text-white animate-pulse shadow-red-200 shadow-lg' 
                    : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
                }`}
                title="Voice Search"
             >
                {isProcessingVoice ? (
                    <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin m-[2px]"></div>
                ) : (
                    <Mic size={18} />
                )}
             </button>

             <button 
                onClick={() => setShowAnalyzer(true)}
                className="p-1.5 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition-colors"
                title="Analyze Image"
             >
                <Camera size={18} />
             </button>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="px-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Explore by Category</h2>
        <div className="grid grid-cols-3 gap-4">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => onNavigate('discover')}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
            >
              <div className={`p-3 rounded-full mb-2 ${cat.color}`}>
                {cat.icon}
              </div>
              <span className="text-xs font-medium text-slate-600">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Discovery Cards */}
      <div className="px-6">
        <div 
            onClick={() => onNavigate('discover')}
            className="w-full h-48 rounded-3xl relative overflow-hidden shadow-md mb-6 cursor-pointer group"
        >
          <img 
            src="https://picsum.photos/800/400?grayscale" 
            alt="Hidden Gems" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
            <h3 className="text-white text-xl font-bold">Discover Hidden Gems</h3>
            <p className="text-white/80 text-sm">Find the places locals love.</p>
          </div>
        </div>

        <div 
            onClick={() => onNavigate('events')}
            className="w-full h-48 rounded-3xl relative overflow-hidden shadow-md cursor-pointer group"
        >
          <img 
            src="https://picsum.photos/800/401" 
            alt="Local Events" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
            <h3 className="text-white text-xl font-bold">Today's Local Events</h3>
            <p className="text-white/80 text-sm">Music, Art, and Community.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;