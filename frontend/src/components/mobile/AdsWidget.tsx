import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useData } from '../../contexts/DataContext';

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

  // Remove default fallback, only display if there are real ads
  const displayAds = ads.filter(ad => {
    // Only show active ads
    if (ad.expiryDate && new Date(ad.expiryDate) < new Date()) {
      return false;
    }
    return true;
  });

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

  // If no ads are available, don't render the widget at all
  // IMPORTANT: Move this return AFTER all hooks (useEffect, useState)
  if (displayAds.length === 0) {
    return null;
  }

  const currentAd = displayAds[currentIndex] || displayAds[0];

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
          className="bg-white/90 backdrop-blur-md p-1.5 rounded-xl shadow-lg border border-gray-100 flex flex-col items-center justify-center gap-1 w-[110px] h-[100px] cursor-pointer hover:scale-105 active:scale-95 transition-all group relative overflow-hidden touch-manipulation"
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
              <div className="w-14 h-14 rounded-xl overflow-hidden mb-1 shadow-sm border border-gray-200 shrink-0">
                 <img src={currentAd.image} alt={currentAd.title} className="w-full h-full object-cover" />
              </div>
              
              <div className="flex flex-col w-full px-1">
                <div className="text-[10px] font-bold text-gray-800 line-clamp-1 w-full leading-tight">
                  {currentAd.title}
                </div>
                <div className="text-[8px] text-gray-400 scale-[0.85] transform origin-top line-clamp-1 w-full leading-tight mt-[1px]">
                  {currentAd.description}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          
          {/* Progress Dots */}
          <div className="flex gap-0.5 absolute bottom-1.5">
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
                className="bg-white dark:bg-gray-900 w-[85%] max-w-[320px] mx-auto rounded-3xl p-5 shadow-2xl relative z-10 pointer-events-auto"
              >
                <div className="flex justify-between items-center mb-4 px-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">추천 광고</h3>
                  <button 
                    onClick={() => setShowModal(false)}
                    className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Horizontal Scroll List */}
                <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory hide-scrollbar">
                  {displayAds.map((ad) => {
                    return (
                      <div 
                        key={ad.id}
                        onClick={() => {
                          if (ad.link) {
                            window.open(ad.link, '_blank');
                          } else {
                            // Dispatch event to open guide view to ads tab
                            window.dispatchEvent(new CustomEvent('navigate-to-tab', { 
                              detail: { tab: 'guide', category: 'ad' } 
                            }));
                            setShowModal(false);
                          }
                        }}
                        className={`flex-none w-full min-h-[260px] rounded-2xl p-6 snap-center cursor-pointer transition-transform active:scale-95 border border-gray-100 dark:border-gray-800 shadow-sm bg-gray-50 dark:bg-gray-800 flex flex-col justify-center items-center text-center`}
                      >
                        <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-md border border-gray-200 mb-4 shrink-0">
                           <img src={ad.image} alt={ad.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="w-full flex-1 flex flex-col justify-center">
                          <h4 className="font-bold text-gray-900 dark:text-white truncate mb-2 text-lg">{ad.title}</h4>
                          <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">{ad.description}</p>
                        </div>
                        
                        <div className="flex items-center text-sm text-blue-600 font-bold mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 w-full justify-center">
                          <span>상세 정보</span>
                          <ExternalLink size={14} className="ml-1" />
                        </div>
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
