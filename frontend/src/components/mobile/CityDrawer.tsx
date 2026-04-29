import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, Search, MapPin, Building2, ChevronUp, ChevronDown } from 'lucide-react';
import * as Icons from 'lucide-react';
import { motion, AnimatePresence, useAnimation, PanInfo, useDragControls } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useData } from '../../contexts/DataContext';
import { useFavorites } from '../../hooks/useFavorites';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface CityDrawerProps {
  isVisible: boolean;
  onSelectCategory: (category: string) => void;
  onSelectCity: (city: { name: string, center: [number, number], zoom: number }) => void;
  searchResults: any[]; // Pass search results to display in list
  onPoiClick: (poi: any) => void;
  onClose?: () => void;
  onSearch?: (keyword: string, category?: string) => void;
  activeCityName?: string;
}

// Level 1: Cities
// Level 2: Categories (Attractions, Hotels, Food) for selected city
// Level 3: POI List for selected category
type ViewLevel = 'cities' | 'categories' | 'list';

import { City } from '../../types/data';

const CategoryIcon = React.memo(({ icon, name, size = 22, className = "" }: { icon: string, name: string, size?: number, className?: string }) => {
  if (icon && (icon.startsWith('http') || icon.startsWith('/') || icon.startsWith('data:'))) {
      return (
          <img 
              src={icon} 
              alt={name} 
              style={{ width: size, height: size }} 
              className={`object-contain ${className}`} 
          />
      );
  }
  
  const IconComponent = (Icons as any)[icon] || Icons.MapPin;
  return <IconComponent size={size} className={className} />;
});

