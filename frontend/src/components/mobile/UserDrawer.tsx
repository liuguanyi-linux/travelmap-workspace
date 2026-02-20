import React, { useEffect, useState } from 'react';
import { motion, useAnimation, useDragControls, PanInfo } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../../hooks/useFavorites';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';
import { Heart, MapPin, X, ChevronRight, User, Settings, Bell, Globe, Check, Phone, LogOut, Mail, Loader2, Moon, Sun, ChevronUp, ChevronDown, MessageSquare } from 'lucide-react';

interface UserDrawerProps {
  isVisible: boolean;
  onClose: () => void;
  onPoiClick?: (poi: any) => void;
}

type ViewState = 'menu' | 'favorites' | 'settings' | 'contact' | 'login' | 'notifications';

export default function UserDrawer({ isVisible, onClose, onPoiClick }: UserDrawerProps) {
  const controls = useAnimation();
  const dragControls = useDragControls();
  const { favorites, removeFavorite, moveFavorite } = useFavorites();
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { contactInfo } = useData();
  const { user, login, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const [viewState, setViewState] = useState<ViewState>('menu');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (isVisible) {
      controls.start({ y: 0 }); // Show full height by default
    } else {
      controls.start({ y: '100%' });
      // Reset to menu view after closing
      const timer = setTimeout(() => setViewState('menu'), 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible, controls]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const { offset, velocity } = info;
    if (offset.y > 100 || (velocity.y > 500 && offset.y > 0)) {
       onClose();
    } else {
       controls.start({ y: 0 }); // Snap back to full
    }
  };

  const handleFavoritesClick = () => {
      setViewState('favorites');
      controls.start({ y: 0 }); // Expand to full for list
  };

  const handleSettingsClick = () => {
      setViewState('settings');
      controls.start({ y: 0 }); // Expand to full
  };

  const handleContactClick = () => {
      setViewState('contact');
      controls.start({ y: 0 }); // Expand to full
  };

  const handleNotificationsClick = () => {
      setViewState('notifications');
      controls.start({ y: 0 }); // Expand to full
  };

  const handleLoginClick = () => {
      setViewState('login');
      controls.start({ y: 0 });
  };

  const handleLogoutClick = () => {
      logout();
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email) return;
      try {
          await login(email);
          if (email === 'admin@travelmap.com') {
              navigate('/admin/dashboard');
          } else {
              setViewState('menu');
              controls.start({ y: 0 });
          }
      } catch (error) {
          alert('Login failed. Please try again.');
      }
  };

  const handleBack = () => {
      setViewState('menu');
      controls.start({ y: 0 });
  };

  const LANGUAGES = [
      { code: 'zh-CN', label: '简体中文' },
      { code: 'en-US', label: 'English' },
      { code: 'ko-KR', label: '한국어' }
  ];

  return (
    <motion.div
        initial={{ y: '100%' }}
        animate={controls}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        drag="y"
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        className="fixed bottom-0 left-0 right-0 z-40 h-[85vh] bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-t-[2.5rem] shadow-[0_-10px_60px_rgba(0,0,0,0.1)] flex flex-col pointer-events-auto touch-manipulation transition-colors duration-300 overflow-hidden will-change-transform"
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

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-40">
         
         {viewState === 'menu' && (
             // Menu View
             <div className="space-y-6">
                 {user ? (
                     <div className="flex items-center gap-4 py-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                            <User size={32} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{user.nickname || user.email.split('@')[0]}</h2>
                            <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                     </div>
                 ) : (
                    <div 
                        className="flex items-center gap-4 py-4 cursor-pointer hover:bg-gray-50 rounded-xl transition-colors"
                        onClick={handleLoginClick}
                    >
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                            <User size={32} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{t('user.loginRegister')}</h2>
                            <p className="text-sm text-gray-500">{t('user.loginDesc')}</p>
                        </div>
                        <ChevronRight size={20} className="ml-auto text-gray-300" />
                    </div>
                 )}

                 <div className="space-y-2">
                     <MenuItem icon={Heart} label={t('user.favorites')} onClick={handleFavoritesClick} color="text-red-500 bg-red-50" />
                     <MenuItem icon={Phone} label={t('user.contact')} onClick={handleContactClick} color="text-orange-500 bg-orange-50" />
                     <MenuItem icon={Bell} label={t('user.notifications')} onClick={handleNotificationsClick} color="text-purple-500 bg-purple-50" />
                     <MenuItem icon={Settings} label={t('user.settings')} onClick={handleSettingsClick} color="text-gray-500 bg-gray-50" />
                     {user && (
                         <MenuItem icon={LogOut} label={t('login.logout')} onClick={handleLogoutClick} color="text-gray-500 bg-gray-50" />
                     )}
                 </div>
             </div>
         )}

         {viewState === 'favorites' && (
             // Favorites List View
             <div>
                 <div className="flex items-center gap-2 mb-6">
                     <button 
                        onClick={handleBack}
                        className="p-2 -ml-2 hover:bg-gray-100 rounded-full"
                     >
                         <ChevronRight size={24} className="rotate-180" />
                     </button>
                     <h2 className="text-2xl font-bold">{t('user.favorites')}</h2>
                 </div>

                 {favorites.length === 0 ? (
                    <div className="text-gray-400 text-center py-12 flex flex-col items-center">
                        <Heart size={48} className="mb-4 text-gray-200" />
                        <p>{t('user.noFavorites')}</p>
                        <p className="text-sm text-gray-300 mt-2">{t('user.exploreTip')}</p>
                    </div>
                 ) : (
                    <div className="space-y-4">
                        {favorites.map((fav, index) => (
                            <div key={fav.id} className="flex bg-white border border-gray-100 rounded-xl shadow-sm active:scale-[0.98] transition-transform overflow-hidden" onClick={() => onPoiClick && onPoiClick(fav)}>
                                {/* Content Area - with padding */}
                                <div className="flex-1 flex gap-3 p-3">
                                    <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                                        {fav.imageUrl && <img src={fav.imageUrl} className="w-full h-full object-cover" />}
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between py-1">
                                        <div>
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-bold text-gray-900 line-clamp-1 mr-2">{fav.name}</h4>
                                                <button 
                                                    onClick={(e) => { 
                                                        e.stopPropagation(); 
                                                        e.preventDefault();
                                                        removeFavorite(fav.id); 
                                                    }}
                                                    className="relative z-10 text-gray-400 hover:text-red-500 p-2 -mt-2 -mr-2 rounded-full hover:bg-gray-100 transition-colors"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1 px-2 py-0.5 bg-gray-100 inline-block rounded-md">
                                                {fav.type?.split(';')[0]}
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-400 flex items-center">
                                            <MapPin size={12} className="mr-1 shrink-0"/>
                                            <span className="truncate">{fav.address || t('common.unknownPlace')}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Reorder Controls - Full Height Side Panel */}
                                <div 
                                    className="w-14 flex flex-col border-l border-gray-100 bg-gray-50/50"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                    }}
                                >
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            moveFavorite(index, 'up');
                                        }}
                                        disabled={index === 0}
                                        className={`flex-1 flex items-center justify-center active:bg-gray-200 transition-colors ${index === 0 ? 'text-gray-200' : 'text-gray-500 hover:bg-gray-100'}`}
                                    >
                                        <ChevronUp size={24} />
                                    </button>
                                    <div className="h-[1px] bg-gray-200 w-full"></div>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            moveFavorite(index, 'down');
                                        }}
                                        disabled={index === favorites.length - 1}
                                        className={`flex-1 flex items-center justify-center active:bg-gray-200 transition-colors ${index === favorites.length - 1 ? 'text-gray-200' : 'text-gray-500 hover:bg-gray-100'}`}
                                    >
                                        <ChevronDown size={24} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                 )}
             </div>
         )}

         {viewState === 'settings' && (
             // Settings View
             <div>
                 <div className="flex items-center gap-2 mb-6">
                     <button 
                        onClick={handleBack}
                        className="p-2 -ml-2 hover:bg-gray-100 rounded-full"
                     >
                         <ChevronRight size={24} className="rotate-180" />
                     </button>
                     <h2 className="text-2xl font-bold">{t('settings.title')}</h2>
                 </div>
                 
                 <div className="space-y-6">
                     <div>
                         <h3 className="text-sm font-semibold text-gray-500 mb-3 px-1">{t('settings.appearance')}</h3>
                         <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl flex relative h-14">
                             {/* Animated Background */}
                             <motion.div 
                                className="absolute top-1 bottom-1 bg-white dark:bg-gray-700 rounded-xl shadow-sm z-0"
                                initial={false}
                                animate={{ 
                                    left: theme === 'dark' ? '50%' : '4px', 
                                    right: theme === 'dark' ? '4px' : '50%' 
                                }}
                                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                             />
                             
                             <button
                                 onClick={() => theme === 'dark' && toggleTheme()}
                                 className={`flex-1 flex items-center justify-center gap-2 rounded-xl relative z-10 transition-colors ${theme === 'light' ? 'text-gray-900 font-bold' : 'text-gray-500 dark:text-gray-400'}`}
                             >
                                 <Sun size={20} />
                                 <span className="text-sm">{t('settings.lightMode')}</span>
                             </button>
                             <button
                                 onClick={() => theme === 'light' && toggleTheme()}
                                 className={`flex-1 flex items-center justify-center gap-2 rounded-xl relative z-10 transition-colors ${theme === 'dark' ? 'text-white font-bold' : 'text-gray-500'}`}
                             >
                                 <Moon size={20} />
                                 <span className="text-sm">{t('settings.darkMode')}</span>
                             </button>
                         </div>
                     </div>

                     <div>
                         <h3 className="text-sm font-semibold text-gray-500 mb-3 px-1">{t('settings.language')}</h3>
                         <div className="space-y-2">
                             {LANGUAGES.map((langItem) => (
                                 <button
                                     key={langItem.code}
                                     onClick={() => setLanguage(langItem.code)}
                                     className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                                         language === langItem.code 
                                         ? 'bg-blue-50 border-blue-500 text-blue-700' 
                                         : 'bg-white border-gray-100 text-gray-700 hover:bg-gray-50'
                                     }`}
                                 >
                                     <div className="flex items-center gap-3">
                                         <Globe size={20} className={language === langItem.code ? 'text-blue-500' : 'text-gray-400'} />
                                         <span className="font-medium">{langItem.label}</span>
                                     </div>
                                     {language === langItem.code && <Check size={20} className="text-blue-500" />}
                                 </button>
                             ))}
                         </div>
                     </div>
                 </div>
             </div>
         )}

         {viewState === 'contact' && (
             // Contact View
             <div>
                 <div className="flex items-center gap-2 mb-6">
                     <button 
                        onClick={handleBack}
                        className="p-2 -ml-2 hover:bg-gray-100 rounded-full"
                     >
                         <ChevronRight size={24} className="rotate-180" />
                     </button>
                     <h2 className="text-2xl font-bold">{t('user.contact')}</h2>
                 </div>
                 
                 <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-orange-500 shadow-sm">
                 <Phone size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">{t('contact.title')}</h3>
              <p className="text-gray-500 text-sm mb-6 text-center">
                 {t('contact.desc')}
              </p>
              
              <div className="space-y-4">
                 {contactInfo?.phone && (
                   <div className="bg-white p-4 rounded-xl flex items-center gap-3 shadow-sm">
                     <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                       <Phone size={20} />
                     </div>
                     <div>
                       <div className="text-xs text-gray-500">电话 / Phone</div>
                       <div className="font-medium text-gray-900">{contactInfo.phone}</div>
                     </div>
                   </div>
                 )}

                 {contactInfo?.wechat && (
                   <div className="bg-white p-4 rounded-xl flex items-center gap-3 shadow-sm">
                     <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                       <MessageSquare size={20} />
                     </div>
                     <div>
                       <div className="text-xs text-gray-500">微信 / WeChat</div>
                       <div className="font-medium text-gray-900">{contactInfo.wechat}</div>
                     </div>
                   </div>
                 )}

                 {contactInfo?.email && (
                   <div className="bg-white p-4 rounded-xl flex items-center gap-3 shadow-sm">
                     <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                       <Mail size={20} />
                     </div>
                     <div>
                       <div className="text-xs text-gray-500">邮箱 / Email</div>
                       <div className="font-medium text-gray-900 break-all">{contactInfo.email}</div>
                     </div>
                   </div>
                 )}

                 {contactInfo?.website && (
                   <div className="bg-white p-4 rounded-xl flex items-center gap-3 shadow-sm">
                     <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center text-purple-600">
                       <Globe size={20} />
                     </div>
                     <div>
                       <div className="text-xs text-gray-500">网站 / Website</div>
                       <div className="font-medium text-gray-900 break-all">{contactInfo.website}</div>
                     </div>
                   </div>
                 )}
                 
                 {contactInfo?.address && (
                   <div className="bg-white p-4 rounded-xl flex items-center gap-3 shadow-sm">
                     <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-red-600">
                       <MapPin size={20} />
                     </div>
                     <div>
                       <div className="text-xs text-gray-500">地址 / Address</div>
                       <div className="font-medium text-gray-900">{contactInfo.address}</div>
                     </div>
                   </div>
                 )}
              </div>
            </div>
             </div>
         )}

         {viewState === 'notifications' && (
             // Notifications View
             <div>
                 <div className="flex items-center gap-2 mb-6">
                     <button 
                        onClick={handleBack}
                        className="p-2 -ml-2 hover:bg-gray-100 rounded-full"
                     >
                         <ChevronRight size={24} className="rotate-180" />
                     </button>
                     <h2 className="text-2xl font-bold">{t('notifications.title')}</h2>
                 </div>
                 
                 <div className="bg-purple-50 rounded-2xl p-6 text-center border border-purple-100">
                     <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-purple-500 shadow-sm">
                        <Bell size={32} />
                     </div>
                     <h3 className="text-lg font-bold text-gray-900 mb-2">{t('notifications.empty')}</h3>
                     <p className="text-gray-500 text-sm mb-6">
                        {t('notifications.desc')}
                     </p>
                     <div className="space-y-3">
                        <div className="h-12 bg-white rounded-xl w-full animate-pulse"></div>
                        <div className="h-12 bg-white rounded-xl w-full animate-pulse"></div>
                     </div>
                 </div>
             </div>
         )}

         {viewState === 'login' && (
             // Login View
             <div>
                 <div className="flex items-center gap-2 mb-6">
                     <button 
                        onClick={handleBack}
                        className="p-2 -ml-2 hover:bg-gray-100 rounded-full"
                     >
                         <ChevronRight size={24} className="rotate-180" />
                     </button>
                     <h2 className="text-2xl font-bold">{t('login.loginRegisterTitle')}</h2>
                 </div>
                 
                 <div className="bg-white p-4">
                     <div className="mb-8 text-center">
                         <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                             <Mail size={40} />
                         </div>
                         <h3 className="text-xl font-bold text-gray-900">{t('login.quickLogin')}</h3>
                         <p className="text-gray-500 mt-2">{t('login.quickLoginDesc')}</p>
                     </div>

                     <form onSubmit={handleLoginSubmit} className="space-y-6">
                         <div>
                             <label className="block text-sm font-medium text-gray-700 mb-2">
                                 {t('login.email')}
                             </label>
                             <input
                                 type="email"
                                 value={email}
                                 onChange={(e) => setEmail(e.target.value)}
                                 placeholder={t('login.placeholderEmail')}
                                 required
                                 className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                             />
                         </div>

                         <button
                             type="submit"
                             disabled={isLoading}
                             className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                         >
                             {isLoading ? (
                                 <>
                                     <Loader2 size={20} className="animate-spin" />
                                     {t('login.loggingIn')}
                                 </>
                             ) : (
                                 t('login.loginNow')
                             )}
                         </button>
                     </form>
                 </div>
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
                console.log('MenuItem clicked:', label);
                onClick && onClick();
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-3xl active:bg-gray-50 dark:active:bg-gray-700 transition-colors cursor-pointer touch-manipulation select-none relative z-50 group"
        >
            <div className="flex items-center gap-5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-active:scale-95 ${color} dark:bg-opacity-20`}>
                    <Icon size={22} strokeWidth={2} />
                </div>
                <span className="font-bold text-gray-800 dark:text-gray-100 text-lg">{label}</span>
            </div>
            <ChevronRight size={20} className="text-gray-300 dark:text-gray-600" />
        </div>
    )
}
