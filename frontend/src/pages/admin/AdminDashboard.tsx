import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Guide, Strategy, Spot, AdSlot } from '../../types/data';
import { Trash2, Plus, Edit2, LogOut, X, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { 
    guides, addGuide, updateGuide, deleteGuide,
    strategies, addStrategy, updateStrategy, deleteStrategy,
    spots, addSpot, updateSpot, deleteSpot,
    ads, addAd, updateAd, deleteAd
  } = useData();
  
  const [activeTab, setActiveTab] = useState<'guides' | 'strategies' | 'spots' | 'ads'>('guides');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
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
    }
    setIsModalOpen(false);
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
    a.download = 'travelmap-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col">
        <h1 className="text-2xl font-bold text-blue-600 mb-10">TravelMap 后台</h1>
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
          <TabButton active={activeTab === 'ads'} onClick={() => setActiveTab('ads')}>
            广告位管理
          </TabButton>
        </nav>
        
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors py-4 border-t"
        >
          <Save size={20} />
          导出数据(用于部署)
        </button>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors pt-4"
        >
          <LogOut size={20} />
          退出登录
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto relative">
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            {activeTab === 'guides' && '导游列表'}
            {activeTab === 'strategies' && '攻略列表'}
            {activeTab === 'spots' && '景点列表'}
            {activeTab === 'ads' && '广告位列表'}
          </h2>
          <button 
            onClick={handleAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            新建项目
          </button>
        </header>

        <div className="grid grid-cols-1 gap-6">
            {activeTab === 'guides' && <GuidesList data={guides} onDelete={deleteGuide} onEdit={handleEdit} />}
            {activeTab === 'strategies' && <StrategiesList data={strategies} onDelete={deleteStrategy} onEdit={handleEdit} />}
            {activeTab === 'spots' && <div className="text-gray-500">暂无景点数据</div>}
            {activeTab === 'ads' && <div className="text-gray-500">暂无广告位数据</div>}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-xl font-bold">
                {editingItem ? '编辑' : '新建'}
                {activeTab === 'guides' ? '导游' : activeTab === 'strategies' ? '攻略' : ''}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              {activeTab === 'guides' && <GuideForm initialData={editingItem} onSave={handleSave} />}
              {activeTab === 'strategies' && <StrategyForm initialData={editingItem} onSave={handleSave} />}
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
        <div key={guide.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-6">
          <img src={guide.avatar} alt={guide.name} className="w-16 h-16 rounded-full object-cover" />
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
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
          <div className="flex gap-2">
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
        <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-6">
          <img src={item.image} alt={item.title} className="w-24 h-24 rounded-lg object-cover" />
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-bold">{item.title}</h3>
              <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-700">
                {item.days}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {item.spots.map(s => (
                 <span key={s} className="text-xs border border-gray-200 px-2 py-1 rounded text-gray-600">{s}</span>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
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
            <span className="text-sm font-medium text-gray-700">是否有车</span>
            </label>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">简介</label>
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

function StrategyForm({ initialData, onSave }: { initialData?: Strategy, onSave: (data: any) => void }) {
  const [formData, setFormData] = useState(initialData || {
    title: '',
    days: '1天',
    spots: [],
    image: 'https://picsum.photos/200',
    tags: []
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
        <label className="block text-sm font-medium text-gray-700 mb-1">游玩天数</label>
        <input
          type="text"
          value={formData.days}
          onChange={e => setFormData({...formData, days: e.target.value})}
          className="w-full px-3 py-2 border rounded-lg"
          required
        />
      </div>
       <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700">
        保存
      </button>
    </form>
  );
}
