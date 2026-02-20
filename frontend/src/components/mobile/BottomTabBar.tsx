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
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md pb-6 pt-2 px-6 shadow-[0_-10px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.3)] z-50 rounded-t-[2.5rem] transition-colors duration-300 pointer-events-auto">
      <div className="flex justify-between items-end h-16 pb-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center justify-center w-16 relative group"
            >
              <div 
                className={`transition-all duration-300 ${
                  isActive ? '-translate-y-1' : ''
                }`}
              >
                <div className={`p-3 rounded-[1.2rem] transition-all duration-300 ${
                  isActive 
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-[0_8px_20px_rgba(0,0,0,0.15)] scale-110' 
                    : 'text-gray-400 dark:text-gray-500 bg-transparent group-hover:bg-gray-50 dark:group-hover:bg-gray-800'
                }`}>
                  <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                </div>
              </div>
              <span className={`text-[10px] font-bold mt-1 transition-all duration-300 absolute -bottom-2 ${
                isActive ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
