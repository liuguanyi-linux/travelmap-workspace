import React from 'react';
import { Phone, MessageCircle, Star, Award, ShieldCheck } from 'lucide-react';

interface GuideViewProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function GuideView({ isVisible, onClose }: GuideViewProps) {
  if (!isVisible) return null;

  const guides = [
    {
      id: 1,
      name: '王金牌',
      title: '资深金牌导游',
      rating: 4.9,
      reviews: 128,
      years: 8,
      avatar: 'https://picsum.photos/seed/guide1/200/200',
      tags: ['历史讲解', '摄影跟拍', '韩语流利'],
      intro: '从业8年，专注于青岛历史文化讲解，为您提供最深度的旅行体验。'
    },
    {
      id: 2,
      name: '李小美',
      title: '人气推荐导游',
      rating: 4.8,
      reviews: 96,
      years: 5,
      avatar: 'https://picsum.photos/seed/guide2/200/200',
      tags: ['亲子游', '美食达人', '热情耐心'],
      intro: '熟悉各大网红打卡点和地道美食，带你吃喝玩乐不踩雷！'
    }
  ];

  return (
    <div className="absolute inset-0 z-10 bg-gray-50 dark:bg-gray-900 flex flex-col h-[100dvh] overflow-hidden">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 px-6 pt-12 pb-4 shadow-sm z-10">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">找导游</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">专业导游，贴心服务</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-4">
        
        {/* Service Guarantee */}
        <div className="flex justify-between bg-blue-600 rounded-2xl p-4 text-white shadow-lg shadow-blue-200 dark:shadow-none">
            <div className="flex flex-col items-center gap-1">
                <ShieldCheck size={24} className="opacity-80" />
                <span className="text-xs font-medium opacity-90">官方认证</span>
            </div>
            <div className="w-[1px] bg-white/20"></div>
            <div className="flex flex-col items-center gap-1">
                <Award size={24} className="opacity-80" />
                <span className="text-xs font-medium opacity-90">金牌服务</span>
            </div>
            <div className="w-[1px] bg-white/20"></div>
            <div className="flex flex-col items-center gap-1">
                <Star size={24} className="opacity-80" />
                <span className="text-xs font-medium opacity-90">好评如潮</span>
            </div>
        </div>

        {/* Guide List */}
        {guides.map(guide => (
            <div key={guide.id} className="bg-white dark:bg-gray-800 rounded-[1.8rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:shadow-lg transition-shadow">
                <div className="flex gap-5">
                    <div className="w-18 h-18 rounded-[1.2rem] overflow-hidden shrink-0 shadow-md">
                        <img src={guide.avatar} alt={guide.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{guide.name}</h3>
                                <p className="text-xs text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-full inline-block mt-1.5">{guide.title}</p>
                            </div>
                            <div className="flex items-center gap-1 text-orange-400 font-bold bg-orange-50 dark:bg-orange-900/30 px-2 py-1 rounded-lg">
                                <Star size={14} fill="currentColor" />
                                <span>{guide.rating}</span>
                            </div>
                        </div>
                        
                        <div className="mt-3 flex flex-wrap gap-2">
                            {guide.tags.map(tag => (
                                <span key={tag} className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2.5 py-1.5 rounded-lg">{tag}</span>
                            ))}
                        </div>

                        <p className="mt-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-700/50 p-4 rounded-2xl">
                            "{guide.intro}"
                        </p>

                        <div className="flex gap-3 mt-5">
                            <button className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-bold active:scale-95 transition-transform shadow-[0_4px_15px_rgba(37,99,235,0.3)] dark:shadow-none">
                                <Phone size={18} />
                                <span>电话联系</span>
                            </button>
                            <button className="flex-1 flex items-center justify-center gap-2 bg-[#2DB400] text-white py-3 rounded-xl font-bold active:scale-95 transition-transform shadow-[0_4px_15px_rgba(45,180,0,0.3)] dark:shadow-none">
                                <MessageCircle size={18} />
                                <span>在线咨询</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        ))}
        
      </div>
    </div>
  );
}
