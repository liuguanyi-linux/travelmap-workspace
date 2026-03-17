import React from 'react';
import { CreditCard } from 'lucide-react';

interface AtmWidgetProps {
  onSelect: () => void;
  isActive: boolean;
}

export default function AtmWidget({ onSelect, isActive }: AtmWidgetProps) {
  return (
    <button
      onClick={(e) => {
          e.stopPropagation();
          onSelect();
      }}
      className={`w-12 h-12 rounded-full shadow-lg flex flex-col items-center justify-center gap-0.5 transition-all duration-300 pointer-events-auto active:scale-95 ${
        isActive 
          ? 'bg-blue-600 text-white rotate-0' 
          : 'bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-200 backdrop-blur-md'
      }`}
    >
      <CreditCard size={20} />
      <span className="text-[8px] font-bold">ATM</span>
    </button>
  );
}
