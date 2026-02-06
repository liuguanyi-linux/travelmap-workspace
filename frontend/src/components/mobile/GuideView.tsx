import React from 'react';
import { X, User } from 'lucide-react';
import { motion, AnimatePresence, useAnimation, PanInfo, useDragControls } from 'framer-motion';
import { useData } from '../../contexts/DataContext';

interface GuideViewProps {
  isVisible: boolean;
  onClose: () => void;
  activeCity?: string;
}

export default function GuideView({ isVisible, onClose, activeCity }: GuideViewProps) {
  const controls = useAnimation();
  const dragControls = useDragControls();

  React.useEffect(() => {
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

  const [selectedGender, setSelectedGender] = React.useState<'male' | 'female' | null>(null);
  const [hasCar, setHasCar] = React.useState<boolean | null>(null);
  const { guides } = useData();

  const filteredGuides = guides
    .filter(g => {
        // City Filter (if activeCity is provided)
        if (activeCity && g.cities && !g.cities.includes(activeCity)) {
            return false;
        }
        if (selectedGender && g.gender !== selectedGender) return false;
        if (hasCar === true && !g.hasCar) return false;
        // If hasCar is false or null, we don't strictly filter out cars, 
        // but user specifically asked for "Has Car" button logic. 
        // If user clicks "Has Car", we show cars. 
        // If user doesn't click it, we show all (or maybe user implies "No Car" isn't a filter they care about).
        // Let's stick to: if hasCar is true, show only cars. If null, show all.
        return true;
    })
    .sort((a, b) => (a.rank || 99) - (b.rank || 99));

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
          className="fixed bottom-0 left-0 right-0 z-40 h-[85vh] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-t-[2.5rem] shadow-[0_-10px_60px_rgba(0,0,0,0.1)] flex flex-col pointer-events-auto touch-manipulation transition-colors duration-300 overflow-hidden"
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

          {/* Header */}
          <div className="px-6 pb-4 shrink-0">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">找导游</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">定制您的专属向导</p>
          </div>

          {/* Filter Options */}
          <div className="px-6 mb-6">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">筛选条件</h3>
            <div className="flex gap-3">
                <button 
                    onClick={() => setSelectedGender(prev => prev === 'male' ? null : 'male')}
                    className={`flex-1 py-3 rounded-2xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${selectedGender === 'male' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
                >
                    <User size={16} />
                    男
                </button>
                <button 
                    onClick={() => setSelectedGender(prev => prev === 'female' ? null : 'female')}
                    className={`flex-1 py-3 rounded-2xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${selectedGender === 'female' ? 'bg-pink-500 text-white shadow-lg shadow-pink-200 dark:shadow-none' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
                >
                    <User size={16} />
                    女
                </button>
                <button 
                    onClick={() => setHasCar(prev => prev === true ? null : true)}
                    className={`flex-1 py-3 rounded-2xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${hasCar === true ? 'bg-green-600 text-white shadow-lg shadow-green-200 dark:shadow-none' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
                >
                    <div className="text-lg">🚗</div>
                    车辆
                </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 pb-24 space-y-4">
            
            {/* Guide List */}
            {filteredGuides.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <div className="mb-2">暂无符合条件的导游</div>
                    <div className="text-xs">请尝试调整筛选条件</div>
                </div>
            ) : filteredGuides.map(guide => (
                <div key={guide.id} className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow">
                    <div className="flex gap-4">
                        <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 shadow-sm">
                            <img src={guide.avatar} alt={guide.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-base font-bold text-gray-900 dark:text-white">{guide.name}</h3>
                                        <div className="flex gap-1">
                                            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">{guide.title}</span>
                                            {guide.hasCar && <span className="text-[10px] text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full">车辆</span>}
                                        </div>
                                    </div>
                                    <p className="mt-2 text-xs text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                                        "{guide.intro}"
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
            
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
