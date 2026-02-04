import React from 'react';
import { Compass, Map, Calendar, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence, useAnimation, PanInfo, useDragControls } from 'framer-motion';

interface StrategyViewProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function StrategyView({ isVisible, onClose }: StrategyViewProps) {
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

  const routes = [
    {
      id: 1,
      title: '青岛经典三日游',
      days: '3天',
      spots: ['栈桥', '八大关', '五四广场', '奥帆中心'],
      image: 'https://picsum.photos/seed/qingdao1/200/200',
      tags: ['经典路线', '海滨风光', '必打卡']
    },
    {
      id: 2,
      title: '老城建筑人文之旅',
      days: '1天',
      spots: ['天主教堂', '信号山', '德国总督楼'],
      image: 'https://picsum.photos/seed/qingdao2/200/200',
      tags: ['历史建筑', '人文摄影', '文艺']
    },
    {
      id: 3,
      title: '崂山风景区深度游',
      days: '2天',
      spots: ['太清宫', '仰口', '巨峰'],
      image: 'https://picsum.photos/seed/laoshan/200/200',
      tags: ['爬山', '自然风光', '道教文化']
    }
  ];

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

            {/* Route Lists */}
            <div>
              <h3 className="font-bold text-gray-800 dark:text-white text-lg mb-3 flex items-center gap-2">
                <Compass size={20} className="text-blue-600 dark:text-blue-400" />
                推荐路线
              </h3>
              <div className="space-y-4">
                {routes.map(route => (
                  <div key={route.id} className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-[1.8rem] p-5 shadow-sm border border-gray-100 dark:border-gray-700 active:scale-[0.98] transition-transform">
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
