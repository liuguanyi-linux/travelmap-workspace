import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Guide, Strategy, Spot, AdSlot, ContactInfo } from '../../types/data';
import { Trash2, Plus, Edit2, LogOut, X, Save, Settings, Phone, Menu, Users, Map, Compass, BookOpen, Megaphone, MapPin, Loader2, Minus } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SystemSettings from './components/SystemSettings';
import UserList from './components/UserList';
import CityManager from './components/CityManager';
import SpotCategoryManager from './components/SpotCategoryManager';
import UsageGuideManager from './components/UsageGuideManager';

import ImageUploader from '../../components/admin/ImageUploader';
import RichTextEditor from '../../components/admin/RichTextEditor';
import { ReviewManager } from '../../components/admin/ReviewManager';

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
    spots = [], addSpot, updateSpot, deleteSpot,
    ads = [], addAd, updateAd, deleteAd,
    contactInfo, updateContactInfo,
    isCloudSyncing, enableCloud
  } = useData();
  const { logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState<string>('guides'); // Default to 'guides' to match initial render
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [addTag, setAddTag] = useState<string | undefined>(undefined);
  const navigate = useNavigate();
  
  // User reported mismatch between sidebar and content
  // Adding state to track sidebar active state properly if needed, but activeTab should be sufficient.
  // Ensure 'usage-guides' is correctly handled.



  const handleLogout = () => {
    logout();
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  const handleExport = () => {
    const data = {
      guides,
      strategies,
      spots,
      ads
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `travelmap_data_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!window.confirm('导入数据将覆盖当前所有数据，是否继续？')) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.guides) localStorage.setItem('travelmap_guides', JSON.stringify(data.guides));
        if (data.strategies) localStorage.setItem('travelmap_strategies', JSON.stringify(data.strategies));
        if (data.spots) localStorage.setItem('travelmap_spots', JSON.stringify(data.spots));
        if (data.ads) localStorage.setItem('travelmap_ads', JSON.stringify(data.ads));
        alert('数据导入成功！页面即将刷新以加载新数据...');
        window.location.reload();
      } catch (err) {
        alert('导入失败：文件格式不正确');
        console.error(err);
      }
    };
    reader.readAsText(file);
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
      } else if (activeTab === 'strategies') {
        if (editingItem) {
          updateStrategy({ ...editingItem, ...formData });
        } else {
          addStrategy({ ...formData, id: Date.now(), rank: 99 });
        }
      } else if (activeTab === 'ads') {
        if (editingItem) {
          updateAd({ ...editingItem, ...formData });
        } else {
          addAd({ ...formData, id: Date.now() });
        }
      } else if (spotCategories.some(cat => cat.key === activeTab) || activeTab === 'transport') {
        console.log('Matching spot category:', activeTab);
        if (editingItem) {
          await updateSpot({ ...editingItem, ...formData });
        } else {
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
            TravelMap 后台
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
            .filter(cat => ['spot', 'dining', 'accommodation', 'shopping'].includes(cat.key))
            .sort((a, b) => {
              const order = { spot: 1, dining: 2, accommodation: 3, shopping: 4 };
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
                  <span>- {cat.name}管理</span>
                </div>
              </TabButton>
            )})}
          
          {/* Merged Transport Category */}
          <TabButton active={activeTab === 'transport'} onClick={() => setActiveTab('transport')}>
            <div className="flex items-center gap-3">
              <span>- 高铁/机场管理</span>
            </div>
          </TabButton>

          {/* 内容运营组 */}
          <TabButton active={activeTab === 'guides'} onClick={() => setActiveTab('guides')}>
            <div className="flex items-center gap-3">
              <Compass size={18} />
              <span>导游管理</span>
            </div>
          </TabButton>
          <TabButton active={activeTab === 'strategies'} onClick={() => setActiveTab('strategies')}>
            <div className="flex items-center gap-3">
              <BookOpen size={18} />
              <span>攻略管理</span>
            </div>
          </TabButton>

          {/* 营销推广组 */}
          <TabButton active={activeTab === 'ads'} onClick={() => setActiveTab('ads')}>
            <div className="flex items-center gap-3">
              <Megaphone size={18} />
              <span>广告位管理</span>
            </div>
          </TabButton>

          {/* 系统管理组 */}
          <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')}>
            <div className="flex items-center gap-3">
              <Users size={18} />
              <span>用户管理</span>
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
          <TabButton active={activeTab === 'usage-guides'} onClick={() => setActiveTab('usage-guides')}>
            <div className="flex items-center gap-3">
              <BookOpen size={18} />
              <span>使用介绍</span>
            </div>
          </TabButton>
          <TabButton active={activeTab === 'system'} onClick={() => setActiveTab('system')}>
            <div className="flex items-center gap-3">
              <Settings size={18} />
              <span>系统设置</span>
            </div>
          </TabButton>
        </nav>
        
        <div className="py-4 border-t space-y-4">
          <label className="flex items-center gap-2 text-gray-600 hover:text-blue-600 cursor-pointer transition-colors">
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            <span className="text-lg">📥</span>
            <span>导入数据</span>
          </label>

          <button 
            onClick={handleExport}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <Save size={20} />
            <span>导出数据(用于部署)</span>
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
            {activeTab === 'strategies' && '攻略列表'}
            {activeTab === 'cities' && '城市管理'}
            {activeTab === 'menu_categories' && '菜单分类管理'}
            {spotCategories.map(cat => activeTab === cat.key && `${cat.name}列表`)}
            {activeTab === 'transport' && '高铁/机场列表'}
            {activeTab === 'ads' && '广告位列表'}
            {activeTab === 'users' && '用户列表'}
            {activeTab === 'contact' && '联系方式设置'}
            {activeTab === 'system' && '系统设置'}
            {activeTab === 'usage-guides' && '使用介绍管理'}
          </h2>
          </div>
          {activeTab !== 'system' && activeTab !== 'contact' && activeTab !== 'users' && activeTab !== 'cities' && activeTab !== 'menu_categories' && activeTab !== 'usage-guides' && activeTab !== 'transport' && (
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
          {activeTab === 'strategies' && <StrategiesList data={strategies} onDelete={deleteStrategy} onEdit={handleEdit} />}
          {activeTab === 'cities' && <CityManager />}
          {activeTab === 'menu_categories' && <SpotCategoryManager />}
          {spotCategories.map(cat => (
            activeTab === cat.key && (
              <SpotsList 
                key={cat.key} 
                data={spots.filter(s => {
                   if (cat.key === 'spot') {
                     // Dynamic exclusion: exclude if it has ANY tag that corresponds to another category
                     const otherCategories = spotCategories.filter(c => c.key !== 'spot').map(c => c.key);
                     const hasOtherTag = s.tags.some(tag => otherCategories.includes(tag));
                     return s.tags.includes('spot') || !hasOtherTag;
                   }
                   return s.tags.includes(cat.key);
                })} 
                onDelete={deleteSpot} 
                onEdit={handleEdit} 
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
                />
              </div>
            </div>
          )}
            {activeTab === 'ads' && <AdsList data={ads} onDelete={deleteAd} onEdit={handleEdit} />}
            {activeTab === 'users' && <UserList />}
            {activeTab === 'contact' && <ContactSettings info={contactInfo} onSave={updateContactInfo} />}
            {activeTab === 'system' && <SystemSettings isCloudSyncing={isCloudSyncing} onEnableCloud={enableCloud} />}
            {activeTab === 'usage-guides' && <UsageGuideManager />}
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
              {activeTab === 'strategies' && <StrategyForm initialData={editingItem} onSave={handleSave} isSaving={isSaving} />}
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

function GuidesList({ data, onDelete, onEdit }: { data: Guide[], onDelete: (id: number) => void, onEdit: (item: Guide) => void }) {
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
    if (a.isTop !== b.isTop) return (b.isTop ? 1 : 0) - (a.isTop ? 1 : 0);
    if (a.rank !== b.rank) return (a.rank || 99) - (b.rank || 99);
    return b.id - a.id;
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
              <span className={`px-2 py-0.5 text-xs rounded-full border ${
                  guide.category === 'car' ? 'bg-green-50 text-green-600 border-green-200' :
                  guide.category === 'agency' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                  'bg-blue-50 text-blue-600 border-blue-200'
              }`}>
                  {guide.category === 'car' ? '租车' : guide.category === 'agency' ? '旅行社' : '导游'}
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
          </div>
          <div className="flex gap-2 w-full sm:w-auto justify-end sm:justify-start">
            <button onClick={() => onEdit(guide)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-blue-600">
              <Edit2 size={18} />
            </button>
            <button onClick={() => onDelete(guide.id)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-red-500">
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function StrategiesList({ data, onDelete, onEdit }: { data: Strategy[], onDelete: (id: number) => void, onEdit: (item: Strategy) => void }) {
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
    if (a.isTop !== b.isTop) return (b.isTop ? 1 : 0) - (a.isTop ? 1 : 0);
    if (a.rank !== b.rank) return (a.rank || 99) - (b.rank || 99);
    return b.id - a.id;
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
            <button onClick={() => onEdit(item)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-blue-600">
              <Edit2 size={18} />
            </button>
            <button onClick={() => onDelete(item.id)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-red-500">
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
  const [formData, setFormData] = useState<Partial<Guide>>(initialData || {
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
    category: 'guide',
    photos: [] as string[],
    content: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
            <label className="block text-sm font-medium text-gray-700 mb-1">类别</label>
            <select
            value={formData.category || 'guide'}
            onChange={e => setFormData({...formData, category: e.target.value as 'guide' | 'car' | 'agency'})}
            className="w-full px-3 py-2 border rounded-lg bg-white"
            >
            <option value="guide">导游 (Guide)</option>
            <option value="car">租车 (Car Rental)</option>
            <option value="agency">旅行社 (Agency)</option>
            </select>
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
  const [formData, setFormData] = useState<Partial<Strategy>>(initialData || {
    title: '',
    city: '青岛',
    category: strategyCategories.length > 0 ? strategyCategories[0].name : '',
    days: '1天',
    spots: [] as string[],
    image: 'https://picsum.photos/200',
    photos: [] as string[],
    tags: [] as string[],
    content: ''
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
        <label className="block text-sm font-medium text-gray-700 mb-1">所属城市</label>
        <select
          value={formData.city || '青岛'}
          onChange={e => setFormData({...formData, city: e.target.value})}
          className="w-full px-3 py-2 border rounded-lg"
        >
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

function SpotsList({ data, onDelete, onEdit }: { data: Spot[], onDelete: (id: number) => void, onEdit: (item: Spot) => void }) {
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
    if (a.isTop !== b.isTop) return (b.isTop ? 1 : 0) - (a.isTop ? 1 : 0);
    if (a.rank !== b.rank) return (a.rank || 99) - (b.rank || 99);
    return b.id - a.id;
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
              {item.isTop && <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-600 font-bold">置顶</span>}
              <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">排序:{item.rank || 99}</span>
              <div className="flex gap-1">
                {item.tags?.map(t => (
                    <span key={t} className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-600">
                        {t === 'spot' && '景点'}
                        {t === 'dining' && '美食'}
                        {t === 'accommodation' && '酒店'}
                        {t === 'shopping' && '购物'}
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
          </div>
          <div className="flex gap-2 w-full sm:w-auto justify-end sm:justify-start">
            <button onClick={() => onEdit(item)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-blue-600">
              <Edit2 size={18} />
            </button>
            <button onClick={() => onDelete(item.id)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-red-500">
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

  const [formData, setFormData] = useState<Partial<Spot>>(initialData ? {
    ...initialData,
    // Ensure arrays are initialized correctly to prevent nulls
    photos: initialData.photos || [],
    tags: initialData.tags || [effectiveDefaultTag],
    reviews: initialData.reviews || []
  } : {
    name: '',
    cnName: '',
    city: '青岛',
    address: '',
    location: { lng: 120.38, lat: 36.06 },
    photos: [],
    content: '',
    tags: [effectiveDefaultTag],
    rank: 99,
    isTop: false,
    reviews: []
  });

  // Ensure formData is updated when initialData changes, BUT ONLY if initialData is provided (edit mode)
  useEffect(() => {
    if (initialData) {
        setFormData(prev => ({
            ...prev,
            ...initialData,
            photos: initialData.photos || [],
            tags: initialData.tags || [effectiveDefaultTag],
            reviews: initialData.reviews || []
        }));
    }
  }, [initialData]);

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
        <label className="block text-sm font-medium text-gray-700 mb-1">所属城市</label>
        <select
          value={formData.city || '青岛'}
          onChange={e => {
            const city = cities.find(c => c.name === e.target.value);
            setFormData({
                ...formData, 
                city: e.target.value,
                // Optional: Auto-update map center if new item
                location: !initialData && city ? { lng: city.lng, lat: city.lat } : formData.location
            });
          }}
          className="w-full px-3 py-2 border rounded-lg"
        >
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
        <label className="block text-sm font-medium text-gray-700 mb-1">坐标 (经度, 纬度)</label>
        <div className="text-xs text-gray-500 mb-2">
          * 坐标决定地图上的图标位置。请使用 <a href="https://lbs.amap.com/tools/picker" target="_blank" className="text-blue-500 underline">高德坐标拾取器</a> 获取准确坐标。
        </div>
        <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              step="0.000001"
              value={formData.location?.lng ?? 120.38}
              onChange={e => setFormData({
                ...formData, 
                location: { lng: parseFloat(e.target.value), lat: formData.location?.lat ?? 36.06 }
              })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="经度 (Lng)"
            />
            <input
              type="number"
              step="0.000001"
              value={formData.location?.lat ?? 36.06}
              onChange={e => setFormData({
                ...formData, 
                location: { lat: parseFloat(e.target.value), lng: formData.location?.lng ?? 120.38 }
              })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="纬度 (Lat)"
            />
        </div>
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
    return b.id - a.id;
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
          </div>
          <div className="flex gap-2 w-full sm:w-auto justify-end sm:justify-start">
            <button onClick={() => onEdit(item)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-blue-600">
              <Edit2 size={18} />
            </button>
            <button onClick={() => onDelete(item.id)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-red-500">
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function AdForm({ initialData, onSave }: { initialData?: AdSlot, onSave: (data: any) => void }) {
  const [formData, setFormData] = useState<Partial<AdSlot>>(initialData ? {
    ...initialData,
    photos: initialData.photos || [],
    content: initialData.content || ''
  } : {
    title: '',
    description: '',
    image: 'https://picsum.photos/300/100',
    photos: [],
    link: '',
    layout: 'standard',
    address: '',
    content: ''
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
