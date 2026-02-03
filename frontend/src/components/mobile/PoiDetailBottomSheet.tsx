import React, { useEffect, useState } from 'react';
import { motion, PanInfo, useAnimation, useDragControls } from 'framer-motion';
import { X, Navigation, Star, Share2, Phone, Clock, MapPin, Heart, Trash2, Send, Loader2 } from 'lucide-react';
import { useFavorites } from '../../hooks/useFavorites';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { getReviews, createReview, deleteReview } from '../../api';

interface PoiDetailBottomSheetProps {
  poi: any;
  isOpen: boolean;
  onClose: () => void;
}

interface Review {
  id: number;
  rating: number;
  content: string;
  user: {
    nickname: string | null;
    email: string;
  };
  createdAt: string;
}

export default function PoiDetailBottomSheet({ poi, isOpen, onClose }: PoiDetailBottomSheetProps) {
  const controls = useAnimation();
  const dragControls = useDragControls();
  const [viewState, setViewState] = useState<'hidden' | 'peek' | 'full'>('hidden');
  const { isFavorite, toggleFavorite } = useFavorites();
  const { t } = useLanguage();
  const { user } = useAuth();
  const isAdmin = user?.email === 'admin@travelmap.com';
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isFav = poi ? isFavorite(poi.id) : false;

  useEffect(() => {
    if (isOpen) {
      setViewState('peek');
      controls.start('peek');
      if (poi && poi.id) {
          fetchReviews(poi.id);
      }
    } else {
      setViewState('hidden');
      controls.start('hidden');
    }
  }, [isOpen, controls, poi]);

  const fetchReviews = async (amapId: string) => {
      try {
          const data = await getReviews(amapId);
          // Map to expected format
          const formattedReviews = data.map((r: any) => ({
              id: r.id,
              rating: r.rating,
              content: r.content,
              user: {
                  nickname: r.username || 'User',
                  email: 'user@example.com' 
              },
              createdAt: r.created_at || r.createdAt
          }));
          setReviews(formattedReviews);
      } catch (error) {
          console.error('Failed to fetch reviews:', error);
      }
  };

  const handlePublishComment = async () => {
      if (!user || !newComment.trim() || !poi) return;
      
      setIsSubmitting(true);
      try {
          await createReview(user.id, poi.id, 5, newComment);
          setNewComment('');
          fetchReviews(poi.id);
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

  const variants = {
    hidden: { y: '100%' },
    peek: { y: '65%' }, // Show bottom 35%
    full: { y: '0%' }   // Full screen
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    const { offset, velocity } = info;
    const isFast = Math.abs(velocity.y) > 500;
    
    // Current visual position (roughly) can be inferred from state + offset
    // But easier to just use logic based on direction and distance
    
    if (offset.y < -50 || (velocity.y < -500 && offset.y < 0)) {
        // Dragging UP
        if (viewState === 'peek') {
            setViewState('full');
            controls.start('full');
        } else {
            // Already full, snap back to full
            controls.start('full');
        }
    } else if (offset.y > 50 || (velocity.y > 500 && offset.y > 0)) {
        // Dragging DOWN
        if (viewState === 'full') {
            setViewState('peek');
            controls.start('peek');
        } else if (viewState === 'peek') {
            // Close
            onClose();
        }
    } else {
        // Revert to current state
        controls.start(viewState);
    }
  };

  if (!poi) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex flex-col justify-end">
        {/* Backdrop - only visible when full screen? Or never? 
            User said: "map still scalable/movable when panel at 1/3".
            So no backdrop in peek mode. In full mode maybe?
            Let's skip backdrop for now to keep it clean/modern.
        */}
        
        <motion.div
          initial="hidden"
          animate={controls}
          variants={variants}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          drag="y"
          dragControls={dragControls}
          dragListener={false} // Only drag via handle or header
          dragConstraints={{ top: 0 }}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
          className="absolute left-0 right-0 h-[100vh] bg-white rounded-t-[2.5rem] shadow-[0_-10px_60px_rgba(0,0,0,0.1)] overflow-hidden pointer-events-auto flex flex-col"
        >
          {/* Drag Handle Area - Active Drag Zone */}
          <div 
            className="w-full flex justify-center pt-5 pb-3 cursor-grab active:cursor-grabbing bg-white z-20 shrink-0"
            onPointerDown={(e) => dragControls.start(e)}
          >
            <div className="w-10 h-1 bg-gray-200 rounded-full" />
          </div>

          {/* Content Container */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
              
              {/* Header Info (Always visible) */}
              <div className="px-8 pb-6 bg-white z-10 shrink-0">
                <div className="flex justify-between items-start">
                    <div className="flex-1 mr-4">
                        <h2 className="text-3xl font-bold text-gray-900 leading-tight mb-3 tracking-tight">{poi.name}</h2>
                        <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
                            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                                <Star size={14} fill="#EAB308" className="text-yellow-500" />
                                <span className="font-bold text-yellow-700">4.8</span>
                            </div>
                            <span className="text-gray-300">|</span>
                            <span className="bg-gray-50 px-2 py-1 rounded-lg text-gray-600">{poi.type?.split(';')[0] || t('common.unknownPlace')}</span>
                            <span className="text-gray-300">|</span>
                            <span>1.2km</span>
                        </div>
                        <div className="flex items-center text-gray-500 text-sm">
                            <MapPin size={16} className="mr-1.5 shrink-0 text-gray-400" />
                            <span className="truncate">{poi.address || t('detail.noContact')}</span>
                        </div>
                    </div>
                    {/* Close Button for Peek Mode */}
                    <button 
                        onClick={onClose} 
                        className="p-2.5 bg-gray-50 rounded-full hover:bg-gray-100 shrink-0 transition-colors"
                    >
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>
              </div>

              {/* Scrollable Content (Visible in Full Mode or scrolling in Peek?) */}
              <div className="flex-1 overflow-y-auto bg-gray-50/50 pb-28">
                  {/* Horizontal Photos */}
                  <div className="mt-4 mb-8">
                      <div className="flex gap-4 px-8 overflow-x-auto pb-4 scrollbar-hide snap-x">
                          {poi.photos && poi.photos.length > 0 ? (
                              poi.photos.map((photo: any, index: number) => (
                                  <div key={index} className="w-44 h-32 shrink-0 rounded-3xl overflow-hidden bg-gray-200 snap-center shadow-md relative">
                                      <img 
                                        src={photo.url} 
                                        alt={photo.title || poi.name} 
                                        className="w-full h-full object-cover"
                                      />
                                  </div>
                              ))
                          ) : (
                              [1, 2, 3].map((i) => (
                                  <div key={i} className="w-44 h-32 shrink-0 rounded-3xl overflow-hidden bg-gray-200 snap-center shadow-sm relative">
                                      <img 
                                        src={`https://picsum.photos/seed/${poi.id || 'poi'}${i}/300/200`} 
                                        alt="Preview" 
                                        className="w-full h-full object-cover"
                                      />
                                      <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                          <span className="text-white text-xs font-medium bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full">暂无实景</span>
                                      </div>
                                  </div>
                              ))
                          )}
                      </div>
                  </div>

                  {/* Detailed Info */}
                  <div className="px-6 space-y-4">
                      {/* Hours & Phone */}
                      <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white p-5 rounded-[2rem] shadow-[0_2px_10px_rgb(0,0,0,0.03)]">
                              <div className="flex items-center gap-2 mb-3 text-gray-400">
                                  <Clock size={18} />
                                  <span className="text-xs font-bold uppercase tracking-wider">{t('detail.openTime')}</span>
                              </div>
                              <div className="font-bold text-xl text-gray-900 mb-1">09:00 - 22:00</div>
                              <div className="text-xs font-medium text-green-600 bg-green-50 inline-block px-2 py-1 rounded-lg">{t('detail.operating')}</div>
                          </div>
                          <div className="bg-white p-5 rounded-[2rem] shadow-[0_2px_10px_rgb(0,0,0,0.03)]">
                              <div className="flex items-center gap-2 mb-3 text-gray-400">
                                  <Phone size={18} />
                                  <span className="text-xs font-bold uppercase tracking-wider">{t('detail.phone')}</span>
                              </div>
                              <div className="font-bold text-xl text-gray-900 truncate mb-1">021-12345678</div>
                              <div className="text-xs font-medium text-blue-600 bg-blue-50 inline-block px-2 py-1 rounded-lg">{t('detail.clickToCall')}</div>
                          </div>
                      </div>

                      {/* Introduction */}
                      <div className="bg-white p-6 rounded-[2rem] shadow-[0_2px_10px_rgb(0,0,0,0.03)]">
                          <h3 className="font-bold text-gray-900 mb-4 text-xl">{t('detail.intro')}</h3>
                          <p className="text-gray-600 leading-relaxed text-justify">
                              {t('detail.introDesc', { name: poi.name }).replace('{name}', poi.name)}
                              <br/><br/>
                          </p>
                      </div>
                      
                      {/* Reviews Preview */}
                      <div className="bg-white p-6 rounded-[2rem] shadow-[0_2px_10px_rgb(0,0,0,0.03)] mb-8">
                          <div className="flex justify-between items-center mb-6">
                              <h3 className="font-bold text-gray-900 text-xl">{t('detail.visitorReviews')}</h3>
                              <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{reviews.length} 条</span>
                          </div>
                          
                          {/* Review Input */}
                          {user ? (
                              <div className="mb-8">
                                  <textarea 
                                      className="w-full p-4 bg-gray-50 dark:bg-gray-700 border-none rounded-2xl focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/20 outline-none transition-all resize-none text-sm placeholder-gray-400 dark:placeholder-gray-500 text-gray-800 dark:text-white"
                                      placeholder="分享您的游玩体验..."
                                      rows={3}
                                      value={newComment}
                                      onChange={(e) => setNewComment(e.target.value)}
                                  />
                                  <div className="flex justify-end mt-3">
                                      <button 
                                          className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full px-6 py-2.5 text-sm font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-gray-200 dark:shadow-none active:scale-95 transition-all"
                                          onClick={handlePublishComment}
                                          disabled={isSubmitting || !newComment.trim()}
                                      >
                                          {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                          发布评论
                                      </button>
                                  </div>
                              </div>
                          ) : (
                              <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-2xl text-center text-gray-500 dark:text-gray-400 text-sm font-medium">
                                  登录后即可发表评论
                              </div>
                          )}

                          {/* Reviews List */}
                          <div className="space-y-6">
                              {reviews.length === 0 ? (
                                  <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">暂无评论，快来抢沙发吧！</div>
                              ) : (
                                  reviews.map(review => (
                                      <div key={review.id} className="border-b border-gray-50 dark:border-gray-700 last:border-0 pb-6 last:pb-0">
                                          <div className="flex justify-between items-center mb-2">
                                              <span className="font-bold text-gray-900 dark:text-white text-sm">
                                                  {review.user.nickname || review.user.email.split('@')[0]}
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
          <div className="absolute bottom-0 left-0 right-0 p-5 bg-white dark:bg-gray-900 border-t border-gray-50 dark:border-gray-800 flex gap-4 z-30 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.3)] transition-colors duration-300">
              <button 
                onClick={() => toggleFavorite({
                    id: poi.id,
                    name: poi.name,
                    type: poi.type,
                    address: poi.address,
                    location: poi.location,
                    imageUrl: `https://picsum.photos/seed/${poi.id || 'poi'}/300/200`
                })}
                className="flex flex-col items-center justify-center w-16 gap-1 active:scale-95 transition-transform"
              >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-sm border border-gray-100 dark:border-gray-700 ${isFav ? 'bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 border-red-100 dark:border-red-900/30' : 'bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500'}`}>
                    <Heart size={24} fill={isFav ? "currentColor" : "none"} />
                  </div>
              </button>
              <button 
                onClick={() => {
                    if (poi.location) {
                        const { lng, lat } = poi.location;
                        window.open(`https://uri.amap.com/marker?position=${lng},${lat}&name=${encodeURIComponent(poi.name)}&coordinate=gaode&callnative=1`, '_blank');
                    }
                }}
                className="flex-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-bold text-lg shadow-xl shadow-gray-200 dark:shadow-none active:scale-95 transition-transform flex items-center justify-center gap-3"
              >
                  <Navigation size={20} fill="currentColor" />
                  <span>导航前往</span>
              </button>
          </div>

        </motion.div>
    </div>
  );
}
