import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, MapPin, Star, Navigation, X, Menu, 
  Utensils, Hotel, ShoppingBag, Landmark, Share2, Bookmark, 
  Bus, Banknote, Pill, Ticket, User, Building2,
  Clock, Phone, Globe, ChevronRight, Calendar,
  Map as MapIcon, Info, ArrowLeft, Languages,
  Car, Bike, ArrowUpDown, ArrowRight, Home, Briefcase,
  Smartphone, QrCode, Loader2, Camera
} from 'lucide-react';
import MenuDrawer from './MenuDrawer';
import ActionModal from './ActionModal';
import BookingModal from './BookingModal';
import { getTranslation } from '../utils/translations';
import { toggleFavorite, getFavorites, createOrUpdatePoi, getReviews, createReview } from '../api';
import { useAuth } from '../contexts/AuthContext';

const USER_ID = 1;

interface SidebarProps {
  onSearch: (keyword: string, isNearby?: boolean) => void;
  results: any[];
  isSearching: boolean;
  onSelectPoi: (poi: any) => void;
  selectedPoi: any;
  onClear: () => void;
  currentLang: string;
  onLanguageChange: (lang: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onRouteSearch?: (start: string, end: string, mode: string) => void;
}

export default function Sidebar({ 
  onSearch, 
  results, 
  isSearching, 
  onSelectPoi, 
  selectedPoi,
  onClear,
  currentLang,
  onLanguageChange,
  onLoadMore,
  hasMore,
  isLoadingMore,
  onRouteSearch
}: SidebarProps) {
  const [keyword, setKeyword] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [savedPlaces, setSavedPlaces] = useState<any[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [reviewContent, setReviewContent] = useState('');
  const [rating, setRating] = useState(5);
  const { user } = useAuth();
  
  // Search Bar Refactoring State
  const [isDirectionsMode, setIsDirectionsMode] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [startLocation, setStartLocation] = useState('我的位置');
  const [endLocation, setEndLocation] = useState('');
  const [transportMode, setTransportMode] = useState('driving');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const t = getTranslation(currentLang);
  const CATEGORIES = [
    { icon: Utensils, label: t.categories.food, query: '美食' },
    { icon: Hotel, label: t.categories.hotel, query: '酒店' },
    { icon: Landmark, label: t.categories.attraction, query: '景点' },
    { icon: ShoppingBag, label: t.categories.shopping, query: '购物' },
    { icon: Pill, label: t.categories.pharmacy, query: '药店' },
    { icon: Banknote, label: t.categories.atm, query: 'ATM' },
    { icon: Building2, label: t.categories.museum, query: '博物馆' },
    { icon: Bus, label: t.categories.transport, query: '公交站' },
    { icon: Ticket, label: t.categories.ticket, query: '售票处' },
    { icon: User, label: t.categories.guide, query: '导游' },
  ];

  useEffect(() => {
    loadFavorites();
    loadSearchHistory();
  }, []);

  useEffect(() => {
    if (selectedPoi && selectedPoi.id) {
        loadReviews(selectedPoi.id);
        setActiveTab('overview');
    }
  }, [selectedPoi]);

  // Sync keyword with endLocation when not in directions mode
  useEffect(() => {
    if (!isDirectionsMode) {
      setEndLocation(keyword);
    }
  }, [keyword, isDirectionsMode]);

  const loadSearchHistory = () => {
    try {
      const history = localStorage.getItem('travelmap_search_history');
      if (history) {
        setSearchHistory(JSON.parse(history));
      }
    } catch (e) {
      console.error('Failed to load search history', e);
    }
  };

  const addToHistory = (term: string) => {
    if (!term.trim()) return;
    try {
      const prev = JSON.parse(localStorage.getItem('travelmap_search_history') || '[]');
      const newHistory = [term, ...prev.filter((h: string) => h !== term)].slice(0, 5);
      localStorage.setItem('travelmap_search_history', JSON.stringify(newHistory));
      setSearchHistory(newHistory);
    } catch (e) {
      console.error('Failed to save search history', e);
    }
  };

  const deleteHistoryItem = (e: React.MouseEvent, term: string) => {
    e.stopPropagation(); // Prevent triggering search
    const newHistory = searchHistory.filter(h => h !== term);
    setSearchHistory(newHistory);
    localStorage.setItem('travelmap_search_history', JSON.stringify(newHistory));
  };

  const loadReviews = async (poiId: number) => {
    try {
        const data = await getReviews(poiId);
        setReviews(data);
    } catch (e) { console.error(e); }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPoi.id) return;
    try {
        const currentUserId = user?.id || USER_ID;
        const userInfo = {
            nickname: user?.nickname || '游客',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUserId}`
        };
        await createReview(currentUserId, selectedPoi.id, rating, reviewContent, userInfo);
        setReviewContent('');
        loadReviews(selectedPoi.id);
        showToast(t.toast.reviewPublished);
    } catch (e) {
        showToast(t.toast.reviewFailed);
    }
  };

  const loadFavorites = async () => {
    try {
      const favs = await getFavorites(USER_ID);
      setSavedPlaces(favs.map((f: any) => ({ 
          ...f.poi, 
          isFavorite: true 
      })));
    } catch (error) {
      console.error('Failed to load favorites', error);
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedPoi) return;

    try {
        // Optimistic update
        const isFav = savedPlaces.some(p => p.id === selectedPoi.id);
        if (isFav) {
            setSavedPlaces(savedPlaces.filter(p => p.id !== selectedPoi.id));
            showToast(t.toast.removedFromFavorites);
        } else {
            setSavedPlaces([...savedPlaces, { ...selectedPoi, isFavorite: true }]);
            showToast(t.toast.addedToFavorites);
        }

        // Backend sync
        const savedPoi = await createOrUpdatePoi(selectedPoi);
        await toggleFavorite(USER_ID, savedPoi.id);
        loadFavorites(); // Refresh to be sure
    } catch (e) {
        console.error(e);
        showToast(t.toast.error);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSearch = (e: React.FormEvent | string) => {
    if (typeof e !== 'string') e.preventDefault();
    const term = typeof e === 'string' ? e : keyword;
    
    if (term.trim()) {
      onSearch(term);
      addToHistory(term);
      setShowHistory(false);
      // If triggered from history click, update keyword
      if (typeof e === 'string') setKeyword(term);
    }
  };

  const handleCategoryClick = (query: string) => {
    setKeyword(query);
    onSearch(query, true); // Search nearby
    addToHistory(query);
  };

  // Helper to determine types
  const isHotel = (type: string) => type?.includes('酒店') || type?.includes('住宿') || type?.includes('宾馆');
  const isDining = (type: string) => type?.includes('餐饮') || type?.includes('餐厅') || type?.includes('美食');
  const isAttraction = (type: string) => type?.includes('景点') || type?.includes('景区') || type?.includes('公园');

  const isInstagrammable = (poi: any) => {
      if (!poi) return false;
      const type = poi.type || '';
      const name = poi.name || '';
      // Heuristics for "Instagrammable" spots
      const keywords = ['咖啡', 'Cafe', 'Art', 'Museum', 'Park', 'View', 'Scenic', '景点', '网红', '拍照', 'Landmark', 'Tower'];
      // Also high rated places often look good
      const rating = poi.biz_ext?.rating ? parseFloat(poi.biz_ext.rating) : 0;
      return keywords.some(k => type.includes(k) || name.includes(k)) || rating >= 4.6;
  };

  const openMapRoute = (mode: string) => {
      if (!selectedPoi) return;
      const dest = `${selectedPoi.location.lng},${selectedPoi.location.lat}`;
      const name = selectedPoi.name;
      // AMap Web URI
      // type: car, bus, walk, ride
      const typeMap: any = { driving: 'car', transit: 'bus', walking: 'walk' };
      const url = `https://www.amap.com/dir?to=${dest},${name}&type=${typeMap[mode] || 'car'}`;
      window.open(url, '_blank');
  };

  const handleMenuAction = (action: string) => {
      if (action === 'saved') {
          onSelectPoi(null); // Clear selection to show list
          // logic to show saved places is handled by render
      } else if (action.startsWith('language:')) {
          const lang = action.split(':')[1];
          onLanguageChange(lang);
      } else {
          setActiveAction(action);
      }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 50) { // 50px threshold
      if (hasMore && !isLoadingMore && onLoadMore) {
        onLoadMore();
      }
    }
  };

  return (
    <>
      <MenuDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        onAction={handleMenuAction}
        currentLang={currentLang}
      />

      <div 
        className="fixed left-4 right-4 bottom-4 md:left-4 md:right-auto md:top-4 md:bottom-4 md:w-[400px] md:h-auto h-[45vh] glass-panel z-20 flex flex-col transition-all duration-500 ease-in-out shadow-2xl border border-cyan-500/20 rounded-3xl overflow-hidden"
      >
         {/* Cyber Header / Search Bar */}
         <div className='p-5 pb-0 relative z-30'>
            {/* Standard Search Mode */}
            {!isDirectionsMode && (
              <div className='flex items-center gap-3 relative'>
                <button onClick={() => setIsDrawerOpen(true)} className='p-2.5 hover:bg-slate-800 rounded-xl transition-all text-cyan-400 hover:text-cyan-200 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] border border-transparent hover:border-cyan-500/30'>
                  <Menu size={24} />
                </button>
                
                <div className='flex-1 relative group'>
                   <form onSubmit={handleSearch} className="relative">
                     <div className={`
                        flex items-center w-full bg-white rounded-full shadow-md transition-all duration-300
                        ${keyword ? 'shadow-lg' : 'shadow-sm'}
                        focus-within:shadow-xl focus-within:scale-[1.01]
                     `}>
                        {/* Left Icon */}
                        <div className="pl-4 pr-2 text-slate-400">
                           <Search size={20} />
                        </div>

                        {/* Input Area */}
                        <input 
                          ref={searchInputRef}
                          type='text' 
                          value={keyword}
                          onChange={(e) => setKeyword(e.target.value)}
                          onFocus={() => {
                            if (!keyword) setShowHistory(true);
                          }}
                          onBlur={() => {
                            // Delay hiding history to allow clicks
                            setTimeout(() => setShowHistory(false), 200);
                          }}
                          placeholder={t.searchPlaceholder}
                          className='flex-1 py-3 text-slate-800 placeholder-slate-400 bg-transparent outline-none min-w-0'
                        />

                        {/* Right Actions Container */}
                        <div className="flex items-center pr-1.5 py-1.5 gap-1">
                           {/* Divider */}
                           <div className="w-px h-6 bg-slate-200 mx-1"></div>
                           
                           {/* Directions Button */}
                           <button 
                             type="button"
                             onClick={() => {
                               setIsDirectionsMode(true);
                               setStartLocation('我的位置'); // Default start
                             }}
                             className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors group/dir"
                             title="路线"
                           >
                             <Navigation size={20} className="fill-current transform group-hover/dir:rotate-45 transition-transform" />
                           </button>
                        </div>
                     </div>
                   </form>

                   {/* Search History Dropdown */}
                   {showHistory && !keyword && (
                     <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                        {/* Shortcuts */}
                        <div className="px-4 py-3 hover:bg-slate-50 cursor-pointer flex items-center gap-4 text-slate-700 transition-colors" onClick={() => handleSearch('家')}>
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                <Home size={18} />
                            </div>
                            <span className="font-medium">家</span>
                        </div>
                        <div className="px-4 py-3 hover:bg-slate-50 cursor-pointer flex items-center gap-4 text-slate-700 border-b border-slate-100 pb-3 mb-1 transition-colors" onClick={() => handleSearch('公司')}>
                            <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                                <Briefcase size={18} />
                            </div>
                            <span className="font-medium">公司</span>
                        </div>

                        {/* Recent History */}
                        {searchHistory.map((item, idx) => (
                           <div 
                             key={idx} 
                             onClick={() => handleSearch(item)}
                             className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 group/item"
                           >
                              <div className="flex items-center gap-3 text-slate-600">
                                 <Clock size={16} className="text-slate-400" />
                                 <span className="font-medium text-sm">{item}</span>
                              </div>
                              <button 
                                onClick={(e) => deleteHistoryItem(e, item)}
                                className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover/item:opacity-100 transition-all"
                              >
                                 <X size={14} />
                              </button>
                           </div>
                        ))}
                     </div>
                   )}
                </div>
              </div>
            )}

            {/* Directions Mode */}
            {isDirectionsMode && (
              <div className="bg-white rounded-3xl p-4 shadow-xl border border-slate-200 animate-in fade-in slide-in-from-top-4">
                 {/* Top Actions: Back + Transport Modes */}
                 <div className="flex items-center justify-between mb-4">
                    <button 
                      onClick={() => {
                          setIsDirectionsMode(false);
                          onClear(); // Clear route on map
                      }}
                      className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors"
                    >
                       <ArrowLeft size={20} />
                    </button>
                    
                    {/* Transport Modes */}
                   <div className="flex gap-2 bg-slate-100 p-1 rounded-full">
                       <button 
                           onClick={() => setTransportMode('driving')}
                           className={`p-2 rounded-full transition-all ${transportMode === 'driving' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:bg-white/50 hover:text-slate-700'}`}
                       >
                           <Car size={18} />
                       </button>
                       <button 
                           onClick={() => setTransportMode('transfer')}
                           className={`p-2 rounded-full transition-all ${transportMode === 'transfer' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:bg-white/50 hover:text-slate-700'}`}
                       >
                           <Bus size={18} />
                       </button>
                       <button 
                           onClick={() => setTransportMode('walking')}
                           className={`p-2 rounded-full transition-all ${transportMode === 'walking' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:bg-white/50 hover:text-slate-700'}`}
                       >
                           <User size={18} />
                       </button>
                       <button 
                           onClick={() => setTransportMode('riding')}
                           className={`p-2 rounded-full transition-all ${transportMode === 'riding' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:bg-white/50 hover:text-slate-700'}`}
                       >
                           <Bike size={18} />
                       </button>
                   </div>
                 </div>

                 <div className="flex gap-3 relative">
                    {/* Connecting Line */}
                    <div className="flex flex-col items-center pt-3 w-8 shrink-0">
                       <div className="w-3 h-3 rounded-full border-[3px] border-slate-400 bg-white z-10"></div>
                       <div className="w-0.5 flex-1 bg-slate-300 my-1 min-h-[40px] border-l-2 border-dotted border-slate-300"></div>
                       <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm z-10"></div>
                    </div>

                    <div className="flex-1 space-y-3">
                       <div className="relative group">
                          <input 
                            value={startLocation}
                            onChange={(e) => setStartLocation(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-slate-400"
                            placeholder="输入起点"
                          />
                       </div>
                       <div className="relative group">
                          <input 
                            value={keyword}
                            onChange={(e) => {
                               setKeyword(e.target.value);
                               setEndLocation(e.target.value);
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 transition-all placeholder:text-slate-400"
                            placeholder="输入终点"
                            autoFocus
                          />
                       </div>
                    </div>

                    {/* Floating Swap Button */}
                    <button 
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-white border border-slate-200 rounded-full flex items-center justify-center text-blue-600 shadow-lg hover:bg-slate-50 hover:scale-110 hover:shadow-xl transition-all z-20"
                        onClick={() => {
                            const temp = startLocation;
                            setStartLocation(keyword);
                            setKeyword(temp);
                            setEndLocation(temp);
                        }}
                        title="交换起终点"
                    >
                        <ArrowUpDown size={16} />
                    </button>
                 </div>

                 {/* Action Footer */}
                 <div className="mt-4 flex justify-end gap-2 items-center">
                    {/* <span className="text-xs text-slate-400 mr-auto pl-2">最佳出行方式: <span className="text-blue-600 font-medium">驾车 15分钟</span></span> */}
                    <button 
                      onClick={() => {
                        if (onRouteSearch) {
                            onRouteSearch(startLocation, keyword, transportMode);
                        } else {
                            handleSearch(keyword);
                        }
                      }}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-full shadow-lg shadow-blue-500/30 transition-all active:scale-95"
                    >
                       查询路线
                    </button>
                 </div>
              </div>
            )}
         </div>

         {/* Categories - Horizontal Scroll */}
         {!selectedPoi && !isDirectionsMode && (
            <div className='flex gap-3 overflow-x-auto p-5 custom-scrollbar pb-2'>
               {CATEGORIES.map((cat, i) => (
                  <button key={i} onClick={() => handleCategoryClick(cat.query)} 
                    className='flex items-center gap-2 px-4 py-2.5 rounded-full shadow-sm whitespace-nowrap transition-all duration-300 flex-shrink-0 border border-cyan-900/50 hover:border-cyan-500/50 hover:bg-slate-800'
                  >
                     <cat.icon size={16} className={keyword === cat.query ? 'text-cyan-300' : 'text-cyan-700'} />
                     <span className={keyword === cat.query ? 'text-sm font-medium text-cyan-300' : 'text-sm font-medium text-cyan-600'}>{cat.label}</span>
                  </button>
               ))}
            </div>
         )}

         <div 
           className='flex-1 overflow-y-auto custom-scrollbar px-2'
           onScroll={handleScroll}
         >
           {selectedPoi ? (
             <div className='p-0 pb-10'>
               {/* Detail View - Hero Image */}
               <div className='relative h-64 mx-2 mt-2 rounded-3xl overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.5)] group border border-cyan-500/20'>
                 <img 
                   src={selectedPoi.photos?.[0]?.url || 'https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83'} 
                   className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-105'
                   alt={selectedPoi.name}
                 />
                 <div className='absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent'></div>
                 <button onClick={() => onSelectPoi(null)} className='absolute top-4 left-4 p-2.5 bg-black/40 backdrop-blur-md rounded-full text-cyan-400 hover:text-cyan-200 hover:bg-black/60 transition-all border border-cyan-500/30 shadow-lg'>
                   <ArrowLeft size={20} />
                 </button>
                 
                 <div className='absolute bottom-4 left-4 right-4 text-white'>
                    <div className='flex items-center gap-2 mb-1'>
                        <h1 className='text-2xl font-bold text-cyan-50 drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]'>{selectedPoi.name}</h1>
                        {isInstagrammable(selectedPoi) && (
                            <div className='animate-pulse bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white p-1.5 rounded-full shadow-[0_0_15px_rgba(236,72,153,0.6)] border border-white/20' title="Instagrammable Spot">
                                <Camera size={14} />
                            </div>
                        )}
                    </div>
                    <div className='flex items-center gap-2 text-sm text-cyan-100/90'>
                      <span className='flex items-center bg-cyan-600/90 backdrop-blur-sm text-black px-2 py-0.5 rounded-lg font-bold text-xs shadow-[0_0_10px_rgba(6,182,212,0.5)]'>
                        {selectedPoi.biz_ext?.rating || '4.5'} <Star size={12} className='ml-1 fill-current' />
                      </span>
                      <span className='backdrop-blur-sm bg-slate-900/60 border border-cyan-500/30 text-cyan-300 px-2 py-0.5 rounded-lg'>
                        {selectedPoi.biz_ext?.review_count || '100+'} reviews
                      </span>
                      <span className='backdrop-blur-sm bg-slate-900/60 border border-cyan-500/30 text-cyan-300 px-2 py-0.5 rounded-lg'>
                        {(selectedPoi.type || 'Place').split(';')[0]}
                      </span>
                    </div>
                 </div>
               </div>
               
               <div className='p-5'>
                 {/* Action Buttons - Neon Pills */}
                 <div className='flex flex-col gap-3 mb-8'>
                    <div className='flex gap-3'>
                        {isHotel(selectedPoi.type) ? (
                            <button onClick={() => window.open(`https://www.trip.com/hotels/w/search?q=${selectedPoi.name}`, '_blank')} className='flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-3 rounded-2xl font-semibold shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 border border-cyan-400/50'>
                                <Hotel size={18} /> Trip.com 预订
                            </button>
                        ) : isAttraction(selectedPoi.type) ? (
                            <div className='flex-1 flex gap-2'>
                                <button onClick={() => window.open(`https://www.trip.com/travel-guide-attraction/${selectedPoi.name}`, '_blank')} className='flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-2xl font-semibold shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-1 border border-purple-400/50 text-xs'>
                                    <Ticket size={16} /> 门票预订
                                </button>
                                <button onClick={() => window.alert('导游预约功能即将上线 / Guide Booking Coming Soon')} className='flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-2xl font-semibold shadow-[0_0_15px_rgba(249,115,22,0.4)] hover:shadow-[0_0_25px_rgba(249,115,22,0.6)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-1 border border-orange-400/50 text-xs'>
                                    <User size={16} /> 导游预约
                                </button>
                            </div>
                        ) : isDining(selectedPoi.type) ? (
                            <button onClick={() => setBookingModalOpen(true)} className='flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-3 rounded-2xl font-semibold shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 border border-cyan-400/50'>
                                <Calendar size={18} /> 预订座位
                            </button>
                        ) : (
                            <button onClick={() => openMapRoute('driving')} className='flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-3 rounded-2xl font-semibold shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 border border-cyan-400/50'>
                                <Navigation size={18} /> {t.common.navigate || 'Navigate'}
                            </button>
                        )}
                        <button onClick={handleToggleFavorite} className='p-3 rounded-2xl border border-cyan-500/30 bg-slate-900/50 text-cyan-400 hover:bg-cyan-900/30 hover:shadow-[0_0_10px_rgba(6,182,212,0.3)] hover:-translate-y-0.5 transition-all'>
                            <Bookmark size={20} className={savedPlaces.some(p => p.id === selectedPoi.id) ? 'fill-current' : ''} />
                        </button>
                        <button className='p-3 rounded-2xl border border-cyan-500/30 bg-slate-900/50 text-cyan-400 hover:bg-cyan-900/30 hover:shadow-[0_0_10px_rgba(6,182,212,0.3)] hover:-translate-y-0.5 transition-all'>
                            <Share2 size={20} />
                        </button>
                    </div>

                    {/* Navigation Modes */}
                    <div className='grid grid-cols-3 gap-2'>
                        <button onClick={() => openMapRoute('walking')} className='py-2.5 bg-slate-800/50 rounded-xl text-xs font-medium text-cyan-300 hover:bg-cyan-900/30 hover:text-cyan-100 border border-cyan-900/30 transition-all flex items-center justify-center gap-1.5'>
                            <span>🚶</span> 步行导航
                        </button>
                        <button onClick={() => openMapRoute('transit')} className='py-2.5 bg-slate-800/50 rounded-xl text-xs font-medium text-cyan-300 hover:bg-cyan-900/30 hover:text-cyan-100 border border-cyan-900/30 transition-all flex items-center justify-center gap-1.5'>
                            <span>🚌</span> 公交/地铁
                        </button>
                        <button onClick={() => openMapRoute('driving')} className='py-2.5 bg-slate-800/50 rounded-xl text-xs font-medium text-cyan-300 hover:bg-cyan-900/30 hover:text-cyan-100 border border-cyan-900/30 transition-all flex items-center justify-center gap-1.5'>
                            <span>🚗</span> 驾车前往
                        </button>
                    </div>
                 </div>

                 {/* Modern Tabs - Cyber Segmented Control */}
                 <div className='flex p-1 bg-slate-900/80 rounded-2xl mb-6 border border-cyan-500/20'>
                   <button 
                     onClick={() => setActiveTab('overview')} 
                     className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all duration-300 ${activeTab === 'overview' ? 'bg-cyan-900/40 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)] border border-cyan-500/30' : 'text-slate-400 hover:text-cyan-200 hover:bg-slate-800'}`}
                   >
                     {t.detail.overview}
                   </button>
                   <button 
                     onClick={() => setActiveTab('reviews')} 
                     className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all duration-300 ${activeTab === 'reviews' ? 'bg-cyan-900/40 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)] border border-cyan-500/30' : 'text-slate-400 hover:text-cyan-200 hover:bg-slate-800'}`}
                   >
                     {t.detail.reviews}
                   </button>
                   <button 
                     onClick={() => setActiveTab('photos')} 
                     className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all duration-300 ${activeTab === 'photos' ? 'bg-cyan-900/40 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)] border border-cyan-500/30' : 'text-slate-400 hover:text-cyan-200 hover:bg-slate-800'}`}
                   >
                     {t.detail.photos}
                   </button>
                   <button 
                     onClick={() => setActiveTab('chat')} 
                     className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all duration-300 ${activeTab === 'chat' ? 'bg-cyan-900/40 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)] border border-cyan-500/30' : 'text-slate-400 hover:text-cyan-200 hover:bg-slate-800'}`}
                   >
                     {t.detail.chat || 'AI Chat'}
                   </button>
                 </div>

                 {/* Tab Content */}
                 <div className='bg-slate-900/40 rounded-3xl p-4 border border-cyan-500/10'>
                   {activeTab === 'overview' && (
                     <div className='space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500'>
                       <div className='flex gap-4 items-start group'>
                         <div className='p-2.5 bg-blue-900/30 rounded-2xl text-blue-400 group-hover:bg-blue-900/50 transition-colors border border-blue-500/20'>
                           <MapPin size={20} />
                         </div>
                         <div className='text-slate-300 leading-relaxed mt-1'>{selectedPoi.address}</div>
                       </div>
                       <div className='flex gap-4 items-start group'>
                         <div className='p-2.5 bg-purple-900/30 rounded-2xl text-purple-400 group-hover:bg-purple-900/50 transition-colors border border-purple-500/20'>
                           <Clock size={20} />
                         </div>
                         <div className='text-slate-300 mt-1'>
                            {selectedPoi.biz_ext?.open_time ? (
                                <span>{selectedPoi.biz_ext.open_time}</span>
                            ) : (
                                <span className='text-slate-500'>Opening hours not available</span>
                            )}
                         </div>
                       </div>
                       <div className='flex gap-4 items-start group'>
                         <div className='p-2.5 bg-green-900/30 rounded-2xl text-green-400 group-hover:bg-green-900/50 transition-colors border border-green-500/20'>
                            <Phone size={20} />
                         </div>
                         <div className='text-slate-300 mt-1'>{selectedPoi.tel || 'No contact info'}</div>
                       </div>
                       <div className='flex gap-4 items-start group'>
                         <div className='p-2.5 bg-pink-900/30 rounded-2xl text-pink-400 group-hover:bg-pink-900/50 transition-colors border border-pink-500/20'>
                           <Globe size={20} />
                         </div>
                         {selectedPoi.website ? (
                             <a href={selectedPoi.website} target='_blank' rel='noopener noreferrer' className='text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer mt-1 font-medium block truncate max-w-[200px]'>
                                 Visit website
                             </a>
                         ) : (
                             <div className='text-slate-500 mt-1'>Website not available</div>
                         )}
                       </div>
                       
                       {/* Payment Support Section */}
                       <div className='pt-4 border-t border-slate-800/50'>
                          <h3 className='text-sm font-semibold text-cyan-200 mb-3 flex items-center gap-2'>
                              Payment Support
                              <span className='px-1.5 py-0.5 rounded-md bg-cyan-900/30 text-cyan-400 text-[10px] border border-cyan-500/20'>Foreigner Friendly</span>
                          </h3>
                          <div className='flex gap-3'>
                              <div className='flex items-center gap-2 bg-[#1677FF]/10 border border-[#1677FF]/30 px-3 py-2 rounded-xl text-[#1677FF]'>
                                  <Smartphone size={16} />
                                  <span className='text-xs font-bold'>Alipay</span>
                              </div>
                              <div className='flex items-center gap-2 bg-[#09BB07]/10 border border-[#09BB07]/30 px-3 py-2 rounded-xl text-[#09BB07]'>
                                  <QrCode size={16} />
                                  <span className='text-xs font-bold'>WeChat Pay</span>
                              </div>
                          </div>
                       </div>
                     </div>
                   )}

                   {activeTab === 'reviews' && (
                     <div className='animate-in fade-in slide-in-from-bottom-4 duration-500'>
                        <div className='flex items-center justify-between mb-6'>
                           <h2 className='font-bold text-xl text-cyan-100'>{t.detail.reviews}</h2>
                           <span className='text-sm text-cyan-600 bg-slate-800 px-2 py-1 rounded-lg border border-cyan-900/30'>{reviews.length} total</span>
                        </div>
                        
                        <form onSubmit={handleSubmitReview} className='mb-8 bg-slate-900/50 p-5 rounded-2xl border border-cyan-500/20 focus-within:ring-2 focus-within:ring-cyan-500/30 transition-all'>
                            <div className='flex gap-2 mb-4'>
                                {[1,2,3,4,5].map(star => (
                                    <button type='button' key={star} onClick={() => setRating(star)} className='transition-transform hover:scale-110 '>
                                        <Star size={24} className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'} />
                                    </button>
                                ))}
                            </div>
                            <textarea 
                                value={reviewContent}
                                onChange={(e) => setReviewContent(e.target.value)}
                                className='w-full p-3 bg-slate-800 border border-slate-700 rounded-xl mb-3 text-sm text-cyan-100 focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 outline-none transition-all placeholder-slate-500'
                                placeholder={t.detail.shareExperience}
                                rows={3}
                            />
                            <button type='submit' className='w-full py-2.5 bg-cyan-900/50 text-cyan-300 text-sm font-medium rounded-xl hover:bg-cyan-800/50 transition-colors border border-cyan-500/30 hover:shadow-[0_0_10px_rgba(6,182,212,0.3)]'>
                                {t.detail.publishReview}
                            </button>
                        </form>
                        
                        <div className='space-y-6'>
                            {reviews.map((review, i) => (
                                <div key={i} className='border-b border-slate-800 pb-6 last:border-0 hover:bg-slate-800/30 p-2 rounded-2xl transition-colors'>
                                    <div className='flex items-center gap-3 mb-2'>
                                        {review.avatar ? (
                                           <img src={review.avatar} alt="avatar" className='w-10 h-10 rounded-full border border-cyan-500/30 bg-slate-900' />
                                        ) : (
                                           <div className='w-10 h-10 bg-gradient-to-br from-cyan-900 to-blue-900 rounded-full flex items-center justify-center text-cyan-300 text-xs font-bold shadow-inner border border-cyan-500/30'>
                                              {review.username ? review.username[0] : `U${review.user_id}`}
                                           </div>
                                        )}
                                        <div className='flex-1'>
                                            <div className='flex justify-between items-start'>
                                                <span className='text-sm font-medium text-cyan-200'>{review.username || `User ${review.user_id}`}</span>
                                                {review.source && review.source !== 'Local' && (
                                                  <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                                                    review.source === 'Meituan' 
                                                      ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' 
                                                      : 'bg-orange-500/20 text-orange-500 border-orange-500/30'
                                                  }`}>
                                                    {review.source === 'Meituan' ? '美团' : '大众点评'}
                                                  </span>
                                                )}
                                            </div>
                                            <div className='flex text-yellow-400 gap-0.5 items-center mt-0.5'>
                                                {[...Array(review.rating || 5)].map((_, j) => <Star key={j} size={10} className='fill-current' />)}
                                                <span className='text-xs text-slate-500 ml-2'>{new Date(review.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className='text-sm text-slate-300 leading-relaxed pl-13'>{review.content}</p>
                                </div>
                            ))}
                            {reviews.length === 0 && (
                                <div className='text-center py-10 bg-slate-900/30 rounded-2xl border border-dashed border-slate-700'>
                                    <div className='text-slate-500 mb-2'>No reviews yet</div>
                                    <div className='text-xs text-slate-600'>Be the first to share your experience!</div>
                                </div>
                            )}
                        </div>
                     </div>
                   )}

                   {activeTab === 'photos' && (
                     <div className='animate-in fade-in slide-in-from-bottom-4 duration-500'>
                        {/* Videos Section */}
                        {selectedPoi.videos && selectedPoi.videos.length > 0 && (
                          <div className="mb-6">
                            <h3 className="text-cyan-100 font-bold mb-3 text-sm">Videos</h3>
                            <div className="grid grid-cols-1 gap-3">
                              {selectedPoi.videos.map((video: string, i: number) => (
                                <div key={`vid-${i}`} className="rounded-2xl overflow-hidden border border-cyan-500/20 shadow-sm bg-black">
                                  <video src={video} controls className="w-full aspect-video object-contain" />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className='grid grid-cols-2 gap-3'>
                          {(selectedPoi.photos || []).map((photo: any, i: number) => (
                             <div key={i} className='group relative aspect-square rounded-2xl overflow-hidden shadow-sm cursor-pointer border border-cyan-500/20'>
                                 <img src={photo.url} className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110' alt='' />
                                 <div className='absolute inset-0 bg-black/0 group-hover:bg-cyan-500/10 transition-colors'></div>
                             </div>
                          ))}
                          <div className='aspect-square bg-slate-900/50 rounded-2xl flex flex-col items-center justify-center text-slate-500 text-sm border-2 border-dashed border-slate-700 hover:bg-slate-800 transition-colors cursor-pointer hover:border-cyan-500/30 hover:text-cyan-400'>
                             <MapIcon size={24} className='mb-2 opacity-50' />
                             {t.detail.morePhotosComing}
                          </div>
                        </div>
                     </div>
                   )}

                 </div>
               </div>
             </div>
           ) : isSearching ? (
             <div className='p-4'>
                <h2 className='text-lg font-bold mb-4 px-2 text-cyan-100'>{t.common.foundResults.replace('{count}', results.length)}</h2>
                {currentLang !== 'zh-CN' && (
                  <div className='flex items-start gap-3 p-4 bg-blue-900/20 text-blue-300 rounded-2xl text-xs mb-6 border border-blue-500/20'>
                    <Languages size={16} className='mt-0.5 shrink-0 text-blue-400' />
                    <p className='leading-relaxed'>Map data (place names, addresses) is provided by local map services and may only be available in the local language.</p>
                  </div>
                )}
                <div className='space-y-4 pb-10'>
                  {results.map((poi, index) => (
                    <div key={index} onClick={() => onSelectPoi(poi)} className='group cursor-pointer bg-slate-900/50 border border-slate-800 rounded-2xl p-4 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/40 ring-1 ring-transparent hover:ring-cyan-500/20'>
                      <div className='flex justify-between items-start gap-2'>
                          <div>
                            <div className='font-semibold text-cyan-100 group-hover:text-cyan-400 transition-colors text-lg'>{poi.name}</div>
                            <div className='text-sm text-slate-400 mt-1 truncate flex items-center gap-1'>
                                <MapPin size={12} /> {poi.address}
                            </div>
                          </div>
                          {poi.photos && poi.photos[0] && (
                              <img src={poi.photos[0].url} className='w-16 h-16 rounded-lg object-cover bg-slate-800 shrink-0 border border-slate-700' alt='' />
                          )}
                      </div>
                      <div className='mt-3 flex gap-2 text-xs'>
                         <span className='px-2 py-1 bg-slate-800 text-slate-400 rounded-md group-hover:bg-cyan-900/30 group-hover:text-cyan-300 transition-colors border border-slate-700 group-hover:border-cyan-500/30'>{poi.type?.split(';')[0]}</span>
                      </div>
                    </div>
                  ))}
                  
                   {isLoadingMore && (
                      <div className='flex items-center justify-center py-4 text-cyan-500'>
                          <Loader2 size={24} className='animate-spin' />
                      </div>
                    )}
  
                    {!hasMore && results.length > 0 && (
                      <div className='text-center py-4 text-slate-500 text-sm'>
                        No more results
                      </div>
                    )}
  
                     {results.length === 0 && (
                     <div className='text-center py-20'>
                         <div className='w-20 h-20 bg-slate-900/50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-700 border border-slate-800'>
                             <Search size={32} />
                         </div>
                         <div className='text-slate-500 font-medium'>No places found</div>
                         <div className='text-xs text-slate-600 mt-1'>Try changing your keywords</div>
                     </div>
                   )}
                </div>
             </div>
           ) : (
             <div className='p-8 text-center text-slate-500 mt-10'>
                <div className='w-24 h-24 bg-slate-900/50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(6,182,212,0.1)] border border-slate-800'>
                    <MapIcon size={40} className='text-slate-700' />
                </div>
                <h3 className='text-xl font-bold text-slate-300 mb-2'>{t.common.welcome}</h3>
                <p className='text-slate-500 max-w-[200px] mx-auto'>{t.common.startPrompt}</p>
                
                {savedPlaces.length > 0 && (
                    <div className='mt-10'>
                        <h4 className='text-sm font-semibold text-cyan-700 mb-4 uppercase tracking-wider'>Your Saved Places</h4>
                        <div className='space-y-3'>
                            {savedPlaces.slice(0, 3).map((place, i) => (
                                <div key={i} onClick={() => onSelectPoi(place)} className='flex items-center gap-3 p-3 bg-slate-900/50 rounded-xl cursor-pointer hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/30 transition-all group text-left'>
                                    <div className='p-2 bg-cyan-900/20 rounded-lg text-cyan-500 group-hover:text-cyan-400'>
                                        <Bookmark size={16} className='fill-current' />
                                    </div>
                                    <div className='flex-1 min-w-0'>
                                        <div className='font-medium text-slate-300 truncate group-hover:text-cyan-200'>{place.name}</div>
                                        <div className='text-xs text-slate-500 truncate'>{place.address}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
             </div>
           )}
         </div>
      </div>
      
      <BookingModal 
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        poiName={selectedPoi?.name || ''}
      />
    </>
  );
}
