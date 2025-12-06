import React, { useState } from 'react';
import { ArrowLeft, DollarSign, PieChart, TrendingUp, Info } from 'lucide-react';

interface BudgetProps {
  onBack: () => void;
}

const Budget: React.FC<BudgetProps> = ({ onBack }) => {
  const [accommodation, setAccommodation] = useState(500);
  const [flights, setFlights] = useState(800);
  const [food, setFood] = useState(300);
  const [activities, setActivities] = useState(200);

  const total = accommodation + flights + food + activities;
  const maxBudget = 5000;
  const percentage = Math.min((total / maxBudget) * 100, 100);

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="bg-teal-600 pt-10 pb-20 px-6 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative z-10 flex items-center text-white mb-8">
            <button onClick={onBack} className="p-2 bg-white/10 backdrop-blur-md rounded-full mr-4 hover:bg-white/20">
                <ArrowLeft size={20} />
            </button>
            <h2 className="text-xl font-bold">Trip Budget</h2>
        </div>

        <div className="relative z-10 text-center">
             <p className="text-teal-100 font-medium mb-1">Estimated Total Cost</p>
             <h1 className="text-5xl font-bold text-white tracking-tight flex items-center justify-center">
                <span className="text-3xl mr-1 opacity-80">$</span>
                {total}
             </h1>
        </div>
      </div>

      <div className="px-6 -mt-10 relative z-10 space-y-6">
        {/* Meter Card */}
        <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100">
             <div className="flex justify-between items-end mb-2">
                <span className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Budget Meter</span>
                <span className="text-teal-600 font-bold">{Math.round(percentage)}% of Max</span>
             </div>
             <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-gradient-to-r from-teal-400 to-teal-600 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                ></div>
             </div>
        </div>

        {/* Sliders */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-6">
            <BudgetSlider 
                label="Flights & Travel" 
                value={flights} 
                onChange={setFlights} 
                icon={<TrendingUp size={18} className="text-blue-500" />} 
                color="bg-blue-100"
            />
             <BudgetSlider 
                label="Accommodation" 
                value={accommodation} 
                onChange={setAccommodation} 
                icon={<DollarSign size={18} className="text-purple-500" />} 
                color="bg-purple-100"
            />
             <BudgetSlider 
                label="Food & Dining" 
                value={food} 
                onChange={setFood} 
                icon={<PieChart size={18} className="text-orange-500" />} 
                color="bg-orange-100"
            />
             <BudgetSlider 
                label="Activities" 
                value={activities} 
                onChange={setActivities} 
                icon={<Info size={18} className="text-green-500" />} 
                color="bg-green-100"
            />
        </div>

        <button className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-slate-800 transition-colors">
            Save Estimation
        </button>
      </div>
    </div>
  );
};

const BudgetSlider = ({ label, value, onChange, icon, color }: any) => (
    <div>
        <div className="flex justify-between items-center mb-3">
            <div className="flex items-center">
                <div className={`p-2 rounded-xl mr-3 ${color}`}>
                    {icon}
                </div>
                <span className="font-semibold text-slate-700">{label}</span>
            </div>
            <span className="font-bold text-slate-900">${value}</span>
        </div>
        <input 
            type="range" 
            min="0" 
            max="2000" 
            value={value} 
            onChange={(e) => onChange(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-600"
        />
    </div>
);

export default Budget;