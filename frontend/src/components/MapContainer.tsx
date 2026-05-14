import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import AMapLoader from '@amap/amap-jsapi-loader';
import * as LucideIcons from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useData } from '../contexts/DataContext';

import { Banknote } from 'lucide-react';

import { DEFAULT_CITY, CHINA_OVERVIEW } from '../config/cityConfig';

interface MapContainerProps {
  disableFitView?: boolean;
  onMapReady: (map: any, aMap: any) => void;
  markers: any[];
  selectedPoi: any;
  onMarkerClick: (poi: any) => void;
  onMapClick?: () => void;
}

import { getFullImageUrl } from '../utils/image';

export default function MapContainer({ onMapReady, markers, selectedPoi, onMarkerClick, onMapClick, disableFitView }: MapContainerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const aMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const rootsRef = useRef<any[]>([]);
  const infoWindowRef = useRef<any>(null);
  const prevMarkersRef = useRef<any[]>([]); // Track previous markers to prevent auto-fit on selection change
  const { language } = useLanguage();
  const { theme } = useTheme();
  const { spotCategories, cities } = useData();
  const [isMapReady, setIsMapReady] = useState(false);
  const [showCityDots, setShowCityDots] = useState(false);
  const [showAllLabels, setShowAllLabels] = useState(false);
  const [cityListPanel, setCityListPanel] = useState<{ city: any; pois: any[] } | null>(null);
  const cityFitZoomRef = useRef<number | null>(null);
  const CITY_DOT_ZOOM_THRESHOLD = 11;
  const LABEL_ZOOM_THRESHOLD = 11.01;

  const stringToColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00ffffff).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
  };

  const getMarkerConfig = (type: string = '') => {
    const t = type.toLowerCase();
    
    // ATM - Special styling (keep hardcoded as it's a widget)
    if (t.includes('atm') || t.includes('bank') || t.includes('银行') || t.includes('取款机')) {
        return { icon: Banknote, color: '#7C3AED', shape: 'rounded-lg', isDiamond: false, size: 20, isAtm: true };
    }

    // Transport - Hardcoded support for merged categories
    if (t.includes('rail') || t.includes('高铁')) {
        return { 
            icon: LucideIcons.Train, 
            color: '#8B5CF6', 
            pinGradient: 'radial-gradient(circle at 30% 30%, #a78bfa, #8b5cf6 50%, #5b21b6)',
            rimColor: 'from-violet-400/30',
            shape: 'rounded-lg', 
            isDiamond: false, 
            showPin: true 
        };
    }
    if (t.includes('airport') || t.includes('机场')) {
        return { 
            icon: LucideIcons.Plane, 
            color: '#3B82F6', 
            pinGradient: 'radial-gradient(circle at 30% 30%, #60a5fa, #3b82f6 50%, #1e40af)',
            rimColor: 'from-blue-400/30',
            shape: 'rounded-lg', 
            isDiamond: false, 
            showPin: true 
        };
    }

    // Dynamic Categories
    const matchedCategory = spotCategories?.find(cat => t.includes(cat.key) || t.includes(cat.name.toLowerCase()));
    
    if (matchedCategory) {
        let Icon: any = LucideIcons.MapPin;
        const isUrl = matchedCategory.icon && (matchedCategory.icon.startsWith('http') || matchedCategory.icon.startsWith('/') || matchedCategory.icon.startsWith('data:'));

        if (isUrl) {
            Icon = ({ size, className }: any) => (
                <img 
                    src={getFullImageUrl(matchedCategory.icon)} 
                    alt={matchedCategory.name} 
                    style={{ width: size, height: size, objectFit: 'contain' }}
                    className={className}
                />
            );
        } else {
            Icon = (LucideIcons as any)[matchedCategory.icon] || LucideIcons.MapPin;
        }

        let color = stringToColor(matchedCategory.key);
        let shape = 'rounded-full';
        let isDiamond = false;

        // Keep explicit styling for core categories
        if (matchedCategory.key === 'spot') {
             // User Request: "Red Pin + Floating Icon" style.
             // We return specific flags for the renderer
             // Changing 'spot' category default icon background color from Green to Red (#EF4444)
             return { 
                 icon: Icon, 
                 color: '#EF4444', 
                 pinGradient: 'radial-gradient(circle at 30% 30%, #ff4d4d, #cc0000 50%, #8b0000)',
                 rimColor: 'from-red-400/30',
                 shape: 'rounded-lg', 
                 isDiamond: false, 
                 showPin: true 
             };
        } else if (matchedCategory.key === 'dining') {
             color = '#F59E0B';
             return { 
                 icon: Icon, 
                 color, 
                 pinGradient: 'radial-gradient(circle at 30% 30%, #fcd34d, #f59e0b 50%, #b45309)',
                 rimColor: 'from-amber-400/30',
                 shape: 'rounded-lg', 
                 isDiamond: false, 
                 showPin: true 
             }; // Apply pin style to all
        } else if (matchedCategory.key === 'accommodation') {
             color = '#3B82F6';
             return { 
                 icon: Icon, 
                 color, 
                 pinGradient: 'radial-gradient(circle at 30% 30%, #60a5fa, #3b82f6 50%, #1e40af)',
                 rimColor: 'from-blue-400/30',
                 shape: 'rounded-xl', 
                 isDiamond: false, 
                 showPin: true 
             }; // Apply pin style to all
        } else if (matchedCategory.key === 'shopping') {
             color = '#06B6D4'; // Cyan-500 (A very distinct, bright cyan to stand out completely)
             return { 
                 icon: Icon, 
                 color, 
                 pinGradient: 'radial-gradient(circle at 30% 30%, #67e8f9, #06b6d4 50%, #0891b2)',
                 rimColor: 'from-cyan-400/30',
                 shape: 'rounded-lg', 
                 isDiamond: false, 
                 showPin: true 
             }; // Apply pin style to all
        } else if (matchedCategory.key === 'transport') {
             color = '#10B981'; // Emerald-500
             return { 
                 icon: Icon, 
                 color, 
                 pinGradient: 'radial-gradient(circle at 30% 30%, #34d399, #10b981 50%, #047857)',
                 rimColor: 'from-emerald-400/30',
                 shape: 'rounded-lg', 
                 isDiamond: false, 
                 showPin: true 
             };
        } else if (matchedCategory.key === 'golf') {
             color = '#059669'; // Emerald-600 (Darker Green for Golf)
             return { 
                 icon: Icon, 
                 color, 
                 pinGradient: 'radial-gradient(circle at 30% 30%, #34d399, #059669 50%, #064e3b)',
                 rimColor: 'from-green-400/30',
                 shape: 'rounded-full', 
                 isDiamond: false, 
                 showPin: true 
             };
        }

        // For other dynamic categories, also use pin style if desired, or default
        return { 
            icon: Icon, 
            color, 
            pinGradient: 'radial-gradient(circle at 30% 30%, #94a3b8, #64748b 50%, #475569)', // Default Slate
            rimColor: 'from-slate-400/30',
            shape, 
            isDiamond, 
            showPin: true 
        };
    }

    // Default - Also apply pin style for consistency
    return { 
        icon: LucideIcons.MapPin, 
        color: theme === 'dark' ? '#1e293b' : '#0f172a', 
        pinGradient: 'radial-gradient(circle at 30% 30%, #94a3b8, #64748b 50%, #475569)',
        rimColor: 'from-slate-400/30',
        shape: 'rounded-full', 
        borderColor: '#06b6d4', 
        isDiamond: false, 
        showPin: true 
    };
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
        'AMap.PlaceSearch', // Re-enabled for ATM/Bank search
        'AMap.Geolocation', 
        'AMap.Marker', 
        'AMap.ToolBar', 
        'AMap.Scale', 
      ],
    })
      .then((AMap) => {
        aMapRef.current = AMap;
        if (!mapRef.current) return;

        const map = new AMap.Map(mapRef.current, {
          viewMode: "3D",
          pitch: 0,
          pitchEnable: true,
          zoom: CHINA_OVERVIEW.zoom,
          center: CHINA_OVERVIEW.center,
          lang: language === 'zh-CN' ? 'zh_cn' : 'en',
          mapStyle: theme === 'dark' ? 'amap://styles/dark' : 'amap://styles/normal',
        });

        map.addControl(new AMap.Scale());
        
        const geolocation = new AMap.Geolocation({
            enableHighAccuracy: true,
            timeout: 10000,
            position: 'RB',
            offset: [20, 180], // Adjust position above ToolBar
            zoomToAccuracy: true,
            showButton: false, // Hide the button
        });
        map.addControl(geolocation);
        
        // Handle Zoom for Labels
        const handleZoomChange = () => {
          if (mapRef.current) {
            const currentZoom = map.getZoom();
            // Threshold is 13: if >= 13 show labels, else hide
            if (currentZoom >= 13) {
                mapRef.current.classList.add('show-labels');
            } else {
                mapRef.current.classList.remove('show-labels');
            }
          }
          const z = map.getZoom();
          setShowCityDots(z < CITY_DOT_ZOOM_THRESHOLD);
          if (cityFitZoomRef.current !== null && z < CITY_DOT_ZOOM_THRESHOLD) {
            cityFitZoomRef.current = null;
          }
          const cityFitActive = cityFitZoomRef.current !== null;
          setShowAllLabels(z >= LABEL_ZOOM_THRESHOLD || cityFitActive);
        };
        map.on('zoomchange', handleZoomChange);
        map.on('zoomend', handleZoomChange); // Also check on zoomend
        // Initial check
        handleZoomChange();
        
        // Map Click Handler
        map.on('click', (e: any) => {
            if (onMapClick) {
                onMapClick();
            }
        });

        mapInstanceRef.current = map;
        setIsMapReady(true);
        onMapReady(map, AMap);
      })
      .catch((e) => {
        console.error("Map load failed", e);
      });

    return () => {
      mapInstanceRef.current?.destroy();
    };
  }, [language]); // Removed theme from dependency to prevent re-init, handled in separate effect

  // Expose search method to parent via ref or context? 
  // Actually, MainLayout doesn't have access to map instance directly easily unless we pass it up.
  // We passed `onMapReady` so MainLayout has `mapInstance`.
  // MainLayout should implement the search logic using `AMap.PlaceSearch`.


  // Update Map Style when theme changes
  useEffect(() => {
    if (mapInstanceRef.current) {
        mapInstanceRef.current.setMapStyle(theme === 'dark' ? 'amap://styles/dark' : 'amap://styles/normal');
    }
  }, [theme]);

  const openCityPoiList = (AMap: any, map: any, city: any, list: any[]) => {
    if (infoWindowRef.current) {
      try { infoWindowRef.current.close(); } catch {}
    }
    // Disable map gestures while the city list popup is open so finger drag inside the list doesn't pan the map.
    try {
      map.setStatus({
        dragEnable: false,
        zoomEnable: false,
        doubleClickZoom: false,
        keyboardEnable: false,
        scrollWheel: false,
        touchZoom: false,
      });
    } catch {}
    const container = document.createElement('div');
    container.style.cssText = 'width:300px;max-height:360px;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 12px 32px rgba(0,0,0,0.18);';
    const header = document.createElement('div');
    header.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:linear-gradient(135deg,#3b82f6,#2563eb);color:#fff;';
    header.innerHTML = `
      <div style="font-size:14px;font-weight:700;">${city.nameKo || city.name} <span style="opacity:0.85;font-size:12px;font-weight:500;">· ${list.length}个地点</span></div>
      <div id="city-list-close" style="cursor:pointer;width:24px;height:24px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.18);font-size:14px;line-height:1;">✕</div>
    `;
    const scroller = document.createElement('div');
    scroller.style.cssText = 'max-height:300px;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;touch-action:pan-y;';
    // Stop AMap from hijacking wheel/touch scroll. Use capture phase so we run BEFORE AMap's listeners on the map container.
    const stop = (e: Event) => { e.stopPropagation(); (e as any).stopImmediatePropagation?.(); };
    scroller.addEventListener('wheel', stop, { passive: true, capture: true });
    scroller.addEventListener('mousewheel', stop as any, { passive: true, capture: true } as any);
    scroller.addEventListener('DOMMouseScroll', stop as any, { capture: true } as any);
    scroller.addEventListener('touchstart', stop, { passive: true, capture: true });
    scroller.addEventListener('touchmove', stop, { passive: true, capture: true });
    scroller.addEventListener('touchend', stop, { passive: true, capture: true });
    scroller.addEventListener('pointerdown', stop, { capture: true });
    scroller.addEventListener('pointermove', stop, { capture: true });
    // Also stop on the container so the header doesn't drag the map either
    container.style.touchAction = 'none';
    container.addEventListener('touchstart', (e) => { e.stopPropagation(); }, { passive: true, capture: true });
    container.addEventListener('touchmove', (e) => { e.stopPropagation(); }, { passive: true, capture: true });
    container.addEventListener('pointerdown', (e) => { e.stopPropagation(); }, { capture: true });

    list.forEach((p: any) => {
      let cover = '';
      try {
        const raw = p?.photos || p?.images;
        if (raw) {
          const arr = typeof raw === 'string' ? JSON.parse(raw) : raw;
          if (Array.isArray(arr) && arr.length > 0) {
            cover = typeof arr[0] === 'string' ? arr[0] : (arr[0]?.url || '');
          }
        }
      } catch {}
      if (cover) cover = getFullImageUrl(cover);
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:10px;padding:10px 14px;cursor:pointer;border-bottom:1px solid #f1f5f9;transition:background 0.15s;';
      row.onmouseover = () => { row.style.background = '#f8fafc'; };
      row.onmouseout = () => { row.style.background = '#fff'; };
      row.innerHTML = `
        <div style="width:40px;height:40px;border-radius:8px;flex-shrink:0;${cover ? `background:#e5e7eb url('${cover}') center/cover no-repeat;` : 'background:#dbeafe;display:flex;align-items:center;justify-content:center;color:#3b82f6;font-weight:700;font-size:11px;'}">${cover ? '' : '📍'}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:13px;font-weight:600;color:#1e293b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${(p.name || '').replace(/</g, '&lt;')}</div>
        </div>
      `;
      row.addEventListener('click', (e) => {
        e.stopPropagation();
        try { infoWindowRef.current?.close(); } catch {}
        onMarkerClick(p);
      });
      scroller.appendChild(row);
    });

    container.appendChild(header);
    container.appendChild(scroller);

    const infoWindow = new AMap.InfoWindow({
      content: container,
      // Popup anchor is bottom-center; positive Y pushes anchor down so the panel renders BELOW the marker.
      // popup max height ≈ 360px (header + scroller) + ~36px gap → 396
      offset: new AMap.Pixel(0, 396),
      isCustom: true,
      autoMove: true,
      closeWhenClickMap: true,
    });
    infoWindow.open(map, [city.lng, city.lat]);
    infoWindowRef.current = infoWindow;

    const restoreGestures = () => {
      try {
        map.setStatus({
          dragEnable: true,
          zoomEnable: true,
          doubleClickZoom: true,
          keyboardEnable: true,
          scrollWheel: true,
          touchZoom: true,
        });
      } catch {}
    };
    infoWindow.on('close', restoreGestures);

    const closeBtn = header.querySelector('#city-list-close') as HTMLElement | null;
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        try { infoWindow.close(); } catch {}
        restoreGestures();
      });
    }
  };

  // Update Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const AMap = aMapRef.current;
    if (!map || !AMap) return;

    // Close any open city info window before re-rendering
    if (infoWindowRef.current) {
      try { infoWindowRef.current.close(); } catch {}
      infoWindowRef.current = null;
      try { map.setStatus({ dragEnable: true, zoomEnable: true, doubleClickZoom: true, keyboardEnable: true, scrollWheel: true, touchZoom: true }); } catch {}
    }

    // Clear existing markers
    map.remove(markersRef.current);
    markersRef.current = [];
    
    // Cleanup React roots
    rootsRef.current.forEach(root => setTimeout(() => root.unmount(), 0));
    rootsRef.current = [];

    // Low-zoom (Naver-style city clusters): square cover + count + city name
    if (showCityDots && cities && cities.length > 0) {
      const allPois = markers.filter(p => p.isActive !== false && p.location);
      const cityCounts: Record<string, number> = {};
      const cityPois: Record<string, any[]> = {};
      const cityCover: Record<string, string> = {};

      const extractCover = (p: any): string => {
        try {
          const raw = p?.photos || p?.images;
          if (!raw) return '';
          const arr = typeof raw === 'string' ? JSON.parse(raw) : raw;
          if (Array.isArray(arr) && arr.length > 0) {
            const first = arr[0];
            return typeof first === 'string' ? first : (first?.url || '');
          }
        } catch {}
        return '';
      };

      allPois.forEach((p: any) => {
        let cityKey = p.city || p.cityName;
        if (!cityKey && typeof p.location?.lng === 'number') {
          let nearest = '';
          let minD = Infinity;
          cities.forEach((c: any) => {
            if (typeof c.lng !== 'number') return;
            const d = Math.pow(c.lng - p.location.lng, 2) + Math.pow(c.lat - p.location.lat, 2);
            if (d < minD) { minD = d; nearest = c.name; }
          });
          cityKey = nearest;
        }
        if (!cityKey) return;
        cityCounts[cityKey] = (cityCounts[cityKey] || 0) + 1;
        (cityPois[cityKey] = cityPois[cityKey] || []).push(p);
        if (!cityCover[cityKey]) {
          const cv = extractCover(p);
          if (cv) cityCover[cityKey] = getFullImageUrl(cv);
        }
      });

      cities.forEach((city: any) => {
        if (typeof city.lng !== 'number' || typeof city.lat !== 'number') return;
        const count = cityCounts[city.name] || 0;
        const cityCustomCover = city.coverImage ? getFullImageUrl(city.coverImage) : '';
        const cover = cityCustomCover || cityCover[city.name] || '';
        const wrap = document.createElement('div');
        wrap.style.cssText = 'display:inline-flex;align-items:center;gap:8px;cursor:pointer;transform:translate(-22px,-22px);';
        const coverBg = cover
          ? `background:#e5e7eb url('${cover}') center/cover no-repeat;`
          : 'background:linear-gradient(135deg,#60a5fa,#3b82f6);';
        wrap.innerHTML = `
          <div style="position:relative;width:44px;height:44px;border-radius:10px;border:2.5px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,0.25),0 0 0 1px rgba(0,0,0,0.06);${coverBg}">
            <span style="position:absolute;top:-6px;right:-6px;min-width:22px;height:22px;padding:0 6px;border-radius:9999px;background:#10b981;color:#fff;font-size:11px;font-weight:800;display:inline-flex;align-items:center;justify-content:center;border:1.5px solid #fff;box-shadow:0 2px 4px rgba(0,0,0,0.2);">${count > 99 ? '99+' : count}</span>
          </div>
          <div style="padding:5px 11px;border-radius:9999px;background:#fff;color:#1e293b;font-size:13px;font-weight:700;white-space:nowrap;box-shadow:0 4px 12px rgba(0,0,0,0.18),0 0 0 1px rgba(0,0,0,0.06);">${city.nameKo || city.name}</div>
        `;
        wrap.addEventListener('click', (e) => {
          e.stopPropagation();
          const list = cityPois[city.name] || [];
          if (list.length === 0) {
            map.setZoomAndCenter(city.zoom || 12, [city.lng, city.lat]);
            return;
          }
          // Fit map to the bounds of POIs that are realistically near the city center,
          // filtering out outliers caused by bad geocodes / wrong city mapping.
          const MAX_DEG = 0.5; // ~50km radius from city center
          let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;
          list.forEach((p: any) => {
            const lng = p.location?.lng, lat = p.location?.lat;
            if (typeof lng !== 'number' || typeof lat !== 'number') return;
            if (Math.abs(lng - city.lng) > MAX_DEG || Math.abs(lat - city.lat) > MAX_DEG) return;
            if (lng < minLng) minLng = lng;
            if (lng > maxLng) maxLng = lng;
            if (lat < minLat) minLat = lat;
            if (lat > maxLat) maxLat = lat;
          });
          if (isFinite(minLng) && isFinite(minLat)) {
            try {
              const padLng = ((maxLng - minLng) || 0.02) * 0.25;
              const padLat = ((maxLat - minLat) || 0.02) * 0.25;
              const bounds = new AMap.Bounds(
                [minLng - padLng, minLat - padLat],
                [maxLng + padLng, maxLat + padLat]
              );
              map.setBounds(bounds, true, [120, 80, 200, 80]);
              if (map.getZoom() < CITY_DOT_ZOOM_THRESHOLD) {
                map.setZoomAndCenter(
                  CITY_DOT_ZOOM_THRESHOLD,
                  [(minLng + maxLng) / 2, (minLat + maxLat) / 2]
                );
              }
              cityFitZoomRef.current = map.getZoom();
              setShowAllLabels(true);
            } catch {
              map.setZoomAndCenter(Math.max(city.zoom || 12, CITY_DOT_ZOOM_THRESHOLD), [city.lng, city.lat]);
            }
          } else {
            map.setZoomAndCenter(Math.max(city.zoom || 12, CITY_DOT_ZOOM_THRESHOLD), [city.lng, city.lat]);
          }
        });
        const marker = new AMap.Marker({
          position: [city.lng, city.lat],
          content: wrap,
          offset: new AMap.Pixel(0, 0),
          clickable: true,
          bubble: false,
          zIndex: 200,
        });
        marker.setMap(map);
        markersRef.current.push(marker);
      });
      return;
    }

    // Add new markers
    // User Request: Always show all markers, do not hide others when one is selected
    // Filter out inactive items just to be absolutely safe (though MainLayout should have done it)
    const displayMarkers = markers.filter(poi => poi.isActive !== false);

    // Spread overlapping markers (Option B): detect markers within ~30m and arrange in a circle
    const OVERLAP_THRESHOLD = 0.0003; // ~30 meters in degrees
    const SPREAD_RADIUS = 0.00035;    // spread radius, ~35 meters
    const adjustedPositions = displayMarkers.map(poi => ({
      lng: poi.location?.lng ?? 0,
      lat: poi.location?.lat ?? 0,
    }));
    const processed = new Set<number>();
    for (let i = 0; i < displayMarkers.length; i++) {
      if (processed.has(i) || !displayMarkers[i].location) continue;
      const group = [i];
      for (let j = i + 1; j < displayMarkers.length; j++) {
        if (processed.has(j) || !displayMarkers[j].location) continue;
        const dx = Math.abs(adjustedPositions[i].lng - adjustedPositions[j].lng);
        const dy = Math.abs(adjustedPositions[i].lat - adjustedPositions[j].lat);
        if (dx < OVERLAP_THRESHOLD && dy < OVERLAP_THRESHOLD) {
          group.push(j);
        }
      }
      if (group.length > 1) {
        const centerLng = adjustedPositions[i].lng;
        const centerLat = adjustedPositions[i].lat;
        group.forEach((idx, k) => {
          const angle = (2 * Math.PI * k) / group.length - Math.PI / 2;
          adjustedPositions[idx] = {
            lng: centerLng + SPREAD_RADIUS * Math.cos(angle),
            lat: centerLat + SPREAD_RADIUS * Math.sin(angle),
          };
          processed.add(idx);
        });
      }
    }

    displayMarkers.forEach((poi, index) => {
      if (!poi.location) return;

      const isSelected = selectedPoi && selectedPoi.id === poi.id;
      const config = getMarkerConfig(poi.type);
      
      const markerContent = document.createElement('div');
      
      // Base classes
      const baseClass = `flex items-center justify-center w-10 h-10 transition-all duration-300 shadow-lg border-[2.5px] box-border ${config.shape} marker-pop-in`;
      
      // State classes
      // User Request: Make markers "obvious" and "highlighted" - Increased brightness and pulse
      const stateClass = isSelected 
        ? 'z-50 scale-125 marker-flash shadow-[0_0_30px_rgba(255,255,255,0.95)] ring-4 ring-offset-2 ring-blue-500 border-white bg-opacity-100' 
        : 'opacity-100 hover:scale-110 hover:shadow-xl hover:z-40';
      
      // Icon rendering
      const IconComponent = config.icon;
      // Diamond shape needs counter-rotation for the icon
      const innerStyle = config.isDiamond ? 'transform: rotate(-45deg);' : '';
      
      const iconContainer = document.createElement('div');
      iconContainer.style.cssText = `${innerStyle} display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;`;
      
      const root = createRoot(iconContainer);
      
      if (config.showPin) {
          // Naver-style: square cover-image marker with arrow tail at the bottom
          markerContent.className = '';
          markerContent.style.backgroundColor = 'transparent';
          markerContent.style.border = 'none';
          markerContent.style.boxShadow = 'none';
          markerContent.style.width = '0px';
          markerContent.style.height = '0px';
          markerContent.style.overflow = 'visible';

          // Parse first photo from JSON string field
          let coverUrl = '';
          try {
            const raw = (poi as any).photos || (poi as any).images;
            if (raw) {
              if (typeof raw === 'string') {
                const arr = JSON.parse(raw);
                if (Array.isArray(arr) && arr.length > 0) {
                  coverUrl = typeof arr[0] === 'string' ? arr[0] : (arr[0]?.url || '');
                }
              } else if (Array.isArray(raw) && raw.length > 0) {
                coverUrl = typeof raw[0] === 'string' ? raw[0] : (raw[0]?.url || '');
              }
            }
          } catch {}
          if (coverUrl) coverUrl = getFullImageUrl(coverUrl);

          const size = isSelected ? 56 : 44;
          const borderColor = isSelected ? '#3b82f6' : '#ffffff';
          const borderWidth = isSelected ? 3 : 2.5;

          root.render(
            <div
              className="relative transition-all duration-200"
              style={{
                width: 0,
                height: 0,
                pointerEvents: 'auto',
              }}
            >
              {/* Square cover marker, anchored so its bottom tip sits at (0,0) */}
              <div
                style={{
                  position: 'absolute',
                  left: -size / 2,
                  top: -(size + 6),
                  width: size,
                  height: size,
                  borderRadius: 10,
                  background: coverUrl ? `#e5e7eb url("${coverUrl}") center/cover no-repeat` : config.color,
                  border: `${borderWidth}px solid ${borderColor}`,
                  boxShadow: isSelected
                    ? '0 6px 18px rgba(59,130,246,0.45), 0 0 0 1px rgba(0,0,0,0.08)'
                    : '0 4px 12px rgba(0,0,0,0.28), 0 0 0 1px rgba(0,0,0,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2,
                }}
              >
                {!coverUrl && (
                  <IconComponent size={size * 0.5} color="#ffffff" strokeWidth={2.5} />
                )}
              </div>
              {/* Bottom arrow tail */}
              <div
                style={{
                  position: 'absolute',
                  left: -6,
                  top: -7,
                  width: 0,
                  height: 0,
                  borderLeft: '6px solid transparent',
                  borderRight: '6px solid transparent',
                  borderTop: `7px solid ${borderColor}`,
                  zIndex: 1,
                  filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.2))',
                }}
              />
              {/* Name label above — shown when selected or when zoomed in enough */}
              {(isSelected || showAllLabels) && (
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: -(size + 36),
                    transform: 'translateX(-50%)',
                    padding: '4px 10px',
                    borderRadius: 9999,
                    background: '#fff',
                    color: '#1e293b',
                    fontSize: 12,
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                    border: isSelected ? '1.5px solid #3b82f6' : '1px solid rgba(0,0,0,0.08)',
                    pointerEvents: 'none',
                    zIndex: 3,
                  }}
                >
                  {poi.name}
                </div>
              )}
            </div>
          );
      } else {
          // Standard Marker Layout
          markerContent.className = `${baseClass} ${stateClass} scale-[0.90] origin-bottom`;
          // Apply colors via inline style for precision
          markerContent.style.backgroundColor = config.color;
          markerContent.style.borderColor = isSelected ? '#ffffff' : (config.borderColor || '#ffffff');
          
          root.render(
            <IconComponent 
                size={config.size || 18} 
                color={config.color === '#0f172a' || config.color === '#1e293b' ? '#22d3ee' : '#ffffff'} 
                strokeWidth={2.5} 
            />
          );
      }
      
      rootsRef.current.push(root);
      
      // CRITICAL FIX: Always append the React container to the AMap marker element
      markerContent.appendChild(iconContainer);

      // Custom Touch/Click Handling for better Mobile responsiveness
      let touchStartTime = 0;
      let touchStartPos = { x: 0, y: 0 };

      const handleTouchStart = (e: TouchEvent) => {
          touchStartTime = Date.now();
          touchStartPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      };

      const handleTouchEnd = (e: TouchEvent) => {
          const touchEndTime = Date.now();
          const touchEndPos = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
          
          const timeDiff = touchEndTime - touchStartTime;
          const distDiff = Math.sqrt(Math.pow(touchEndPos.x - touchStartPos.x, 2) + Math.pow(touchEndPos.y - touchStartPos.y, 2));
          
          // Lenient tap detection: <500ms and <20px movement (allows for slight finger jitter)
          if (timeDiff < 500 && distDiff < 20) {
              e.preventDefault(); // Prevent ghost mouse click
              e.stopPropagation(); // Prevent map click bubbling
              onMarkerClick(poi);
          }
      };

      const handleClick = (e: MouseEvent) => {
          e.stopPropagation(); // Stop map click bubbling
          onMarkerClick(poi);
      };

      markerContent.addEventListener('touchstart', handleTouchStart, { passive: true });
      markerContent.addEventListener('touchend', handleTouchEnd);
      markerContent.addEventListener('click', handleClick);

      const labelStyle = theme === 'dark'
        ? 'background-color: rgba(30, 41, 59, 0.95); color: #ffffff; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 4px 16px rgba(0,0,0,0.4);'
        : 'background-color: rgba(255, 255, 255, 0.95); color: #1e293b; border: 1px solid rgba(255,255,255,0.8); box-shadow: 0 4px 16px rgba(0,0,0,0.1);';

      const marker = new AMap.Marker({
        position: [adjustedPositions[index].lng, adjustedPositions[index].lat],
        content: markerContent,
        offset: config.showPin ? new AMap.Pixel(0, 0) : new AMap.Pixel(-18, -18),
        zIndex: isSelected ? 999 : (100 + index), // Increased base z-index and ensure selected is always top. Using index to stabilize stacking.
        extData: poi,
        clickable: true, // Explicitly enable click
        topWhenClick: true, // Bring to top on click
        bubble: false, // Prevent event bubbling issues
        // Label is now rendered INSIDE the markerContent for 'showPin' style
        // We only need AMap label for standard markers
        // CRITICAL FIX: Explicitly set label to null object when showPin is true to prevent double rendering/ghosting
        // Using undefined might not be enough if AMap defaults kick in or if reusing instances (though we new() here)
        // We force it to be empty.
        label: !config.showPin ? {
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
              pointer-events: none;
            ">${poi.name}</div>`,
            direction: 'top',
            offset: new AMap.Pixel(0, 0),
        } : { content: '', offset: new AMap.Pixel(0, 0) } // Explicit empty string content to overwrite any default
      });

      marker.on('click', () => {
        // Redundant with custom handler but kept for safety in non-DOM scenarios
        // onMarkerClick(poi);
      });
      
      marker.setMap(map);
      markersRef.current.push(marker);
    });

    // Fit view logic: Only auto-fit when markers change, NOT when selectedPoi changes (e.g. closing detail view)
    // We check if markers reference has changed. MainLayout state ensures markers stay same reference if only selection changes.
    // User Update: Also disable auto-fit when closing drawers (markers count might change from filtered to all, but user wants to keep view)
    // To solve this robustly: We DISABLE auto-fit here completely for updates.
    // The "Controller" (MainLayout) is responsible for setting the view explicitly when:
    // 1. Searching (zoom to results)
    // 2. Changing City (zoom to city)
    // 3. Selecting a POI (zoom to POI)
    // 4. Initial Load (zoom to city)
    
    // So we comment out the reactive auto-fit.
    
    // const markersChanged = markers !== prevMarkersRef.current;
    
    // if ((markersChanged) && markers.length > 0 && !selectedPoi && !disableFitView) {
    //   // Use a small timeout to ensure map is ready and avoid conflicts with other movements
    //       setTimeout(() => {
    //           // User Request: Zoom out slightly (maxZoom: 10) and use larger padding for UI elements
    //           // Padding: [top, right, bottom, left] - larger bottom for panel, top for search
    //           // User Request: Ensure markers are not covered by bottom drawer (which is 66vh)
    //           const bottomPadding = window.innerHeight * 0.67; // Slightly more than 66vh
    //           if (mapInstanceRef.current) {
    //               mapInstanceRef.current.setFitView(markersRef.current, false, [120, 50, bottomPadding, 50]); 
    //           }
    //       }, 300);
    //   }
    
      
    prevMarkersRef.current = markers;

  }, [markers, selectedPoi, theme, isMapReady, showCityDots, showAllLabels, cities]);

  // Handle Selection Focus
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedPoi || !selectedPoi.location) return;

    map.setZoomAndCenter(15, [selectedPoi.location.lng, selectedPoi.location.lat]);
    
    // Note: MainLayout might apply a pan offset for the bottom sheet.
    // We leave that responsibility to the layout controller or handle it here if needed.
    // For now, centering is the primary request.
  }, [selectedPoi]);

    return (
        <div className="w-full h-full relative bg-white dark:bg-gray-900 transition-colors duration-300">
            {/* Custom Zoom Controls */}
            {/* Zoom +/- buttons removed from here, now in MainLayout */}

            <style>{`
                /* Hide AMap default labels by default to prevent ghosting */
                .amap-marker-label {
                    border: none !important;
                    background-color: transparent !important;
                    opacity: 0 !important;
                    font-size: 0 !important;
                    padding: 0 !important;
                    width: 0 !important;
                    height: 0 !important;
                    overflow: hidden !important;
                    pointer-events: none !important;
                    visibility: hidden !important;
                }

                /* Dark Mode Map Controls Override */
                html.dark .amap-ctrl-bar,
                html.dark .amap-toolbar-vector,
                html.dark .amap-scale-line,
                html.dark .amap-geolocation-con {
                    filter: invert(0.9) hue-rotate(180deg) !important;
                }
                
                @keyframes markerPopIn {
                    0% { opacity: 0; transform: scale(0.5); }
                    100% { opacity: 1; transform: scale(1); }
                }
                .marker-pop-in {
                    animation: markerPopIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }
            `}</style>
            <div ref={mapRef} className="w-full h-full" />
        </div>
    );
}
