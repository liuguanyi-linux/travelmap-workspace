import React, { useEffect, useState } from 'react';
import { motion, useAnimation, useDragControls, PanInfo } from 'framer-motion';
import { useFavorites } from '../../hooks/useFavorites';
import { useLanguage } from '../../contexts/LanguageContext';
import { Heart, MapPin, X, ChevronRight, User, Settings, CreditCard, Bell, Globe, Check } from 'lucide-react';

interface UserDrawerProps {
  isVisible: boolean;
  onClose: () => void;
  onPoiClick?: (poi: any) => void;
}

type ViewState = 'menu' | 'favorites' | 'settings';

export default function UserDrawer({ isVisible, onClose, onPoiClick }: UserDrawerProps) {
  const controls = useAnimation();
  const dragControls = useDragControls();
  const { favorites, removeFavorite } = useFavorites();
  const { t, language, setLanguage } = useLanguage();
  const [viewState, setViewState] = useState<ViewState>('menu');

  useEffect(() => {
    if (isVisible) {
      controls.start({ y: '40%' }); // Initial height
    } else {
      controls.start({ y: '100%' });
      // Reset to menu view after closing
      const timer = setTimeout(() => setViewState('menu'), 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible, controls]);

  const handleDragEnd = (event: any, info: PanInfo) => {
    const { offset, velocity } = info;
    if (offset.y > 100 || (velocity.y > 500 && offset.y > 0)) {
       onClose();
    } else if (offset.y < -50 || (velocity.y < -500 && offset.y < 0)) {
       controls.start({ y: 0 }); // Expand to full
    } else {
       controls.start({ y: '40%' }); // Snap back to initial
    }
  };

  const handleFavoritesClick = () => {
      setViewState('favorites');
      controls.start({ y: 0 }); // Expand to full for list
  };

  const handleSettingsClick = () => {
      setViewState('settings');
      controls.start({ y: 0 }); // Expand to full
  };

  const handleBack = () => {
      setViewState('menu');
      controls.start({ y: '40%' });
  };

  const LANGUAGES = [
      { code: 'zh-CN', label: '简体中文' },
      { code: 'en-US', label: 'English' },
      { code: 'ko-KR', label: '한국어' }
  ];

  return (
    <motion.div
        initial={{ y: '100%' }}
        animate={controls}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        drag="y"
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        style={{ zIndex: 9999 }}
        className="fixed bottom-0 left-0 right-0 h-[85vh] bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.15)] flex flex-col pointer-events-auto touch-manipulation"
    >
      {/* Handle */}
      <div 
        className="w-full flex justify-center pt-4 pb-2 cursor-grab active:cursor-grabbing shrink-0"
        onPointerDown={(e) => dragControls.start(e)}
      >
        <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-40">
         
         {viewState === 'menu' && (
             // Menu View
             <div className="space-y-6">
                 <div className="flex items-center gap-4 py-4">
                     <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                         <User size={32} />
                     </div>
                     <div>
                         <h2 className="text-xl font-bold text-gray-900">{t('user.name')}</h2>
                         <p className="text-sm text-gray-500">{t('user.slogan')}</p>
                     </div>
                 </div>

                 <div className="space-y-2">
                     <MenuItem icon={Heart} label={t('user.favorites')} onClick={handleFavoritesClick} color="text-red-500 bg-red-50" />
                     <MenuItem icon={CreditCard} label={t('user.wallet')} color="text-orange-500 bg-orange-50" />
                     <MenuItem icon={Bell} label={t('user.notifications')} color="text-purple-500 bg-purple-50" />
                     <MenuItem icon={Settings} label={t('user.settings')} onClick={handleSettingsClick} color="text-gray-500 bg-gray-50" />
                 </div>
             </div>
         )}

         {viewState === 'favorites' && (
             // Favorites List View
             <div>
                 <div className="flex items-center gap-2 mb-6">
                     <button 
                        onClick={handleBack}
                        className="p-2 -ml-2 hover:bg-gray-100 rounded-full"
                     >
                         <ChevronRight size={24} className="rotate-180" />
                     </button>
                     <h2 className="text-2xl font-bold">{t('user.favorites')}</h2>
                 </div>

                 {favorites.length === 0 ? (
                    <div className="text-gray-400 text-center py-12 flex flex-col items-center">
                        <Heart size={48} className="mb-4 text-gray-200" />
                        <p>{t('user.noFavorites')}</p>
                        <p className="text-sm text-gray-300 mt-2">{t('user.exploreTip')}</p>
                    </div>
                 ) : (
                    <div className="space-y-4">
                        {favorites.map(fav => (
                            <div key={fav.id} className="flex gap-3 bg-white border border-gray-100 p-3 rounded-xl shadow-sm active:scale-[0.98] transition-transform" onClick={() => onPoiClick && onPoiClick(fav)}>
                                <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                                    {fav.imageUrl && <img src={fav.imageUrl} className="w-full h-full object-cover" />}
                                </div>
                                <div className="flex-1 flex flex-col justify-between py-1">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-gray-900 line-clamp-1 mr-2">{fav.name}</h4>
                                            <button 
                                                onClick={(e) => { 
                                                    e.stopPropagation(); 
                                                    e.preventDefault();
                                                    removeFavorite(fav.id); 
                                                }}
                                                className="relative z-10 text-gray-400 hover:text-red-500 p-2 -mt-2 -mr-2 rounded-full hover:bg-gray-100 transition-colors"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1 px-2 py-0.5 bg-gray-100 inline-block rounded-md">
                                            {fav.type?.split(';')[0]}
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-400 flex items-center">
                                        <MapPin size={12} className="mr-1 shrink-0"/>
                                        <span className="truncate">{fav.address || t('common.unknownPlace')}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                 )}
             </div>
         )}

         {viewState === 'settings' && (
             // Settings View
             <div>
                 <div className="flex items-center gap-2 mb-6">
                     <button 
                        onClick={handleBack}
                        className="p-2 -ml-2 hover:bg-gray-100 rounded-full"
                     >
                         <ChevronRight size={24} className="rotate-180" />
                     </button>
                     <h2 className="text-2xl font-bold">{t('settings.title')}</h2>
                 </div>
                 
                 <div className="space-y-6">
                     <div>
                         <h3 className="text-sm font-semibold text-gray-500 mb-3 px-1">{t('settings.language')}</h3>
                         <div className="space-y-2">
                             {LANGUAGES.map((langItem) => (
                                 <button
                                     key={langItem.code}
                                     onClick={() => setLanguage(langItem.code)}
                                     className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                                         language === langItem.code 
                                         ? 'bg-blue-50 border-blue-500 text-blue-700' 
                                         : 'bg-white border-gray-100 text-gray-700 hover:bg-gray-50'
                                     }`}
                                 >
                                     <div className="flex items-center gap-3">
                                         <Globe size={20} className={language === langItem.code ? 'text-blue-500' : 'text-gray-400'} />
                                         <span className="font-medium">{langItem.label}</span>
                                     </div>
                                     {language === langItem.code && <Check size={20} className="text-blue-500" />}
                                 </button>
                             ))}
                         </div>
                     </div>
                 </div>
             </div>
         )}
      </div>
    </motion.div>
  );
}

function MenuItem({ icon: Icon, label, onClick, color }: any) {
    return (
        <div 
            onClick={(e) => {
                e.stopPropagation();
                console.log('MenuItem clicked:', label);
                onClick && onClick();
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className="w-full flex items-center justify-between p-4 bg-white border border-gray-50 rounded-2xl active:bg-gray-100 transition-colors cursor-pointer touch-manipulation select-none relative z-50"
        >
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color}`}>
                    <Icon size={20} />
                </div>
                <span className="font-medium text-gray-700">{label}</span>
            </div>
            <ChevronRight size={20} className="text-gray-300" />
        </div>
    )
}
