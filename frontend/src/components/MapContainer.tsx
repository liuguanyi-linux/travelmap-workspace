import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import * as LucideIcons from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useData } from '../contexts/DataContext';
import { Banknote } from 'lucide-react';
import { CHINA_OVERVIEW } from '../config/cityConfig';
import { gcj02ToWgs84 } from '../utils/coordTransform';
import { getFullImageUrl } from '../utils/image';

interface MapContainerProps {
  disableFitView?: boolean;
  onMapReady: (map: any, google: any) => void;
  markers: any[];
  selectedPoi: any;
  onMarkerClick: (poi: any) => void;
  onMapClick?: () => void;
}

const GOOGLE_MAPS_API_KEY = 'AIzaSyC6GUFKs-UsbnfqoZHwL519wiP1HRSl2DU';

const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#263c3f' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#6b9a76' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#746855' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1f2835' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#f3d19c' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2f3948' }] },
  { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#515c6d' }] },
  { featureType: 'water', elementType: 'labels.text.stroke', stylers: [{ color: '#17263c' }] },
];

export default function MapContainer({ onMapReady, markers, selectedPoi, onMarkerClick, onMapClick, disableFitView }: MapContainerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const googleRef = useRef<any>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const rootsRef = useRef<any[]>([]);
  const { language } = useLanguage();
  const { theme } = useTheme();
  const { spotCategories } = useData();
  const [isMapReady, setIsMapReady] = useState(false);

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

    if (t.includes('atm') || t.includes('bank') || t.includes('银行') || t.includes('取款机')) {
        return { icon: Banknote, color: '#7C3AED', shape: 'rounded-lg', isDiamond: false, size: 20, isAtm: true };
    }

    if (t.includes('rail') || t.includes('高铁')) {
        return { icon: LucideIcons.Train, color: '#8B5CF6', pinGradient: 'radial-gradient(circle at 30% 30%, #a78bfa, #8b5cf6 50%, #5b21b6)', rimColor: 'from-violet-400/30', shape: 'rounded-lg', isDiamond: false, showPin: true };
    }
    if (t.includes('airport') || t.includes('机场')) {
        return { icon: LucideIcons.Plane, color: '#3B82F6', pinGradient: 'radial-gradient(circle at 30% 30%, #60a5fa, #3b82f6 50%, #1e40af)', rimColor: 'from-blue-400/30', shape: 'rounded-lg', isDiamond: false, showPin: true };
    }

    const matchedCategory = spotCategories?.find(cat => t.includes(cat.key) || t.includes(cat.name.toLowerCase()));

    if (matchedCategory) {
        let Icon: any = LucideIcons.MapPin;
        const isUrl = matchedCategory.icon && (matchedCategory.icon.startsWith('http') || matchedCategory.icon.startsWith('/') || matchedCategory.icon.startsWith('data:'));

        if (isUrl) {
            Icon = ({ size, className }: any) => (
                <img src={getFullImageUrl(matchedCategory.icon)} alt={matchedCategory.name} style={{ width: size, height: size, objectFit: 'contain' }} className={className} />
            );
        } else {
            Icon = (LucideIcons as any)[matchedCategory.icon] || LucideIcons.MapPin;
        }

        let color = stringToColor(matchedCategory.key);

        if (matchedCategory.key === 'spot') {
             return { icon: Icon, color: '#EF4444', pinGradient: 'radial-gradient(circle at 30% 30%, #ff4d4d, #cc0000 50%, #8b0000)', rimColor: 'from-red-400/30', shape: 'rounded-lg', isDiamond: false, showPin: true };
        } else if (matchedCategory.key === 'dining') {
             return { icon: Icon, color: '#F59E0B', pinGradient: 'radial-gradient(circle at 30% 30%, #fcd34d, #f59e0b 50%, #b45309)', rimColor: 'from-amber-400/30', shape: 'rounded-lg', isDiamond: false, showPin: true };
        } else if (matchedCategory.key === 'accommodation') {
             return { icon: Icon, color: '#3B82F6', pinGradient: 'radial-gradient(circle at 30% 30%, #60a5fa, #3b82f6 50%, #1e40af)', rimColor: 'from-blue-400/30', shape: 'rounded-xl', isDiamond: false, showPin: true };
        } else if (matchedCategory.key === 'shopping') {
             return { icon: Icon, color: '#06B6D4', pinGradient: 'radial-gradient(circle at 30% 30%, #67e8f9, #06b6d4 50%, #0891b2)', rimColor: 'from-cyan-400/30', shape: 'rounded-lg', isDiamond: false, showPin: true };
        } else if (matchedCategory.key === 'transport') {
             return { icon: Icon, color: '#10B981', pinGradient: 'radial-gradient(circle at 30% 30%, #34d399, #10b981 50%, #047857)', rimColor: 'from-emerald-400/30', shape: 'rounded-lg', isDiamond: false, showPin: true };
        } else if (matchedCategory.key === 'golf') {
             return { icon: Icon, color: '#059669', pinGradient: 'radial-gradient(circle at 30% 30%, #34d399, #059669 50%, #064e3b)', rimColor: 'from-green-400/30', shape: 'rounded-full', isDiamond: false, showPin: true };
        }

        return { icon: Icon, color, pinGradient: 'radial-gradient(circle at 30% 30%, #94a3b8, #64748b 50%, #475569)', rimColor: 'from-slate-400/30', shape: 'rounded-full', isDiamond: false, showPin: true };
    }

    return { icon: LucideIcons.MapPin, color: theme === 'dark' ? '#1e293b' : '#0f172a', pinGradient: 'radial-gradient(circle at 30% 30%, #94a3b8, #64748b 50%, #475569)', rimColor: 'from-slate-400/30', shape: 'rounded-full', borderColor: '#06b6d4', isDiamond: false, showPin: true };
  };

  // Init Google Map
  useEffect(() => {
    const initMap = async () => {
      try {
        setOptions({ key: GOOGLE_MAPS_API_KEY, v: 'weekly' });
        const { Map } = await importLibrary('maps') as google.maps.MapsLibrary;
        await importLibrary('marker');

        googleRef.current = google;
        if (!mapRef.current) return;

        // Preserve current view when recreating (e.g. theme switch)
        const prevMap = mapInstanceRef.current;
        const prevCenter = prevMap?.getCenter();
        const prevZoom = prevMap?.getZoom();

        const [wgsLng, wgsLat] = gcj02ToWgs84(CHINA_OVERVIEW.center[0], CHINA_OVERVIEW.center[1]);

        const map = new Map(mapRef.current, {
          center: prevCenter || { lat: wgsLat, lng: wgsLng },
          zoom: prevZoom || CHINA_OVERVIEW.zoom,
          mapId: '682cec3feef6afbdefc43eff',
          colorScheme: theme === 'dark' ? 'DARK' : 'LIGHT',
          disableDefaultUI: true,
          zoomControl: false,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          gestureHandling: 'greedy',
        });

        map.addListener('click', () => {
          if (onMapClick) onMapClick();
        });

        map.addListener('zoom_changed', () => {
          const z = map.getZoom() || 0;
          if (mapRef.current) {
            if (z >= 13) {
              mapRef.current.classList.add('show-labels');
            } else {
              mapRef.current.classList.remove('show-labels');
            }
          }
        });

        mapInstanceRef.current = map;
        setIsMapReady(true);
        onMapReady(map, google);
      } catch (e) {
        console.error('Google Maps load failed', e);
      }
    };

    initMap();

    return () => {
      markersRef.current.forEach(m => m.map = null);
      markersRef.current = [];
    };
  }, [language, theme]);

  // Update Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const google = googleRef.current;
    if (!map || !google) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.map = null);
    markersRef.current = [];
    rootsRef.current.forEach(root => setTimeout(() => root.unmount(), 0));
    rootsRef.current = [];

    const displayMarkers = markers.filter(poi => poi.isActive !== false);

    // Spread overlapping markers
    const OVERLAP_THRESHOLD = 0.0003;
    const SPREAD_RADIUS = 0.00035;
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

      // Convert GCJ-02 to WGS-84 (skip for markers already in WGS-84, e.g. from Google Places)
      const [wgsLng, wgsLat] = poi.isWgs84
        ? [adjustedPositions[index].lng, adjustedPositions[index].lat]
        : gcj02ToWgs84(adjustedPositions[index].lng, adjustedPositions[index].lat);

      // Create marker content element
      const markerContent = document.createElement('div');
      markerContent.style.cursor = 'pointer';

      const iconContainer = document.createElement('div');
      const root = createRoot(iconContainer);
      const IconComponent = config.icon;

      if (config.showPin) {
        root.render(
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${isSelected ? 1.1 : 0.9})`, transformOrigin: 'bottom center', transition: 'transform 0.3s', zIndex: isSelected ? 50 : 40 }}>
            <div className="marker-label whitespace-nowrap pointer-events-none" style={{ marginBottom: '4px', zIndex: 9999 }}>
              <div className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 shadow-md text-[13px] font-bold text-slate-800 dark:text-white border-[1.5px] border-blue-500">
                {poi.name}
              </div>
            </div>
            <div className={`flex items-center justify-center w-[38.4px] h-[38.4px] shadow-[0_6.4px_16px_rgba(0,0,0,0.25),0_0_0_0.8px_rgba(0,0,0,0.1)] border-[2.4px] border-white box-border rounded-[9.6px]
              ${isSelected
                ? 'ring-[3.2px] ring-offset-[1.6px] ring-blue-500 shadow-[0_0_28px_rgba(59,130,246,0.5)] scale-110 brightness-110'
                : 'hover:scale-110 hover:shadow-[0_0_16px_rgba(255,255,255,0.8),0_0_0_1.6px_rgba(0,0,0,0.2)] brightness-105 shadow-[0_6.4px_16px_rgba(0,0,0,0.25),0_0_0_1.6px_#ef4444]'
              }`}
              style={{ backgroundColor: config.color }}>
              <IconComponent size={20.8} color="#ffffff" strokeWidth={2.5} />
            </div>
            <div style={{ width: '4px', height: '25.6px', background: 'linear-gradient(90deg, #6b7280, #f3f4f6 40%, #f3f4f6 60%, #6b7280)', marginTop: '-1px', boxShadow: '0 1.5px 3px rgba(0,0,0,0.2)' }}></div>
            <div style={{ width: '4px', height: '3.2px', backgroundColor: '#4b5563', clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }}></div>
          </div>
        );
      } else {
        const baseClass = `flex items-center justify-center w-10 h-10 transition-all duration-300 shadow-lg border-[2.5px] box-border ${config.shape} marker-pop-in`;
        const stateClass = isSelected
          ? 'z-50 scale-125 marker-flash shadow-[0_0_30px_rgba(255,255,255,0.95)] ring-4 ring-offset-2 ring-blue-500 border-white bg-opacity-100'
          : 'opacity-100 hover:scale-110 hover:shadow-xl hover:z-40';
        markerContent.className = `${baseClass} ${stateClass} scale-[0.90] origin-bottom`;
        markerContent.style.backgroundColor = config.color;
        markerContent.style.borderColor = isSelected ? '#ffffff' : (config.borderColor || '#ffffff');

        root.render(
          <IconComponent size={config.size || 18} color={config.color === '#0f172a' || config.color === '#1e293b' ? '#22d3ee' : '#ffffff'} strokeWidth={2.5} />
        );
      }

      rootsRef.current.push(root);
      markerContent.appendChild(iconContainer);

      // Touch/Click handling
      let touchStartTime = 0;
      let touchStartPos = { x: 0, y: 0 };

      markerContent.addEventListener('touchstart', (e: TouchEvent) => {
        touchStartTime = Date.now();
        touchStartPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }, { passive: true });

      markerContent.addEventListener('touchend', (e: TouchEvent) => {
        const timeDiff = Date.now() - touchStartTime;
        const touchEndPos = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
        const distDiff = Math.sqrt(Math.pow(touchEndPos.x - touchStartPos.x, 2) + Math.pow(touchEndPos.y - touchStartPos.y, 2));
        if (timeDiff < 500 && distDiff < 20) {
          e.preventDefault();
          e.stopPropagation();
          onMarkerClick(poi);
        }
      });

      markerContent.addEventListener('click', (e: MouseEvent) => {
        e.stopPropagation();
        onMarkerClick(poi);
      });

      const marker = new google.maps.marker.AdvancedMarkerElement({
        position: { lat: wgsLat, lng: wgsLng },
        map,
        content: markerContent,
        zIndex: isSelected ? 999 : (100 + index),
      });

      markersRef.current.push(marker);
    });
  }, [markers, selectedPoi, theme, isMapReady]);

  // Handle Selection Focus
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedPoi || !selectedPoi.location) return;
    const [wgsLng, wgsLat] = gcj02ToWgs84(selectedPoi.location.lng, selectedPoi.location.lat);
    map.setZoom(15);
    map.panTo({ lat: wgsLat, lng: wgsLng });
  }, [selectedPoi]);

  return (
    <div className="w-full h-full relative bg-white dark:bg-gray-900 transition-colors duration-300">
      <style>{`
        @keyframes markerPopIn {
          0% { opacity: 0; transform: scale(0.5); }
          100% { opacity: 1; transform: scale(1); }
        }
        .marker-pop-in {
          animation: markerPopIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        .marker-label {
          display: none;
        }
        .show-labels .marker-label {
          display: block;
        }
      `}</style>
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}
