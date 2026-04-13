import React, { useEffect, useState } from 'react';
import { X, Phone, Mail, MessageCircle, Globe, MapPin, Building2, ChevronDown, ChevronUp, Languages, User, Car, Heart, MessageSquare, Send, Share2, Star } from 'lucide-react';
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
  const [photoIndex, setPhotoIndex] = useState(0);

  // Fetch reviews when an enterprise is selected
  useEffect(() => {
    if (selected && !selected._isTranslator) {
      setPhotoIndex(0);
      axios.get(`/api/reviews/enterprise/${selected.id}`)
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
      const res = await axios.post('/api/reviews', {
        content: newReview,
        rating: 5,
        userId: user.id,
        enterpriseId: selected!.id
      });
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
    const url = `${window.location.origin}/?open=enterprise&id=${selected.id}`;
    navigator.clipboard.writeText(url).then(() => {
        toast.success(t('messages.linkCopied') || '链接已复制！');
    }).catch(err => {
        console.error('Copy failed:', err);
        const textArea = document.createElement("textarea");
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            toast.success(t('messages.linkCopied') || '链接已复制！');
        } catch (err) {
            toast.error('Copy failed');
        }
        document.body.removeChild(textArea);
    });
  };

  const handleToggleFavorite = async () => {
    if (!selected) return;
    try {
      if (isFavorite(selected.id, 'enterprise')) {
        await removeFavorite(selected.id);
      } else {
        await toggleFavorite({
          id: String(selected.id),
          name: selected.name,
          type: 'enterprise',
          imageUrl: selected.image || selected.avatar
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
          {/* Handle */}
          <div
            className="w-full flex justify-center pt-3 pb-2 cursor-pointer z-20 shrink-0 absolute top-0 left-0 right-0 h-12 hover:bg-black/5 transition-colors touch-none items-center gap-2"
            onClick={() => setViewState(prev => prev === 'peek' ? 'full' : 'peek')}
          >
            {viewState === 'full' ? (
              <ChevronDown className="text-gray-500 dark:text-gray-400" size={24} />
            ) : (
              <ChevronUp className="text-gray-500 dark:text-gray-400" size={24} />
            )}
          </div>

          {/* Header */}
          <div className="px-5 pt-12 pb-2 shrink-0 flex items-center justify-between touch-none" onPointerDown={e => dragControls.start(e)}>
            <div className="flex items-center gap-2">
              {selected && (
                <button onClick={() => setSelected(null)} onPointerDown={e => e.stopPropagation()} className="p-1 -ml-1 text-blue-500">
                  <ChevronDown size={20} className="rotate-90" />
                </button>
              )}
              <h1 className="text-base font-bold text-gray-900 dark:text-white">
                {selected ? selected.name : tab === 'translator' ? '비즈니스 통역' : '중국기업'}
              </h1>
            </div>
            <button onClick={onClose} onPointerDown={e => e.stopPropagation()} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500">
              <X size={16} />
            </button>
          </div>

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
            /* Detail */
            <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-3">
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
                {selected.avatar && (
                  <img src={getFullImageUrl(selected.avatar)} alt={selected.name} className="w-full h-44 object-cover rounded-2xl" />
                )}
                {selected.intro && <p className="text-sm text-gray-500">{selected.intro}</p>}
                {(selected.phone || selected.kakao || selected.wechat || selected.email) && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 space-y-2.5">
                    {selected.phone && <a href={`tel:${selected.phone}`} className="flex items-center gap-3"><Phone size={14} className="text-blue-500 shrink-0" /><span className="text-sm text-gray-700 dark:text-gray-200">{selected.phone}</span></a>}
                    {selected.kakao && <div className="flex items-center gap-3"><MessageCircle size={14} className="text-yellow-500 shrink-0" /><span className="text-sm text-gray-700 dark:text-gray-200">카카오: {selected.kakao}</span></div>}
                    {selected.wechat && <div className="flex items-center gap-3"><MessageCircle size={14} className="text-green-500 shrink-0" /><span className="text-sm text-gray-700 dark:text-gray-200">WeChat: {selected.wechat}</span></div>}
                    {selected.email && <a href={`mailto:${selected.email}`} className="flex items-center gap-3"><Mail size={14} className="text-purple-500 shrink-0" /><span className="text-sm text-gray-700 dark:text-gray-200">{selected.email}</span></a>}
                  </div>
                )}
                {selected.content && (
                  <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: selected.content }} />
                )}
              </>}
            </div>
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
                        {item.description && <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">{item.description}</p>}
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
                        {item.intro && <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">{item.intro}</p>}
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
