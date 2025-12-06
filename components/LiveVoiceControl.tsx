import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration } from "@google/genai";
import { Mic, X, User, Bot, MessageSquare } from 'lucide-react';
import { ViewState } from '../types';

interface LiveVoiceControlProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: ViewState) => void;
}

interface TranscriptItem {
  id: string;
  role: 'user' | 'model';
  text: string;
  isPartial: boolean;
}

const LiveVoiceControl: React.FC<LiveVoiceControlProps> = ({ isOpen, onClose, onNavigate }) => {
  const [status, setStatus] = useState<'connecting' | 'listening' | 'speaking' | 'error'>('connecting');
  const [volume, setVolume] = useState(0);
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  
  // Refs for audio handling to avoid re-renders
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sessionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Accumulators for transcription
  const currentInputRef = useRef('');
  const currentOutputRef = useRef('');

  // Tool Definitions
  const tools: [{functionDeclarations: FunctionDeclaration[]}] = [{
    functionDeclarations: [
      {
        name: "navigate",
        description: "Navigate to a specific screen in the application. Use this when the user asks to go to a page or see a section.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            screen: {
              type: Type.STRING,
              enum: ["home", "discover", "itinerary", "map", "events", "profile"],
              description: "The screen to navigate to."
            }
          },
          required: ["screen"]
        }
      }
    ]
  }];

  useEffect(() => {
    if (isOpen) {
      startSession();
    } else {
      stopSession();
    }
    return () => stopSession();
  }, [isOpen]);

  // Auto-scroll to bottom of transcript
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcripts]);

  const updateTranscript = (role: 'user' | 'model', text: string, isPartial: boolean) => {
    setTranscripts(prev => {
      const last = prev[prev.length - 1];
      if (last && last.role === role && last.isPartial) {
        return [
          ...prev.slice(0, -1),
          { ...last, text, isPartial }
        ];
      }
      return [
        ...prev,
        { id: Date.now().toString(), role, text, isPartial }
      ];
    });
  };

  const startSession = async () => {
    try {
      setStatus('connecting');
      setTranscripts([]);
      currentInputRef.current = '';
      currentOutputRef.current = '';

      const apiKey = process.env.API_KEY || "";
      if (!apiKey) throw new Error("No API Key");

      const ai = new GoogleGenAI({ apiKey });

      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      inputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: "You are Wanderlust AI, a local support agent and travel companion. You are friendly, concise, and helpful. You can translate languages, suggest hidden gems, and help navigate the app using tools. If the user asks for help with the app, guide them. If they speak a different language, translate and reply.",
          tools: tools,
        },
        callbacks: {
          onopen: () => {
            setStatus('listening');
            processAudioInput(sessionPromise);
          },
          onmessage: async (msg: LiveServerMessage) => {
             if (msg.toolCall) {
                for (const fc of msg.toolCall.functionCalls) {
                    if (fc.name === 'navigate') {
                        const screen = (fc.args as any).screen;
                        onNavigate(screen as ViewState);
                        sessionPromise.then(session => session.sendToolResponse({
                            functionResponses: {
                                id: fc.id,
                                name: fc.name,
                                response: { result: `Navigated to ${screen}` }
                            }
                        }));
                    }
                }
             }

             const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
             if (audioData) {
               setStatus('speaking');
               playAudio(audioData);
             }

             const outTx = msg.serverContent?.outputTranscription?.text;
             if (outTx) {
                currentOutputRef.current += outTx;
                updateTranscript('model', currentOutputRef.current, true);
             }
             
             const inTx = msg.serverContent?.inputTranscription?.text;
             if (inTx) {
                currentInputRef.current += inTx;
                updateTranscript('user', currentInputRef.current, true);
             }

             if (msg.serverContent?.turnComplete) {
                if (currentInputRef.current) {
                   updateTranscript('user', currentInputRef.current, false);
                   currentInputRef.current = '';
                }
                if (currentOutputRef.current) {
                   updateTranscript('model', currentOutputRef.current, false);
                   currentOutputRef.current = '';
                }
                setTimeout(() => {
                    setStatus('listening');
                }, 500);
             }
          },
          onclose: () => {
             console.log("Session closed");
          },
          onerror: (e) => {
             console.error("Live API Error", e);
             setStatus('error');
          }
        }
      });
      
      sessionRef.current = sessionPromise;

    } catch (error) {
      console.error("Failed to start session:", error);
      setStatus('error');
    }
  };

  const stopSession = () => {
    if (sourceRef.current) sourceRef.current.disconnect();
    if (processorRef.current) processorRef.current.disconnect();
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (audioContextRef.current) audioContextRef.current.close();
    if (inputContextRef.current) inputContextRef.current.close();
    
    audioContextRef.current = null;
    inputContextRef.current = null;
  };

  const processAudioInput = (sessionPromise: Promise<any>) => {
     if (!inputContextRef.current || !streamRef.current) return;

     const source = inputContextRef.current.createMediaStreamSource(streamRef.current);
     const processor = inputContextRef.current.createScriptProcessor(4096, 1, 1);
     
     processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        let sum = 0;
        for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
        const rms = Math.sqrt(sum / inputData.length);
        setVolume(Math.min(rms * 5, 1)); 

        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
           pcm16[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
        }
        const base64Audio = btoa(String.fromCharCode(...new Uint8Array(pcm16.buffer)));
        
        sessionPromise.then(session => {
            session.sendRealtimeInput({
                media: {
                    mimeType: 'audio/pcm;rate=16000',
                    data: base64Audio
                }
            });
        });
     };

     source.connect(processor);
     processor.connect(inputContextRef.current.destination);
     sourceRef.current = source;
     processorRef.current = processor;
  };

  const playAudio = async (base64String: string) => {
    if (!audioContextRef.current) return;
    
    const binaryString = atob(base64String);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    
    const int16Data = new Int16Array(bytes.buffer);
    const float32Data = new Float32Array(int16Data.length);
    for(let i=0; i<int16Data.length; i++) {
        float32Data[i] = int16Data[i] / 32768.0;
    }

    const buffer = audioContextRef.current.createBuffer(1, float32Data.length, 24000);
    buffer.getChannelData(0).set(float32Data);

    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    
    const currentTime = audioContextRef.current.currentTime;
    if (nextStartTimeRef.current < currentTime) {
        nextStartTimeRef.current = currentTime;
    }
    
    source.start(nextStartTimeRef.current);
    nextStartTimeRef.current += buffer.duration;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center pointer-events-none">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto" onClick={onClose}></div>
      
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-3xl p-6 pointer-events-auto relative transform transition-transform animate-slide-up flex flex-col max-h-[80vh]">
        
        <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            <div className="flex items-center text-teal-600 dark:text-teal-400 font-semibold">
                <MessageSquare size={18} className="mr-2" />
                <span>Live Support</span>
            </div>
            <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700">
                <X size={20} />
            </button>
        </div>

        <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto mb-6 space-y-4 px-1 min-h-[200px]"
        >
            {transcripts.length === 0 && (
                <div className="text-center text-slate-400 dark:text-slate-500 text-sm py-10">
                    Listening... Ask for help or say "Translate this"
                </div>
            )}
            {transcripts.map((t) => (
                <div key={t.id} className={`flex ${t.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex max-w-[85%] ${t.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${t.role === 'user' ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 ml-2' : 'bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-300 mr-2'}`}>
                            {t.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                        </div>
                        <div className={`p-3 rounded-2xl text-sm ${
                            t.role === 'user' 
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tr-none' 
                                : 'bg-teal-50 dark:bg-teal-900/30 text-teal-900 dark:text-teal-100 rounded-tl-none border border-teal-100 dark:border-teal-800'
                        }`}>
                            {t.text}
                        </div>
                    </div>
                </div>
            ))}
        </div>

        <div className="flex flex-col items-center justify-center pt-2 pb-4 border-t border-slate-50 dark:border-slate-800">
            {/* Visualizer Circle */}
            <div className="relative mb-4">
                <div 
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-100 ${
                        status === 'error' ? 'bg-red-100 dark:bg-red-900 text-red-600' :
                        status === 'speaking' ? 'bg-teal-100 dark:bg-teal-900 text-teal-600' : 
                        'bg-indigo-600 dark:bg-indigo-500 text-white'
                    }`}
                    style={{
                        transform: `scale(${1 + volume * 0.5})`,
                        boxShadow: `0 0 ${volume * 30}px ${status === 'speaking' ? '#14b8a6' : '#4f46e5'}`
                    }}
                >
                    {status === 'connecting' ? (
                         <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    ) : (
                         <Mic size={24} />
                    )}
                </div>
                
                {status === 'listening' && (
                    <>
                        <div className="absolute inset-0 rounded-full border-2 border-indigo-400 opacity-50 animate-ping"></div>
                        <div className="absolute -inset-2 rounded-full border border-indigo-300 opacity-30 animate-pulse"></div>
                    </>
                )}
            </div>

            <p className="text-slate-400 dark:text-slate-500 text-xs font-medium uppercase tracking-wider">
                {status === 'connecting' ? 'Connecting...' : 
                 status === 'listening' ? 'Listening...' : 
                 status === 'speaking' ? 'Local Support Agent Speaking...' : 
                 'Connection Error'}
            </p>
        </div>
      </div>
    </div>
  );
};

export default LiveVoiceControl;