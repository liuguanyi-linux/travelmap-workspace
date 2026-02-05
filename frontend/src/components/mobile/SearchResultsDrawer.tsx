import React, { useEffect } from 'react';
import { MapPin, Star, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence, useAnimation, PanInfo, useDragControls } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';

interface SearchResultsDrawerProps {
  isVisible: boolean;
  results: any[];
  onPoiClick: (poi: any) => void;
  onClose: () => void;
}

export default function SearchResultsDrawer({ isVisible, results, onPoiClick, onClose }: SearchResultsDrawerProps) {
  const controls = useAnimation();
  const dragControls = useDragControls();
  const { t } = useLanguage();

  useEffect(() => {
    if (isVisible) {
      controls.start({ y: 0 });
    } else {
      controls.start({ y: '100%' });
    }
  }, [isVisible, controls]);

  const handleDragEnd = (event: any, info: PanInfo) => {
    const { offset, velocity } = info;
    if (offset.y > 100 || (velocity.y > 500 && offset.y > 0)) {
       onClose();
    } else {
       controls.start({ y: 0 });
    }
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
          className="fixed bottom-0 left-0 right-0 z-40 h-[75vh] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-t-[2.5rem] shadow-[0_-10px_60px_rgba(0,0,0,0.1)] flex flex-col pointer-events-auto touch-manipulation transition-colors duration-300 overflow-hidden"
        >
          {/* Handle */}
          <div 
            className="w-full flex justify-center pt-3 pb-3 cursor-grab active:cursor-grabbing shrink-0 z-10"
            onPointerDown={(e) => dragControls.start(e)}
          >
            <div className="w-12 h-1.5 bg-gray-200/80 dark:bg-gray-700/80 rounded-full" />
          </div>

          {/* Header */}
          <div className="px-6 pb-4 shrink-0 flex justify-between items-center">
            <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">搜索结果</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">找到 {results.length} 个相关地点</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto px-4 pb-24">
            <div className="space-y-3">
              {results.map((poi, index) => (
                <div 
                  key={poi.id || index}
                  onClick={() => {
                    onPoiClick(poi);
                    onClose();
                  }}
                  className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 active:scale-[0.98] transition-all flex gap-4"
                >
                   {/* Thumbnail (if available) or Icon */}
                   <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-xl shrink-0 overflow-hidden">
                      {poi.photos && poi.photos.length > 0 ? (
                        <img src={poi.photos[0].url} alt={poi.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <MapPin size={24} />
                        </div>
                      )}
                   </div>
                   
                   <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-gray-900 dark:text-white truncate pr-2 text-base">{poi.name}</h3>
                        {/* Mock Rating if missing */}
                        <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-1.5 py-0.5 rounded text-xs font-bold text-yellow-600 dark:text-yellow-500 shrink-0">
                          <Star size={10} fill="currentColor" />
                          <span>{poi.biz_ext?.rating || '4.5'}</span>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 truncate">
                        {poi.type?.split(';')[0]} · {typeof poi.distance === 'number' ? `${(poi.distance/1000).toFixed(1)}km` : poi.address}
                      </div>
                      
                      <div className="flex items-center text-blue-600 dark:text-blue-400 text-xs font-medium">
                        查看详情 <ChevronRight size={12} />
                      </div>
                   </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
