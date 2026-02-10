import React from 'react';
import { PlantData } from '../types';
import { Sun, Droplets, Thermometer, Wind, AlertTriangle, Sprout, Leaf } from 'lucide-react';

interface PlantInfoCardProps {
  data: PlantData;
}

export const PlantInfoCard: React.FC<PlantInfoCardProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-stone-100 animate-fade-in-up">
      <div className="bg-emerald-600 p-6 text-white">
        <h2 className="text-3xl font-bold mb-1">{data.name}</h2>
        <p className="italic text-emerald-100 opacity-90 font-mono text-lg" dir="ltr">{data.scientificName}</p>
      </div>
      
      <div className="p-6 md:p-8 space-y-8">
        <div>
          <h3 className="text-lg font-semibold text-stone-800 mb-2 flex items-center">
            <Leaf className="w-5 h-5 ms-2 text-emerald-600" />
            תיאור הצמח
          </h3>
          <p className="text-stone-600 leading-relaxed">{data.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CareItem icon={<Sun className="w-5 h-5 text-amber-500" />} label="תאורה" value={data.care.light} />
          <CareItem icon={<Droplets className="w-5 h-5 text-blue-500" />} label="השקיה" value={data.care.water} />
          <CareItem icon={<Sprout className="w-5 h-5 text-emerald-600" />} label="קרקע" value={data.care.soil} />
          <CareItem icon={<Wind className="w-5 h-5 text-sky-400" />} label="לחות" value={data.care.humidity} />
          <CareItem icon={<Thermometer className="w-5 h-5 text-orange-500" />} label="טמפרטורה" value={data.care.temperature} />
          <CareItem icon={<AlertTriangle className="w-5 h-5 text-red-500" />} label="רעילות" value={data.care.toxicity} />
        </div>

        <div className="bg-emerald-50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-emerald-900 mb-4">טיפים להצלחה</h3>
          <ul className="space-y-3">
            {data.quickTips.map((tip, index) => (
              <li key={index} className="flex items-start text-emerald-800">
                <span className="inline-block w-6 h-6 bg-emerald-200 text-emerald-700 rounded-full text-sm font-bold flex-shrink-0 flex items-center justify-center ms-3 mt-0.5">
                  {index + 1}
                </span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

const CareItem: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="flex items-start p-4 bg-stone-50 rounded-xl border border-stone-100 hover:border-emerald-200 transition-colors">
    <div className="bg-white p-2 rounded-lg shadow-sm ms-4 text-stone-700 shrink-0">
      {icon}
    </div>
    <div>
      <h4 className="text-sm font-semibold text-stone-900 uppercase tracking-wide mb-1">{label}</h4>
      <p className="text-stone-600 text-sm">{value}</p>
    </div>
  </div>
);