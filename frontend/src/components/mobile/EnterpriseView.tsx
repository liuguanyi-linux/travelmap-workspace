import React, { useEffect, useState } from 'react';
import { X, Phone, Mail, MessageCircle, Globe, MapPin, Building2, ChevronDown, ChevronUp, Languages, User, Car, Heart, MessageSquare, Send, Share2, Star, ChevronLeft, ChevronRight, Loader2, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence, useAnimation, PanInfo, useDragControls } from 'framer-motion';
import { getFullImageUrl } from '../../utils/image';
import { useData } from '../../contexts/DataContext';
import { useFavoritesContext } from '../../contexts/FavoritesContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface Review {
  id: string;
  content: string;
  rating: number;
  userId: string;
  enterpriseId: string;
  createdAt: string;
}

interface EnterpriseViewProps {
  isVisible: boolean;
  onClose: () => void;
  activeCity?: string;
  initialId?: string;
  onInitialIdConsumed?: () => void;
}

export default function EnterpriseView({ isVisible, onClose, activeCity, initialId, onInitialIdConsumed }: EnterpriseViewProps) {
  const controls = useAnimation();
  const dragControls = useDragControls();
  const [viewState, setViewState] = useState<'hidden' | 'peek' | 'full'>('hidden');
  const [enterprises, setEnterprises] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [tab, setTab] = useState<'enterprise' | 'translator'>('enterprise');

  const { guides } = useData();
  const { user } = useAuth();
  const { isFavorite, toggleFavorite, removeFavorite } = useFavoritesContext();
  const { t } = useLanguage();

  // Review state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [photoIndex, setPhotoIndex] = useState<number | null>(null);

  const currentPhotos = selected ? [selected.avatar, selected.image, ...(Array.isArray(selected.photos) ? selected.photos : typeof selected.photos === 'string' ? [selected.photos] : [])].filter(Boolean) : [];

  // Fetch reviews when an enterprise or translator is selected
  useEffect(() => {
    if (selected) {
      setPhotoIndex(null);
      const endpoint = selected._isTranslator ? `/api/reviews/guide/${selected.id}` : `/api/reviews/enterprise/${selected.id}`;
      axios.get(endpoint)
        .then(res => setReviews(res.data))
        .catch(err => console.error('Failed to fetch reviews', err));
    }
  }, [selected]);

  const handleSubmitReview = async () => {
    if (!user) {
      toast.error(t('auth.loginRequired') || '请先登录');
      return;
    }
    if (!newReview.trim()) return;

    setSubmittingReview(true);
    try {
      const payload = {
        content: newReview,
        rating: 5,
        userId: user.id,
        ...(selected._isTranslator ? { guideId: selected.id } : { enterpriseId: selected.id })
      };
      const res = await axios.post('/api/reviews', payload);
      setReviews([res.data, ...reviews]);
      setNewReview('');
      toast.success(t('messages.reviewSuccess') || '评论成功');
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleShare = () => {
    if (!selected) return;
    const urlType = selected._isTranslator ? 'guide' : 'enterprise';
    const url = `${window.location.origin}/?open=${urlType}&id=${selected.id}`;
    navigator.clipboard.writeText(url).then(() => {
        toast.success(t('messages.linkCopied') || '링크가 복사되었습니다!');
    }).catch(err => {
        console.error('Copy failed:', err);
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
  };

  const handleToggleFavorite = async () => {
    if (!selected) return;
    try {
      const favType = selected._isTranslator ? 'poi' : 'enterprise'; // Guides/translators don't have their own fav type currently, using 'poi' as fallback or wait, earlier I checked favorites
      if (isFavorite(selected.id, favType as any)) {
        await removeFavorite(selected.id);
      } else {
        await toggleFavorite({
          id: String(selected.id),
          name: selected.name,
          type: favType as any,
          imageUrl: selected.image || selected.avatar || ''
        });
      }
    } catch (err) {
      console.error(err);
    }
  };


  // Translators from guides data
  const getCategories = (g: any): string[] => {
    if (!g.category) return ['guide'];
    try {
      const parsed = JSON.parse(g.category);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
    return [g.category];
  };
  const translators = (Array.isArray(guides) ? guides : []).filter(g => {
    if (!getCategories(g).includes('translator')) return false;
    if (activeCity && !g.isGlobal) {
      const cities = Array.isArray(g.cities) ? g.cities
        : (typeof g.cities === 'string' && g.cities ? (() => { try { return JSON.parse(g.cities); } catch { return [g.cities]; } })() : []);
      if (cities.length > 0 && !cities.includes(activeCity)) return false;
    }
    return true;
  });

  useEffect(() => {
    if (isVisible) {
      fetch('/api/enterprises')
        .then(r => r.json())
        .then(data => {
          const list = Array.isArray(data) ? data : [];
          setEnterprises(list);
          if (initialId) {
            const match = list.find((e: any) => String(e.id) === String(initialId));
            if (match) {
              setSelected(match);
              setTab('enterprise');
            }
            onInitialIdConsumed?.();
          }
        })
        .catch(() => {});
    }
  }, [isVisible]);

  useEffect(() => {
    if (isVisible) {
      setViewState('full');
    } else {
      setViewState('hidden');
      setSelected(null);
    }
  }, [isVisible]);

  const cardHeight = viewState === 'peek' ? '40vh' : '75vh';

  const isTranslatorSelected = selected && selected._isTranslator;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: '0%' }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className={`fixed bottom-0 left-0 right-0 mx-auto z-[100] w-[96%] max-w-[500px] bg-slate-50/95 dark:bg-gray-900/95 backdrop-blur-lg rounded-t-[2.5rem] shadow-[0_-5px_25px_rgba(0,0,0,0.15)] border-t border-x border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden transition-[height] duration-500 ease-in-out ${viewState === 'peek' ? 'h-[40vh]' : 'h-[75vh]'}`}
        >
          {/* Photo Viewer */}
          <AnimatePresence>
            {photoIndex !== null && currentPhotos.length > 0 && (
              <div 
                className="fixed inset-0 z-[10000] bg-black/95 backdrop-blur-sm flex items-center justify-center touch-none"
                onClick={() => setPhotoIndex(null)}
              >
                <button 
                  className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors z-50"
                  onClick={(e) => { e.stopPropagation(); setPhotoIndex(null); }}
                >
                  <X size={24} />
                </button>
                
                {currentPhotos.length > 1 && (
                  <>
                    {/* Previous Button */}
                    <button 
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full z-50 hover:bg-black/70 transition-colors"
                      onClick={(e) => {
                          e.stopPropagation();
                          setPhotoIndex((prev) => (prev !== null ? (prev - 1 + currentPhotos.length) % currentPhotos.length : 0));
                      }}
                    >
                      <ChevronLeft size={24} />
                    </button>

                    {/* Next Button */}
                    <button 
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full z-50 hover:bg-black/70 transition-colors"
                      onClick={(e) => {
                          e.stopPropagation();
                          setPhotoIndex((prev) => (prev !== null ? (prev + 1) % currentPhotos.length : 0));
                      }}
                    >
                      <ChevronRight size={24} />
                    </button>
                    
                    {/* Counter */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-black/50 backdrop-blur-md rounded-full text-white text-sm font-medium z-20">
                      {photoIndex + 1} / {currentPhotos.length}
                    </div>
                  </>
                )}

                <div className="relative w-full h-full flex items-center justify-center">
                    <motion.img 
                      key={photoIndex}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      src={getFullImageUrl(currentPhotos[photoIndex] as string)}
                      alt="Preview" 
                      className="max-w-full max-h-full object-contain rounded-lg select-none shadow-2xl"
                      onClick={(e) => e.stopPropagation()}
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.2}
                      onDragEnd={(e, { offset, velocity }) => {
                        const swipe = offset.x;
                        if (swipe < -50) {
                           setPhotoIndex((prev) => (prev !== null ? (prev + 1) % currentPhotos.length : 0));
                        } else if (swipe > 50) {
                           setPhotoIndex((prev) => (prev !== null ? (prev - 1 + currentPhotos.length) % currentPhotos.length : 0));
                        }
                      }}
                    />
                </div>
              </div>
            )}
          </AnimatePresence>

          {/* Handle */}
          <div
            className="w-full flex justify-center pt-3 pb-2 cursor-pointer z-30 shrink-0 absolute top-0 left-0 right-0 h-12 hover:bg-black/5 transition-colors touch-none items-center gap-2"
            onClick={() => setViewState(prev => prev === 'peek' ? 'full' : 'peek')}
          >
            {viewState === 'full' ? (
              <ChevronDown className="text-gray-500 dark:text-gray-400" size={24} />
            ) : (
              <ChevronUp className="text-gray-500 dark:text-gray-400" size={24} />
            )}
          </div>

          {/* Header */}
          {!selected && (
            <div className="px-5 pt-12 pb-2 shrink-0 flex items-center justify-between touch-none" onPointerDown={e => dragControls.start(e)}>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-gray-900 dark:text-white">
                  {tab === 'translator' ? '비즈니스 통역' : '중국기업'}
                </h1>
              </div>
              <button onClick={onClose} onPointerDown={e => e.stopPropagation()} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500">
                <X size={16} />
              </button>
            </div>
          )}

          {/* Tab switcher (only on list view) */}
          {!selected && (
            <div className="flex gap-2 px-5 pb-2 shrink-0">
              {(['enterprise', 'translator'] as const).map(t => (
                <button
                  key={t}
                  onPointerDown={e => e.stopPropagation()}
                  onClick={() => setTab(t)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                    tab === t
                      ? t === 'translator' ? 'bg-violet-500 text-white border-violet-500' : 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-slate-200 dark:border-slate-600'
                  }`}
                >
                  {t === 'enterprise' ? '기업' : '비즈니스 통역'}
                </button>
              ))}
            </div>
          )}

          {selected ? (
            <>
            {/* Detail View (Full Height Overlay inside Drawer) */}
            <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900 h-full relative z-20 animate-in slide-in-from-right duration-300 pb-32">
              {/* Header Info */}
              <div className="px-8 pt-12 pb-6 bg-white dark:bg-gray-900 z-10 shrink-0">
                <div className="flex justify-between items-start">
                    <div className="flex-1 mr-4">
                        <button 
                          onClick={() => setSelected(null)}
                          className="mb-4 p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                          <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
                        </button>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight mb-3 tracking-tight">{selected.name}</h2>
                        <div className="flex flex-wrap gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${isTranslatorSelected ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'}`}>
                              {isTranslatorSelected ? '비즈니스 통역' : '기업'}
                          </span>
                        </div>
                    </div>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 bg-gray-50/50 dark:bg-gray-900/50 pb-28 px-4 pt-4 space-y-4">
              {/* Enterprise detail */}
              {!isTranslatorSelected && <>
                {selected.image && (
                  <img src={getFullImageUrl(selected.image)} alt={selected.name} className="w-full h-44 object-cover rounded-2xl" />
                )}
                {selected.city && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full inline-block">{selected.city}</span>}
                {selected.description && <p className="text-sm text-gray-500">{selected.description}</p>}
                {(selected.phone || selected.kakao || selected.wechat || selected.email || selected.website || selected.address) && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 space-y-2.5">
                    {selected.phone && <a href={`tel:${selected.phone}`} className="flex items-center gap-3"><Phone size={14} className="text-blue-500 shrink-0" /><span className="text-sm text-gray-700 dark:text-gray-200">{selected.phone}</span></a>}
                    {selected.kakao && <div className="flex items-center gap-3"><MessageCircle size={14} className="text-yellow-500 shrink-0" /><span className="text-sm text-gray-700 dark:text-gray-200">카카오: {selected.kakao}</span></div>}
                    {selected.wechat && <div className="flex items-center gap-3"><MessageCircle size={14} className="text-green-500 shrink-0" /><span className="text-sm text-gray-700 dark:text-gray-200">WeChat: {selected.wechat}</span></div>}
                    {selected.email && <a href={`mailto:${selected.email}`} className="flex items-center gap-3"><Mail size={14} className="text-purple-500 shrink-0" /><span className="text-sm text-gray-700 dark:text-gray-200">{selected.email}</span></a>}
                    {selected.website && <a href={selected.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3"><Globe size={14} className="text-blue-500 shrink-0" /><span className="text-sm text-blue-500">{selected.website}</span></a>}
                    {selected.address && <div className="flex items-center gap-3"><MapPin size={14} className="text-red-500 shrink-0" /><span className="text-sm text-gray-700 dark:text-gray-200">{selected.address}</span></div>}
                  </div>
                )}
                {selected.content && (
                  <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: selected.content }} />
                )}
              </>}

              {/* Translator detail (guide data) */}
              {isTranslatorSelected && <>
                <div className="mt-4 mb-2 -mx-4">
                  <div className="flex gap-4 px-8 overflow-x-auto pb-4 scrollbar-hide snap-x">
                    {[selected.avatar, selected.image, ...(Array.isArray(selected.photos) ? selected.photos : typeof selected.photos === 'string' ? [selected.photos] : [])].filter(Boolean).map((photo, index) => (
                      <div 
                        key={index} 
                        className="w-44 h-32 shrink-0 rounded-3xl overflow-hidden bg-gray-200 dark:bg-gray-700 snap-center shadow-md relative cursor-pointer"
                        onClick={() => {
                          setPhotoIndex(index);
                        }}
                      >
                        <img 
                          src={getFullImageUrl(photo as string)} 
                          alt={selected.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-[0_2px_10px_rgb(0,0,0,0.03)] mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('guide.intro')}</h3>
                  <div className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm bg-gray-50 dark:bg-gray-800 p-4 rounded-xl prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: selected.intro || selected.content || '' }} />
                </div>

                {(selected.phone || selected.kakao || selected.wechat || selected.email) && (
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-[0_2px_10px_rgb(0,0,0,0.03)] mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">연락처 정보</h3>
                    <div className="space-y-4">
                      {selected.phone && (
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-gray-500 mb-0.5">전화번호</p>
                            <p className="font-medium text-gray-700 text-xs truncate">{selected.phone}</p>
                          </div>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(selected.phone || '');
                              toast.success('복사됨');
                            }}
                            className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-all shrink-0 active:scale-95"
                          >
                            복사하기
                          </button>
                        </div>
                      )}
                      {selected.wechat && (
                        <>
                          {selected.phone && <div className="h-px bg-gray-100" />}
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] text-gray-500 mb-0.5">위챗 ID</p>
                              <p className="font-medium text-gray-700 text-xs truncate">{selected.wechat}</p>
                            </div>
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(selected.wechat || '');
                                toast.success('복사됨');
                              }}
                              className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-all shrink-0 active:scale-95"
                            >
                              복사하기
                            </button>
                          </div>
                        </>
                      )}
                      {selected.kakao && (
                        <>
                          {(selected.phone || selected.wechat) && <div className="h-px bg-gray-100" />}
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] text-gray-500 mb-0.5">카카오톡 ID</p>
                              <p className="font-medium text-gray-700 text-xs truncate">{selected.kakao}</p>
                            </div>
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(selected.kakao || '');
                                toast.success('복사됨');
                              }}
                              className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-all shrink-0 active:scale-95"
                            >
                              복사하기
                            </button>
                          </div>
                        </>
                      )}
                      {selected.email && (
                        <>
                          {(selected.phone || selected.wechat || selected.kakao) && <div className="h-px bg-gray-100" />}
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] text-gray-500 mb-0.5">이메일</p>
                              <p className="font-medium text-gray-700 text-xs truncate">{selected.email}</p>
                            </div>
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(selected.email || '');
                                toast.success('복사됨');
                              }}
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
              </>}

              {/* Reviews Preview */}
              <div className="bg-white dark:bg-gray-800 p-3 rounded-[1.5rem] shadow-[0_2px_10px_rgb(0,0,0,0.03)] mb-4">
                  <div className="flex justify-between items-center mb-3">
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm">{t('detail.visitorReviews')}</h3>
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{reviews.length} {t('detail.reviewsCount')}</span>
                  </div>
                  
                  {/* Review Input */}
                  <div className="mb-4">
                      <textarea 
                          className="w-full p-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/20 outline-none transition-all resize-none text-xs placeholder-gray-400 dark:placeholder-gray-500 text-gray-800 dark:text-white"
                          placeholder={t('detail.shareExperience')}
                          rows={2}
                          value={newReview}
                          onChange={(e) => setNewReview(e.target.value)}
                      />
                      <div className="flex justify-end mt-2">
                          <button 
                              className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full px-4 py-1.5 text-xs font-bold flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-gray-200 dark:shadow-none active:scale-95 transition-all"
                              onClick={handleSubmitReview}
                              disabled={submittingReview || !newReview.trim()}
                          >
                              {submittingReview ? <span className="animate-pulse">...</span> : <Send size={12} />}
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
                                          {(review as any).customNickname || '방문자'}
                                      </span>
                                      <div className="flex text-yellow-400 scale-90 origin-right">
                                          {[...Array(5)].map((_, i) => (
                                              <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} className={i >= review.rating ? "text-gray-200 dark:text-gray-600" : ""} />
                                          ))}
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

            {/* Fixed Bottom Buttons */}
            <div className="absolute bottom-[5.5rem] left-0 right-0 p-4 bg-slate-50/95 dark:bg-gray-900/95 border-t border-gray-200/50 dark:border-gray-800 flex gap-3 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_-5px_20px_rgba(0,0,0,0.3)] transition-colors duration-300">
                <button
                  onClick={handleShare}
                  className="flex-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl font-bold text-sm shadow-sm active:scale-95 transition-transform flex items-center justify-center gap-2 py-2.5 border border-gray-200 dark:border-gray-700"
                >
                    <Share2 size={16} />
                    <span>{t('detail.share') || '공유하기'}</span>
                </button>

                <button 
                  onClick={handleToggleFavorite}
                  className="flex-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold text-sm shadow-md active:scale-95 transition-transform flex items-center justify-center gap-2 py-2.5"
                >
                    <Heart 
                      size={16} 
                      className={isFavorite(selected.id, selected._isTranslator ? 'poi' : 'enterprise') ? "fill-current text-red-500" : ""} 
                    />
                    <span>
                      {isFavorite(selected.id, selected._isTranslator ? 'poi' : 'enterprise') ? (t('detail.saved') || '저장됨') : (t('detail.save') || '저장')}
                    </span>
                </button>
            </div>
            </div>
          </>
          ) : (
            /* List */
            <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-2">
              {tab === 'enterprise' && <>
                {enterprises.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                    <p className="text-sm">등록된 기업이 없습니다</p>
                  </div>
                )}
                {enterprises.map(item => (
                  <div key={item.id} onClick={() => setSelected(item)}
                    className="bg-white dark:bg-gray-800 rounded-[1rem] p-3 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-300 dark:border-slate-500 hover:shadow-lg transition-all cursor-pointer active:scale-95 duration-200"
                  >
                    <div className="flex gap-3">
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow-sm bg-gray-100 dark:bg-gray-700">
                        {item.image ? (
                          <img src={getFullImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><Building2 size={24} className="text-gray-400" /></div>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col justify-between py-0.5">
                        <div>
                          <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{item.name}</h3>
                          {item.city && (
                            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800 mt-1 inline-block">{item.city}</span>
                          )}
                        </div>
                        {item.description && <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">{item.description.replace(/<[^>]*>?/gm, '')}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </>}

              {tab === 'translator' && <>
                {translators.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                    <p className="text-sm">등록된 통역사가 없습니다</p>
                  </div>
                )}
                {translators.map(item => (
                  <div key={item.id} onClick={() => setSelected({ ...item, _isTranslator: true })}
                    className="bg-white dark:bg-gray-800 rounded-[1rem] p-3 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-300 dark:border-slate-500 hover:shadow-lg transition-all cursor-pointer active:scale-95 duration-200"
                  >
                    <div className="flex gap-3">
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow-sm bg-gray-100 dark:bg-gray-700">
                        {item.avatar ? (
                          <img src={getFullImageUrl(item.avatar)} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><User size={24} className="text-gray-400" /></div>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col justify-between py-0.5">
                        <div>
                          <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{item.name}</h3>
                          <span className="text-[10px] text-violet-600 dark:text-violet-400 font-bold bg-violet-50 dark:bg-violet-900/30 px-1.5 py-0.5 rounded-full border border-violet-200 dark:border-violet-800 mt-1 inline-block">비즈니스 통역</span>
                        </div>
                        {item.intro && <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">{item.intro.replace(/<[^>]*>?/gm, '')}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </>}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
