import React, { useState, useEffect } from 'react';
import { X, ArrowLeft, Search, User, Car, Building2, MapPin, Megaphone, ExternalLink, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence, useAnimation, PanInfo, useDragControls } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useData } from '../../contexts/DataContext';

import { getFullImageUrl } from '../../utils/image';

interface GuideViewProps {
  isVisible: boolean;
  onClose: () => void;
  activeCity?: string;
  initialCategory?: string;
  onLightboxChange?: (isOpen: boolean) => void;
  searchKeyword?: string;
}

type CategoryType = 'guide' | 'car' | 'agency' | 'ad';

export default function GuideView({ isVisible, onClose, activeCity, initialCategory, onLightboxChange, searchKeyword: externalKeyword = '' }: GuideViewProps) {
  const { t } = useLanguage();
  const controls = useAnimation();
  const dragControls = useDragControls();
  const [viewState, setViewState] = useState<'hidden' | 'peek' | 'full'>('hidden');
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  // UI State
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('guide');
  const [internalKeyword, setInternalKeyword] = useState('');
  const searchKeyword = externalKeyword || internalKeyword;
  const [selectedGuide, setSelectedGuide] = useState<any>(null);
  
  useEffect(() => {
    if (initialCategory && ['guide', 'car', 'agency', 'ad'].includes(initialCategory)) {
        setSelectedCategory(initialCategory as CategoryType);
    }
  }, [initialCategory]);

  useEffect(() => {
    if (onLightboxChange) {
      onLightboxChange(previewIndex !== null);
    }
  }, [previewIndex, onLightboxChange]);
  
  // Data
  const { guides, cities, ads } = useData();
  const { language } = useLanguage();

  // Helper to get localized city name
  const getLocalizedCityName = (cityName: string) => {
    const city = cities.find(c => c.name === cityName);
    if (!city) return cityName;
    
    if (language === 'en-US' && city.nameEn) return city.nameEn;
    if (language === 'ko-KR' && city.nameKo) return city.nameKo;
    
    return cityName;
  };

  useEffect(() => {
    if (isVisible) {
      setViewState('peek');
      controls.start('peek');
    } else {
      setViewState('hidden');
      controls.start('hidden');
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

  const categories = [
    { id: 'guide', label: '가이드', icon: User, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30' },
    { id: 'car', label: '렌트카', icon: Car, color: 'text-green-600 bg-green-50 dark:bg-green-900/30' },
    { id: 'agency', label: '현지여행사', icon: Building2, color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/30' },
    { id: 'ad', label: t('categories.ad') || '광고', icon: Megaphone, color: 'text-pink-600 bg-pink-50 dark:bg-pink-900/30' }
  ] as const;

  // Filter Logic
  console.log('DEBUG DATA: guides', guides);
  console.log('DEBUG DATA: type of guides', typeof guides);
  console.log('DEBUG DATA: isArray', Array.isArray(guides));
  
  const filteredGuides = (Array.isArray(guides) ? guides : [])
    .filter(g => {
        // City Filter (Respect isGlobal)
        if (activeCity && !g.isGlobal && g.cities && !g.cities.includes(activeCity)) {
            return false;
        }

        // Category Filter
        const isLegacyCar = g.title?.includes('包车') || g.title?.includes('租车') || 
                           g.intro?.includes('包车') || g.intro?.includes('租车') ||
                           g.name?.includes('包车') || g.name?.includes('租车');
        
        const isLegacyAgency = g.title?.includes('旅行社') || g.intro?.includes('旅行社') || g.name?.includes('旅行社');

        if (selectedCategory === 'car') {
            return g.category === 'car' || (g.category === 'guide' && isLegacyCar);
        }
        if (selectedCategory === 'agency') {
            return g.category === 'agency' || (g.category === 'guide' && isLegacyAgency);
        }
        // For 'guide', show guides.
        // Exclude pure agencies and pure car services to keep it clean?
        // Let's exclude Agencies and Car Services from 'Guide' tab.
        if (selectedCategory === 'guide') {
             // Show if explicitly 'guide' AND NOT legacy car/agency (unless explicitly marked as guide, but legacy items default to guide)
             // If it's explicitly 'guide' (which is default), we still filter out legacy car/agency to avoid duplicates in Guide tab
             return (g.category === 'guide' || !g.category) && !isLegacyCar && !isLegacyAgency;
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
    .sort((a, b) => {
        // Sort by isTop desc, then rank asc
        if (a.isTop !== b.isTop) return (b.isTop ? 1 : 0) - (a.isTop ? 1 : 0);
        return (a.rank || 99) - (b.rank || 99);
    });

  return (
    <AnimatePresence>
      {isVisible && (
        <>
        {/* Image Preview Modal */}
        {previewIndex !== null && selectedGuide?.photos && (
            <div 
              className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-4 pointer-events-auto"
              onClick={() => setPreviewIndex(null)}
            >
              <button 
                className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 z-20"
                onClick={(e) => { e.stopPropagation(); setPreviewIndex(null); }}
              >
                <X size={24} />
              </button>

              {/* Navigation Buttons */}
              {(Array.isArray(selectedGuide.photos) ? selectedGuide.photos : typeof selectedGuide.photos === 'string' ? [selectedGuide.photos] : []).length > 1 && (
                <>
                  <button 
                    className="absolute left-4 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 z-20 backdrop-blur-sm transition-colors"
                    onClick={(e) => {
                        e.stopPropagation();
                        const photosList = Array.isArray(selectedGuide.photos) ? selectedGuide.photos : typeof selectedGuide.photos === 'string' ? [selectedGuide.photos] : [];
                        setPreviewIndex((prev) => (prev !== null ? (prev - 1 + photosList.length) % photosList.length : 0));
                    }}
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button 
                    className="absolute right-4 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 z-20 backdrop-blur-sm transition-colors"
                    onClick={(e) => {
                        e.stopPropagation();
                        const photosList = Array.isArray(selectedGuide.photos) ? selectedGuide.photos : typeof selectedGuide.photos === 'string' ? [selectedGuide.photos] : [];
                        setPreviewIndex((prev) => (prev !== null ? (prev + 1) % photosList.length : 0));
                    }}
                  >
                    <ChevronRight size={24} />
                  </button>
                  
                  {/* Counter */}
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-black/50 backdrop-blur-md rounded-full text-white text-sm font-medium z-20">
                    {previewIndex + 1} / {(Array.isArray(selectedGuide.photos) ? selectedGuide.photos : typeof selectedGuide.photos === 'string' ? [selectedGuide.photos] : []).length}
                  </div>
                </>
              )}

              <div className="relative w-full h-full flex items-center justify-center">
                  <motion.img 
                    key={previewIndex}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    src={(Array.isArray(selectedGuide.photos) ? selectedGuide.photos : typeof selectedGuide.photos === 'string' ? [selectedGuide.photos] : [])[previewIndex]}
                    alt="Preview" 
                    className="max-w-full max-h-full object-contain rounded-lg select-none shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(e, { offset, velocity }) => {
                      const swipe = offset.x;
                      const photosList = Array.isArray(selectedGuide.photos) ? selectedGuide.photos : typeof selectedGuide.photos === 'string' ? [selectedGuide.photos] : [];
                      if (swipe < -50) {
                         setPreviewIndex((prev) => (prev !== null ? (prev + 1) % photosList.length : 0));
                      } else if (swipe > 50) {
                         setPreviewIndex((prev) => (prev !== null ? (prev - 1 + photosList.length) % photosList.length : 0));
                      }
                    }}
                  />
              </div>
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
          className="fixed bottom-0 left-0 right-0 mx-auto z-[60] w-[96%] max-w-[500px] h-[75vh] bg-slate-50/95 dark:bg-gray-900/95 backdrop-blur-lg rounded-t-[2.5rem] shadow-[0_-5px_25px_rgba(0,0,0,0.15)] border-t border-x border-gray-200 dark:border-gray-800 flex flex-col pointer-events-auto touch-manipulation transition-colors duration-300 overflow-hidden will-change-transform"
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
                          <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-medium border border-blue-200 dark:border-blue-800">
                              {selectedGuide.category === 'car' ? '렌트카' : selectedGuide.category === 'agency' ? '현지여행사' : '가이드'}
                          </span>
                          {selectedGuide.hasCar && <span className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-3 py-1 rounded-full text-xs font-medium">{t('guide.hasCar')}</span>}
                        </div>
                    </div>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 bg-gray-50/50 dark:bg-gray-900/50 pb-28">
                  {/* Photos Section */}
                  <div className="mt-4 mb-2">
                      <div className="flex gap-4 px-8 overflow-x-auto pb-4 scrollbar-hide snap-x">
                          {(Array.isArray(selectedGuide.photos) ? selectedGuide.photos : typeof selectedGuide.photos === 'string' ? [selectedGuide.photos] : []).filter(Boolean).map((photo, index) => (
                              <div 
                                key={index} 
                                className="w-44 h-32 shrink-0 rounded-3xl overflow-hidden bg-gray-200 dark:bg-gray-700 snap-center shadow-md relative cursor-pointer"
                                onClick={() => {
                                    setPreviewIndex(index);
                                }}
                              >
                                  <img 
                                    src={photo as string} 
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
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('guide.intro')}</h3>
                      <div className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm bg-gray-50 dark:bg-gray-800 p-4 rounded-xl prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: selectedGuide.intro }} />
                    </div>

                    {/* Contact Info (Copied from POI) */}
                    {(selectedGuide.phone || selectedGuide.wechat || selectedGuide.kakao || selectedGuide.email) && (
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-[0_2px_10px_rgb(0,0,0,0.03)]">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">연락처 정보</h3>
                            <div className="space-y-4">
                                {selectedGuide.phone && (
                                    <>
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[10px] text-gray-500 mb-0.5">전화번호</p>
                                                <p className="font-medium text-gray-700 text-xs truncate">{selectedGuide.phone}</p>
                                            </div>
                                            <button 
                                              onClick={() => {
                                                  const text = selectedGuide.phone || '';
                                                  if (navigator.clipboard && window.isSecureContext) {
                                                      navigator.clipboard.writeText(text);
                                                  } else {
                                                      const textArea = document.createElement("textarea");
                                                      textArea.value = text;
                                                      textArea.style.position = "fixed";
                                                      textArea.style.left = "-9999px";
                                                      document.body.appendChild(textArea);
                                                      textArea.focus();
                                                      textArea.select();
                                                      try { document.execCommand('copy'); } catch (err) {}
                                                      document.body.removeChild(textArea);
                                                  }
                                                  const btn = document.getElementById('copy-guide-phone-btn');
                                                  if (btn) {
                                                      const originalText = btn.innerText;
                                                      btn.innerText = t('detail.saved') || '복사됨';
                                                      btn.classList.add('bg-green-600', 'text-white');
                                                      btn.classList.remove('bg-gray-100', 'text-gray-600');
                                                      setTimeout(() => {
                                                          btn.innerText = originalText;
                                                          btn.classList.remove('bg-green-600', 'text-white');
                                                          btn.classList.add('bg-gray-100', 'text-gray-600');
                                                      }, 1500);
                                                  }
                                              }}
                                              id="copy-guide-phone-btn"
                                              className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-all shrink-0 active:scale-95"
                                            >
                                                복사하기
                                            </button>
                                        </div>
                                    </>
                                )}
                                {selectedGuide.wechat && (
                                    <>
                                        {selectedGuide.phone && <div className="h-px bg-gray-100" />}
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[10px] text-gray-500 mb-0.5">위챗 ID</p>
                                                <p className="font-medium text-gray-700 text-xs truncate">{selectedGuide.wechat}</p>
                                            </div>
                                            <button 
                                              onClick={() => {
                                                  const text = selectedGuide.wechat || '';
                                                  if (navigator.clipboard && window.isSecureContext) {
                                                      navigator.clipboard.writeText(text);
                                                  } else {
                                                      const textArea = document.createElement("textarea");
                                                      textArea.value = text;
                                                      textArea.style.position = "fixed";
                                                      textArea.style.left = "-9999px";
                                                      document.body.appendChild(textArea);
                                                      textArea.focus();
                                                      textArea.select();
                                                      try { document.execCommand('copy'); } catch (err) {}
                                                      document.body.removeChild(textArea);
                                                  }
                                                  const btn = document.getElementById('copy-guide-wechat-btn');
                                                  if (btn) {
                                                      const originalText = btn.innerText;
                                                      btn.innerText = t('detail.saved') || '복사됨';
                                                      btn.classList.add('bg-green-600', 'text-white');
                                                      btn.classList.remove('bg-gray-100', 'text-gray-600');
                                                      setTimeout(() => {
                                                          btn.innerText = originalText;
                                                          btn.classList.remove('bg-green-600', 'text-white');
                                                          btn.classList.add('bg-gray-100', 'text-gray-600');
                                                      }, 1500);
                                                  }
                                              }}
                                              id="copy-guide-wechat-btn"
                                              className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-all shrink-0 active:scale-95"
                                            >
                                                복사하기
                                            </button>
                                        </div>
                                    </>
                                )}
                                {selectedGuide.kakao && (
                                    <>
                                        {(selectedGuide.phone || selectedGuide.wechat) && <div className="h-px bg-gray-100" />}
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[10px] text-gray-500 mb-0.5">카카오톡 ID</p>
                                                <p className="font-medium text-gray-700 text-xs truncate">{selectedGuide.kakao}</p>
                                            </div>
                                            <button 
                                              onClick={() => {
                                                  const text = selectedGuide.kakao || '';
                                                  if (navigator.clipboard && window.isSecureContext) {
                                                      navigator.clipboard.writeText(text);
                                                  } else {
                                                      const textArea = document.createElement("textarea");
                                                      textArea.value = text;
                                                      textArea.style.position = "fixed";
                                                      textArea.style.left = "-9999px";
                                                      document.body.appendChild(textArea);
                                                      textArea.focus();
                                                      textArea.select();
                                                      try { document.execCommand('copy'); } catch (err) {}
                                                      document.body.removeChild(textArea);
                                                  }
                                                  const btn = document.getElementById('copy-guide-kakao-btn');
                                                  if (btn) {
                                                      const originalText = btn.innerText;
                                                      btn.innerText = t('detail.saved') || '복사됨';
                                                      btn.classList.add('bg-green-600', 'text-white');
                                                      btn.classList.remove('bg-gray-100', 'text-gray-600');
                                                      setTimeout(() => {
                                                          btn.innerText = originalText;
                                                          btn.classList.remove('bg-green-600', 'text-white');
                                                          btn.classList.add('bg-gray-100', 'text-gray-600');
                                                      }, 1500);
                                                  }
                                              }}
                                              id="copy-guide-kakao-btn"
                                              className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-all shrink-0 active:scale-95"
                                            >
                                                복사하기
                                            </button>
                                        </div>
                                    </>
                                )}
                                {selectedGuide.email && (
                                    <>
                                        {(selectedGuide.phone || selectedGuide.wechat || selectedGuide.kakao) && <div className="h-px bg-gray-100" />}
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[10px] text-gray-500 mb-0.5">이메일</p>
                                                <p className="font-medium text-gray-700 text-xs truncate">{selectedGuide.email}</p>
                                            </div>
                                            <button 
                                              onClick={() => {
                                                  const text = selectedGuide.email || '';
                                                  if (navigator.clipboard && window.isSecureContext) {
                                                      navigator.clipboard.writeText(text);
                                                  } else {
                                                      const textArea = document.createElement("textarea");
                                                      textArea.value = text;
                                                      textArea.style.position = "fixed";
                                                      textArea.style.left = "-9999px";
                                                      document.body.appendChild(textArea);
                                                      textArea.focus();
                                                      textArea.select();
                                                      try { document.execCommand('copy'); } catch (err) {}
                                                      document.body.removeChild(textArea);
                                                  }
                                                  const btn = document.getElementById('copy-guide-email-btn');
                                                  if (btn) {
                                                      const originalText = btn.innerText;
                                                      btn.innerText = t('detail.saved') || '복사됨';
                                                      btn.classList.add('bg-green-600', 'text-white');
                                                      btn.classList.remove('bg-gray-100', 'text-gray-600');
                                                      setTimeout(() => {
                                                          btn.innerText = originalText;
                                                          btn.classList.remove('bg-green-600', 'text-white');
                                                          btn.classList.add('bg-gray-100', 'text-gray-600');
                                                      }, 1500);
                                                  }
                                              }}
                                              id="copy-guide-email-btn"
                                              className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-all shrink-0 active:scale-95"
                                            >
                                                복사하기
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {selectedGuide.content && (
                      <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-[0_2px_10px_rgb(0,0,0,0.03)]">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('guide.details')}</h3>
                          <div className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: selectedGuide.content }} />
                      </div>
                    )}
                  </div>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="px-6 pb-0 shrink-0 pt-2">
                <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-0.5">{t('guide.title')}</h1>
                {/* {activeCity && <p className="text-[10px] text-gray-500 dark:text-gray-400">{t('guide.currentCity')}{getLocalizedCityName(activeCity)}</p>} */}
              </div>

              {/* Categories (Horizontal Scroll) */}
              <div className="space-y-2 pt-2 pb-1">
                 <div className="flex overflow-x-auto gap-2 px-6 pb-2 snap-x snap-mandatory scrollbar-hide">
                    {categories.map((cat) => {
                        const isSelected = selectedCategory === cat.id;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => {
                                    if (selectedCategory !== cat.id) {
                                        setSelectedCategory(cat.id as CategoryType);
                                        setInternalKeyword('');
                                    }
                                }}
                                className={`flex-none w-auto flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 h-auto snap-center ${
                                    isSelected 
                                        ? 'bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-500 shadow-md scale-105' 
                                        : 'bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-slate-300 dark:border-slate-500 shadow-sm active:scale-95'
                                }`}
                            >
                                <span className={`font-bold text-sm z-10 text-center leading-tight whitespace-nowrap px-3 py-1 ${
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
              <div 
                className="flex-1 overflow-y-auto px-4 pb-24 space-y-2"
                style={{ 
                    overscrollBehavior: 'contain', 
                    touchAction: 'pan-y',
                    WebkitOverflowScrolling: 'touch' // Ensure smooth scrolling on iOS
                }}
                onPointerDown={(e) => {
                    // IMPORTANT: Stop propagation to prevent drag controls from hijacking scroll
                    e.stopPropagation();
                }}
                onTouchStart={(e) => {
                    // Ensure touch start is also isolated
                    e.stopPropagation();
                }}
              >
                  {/* Search Bar Removed as requested */}

                  {/* Ad List View */}
                  {selectedCategory === 'ad' ? (
                      (Array.isArray(ads) ? ads : []).length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                            <Megaphone className="w-12 h-12 mb-2 opacity-20" />
                            <div className="mb-1 text-sm">暂无广告</div>
                        </div>
                      ) : (
                        (Array.isArray(ads) ? ads : []).map((ad: any) => (
                            <div 
                                key={ad.id}
                                className="bg-white dark:bg-gray-800 rounded-[1rem] p-3 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-300 dark:border-slate-500 hover:shadow-lg transition-all cursor-pointer active:scale-95 duration-200 mb-2 relative overflow-hidden group"
                                onClick={() => {
                                    if (ad.link && !ad.content) {
                                        window.open(ad.link, '_blank');
                                    } else {
                                        // Open detail view for ad
                                        setSelectedGuide({
                                            ...ad,
                                            name: ad.title,
                                            intro: ad.description || '',
                                            avatar: ad.image,
                                            // Map other fields if necessary, or ensure Detail View handles them
                                            title: '广告', // Tag
                                            hasCar: false
                                        });
                                    }
                                }}
                            >
                                <div className={`absolute top-0 right-0 w-16 h-16 ${ad.color || 'bg-pink-500'} opacity-10 rounded-bl-[4rem] -mr-4 -mt-4 transition-transform group-hover:scale-150 duration-500`} />
                                
                                <div className="flex gap-3 items-center relative z-10">
                                    <div className={`w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow-sm bg-gray-100`}>
                                        <img src={ad.image} alt={ad.title} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-1">
                                            <h3 className="text-base font-bold text-gray-900 dark:text-white truncate pr-2">{ad.title}</h3>
                                            {ad.link && <ExternalLink size={14} className="text-gray-400 shrink-0" />}
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{ad.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                      )
                  ) : (
                  /* Filtered List */
                  filteredGuides.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                          <Search className="w-12 h-12 mb-2 opacity-20" />
                          <div className="mb-1 text-sm">{t('common.noResults')}</div>
                          <div className="text-xs">{t('guide.filter')}</div>
                      </div>
                  ) : filteredGuides.map(guide => (
                      <div 
                        key={guide.id} 
                        onClick={() => setSelectedGuide(guide)}
                        className="bg-white dark:bg-gray-800 rounded-[1rem] p-3 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-300 dark:border-slate-500 hover:shadow-lg transition-all cursor-pointer active:scale-95 duration-200 mb-2"
                      >
                          <div className="flex gap-3">
                              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow-sm bg-gray-100">
                                  <img src={guide.avatar} alt={guide.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 flex flex-col justify-between py-0.5">
                                  <div>
                                      <div className="flex justify-between items-start">
                                          <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{guide.name}</h3>
                                          <span className="text-[10px] font-bold text-orange-500">★ {guide.rank || 5.0}</span>
                                      </div>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                                              {guide.category === 'car' ? '렌트카' : guide.category === 'agency' ? '현지여행사' : '가이드'}
                                          </span>
                                          {guide.hasCar && <span className="text-[10px] text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-900/30 px-1.5 py-0.5 rounded-full">{t('guide.hasCar')}</span>}
                                      </div>
                                  </div>
                                  <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                                      {guide.intro?.replace(/<[^>]*>?/gm, '') || t('guide.noIntro')}
                                  </p>
                              </div>
                          </div>
                      </div>
                  ))
                  )}
              </div>
            </>
          )}
        </motion.div>
      </>
      )}
    </AnimatePresence>
  );
}
