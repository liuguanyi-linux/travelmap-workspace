import React from 'react';
import { Globe } from 'lucide-react';

interface GlobalViewButtonProps {
  onClick: () => void;
}

export default function GlobalViewButton({ onClick }: GlobalViewButtonProps) {
  return (
    <button
      onClick={onClick}
      className="bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg border border-gray-100 dark:border-gray-700 active:scale-95 transition-transform"
      aria-label="Global View"
    >
      <Globe size={24} className="text-blue-600 dark:text-blue-400" />
    </button>
  );
}
