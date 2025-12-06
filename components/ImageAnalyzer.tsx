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
        setResult(null); 
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    
    setLoading(true);
    const mimeType = image.split(';')[0].split(':')[1];
    const text = await analyzeImage(image, mimeType);
    setResult(text);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl overflow-hidden relative z-10 animate-slide-up shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center">
                <Sparkles size={18} className="text-teal-500 mr-2" />
                Visual Explorer
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400">
                <X size={20} />
            </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
            {!image ? (
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl h-64 flex flex-col items-center justify-center cursor-pointer hover:border-teal-500 dark:hover:border-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/10 transition-colors"
                >
                    <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center text-teal-600 dark:text-teal-400 mb-4">
                        <Camera size={32} />
                    </div>
                    <p className="font-semibold text-slate-600 dark:text-slate-300">Take a photo or upload</p>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">Identify landmarks, menus, and more</p>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="relative rounded-2xl overflow-hidden shadow-md max-h-64 bg-slate-100 dark:bg-slate-800">
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
                            className="w-full bg-teal-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-teal-200 dark:shadow-teal-900/30 hover:bg-teal-700 active:scale-95 transition-all flex items-center justify-center disabled:opacity-70"
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
                        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 animate-fade-in">
                            <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2 flex items-center">
                                <ImageIcon size={16} className="mr-2 text-teal-600 dark:text-teal-400" />
                                Insights
                            </h4>
                            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
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