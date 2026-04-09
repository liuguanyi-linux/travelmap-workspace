import React from 'react';
import { Globe } from 'lucide-react';

interface GlobalViewButtonProps {
  onClick: () => void;
}

export default function GlobalViewButton({ onClick }: GlobalViewButtonProps) {
  return (
    <button
      onClick={onClick}
      className="bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-lg border border-gray-100 flex items-center justify-center w-[50px] h-[50px] transition-all active:scale-95 text-blue-600 hover:text-blue-700 animate-in fade-in slide-in-from-right-8 duration-500 delay-200 flex-col gap-0.5"
    >
      <Globe size={20} strokeWidth={1.5} />
      <span className="text-[10px] font-bold text-blue-600">全览</span>
    </button>
  );
}
