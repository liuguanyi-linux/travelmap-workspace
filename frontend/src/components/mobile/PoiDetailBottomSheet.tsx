import React, { useEffect, useState } from 'react';
import { motion, PanInfo, useAnimation, useDragControls } from 'framer-motion';
import { X, Navigation, Star, Phone, Clock, MapPin, Heart, Trash2, Send, Loader2, Navigation2, ChevronLeft, ChevronRight, Image as ImageIcon, ChevronUp, ChevronDown, Share2 } from 'lucide-react';
import { toast } from 'sonner';

import { getFullImageUrl } from '../../utils/image';

import { useFavorites } from '../../hooks/useFavorites';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { getReviews, createReview, deleteReview } from '../../api';

interface PoiDetailBottomSheetProps {
  poi: any;
  isOpen: boolean;
  onClose: () => void;
  onLightboxChange?: (isOpen: boolean) => void;
}

interface Review {
  id: number;
  rating: number;
  content: string;
  type?: string;
  customNickname?: string;
  nickname?: string;
  user?: {
    nickname?: string | null;
    name?: string | null;
    email?: string;
  };
  createdAt: string;
}

// Robust Image Component with Fallback
const SafeImage = ({ src, alt, className, onClick }: { src: string, alt: string, className?: string, onClick?: () => void }) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Handle relative paths - ensure they start with / if missing (though usually browser handles this)
  // Also fix potential double slashes if prepending base url
  const finalSrc = src; 

  if (error || !src) {
    return (
      <div 
        className={`flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400 ${className}`}
        onClick={onClick}
      >
        <ImageIcon size={24} className="mb-1 opacity-50" />
        <span className="text-[10px]">无法加载</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`} onClick={onClick}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 z-10">
           <Loader2 className="animate-spin text-gray-400" size={20} />
        </div>
      )}
      <img
        src={finalSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
        onError={() => {
            console.warn('Image failed to load:', src);
            setError(true);
            setLoading(false);
        }}
        onLoad={() => setLoading(false)}
      />
    </div>
  );
};

export default function PoiDetailBottomSheet({ poi, isOpen, onClose, onLightboxChange }: PoiDetailBottomSheetProps) {
  const controls = useAnimation();
  const dragControls = useDragControls();
  const [viewState, setViewState] = useState<'hidden' | 'peek' | 'full'>('hidden');
  const { isFavorite, toggleFavorite } = useFavorites();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { spotCategories } = useData();
  const isAdmin = user?.email === 'admin@travelmap.com';
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5); // Default 5 stars
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  useEffect(() => {
    if (onLightboxChange) {
      onLightboxChange(previewIndex !== null);
    }
  }, [previewIndex, onLightboxChange]);

  const targetIdForFav = poi ? String(poi.id || poi.amapId) : '';
  const isFav = isFavorite(targetIdForFav, 'poi');

  useEffect(() => {
    if (isOpen) {
      setViewState('full');
      if (poi) {
          setNewRating(5);
          const targetId = poi.id || poi.amapId;
          if (targetId) {
              fetchReviewsInternal(targetId);
          }
          if (poi.id && !poi.amapId) {
              fetch('/api/spots/' + poi.id + '/view', { method: 'POST' });
          }
      }
    } else {
      setViewState('hidden');
    }
  }, [isOpen, poi]);

  // Fetch reviews for internal numeric ID
  const fetchReviewsInternal = async (id: number | string) => {
    try {
        const data = await getReviews(id);
        console.log("前端接收到的真实评论数据 (Internal):", data); // DEBUG LOG
        setReviews(data || []); // Ensure we always set an array
    } catch (error) {
        console.error('Failed to fetch reviews:', error);
        setReviews([]);
    }
  };

  const handlePublishComment = async () => {
      // Removed user check - allow guest reviews
      if (!newComment.trim() || !poi) return;
      
      setIsSubmitting(true);
      try {
          const targetId = poi.id || poi.amapId;
          
          const userInfo = user ? {
              nickname: user.nickname || user.email?.split('@')[0] || String(user.id),
              avatar: (user as any).avatar || (user as any).avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`
          } : {
              nickname: '익명 사용자', // Anonymous User
              avatar: undefined
          };

          await createReview(String(user?.id || ''), targetId, newRating, newComment, userInfo);
          setNewComment('');
          setNewRating(5);
          fetchReviewsInternal(targetId);
      } catch (error) {
          console.error('Failed to publish comment:', error);
      } finally {
          setIsSubmitting(false);
      }
  };

  const handleDeleteComment = async (reviewId: number) => {
      if (!isAdmin) return;
      if (!confirm('确定要删除这条评论吗？')) return;
      try {
          await deleteReview(reviewId);
          setReviews(reviews.filter(r => r.id !== reviewId));
      } catch (error) {
          console.error('Failed to delete comment:', error);
      }
  };

  const cardHeight = viewState === 'peek' ? '40vh' : '85vh';

  if (!poi) return null;

  return (
    <div className="fixed inset-0 z-[10001] pointer-events-none flex flex-col justify-end">
        {/* Image Preview Modal */}
        {previewIndex !== null && poi.photos && (
            <div 
              className="fixed inset-0 z-[60] bg-black flex items-center justify-center p-4 pointer-events-auto"
              onClick={() => setPreviewIndex(null)}
            >
              <button 
                className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 z-20"
                onClick={(e) => { e.stopPropagation(); setPreviewIndex(null); }}
              >
                <X size={24} />
              </button>

              {/* Navigation Buttons */}
              {poi.photos.length > 1 && (
                <>
                  <button 
                    className="absolute left-4 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 z-20 backdrop-blur-sm transition-colors"
                    onClick={(e) => {
                        e.stopPropagation();
                        setPreviewIndex((prev) => (prev !== null ? (prev - 1 + poi.photos.length) % poi.photos.length : 0));
                    }}
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button 
                    className="absolute right-4 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 z-20 backdrop-blur-sm transition-colors"
                    onClick={(e) => {
                        e.stopPropagation();
                        setPreviewIndex((prev) => (prev !== null ? (prev + 1) % poi.photos.length : 0));
                    }}
                  >
                    <ChevronRight size={24} />
                  </button>
                  
                  {/* Counter */}
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-black/50 backdrop-blur-md rounded-full text-white text-sm font-medium z-20">
                    {previewIndex + 1} / {poi.photos.length}
                  </div>
                </>
              )}

              <div className="relative w-full h-full flex items-center justify-center">
                  <motion.img 
                    key={previewIndex}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    src={(() => {
                        const p = poi.photos[previewIndex];
                        return getFullImageUrl(typeof p === 'string' ? p : p.url);
                    })()}
                    alt="Preview" 
                    className="max-w-full max-h-full object-contain rounded-lg select-none shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(e, { offset, velocity }) => {
                      const swipe = offset.x;
                      if (swipe < -50) {
                         setPreviewIndex((prev) => (prev !== null ? (prev + 1) % poi.photos.length : 0));
                      } else if (swipe > 50) {
                         setPreviewIndex((prev) => (prev !== null ? (prev - 1 + poi.photos.length) % poi.photos.length : 0));
                      }
                    }}
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null; 
                        // Use a reliable placeholder or just a generic error image
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM2NjYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cmVjdCB4PSIzIiB5PSIzIiB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHJ4PSIyIiByeT0iMiIvPjxjaXJjbGUgY3g9IjguNSIgY3k9IjguNSIgcj0iMS41Ii8+PHBvbHlsaW5lIHBvaW50cz0iMjEgMTUgMTYgMTAgNSAyMSIvPjwvc3ZnPg==';
                        target.className = "w-24 h-24 opacity-50"; // Make it small and subtle
                     }} 
                  />
              </div>
            </div>
        )}
        
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: '0%' }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className={`absolute bottom-0 left-0 right-0 mx-auto w-[96%] max-w-[500px] bg-slate-50/95 dark:bg-gray-900/95 backdrop-blur-md rounded-t-[2.5rem] shadow-[0_-5px_25px_rgba(0,0,0,0.2)] border-t border-x border-gray-200 dark:border-gray-800 overflow-hidden pointer-events-auto flex flex-col will-change-transform transition-[height] duration-500 ease-in-out ${viewState === 'peek' ? 'h-[40vh]' : 'h-[75vh]'}`}
        >
          {/* Drag Handle Area */}
          <div
            className="w-full flex justify-center pt-3 pb-2 cursor-pointer bg-transparent z-20 shrink-0 touch-none items-center gap-2"
            onClick={() => setViewState(prev => prev === 'peek' ? 'full' : 'peek')}
          >
            <div className="flex items-center gap-2 px-3 py-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-full shadow-sm border border-gray-200/60 dark:border-gray-700/60">
              {viewState === 'full' ? (
                  <ChevronDown className="text-gray-600 dark:text-gray-300" size={20} />
              ) : (
                  <ChevronUp className="text-gray-600 dark:text-gray-300" size={20} />
              )}
              <span className="text-xs text-gray-600 dark:text-gray-300 font-medium tracking-wide">{t('clickToToggle')}</span>
            </div>
          </div>

          {/* Content Container */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
              
              {/* Header Info (Always visible) - Also Draggable */}
              <div
                className="px-6 pb-1 bg-transparent z-10 shrink-0"
              >
                <div className="flex justify-between items-start">
                    <div className="flex-1 mr-2">
                        <h2 className="text-xl font-bold text-gray-900 leading-tight mb-0.5 tracking-tight">{poi.name}</h2>
                        {poi.cnName && (
                            // <div className="text-xs text-gray-500 mb-2">{poi.cnName}</div>
                            null
                        )}
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-0 hidden">
                            <div className="flex items-center gap-0.5 bg-yellow-50 px-1.5 py-0.5 rounded">
                                <Star size={10} fill="#EAB308" className="text-yellow-500" />
                                <span className="font-bold text-yellow-700">4.8</span>
                            </div>
                            <span className="text-gray-300">|</span>
                            <span className="bg-gray-50 px-1.5 py-0.5 rounded text-gray-600">
                                {spotCategories?.find(c => poi.tags?.includes(c.key))?.name || 
                                 spotCategories?.find(c => c.key === (poi.type?.split(';')[0]))?.name || 
                                 poi.tags?.[0] || 
                                 poi.type?.split(';')[0] || 
                                 t('common.unknownPlace')}
                            </span>
                        </div>
                        {/* <div className="flex items-center text-gray-500 text-xs">
                            <MapPin size={12} className="mr-1 shrink-0 text-gray-400" />
                            <span className="truncate">{poi.address || t('detail.noContact')}</span>
                        </div> */}
                    </div>
                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 shrink-0">
                        <button
                            onClick={onClose}
                            onPointerDown={(e) => e.stopPropagation()}
                            className="p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-full shadow-sm border border-gray-200/60 dark:border-gray-700/60 text-gray-600 dark:text-gray-300 hover:bg-white transition-colors self-end"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>
              </div>

              {/* Scrollable Content (Visible in Full Mode or scrolling in Peek?) */}
              <div className="flex-1 overflow-y-auto bg-gray-50/50 pb-64">
                  {/* Photos Section */}
                  <div className="mt-1 mb-2">
                      <div className="flex gap-2 px-6 overflow-x-auto pb-2 scrollbar-hide snap-x">
                          {poi.photos && poi.photos.length > 0 ? (
                              poi.photos.map((photo: any, index: number) => {
                                  const imgSrc = getFullImageUrl(typeof photo === 'string' ? photo : photo.url);
                                  
                                  return (
                                      <div 
                                        key={index} 
                                        className="w-32 h-24 shrink-0 rounded-xl overflow-hidden bg-gray-200 snap-center shadow-sm relative cursor-pointer"
                                      >
                                          <SafeImage 
                                            src={imgSrc} 
                                            alt={typeof photo === 'string' ? poi.name : (photo.title || poi.name)} 
                                            className="w-full h-full rounded-xl"
                                            onClick={() => setPreviewIndex(index)}
                                          />
                                      </div>
                                  );
                              })
                          ) : (
                              [1, 2, 3].map((i) => (
                                  <div key={i} className="w-32 h-24 shrink-0 rounded-xl overflow-hidden bg-gray-200 snap-center shadow-sm relative">
                                      <img 
                                        src={`https://picsum.photos/seed/${poi.id || 'poi'}${i}/300/200`} 
                                        alt="Preview" 
                                        className="w-full h-full object-cover"
                                      />
                                      <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                          <span className="text-white text-[10px] font-medium bg-black/20 backdrop-blur-md px-2 py-1 rounded-full">暂无实景</span>
                                      </div>
                                  </div>
                              ))
                          )}
                      </div>
                  </div>

                  {/* Copy Info Section (Name & Address) */}
                  <div className="mt-2 mb-2 px-6">
                      <div className="bg-white p-3 rounded-[1.5rem] shadow-[0_2px_10px_rgb(0,0,0,0.03)] flex flex-col gap-2">
                          {/* Name Copy Row */}
                          <div className="flex items-center justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                  <p className="text-[10px] text-gray-500 mb-0.5">{t('cityDrawer.place')}</p>
                                  <p className="font-bold text-gray-900 text-sm truncate">{poi.cnName || poi.name}</p>
                              </div>
                              <button 
                                onClick={() => {
                                    const text = poi.cnName || poi.name;
                                    // Try Clipboard API first
                                    if (navigator.clipboard && window.isSecureContext) {
                                        navigator.clipboard.writeText(text).catch(() => {
                                            // Fallback if API fails
                                            const textArea = document.createElement("textarea");
                                            textArea.value = text;
                                            textArea.style.position = "fixed";
                                            textArea.style.left = "-9999px";
                                            document.body.appendChild(textArea);
                                            textArea.focus();
                                            textArea.select();
                                            try {
                                                document.execCommand('copy');
                                            } catch (err) {
                                                console.error('Copy failed', err);
                                            }
                                            document.body.removeChild(textArea);
                                        });
                                    } else {
                                        // Fallback for non-secure context
                                        const textArea = document.createElement("textarea");
                                        textArea.value = text;
                                        textArea.style.position = "fixed";
                                        textArea.style.left = "-9999px";
                                        document.body.appendChild(textArea);
                                        textArea.focus();
                                        textArea.select();
                                        try {
                                            document.execCommand('copy');
                                        } catch (err) {
                                            console.error('Copy failed', err);
                                        }
                                        document.body.removeChild(textArea);
                                    }

                                    // Visual Feedback
                                    const btn = document.getElementById('copy-name-btn');
                                    if (btn) {
                                        const originalText = btn.innerText;
                                        btn.innerText = t('detail.saved'); // Using 'Saved' as 'Copied' temporarily or add 'Copied' key
                                        btn.classList.add('bg-green-600', 'text-white');
                                        btn.classList.remove('bg-gray-100', 'text-gray-600');
                                        setTimeout(() => {
                                            btn.innerText = originalText;
                                            btn.classList.remove('bg-green-600', 'text-white');
                                            btn.classList.add('bg-gray-100', 'text-gray-600');
                                        }, 1500);
                                    }
                                }}
                                id="copy-name-btn"
                                className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-all shrink-0 active:scale-95"
                              >
                                  {t('cityDrawer.copyName')}
                              </button>
                          </div>
                          
                          {/* Divider */}
                          <div className="h-px bg-gray-100" />
                          
                          {/* Address Copy Row */}
                          <div className="flex items-center justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                  <p className="text-[10px] text-gray-500 mb-0.5">{t('cityDrawer.address')}</p>
                                  <p className="font-medium text-gray-700 text-xs truncate">{poi.address || t('cityDrawer.noAddress')}</p>
                              </div>
                              <button 
                                onClick={() => {
                                    if (poi.address) {
                                        const text = poi.address;
                                        // Try Clipboard API first
                                        if (navigator.clipboard && window.isSecureContext) {
                                            navigator.clipboard.writeText(text).catch(() => {
                                                // Fallback
                                                const textArea = document.createElement("textarea");
                                                textArea.value = text;
                                                textArea.style.position = "fixed";
                                                textArea.style.left = "-9999px";
                                                document.body.appendChild(textArea);
                                                textArea.focus();
                                                textArea.select();
                                                try {
                                                    document.execCommand('copy');
                                                } catch (err) {
                                                    console.error('Copy failed', err);
                                                }
                                                document.body.removeChild(textArea);
                                            });
                                        } else {
                                            // Fallback for non-secure context
                                            const textArea = document.createElement("textarea");
                                            textArea.value = text;
                                            textArea.style.position = "fixed";
                                            textArea.style.left = "-9999px";
                                            document.body.appendChild(textArea);
                                            textArea.focus();
                                            textArea.select();
                                            try {
                                                document.execCommand('copy');
                                            } catch (err) {
                                                console.error('Copy failed', err);
                                            }
                                            document.body.removeChild(textArea);
                                        }

                                        // Visual Feedback
                                        const btn = document.getElementById('copy-addr-btn');
                                        if (btn) {
                                            const originalText = btn.innerText;
                                            btn.innerText = t('detail.saved');
                                            btn.classList.add('bg-green-600', 'text-white');
                                            btn.classList.remove('bg-gray-100', 'text-gray-600');
                                            setTimeout(() => {
                                                btn.innerText = originalText;
                                                btn.classList.remove('bg-green-600', 'text-white');
                                                btn.classList.add('bg-gray-100', 'text-gray-600');
                                            }, 1500);
                                        }
                                    }
                                }}
                                id="copy-addr-btn"
                                className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-all shrink-0 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!poi.address}
                              >
                                  {t('cityDrawer.copyAddress')}
                              </button>
                          </div>
                          
                          {/* 联系方式 */}
                          {poi.phone && (
                              <>
                                <div className="h-px bg-gray-100" />
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] text-gray-500 mb-0.5">전화번호</p>
                                        <p className="font-medium text-gray-700 text-xs truncate">{poi.phone}</p>
                                    </div>
                                    <button 
                                      onClick={() => {
                                          const text = poi.phone || '';
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
                                          const btn = document.getElementById('copy-phone-btn');
                                          if (btn) {
                                              const originalText = btn.innerText;
                                              btn.innerText = t('detail.saved');
                                              btn.classList.add('bg-green-600', 'text-white');
                                              btn.classList.remove('bg-gray-100', 'text-gray-600');
                                              setTimeout(() => {
                                                  btn.innerText = originalText;
                                                  btn.classList.remove('bg-green-600', 'text-white');
                                                  btn.classList.add('bg-gray-100', 'text-gray-600');
                                              }, 1500);
                                          }
                                      }}
                                      id="copy-phone-btn"
                                      className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-all shrink-0 active:scale-95"
                                    >
                                        복사하기
                                    </button>
                                </div>
                              </>
                          )}
                          {poi.wechat && (
                              <>
                                <div className="h-px bg-gray-100" />
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] text-gray-500 mb-0.5">위챗 ID</p>
                                        <p className="font-medium text-gray-700 text-xs truncate">{poi.wechat}</p>
                                    </div>
                                    <button 
                                      onClick={() => {
                                          const text = poi.wechat || '';
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
                                          const btn = document.getElementById('copy-wechat-btn');
                                          if (btn) {
                                              const originalText = btn.innerText;
                                              btn.innerText = t('detail.saved');
                                              btn.classList.add('bg-green-600', 'text-white');
                                              btn.classList.remove('bg-gray-100', 'text-gray-600');
                                              setTimeout(() => {
                                                  btn.innerText = originalText;
                                                  btn.classList.remove('bg-green-600', 'text-white');
                                                  btn.classList.add('bg-gray-100', 'text-gray-600');
                                              }, 1500);
                                          }
                                      }}
                                      id="copy-wechat-btn"
                                      className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-all shrink-0 active:scale-95"
                                    >
                                        복사하기
                                    </button>
                                </div>
                              </>
                          )}
                          {poi.kakao && (
                              <>
                                <div className="h-px bg-gray-100" />
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] text-gray-500 mb-0.5">카카오톡 ID</p>
                                        <p className="font-medium text-gray-700 text-xs truncate">{poi.kakao}</p>
                                    </div>
                                    <button 
                                      onClick={() => {
                                          const text = poi.kakao || '';
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
                                          const btn = document.getElementById('copy-kakao-btn');
                                          if (btn) {
                                              const originalText = btn.innerText;
                                              btn.innerText = t('detail.saved');
                                              btn.classList.add('bg-green-600', 'text-white');
                                              btn.classList.remove('bg-gray-100', 'text-gray-600');
                                              setTimeout(() => {
                                                  btn.innerText = originalText;
                                                  btn.classList.remove('bg-green-600', 'text-white');
                                                  btn.classList.add('bg-gray-100', 'text-gray-600');
                                              }, 1500);
                                          }
                                      }}
                                      id="copy-kakao-btn"
                                      className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-all shrink-0 active:scale-95"
                                    >
                                        복사하기
                                    </button>
                                </div>
                              </>
                          )}
                          {poi.email && (
                              <>
                                <div className="h-px bg-gray-100" />
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] text-gray-500 mb-0.5">이메일</p>
                                        <p className="font-medium text-gray-700 text-xs truncate">{poi.email}</p>
                                    </div>
                                    <button 
                                      onClick={() => {
                                          const text = poi.email || '';
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
                                          const btn = document.getElementById('copy-email-btn');
                                          if (btn) {
                                              const originalText = btn.innerText;
                                              btn.innerText = t('detail.saved');
                                              btn.classList.add('bg-green-600', 'text-white');
                                              btn.classList.remove('bg-gray-100', 'text-gray-600');
                                              setTimeout(() => {
                                                  btn.innerText = originalText;
                                                  btn.classList.remove('bg-green-600', 'text-white');
                                                  btn.classList.add('bg-gray-100', 'text-gray-600');
                                              }, 1500);
                                          }
                                      }}
                                      id="copy-email-btn"
                                      className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-all shrink-0 active:scale-95"
                                    >
                                        복사하기
                                    </button>
                                </div>
                              </>
                          )}
                      </div>
                  </div>

                  {/* Detailed Info */}
                  <div className="px-6 space-y-2">
                      {/* Introduction - Only show if content exists */}
                      {poi.content && poi.content !== '<p><br></p>' && (
                          <div className="bg-white p-3 rounded-[1.5rem] shadow-[0_2px_10px_rgb(0,0,0,0.03)]">
                              {/* Title Removed as requested */}
                              {/* <h3 className="font-bold text-gray-900 mb-2 text-sm">内容</h3> */}
                              <div className="text-gray-600 leading-relaxed text-justify whitespace-pre-line text-xs" dangerouslySetInnerHTML={{ __html: poi.content }} />
                          </div>
                      )}
                      
                      {/* Reviews Preview */}
                      <div className="bg-white p-3 rounded-[1.5rem] shadow-[0_2px_10px_rgb(0,0,0,0.03)] mb-4">
                          <div className="flex justify-between items-center mb-3">
                              <h3 className="font-bold text-gray-900 text-sm">{t('detail.visitorReviews')}</h3>
                              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{reviews.length} {t('detail.reviewsCount')}</span>
                          </div>
                          
                          {/* Review Input - Always visible for Guest Reviews */}
                          <div className="mb-4">
                              <div className="flex items-center gap-2 mb-2">
                                  <div className="flex gap-1">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                          <button
                                              key={star}
                                              onClick={() => setNewRating(star)}
                                              className="focus:outline-none transition-transform hover:scale-110 p-1"
                                          >
                                              <Star
                                                  size={20}
                                                  className={`${
                                                      star <= newRating
                                                          ? 'fill-yellow-400 text-yellow-400'
                                                          : 'text-gray-300 dark:text-gray-600'
                                                  }`}
                                              />
                                          </button>
                                      ))}
                                  </div>
                              </div>
                              <textarea 
                                  className="w-full p-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/20 outline-none transition-all resize-none text-xs placeholder-gray-400 dark:placeholder-gray-500 text-gray-800 dark:text-white"
                                  placeholder={t('detail.shareExperience')}
                                  rows={2}
                                  value={newComment}
                                  onChange={(e) => setNewComment(e.target.value)}
                              />
                              <div className="flex justify-end mt-2">
                                  <button 
                                      className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full px-4 py-1.5 text-xs font-bold flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-gray-200 dark:shadow-none active:scale-95 transition-all"
                                      onClick={handlePublishComment}
                                      disabled={isSubmitting || !newComment.trim()}
                                  >
                                      {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                                      {t('detail.publishReview')}
                                  </button>
                              </div>
                          </div>

                          {/* Reviews List */}
                          <div className="space-y-3">
                              {reviews.length === 0 ? (
                                  <div className="text-center py-4 text-gray-400 dark:text-gray-500 text-xs">{t('detail.noReviews')}</div>
                              ) : (
                                  reviews.map(review => (
                                      <div key={review.id} className="border-b border-gray-50 dark:border-gray-700 last:border-0 pb-3 last:pb-0">
                                          <div className="flex justify-between items-center mb-1">
                                              <span className="font-bold text-gray-900 dark:text-white text-xs">
                                                  {review.customNickname || 
                                                   review.user?.nickname || 
                                                   review.user?.name || 
                                                   review.user?.email || 
                                                   '방문자'}
                                              </span>
                                              <div className="flex items-center gap-3">
                                              <div className="flex text-yellow-400 scale-90 origin-right">
                                                  {[...Array(5)].map((_, i) => (
                                                      <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} className={i >= review.rating ? "text-gray-200 dark:text-gray-600" : ""} />
                                                  ))}
                                              </div>
                                              {isAdmin && (
                                                  <button 
                                                      onClick={() => handleDeleteComment(review.id)}
                                                      className="text-gray-300 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 p-1 transition-colors"
                                                  >
                                                      <Trash2 size={14} />
                                                  </button>
                                              )}
                                          </div>
                                          </div>
                                          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 whitespace-pre-wrap leading-relaxed">
                                              {review.content}
                                          </p>
                                          <div className="text-xs text-gray-400 dark:text-gray-500 mt-2 font-medium">
                                              {new Date(review.createdAt).toLocaleDateString()}
                                          </div>
                                      </div>
                                  ))
                              )}
                          </div>
                      </div>
                  </div>
              </div>
          </div>

          {/* Fixed Bottom Buttons */}
          <div className="absolute bottom-0 left-0 right-0 p-4 pb-6 bg-slate-50/95 dark:bg-gray-900/95 border-t border-gray-200/50 dark:border-gray-800 flex gap-3 z-[10002] shadow-[0_-5px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_-5px_20px_rgba(0,0,0,0.3)] transition-colors duration-300">
              <button
                onClick={() => {
                    const url = `${window.location.origin}/?open=spot&id=${poi.id || poi.amapId}`;
                    // 强制使用剪贴板复制，不调用系统原生分享菜单
                    navigator.clipboard.writeText(url).then(() => {
                        toast.success(t('messages.linkCopied') || '링크가 복사되었습니다!');
                    }).catch(err => {
                        console.error('Copy failed:', err);
                        // 降级处理方案：使用传统 execCommand
                        const textArea = document.createElement("textarea");
                        textArea.value = url;
                        document.body.appendChild(textArea);
                        textArea.focus();
                        textArea.select();
                        try {
                            document.execCommand('copy');
                            toast.success(t('messages.linkCopied') || '링크가 복사되었습니다!');
                        } catch (err) {
                            toast.error('Copy failed');
                        }
                        document.body.removeChild(textArea);
                    });
                }}
                className="flex-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-2xl font-bold text-sm shadow-sm active:scale-95 transition-transform flex items-center justify-center gap-2 py-2.5 border border-blue-200 dark:border-blue-800"
              >
                  <Share2 size={16} />
                  <span>{t('detail.share') || '공유하기'}</span>
              </button>

              <button 
                onClick={async () => {
                    if (!user) {
                        toast.error(t('detail.loginToReview').replace('Review', 'Save'));
                        return;
                    }
                    try {
                        const payload = {
                            id: targetIdForFav,
                            name: poi.name,
                            type: 'poi', // Force 'poi' to prevent type pollution
                            address: poi.address,
                            location: poi.location,
                            imageUrl: `https://picsum.photos/seed/${targetIdForFav || 'poi'}/300/200`
                        };
                        console.log("👉 1. Clicked (PoiDetail)! Ready to send Payload:", payload);
                        await toggleFavorite(payload);
                        if (isFav) {
                            toast.success(t('detail.unsaved') || '저장 취소되었습니다');
                        } else {
                            toast.success(t('detail.saved') || '저장되었습니다');
                        }
                    } catch (e) {
                        // Error handled in context
                    }
                }}
                className="flex-1 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 rounded-2xl font-bold text-sm shadow-sm active:scale-95 transition-transform flex items-center justify-center gap-2 py-2.5 border border-rose-200 dark:border-rose-800"
              >
                  <Heart size={16} fill={isFav ? "currentColor" : "none"} className={isFav ? "text-red-500" : ""} />
                  <span>{isFav ? t('detail.saved') : t('detail.save')}</span>
              </button>
          </div>

        </motion.div>
    </div>
  );
}
