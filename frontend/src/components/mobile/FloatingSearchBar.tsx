import React from 'react';
import { Search, Banknote, MapPin } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface FloatingSearchBarProps {
  onSearch: (keyword: string) => void;
  onCategorySelect: (category: string) => void;
}

export default function FloatingSearchBar({ onSearch, onCategorySelect }: FloatingSearchBarProps) {
  const { t } = useLanguage();

  // No changes to logic, just UI
  return (
    <div className="fixed top-0 left-0 right-0 z-40 p-4 pt-12 bg-gradient-to-b from-white/90 via-white/50 to-transparent dark:from-gray-900/90 dark:via-gray-900/50 pointer-events-none transition-colors duration-300">
      <div className="pointer-events-auto flex items-center gap-3">
        {/* Search Bar */}
        <div className="relative group flex-1">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
          </div>
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            className="w-full h-12 pl-12 pr-4 bg-white dark:bg-gray-800 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-none focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-gray-800 dark:text-white placeholder-gray-400 text-base transition-all"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onSearch(e.currentTarget.value);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
