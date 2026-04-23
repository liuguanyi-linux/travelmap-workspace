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
  const prevMarkersRef = useRef<any[]>([]); // Track previous markers to prevent auto-fit on selection change
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
          // Complex "Red Pin + Floating Icon" layout
          // Pin Tip at (0,0) of this container.
          // Container needs to be positioned such that (0,0) is at map coordinate.
          // AMap offset will be set to (0,0) for this case.
          // We render the whole structure here.
          
          // However, AMap marker content is the container.
          // We need to override the container styles completely for this mode.
          // IMPORTANT: AMap might override styles if we just set them once.
          // Instead of setting styles on markerContent (which is passed to AMap),
          // we should ensure the root div we render handles the layout relative to (0,0).
          // And we set AMap offset to handle the anchor.
          
          // AMap Marker Content:
          markerContent.className = ''; 
          markerContent.style.backgroundColor = 'transparent';
          markerContent.style.border = 'none';
          markerContent.style.boxShadow = 'none'; // Remove any default shadow
          // We must ensure the container has no size so the absolute children position correctly relative to the anchor
          markerContent.style.width = '0px';
          markerContent.style.height = '0px';
          markerContent.style.overflow = 'visible';

          root.render(
            <div className={`relative ${isSelected ? 'z-50 scale-[1.10]' : 'z-40'} transition-transform duration-300 scale-[0.90] origin-bottom`}>
               {/* The Red Pin (Anchor) - Realistic Apple Maps Style */}
               <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none transform translate-y-[4px]">
                  {/* Pin Head (Glossy Sphere) - Dynamic Color - Reduced Size (20%) */}
                  <div 
                    className="w-[25.6px] h-[25.6px] rounded-full shadow-[inset_-1.5px_-1.5px_4px_rgba(0,0,0,0.3),_0_0_0_1px_#ffffff,_0_1.5px_3px_rgba(0,0,0,0.4)] z-20 relative"
                    style={{ background: config.pinGradient || 'radial-gradient(circle at 30% 30%, #ff4d4d, #cc0000 50%, #8b0000)' }}
                  >
                     {/* Specular Highlight (Stronger) */}
                     <div className="absolute top-[15%] left-[15%] w-[35%] h-[25%] bg-gradient-to-br from-white/90 to-transparent rounded-full blur-[1px]"></div>
                     {/* Rim Light */}
                     <div className={`absolute bottom-[10%] right-[10%] w-[40%] h-[40%] bg-gradient-to-tl ${config.rimColor || 'from-red-400/30'} to-transparent rounded-full blur-[2px]`}></div>
                  </div>
                  
                  {/* Pin Collar (Connection Ring) - Reduced Size */}
                  <div className="w-[6.4px] h-[1.6px] bg-gray-400 rounded-full z-10 -mt-[1px]"></div>

                  {/* Pin Stick (Realistic Silver Cylinder) - Reduced Size */}
                  <div className="w-[4px] h-[25.6px] bg-[linear-gradient(90deg,_#6b7280,_#f3f4f6_40%,_#f3f4f6_60%,_#6b7280)] z-10 -mt-[1px] shadow-[0_1.5px_3px_rgba(0,0,0,0.2)]"></div>
                  
                  {/* Pin Tip (Pointed Bottom) - Reduced Size */}
                  <div className="w-[4px] h-[3.2px] bg-gray-600 z-10" style={{clipPath: 'polygon(0 0, 100% 0, 50% 100%)'}}></div>

                  {/* Cast Shadow (Perspective) - Reduced Size */}
                  <div className="absolute bottom-[-1.5px] w-[16px] h-[8px] bg-black/50 blur-[1.2px] rounded-[100%] transform skew-x-[40deg] rotate-[10deg] translate-x-[4.8px] opacity-60 z-0"></div>
               </div>

               {/* Connector Line - Adjusted for new height */}
               <svg className="absolute bottom-[25.6px] left-[4.8px] w-[25.6px] h-[25.6px] pointer-events-none overflow-visible z-0">
                   <line x1="0" y1="25.6" x2="19.2" y2="8" stroke="#94a3b8" strokeWidth="1.6" strokeDasharray="2.4 1.6" />
               </svg>

               {/* The Floating Icon Box - Significantly Enlarged & High Visibility - Reduced Size (20%) */}
               <div 
                  className={`absolute bottom-[41.6px] left-[16px] flex items-center justify-center w-[38.4px] h-[38.4px] shadow-[0_6.4px_16px_rgba(0,0,0,0.25),0_0_0_0.8px_rgba(0,0,0,0.1)] border-[2.4px] border-white box-border rounded-[9.6px] z-20 
                    ${isSelected 
                        ? 'ring-[3.2px] ring-offset-[1.6px] ring-blue-500 shadow-[0_0_28px_rgba(59,130,246,0.5)] scale-110 brightness-110' 
                        : 'hover:scale-110 hover:shadow-[0_0_16px_rgba(255,255,255,0.8),0_0_0_1.6px_rgba(0,0,0,0.2)] brightness-105 shadow-[0_6.4px_16px_rgba(0,0,0,0.25),0_0_0_1.6px_#ef4444]'
                    }`}
                  style={{ backgroundColor: config.color }}
               >
                    <IconComponent 
                        size={20.8} 
                        color="#ffffff" 
                        strokeWidth={2.5} 
                    />
               </div>

               {/* Marker Label - Rendered INSIDE the marker to ensure Z-Index Control */}
               {/* Positioned ABOVE the icon box and pin assembly */}
               {/* Pin top is roughly -80px from anchor. We place label at -104px to be safe above it. */}
               <div 
                   className="marker-label absolute left-1/2 -translate-x-1/2 -top-[104px] whitespace-nowrap z-[9999] pointer-events-none"
                   style={{ zIndex: 9999 }} // Force inline z-index
               >
                    <div 
                        className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 shadow-md text-[13px] font-bold text-slate-800 dark:text-white transition-opacity duration-300 border-[1.5px] border-blue-500"
                    >
                        {poi.name}
                    </div>
               </div>
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

  }, [markers, selectedPoi, theme, isMapReady]); // Added isMapReady dependency

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
