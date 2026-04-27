import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import MapContainer from './MapContainer';
import LoginModal from './LoginModal';
import LocationModal from './LocationModal';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../hooks/useFavorites';
import BottomTabBar from './mobile/BottomTabBar';
import CityDrawer from './mobile/CityDrawer';
import UserDrawer from './mobile/UserDrawer';
import EnterpriseView from './mobile/EnterpriseView';
import GuideView from './mobile/GuideView';
import FloatingSearchBar from './mobile/FloatingSearchBar';
import AdsWidget from './mobile/AdsWidget';
import AtmWidget from './mobile/AtmWidget';
import PoiDetailBottomSheet from './mobile/PoiDetailBottomSheet';
import MapToggle from './mobile/MapToggle';
import SearchResultsDrawer, { SearchResultItem } from './mobile/SearchResultsDrawer';
import MyLocationButton, { Toggle2DButton } from './mobile/GlobalViewButton';
// import TopNavBar from './mobile/TopNavBar'; // Deprecated
// import FilterBar from './mobile/FilterBar'; // Deprecated
// import BottomSpotList from './mobile/BottomSpotList'; // Deprecated
import { DEFAULT_CITY, CHINA_OVERVIEW } from '../config/cityConfig';
import { gcj02ToWgs84 } from '../utils/coordTransform';
import { toast } from 'sonner';

