import React from 'react';
import { Search, Banknote, MapPin } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface FloatingSearchBarProps {
  onSearch: (keyword: string) => void;
  onCategorySelect: (category: string) => void;
  rightAction?: React.ReactNode;
}

export default function FloatingSearchBar({ onSearch, onCategorySelect, rightAction }: FloatingSearchBarProps) {
  const { t } = useLanguage();

  // No changes to logic, just UI
  return (
    <div className="fixed top-0 left-0 right-0 z-40 p-4 pt-12 pointer-events-none transition-colors duration-300">
      <div className="pointer-events-auto flex items-center justify-start max-w-7xl mx-auto w-full">
        {/* Search Bar - Width reduced, background translucent with blur */}
        <div className="relative group w-1/2 min-w-[200px] max-w-[300px]">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-500 group-focus-within:text-black transition-colors" />
          </div>
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            className="w-full h-12 pl-12 pr-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-full shadow-sm border border-white/20 dark:border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-gray-900 dark:text-white placeholder-gray-600 dark:placeholder-gray-400 text-base transition-all font-medium"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onSearch(e.currentTarget.value);
              }
            }}
          />
        </div>
        {/* rightAction removed from here as it's moved to UserDrawer */}
      </div>
    </div>
  );
}
