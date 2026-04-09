import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface FloatingSearchBarProps {
  onSearch: (keyword: string) => void;
  onCategorySelect: (category: string) => void;
  rightAction?: React.ReactNode;
}

export default function FloatingSearchBar({ onSearch, onCategorySelect, rightAction }: FloatingSearchBarProps) {
  const { t } = useLanguage();
  const [value, setValue] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const kw = e.target.value;
    setValue(kw);
    onSearch(kw);
  };

  const handleSubmit = () => {
    if (value.trim()) onSearch(value);
  };

  const handleClear = () => {
    setValue('');
    onSearch('');
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[200] p-4 pt-12 pointer-events-none transition-colors duration-300">
      <div className="pointer-events-auto flex items-center justify-center max-w-7xl mx-auto w-full">
        <div className="relative group w-1/2 min-w-[200px] max-w-[400px]">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-500 group-focus-within:text-black transition-colors" />
          </div>
          <input
            type="text"
            value={value}
            placeholder={t('searchPlaceholder')}
            className="w-full h-12 pl-12 pr-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-full shadow-sm border border-slate-300 dark:border-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-gray-900 dark:text-white placeholder-gray-600 dark:placeholder-gray-400 text-base transition-all font-medium"
            onChange={handleChange}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
          />
          {/* 右侧按钮区 */}
          <div className="absolute inset-y-0 right-2 flex items-center gap-1">
            {value && (
              <button onClick={handleClear} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={handleSubmit}
              className="h-8 w-8 flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors shadow-sm"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
