import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink, Tag, Wifi, Ticket, ShoppingBag, Image as ImageIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useData } from '../../contexts/DataContext';

const DEFAULT_ADS = [
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

export default function AdsWidget({ isOpen, onOpenChange }: { isOpen?: boolean; onOpenChange?: (open: boolean) => void }) {
  const { ads } = useData();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  // Use controlled or uncontrolled state
  const isControlled = typeof isOpen !== 'undefined';
  const showModal = isControlled ? isOpen : internalIsOpen;
  const setShowModal = (val: boolean) => {
      if (isControlled && onOpenChange) {
          onOpenChange(val);
      } else {
          setInternalIsOpen(val);
      }
  };

  // Use context ads if available, otherwise fallback to defaults
  const displayAds = ads.length > 0 ? ads : DEFAULT_ADS;

  useEffect(() => {
    if (showModal) return; // Stop rotation when open
    
    // Reset index if ads change and index is out of bounds
    if (currentIndex >= displayAds.length) {
      setCurrentIndex(0);
    }

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayAds.length);
    }, 3000); // Rotate every 3 seconds

    return () => clearInterval(interval);
  }, [showModal, displayAds.length]);

  const currentAd = displayAds[currentIndex] || displayAds[0];
  const isDefaultAd = 'icon' in currentAd;
  const Icon = isDefaultAd ? (currentAd as any).icon : ImageIcon;

  return (
    <>
      {/* Collapsed Widget (Carousel) */}
      <div className="animate-in fade-in slide-in-from-right-4 duration-500 relative z-[1000] pointer-events-auto">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            console.log('AdsWidget clicked, opening modal');
            setShowModal(true);
          }}
          className="bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-lg border border-gray-100 flex flex-col items-center justify-center gap-1 w-[88px] h-[72px] cursor-pointer hover:scale-105 active:scale-95 transition-all group relative overflow-hidden touch-manipulation"
        >
          <AnimatePresence mode='wait'>
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center text-center w-full"
            >
              {isDefaultAd ? (
                <div className={`p-1.5 rounded-full ${(currentAd as any).color} text-white mb-0.5 shadow-sm`}>
                  <Icon size={14} />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full overflow-hidden mb-0.5 shadow-sm border border-gray-100">
                   <img src={(currentAd as any).image} alt={currentAd.title} className="w-full h-full object-cover" />
                </div>
              )}
              
              <div className="text-[10px] font-bold text-gray-800 line-clamp-1 w-full leading-tight">
                {currentAd.title}
              </div>
              <div className="text-[8px] text-gray-400 scale-90 line-clamp-1 w-full leading-tight">
                {isDefaultAd ? (currentAd as any).desc : (currentAd as any).description}
              </div>
            </motion.div>
          </AnimatePresence>
          
          {/* Progress Dots */}
          <div className="flex gap-0.5 mt-0.5">
            {displayAds.map((_, idx) => (
              <div 
                key={idx}
                className={`h-0.5 rounded-full transition-all ${idx === currentIndex ? 'bg-blue-500 w-2' : 'bg-gray-200 w-1'}`}
              />
            ))}
          </div>
        </button>
      </div>

      {/* Expanded Modal - Using Portal with correct nesting for AnimatePresence */}
      {createPortal(
        <AnimatePresence>
          {showModal && (
            <div 
              className="fixed inset-0 flex items-center justify-center px-4 pointer-events-auto touch-auto" 
              style={{ zIndex: 999999 }}
            >
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setShowModal(false);
                }}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              />

              {/* Content */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-3xl p-5 shadow-2xl relative z-10 pointer-events-auto"
              >
                <div className="flex justify-between items-center mb-4 px-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">热门推荐</h3>
                  <button 
                    onClick={() => setShowModal(false)}
                    className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Horizontal Scroll List */}
                <div className="flex gap-3 overflow-x-auto pb-4 snap-x hide-scrollbar">
                  {displayAds.map((ad) => {
                    const isDefault = 'icon' in ad;
                    const AdIcon = isDefault ? (ad as any).icon : null;
                    
                    return (
                      <div 
                        key={ad.id}
                        className="w-[40%] shrink-0 snap-start bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 flex flex-col items-center text-center gap-3 border border-gray-100 dark:border-gray-700 active:scale-95 transition-transform"
                        onClick={() => {
                          console.log('Clicked ad:', ad.title);
                          if (ad.link && ad.link !== '#') {
                            window.open(ad.link, '_blank');
                          } else {
                            window.dispatchEvent(new CustomEvent('navigate-to-tab', { 
                              detail: { tab: 'guide', category: 'ad' } 
                            }));
                            setShowModal(false);
                          }
                        }}
                      >
                        {isDefault ? (
                           <div className={`p-4 rounded-2xl ${(ad as any).color} text-white shadow-lg`}>
                             <AdIcon size={32} />
                           </div>
                        ) : (
                           <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg border border-gray-100">
                             <img src={(ad as any).image} alt={ad.title} className="w-full h-full object-cover" />
                           </div>
                        )}
                        
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white mb-1">{ad.title}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                              {isDefault ? (ad as any).desc : (ad as any).description}
                          </div>
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
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
