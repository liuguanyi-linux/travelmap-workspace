import React from 'react';
import { Compass, Map, Calendar, ChevronRight, X, ArrowLeft, Share2, Heart, ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence, useAnimation, PanInfo, useDragControls } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useData } from '../../contexts/DataContext';
import { Strategy } from '../../types/data';

interface StrategyViewProps {
  isVisible: boolean;
  onClose: () => void;
}

import { getFullImageUrl } from '../../utils/image';

export default function StrategyView({ isVisible, onClose }: StrategyViewProps) {
  const { t } = useLanguage();
  const controls = useAnimation();
  const dragControls = useDragControls();
  const [viewState, setViewState] = React.useState<'hidden' | 'peek' | 'full'>('hidden');
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [selectedStrategy, setSelectedStrategy] = React.useState<Strategy | null>(null);
  const [previewImage, setPreviewImage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isVisible) {
      setViewState('peek');
      controls.start('peek');
    } else {
      setViewState('hidden');
      controls.start('hidden');
      // Reset selection when closing
      setTimeout(() => setSelectedStrategy(null), 300);
    }
  }, [isVisible, controls]);

  const variants = {
    hidden: { y: '100%' },
    peek: { y: 'calc(100% - 300px)' }, 
    full: { y: '0%' }   // Full 66vh
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    const { offset, velocity } = info;
    const isDraggingDown = offset.y > 0;
    const threshold = 100;

    if (viewState === 'full') {
       if (isDraggingDown && (offset.y > threshold || velocity.y > 500)) {
           setViewState('peek');
           controls.start('peek');
       } else {
           controls.start('full');
       }
    } else {
       if (!isDraggingDown && (offset.y < -threshold || velocity.y < -500)) {
           setViewState('full');
           controls.start('full');
       } else {
           controls.start('peek');
       }
    }
  };

  const { strategies, strategyCategories = [] } = useData();

  const allRoutes = strategies.sort((a, b) => (a.rank || 99) - (b.rank || 99));
  const filteredRoutes = selectedCategory === 'all' 
    ? allRoutes 
    : allRoutes.filter(r => r.category === selectedCategory);

  const categories = ['all', ...strategyCategories.map(c => c.name)];

  // Helper function to translate category names
  const getCategoryLabel = (cat: string) => {
    if (cat === 'all') return t('strategy.all');
    if (cat === '一日游') return t('strategy.oneDay');
    if (cat === '2日游') return t('strategy.twoDays');
    if (cat === '亲子游') return t('strategy.family');
    if (cat === '其他') return t('strategy.other');
    if (cat === '必玩路线') return t('strategy.mustVisit');
    if (cat === '当地人推荐') return t('strategy.local');
    if (cat === '当地体验') return t('strategy.localExp');
    if (cat === '实用攻略') return t('strategy.practical');
    return cat; // Fallback to original name
  };

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
          initial="hidden"
          animate={controls}
          variants={variants}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          drag="y"
          dragControls={dragControls}
          dragListener={false}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          className="fixed bottom-0 left-0 right-0 z-40 h-[75vh] bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-t-[2.5rem] shadow-[0_-10px_60px_rgba(0,0,0,0.1)] flex flex-col pointer-events-auto touch-manipulation transition-colors duration-300 overflow-hidden will-change-transform"
        >
          {/* Handle (Click to Toggle) */}
          <div 
            className="w-full flex justify-center pt-3 pb-2 cursor-pointer bg-transparent z-20 shrink-0 absolute top-0 left-0 right-0 h-12 hover:bg-black/5 transition-colors touch-none items-center gap-2"
            onPointerDown={(e) => dragControls.start(e)}
            onClick={() => {
                if (viewState === 'peek') {
                    setViewState('full');
                    controls.start('full');
                } else {
                    setViewState('peek');
                    controls.start('peek');
                }
            }}
          >
            {viewState === 'full' ? (
                <ChevronDown className="text-gray-500 dark:text-gray-400" size={24} />
            ) : (
                <ChevronUp className="text-gray-500 dark:text-gray-400" size={24} />
            )}
            <span className="text-xs text-gray-400 font-medium tracking-wide">{t('clickToToggle')}</span>
          </div>

          {/* Spacer for Handle */}
          <div className="h-8 shrink-0" />

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
                                onClick={() => setPreviewImage(getFullImageUrl(photo))}
                              >
                                  <img 
                                    src={getFullImageUrl(photo)} 
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
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('guide.details')}</h3>
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
                        <span className="font-bold">{t('detail.share')}</span>
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 py-3 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                        <Heart size={20} />
                        <span className="font-bold">{t('detail.save')}</span>
                      </button>
                  </div>
                  </div>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="px-6 pb-2 shrink-0 pt-2">
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">{t('strategy.title')}</h1>
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">{t('strategy.subtitle')}</p>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-2">
                
                {/* Featured Banner REMOVED as requested */}

                {/* Category Filter */}
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors flex-shrink-0 ${
                        selectedCategory === cat 
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                      }`}
                    >
                      {getCategoryLabel(cat)}
                    </button>
                  ))}
                </div>

                {/* Route Lists */}
                <div>
                  <div className="space-y-2">
                    {filteredRoutes.map(route => (
                      <div 
                        key={route.id} 
                        onClick={() => setSelectedStrategy(route)}
                        className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-[1rem] p-3 shadow-sm border border-gray-100 dark:border-gray-700 active:scale-[0.98] transition-transform cursor-pointer hover:shadow-md"
                      >
                        <div className="flex gap-3">
                          <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-200 dark:bg-gray-700 shadow-sm">
                            <img src={getFullImageUrl(route.image)} alt={route.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 flex flex-col justify-between py-0.5">
                            <div>
                              <h4 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1">{route.title}</h4>
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {route.tags.slice(0, 3).map(tag => (
                                  <span key={tag} className="text-[10px] font-bold px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md">{tag}</span>
                                ))}
                              </div>
                            </div>
                            <div className="flex justify-between items-end mt-1">
                              <div className="flex items-center gap-3 text-[10px] font-medium text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1"><Calendar size={12} className="text-blue-500" /> {route.days}</span>
                                <span className="flex items-center gap-1"><Map size={12} className="text-green-500" /> {route.spots.length}{t('strategy.spots')}</span>
                              </div>
                              <button className="w-6 h-6 rounded-full bg-black dark:bg-white flex items-center justify-center text-white dark:text-black shadow-md shadow-gray-200 dark:shadow-none">
                                <ChevronRight size={14} />
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
