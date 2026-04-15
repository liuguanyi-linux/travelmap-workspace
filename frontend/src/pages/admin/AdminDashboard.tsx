import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Guide, Strategy, Spot, AdSlot, ContactInfo } from '../../types/data';
import { Trash2, Plus, Edit2, LogOut, X, Save, Settings, Phone, Menu, Users, Map, Compass, BookOpen, Megaphone, MapPin, Loader2, Minus } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UserList from './components/UserList';
import CityManager from './components/CityManager';
import SpotCategoryManager from './components/SpotCategoryManager';

import ImageUploader from '../../components/admin/ImageUploader';
import RichTextEditor from '../../components/admin/RichTextEditor';
import { ReviewManager } from '../../components/admin/ReviewManager';
import AMapLoader from '@amap/amap-jsapi-loader';

// Inline map picker for coordinate selection
function MapPicker({ lng, lat, onChange }: { lng: number; lat: number; onChange: (lng: number, lat: number) => void }) {
  const mapRef = React.useRef<HTMLDivElement>(null);
  const markerRef = React.useRef<any>(null);
  const mapInstanceRef = React.useRef<any>(null);
  const placeSearchRef = React.useRef<any>(null);
  const autoCompleteRef = React.useRef<any>(null);
  const onChangeRef = React.useRef(onChange);
  const internalUpdateRef = React.useRef(false);
  const [searchKeyword, setSearchKeyword] = React.useState('');
  const [suggestions, setSuggestions] = React.useState<any[]>([]);

  React.useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  React.useEffect(() => {
    (window as any)._AMapSecurityConfig = { securityJsCode: 'bd6564dfb8d2ace71997d47d2926c604' };
    AMapLoader.load({ key: '111c8050229fccead3a71df2376ff60a', version: '2.0', plugins: ['AMap.Marker', 'AMap.PlaceSearch', 'AMap.AutoComplete'] }).then((AMap) => {
      if (!mapRef.current || mapInstanceRef.current) return;
      const map = new AMap.Map(mapRef.current, { zoom: 14, center: [lng, lat] });
      mapInstanceRef.current = map;
      const marker = new AMap.Marker({ position: [lng, lat], draggable: true });
      marker.setMap(map);
      markerRef.current = marker;
      marker.on('dragend', () => {
        const pos = marker.getPosition();
        const nLng = parseFloat(pos.lng.toFixed(6));
        const nLat = parseFloat(pos.lat.toFixed(6));
        internalUpdateRef.current = true;
        onChangeRef.current(nLng, nLat);
      });
      map.on('click', (e: any) => {
        const newLng = parseFloat(e.lnglat.lng.toFixed(6));
        const newLat = parseFloat(e.lnglat.lat.toFixed(6));
        marker.setPosition([newLng, newLat]);
        internalUpdateRef.current = true;
        onChangeRef.current(newLng, newLat);
      });
      placeSearchRef.current = new AMap.PlaceSearch({ map: null, pageSize: 10 });
      autoCompleteRef.current = new AMap.AutoComplete({ city: '全国' });
    });
    return () => { mapInstanceRef.current?.destroy(); mapInstanceRef.current = null; };
  }, []);

  React.useEffect(() => {
    if (!markerRef.current || !mapInstanceRef.current) return;
    if (internalUpdateRef.current) {
      internalUpdateRef.current = false;
      markerRef.current.setDraggable(true);
      return;
    }
    markerRef.current.setPosition([lng, lat]);
    markerRef.current.setDraggable(true);
    mapInstanceRef.current.setCenter([lng, lat]);
  }, [lng, lat]);

  const handleSearchInput = (value: string) => {
    setSearchKeyword(value);
    if (!value.trim() || !autoCompleteRef.current) { setSuggestions([]); return; }
    autoCompleteRef.current.search(value, (status: string, result: any) => {
      if (status === 'complete' && result?.tips) {
        setSuggestions(result.tips.filter((t: any) => t.location).slice(0, 8));
      } else {
        setSuggestions([]);
      }
    });
  };

  const handlePickSuggestion = (tip: any) => {
    if (!tip?.location || !mapInstanceRef.current || !markerRef.current) return;
    const newLng = parseFloat(tip.location.lng.toFixed(6));
    const newLat = parseFloat(tip.location.lat.toFixed(6));
    mapInstanceRef.current.setZoomAndCenter(16, [newLng, newLat]);
    markerRef.current.setPosition([newLng, newLat]);
    onChange(newLng, newLat);
    setSuggestions([]);
    setSearchKeyword(tip.name || '');
  };

  const handleSearchSubmit = () => {
    if (!searchKeyword.trim() || !placeSearchRef.current) return;
    placeSearchRef.current.search(searchKeyword, (status: string, result: any) => {
      if (status === 'complete' && result?.poiList?.pois?.length > 0) {
        const poi = result.poiList.pois[0];
        handlePickSuggestion({ name: poi.name, location: poi.location });
      }
    });
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => handleSearchInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearchSubmit(); } }}
            placeholder="搜索地点（输入关键字定位）"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={handleSearchSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
          >搜索</button>
        </div>
        {suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[100] max-h-60 overflow-y-auto">
            {suggestions.map((tip: any, idx: number) => (
              <button
                type="button"
                key={idx}
                onClick={() => handlePickSuggestion(tip)}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b last:border-b-0 border-gray-100"
              >
                <div className="text-sm font-medium text-gray-900">{tip.name}</div>
                <div className="text-xs text-gray-500 truncate">{tip.district} {tip.address}</div>
              </button>
            ))}
          </div>
        )}
      </div>
      <div ref={mapRef} style={{ width: '100%', height: '500px', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-1 px-3 py-2 bg-gray-50 border rounded-lg text-sm text-gray-700">
          <span className="text-gray-400 text-xs">经度</span>
          <span className="font-mono font-medium ml-auto">{lng.toFixed(6)}</span>
        </div>
        <div className="flex items-center gap-1 px-3 py-2 bg-gray-50 border rounded-lg text-sm text-gray-700">
          <span className="text-gray-400 text-xs">纬度</span>
          <span className="font-mono font-medium ml-auto">{lat.toFixed(6)}</span>
        </div>
      </div>
      <p className="text-xs text-gray-400">点击地图或拖拽标记来设置坐标</p>
    </div>
  );
}

// Helper to safely parse dates across browsers (fixes Safari issues)
const safeDate = (val: string | number | Date | null | undefined): Date | null => {
    if (!val) return null;
    const d = new Date(val);
    if (!isNaN(d.getTime())) return d;
    // Fallback for Safari 'YYYY-MM-DD HH:mm:ss' format
    if (typeof val === 'string') {
        const fixed = val.replace(' ', 'T');
        const d2 = new Date(fixed);
        return isNaN(d2.getTime()) ? null : d2;
    }
    return null;
};

// Helper component for expiration date selection
const ExpirationSelector = ({ value, onChange }: { value?: string | null, onChange: (val: string | null) => void }) => {
  const dateObj = safeDate(value);
  
  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
      <label className="block text-sm font-medium text-gray-900 mb-3">有效期设置 (到期自动下架)</label>
      <div className="flex flex-wrap gap-6 mb-3">
        <label className="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors">
            <input 
                type="radio" 
                name="expiry_type"
                checked={!value} 
                onChange={() => onChange(null)} 
                className="w-4 h-4 text-blue-600"
            />
            <span className="font-medium">永久有效</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors">
            <input 
                type="radio" 
                name="expiry_type"
                checked={!!dateObj && Math.abs(dateObj.getTime() - (new Date().setFullYear(new Date().getFullYear() + 1))) < 86400000} 
                onChange={() => {
                    const d = new Date();
                    d.setFullYear(d.getFullYear() + 1);
                    onChange(d.toISOString());
                }} 
                className="w-4 h-4 text-blue-600"
            />
            <span className="font-medium">一年有效期</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors">
            <input 
                type="radio" 
                name="expiry_type"
                checked={!!dateObj && Math.abs(dateObj.getTime() - (new Date().setFullYear(new Date().getFullYear() + 1))) >= 86400000} 
                onChange={() => {
                   if (!value) {
                       const d = new Date();
                       d.setMonth(d.getMonth() + 1);
                       onChange(d.toISOString());
                   }
                }} 
                className="w-4 h-4 text-blue-600"
            />
            <span className="font-medium">自定义时间</span>
        </label>
      </div>
      {dateObj && (
          <div className="mt-2 bg-white p-2 rounded border border-gray-100">
            <input 
                type="datetime-local" 
                value={dateObj.toISOString().slice(0, 16)}
                onChange={(e) => onChange(new Date(e.target.value).toISOString())}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <p className="mt-1 text-xs text-gray-500">
                将在 {dateObj.toLocaleString()} 自动下架
            </p>
          </div>
      )}
    </div>
  );
};

