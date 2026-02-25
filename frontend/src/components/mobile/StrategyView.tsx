import React from 'react';
import { Compass, Map, Calendar, ChevronRight, X, ArrowLeft, Share2, Heart } from 'lucide-react';
import { motion, AnimatePresence, useAnimation, PanInfo, useDragControls } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useData } from '../../contexts/DataContext';
import { Strategy } from '../../types/data';

interface StrategyViewProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function StrategyView({ isVisible, onClose }: StrategyViewProps) {
  const { t } = useLanguage();
  const controls = useAnimation();
  const dragControls = useDragControls();
  const [selectedCategory, setSelectedCategory] = React.useState('全部');
  const [selectedStrategy, setSelectedStrategy] = React.useState<Strategy | null>(null);
  const [previewImage, setPreviewImage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isVisible) {
      controls.start({ y: 0 });
    } else {
      controls.start({ y: '100%' });
      // Reset selection when closing
      setTimeout(() => setSelectedStrategy(null), 300);
    }
  }, [isVisible, controls]);

  const handleDragEnd = (_event: any, info: PanInfo) => {
    const { offset, velocity } = info;
    if (offset.y > 100 || (velocity.y > 500 && offset.y > 0)) {
       onClose();
    } else {
       controls.start({ y: 0 });
    }
  };

  const { strategies, strategyCategories = [] } = useData();

  const allRoutes = strategies.sort((a, b) => (a.rank || 99) - (b.rank || 99));
  const filteredRoutes = selectedCategory === '全部' 
    ? allRoutes 
    : allRoutes.filter(r => r.category === selectedCategory);

  const categories = ['全部', ...strategyCategories.map(c => c.name)];

  return (
    <AnimatePresence>
      {isVisible && (
        <>
        {/* Image Preview Modal */}
        {previewImage && (
            <div 
              className="fixed inset-0 z-[60] bg-black flex items-center justify-center p-4 pointer-events-auto"
              onClick={() => setPreviewImage(null)}
            >
              <button 
                className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white hover:bg-white/20"
                onClick={() => setPreviewImage(null)}
              >
                <X size={24} />
              </button>
              <img 
                src={previewImage} 
                alt="Preview" 
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>
          )}
        
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
          className="fixed bottom-0 left-0 right-0 z-40 h-[85vh] bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-t-[2.5rem] shadow-[0_-10px_60px_rgba(0,0,0,0.1)] flex flex-col pointer-events-auto touch-manipulation transition-colors duration-300 overflow-hidden will-change-transform"
        >
          {/* Handle */}
          <div 
            className="w-full flex justify-center pt-3 pb-3 cursor-grab active:cursor-grabbing shrink-0 z-10"
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

          {selectedStrategy ? (
            <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900 h-full relative z-20">
              {/* Header Info (Similar to PoiDetail) */}
              <div className="px-8 pt-4 pb-6 bg-white dark:bg-gray-900 z-10 shrink-0">
                <div className="flex justify-between items-start">
                    <div className="flex-1 mr-4">
                        <button 
                          onClick={() => setSelectedStrategy(null)}
                          className="mb-4 p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                          <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
                        </button>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight mb-3 tracking-tight">{selectedStrategy.title}</h2>
                        <div className="flex flex-wrap gap-2">
                            {selectedStrategy.tags.map(tag => (
                                <span key={tag} className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-medium">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 bg-gray-50/50 dark:bg-gray-900/50 pb-28">
                  {/* Photos Section */}
                  <div className="mt-4 mb-2">
                      <div className="flex gap-4 px-8 overflow-x-auto pb-4 scrollbar-hide snap-x">
                          {/* Combine main image and photos array */}
                          {[selectedStrategy.image, ...(selectedStrategy.photos || [])].filter(Boolean).map((photo, index) => (
                              <div 
                                key={index} 
                                className="w-44 h-32 shrink-0 rounded-3xl overflow-hidden bg-gray-200 dark:bg-gray-700 snap-center shadow-md relative cursor-pointer"
                                onClick={() => setPreviewImage(photo)}
                              >
                                  <img 
                                    src={photo} 
                                    alt={selectedStrategy.title} 
                                    className="w-full h-full object-cover"
                                  />
                              </div>
                          ))}
                      </div>
                  </div>

                  {/* Detailed Info */}
                  <div className="px-6 space-y-6">
                    {/* Info Bar */}
                    <div className="flex gap-4 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.03)]">
                      <div className="flex-1 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                          <Calendar size={20} />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{t('strategy.days')}</div>
                          <div className="font-bold text-gray-900 dark:text-white">{selectedStrategy.days}</div>
                        </div>
                      </div>
                      <div className="w-px bg-gray-200 dark:bg-gray-700" />
                      <div className="flex-1 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                          <Map size={20} />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{t('strategy.spots')}</div>
                          <div className="font-bold text-gray-900 dark:text-white">{selectedStrategy.spots.length}个</div>
                        </div>
                      </div>
                    </div>

                    {/* Route Details */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-[0_2px_10px_rgb(0,0,0,0.03)]">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('strategy.route')}</h3>
                      <div className="relative pl-4 border-l-2 border-blue-100 dark:border-blue-900 space-y-6">
                        {selectedStrategy.spots.map((spot, index) => (
                          <div key={index} className="relative">
                            <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-white dark:ring-gray-900" />
                            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{spot}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Content */}
                    {selectedStrategy.content && (
                      <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-[0_2px_10px_rgb(0,0,0,0.03)]">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">详细攻略</h3>
                        <div 
                          className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: selectedStrategy.content }} 
                        />
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4">
                        <button className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 py-3 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                          <Share2 size={20} />
                          <span className="font-bold">分享攻略</span>
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 py-3 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                          <Heart size={20} />
                          <span className="font-bold">收藏路线</span>
                        </button>
                    </div>
                  </div>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="px-6 pb-4 shrink-0">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">精选攻略</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">发现最地道的本地玩法</p>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-6 pb-24 space-y-6">
                
                {/* Featured Banner */}
                <div className="relative h-48 rounded-2xl overflow-hidden shadow-md shrink-0">
                  <img 
                    src="https://picsum.photos/seed/beach/800/400" 
                    alt="Summer Beach" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                    <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-md w-fit mb-2">本月推荐</span>
                    <h2 className="text-white text-xl font-bold">夏日海滨度假指南</h2>
                    <p className="text-white/80 text-sm">避暑胜地，尽享清凉一夏</p>
                  </div>
                </div>

                {/* Category Filter */}
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors flex-shrink-0 ${
                        selectedCategory === cat 
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Route Lists */}
                <div>
                  <h3 className="font-bold text-gray-800 dark:text-white text-lg mb-3 flex items-center gap-2">
                    <Compass size={20} className="text-blue-600 dark:text-blue-400" />
                    推荐路线
                  </h3>
                  <div className="space-y-4">
                    {filteredRoutes.map(route => (
                      <div 
                        key={route.id} 
                        onClick={() => setSelectedStrategy(route)}
                        className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-[1.8rem] p-5 shadow-sm border border-gray-100 dark:border-gray-700 active:scale-[0.98] transition-transform cursor-pointer hover:shadow-md"
                      >
                        <div className="flex gap-5">
                          <div className="w-28 h-28 rounded-2xl overflow-hidden shrink-0 bg-gray-200 dark:bg-gray-700 shadow-sm">
                            <img src={route.image} alt={route.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 flex flex-col justify-between py-1">
                            <div>
                              <h4 className="font-bold text-gray-900 dark:text-white text-lg line-clamp-1">{route.title}</h4>
                              <div className="flex flex-wrap gap-2 mt-3">
                                {route.tags.map(tag => (
                                  <span key={tag} className="text-[10px] font-bold px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg">{tag}</span>
                                ))}
                              </div>
                            </div>
                            <div className="flex justify-between items-end mt-2">
                              <div className="flex items-center gap-4 text-xs font-medium text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1.5"><Calendar size={14} className="text-blue-500" /> {route.days}</span>
                                <span className="flex items-center gap-1.5"><Map size={14} className="text-green-500" /> {route.spots.length}个景点</span>
                              </div>
                              <button className="w-9 h-9 rounded-full bg-black dark:bg-white flex items-center justify-center text-white dark:text-black shadow-lg shadow-gray-200 dark:shadow-none">
                                <ChevronRight size={20} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </>
      )}
    </AnimatePresence>
  );
}
