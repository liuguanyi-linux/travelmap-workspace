import React from 'react';
import { MapPin, X, Heart, User, BookOpen, Building2 } from 'lucide-react';
import { motion, AnimatePresence, useAnimation, PanInfo, useDragControls } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { getFullImageUrl } from '../../utils/image';
import { useFavorites } from '../../hooks/useFavorites';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

export interface SearchResultItem {
  id: string | number;
  type: 'spot' | 'guide' | 'strategy' | 'city';
  name: string;
  description?: string;
  imageUrl?: string;
  city?: string;
  cityData?: any;
}

interface SearchResultsDrawerProps {
  isVisible: boolean;
  results: SearchResultItem[];
  keyword: string;
  onItemClick: (item: SearchResultItem) => void;
  onClose: () => void;
}

export default function SearchResultsDrawer({ isVisible, results, keyword, onItemClick, onClose }: SearchResultsDrawerProps) {
  const controls = useAnimation();
  const dragControls = useDragControls();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { user } = useAuth();

  React.useEffect(() => {
    if (isVisible) {
      controls.start({ y: 0 });
    } else {
      controls.start({ y: '100%' });
    }
  }, [isVisible, controls]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.y > 100 || (info.velocity.y > 500 && info.offset.y > 0)) {
      onClose();
    } else {
      controls.start({ y: 0 });
    }
  };

  const typeIcon = (type: string) => {
    if (type === 'guide') return <User size={14} />;
    if (type === 'strategy') return <BookOpen size={14} />;
    return <MapPin size={14} />;
  };

  // 城市颜色 - 根据城市名哈希分配，新城市自动获得不同颜色
  const CITY_COLORS = [
    { text: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-700' },
    { text: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-700' },
    { text: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/20', border: 'border-violet-200 dark:border-violet-700' },
    { text: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-700' },
    { text: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20', border: 'border-rose-200 dark:border-rose-700' },
    { text: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-900/20', border: 'border-cyan-200 dark:border-cyan-700' },
  ];
  const cityColorCache = React.useRef<Record<string, number>>({});
  const cityColorIndex = React.useRef(0);
  const getCityColor = (city: string) => {
    if (!cityColorCache.current[city]) {
      cityColorCache.current[city] = cityColorIndex.current % CITY_COLORS.length;
      cityColorIndex.current++;
    }
    return CITY_COLORS[cityColorCache.current[city]];
  };

  return (
    <AnimatePresence>
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
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
          className="fixed bottom-0 left-0 right-0 mx-auto z-[150] w-[96%] max-w-[500px] h-[75vh] bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg rounded-t-[2.5rem] shadow-[0_-5px_25px_rgba(0,0,0,0.15)] border-t border-x border-gray-200 dark:border-gray-800 flex flex-col pointer-events-auto touch-manipulation overflow-hidden"
        >
          {/* Handle */}
          <div
            className="w-full flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing shrink-0 touch-none"
            onPointerDown={(e) => dragControls.start(e)}
          >
            <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
          </div>

          {/* Header */}
          <div
            className="px-5 pb-3 shrink-0 flex justify-between items-center touch-none"
            onPointerDown={(e) => dragControls.start(e)}
          >
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">搜索结果</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">"{keyword}" · {results.length} 条</p>
            </div>
            <button
              onClick={onClose}
              onPointerDown={(e) => e.stopPropagation()}
              className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-2">
            {results.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                <MapPin size={36} className="mb-2 opacity-20" />
                <p className="text-sm">没有找到相关内容</p>
              </div>
            ) : results.map((item, index) => {
              const favId = String(item.id);
              const fav = isFavorite(favId, 'poi');
              const imgUrl = item.imageUrl ? getFullImageUrl(item.imageUrl) : null;

              if (item.type === 'city') {
                return (
                  <div
                    key={`city-${item.id}`}
                    onClick={() => onItemClick(item)}
                    className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-3 shadow-sm border-2 border-blue-300 dark:border-blue-600 flex items-center gap-3 active:scale-[0.99] transition-transform cursor-pointer relative"
                  >
                    <div className="absolute -left-1 -top-1 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm z-20">★</div>
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white shrink-0">
                      <Building2 size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-bold text-blue-600 dark:text-blue-300 tracking-widest mb-0.5">도시 / 城市</div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight">{item.name}</h3>
                      {item.description && (
                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">{item.description}</p>
                      )}
                    </div>
                    <div className="text-blue-500 text-xl">→</div>
                  </div>
                );
              }
              return (
                <div
                  key={`${item.type}-${item.id}`}
                  onClick={() => onItemClick(item)}
                  className="bg-white dark:bg-gray-800 rounded-xl p-2 shadow-sm border border-slate-300 dark:border-slate-500 flex gap-2 active:scale-[0.99] transition-transform cursor-pointer relative"
                >
                  {/* Number badge */}
                  <div className="absolute -left-1 -top-1 w-5 h-5 bg-white text-gray-700 border border-gray-300 rounded-full flex items-center justify-center text-xs font-semibold shadow-sm z-20">
                    {index + 1}
                  </div>

                  {/* Thumbnail */}
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden shrink-0">
                    {imgUrl ? (
                      <img src={imgUrl} alt={item.name} className="w-full h-full object-cover" loading="lazy" width={64} height={64} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        {typeIcon(item.type)}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center py-0">
                    <h3 className="font-bold text-gray-900 dark:text-white truncate text-lg mb-0.5 pr-6">{item.name}</h3>
                    {item.city && (() => {
                      const color = getCityColor(item.city!);
                      return (
                        <div className={`inline-flex items-center gap-0.5 mb-0.5 px-1.5 py-0.5 rounded-full border w-fit ${color.bg} ${color.border}`}>
                          <MapPin size={9} className={`${color.text} shrink-0`} />
                          <span className={`text-xs font-medium ${color.text}`}>{item.city}</span>
                        </div>
                      );
                    })()}
                    {item.description && (
                      <div
                        className="text-xs text-gray-400 dark:text-gray-500 line-clamp-2 leading-tight"
                        dangerouslySetInnerHTML={{ __html: item.description }}
                      />
                    )}
                  </div>

                  {/* Favorite */}
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (!user) { toast.error('请先登录'); return; }
                      await toggleFavorite({ id: favId, name: item.name, type: 'poi', imageUrl: item.imageUrl || '' });
                    }}
                    className="absolute top-2 right-2 p-1 bg-white/80 dark:bg-black/20 backdrop-blur-sm rounded-full hover:bg-red-50 transition-colors z-10"
                  >
                    <Heart size={14} className={fav ? 'text-red-500 fill-red-500' : 'text-gray-400'} />
                  </button>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
