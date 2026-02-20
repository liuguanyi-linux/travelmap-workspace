import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, Search, MapPin, ArrowRight, Building2 } from 'lucide-react';
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

export default function CityDrawer({ isVisible, onSelectCategory, onSelectCity, searchResults, onPoiClick, onClose, onSearch }: CityDrawerProps) {
  const [level, setLevel] = useState<ViewLevel>('cities');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const { t } = useLanguage();
  const { cities = [], spotCategories = [] } = useData();
  
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

  // Use dynamic categories from DataContext
  const categories = (spotCategories || [])
    .filter(cat => cat && cat.key && cat.name) // Filter invalid categories
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    .map(cat => {
      let IconComponent = MapPin;
      try {
        if (cat.icon && (Icons as any)[cat.icon]) {
            IconComponent = (Icons as any)[cat.icon];
        }
      } catch (e) {
        console.warn('Icon load failed for', cat.icon);
      }
      
      return {
        id: cat.key,
        label: cat.name,
        icon: IconComponent,
        color: cat.key === 'spot' ? 'text-green-600 bg-green-50' :
               cat.key === 'accommodation' ? 'text-blue-600 bg-blue-50' :
               cat.key === 'dining' ? 'text-orange-600 bg-orange-50' :
               cat.key === 'shopping' ? 'text-pink-600 bg-pink-50' :
               cat.key === 'transport' ? 'text-indigo-600 bg-indigo-50' :
               'text-gray-600 bg-gray-50'
      };
    });

  // Ensure cities is an array and filter invalid entries
  const cityList = (Array.isArray(cities) ? cities : [])
    .filter(city => city && city.name);

  useEffect(() => {
    console.log('[CityDrawer] Mounted. isVisible:', isVisible, 'Cities:', cityList.length, 'Categories:', categories.length);
  }, [isVisible, cityList.length, categories.length]);

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
      // Dragging up - ensure it snaps back to 0 (visible)
      controls.start({ y: 0 });
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          initial={{ y: '100%' }}
          animate={controls}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 250, mass: 0.8 }}
          drag="y"
          dragControls={dragControls}
          dragListener={false}
          dragConstraints={{ top: 0 }}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
          className="fixed bottom-0 left-0 right-0 z-[60] bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-t-[2.5rem] shadow-[0_-10px_60px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col transition-colors duration-300 will-change-transform"
          style={{ height: level === 'list' ? '85vh' : 'auto', maxHeight: '85vh' }}
        >
          {/* Drag Handle */}
          <div 
            className="w-full flex justify-center pt-3 pb-3 cursor-pointer z-10 touch-none shrink-0" 
            onPointerDown={(e) => dragControls.start(e)}
          >
            <div className="w-12 h-1.5 bg-gray-200/80 dark:bg-gray-700/80 rounded-full" />
          </div>

          {/* Close Button */}
          <button 
            onClick={onClose}
            onPointerDown={(e) => e.stopPropagation()}
            className="absolute top-4 right-4 p-2 bg-black/5 dark:bg-white/10 rounded-full text-gray-500 dark:text-gray-400 z-50 hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
          >
            <X size={20} />
          </button>

          {/* Header with Back Button */}
          {level !== 'cities' && (
              <div 
                className="px-6 pb-2 flex items-center gap-2 shrink-0 touch-none"
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
                      {level === 'categories' ? selectedCity : spotCategories.find(c => c.key === selectedCategory)?.name || selectedCategory}
                  </span>
              </div>
          )}
          
          {/* Content Area */}
          <div className={`flex-1 overflow-y-auto overflow-x-hidden px-4 ${level === 'list' ? 'pb-24' : 'pb-5'}`}>
            
            {/* Level 1: City List */}
            {level === 'cities' && (
                <div className="space-y-4 pt-2">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white px-1">{t('city.select')}</h2>
                    <div className="flex overflow-x-auto gap-3 px-2 pb-4 snap-x snap-mandatory scrollbar-hide -mx-2">
                        {cityList.map((city, index) => (
                            <button
                                key={city.name || index}
                                onClick={() => handleCityClick(city)}
                                className="flex-none w-28 flex flex-col items-center justify-center p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm active:scale-95 transition-transform h-24 snap-center"
                            >
                                <div className="p-2 rounded-full bg-gray-50 dark:bg-gray-700 mb-2 text-gray-400 dark:text-gray-300">
                                    <Building2 size={24} />
                                </div>
                                <span className="font-bold text-gray-800 dark:text-white text-sm z-10 text-center leading-tight w-full truncate">{city.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Level 2: Categories */}
            {level === 'categories' && (
                <div className="space-y-4 pt-3">
                    <div className="flex overflow-x-auto gap-3 px-2 pb-4 snap-x snap-mandatory scrollbar-hide -mx-2">
                        {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => handleCategoryClick(cat.id)}
                            className="flex-none w-24 flex flex-col items-center justify-center p-2 rounded-xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-100 dark:border-gray-700 shadow-sm active:scale-95 transition-transform h-24 snap-center"
                        >
                            <div className={`p-2.5 rounded-xl ${cat.color} dark:bg-opacity-20 mb-1.5 flex items-center justify-center`}>
                                <cat.icon size={22} />
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
                    {['attraction', 'hotel', 'food', 'shopping'].includes(selectedCategory) && (
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
                                    selectedCategory === 'attraction' ? "搜索当前城市的景点..." :
                                    selectedCategory === 'hotel' ? "搜索当前城市的酒店..." :
                                    selectedCategory === 'shopping' ? "搜索当前城市的购物场所..." :
                                    "搜索当前城市的美食..."
                                }
                                className="w-full bg-gray-100 dark:bg-gray-800 rounded-xl py-3 pl-10 pr-4 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            />
                            <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
                        </div>
                    )}

                    {searchResults && searchResults.length > 0 ? (
                        searchResults.map((item, index) => (
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
                                        <p className="text-sm text-gray-500 line-clamp-2 mt-1">{item.address || '暂无地址信息'}</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-orange-500 font-medium">
                                        <span>★ {item.biz_ext?.rating || '4.5'}</span>
                                        <span className="text-gray-300">|</span>
                                        <span className="text-gray-400">{item.type || '地点'}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                            <SearchIcon />
                            <p className="mt-2 text-sm">{t('cityDrawer.noPlaces')}</p>
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
