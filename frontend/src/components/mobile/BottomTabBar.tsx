import React from 'react';
import { Map, BookOpen, UserCircle, User } from 'lucide-react';

interface BottomTabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function BottomTabBar({ activeTab, onTabChange }: BottomTabBarProps) {
  const tabs = [
    { id: 'city', label: '城市', icon: Map },
    { id: 'strategy', label: '攻略', icon: BookOpen },
    { id: 'guide', label: '导游', icon: UserCircle },
    { id: 'me', label: '我的', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-6 pt-2 px-6 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50 rounded-t-3xl">
      <div className="flex justify-between items-end h-16 pb-4">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center justify-center w-16 relative"
            >
              <div 
                className={`transition-all duration-300 ${
                  isActive ? '-translate-y-2' : ''
                }`}
              >
                <div className={`p-2 rounded-2xl transition-all duration-300 ${
                  isActive ? 'bg-black text-white shadow-lg shadow-gray-200' : 'text-gray-400 bg-transparent'
                }`}>
                  <Icon size={24} strokeWidth={isActive ? 2 : 1.5} />
                </div>
              </div>
              <span className={`text-xs font-medium mt-1 transition-all duration-300 absolute -bottom-1 ${
                isActive ? 'opacity-100 text-black translate-y-0' : 'opacity-0 text-gray-400 translate-y-2'
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
