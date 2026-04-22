import React, { useState } from 'react';
import { Locate } from 'lucide-react';

interface MyLocationButtonProps {
  onClick: () => void;
  isLocating?: boolean;
}

export default function MyLocationButton({ onClick, isLocating }: MyLocationButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-100 flex items-center justify-center w-[50px] h-[50px] transition-all active:scale-95 flex-col gap-0.5 ${isLocating ? 'text-blue-500' : 'text-gray-600 hover:text-blue-600'}`}
    >
      <Locate size={22} strokeWidth={2} className={isLocating ? 'animate-pulse' : ''} />
    </button>
  );
}

interface Toggle2DButtonProps {
  is3D: boolean;
  onClick: () => void;
}

export function Toggle2DButton({ is3D, onClick }: Toggle2DButtonProps) {
  return (
    <button
      onClick={onClick}
      className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-100 flex items-center justify-center w-[50px] h-[50px] transition-all active:scale-95"
    >
      <span className="text-[16px] font-black text-gray-700">{is3D ? '2D' : '3D'}</span>
    </button>
  );
}
