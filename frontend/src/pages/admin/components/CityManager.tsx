import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../../../contexts/DataContext';
import { Trash2, Plus, MapPin, Navigation, Search, Loader2, Map as MapIcon, Crosshair, Edit2 } from 'lucide-react';
import { City } from '../../../types/data';
import AMapLoader from '@amap/amap-jsapi-loader';

export default function CityManager() {
  const { cities, addCity, updateCity, deleteCity } = useData();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationMode, setLocationMode] = useState<'auto' | 'manual'>('auto');
  const [formData, setFormData] = useState<Partial<City>>({
    name: '',
    nameEn: '',
    nameKo: '',
    lng: 120.38,
    lat: 36.06,
    zoom: 12
  });

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [markerInstance, setMarkerInstance] = useState<any>(null);

  // Initialize Map when adding mode is active
  useEffect(() => {
    if (isAdding && !mapInstance) {
      initMap();
    }
    return () => {
      if (mapInstance) {
        mapInstance.destroy();
        setMapInstance(null);
        setMarkerInstance(null);
      }
    };
  }, [isAdding]);

  // Update map center and marker when formData changes (if not triggered by map event)
  useEffect(() => {
    if (mapInstance && formData.lng && formData.lat) {
      const currentCenter = mapInstance.getCenter();
      // Only update if significantly different to avoid loop
      if (Math.abs(currentCenter.lng - formData.lng) > 0.0001 || Math.abs(currentCenter.lat - formData.lat) > 0.0001) {
        mapInstance.setCenter([formData.lng, formData.lat]);
        if (markerInstance) {
          markerInstance.setPosition([formData.lng, formData.lat]);
        }
      }
      if (formData.zoom && mapInstance.getZoom() !== formData.zoom) {
          mapInstance.setZoom(formData.zoom);
      }
    }
  }, [formData.lng, formData.lat, formData.zoom, mapInstance]);

  const initMap = async () => {
    try {
      (window as any)._AMapSecurityConfig = {
        securityJsCode: "bd6564dfb8d2ace71997d47d2926c604",
      };

      const AMap = await AMapLoader.load({
        key: "111c8050229fccead3a71df2376ff60a",
        version: "2.0",
        plugins: ['AMap.DistrictSearch', 'AMap.Scale', 'AMap.ToolBar']
      });

      if (!mapContainerRef.current) return;

      const map = new AMap.Map(mapContainerRef.current, {
        zoom: formData.zoom || 12,
        center: [formData.lng || 120.38, formData.lat || 36.06],
        viewMode: '2D',
      });

      map.addControl(new AMap.Scale());
      map.addControl(new AMap.ToolBar());

      const marker = new AMap.Marker({
        position: [formData.lng || 120.38, formData.lat || 36.06],
        draggable: true
      });
      map.add(marker);

      // Map Events
      map.on('click', (e: any) => {
        const { lng, lat } = e.lnglat;
        setFormData(prev => ({ ...prev, lng, lat }));
        marker.setPosition([lng, lat]);
        setLocationMode('manual');
      });

      map.on('zoomend', () => {
        setFormData(prev => ({ ...prev, zoom: map.getZoom() }));
      });

      marker.on('dragend', (e: any) => {
        const { lng, lat } = e.lnglat;
        setFormData(prev => ({ ...prev, lng, lat }));
        setLocationMode('manual');
      });

      setMapInstance(map);
      setMarkerInstance(marker);

    } catch (e) {
      console.error('Failed to load map', e);
    }
  };

  const handleAutoLocate = async () => {
    if (!formData.name) {
      alert('请先输入城市名称');
      return;
    }
    
    setIsLocating(true);
    try {
      // Use existing AMap if loaded, or load new
      const AMap = (window as any).AMap || await AMapLoader.load({
        key: "111c8050229fccead3a71df2376ff60a",
        version: "2.0",
        plugins: ['AMap.DistrictSearch']
      });

      const districtSearch = new AMap.DistrictSearch({
        level: 'city',
        subdistrict: 0,
        extensions: 'base'
      });

      districtSearch.search(formData.name, (status: string, result: any) => {
        setIsLocating(false);
        if (status === 'complete' && result.districtList && result.districtList.length > 0) {
          const city = result.districtList[0];
          if (city.center) {
            setFormData(prev => ({
              ...prev,
              lng: city.center.lng,
              lat: city.center.lat,
              zoom: 12 // Default zoom for auto-locate
            }));
            setLocationMode('auto');
            
            if (mapInstance) {
                mapInstance.setZoomAndCenter(12, [city.center.lng, city.center.lat]);
                if (markerInstance) markerInstance.setPosition([city.center.lng, city.center.lat]);
            }
            if (mapContainerRef.current) {
                mapContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          } else {
            alert('获取城市坐标失败，请手动输入');
          }
        } else {
          alert('未找到该城市，请尝试输入完整的城市名称（如：深圳市）');
        }
      });
    } catch (error) {
      console.error('Auto locate failed:', error);
      setIsLocating(false);
      alert('定位服务加载失败，请检查网络');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.lng && formData.lat && formData.zoom) {
      if (editingId) {
        updateCity(editingId, formData);
        setEditingId(null);
      } else {
        addCity(formData as City);
      }
      
      setFormData({
        name: '',
        nameEn: '',
        nameKo: '',
        lng: 120.38,
        lat: 36.06,
        zoom: 12
      });
      setIsAdding(false);
      if (mapInstance) {
        mapInstance.destroy();
        setMapInstance(null);
      }
    }
  };

  const handleEdit = (city: City) => {
    setFormData({
        name: city.name,
        nameEn: city.nameEn,
        nameKo: city.nameKo,
        lng: city.lng,
        lat: city.lat,
        zoom: city.zoom
    });
    setEditingId(city.id);
    setIsAdding(true);
    // Wait for modal to open then init map (effect will handle it)
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-800">城市列表 (v2.1) ({cities.length})</h3>
        <button
          onClick={() => {
            if (isAdding) {
                setIsAdding(false);
                setEditingId(null);
                setFormData({ name: '', nameEn: '', nameKo: '', lng: 120.38, lat: 36.06, zoom: 12 });
            } else {
                setIsAdding(true);
                setEditingId(null);
                setFormData({ name: '', nameEn: '', nameKo: '', lng: 120.38, lat: 36.06, zoom: 12 });
            }
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          {isAdding ? '取消' : '添加城市'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm animate-fade-in">
          <div className="flex justify-between items-center mb-4">
             <h4 className="font-bold text-gray-700">{editingId ? '编辑城市' : '添加新城市'}</h4>
             <div className="flex bg-gray-100 rounded-lg p-1">
                 <button
                    type="button"
                    onClick={() => setLocationMode('auto')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${locationMode === 'auto' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                 >
                    自动定位
                 </button>
                 <button
                    type="button"
                    onClick={() => {
                        setLocationMode('manual');
                        if (mapContainerRef.current) {
                            mapContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    }}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${locationMode === 'manual' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                 >
                    地图选点
                 </button>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">城市名称 (中文)</label>
                <div className="flex gap-2">
                    <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例如：青岛"
                    required
                    />
                    <button
                    type="button"
                    onClick={handleAutoLocate}
                    disabled={isLocating || locationMode === 'manual'}
                    className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1 min-w-[100px] justify-center ${locationMode === 'manual' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                    title="自动获取经纬度"
                    >
                    {isLocating ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                    <span className="text-sm font-medium">自动定位</span>
                    </button>
                </div>
                {locationMode === 'manual' && (
                    <p className="text-xs text-orange-500 mt-1">
                        * 手动模式下，请输入任意名称并在地图上点击选择位置。
                    </p>
                )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">英文名称</label>
                        <input
                            type="text"
                            value={formData.nameEn || ''}
                            onChange={e => setFormData({ ...formData, nameEn: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="例如：Qingdao"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">韩文名称</label>
                        <input
                            type="text"
                            value={formData.nameKo || ''}
                            onChange={e => setFormData({ ...formData, nameKo: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="例如：칭다오"
                        />
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">经度 (Lng)</label>
                        <input
                            type="number"
                            value={formData.lng}
                            onChange={e => setFormData({ ...formData, lng: parseFloat(e.target.value) })}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                            step="0.000001"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">纬度 (Lat)</label>
                        <input
                            type="number"
                            value={formData.lat}
                            onChange={e => setFormData({ ...formData, lat: parseFloat(e.target.value) })}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                            step="0.000001"
                            required
                        />
                    </div>
                </div>

                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">默认缩放级别 (Zoom)</label>
                <div className="flex items-center gap-4">
                    <input
                        type="range"
                        min="3"
                        max="18"
                        step="0.1"
                        value={formData.zoom}
                        onChange={e => setFormData({ ...formData, zoom: parseFloat(e.target.value) })}
                        className="flex-1"
                    />
                    <input
                        type="number"
                        value={formData.zoom}
                        onChange={e => setFormData({ ...formData, zoom: parseFloat(e.target.value) })}
                        className="w-20 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                        step="0.1"
                        required
                    />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                    * 拖动地图缩放可自动更新此数值
                </p>
                </div>

                <div className="pt-4">
            <button
            type="submit"
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-bold shadow-lg shadow-blue-200"
            >
            {editingId ? <Edit2 size={20} /> : <Plus size={20} />}
            {editingId ? '保存城市修改' : '确认添加城市'}
            </button>
          </div>
            </div>

            {/* Map Preview */}
            <div className="h-[300px] md:h-[400px] lg:h-[500px] w-full bg-gray-100 rounded-xl overflow-hidden relative border border-gray-200">
                <div ref={mapContainerRef} className="w-full h-full" />
                {!mapInstance && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50 text-gray-400">
                        <Loader2 className="animate-spin mr-2" />
                        地图加载中...
                    </div>
                )}
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs text-gray-600 shadow-sm z-10">
                    点击地图选取坐标
                </div>
            </div>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cities.map(city => (
          <div key={city.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 group hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                  <MapPin size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-gray-800">{city.name}</h4>
                  <div className="flex flex-col gap-0.5 mt-1">
                    {city.nameEn && <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded w-fit">En: {city.nameEn}</span>}
                    {city.nameKo && <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded w-fit">Ko: {city.nameKo}</span>}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">ID: {city.id}</div>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                    onClick={() => city.id && handleEdit(city)}
                    className="text-gray-400 hover:text-blue-500 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                    title="编辑城市"
                >
                    <Edit2 size={18} />
                </button>
                <button
                    onClick={() => {
                      if (city.id) {
                        if (window.confirm(`确定要删除城市 "${city.name}" 吗？`)) {
                          deleteCity(city.id);
                        }
                      }
                    }}
                    className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors"
                    title="删除城市"
                >
                    <Trash2 size={18} />
                </button>
              </div>
            </div>
            
            <div className="space-y-2 mt-3 text-sm text-gray-600">
              <div className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                <Crosshair size={14} className="text-gray-400" />
                <span className="font-mono text-xs">{city.lng.toFixed(4)}, {city.lat.toFixed(4)}</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                <Search size={14} className="text-gray-400" />
                <span>缩放: {city.zoom}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
