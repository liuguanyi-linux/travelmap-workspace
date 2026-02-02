import React from 'react';
import { Search, Banknote, MapPin } from 'lucide-react';

interface FloatingSearchBarProps {
  onSearch: (keyword: string) => void;
  onCategorySelect: (category: string) => void;
}

export default function FloatingSearchBar({ onSearch, onCategorySelect }: FloatingSearchBarProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-40 p-4 pt-12 bg-gradient-to-b from-white/90 via-white/50 to-transparent pointer-events-none">
      <div className="pointer-events-auto space-y-3">
        {/* Search Bar */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-black transition-colors" />
          </div>
          <input
            type="text"
            placeholder="搜索地点、酒店、美食..."
            className="w-full h-12 pl-12 pr-4 bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100 focus:outline-none focus:ring-2 focus:ring-black/5 text-gray-800 placeholder-gray-400 text-sm transition-all"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onSearch(e.currentTarget.value);
              }
            }}
          />
        </div>

        {/* Persistent ATM Filter */}
        <div className="flex justify-start">
            <button
              onClick={() => onCategorySelect('ATM')}
              className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.08)] border border-gray-100 active:scale-95 transition-transform"
            >
              <div className="p-1 rounded-full bg-purple-50 text-purple-600">
                <Banknote size={16} />
              </div>
              <span className="text-sm font-medium text-gray-700">ATM</span>
            </button>
        </div>
      </div>
    </div>
  );
}
