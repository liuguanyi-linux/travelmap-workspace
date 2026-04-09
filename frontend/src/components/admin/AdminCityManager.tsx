import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { City } from '../../types/data';
import { MapPin, Plus, Trash2, Globe } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export default function AdminCityManager() {
  const { cities, addCity, deleteCity } = useData();
  const { t } = useLanguage();
  
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<City>>({
    name: '',
    lng: 116.40,
    lat: 39.90,
    zoom: 10
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.lng && formData.lat) {
      addCity(formData as City);
      setIsAdding(false);
      setFormData({
        name: '',
        lng: 116.40,
        lat: 39.90,
        zoom: 10
      });
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Globe className="w-6 h-6 text-blue-500" />
          城市管理
        </h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          添加城市
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">城市名称</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">缩放级别 (Zoom)</label>
                <input
                  type="number"
                  value={formData.zoom}
                  onChange={e => setFormData({ ...formData, zoom: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">经度 (Longitude)</label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.lng}
                  onChange={e => setFormData({ ...formData, lng: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">纬度 (Latitude)</label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.lat}
                  onChange={e => setFormData({ ...formData, lat: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                保存
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cities.map(city => (
          <div key={city.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center group hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">{city.name}</h3>
                <p className="text-xs text-gray-500">
                  [{city.lng.toFixed(2)}, {city.lat.toFixed(2)}] z{city.zoom}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                if (window.confirm('确定要删除这个城市吗？')) {
                  city.id && deleteCity(city.id);
                }
              }}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
