import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import MapContainer from './MapContainer';
import LoginModal from './LoginModal';
import LocationModal from './LocationModal';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import BottomTabBar from './mobile/BottomTabBar';
import CityDrawer from './mobile/CityDrawer';
import UserDrawer from './mobile/UserDrawer';
import StrategyView from './mobile/StrategyView';
import GuideView from './mobile/GuideView';
import FloatingSearchBar from './mobile/FloatingSearchBar';
import AdsWidget from './mobile/AdsWidget';
import AtmWidget from './mobile/AtmWidget';
import PoiDetailBottomSheet from './mobile/PoiDetailBottomSheet';
import SearchResultsDrawer from './mobile/SearchResultsDrawer';
import GlobalViewButton from './mobile/GlobalViewButton';
import { DEFAULT_CITY } from '../config/cityConfig';

export default function MainLayout() {
  // Map State
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [aMap, setAMap] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [mapMarkers, setMapMarkers] = useState<any[]>([]);
  const [selectedPoi, setSelectedPoi] = useState<any>(null);
  
  // UI State
  const [activeTab, setActiveTab] = useState(''); // Default to empty (closed)
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [isSearchListOpen, setIsSearchListOpen] = useState(false);
  const [activeCity, setActiveCity] = useState(DEFAULT_CITY.name); // Default active city for custom POIs
  const [isAtmActive, setIsAtmActive] = useState(false);
  const { spots = [], spotCategories = [], cities = [] } = useData();
  
  // Close bottom sheet when tab changes to avoid conflicts
  useEffect(() => {
    if (isBottomSheetOpen) {
        setIsBottomSheetOpen(false);
    }
  }, [activeTab]);

  const { t } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  
  // Modals
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLocationPromptOpen, setIsLocationPromptOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const hasPromptedRef = useRef(false);

  // Refs
  const routePluginRef = useRef<any>(null);
  const searchRequestId = useRef(0);

  // Helper to show all spots globally
  const showAllSpots = () => {
    if (!spots || spots.length === 0) return;
    const allSpots = spots.map(s => ({
        ...s,
        type: s.tags ? s.tags.join(';') : 'spot',
        address: s.address || '',
        biz_ext: { rating: 5.0 },
        photos: (s.photos || []).map(url => ({ url }))
    }));
    setSearchResults(allSpots);
    setMapMarkers(allSpots);
  };

  // Initialize with all spots when data is loaded and keep updated
  useEffect(() => {
    // Check if activeCity is valid (exists in available cities)
    // If not, and we have cities, default to the first available city
    if (cities && cities.length > 0) {
        const isCityValid = cities.some(c => c.name === activeCity);
        if (!isCityValid) {
            console.log(`[MainLayout] Active city "${activeCity}" not found in available cities. Switching to "${cities[0].name}".`);
            setActiveCity(cities[0].name);
        }
    }

    // Only auto-refresh map content if:
    // 1. We have spots data
    // 2. No specific search/filter is active (drawers closed, search list closed)
    if ((spots || []).length > 0 && activeTab === '' && !isSearchListOpen) {
        showAllSpots();
    }
  }, [spots, activeTab, isSearchListOpen, cities, activeCity]);

  const handleMapReady = (map: any, AMap: any) => {
    setMapInstance(map);
    setAMap(AMap);

    // Prompt for location on first load - DISABLED by user request
    /*
    if (!hasPromptedRef.current) {
        setTimeout(() => {
            setIsLocationPromptOpen(true);
        }, 800);
        hasPromptedRef.current = true;
    }
    */
  };

  const handleLocationAllow = () => {
    if (!mapInstance || !aMap) return;

    setIsLocating(true);
    setLocationError(null);

    const geolocation = new aMap.Geolocation({
      enableHighAccuracy: true,
      timeout: 10000,
      zoomToAccuracy: true,
    });

    geolocation.getCurrentPosition((status: string, result: any) => {
      if (status === 'complete') {
        setIsLocating(false);
        setIsLocationPromptOpen(false);
        mapInstance.setZoomAndCenter(15, result.position);
        
        // Try to get city name from addressComponent if available
        if (result.addressComponent && result.addressComponent.city) {
             const cityName = result.addressComponent.city.replace('市', '');
             setActiveCity(cityName);
        }
      } else {
        console.warn('High accuracy location failed, trying CitySearch fallback...', result);
        const citySearch = new aMap.CitySearch();
        citySearch.getLocalCity((status: string, result: any) => {
            setIsLocating(false);
            if (status === 'complete' && result.info === 'OK') {
                setIsLocationPromptOpen(false);
                
                // Update active city
                if (result.city) {
                    setActiveCity(result.city.replace('市', ''));
                }

                if (result.bounds) {
                    mapInstance.setBounds(result.bounds);
                } else {
                    mapInstance.setZoomAndCenter(10, mapInstance.getCenter());
                }
            } else {
                setLocationError('failed');
            }
        });
      }
    });
  };

  const handleLocationDeny = () => {
      setIsLocationPromptOpen(false);
      setLocationError(null);
  };

  const handleSearch = (keyword: string, isNearby: boolean = false, shouldOpenDrawer: boolean = true) => {
    // Custom Logic: ALWAYS prefer searching local created spots first, or exclusively if that's the requirement.
    // User requested "turn off" external search for spots.
    
    if (!keyword) {
        showAllSpots();
        return;
    }

    // Search local spots
    const localMatches = spots.filter(s => 
        (s.name.toLowerCase().includes(keyword.toLowerCase())) &&
        // Global Local Search
        true
    );

    if (localMatches.length > 0) {
        const mappedSpots = localMatches.map(s => ({
            ...s,
            type: s.tags.join(';'),
            address: s.address || '',
            biz_ext: { rating: 5.0 },
            photos: (s.photos || []).map(url => ({ url }))
        }));
        
        setSearchResults(mappedSpots);
        setMapMarkers(mappedSpots);
        if (mappedSpots.length > 0 && shouldOpenDrawer) {
            setIsSearchListOpen(true);
        }
        
        // Auto-fit to search results
        if (mapInstance && mappedSpots.length > 0) {
             // Create AMap Markers for bounds calculation
             const tempMarkers = mappedSpots.map(p => new aMap.Marker({
                 position: [p.location.lng, p.location.lat]
             }));
             // Fit view with padding
             mapInstance.setFitView(tempMarkers, false, [150, 60, 300, 60], 10);
        }

        return; 
    }

    // If no local matches, strictly return empty to disable external search
    console.log('[MainLayout] No local matches found for:', keyword, '- External search disabled.');
    setSearchResults([]);
    setMapMarkers([]);
  };

  const handleMarkerClick = (poi: any) => {
    setSelectedPoi(poi);
    setIsBottomSheetOpen(true);
    
    // Center map on marker with offset to show above bottom sheet (peek mode covers bottom ~35%)
    if (mapInstance && poi.location) {
        // MapContainer handles the primary Zoom & Center logic via useEffect on selectedPoi change.
        // We can add a slight offset here if needed, but for now let's let MapContainer handle the view.
        // mapInstance.panTo([poi.location.lng, poi.location.lat]);
        
        // Optional: Pan map up slightly (move content up) so marker appears higher in viewport
        // We want marker at ~35% from top (center of visible area), so we pan map UP.
        // setTimeout(() => {
        //      mapInstance.panBy(0, -120); 
        // }, 300);
    }
  };

  const handleCategorySelect = (category: string) => {
    // User Request: "Disable external search for ALL categories"
    // We will now treat ALL categories as local search only.
    console.log('[MainLayout] Category selected:', category, '- using local search only.');
    
    // User Request: "Whatever menu option I click, all content markers on the map must appear, do not hide."
    // So we basically ignore filtering for the MAP (searchResults), but we might want to scroll list?
    // Wait, if we show ALL markers, how does the user know which ones are "Spots"?
    // The user said: "Currently clicked Spot menu, map only shows Spot menu items. I want all markers to appear."
    // So: Even if I'm in "Spot" mode in the drawer (list view), the MAP should show EVERYTHING.
    
    // 1. Ensure MAP shows ALL spots
    showAllSpots(); 

    // 2. Filter list for the DRAWER only
    // We need to pass the filtered list to the CityDrawer, but keep searchResults (Map Markers) full.
    // However, CityDrawer currently uses `searchResults` prop for its list.
    // We need to decouple Map Markers from Drawer List.
    // Let's modify the state structure.
    // For now, let's implement the user's specific request: "Map shows all".
    // If CityDrawer relies on searchResults, the list will also show all?
    // User: "Click Spot menu... map shows all".
    // If list shows all, that's wrong for "Spot Menu".
    // We need a separate `filteredListResults` state for the drawer.
    
    // Let's calculate the filtered list for the drawer logic (which we'll need to pass down if we separate)
    // But wait, CityDrawer takes `searchResults`.
    // If I change searchResults to ALL, the Drawer will list ALL.
    // I need to change how CityDrawer receives data.
    // Or... maybe the user implies they want to see other markers as context?
    
    // Let's try to keep searchResults as the "Active Filtered List" for the drawer,
    // but pass a separate "mapMarkers" prop to MapContainer?
    // Currently MapContainer takes `markers={searchResults}`.
    // I should create a new state `mapMarkers` that defaults to all spots,
    // and `searchResults` will be just for the list.
    
    // Refactoring plan:
    // 1. Create `mapMarkers` state. Initialize with all spots.
    // 2. `handleCategorySelect` updates `searchResults` (for list) but resets `mapMarkers` to all spots (or keeps it all).
    // 3. Pass `mapMarkers` to MapContainer instead of `searchResults`.
    
    // Let's do the calculation for the List (Drawer)
    const isCategoryMatch = (s: any) => {
        if (!s.tags || !Array.isArray(s.tags)) return false;
        
        if (category === 'transport') {
            return s.tags.includes('rail') || s.tags.includes('airport') || s.tags.includes('transport');
        }
        
        if (category === 'spot') {
            const otherCategories = spotCategories.filter(c => c.key !== 'spot').map(c => c.key);
            const hasOtherTag = s.tags.some((tag: string) => otherCategories.includes(tag));
            return s.tags.includes('spot') || !hasOtherTag;
        }
        
        return s.tags.includes(category);
    };
    
    let citySpots = spots.filter(s => {
        const isCityMatch = (!s.city) || (activeCity && s.city.includes(activeCity));
        if (!isCityMatch) return false;
        return isCategoryMatch(s);
    });

    if (citySpots.length === 0) {
        const allCategorySpots = spots.filter(isCategoryMatch);
        if (allCategorySpots.length > 0) {
             citySpots = allCategorySpots;
        }
    }
    
    const listSpots = citySpots.map(s => ({
        ...s,
        type: s.tags.join(';'),
        address: s.address || '',
        biz_ext: { rating: 5.0 }, 
        photos: (s.photos || []).map(url => ({ url }))
    }));

    setSearchResults(listSpots); // Update Drawer List
    // Map Markers are handled by `mapMarkers` state (see below)
  };

  const handleCityScopedSearch = (keyword: string, category?: string) => {
    // Custom Logic: ALWAYS search local created spots regardless of category
    // User requested to disable external search for ALL categories in city menu
    
    // Filter local spots by active city AND keyword
    const citySpots = spots.filter(s => {
        const isCityMatch = (!s.city) || (activeCity && s.city.includes(activeCity));
        if (!isCityMatch) return false;

        return (s.name.toLowerCase().includes(keyword.toLowerCase()) || 
         (s.tags && s.tags.some(t => t.toLowerCase().includes(keyword.toLowerCase()))));
    });
    
    const mappedSpots = citySpots.map(s => ({
        ...s,
        type: s.tags.join(';'),
        address: s.address || '',
        biz_ext: { rating: 5.0 },
        photos: (s.photos || []).map(url => ({ url }))
    }));

    setSearchResults(mappedSpots);
    setMapMarkers(mappedSpots);

    // Auto-fit to filtered results
    if (mapInstance && mappedSpots.length > 0 && aMap) {
         const tempMarkers = mappedSpots.map(p => new aMap.Marker({
             position: [p.location.lng, p.location.lat]
         }));
         mapInstance.setFitView(tempMarkers, false, [150, 60, 300, 60], 10);
    }

    return;
  };

  const handleAtmToggle = () => {
    if (isAtmActive) {
        setIsAtmActive(false);
        searchRequestId.current++; // Invalidate pending searches
        showAllSpots(); // Restore all spots
        setSelectedPoi(null); // Clear selection
        setIsBottomSheetOpen(false); // Close detail view
    } else {
        setIsAtmActive(true);
        setIsBottomSheetOpen(false);
        setActiveTab(''); // Close drawers
        
        // ATM Search using AMap API
        if (mapInstance && aMap) {
            const placeSearch = new aMap.PlaceSearch({
                type: 'ATM', // Search specifically for ATMs
                pageSize: 50, // Show plenty of options
                pageIndex: 1,
                extensions: 'base',
            });

            const center = mapInstance.getCenter();
            // Search within 2km radius
            placeSearch.searchNearBy('', center, 2000, (status: string, result: any) => {
                if (status === 'complete' && result.info === 'OK') {
                    const pois = result.poiList.pois;
                    const mappedPois = pois.map((p: any) => ({
                        id: p.id,
                        name: p.name,
                        location: p.location, // AMap location object
                        address: p.address || '',
                        type: 'atm', // Special type for styling
                        city: p.cityname || '',
                        photos: [], // ATMs usually don't have photos we care about
                        intro: 'ATM / 自助银行',
                        biz_ext: { rating: 0 }
                    }));
                    setSearchResults(mappedPois);
                    setMapMarkers(mappedPois);
                } else {
                    console.warn('ATM Search failed or no results:', status, result);
                    setSearchResults([]); // Ensure empty if failed
                    setMapMarkers([]);
                }
            });
        }
    }
  };

  const handleCitySelect = (city: { name: string, center: [number, number], zoom: number }) => {
    setActiveCity(city.name); // Update active city context
    
    // User Request: Show ALL spots globally on map
    showAllSpots();

    if (mapInstance) {
        mapInstance.setZoomAndCenter(city.zoom, city.center);
    }
  };

  const handleMapClick = () => {
    // User Request: "我需要当选择城市后，地图上的标识不要消失"
    // Previously: "当我退出或点击别任意地点后都应该清空只显示我目前所点击的"
    // Now: We keep search results (markers) visible unless explicitly cleared by other actions (like Global View)
    
    setSelectedPoi(null);
    setIsBottomSheetOpen(false);
    
    // Do NOT clear search results anymore
    // setSearchResults([]);
    
    // ATM mode is a temporary overlay, maybe we should keep it too?
    // User said "当我再点击按钮，则地图上的atm机标识都隐藏", implying toggle button controls visibility.
    // However, clicking empty space usually means "deselect current item", not "exit mode".
    // Let's be safe and keep ATM active if it was active, just deselect the specific ATM.
    // Actually, user's previous request was "when I click ATM button... hide markers".
    // If they click map, maybe they want to see other ATMs? 
    // Let's keep ATM mode active but deselect the specific one.
    // setIsAtmActive(false); 
  };

  const handleTabChange = (tabId: string) => {
    if (activeTab === tabId) {
        setActiveTab('');
    } else {
        setActiveTab(tabId);
    }
  };

  const handleGlobalView = () => {
    if (mapInstance) {
      // Reset to Default City (Refresh Mode)
      mapInstance.setZoomAndCenter(DEFAULT_CITY.zoom, DEFAULT_CITY.center);
      setActiveTab(''); // Close any open drawers
      setIsBottomSheetOpen(false);
      showAllSpots(); // Reset to all spots instead of clearing
      setActiveCity(DEFAULT_CITY.name); // Reset active city
      setIsSearchListOpen(false);
    }
  };

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Full Screen Map */}
      <div className="absolute inset-0 z-0">
        <MapContainer 
          onMapReady={handleMapReady}
          markers={mapMarkers}
          selectedPoi={selectedPoi}
          onMarkerClick={handleMarkerClick}
          onMapClick={handleMapClick}
          disableFitView={isAtmActive || (activeTab === 'city' && searchResults.length > 0)}
        />
      </div>

      {/* Global View Button - Moved to Top Right below Zoom Controls (ends ~290px) */}
      <div className="absolute top-[310px] right-4 z-30">
        <GlobalViewButton onClick={handleGlobalView} />
      </div>

      {/* Top Floating Search */}
      <FloatingSearchBar 
        onSearch={(keyword) => handleSearch(keyword)}
        onCategorySelect={handleCategorySelect}
      />

      {/* Right Side Widgets */}
      {activeTab === '' && !isSearchListOpen && !isBottomSheetOpen && (
        <>
          {/* Ads Widget - Top Right (Below Search Bar) */}
          <div className="fixed top-28 right-4 z-50 pointer-events-none">
            <div className="pointer-events-auto">
              <AdsWidget />
            </div>
          </div>
          
          {/* ATM Widget - Moved to Top Right (Below Global View) */}
          <div className="fixed top-[370px] right-4 z-50 pointer-events-none">
            <div className="pointer-events-auto">
              <AtmWidget onSelect={handleAtmToggle} isActive={isAtmActive} />
            </div>
          </div>
        </>
      )}

      {/* City Drawer (Replaces CityCategoryPanel) */}
      <CityDrawer 
        isVisible={activeTab === 'city' && !isBottomSheetOpen}
        onSelectCategory={handleCategorySelect}
        onSelectCity={handleCitySelect}
        searchResults={searchResults}
        onPoiClick={handleMarkerClick}
        onClose={() => setActiveTab('')}
        onSearch={handleCityScopedSearch}
        activeCityName={activeCity}
      />

      {/* Strategy View */}
      <StrategyView 
        isVisible={activeTab === 'strategy' && !isBottomSheetOpen}
        onClose={() => setActiveTab('')}
      />

      {/* Guide View */}
      <GuideView 
        isVisible={activeTab === 'guide' && !isBottomSheetOpen}
        onClose={() => setActiveTab('')}
        activeCity={activeCity}
      />

      {/* User Drawer */}
      <UserDrawer 
        isVisible={activeTab === 'me' && !isBottomSheetOpen}
        onClose={() => setActiveTab('')}
        onPoiClick={handleMarkerClick}
      />

      {/* Bottom Tab Bar */}
      <BottomTabBar 
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* POI Detail Bottom Sheet */}
      <PoiDetailBottomSheet 
        poi={selectedPoi}
        isOpen={isBottomSheetOpen}
        onClose={() => {
          setIsBottomSheetOpen(false);
          setSelectedPoi(null);
        }}
      />
      
      {/* Search Results Drawer */}
      <SearchResultsDrawer
        isVisible={isSearchListOpen && !isBottomSheetOpen}
        results={searchResults}
        onPoiClick={(poi) => {
            handleMarkerClick(poi);
            setIsSearchListOpen(false);
        }}
        onClose={() => setIsSearchListOpen(false)}
      />

      {/* Modals */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onLogin={async (email) => {
          try {
            await login(email);
            if (email === 'admin@travelmap.com') {
              navigate('/admin/dashboard');
            }
          } catch (error) {
            console.error('Login failed', error);
          }
          setIsLoginModalOpen(false);
        }}
        t={t}
      />

      <LocationModal
        isOpen={isLocationPromptOpen}
        onAllow={handleLocationAllow}
        onDeny={handleLocationDeny}
        isLocating={isLocating}
        error={locationError}
        t={t}
      />
    </div>
  );
}