export default function MainLayout() {
  // Map State
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [aMap, setAMap] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [mapMarkers, setMapMarkers] = useState<any[]>([]);
  // Base map markers (unfiltered by category, but filtered by city/search)
  const [baseMapMarkers, setBaseMapMarkers] = useState<any[]>([]);
  // ATM markers (temporary overlay)
  const [atmMarkers, setAtmMarkers] = useState<any[]>([]);
  
  const [selectedPoi, setSelectedPoi] = useState<any>(null);
  
  // UI State
  const [activeTab, setActiveTab] = useState(''); // 'strategy', 'guide', 'me', '' (for home/map view)
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [isSearchListOpen, setIsSearchListOpen] = useState(false);
  const [activeCity, setActiveCity] = useState('');
  const [activeCategory, setActiveCategory] = useState(''); // 'spot', 'dining', etc.
  const [searchKeyword, setSearchKeyword] = useState('');
  const [unifiedSearchResults, setUnifiedSearchResults] = useState<SearchResultItem[]>([]);
  const [isAtmActive, setIsAtmActive] = useState(false);
  const [isAdOpen, setIsAdOpen] = useState(false);
  const [focusedSpotId, setFocusedSpotId] = useState<string | number | null>(null);
  const [viewMode, setViewMode] = useState<'all' | 'favorites'>('all');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [is3D, setIs3D] = useState(false);

  const { spots = [], spotCategories = [], cities = [], guides = [], strategies = [] } = useData();
  const { favorites } = useFavorites();
  
  // Close bottom sheet and reset favorites view when tab changes
  useEffect(() => {
    if (isBottomSheetOpen) {
        setIsBottomSheetOpen(false);
    }
    if (activeTab !== 'me' && viewMode === 'favorites') {
        setViewMode('all');
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
  const hasInitializedViewMode = useRef(false);

  // Initial View Mode Logic
  // useEffect(() => {
  //     if (!hasInitializedViewMode.current && favorites.length > 0) {
  //         setViewMode('favorites');
  //         hasInitializedViewMode.current = true;
  //     }
  // }, [favorites]);

  // Handle View Mode Toggle
  const handleViewModeChange = (mode: 'all' | 'favorites') => {
      // If switching to favorites and no favorites exist, warn and revert
      if (mode === 'favorites' && favorites.length === 0) {
          toast.error(t('mapToggle.noFavorites'));
          setViewMode('all');
          return;
      }
      setViewMode(mode);
  };

  // Sync viewMode when favorites change
  useEffect(() => {
    // If we are in favorites mode but favorites become empty (e.g., user removed the last one),
    // revert to 'all' mode automatically.
    if (viewMode === 'favorites' && favorites.length === 0) {
        // toast.info(t('mapToggle.noFavorites')); // Optional: notify user
        setViewMode('all');
    }
  }, [favorites, viewMode]);

  // Refs
  const routePluginRef = useRef<any>(null);
  const searchRequestId = useRef(0);

  // State for deep linking into drawers
  const [guideInitialCategory, setGuideInitialCategory] = useState<string | undefined>(undefined);
  const [enterpriseInitialId, setEnterpriseInitialId] = useState<string | undefined>(undefined);

  const [spotInitialId, setSpotInitialId] = useState<string | undefined>(undefined);
  const [guideInitialId, setGuideInitialId] = useState<string | undefined>(undefined);

  // URL parameter deep linking (e.g. ?open=enterprise&id=123, ?open=spot&id=456)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const openTab = params.get('open');
    const openId = params.get('id');
    if (!openTab || !openId) return;
    // Clean URL without reload
    window.history.replaceState({}, '', window.location.pathname);

    if (openTab === 'enterprise') {
      setActiveTab('enterprise');
      setEnterpriseInitialId(openId);
    } else if (openTab === 'spot') {
      setSpotInitialId(openId);
    } else if (openTab === 'guide') {
      setActiveTab('guide');
      setGuideInitialId(openId);
    } else if (openTab === 'strategy') {
      setActiveTab('strategy');
    } else if (openTab === 'ad') {
      setActiveTab('guide');
      setGuideInitialCategory('ad');
      setGuideInitialId(openId);
    }
  }, []);

  useEffect(() => {
    const handleNavigate = (e: any) => {
      const { tab, category } = e.detail;
      if (tab) {
          setActiveTab(tab);
          if (tab === 'guide' && category) {
              setGuideInitialCategory(category);
              // Reset after a short delay so it doesn't stick
              setTimeout(() => setGuideInitialCategory(undefined), 500);
          }
      }
    };
    window.addEventListener('navigate-to-tab', handleNavigate);
    return () => window.removeEventListener('navigate-to-tab', handleNavigate);
  }, []);

  // --- Core Logic: Filtering Spots ---
  // Filter spots based on Active City AND Active Category
  // This result drives both the Map Markers and the Bottom Carousel
  useEffect(() => {
    if (!spots) return;

    // 0. Filter by active status (Global Filter)
    let filtered = spots.filter(item => item.isActive !== false);

    // 0.5 Filter by View Mode (Global Filter)
    if (viewMode === 'favorites') {
        const favoriteIds = new Set(favorites.map(f => String(f.id)));
        filtered = filtered.filter(s => favoriteIds.has(String(s.id)));
    } else {
        // 1. Filter by City (only in 'all' mode)
        if (activeCity) {
          filtered = filtered.filter(s => !s.city || s.city.includes(activeCity));
        }
    }

    // 2. Filter by Category
    if (activeCategory) {
       // Only filter for Search Results (List View), NOT for Map Markers
       // The user wants map to always show all spots in the city
       
       // Calculate filtered list for drawer
       const listFiltered = filtered.filter(s => {
          if (!s.tags || !Array.isArray(s.tags)) return false;
          
          if (activeCategory === 'transport') {
              return s.tags.includes('rail') || s.tags.includes('airport') || s.tags.includes('transport');
          }
          
          if (activeCategory === 'spot') {
              // Exclude other major categories to define 'spot'
              const otherCategories = ['dining', 'shopping', 'transport', 'rail', 'airport'];
              const hasOtherTag = s.tags.some((tag: string) => otherCategories.includes(tag));
              return s.tags.includes('spot') || !hasOtherTag;
          }
          
          return s.tags.includes(activeCategory);
       });
       
       // Apply Keyword Filter to List
       let finalSearchResults = listFiltered;
       if (searchKeyword) {
            const lowerKw = searchKeyword.toLowerCase();
            finalSearchResults = listFiltered.filter(s => 
                (s.name && s.name.toLowerCase().includes(lowerKw)) || 
                (s.intro && s.intro.toLowerCase().includes(lowerKw)) || 
                (s.address && s.address.toLowerCase().includes(lowerKw)) ||
                (s.tags && Array.isArray(s.tags) && s.tags.some((t: string) => t.toLowerCase().includes(lowerKw)))
            );
       }

       // Map spots to display format for List
       const mappedListSpots = finalSearchResults.map(s => ({
            ...s,
            type: s.tags ? s.tags.join(';') : 'spot',
            address: s.address || '',
            biz_ext: { rating: 5.0 },
            photos: (s.photos || []).map(url => ({ url }))
       }));
       setSearchResults(mappedListSpots);

       // For Map Markers: Use 'filtered' (City filtered only) 
       // AND apply Search Keyword if present (usually search should filter map too, but category should not)
       
       let mapFiltered = filtered;
       if (searchKeyword) {
            const lowerKw = searchKeyword.toLowerCase();
            mapFiltered = filtered.filter(s => 
                (s.name && s.name.toLowerCase().includes(lowerKw)) || 
                (s.intro && s.intro.toLowerCase().includes(lowerKw)) || 
                (s.address && s.address.toLowerCase().includes(lowerKw)) ||
                (s.tags && Array.isArray(s.tags) && s.tags.some((t: string) => t.toLowerCase().includes(lowerKw)))
            );
       }

       const mappedMapSpots = mapFiltered.map(s => ({
            ...s,
            type: s.tags ? s.tags.join(';') : 'spot',
            address: s.address || '',
            biz_ext: { rating: 5.0 },
            photos: (s.photos || []).map(url => ({ url }))
       }));
       // Store base markers (without ATMs)
       setBaseMapMarkers(mappedMapSpots);

    } else {
        // No category selected (e.g. initial load or cleared)
        // Apply Search Keyword
        let finalFiltered = filtered;
        if (searchKeyword) {
            const lowerKw = searchKeyword.toLowerCase();
            finalFiltered = filtered.filter(s => 
                (s.name && s.name.toLowerCase().includes(lowerKw)) || 
                (s.intro && s.intro.toLowerCase().includes(lowerKw)) || 
                (s.address && s.address.toLowerCase().includes(lowerKw)) ||
                (s.tags && Array.isArray(s.tags) && s.tags.some((t: string) => t.toLowerCase().includes(lowerKw)))
            );
        }

        const mappedSpots = finalFiltered.map(s => ({
            ...s,
            type: s.tags ? s.tags.join(';') : 'spot',
            address: s.address || '',
            biz_ext: { rating: 5.0 },
            photos: (s.photos || []).map(url => ({ url }))
        }));

        setSearchResults(mappedSpots);
        setBaseMapMarkers(mappedSpots);
    }
    
    // Auto-fit logic ...
  }, [spots, activeCity, activeCategory, searchKeyword, mapInstance, aMap, viewMode, favorites]); // Added viewMode and favorites

  // --- Combine Base Markers and ATM Markers ---
  useEffect(() => {
      setMapMarkers([...baseMapMarkers, ...atmMarkers]);
  }, [baseMapMarkers, atmMarkers]);

  // --- Unified Search Results (spots + guides + strategies) ---
  useEffect(() => {
    if (!searchKeyword.trim()) {
      setUnifiedSearchResults([]);
      return;
    }
    const kw = searchKeyword.toLowerCase();

    // 城市中文名 → 韩文名映射（从后台 cities 数据）
    const cityKoMap: Record<string, string> = {};
    cities.forEach((c: any) => { if (c.name && c.nameKo) cityKoMap[c.name] = c.nameKo; });
    const getCityKo = (name: string) => cityKoMap[name] || name;

    const spotResults: SearchResultItem[] = spots
      .filter(s => s.isActive !== false)
      .filter(s =>
        (s.name && s.name.toLowerCase().includes(kw)) ||
        (s.intro && s.intro.toLowerCase().includes(kw)) ||
        (s.address && s.address.toLowerCase().includes(kw)) ||
        (s.tags && s.tags.some((t: string) => t.toLowerCase().includes(kw)))
      )
      .map(s => ({
        id: s.id,
        type: 'spot' as const,
        name: s.name,
        description: s.intro || s.content || '',
        imageUrl: s.photos?.[0] || '',
        city: s.city ? getCityKo(s.city) : '',
      }));

    const guideResults: SearchResultItem[] = guides
      .filter(g =>
        (g.name && g.name.toLowerCase().includes(kw)) ||
        (g.intro && g.intro.toLowerCase().includes(kw)) ||
        (g.title && g.title.toLowerCase().includes(kw)) ||
        (g.cities && g.cities.some((c: string) => c.toLowerCase().includes(kw)))
      )
      .map(g => ({
        id: g.id,
        type: 'guide' as const,
        name: g.name,
        description: g.intro || g.title || '',
        imageUrl: g.avatar || '',
        city: (g.cities || []).map((c: string) => getCityKo(c)).join('·'),
      }));

    const strategyResults: SearchResultItem[] = strategies
      .filter(s =>
        (s.title && s.title.toLowerCase().includes(kw)) ||
        (s.category && s.category.toLowerCase().includes(kw)) ||
        (s.tags && s.tags.some((t: string) => t.toLowerCase().includes(kw))) ||
        (s.spots && s.spots.some((sp: string) => sp.toLowerCase().includes(kw)))
      )
      .map(s => ({
        id: s.id,
        type: 'strategy' as const,
        name: s.title,
        description: s.category || (s.tags || []).join('·'),
        imageUrl: s.image || '',
        city: s.city ? getCityKo(s.city) : '',
      }));

    setUnifiedSearchResults([...spotResults, ...guideResults, ...strategyResults]);
  }, [searchKeyword, spots, guides, strategies]);

  // --- ATM Search Logic ---
  // ATM search via AMap PlaceSearch is no longer available with Google Maps
  // ATM markers will be cleared when toggled
  useEffect(() => {
      if (isAtmActive) {
          toast.info('ATM搜索功能暂不可用');
          setIsAtmActive(false);
      }
      setAtmMarkers([]);
  }, [isAtmActive]);


  // Initialize with all spots when data is loaded
  useEffect(() => {
    // Empty string = national overview, skip validation
    if (activeCity === '') return;
    if (cities && cities.length > 0) {
        const isCityValid = cities.some(c => c.name === activeCity);
        if (!isCityValid) {
            setActiveCity('');
        }
    }
  }, [cities, activeCity]);

  const handleMapReady = (map: any, google: any) => {
    setMapInstance(map);
    setAMap(google);
  };

  const handleLocationAllow = () => {
      // ... (Existing location logic kept if needed, though user removed search bar which had location button)
      // Keeping implementation for modal callback compatibility
      setIsLocationPromptOpen(false);
  };

  const handleLocationDeny = () => {
      setIsLocationPromptOpen(false);
  };

  // Handle when a spot is focused in the Bottom Carousel
  const handleSpotFocus = (spot: any) => {
    setFocusedSpotId(spot.id);
    
    if (mapInstance && spot.location) {
        const [wgsLng, wgsLat] = gcj02ToWgs84(spot.location.lng, spot.location.lat);
        mapInstance.panTo({ lat: wgsLat, lng: wgsLng });
        setSelectedPoi(spot);
    }
  };

  const handleMarkerClick = (poi: any) => {
    setSelectedPoi(poi);
    setFocusedSpotId(poi.id); // Sync carousel to marker
    setIsBottomSheetOpen(true); // Open full details
  };

  // Deep link: auto-open spot by URL param
  useEffect(() => {
    if (spotInitialId && spots && spots.length > 0) {
      const spot = spots.find(s => String(s.id) === String(spotInitialId));
      if (spot) {
        handleMarkerClick({ ...spot, photos: (spot.photos || []).map((url: string) => ({ url })) });
      }
      setSpotInitialId(undefined);
    }
  }, [spotInitialId, spots]);

  const handleCitySelect = (city: any) => {
    setActiveCity(city.name);
    // Map will update via useEffect
    if (mapInstance) {
        const center = city.center || [120.38, 36.06];
        const [wgsLng, wgsLat] = gcj02ToWgs84(center[0], center[1]);
        mapInstance.setZoom(city.zoom || 12);
        mapInstance.panTo({ lat: wgsLat, lng: wgsLng });
    }
  };

  const handleMapClick = () => {
    setSelectedPoi(null);
    setFocusedSpotId(null);
    setIsBottomSheetOpen(false);
  };

  const geolocationRef = useRef<any>(null);
  const locationMarkerRef = useRef<any>(null);

  const showLocationOnMap = (lng: number, lat: number) => {
    if (lng < 73 || lng > 136 || lat < 3 || lat > 54) {
      toast.error('定位结果异常，请检查定位权限');
      return;
    }
    if (locationMarkerRef.current) {
      locationMarkerRef.current.map = null;
    }
    const [wgsLng, wgsLat] = gcj02ToWgs84(lng, lat);
    const dot = document.createElement('div');
    dot.style.cssText = 'width:20px;height:20px;border-radius:50%;background:#4285f4;border:3px solid white;box-shadow:0 0 8px rgba(66,133,244,0.6);';
    locationMarkerRef.current = new aMap.maps.marker.AdvancedMarkerElement({
      position: { lat: wgsLat, lng: wgsLng },
      map: mapInstance,
      content: dot,
      zIndex: 200,
    });
    mapInstance.setZoom(13);
    mapInstance.panTo({ lat: wgsLat, lng: wgsLng });
  };

  const isInChina = (lng: number, lat: number) => lng >= 73 && lng <= 136 && lat >= 3 && lat <= 54;

  const handleMyLocation = () => {
    if (!mapInstance || !aMap) return;
    setIsLocating(true);

    console.log('[Location] Starting...');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          const lng = pos.coords.longitude;
          const lat = pos.coords.latitude;
          console.log('[Location] Browser GPS:', lng, lat);
          // Browser returns WGS-84, need to convert to GCJ-02 for showLocationOnMap
          // which then converts back to WGS-84 for Google Maps display
          // Simpler: directly show on map using WGS-84
          if (locationMarkerRef.current) {
            locationMarkerRef.current.map = null;
          }
          const dot = document.createElement('div');
          dot.style.cssText = 'width:20px;height:20px;border-radius:50%;background:#4285f4;border:3px solid white;box-shadow:0 0 8px rgba(66,133,244,0.6);';
          locationMarkerRef.current = new aMap.maps.marker.AdvancedMarkerElement({
            position: { lat, lng },
            map: mapInstance,
            content: dot,
            zIndex: 200,
          });
          mapInstance.setZoom(15);
          mapInstance.panTo({ lat, lng });
          toast.info('已定位到您的位置');
        },
        (err) => {
          setIsLocating(false);
          console.log('[Location] Browser GPS failed:', err.message);
          toast.error('定位失败，请检查浏览器定位权限');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setIsLocating(false);
      toast.error('您的浏览器不支持定位功能');
    }
  };

  const handleToggle3D = () => {
    if (!mapInstance) return;
    if (is3D) {
      mapInstance.setTilt(0);
      setIs3D(false);
    } else {
      mapInstance.setTilt(60);
      setIs3D(true);
    }
  };

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Full Screen Map */}
      <div className="absolute inset-0 z-0">
        <MapContainer 
          onMapReady={handleMapReady}
          markers={mapMarkers}
          selectedPoi={selectedPoi} // Highlights the marker
          onMarkerClick={handleMarkerClick}
          onMapClick={handleMapClick}
          disableFitView={false}
        />
      </div>

      {/* Search bar moved into CityDrawer */}

      {/* Widgets Layer - Highest Z-Index (except Portals/Overlays) */}
      {!isBottomSheetOpen && (
        <>
          <div className={`fixed top-[90px] right-4 z-[10002] transition-all duration-300 ${activeTab !== '' ? 'opacity-0 invisible pointer-events-none' : 'opacity-100 visible pointer-events-auto'}`}>
             <AdsWidget isOpen={isAdOpen} onOpenChange={setIsAdOpen} />
          </div>
          
          <div className={`fixed top-[205px] right-4 z-[10002] transition-all duration-300 ${activeTab !== '' ? 'opacity-0 invisible pointer-events-none' : 'opacity-100 visible pointer-events-auto'}`}>
             <AtmWidget onSelect={() => setIsAtmActive(!isAtmActive)} isActive={isAtmActive} />
          </div>
        </>
      )}

      {/* Map View Toggle - Moved to FloatingSearchBar */}
      
      {/* My Location, 2D/3D Toggle, Zoom +/- */}
      <div className="absolute top-[265px] right-4 z-30 flex flex-col gap-2">
        <MyLocationButton onClick={handleMyLocation} isLocating={isLocating} />
        <Toggle2DButton is3D={is3D} onClick={handleToggle3D} />
        <button
          onClick={() => mapInstance && mapInstance.setZoom((mapInstance.getZoom() || 10) + 1)}
          className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-100 flex items-center justify-center w-[50px] h-[50px] text-gray-600 hover:text-blue-600 active:scale-95 transition-all"
        >
          <span className="text-2xl font-bold leading-none">+</span>
        </button>
        <button
          onClick={() => mapInstance && mapInstance.setZoom((mapInstance.getZoom() || 10) - 1)}
          className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-100 flex items-center justify-center w-[50px] h-[50px] text-gray-600 hover:text-blue-600 active:scale-95 transition-all"
        >
          <span className="text-2xl font-bold leading-none">−</span>
        </button>
      </div>
      {/* Unified Search Results Drawer */}
      <SearchResultsDrawer
        isVisible={!!searchKeyword.trim() && unifiedSearchResults.length >= 0}
        results={unifiedSearchResults}
        keyword={searchKeyword}
        onClose={() => setSearchKeyword('')}
        onItemClick={(item) => {
          if (item.type === 'guide') {
            setActiveTab('guide');
          } else if (item.type === 'strategy') {
            setActiveTab('strategy');
          } else {
            const spot = spots.find(s => String(s.id) === String(item.id));
            if (spot) handleMarkerClick({ ...spot, photos: (spot.photos || []).map(url => ({ url })) });
          }
          setSearchKeyword('');
        }}
      />

      <CityDrawer
        isVisible={activeTab === 'city'}
        onSelectCategory={setActiveCategory}
        onSelectCity={handleCitySelect}
        searchResults={searchResults}
        onPoiClick={handleMarkerClick}
        activeCityName={activeCity}
        onClose={() => setActiveTab('')}
        onSearch={(kw) => setSearchKeyword(kw)}
      />

      <EnterpriseView
        isVisible={activeTab === 'enterprise'}
        onClose={() => setActiveTab('')}
        activeCity={activeCity}
        initialId={enterpriseInitialId}
        onInitialIdConsumed={() => setEnterpriseInitialId(undefined)}
        onOpenGuide={(id) => {
          setActiveTab('guide');
          setGuideInitialId(id);
        }}
      />

      <GuideView
        isVisible={activeTab === 'guide'}
        onClose={() => setActiveTab('')}
        activeCity={activeCity}
        initialCategory={guideInitialCategory}
        initialId={guideInitialId}
        onInitialIdConsumed={() => setGuideInitialId(undefined)}
        onLightboxChange={setIsLightboxOpen}
        searchKeyword={searchKeyword}
      />

      <UserDrawer
        isVisible={activeTab === 'me'}
        onClose={() => { setActiveTab(''); setViewMode('all'); }}
        onPoiClick={handleMarkerClick}
        onFavoritesViewChange={(isOpen) => setViewMode(isOpen ? 'favorites' : 'all')}
      />

      {/* POI Detail Bottom Sheet (Full View) */}
      <PoiDetailBottomSheet 
        poi={selectedPoi}
        isOpen={isBottomSheetOpen}
        onClose={() => {
          setIsBottomSheetOpen(false);
          setSelectedPoi(null);
          setFocusedSpotId(null);
        }}
        onLightboxChange={setIsLightboxOpen}
      />
      

      {/* Bottom Navigation */}
      {!isLightboxOpen && (
        <BottomTabBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      )}

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
