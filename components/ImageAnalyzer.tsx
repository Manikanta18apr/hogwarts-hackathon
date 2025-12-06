import React, { useState, useRef } from 'react';
import { X, Upload, Sparkles, Image as ImageIcon, Camera } from 'lucide-react';
import { analyzeImage } from '../services/geminiService';

interface ImageAnalyzerProps {
  onClose: () => void;
}

const ImageAnalyzer: React.FC<ImageAnalyzerProps> = ({ onClose }) => {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null); // Reset previous result
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    
    setLoading(true);
    // Extract mime type from data URL usually formatted as data:image/jpeg;base64,...
    const mimeType = image.split(';')[0].split(':')[1];
    const text = await analyzeImage(image, mimeType);
    setResult(text);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden relative z-10 animate-slide-up shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-lg text-slate-800 flex items-center">
                <Sparkles size={18} className="text-teal-500 mr-2" />
                Visual Explorer
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                <X size={20} />
            </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
            {!image ? (
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 rounded-2xl h-64 flex flex-col items-center justify-center cursor-pointer hover:border-teal-500 hover:bg-teal-50 transition-colors"
                >
                    <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 mb-4">
                        <Camera size={32} />
                    </div>
                    <p className="font-semibold text-slate-600">Take a photo or upload</p>
                    <p className="text-sm text-slate-400 mt-2">Identify landmarks, menus, and more</p>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="relative rounded-2xl overflow-hidden shadow-md max-h-64 bg-slate-100">
                        <img src={image} alt="Preview" className="w-full h-full object-contain" />
                        <button 
                            onClick={() => { setImage(null); setResult(null); }}
                            className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {!result && (
                        <button 
                            onClick={handleAnalyze}
                            disabled={loading}
                            className="w-full bg-teal-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-teal-200 hover:bg-teal-700 active:scale-95 transition-all flex items-center justify-center disabled:opacity-70"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={18} className="mr-2" />
                                    Analyze Image
                                </>
                            )}
                        </button>
                    )}

                    {result && (
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 animate-fade-in">
                            <h4 className="font-semibold text-slate-800 mb-2 flex items-center">
                                <ImageIcon size={16} className="mr-2 text-teal-600" />
                                Insights
                            </h4>
                            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                                {result}
                            </p>
                        </div>
                    )}
                </div>
            )}

            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*" 
            />
        </div>
      </div>
    </div>
  );
};

export default ImageAnalyzer;