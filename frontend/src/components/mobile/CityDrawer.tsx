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

export default function CityDrawer({ isVisible, onSelectCategory, onSelectCity, searchResults, onPoiClick, onClose, onSearch }: CityDrawerProps) {
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
      
      // Defer map movement to prevent UI blocking
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
    setSelectedCategory(category);
    setSearchKeyword('');
    
    setTimeout(() => {
        onSelectCategory(category);
    }, 50);
    
    setLevel('list');
    controls.start({ y: 0 });
  };

  const handleBack = () => {
    if (level === 'list') {
        setLevel('categories');
        setSelectedCategory('');
        onSelectCategory('');
        controls.start({ y: 0 });
    } else if (level === 'categories') {
        setLevel('cities');
        setSelectedCity('');
        controls.start({ y: 0 });
    }
  };
  
  const handleDragEnd = (event: any, info: PanInfo) => {
    const { offset, velocity } = info;
    const isDraggingDown = offset.y > 0;
    const isFast = Math.abs(velocity.y) > 500;

    if (isDraggingDown) {
      if (level === 'list') {
         // If dragging down in list view, minimize to initial height first, then close/back
         // But user wants to minimize to see map. 
         // Let's say if we are at full height, drag down goes to initial height.
         // If at initial height, drag down goes back to categories.
         
         // Current logic:
         if (offset.y > 100 || isFast) {
             handleBack();
         } else {
             controls.start({ y: 0 });
         }
      } else {
         // In compact menu mode, drag down closes the drawer
         if (offset.y > 50 || isFast) {
            if (onClose) onClose();
            else controls.start({ y: '100%' });
         } else {
             controls.start({ y: 0 });
         }
      }
    } else {
      // Dragging up
      // If in list view and at initial height, expand to full height
      if (level === 'list') {
          // Logic handled by Framer Motion constraints mostly, 
          // but we can snap to full height here if needed.
          // For now, let's keep simple snap back to 0 (which will be defined by style height)
      }
      controls.start({ y: 0 });
    }
  };

  // Determine height based on level
  // list level: initial height small (e.g. 40vh), expandable to 85vh?
  // User wants "popup bottom a little bit" for list view.
  // We use Framer Motion variants for height control to avoid CSS transition conflicts.
  
  const [drawerMode, setDrawerMode] = useState<'initial' | 'full'>('initial');
  
  // Reset height when entering list view
  useEffect(() => {
      if (level === 'list') {
          setDrawerMode('initial');
      } else {
          setDrawerMode('full'); // Cities and Categories always full/auto
      }
  }, [level]);

  // Calculate y-offset based on mode
  // full: 0
  // initial (list only): leave VERY little visible. Just enough for one row.
  const drawerVariants: any = {
      hidden: { y: '100%' },
      visible: { 
          // Use calc to ensure consistent "peek" height regardless of screen size
          // 130px covers header + search bar or header + top of list
          y: level === 'list' && drawerMode === 'initial' ? 'calc(100% - 130px)' : 0,
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
              if (level === 'list') {
                  if (drawerMode === 'initial') {
                      if (offset.y < -50 || velocity.y < -300) {
                          setDrawerMode('full');
                      }
                  } else {
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
              height: level === 'list' ? '85vh' : 'auto',
              maxHeight: '85vh' 
          }}
        >
            {/* Transparent Drag Overlay - Crucial for initial mode drag interaction */}
            {level === 'list' && drawerMode === 'initial' && (
                <div 
                    className="absolute inset-0 z-[100]" 
                    style={{ touchAction: 'none' }}
                    onPointerDown={(e) => {
                        // Directly capture pointer down for drag
                        dragControls.start(e);
                    }}
                />
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
            className={`flex-1 overflow-y-auto overflow-x-hidden px-4 ${level === 'list' ? 'pb-24' : 'pb-12'}`}
            style={{ 
                overscrollBehavior: 'contain', 
                touchAction: level === 'list' && drawerMode === 'initial' ? 'none' : 'pan-y',
            }}
            onPointerDown={(e) => {
                // If in initial mode, we want the PARENT's onPointerDown to handle drag (which calls dragControls.start)
                // So we do NOT stop propagation here if mode is initial.
                if (level === 'list' && drawerMode === 'initial') {
                    // Do nothing, let it bubble to parent
                } else {
                    e.stopPropagation(); // Stop propagation
                }
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

            {/* Level 2: Categories */}
            {level === 'categories' && (
                <div className="space-y-4 pt-3 pb-2"> {/* Added pb-2 to ensure tightness */}
                    <div className="flex overflow-x-auto gap-3 px-2 pb-2 snap-x snap-mandatory scrollbar-hide -mx-2">
                        {finalCategories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => handleCategoryClick(cat.id)}
                            className="flex-none w-24 flex flex-col items-center justify-center p-2 rounded-xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-100 dark:border-gray-700 shadow-sm active:scale-95 transition-transform h-24 snap-center"
                        >
                            <div className={`p-2.5 rounded-xl ${cat.color} dark:bg-opacity-20 mb-1.5 flex items-center justify-center`}>
                                <CategoryIcon icon={cat.iconName} name={cat.label} size={22} />
                            </div>
                            <span className="font-bold text-gray-800 dark:text-white text-[10px] z-10 text-center leading-tight w-full truncate">{cat.label}</span>
                        </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Level 3: List */}
            {level === 'list' && (
                <div className="space-y-4 pt-2">
                    {['attraction', 'hotel', 'food', 'shopping', 'transport'].includes(selectedCategory) && (
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
                                        // If empty, maybe reset to category search?
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
                    )}

                    {(() => {
                        // Strict client-side filtering to prevent content mix-up
                        // We must check 'tags' array or 'type' string as 'category' field does not exist on Spot type
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

                            // If selectedCategory is 'transport', allow transport/train/etc.
                            if (selectedCategory === 'transport') {
                                return hasTag('transport') || hasTag('high_speed_rail') || hasTag('airport') || hasTag('train') || hasTag('station');
                            }
                            
                            // If selectedCategory is 'spot', allow 'spot' or 'attraction'
                            if (selectedCategory === 'spot') {
                                return hasTag('spot') || hasTag('attraction');
                            }

                            // If selectedCategory is 'attraction', allow 'spot' or 'attraction'
                            if (selectedCategory === 'attraction') {
                                return hasTag('spot') || hasTag('attraction');
                            }

                            // Otherwise strict match
                            return hasTag(selectedCategory);
                        });

                        return filteredResults.length > 0 ? (
                            filteredResults.map((item, index) => (
                                <div 
                                    key={item.id || index} 
                                    onClick={() => onPoiClick(item)}
                                    className="flex gap-4 p-4 bg-white rounded-[1.5rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] active:scale-95 transition-transform cursor-pointer mb-3"
                                >
                                    <div className="w-24 h-24 bg-gray-100 rounded-2xl shrink-0 overflow-hidden shadow-inner">
                                        {item.photos && item.photos[0] ? (
                                            <img src={item.photos[0].url} alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                <MapPin size={24} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between py-1">
                                        <div>
                                            <h3 className="font-bold text-gray-800 line-clamp-1">{index + 1}、{item.name}</h3>
                                            <p className="text-sm text-gray-500 line-clamp-2 mt-1">{item.address || t('cityDrawer.noAddress')}</p>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-orange-500 font-medium">
                                            <span>★ {item.biz_ext?.rating || '4.5'}</span>
                                            <span className="text-gray-300">|</span>
                                            <span className="text-gray-400">{item.type || t('cityDrawer.place')}</span>
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
