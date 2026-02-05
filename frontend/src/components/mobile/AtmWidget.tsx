import React from 'react';
import { Banknote } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface AtmWidgetProps {
  onSelect: () => void;
  isActive?: boolean;
}

export default function AtmWidget({ onSelect, isActive = false }: AtmWidgetProps) {
  const { t } = useLanguage();

  return (
    <button
      onClick={onSelect}
      className={`${
        isActive 
          ? 'bg-purple-600 text-white ring-2 ring-purple-300 ring-offset-2 dark:ring-offset-gray-900' 
          : 'bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-white hover:scale-105'
      } backdrop-blur-md p-3 rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/30 flex items-center justify-center gap-2 w-32 cursor-pointer active:scale-95 transition-all animate-in fade-in slide-in-from-right-4 duration-500 delay-100`}
    >
      <div className={`p-1.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'}`}>
        <Banknote size={18} />
      </div>
      <span className={`text-sm font-bold ${isActive ? 'text-white' : 'text-gray-800 dark:text-white'}`}>{t('categories.atm')}</span>
    </button>
  );
}
