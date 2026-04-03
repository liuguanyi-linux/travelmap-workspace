import React, { useState } from 'react';
import { ChevronDown, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface FilterBarProps {
  activeCity: string;
  onCitySelect: (city: any) => void;
  activeCategory: string;
  onCategorySelect: (category: string) => void;
}

export default function FilterBar({ 
  activeCity, 
  onCitySelect, 
  activeCategory, 
  onCategorySelect 
}: FilterBarProps) {
  const { cities = [], spotCategories = [] } = useData();
  const { t } = useLanguage();
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);

  // Filter categories to include only specific ones as requested
  // "Spot (景点), Dining (美食), Accommodation (住宿), Shopping (购物), Transport (交通)"
  const displayCategories = [
    { key: 'spot', label: '景点', icon: 'MapPin' },
    { key: 'dining', label: '美食', icon: 'Utensils' },
    { key: 'accommodation', label: '住宿', icon: 'Hotel' },
    { key: 'shopping', label: '购物', icon: 'ShoppingBag' },
    { key: 'transport', label: '交通', icon: 'Train' },
  ];

  // Map category keys to translated names or fallback
  const getCategoryLabel = (key: string) => {
    const cat = spotCategories.find(c => c.key === key);
    if (cat) return cat.name;
    // Fallback manual mapping if category not in DB yet
    const manual = displayCategories.find(c => c.key === key);
    return manual ? manual.label : key;
  };

  return (
    <div className="absolute top-14 left-0 right-0 z-40 px-4 py-2 flex items-center gap-3 pointer-events-none">
      {/* City Dropdown (Blue Circle area) */}
      <div className="relative pointer-events-auto">
        <button
          onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
          className="flex items-center gap-1 bg-white/90 backdrop-blur shadow-md px-3 py-2 rounded-full text-sm font-bold text-gray-800 border border-slate-300 dark:border-slate-500 active:scale-95 transition-transform"
        >
          <span>城市</span>
          <ChevronDown size={14} className={`transition-transform ${isCityDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isCityDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-full left-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-slate-300 overflow-hidden py-1 origin-top-left"
            >
              <div className="px-4 py-2 text-xs text-gray-400 font-bold border-b border-gray-50">选择城市</div>
              {cities.map((city) => (
                <button
                  key={city.name}
                  onClick={() => {
                    onCitySelect(city);
                    setIsCityDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                    activeCity === city.name ? 'text-blue-600 font-bold bg-blue-50' : 'text-gray-700'
                  }`}
                >
                  {city.name}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Category Pills (Red Circle area) */}
      <div className="flex-1 overflow-x-auto scrollbar-hide pointer-events-auto">
        <div className="flex gap-2 pr-4">
          {displayCategories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => onCategorySelect(activeCategory === cat.key ? '' : cat.key)}
              className={`flex-none px-4 py-2 rounded-full text-base font-medium shadow-sm transition-all whitespace-nowrap ${
                activeCategory === cat.key
                  ? 'bg-blue-600 text-white shadow-blue-200 border border-blue-600'
                  : 'bg-white/90 text-gray-600 hover:bg-white backdrop-blur border border-slate-300 dark:border-slate-500'
              }`}
            >
              {getCategoryLabel(cat.key)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
