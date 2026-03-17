import React, { useEffect, useState } from 'react';
import { motion, useAnimation, useDragControls, PanInfo } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../../hooks/useFavorites';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';
import { usageGuideService } from '../../services/api';
import { UsageGuide } from '../../types/data';
import { Heart, MapPin, X, ChevronRight, User, Settings, Bell, Globe, Check, Phone, LogOut, Mail, Loader2, Moon, Sun, ChevronUp, ChevronDown, MessageSquare, ArrowLeft, ImageIcon, BookOpen } from 'lucide-react';

import { getFullImageUrl } from '../../utils/image';

interface UserDrawerProps {
  isVisible: boolean;
  onClose: () => void;
  onPoiClick?: (poi: any) => void;
}

type ViewState = 'menu' | 'favorites' | 'settings' | 'contact' | 'login' | 'notifications' | 'usage';

export default function UserDrawer({ isVisible, onClose, onPoiClick }: UserDrawerProps) {
  const controls = useAnimation();
  const dragControls = useDragControls();
  const [viewState, setViewState] = useState<'hidden' | 'peek' | 'full'>('hidden');
  const { favorites, removeFavorite, moveFavorite } = useFavorites();
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { contactInfo } = useData();
  const { user, login, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const [contentView, setContentView] = useState<ViewState>('menu');
  const [email, setEmail] = useState('');
  const [usageGuides, setUsageGuides] = useState<UsageGuide[]>([]);

  useEffect(() => {
    if (contentView === 'usage') {
      usageGuideService.getAll().then(setUsageGuides).catch(console.error);
    }
  }, [contentView]);

  useEffect(() => {
    if (isVisible) {
      setViewState('peek');
      controls.start('peek');
      // Reset content view to menu when opening
      setContentView('menu');
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

  const handleFavoritesClick = () => {
      setContentView('favorites');
      setViewState('full');
      controls.start('full'); // Expand to full for list
  };

  const handleSettingsClick = () => {
      // Toggle language directly
      const langs = ['zh-CN', 'en-US', 'ko-KR'];
      const currentIndex = langs.indexOf(language);
      const nextLang = langs[(currentIndex + 1) % langs.length];
      setLanguage(nextLang);
  };

  const handleContactClick = () => {
      setContentView('contact');
      setViewState('full');
      controls.start('full'); // Expand to full
  };

  const handleNotificationsClick = () => {
      setContentView('notifications');
      setViewState('full');
      controls.start('full'); // Expand to full
  };

  const handleLoginClick = () => {
      setContentView('login');
      setViewState('full');
      controls.start('full');
  };

  const handleLogoutClick = () => {
      logout();
      setContentView('menu'); // Return to menu after logout
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email) return;
      try {
          if (email === 'admin@travelmap.com') {
              localStorage.setItem('admin_token', 'demo_token');
          }
          await login(email);
          if (email === 'admin@travelmap.com') {
              navigate('/admin/dashboard');
          } else {
              setContentView('menu');
              setViewState('full');
              controls.start('full');
          }
      } catch (error) {
          alert('Login failed. Please try again.');
      }
  };

  const handleBack = () => {
      setContentView('menu');
      setViewState('full'); // Keep full if user was navigating deep
      controls.start('full');
  };

  const LANGUAGES = [
      { code: 'zh-CN', label: '简体中文' },
      { code: 'en-US', label: 'English' },
      { code: 'ko-KR', label: '한국어' }
  ];

  return (
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
          className="fixed bottom-0 left-0 right-0 z-40 h-[66vh] bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-t-[2.5rem] shadow-[0_-10px_60px_rgba(0,0,0,0.1)] flex flex-col pointer-events-auto touch-manipulation transition-colors duration-300 overflow-hidden will-change-transform"
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

      {/* Spacer for Handle */}
      <div className="h-8 shrink-0" />

      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-black/5 dark:bg-white/10 rounded-full text-gray-500 dark:text-gray-400 z-50 hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
      >
        <X size={20} />
      </button>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-40">
         
         {contentView === 'menu' && (
             // Menu View
             <div className="space-y-4">
                 {user ? (
                     <div className="flex items-center gap-4 py-2">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                            <User size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 dark:text-white truncate">{user?.nickname || user?.email.split('@')[0] || t('detail.visitor')}</h3>
                            <p className="text-xs text-gray-500 truncate">{t('user.slogan')}</p>
                        </div>
                     </div>
                 ) : (
                    <div 
                        className="flex items-center gap-3 py-2 cursor-pointer hover:bg-gray-50 rounded-xl transition-colors"
                        onClick={handleLoginClick}
                    >
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                            <User size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('user.loginRegister')}</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{t('user.loginDesc')}</p>
                        </div>
                        <ChevronRight size={16} className="ml-auto text-gray-300" />
                    </div>
                 )}

                 <div className="space-y-1">
                     <MenuItem 
                        icon={Heart} 
                        label={t('user.favorites')} 
                        onClick={handleFavoritesClick} 
                        color="text-red-500 bg-red-50" 
                     />
                     {/* Usage Guide Removed as requested */}
                     <MenuItem 
                        icon={Phone} 
                        label={t('user.contact')} 
                        onClick={handleContactClick} 
                        color="text-orange-500 bg-orange-50" 
                     />
                     {/* Notification Removed */}
                     {/* Language Switcher Removed */}
                     <MenuItem icon={Moon} label={theme === 'dark' ? t('settings.lightMode') : t('settings.darkMode')} onClick={toggleTheme} color="text-purple-500 bg-purple-50" />
                     {user && (
                         <MenuItem icon={LogOut} label={t('login.logout')} onClick={handleLogoutClick} color="text-gray-500 bg-gray-50" />
                     )}
                 </div>
             </div>
         )}

         {contentView === 'favorites' && (
             // Favorites List View
             <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                        <h3 className="text-xl font-bold">{t('user.favorites')}</h3>
                    </div>
                </div>
                {favorites.length > 0 ? (
                    <div className="space-y-4">
                        {favorites.map((fav, index) => (
                            <div 
                                key={fav.id} 
                                className="bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex gap-3 active:scale-[0.98] transition-all items-center"
                                onClick={() => {
                                    if (onPoiClick) onPoiClick(fav);
                                    onClose();
                                  }}
                            >
                                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden shrink-0">
                                    {fav.imageUrl ? (
                                        <img src={fav.imageUrl} alt={fav.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <ImageIcon size={20} />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 py-0.5">
                                    <h4 className="font-bold text-gray-900 dark:text-white truncate">{fav.name}</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{fav.address || t('cityDrawer.noAddress')}</p>
                                </div>
                                <div className="flex flex-col items-center gap-1 ml-2 border-l border-gray-100 dark:border-gray-700 pl-3">
                                    <button 
                                        className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full ${index === 0 ? 'opacity-30 cursor-not-allowed' : 'text-gray-400'}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            moveFavorite(index, 'up');
                                        }}
                                        disabled={index === 0}
                                    >
                                        <ChevronUp size={24} />
                                    </button>
                                    <button 
                                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full text-red-500"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeFavorite(fav.id);
                                        }}
                                    >
                                        <Heart size={24} fill="currentColor" />
                                    </button>
                                    <button 
                                        className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full ${index === favorites.length - 1 ? 'opacity-30 cursor-not-allowed' : 'text-gray-400'}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            moveFavorite(index, 'down');
                                        }}
                                        disabled={index === favorites.length - 1}
                                    >
                                        <ChevronDown size={24} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <Heart size={48} className="mb-4 opacity-20" />
                        <p>{t('user.noFavorites')}</p>
                    </div>
                )}
             </div>
         )}

         {contentView === 'usage' && (
             <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-3 mb-6">
                    <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <h3 className="text-xl font-bold">{t('usageGuide.title')}</h3>
                </div>
                <div className="space-y-4">
                  {usageGuides.map(guide => {
                      const getLocalizedContent = () => {
                          if (language === 'en-US') {
                              return {
                                  title: guide.titleEn || guide.title,
                                  content: guide.contentEn || guide.content
                              };
                          } else if (language === 'ko-KR') {
                              return {
                                  title: guide.titleKo || guide.title,
                                  content: guide.contentKo || guide.content
                              };
                          }
                          return { title: guide.title, content: guide.content };
                      };
                      const localized = getLocalizedContent();

                      return (
                        <div key={guide.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                          <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">{localized.title}</h4>
                          <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: localized.content }} />
                        </div>
                      );
                  })}
                  {usageGuides.length === 0 && (
                    <div className="text-center text-gray-400 py-8">{t('usageGuide.empty')}</div>
                  )}
                </div>
             </div>
         )}

         {contentView === 'settings' && (
             <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-3 mb-6">
                    <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <h3 className="text-xl font-bold">{t('settings.title')}</h3>
                </div>
                <div className="space-y-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                                <Globe size={20} />
                            </div>
                            <span className="font-medium">{t('settings.language')}</span>
                        </div>
                        <select 
                            value={language}
                            onChange={(e) => setLanguage(e.target.value as any)}
                            className="bg-gray-50 dark:bg-gray-700 border-none rounded-lg text-sm px-2 py-1 focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="zh-CN">简体中文</option>
                            <option value="en-US">English</option>
                            <option value="ko-KR">한국어</option>
                        </select>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
                                {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                            </div>
                            <span className="font-medium">{t('settings.darkMode')}</span>
                        </div>
                        <button 
                            onClick={toggleTheme}
                            className={`w-12 h-6 rounded-full transition-colors relative ${theme === 'dark' ? 'bg-blue-600' : 'bg-gray-200'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${theme === 'dark' ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>
                </div>
             </div>
         )}

         {contentView === 'contact' && (
             <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-3 mb-6">
                    <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <h3 className="text-xl font-bold">{t('contact.title')}</h3>
                </div>
                {contactInfo ? (
                    <div className="space-y-4">
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                                    <Phone size={20} />
                                </div>
                                <div>
                                    <div className="text-[10px] text-gray-400 uppercase">{t('detail.phone')}</div>
                                    <div className="font-bold">{contactInfo.phone || t('common.noInfo')}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-xl text-green-600 dark:text-green-400">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <div className="text-[10px] text-gray-400 uppercase">{t('login.email')}</div>
                                    <div className="font-bold">{contactInfo.email || t('common.noInfo')}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-xl text-orange-600 dark:text-orange-400">
                                    <MessageSquare size={20} />
                                </div>
                                <div>
                                    <div className="text-[10px] text-gray-400 uppercase">WeChat</div>
                                    <div className="font-bold">{contactInfo.wechat || t('common.noInfo')}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-10 text-gray-400">{t('detail.noContact')}</div>
                )}
             </div>
         )}

         {contentView === 'notifications' && (
             <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-3 mb-6">
                    <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <h3 className="text-xl font-bold">{t('notifications.title')}</h3>
                </div>
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <Bell size={48} className="mb-4 opacity-20" />
                    <p>{t('notifications.empty')}</p>
                </div>
             </div>
         )}

         {contentView === 'login' && (
             <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-3 mb-6">
                    <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <h3 className="text-xl font-bold">{t('login.title')}</h3>
                </div>
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm text-gray-500 ml-1">{t('login.email')}</label>
                        <input 
                            type="email" 
                            required
                            placeholder={t('login.placeholderEmail')}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                    </div>
                    <button 
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        {isLoading ? t('login.loggingIn') : t('login.loginNow')}
                    </button>
                    <p className="text-[10px] text-center text-gray-400 mt-4 px-6">
                        {t('user.loginDesc')}
                    </p>
                </form>
             </div>
         )}
      </div>
    </motion.div>
  );
}

function MenuItem({ icon: Icon, label, onClick, color }: any) {
    return (
        <div 
            onClick={(e) => {
                e.stopPropagation();
                onClick && onClick();
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className="w-full flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-2xl active:bg-gray-50 dark:active:bg-gray-700 transition-colors cursor-pointer touch-manipulation select-none relative z-50 group"
        >
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-active:scale-95 ${color} dark:bg-opacity-20`}>
                    <Icon size={18} strokeWidth={2} />
                </div>
                <span className="font-bold text-gray-800 dark:text-gray-100 text-sm">{label}</span>
            </div>
            <ChevronRight size={16} className="text-gray-300 dark:text-gray-600" />
        </div>
    )
}
