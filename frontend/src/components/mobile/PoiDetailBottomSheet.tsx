import React, { useEffect, useState } from 'react';
import { motion, PanInfo, useAnimation, useDragControls } from 'framer-motion';
import { X, Navigation, Star, Share2, Phone, Clock, MapPin, Heart } from 'lucide-react';
import { useFavorites } from '../../hooks/useFavorites';
import { useLanguage } from '../../contexts/LanguageContext';

interface PoiDetailBottomSheetProps {
  poi: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function PoiDetailBottomSheet({ poi, isOpen, onClose }: PoiDetailBottomSheetProps) {
  const controls = useAnimation();
  const dragControls = useDragControls();
  const [viewState, setViewState] = useState<'hidden' | 'peek' | 'full'>('hidden');
  const { isFavorite, toggleFavorite } = useFavorites();
  const { t } = useLanguage();
  
  const isFav = poi ? isFavorite(poi.id) : false;

  useEffect(() => {
    if (isOpen) {
      setViewState('peek');
      controls.start('peek');
    } else {
      setViewState('hidden');
      controls.start('hidden');
    }
  }, [isOpen, controls]);

  const variants = {
    hidden: { y: '100%' },
    peek: { y: '65%' }, // Show bottom 35%
    full: { y: '0%' }   // Full screen
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    const { offset, velocity } = info;
    const isFast = Math.abs(velocity.y) > 500;
    
    // Current visual position (roughly) can be inferred from state + offset
    // But easier to just use logic based on direction and distance
    
    if (offset.y < -50 || (velocity.y < -500 && offset.y < 0)) {
        // Dragging UP
        if (viewState === 'peek') {
            setViewState('full');
            controls.start('full');
        } else {
            // Already full, snap back to full
            controls.start('full');
        }
    } else if (offset.y > 50 || (velocity.y > 500 && offset.y > 0)) {
        // Dragging DOWN
        if (viewState === 'full') {
            setViewState('peek');
            controls.start('peek');
        } else if (viewState === 'peek') {
            // Close
            onClose();
        }
    } else {
        // Revert to current state
        controls.start(viewState);
    }
  };

  if (!poi) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex flex-col justify-end">
        {/* Backdrop - only visible when full screen? Or never? 
            User said: "map still scalable/movable when panel at 1/3".
            So no backdrop in peek mode. In full mode maybe?
            Let's skip backdrop for now to keep it clean/modern.
        */}
        
        <motion.div
          initial="hidden"
          animate={controls}
          variants={variants}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          drag="y"
          dragControls={dragControls}
          dragListener={false} // Only drag via handle or header
          dragConstraints={{ top: 0 }}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
          className="absolute left-0 right-0 h-[100vh] bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.15)] overflow-hidden pointer-events-auto flex flex-col"
        >
          {/* Drag Handle Area - Active Drag Zone */}
          <div 
            className="w-full flex justify-center pt-4 pb-2 cursor-grab active:cursor-grabbing bg-white z-20 shrink-0"
            onPointerDown={(e) => dragControls.start(e)}
          >
            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
          </div>

          {/* Content Container */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
              
              {/* Header Info (Always visible) */}
              <div className="px-6 pb-4 bg-white z-10 shrink-0">
                <div className="flex justify-between items-start">
                    <div className="flex-1 mr-4">
                        <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-2">{poi.name}</h2>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                            <div className="flex text-yellow-400">
                                <Star size={14} fill="currentColor" />
                                <Star size={14} fill="currentColor" />
                                <Star size={14} fill="currentColor" />
                                <Star size={14} fill="currentColor" />
                                <Star size={14} fill="currentColor" className="text-gray-200" />
                            </div>
                            <span>4.2</span>
                            <span className="text-gray-300">|</span>
                            <span>{poi.type?.split(';')[0] || t('common.unknownPlace')}</span>
                            <span className="text-gray-300">|</span>
                            <span>1.2km</span>
                        </div>
                        <div className="flex items-center text-gray-500 text-sm">
                            <MapPin size={14} className="mr-1 shrink-0" />
                            <span className="truncate">{poi.address || t('detail.noContact')}</span>
                        </div>
                    </div>
                    {/* Close Button for Peek Mode */}
                    <button 
                        onClick={onClose} 
                        className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 shrink-0"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>
              </div>

              {/* Scrollable Content (Visible in Full Mode or scrolling in Peek?) 
                  In Peek mode (35% height), we see Drag Handle + Header + maybe top of photos.
                  Let's make the whole body scrollable but drag handled by top.
              */}
              <div className="flex-1 overflow-y-auto bg-gray-50 pb-24">
                  {/* Horizontal Photos */}
                  <div className="mt-2 mb-6">
                      <div className="flex gap-3 px-6 overflow-x-auto pb-4 scrollbar-hide snap-x">
                          {[1, 2, 3, 4].map((i) => (
                              <div key={i} className="w-40 h-28 shrink-0 rounded-xl overflow-hidden bg-gray-200 snap-center shadow-sm relative">
                                  <img 
                                    src={`https://picsum.photos/seed/${poi.id || 'poi'}${i}/300/200`} 
                                    alt="Preview" 
                                    className="w-full h-full object-cover"
                                  />
                              </div>
                          ))}
                      </div>
                  </div>

                  {/* Detailed Info */}
                  <div className="px-6 space-y-4">
                      {/* Hours & Phone */}
                      <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                              <div className="flex items-center gap-2 mb-2 text-gray-400">
                                  <Clock size={16} />
                                  <span className="text-xs font-medium">{t('detail.openTime')}</span>
                              </div>
                              <div className="font-semibold text-gray-900">09:00 - 22:00</div>
                              <div className="text-xs text-green-600 mt-1">{t('detail.operating')}</div>
                          </div>
                          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                              <div className="flex items-center gap-2 mb-2 text-gray-400">
                                  <Phone size={16} />
                                  <span className="text-xs font-medium">{t('detail.phone')}</span>
                              </div>
                              <div className="font-semibold text-gray-900 truncate">021-12345678</div>
                              <div className="text-xs text-blue-600 mt-1">{t('detail.clickToCall')}</div>
                          </div>
                      </div>

                      {/* Introduction */}
                      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                          <h3 className="font-bold text-gray-900 mb-3 text-lg">{t('detail.intro')}</h3>
                          <p className="text-sm text-gray-600 leading-relaxed text-justify">
                              {t('detail.introDesc', { name: poi.name }).replace('{name}', poi.name)}
                              <br/><br/>
                          </p>
                      </div>
                      
                      {/* Reviews Preview */}
                      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
                          <div className="flex justify-between items-center mb-4">
                              <h3 className="font-bold text-gray-900 text-lg">{t('detail.visitorReviews')}</h3>
                              <span className="text-sm text-blue-600">{t('detail.viewAll')} &gt;</span>
                          </div>
                          <div className="space-y-4">
                              {[1, 2].map(i => (
                                  <div key={i} className="border-b border-gray-50 last:border-0 pb-3 last:pb-0">
                                      <div className="flex justify-between items-center mb-1">
                                          <span className="font-medium text-gray-800 text-sm">{t('detail.visitor')}{8866 + i}</span>
                                          <div className="flex text-yellow-400 scale-75 origin-right">
                                              <Star size={14} fill="currentColor" />
                                              <Star size={14} fill="currentColor" />
                                              <Star size={14} fill="currentColor" />
                                              <Star size={14} fill="currentColor" />
                                              <Star size={14} fill="currentColor" />
                                          </div>
                                      </div>
                                      <p className="text-xs text-gray-500 line-clamp-2">
                                          非常棒的体验！位置很好找，工作人员也很热情。强烈推荐给大家！
                                      </p>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
              </div>
          </div>

          {/* Fixed Bottom Buttons */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 flex gap-3 z-30 pb-8">
              <button 
                onClick={() => toggleFavorite({
                    id: poi.id,
                    name: poi.name,
                    type: poi.type,
                    address: poi.address,
                    location: poi.location,
                    imageUrl: `https://picsum.photos/seed/${poi.id || 'poi'}/300/200`
                })}
                className="flex flex-col items-center justify-center w-16 gap-1 text-gray-500 active:scale-95 transition-transform"
              >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isFav ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-500'}`}>
                    <Heart size={20} fill={isFav ? "currentColor" : "none"} />
                  </div>
                  <span className={`text-xs ${isFav ? 'text-red-500' : ''}`}>{isFav ? '已收藏' : '收藏'}</span>
              </button>
              <button className="flex-1 bg-blue-600 text-white rounded-full font-bold text-lg shadow-lg shadow-blue-200 active:scale-95 transition-transform flex items-center justify-center gap-2">
                  <Navigation size={20} fill="currentColor" />
                  <span>导航前往</span>
              </button>
          </div>

        </motion.div>
    </div>
  );
}
