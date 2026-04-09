import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Layers, Heart } from 'lucide-react';

interface MapToggleProps {
  viewMode: 'all' | 'favorites';
  onChange: (mode: 'all' | 'favorites') => void;
}

export default function MapToggle({ viewMode, onChange }: MapToggleProps) {
  const { t } = useLanguage();

  return (
    <div className="flex bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-0.5">
      <button
        onClick={() => onChange('all')}
        className={`flex items-center justify-center p-1.5 rounded-md transition-all duration-200 ${
          viewMode === 'all'
            ? 'bg-blue-500 text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        title={t('mapToggle.all')}
      >
        <Layers size={18} />
      </button>
      <button
        onClick={() => onChange('favorites')}
        className={`flex items-center justify-center p-1.5 rounded-md transition-all duration-200 ${
          viewMode === 'favorites'
            ? 'bg-red-500 text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        title={t('mapToggle.favorites')}
      >
        <Heart size={18} fill={viewMode === 'favorites' ? "currentColor" : "none"} />
      </button>
    </div>
  );
}
