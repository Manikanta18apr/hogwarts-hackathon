import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Sparkles, Bot, User, MapPin } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface ChatPlannerProps {
  onBack: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  type?: 'text' | 'plan'; // Could expand for structured cards
}

const ChatPlanner: React.FC<ChatPlannerProps> = ({ onBack }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', text: "Hi! I'm your AI Travel Planner. Where would you like to go, and what's your budget?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
        const apiKey = process.env.API_KEY || "";
        const ai = new GoogleGenAI({ apiKey });
        
        const history = messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
        
        // Use chat model context
        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            history: history,
            config: {
                systemInstruction: "You are an expert travel planner. Provide detailed, day-wise itineraries with budget estimates. Use clear formatting with bullet points. Be concise but inspiring."
            }
        });

        const result = await chat.sendMessage({ message: input });
        const text = result.text || "I couldn't generate a plan right now. Try again?";

        setMessages(prev => [...prev, { id: (Date.now()+1).toString(), role: 'model', text }]);

    } catch (e) {
        console.error(e);
        setMessages(prev => [...prev, { id: (Date.now()+1).toString(), role: 'model', text: "Sorry, I'm having trouble connecting to the travel database." }]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white p-4 pt-10 shadow-sm border-b border-slate-100 flex justify-between items-center z-10">
        <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
                <Sparkles size={20} />
            </div>
            <div>
                <h2 className="font-bold text-slate-800">AI Planner</h2>
                <p className="text-xs text-green-500 font-medium flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span> Online
                </p>
            </div>
        </div>
        <button onClick={onBack} className="text-sm font-semibold text-slate-500 hover:text-slate-800">
            Close
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={scrollRef}>
        {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${msg.role === 'user' ? 'bg-slate-200 text-slate-600 ml-2' : 'bg-indigo-600 text-white mr-2 shadow-lg shadow-indigo-200'}`}>
                        {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                    </div>
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                        msg.role === 'user' 
                            ? 'bg-white text-slate-800 rounded-tr-none border border-slate-100' 
                            : 'bg-indigo-50 text-indigo-900 rounded-tl-none border border-indigo-100'
                    }`}>
                        <div className="whitespace-pre-wrap">{msg.text}</div>
                    </div>
                </div>
            </div>
        ))}
        {isLoading && (
            <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 ml-10 flex space-x-1">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
                </div>
            </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="relative">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your travel plans..."
                className="w-full pl-4 pr-24 py-4 bg-slate-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 placeholder:text-slate-400 font-medium transition-all"
            />
            <div className="absolute right-2 top-2 flex space-x-1">
                 <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">
                    <Mic size={20} />
                </button>
                <button 
                    onClick={handleSend}
                    className={`p-2 rounded-xl transition-all shadow-md ${input.trim() ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-200 text-slate-400'}`}
                >
                    <Send size={20} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPlanner;