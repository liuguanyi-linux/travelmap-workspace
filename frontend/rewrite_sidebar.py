import os

file_path = 'src/components/Sidebar.tsx'

content = """import React, { useState, useEffect } from 'react';
import { 
  Search, MapPin, Star, Navigation, X, Loader2, Menu, 
  Utensils, Hotel, ShoppingBag, Landmark, Share2, Bookmark, 
  Smartphone, Bus, Banknote, Pill, Ticket, User, Building2,
  Clock, Phone, Globe, ChevronRight, Calendar, CreditCard,
  Map as MapIcon, Info, Download, History, ArrowLeft, ExternalLink, Printer
} from 'lucide-react';
import MenuDrawer from './MenuDrawer';
import { toggleFavorite, getFavorites, createOrUpdatePoi, createBooking, getReviews, createReview, Poi } from '../api';

const USER_ID = 1;

interface SidebarProps {
  onSearch: (keyword: string, isNearby?: boolean) => void;
  results: any[];
  isSearching: boolean;
  onSelectPoi: (poi: any) => void;
  selectedPoi: any;
  onClear: () => void;
}

const CATEGORIES = [
  { icon: Utensils, label: '美食', query: '美食' },
  { icon: Hotel, label: '酒店', query: '酒店' },
  { icon: Landmark, label: '景点', query: '景点' },
  { icon: ShoppingBag, label: '购物', query: '购物' },
  { icon: Pill, label: '药店', query: '药店' },
  { icon: Banknote, label: 'ATM', query: 'ATM' },
  { icon: Building2, label: '博物馆', query: '博物馆' },
  { icon: Bus, label: '交通', query: '公交站' },
  { icon: Ticket, label: '票务', query: '售票处' },
  { icon: User, label: '导游', query: '旅行社' },
];

export default function Sidebar({ 
  onSearch, 
  results, 
  isSearching, 
  onSelectPoi, 
  selectedPoi,
  onClear 
}: SidebarProps) {
  const [keyword, setKeyword] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // State for features
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [savedPlaces, setSavedPlaces] = useState<any[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [reviewContent, setReviewContent] = useState('');
  const [rating, setRating] = useState(5);

  useEffect(() => {
    loadFavorites();
  }, []);

  useEffect(() => {
    if (selectedPoi && selectedPoi.id) {
        loadReviews(selectedPoi.id);
        setActiveTab('overview');
    }
  }, [selectedPoi]);

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
        await createReview(USER_ID, selectedPoi.id, rating, reviewContent);
        setReviewContent('');
        loadReviews(selectedPoi.id);
        showToast('评价已发布');
    } catch (e) {
        showToast('发布评价失败');
    }
  };

  const loadFavorites = async () => {
    try {
      const favs = await getFavorites(USER_ID);
      setSavedPlaces(favs.map((f: any) => ({ 
          ...f.poi, 
          id: f.poi.amapId, 
          photos: JSON.parse(f.poi.photos || '[]'),
          biz_ext: JSON.parse(f.poi.description || '{}')
      }))); 
    } catch (error) {
      console.error('Failed to load favorites', error);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      onSearch(keyword);
    }
  };

  const handleAction = (action: string) => {
    console.log('Action triggered:', action);
    setActiveAction(action);
    
    // Handle immediate actions
    if (action === 'print') {
      window.print();
      setActiveAction(null);
    } else if (action === 'share_embed') {
      navigator.clipboard.writeText(window.location.href);
      showToast('链接已复制到剪贴板');
      setActiveAction(null);
    } else if (action === 'saved') {
      onClear(); // Clear current selection to show saved list
    }
  };

  const toggleSave = async (poi: any) => {
    try {
        const poiData: Poi = {
            amapId: poi.id, 
            name: poi.name,
            type: poi.type,
            address: poi.address,
            tel: poi.tel,
            location: poi.location ? (typeof poi.location === 'object' ? `${poi.location.lng},${poi.location.lat}` : poi.location) : undefined,
            photos: poi.photos,
            biz_ext: poi.biz_ext
        };
        const savedPoi = await createOrUpdatePoi(poiData);
        
        await toggleFavorite(USER_ID, savedPoi.id!);
        
        showToast(savedPlaces.some(p => p.id === poi.id) ? '已从保存列表中移除' : '已保存地点');
        loadFavorites();
    } catch (error) {
        console.error('Failed to toggle favorite', error);
        showToast('操作失败，请重试');
    }
  };

  // Mini Sidebar (Dock) when collapsed
  if (isCollapsed) {
    return (
      <>
        <div className="absolute top-0 left-0 h-full w-16 bg-white shadow-md z-20 flex flex-col items-center py-4 gap-6">
           <button 
            onClick={() => setIsCollapsed(false)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-700"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <button 
            onClick={() => handleAction('saved')}
            className="flex flex-col items-center gap-1 text-gray-600 hover:text-blue-600 cursor-pointer"
          >
            <Bookmark className="w-6 h-6" />
            <span className="text-[10px] font-medium">已保存</span>
          </button>

          <button 
            onClick={() => handleAction('recent')}
            className="flex flex-col items-center gap-1 text-gray-600 hover:text-blue-600 cursor-pointer"
          >
            <History className="w-6 h-6" />
            <span className="text-[10px] font-medium">最近</span>
          </button>
          
          <div className="mt-auto flex flex-col items-center gap-1 text-gray-600 hover:text-blue-600 cursor-pointer mb-4">
             <Download className="w-6 h-6" />
             <span className="text-[10px] font-medium text-center leading-tight">下载<br/>应用</span>
          </div>
        </div>
        <MenuDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} onAction={handleAction} />
        <ActionModal action={activeAction} onClose={() => setActiveAction(null)} savedPlaces={savedPlaces} />
        {toastMessage && <Toast message={toastMessage} />}
        <BookingModal isOpen={bookingModalOpen} onClose={() => setBookingModalOpen(false)} poi={selectedPoi} />
      </>
    )
  }

  // Saved Places View
  if (activeAction === 'saved' && !selectedPoi) {
    return (
       <div className={`fixed top-0 left-0 h-full bg-white shadow-xl transition-all duration-300 z-10 flex flex-col ${isCollapsed ? 'w-0' : 'w-[400px]'}`}>
        <div className="p-4 border-b flex items-center gap-4">
             <button onClick={() => setActiveAction(null)} className="p-2 hover:bg-gray-100 rounded-full">
                <ArrowLeft className="w-5 h-5" />
             </button>
             <h2 className="text-xl font-bold">已保存的地点</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
            {savedPlaces.map((poi, idx) => (
                <div key={idx} className="mb-4 p-4 border rounded-lg hover:shadow-md cursor-pointer" onClick={() => onSelectPoi(poi)}>
                    <h3 className="font-bold">{poi.name}</h3>
                    <p className="text-sm text-gray-500">{poi.address}</p>
                    <div className="flex gap-2 mt-2">
                         {poi.type && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{poi.type.split(';')[0]}</span>}
                    </div>
                </div>
            ))}
            {savedPlaces.length === 0 && <p className="text-gray-500 text-center mt-10">暂无保存的地点</p>}
        </div>
        <MenuDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} onAction={handleAction} />
        {toastMessage && <Toast message={toastMessage} />}
       </div>
    );
  }

  return (
    <>
      <MenuDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} onAction={handleAction} />
      <ActionModal action={activeAction} onClose={() => setActiveAction(null)} savedPlaces={savedPlaces} />
      {toastMessage && <Toast message={toastMessage} />}
      <BookingModal isOpen={bookingModalOpen} onClose={() => setBookingModalOpen(false)} poi={selectedPoi} />
      
      <div className="absolute top-0 left-0 h-full w-[400px] bg-white shadow-xl z-20 flex flex-col transition-transform duration-300 ease-in-out transform translate-x-0">
        {/* Search Header */}
        <div className="p-3 shadow-sm z-10 bg-white">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-gray-800 flex items-center">
              <MapPin className="w-6 h-6 mr-2 text-blue-600" />
              TravelMap
            </h1>
            <button onClick={() => setIsCollapsed(true)} className="text-gray-400 hover:text-gray-600" title="收起侧边栏">
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
          </div>
          
          <form onSubmit={handleSearch} className="relative mb-3">
            <button
               type="button"
               onClick={() => setIsDrawerOpen(true)}
               className="absolute left-3 top-2.5 text-gray-500 hover:text-gray-800 p-0.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="在 TravelMap 中搜索..."
              className="w-full pl-12 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-sm"
            />
            <div className="absolute right-3 top-2.5 flex gap-2">
                <Search className="text-blue-600 w-5 h-5 cursor-pointer border-l border-gray-300 pl-2 box-content" onClick={() => keyword && onSearch(keyword)} />
                {keyword && (
                  <button
                    type="button"
                    onClick={() => {
                      setKeyword('');
                      onClear();
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
            </div>
          </form>

          {/* Categories */}
          {!selectedPoi && (
             <div className="flex justify-between gap-4 overflow-x-auto pb-2 scrollbar-hide">
               {CATEGORIES.slice(0, 4).map((cat, idx) => (
                 <button 
                   key={idx}
                   onClick={() => onSearch(cat.query, true)}
                   className="flex flex-col items-center min-w-[60px] gap-1 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                 >
                   <div className="p-2 rounded-full bg-white border border-gray-200 group-hover:border-blue-400 group-hover:bg-blue-50 transition-colors shadow-sm">
                     <cat.icon className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                   </div>
                   <span className="text-xs text-gray-600 font-medium">{cat.label}</span>
                 </button>
               ))}
               <button 
                  onClick={() => setActiveAction('categories')}
                  className="flex flex-col items-center min-w-[60px] gap-1 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
               >
                  <div className="p-2 rounded-full bg-white border border-gray-200 group-hover:border-blue-400 group-hover:bg-blue-50 transition-colors shadow-sm">
                     <div className="w-5 h-5 flex items-center justify-center text-gray-600 group-hover:text-blue-600 font-bold">...</div>
                  </div>
                  <span className="text-xs text-gray-600 font-medium">更多</span>
               </button>
             </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {isSearching ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin mb-2 text-blue-600" />
              <p>正在搜索...</p>
            </div>
          ) : selectedPoi ? (
            <div className="bg-white min-h-full">
               {/* Detail View Header */}
              <div className="relative h-48 bg-gray-200">
                <img 
                  src={selectedPoi.photos?.[0]?.url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80'} 
                  alt={selectedPoi.name}
                  className="w-full h-full object-cover"
                />
                <button 
                  onClick={onClear}
                  className="absolute top-4 left-4 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-sm"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-700" />
                </button>
              </div>

              <div className="p-4 border-b">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">{selectedPoi.name}</h1>
                <div className="flex items-center gap-2 mb-3">
                    <span className="flex items-center text-orange-500 font-bold">
                        {selectedPoi.biz_ext?.rating || 4.5} <Star className="w-4 h-4 fill-current ml-1" />
                    </span>
                    <span className="text-gray-400">|</span>
                    <span className="text-gray-600 text-sm">{selectedPoi.type?.split(';')[0]}</span>
                    <span className="text-gray-400">|</span>
                    <span className="text-gray-600 text-sm">{selectedPoi.biz_ext?.cost ? `${selectedPoi.biz_ext.cost}/人` : '价格适中'}</span>
                </div>
                
                <div className="flex gap-2">
                   <ActionButton 
                      icon={Bookmark} 
                      label={savedPlaces.some(p => p.id === selectedPoi.id) ? "已保存" : "保存"} 
                      active={savedPlaces.some(p => p.id === selectedPoi.id)}
                      onClick={() => toggleSave(selectedPoi)} 
                    />
                   <ActionButton icon={Share2} label="分享" onClick={() => handleAction('share_embed')} />
                   <ActionButton icon={Smartphone} label="发送到手机" onClick={() => showToast('已发送到您的手机')} />
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b bg-white sticky top-0 z-10">
                <button onClick={() => setActiveTab('overview')} className={`flex-1 py-3 text-sm font-medium ${activeTab === 'overview' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>概览</button>
                <button onClick={() => setActiveTab('reviews')} className={`flex-1 py-3 text-sm font-medium ${activeTab === 'reviews' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>评价 ({reviews.length})</button>
                <button onClick={() => setActiveTab('photos')} className={`flex-1 py-3 text-sm font-medium ${activeTab === 'photos' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>照片</button>
              </div>

              {activeTab === 'overview' ? (
                <div className="p-4 space-y-4">
                  <InfoRow icon={MapPin} text={selectedPoi.address} />
                  <InfoRow icon={Clock} text={selectedPoi.biz_ext?.open_time || '营业时间: 09:00 - 22:00'} />
                  <InfoRow icon={Phone} text={selectedPoi.tel || '暂无联系方式'} />
                  <InfoRow icon={Globe} text="www.travelmap.com" action={() => window.open('https://www.google.com', '_blank')} />
                  <InfoRow icon={Ticket} text="门票预订" action={() => showToast('票务系统即将上线')} />
                </div>
              ) : activeTab === 'reviews' ? (
                <div className="p-4 space-y-4 flex-1">
                    <form onSubmit={handleSubmitReview} className="space-y-3 mb-6 bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">您的评分:</span>
                            {[1,2,3,4,5].map(s => (
                                <Star key={s} className={`w-5 h-5 cursor-pointer ${s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} onClick={() => setRating(s)} />
                            ))}
                        </div>
                        <textarea 
                            value={reviewContent} 
                            onChange={e => setReviewContent(e.target.value)}
                            placeholder="分享您的体验..."
                            className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            rows={3}
                        />
                        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">发布评价</button>
                    </form>
                    <div className="space-y-4">
                        {reviews.length === 0 && <p className="text-center text-gray-500 text-sm">暂无评价，快来抢沙发吧！</p>}
                        {reviews.map((review, idx) => (
                            <div key={idx} className="border-b pb-4 last:border-0">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
                                            {review.user?.nickname?.[0] || 'U'}
                                        </div>
                                        <span className="font-bold text-sm">{review.user?.nickname || 'Traveler'}</span>
                                    </div>
                                    <span className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex gap-1 mb-2">
                                    {[...Array(review.rating)].map((_, i) => <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)}
                                </div>
                                <p className="text-sm text-gray-700 leading-relaxed">{review.content}</p>
                            </div>
                        ))}
                    </div>
                </div>
              ) : (
                <div className="p-4 grid grid-cols-2 gap-2">
                    {selectedPoi.photos?.map((photo: any, idx: number) => (
                        <img key={idx} src={photo.url} alt={photo.title} className="w-full h-32 object-cover rounded-lg" />
                    ))}
                    <div className="col-span-2 text-center text-gray-500 py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <p>更多照片功能即将上线</p>
                    </div>
                </div>
              )}
              
              {/* Bottom Action Buttons */}
              <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                  <div className="flex gap-3">
                    {selectedPoi.type?.includes('酒店') && (
                        <button 
                            onClick={() => setBookingModalOpen(true)}
                            className="flex-1 bg-blue-600 text-white py-2.5 rounded-full font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                        >
                            <Calendar className="w-4 h-4" />
                            立即预订
                        </button>
                    )}
                    <button 
                        onClick={() => showToast('路线规划功能正在开发中')} 
                        className={`flex-1 ${selectedPoi.type?.includes('酒店') ? 'bg-white text-blue-600 border border-blue-200' : 'bg-blue-600 text-white shadow-lg shadow-blue-200'} py-2.5 rounded-full font-medium hover:opacity-90 transition-colors flex items-center justify-center gap-2`}
                    >
                        <Navigation className="w-4 h-4" />
                        路线
                    </button>
                  </div>
              </div>

            </div>
          ) : (
            <div className="p-4">
              {results.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500 font-medium px-1">找到 {results.length} 个结果</p>
                  {results.map((poi, index) => (
                    <div 
                      key={index}
                      onClick={() => onSelectPoi(poi)}
                      className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-transparent hover:border-blue-100 group"
                    >
                      <div className="flex gap-3">
                         <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                           <img 
                             src={poi.photos?.[0]?.url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&q=80'} 
                             alt={poi.name}
                             className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                           />
                         </div>
                         <div className="flex-1 min-w-0">
                           <h3 className="font-bold text-gray-800 mb-1 truncate">{poi.name}</h3>
                           <div className="flex items-center gap-1 mb-2">
                             <span className="text-orange-500 font-bold text-xs flex items-center">
                               {poi.biz_ext?.rating || 4.5} <Star className="w-3 h-3 fill-current ml-0.5" />
                             </span>
                             <span className="text-gray-300">|</span>
                             <span className="text-gray-500 text-xs truncate">{poi.type?.split(';')[0]}</span>
                           </div>
                           <p className="text-xs text-gray-500 truncate mb-2">{poi.address}</p>
                           <div className="flex gap-2">
                              {poi.biz_ext?.cost && <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{poi.biz_ext.cost}/人</span>}
                              {poi.type?.includes('酒店') && <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">可预订</span>}
                           </div>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                 <div className="text-center py-20">
                    <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <MapIcon className="w-12 h-12 text-blue-200" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">探索世界</h3>
                    <p className="text-gray-500 text-sm max-w-xs mx-auto">
                        搜索酒店、餐厅、景点等，开始您的旅程。支持全球20+语言。
                    </p>
                 </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function ActionButton({ icon: Icon, label, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center min-w-[70px] gap-1 p-2 rounded-full transition-colors ${
        active
          ? 'bg-blue-50 text-blue-600'
          : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      <div className={`p-2 rounded-full ${active ? 'bg-white shadow-sm' : 'border border-gray-200'}`}>
        <Icon className={`w-5 h-5 ${active ? 'fill-blue-600' : ''}`} />
      </div>
      <span className={`text-xs font-medium ${active ? 'text-blue-600' : 'text-gray-600'}`}>{label}</span>
    </button>
  );
}

function InfoRow({ icon: Icon, text, action }: any) {
  return (
    <div className="flex items-start gap-3 text-sm text-gray-600 group">
      <Icon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0 group-hover:text-blue-600 transition-colors" />
      <span className="flex-1 leading-relaxed">{text}</span>
      {action && (
        <button onClick={action} className="text-blue-600 text-xs font-medium hover:underline flex-shrink-0">
           操作
        </button>
      )}
    </div>
  );
}

function Toast({ message }: { message: string }) {
  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-full shadow-lg text-sm z-[100] animate-fade-in-up flex items-center gap-2">
      <Info className="w-4 h-4" />
      {message}
    </div>
  );
}

function ActionModal({ action, onClose, savedPlaces }: { action: string | null, onClose: () => void, savedPlaces: any[] }) {
    if (!action || action === 'saved') return null; // 'saved' is handled by main view

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm relative z-10 overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-800">
                        {action === 'recent' && '最近搜索'}
                        {action === 'contributions' && '您的贡献'}
                        {action === 'categories' && '更多分类'}
                        {!['recent', 'contributions', 'categories'].includes(action) && '功能演示'}
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full"><X className="w-5 h-5" /></button>
                </div>
                
                <div className="max-h-[60vh] overflow-y-auto">
                    {action === 'recent' ? (
                        <div className="p-4">
                            <p className="text-gray-500 text-sm mb-4">这里将显示您的最近搜索记录。</p>
                            <div className="p-3 bg-blue-50 text-blue-800 text-xs rounded border border-blue-100">
                                演示模式：后端数据库连接正常，但此功能尚未完全实现。
                            </div>
                        </div>
                    ) : action === 'categories' ? (
                        <div className="p-4 grid grid-cols-4 gap-4">
                            {CATEGORIES.slice(4).map((cat, idx) => (
                                <button key={idx} className="flex flex-col items-center gap-2">
                                    <div className="p-3 bg-gray-50 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                                        <cat.icon className="w-6 h-6" />
                                    </div>
                                    <span className="text-xs text-gray-600">{cat.label}</span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="p-6 text-center">
                            <p className="text-gray-600 mb-2">您点击了 "{action}"。</p>
                            <p className="text-gray-500 text-sm">此功能正在开发中，敬请期待！</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function BookingModal({ isOpen, onClose, poi }: any) {
    const [date, setDate] = useState('');
    const [guests, setGuests] = useState(1);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const poiData: Poi = {
                amapId: poi.id, 
                name: poi.name,
                type: poi.type,
                address: poi.address,
                tel: poi.tel,
                location: poi.location ? (typeof poi.location === 'object' ? `${poi.location.lng},${poi.location.lat}` : poi.location) : undefined,
                photos: poi.photos,
                biz_ext: poi.biz_ext
            };
            const savedPoi = await createOrUpdatePoi(poiData);
            
            await createBooking(USER_ID, savedPoi.id!, new Date(date), guests);
            alert('预订成功！我们会尽快联系您确认。');
            onClose();
        } catch (error) {
            console.error(error);
            alert('预订失败，请稍后重试');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm relative z-10 overflow-hidden">
                <div className="bg-blue-600 p-6 text-white">
                    <h3 className="font-bold text-xl mb-1">预订酒店</h3>
                    <p className="text-blue-100 text-sm">{poi.name}</p>
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                </div>
                
                <form onSubmit={handleBooking} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">入住日期</label>
                        <input 
                            type="date" 
                            required 
                            className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">入住人数</label>
                        <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                            <button type="button" onClick={() => setGuests(Math.max(1, guests - 1))} className="p-3 hover:bg-gray-100 border-r border-gray-300">-</button>
                            <input 
                                type="number" 
                                min="1" 
                                required 
                                className="w-full text-center p-3 outline-none"
                                value={guests}
                                onChange={e => setGuests(parseInt(e.target.value))}
                            />
                            <button type="button" onClick={() => setGuests(guests + 1)} className="p-3 hover:bg-gray-100 border-l border-gray-300">+</button>
                        </div>
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-200 mt-2"
                    >
                        {loading ? '正在提交...' : '确认预订'}
                    </button>
                    <p className="text-xs text-gray-400 text-center">预订不收取任何费用，到店支付</p>
                </form>
            </div>
        </div>
    );
}
"""

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Sidebar.tsx fully rewritten")
