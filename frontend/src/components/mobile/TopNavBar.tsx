import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

interface TopNavBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function TopNavBar({ activeTab, onTabChange }: TopNavBarProps) {
  const { t } = useLanguage();

  const tabs = [
    { id: 'strategy', label: t('tabs.strategy') || '攻略' },
    { id: 'guide', label: t('tabs.guide') || '导游' },
    { id: 'me', label: t('tabs.me') || '我的' },
  ];

  return (
    <div className="absolute top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm pt-safe-top">
      <div className="flex justify-around items-center h-14 px-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id === activeTab ? '' : tab.id)}
            className={`relative py-2 px-4 text-base font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-blue-600 font-bold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
