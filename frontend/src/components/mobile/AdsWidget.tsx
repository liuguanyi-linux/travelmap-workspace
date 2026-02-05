import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Tag, Wifi, Ticket, ShoppingBag } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const ADS = [
  {
    id: 1,
    title: 'SIM卡/WiFi',
    desc: '无限流量高速上网',
    icon: Wifi,
    color: 'bg-blue-500',
    link: '#'
  },
  {
    id: 2,
    title: '交通卡',
    desc: '一卡畅游全城',
    icon: Ticket,
    color: 'bg-green-500',
    link: '#'
  },
  {
    id: 3,
    title: '免税优惠',
    desc: '最高立减20%',
    icon: ShoppingBag,
    color: 'bg-pink-500',
    link: '#'
  },
  {
    id: 4,
    title: '景点套票',
    desc: '热门景点一网打尽',
    icon: Tag,
    color: 'bg-orange-500',
    link: '#'
  }
];

export default function AdsWidget() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) return; // Stop rotation when open
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ADS.length);
    }, 3000); // Rotate every 3 seconds

    return () => clearInterval(interval);
  }, [isOpen]);

  const currentAd = ADS[currentIndex];
  const Icon = currentAd.icon;

  return (
    <>
      {/* Collapsed Widget (Carousel) */}
      <div className="animate-in fade-in slide-in-from-right-4 duration-500">
        <div 
          onClick={() => setIsOpen(true)}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/30 flex flex-col items-center justify-center gap-2 w-32 cursor-pointer hover:scale-105 active:scale-95 transition-all group relative overflow-hidden h-[88px]"
        >
          <AnimatePresence mode='wait'>
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center text-center w-full"
            >
              <div className={`p-2 rounded-full ${currentAd.color} text-white mb-1 shadow-md`}>
                <Icon size={18} />
              </div>
              <div className="text-xs font-bold text-gray-800 dark:text-white line-clamp-1 w-full">
                {currentAd.title}
              </div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400 scale-90 line-clamp-1 w-full">
                {currentAd.desc}
              </div>
            </motion.div>
          </AnimatePresence>
          
          {/* Progress Dots */}
          <div className="flex gap-1 mt-1">
            {ADS.map((_, idx) => (
              <div 
                key={idx}
                className={`w-1 h-1 rounded-full transition-all ${idx === currentIndex ? 'bg-blue-500 w-2' : 'bg-gray-300 dark:bg-gray-600'}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Expanded Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Content */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-3xl p-5 shadow-2xl relative z-10"
            >
              <div className="flex justify-between items-center mb-4 px-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">热门推荐</h3>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Horizontal Scroll List */}
              <div className="flex gap-3 overflow-x-auto pb-4 snap-x hide-scrollbar">
                {ADS.map((ad) => {
                  const AdIcon = ad.icon;
                  return (
                    <div 
                      key={ad.id}
                      className="min-w-[140px] snap-start bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 flex flex-col items-center text-center gap-3 border border-gray-100 dark:border-gray-700 active:scale-95 transition-transform"
                      onClick={() => {
                        // Handle click - for now just close, in real app would navigate
                        console.log('Clicked ad:', ad.title);
                        // window.open(ad.link, '_blank'); 
                      }}
                    >
                      <div className={`p-4 rounded-2xl ${ad.color} text-white shadow-lg`}>
                        <AdIcon size={32} />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white mb-1">{ad.title}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{ad.desc}</div>
                      </div>
                      <button className="mt-2 text-xs font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1">
                        查看详情 <ExternalLink size={10} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
