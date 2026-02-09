import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Guide, Strategy, Spot, AdSlot, ContactInfo } from '../../types/data';
import { CITIES } from '../../config/cityConfig';
import { Trash2, Plus, Edit2, LogOut, X, Save, Settings, Phone, ShoppingBag, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SystemSettings from './components/SystemSettings';

export default function AdminDashboard() {
  const { 
    guides = [], addGuide, updateGuide, deleteGuide,
    strategies = [], addStrategy, updateStrategy, deleteStrategy,
    spots = [], addSpot, updateSpot, deleteSpot,
    ads = [], addAd, updateAd, deleteAd,
    contactInfo, updateContactInfo,
    isCloudSyncing, enableCloud
  } = useData();
  const { logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'guides' | 'strategies' | 'spots' | 'food' | 'hotel' | 'shopping' | 'ads' | 'contact' | 'system'>('guides');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const navigate = useNavigate();

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

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleSave = (formData: any) => {
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
      } else if (activeTab === 'spots' || activeTab === 'food' || activeTab === 'hotel') {
        if (editingItem) {
          updateSpot({ ...editingItem, ...formData });
        } else {
          addSpot({ ...formData, id: Date.now() });
        }
      } else if (activeTab === 'ads') {
        if (editingItem) {
          updateAd({ ...editingItem, ...formData });
        } else {
          addAd({ ...formData, id: Date.now() });
        }
      }
      setIsModalOpen(false);
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
          <h1 className="text-2xl font-bold text-blue-600">TravelMap 后台</h1>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <nav className="space-y-2 flex-1">
          <TabButton active={activeTab === 'guides'} onClick={() => setActiveTab('guides')}>
            导游管理
          </TabButton>
          <TabButton active={activeTab === 'strategies'} onClick={() => setActiveTab('strategies')}>
            攻略管理
          </TabButton>
          <TabButton active={activeTab === 'spots'} onClick={() => setActiveTab('spots')}>
            景点管理
          </TabButton>
          <TabButton active={activeTab === 'food'} onClick={() => setActiveTab('food')}>
            美食管理
          </TabButton>
          <TabButton active={activeTab === 'hotel'} onClick={() => setActiveTab('hotel')}>
            酒店管理
          </TabButton>
          <TabButton active={activeTab === 'shopping'} onClick={() => setActiveTab('shopping')}>
            购物管理
          </TabButton>
          <TabButton active={activeTab === 'ads'} onClick={() => setActiveTab('ads')}>
            广告位管理
          </TabButton>
          <TabButton active={activeTab === 'contact'} onClick={() => setActiveTab('contact')}>
             <div className="flex items-center gap-2">
               <Phone size={18} />
               <span>联系方式</span>
             </div>
          </TabButton>
          <div className="pt-4 mt-4 border-t border-gray-100">
             <TabButton active={activeTab === 'system'} onClick={() => setActiveTab('system')}>
               <div className="flex items-center gap-2">
                 <Settings size={18} />
                 <span>系统设置</span>
               </div>
             </TabButton>
          </div>
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
            {activeTab === 'spots' && '景点列表'}
            {activeTab === 'food' && '美食列表'}
            {activeTab === 'hotel' && '酒店列表'}
            {activeTab === 'shopping' && '购物列表'}
            {activeTab === 'ads' && '广告位列表'}
            {activeTab === 'contact' && '联系方式设置'}
            {activeTab === 'system' && '系统设置'}
          </h2>
          </div>
          {activeTab !== 'system' && activeTab !== 'contact' && (
          <button 
            onClick={handleAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            新建项目
          </button>
          )}
        </header>

        <div className="grid grid-cols-1 gap-6">
            {activeTab === 'guides' && <GuidesList data={guides} onDelete={deleteGuide} onEdit={handleEdit} />}
            {activeTab === 'strategies' && <StrategiesList data={strategies} onDelete={deleteStrategy} onEdit={handleEdit} />}
            {activeTab === 'spots' && <SpotsList data={spots.filter(s => s.tags.includes('spot') || (!s.tags.includes('dining') && !s.tags.includes('accommodation') && !s.tags.includes('transport')))} onDelete={deleteSpot} onEdit={handleEdit} />}
            {activeTab === 'food' && <SpotsList data={spots.filter(s => s.tags.includes('dining'))} onDelete={deleteSpot} onEdit={handleEdit} />}
            {activeTab === 'hotel' && <SpotsList data={spots.filter(s => s.tags.includes('accommodation'))} onDelete={deleteSpot} onEdit={handleEdit} />}
            {activeTab === 'shopping' && <SpotsList data={spots.filter(s => s.tags.includes('shopping'))} onDelete={deleteSpot} onEdit={handleEdit} />}
            {activeTab === 'ads' && <AdsList data={ads} onDelete={deleteAd} onEdit={handleEdit} />}
            {activeTab === 'contact' && <ContactSettings info={contactInfo} onSave={updateContactInfo} />}
            {activeTab === 'system' && <SystemSettings isCloudSyncing={isCloudSyncing} onEnableCloud={enableCloud} />}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-xl font-bold">
                {editingItem ? '编辑' : '新建'}
                {activeTab === 'guides' ? '导游' : activeTab === 'strategies' ? '攻略' : activeTab === 'spots' ? '景点' : activeTab === 'food' ? '美食' : activeTab === 'hotel' ? '酒店' : activeTab === 'shopping' ? '购物' : '广告位'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 sm:p-6">
              {activeTab === 'guides' && <GuideForm initialData={editingItem} onSave={handleSave} />}
              {activeTab === 'strategies' && <StrategyForm initialData={editingItem} onSave={handleSave} />}
              {(activeTab === 'spots' || activeTab === 'food' || activeTab === 'hotel' || activeTab === 'shopping') && <SpotForm key={activeTab} initialData={editingItem} defaultTag={activeTab === 'food' ? 'dining' : activeTab === 'hotel' ? 'accommodation' : activeTab === 'shopping' ? 'shopping' : 'spot'} onSave={handleSave} />}
              {activeTab === 'ads' && <AdForm initialData={editingItem} onSave={handleSave} />}
            </div>
          </div>
        </div>
      )}
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
  return (
    <div className="space-y-4">
      {data.map(guide => (
        <div key={guide.id} className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
          <img src={guide.avatar} alt={guide.name} className="w-16 h-16 rounded-full object-cover" />
          <div className="flex-1 w-full">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
              <h3 className="text-lg font-bold">{guide.name}</h3>
              <span className={`px-2 py-0.5 text-xs rounded-full ${guide.gender === 'male' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}`}>
                {guide.gender === 'male' ? '男' : '女'}
              </span>
              {guide.hasCar && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-600">
                  有车
                </span>
              )}
            </div>
            <p className="text-gray-500 text-sm mb-2">{guide.intro}</p>
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
  return (
    <div className="space-y-4">
      {data.map(item => (
        <div key={item.id} className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
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

function GuideForm({ initialData, onSave }: { initialData?: Guide, onSave: (data: any) => void }) {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    gender: 'male',
    hasCar: false,
    title: '导游',
    avatar: 'https://picsum.photos/200',
    intro: '',
    cities: [],
    photos: []
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
        <label className="block text-sm font-medium text-gray-700 mb-1">头像 (支持上传或URL)</label>
        <div className="mb-2">
            <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            setFormData({...formData, avatar: reader.result as string});
                        };
                        reader.readAsDataURL(file);
                    }
                }}
                className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
        </div>
        <input
          type="text"
          value={formData.avatar}
          onChange={e => setFormData({...formData, avatar: e.target.value})}
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="头像URL"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">照片墙 (支持上传或URL)</label>
        <div className="mb-2">
             <input
                 type="file"
                 accept="image/*"
                 multiple
                 onChange={(e) => {
                     const files = e.target.files;
                     if (!files) return;
                     Array.from(files).forEach(file => {
                         const reader = new FileReader();
                         reader.onloadend = () => {
                             setFormData(prev => ({
                                 ...prev,
                                 photos: [...(prev.photos || []), reader.result as string]
                             }));
                         };
                         reader.readAsDataURL(file);
                     });
                 }}
                 className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
             />
        </div>
        <input
          type="text"
          value={formData.photos ? formData.photos.join(', ') : ''}
          onChange={e => setFormData({...formData, photos: e.target.value.split(/[,，]/).map(s => s.trim()).filter(Boolean)})}
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="http://example.com/1.jpg, http://example.com/2.jpg"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">服务城市 (多选)</label>
        <div className="flex flex-wrap gap-4 pt-1">
          {CITIES.map(city => (
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
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">简介 (首页显示部分)</label>
        <textarea
          value={formData.intro}
          onChange={e => setFormData({...formData, intro: e.target.value})}
          className="w-full px-3 py-2 border rounded-lg"
          rows={3}
          required
        />
      </div>
      <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700">
        保存
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

function StrategyForm({ initialData, onSave }: { initialData?: Strategy, onSave: (data: any) => void }) {
  const { spots: availableSpots = [] } = useData();
  const [formData, setFormData] = useState(initialData || {
    title: '',
    city: '青岛',
    category: '其他',
    days: '1天',
    spots: [],
    image: 'https://picsum.photos/200',
    tags: [],
    content: ''
  });

  const [customSpot, setCustomSpot] = useState('');

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
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">所属城市</label>
        <select
          value={formData.city || '青岛'}
          onChange={e => setFormData({...formData, city: e.target.value})}
          className="w-full px-3 py-2 border rounded-lg"
        >
          {CITIES.map(city => (
            <option key={city.name} value={city.name}>{city.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">攻略分类</label>
        <select
          value={formData.category || '其他'}
          onChange={e => setFormData({...formData, category: e.target.value})}
          className="w-full px-3 py-2 border rounded-lg"
        >
          <option value="一日游">一日游</option>
          <option value="2日游">2日游</option>
          <option value="亲子游">亲子游</option>
          <option value="其他">其他</option>
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
          {formData.spots.length === 0 && <span className="text-gray-400 text-sm py-1">暂无景点</span>}
          {formData.spots.map(spot => (
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
        <label className="block text-sm font-medium text-gray-700 mb-1">封面图片 (支持上传或URL)</label>
        <div className="mb-2">
            <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            setFormData({...formData, image: reader.result as string});
                        };
                        reader.readAsDataURL(file);
                    }
                }}
                className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
        </div>
        <input
          type="text"
          value={formData.image}
          onChange={e => setFormData({...formData, image: e.target.value})}
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="图片URL"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">内容详情</label>
        <textarea
          value={formData.content || ''}
          onChange={e => setFormData({...formData, content: e.target.value})}
          className="w-full px-3 py-2 border rounded-lg"
          rows={5}
        />
      </div>
       <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700">
        保存
      </button>
    </form>
  );
}

function SpotsList({ data, onDelete, onEdit }: { data: Spot[], onDelete: (id: number) => void, onEdit: (item: Spot) => void }) {
  return (
    <div className="space-y-4">
      {data.map(item => (
        <div key={item.id} className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
          <div className="w-full sm:w-24 h-48 sm:h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
             {item.photos[0] ? (
                <img src={item.photos[0]} alt={item.name} className="w-full h-full object-cover" />
             ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">无图</div>
             )}
          </div>
          <div className="flex-1 w-full">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
              <h3 className="text-lg font-bold">{item.name}</h3>
              <div className="flex gap-1">
                {item.tags.map(t => (
                    <span key={t} className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-600">
                        {t === 'spot' && '景点'}
                        {t === 'dining' && '美食'}
                        {t === 'accommodation' && '酒店'}
                        {t === 'transport' && '交通'}
                        {t === 'other' && '其他'}
                    </span>
                ))}
              </div>
            </div>
            <p className="text-gray-500 text-sm mb-2 line-clamp-2">{item.content}</p>
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

function SpotForm({ initialData, defaultTag = 'spot', onSave }: { initialData?: Spot, defaultTag?: string, onSave: (data: any) => void }) {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    city: '青岛',
    address: '',
    location: { lng: 120.38, lat: 36.06 },
    photos: [],
    videos: [],
    content: '',
    tags: [defaultTag],
    reviews: []
  });

  const [newReview, setNewReview] = useState({
    username: '游客',
    rating: 5,
    content: ''
  });

  const handleAddReview = () => {
    if (!newReview.content.trim()) return;
    
    const review = {
        id: Date.now().toString(),
        userId: 'admin_added',
        username: newReview.username || '游客',
        rating: newReview.rating,
        content: newReview.content,
        created_at: new Date().toISOString(),
        source: 'Local'
    };

    setFormData(prev => ({
        ...prev,
        reviews: [review, ...(prev.reviews || [])]
    }));

    setNewReview({ username: '游客', rating: 5, content: '' });
  };

  const handleDeleteReview = (reviewId: string) => {
    setFormData(prev => ({
        ...prev,
        reviews: (prev.reviews || []).filter(r => r.id !== reviewId)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">名称</label>
        <input
          type="text"
          value={formData.name}
          onChange={e => setFormData({...formData, name: e.target.value})}
          className="w-full px-3 py-2 border rounded-lg"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">所属城市</label>
        <select
          value={formData.city || '青岛'}
          onChange={e => {
            const city = CITIES.find(c => c.name === e.target.value);
            setFormData({
                ...formData, 
                city: e.target.value,
                // Optional: Auto-update map center if new item
                location: !initialData && city ? { lng: city.center[0], lat: city.center[1] } : formData.location
            });
          }}
          className="w-full px-3 py-2 border rounded-lg"
        >
          {CITIES.map(city => (
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
        <label className="block text-sm font-medium text-gray-700 mb-1">分类 (已锁定)</label>
        <select
          value={formData.tags[0] || 'spot'}
          onChange={e => setFormData({...formData, tags: [e.target.value as any]})}
          className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
          disabled={true}
        >
          <option value="spot">景点</option>
          <option value="dining">美食</option>
          <option value="accommodation">酒店</option>
          <option value="shopping">购物</option>
          <option value="transport">交通</option>
          <option value="other">其他</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">图片 (支持上传本地图片或输入URL)</label>
        
        {/* File Upload */}
        <div className="mb-3">
            <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                    const files = e.target.files;
                    if (!files) return;
                    
                    Array.from(files).forEach(file => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            const base64String = reader.result as string;
                            setFormData(prev => ({
                                ...prev,
                                photos: [...(prev.photos || []), base64String]
                            }));
                        };
                        reader.readAsDataURL(file);
                    });
                }}
                className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
            />
            <p className="text-xs text-gray-500 mt-1">
                * 上传的图片将自动转换为Base64编码存储，无需手动放入文件夹。适合朋友使用。
            </p>
        </div>

        {/* URL Input */}
        <input
          type="text"
          value={formData.photos?.join(', ') || ''}
          onChange={e => setFormData({...formData, photos: e.target.value.split(/[,，]/).map(s => s.trim()).filter(Boolean)})}
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="http://example.com/1.jpg, /images/local.jpg"
        />
        <p className="text-xs text-gray-500 mt-1">
          * 也可以手动输入图片链接，多个链接用逗号分隔
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">视频URL (选填)</label>
        <input
          type="text"
          value={formData.videos?.join(', ') || ''}
          onChange={e => setFormData({...formData, videos: e.target.value.split(/[,，]/).map(s => s.trim()).filter(Boolean)})}
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="http://example.com/video.mp4, /videos/local.mp4"
        />
        <p className="text-xs text-gray-500 mt-1">
          * 本地视频请存放在 <code className="bg-gray-100 px-1 rounded">frontend/public/videos/</code> 目录下，并填写 <code className="bg-gray-100 px-1 rounded">/videos/文件名.mp4</code>
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">内容详情</label>
        <textarea
          value={formData.content}
          onChange={e => setFormData({...formData, content: e.target.value})}
          className="w-full px-3 py-2 border rounded-lg"
          rows={5}
          required
        />
      </div>

      {/* Review Management Section */}
      <div className="border-t pt-4 mt-4">
        <h3 className="font-bold text-gray-800 mb-3">评论管理</h3>
        
        {/* Add Review Form */}
        <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-3">
            <div className="flex gap-3">
                <input
                    type="text"
                    value={newReview.username}
                    onChange={e => setNewReview({...newReview, username: e.target.value})}
                    className="w-1/3 px-3 py-2 border rounded-lg text-sm"
                    placeholder="用户名"
                />
                <select
                    value={newReview.rating}
                    onChange={e => setNewReview({...newReview, rating: Number(e.target.value)})}
                    className="w-1/4 px-3 py-2 border rounded-lg text-sm"
                >
                    {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} 星</option>)}
                </select>
            </div>
            <div className="flex gap-3">
                <input
                    type="text"
                    value={newReview.content}
                    onChange={e => setNewReview({...newReview, content: e.target.value})}
                    className="flex-1 px-3 py-2 border rounded-lg text-sm"
                    placeholder="评论内容..."
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddReview())}
                />
                <button
                    type="button"
                    onClick={handleAddReview}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                >
                    添加评论
                </button>
            </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-3 max-h-60 overflow-y-auto">
            {(formData.reviews || []).length === 0 && <p className="text-sm text-gray-400 text-center py-2">暂无评论</p>}
            {(formData.reviews || []).map((review: any) => (
                <div key={review.id} className="bg-white border rounded-lg p-3 flex justify-between items-start group">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-sm">{review.username}</span>
                            <span className="text-yellow-500 text-xs">{'★'.repeat(review.rating)}</span>
                            <span className="text-gray-400 text-xs">{new Date(review.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-gray-600 text-sm">{review.content}</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => handleDeleteReview(review.id)}
                        className="text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            ))}
        </div>
      </div>

      <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700">
        保存
      </button>
    </form>
  );
}

function AdsList({ data, onDelete, onEdit }: { data: AdSlot[], onDelete: (id: number) => void, onEdit: (item: AdSlot) => void }) {
  return (
    <div className="space-y-4">
      {data.map(item => (
        <div key={item.id} className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
          <img src={item.image} alt={item.title} className="w-full sm:w-24 h-32 sm:h-24 rounded-lg object-cover" />
          <div className="flex-1 w-full">
            <h3 className="text-lg font-bold mb-1">{item.title}</h3>
            {item.description && <p className="text-gray-500 text-sm mb-2">{item.description}</p>}
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
  const [formData, setFormData] = useState(initialData || {
    title: '',
    description: '',
    image: 'https://picsum.photos/300/100',
    link: '',
    layout: 'standard'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
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
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
        <input
          type="text"
          value={formData.description || ''}
          onChange={e => setFormData({...formData, description: e.target.value})}
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="简短描述"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">图片 (支持上传或URL)</label>
        <div className="mb-2">
            <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            setFormData({...formData, image: reader.result as string});
                        };
                        reader.readAsDataURL(file);
                    }
                }}
                className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
        </div>
        <input
          type="text"
          value={formData.image}
          onChange={e => setFormData({...formData, image: e.target.value})}
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="图片URL"
          required={!formData.image}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">跳转链接</label>
        <input
          type="text"
          value={formData.link}
          onChange={e => setFormData({...formData, link: e.target.value})}
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="https://..."
        />
      </div>
      <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700">
        保存
      </button>
    </form>
  );
}
