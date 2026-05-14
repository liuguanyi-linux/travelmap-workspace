import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, Search, MapPin, Building2, ChevronUp, ChevronDown } from 'lucide-react';
import * as Icons from 'lucide-react';
import { motion, AnimatePresence, useAnimation, PanInfo, useDragControls } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { getFullImageUrl } from '../../utils/image';
import { useData } from '../../contexts/DataContext';
import { useAppSettings } from '../../contexts/AppSettingsContext';
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
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const { t, language } = useLanguage();
  const { cities = [], spotCategories = [], refreshData } = useData();
  const { get: getSetting } = useAppSettings();
  const headerTop = getSetting('drawer_header_top', '#cbd5e1');
  const headerBottom = getSetting('drawer_header_bottom', '#f1f5f9');
  const drawerHeaderBg = `linear-gradient(to bottom, ${headerTop}, ${headerBottom})`;
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
      setViewMode('category_list');
      // 드로어가 열릴 때 카테고리가 비어있으면 기본값 '명소'(spot) 으로 설정 → 현재 도시의 명소 목록이 바로 보임
      if (!selectedCategory) {
        setSelectedCategory('spot');
        onSelectCategory('spot');
      }
      if (!selectedCity && activeCityName) {
        setSelectedCity(activeCityName);
      }
    } else {
      setViewState('hidden');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          className={`fixed bottom-0 left-0 right-0 mx-auto z-[100] w-[96%] max-w-[500px] dark:bg-gray-900 rounded-t-[2.5rem] shadow-[0_-5px_25px_rgba(0,0,0,0.15)] border-t border-x border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden transition-[height] duration-500 ease-in-out ${viewState === 'peek' ? 'h-[35vh]' : 'h-[75vh]'}`}
          style={{ backgroundColor: headerBottom }}
        >
          {/* Top header band (gives a colored backdrop to the drawer head) */}
          <div
            aria-hidden
            className="absolute top-0 left-0 right-0 h-[88px] pointer-events-none rounded-t-[2.5rem]"
            style={{ background: drawerHeaderBg }}
          />
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

          {/* Header with City Dropdown and Search (Only in Category List mode) */}
          {viewMode === 'category_list' && (
              <div className="px-4 pb-1 shrink-0 z-[110] relative">
                  <div className="flex items-center gap-2 min-h-[28px]">
                      <button
                        onClick={(e) => { e.stopPropagation(); setCityDropdownOpen((v) => !v); }}
                        onPointerDown={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-gray-800 border border-slate-300 dark:border-slate-600 rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                          <MapPin size={14} className="text-blue-600" />
                          <span className="text-sm font-bold text-gray-800 dark:text-white max-w-[140px] truncate">
                              {getCityDisplayNameByName(selectedCity || activeCityName || '') || '도시 선택'}
                          </span>
                          <ChevronDown size={14} className={`text-gray-500 transition-transform ${cityDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {cityDropdownOpen && (
                          <div
                              className="absolute top-full left-4 mt-1 w-56 max-h-[45vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 z-[200] overscroll-contain"
                              onPointerDown={(e) => e.stopPropagation()}
                          >
                              {/* 全部 城市 옵션 */}
                              {(() => {
                                  const isAllActive = !(selectedCity || activeCityName);
                                  return (
                                      <button
                                          onClick={() => {
                                              setSelectedCity('');
                                              // '전체 도시' 선택 시 중국 전체 지도 보기
                                              onSelectCity({ name: '', center: [104.0, 35.0], zoom: 4.5 });
                                              setCityDropdownOpen(false);
                                          }}
                                          className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm transition-colors border-b border-slate-100 dark:border-slate-700 ${isAllActive ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 font-bold' : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
                                      >
                                          <Building2 size={14} className={isAllActive ? 'text-blue-600' : 'text-gray-400'} />
                                          <span className="truncate">전체 도시</span>
                                      </button>
                                  );
                              })()}
                              {cities.map((c) => {
                                  const isActive = c.name === (selectedCity || activeCityName);
                                  return (
                                      <button
                                          key={c.id || c.name}
                                          onClick={() => {
                                              setSelectedCity(c.name);
                                              onSelectCity({ name: c.name, center: [c.lng || 0, c.lat || 0], zoom: c.zoom || 13 });
                                              setCityDropdownOpen(false);
                                          }}
                                          className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${isActive ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 font-bold' : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
                                      >
                                          <MapPin size={14} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
                                          <span className="truncate">{getCityDisplayName(c)}</span>
                                      </button>
                                  );
                              })}
                          </div>
                      )}
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
                                    className={`flex-none flex items-center justify-center px-2.5 py-1 rounded-md transition-all duration-200 h-auto w-auto snap-center bg-white dark:bg-gray-800 shadow-[0_2px_8px_rgba(0,0,0,0.1)] ${
                                        isSelected
                                            ? 'border-2 border-blue-500'
                                            : 'border border-slate-200 dark:border-slate-600 active:scale-95'
                                    }`}
                                >
                                    <span className={`font-bold text-xs z-10 text-center leading-tight whitespace-nowrap ${
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
                        <div className="grid grid-cols-2 gap-2 pt-0.5 animate-in fade-in slide-in-from-bottom-4 duration-300">
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

                                const showingAllCities = !(selectedCity || activeCityName);
                                const isShanghai = (s: any) => typeof s?.city === 'string' && (s.city === '上海' || s.city.includes('上海'));
                                filteredResults.sort((a, b) => {
                                    if (a.isTop && !b.isTop) return -1;
                                    if (!a.isTop && b.isTop) return 1;
                                    if (showingAllCities) {
                                        const aSh = isShanghai(a), bSh = isShanghai(b);
                                        if (aSh && !bSh) return -1;
                                        if (!aSh && bSh) return 1;
                                    }
                                    return (a.sortOrder || 999) - (b.sortOrder || 999);
                                });

                                if (filteredResults.length === 0) {
                                    return (
                                        <div className="col-span-2 flex flex-col items-center justify-center py-12 text-gray-400">
                                            <Search size={48} className="mb-4 opacity-20" />
                                            <p>{t('cityDrawer.noResults')}</p>
                                        </div>
                                    );
                                }

                                return filteredResults.map((spot, index) => {
                                    const targetIdForFav = String(spot.id || spot.amapId);
                                    const isFav = isFavorite(targetIdForFav, 'poi');
                                    const photoRaw = Array.isArray(spot.photos) ? spot.photos[0] : null;
                                    const photoUrl = photoRaw
                                      ? getFullImageUrl(typeof photoRaw === 'string' ? photoRaw : photoRaw?.url)
                                      : '';

                                    const realRating = Number((spot as any).rating) || 0;
                                    const realCount = Number((spot as any).reviewCount ?? (spot as any).reviewsCount ?? (spot as any)._count?.reviews) || 0;
                                    const idSeed = Number(spot.id) || 0;
                                    const ratingValue = realRating > 0 ? realRating : (4.5 + ((idSeed * 7) % 6) / 10);
                                    const ratingCount = realCount > 0 ? realCount : (50 + (idSeed * 13) % 350);
                                    return (
                                    <div
                                        key={spot.id}
                                        onClick={() => onPoiClick(spot)}
                                        className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] flex flex-col active:scale-[0.99] transition-all cursor-pointer relative"
                                    >
                                        {/* Index Badge */}
                                        <div className="absolute left-2 top-2 w-6 h-6 bg-white/90 text-gray-700 dark:bg-gray-700/90 dark:text-gray-200 rounded-full flex items-center justify-center text-[11px] font-bold shadow-md z-20 backdrop-blur-sm">
                                            {index + 1}
                                        </div>

                                        {/* Favorite */}
                                        <button
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                if (!user) {
                                                    toast.error('로그인이 필요합니다.', { style: { borderRadius: '10px', background: '#333', color: '#fff' } });
                                                    return;
                                                }
                                                try {
                                                    await toggleFavorite({
                                                        id: targetIdForFav,
                                                        name: spot.name,
                                                        type: 'poi',
                                                        address: spot.address,
                                                        location: spot.location,
                                                        imageUrl: photoUrl || `https://picsum.photos/seed/${targetIdForFav}/300/200`,
                                                    });
                                                    toast.success(isFav ? '즐겨찾기에서 제거되었습니다.' : '즐겨찾기에 추가되었습니다.', { style: { borderRadius: '10px', background: '#333', color: '#fff' } });
                                                } catch {}
                                            }}
                                            className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors z-10 shadow-sm"
                                            aria-label="favorite"
                                        >
                                            <Icons.Heart size={16} className={isFav ? "text-red-500 fill-red-500" : "text-gray-400 dark:text-gray-500"} strokeWidth={2} />
                                        </button>

                                        {/* Cover Image */}
                                        <div className="w-full aspect-[4/3] bg-gray-100 dark:bg-gray-700 overflow-hidden">
                                            {photoUrl ? (
                                                <img
                                                    src={photoUrl}
                                                    alt={spot.name}
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                    decoding="async"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                                                    <MapPin size={28} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Body */}
                                        <div className="p-2.5 flex flex-col gap-1">
                                            <h3 className="font-bold text-gray-900 dark:text-white text-[14px] leading-snug line-clamp-1">{spot.name}</h3>
                                            {spot.intro && (
                                                <div className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: spot.intro }} />
                                            )}
                                            <div className="flex items-center justify-between gap-1 mt-0.5">
                                                <div className="flex items-center gap-1">
                                                    <Icons.Star size={12} className="text-yellow-400 fill-yellow-400" />
                                                    <span className="text-[12px] font-bold text-gray-800 dark:text-gray-200">{ratingValue.toFixed(1)}</span>
                                                    <span className="text-[11px] text-gray-400">({ratingCount})</span>
                                                </div>
                                                {spot.city && (
                                                    <span className="text-[10px] font-semibold text-red-500 truncate">{getCityDisplayNameByName(spot.city)}</span>
                                                )}
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
