import { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import AMapLoader from '@amap/amap-jsapi-loader';
import { Utensils, Hotel, Mountain, ShoppingBag, MapPin } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

import { Banknote } from 'lucide-react';

interface MapContainerProps {
  disableFitView?: boolean;
  onMapReady: (map: any, aMap: any) => void;
  markers: any[];
  selectedPoi: any;
  onMarkerClick: (poi: any) => void;
}

export default function MapContainer({ onMapReady, markers, selectedPoi, onMarkerClick, disableFitView }: MapContainerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const aMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const rootsRef = useRef<any[]>([]);
  const { language } = useLanguage();
  const { theme } = useTheme();

  const getMarkerConfig = (type: string = '') => {
    const t = type.toLowerCase();
    // ATM - Special styling
    if (t.includes('atm') || t.includes('bank') || t.includes('银行') || t.includes('取款机')) {
        return { icon: Banknote, color: '#7C3AED', shape: 'rounded-lg', isDiamond: false, size: 20, isAtm: true };
    }
    // Food
    if (t.includes('美食') || t.includes('餐饮') || t.includes('restaurant') || t.includes('food') || t.includes('dining')) {
      return { icon: Utensils, color: '#F59E0B', shape: 'rounded-full', isDiamond: false };
    }
    // Hotel
    if (t.includes('酒店') || t.includes('住宿') || t.includes('hotel') || t.includes('lodging')) {
      return { icon: Hotel, color: '#3B82F6', shape: 'rounded-xl', isDiamond: false };
    }
    // Attraction
    if (t.includes('景点') || t.includes('风景') || t.includes('scenic') || t.includes('attraction') || t.includes('park') || t.includes('tourism') || t.includes('museum')) {
      return { icon: Mountain, color: '#10B981', shape: 'rotate-45 rounded-md', isDiamond: true };
    }
    // Shopping
    if (t.includes('购物') || t.includes('商场') || t.includes('shopping') || t.includes('mall') || t.includes('store')) {
      return { icon: ShoppingBag, color: '#EF4444', shape: 'rounded-lg', isDiamond: false };
    }
    // Default
    return { icon: MapPin, color: theme === 'dark' ? '#1e293b' : '#0f172a', shape: 'rounded-full', borderColor: '#06b6d4', isDiamond: false };
  };

  // Init Map
  useEffect(() => {
    (window as any)._AMapSecurityConfig = {
      securityJsCode: "bd6564dfb8d2ace71997d47d2926c604",
    };

    AMapLoader.load({
      key: "111c8050229fccead3a71df2376ff60a",
      version: "2.0",
      plugins: [
        'AMap.PlaceSearch', 
        'AMap.Driving', 
        'AMap.Transfer',
        'AMap.Walking',
        'AMap.Riding',
        'AMap.Geolocation', 
        'AMap.Marker', 
        'AMap.ToolBar', 
        'AMap.Scale', 
        'AMap.ControlBar',
        'AMap.CitySearch'
      ],
    })
      .then((AMap) => {
        aMapRef.current = AMap;
        if (!mapRef.current) return;

        const map = new AMap.Map(mapRef.current, {
          viewMode: "3D",
          zoom: 13,
          center: [116.397428, 39.90923],
          lang: language === 'zh-CN' ? 'zh_cn' : 'en',
          mapStyle: theme === 'dark' ? 'amap://styles/dark' : 'amap://styles/normal',
        });

        // Add controls
        map.addControl(new AMap.ToolBar({ position: 'RB', offset: [20, 140] }));
        map.addControl(new AMap.Scale());
        map.addControl(new AMap.ControlBar({ position: 'RT' }));
        
        const geolocation = new AMap.Geolocation({
            enableHighAccuracy: true,
            timeout: 10000,
            position: 'RB',
            offset: [20, 80], // Adjust position above ToolBar
            zoomToAccuracy: true,
        });
        map.addControl(geolocation);
        
        // Handle Zoom for Labels
        const handleZoomChange = () => {
          const zoom = map.getZoom();
          if (mapRef.current) {
            if (zoom >= 14) { // Show labels sooner (level 14+)
              mapRef.current.classList.add('show-labels');
            } else {
              mapRef.current.classList.remove('show-labels');
            }
          }
        };
        map.on('zoomchange', handleZoomChange);
        map.on('zoomend', handleZoomChange); // Also check on zoomend
        // Initial check
        handleZoomChange();
        
        mapInstanceRef.current = map;
        onMapReady(map, AMap);
      })
      .catch((e) => {
        console.error("Map load failed", e);
      });

    return () => {
      mapInstanceRef.current?.destroy();
    };
  }, [language]); // Removed theme from dependency to prevent re-init, handled in separate effect

  // Update Map Style when theme changes
  useEffect(() => {
    if (mapInstanceRef.current) {
        mapInstanceRef.current.setMapStyle(theme === 'dark' ? 'amap://styles/dark' : 'amap://styles/normal');
    }
  }, [theme]);

  // Update Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const AMap = aMapRef.current;
    if (!map || !AMap) return;

    // Clear existing markers
    map.remove(markersRef.current);
    markersRef.current = [];
    
    // Cleanup React roots
    rootsRef.current.forEach(root => setTimeout(() => root.unmount(), 0));
    rootsRef.current = [];

    // Add new markers
    markers.forEach((poi) => {
      if (!poi.location) return;
      
      const isSelected = selectedPoi && selectedPoi.id === poi.id;
      const config = getMarkerConfig(poi.type);
      
      const markerContent = document.createElement('div');
      
      // Base classes
      const baseClass = `flex items-center justify-center w-9 h-9 transition-all duration-300 shadow-lg border-2 box-border ${config.shape}`;
      
      // State classes
      const stateClass = isSelected 
        ? 'z-50 scale-125 animate-pulse-slow shadow-[0_0_20px_rgba(255,255,255,0.6)]' 
        : 'opacity-90 hover:opacity-100 hover:scale-110 hover:shadow-xl hover:z-40';
      
      markerContent.className = `${baseClass} ${stateClass}`;
      
      // Apply colors via inline style for precision
      markerContent.style.backgroundColor = config.color;
      markerContent.style.borderColor = isSelected ? '#ffffff' : (config.borderColor || '#ffffff');
      
      // Icon rendering
      const IconComponent = config.icon;
      // Diamond shape needs counter-rotation for the icon
      const innerStyle = config.isDiamond ? 'transform: rotate(-45deg);' : '';
      
      const iconContainer = document.createElement('div');
      iconContainer.style.cssText = `${innerStyle} display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;`;
      
      const root = createRoot(iconContainer);
      root.render(
        <IconComponent 
            size={config.size || 18} 
            color={config.color === '#0f172a' || config.color === '#1e293b' ? '#22d3ee' : '#ffffff'} 
            strokeWidth={2.5} 
        />
      );
      rootsRef.current.push(root);
      
      markerContent.appendChild(iconContainer);

      // Label styling based on theme
      const labelStyle = theme === 'dark'
        ? 'background-color: rgba(30, 41, 59, 0.95); color: #ffffff; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 4px 16px rgba(0,0,0,0.4);'
        : 'background-color: rgba(255, 255, 255, 0.95); color: #1e293b; border: 1px solid rgba(255,255,255,0.8); box-shadow: 0 4px 16px rgba(0,0,0,0.1);';

      const marker = new AMap.Marker({
        position: [poi.location.lng, poi.location.lat],
        content: markerContent,
        offset: new AMap.Pixel(-18, -18),
        zIndex: isSelected ? 100 : 10,
        extData: poi,
        label: {
            content: `<div style="
              display: flex; 
              align-items: center; 
              justify-content: center;
              padding: 6px 14px; 
              border-radius: 20px; 
              font-size: 13px; 
              font-weight: 700; 
              backdrop-filter: blur(8px); 
              white-space: nowrap; 
              margin-bottom: 14px;
              letter-spacing: 0.01em;
              transition: all 0.3s ease;
              ${labelStyle}
            ">${poi.name}</div>`,
            direction: 'top',
            offset: new AMap.Pixel(0, 0),
        }
      });

      marker.on('click', () => {
        onMarkerClick(poi);
      });
      
      marker.setMap(map);
      markersRef.current.push(marker);
    });

    // Fit view if we have multiple markers and no specific selection
    if (markers.length > 0 && !selectedPoi && !disableFitView) {
      map.setFitView(markersRef.current);
    }

  }, [markers, selectedPoi, theme]); // Added theme dependency

  // Handle Selection Focus
    useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedPoi || !selectedPoi.location) return;

    map.setZoomAndCenter(16, [selectedPoi.location.lng, selectedPoi.location.lat]);
    }, [selectedPoi]);

    return (
        <div className="w-full h-full relative bg-white dark:bg-gray-900 transition-colors duration-300">
            <style>{`
                .amap-marker-label {
                    border: none !important;
                    background-color: transparent !important;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
                .show-labels .amap-marker-label {
                    opacity: 1;
                }
                
                /* Dark Mode Map Controls Override */
                html.dark .amap-ctrl-bar,
                html.dark .amap-toolbar-vector,
                html.dark .amap-scale-line,
                html.dark .amap-geolocation-con {
                    filter: invert(0.9) hue-rotate(180deg) !important;
                }
            `}</style>
            <div ref={mapRef} className="w-full h-full" />
        </div>
    );
}
