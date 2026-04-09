import React from 'react';
import { Map, Building2, UserCircle, User } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface BottomTabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function BottomTabBar({ activeTab, onTabChange }: BottomTabBarProps) {
  const { t } = useLanguage();

  const tabs = [
    { id: 'city', label: t('tabs.city'), icon: Map },
    { id: 'guide', label: t('tabs.guide'), icon: UserCircle },
    { id: 'enterprise', label: '중국기업', icon: Building2 },
    { id: 'me', label: t('tabs.me'), icon: User },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-[420px] bg-slate-50/90 dark:bg-gray-900/90 backdrop-blur-md border border-slate-300 dark:border-white/20 px-6 shadow-[0_-4px_15px_-1px_rgba(0,0,0,0.1),0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)] z-[9999] rounded-2xl transition-colors duration-300 pointer-events-auto flex flex-col items-center pb-1">
      <div className="flex justify-between items-center w-full h-14">
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
      <span className="text-[11px] text-gray-500 dark:text-gray-400 select-none leading-none mb-1 w-full text-center px-2">
        Qingdao Mangtoo Networks Technology Co Ltd
      </span>
    </div>
  );
}
