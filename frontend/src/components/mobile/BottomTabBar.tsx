import React from 'react';
import { Map, BookOpen, UserCircle, User } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface BottomTabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function BottomTabBar({ activeTab, onTabChange }: BottomTabBarProps) {
  const { t } = useLanguage();

  const tabs = [
    { id: 'city', label: t('tabs.city'), icon: Map },
    { id: 'strategy', label: t('tabs.strategy'), icon: BookOpen },
    { id: 'guide', label: t('tabs.guide'), icon: UserCircle },
    { id: 'me', label: t('tabs.me'), icon: User },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[420px] bg-slate-50/90 dark:bg-gray-900/90 backdrop-blur-md border border-slate-300 dark:border-white/20 h-14 px-6 shadow-[0_-4px_15px_-1px_rgba(0,0,0,0.1),0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)] z-[9999] rounded-full transition-colors duration-300 pointer-events-auto flex justify-between items-center">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => {
              if (isActive) {
                onTabChange('');
              } else {
                onTabChange(tab.id);
              }
            }}
            className="flex flex-col items-center justify-center flex-1 relative group h-full"
          >
            <div 
              className={`transition-all duration-300 flex flex-col items-center justify-center`}
            >
              <div className={`p-0.5 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'text-blue-600' 
                  : 'text-gray-400 dark:text-gray-500'
              }`}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[11px] font-bold -mt-0.5 transition-all duration-300 ${
                isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'
              }`}>
                {tab.label}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
