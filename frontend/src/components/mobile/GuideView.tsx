import React, { useState, useEffect } from 'react';
import { X, ArrowLeft, Search, User, Car, Building2, MapPin } from 'lucide-react';
import { motion, AnimatePresence, useAnimation, PanInfo, useDragControls } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useData } from '../../contexts/DataContext';

interface GuideViewProps {
  isVisible: boolean;
  onClose: () => void;
  activeCity?: string;
}

type CategoryType = 'guide' | 'car' | 'agency';

export default function GuideView({ isVisible, onClose, activeCity }: GuideViewProps) {
  const { t } = useLanguage();
  const controls = useAnimation();
  const dragControls = useDragControls();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // UI State
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('guide');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedGuide, setSelectedGuide] = useState<any>(null);
  
  // Data
  const { guides } = useData();

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

  const categories = [
    { id: 'guide', label: '导游', icon: User, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30' },
    { id: 'car', label: '租车', icon: Car, color: 'text-green-600 bg-green-50 dark:bg-green-900/30' },
    { id: 'agency', label: '本地旅行社', icon: Building2, color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/30' }
  ] as const;

  // Filter Logic
  const filteredGuides = guides
    .filter(g => {
        // City Filter
        if (activeCity && g.cities && !g.cities.includes(activeCity)) {
            return false;
        }

        // Category Filter
        if (selectedCategory === 'car') {
            // STRICT 'Car' Filter: Only show items explicitly marked as 'Rent a Car' services.
            // Do NOT include guides just because they have a car (hasCar=true).
            // We look for specific keywords in title/intro/name indicating it's a car rental/charter service.
            const isCarService = g.title?.includes('包车') || g.title?.includes('租车') || 
                                 g.intro?.includes('包车') || g.intro?.includes('租车') ||
                                 g.name?.includes('包车') || g.name?.includes('租车');
            return isCarService;
        }
        if (selectedCategory === 'agency') {
            return g.title?.includes('旅行社') || g.intro?.includes('旅行社') || g.name?.includes('旅行社');
        }
        // For 'guide', show guides.
        // Exclude pure agencies and pure car services to keep it clean?
        // Let's exclude Agencies and Car Services from 'Guide' tab.
        if (selectedCategory === 'guide') {
             const isAgency = g.title?.includes('旅行社') || g.intro?.includes('旅行社') || g.name?.includes('旅行社');
             const isCarService = g.title?.includes('包车') || g.title?.includes('租车') || 
                                  g.intro?.includes('包车') || g.intro?.includes('租车') ||
                                  g.name?.includes('包车') || g.name?.includes('租车');
             return !isAgency && !isCarService;
        }

        return true;
    })
    .filter(g => {
        // Search Filter
        if (!searchKeyword) return true;
        const lowerKeyword = searchKeyword.toLowerCase();
        return (
            g.name.toLowerCase().includes(lowerKeyword) ||
            (g.intro && g.intro.toLowerCase().includes(lowerKeyword)) ||
            (g.title && g.title.toLowerCase().includes(lowerKeyword))
        );
    })
    .sort((a, b) => (a.rank || 99) - (b.rank || 99));

  return (
    <AnimatePresence>
      {isVisible && (
        <>
        {/* Image Preview Modal */}
        {previewImage && (
            <div 
              className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-4 pointer-events-auto"
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
          className="fixed bottom-0 left-0 right-0 z-[60] h-[85vh] bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-t-[2.5rem] shadow-[0_-10px_60px_rgba(0,0,0,0.1)] flex flex-col pointer-events-auto touch-manipulation transition-colors duration-300 overflow-hidden will-change-transform"
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

          {selectedGuide ? (
            // Detail View (Full Height Overlay inside Drawer)
            <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900 h-full relative z-20 animate-in slide-in-from-right duration-300">
              {/* Header Info */}
              <div className="px-8 pt-4 pb-6 bg-white dark:bg-gray-900 z-10 shrink-0">
                <div className="flex justify-between items-start">
                    <div className="flex-1 mr-4">
                        <button 
                          onClick={() => setSelectedGuide(null)}
                          className="mb-4 p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                          <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
                        </button>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight mb-3 tracking-tight">{selectedGuide.name}</h2>
                        <div className="flex gap-2">
                          <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-medium">{selectedGuide.title}</span>
                          {selectedGuide.hasCar && <span className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-3 py-1 rounded-full text-xs font-medium">带车向导</span>}
                        </div>
                    </div>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 bg-gray-50/50 dark:bg-gray-900/50 pb-28">
                  {/* Photos Section */}
                  <div className="mt-4 mb-2">
                      <div className="flex gap-4 px-8 overflow-x-auto pb-4 scrollbar-hide snap-x">
                          {[selectedGuide.avatar, ...(selectedGuide.photos || [])].filter(Boolean).map((photo, index) => (
                              <div 
                                key={index} 
                                className="w-44 h-32 shrink-0 rounded-3xl overflow-hidden bg-gray-200 dark:bg-gray-700 snap-center shadow-md relative cursor-pointer"
                                onClick={() => setPreviewImage(photo)}
                              >
                                  <img 
                                    src={photo} 
                                    alt={selectedGuide.name} 
                                    className="w-full h-full object-cover"
                                  />
                              </div>
                          ))}
                      </div>
                  </div>

                  {/* Detailed Info */}
                  <div className="px-6 space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-[0_2px_10px_rgb(0,0,0,0.03)]">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">个人简介</h3>
                      <div className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm bg-gray-50 dark:bg-gray-800 p-4 rounded-xl prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: selectedGuide.intro }} />
                    </div>

                    {selectedGuide.content && (
                      <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-[0_2px_10px_rgb(0,0,0,0.03)]">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">详细介绍</h3>
                          <div className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: selectedGuide.content }} />
                      </div>
                    )}
                  </div>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="px-6 pb-2 shrink-0">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{t('guide.title')}</h1>
                {activeCity && <p className="text-xs text-gray-500 dark:text-gray-400">当前城市：{activeCity}</p>}
              </div>

              {/* Categories (Horizontal Scroll) */}
              <div className="space-y-4 pt-3 pb-2">
                 <div className="flex overflow-x-auto gap-3 px-6 pb-2 snap-x snap-mandatory scrollbar-hide">
                    {categories.map((cat) => {
                        const isSelected = selectedCategory === cat.id;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => {
                                    if (selectedCategory !== cat.id) {
                                        setSelectedCategory(cat.id as CategoryType);
                                        setSearchKeyword('');
                                    }
                                }}
                                className={`flex-none w-24 flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 h-24 snap-center ${
                                    isSelected 
                                        ? 'bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-500 shadow-md scale-105' 
                                        : 'bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-100 dark:border-gray-700 shadow-sm active:scale-95'
                                }`}
                            >
                                <div className={`p-2.5 rounded-xl ${cat.color} mb-1.5 flex items-center justify-center`}>
                                    <cat.icon size={22} />
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
              </div>

              {/* Inline List Content */}
              <div className="flex-1 overflow-y-auto px-6 pb-24 space-y-4">
                  {/* Search Bar */}
                  <div className="relative mb-2 sticky top-0 z-10 bg-white/95 dark:bg-gray-900/95 py-2 backdrop-blur-md">
                      <div className="relative">
                          <input
                              type="text"
                              value={searchKeyword}
                              onChange={(e) => setSearchKeyword(e.target.value)}
                              placeholder={
                                  selectedCategory === 'car' ? '搜索车型、司机...' :
                                  selectedCategory === 'agency' ? '搜索旅行社...' :
                                  '搜索导游姓名、简介...'
                              }
                              className="w-full bg-gray-100 dark:bg-gray-800 rounded-xl py-3 pl-10 pr-4 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          />
                          <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
                      </div>
                  </div>

                  {/* Filtered List */}
                  {filteredGuides.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                          <Search className="w-12 h-12 mb-2 opacity-20" />
                          <div className="mb-1 text-sm">暂无相关结果</div>
                          <div className="text-xs">请尝试调整筛选条件</div>
                      </div>
                  ) : filteredGuides.map(guide => (
                      <div 
                        key={guide.id} 
                        onClick={() => setSelectedGuide(guide)}
                        className="bg-white dark:bg-gray-800 rounded-[1.5rem] p-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all cursor-pointer active:scale-95 duration-200 mb-3"
                      >
                          <div className="flex gap-4">
                              <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 shadow-sm bg-gray-100">
                                  <img src={guide.avatar} alt={guide.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 flex flex-col justify-between py-0.5">
                                  <div>
                                      <div className="flex justify-between items-start">
                                          <h3 className="text-base font-bold text-gray-900 dark:text-white line-clamp-1">{guide.name}</h3>
                                          <span className="text-xs font-bold text-orange-500">★ {guide.rank || 5.0}</span>
                                      </div>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">{guide.title}</span>
                                          {guide.hasCar && <span className="text-[10px] text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full">带车</span>}
                                      </div>
                                  </div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                                      {guide.intro?.replace(/<[^>]*>?/gm, '') || '暂无简介'}
                                  </p>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
            </>
          )}
        </motion.div>
      </>
      )}
    </AnimatePresence>
  );
}
