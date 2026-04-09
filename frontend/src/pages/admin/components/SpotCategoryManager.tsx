import React, { useState } from 'react';
import { useData } from '../../../contexts/DataContext';
import { Trash2, Plus, Save, X, Image as ImageIcon, Type, Edit } from 'lucide-react';
import * as Icons from 'lucide-react';
import { SpotCategory } from '../../../types/data';
import ImageUploader from '../../../components/admin/ImageUploader';

export default function SpotCategoryManager() {
  const { spotCategories = [], addSpotCategory, updateSpotCategory, deleteSpotCategory } = useData();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [iconType, setIconType] = useState<'lucide' | 'image'>('lucide');
  const [formData, setFormData] = useState<Partial<SpotCategory>>({
    name: '',
    key: '',
    icon: 'MapPin',
    sortOrder: 0
  });

  const getIconComponent = (iconName: string) => {
    if (iconName && (iconName.startsWith('http') || iconName.startsWith('/') || iconName.startsWith('data:'))) {
        return <img src={iconName} alt="icon" className="w-5 h-5 object-contain" />;
    }
    const Icon = (Icons as any)[iconName];
    return Icon ? <Icon size={18} /> : <Icons.HelpCircle size={18} />;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.key) {
      if (editingId) {
        updateSpotCategory(editingId, formData);
      } else {
        addSpotCategory(formData);
      }
      setFormData({
        name: '',
        key: '',
        icon: 'MapPin',
        sortOrder: (spotCategories || []).length + 1
      });
      setIconType('lucide');
      setEditingId(null);
      setIsAdding(false);
    }
  };

  const handleEdit = (category: SpotCategory) => {
    setFormData({
        name: category.name,
        key: category.key,
        icon: category.icon,
        sortOrder: category.sortOrder
    });
    
    // Determine icon type
    if (category.icon && (category.icon.startsWith('http') || category.icon.startsWith('/') || category.icon.startsWith('data:'))) {
        setIconType('image');
    } else {
        setIconType('lucide');
    }
    
    setEditingId(category.id);
    setIsAdding(true);
  };

  const handleAdd = () => {
      if (isAdding) {
          setIsAdding(false);
          setEditingId(null);
          setFormData({
            name: '',
            key: '',
            icon: 'MapPin',
            sortOrder: (spotCategories || []).length + 1
          });
      } else {
          setFormData({
            name: '',
            key: '',
            icon: 'MapPin',
            sortOrder: (spotCategories || []).length + 1
          });
          setEditingId(null);
          setIsAdding(true);
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-800">菜单分类管理 ({(spotCategories || []).length})</h3>
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          {isAdding ? <X size={18} /> : <Plus size={18} />}
          {isAdding ? '取消' : '添加分类'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm animate-fade-in">
          <h4 className="font-bold mb-4 text-gray-700">{editingId ? '编辑分类' : '添加新分类'}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">分类名称</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="例如：景点管理"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">唯一标识 (Key)</label>
              <input
                type="text"
                value={formData.key}
                onChange={e => setFormData({ ...formData, key: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="例如：spot (用于数据关联)"
                required
              />
            </div>
            
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">图标设置</label>
                <div className="flex gap-4 mb-3">
                    <button
                        type="button"
                        onClick={() => { setIconType('lucide'); setFormData({...formData, icon: 'MapPin'}); }}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${iconType === 'lucide' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-gray-200 text-gray-600'}`}
                    >
                        <Type size={16} />
                        内置图标
                    </button>
                    <button
                        type="button"
                        onClick={() => { setIconType('image'); setFormData({...formData, icon: ''}); }}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${iconType === 'image' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-gray-200 text-gray-600'}`}
                    >
                        <ImageIcon size={16} />
                        自定义图片
                    </button>
                </div>
                
                {iconType === 'lucide' ? (
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Lucide 图标名称 (例如: MapPin, Utensils)</label>
                        <input
                            type="text"
                            value={formData.icon}
                            onChange={e => setFormData({ ...formData, icon: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="例如：MapPin"
                        />
                    </div>
                ) : (
                    <div>
                        <ImageUploader
                            images={formData.icon ? [formData.icon] : []}
                            onChange={(imgs) => setFormData({...formData, icon: imgs[0] || ''})}
                            maxImages={1}
                            single={true}
                            label="上传图标 (建议透明背景 PNG/SVG)"
                        />
                    </div>
                )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">排序权重</label>
              <input
                type="number"
                value={formData.sortOrder}
                onChange={e => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="数字越小越靠前"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Save size={18} />
              保存
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-600">排序</th>
              <th className="px-6 py-4 font-semibold text-gray-600">图标</th>
              <th className="px-6 py-4 font-semibold text-gray-600">名称</th>
              <th className="px-6 py-4 font-semibold text-gray-600">标识 (Key)</th>
              <th className="px-6 py-4 font-semibold text-gray-600 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(spotCategories || []).sort((a, b) => a.sortOrder - b.sortOrder).map((category) => (
              <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-gray-500">{category.sortOrder}</td>
                <td className="px-6 py-4 font-mono text-sm text-blue-600 flex items-center gap-2">
                  {getIconComponent(category.icon)}
                  <span>{category.icon}</span>
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">{category.name}</td>
                <td className="px-6 py-4 text-gray-500">{category.key}</td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-50 transition-colors"
                    title="编辑分类"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`确定要删除 "${category.name}" 分类吗？\n注意：删除后，关联该分类的数据可能无法正常显示。`)) {
                        deleteSpotCategory(category.id);
                      }
                    }}
                    className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                    title="删除分类"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {(spotCategories || []).length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                  暂无分类数据，请点击上方按钮添加
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
