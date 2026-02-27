import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, Search, MapPin, Building2 } from 'lucide-react';
import * as Icons from 'lucide-react';
import { motion, AnimatePresence, useAnimation, PanInfo, useDragControls } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useData } from '../../contexts/DataContext';

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
  const [level, setLevel] = useState<ViewLevel>('cities');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const { t, language } = useLanguage();
  const { cities = [], spotCategories = [], refreshData } = useData();
  
  const getCityDisplayName = (city: City | undefined) => {
    if (!city) return '';
    if (language === 'en-US' && city.nameEn) return city.nameEn;
    if (language === 'ko-KR' && city.nameKo) return city.nameKo;
    return city.name;
  };

  const getCityDisplayNameByName = (cityName: string) => {
      const city = cities.find(c => c.name === cityName);
      return city ? getCityDisplayName(city) : cityName;
  };
  
  const controls = useAnimation();
  const dragControls = useDragControls();

  // Reset view and position when drawer closes/opens
  useEffect(() => {
    if (isVisible) {
      controls.start({ y: 0 });
    } else {
      controls.start({ y: '100%' });
    }
  }, [isVisible, controls]);

  // Ensure categories filter logic is robust
  const categories = (spotCategories || [])
    .filter(cat => cat && cat.key && cat.name) // Filter invalid categories
    .filter(cat => !['transport', 'airport', 'high_speed_rail', 'high-speed-rail', 'train'].includes(cat.key)) // Exclude separate transport categories
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    .map(cat => {
      // ... existing map logic
      // Try to find translation for the category key
      // First check if direct translation exists for the key
      const translationKey = `categories.${cat.key}`;
      const translatedLabel = t(translationKey);
      
      const label = translatedLabel !== translationKey ? translatedLabel : cat.name;

      return {
        id: cat.key,
        label: label,
        iconName: cat.icon,
        color: cat.key === 'spot' ? 'text-green-600 bg-green-50' :
               cat.key === 'accommodation' ? 'text-blue-600 bg-blue-50' :
               cat.key === 'dining' ? 'text-orange-600 bg-orange-50' :
               cat.key === 'shopping' ? 'text-pink-600 bg-pink-50' :
               'text-gray-600 bg-gray-50'
      };
    });
  
  // Hard-coded check: If 'transport' is NOT present, add it.
  // We use a flag to track if we added it.
  // Also force remove 'high_speed_rail' and 'airport' and any variations if they somehow sneaked in
  const finalCategories = categories.filter(c => 
      !['high_speed_rail', 'airport', 'high-speed-rail', 'train', 'station'].includes(c.id) &&
      !c.label.includes('高铁') && // Extra safety check for Chinese label
      !c.label.includes('High Speed Rail') // Extra safety check for English label
  );
  
  let hasTransport = finalCategories.some(c => c.id === 'transport');
  
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
        // If visible but no data, try to refresh after a short delay
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
    console.log('[CityDrawer] Mounted. isVisible:', isVisible, 'Cities:', cityList.length, 'Categories:', categories.length);
    if (isVisible) {
        refreshData();
    }
  }, [isVisible]);

  const handleCityClick = (city: City) => {
      if (!city || !city.name) return;
      console.log('[CityDrawer] City clicked:', city.name);
      
      setSelectedCity(city.name);
      setLevel('categories');
      
      requestAnimationFrame(() => {
          try {
            onSelectCity({ name: city.name, center: [city.lng || 0, city.lat || 0], zoom: city.zoom || 12 });
          } catch (e) {
            console.error('Map update failed', e);
          }
      });
      
      controls.start({ y: 0 });
  };

  const handleCategoryClick = (category: string) => {
    // Toggle off if clicking the same category
    if (selectedCategory === category) {
        setSelectedCategory('');
        setSearchKeyword('');
        onSelectCategory(''); // Clear filter
        return;
    }
    
    setSelectedCategory(category);
    setSearchKeyword('');
    
    // Notify parent to filter data
    onSelectCategory(category);
    
    // Ensure drawer is open/expanded
    controls.start({ y: 0 });
  };

  const handleBack = () => {
    if (level === 'list') {
        // Fallback for any legacy state
        setLevel('categories');
        setSelectedCategory('');
        onSelectCategory('');
        controls.start({ y: 0 });
    } else if (level === 'categories') {
        // If we have a selected category, should back clear it or go to cities?
        // User wants "integration", so "Back" likely means "Leave City View".
        setLevel('cities');
        setSelectedCity('');
        setSelectedCategory(''); // Also clear category
        onSelectCategory('');
        controls.start({ y: 0 });
    }
  };
  
  const handleDragEnd = (event: any, info: PanInfo) => {
    const { offset, velocity } = info;
    const isDraggingDown = offset.y > 0;
    const isFast = Math.abs(velocity.y) > 500;

    if (isDraggingDown) {
      if (level === 'categories' || level === 'cities') {
          if (drawerMode === 'full') {
              // If at full height, drag down goes to initial (peek) height
              if (offset.y > 100 || isFast) {
                  setDrawerMode('initial');
              } else {
                  controls.start({ y: 0 });
              }
          } else {
              // If at initial height, drag down closes drawer (or goes back)
              if (offset.y > 50 || isFast) {
                  if (level === 'categories') {
                      handleBack(); // Go back to cities
                  } else {
                      if (onClose) onClose(); // Close drawer
                      else controls.start({ y: '100%' });
                  }
              } else {
                  // Snap back to peek position
                  // Framer motion variants will handle this based on state
              }
          }
      } else {
         // Other levels?
         controls.start({ y: 0 });
      }
    } else {
      // Dragging up
      controls.start({ y: 0 });
    }
  };

  // Determine height based on level
  // list level: initial height small (e.g. 40vh), expandable to 85vh?
  // User wants "popup bottom a little bit" for list view.
  // We use Framer Motion variants for height control to avoid CSS transition conflicts.
  
  const [drawerMode, setDrawerMode] = useState<'initial' | 'full'>('initial');
  
  // Reset height when entering levels
  useEffect(() => {
      if (level === 'categories' || level === 'cities') {
          // Both levels start at initial (low) height
          setDrawerMode('initial');
      } else {
          setDrawerMode('full');
      }
  }, [level]);

  // Calculate y-offset based on mode
  // full: 0
  // initial (categories/cities): Push down to show only header + icons (~180px visible)
  const drawerVariants: any = {
      hidden: { y: '100%' },
      visible: { 
          y: (level === 'categories' || level === 'cities') && drawerMode === 'initial' ? 'calc(100% - 180px)' : 0,
          transition: { type: 'spring', damping: 25, stiffness: 200 }
      }
  };

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={drawerVariants}
          drag="y"
          dragControls={dragControls}
          dragListener={false}
          // Prevent dragging up past the top (negative y) which causes detachment
          // Allow dragging down (positive y) to dismiss or collapse
          dragConstraints={{ top: 0 }} 
          dragElastic={0.2}
          onDragEnd={(event, info) => {
              const { offset, velocity } = info;
              if (level === 'categories' || level === 'cities') {
                  if (drawerMode === 'initial') {
                      // Drag UP to expand
                      if (offset.y < -50 || velocity.y < -300) {
                          setDrawerMode('full');
                      }
                  } else {
                      // Drag DOWN to collapse
                      if (offset.y > 50 || velocity.y > 300) {
                          setDrawerMode('initial');
                      }
                  }
              } else {
                  handleDragEnd(event, info);
              }
          }}
          className="fixed bottom-0 left-0 right-0 z-[60] bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-t-[2.5rem] shadow-[0_-10px_60px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col will-change-transform"
          style={{ 
              height: '85vh', // Fixed max height for consistency
              maxHeight: '85vh'
          }}
        >
            {/* Transparent Drag Overlay for initial mode - WITH pointer-events-none for content */}
            {(level === 'categories' || level === 'cities') && drawerMode === 'initial' && (
                <div 
                    className="absolute inset-0 z-[100]" 
                    style={{ touchAction: 'none', pointerEvents: 'none' }} 
                >
                     {/* 
                        We need a way to allow clicks on buttons but drag on empty space.
                        Actually, if we put a full overlay, it blocks clicks.
                        If we remove it, dragging on buttons might trigger click.
                        
                        Solution:
                        1. Remove this overlay.
                        2. Use dragControls on a specific handle area (already done).
                        3. But user wants to drag from anywhere?
                        
                        If user wants to click buttons when collapsed, we MUST allow pointer events.
                        If we allow pointer events, dragging on a button will trigger click unless we distinguish.
                        
                        Framer Motion's `dragListener={false}` on the parent div + `dragControls` 
                        means drag only starts when controls.start(e) is called.
                        
                        Currently, we call controls.start(e) on:
                        - Drag Handle
                        - Header
                        - Content Area (onPointerDown)
                        
                        If we want buttons to be clickable, we should STOP propagation on buttons.
                        I already added `e.stopPropagation()` on buttons like Close and Back.
                        
                        The issue is the "Transparent Drag Overlay" above was blocking EVERYTHING.
                        I will remove it completely and rely on the Content Area's onPointerDown logic.
                     */}
                </div>
            )}

          {/* Drag Handle */}
          <div 
            className="w-full flex justify-center pt-3 pb-3 cursor-pointer z-10 touch-none shrink-0" 
            onPointerDown={(e) => dragControls.start(e)}
          >
            <div className="w-12 h-1.5 bg-gray-200/80 dark:bg-gray-700/80 rounded-full" />
          </div>

          {/* Close Button - Always visible */}
          <div className="absolute top-4 right-4 z-[120] pointer-events-auto">
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    console.log('[CityDrawer] Close clicked');
                    if (onClose) onClose();
                }}
                onPointerDown={(e) => e.stopPropagation()}
                className="p-2 bg-black/5 dark:bg-white/10 rounded-full text-gray-500 dark:text-gray-400 hover:bg-black/10 dark:hover:bg-white/20 transition-colors cursor-pointer active:scale-95"
            >
                <X size={20} />
            </button>
          </div>

          {/* Header with Back Button */}
          {level !== 'cities' && (
              <div 
                className="px-6 pb-2 flex items-center gap-2 shrink-0 touch-none z-[110] relative"
                onPointerDown={(e) => dragControls.start(e)}
              >
                  <button 
                    onClick={handleBack}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="p-1.5 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 active:bg-black/10 dark:active:bg-white/10 transition-colors"
                  >
                      <ChevronLeft size={24} className="text-gray-600 dark:text-gray-300" />
                  </button>
                  <span className="text-lg font-bold text-gray-800 dark:text-white">
                      {level === 'categories' ? getCityDisplayNameByName(selectedCity) : spotCategories.find(c => c.key === selectedCategory)?.name || selectedCategory}
                  </span>
              </div>
          )}
          
          {/* Content Area */}
          <div 
            className={`flex-1 overflow-y-auto overflow-x-hidden px-4 ${level === 'categories' || level === 'cities' ? 'pb-24' : 'pb-12'}`}
            style={{ 
                overscrollBehavior: 'contain', 
                touchAction: 'pan-y',
            }}
            onPointerDown={(e) => {
                e.stopPropagation(); // Stop propagation to prevent accidental drag
            }} 
          >
            
            {/* Level 1: City List - Horizontal Scroll */}
            {level === 'cities' && (
                <div className="pt-2 pb-2"> {/* Reduced padding bottom from 6 to 2 */}
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white px-1 mb-2">{t('city.select')}</h2>
                    
                    {cityList.length === 0 ? (
                        // ... existing loading state
                        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
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
                        <div className="flex overflow-x-auto gap-3 px-1 pb-2 snap-x snap-mandatory scrollbar-hide -mx-2">
                            {cityList.map((city, index) => (
                                <button
                                    key={city.name || index}
                                    onClick={() => handleCityClick(city)}
                                    className="flex-none flex flex-col items-center justify-center p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm active:scale-95 transition-transform h-24 w-24 snap-center"
                                >
                                    <div className="p-2 rounded-full bg-gray-50 dark:bg-gray-700 mb-2 text-gray-400 dark:text-gray-300">
                                        <Building2 size={24} />
                                    </div>
                                    <span className="font-bold text-gray-800 dark:text-white text-sm z-10 text-center leading-tight w-full truncate">{getCityDisplayName(city)}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Level 2: Categories + Inline List */}
            {level === 'categories' && (
                <div className="space-y-4 pt-3 pb-2">
                    {/* Category Grid */}
                    <div className="flex overflow-x-auto gap-3 px-2 pb-2 snap-x snap-mandatory scrollbar-hide -mx-2">
                        {finalCategories.map((cat) => {
                            const isSelected = selectedCategory === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => handleCategoryClick(cat.id)}
                                    className={`flex-none w-16 flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 h-16 snap-center ${
                                        isSelected 
                                            ? 'bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-500 shadow-md scale-105' 
                                            : 'bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-100 dark:border-gray-700 shadow-sm active:scale-95'
                                    }`}
                                >
                                    <div className={`p-1.5 rounded-xl ${cat.color} dark:bg-opacity-20 mb-1 flex items-center justify-center`}>
                                        <CategoryIcon icon={cat.iconName} name={cat.label} size={18} />
                                    </div>
                                    <span className={`font-bold text-[10px] z-10 text-center leading-tight w-full truncate ${
                                        isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-800 dark:text-white'
                                    }`}>
                                        {cat.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Inline List (Only if a category is selected) */}
                    {selectedCategory && (
                        <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            {/* Search Bar - Always visible for any selected category */}
                            <div className="relative mb-2">
                                <input
                                    type="text"
                                    value={searchKeyword}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setSearchKeyword(val);
                                        if (onSearch && val.trim()) {
                                            onSearch(val, selectedCategory);
                                        } else if (onSearch && val === '') {
                                            onSelectCategory(selectedCategory);
                                        }
                                    }}
                                    placeholder={
                                        selectedCategory === 'attraction' ? t('cityDrawer.searchPlaceholder.attraction') :
                                        selectedCategory === 'hotel' ? t('cityDrawer.searchPlaceholder.hotel') :
                                        selectedCategory === 'shopping' ? t('cityDrawer.searchPlaceholder.shopping') :
                                        selectedCategory === 'transport' ? '搜索高铁站/机场...' :
                                        t('cityDrawer.searchPlaceholder.food')
                                    }
                                    className="w-full bg-gray-100 dark:bg-gray-800 rounded-xl py-3 pl-10 pr-4 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                />
                                <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
                            </div>

                            {/* List Content */}
                            {(() => {
                                const filteredResults = (searchResults || []).filter(item => {
                                    if (!item) return false;
                                    
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
                                        return hasTag('transport') || hasTag('high_speed_rail') || hasTag('airport') || hasTag('train') || hasTag('station');
                                    }
                                    
                                    if (selectedCategory === 'spot') {
                                        return hasTag('spot') || hasTag('attraction');
                                    }

                                    if (selectedCategory === 'attraction') {
                                        return hasTag('spot') || hasTag('attraction');
                                    }

                                    return hasTag(selectedCategory);
                                });

                                return filteredResults.length > 0 ? (
                                    filteredResults.map((item, index) => (
                                        <div 
                                            key={item.id || index} 
                                            onClick={() => onPoiClick(item)}
                                            className="flex gap-4 p-4 bg-white dark:bg-gray-800 rounded-[1.5rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] active:scale-95 transition-transform cursor-pointer mb-3 border border-gray-100 dark:border-gray-700"
                                        >
                                            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-2xl shrink-0 overflow-hidden shadow-inner">
                                                {item.photos && item.photos[0] ? (
                                                    <img src={item.photos[0].url} alt={item.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-500">
                                                        <MapPin size={24} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 flex flex-col justify-between py-1">
                                                <div>
                                                    <h3 className="font-bold text-gray-800 dark:text-white line-clamp-1">{index + 1}、{item.name}</h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">{item.address || t('cityDrawer.noAddress')}</p>
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-orange-500 font-medium">
                                                    <span>★ {item.biz_ext?.rating || '4.5'}</span>
                                                    <span className="text-gray-300 dark:text-gray-600">|</span>
                                                    <span className="text-gray-400 dark:text-gray-500">{item.type || t('cityDrawer.place')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                        <SearchIcon />
                                        <p className="mt-2 text-sm">{t('cityDrawer.noPlaces')}</p>
                                    </div>
                                );
                            })()}
                        </div>
                    )}
                </div>
            )}

            {/* Level 3: List (Legacy - Removed/Hidden) */}
            {level === 'list' && (
                <div className="hidden">
                    {/* Kept empty div to satisfy React conditions if state somehow gets here, though it shouldn't */}
                </div>
            )}
            
            <div className="text-center text-[10px] text-gray-300 py-4 mt-auto">
                v20250222-3 | C:{cityList.length} | S:{spotCategories.length}
            </div>
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
