import React, { useState, useEffect } from 'react';
import { MapPin, Hotel, Utensils, ChevronLeft, Building2, ShoppingBag, X, Search } from 'lucide-react';
import { motion, AnimatePresence, useAnimation, PanInfo, useDragControls } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';

interface CityDrawerProps {
  isVisible: boolean;
  onSelectCategory: (category: string) => void;
  onSelectCity: (city: { name: string, center: [number, number], zoom: number }) => void;
  searchResults: any[]; // Pass search results to display in list
  onPoiClick: (poi: any) => void;
  onClose?: () => void;
  onSearch?: (keyword: string) => void;
}

// Level 1: Cities
// Level 2: Categories (Attractions, Hotels, Food) for selected city
// Level 3: POI List for selected category
type ViewLevel = 'cities' | 'categories' | 'list';

const CITIES = [
  { name: '上海', center: [121.473701, 31.230416] as [number, number], zoom: 9 },
  { name: '青岛', center: [120.38264, 36.067442] as [number, number], zoom: 10 },
  { name: '北京', center: [116.397428, 39.90923] as [number, number], zoom: 10 },
  { name: '广州', center: [113.264434, 23.129162] as [number, number], zoom: 10 },
];

export default function CityDrawer({ isVisible, onSelectCategory, onSelectCity, searchResults, onPoiClick, onClose, onSearch }: CityDrawerProps) {
  const [level, setLevel] = useState<ViewLevel>('cities');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const { t } = useLanguage();
  
  const controls = useAnimation();
  const dragControls = useDragControls();

  // Reset view and position when drawer closes/opens
  useEffect(() => {
    if (isVisible) {
      if (level === 'list') {
          controls.start({ y: 0 });
      } else {
          controls.start({ y: '55%' }); 
      }
    } else {
      controls.start({ y: '100%' });
      // Optionally reset state on close, but keeping state might be better UX?
      // For now, let's reset to initial state if it was fully closed
      if (!isVisible) {
          // delayed reset or just keep it? Let's keep it for now unless user explicitly closed it
      }
    }
  }, [isVisible, controls, level]);

  const categories = [
    { id: 'attraction', label: t('categories.attraction'), icon: MapPin, color: 'text-green-600 bg-green-50' },
    { id: 'hotel', label: t('categories.hotel'), icon: Hotel, color: 'text-blue-600 bg-blue-50' },
    { id: 'food', label: t('categories.food'), icon: Utensils, color: 'text-orange-600 bg-orange-50' },
    { id: 'shopping', label: t('categories.shopping'), icon: ShoppingBag, color: 'text-pink-600 bg-pink-50' },
  ];

  const handleCityClick = (city: typeof CITIES[0]) => {
      setSelectedCity(city.name);
      
      // 1. First set state to show category view
      setLevel('categories');
      
      // 2. Animate map smoothly (non-blocking)
      requestAnimationFrame(() => {
          onSelectCity(city);
      });
      
      // 3. Keep drawer at medium height
      controls.start({ y: '55%' });
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setSearchKeyword(''); // Reset search keyword
    
    // For shopping, we don't need to trigger search, just show the ad view (which is implemented in the list view condition below)
    if (category !== 'shopping') {
        // Trigger search asynchronously to avoid blocking UI animation
        setTimeout(() => {
            onSelectCategory(category);
        }, 50);
    }
    
    setLevel('list');
    controls.start({ y: 0 }); // Auto-expand to full height for list
  };

  const handleBack = () => {
    if (level === 'list') {
        setLevel('categories');
        setSelectedCategory('');
        onSelectCategory(''); // Clear filter
        controls.start({ y: '55%' }); // Return to medium height
    } else if (level === 'categories') {
        setLevel('cities');
        setSelectedCity('');
        // Maybe zoom out map? Or keep it? Keeping is fine.
        controls.start({ y: '55%' });
    }
  };
  
  const handleDragEnd = (event: any, info: PanInfo) => {
    const { offset, velocity } = info;
    const isDraggingDown = offset.y > 0;
    const isFast = Math.abs(velocity.y) > 500;

    if (isDraggingDown) {
      // Dragging down
      if (level === 'list') {
         if (offset.y > 100 || isFast) {
             // If in list view, dragging down goes back to categories (medium height)
             handleBack();
         } else {
             controls.start({ y: 0 }); // Revert to full
         }
      } else {
         // In cities or categories view (medium height)
         if (offset.y > 100 || isFast) {
            // Close drawer if onClose provided
            if (onClose) {
                onClose();
            } else {
                controls.start({ y: '55%' });
            }
         } else {
             controls.start({ y: '55%' });
         }
      }
    } else {
      // Dragging up
      if (offset.y < -50 || isFast) {
        controls.start({ y: 0 }); // Expand to full
      } else {
        // Revert
        controls.start({ y: level === 'list' ? 0 : '55%' });
      }
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          initial={{ y: '100%' }}
          animate={controls}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          drag="y"
          dragControls={dragControls}
          dragListener={false}
          dragConstraints={{ top: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-t-[2.5rem] shadow-[0_-10px_60px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col transition-colors duration-300"
          style={{ height: '85vh' }}
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
            className="absolute top-4 right-4 p-2 bg-black/5 dark:bg-white/10 rounded-full text-gray-500 dark:text-gray-400 z-50 hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
          >
            <X size={20} />
          </button>

          {/* Header with Back Button */}
          {level !== 'cities' && (
              <div className="px-6 pb-2 flex items-center gap-2 shrink-0">
                  <button 
                    onClick={handleBack}
                    className="p-1.5 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 active:bg-black/10 dark:active:bg-white/10 transition-colors"
                  >
                      <ChevronLeft size={24} className="text-gray-600 dark:text-gray-300" />
                  </button>
                  <span className="text-lg font-bold text-gray-800 dark:text-white">
                      {level === 'categories' ? selectedCity : selectedCategory === 'shopping' ? t('cityDrawer.shoppingDeals') : selectedCategory === 'attraction' ? t('categories.attraction') : selectedCategory === 'hotel' ? t('categories.hotel') : t('categories.food')}
                  </span>
              </div>
          )}
          
          {/* Content Area */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 pb-20">
            
            {/* Level 1: City List */}
            {level === 'cities' && (
                <div className="space-y-4 pt-2">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">{t('cityDrawer.selectCity')}</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {CITIES.map(city => (
                            <button
                                key={city.name}
                                onClick={() => handleCityClick(city)}
                                className="flex flex-col items-center justify-center p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-700 hover:bg-white/80 dark:hover:bg-gray-800/80 active:scale-95 transition-all shadow-sm"
                            >
                                <Building2 size={32} className="text-gray-400 dark:text-gray-500 mb-2" />
                                <span className="text-lg font-bold text-gray-800 dark:text-white">{city.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Level 2: Categories */}
            {level === 'categories' && (
                <div className="space-y-6 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                        {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => handleCategoryClick(cat.id)}
                            className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-100 dark:border-gray-700 shadow-sm active:scale-95 transition-transform"
                        >
                            <div className={`p-4 rounded-2xl ${cat.color} dark:bg-opacity-20 mb-1`}>
                                <cat.icon size={32} />
                            </div>
                            <span className="font-bold text-gray-800 dark:text-white text-lg z-10">{cat.label}</span>
                        </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Level 3: List */}
            {level === 'list' && (
                <div className="space-y-4 pt-2">
                    {['attraction', 'hotel', 'food'].includes(selectedCategory) && (
                        <div className="relative mb-2">
                            <input
                                type="text"
                                value={searchKeyword}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setSearchKeyword(val);
                                    if (onSearch && val.trim()) {
                                        onSearch(val);
                                    } else if (onSearch && val === '') {
                                        // If empty, maybe reset to category search?
                                        onSelectCategory(selectedCategory);
                                    }
                                }}
                                placeholder={
                                    selectedCategory === 'attraction' ? "搜索当前城市的景点..." :
                                    selectedCategory === 'hotel' ? "搜索当前城市的酒店..." :
                                    "搜索当前城市的美食..."
                                }
                                className="w-full bg-gray-100 dark:bg-gray-800 rounded-xl py-3 pl-10 pr-4 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            />
                            <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
                        </div>
                    )}

                    {selectedCategory === 'shopping' ? (
                        // Shopping Ad View
                        <div className="space-y-4">
                            <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl p-6 text-white shadow-lg shadow-pink-200">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-2xl font-bold">免税店限时特惠</h3>
                                        <p className="text-white/80 mt-1">国际大牌 3 折起</p>
                                    </div>
                                    <span className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold">广告</span>
                                </div>
                                <button className="w-full bg-white text-pink-600 font-bold py-3 rounded-xl shadow-sm active:scale-95 transition-transform">
                                    立即查看
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-sm border border-gray-100 dark:border-gray-700">
                                    <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-xl mb-2 relative overflow-hidden">
                                        <img src="https://picsum.photos/seed/bag/400/400" alt="Bag" className="w-full h-full object-cover" />
                                        <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">-20%</span>
                                    </div>
                                    <h4 className="font-bold text-gray-800 dark:text-white text-sm line-clamp-1">时尚购物中心</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">距离 1.2km</p>
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-sm border border-gray-100 dark:border-gray-700">
                                    <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-xl mb-2 relative overflow-hidden">
                                        <img src="https://picsum.photos/seed/shop/400/400" alt="Shop" className="w-full h-full object-cover" />
                                    </div>
                                    <h4 className="font-bold text-gray-800 dark:text-white text-sm line-clamp-1">特产礼品店</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">距离 500m</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Standard Search Results
                        searchResults && searchResults.length > 0 ? (
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
                                        <h3 className="font-bold text-gray-800 line-clamp-1">{item.name}</h3>
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
                    ))}
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
