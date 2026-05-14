import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface FloatingSearchBarProps {
  onSearch: (keyword: string) => void;
  onSubmit?: (keyword: string) => boolean;
  onCategorySelect?: (category: string) => void;
  rightAction?: React.ReactNode;
}

export default function FloatingSearchBar({ onSearch, onSubmit }: FloatingSearchBarProps) {
  const { t } = useLanguage();
  const [value, setValue] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const kw = e.target.value;
    setValue(kw);
    onSearch(kw);
  };

  const handleSubmit = () => {
    if (!value.trim()) return;
    if (onSubmit && onSubmit(value)) {
      setValue('');
      return;
    }
    onSearch(value);
  };

  const handleClear = () => {
    setValue('');
    onSearch('');
  };

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[200] px-3 pb-3 pointer-events-none transition-colors duration-300"
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 8px)' }}
    >
      <div className="pointer-events-auto flex items-center justify-center max-w-7xl mx-auto w-full">
        <div className="relative group w-full max-w-[520px]">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-blue-500" />
          </div>
          <input
            type="text"
            value={value}
            placeholder={t('searchPlaceholder')}
            className="w-full h-12 pl-12 pr-12 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-full shadow-lg border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-base transition-all font-medium"
            onChange={handleChange}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
          />
          {value && (
            <div className="absolute inset-y-0 right-2 flex items-center">
              <button onClick={handleClear} className="p-2 text-gray-400 hover:text-gray-600 rounded-full">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
