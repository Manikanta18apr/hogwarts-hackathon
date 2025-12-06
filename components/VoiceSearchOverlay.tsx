import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { Mic, X, Search as SearchIcon } from 'lucide-react';

interface VoiceSearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onTranscript: (transcript: string) => void;
}

const VoiceSearchOverlay: React.FC<VoiceSearchOverlayProps> = ({ isOpen, onClose, onTranscript }) => {
  const [status, setStatus] = useState<'listening' | 'processing' | 'error'>('listening');
  const [volume, setVolume] = useState(0);
  const [currentTranscription, setCurrentTranscription] = useState('');

  // Refs for audio handling
  const inputContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const sessionRef = useRef<any>(null); // To hold the promise of the live session

  const transcriptionTimeoutRef = useRef<number | null>(null);

  // Auto-close after a period of silence
  const resetTranscriptionTimeout = () => {
    if (transcriptionTimeoutRef.current) {
      clearTimeout(transcriptionTimeoutRef.current);
    }
    transcriptionTimeoutRef.current = window.setTimeout(() => {
      if (currentTranscription.trim()) {
        onTranscript(currentTranscription.trim());
      }
      onClose();
    }, 2000); // 2 seconds of silence
  };

  useEffect(() => {
    if (isOpen) {
      startSession();
      resetTranscriptionTimeout(); // Start timeout when session opens
    } else {
      stopSession();
      if (transcriptionTimeoutRef.current) {
        clearTimeout(transcriptionTimeoutRef.current);
      }
      setCurrentTranscription(''); // Clear transcription when closing
    }
    return () => stopSession();
  }, [isOpen]);

  const startSession = async () => {
    try {
      setStatus('listening');
      setCurrentTranscription('');

      const apiKey = process.env.API_KEY || "";
      if (!apiKey) throw new Error("No API Key");

      const ai = new GoogleGenAI({ apiKey });

      inputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          inputAudioTranscription: {}, // Enable transcription for user input audio.
          responseModalities: [Modality.AUDIO], // MUST be AUDIO for this model
          speechConfig: { // REQUIRED for Modality.AUDIO
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
        },
        callbacks: {
          onopen: () => {
            setStatus('listening');
            processAudioInput(sessionPromise);
          },
          onmessage: async (msg: LiveServerMessage) => {
            const inTx = msg.serverContent?.inputTranscription?.text;
            if (inTx) {
              setCurrentTranscription(prev => prev + inTx);
              resetTranscriptionTimeout(); // Reset timeout on new speech
            }
            if (msg.serverContent?.turnComplete) {
              if (currentTranscription.trim()) {
                onTranscript(currentTranscription.trim());
              }
              onClose(); // Close after a full turn is complete
            }
          },
          onclose: () => {
            console.log("Voice search session closed");
            // If session closes unexpectedly, and there's a partial transcript, send it
            if (currentTranscription.trim() && isOpen) {
                onTranscript(currentTranscription.trim());
            }
            onClose();
          },
          onerror: (e) => {
            console.error("Live API Error for voice search", e);
            setStatus('error');
            // If error, and there's a partial transcript, send it
            if (currentTranscription.trim() && isOpen) {
                onTranscript(currentTranscription.trim());
            }
            onClose();
          }
        }
      });

      sessionRef.current = sessionPromise;

    } catch (error) {
      console.error("Failed to start voice search session:", error);
      setStatus('error');
    }
  };

  const stopSession = () => {
    if (sourceRef.current) sourceRef.current.disconnect();
    if (processorRef.current) processorRef.current.disconnect();
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (inputContextRef.current) inputContextRef.current.close();
    
    inputContextRef.current = null;
    streamRef.current = null;
    processorRef.current = null;
    sourceRef.current = null;
  };

  const processAudioInput = (sessionPromise: Promise<any>) => {
    if (!inputContextRef.current || !streamRef.current) return;

    const source = inputContextRef.current.createMediaStreamSource(streamRef.current);
    // Increased buffer size for potentially better speech recognition performance over a noisy network.
    const processor = inputContextRef.current.createScriptProcessor(4096, 1, 1); 

    processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      let sum = 0;
      for (let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
      const rms = Math.sqrt(sum / inputData.length);
      setVolume(Math.min(rms * 5, 1)); // Normalize volume for visualizer

      const pcm16 = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        pcm16[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
      }
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(pcm16.buffer)));

      sessionPromise.then(session => {
        if (session) { // Ensure session is still valid
          session.sendRealtimeInput({
            media: {
              mimeType: 'audio/pcm;rate=16000',
              data: base64Audio
            }
          });
        }
      });
    };

    source.connect(processor);
    processor.connect(inputContextRef.current.destination);
    sourceRef.current = source;
    processorRef.current = processor;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center pointer-events-none">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto" onClick={onClose}></div>
      
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-3xl p-6 pointer-events-auto relative transform transition-transform animate-slide-up flex flex-col items-center">
        
        <div className="flex justify-between items-center w-full mb-6">
            <div className="flex items-center text-teal-600 dark:text-teal-400 font-semibold">
                <SearchIcon size={18} className="mr-2" />
                <span>Voice Search</span>
            </div>
            <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700">
                <X size={20} />
            </button>
        </div>

        <div className="relative mb-6">
            <div 
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-100 ${
                    status === 'error' ? 'bg-red-100 dark:bg-red-900 text-red-600' :
                    status === 'processing' ? 'bg-teal-100 dark:bg-teal-900 text-teal-600' : 
                    'bg-indigo-600 dark:bg-indigo-500 text-white'
                }`}
                style={{
                    transform: `scale(${1 + volume * 0.3})`,
                    boxShadow: `0 0 ${volume * 40}px ${status === 'listening' ? '#4f46e5' : '#14b8a6'}`
                }}
            >
                <Mic size={32} />
            </div>
            
            {status === 'listening' && (
                <>
                    <div className="absolute inset-0 rounded-full border-2 border-indigo-400 opacity-50 animate-ping"></div>
                    <div className="absolute -inset-2 rounded-full border border-indigo-300 opacity-30 animate-pulse"></div>
                </>
            )}
        </div>

        <p className="text-slate-400 dark:text-slate-500 text-sm font-medium uppercase tracking-wider mb-4">
            {status === 'listening' ? 'Listening...' : 
             status === 'processing' ? 'Processing...' : 
             'Error occurred'}
        </p>

        {currentTranscription && (
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 w-full text-center">
                <p className="text-slate-700 dark:text-slate-200 text-base font-medium">
                    {currentTranscription}
                </p>
            </div>
        )}
      </div>
    </div>
  );
};

export default VoiceSearchOverlay;