export default function CityDrawer({ isVisible, onSelectCategory, onSelectCity, searchResults, onPoiClick, onClose, onSearch, activeCityName }: CityDrawerProps) {
  // State for view mode: 'city_selection' or 'category_list'
  const [viewMode, setViewMode] = useState<'city_selection' | 'category_list'>('category_list'); // Default to list since FilterBar handles city selection
  
  const controls = useAnimation();
  const dragControls = useDragControls();
  const [viewState, setViewState] = useState<'hidden' | 'peek' | 'full'>('hidden');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const { t, language } = useLanguage();
  const { cities = [], spotCategories = [], refreshData } = useData();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { user } = useAuth();

  const getCityDisplayName = (city: City | undefined) => {
    if (!city) return '';
    if (language === 'ko-KR' && city.nameKo) return city.nameKo;
    if (language === 'en-US' && city.nameEn) return city.nameEn;
    return city.name;
  };

  const getCityDisplayNameByName = (cityName: string) => {
      const city = cities.find(c => c.name === cityName);
      
      // Temporary hardcode for Qingdao translation fallback
      if (!city && cityName === '青岛') {
          if (language === 'ko-KR') return '칭다오';
          if (language === 'ja-JP') return 'チンタオ';
          if (language === 'en-US') return 'Qingdao';
      }
      
      return city ? getCityDisplayName(city) : cityName;
  };

  // Reset view and position when drawer closes/opens
  useEffect(() => {
    if (isVisible) {
      setViewState('full');
      setViewMode('city_selection');
    } else {
      setViewState('hidden');
    }
  }, [isVisible]);

  const handleCityClick = (city: City) => {
      if (!city || !city.name) return;
      setSelectedCity(city.name);
      onSelectCity({ name: city.name, center: [city.lng || 0, city.lat || 0], zoom: city.zoom || 13 });
      setViewMode('category_list');
      setSelectedCategory('spot');
      onSelectCategory('spot');
      setViewState('full');
  };

  const handleBackToCitySelection = () => {
      setViewMode('city_selection');
      // Optional: Clear selection or keep it? 
      // If user wants to select another city, maybe clear active city?
      // But keeping map context is usually better.
      // Let's just switch view.
  };
  
  const handleCategoryClick = (category: string) => {
    if (selectedCategory === category) {
        // Optional: toggle off? Usually we keep at least one category selected or allow deselection.
        // For now, let's allow re-selection to just ensure it's active.
        return;
    }
    setSelectedCategory(category);
    setSearchKeyword('');
    onSelectCategory(category);
  };

  useEffect(() => {
      setViewState('full');
  }, [viewMode]);

  const cardHeight = viewState === 'peek' ? '35vh' : '75vh';

  // ... (keep categories generation logic, but move it inside component or use memo)
  // Ensure categories filter logic is robust
   const categories = (spotCategories || [])
     .filter(cat => cat && cat.key && cat.name) 
     .filter(cat => !['transport', 'airport', 'high_speed_rail', 'high-speed-rail', 'train', 'accommodation'].includes(cat.key))
     .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
     .map(cat => {
       const translationKey = `categories.${cat.key}`;
       const translatedLabel = t(translationKey);
       const label = translatedLabel !== translationKey ? translatedLabel : cat.name;
       return {
         id: cat.key,
         label: label,
         iconName: cat.icon,
         color: cat.key === 'spot' ? 'text-green-600 bg-green-50' :
                cat.key === 'dining' ? 'text-orange-600 bg-orange-50' :
                cat.key === 'shopping' ? 'text-cyan-600 bg-cyan-50' : // 颜色改为亮青色 (Cyan)
                cat.key === 'golf' ? 'text-emerald-600 bg-emerald-50' :
                'text-gray-600 bg-gray-50'
       };
     });
   
   const finalCategories = categories.filter(c => 
       !['high_speed_rail', 'airport', 'high-speed-rail', 'train', 'station'].includes(c.id) &&
       !c.label.includes('高铁') && 
       !c.label.includes('High Speed Rail')
   );
   
   const hasTransport = finalCategories.some(c => c.id === 'transport');
   
   if (!hasTransport) {
     finalCategories.push({
         id: 'transport',
         label: t('categories.transport') !== 'categories.transport' ? t('categories.transport') : '交通',
         iconName: 'Train',
         color: 'text-indigo-600 bg-indigo-50'
     });
   }

   // Ensure cities is an array and filter invalid entries
   const cityList = (Array.isArray(cities) ? cities : [])
     .filter(city => city && city.name);

   const [loadingError, setLoadingError] = useState(false);

   useEffect(() => {
     if (isVisible && cityList.length === 0) {
         const timer = setTimeout(() => {
             if (cityList.length === 0) {
                 setLoadingError(true);
                 refreshData();
             }
         }, 2000);
         return () => clearTimeout(timer);
     } else {
         setLoadingError(false);
     }
   }, [isVisible, cityList.length, refreshData]);

   useEffect(() => {
     // Removed refreshData() on visible to prevent redundant fetches
     // Data is already loaded by DataContext on mount
   }, [isVisible]);

  // Sync with activeCityName prop
  const lastSyncedCityRef = React.useRef<string>('');
  useEffect(() => {
      if (isVisible && activeCityName) {
          // Update internal selection if it differs, but NEVER auto-switch view mode
          // This ensures the drawer always stays in the mode the user left it in (or forced to 'city_selection' by the open effect)
          if (activeCityName !== selectedCity) {
             setSelectedCity(activeCityName);
             // Do NOT switch to category_list here. User wants to see the grid first.
             // If we want to auto-select a default category, we can do it, but keep viewMode as is.
             if (!selectedCategory) {
                 setSelectedCategory('spot');
             }
          }
          lastSyncedCityRef.current = activeCityName;
      }
  }, [isVisible, activeCityName]);

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: '0%' }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className={`fixed bottom-0 left-0 right-0 mx-auto z-[100] w-[96%] max-w-[500px] bg-slate-50/95 dark:bg-gray-900/95 backdrop-blur-lg rounded-t-[2.5rem] shadow-[0_-5px_25px_rgba(0,0,0,0.15)] border-t border-x border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden transition-[height] duration-500 ease-in-out ${viewState === 'peek' ? 'h-[35vh]' : 'h-[75vh]'}`}
        >
          {/* Drag Handle (Click to Toggle) */}
          <div
            className="w-full flex justify-center pt-3 pb-2 cursor-pointer z-10 shrink-0 touch-none items-center gap-2"
            onClick={() => setViewState(prev => prev === 'peek' ? 'full' : 'peek')}
          >
            <div className="flex items-center gap-2 px-3 py-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-full shadow-sm border border-gray-200/60 dark:border-gray-700/60">
              {viewState === 'full' ? (
                  <ChevronDown className="text-gray-600 dark:text-gray-300" size={20} />
              ) : (
                  <ChevronUp className="text-gray-600 dark:text-gray-300" size={20} />
              )}
              <span className="text-xs text-gray-600 dark:text-gray-300 font-medium tracking-wide">{viewState === 'full' ? t('clickToCollapse') : t('clickToExpand')}</span>
            </div>
          </div>

          {/* Close Button */}
          <div className="absolute top-3 right-4 z-[120] pointer-events-auto">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    console.log('[CityDrawer] Close clicked');
                    if (onClose) {
                        onClose();
                    }
                }}
                className="p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-full shadow-sm border border-gray-200/60 dark:border-gray-700/60 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
                <X size={18} />
            </button>
          </div>

          {/* Header with Back Button and Search (Only in Category List mode) */}
          {viewMode === 'category_list' && (
              <div className="px-4 pb-1 shrink-0 z-[110] relative">
                  <div className="flex items-center gap-1 min-h-[28px]">
                      <button
                        onClick={handleBackToCitySelection}
                        onPointerDown={(e) => e.stopPropagation()}
                        className="p-0.5 -ml-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 active:bg-black/10 dark:active:bg-white/10 transition-colors"
                      >
                          <ChevronLeft size={24} className="text-gray-600 dark:text-gray-300" />
                      </button>
                      <span className="text-lg font-bold text-gray-800 dark:text-white">
                          {getCityDisplayNameByName(selectedCity || activeCityName || '')}
                      </span>
                      <div className="flex-1 relative ml-2">
                        <div className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none">
                          <Search className="h-3.5 w-3.5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={searchKeyword}
                          placeholder={t('searchPlaceholder')}
                          className="w-full h-8 pl-8 pr-7 bg-white dark:bg-gray-800 rounded-full border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900 dark:text-white placeholder-gray-400 text-xs"
                          onChange={(e) => {
                            const kw = e.target.value;
                            setSearchKeyword(kw);
                            if (onSearch) onSearch(kw);
                          }}
                        />
                        {searchKeyword && (
                          <button
                            onClick={() => { setSearchKeyword(''); if (onSearch) onSearch(''); }}
                            className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-gray-600"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                  </div>
              </div>
          )}
          
          {/* Content Area */}
          <div 
            className={`flex-1 overflow-y-auto overflow-x-hidden px-4 ${viewMode === 'category_list' ? 'pb-24' : 'pb-12'}`}
            style={{ 
                overscrollBehavior: 'contain', 
                touchAction: 'pan-y',
                WebkitOverflowScrolling: 'touch',
                paddingBottom: (viewMode === 'category_list' && viewState === 'peek')
                    ? 'calc(96vh - 400px + 6rem)'
                    : undefined
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            
            {/* View Mode 1: City Selection */}
            {viewMode === 'city_selection' && (
                <div className="pt-1 pb-1">
                    {/* Title removed for compactness */}
                    
                    {cityList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-4 text-gray-500">
                            {loadingError ? (
                                <>
                                    <p className="mb-2">{t('cityDrawer.loadingError')}</p>
                                    <button 
                                        onClick={() => refreshData()}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm"
                                    >
                                        {t('cityDrawer.retry')}
                                    </button>
                                </>
                            ) : (
                                <p>{t('cityDrawer.loading')}</p>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-4 gap-3 px-1">
                            {cityList.map((city, index) => (
                                <button
                                    key={city.name || index}
                                    onClick={() => handleCityClick(city)}
                                    className="flex flex-col items-center justify-center p-2 rounded-lg bg-white dark:bg-gray-800 border border-slate-300 dark:border-slate-500 shadow-sm active:scale-95 transition-transform min-w-[70px] w-auto min-h-[64px]"
                                >
                                    <div className="p-0.5 rounded-full bg-gray-50 dark:bg-gray-700 mb-1 text-gray-400 dark:text-gray-300">
                                        <Building2 size={16} />
                                    </div>
                                    <span className="font-bold text-gray-800 dark:text-white text-[12px] z-10 text-center leading-tight w-full break-words whitespace-normal">{getCityDisplayName(city)}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* View Mode 2: Category List */}
            {viewMode === 'category_list' && (
                <div className="space-y-2 pt-0.5 pb-0">
                    {/* Category Grid */}
                    <div className="flex overflow-x-auto gap-2 px-1 pb-1 snap-x snap-mandatory scrollbar-hide -mx-1">
                        {finalCategories.map((cat) => {
                            const isSelected = selectedCategory === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => handleCategoryClick(cat.id)}
                                    className={`flex-none flex items-center justify-center px-3 py-1.5 rounded-md transition-all duration-200 h-auto w-auto snap-center ${
                                        isSelected 
                                            ? 'bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-500 shadow-sm' 
                                            : 'bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-slate-300 dark:border-slate-500 shadow-sm active:scale-95'
                                    }`}
                                >
                                    <span className={`font-bold text-sm z-10 text-center leading-tight whitespace-nowrap ${
                                        isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-800 dark:text-white'
                                    }`}>
                                        {cat.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Inline List */}
                    {selectedCategory && (
                        <div className="space-y-2 pt-0.5 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            {/* List Content */}
                            {(() => {
                                const filteredResults = (searchResults || []).filter(item => {
                                    if (!item) return false;
                                    // 过滤掉已下架的项
                                    if (item.isActive === false) return false;
                                    
                                    const hasTag = (tag: string) => {
                                        if (item.tags && Array.isArray(item.tags)) {
                                            return item.tags.includes(tag);
                                        }
                                        if (item.type && typeof item.type === 'string') {
                                            return item.type.includes(tag);
                                        }
                                        return false;
                                    };

                                    if (selectedCategory === 'transport') {
                                        return hasTag('transport') || hasTag('high_speed_rail') || hasTag('airport') || hasTag('train') || hasTag('station') || hasTag('rail') || hasTag('metro') || hasTag('bus') || hasTag('subway');
                                    }
                                    
                                    if (selectedCategory === 'spot') {
                                        return hasTag('spot') || hasTag('attraction');
                                    }

                                    if (selectedCategory === 'attraction') {
                                        return hasTag('spot') || hasTag('attraction');
                                    }

                                    return hasTag(selectedCategory);
                                });

                                filteredResults.sort((a, b) => {
                                    if (a.isTop && !b.isTop) return -1;
                                    if (!a.isTop && b.isTop) return 1;
                                    return (a.sortOrder || 999) - (b.sortOrder || 999);
                                });

                                if (filteredResults.length === 0) {
                                    return (
                                        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                            <Search size={48} className="mb-4 opacity-20" />
                                            <p>{t('cityDrawer.noResults')}</p>
                                        </div>
                                    );
                                }

                                return filteredResults.map((spot, index) => {
                                    const targetIdForFav = String(spot.id || spot.amapId);
                                    const isFav = isFavorite(targetIdForFav, 'poi');
                                    
                                    return (
                                    <div 
                                        key={spot.id}
                                        onClick={() => onPoiClick(spot)}
                                        className="bg-white dark:bg-gray-800 rounded-xl p-2 shadow-sm border border-slate-300 dark:border-slate-500 flex gap-2 active:scale-[0.99] transition-transform cursor-pointer relative"
                                    >
                                        {/* Index Badge */}
                                        <div className="absolute -left-1 -top-1 w-5 h-5 bg-white text-gray-700 border border-gray-300 rounded-full flex items-center justify-center text-xs font-semibold shadow-sm z-20">
                                            {index + 1}
                                        </div>

                                        <button 
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                if (!user) {
                                                    toast.error('로그인이 필요합니다.', {
                                                        style: {
                                                            borderRadius: '10px',
                                                            background: '#333',
                                                            color: '#fff',
                                                        },
                                                    });
                                                    return;
                                                }
                                                try {
                                                    const payload = {
                                                        id: targetIdForFav,
                                                        name: spot.name,
                                                        type: 'poi', // Force 'poi' to prevent type pollution
                                                        address: spot.address,
                                                        location: spot.location,
                                                        imageUrl: spot.photos?.[0]?.url || `https://picsum.photos/seed/${targetIdForFav}/300/200`
                                                    };
                                                    console.log("👉 1. Clicked (CityDrawer)! Ready to send Payload:", payload);
                                                    await toggleFavorite(payload);
                                                    if (isFav) {
                                                        toast.success('즐겨찾기에서 제거되었습니다.', {
                                                            style: {
                                                                borderRadius: '10px',
                                                                background: '#333',
                                                                color: '#fff',
                                                            },
                                                        });
                                                    } else {
                                                        toast.success('즐겨찾기에 추가되었습니다.', {
                                                            style: {
                                                                borderRadius: '10px',
                                                                background: '#333',
                                                                color: '#fff',
                                                            },
                                                        });
                                                    }
                                                } catch (err) {
                                                    // Error is handled in context
                                                }
                                            }}
                                            className="absolute top-2 right-2 p-1 bg-white/80 dark:bg-black/20 backdrop-blur-sm rounded-full hover:bg-red-50 transition-colors z-10"
                                        >
                                            <Icons.Heart size={14} className={isFav ? "text-red-500 fill-red-500" : "text-gray-400"} />
                                        </button>

                                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden shrink-0">
                                            {spot.photos?.[0] ? (
                                                <img 
                                                    src={spot.photos[0].url} 
                                                    alt={spot.name} 
                                                    className="w-full h-full object-cover" 
                                                    loading="lazy"
                                                    decoding="async"
                                                    width={64}
                                                    height={64}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <MapPin size={20} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-center py-0">
                                            <div>
                                                <h3 className="font-bold text-gray-900 dark:text-white truncate text-lg mb-0.5 pr-6">{spot.name}</h3>
                                                {/* <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 leading-relaxed mb-0.5">{spot.address || t('cityDrawer.noAddress')}</p> */}
                                                {spot.intro && <div className="text-xs text-gray-400 dark:text-gray-500 line-clamp-2 leading-tight" dangerouslySetInnerHTML={{ __html: spot.intro }} />}
                                            </div>
                                        </div>
                                    </div>
                                )});
                            })()}
                        </div>
                    )}
                </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SearchIcon() {
    return (
        <svg
            className="w-12 h-12 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
        </svg>
    );
}
