import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import AMapLoader from '@amap/amap-jsapi-loader';
import * as LucideIcons from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useData } from '../contexts/DataContext';

import { Banknote } from 'lucide-react';

import { DEFAULT_CITY } from '../config/cityConfig';

interface MapContainerProps {
  disableFitView?: boolean;
  onMapReady: (map: any, aMap: any) => void;
  markers: any[];
  selectedPoi: any;
  onMarkerClick: (poi: any) => void;
  onMapClick?: () => void;
}

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
        return { icon: LucideIcons.Train, color: '#8B5CF6', shape: 'rounded-lg', isDiamond: false, size: 20 };
    }
    if (t.includes('airport') || t.includes('机场')) {
        return { icon: LucideIcons.Plane, color: '#3B82F6', shape: 'rounded-lg', isDiamond: false, size: 20 };
    }

    // Dynamic Categories
    const matchedCategory = spotCategories?.find(cat => t.includes(cat.key) || t.includes(cat.name.toLowerCase()));
    
    if (matchedCategory) {
        let Icon: any = LucideIcons.MapPin;
        const isUrl = matchedCategory.icon && (matchedCategory.icon.startsWith('http') || matchedCategory.icon.startsWith('/') || matchedCategory.icon.startsWith('data:'));

        if (isUrl) {
            Icon = ({ size, className }: any) => (
                <img 
                    src={matchedCategory.icon} 
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
             return { icon: Icon, color: '#EF4444', shape: 'rounded-lg', isDiamond: false, showPin: true };
        } else if (matchedCategory.key === 'dining') {
             color = '#F59E0B';
             return { icon: Icon, color, shape: 'rounded-lg', isDiamond: false, showPin: true }; // Apply pin style to all
        } else if (matchedCategory.key === 'accommodation') {
             color = '#3B82F6';
             return { icon: Icon, color, shape: 'rounded-xl', isDiamond: false, showPin: true }; // Apply pin style to all
        } else if (matchedCategory.key === 'shopping') {
             color = '#EC4899'; // Pink-500
             return { icon: Icon, color, shape: 'rounded-lg', isDiamond: false, showPin: true }; // Apply pin style to all
        }

        // For other dynamic categories, also use pin style if desired, or default
        return { icon: Icon, color, shape, isDiamond, showPin: true };
    }

    // Default - Also apply pin style for consistency
    return { icon: LucideIcons.MapPin, color: theme === 'dark' ? '#1e293b' : '#0f172a', shape: 'rounded-full', borderColor: '#06b6d4', isDiamond: false, showPin: true };
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
          viewMode: "2D",
          zoom: DEFAULT_CITY.zoom,
          center: DEFAULT_CITY.center, // Use configured default
          lang: language === 'zh-CN' ? 'zh_cn' : 'en',
          mapStyle: theme === 'dark' ? 'amap://styles/dark' : 'amap://styles/normal',
        });

        // Add controls
        // Custom Zoom Control to support centering on selected marker
        // We'll add our own zoom buttons instead of AMap.ToolBar if possible, or try to override.
        // Since standard ToolBar is hard to hook, let's create a custom control div.
        
        // Remove standard ToolBar
        // map.addControl(new AMap.ToolBar({ position: 'RB', offset: [20, 240] }));
        
        map.addControl(new AMap.Scale());
        // map.addControl(new AMap.ControlBar({ position: 'RT' })); // Disabled compass/control bar by user request
        
        const geolocation = new AMap.Geolocation({
            enableHighAccuracy: true,
            timeout: 10000,
            position: 'RB',
            offset: [20, 180], // Adjust position above ToolBar
            zoomToAccuracy: true,
        });
        map.addControl(geolocation);
        
        // Handle Zoom for Labels
        const handleZoomChange = () => {
          // User Request: Always show labels regardless of zoom level
          if (mapRef.current) {
            mapRef.current.classList.add('show-labels');
          }
        };
        map.on('zoomchange', handleZoomChange);
        map.on('zoomend', handleZoomChange); // Also check on zoomend
        // Initial check
        handleZoomChange();
        
        // Map Click Handler
        map.on('click', (e: any) => {
            // Only trigger if clicking on map background (not markers)
            // AMap event propagation usually handles this, but we can verify target if needed
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
    const displayMarkers = markers;
    
    displayMarkers.forEach((poi, index) => {
      if (!poi.location) return;
      
      const isSelected = selectedPoi && selectedPoi.id === poi.id;
      const config = getMarkerConfig(poi.type);
      
      const markerContent = document.createElement('div');
      
      // Base classes
      const baseClass = `flex items-center justify-center w-10 h-10 transition-all duration-300 shadow-lg border-[2.5px] box-border ${config.shape}`;
      
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
            <div className={`relative ${isSelected ? 'z-50 scale-110' : 'z-40'} transition-transform duration-300`}>
               {/* The Red Pin (Anchor) - Realistic Apple Maps Style */}
               <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none transform translate-y-[4px]">
                  {/* Pin Head (Glossy Red Sphere) - Added border and stronger shadow */}
                  <div className="w-8 h-8 rounded-full bg-[radial-gradient(circle_at_30%_30%,_#ff4d4d,_#cc0000_50%,_#8b0000)] shadow-[inset_-2px_-2px_6px_rgba(0,0,0,0.3),_0_0_0_1.5px_#ffffff,_0_2px_4px_rgba(0,0,0,0.4)] z-20 relative">
                     {/* Specular Highlight (Stronger) */}
                     <div className="absolute top-[15%] left-[15%] w-[35%] h-[25%] bg-gradient-to-br from-white/90 to-transparent rounded-full blur-[1px]"></div>
                     {/* Rim Light */}
                     <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] bg-gradient-to-tl from-red-400/30 to-transparent rounded-full blur-[2px]"></div>
                  </div>
                  
                  {/* Pin Collar (Connection Ring) */}
                  <div className="w-[8px] h-[2px] bg-gray-400 rounded-full z-10 -mt-[1px]"></div>

                  {/* Pin Stick (Realistic Silver Cylinder) */}
                  <div className="w-[5px] h-[32px] bg-[linear-gradient(90deg,_#6b7280,_#f3f4f6_40%,_#f3f4f6_60%,_#6b7280)] z-10 -mt-[1px] shadow-[0_2px_4px_rgba(0,0,0,0.2)]"></div>
                  
                  {/* Pin Tip (Pointed Bottom) */}
                  <div className="w-[5px] h-[4px] bg-gray-600 z-10" style={{clipPath: 'polygon(0 0, 100% 0, 50% 100%)'}}></div>

                  {/* Cast Shadow (Perspective) */}
                  <div className="absolute bottom-[-2px] w-5 h-2.5 bg-black/50 blur-[1.5px] rounded-[100%] transform skew-x-[40deg] rotate-[10deg] translate-x-[6px] opacity-60 z-0"></div>
               </div>

               {/* Connector Line - Adjusted for new height */}
               <svg className="absolute bottom-[32px] left-[6px] w-[32px] h-[32px] pointer-events-none overflow-visible z-0">
                   <line x1="0" y1="32" x2="24" y2="10" stroke="#94a3b8" strokeWidth="2" strokeDasharray="3 2" />
               </svg>

               {/* The Floating Icon Box - Significantly Enlarged & High Visibility */}
               <div 
                  className={`absolute bottom-[52px] left-[20px] flex items-center justify-center w-12 h-12 shadow-[0_8px_20px_rgba(0,0,0,0.25),0_0_0_1px_rgba(0,0,0,0.1)] border-[3px] border-white box-border rounded-xl z-20 
                    ${isSelected 
                        ? 'ring-4 ring-offset-2 ring-blue-500 shadow-[0_0_35px_rgba(59,130,246,0.5)] scale-110 brightness-110' 
                        : 'hover:scale-110 hover:shadow-[0_0_20px_rgba(255,255,255,0.8),0_0_0_2px_rgba(0,0,0,0.2)] brightness-105 shadow-[0_8px_20px_rgba(0,0,0,0.25),0_0_0_2px_#ef4444]'
                    }`}
                  style={{ backgroundColor: config.color }}
               >
                    <IconComponent 
                        size={26} 
                        color="#ffffff" 
                        strokeWidth={2.5} 
                    />
               </div>

               {/* Marker Label - Rendered INSIDE the marker to ensure Z-Index Control */}
               {/* Positioned ABOVE the icon box and pin assembly */}
               {/* Pin top is roughly -100px from anchor. We place label at -130px to be safe above it. */}
               <div 
                   className="absolute left-1/2 -translate-x-1/2 -top-[130px] whitespace-nowrap z-[9999] pointer-events-none"
                   style={{ zIndex: 9999 }} // Force inline z-index
               >
                    <div className="px-3 py-1.5 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-white/50 dark:border-white/10 shadow-lg text-[13px] font-bold text-slate-800 dark:text-white transition-opacity duration-300">
                        {poi.name}
                    </div>
               </div>
            </div>
          );
      } else {
          // Standard Marker Layout
          markerContent.className = `${baseClass} ${stateClass}`;
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
        position: [poi.location.lng, poi.location.lat],
        content: markerContent,
        offset: config.showPin ? new AMap.Pixel(0, 0) : new AMap.Pixel(-18, -18),
        zIndex: isSelected ? 999 : (100 + index), // Increased base z-index and ensure selected is always top. Using index to stabilize stacking.
        extData: poi,
        clickable: true, // Explicitly enable click
        topWhenClick: true, // Bring to top on click
        bubble: false, // Prevent event bubbling issues
        // Label is now rendered INSIDE the markerContent for 'showPin' style
        // We only need AMap label for standard markers, or we can use it for both if we want duplication?
        // No, duplication is bad.
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
        } : undefined
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
    /*
    const markersChanged = markers !== prevMarkersRef.current;
    
    if ((markersChanged) && markers.length > 0 && !selectedPoi && !disableFitView) {
      // Use a small timeout to ensure map is ready and avoid conflicts with other movements
          setTimeout(() => {
              // User Request: Zoom out slightly (maxZoom: 10) and use larger padding for UI elements
              // Padding: [top, right, bottom, left] - larger bottom for panel, top for search
              map.setFitView(markersRef.current, false, [150, 60, 300, 60], 10); 
          }, 100);
      }
    */
      
    prevMarkersRef.current = markers;

  }, [markers, selectedPoi, theme, isMapReady]); // Added isMapReady dependency

  // Handle Selection Focus
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedPoi || !selectedPoi.location) return;

    // User Request: When a spot is selected, zoom in and center the map on it.
    // We use setZoomAndCenter (level 15) to ensure the spot is clearly visible but not too close.
    // Previously set to 16, user requested "like this size" which appears to be slightly wider context.
    map.setZoomAndCenter(15, [selectedPoi.location.lng, selectedPoi.location.lat]);
    
    // Note: MainLayout might apply a pan offset for the bottom sheet.
    // We leave that responsibility to the layout controller or handle it here if needed.
    // For now, centering is the primary request.
  }, [selectedPoi]);

    return (
        <div className="w-full h-full relative bg-white dark:bg-gray-900 transition-colors duration-300">
            {/* Custom Zoom Controls */}
            {/* User Request: Move +/- buttons to Top Right, below AdsWidget. */}
            {/* AdsWidget is at top-28 (112px). Height ~80px. Ends ~192px. */}
            {/* Let's place Zoom Controls directly below AdsWidget at top-[200px]. */}
            {/* Global View and ATM will follow. */}
            {/* BUT User wants: Ads -> Zoom -> Global -> ATM (implied by "move all up below Ads") */}
            {/* Let's adjust based on layout. */}
            {/* MainLayout places Ads at top-28. */}
            {/* Zoom Controls (Here): top-[200px] */}
            {/* Global View (MainLayout): top-[300px] */}
            {/* ATM (MainLayout): top-[360px] */}
            <div className="absolute right-5 top-[200px] flex flex-col gap-2 z-[70]">
                <button 
                    className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg shadow-md flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 transition-transform"
                    onClick={() => {
                        const map = mapInstanceRef.current;
                        if (!map) return;
                        if (selectedPoi && selectedPoi.location) {
                            // If a POI is selected, zoom towards it!
                            // First pan to it (centering it), then zoom
                            map.setCenter([selectedPoi.location.lng, selectedPoi.location.lat]);
                            map.zoomIn();
                        } else {
                            map.zoomIn();
                        }
                    }}
                >
                    <LucideIcons.Plus size={24} />
                </button>
                <button 
                    className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg shadow-md flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 transition-transform"
                    onClick={() => {
                        const map = mapInstanceRef.current;
                        if (!map) return;
                        if (selectedPoi && selectedPoi.location) {
                            map.setCenter([selectedPoi.location.lng, selectedPoi.location.lat]);
                            map.zoomOut();
                        } else {
                            map.zoomOut();
                        }
                    }}
                >
                    <LucideIcons.Minus size={24} />
                </button>
            </div>

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