export default function AdminDashboard() {
  const { 
    guides = [], addGuide, updateGuide, deleteGuide,
    strategies = [], addStrategy, updateStrategy, deleteStrategy,
    spotCategories = [],
    spots = [], addSpot, updateSpot, deleteSpot, updateSpotStatus,
    ads = [], addAd, updateAd, deleteAd,
    contactInfo, updateContactInfo,
    isCloudSyncing, enableCloud
  } = useData();
  const { logout } = useAuth();

  const [enterprises, setEnterprises] = useState<any[]>([]);
  React.useEffect(() => {
    fetch('/api/enterprises').then(r => r.json()).then(setEnterprises).catch(() => {});
  }, []);
  const getAuthHeaders = () => {
    const token = localStorage.getItem('admin_token');
    return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  };
  const addEnterprise = async (data: any) => {
    const res = await fetch('/api/enterprises', { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data) });
    if (!res.ok) throw new Error(`Request failed with status code ${res.status}`);
    const item = await res.json();
    setEnterprises(prev => [item, ...prev]);
  };
  const updateEnterprise = async (data: any) => {
    const res = await fetch(`/api/enterprises/${data.id}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(data) });
    if (!res.ok) throw new Error(`Request failed with status code ${res.status}`);
    const item = await res.json();
    setEnterprises(prev => prev.map(e => String(e.id) === String(item.id) ? item : e));
  };
  const deleteEnterprise = async (id: any) => {
    await fetch(`/api/enterprises/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    setEnterprises(prev => prev.filter(e => String(e.id) !== String(id)));
  };

  const [activeTab, setActiveTab] = useState<string>('guides'); // Default to 'guides' to match initial render
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [addTag, setAddTag] = useState<string | undefined>(undefined);
  const navigate = useNavigate();
  
  // User reported mismatch between sidebar and content
  // Adding state to track sidebar active state properly if needed, but activeTab should be sufficient.



  const handleLogout = () => {
    logout();
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };


  const handleExport = () => {
    const data = { guides, strategies, spots, ads, enterprises };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `travelmap_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setAddTag(undefined);
    setIsModalOpen(true);
  };

  const handleAdd = (tag?: string) => {
    setEditingItem(null);
    setAddTag(typeof tag === 'string' ? tag : undefined);
    setIsModalOpen(true);
  };

  const handleSave = async (formData: any) => {
    console.log('handleSave called with:', formData);
    console.log('activeTab:', activeTab);
    
    setIsSaving(true);
    try {
      if (activeTab === 'guides') {
        if (editingItem) {
          updateGuide({ ...editingItem, ...formData });
        } else {
          addGuide({ ...formData, id: Date.now(), cities: ['青岛'], rank: 99 });
        }
      } else if (activeTab === 'enterprises') {
        if (editingItem) {
          await updateEnterprise({ ...editingItem, ...formData });
        } else {
          await addEnterprise({ ...formData, id: Date.now() });
        }
      } else if (activeTab === 'ads') {
        if (editingItem) {
          updateAd({ ...editingItem, ...formData });
        } else {
          addAd({ ...formData, id: Date.now() });
        }
      } else if (spotCategories.some(cat => cat.key === activeTab) || activeTab === 'transport' || activeTab === 'golf') {
        console.log('Matching spot category:', activeTab);
        if (editingItem) {
          await updateSpot({ ...editingItem, ...formData });
        } else {
          // 重新加入 Date.now() 作为临时 ID，后端 Prisma 需要它，否则报 Null constraint violation
          await addSpot({ ...formData, id: Date.now() });
        }
      } else {
        console.warn('No matching tab found for save operation');
      }
      setIsModalOpen(false);
    } catch (error: any) {
       console.error('Error in handleSave:', error);
       alert('保存失败: ' + (error.message || '未知错误'));
    } finally {
      setIsSaving(false);
    }
  };

// Removed duplicate handleExport

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 p-6 flex flex-col transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
            anjenMap 后台
            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full border border-red-200">v2.0</span>
          </h1>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 space-y-2">
          {/* 城市管理组 */}
          <TabButton active={activeTab === 'cities'} onClick={() => setActiveTab('cities')}>
            <div className="flex items-center gap-3">
              <Map size={18} />
              <span>城市列表</span>
            </div>
          </TabButton>
          
          {spotCategories
            .filter(cat => ['spot', 'dining', 'accommodation', 'shopping', 'golf'].includes(cat.key))
            .sort((a, b) => {
              const order = { spot: 1, dining: 2, accommodation: 3, shopping: 4, golf: 5 };
              return (order[a.key as keyof typeof order] || 99) - (order[b.key as keyof typeof order] || 99);
            })
            .map(cat => {
              const getIcon = () => {
                 if (cat.icon && (cat.icon.startsWith('http') || cat.icon.startsWith('/') || cat.icon.startsWith('data:'))) {
                     return <img src={cat.icon} alt={cat.name} className="w-[18px] h-[18px] object-contain" />;
                 }
                 const Icon = (LucideIcons as any)[cat.icon] || Minus;
                 return <Icon size={18} />;
              };

              return (
              <TabButton key={cat.key} active={activeTab === cat.key} onClick={() => setActiveTab(cat.key)}>
                <div className="flex items-center gap-3">
                  <span>- {cat.name.replace(/管理$/, '')}</span>
                </div>
              </TabButton>
            )})}
          
          {/* Merged Transport Category */}
          <TabButton active={activeTab === 'transport'} onClick={() => setActiveTab('transport')}>
            <div className="flex items-center gap-3">
              <span>- 高铁/机场</span>
            </div>
          </TabButton>

          {/* 内容运营组 */}
          <TabButton active={activeTab === 'guides'} onClick={() => setActiveTab('guides')}>
            <div className="flex items-center gap-3">
              <Compass size={18} />
              <span>导游</span>
            </div>
          </TabButton>
          <TabButton active={activeTab === 'enterprises'} onClick={() => setActiveTab('enterprises')}>
            <div className="flex items-center gap-3">
              <LucideIcons.Building2 size={18} />
              <span>企业</span>
            </div>
          </TabButton>

          {/* 营销推广组 */}
          <TabButton active={activeTab === 'ads'} onClick={() => setActiveTab('ads')}>
            <div className="flex items-center gap-3">
              <Megaphone size={18} />
              <span>广告位</span>
            </div>
          </TabButton>

          {/* 系统管理组 */}
          <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')}>
            <div className="flex items-center gap-3">
              <Users size={18} />
              <span>用户</span>
            </div>
          </TabButton>
          <TabButton active={activeTab === 'menu_categories'} onClick={() => setActiveTab('menu_categories')}>
            <div className="flex items-center gap-3">
              <Menu size={18} />
              <span>菜单分类</span>
            </div>
          </TabButton>
          <TabButton active={activeTab === 'contact'} onClick={() => setActiveTab('contact')}>
            <div className="flex items-center gap-3">
              <Phone size={18} />
              <span>联系方式</span>
            </div>
          </TabButton>
        </nav>
        
        <div className="py-4 border-t space-y-4">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <Save size={20} />
            <span>导出数据备份</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors"
          >
            <LogOut size={20} />
            <span>退出登录</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto relative flex flex-col min-w-0">
        <header className="flex justify-between items-center mb-6 md:mb-8">
          <div className="flex items-center gap-3">
            <button 
              className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
            {activeTab === 'guides' && '导游列表'}
            {activeTab === 'enterprises' && '企业列表'}
            {activeTab === 'cities' && '城市管理'}
            {activeTab === 'menu_categories' && '菜单分类管理'}
            {spotCategories.filter(cat => cat.key !== 'transport').map(cat => activeTab === cat.key && `${cat.name}列表`)}
            {activeTab === 'transport' && '高铁/机场列表'}
            {activeTab === 'ads' && '广告位列表'}
            {activeTab === 'users' && '用户列表'}
            {activeTab === 'contact' && '联系方式设置'}
          </h2>
          </div>
          {activeTab !== 'system' && activeTab !== 'contact' && activeTab !== 'users' && activeTab !== 'cities' && activeTab !== 'menu_categories' && activeTab !== 'transport' && (
          <div className="flex gap-2">
            {activeTab === 'strategies' && (
              <button 
                onClick={() => setIsCategoryManagerOpen(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors"
              >
                <Settings size={20} />
                <span className="hidden sm:inline">分类管理</span>
              </button>
            )}
            <button 
              onClick={() => handleAdd()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              <span className="hidden sm:inline">新建项目</span>
            </button>
          </div>
          )}
        </header>

        <div className="grid grid-cols-1 gap-6">
            {activeTab === 'guides' && <GuidesList data={guides} onDelete={deleteGuide} onEdit={handleEdit} />}
          {activeTab === 'enterprises' && <EnterprisesList data={enterprises} onDelete={deleteEnterprise} onEdit={handleEdit} />}
          {activeTab === 'cities' && <CityManager />}
          {activeTab === 'menu_categories' && <SpotCategoryManager />}
          {spotCategories.filter(cat => cat.key !== 'transport').map(cat => (
            activeTab === cat.key && (
              <SpotsList
                key={cat.key}
                data={spots.filter(s => {
                   if (cat.key === 'spot') {
                     // Dynamic exclusion: exclude if it has ANY tag that corresponds to another category
                     const otherCategories = spotCategories.filter(c => c.key !== 'spot').map(c => c.key);
                     const hasOtherTag = s.tags.some(tag => otherCategories.includes(tag));
                     return s.tags.includes('spot') || (!hasOtherTag && s.tags.length > 0);
                   }
                   return s.tags.includes(cat.key);
                })} 
                onDelete={deleteSpot} 
                onEdit={handleEdit} 
                onToggleStatus={updateSpotStatus}
              />
            )
          ))}
          {activeTab === 'transport' && (
            <div className="space-y-8">
              <div>
                <div className="flex justify-between items-center mb-4 px-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <LucideIcons.Train size={20} />
                    高铁站列表
                  </h3>
                  <button 
                    onClick={() => handleAdd('rail')}
                    className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 hover:bg-blue-700 transition-colors"
                  >
                    <Plus size={16} />
                    新建高铁站
                  </button>
                </div>
                <SpotsList 
                  data={spots.filter(s => s.tags.includes('rail'))} 
                  onDelete={deleteSpot} 
                  onEdit={handleEdit} 
                  onToggleStatus={updateSpotStatus}
                />
              </div>
              <div className="border-t pt-8">
                <div className="flex justify-between items-center mb-4 px-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <LucideIcons.Plane size={20} />
                    机场列表
                  </h3>
                  <button 
                    onClick={() => handleAdd('airport')}
                    className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 hover:bg-blue-700 transition-colors"
                  >
                    <Plus size={16} />
                    新建机场
                  </button>
                </div>
                <SpotsList 
                  data={spots.filter(s => s.tags.includes('airport'))} 
                  onDelete={deleteSpot} 
                  onEdit={handleEdit} 
                  onToggleStatus={updateSpotStatus}
                />
              </div>
            </div>
          )}
            {activeTab === 'ads' && <AdsList data={ads} onDelete={deleteAd} onEdit={handleEdit} />}
            {activeTab === 'users' && <UserList />}
            {activeTab === 'contact' && <ContactSettings info={contactInfo} onSave={updateContactInfo} />}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold">
                {editingItem ? '编辑' : '新建'}
                {activeTab === 'guides' ? '导游' : activeTab === 'strategies' ? '攻略' : activeTab === 'cities' ? '城市' : activeTab === 'ads' ? '广告位' : spotCategories.find(c => c.key === activeTab)?.name || '项目'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 sm:p-6">
              {activeTab === 'guides' && <GuideForm initialData={editingItem} onSave={handleSave} isSaving={isSaving} />}
              {activeTab === 'enterprises' && <EnterpriseForm initialData={editingItem} onSave={handleSave} />}
              {activeTab !== 'transport' && spotCategories.some(c => c.key === activeTab) && <SpotForm key={activeTab} initialData={editingItem} defaultTag={activeTab} onSave={handleSave} isSaving={isSaving} />}
              {activeTab === 'transport' && <SpotForm key={`transport-${addTag || 'none'}-${editingItem?.id || 'new'}`} initialData={editingItem} defaultTag={addTag || 'transport'} onSave={handleSave} isSaving={isSaving} />}
              {activeTab === 'ads' && <AdForm initialData={editingItem} onSave={handleSave} />}
            </div>
          </div>
        </div>
      )}

      {isCategoryManagerOpen && (
        <StrategyCategoryManager onClose={() => setIsCategoryManagerOpen(false)} />
      )}
    </div>
  );
}

function StrategyCategoryManager({ onClose }: { onClose: () => void }) {
  const { strategyCategories, addStrategyCategory, deleteStrategyCategory } = useData();
  const [newCategory, setNewCategory] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategory.trim()) {
      addStrategyCategory(newCategory.trim());
      setNewCategory('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">管理攻略分类</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-1">
          <form onSubmit={handleAdd} className="flex gap-2 mb-6">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="输入新分类名称..."
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button 
              type="submit"
              disabled={!newCategory.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              添加
            </button>
          </form>

          <div className="space-y-2">
            {strategyCategories.length === 0 ? (
              <div className="text-center text-gray-500 py-8">暂无分类</div>
            ) : (
              strategyCategories.map(cat => (
                <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors">
                  <span className="font-medium">{cat.name}</span>
                  <button 
                    onClick={() => deleteStrategyCategory(cat.id)}
                    className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors"
                    title="删除"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TabButton({ children, active, onClick }: { children: React.ReactNode, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-lg transition-all font-medium ${
        active ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      {children}
    </button>
  );
}

function GuidesList({ data, onDelete, onEdit }: { data: Guide[], onDelete: (id: string) => void, onEdit: (item: Guide) => void }) {
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('active');
  const [sort, setSort] = useState<'newest' | 'expiry'>('newest');
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const { cities } = useData();

  const filteredData = data.filter(item => {
    const isExpired = item.expiryDate && new Date(item.expiryDate) < new Date();
    if (filter === 'active' && isExpired) return false;
    if (filter === 'expired' && !isExpired) return false;
    if (cityFilter !== 'all') {
      const itemCities = Array.isArray(item.cities) ? item.cities : (typeof item.cities === 'string' ? JSON.parse(item.cities || '[]') : []);
      if (!itemCities.includes(cityFilter)) return false;
    }
    if (search && !item.name?.toLowerCase().includes(search.toLowerCase()) && !item.title?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    if (sort === 'expiry') {
        const dateA = a.expiryDate ? new Date(a.expiryDate).getTime() : Infinity;
        const dateB = b.expiryDate ? new Date(b.expiryDate).getTime() : Infinity;
        return dateA - dateB;
    }
    if (a.isTop !== b.isTop) return (b.isTop ? 1 : 0) - (a.isTop ? 1 : 0);
    if (a.rank !== b.rank) return (a.rank || 99) - (b.rank || 99);
    return Number(b.id) - Number(a.id);
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4">
        <div className="flex bg-gray-100 rounded-lg p-1">
            <button onClick={() => setFilter('active')} className={`px-3 py-1.5 text-sm rounded-md transition-all ${filter === 'active' ? 'bg-white shadow text-blue-600 font-bold' : 'text-gray-500 hover:text-gray-700'}`}>展示中</button>
            <button onClick={() => setFilter('expired')} className={`px-3 py-1.5 text-sm rounded-md transition-all ${filter === 'expired' ? 'bg-white shadow text-red-600 font-bold' : 'text-gray-500 hover:text-gray-700'}`}>已下架</button>
            <button onClick={() => setFilter('all')} className={`px-3 py-1.5 text-sm rounded-md transition-all ${filter === 'all' ? 'bg-white shadow text-gray-900 font-bold' : 'text-gray-500 hover:text-gray-700'}`}>全部</button>
        </div>
        <select value={cityFilter} onChange={e => setCityFilter(e.target.value)} className="text-sm border border-gray-200 bg-gray-50 rounded-lg px-3 py-1.5 focus:ring-0 cursor-pointer">
          <option value="all">全部城市</option>
          {cities.map((c: any) => <option key={c.name} value={c.name}>{c.name}</option>)}
        </select>
        <div className="flex items-center gap-2 flex-1 min-w-[160px]">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索姓名/标题..." className="text-sm border border-gray-200 bg-gray-50 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400 w-full" />
        </div>
        <select value={sort} onChange={e => setSort(e.target.value as any)} className="text-sm border border-gray-200 bg-gray-50 rounded-lg px-3 py-1.5 focus:ring-0 cursor-pointer">
          <option value="newest">最新发布</option>
          <option value="expiry">即将过期</option>
        </select>
        <span className="text-xs text-gray-400 ml-auto">{filteredData.length} 条</span>
      </div>

      {filteredData.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            暂无相关内容
        </div>
      ) : filteredData.map(guide => (
        <div key={guide.id} className={`bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-start gap-4 sm:gap-6 relative overflow-hidden ${guide.expiryDate && new Date(guide.expiryDate) < new Date() ? 'opacity-75 grayscale-[0.5]' : ''}`}>
          {guide.expiryDate && new Date(guide.expiryDate) < new Date() && (
              <div className="absolute top-0 right-0 bg-red-500 text-white text-xs px-3 py-1 rounded-bl-lg font-bold z-10">
                  已下架
              </div>
          )}
          <img src={guide.avatar} alt={guide.name} className="w-16 h-16 rounded-full object-cover" />
          <div className="flex-1 w-full">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
              <h3 className="text-lg font-bold">{guide.name}</h3>
              {(() => {
                const cityList = Array.isArray(guide.cities) ? guide.cities : (typeof guide.cities === 'string' ? (() => { try { return JSON.parse(guide.cities); } catch { return []; } })() : []);
                const hasCity = guide.isGlobal || (cityList && cityList.length > 0);
                return (
                  <span className={`px-2 py-0.5 text-xs rounded-full font-bold ${hasCity ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600 animate-pulse'}`}>
                    {guide.isGlobal ? '🌐 全城' : cityList.length > 0 ? `📍 ${cityList.join('、')}` : '⚠ 未设城市'}
                  </span>
                );
              })()}
              <span className={`px-2 py-0.5 text-xs rounded-full border ${
                  guide.category === 'car' ? 'bg-green-50 text-green-600 border-green-200' :
                  guide.category === 'agency' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                  'bg-blue-50 text-blue-600 border-blue-200'
              }`}>
                  {(() => {
                    let cats: string[] = [];
                    try { cats = JSON.parse(guide.category || '[]'); if (!Array.isArray(cats)) cats = [guide.category || 'guide']; } catch { cats = [guide.category || 'guide']; }
                    const labels: Record<string,string> = { guide:'导游', car:'租车', agency:'旅行社', translator:'번역사' };
                    return cats.map(c => labels[c] || c).join(' / ');
                  })()}
              </span>
              {guide.isTop && <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-600 font-bold">置顶</span>}
              {guide.isGlobal && <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-600 font-bold">全城</span>}
              <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">排序:{guide.rank || 99}</span>
              <span className={`px-2 py-0.5 text-xs rounded-full ${guide.gender === 'male' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}`}>
                {guide.gender === 'male' ? '男' : '女'}
              </span>
              {guide.hasCar && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-600">
                  有车
                </span>
              )}
            </div>
            {guide.expiryDate && (
                <div className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                    <span className={new Date(guide.expiryDate) < new Date() ? 'text-red-500 font-medium' : 'text-green-600'}>
                        {new Date(guide.expiryDate) < new Date() ? '已过期: ' : '有效期至: '}
                        {new Date(guide.expiryDate).toLocaleDateString()}
                    </span>
                </div>
            )}
            <div className="text-gray-500 text-sm mb-2 line-clamp-2" dangerouslySetInnerHTML={{ __html: guide.intro || '' }} />
            <div className="text-xs text-gray-400 mt-1">点击量：{(guide as any).viewCount || 0}</div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto justify-end sm:justify-start">
            <button
              onClick={() => { const url = `${window.location.origin}/?open=guide&id=${guide.id}`; navigator.clipboard.writeText(url); alert('分享链接已复制！\n' + url); }}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-green-600"
              title="复制分享链接"
            ><LucideIcons.Link size={18} /></button>
            <button onClick={() => onEdit(guide)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-blue-600">
              <Edit2 size={18} />
            </button>
            <button onClick={() => onDelete(String(guide.id))} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-red-500">
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function StrategiesList({ data, onDelete, onEdit }: { data: Strategy[], onDelete: (id: string) => void, onEdit: (item: Strategy) => void }) {
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('active');
  const [sort, setSort] = useState<'newest' | 'expiry'>('newest');

  const filteredData = data.filter(item => {
    const isExpired = item.expiryDate && new Date(item.expiryDate) < new Date();
    if (filter === 'active') return !isExpired;
    if (filter === 'expired') return isExpired;
    return true;
  }).sort((a, b) => {
    if (sort === 'expiry') {
        const dateA = a.expiryDate ? new Date(a.expiryDate).getTime() : Infinity;
        const dateB = b.expiryDate ? new Date(b.expiryDate).getTime() : Infinity;
        return dateA - dateB;
    }
    // Sort by isTop desc, then rank asc, then ID desc (newest first)
    if ((a as any).isTop !== (b as any).isTop) return ((b as any).isTop ? 1 : 0) - ((a as any).isTop ? 1 : 0);
    if ((a as any).rank !== (b as any).rank) return ((a as any).rank || 99) - ((b as any).rank || 99);
    return Number(b.id) - Number(a.id);
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4">
        <div className="flex bg-gray-100 rounded-lg p-1">
            <button onClick={() => setFilter('active')} className={`px-4 py-1.5 text-sm rounded-md transition-all ${filter === 'active' ? 'bg-white shadow text-blue-600 font-bold' : 'text-gray-500 hover:text-gray-700'}`}>展示中</button>
            <button onClick={() => setFilter('expired')} className={`px-4 py-1.5 text-sm rounded-md transition-all ${filter === 'expired' ? 'bg-white shadow text-red-600 font-bold' : 'text-gray-500 hover:text-gray-700'}`}>已下架</button>
            <button onClick={() => setFilter('all')} className={`px-4 py-1.5 text-sm rounded-md transition-all ${filter === 'all' ? 'bg-white shadow text-gray-900 font-bold' : 'text-gray-500 hover:text-gray-700'}`}>全部</button>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">排序:</span>
            <select value={sort} onChange={e => setSort(e.target.value as any)} className="text-sm border-none bg-gray-50 rounded-lg px-3 py-1.5 focus:ring-0 cursor-pointer">
                <option value="newest">最新发布</option>
                <option value="expiry">即将过期</option>
            </select>
        </div>
      </div>

      {filteredData.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            暂无相关内容
        </div>
      ) : filteredData.map(item => (
        <div key={item.id} className={`bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-start gap-4 sm:gap-6 relative overflow-hidden ${item.expiryDate && new Date(item.expiryDate) < new Date() ? 'opacity-75 grayscale-[0.5]' : ''}`}>
          {item.expiryDate && new Date(item.expiryDate) < new Date() && (
              <div className="absolute top-0 right-0 bg-red-500 text-white text-xs px-3 py-1 rounded-bl-lg font-bold z-10">
                  已下架
              </div>
          )}
          <img src={item.image} alt={item.title} className="w-full sm:w-24 h-48 sm:h-24 rounded-lg object-cover" />
          <div className="flex-1 w-full">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
              <h3 className="text-lg font-bold">{item.title}</h3>
              <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-700">
                {item.days}
              </span>
              {item.category && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-700">
                  {item.category}
                </span>
              )}
            </div>
            {item.expiryDate && (
                <div className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                    <span className={new Date(item.expiryDate) < new Date() ? 'text-red-500 font-medium' : 'text-green-600'}>
                        {new Date(item.expiryDate) < new Date() ? '已过期: ' : '有效期至: '}
                        {new Date(item.expiryDate).toLocaleDateString()}
                    </span>
                </div>
            )}
            <div className="flex flex-wrap gap-2 mb-3">
              {item.spots.map(s => (
                 <span key={s} className="text-xs border border-gray-200 px-2 py-1 rounded text-gray-600">{s}</span>
              ))}
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto justify-end sm:justify-start">
            <button
              onClick={() => { const url = `${window.location.origin}/?open=strategy&id=${item.id}`; navigator.clipboard.writeText(url); alert('分享链接已复制！\n' + url); }}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-green-600"
              title="复制分享链接"
            ><LucideIcons.Link size={18} /></button>
            <button onClick={() => onEdit(item)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-blue-600">
              <Edit2 size={18} />
            </button>
            <button onClick={() => onDelete(String(item.id))} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-red-500">
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function GuideForm({ initialData, onSave, isSaving }: { initialData?: Guide, onSave: (data: any) => void, isSaving?: boolean }) {
  const { cities = [] } = useData();
  
  let parsedPhotos: string[] = [];
  try {
    if (Array.isArray(initialData?.photos)) {
      parsedPhotos = initialData.photos;
    } else if (typeof initialData?.photos === 'string' && initialData.photos.trim() !== '') {
      parsedPhotos = JSON.parse(initialData.photos);
    }
  } catch (e) {
    console.error("Failed to parse Guide photos:", e);
    parsedPhotos = typeof initialData?.photos === 'string' ? [initialData.photos] : [];
  }

  const [formData, setFormData] = useState<Partial<Guide>>(initialData ? {
    ...initialData,
    photos: parsedPhotos
  } : {
    name: '',
    gender: 'male',
    hasCar: false,
    title: '导游',
    avatar: 'https://picsum.photos/200',
    intro: '',
    cities: [] as string[],
    rank: 99,
    isTop: false,
    isGlobal: false,
    category: JSON.stringify(['guide']),
    photos: [] as string[],
    content: '',
    phone: '',
    wechat: '',
    kakao: '',
    email: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('前端准备提交的 Guide 内容:', formData.content);
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
        <input
          type="text"
          value={formData.name}
          onChange={e => setFormData({...formData, name: e.target.value})}
          className="w-full px-3 py-2 border rounded-lg"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">类别（可多选）</label>
            <div className="space-y-1.5">
            {[
              { value: 'guide', label: '여행가이드' },
              { value: 'car', label: '렌트카' },
              { value: 'agency', label: '현지여행사' },
              { value: 'translator', label: '비즈니스 통역' },
            ].map(opt => {
              let cats: string[] = [];
              try { cats = JSON.parse(formData.category || '[]'); if (!Array.isArray(cats)) cats = [formData.category || 'guide']; } catch { cats = [formData.category || 'guide']; }
              const checked = cats.includes(opt.value);
              return (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={checked} className="w-4 h-4 rounded text-blue-600"
                    onChange={e => {
                      const next = e.target.checked ? [...cats, opt.value] : cats.filter(c => c !== opt.value);
                      setFormData({...formData, category: JSON.stringify(next.length ? next : ['guide'])});
                    }} />
                  <span className="text-sm text-gray-700">{opt.label}</span>
                </label>
              );
            })}
            </div>
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">有效期</label>
            <ExpirationSelector 
                value={(formData as any).expiryDate} 
                onChange={(val) => setFormData({...formData, expiryDate: val} as any)} 
            />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">性别</label>
            <select
            value={formData.gender}
            onChange={e => setFormData({...formData, gender: e.target.value as 'male' | 'female'})}
            className="w-full px-3 py-2 border rounded-lg"
            >
            <option value="male">男</option>
            <option value="female">女</option>
            </select>
        </div>
        <div className="flex items-center pt-6">
            <label className="flex items-center gap-2 cursor-pointer">
            <input
                type="checkbox"
                checked={formData.hasCar}
                onChange={e => setFormData({...formData, hasCar: e.target.checked})}
                className="w-4 h-4 rounded text-blue-600"
            />
            <span className="text-sm font-medium text-gray-700">车辆 (有车)</span>
            </label>
        </div>
      </div>
      <div>
        <ImageUploader
          label="头像"
          images={formData.avatar ? [formData.avatar] : []}
          onChange={(images) => setFormData({ ...formData, avatar: images[0] || '' })}
          single={true}
        />
      </div>
      <div>
        <ImageUploader
          label="照片墙"
          images={formData.photos || []}
          onChange={(images) => setFormData({ ...formData, photos: images })}
          maxImages={9}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">服务城市 (多选)</label>
        <div className="flex flex-wrap gap-4 pt-1">
          {cities.map(city => (
            <label key={city.name} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.cities?.includes(city.name)}
                onChange={e => {
                    const currentCities = formData.cities || [];
                    if (e.target.checked) {
                        setFormData({...formData, cities: [...currentCities, city.name]});
                    } else {
                        setFormData({...formData, cities: currentCities.filter(c => c !== city.name)});
                    }
                }}
                className="w-4 h-4 rounded text-blue-600"
              />
              <span className="text-sm text-gray-700">{city.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">排序权重 (越小越靠前)</label>
          <input
            type="number"
            value={formData.rank || 99}
            onChange={e => setFormData({...formData, rank: parseInt(e.target.value) || 99})}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div className="flex items-center pt-6">
            <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
                type="checkbox"
                checked={formData.isTop || false}
                onChange={e => setFormData({...formData, isTop: e.target.checked})}
                className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-bold text-gray-700">置顶显示</span>
            </label>
        </div>
        <div className="flex items-center pt-6">
            <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
                type="checkbox"
                checked={formData.isGlobal || false}
                onChange={e => setFormData({...formData, isGlobal: e.target.checked})}
                className="w-5 h-5 rounded text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm font-bold text-purple-700">全城市置顶</span>
            </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">简介 (首页显示部分)</label>
        <RichTextEditor
          value={formData.intro || ''}
          onChange={val => setFormData({...formData, intro: val})}
          placeholder="请输入简短介绍..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">电话 (전화번호)</label>
          <input
            type="text"
            value={formData.phone || ''}
            onChange={e => setFormData({...formData, phone: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="例如: +86 123456789"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">微信 ID (위챗 ID)</label>
          <input
            type="text"
            value={formData.wechat || ''}
            onChange={e => setFormData({...formData, wechat: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="WeChat ID"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">KakaoTalk ID (카카오톡 ID)</label>
          <input
            type="text"
            value={formData.kakao || ''}
            onChange={e => setFormData({...formData, kakao: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Kakao ID"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">邮箱 (이메일)</label>
          <input
            type="email"
            value={formData.email || ''}
            onChange={e => setFormData({...formData, email: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Email Address"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">详细介绍 (支持HTML, 点击后显示)</label>
        <RichTextEditor
          value={formData.content || ''}
          onChange={val => setFormData({...formData, content: val})}
          placeholder="这里可以输入详细的导游介绍..."
        />
      </div>
      <ReviewManager targetId={formData.id} targetType="guide" />
      <button 
        type="submit" 
        disabled={isSaving}
        className={`w-full text-white py-2 rounded-lg font-medium ${isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
      >
        {isSaving ? (
          <div className="flex items-center justify-center gap-2">
             <Loader2 size={18} className="animate-spin" />
             <span>保存中...</span>
          </div>
        ) : '保存'}
      </button>
    </form>
  );
}

function ContactSettings({ info, onSave }: { info: ContactInfo, onSave: (data: ContactInfo) => void }) {
  const [formData, setFormData] = useState(info);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">联系电话</label>
          <input
            type="text"
            value={formData.phone}
            onChange={e => setFormData({...formData, phone: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">电子邮箱</label>
          <input
            type="email"
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">微信号 (WeChat)</label>
          <input
            type="text"
            value={formData.wechat || ''}
            onChange={e => setFormData({...formData, wechat: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">官方网站</label>
          <input
            type="text"
            value={formData.website || ''}
            onChange={e => setFormData({...formData, website: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="www.example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">联系地址</label>
          <input
            type="text"
            value={formData.address || ''}
            onChange={e => setFormData({...formData, address: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div className="pt-4">
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2">
                <Save size={18} />
                保存更改
            </button>
            {showSuccess && (
                <span className="text-green-600 text-sm ml-4 flex items-center gap-1 inline-block">
                    ✓ 保存成功
                </span>
            )}
        </div>
      </form>
    </div>
  );
}

function StrategyForm({ initialData, onSave, isSaving }: { initialData?: Strategy, onSave: (data: any) => void, isSaving?: boolean }) {
  const { spots: availableSpots = [], strategyCategories = [], cities = [] } = useData();
  
  let parsedPhotos: string[] = [];
  try {
    if (Array.isArray(initialData?.photos)) {
      parsedPhotos = initialData.photos;
    } else if (typeof initialData?.photos === 'string' && initialData.photos.trim() !== '') {
      parsedPhotos = JSON.parse(initialData.photos);
    }
  } catch (e) {
    console.error("Failed to parse Strategy photos:", e);
    parsedPhotos = typeof initialData?.photos === 'string' ? [initialData.photos] : [];
  }

  const [formData, setFormData] = useState<Partial<Strategy>>(initialData ? {
    ...initialData,
    photos: parsedPhotos
  } : {
    title: '',
    city: '',
    category: strategyCategories.length > 0 ? strategyCategories[0].name : '',
    days: '1天',
    spots: [] as string[],
    image: 'https://picsum.photos/200',
    photos: [] as string[],
    tags: [] as string[],
    content: '',
    phone: '',
    wechat: '',
    kakao: '',
    email: ''
  });

  const [customSpot, setCustomSpot] = useState('');

  // Update category when strategyCategories load if it's empty
  useEffect(() => {
    if (!formData.category && strategyCategories.length > 0) {
      setFormData(prev => ({ ...prev, category: strategyCategories[0].name }));
    }
  }, [strategyCategories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('前端准备提交的 Strategy 内容:', formData.content);
    onSave(formData);
  };

  const handleAddSpot = (spotName: string) => {
    const currentSpots = formData.spots || [];
    if (spotName && !currentSpots.includes(spotName)) {
      setFormData({ ...formData, spots: [...currentSpots, spotName] });
    }
  };

  const handleRemoveSpot = (spotName: string) => {
    const currentSpots = formData.spots || [];
    setFormData({ ...formData, spots: currentSpots.filter(s => s !== spotName) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">标题</label>
        <input
          type="text"
          value={formData.title}
          onChange={e => setFormData({...formData, title: e.target.value})}
          className="w-full px-3 py-2 border rounded-lg"
          required
        />
      </div>

      <ExpirationSelector 
        value={(formData as any).expiryDate} 
        onChange={(val) => setFormData({...formData, expiryDate: val} as any)} 
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">所属城市 <span className="text-red-500">*</span></label>
        <select
          value={formData.city || ''}
          onChange={e => setFormData({...formData, city: e.target.value})}
          className={`w-full px-3 py-2 border rounded-lg ${!formData.city ? 'border-red-400 bg-red-50' : ''}`}
          required
        >
          <option value="" disabled>⚠ 请选择城市</option>
          {cities.map(city => (
            <option key={city.name} value={city.name}>{city.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">攻略分类</label>
        <select
          value={formData.category}
          onChange={e => setFormData({...formData, category: e.target.value})}
          className="w-full px-3 py-2 border rounded-lg"
        >
          {strategyCategories.length === 0 && <option value="">无分类 (请先添加分类)</option>}
          {strategyCategories.map(cat => (
            <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">游玩天数</label>
        <input
          type="text"
          value={formData.days}
          onChange={e => setFormData({...formData, days: e.target.value})}
          className="w-full px-3 py-2 border rounded-lg"
          required
        />
      </div>
      
      {/* Spots Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">包含景点</label>
        
        {/* Selected Spots Tags */}
        <div className="flex flex-wrap gap-2 mb-3 min-h-[40px] p-2 border rounded-lg bg-gray-50">
          {(formData.spots || []).length === 0 && <span className="text-gray-400 text-sm py-1">暂无景点</span>}
          {(formData.spots || []).map(spot => (
            <span key={spot} className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">
              {spot}
              <button 
                type="button" 
                onClick={() => handleRemoveSpot(spot)}
                className="hover:text-blue-900"
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>

        {/* Add Controls */}
        <div className="flex gap-2 mb-2">
            <select 
                className="flex-1 px-3 py-2 border rounded-lg text-sm"
                onChange={(e) => {
                    if (e.target.value) {
                        handleAddSpot(e.target.value);
                        e.target.value = ''; // Reset select
                    }
                }}
                defaultValue=""
            >
                <option value="" disabled>从现有景点选择 ({formData.city}周边)...</option>
                {availableSpots
                  .filter(spot => {
                    // Only show items that are 'spot' or generic, excluding specific other categories
                    return spot.tags.includes('spot') || 
                           (!spot.tags.includes('dining') && !spot.tags.includes('accommodation') && !spot.tags.includes('transport'));
                  })
                  .sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
                  .map(spot => (
                    <option key={spot.id} value={spot.name} disabled={(formData.spots || []).includes(spot.name)}>
                        {spot.name}
                    </option>
                ))}
            </select>
        </div>
        <div className="flex gap-2">
            <input 
                type="text"
                value={customSpot}
                onChange={(e) => setCustomSpot(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg text-sm"
                placeholder="输入自定义景点名称..."
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        if (customSpot.trim()) {
                            handleAddSpot(customSpot.trim());
                            setCustomSpot('');
                        }
                    }
                }}
            />
            <button 
                type="button"
                onClick={() => {
                    if (customSpot.trim()) {
                        handleAddSpot(customSpot.trim());
                        setCustomSpot('');
                    }
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium"
            >
                添加
            </button>
        </div>
      </div>

      <div>
        <ImageUploader
          label="封面图片"
          images={formData.image ? [formData.image] : []}
          onChange={(images) => setFormData({ ...formData, image: images[0] || '' })}
          single={true}
        />
      </div>
      <div>
        <ImageUploader
          label="照片墙 (详情页轮播)"
          images={formData.photos || []}
          onChange={(images) => setFormData({ ...formData, photos: images })}
          maxImages={9}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">电话 (전화번호)</label>
          <input
            type="text"
            value={formData.phone || ''}
            onChange={e => setFormData({...formData, phone: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="例如: +86 123456789"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">微信 ID (위챗 ID)</label>
          <input
            type="text"
            value={formData.wechat || ''}
            onChange={e => setFormData({...formData, wechat: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="WeChat ID"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">KakaoTalk ID (카카오톡 ID)</label>
          <input
            type="text"
            value={formData.kakao || ''}
            onChange={e => setFormData({...formData, kakao: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Kakao ID"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">邮箱 (이메일)</label>
          <input
            type="email"
            value={formData.email || ''}
            onChange={e => setFormData({...formData, email: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Email Address"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">内容详情</label>
        <RichTextEditor
          value={formData.content || ''}
          onChange={value => setFormData({...formData, content: value})}
          placeholder="请输入详细内容..."
        />
      </div>
      <ReviewManager targetId={formData.id} targetType="strategy" />
       <button 
        type="submit" 
        disabled={isSaving}
        className={`w-full text-white py-2 rounded-lg font-medium ${isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
      >
        {isSaving ? (
          <div className="flex items-center justify-center gap-2">
             <Loader2 size={18} className="animate-spin" />
             <span>保存中...</span>
          </div>
        ) : '保存'}
      </button>
    </form>
  );
}

function SpotsList({ data, onDelete, onEdit, onToggleStatus }: { data: Spot[], onDelete: (id: number | string) => void, onEdit: (item: Spot) => void, onToggleStatus: (id: number | string, isActive: boolean) => void }) {
  const [filter, setFilter] = useState<'all' | 'active' | 'offline'>('active');
  const [sort, setSort] = useState<'newest' | 'expiry'>('newest');
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const { cities } = useData();

  const filteredData = data.filter(item => {
    const isItemActive = item.isActive !== false;
    if (filter === 'active' && !isItemActive) return false;
    if (filter === 'offline' && isItemActive) return false;
    if (cityFilter !== 'all' && item.city !== cityFilter) return false;
    if (search && !item.name?.toLowerCase().includes(search.toLowerCase()) && !item.city?.toLowerCase().includes(search.toLowerCase()) && !item.address?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    if (sort === 'expiry') {
        const dateA = a.expiryDate ? new Date(a.expiryDate).getTime() : Infinity;
        const dateB = b.expiryDate ? new Date(b.expiryDate).getTime() : Infinity;
        return dateA - dateB;
    }
    if (a.isTop !== b.isTop) return (b.isTop ? 1 : 0) - (a.isTop ? 1 : 0);
    if (a.rank !== b.rank) return (a.rank || 99) - (b.rank || 99);
    return Number(b.id) - Number(a.id);
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4">
        <div className="flex bg-gray-100 rounded-lg p-1">
            <button onClick={() => setFilter('active')} className={`px-3 py-1.5 text-sm rounded-md transition-all ${filter === 'active' ? 'bg-white shadow text-blue-600 font-bold' : 'text-gray-500 hover:text-gray-700'}`}>展示中</button>
            <button onClick={() => setFilter('offline')} className={`px-3 py-1.5 text-sm rounded-md transition-all ${filter === 'offline' ? 'bg-white shadow text-red-600 font-bold' : 'text-gray-500 hover:text-gray-700'}`}>已下架</button>
            <button onClick={() => setFilter('all')} className={`px-3 py-1.5 text-sm rounded-md transition-all ${filter === 'all' ? 'bg-white shadow text-gray-900 font-bold' : 'text-gray-500 hover:text-gray-700'}`}>全部</button>
        </div>
        <select value={cityFilter} onChange={e => setCityFilter(e.target.value)} className="text-sm border border-gray-200 bg-gray-50 rounded-lg px-3 py-1.5 focus:ring-0 cursor-pointer">
          <option value="all">全部城市</option>
          {cities.map((c: any) => <option key={c.name} value={c.name}>{c.name}</option>)}
        </select>
        <div className="flex items-center gap-2 flex-1 min-w-[160px]">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索名称/地址..." className="text-sm border border-gray-200 bg-gray-50 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400 w-full" />
        </div>
        <select value={sort} onChange={e => setSort(e.target.value as any)} className="text-sm border border-gray-200 bg-gray-50 rounded-lg px-3 py-1.5 focus:ring-0 cursor-pointer">
          <option value="newest">最新发布</option>
          <option value="expiry">即将过期</option>
        </select>
        <span className="text-xs text-gray-400 ml-auto">{filteredData.length} 条</span>
      </div>

      {filteredData.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            暂无相关内容
        </div>
      ) : filteredData.map(item => (
        <div key={item.id} className={`bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-start gap-4 sm:gap-6 relative overflow-hidden ${(item.expiryDate && new Date(item.expiryDate) < new Date()) || item.isActive === false ? 'opacity-75 grayscale-[0.5]' : ''}`}>
          {((item.expiryDate && new Date(item.expiryDate) < new Date()) || item.isActive === false) && (
              <div className="absolute top-0 right-0 bg-red-500 text-white text-xs px-3 py-1 rounded-bl-lg font-bold z-10">
                  已下架
              </div>
          )}
          <div className="w-full sm:w-24 h-48 sm:h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
             {item.photos?.[0] ? (
                <img src={item.photos[0]} alt={item.name} className="w-full h-full object-cover" />
             ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">无图</div>
             )}
          </div>
          <div className="flex-1 w-full">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
              <h3 className="text-lg font-bold">{item.name}</h3>
              <span className={`px-2 py-0.5 text-xs rounded-full font-bold ${item.city ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600 animate-pulse'}`}>
                {item.city ? `📍 ${item.city}` : '⚠ 未设城市'}
              </span>
              {item.isTop && <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-600 font-bold">置顶</span>}
              <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">排序:{item.rank || 99}</span>
              <div className="flex gap-1">
                {item.tags?.map(t => (
                    <span key={t} className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-600">
                        {t === 'spot' && '景点'}
                        {t === 'dining' && '美食'}
                        {t === 'accommodation' && '酒店'}
                        {t === 'shopping' && '购物'}
                        {t === 'golf' && '高尔夫'}
                        {t === 'rail' && '高铁'}
                        {t === 'airport' && '机场'}
                        {t === 'transport' && '交通'}
                        {t === 'other' && '其他'}
                    </span>
                ))}
              </div>
            </div>
            {item.expiryDate && (
                <div className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                    <span className={new Date(item.expiryDate) < new Date() ? 'text-red-500 font-medium' : 'text-green-600'}>
                        {new Date(item.expiryDate) < new Date() ? '已过期: ' : '有效期至: '}
                        {new Date(item.expiryDate).toLocaleDateString()}
                    </span>
                </div>
            )}
            <div className="text-gray-500 text-sm mb-2 line-clamp-2" dangerouslySetInnerHTML={{ __html: item.intro || item.content || item.address || '暂无介绍' }} />
            <div className="text-xs text-gray-400 mt-1">点击量：{(item as any).viewCount || 0}</div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto justify-end sm:justify-start">
            <button
              onClick={async () => {
                console.log('Toggling status for spot:', item.id, 'to:', item.isActive === false ? true : false);
                try {
                  await onToggleStatus(item.id, item.isActive === false ? true : false);
                  // Force a small delay to allow state to settle
                  setTimeout(() => {
                      setFilter(prev => prev);
                  }, 50);
                } catch (e) {
                  console.error('Toggle failed:', e);
                  window.alert('状态切换失败，请检查网络或重试');
                }
              }}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                item.isActive === false 
                  ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            >
              {item.isActive === false ? '上架' : '下架'}
            </button>
            <button
              onClick={() => { const url = `${window.location.origin}/?open=spot&id=${item.id}`; navigator.clipboard.writeText(url); alert('分享链接已复制！\n' + url); }}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-green-600"
              title="复制分享链接"
            ><LucideIcons.Link size={18} /></button>
            <button onClick={() => onEdit(item)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-blue-600">
              <Edit2 size={18} />
            </button>
            <button onClick={() => onDelete(Number(item.id))} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-red-500">
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function SpotForm({ initialData, defaultTag = 'spot', onSave, isSaving }: { initialData?: Spot, defaultTag?: string, onSave: (data: any) => void, isSaving?: boolean }) {
  const { cities = [] } = useData();
  const isTransport = defaultTag === 'transport';
  const isRail = defaultTag === 'rail';
  const isAirport = defaultTag === 'airport';
  const effectiveDefaultTag = isRail ? 'rail' : (isAirport ? 'airport' : defaultTag);

  let parsedPhotos: string[] = [];
  try {
    if (Array.isArray(initialData?.photos)) {
      parsedPhotos = initialData.photos;
    } else if (typeof initialData?.photos === 'string' && initialData.photos.trim() !== '') {
      parsedPhotos = JSON.parse(initialData.photos);
    }
  } catch (e) {
    console.error("Failed to parse Spot photos:", e);
    parsedPhotos = typeof initialData?.photos === 'string' ? [initialData.photos] : [];
  }

  const [formData, setFormData] = useState<Partial<Spot>>(initialData ? {
    ...initialData,
    // Ensure arrays are initialized correctly to prevent nulls
    photos: parsedPhotos,
    tags: initialData.tags || [effectiveDefaultTag],
    reviews: initialData.reviews || []
  } : {
    name: '',
    cnName: '',
    city: '',
    address: '',
    location: { lng: 120.38, lat: 36.06 },
    photos: [],
    content: '',
    tags: [effectiveDefaultTag],
    rank: 99,
    isTop: false,
    reviews: [],
    phone: '',
    wechat: '',
    kakao: '',
    email: ''
  });

  // Ensure formData is updated when initialData changes, BUT ONLY if initialData is provided (edit mode)
  useEffect(() => {
    if (initialData) {
        let effectParsedPhotos: string[] = [];
        try {
          if (Array.isArray(initialData.photos)) {
            effectParsedPhotos = initialData.photos;
          } else if (typeof initialData.photos === 'string' && initialData.photos.trim() !== '') {
            effectParsedPhotos = JSON.parse(initialData.photos);
          }
        } catch (e) {
          effectParsedPhotos = typeof initialData.photos === 'string' ? [initialData.photos] : [];
        }

        setFormData(prev => ({
            ...prev,
            ...initialData,
            photos: effectParsedPhotos,
            tags: initialData.tags || [effectiveDefaultTag],
            reviews: initialData.reviews || []
        }));
    }
  }, [initialData?.id]);

  useEffect(() => {
     if (isRail && !initialData) {
         setFormData(prev => ({ ...prev, tags: ['rail'] }));
     } else if (isAirport && !initialData) {
         setFormData(prev => ({ ...prev, tags: ['airport'] }));
     }
  }, [isRail, isAirport, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSave = {
      ...formData,
      photos: Array.isArray(formData.photos) ? formData.photos : []
    };
    console.log('Submitting Spot Data:', dataToSave);
    onSave(dataToSave);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">名称 (主标题，显示在列表，建议韩文) <span className="text-xs text-blue-500 font-normal">(独立输入)</span></label>
        <input
          type="text"
          value={formData.name}
          onChange={e => {
              // Strictly update ONLY name
              setFormData(prev => ({ ...prev, name: e.target.value }));
          }}
          className="w-full px-3 py-2 border rounded-lg"
          required
          autoComplete="new-password"
          name="spot_name_field_unique"
        />
      </div>

      <ExpirationSelector 
        value={(formData as any).expiryDate} 
        onChange={(val) => setFormData({...formData, expiryDate: val} as any)} 
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">地名设置 (显示在详情页“地名”栏，建议中文) <span className="text-xs text-blue-500 font-normal">(独立输入)</span></label>
        <input
          type="text"
          value={formData.cnName || ''}
          onChange={e => {
              // Strictly update ONLY cnName
              setFormData(prev => ({ ...prev, cnName: e.target.value }));
          }}
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="请输入地名"
          autoComplete="new-password"
          name="spot_cn_name_field_unique"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">所属城市 <span className="text-red-500">*</span></label>
        <select
          value={formData.city || ''}
          onChange={e => {
            const city = cities.find(c => c.name === e.target.value);
            setFormData({
                ...formData,
                city: e.target.value,
                location: !initialData && city ? { lng: city.lng, lat: city.lat } : formData.location
            });
          }}
          className={`w-full px-3 py-2 border rounded-lg ${!formData.city ? 'border-red-400 bg-red-50' : ''}`}
          required
        >
          <option value="" disabled>⚠ 请选择城市</option>
          {cities.map(city => (
            <option key={city.name} value={city.name}>{city.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">详细地址 (用于导航显示)</label>
        <input
          type="text"
          value={formData.address || ''}
          onChange={e => setFormData({...formData, address: e.target.value})}
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="例如：市南区五四广场北侧"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">坐标 (点击地图选点)</label>
        <MapPicker
          lng={formData.location?.lng ?? 120.38}
          lat={formData.location?.lat ?? 36.06}
          onChange={(lng, lat) => setFormData({ ...formData, location: { lng, lat } })}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">分类 {isRail || isAirport ? '(已锁定)' : '(可选)'}</label>
        <select
          value={formData.tags?.[0] || effectiveDefaultTag}
          onChange={e => setFormData({...formData, tags: [e.target.value as any]})}
          className={`w-full px-3 py-2 border rounded-lg ${isRail || isAirport ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white'}`}
          disabled={isRail || isAirport}
        >
          {!(isRail || isAirport) && (
            <>
                <option value="spot">景点</option>
                <option value="dining">美食</option>
                <option value="accommodation">酒店</option>
                <option value="shopping">购物</option>
                <option value="golf">高尔夫</option>
                <option value="rail">高铁</option>
                <option value="airport">机场</option>
                <option value="transport">交通</option>
                <option value="other">其他</option>
            </>
          )}
          {isRail && <option value="rail">高铁</option>}
          {isAirport && <option value="airport">机场</option>}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">排序权重 (越小越靠前)</label>
          <input
            type="number"
            value={formData.rank || 99}
            onChange={e => setFormData({...formData, rank: parseInt(e.target.value) || 99})}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div className="flex items-center pt-6">
            <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
                type="checkbox"
                checked={formData.isTop || false}
                onChange={e => setFormData({...formData, isTop: e.target.checked})}
                className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-bold text-gray-700">置顶显示</span>
            </label>
        </div>
      </div>
      <div>
        <ImageUploader
          label="图片 (支持上传本地图片或输入URL)"
          images={formData.photos || []}
          onChange={(images) => setFormData({ ...formData, photos: images })}
          maxImages={9}
        />
        <p className="text-xs text-gray-500 mt-1">
          * 上传的图片将自动转换为Base64编码存储，适合朋友使用。
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">简介 (用于卡片显示)</label>
        <RichTextEditor
          value={formData.intro || ''}
          onChange={val => setFormData({...formData, intro: val})}
          placeholder="简短介绍，将显示在左侧列表卡片上"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">电话 (전화번호)</label>
          <input
            type="text"
            value={formData.phone || ''}
            onChange={e => setFormData({...formData, phone: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="例如: +86 123456789"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">微信 ID (위챗 ID)</label>
          <input
            type="text"
            value={formData.wechat || ''}
            onChange={e => setFormData({...formData, wechat: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="WeChat ID"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">KakaoTalk ID (카카오톡 ID)</label>
          <input
            type="text"
            value={formData.kakao || ''}
            onChange={e => setFormData({...formData, kakao: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Kakao ID"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">邮箱 (이메일)</label>
          <input
            type="email"
            value={formData.email || ''}
            onChange={e => setFormData({...formData, email: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Email Address"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">内容详情</label>
        <RichTextEditor
          value={formData.content || ''}
          onChange={value => setFormData({...formData, content: value})}
          placeholder="请输入详细内容..."
        />
      </div>

      <ReviewManager targetId={formData.id} targetType="spot" />

      <button 
        type="submit" 
        disabled={isSaving}
        className={`w-full text-white py-2 rounded-lg font-medium ${isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
      >
        {isSaving ? (
          <div className="flex items-center justify-center gap-2">
             <Loader2 size={18} className="animate-spin" />
             <span>保存中...</span>
          </div>
        ) : '保存'}
      </button>
    </form>
  );
}

function AdsList({ data, onDelete, onEdit }: { data: AdSlot[], onDelete: (id: number) => void, onEdit: (item: AdSlot) => void }) {
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('active');
  const [sort, setSort] = useState<'newest' | 'expiry'>('newest');

  const filteredData = data.filter(item => {
    const isExpired = item.expiryDate && new Date(item.expiryDate) < new Date();
    if (filter === 'active') return !isExpired;
    if (filter === 'expired') return isExpired;
    return true;
  }).sort((a, b) => {
    if (sort === 'expiry') {
        const dateA = a.expiryDate ? new Date(a.expiryDate).getTime() : Infinity;
        const dateB = b.expiryDate ? new Date(b.expiryDate).getTime() : Infinity;
        return dateA - dateB;
    }
    return Number(b.id) - Number(a.id);
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4">
        <div className="flex bg-gray-100 rounded-lg p-1">
            <button onClick={() => setFilter('active')} className={`px-4 py-1.5 text-sm rounded-md transition-all ${filter === 'active' ? 'bg-white shadow text-blue-600 font-bold' : 'text-gray-500 hover:text-gray-700'}`}>展示中</button>
            <button onClick={() => setFilter('expired')} className={`px-4 py-1.5 text-sm rounded-md transition-all ${filter === 'expired' ? 'bg-white shadow text-red-600 font-bold' : 'text-gray-500 hover:text-gray-700'}`}>已下架</button>
            <button onClick={() => setFilter('all')} className={`px-4 py-1.5 text-sm rounded-md transition-all ${filter === 'all' ? 'bg-white shadow text-gray-900 font-bold' : 'text-gray-500 hover:text-gray-700'}`}>全部</button>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">排序:</span>
            <select value={sort} onChange={e => setSort(e.target.value as any)} className="text-sm border-none bg-gray-50 rounded-lg px-3 py-1.5 focus:ring-0 cursor-pointer">
                <option value="newest">最新发布</option>
                <option value="expiry">即将过期</option>
            </select>
        </div>
      </div>

      {filteredData.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            暂无相关内容
        </div>
      ) : filteredData.map(item => (
        <div key={item.id} className={`bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-start gap-4 sm:gap-6 relative overflow-hidden ${item.expiryDate && new Date(item.expiryDate) < new Date() ? 'opacity-75 grayscale-[0.5]' : ''}`}>
          {item.expiryDate && new Date(item.expiryDate) < new Date() && (
              <div className="absolute top-0 right-0 bg-red-500 text-white text-xs px-3 py-1 rounded-bl-lg font-bold z-10">
                  已下架
              </div>
          )}
          <img src={item.image} alt={item.title} className="w-full sm:w-24 h-32 sm:h-24 rounded-lg object-cover" />
          <div className="flex-1 w-full">
            <h3 className="text-lg font-bold mb-1">{item.title}</h3>
            {item.description && <p className="text-gray-500 text-sm mb-2">{item.description}</p>}
            {item.expiryDate && (
                <div className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                    <span className={new Date(item.expiryDate) < new Date() ? 'text-red-500 font-medium' : 'text-green-600'}>
                        {new Date(item.expiryDate) < new Date() ? '已过期: ' : '有效期至: '}
                        {new Date(item.expiryDate).toLocaleDateString()}
                    </span>
                </div>
            )}
            <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline block truncate">
                {item.link}
            </a>
            <div className="text-xs text-gray-400 mt-1">点击量：{(item as any).viewCount || 0}</div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto justify-end sm:justify-start">
            <button
              onClick={() => {
                const url = `${window.location.origin}/?open=ad&id=${item.id}`;
                navigator.clipboard.writeText(url);
                alert('分享链接已复制！\n' + url);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-green-600"
              title="复制分享链接"
            >
              <LucideIcons.Link size={18} />
            </button>
            <button onClick={() => onEdit(item)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-blue-600">
              <Edit2 size={18} />
            </button>
            <button onClick={() => onDelete(Number(item.id))} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-red-500">
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function AdForm({ initialData, onSave }: { initialData?: AdSlot, onSave: (data: any) => void }) {
  let parsedPhotos: string[] = [];
  try {
    if (Array.isArray(initialData?.photos)) {
      parsedPhotos = initialData.photos;
    } else if (typeof initialData?.photos === 'string' && initialData.photos.trim() !== '') {
      parsedPhotos = JSON.parse(initialData.photos);
    }
  } catch (e) {
    console.error("Failed to parse Ad photos:", e);
    parsedPhotos = typeof initialData?.photos === 'string' ? [initialData.photos] : [];
  }

  const [formData, setFormData] = useState<Partial<AdSlot>>(initialData ? {
    ...initialData,
    photos: parsedPhotos,
    content: initialData.content || ''
  } : {
    title: '',
    description: '',
    image: 'https://picsum.photos/300/100',
    photos: [],
    link: '',
    layout: 'standard',
    address: '',
    content: '',
    phone: '',
    wechat: '',
    kakao: '',
    email: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">标题 (主标题)</label>
        <input
          type="text"
          value={formData.title}
          onChange={e => setFormData({...formData, title: e.target.value})}
          className="w-full px-3 py-2 border rounded-lg"
          required
        />
      </div>

      <ExpirationSelector 
        value={(formData as any).expiryDate} 
        onChange={(val) => setFormData({...formData, expiryDate: val} as any)} 
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">描述 (简短介绍)</label>
        <input
          type="text"
          value={formData.description || ''}
          onChange={e => setFormData({...formData, description: e.target.value})}
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="简短描述"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">地址 (可选)</label>
        <input
          type="text"
          value={formData.address || ''}
          onChange={e => setFormData({...formData, address: e.target.value})}
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="例如：市南区..."
        />
      </div>

      <div>
        <ImageUploader
          label="封面图片"
          images={formData.image ? [formData.image] : []}
          onChange={(images) => setFormData({ ...formData, image: images[0] || '' })}
          single={true}
        />
      </div>

      <div>
        <ImageUploader
          label="照片墙 (详情页轮播)"
          images={formData.photos || []}
          onChange={(images) => setFormData({ ...formData, photos: images })}
          maxImages={9}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">电话 (전화번호)</label>
          <input
            type="text"
            value={formData.phone || ''}
            onChange={e => setFormData({...formData, phone: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="例如: +86 123456789"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">微信 ID (위챗 ID)</label>
          <input
            type="text"
            value={formData.wechat || ''}
            onChange={e => setFormData({...formData, wechat: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="WeChat ID"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">KakaoTalk ID (카카오톡 ID)</label>
          <input
            type="text"
            value={formData.kakao || ''}
            onChange={e => setFormData({...formData, kakao: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Kakao ID"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">邮箱 (이메일)</label>
          <input
            type="email"
            value={formData.email || ''}
            onChange={e => setFormData({...formData, email: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Email Address"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">跳转链接 (可选)</label>
        <input
          type="text"
          value={formData.link || ''}
          onChange={e => setFormData({...formData, link: e.target.value})}
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="如果填写，点击将直接跳转此链接"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">内容详情 (富文本)</label>
        <RichTextEditor
          value={formData.content || ''}
          onChange={val => setFormData({...formData, content: val})}
          placeholder="请输入详细内容..."
        />
      </div>

      <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700">
        保存
      </button>
    </form>
  );
}

// ===== Enterprise Components =====
function EnterprisesList({ data, onDelete, onEdit }: { data: any[], onDelete: (id: any) => void, onEdit: (item: any) => void }) {
  const [search, setSearch] = useState('');

  const filtered = data.filter(item => {
    if (search && !item.name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* 翻译提示 */}
      <div className="flex items-start gap-3 bg-violet-50 border border-violet-200 rounded-xl px-4 py-3 text-sm text-violet-700">
        <span className="text-lg leading-none mt-0.5">💡</span>
        <span><strong>비즈니스 통역</strong> 인재는 <strong>导游 메뉴</strong>에서 관리합니다. 导游 탭에서 추가 시 분류를 <strong>비즈니스 통역</strong>으로 선택하면 企业 메뉴 통역 탭에도 자동으로 표시됩니다.</span>
      </div>
      <div className="flex flex-wrap gap-3 items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索企业名称..." className="text-sm border border-gray-200 bg-gray-50 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400 flex-1 min-w-[160px]" />
        <span className="text-xs text-gray-400 ml-auto">{filtered.length} 条</span>
      </div>
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">暂无企业内容</div>
      ) : filtered.map(item => (
        <div key={item.id} className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-start gap-4 relative">
          {item.image && <img src={item.image.startsWith('/') ? `${window.location.origin.replace(':5173','')}/api${item.image}` : item.image} alt={item.name} className="w-20 h-20 rounded-lg object-cover shrink-0" onError={e => (e.currentTarget.style.display='none')} />}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
            {item.description && <p className="text-sm text-gray-500 mt-1">{item.description}</p>}
            <div className="text-xs text-gray-400 mt-1">点击量：{item.viewCount || 0}</div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => { const url = `${window.location.origin}/?open=enterprise&id=${item.id}`; navigator.clipboard.writeText(url); alert('分享链接已复制！\n' + url); }}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-green-600"
              title="复制分享链接"
            ><LucideIcons.Link size={18} /></button>
            <button onClick={() => onEdit(item)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-blue-600"><Edit2 size={18} /></button>
            <button onClick={() => onDelete(item.id)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-red-500"><Trash2 size={18} /></button>
          </div>
        </div>
      ))}
    </div>
  );
}

function EnterpriseForm({ initialData, onSave }: { initialData?: any, onSave: (data: any) => void }) {
  const defaultData = { name: '', description: '', city: '', address: '', phone: '', wechat: '', kakao: '', email: '', website: '', content: '', image: '', photos: [], rank: 99, isTop: false, isActive: true };
  const [formData, setFormData] = useState({ ...defaultData, ...initialData });
  const { cities } = useData();

  useEffect(() => {
    if (initialData) {
      const photos = initialData.photos
        ? (typeof initialData.photos === 'string' ? (() => { try { return JSON.parse(initialData.photos); } catch { return []; } })() : initialData.photos)
        : [];
      setFormData({ ...defaultData, ...initialData, photos });
    } else {
      setFormData({ ...defaultData });
    }
  }, [initialData?.id]);

  const update = (field: string, value: any) => setFormData((prev: any) => ({ ...prev, [field]: value }));

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(formData); }} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">企业名称</label>
        <input value={formData.name || ''} onChange={e => update('name', e.target.value)} className="w-full px-3 py-2 border rounded-lg" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">简介</label>
        <input value={formData.description || ''} onChange={e => update('description', e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">所在城市</label>
        <select value={formData.city || ''} onChange={e => update('city', e.target.value)} className="w-full px-3 py-2 border rounded-lg">
          <option value="">选择城市</option>
          {cities.map((c: any) => <option key={c.name} value={c.name}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <ImageUploader
          label="封面图片"
          images={formData.image ? [formData.image] : []}
          onChange={(images) => update('image', images[0] || '')}
          single={true}
        />
      </div>
      <div>
        <ImageUploader
          label="照片墙"
          images={formData.photos || []}
          onChange={(images) => update('photos', images)}
          maxImages={9}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">电话</label><input value={formData.phone || ''} onChange={e => update('phone', e.target.value)} className="w-full px-3 py-2 border rounded-lg" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">微信</label><input value={formData.wechat || ''} onChange={e => update('wechat', e.target.value)} className="w-full px-3 py-2 border rounded-lg" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">KakaoTalk</label><input value={formData.kakao || ''} onChange={e => update('kakao', e.target.value)} className="w-full px-3 py-2 border rounded-lg" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label><input value={formData.email || ''} onChange={e => update('email', e.target.value)} className="w-full px-3 py-2 border rounded-lg" /></div>
      </div>
      <div><label className="block text-sm font-medium text-gray-700 mb-1">详细地址</label><input value={formData.address || ''} onChange={e => update('address', e.target.value)} className="w-full px-3 py-2 border rounded-lg" /></div>
      <div><label className="block text-sm font-medium text-gray-700 mb-1">官网</label><input value={formData.website || ''} onChange={e => update('website', e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="https://" /></div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">排序权重 (越小越靠前)</label>
          <input type="number" value={formData.rank ?? 99} onChange={e => update('rank', parseInt(e.target.value) || 99)} className="w-full px-3 py-2 border rounded-lg" />
        </div>
        <div className="flex items-end gap-4 pb-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={formData.isTop || false} onChange={e => update('isTop', e.target.checked)} className="w-4 h-4 rounded text-blue-600" />
            <span className="text-sm text-gray-700">置顶</span>
          </label>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">详细介绍</label>
        <RichTextEditor value={formData.content || ''} onChange={(val: string) => update('content', val)} />
      </div>
      <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700">保存</button>
    </form>
  );
}
